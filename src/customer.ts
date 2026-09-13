// ─────────────────────────────────────────────
//  src/customer.ts
//  Feature 1: Customer Management
//  - createGuest()
//  - createMember()
//  - isMember()   ← type guard
//  - getMembershipDiscount()
//  - displayCustomer()
// ─────────────────────────────────────────────

import {
  ID,
  Address,
  GuestCustomer,
  MemberCustomer,
  Customer,
  MembershipLevel,
} from "./types";

// ── Membership discount map ────────────────────
const membershipDiscountMap: Record<MembershipLevel, number> = {
  silver: 5,
  gold: 10,
  platinum: 15,
};

// ── Type Guard ─────────────────────────────────
// Uses the 'in' operator to narrow Customer → MemberCustomer
export function isMember(customer: Customer): customer is MemberCustomer {
  return "membershipId" in customer;
}

// ── Get discount % for a membership level ─────
export function getMembershipDiscount(level: MembershipLevel): number {
  return membershipDiscountMap[level];
}

// ── Create a Guest customer ────────────────────
export function createGuest(
  id: ID,
  name: string,
  address: Address,
  phone?: string
): GuestCustomer {
  return {
    id,
    type: "guest",
    name,
    address,
    ...(phone !== undefined && { phone }),
  };
}

// ── Create a Member customer ───────────────────
export function createMember(
  id: ID,
  name: string,
  membershipId: string,
  membershipLevel: MembershipLevel,
  address: Address,
  phone?: string
): MemberCustomer {
  const discountPercentage = getMembershipDiscount(membershipLevel);

  return {
    id,
    type: "member",
    name,
    membershipId,
    membershipLevel,
    discountPercentage,
    address,
    ...(phone !== undefined && { phone }),
  };
}

// ── Display customer info ──────────────────────
export function displayCustomer(customer: Customer): void {
  console.log("\n  👤 Customer Details");
  console.log("  ─────────────────────────────────");
  console.log(`  Name    : ${customer.name}`);
  console.log(`  Phone   : ${customer.phone ?? "N/A"}`);
  console.log(`  Address : ${customer.address.street}, ${customer.address.city} - ${customer.address.pincode}`);

  if (isMember(customer)) {
    // Narrowed to MemberCustomer — safe to access member-only fields
    console.log(`  Type    : Member (${customer.membershipLevel.toUpperCase()})`);
    console.log(`  ID      : ${customer.membershipId}`);
    console.log(`  Discount: ${customer.discountPercentage}%`);
  } else {
    // Narrowed to GuestCustomer
    console.log("  Type    : Guest (No discount)");
  }
  console.log("  ─────────────────────────────────\n");
}
