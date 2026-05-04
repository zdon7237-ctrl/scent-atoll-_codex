# Order Fulfillment Foundation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Add required delivery information, order detail viewing, and payment-ready metadata to the existing cloud pending-order flow.

**Architecture:** Extend the shared order builder first, then wire the same contract through the mini program service, cart checkout, order list, and new order detail page. Keep real WeChat Pay out of scope; expose a payment placeholder and status fields so the next slice can attach actual payment calls.

**Tech Stack:** WeChat Mini Program TypeScript/WXML/WXSS, WeChat cloud functions, Node built-in test runner.

---

### Task 1: Cloud Order Contract

**Files:**
- Modify: `cloudbaserc.json/cloud1-8gknss58137b61a2/functions/_shared/order-core.js`
- Modify: `cloudbaserc.json/cloud1-8gknss58137b61a2/functions/order_create/_shared/order-core.js`
- Test: `tests/order-core.test.js`

**Step 1: Write the failing tests**

Add tests that assert:

- `createOrderRecord` rejects missing receiver name, phone, or address.
- A valid order stores `deliveryInfo`.
- A valid pending order stores `paymentStatus: 'pending'`, `paymentTime: 0`, and a default `shippingInfo` object.

**Step 2: Run test to verify RED**

Run: `node tests/order-core.test.js`

Expected: FAIL because delivery validation and payment/shipping fields do not exist yet.

**Step 3: Implement minimal cloud helper changes**

Add small helper functions:

- `normalizeDeliveryInfo(deliveryInfo)`
- `createDefaultShippingInfo()`

Update `createOrderRecord` to validate and store those fields.

**Step 4: Copy helper changes into packaged function helper**

Keep the root shared helper and `order_create/_shared/order-core.js` identical enough for packaging tests.

**Step 5: Run tests**

Run:

- `node tests/order-core.test.js`
- `node tests/function-packaging.test.js`

Expected: PASS.

---

### Task 2: Order Detail View Model

**Files:**
- Modify: `miniprogram/utils/orderViewModel.js`
- Test: `tests/order-view-model.test.js`

**Step 1: Write the failing tests**

Add tests that assert a detail mapper returns:

- status label for pending payment.
- formatted delivery name, phone, address, and note.
- payment pending text.
- shipping pending text.

**Step 2: Run test to verify RED**

Run: `node tests/order-view-model.test.js`

Expected: FAIL because detail mapper does not exist.

**Step 3: Implement minimal mapper**

Add `mapOrderDetailForDisplay(order)` and reuse existing money/time formatting.

**Step 4: Run tests**

Run: `node tests/order-view-model.test.js`

Expected: PASS.

---

### Task 3: Service And Types Wiring

**Files:**
- Modify: `miniprogram/utils/orderService.ts`
- Modify: `miniprogram/utils/orderManager.ts`
- Modify: `miniprogram/pages/cart/cart.ts`

**Step 1: Add TypeScript fields**

Add `DeliveryInfo`, `PaymentStatus`, and `ShippingInfo` shapes to the order service/manager layer.

**Step 2: Add cart delivery state and validation**

Add `deliveryInfo` data with `receiverName`, `phone`, `address`, and `note`. Add handlers for input updates and a helper that returns the normalized delivery snapshot or blocks checkout with a toast.

**Step 3: Include deliveryInfo in createOrder payload**

Pass the validated delivery snapshot to `OrderService.createOrder`.

**Step 4: Run focused tests**

Run:

- `node tests/order-core.test.js`
- `node tests/order-view-model.test.js`

Expected: PASS.

---

### Task 4: Cart UI

**Files:**
- Modify: `miniprogram/pages/cart/cart.wxml`
- Modify: `miniprogram/pages/cart/cart.wxss`

**Step 1: Add minimal delivery form**

Show fields for receiver name, phone, address, and note above coupon/wallet sections when not in edit mode.

**Step 2: Bind inputs**

Use `bindinput="onDeliveryInput"` and `data-field` for each field.

**Step 3: Keep layout stable**

Reuse existing section styling where possible; avoid adding a large new visual system.

**Step 4: Run release guard**

Run: `npm.cmd run check:release`

Expected: PASS.

---

### Task 5: Order Detail Page

**Files:**
- Create: `miniprogram/pages/orderDetail/orderDetail.ts`
- Create: `miniprogram/pages/orderDetail/orderDetail.wxml`
- Create: `miniprogram/pages/orderDetail/orderDetail.wxss`
- Create: `miniprogram/pages/orderDetail/orderDetail.json`
- Modify: `miniprogram/pages/orders/orders.ts`
- Modify: `miniprogram/pages/orders/orders.wxml`
- Modify: `miniprogram/pages/orders/orders.wxss`
- Modify: `miniprogram/app.json`

**Step 1: Register page**

Add `pages/orderDetail/orderDetail` to `app.json`.

**Step 2: Build page logic**

Load `orderId` from options, call `OrderService.getOrderDetail(orderId)`, map through `mapOrderDetailForDisplay`, and show loading/error states.

**Step 3: Build WXML/WXSS**

Render order status, goods, amount breakdown, delivery info, payment placeholder, and shipping placeholder.

**Step 4: Navigate from list**

Add `goToDetail` handler on order cards.

**Step 5: Run checks**

Run:

- `node tests/order-view-model.test.js`
- `npm.cmd run check:release`

Expected: PASS.

---

### Task 6: Final Verification

**Files:**
- Read/verify all changed files.

**Step 1: Run full available automated checks**

Run:

- `Get-ChildItem -LiteralPath 'tests' -Filter '*.test.js' | ForEach-Object { node $_.FullName }`
- `npm.cmd run check:release`

Expected: all tests pass and release guard passes.

**Step 2: Inspect git diff**

Run: `git -c safe.directory="D:/scent atoll 小程序云客户端_codex/.worktrees/order-fulfillment-foundation" diff --stat`

Expected: only planned files changed.

**Step 3: Summarize remaining gaps**

Call out that real WeChat Pay, merchant shipping operation, inventory deduction, and coupon server-side redemption remain future slices.
