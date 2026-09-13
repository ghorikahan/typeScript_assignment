// ─────────────────────────────────────────────
//  src/types.ts
//  All TypeScript types, interfaces, and aliases
// ─────────────────────────────────────────────

// ── Primitive Aliases ──────────────────────────
export type ID = number;
export type FoodCategory = "pizza" | "burger" | "drink" | "dessert";
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "delivered"
  | "cancelled";
export type MembershipLevel = "silver" | "gold" | "platinum";

// ── Address ────────────────────────────────────
export interface Address {
  readonly street: string;
  readonly city: string;
  readonly pincode: string;
}

// ── Food Item ──────────────────────────────────
export interface FoodItem {
  readonly id: ID;
  readonly name: string;
  readonly category: FoodCategory;
  readonly price: number;
  readonly isAvailable: boolean;
}

// ── Customer ───────────────────────────────────
export interface BaseCustomer {
  readonly id: ID;
  readonly name: string;
  readonly phone?: string;
  readonly address: Address;
}

export interface GuestCustomer extends BaseCustomer {
  readonly type: "guest";
}

export interface MemberCustomer extends BaseCustomer {
  readonly type: "member";
  readonly membershipId: string;
  readonly discountPercentage: number;
  readonly membershipLevel: MembershipLevel;
}

// Union: a customer is either a guest or a member
export type Customer = GuestCustomer | MemberCustomer;

// ── Cart ───────────────────────────────────────
type OrderInfo = {
  quantity: number;
  specialInstruction?: string;
};

// Intersection: CartItem combines a FoodItem with order-specific info
export type CartItem = FoodItem & OrderInfo;

// ── Payment ────────────────────────────────────
export type CashPayment = {
  readonly method: "cash";
  readonly receivedAmount: number;
};

export type CardPayment = {
  readonly method: "card";
  readonly last4Digits: string;
};

export type UpiPayment = {
  readonly method: "upi";
  readonly transactionId: string;
};

// Union: payment can be any of these three shapes
export type Payment = CashPayment | CardPayment | UpiPayment;

// ── Bill Result (Discriminated Union) ──────────
export type SuccessBill = {
  readonly status: "success";
  readonly orderId: ID;
  readonly customer: Customer;
  readonly items: CartItem[];
  readonly subtotal: number;
  readonly membershipDiscount: number;
  readonly additionalDiscount: number;
  readonly tax: number;
  readonly finalAmount: number;
  readonly payment: Payment;
  readonly orderStatus: OrderStatus;
  readonly createdAt: Date;
};

export type ErrorBill = {
  readonly status: "error";
  readonly message: string;
};

export type BillResult = SuccessBill | ErrorBill;

// ── Discount Info ──────────────────────────────
export type DiscountInfo = {
  readonly membershipDiscount: number;
  readonly additionalDiscount: number;
  readonly totalDiscount: number;
};

// ── Search Filter ──────────────────────────────
export type FoodFilter = {
  category?: FoodCategory;
  maxPrice?: number;
  searchTerm?: string;
};
