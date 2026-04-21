# 内容补充模板与路径

这份文档只服务一件事：以后正式补“人物”和“历史事件”时，按固定步骤走，不再到处散改。

## 一眼先看

当前项目的数据分三层：

1. 主数据源  
   位置：`data/history-registry.ts`  
   作用：人物、事件、人物与事件关系、事件准备页视角、正式游玩主内容。

2. 映射层  
   位置：
   - `data/character-asset-manifest.ts`
   - `data/background-asset-manifest.ts`
   - `data/event-asset-manifest.ts`  
   作用：把人物立绘、历史画作、共享背景、事件内背景/立绘调用关系统一收口。

3. 展示层  
   位置：
   - `components/figures/*`
   - `components/events/*`
   - `components/play/*`
   - `app/events/*`
   - `app/figures/*`  
   作用：只负责读主数据源和映射层，不直接写死新内容。

## 新增一个人物时，通常改哪些文件

### 1. 必改：人物主数据

文件：`data/history-registry.ts`

要补的内容：

- `historicalFigureCatalog`
  - `id`
  - `name`
  - `title`
  - `dynasty`
  - `role`
  - `introduction`
  - `signatureEvent`
  - `keywords`
  - `portraitLabel`
  - `portraitTone`
  - `relatedEventIds`
  - `canJoinTimeTheater`

参考模板：`data/content-templates.ts` 里的 `historicalFigureTemplate`

### 2. 必改：人物与事件关系

文件：`data/history-registry.ts`

要补的内容：

- `figureEventRelations`
  - 这个人物关联哪些事件
  - 是否能作为该事件第一视角
  - 是否是推荐视角

参考模板：`data/content-templates.ts` 里的 `figureEventRelationTemplate`

### 3. 按需：人物是否进入事件准备页

文件：`data/history-registry.ts`

如果这个人物要成为某个事件的可选第一视角，还要补：

- 该事件对应的 `EventViewpoint[]`
- 该事件 `HistoricalEvent.availableViewpointIds`

参考模板：`data/content-templates.ts` 里的 `eventViewpointTemplate`

### 4. 按需：人物图像素材

文件：

- `public/assets/characters/standees/`
- `public/assets/characters/portraits/`
- `data/character-asset-manifest.ts`

规则：

- 游戏立绘放 `standees/`
- 历史画作 / 史料图放 `portraits/`
- 组件里不要直接写路径，只改 manifest

### 5. 按需：人物进入跨时空剧场

主数据还是在：`data/history-registry.ts`

只要：

- `canJoinTimeTheater: true`

跨时空剧场的可选人物主路径就会从这里派生。  
如果后续这个人物还需要更稳定的剧场素材，再补共享 standee 即可。

## 新增一个历史事件时，通常改哪些文件

### 1. 必改：事件主数据

文件：`data/history-registry.ts`

要补的内容：

- `historicalEventCatalog`
  - `id`
  - `title`
  - `era`
  - `category`
  - `summary`
  - `status`
  - `statusLabel`
  - `description`
  - `backdropLabel`
  - `backdropDescription`
  - `availableViewpointIds`
  - `recommendedViewpointIds`
  - `hasPlayableStory`
  - `backdropTone`

参考模板：`data/content-templates.ts` 里的 `historicalEventTemplate`

### 2. 必改：事件准备页视角

文件：`data/history-registry.ts`

要补的内容：

- 该事件的 `EventViewpoint[]`
- 事件主数据中的 `availableViewpointIds`
- 如果从人物馆进入要预选某人物，还要补对应的 `FigureEventRelation.canBeViewpoint`

### 3. 必改：正式游玩支持

根据事件准备做哪种模式，分两条：

#### 方案 A：本地静态剧情

文件：`data/history-registry.ts`

要补的内容：

- `speakerVisuals`
- `scenes`
- `defaultBackdrop`
- `createEventPlayableContent(...)` 接入

参考模板：

- `data/content-templates.ts` 里的 `eventSceneTemplate`
- `data/content-templates.ts` 里的 `eventPlayableContentTemplate`

#### 方案 B：AI 驱动事件

必改的还是主数据：

- `data/history-registry.ts`

然后再按事件单独补 AI 服务层，例如：

- `lib/hongmen-ai.ts`
- 对应 `app/api/.../route.ts`

顺序建议：

1. 先把事件主数据补齐
2. 再把准备页视角补齐
3. 再把背景 key / standee 调用关系补齐
4. 最后再接 AI

### 4. 必改：共享背景与立绘调用关系

文件：

- `data/background-asset-manifest.ts`
- `data/event-asset-manifest.ts`
- `data/character-asset-manifest.ts`

规则：

- 新背景优先放：`public/assets/backgrounds/shared/`
- 新背景先定义 `backgroundKey`
- 再在 `event-asset-manifest.ts` 里把事件场景映射到这个 key
- 人物立绘一律优先读共享 `standee`

## 以后补内容的推荐顺序

### 新增人物

1. 先补 `data/history-registry.ts` 里的人物主数据
2. 再补 `FigureEventRelation`
3. 如果要进某个事件准备页，再补该事件 `EventViewpoint[]`
4. 再补 standee / portrait 素材和 `character-asset-manifest.ts`
5. 最后检查人物馆、事件准备页、跨时空剧场是否都能自然读到

### 新增事件

1. 先补 `data/history-registry.ts` 里的事件主数据
2. 再补该事件关联人物和 `FigureEventRelation`
3. 再补该事件的 `EventViewpoint[]`
4. 再补共享背景 key 和事件背景映射
5. 再决定先做本地静态剧情还是 AI 版本

## 哪些是主数据源，哪些是映射层，哪些是展示层

### 主数据源

- `data/history-registry.ts`

这里是内容“真相源”。  
人物、事件、人物-事件关系、事件视角、正式游玩主内容，优先都从这里出。

### 映射层

- `data/character-asset-manifest.ts`
- `data/background-asset-manifest.ts`
- `data/event-asset-manifest.ts`

这里不放产品逻辑，只做“key -> 文件路径”或“场景 -> key”的映射。

### 展示层

- `components/figures/*`
- `components/events/*`
- `components/play/*`
- `app/figures/*`
- `app/events/*`

这些文件应该尽量只消费前两层，不要再写死新人物或新事件。

## 模板文件在哪里

代码模板位置：

- `data/content-templates.ts`

这里已经放了可直接参考的模板：

- `historicalFigureTemplate`
- `characterAssetTemplate`
- `figureEventRelationTemplate`
- `historicalEventTemplate`
- `eventPreparationTemplate`
- `eventViewpointTemplate`
- `eventSceneTemplate`
- `eventPlayableContentTemplate`

## 一句话原则

以后补人物和事件时，先补主数据源，再补映射层，最后让展示层自然读到。  
不要反过来从页面组件里直接写死新内容。
