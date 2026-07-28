# Mood and Healing Scenes

## Healing scene

### 治愈系场景插画模板

本文件用于生成“柔光、温暖、治愈”的场景插画：

- 治愈系日常场景
- 季节氛围插画
- 卡片 / 周边封面图
- 公众号 / 小红书首图
- 品牌温柔向主图

特征：

- 柔和配色
- 自然光感
- 留白克制
- 角色 + 场景 + 微小道具构成
- 不强调戏剧冲突

#### 适用范围

- 治愈系日常场景
- 季节氛围图
- 公众号首图
- 周边卡片

#### 何时使用

- 用户提到“治愈系 / 温柔 / 柔光 / 日常 / Studio Ghibli 风”
- 用户希望视觉让人想停下来看一眼

不要使用：

- 概念 / 史诗大片场景（用 `concept-scene.md`）
- 童书插画（用 `picture-book-scene.md`）
- 极简留白氛围（用 `mood-and-healing-scenes.md#minimalist-mood-scene`）

#### 缺失信息优先提问顺序

1. 场景（咖啡馆 / 房间 / 窗边 / 海边 / 街角）
2. 季节 / 时间
3. 是否有人物
4. 道具（书 / 猫 / 茶 / 植物）
5. 风格：手绘 anime / 水彩 / 数字插画
6. 配色基调

#### 主模板：治愈系日常场景

📖 描述

整体一张柔光场景插画，主体是日常环境，可有一位人物或一只动物，配色温暖自然。

📝 提示词

```json
{
  "type": "治愈系日常场景插画",
  "goal": "生成一张让人想停下来看一眼的治愈系日常场景插画",
  "scene": {
    "location": "{argument name=\"location\" default=\"窗边的小书桌\"}",
    "season": "{argument name=\"season\" default=\"初夏\"}",
    "time_of_day": "{argument name=\"time of day\" default=\"清晨\"}",
    "weather_or_mood": "{argument name=\"mood\" default=\"晴朗、微风、刚醒来的感觉\"}"
  },
  "subject": {
    "human_or_animal": "{argument name=\"main subject\" default=\"短发少女背影，托腮看窗外\"}",
    "scale": "{argument name=\"subject scale\" default=\"占画面 1/3\"}"
  },
  "props": {
    "items": [
      "{argument name=\"prop 1\" default=\"打开的书 + 半杯热茶\"}",
      "{argument name=\"prop 2\" default=\"窗台上的小盆栽\"}",
      "{argument name=\"prop 3\" default=\"折叠的米色毛毯\"}"
    ]
  },
  "lighting": {
    "type": "{argument name=\"light type\" default=\"自然光\"}",
    "direction": "{argument name=\"light direction\" default=\"侧光，从窗户洒入\"}",
    "intensity": "{argument name=\"light intensity\" default=\"柔和\"}",
    "color_temp": "{argument name=\"color temp\" default=\"暖金色\"}"
  },
  "style": {
    "art_style": "{argument name=\"art style\" default=\"手绘 anime + 水彩柔光\"}",
    "rendering": "颗粒感 + 柔光 + 低饱和度",
    "color_palette": "{argument name=\"color palette\" default=\"米白 + 暖橙 + 绿\"}"
  },
  "constraints": {
    "must_keep": [
      "整体氛围温暖治愈",
      "光线方向统一",
      "色调克制不浮夸",
      "道具与场景同一氛围"
    ],
    "avoid": [
      "出现戏剧化情绪",
      "色彩过度饱和",
      "场景元素过密",
      "出现品牌广告"
    ]
  }
}
```

##### 参数策略

- 必问：场景、季节、主体
- 可默认：风格、灯光、配色
- 可随机：道具具体形态

##### 自动补全策略

- 季节自动决定配色（春 = 樱粉 / 夏 = 蓝白 / 秋 = 暖棕 / 冬 = 雪白）
- 主体默认背影或局部，避免脸部抢戏
- 风格默认手绘 anime + 水彩

#### 变体 1：宠物治愈场景

📝 提示词

```json
{
  "type": "宠物治愈场景插画",
  "subject": {
    "human_or_animal": "{argument name=\"animal\" default=\"窝在毛毯里的橘猫\"}"
  },
  "constraints": {
    "must_feel": "毛茸茸、安心、想抚摸"
  }
}
```

#### 变体 2：户外治愈场景

📝 提示词

```json
{
  "type": "户外治愈场景插画",
  "scene": {
    "location": "{argument name=\"outdoor\" default=\"湖边的木栈道\"}",
    "weather_or_mood": "黄昏 + 微风"
  },
  "subject": {
    "human_or_animal": "一对人物背影，并肩走"
  },
  "constraints": {
    "must_feel": "电影感、留白、慢节奏"
  }
}
```

#### 变体 3：自动补全模式

📝 提示词

```json
{
  "type": "治愈系场景自动补全模板",
  "mode": "auto-fill",
  "rule": "用户给季节 / 时间 / 一句心情，自动决定场景、主体、道具、配色",
  "constraints": {
    "must_feel": "可作为公众号 / 小红书首图"
  }
}
```

#### 避免事项

