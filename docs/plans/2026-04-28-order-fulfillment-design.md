# Order Fulfillment Foundation Design

## Goal

Move the current cloud pending-order foundation one step closer to a real transaction flow by adding required delivery information, an order detail surface, and payment-ready order metadata.

## Recommended Approach

Use a conservative vertical slice:

- Keep the existing cart checkout as the entry point.
- Require a minimal delivery form before creating an order.
- Store delivery, payment, and shipping snapshots on the cloud order record.
- Add an order detail page backed by the existing `order_detail` cloud function.
- Keep real WeChat Pay out of this slice, but make the data shape ready for it.

This is the best next step because the project already creates pending cloud orders. Payment integration should come after the order record can safely carry delivery, payment, and fulfillment state.

## Alternatives Considered

1. Integrate WeChat Pay first.
   - Faster to show payment UI.
   - Risky because the order has no required delivery data or detail page yet.

2. Build a full address book first.
   - Better long-term UX.
   - Too much scope for this step; a required one-time delivery form is enough.

3. Build a merchant backend first.
   - Needed later for shipping operations.
   - Less useful until user-side orders carry the fields a merchant would manage.

## Architecture

The order data model will be expanded at the shared cloud helper layer so all cloud functions and tests share the same contract. The cart page will collect delivery information and pass it to `OrderService.createOrder`. The order list remains a summary surface and navigates to a new order detail page for full order, delivery, payment, and shipping state.

## Components

- `cloudbaserc.../_shared/order-core.js`: validate and build order records with delivery/payment/shipping fields.
- `cloudbaserc.../order_create/_shared/order-core.js`: same helper copy used by deployable cloud function packaging.
- `miniprogram/utils/orderService.ts`: extend request/record types.
- `miniprogram/utils/orderManager.ts`: keep local type definitions aligned with cloud order shape.
- `miniprogram/utils/orderViewModel.js`: add detail formatting helpers and status labels.
- `miniprogram/pages/cart/*`: add minimal delivery form and pass it during checkout.
- `miniprogram/pages/orders/*`: navigate list cards to detail.
- `miniprogram/pages/orderDetail/*`: new detail page backed by `order_detail`.
- `miniprogram/app.json`: register the detail page.
- `tests/*`: add targeted unit coverage for order creation validation and detail view formatting.

## Data Flow

1. User selects cart items.
2. User enters receiver name, phone, address, and optional note.
3. Cart validates selected items and delivery form.
4. Cart calls `order_create` with pricing snapshots, selected coupon snapshot, wallet snapshot, and delivery snapshot.
5. Cloud helper validates required delivery fields and creates a pending-payment order.
6. Orders page loads summaries through `order_list`.
7. Tapping an order opens `orderDetail`, which calls `order_detail` and renders the full snapshot.

## Error Handling

- Empty delivery fields block checkout before calling the cloud function.
- Cloud helper rejects invalid delivery payloads so direct cloud calls cannot create incomplete orders.
- Detail page shows loading, error, and empty states.
- Payment and shipping operations are displayed as pending or unavailable until real payment and merchant flows are added.

## Testing

Follow TDD:

- Add failing order-core tests for required delivery fields and default payment/shipping metadata.
- Add failing order-view-model tests for detail formatting.
- Add focused page/service type changes after tests prove the desired contract.
- Run each touched test file and the release guard.
