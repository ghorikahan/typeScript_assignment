// ─────────────────────────────────────────────
//  src/index.ts
//  Main entry point — Full interactive terminal menu
//  Features: Customer, Menu, Cart, Checkout, Order Status
// ─────────────────────────────────────────────

import { select, input, confirm, number } from "@inquirer/prompts";

// Customer
import { createGuest, createMember, displayCustomer } from "./customer";

// Data / Menu
import { FOOD_MENU, searchFoodItems, displayFoodItems, categoryEmoji } from "./data";

// Cart
import { addToCart, updateCartItem, removeFromCart, displayCart, isCartEmpty } from "./cart";

// Payment
import { displayPaymentSummary } from "./payment";

// Billing
import { generateBill, displayBill } from "./billing";

// Order
import { updateOrderStatus, displayOrderStatus, getNextStatuses, statusLabel } from "./order";

// Types
import {
  Address,
  Customer,
  CartItem,
  MembershipLevel,
  Payment,
  SuccessBill,
  OrderStatus,
  FoodCategory,
} from "./types";

// ── Shared application state ───────────────────
let currentCustomer: Customer | null = null;
let cart: CartItem[] = [];
let currentOrder: SuccessBill | null = null;

// ── Shared ID counter ──────────────────────────
let nextCustomerId = 1;

// ── Utility helpers ────────────────────────────
function printHeader(): void {
  console.clear();
  console.log("╔══════════════════════════════════════════════════════╗");
  console.log("║         🍔  FOOD ORDERING & BILLING SYSTEM           ║");
  console.log("╚══════════════════════════════════════════════════════╝");
  console.log();
}

function printSeparator(): void {
  console.log("  ──────────────────────────────────────────────────────");
}

async function pressEnterToContinue(): Promise<void> {
  await input({ message: "  Press Enter to continue..." });
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

// ══════════════════════════════════════════════
//  FEATURE 1 — Customer Management
// ══════════════════════════════════════════════

async function createCustomerFlow(): Promise<void> {
  printHeader();
  console.log("  🧑  Create / Change Customer\n");

  const customerType = await select({
    message: "  Customer type:",
    choices: [
      { name: "👤  Guest (no membership discount)", value: "guest" },
      { name: "⭐  Member (get membership discount)", value: "member" },
    ],
  });

  console.log();

  const name = await input({
    message: "  Full name:",
    validate: (val) => val.trim().length > 0 || "Name cannot be empty",
  });

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
    currentCustomer = createGuest(id, name.trim(), address, phone);
    console.log("\n  ✅ Guest customer created successfully!");
    displayCustomer(currentCustomer);
  } else {
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

    currentCustomer = createMember(
      id,
      name.trim(),
      membershipId.trim(),
      membershipLevel,
      address,
      phone
    );
    console.log("\n  ✅ Member customer created successfully!");
    displayCustomer(currentCustomer);
  }

  // Reset cart and order when customer changes
  cart = [];
  currentOrder = null;

  await pressEnterToContinue();
}

// ══════════════════════════════════════════════
//  FEATURE 2 — Food Menu & Search
// ══════════════════════════════════════════════

async function browseMenuFlow(): Promise<void> {
  printHeader();
  console.log("  🍽️   Food Menu\n");

  const filterChoice = await select({
    message: "  How would you like to browse?",
    choices: [
      { name: "📋  Show all available items", value: "all" },
      { name: "🔍  Filter by category",        value: "category" },
      { name: "💰  Filter by max price",        value: "price" },
      { name: "🔤  Search by name",             value: "name" },
    ],
  });

  console.log();

  let items = FOOD_MENU;

  if (filterChoice === "category") {
    const cat = await select<FoodCategory>({
      message: "  Select category:",
      choices: [
        { name: "🍕  Pizza",   value: "pizza" },
        { name: "🍔  Burger",  value: "burger" },
        { name: "🥤  Drink",   value: "drink" },
        { name: "🍩  Dessert", value: "dessert" },
      ],
    });
    items = searchFoodItems(FOOD_MENU, { category: cat });

  } else if (filterChoice === "price") {
    const maxPrice = await number({
      message: "  Max price (₹):",
      validate: (val) => (val !== undefined && val > 0) || "Enter a positive number",
    });
    items = searchFoodItems(FOOD_MENU, { maxPrice: maxPrice as number });

  } else if (filterChoice === "name") {
    const term = await input({
      message: "  Search term:",
      validate: (val) => val.trim().length > 0 || "Search term cannot be empty",
    });
    items = searchFoodItems(FOOD_MENU, { searchTerm: term });

  } else {
    // "all" — only show available items
    items = FOOD_MENU;
  }

  displayFoodItems(items);

  // Offer to add an item to cart
  if (currentCustomer !== null && items.some((i) => i.isAvailable)) {
    const addItem = await confirm({ message: "  Add an item to cart?", default: true });
    if (addItem) {
      await addToCartFlow(items.filter((i) => i.isAvailable));
      return;
    }
  }

  await pressEnterToContinue();
}

