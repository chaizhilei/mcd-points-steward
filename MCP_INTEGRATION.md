# MCP 集成说明

## 概述

本项目「麦享会理财官」通过麦当劳中国官方 MCP Server（`https://mcp.mcd.cn`）读取会员积分与积分商城数据，并在用户二次确认后执行兑券 / 抽奖。浏览器不持有 Token；所有 MCP 调用由 Next.js 服务端 API 代理完成。

## MCP Server

| 项 | 值 |
|---|---|
| Server | 麦当劳中国 MCP（mcd-mcp） |
| Endpoint | `https://mcp.mcd.cn` |
| 协议 | MCP over Streamable HTTP / JSON-RPC 2.0 |
| 鉴权 | `Authorization: Bearer ${MCD_MCP_TOKEN}` |
| 配置示例 | 见仓库根目录 [`mcp-config.example.json`](./mcp-config.example.json) |

Token 申请：登录 [open.mcd.cn/mcp](https://open.mcd.cn/mcp) → 控制台 → 激活并复制 MCP Token。本地放入 `.env.local`（勿提交）。

## 实际使用的 Tools

| Tool | 用途 | 调用位置 |
|---|---|---|
| `query-my-account` | 查询可用积分、本月/下月将过期、历史已过期等 | `GET /api/portfolio` |
| `mall-points-products` | 拉取积分商城商品券目录（筛选商品券类目） | `GET /api/portfolio` |
| `query-lottery-info` | 查询抽奖资格、消耗、活动状态 | `GET /api/portfolio`、`POST /api/lottery/draw` |
| `mall-product-detail` | 查询商品详情与 SKU，供用户选择规格 | `GET /api/mall/products/[spuId]` |
| `mall-create-order` | 用户确认后创建积分兑换订单 | `POST /api/mall/redeem`（需 `confirm: true`） |
| `draw-lottery` | 用户确认后执行抽奖 | `POST /api/lottery/draw`（需 `confirm: true`） |

客户端封装见 [`src/lib/mcd-mcp.ts`](./src/lib/mcd-mcp.ts)。

## 调用流程

```text
用户打开页面
    │
    ▼
GET /api/portfolio
    ├─ query-my-account
    ├─ mall-points-products（catRuleIds: 商品券）
    └─ query-lottery-info
    │
    ▼
本地顾问算法 buildAdvice（src/lib/advisor.ts）
    ├─ 计算过期紧迫度
    ├─ 按面额/积分估算性价比，给出兑券推荐
    └─ 默认优先兑券；抽奖仅展示，需手动确认
    │
    ▼
用户选择商品 → GET /api/mall/products/[spuId] → mall-product-detail
    │
    ▼
二次确认兑换 → POST /api/mall/redeem { confirm: true, skuId, spuCategory }
    └─ mall-create-order

或：二次确认抽奖 → POST /api/lottery/draw { confirm: true }
    ├─ 再次 query-lottery-info 校验资格
    └─ draw-lottery
```

## 业务价值

1. **防过期**：把「本月/下月将过期积分」前置展示，降低积分静默流失。
2. **可决策**：结合商城实时目录给出性价比推荐，而不是只展示余额。
3. **可控执行**：写操作（兑券、抽奖）必须用户二次确认；服务端拒绝无 `confirm` 的请求，避免误操作。
4. **安全边界**：Token 仅存服务端；仓库内配置使用环境变量占位符，符合参赛信息安全要求。

## 安全与合规

- 仓库不包含真实 Token / 密钥；示例配置仅使用 `${MCD_MCP_TOKEN}` 占位符。
- 写操作强制 `confirm: true`。
- 本项目为参赛作品，非麦当劳官方产品；积分、价格、库存与活动状态以官方渠道实时结果为准。
