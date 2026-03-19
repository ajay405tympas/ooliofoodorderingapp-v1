export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  category?: string;
}

export const mockMenuData: MenuItem[] = [
  {
    id: "1",
    name: "Cheeseburger",
    description: "Delicious double patty beef burger with cheddar cheese",
    price: 8.99,
    category: "Burgers",
  },
  {
    id: "2",
    name: "Margherita Pizza",
    description: "Fresh mozzarella, tomato, and basil",
    price: 10.99,
    category: "Pizza",
  },
  {
    id: "3",
    name: "Spaghetti Carbonara",
    description: "Classic Italian pasta with bacon and cream sauce",
    price: 9.99,
    category: "Pasta",
  },
  {
    id: "4",
    name: "Grilled Chicken Sandwich",
    description: "Grilled chicken with lettuce, tomato, and mayo",
    price: 7.99,
    category: "Sandwiches",
  },
  {
    id: "5",
    name: "Garden Salad",
    description: "Fresh mixed greens with vinaigrette dressing",
    price: 5.99,
    category: "Salads",
  },
  {
    id: "6",
    name: "Chocolate Cake",
    description: "Rich chocolate cake with chocolate frosting",
    price: 4.99,
    category: "Desserts",
  },
];
