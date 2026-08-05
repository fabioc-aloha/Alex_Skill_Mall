import { createServer } from "node:http";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import { createCanvas, joinSession } from "@github/copilot-sdk/extension";

const servers = new Map();
const storagePath = join(
    process.env.COPILOT_HOME || join(homedir(), ".copilot"),
    "extensions",
    "org-directory",
    "artifacts",
    "directory.json",
);

function emptyState() {
    return { profiles: {}, orgChart: null, updatedAt: null };
}

async function loadState() {
    try {
        return JSON.parse(await readFile(storagePath, "utf8"));
    } catch (error) {
        if (error && error.code === "ENOENT") {
            return emptyState();
        }
        throw error;
    }
}

async function saveState(state) {
    await mkdir(join(storagePath, ".."), { recursive: true });
    state.updatedAt = new Date().toISOString();
    await writeFile(storagePath, JSON.stringify(state, null, 2), "utf8");
    return state;
}

function renderHtml() {
    return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Org Directory</title>
  <style>
    html, body { margin: 0; padding: 0; height: 100%; background: #525659; font-family: system-ui, sans-serif; }
    #toolbar { display: flex; align-items: center; gap: 12px; padding: 8px 14px; background: #323639; color: #eee; font-size: 13px; border-bottom: 1px solid #1e1e1e; }
    #toolbar .title { font-weight: 600; }
    #toolbar .spacer { flex: 1; }
    #toolbar a { color: #7ab8ff; text-decoration: none; padding: 4px 10px; border: 1px solid #4a4d50; border-radius: 4px; }
    #toolbar a:hover { background: #4a4d50; }
    #toolbar .status { color: #b0b0b0; font-size: 12px; }
    #viewer { width: 100%; height: calc(100vh - 41px); border: 0; }
    #missing { color: #eee; padding: 40px; text-align: center; }
  </style>
</head>
<body>
  <div id="toolbar">
    <span class="title">Organization Report</span>
    <span class="status" id="status"></span>
    <span class="spacer"></span>
    <a href="/report.pdf" download="Org-Report.pdf">Download PDF</a>
    <a href="/report.docx" download="Org-Report.docx">Download Word</a>
  </div>
  <iframe id="viewer" src="/report.pdf#toolbar=1&view=FitH" title="Organization Report"></iframe>
  <script>
    async function refreshStatus() {
      try {
        const r = await fetch("/state", { cache: "no-store" });
        const s = await r.json();
        const parts = [];
        if (s.orgChart && s.orgChart.target) parts.push(s.orgChart.target.displayName);
        if (s.profiles) parts.push(Object.keys(s.profiles).length + " profiles");
        if (s.updatedAt) parts.push("updated " + new Date(s.updatedAt).toLocaleString());
        document.getElementById("status").textContent = parts.length ? "· " + parts.join(" · ") : "";
      } catch (e) {}
    }
    refreshStatus();
    setInterval(() => {
      // reload viewer periodically to pick up new PDF
      const v = document.getElementById("viewer");
      const src = v.getAttribute("src").split("?")[0];
      v.setAttribute("src", src + "?ts=" + Date.now() + "#toolbar=1&view=FitH");
      refreshStatus();
    }, 15000);
  </script>
</body>
</html>`;
}

async function startServer(instanceId) {
    const artifactsDir = join(storagePath, "..");
    const pdfPath = join(artifactsDir, "report.pdf");
    // Find the .docx (there's only one produced per target)
    const server = createServer(async (request, response) => {
        if (request.url === "/state") {
            response.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
            response.end(JSON.stringify(await loadState()));
            return;
        }
        if (request.url && request.url.startsWith("/report.pdf")) {
            try {
                const data = await readFile(pdfPath);
                response.writeHead(200, {
                    "Content-Type": "application/pdf",
                    "Content-Length": data.length,
                    "Cache-Control": "no-store",
                });
                response.end(data);
            } catch (e) {
                response.writeHead(404, { "Content-Type": "text/plain" });
                response.end("PDF not generated yet. Run export_org.py to create it.");
            }
            return;
        }
        if (request.url && request.url.startsWith("/report.docx")) {
            try {
                // Find any .docx in artifacts folder
                const { readdir } = await import("node:fs/promises");
                const files = await readdir(artifactsDir);
                const docx = files.find((f) => f.toLowerCase().endsWith(".docx"));
                if (!docx) throw new Error("no docx");
                const data = await readFile(join(artifactsDir, docx));
                response.writeHead(200, {
                    "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                    "Content-Length": data.length,
                    "Content-Disposition": `attachment; filename="${docx}"`,
                    "Cache-Control": "no-store",
                });
                response.end(data);
            } catch (e) {
                response.writeHead(404, { "Content-Type": "text/plain" });
                response.end("DOCX not found.");
            }
            return;
        }

        response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        response.end(renderHtml(instanceId));
    });
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    const address = server.address();
    const port = typeof address === "object" && address ? address.port : 0;
    return { server, url: `http://127.0.0.1:${port}/` };
}

const profileSchema = {
    type: "object",
    required: ["displayName"],
    properties: {
        displayName: { type: "string" },
        email: { type: "string" },
        jobTitle: { type: "string" },
        department: { type: "string" },
        officeLocation: { type: "string" },
        reports: { type: "array", items: { type: "object" } },
        summary: { type: "string" },
        recentWork: { type: "array", items: { type: "string" } },
        topics: { type: "array", items: { type: "string" } },
        expertise: { type: "array", items: { type: "string" } },
        collaborators: { type: "array", items: { type: "string" } },
        lastRefreshed: { type: "string" },
    },
    additionalProperties: false,
};

await joinSession({
    canvases: [
        createCanvas({
            id: "org-directory",
            displayName: "Org Directory",
            description: "Visualize organizational reporting hierarchies and people profiles.",
            actions: [
                {
                    name: "set_profile",
                    description: "Add or update a person profile in the directory canvas.",
                    inputSchema: profileSchema,
                    handler: async (ctx) => {
                        const state = await loadState();
                        state.profiles[ctx.input.displayName.toLowerCase()] = ctx.input;
                        await saveState(state);
                        return ctx.input;
                    },
                },
                {
                    name: "set_org_chart",
                    description: "Set the management chain, target person, and direct reports displayed in the canvas.",
                    inputSchema: {
                        type: "object",
                        required: ["managementChain", "directReports"],
                        properties: {
                            managementChain: { type: "array", items: profileSchema },
                            target: profileSchema,
                            directReports: { type: "array", items: profileSchema },
                        },
                        additionalProperties: false,
                    },
                    handler: async (ctx) => {
                        const state = await loadState();
                        state.orgChart = ctx.input;
                        await saveState(state);
                        return ctx.input;
                    },
                },
                {
                    name: "get_directory_data",
                    description: "Return the profiles and organization chart currently stored in the canvas.",
                    handler: async () => loadState(),
                },
            ],
            open: async (ctx) => {
                let entry = servers.get(ctx.instanceId);
                if (!entry) {
                    entry = await startServer(ctx.instanceId);
                    servers.set(ctx.instanceId, entry);
                }
                return { title: "Org Directory", url: entry.url };
            },
            onClose: async (ctx) => {
                const entry = servers.get(ctx.instanceId);
                if (entry) {
                    servers.delete(ctx.instanceId);
                    await new Promise((resolve) => entry.server.close(resolve));
                }
            },
        }),
    ],
});
