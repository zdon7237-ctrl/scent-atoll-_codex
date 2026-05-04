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

## Research Findings - 2026-04-29 电商小程序能力对照
- 正常电商小程序至少需要商品系统、购物车与结算、真实支付、订单状态、库存履约、售后客服、会员营销、后台管理和合规材料。
- 微信支付/小程序支付链路应由服务端下单生成预支付参数，小程序侧拉起支付，支付结果以后端回调或查单为准，不能以前端本地状态作为支付成功依据。
- 当前项目已有商品、品牌、分类、详情、购物车、会员规则、积分余额、积分流水、积分商城雏形、优惠券雏形、用户中心、订单页和云端待付款订单基础。
- 当前最大缺口不是“积分/会员有没有入口”，而是支付、积分、会员、优惠券、库存、订单状态等还没有全部形成服务端可信账本。
- 积分系统方向保留：支付成功后加积分、兑换扣积分、退款回滚积分、积分过期和每笔流水都应进入服务端 `points_ledger`。
- 积分兑换物品需要独立服务端闭环：兑换商品库存、兑换记录、收货信息、发货/核销状态、失败回滚积分。
- 会员等级方向保留：累计消费升级必须来自真实已支付订单，退款/取消需要扣回或调整累计消费，会员折扣由服务端规则计算。
- 优惠券核销必须服务端化：下单时校验券是否属于用户、是否可用、是否过期、是否已核销，并防止重复使用。
- 推荐后续实施顺序：先合并订单履约基础，再做微信支付闭环，再做服务端积分/会员账本，再做积分兑换订单，最后补优惠券核销、库存并发、退款售后和最小商家后台。

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
- 微信支付 JSAPI/小程序下单文档: https://pay.wechatpay.cn/doc/v3/merchant/4012791897
- 微信支付小程序调起支付/发货管理相关文档: https://pay.wechatpay.cn/doc/v3/partner/4012085827

## Visual/Browser Findings
- 无

## Research Findings - 2026-05-05 小程序剩余内容摸底
- 项目是微信小程序原生 + TypeScript 工程，已有首页、分类、品牌、详情、购物车、用户中心、积分商城、订单、订单详情、积分流水、优惠券等页面入口。
- 工作区已有大量未提交改动和新增云函数/测试，后续应避免回滚，先识别哪些属于未完成实现的一部分。
- `app.json` 已注册 `orderDetail`，tabBar 当前仍复用 `images/home.png` 作为多个入口图标；用 Node 读取确认导航标题与 tab 文案实际是正常中文。
- 首页 `index.wxml` 当前只剩价格行片段，与 `index.ts` 的商品列表逻辑不匹配，是最明确的首屏未完成点。
- 本地商品数据只有 5 个 SKU，`image` 均为空，详情页也依赖 `info.image`，需要补商品视觉资源或占位图策略。
- 购物车页已有收货信息表单、优惠券选择和云端创建订单；支付入口主要在订单详情页，购物车结算后进入待付款订单详情。
- `payment_create` / `payment_finalize` 云函数已存在，支付创建要求订单 `pricingStatus === 'server_verified'`，需要核对 `order_create` 是否已完成服务端定价校验。
- 积分商城当前明确关闭兑换，只展示礼品和服务端积分余额；优惠券页仍以本地用户券包为主。
- `npm.cmd run check:release` 通过；`npx.cmd tsc --noEmit` 通过；PowerShell 直接运行 `npm` 会被执行策略拦截，后续用 `npm.cmd`。
- `order_create` 当前写入 `pricingStatus: client_snapshot_unverified`，而 `payment_create` 只允许 `server_verified` 订单发起支付，所以真实支付仍被设计性阻断。
- `node --test` 批量 runner 在当前沙箱触发 `spawn EPERM`；改用逐文件 `node <testfile>` 后全部测试通过。
- 经 Node 读取确认，详情页香调故事和钱包页输入框等 WXML 文案/引号结构本身正常，之前看到的乱码和疑似缺引号来自 PowerShell 输出层。
- 已按“可演示售卖版”补齐内容：完整首页、5 个商品本地图、商品规格/香调/故事、详情动态展示、独立 tab 图标、品牌 logo、积分商城礼品图。
- 图片资产采用本地生成的 PNG，避免小程序运行时依赖外链或云存储。
- 真实微信支付仍不是本轮完成范围：当前支付函数仍要求 `server_verified` 订单和微信支付环境配置；正式收款需要下一轮补服务端定价/库存/券核验与商户配置。
