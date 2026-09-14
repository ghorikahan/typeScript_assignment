"use strict";
// ─────────────────────────────────────────────
//  src/payment.ts
//  Feature 3: Payment Processing
//  - processPayment()  ← uses 'in' operator type narrowing
//  - displayPaymentSummary()
// ─────────────────────────────────────────────
Object.defineProperty(exports, "__esModule", { value: true });
exports.processPayment = processPayment;
exports.displayPaymentSummary = displayPaymentSummary;
// ── Process payment & return a summary string ─
// Uses the 'in' operator to narrow the Payment union safely.
function processPayment(payment, finalAmount) {
    if ("receivedAmount" in payment) {
        // Narrowed to CashPayment
        if (payment.receivedAmount < finalAmount) {
            throw new Error(`Insufficient cash. Required ₹${finalAmount.toFixed(2)}, received ₹${payment.receivedAmount.toFixed(2)}.`);
        }
        const change = payment.receivedAmount - finalAmount;
        return (`  Payment Method : 💵 Cash\n` +
            `  Received       : ₹${payment.receivedAmount.toFixed(2)}\n` +
            `  Change         : ₹${change.toFixed(2)}`);
    }
    if ("last4Digits" in payment) {
        // Narrowed to CardPayment
        return (`  Payment Method : 💳 Card\n` +
            `  Card (last 4)  : **** **** **** ${payment.last4Digits}`);
    }
    // Narrowed to UpiPayment
    return (`  Payment Method : 📱 UPI\n` +
        `  Transaction ID : ${payment.transactionId}`);
}
// ── Display a payment confirmation block ───────
function displayPaymentSummary(payment, finalAmount) {
    console.log("\n  💳  Payment Details");
    console.log("  ──────────────────────────────────────────────────────");
    console.log(processPayment(payment, finalAmount));
    console.log("  ──────────────────────────────────────────────────────\n");
}
