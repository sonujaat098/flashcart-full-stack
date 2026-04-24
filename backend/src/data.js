export const categories = [
  {
    id: "fresh",
    name: "Fresh Fruits & Veggies",
    shortName: "Fresh",
    icon: "Leaf",
    accent: "#1c9a52"
  },
  {
    id: "dairy",
    name: "Dairy, Bread & Eggs",
    shortName: "Dairy",
    icon: "Milk",
    accent: "#f2bf24"
  },
  {
    id: "snacks",
    name: "Snacks & Munchies",
    shortName: "Snacks",
    icon: "Cookie",
    accent: "#eb6b2f"
  },
  {
    id: "drinks",
    name: "Cold Drinks & Juices",
    shortName: "Drinks",
    icon: "CupSoda",
    accent: "#1a9fc7"
  },
  {
    id: "staples",
    name: "Atta, Rice & Dal",
    shortName: "Staples",
    icon: "Wheat",
    accent: "#9a713a"
  },
  {
    id: "personal-care",
    name: "Personal Care",
    shortName: "Care",
    icon: "Sparkles",
    accent: "#bc5bd6"
  },
  {
    id: "home-care",
    name: "Home Essentials",
    shortName: "Home",
    icon: "Home",
    accent: "#4b77d9"
  }
];

