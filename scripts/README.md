# scripts/gen-product-images.mjs

一次性脚本：为 80 道菜批量生成统一风格的 flat-lay 产品图，写入 `public/products/{id}.png`。

## 风格规范（已锁定，与 5 张已认可原型一致）

- 90° 顶视 flat-lay，菜品居中，米白未漂白亚麻背景
- 左上柔光，右下淡阴影；克制、低饱和、自然食物色
- 7 个原型模板：`NOODLE` / `SOUP` / `MAIN` / `SNACK` / `SWEET` / `DRINK` / `TEA`，每张 PNG 通过 dish-id → 模板 → 自动展开 prompt

## 模型

通过 [OpenRouter](https://openrouter.ai/) 调用 **`google/gemini-3.1-flash-image-preview`**（Nano Banana 2，2026-02 发布）。

| 参数 | 值 |
| --- | --- |
| 端点 | `POST https://openrouter.ai/api/v1/chat/completions` |
| 必传 | `modalities: ['image', 'text']` |
| 默认尺寸 | `aspect_ratio: '1:1'` + `image_size: '1K'` → 1024×1024 |
| OpenRouter 计价 | $0.50 / M 输入 token + $3 / M 输出 token |
| 单张实际 | ≈ $0.004-0.006（一张 1K 图 ≈ 1290 输出 token） |
| **80 张总价** | **≈ $0.30-0.50** |

> 5 张原型已就位，实际待产 75 张。OpenRouter 控制台会显示每次调用的精确费用。

## 一、设置 API key（三选一）

获得 key：[openrouter.ai/keys](https://openrouter.ai/keys)（注册后预充 $5 即可，可用任何主流模型）

### 方式 A — 临时（仅本会话）

PowerShell：

```powershell
$env:OPENROUTER_API_KEY = "sk-or-v1-..."
```

bash / zsh：

```bash
export OPENROUTER_API_KEY=sk-or-v1-...
```

### 方式 B — 写到 `.env`（推荐，自动加载）

`.env` 已被 `.gitignore` 排除，不会泄露：

```ini
OPENROUTER_API_KEY=sk-or-v1-...
```

然后用 Node 内置 `--env-file`（Node ≥ 20.6）：

```powershell
node --env-file=.env scripts/gen-product-images.mjs
```

### 方式 C — 系统环境变量（永久）

Windows: 控制面板 → 系统属性 → 环境变量 → 新建用户变量 `OPENROUTER_API_KEY`。

## 二、跑

### 先 dry-run 看清单（不消耗 API）

```powershell
npm run gen:images -- --dry-run
```

会打印待产 / 已跳过 / 估算成本 / 每张 prompt 字符数。

### 实跑

```powershell
npm run gen:images
```

≈ 4-6 分钟产完 75 张（Gemini 3.1 Flash 单张 5-15 秒，4 并发）。终端持续输出：

```
✓ cong-you-ban-mian               7.2s
✓ dan-dan-mian                    8.4s  (retry ×1)
...
```

失败的会自动重试 2 次，失败列表在结尾打印；同样的命令再跑一次只会处理剩下的几张。

### 选项

| 参数 | 说明 |
| --- | --- |
| `--model <slug>` | 切换 OpenRouter 模型（默认 `google/gemini-3.1-flash-image-preview`） |
| `--aspect-ratio 4:5` | 切竖图（产品卡是 4:5 portrait，匹配 ProductCard 容器） |
| `--aspect-ratio 1:1` | 默认正方形 |
| `--image-size 0.5K` | 更便宜更快（仅 Gemini 3.1 支持） |
| `--image-size 2K` | 更高分辨率 |
| `--image-size 4K` | 极致细节 |
| `--concurrency 8` | 并发数（默认 4；OpenRouter 默认账户每分钟 60 RPM 起，可拉很高） |
| `--only id1,id2` | 只产指定 ids（用于补单 / 重做某几张） |
| `--force` | 即使 PNG 已存在也强制重生成 |
| `--max-retries 3` | 单张最多重试次数（默认 2） |
| `--timeout 180000` | 单次 HTTP 超时毫秒（默认 120000 = 2 分钟） |
| `--dry-run` | 仅打印计划，不调 API |

例：

```powershell
# 用产品卡的 4:5 portrait 比例（更贴合首页布局）
npm run gen:images -- --aspect-ratio 4:5

# 只重做汤面那张
npm run gen:images -- --only lao-tan-suanla-fen --force

# 看看夜宵 4 张 prompt 长什么样
npm run gen:images -- --only mala-mianjin,jian-bing-guo-zi,xiao-long-bao,shao-mai --dry-run

# 如果 Nano Banana 2 不顺，临时换 Flux 2 试试
npm run gen:images -- --model black-forest-labs/flux.2-pro --only ma-po-tofu --force
```

## 三、断点续跑

脚本是**幂等**的——存在的 PNG 直接跳过。任何时候中断（Ctrl-C / 网络断），同样的命令再跑一次只会处理剩下的几张。

## 四、跑完之后

下一步：让我把 [shared/products.ts](../shared/products.ts) 的 `image` 字段从 Unsplash URL 全部切到 `/products/{id}.png`。先确认 `public/products/` 下确实有 80 张 PNG，再切。

```powershell
# 抽查图片数 = 80
(Get-ChildItem public/products -Filter *.png).Count
```

## 备选模型（同样 OpenRouter API，只换 `--model` 参数）

| 备选 slug | 价格档 | 备注 |
| --- | --- | --- |
| `google/gemini-2.5-flash-image` | 同档 | Nano Banana 1，前一代 |
| `black-forest-labs/flux.2-pro` | 略贵 | 极佳的写实 / 商业摄影 |
| `black-forest-labs/flux.2-flex` | 中档 | FLUX 经济版 |
| `sourceful/riverflow-v2-pro` | 中档 | 设计 / 品牌图见长，支持指定字体 |

> 完整列表：[openrouter.ai/models?output_modalities=image](https://openrouter.ai/models?output_modalities=image)

## 故障排查

- **HTTP 401 Unauthorized** → key 没设或拼错，参考"一、设置 API key"
- **HTTP 402 Payment Required** → OpenRouter 账户余额耗尽，去 [openrouter.ai/credits](https://openrouter.ai/credits) 充值
- **HTTP 429 Rate Limited** → 调小 `--concurrency` 到 2 或 1
- **`no image in response`** → 模型对该 prompt 触发了安全过滤；改 `--only <id>` 试单张，或人工微调脚本里那条 `detail`
- **图变形 / 不像中餐** → 该原型 detail 太抽象，添加更具体的食材 / 颜色 / 器皿描述
