"use strict";
// ─────────────────────────────────────────────
//  src/billing.ts
//  Feature 3: Billing & GST
//  - calculateDiscounts() — membership + additional discount
//  - generateBill()       — returns BillResult (discriminated union)
//  - displayBill()        — prints the full itemized bill
// ─────────────────────────────────────────────
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateDiscounts = calculateDiscounts;
exports.generateBill = generateBill;
exports.displayBill = displayBill;
const customer_1 = require("./customer");
const cart_1 = require("./cart");
const payment_1 = require("./payment");
const GST_RATE = 0.05; // 5% GST
const ADDITIONAL_DISCOUNT_RATE = 0.05; // 5% bonus discount
const ADDITIONAL_DISCOUNT_THRESHOLD = 2000; // ₹2,000
// ── Shared order ID counter ────────────────────
let nextOrderId = 1001;
// ── Calculate discounts ────────────────────────
function calculateDiscounts(customer, subtotal) {
    // Membership discount
    const membershipPct = (0, customer_1.isMember)(customer) ? customer.discountPercentage : 0;
    const membershipDiscount = (subtotal * membershipPct) / 100;
    // Amount after membership discount
    const afterMembership = subtotal - membershipDiscount;
    // Additional 5% discount when subtotal > ₹2,000
    const additionalDiscount = subtotal > ADDITIONAL_DISCOUNT_THRESHOLD
        ? afterMembership * ADDITIONAL_DISCOUNT_RATE
        : 0;
    return {
        membershipDiscount,
        additionalDiscount,
        totalDiscount: membershipDiscount + additionalDiscount,
    };
}
// ── Generate bill — returns a BillResult (discriminated union) ──
function generateBill(customer, cart, payment, orderStatus = "pending") {
    // Guard: empty cart → ErrorBill
    if (cart.length === 0) {
        return {
            status: "error",
            message: "Cannot generate a bill for an empty cart.",
        };
    }
    const subtotal = (0, cart_1.getSubtotal)(cart);
    const { membershipDiscount, additionalDiscount } = calculateDiscounts(customer, subtotal);
    const afterDiscount = subtotal - membershipDiscount - additionalDiscount;
    const tax = afterDiscount * GST_RATE;
    const finalAmount = afterDiscount + tax;
    // Validate payment amount for cash
    if ("receivedAmount" in payment && payment.receivedAmount < finalAmount) {
        return {
            status: "error",
            message: `Insufficient cash. Required ₹${finalAmount.toFixed(2)}, received ₹${payment.receivedAmount.toFixed(2)}.`,
        };
    }
    const bill = {
        status: "success",
        orderId: nextOrderId++,
        customer,
        items: cart,
        subtotal,
        membershipDiscount,
        additionalDiscount,
        tax,
        finalAmount,
        payment,
        orderStatus,
        createdAt: new Date(),
    };
    return bill;
}
// ── Display the full bill ──────────────────────
function displayBill(bill) {
    console.log();
    console.log("  ╔══════════════════════════════════════════════════════╗");
    console.log("  ║                   ORDER SUMMARY                      ║");
    console.log("  ╚══════════════════════════════════════════════════════╝");
    console.log();
    // Customer info
    const memberInfo = (0, customer_1.isMember)(bill.customer)
        ? `${bill.customer.membershipLevel.toUpperCase()} Member (${bill.customer.discountPercentage}% discount)`
        : "Guest";
    console.log(`  Order ID  : #${bill.orderId}`);
    console.log(`  Customer  : ${bill.customer.name}`);
    console.log(`  Type      : ${memberInfo}`);
    console.log(`  Date      : ${bill.createdAt.toLocaleString("en-IN")}`);
    console.log();
    // Items
    console.log("  Items:");
    console.log("  ──────────────────────────────────────────────────────");
    bill.items.forEach((item) => {
        const name = item.name.padEnd(28);
        const qty = `x${item.quantity}`.padStart(3);
        const total = `₹${(item.price * item.quantity).toFixed(2)}`.padStart(10);
        console.log(`  ${name} ${qty}  ${total}`);
        if (item.specialInstruction !== undefined) {
            console.log(`    ↳ Note: ${item.specialInstruction}`);
        }
    });
    console.log("  ──────────────────────────────────────────────────────");
    // Pricing breakdown
    const fmt = (n) => `₹${n.toFixed(2)}`.padStart(12);
    console.log(`  Subtotal                                   ${fmt(bill.subtotal)}`);
    if (bill.membershipDiscount > 0) {
        const pct = (0, customer_1.isMember)(bill.customer) ? bill.customer.discountPercentage : 0;
        console.log(`  Membership Discount (${String(pct).padStart(2)}%)              -${fmt(bill.membershipDiscount).trimStart()}`);
    }
    if (bill.additionalDiscount > 0) {
        console.log(`  Additional Discount (5%)                  -${fmt(bill.additionalDiscount).trimStart()}`);
    }
    const afterDiscount = bill.subtotal - bill.membershipDiscount - bill.additionalDiscount;
    console.log(`  Amount After Discounts                     ${fmt(afterDiscount)}`);
    console.log(`  GST (5%)                                   ${fmt(bill.tax)}`);
    console.log("  ──────────────────────────────────────────────────────");
    console.log(`  Final Amount                               ${fmt(bill.finalAmount)}`);
    console.log("  ──────────────────────────────────────────────────────");
    // Payment
    console.log();
    console.log((0, payment_1.processPayment)(bill.payment, bill.finalAmount));
    // Order status
    console.log();
    console.log(`  Order Status : ${bill.orderStatus.toUpperCase()}`);
    console.log();
    console.log("  ╔══════════════════════════════════════════════════════╗");
    console.log("  ║            Thank you for ordering! 🙏                ║");
    console.log("  ╚══════════════════════════════════════════════════════╝");
    console.log();
}
