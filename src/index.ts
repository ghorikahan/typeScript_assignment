// ─────────────────────────────────────────────
//  src/index.ts
//  Main entry point — Feature 1: Customer Management
//  Interactive terminal menu using @inquirer/prompts
// ─────────────────────────────────────────────

import { select, input, confirm } from "@inquirer/prompts";
import { createGuest, createMember, displayCustomer } from "./customer";
import { Address, Customer, MembershipLevel } from "./types";

// ── Shared ID counter ──────────────────────────
let nextCustomerId = 1;

// ── Helpers ────────────────────────────────────
function printHeader(): void {
  console.clear();
  console.log("╔══════════════════════════════════════════╗");
  console.log("║       🍔  FOOD ORDERING SYSTEM           ║");
  console.log("║          Feature 1: Customer Setup       ║");
  console.log("╚══════════════════════════════════════════╝");
  console.log();
}

function printSeparator(): void {
  console.log("  ──────────────────────────────────────────");
}

// ── Collect address via prompts ────────────────
async function collectAddress(): Promise<Address> {
  const street = await input({
    message: "  Street address:",
    validate: (val) => val.trim().length > 0 || "Street cannot be empty",
  });

  const city = await input({
    message: "  City:",
    validate: (val) => val.trim().length > 0 || "City cannot be empty",
  });

  const pincode = await input({
    message: "  Pincode:",
    validate: (val) =>
      /^\d{6}$/.test(val.trim()) || "Pincode must be a 6-digit number",
  });

  return { street: street.trim(), city: city.trim(), pincode: pincode.trim() };
}

// ── Create customer flow ───────────────────────
async function createCustomerFlow(): Promise<Customer> {
  printHeader();
  console.log("  🧑  Create New Customer\n");

  // Choose customer type
  const customerType = await select({
    message: "  Customer type:",
    choices: [
      { name: "👤  Guest (no membership discount)", value: "guest" },
      { name: "⭐  Member (get membership discount)", value: "member" },
    ],
  });

  console.log();

  // Collect name
  const name = await input({
    message: "  Full name:",
    validate: (val) => val.trim().length > 0 || "Name cannot be empty",
  });

  // Optional phone
  const hasPhone = await confirm({ message: "  Add phone number?", default: false });
  let phone: string | undefined;
  if (hasPhone) {
    phone = await input({
      message: "  Phone number:",
      validate: (val) =>
        /^\d{10}$/.test(val.trim()) || "Phone must be a 10-digit number",
    });
    phone = phone.trim();
  }

  console.log("\n  📍 Delivery Address");
  printSeparator();
  const address = await collectAddress();

  const id = nextCustomerId++;

  if (customerType === "guest") {
    const guest = createGuest(id, name.trim(), address, phone);
    console.log("\n  ✅ Guest customer created successfully!");
    displayCustomer(guest);
    return guest;
  } else {
    // Member flow
    console.log("\n  ⭐ Membership Details");
    printSeparator();

    const membershipId = await input({
      message: "  Membership ID:",
      validate: (val) => val.trim().length > 0 || "Membership ID cannot be empty",
    });

    const membershipLevel = await select<MembershipLevel>({
      message: "  Membership level:",
      choices: [
        { name: "🥈  Silver  — 5% discount", value: "silver" },
        { name: "🥇  Gold   — 10% discount", value: "gold" },
        { name: "💎  Platinum — 15% discount", value: "platinum" },
      ],
    });

    const member = createMember(
      id,
      name.trim(),
      membershipId.trim(),
      membershipLevel,
      address,
      phone
    );

    console.log("\n  ✅ Member customer created successfully!");
    displayCustomer(member);
    return member;
  }
}

// ── Main menu ──────────────────────────────────
async function mainMenu(customer: Customer | null): Promise<void> {
  printHeader();

  if (customer) {
    console.log(`  ✅ Current Customer: ${customer.name} (${customer.type})\n`);
  }

  const choice = await select({
    message: "  What would you like to do?",
    choices: [
      { name: "🧑  Create / Change Customer", value: "create_customer" },
      { name: "👁️   View Current Customer", value: "view_customer", disabled: customer === null },
      { name: "🚪  Exit", value: "exit" },
    ],
  });

  console.log();

  if (choice === "create_customer") {
    const newCustomer = await createCustomerFlow();
    await pressEnterToContinue();
    return mainMenu(newCustomer);
  }

  if (choice === "view_customer" && customer !== null) {
    printHeader();
    displayCustomer(customer);
    await pressEnterToContinue();
    return mainMenu(customer);
  }

  if (choice === "exit") {
    console.log("  👋 Thank you! Goodbye.\n");
    process.exit(0);
  }
}

// ── Utility: pause ─────────────────────────────
async function pressEnterToContinue(): Promise<void> {
  await input({ message: "  Press Enter to continue..." });
}

// ── Bootstrap ──────────────────────────────────
mainMenu(null).catch((err: unknown) => {
  if (
    err instanceof Error &&
    err.message.includes("User force closed the prompt")
  ) {
    console.log("\n  👋 Exited. Goodbye!\n");
    process.exit(0);
  }
  console.error(err);
  process.exit(1);
});
