// ─────────────────────────────────────────────
//  src/payment.ts
//  Feature 3: Payment Processing
//  - processPayment()  ← uses 'in' operator type narrowing
//  - displayPaymentSummary()
// ─────────────────────────────────────────────

import { Payment } from "./types";

// ── Process payment & return a summary string ─
// Uses the 'in' operator to narrow the Payment union safely.
export function processPayment(payment: Payment, finalAmount: number): string {
  if ("receivedAmount" in payment) {
    // Narrowed to CashPayment
    if (payment.receivedAmount < finalAmount) {
      throw new Error(
        `Insufficient cash. Required ₹${finalAmount.toFixed(2)}, received ₹${payment.receivedAmount.toFixed(2)}.`
      );
    }
    const change = payment.receivedAmount - finalAmount;
    return (
      `  Payment Method : 💵 Cash\n` +
      `  Received       : ₹${payment.receivedAmount.toFixed(2)}\n` +
      `  Change         : ₹${change.toFixed(2)}`
    );
  }

  if ("last4Digits" in payment) {
    // Narrowed to CardPayment
    return (
      `  Payment Method : 💳 Card\n` +
      `  Card (last 4)  : **** **** **** ${payment.last4Digits}`
    );
  }

  // Narrowed to UpiPayment
  return (
    `  Payment Method : 📱 UPI\n` +
    `  Transaction ID : ${payment.transactionId}`
  );
}

// ── Display a payment confirmation block ───────
export function displayPaymentSummary(
  payment: Payment,
  finalAmount: number
): void {
  console.log("\n  💳  Payment Details");
  console.log("  ──────────────────────────────────────────────────────");
  console.log(processPayment(payment, finalAmount));
  console.log("  ──────────────────────────────────────────────────────\n");
}
