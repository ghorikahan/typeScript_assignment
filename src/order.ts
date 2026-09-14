// ─────────────────────────────────────────────
//  src/order.ts
//  Feature 3: Order Status Management
//  - updateOrderStatus() — validates transitions
//  - assertNever()       — exhaustive never check
//  - displayOrderStatus() — formatted status display
// ─────────────────────────────────────────────

import { OrderStatus } from "./types";

// ── Valid transitions map ──────────────────────
// Defines allowed next statuses for each current status
const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending:    ["confirmed", "cancelled"],
  confirmed:  ["preparing", "cancelled"],
  preparing:  ["delivered", "cancelled"],
  delivered:  [],
  cancelled:  [],
};

// ── Update order status ────────────────────────
// Validates transition; throws on invalid moves.
export function updateOrderStatus(
  current: OrderStatus,
  next: OrderStatus
): OrderStatus {
  const allowed = VALID_TRANSITIONS[current];

  // includes() check for valid next status
  if (!allowed.includes(next)) {
    throw new Error(
      `Invalid transition: "${current}" → "${next}". ` +
        (allowed.length > 0
          ? `Allowed: ${allowed.join(", ")}.`
          : `"${current}" is a terminal status.`)
    );
  }

  return next;
}

// ── Exhaustive never check ─────────────────────
// TypeScript will produce a compile error if a new OrderStatus
// is added but not handled in the switch below.
export function assertNever(x: never): never {
  throw new Error(`Unhandled OrderStatus value: ${String(x)}`);
}

// ── Status emoji / label helper ────────────────
// Uses a switch with assertNever() for exhaustive handling
export function statusLabel(status: OrderStatus): string {
  switch (status) {
    case "pending":
      return "⏳ Pending";
    case "confirmed":
      return "✅ Confirmed";
    case "preparing":
      return "👨‍🍳 Preparing";
    case "delivered":
      return "🚀 Delivered";
    case "cancelled":
      return "❌ Cancelled";
    default:
      return assertNever(status); // TypeScript exhaustive check
  }
}

// ── Display current order status ───────────────
export function displayOrderStatus(status: OrderStatus): void {
  console.log(`\n  📦  Order Status : ${statusLabel(status)}\n`);
}

// ── Get allowed next statuses (for UI choices) ─
export function getNextStatuses(current: OrderStatus): OrderStatus[] {
  return VALID_TRANSITIONS[current];
}
