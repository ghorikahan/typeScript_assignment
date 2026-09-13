# 🍔 Food Ordering & Billing System

> A fully interactive, terminal-based food ordering and billing application built with **TypeScript**.

---

## 📌 Overview

This is a terminal application that simulates a real-world food ordering system. A customer can browse a food menu, add items to a cart, apply discounts based on membership level, calculate GST, pay using different methods, and receive a detailed final bill — all from the terminal.

The project is designed to practice **TypeScript fundamentals** (types, interfaces, union types, intersection types, type narrowing, discriminated unions, and exhaustive `never` checks) alongside **JavaScript array methods and logic**.

---

## ✨ Features

### 🧑 Customer Management
- Create a **Guest** customer with basic info (name, phone, address)
- Create a **Member** customer with:
  - Membership ID
  - Membership level: `silver` | `gold` | `platinum`
  - Auto-assigned discount percentage based on level

### 🍽️ Food Menu
- Browse **10+ food items** across 4 categories:
  - 🍕 Pizza
  - 🍔 Burger
  - 🥤 Drink
  - 🍩 Dessert
- Each item includes: ID, name, category, price, and availability status
- Only available items can be ordered

### 🛒 Cart Operations
- **Add** items to cart (auto-increments quantity if item already exists)
- **View** current cart with item totals
- **Update** quantity of any item in the cart
- **Remove** items from the cart
- Add optional **special instructions** per item (e.g., "extra cheese", "no onions")

### 💰 Discount System

| Customer Type   | Membership Discount |
|-----------------|--------------------:|
| Guest           | 0%                  |
| Silver Member   | 5%                  |
| Gold Member     | 10%                 |
| Platinum Member | 15%                 |

> **Bonus Discount:** An additional **5%** is applied automatically when the subtotal exceeds ₹2,000

### 🧾 Billing & GST
- Calculates **subtotal** using `reduce()` over cart items
- Applies **membership discount** first
- Applies **additional 5% discount** if subtotal > ₹2,000
- Applies **5% GST** on the amount after all discounts
- Generates a full itemized **bill summary**

**Billing flow:**
```
Subtotal
   ↓ Membership Discount
   ↓ Additional Discount (if subtotal > ₹2000)
Amount After Discount
   ↓ GST (5%)
Final Amount
```

### 💳 Payment Methods
Three payment options, each with unique details:

| Method   | Required Info                                     |
|----------|---------------------------------------------------|
| 💵 Cash  | Received amount (change calculated automatically) |
| 💳 Card  | Last 4 digits of card                             |
| 📱 UPI   | Transaction ID                                    |

Type narrowing (`in` operator) is used to handle each payment type safely.

### 📦 Order Status Management
Change order status through the lifecycle:
```
pending → confirmed → preparing → delivered
                                ↘ cancelled
```
Invalid status transitions are caught at runtime. All statuses are handled exhaustively using a `never`-based check — TypeScript will warn if a new status is ever added but not handled.

### 📄 Bill Generation (Discriminated Union)
`generateBill()` returns either:
- **Success** — full bill with order ID, customer info, items, discounts, GST, payment details
- **Error** — descriptive error message (e.g., empty cart)

Narrowed safely using `result.status === "success"`.

### 🔍 Search & Filter Food *(Bonus Feature)*
Search and filter the food menu by:
- **Category** — filter by pizza / burger / drink / dessert
- **Name keyword** — search by partial name (case-insensitive)
- **Max price** — filter items within a budget

---

## 🗂️ Project Structure

