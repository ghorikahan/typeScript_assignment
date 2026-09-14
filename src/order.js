"use strict";
// ─────────────────────────────────────────────
//  src/order.ts
//  Feature 3: Order Status Management
//  - updateOrderStatus() — validates transitions
//  - assertNever()       — exhaustive never check
//  - displayOrderStatus() — formatted status display
// ─────────────────────────────────────────────
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderStatus = updateOrderStatus;
exports.assertNever = assertNever;
exports.statusLabel = statusLabel;
exports.displayOrderStatus = displayOrderStatus;
exports.getNextStatuses = getNextStatuses;
// ── Valid transitions map ──────────────────────
// Defines allowed next statuses for each current status
const VALID_TRANSITIONS = {
    pending: ["confirmed", "cancelled"],
    confirmed: ["preparing", "cancelled"],
    preparing: ["delivered", "cancelled"],
    delivered: [],
    cancelled: [],
};
// ── Update order status ────────────────────────
// Validates transition; throws on invalid moves.
function updateOrderStatus(current, next) {
    const allowed = VALID_TRANSITIONS[current];
    // includes() check for valid next status
    if (!allowed.includes(next)) {
        throw new Error(`Invalid transition: "${current}" → "${next}". ` +
            (allowed.length > 0
                ? `Allowed: ${allowed.join(", ")}.`
                : `"${current}" is a terminal status.`));
    }
    return next;
}
// ── Exhaustive never check ─────────────────────
// TypeScript will produce a compile error if a new OrderStatus
// is added but not handled in the switch below.
function assertNever(x) {
    throw new Error(`Unhandled OrderStatus value: ${String(x)}`);
}
// ── Status emoji / label helper ────────────────
// Uses a switch with assertNever() for exhaustive handling
function statusLabel(status) {
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
function displayOrderStatus(status) {
    console.log(`\n  📦  Order Status : ${statusLabel(status)}\n`);
}
// ── Get allowed next statuses (for UI choices) ─
function getNextStatuses(current) {
    return VALID_TRANSITIONS[current];
}