- 不要让人物正脸抢戏
- 不要让光源方向不统一
- 不要让色彩饱和到“甜腻”
- 不要塞太多道具
- 不要出现可识别 logo

---

## Minimalist mood scene

### 极简氛围插画模板

本文件用于生成“极简留白 / 强氛围” 插画：

- 极简海报
- 文学性氛围图
- 品牌情绪图
- 公众号文末图
- 桌面 / 手机壁纸

特征：

- 大留白
- 单一主体或极少元素
- 一种主导色
- 强情绪 / 强气质
- 文字（如有）极少

#### 适用范围

- 文学性氛围图
- 极简海报
- 品牌情绪图
- 壁纸 / 文末图

#### 何时使用

- 用户提到“极简 / 留白 / 氛围 / 一种心情 / 文学风”
- 用户希望视觉以“情绪为先”，不需要叙事

不要使用：

- 治愈日常（用 `mood-and-healing-scenes.md#healing-scene`）
- 概念大场景（用 `concept-scene.md`）
- 童书插画（用 `picture-book-scene.md`）

#### 缺失信息优先提问顺序

1. 一种心情 / 一句话
2. 主体（一个人 / 一只鸟 / 一棵树 / 抽象图形）
3. 主导色
4. 是否需要文字
5. 比例

#### 主模板：极简留白氛围图

📖 描述

整体大量留白，主体小且偏置，色调统一，文字（如有）只 1 句话。

📝 提示词

```json
{
  "type": "极简留白氛围图",
  "goal": "生成一张以情绪为主、留白极致的极简插画",
  "mood": {
    "feeling": "{argument name=\"feeling\" default=\"安静、独处、深秋\"}",
    "one_sentence": "{argument name=\"one sentence\" default=\"风停了，我也终于停了一下。\"}"
  },
  "subject": {
    "description": "{argument name=\"main subject\" default=\"远处一棵孤零零的小树\"}",
    "scale": "{argument name=\"subject scale\" default=\"占画面 10%\"}",
    "position": "{argument name=\"subject position\" default=\"画面右下\"}"
  },
  "background": {
    "type": "{argument name=\"background\" default=\"米白色雾气 + 微微纸纹\"}",
    "main_color": "{argument name=\"main color\" default=\"米白 + 一抹暖灰\"}"
  },
  "text_overlay": {
    "enabled": "{argument name=\"text enabled\" default=\"true\"}",
    "text": "{argument name=\"text\" default=\"风停了，我也终于停了一下。\"}",
    "position": "{argument name=\"text position\" default=\"画面左上\"}",
    "font_style": "{argument name=\"font style\" default=\"细衬线体\"}",
    "color": "深灰"
  },
  "style": {
    "rendering": "极简插画 + 微纸纹 + 柔和颗粒",
    "lighting": "整体柔光、几乎无戏剧光",
    "color_palette": "≤ 2 种主色"
  },
  "aspect_ratio": "{argument name=\"aspect ratio\" default=\"3:4\"}",
  "constraints": {
    "must_keep": [
      "留白 ≥ 画面 70%",
      "主体小但不可缺",
      "色调严格统一",
      "情绪通过色 + 留白传达，不靠装饰"
    ],
    "avoid": [
      "次要元素堆叠",
      "颜色多于 2 种",
      "文字超过 1 句",
      "出现品牌 logo"
    ]
  }
}
```

##### 参数策略

- 必问：心情、主体
- 可默认：背景、配色、字体
- 可随机：主体小细节

##### 自动补全策略

- 心情 → 配色（独处 = 米白；夜晚 = 深蓝；秋 = 暖棕；春 = 樱粉）
- 主体根据心情选（孤独 = 一棵树 / 一只鸟；平静 = 一片海；思念 = 远去的背影）
- 文字 ≤ 18 字

#### 变体 1：纯色极简海报

📝 提示词

```json
{
  "type": "纯色极简海报",
  "subject": {
    "description": "{argument name=\"subject\" default=\"一只飞鸟剪影\"}",
    "scale": "5%"
  },
  "background": {
    "type": "纯色",
    "main_color": "{argument name=\"main color\" default=\"深蓝\"}"
  },
  "text_overlay": {
    "text": "{argument name=\"text\" default=\"自由\"}",
    "font_style": "极粗黑体"
  },
  "constraints": {
    "must_feel": "强一句话、克制、概念"
  }
}
```

#### 变体 2：抽象图形氛围

📝 提示词

```json
{
  "type": "抽象图形氛围图",
  "subject": {
    "description": "{argument name=\"abstract\" default=\"两个相切的圆\"}",
    "scale": "30%"
  },
  "constraints": {
    "must_feel": "概念、设计感、品牌资产"
  }
}
```

#### 变体 3：自动补全模式

📝 提示词

```json
{
  "type": "极简氛围图自动补全模板",
  "mode": "auto-fill",
  "rule": "用户给一句心情或一个词，自动决定主体、配色、文字、比例",
  "constraints": {
    "must_feel": "可做壁纸 / 文末图"
  }
}
```

#### 避免事项

- 不要让画面塞满
- 不要使用 > 2 种主色
- 不要让文字超过 18 字
- 不要让主体居正中（极简通常偏置）
- 不要使用花哨字体