// ══════════════════════════════════════════════
//  FEATURE 2 — Cart Operations
// ══════════════════════════════════════════════

async function addToCartFlow(availableItems = FOOD_MENU.filter((i) => i.isAvailable)): Promise<void> {
  printHeader();
  console.log("  ➕  Add Item to Cart\n");

  if (availableItems.length === 0) {
    console.log("  ⚠️  No available items to add.\n");
    await pressEnterToContinue();
    return;
  }

  const selectedId = await select<number>({
    message: "  Select item:",
    choices: availableItems.map((item) => ({
      name: `${categoryEmoji(item.category)}  ${item.name.padEnd(28)} ₹${item.price.toFixed(2)}`,
      value: item.id,
    })),
  });

  const selectedItem = availableItems.find((i) => i.id === selectedId)!;

  const qty = await number({
    message: "  Quantity:",
    default: 1,
    validate: (val) => (val !== undefined && val >= 1) || "Quantity must be at least 1",
  });

  const hasNote = await confirm({ message: "  Add special instruction?", default: false });
  let instruction: string | undefined;
  if (hasNote) {
    instruction = await input({ message: "  Instruction (e.g. extra cheese, no onions):" });
  }

  try {
    cart = addToCart(cart, selectedItem, qty as number, instruction);
    console.log(`\n  ✅ "${selectedItem.name}" added to cart!`);
  } catch (err) {
    console.log(`\n  ❌ ${(err as Error).message}`);
  }

  displayCart(cart);
  await pressEnterToContinue();
}

async function manageCartFlow(): Promise<void> {
  printHeader();
  console.log("  🛒  Manage Cart\n");

  displayCart(cart);

  if (isCartEmpty(cart)) {
    await pressEnterToContinue();
    return;
  }

  const action = await select({
    message: "  What would you like to do?",
    choices: [
      { name: "➕  Add more items",    value: "add" },
      { name: "✏️   Update quantity",   value: "update" },
      { name: "🗑️   Remove an item",    value: "remove" },
      { name: "⬅️   Back to main menu", value: "back" },
    ],
  });

  console.log();

  if (action === "add") {
    await addToCartFlow();
    return;
  }

  if (action === "update") {
    const itemId = await select<number>({
      message: "  Select item to update:",
      choices: cart.map((c) => ({
        name: `${c.name} (current qty: ${c.quantity})`,
        value: c.id,
      })),
    });
    const newQty = await number({
      message: "  New quantity (0 to remove):",
      validate: (val) => val !== undefined || "Please enter a number",
    });
    cart = updateCartItem(cart, itemId, newQty as number);
    console.log("\n  ✅ Cart updated.");
    displayCart(cart);
    await pressEnterToContinue();
    return;
  }

  if (action === "remove") {
    const itemId = await select<number>({
      message: "  Select item to remove:",
      choices: cart.map((c) => ({ name: c.name, value: c.id })),
    });
    cart = removeFromCart(cart, itemId);
    console.log("\n  ✅ Item removed.");
    displayCart(cart);
    await pressEnterToContinue();
    return;
  }
}

// ══════════════════════════════════════════════
//  FEATURE 3 — Checkout & Payment
// ══════════════════════════════════════════════

async function checkoutFlow(): Promise<void> {
  if (currentCustomer === null) {
    console.log("\n  ⚠️  Please create a customer first.\n");
    await pressEnterToContinue();
    return;
  }

  if (isCartEmpty(cart)) {
    console.log("\n  ⚠️  Your cart is empty. Add items before checking out.\n");
    await pressEnterToContinue();
    return;
  }

  printHeader();
  console.log("  💳  Checkout\n");
  displayCart(cart);

  // Choose payment method
  const method = await select<"cash" | "card" | "upi">({
    message: "  Select payment method:",
    choices: [
      { name: "💵  Cash", value: "cash" },
      { name: "💳  Card", value: "card" },
      { name: "📱  UPI",  value: "upi"  },
    ],
  });

  let payment: Payment;

  if (method === "cash") {
    const received = await number({
      message: "  Amount received (₹):",
      validate: (val) => (val !== undefined && val > 0) || "Enter a valid amount",
    });
    payment = { method: "cash", receivedAmount: received as number };

  } else if (method === "card") {
    const last4 = await input({
      message: "  Last 4 digits of card:",
      validate: (val) => /^\d{4}$/.test(val.trim()) || "Must be exactly 4 digits",
    });
    payment = { method: "card", last4Digits: last4.trim() };

  } else {
    const txnId = await input({
      message: "  UPI Transaction ID:",
      validate: (val) => val.trim().length > 0 || "Transaction ID cannot be empty",
    });
    payment = { method: "upi", transactionId: txnId.trim() };
  }

  // Generate bill (discriminated union: success | error)
  const result = generateBill(currentCustomer, cart, payment);

  if (result.status === "error") {
    // Narrowed to ErrorBill
    console.log(`\n  ❌ Billing error: ${result.message}\n`);
    await pressEnterToContinue();
    return;
  }

  // Narrowed to SuccessBill
  displayBill(result);
  displayPaymentSummary(result.payment, result.finalAmount);

  currentOrder = result;
  cart = []; // Clear cart after successful order

  await pressEnterToContinue();
}

