// ─────────────────────────────────────────────
//  src/data.ts
//  Feature 2: Food Menu
//  - FOOD_MENU: FoodItem[]  (10+ items, 4 categories)
//  - searchFoodItems()      (filter by category, price, name)
// ─────────────────────────────────────────────

import { FoodItem, FoodFilter } from "./types";

// ── Menu data ──────────────────────────────────
export const FOOD_MENU: FoodItem[] = [
  // 🍕 Pizza
  { id: 1,  name: "Margherita Pizza",      category: "pizza",   price: 299, isAvailable: true  },
  { id: 2,  name: "Pepperoni Pizza",       category: "pizza",   price: 349, isAvailable: true  },
  { id: 3,  name: "BBQ Chicken Pizza",     category: "pizza",   price: 399, isAvailable: true  },
  { id: 4,  name: "Paneer Tikka Pizza",    category: "pizza",   price: 329, isAvailable: false },

  // 🍔 Burger
  { id: 5,  name: "Classic Veg Burger",    category: "burger",  price: 149, isAvailable: true  },
  { id: 6,  name: "Chicken Zinger Burger", category: "burger",  price: 199, isAvailable: true  },
  { id: 7,  name: "Double Patty Burger",   category: "burger",  price: 249, isAvailable: true  },

  // 🥤 Drink
  { id: 8,  name: "Cold Coffee",           category: "drink",   price: 129, isAvailable: true  },
  { id: 9,  name: "Fresh Lime Soda",       category: "drink",   price:  79, isAvailable: true  },
  { id: 10, name: "Mango Shake",           category: "drink",   price: 149, isAvailable: false },

  // 🍩 Dessert
  { id: 11, name: "Chocolate Brownie",     category: "dessert", price: 169, isAvailable: true  },
  { id: 12, name: "Gulab Jamun (2 pcs)",   category: "dessert", price:  99, isAvailable: true  },
  { id: 13, name: "Vanilla Ice Cream",     category: "dessert", price:  89, isAvailable: true  },
];

// ── Category emoji helper ──────────────────────
export function categoryEmoji(category: FoodItem["category"]): string {
  const map: Record<FoodItem["category"], string> = {
    pizza:   "🍕",
    burger:  "🍔",
    drink:   "🥤",
    dessert: "🍩",
  };
  return map[category];
}

// ── Search / filter ────────────────────────────
// Uses filter() and includes() as required
export function searchFoodItems(
  menu: FoodItem[],
  filter: FoodFilter
): FoodItem[] {
  return menu.filter((item) => {
    // Filter by category
    if (filter.category !== undefined && item.category !== filter.category) {
      return false;
    }
    // Filter by max price
    if (filter.maxPrice !== undefined && item.price > filter.maxPrice) {
      return false;
    }
    // Filter by partial name match (case-insensitive)
    if (
      filter.searchTerm !== undefined &&
      filter.searchTerm.trim().length > 0 &&
      !item.name.toLowerCase().includes(filter.searchTerm.toLowerCase().trim())
    ) {
      return false;
    }
    return true;
  });
}

// ── Display a list of food items ───────────────
export function displayFoodItems(items: FoodItem[]): void {
  if (items.length === 0) {
    console.log("  ⚠️  No items match your search.\n");
    return;
  }

  console.log();
  console.log(
    "  ID  │ " +
    "Name                      │ " +
    "Category │ " +
    " Price  │ " +
    "Status"
  );
  console.log("  ────┼──────────────────────────┼─────────┼────────┼──────────");

  items.forEach((item) => {
    const id       = String(item.id).padStart(3);
    const name     = item.name.padEnd(26);
    const cat      = `${categoryEmoji(item.category)} ${item.category}`.padEnd(9);
    const price    = `₹${item.price.toFixed(2)}`.padStart(7);
    const status   = item.isAvailable ? "✅ Available" : "❌ Unavailable";
    console.log(`  ${id} │ ${name}│ ${cat}│ ${price} │ ${status}`);
  });

  console.log();
}
