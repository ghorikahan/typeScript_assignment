// ─────────────────────────────────────────────
//  src/cart.ts
//  Feature 2: Cart Operations
//  - addToCart()      — find() for duplicate check
//  - updateCartItem() — map() to change quantity
//  - removeFromCart() — filter() to remove item
//  - getSubtotal()    — reduce() over price * qty
//  - displayCart()    — formatted cart table
// ─────────────────────────────────────────────

import { FoodItem, CartItem, ID } from "./types";

// ── Add item to cart ───────────────────────────
// Uses find() to check if item already exists; if so, increments quantity.
// Otherwise spreads FoodItem into a new CartItem (intersection type).
export function addToCart(
  cart: CartItem[],
  item: FoodItem,
  quantity: number,
  specialInstruction?: string
): CartItem[] {
  if (!item.isAvailable) {
    throw new Error(`"${item.name}" is currently unavailable.`);
  }
  if (quantity <= 0) {
    throw new Error("Quantity must be at least 1.");
  }

  // find() — check if item is already in cart
  const existing = cart.find((c) => c.id === item.id);

  if (existing !== undefined) {
    // Already in cart — use map() to increment quantity
    return cart.map((c) =>
      c.id === item.id
        ? { ...c, quantity: c.quantity + quantity }
        : c
    );
  }

  // New item — spread FoodItem & OrderInfo into CartItem (intersection)
  const newCartItem: CartItem = {
    ...item,
    quantity,
    ...(specialInstruction !== undefined &&
      specialInstruction.trim().length > 0 && {
        specialInstruction: specialInstruction.trim(),
      }),
  };

  return [...cart, newCartItem];
}

// ── Update quantity of a cart item ────────────
// Uses map() to return a new array.
// If newQty ≤ 0, the item is removed (filter used internally).
export function updateCartItem(
  cart: CartItem[],
  itemId: ID,
  newQty: number
): CartItem[] {
  if (newQty <= 0) {
    return removeFromCart(cart, itemId);
  }
  // map() — return new array with updated quantity
  return cart.map((c) =>
    c.id === itemId ? { ...c, quantity: newQty } : c
  );
}

// ── Remove an item from the cart ──────────────
// Uses filter() to exclude the target item.
export function removeFromCart(cart: CartItem[], itemId: ID): CartItem[] {
  return cart.filter((c) => c.id !== itemId);
}

// ── Calculate subtotal ─────────────────────────
// Uses reduce() over price * quantity.
export function getSubtotal(cart: CartItem[]): number {
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

// ── Check if cart has any items ────────────────
// Uses some() as required by the assignment.
export function isCartEmpty(cart: CartItem[]): boolean {
  return !cart.some(() => true);
}

// ── Display cart table ─────────────────────────
export function displayCart(cart: CartItem[]): void {
  if (cart.length === 0) {
    console.log("\n  🛒  Your cart is empty.\n");
    return;
  }

  console.log("\n  🛒  Current Cart");
  console.log("  ──────────────────────────────────────────────────────");
  console.log(
    "  ID  │ Name                      │  Qty │  Unit ₹ │  Total ₹"
  );
  console.log("  ────┼───────────────────────────┼──────┼─────────┼──────────");

  cart.forEach((item) => {
    const id    = String(item.id).padStart(3);
    const name  = item.name.padEnd(26);
    const qty   = String(item.quantity).padStart(4);
    const unit  = `₹${item.price.toFixed(2)}`.padStart(8);
    const total = `₹${(item.price * item.quantity).toFixed(2)}`.padStart(9);
    console.log(`  ${id} │ ${name} │ ${qty} │ ${unit} │ ${total}`);

    if (item.specialInstruction !== undefined) {
      console.log(`       ↳ Note: ${item.specialInstruction}`);
    }
  });

  console.log("  ──────────────────────────────────────────────────────");
  const subtotal = getSubtotal(cart);
  console.log(
    `  ${"Subtotal".padEnd(44)} ₹${subtotal.toFixed(2).padStart(8)}`
  );
  console.log();
}