// ══════════════════════════════════════════════
//  FEATURE 3 — Order Status Management
// ══════════════════════════════════════════════

async function orderStatusFlow(): Promise<void> {
  if (currentOrder === null) {
    console.log("\n  ⚠️  No active order. Please complete a checkout first.\n");
    await pressEnterToContinue();
    return;
  }

  printHeader();
  console.log("  📦  Order Status\n");
  console.log(`  Order #${currentOrder.orderId} — ${currentOrder.customer.name}`);
  displayOrderStatus(currentOrder.orderStatus);

  const nextStatuses = getNextStatuses(currentOrder.orderStatus);

  if (nextStatuses.length === 0) {
    console.log(`  ℹ️   Order is in a terminal state (${currentOrder.orderStatus}). No further changes possible.\n`);
    await pressEnterToContinue();
    return;
  }

  const next = await select<OrderStatus>({
    message: "  Move to status:",
    choices: [
      ...nextStatuses.map((s) => ({ name: statusLabel(s), value: s })),
      { name: "⬅️  Keep current status", value: currentOrder.orderStatus },
    ],
  });

  if (next !== currentOrder.orderStatus) {
    try {
      const updated = updateOrderStatus(currentOrder.orderStatus, next);
      // SuccessBill is readonly, so we create a new order object
      currentOrder = { ...currentOrder, orderStatus: updated };
      console.log(`\n  ✅ Order status updated to: ${statusLabel(updated)}\n`);
    } catch (err) {
      console.log(`\n  ❌ ${(err as Error).message}\n`);
    }
  }

  await pressEnterToContinue();
}

// ══════════════════════════════════════════════
//  MAIN MENU
// ══════════════════════════════════════════════

async function mainMenu(): Promise<void> {
  printHeader();

  // Status bar
  if (currentCustomer !== null) {
    console.log(`  👤 Customer : ${currentCustomer.name} (${currentCustomer.type})`);
  }
  if (!isCartEmpty(cart)) {
    console.log(`  🛒 Cart     : ${cart.length} item(s)`);
  }
  if (currentOrder !== null) {
    console.log(`  📦 Order #${currentOrder.orderId} : ${statusLabel(currentOrder.orderStatus)}`);
  }
  if (currentCustomer !== null || !isCartEmpty(cart) || currentOrder !== null) {
    console.log();
  }

  const choice = await select({
    message: "  What would you like to do?",
    choices: [
      {
        name: "🧑  Customer Setup",
        value: "customer",
      },
      {
        name: "👁️   View Current Customer",
        value: "view_customer",
        disabled: currentCustomer === null,
      },
      {
        name: "🍽️   Browse Food Menu",
        value: "browse",
        disabled: currentCustomer === null,
      },
      {
        name: "➕  Add Item to Cart",
        value: "add_item",
        disabled: currentCustomer === null,
      },
      {
        name: "🛒  Manage Cart",
        value: "cart",
        disabled: currentCustomer === null || isCartEmpty(cart),
      },
      {
        name: "💳  Checkout & Pay",
        value: "checkout",
        disabled: currentCustomer === null || isCartEmpty(cart),
      },
      {
        name: "📦  Change Order Status",
        value: "order_status",
        disabled: currentOrder === null,
      },
      {
        name: "🚪  Exit",
        value: "exit",
      },
    ],
  });

  console.log();

  switch (choice) {
    case "customer":
      await createCustomerFlow();
      break;

    case "view_customer":
      if (currentCustomer !== null) {
        printHeader();
        displayCustomer(currentCustomer);
        await pressEnterToContinue();
      }
      break;

    case "browse":
      await browseMenuFlow();
      break;

    case "add_item":
      await addToCartFlow();
      break;

    case "cart":
      await manageCartFlow();
      break;

    case "checkout":
      await checkoutFlow();
      break;

    case "order_status":
      await orderStatusFlow();
      break;

    case "exit":
      console.log("  👋 Thank you for ordering! Goodbye.\n");
      process.exit(0);
  }

  // Loop back to menu
  return mainMenu();
}

// ── Bootstrap ──────────────────────────────────
mainMenu().catch((err: unknown) => {
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