```
typeScript_assignment/
│
├── src/
│   ├── types.ts        ← All type aliases, interfaces, and union types
│   ├── data.ts         ← Food items array + search/filter utilities
│   ├── cart.ts         ← Cart CRUD + subtotal calculation
│   ├── customer.ts     ← Guest/Member creation + isMember() type guard
│   ├── payment.ts      ← processPayment() with type narrowing
│   ├── billing.ts      ← Discounts, GST, generateBill()
│   ├── order.ts        ← updateOrderStatus() + assertNever() exhaustive check
│   └── index.ts        ← Interactive terminal menu (main entry point)
│
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🧠 TypeScript Concepts Practised

| Concept                      | Where Used                                              |
|------------------------------|---------------------------------------------------------|
| `interface`                  | `FoodItem`, `Customer`, `Address`                       |
| `type` alias                 | `ID`, `FoodCategory`, `OrderStatus`, `CartItem`, `BillResult` |
| Union types (`\|`)           | `Guest \| Member`, `CashPayment \| CardPayment \| UpiPayment` |
| Intersection types (`&`)     | `CartItem = FoodItem & OrderInfo`                       |
| Literal types                | `"pizza" \| "burger" \| "drink" \| "dessert"`           |
| Optional properties (`?`)    | `phone?`, `specialInstruction?`                         |
| Type narrowing (`in`)        | `processPayment()`, `isMember()`                        |
| Discriminated union          | `BillResult` narrowed via `status` field                |
| `never` exhaustive check     | `assertNever()` in `updateOrderStatus()`                |
| Typed function signatures    | All functions have explicit parameter & return types    |
| Type guards                  | `isMember(customer): customer is MemberCustomer`        |

---

## ⚙️ JavaScript Skills Practised

| Method / Feature      | Where Used                                      |
|-----------------------|-------------------------------------------------|
| `find()`              | Check if item already in cart                   |
| `filter()`            | Remove item from cart, filter food by category  |
| `map()`               | Update quantity in cart                         |
| `reduce()`            | Calculate subtotal                              |
| `some()`              | Check cart is non-empty                         |
| `includes()`          | Name search in filter feature                   |
| Destructuring         | Extracting item/customer properties             |
| Spread operator       | Creating new `CartItem` from `FoodItem`         |
| Template literals     | All terminal output formatting                  |
| Optional chaining     | `customer.phone?.toString()`                    |
| Nullish coalescing    | Default values in prompts                       |
| `switch` statement    | Order status handling with exhaustive check     |

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- npm

### Install Dependencies
```bash
npm install
```

### Run the Application
```bash
npm run dev
```

### Build (compile to JavaScript)
```bash
npm run build
```

---

## 📦 Dependencies

| Package              | Purpose                                              |
|----------------------|------------------------------------------------------|
| `typescript`         | TypeScript compiler                                  |
| `ts-node`            | Run `.ts` files directly without pre-compiling       |
| `@types/node`        | Node.js type definitions                             |
| `@inquirer/prompts`  | Interactive terminal menus (select, input, confirm)  |
| `chalk`              | Colored and styled terminal output *(optional)*      |

---

## 🖥️ Example Terminal Output

```
╔══════════════════════════════════════════╗
║       🍔  FOOD ORDERING SYSTEM           ║
╚══════════════════════════════════════════╝

========================================
             ORDER SUMMARY
========================================

Customer : Rahul Sharma
Membership: Gold (10% discount)

Items:
----------------------------------------
Margherita Pizza       x2      ₹598.00
Veg Burger             x1      ₹199.00
Cold Coffee            x2      ₹300.00
----------------------------------------

Subtotal:                       ₹1,097.00
Membership Discount (10%):       ₹109.70
Additional Discount:               ₹0.00
After Discount:                  ₹987.30
GST (5%):                         ₹49.37
----------------------------------------
Final Amount:                  ₹1,036.67

Payment Method: UPI
Transaction ID: UPI928374

Order Status: Confirmed ✅

========================================
        Thank you for ordering! 🙏
========================================
```

---

## 📋 Assignment Checklist

- [x] Application runs from the terminal
- [x] At least 8 food items across all categories
- [x] Guest and Member customer types
- [x] Cart — add, update, remove items
- [x] Subtotal calculated using `reduce()`
- [x] Membership discount applied correctly
- [x] Additional ₹2,000 threshold discount
- [x] 5% GST applied after discounts
- [x] Cash / Card / UPI payment support
- [x] Order status can be changed
- [x] `BillResult` uses discriminated union
- [x] Type narrowing used (`in`, `typeof`, equality)
- [x] `never` used for exhaustive status handling
- [x] No `any` used anywhere
- [x] No classes used
- [x] All functions have proper TypeScript types
- [x] Code split into logical files
- [x] Bonus feature: Search & Filter food items

---

## 👤 Author

**Assignment** — TypeScript Practice  
*Food Ordering & Billing System — Terminal Application*
