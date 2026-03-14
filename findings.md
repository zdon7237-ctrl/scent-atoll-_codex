# Findings & Decisions

## Requirements
- 将此前的上线性评估整理成一份本地可查看的改造清单。
- 清单需要明确“上线前必须完成”的事项。
- 文档需要保存到项目根目录，方便后续查看和推进。

## Research Findings
- 当前项目为微信小程序原生 + TypeScript 工程，业务流程已覆盖商品、购物车、订单、积分、钱包、优惠券和会员中心。
- 云端目前只承载模板数据，用户态数据未上云。
- 交易、资产、订单状态和会员累计消费都仍在客户端本地存储中。
- 首页模板与首页逻辑存在明显不一致，说明首屏仍带有原型/残片状态。

## Technical Decisions
| Decision | Rationale |
|----------|-----------|
| 在项目根目录新增 `上线前必须完成的改造清单.md` | 让交付物直观独立，便于后续直接打开查看 |
| 使用 Markdown checklist 和阶段拆分 | 更适合长期跟踪完成度 |
| 保留 planning-with-files 三个过程文件 | 满足技能流程，也方便未来继续沿着同一计划推进 |

## Issues Encountered
| Issue | Resolution |
|-------|------------|
| Windows PowerShell 读取部分文件时出现编码显示异常 | 以代码逻辑和行号为主判断，不依赖乱码文本内容做关键结论 |
| `apply_patch` 工具调用失败 | 改用 PowerShell 直接写文件 |

## Resources
- `D:\scent atoll 小程序云客户端_codex\miniprogram\app.ts`
- `D:\scent atoll 小程序云客户端_codex\miniprogram\pages\cart\cart.ts`
- `D:\scent atoll 小程序云客户端_codex\miniprogram\utils\orderManager.ts`
- `D:\scent atoll 小程序云客户端_codex\miniprogram\utils\walletManager.ts`
- `D:\scent atoll 小程序云客户端_codex\miniprogram\utils\couponManager.ts`
- `D:\scent atoll 小程序云客户端_codex\云端操作手册.md`

## Visual/Browser Findings
- 无
