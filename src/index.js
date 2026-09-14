"use strict";
// ─────────────────────────────────────────────
//  src/index.ts
//  Main entry point — Full interactive terminal menu
//  Features: Customer, Menu, Cart, Checkout, Order Status
// ─────────────────────────────────────────────
Object.defineProperty(exports, "__esModule", { value: true });
const prompts_1 = require("@inquirer/prompts");
// Customer
const customer_1 = require("./customer");
// Data / Menu
const data_1 = require("./data");
// Cart
const cart_1 = require("./cart");
// Payment
const payment_1 = require("./payment");
// Billing
const billing_1 = require("./billing");
// Order
const order_1 = require("./order");
// ── Shared application state ───────────────────
let currentCustomer = null;
let cart = [];
let currentOrder = null;
// ── Shared ID counter ──────────────────────────
let nextCustomerId = 1;
// ── Utility helpers ────────────────────────────
function printHeader() {
    console.clear();
    console.log("╔══════════════════════════════════════════════════════╗");
    console.log("║         🍔  FOOD ORDERING & BILLING SYSTEM           ║");
    console.log("╚══════════════════════════════════════════════════════╝");
    console.log();
}
function printSeparator() {
    console.log("  ──────────────────────────────────────────────────────");
}
async function pressEnterToContinue() {
    await (0, prompts_1.input)({ message: "  Press Enter to continue..." });
}
// ── Collect address via prompts ────────────────
async function collectAddress() {
    const street = await (0, prompts_1.input)({
        message: "  Street address:",
        validate: (val) => val.trim().length > 0 || "Street cannot be empty",
    });
    const city = await (0, prompts_1.input)({
        message: "  City:",
        validate: (val) => val.trim().length > 0 || "City cannot be empty",
    });
    const pincode = await (0, prompts_1.input)({
        message: "  Pincode:",
        validate: (val) => /^\d{6}$/.test(val.trim()) || "Pincode must be a 6-digit number",
    });
    return { street: street.trim(), city: city.trim(), pincode: pincode.trim() };
}
// ══════════════════════════════════════════════
//  FEATURE 1 — Customer Management
// ══════════════════════════════════════════════
async function createCustomerFlow() {
    printHeader();
    console.log("  🧑  Create / Change Customer\n");
    const customerType = await (0, prompts_1.select)({
        message: "  Customer type:",
        choices: [
            { name: "👤  Guest (no membership discount)", value: "guest" },
            { name: "⭐  Member (get membership discount)", value: "member" },
        ],
    });
    console.log();
    const name = await (0, prompts_1.input)({
        message: "  Full name:",
        validate: (val) => val.trim().length > 0 || "Name cannot be empty",
    });
    const hasPhone = await (0, prompts_1.confirm)({ message: "  Add phone number?", default: false });
    let phone;
    if (hasPhone) {
        phone = await (0, prompts_1.input)({
            message: "  Phone number:",
            validate: (val) => /^\d{10}$/.test(val.trim()) || "Phone must be a 10-digit number",
        });
        phone = phone.trim();
    }
    console.log("\n  📍 Delivery Address");
    printSeparator();
    const address = await collectAddress();
    const id = nextCustomerId++;
    if (customerType === "guest") {
        currentCustomer = (0, customer_1.createGuest)(id, name.trim(), address, phone);
        console.log("\n  ✅ Guest customer created successfully!");
        (0, customer_1.displayCustomer)(currentCustomer);
    }
    else {
        console.log("\n  ⭐ Membership Details");
        printSeparator();
        const membershipId = await (0, prompts_1.input)({
            message: "  Membership ID:",
            validate: (val) => val.trim().length > 0 || "Membership ID cannot be empty",
        });
        const membershipLevel = await (0, prompts_1.select)({
            message: "  Membership level:",
            choices: [
                { name: "🥈  Silver  — 5% discount", value: "silver" },
                { name: "🥇  Gold   — 10% discount", value: "gold" },
                { name: "💎  Platinum — 15% discount", value: "platinum" },
            ],
        });
        currentCustomer = (0, customer_1.createMember)(id, name.trim(), membershipId.trim(), membershipLevel, address, phone);
        console.log("\n  ✅ Member customer created successfully!");
        (0, customer_1.displayCustomer)(currentCustomer);
    }
    // Reset cart and order when customer changes
    cart = [];
    currentOrder = null;
    await pressEnterToContinue();
}
// ══════════════════════════════════════════════
//  FEATURE 2 — Food Menu & Search
// ══════════════════════════════════════════════
async function browseMenuFlow() {
    printHeader();
    console.log("  🍽️   Food Menu\n");
    const filterChoice = await (0, prompts_1.select)({
        message: "  How would you like to browse?",
        choices: [
            { name: "📋  Show all available items", value: "all" },
            { name: "🔍  Filter by category", value: "category" },
            { name: "💰  Filter by max price", value: "price" },
            { name: "🔤  Search by name", value: "name" },
        ],
    });
    console.log();
    let items = data_1.FOOD_MENU;
    if (filterChoice === "category") {
        const cat = await (0, prompts_1.select)({
            message: "  Select category:",
            choices: [
                { name: "🍕  Pizza", value: "pizza" },
                { name: "🍔  Burger", value: "burger" },
                { name: "🥤  Drink", value: "drink" },
                { name: "🍩  Dessert", value: "dessert" },
            ],
        });
        items = (0, data_1.searchFoodItems)(data_1.FOOD_MENU, { category: cat });
    }
    else if (filterChoice === "price") {
        const maxPrice = await (0, prompts_1.number)({
            message: "  Max price (₹):",
            validate: (val) => (val !== undefined && val > 0) || "Enter a positive number",
        });
        items = (0, data_1.searchFoodItems)(data_1.FOOD_MENU, { maxPrice: maxPrice });
    }
    else if (filterChoice === "name") {
        const term = await (0, prompts_1.input)({
            message: "  Search term:",
            validate: (val) => val.trim().length > 0 || "Search term cannot be empty",
        });
        items = (0, data_1.searchFoodItems)(data_1.FOOD_MENU, { searchTerm: term });
    }
    else {
        // "all" — only show available items
        items = data_1.FOOD_MENU;
    }
    (0, data_1.displayFoodItems)(items);
    // Offer to add an item to cart
    if (currentCustomer !== null && items.some((i) => i.isAvailable)) {
        const addItem = await (0, prompts_1.confirm)({ message: "  Add an item to cart?", default: true });
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
async function addToCartFlow(availableItems = data_1.FOOD_MENU.filter((i) => i.isAvailable)) {
    printHeader();
    console.log("  ➕  Add Item to Cart\n");
    if (availableItems.length === 0) {
        console.log("  ⚠️  No available items to add.\n");
        await pressEnterToContinue();
        return;
    }
    const selectedId = await (0, prompts_1.select)({
        message: "  Select item:",
        choices: availableItems.map((item) => ({
            name: `${(0, data_1.categoryEmoji)(item.category)}  ${item.name.padEnd(28)} ₹${item.price.toFixed(2)}`,
            value: item.id,
        })),
    });
    const selectedItem = availableItems.find((i) => i.id === selectedId);
    const qty = await (0, prompts_1.number)({
        message: "  Quantity:",
        default: 1,
        validate: (val) => (val !== undefined && val >= 1) || "Quantity must be at least 1",
    });
    const hasNote = await (0, prompts_1.confirm)({ message: "  Add special instruction?", default: false });
    let instruction;
    if (hasNote) {
        instruction = await (0, prompts_1.input)({ message: "  Instruction (e.g. extra cheese, no onions):" });
    }
    try {
        cart = (0, cart_1.addToCart)(cart, selectedItem, qty, instruction);
        console.log(`\n  ✅ "${selectedItem.name}" added to cart!`);
    }
    catch (err) {
        console.log(`\n  ❌ ${err.message}`);
    }
    (0, cart_1.displayCart)(cart);
    await pressEnterToContinue();
}
async function manageCartFlow() {
    printHeader();
    console.log("  🛒  Manage Cart\n");
    (0, cart_1.displayCart)(cart);
    if ((0, cart_1.isCartEmpty)(cart)) {
        await pressEnterToContinue();
        return;
    }
    const action = await (0, prompts_1.select)({
        message: "  What would you like to do?",
        choices: [
            { name: "➕  Add more items", value: "add" },
            { name: "✏️   Update quantity", value: "update" },
            { name: "🗑️   Remove an item", value: "remove" },
            { name: "⬅️   Back to main menu", value: "back" },
        ],
    });
    console.log();
    if (action === "add") {
        await addToCartFlow();
        return;
    }
    if (action === "update") {
        const itemId = await (0, prompts_1.select)({
            message: "  Select item to update:",
            choices: cart.map((c) => ({
                name: `${c.name} (current qty: ${c.quantity})`,
                value: c.id,
            })),
        });
        const newQty = await (0, prompts_1.number)({
            message: "  New quantity (0 to remove):",
            validate: (val) => val !== undefined || "Please enter a number",
        });
        cart = (0, cart_1.updateCartItem)(cart, itemId, newQty);
        console.log("\n  ✅ Cart updated.");
        (0, cart_1.displayCart)(cart);
        await pressEnterToContinue();
        return;
    }
    if (action === "remove") {
        const itemId = await (0, prompts_1.select)({
            message: "  Select item to remove:",
            choices: cart.map((c) => ({ name: c.name, value: c.id })),
        });
        cart = (0, cart_1.removeFromCart)(cart, itemId);
        console.log("\n  ✅ Item removed.");
        (0, cart_1.displayCart)(cart);
        await pressEnterToContinue();
        return;
    }
}
// ══════════════════════════════════════════════
//  FEATURE 3 — Checkout & Payment
// ══════════════════════════════════════════════
async function checkoutFlow() {
    if (currentCustomer === null) {
        console.log("\n  ⚠️  Please create a customer first.\n");
        await pressEnterToContinue();
        return;
    }
    if ((0, cart_1.isCartEmpty)(cart)) {
        console.log("\n  ⚠️  Your cart is empty. Add items before checking out.\n");
        await pressEnterToContinue();
        return;
    }
    printHeader();
    console.log("  💳  Checkout\n");
    (0, cart_1.displayCart)(cart);
    // Choose payment method
    const method = await (0, prompts_1.select)({
        message: "  Select payment method:",
        choices: [
            { name: "💵  Cash", value: "cash" },
            { name: "💳  Card", value: "card" },
            { name: "📱  UPI", value: "upi" },
        ],
    });
    let payment;
    if (method === "cash") {
        const received = await (0, prompts_1.number)({
            message: "  Amount received (₹):",
            validate: (val) => (val !== undefined && val > 0) || "Enter a valid amount",
        });
        payment = { method: "cash", receivedAmount: received };
    }
    else if (method === "card") {
        const last4 = await (0, prompts_1.input)({
            message: "  Last 4 digits of card:",
            validate: (val) => /^\d{4}$/.test(val.trim()) || "Must be exactly 4 digits",
        });
        payment = { method: "card", last4Digits: last4.trim() };
    }
    else {
        const txnId = await (0, prompts_1.input)({
            message: "  UPI Transaction ID:",
            validate: (val) => val.trim().length > 0 || "Transaction ID cannot be empty",
        });
        payment = { method: "upi", transactionId: txnId.trim() };
    }
    // Generate bill (discriminated union: success | error)
    const result = (0, billing_1.generateBill)(currentCustomer, cart, payment);
    if (result.status === "error") {
        // Narrowed to ErrorBill
        console.log(`\n  ❌ Billing error: ${result.message}\n`);
        await pressEnterToContinue();
        return;
    }
    // Narrowed to SuccessBill
    (0, billing_1.displayBill)(result);
    (0, payment_1.displayPaymentSummary)(result.payment, result.finalAmount);
    currentOrder = result;
    cart = []; // Clear cart after successful order
    await pressEnterToContinue();
}
// ══════════════════════════════════════════════
//  FEATURE 3 — Order Status Management
// ══════════════════════════════════════════════
async function orderStatusFlow() {
    if (currentOrder === null) {
        console.log("\n  ⚠️  No active order. Please complete a checkout first.\n");
        await pressEnterToContinue();
        return;
    }
    printHeader();
    console.log("  📦  Order Status\n");
    console.log(`  Order #${currentOrder.orderId} — ${currentOrder.customer.name}`);
    (0, order_1.displayOrderStatus)(currentOrder.orderStatus);
    const nextStatuses = (0, order_1.getNextStatuses)(currentOrder.orderStatus);
    if (nextStatuses.length === 0) {
        console.log(`  ℹ️   Order is in a terminal state (${currentOrder.orderStatus}). No further changes possible.\n`);
        await pressEnterToContinue();
        return;
    }
    const next = await (0, prompts_1.select)({
        message: "  Move to status:",
        choices: [
            ...nextStatuses.map((s) => ({ name: (0, order_1.statusLabel)(s), value: s })),
            { name: "⬅️  Keep current status", value: currentOrder.orderStatus },
        ],
    });
    if (next !== currentOrder.orderStatus) {
        try {
            const updated = (0, order_1.updateOrderStatus)(currentOrder.orderStatus, next);
            // SuccessBill is readonly, so we create a new order object
            currentOrder = { ...currentOrder, orderStatus: updated };
            console.log(`\n  ✅ Order status updated to: ${(0, order_1.statusLabel)(updated)}\n`);
        }
        catch (err) {
            console.log(`\n  ❌ ${err.message}\n`);
        }
    }
    await pressEnterToContinue();
}
// ══════════════════════════════════════════════
//  MAIN MENU
// ══════════════════════════════════════════════
async function mainMenu() {
    printHeader();
    // Status bar
    if (currentCustomer !== null) {
        console.log(`  👤 Customer : ${currentCustomer.name} (${currentCustomer.type})`);
    }
    if (!(0, cart_1.isCartEmpty)(cart)) {
        console.log(`  🛒 Cart     : ${cart.length} item(s)`);
    }
    if (currentOrder !== null) {
        console.log(`  📦 Order #${currentOrder.orderId} : ${(0, order_1.statusLabel)(currentOrder.orderStatus)}`);
    }
    if (currentCustomer !== null || !(0, cart_1.isCartEmpty)(cart) || currentOrder !== null) {
        console.log();
    }
    const choice = await (0, prompts_1.select)({
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
                disabled: currentCustomer === null || (0, cart_1.isCartEmpty)(cart),
            },
            {
                name: "💳  Checkout & Pay",
                value: "checkout",
                disabled: currentCustomer === null || (0, cart_1.isCartEmpty)(cart),
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
                (0, customer_1.displayCustomer)(currentCustomer);
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
mainMenu().catch((err) => {
    if (err instanceof Error &&
        err.message.includes("User force closed the prompt")) {
        console.log("\n  👋 Exited. Goodbye!\n");
        process.exit(0);
    }
    console.error(err);
    process.exit(1);
});
