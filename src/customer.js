"use strict";
// ─────────────────────────────────────────────
//  src/customer.ts
//  Feature 1: Customer Management
//  - createGuest()
//  - createMember()
//  - isMember()   ← type guard
//  - getMembershipDiscount()
//  - displayCustomer()
// ─────────────────────────────────────────────
Object.defineProperty(exports, "__esModule", { value: true });
exports.isMember = isMember;
exports.getMembershipDiscount = getMembershipDiscount;
exports.createGuest = createGuest;
exports.createMember = createMember;
exports.displayCustomer = displayCustomer;
// ── Membership discount map ────────────────────
const membershipDiscountMap = {
    silver: 5,
    gold: 10,
    platinum: 15,
};
// ── Type Guard ─────────────────────────────────
// Uses the 'in' operator to narrow Customer → MemberCustomer
function isMember(customer) {
    return "membershipId" in customer;
}
// ── Get discount % for a membership level ─────
function getMembershipDiscount(level) {
    return membershipDiscountMap[level];
}
// ── Create a Guest customer ────────────────────
function createGuest(id, name, address, phone) {
    return {
        id,
        type: "guest",
        name,
        address,
        ...(phone !== undefined && { phone }),
    };
}
// ── Create a Member customer ───────────────────
function createMember(id, name, membershipId, membershipLevel, address, phone) {
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
function displayCustomer(customer) {
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
    }
    else {
        // Narrowed to GuestCustomer
        console.log("  Type    : Guest (No discount)");
    }
    console.log("  ─────────────────────────────────\n");
}