export const products = [
  {
    id: "banana-robusta",
    name: "Robusta Banana",
    category: "fresh",
    weight: "6 pcs",
    price: 48,
    mrp: 62,
    rating: 4.7,
    deliveryTime: "8 min",
    image: "https://images.unsplash.com/photo-1603833665858-e61d17a86224?auto=format&fit=crop&w=600&q=80",
    tags: ["fresh", "breakfast", "bestseller"]
  },
  {
    id: "tomato-hybrid",
    name: "Hybrid Tomato",
    category: "fresh",
    weight: "500 g",
    price: 32,
    mrp: 44,
    rating: 4.5,
    deliveryTime: "8 min",
    image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80",
    tags: ["fresh", "daily"]
  },
  {
    id: "baby-spinach",
    name: "Baby Spinach",
    category: "fresh",
    weight: "200 g",
    price: 55,
    mrp: 75,
    rating: 4.6,
    deliveryTime: "9 min",
    image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80",
    tags: ["fresh", "healthy"]
  },
  {
    id: "green-grapes",
    name: "Seedless Green Grapes",
    category: "fresh",
    weight: "500 g",
    price: 96,
    mrp: 129,
    rating: 4.4,
    deliveryTime: "10 min",
    image: "https://images.unsplash.com/photo-1537640538966-79f369143f8f?auto=format&fit=crop&w=600&q=80",
    tags: ["fresh", "fruit"]
  },
  {
    id: "amul-milk",
    name: "Full Cream Milk",
    category: "dairy",
    weight: "500 ml",
    price: 34,
    mrp: 34,
    rating: 4.8,
    deliveryTime: "7 min",
    image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=600&q=80",
    tags: ["daily", "bestseller"]
  },
  {
    id: "brown-bread",
    name: "Soft Brown Bread",
    category: "dairy",
    weight: "400 g",
    price: 45,
    mrp: 55,
    rating: 4.6,
    deliveryTime: "7 min",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80",
    tags: ["breakfast", "bakery"]
  },
  {
    id: "free-range-eggs",
    name: "Farm Fresh Eggs",
    category: "dairy",
    weight: "10 pcs",
    price: 92,
    mrp: 110,
    rating: 4.7,
    deliveryTime: "9 min",
    image: "https://images.unsplash.com/photo-1587486913049-53fc88980cfc?auto=format&fit=crop&w=600&q=80",
    tags: ["protein", "breakfast"]
  },
  {
    id: "greek-yogurt",
    name: "Greek Yogurt Cup",
    category: "dairy",
    weight: "100 g",
    price: 39,
    mrp: 49,
    rating: 4.5,
    deliveryTime: "8 min",
    image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=600&q=80",
    tags: ["healthy", "snack"]
  },
  {
    id: "masala-chips",
    name: "Masala Potato Chips",
    category: "snacks",
    weight: "82 g",
    price: 30,
    mrp: 35,
    rating: 4.4,
    deliveryTime: "8 min",
    image: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=600&q=80",
    tags: ["snack", "party"]
  },
  {
    id: "butter-cookies",
    name: "Butter Cookies Tin",
    category: "snacks",
    weight: "200 g",
    price: 139,
    mrp: 175,
    rating: 4.6,
    deliveryTime: "10 min",
    image: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=600&q=80",
    tags: ["sweet", "bestseller"]
  },
  {
    id: "roasted-makhana",
    name: "Roasted Makhana",
    category: "snacks",
    weight: "75 g",
    price: 89,
    mrp: 120,
    rating: 4.5,
    deliveryTime: "9 min",
    image: "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&w=600&q=80",
    tags: ["healthy", "snack"]
  },
  {
    id: "dark-chocolate",
    name: "Dark Chocolate Bar",
    category: "snacks",
    weight: "55 g",
    price: 99,
    mrp: 125,
    rating: 4.7,
    deliveryTime: "8 min",
    image: "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?auto=format&fit=crop&w=600&q=80",
    tags: ["sweet", "premium"]
  },
  {
    id: "cola-can",
    name: "Chilled Cola Can",
    category: "drinks",
    weight: "300 ml",
    price: 38,
    mrp: 40,
    rating: 4.5,
    deliveryTime: "7 min",
    image: "https://images.unsplash.com/photo-1554866585-cd94860890b7?auto=format&fit=crop&w=600&q=80",
    tags: ["cold", "party"]
  },
  {
    id: "orange-juice",
    name: "Orange Juice",
    category: "drinks",
    weight: "1 L",
    price: 115,
    mrp: 145,
    rating: 4.6,
    deliveryTime: "8 min",
    image: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=600&q=80",
    tags: ["breakfast", "healthy"]
  },
  {
    id: "coconut-water",
    name: "Tender Coconut Water",
    category: "drinks",
    weight: "200 ml",
    price: 44,
    mrp: 55,
    rating: 4.4,
    deliveryTime: "8 min",
    image: "https://images.unsplash.com/photo-1581375221876-8f287fce2046?auto=format&fit=crop&w=600&q=80",
    tags: ["healthy", "fresh"]
  },
  {
    id: "sparkling-water",
    name: "Lemon Sparkling Water",
    category: "drinks",
    weight: "330 ml",
    price: 79,
    mrp: 95,
    rating: 4.3,
    deliveryTime: "9 min",
    image: "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?auto=format&fit=crop&w=600&q=80",
    tags: ["cold", "premium"]
  },
  {
    id: "basmati-rice",
    name: "Classic Basmati Rice",
    category: "staples",
    weight: "1 kg",
    price: 149,
    mrp: 190,
    rating: 4.8,
    deliveryTime: "10 min",
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80",
    tags: ["staple", "bestseller"]
  },
  {
    id: "whole-wheat-atta",
    name: "Whole Wheat Atta",
    category: "staples",
    weight: "5 kg",
    price: 239,
    mrp: 285,
    rating: 4.7,
    deliveryTime: "12 min",
    image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80",
    tags: ["staple", "daily"]
  },
  {
    id: "toor-dal",
    name: "Premium Toor Dal",
    category: "staples",
    weight: "1 kg",
    price: 159,
    mrp: 199,
    rating: 4.6,
    deliveryTime: "11 min",
    image: "https://images.unsplash.com/photo-1515543904379-3d757afe72e4?auto=format&fit=crop&w=600&q=80",
    tags: ["staple", "protein"]
  },
  {
    id: "olive-oil",
    name: "Extra Virgin Olive Oil",
    category: "staples",
    weight: "500 ml",
    price: 399,
    mrp: 540,
    rating: 4.5,
    deliveryTime: "12 min",
    image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80",
    tags: ["premium", "cooking"]
  },
  {
    id: "body-wash",
    name: "Fresh Citrus Body Wash",
    category: "personal-care",
    weight: "250 ml",
    price: 179,
    mrp: 225,
    rating: 4.5,
    deliveryTime: "10 min",
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80",
    tags: ["care", "daily"]
  },
  {
    id: "toothpaste",
    name: "Mint Toothpaste",
    category: "personal-care",
    weight: "150 g",
    price: 92,
    mrp: 115,
    rating: 4.6,
    deliveryTime: "9 min",
    image: "https://images.unsplash.com/photo-1571115764595-644a1f56a55c?auto=format&fit=crop&w=600&q=80",
    tags: ["care", "daily"]
  },
  {
    id: "laundry-liquid",
    name: "Laundry Liquid Detergent",
    category: "home-care",
    weight: "1 L",
    price: 189,
    mrp: 260,
    rating: 4.4,
    deliveryTime: "11 min",
    image: "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=600&q=80",
    tags: ["home", "cleaning"]
  },
  {
    id: "dishwash-gel",
    name: "Lemon Dishwash Gel",
    category: "home-care",
    weight: "500 ml",
    price: 99,
    mrp: 140,
    rating: 4.5,
    deliveryTime: "10 min",
    image: "https://images.unsplash.com/photo-1626806819282-2c1dc01a5e0c?auto=format&fit=crop&w=600&q=80",
    tags: ["home", "cleaning"]
  }
];
