import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Truck, Package, ShoppingCart, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import CartDrawer from "@/components/CartDrawer";
import ProductCard from "@/components/ProductCard";
import DrinkSelectionDialog from "@/components/DrinkSelectionDialog";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

// Mock data types
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  is_featured: boolean;
  is_top_product: boolean;
}

interface CartItem {
  id: string;
  product_id: string;
  product_name: string;
  price: number;
  quantity: number;
  image_url: string;
  selected_drink?: string;
}

const mockProducts: Product[] = [
  {
    id: "1",
    name: "Menu Classique",
    description: "4 pièces de poulet croustillant + frites + boisson",
    price: 4500,
    image_url:
      "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500&h=500&fit=crop",
    category: "menus",
    is_featured: true,
    is_top_product: true,
  },
  {
    id: "2",
    name: "Chicken Burger Master",
    description: "Burger signature avec poulet croustillant et sauce maison",
    price: 3500,
    image_url:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&h=500&fit=crop",
    category: "burgers",
    is_featured: true,
    is_top_product: true,
  },
  {
    id: "3",
    name: "Menu Solo",
    description: "2 pièces de poulet + petite frite + boisson",
    price: 2500,
    image_url:
      "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=500&h=500&fit=crop",
    category: "menus",
    is_featured: false,
    is_top_product: true,
  },
  {
    id: "4",
    name: "Tacos Poulet",
    description: "Tacos garni de poulet croustillant et fromage",
    price: 2500,
    image_url:
      "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=500&h=500&fit=crop",
    category: "tacos",
    is_featured: true,
    is_top_product: false,
  },
  {
    id: "5",
    name: "Frites Sauce",
    description: "Frites accompagnées de 3 sauces au choix",
    price: 1500,
    image_url:
      "https://images.unsplash.com/photo-1630431341973-02e1bb7a6408?w=500&h=500&fit=crop",
    category: "snacks",
    is_featured: true,
    is_top_product: false,
  },
];

const mockDrinks = [
  { id: "bouye", name: "Bouye", emoji: "🥤" },
  { id: "bissap", name: "Bissap", emoji: "🍹" },
  { id: "ananas", name: "Ananas", emoji: "🍍" },
  { id: "coco", name: "Coco", emoji: "🥥" },
  { id: "sprite", name: "Sprite", emoji: "🥤" },
];

const categories = [
  { id: "burgers", name: "Burgers", emoji: "🍔" },
  { id: "menus", name: "Menus", emoji: "📦" },
  { id: "tacos", name: "Tacos & Wraps", emoji: "🌮" },
  { id: "snacks", name: "Snacks", emoji: "🍟" },
];

export default function Home() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drinkDialogOpen, setDrinkDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const topProducts = mockProducts.filter((p) => p.is_top_product);

  const handleAddToCart = (product: Product) => {
    if (product.category === "menus") {
      setSelectedProduct(product);
      setDrinkDialogOpen(true);
    } else {
      addProductToCart(product);
    }
  };

  const addProductToCart = (product: Product, drinkName?: string) => {
    const newItem: CartItem = {
      id: `${product.id}-${Date.now()}`,
      product_id: product.id,
      product_name: product.name,
      price: product.price,
      quantity: 1,
      image_url: product.image_url,
      selected_drink: drinkName,
    };

    setCartItems((prev) => [...prev, newItem]);
    toast.success("Produit ajouté au panier");
    setDrawerOpen(true);
  };

  const handleDrinkSelect = (drinkId: string) => {
    if (selectedProduct) {
      const drinkName = mockDrinks.find((d) => d.id === drinkId)?.name || "";
      addProductToCart(selectedProduct, drinkName);
      setDrinkDialogOpen(false);
      setSelectedProduct(null);
    }
  };

  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    if (quantity === 0) {
      handleRemoveItem(itemId);
    } else {
      setCartItems((prev) =>
        prev.map((item) => (item.id === itemId ? { ...item, quantity } : item)),
      );
    }
  };

  const handleRemoveItem = (itemId: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== itemId));
    toast.success("Produit retiré du panier");
  };

  return (
    <Layout cartCount={cartItems.length}>
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-chicken-navy to-[#2D2D44] text-white py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Left: Image Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="relative aspect-square flex items-center justify-center"
            >
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2F19945f87741e40b398843fe8ba0a7879%2F3f1cb2a0ca1d436485c1cbe9e643728c?format=webp&width=800"
                alt="Chicken Master Logo"
                className="w-full h-full object-contain"
              />
            </motion.div>

            {/* Right: Content Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col gap-6 md:gap-8"
            >
              {/* Titles */}
              <div className="space-y-2">
                <h1 className="text-5xl md:text-6xl font-black">
                  <span className="text-chicken-orange">CHICKEN</span>{" "}
                  <span className="text-white">MASTER</span>
                </h1>
                <p className="text-xl md:text-2xl text-gray-200">
                  Le Meilleur Poulet en Ville
                </p>
              </div>

              {/* Action Buttons Grid */}
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <Link to="/menu" className="group">
                  <button className="w-full h-24 md:h-32 bg-primary hover:bg-primary/90 rounded-xl md:rounded-2xl flex flex-col items-center justify-center gap-2 transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl">
                    <Truck className="w-6 h-6 md:w-8 md:h-8 text-white" />
                    <span className="font-bold text-sm md:text-base text-white">
                      Livraison
                    </span>
                  </button>
                </Link>

                <Link to="/menu" className="group">
                  <button className="w-full h-24 md:h-32 bg-chicken-green hover:bg-chicken-green/90 rounded-xl md:rounded-2xl flex flex-col items-center justify-center gap-2 transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl">
                    <Package className="w-6 h-6 md:w-8 md:h-8 text-white" />
                    <span className="font-bold text-sm md:text-base text-white">
                      À emporter
                    </span>
                  </button>
                </Link>

                <Link to="/menu" className="group col-span-2 md:col-span-1">
                  <button className="w-full h-24 md:h-32 bg-primary hover:bg-primary/90 rounded-xl md:rounded-2xl flex flex-col items-center justify-center gap-2 transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl">
                    <ShoppingCart className="w-6 h-6 md:w-8 md:h-8 text-white" />
                    <span className="font-bold text-sm md:text-base text-white">
                      Menu
                    </span>
                  </button>
                </Link>
              </div>

              {/* Status Indicator */}
              <div className="flex items-center gap-3 bg-white/10 px-4 py-3 rounded-lg w-fit">
                <div className="w-2 h-2 bg-chicken-green rounded-full animate-pulse" />
                <span className="text-sm md:text-base font-medium">
                  La commande est ouverte
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <section className="bg-white py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {categories.map((cat, idx) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
              >
                <Link to={`/menu?category=${cat.id}`}>
                  <div className="relative aspect-square rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer">
                    <img
                      src={
                        cat.id === "burgers"
                          ? "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&h=500&fit=crop"
                          : cat.id === "menus"
                            ? "https://images.unsplash.com/photo-1619221882018-03af60e79929?w=500&h=500&fit=crop"
                            : cat.id === "tacos"
                              ? "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=500&h=500&fit=crop"
                              : "https://images.unsplash.com/photo-1562967914-608f82629710?w=500&h=500&fit=crop"
                      }
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                      <div>
                        <p className="text-2xl mb-1">{cat.emoji}</p>
                        <h3 className="text-white font-bold text-lg">
                          {cat.name}
                        </h3>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Products Section */}
      <section className="bg-chicken-gray py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Top 5 produits
            </h2>
            <p className="text-muted-foreground">Nos best-sellers</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
            {topProducts.map((product, idx) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                viewport={{ once: true }}
              >
                <ProductCard
                  id={product.id}
                  name={product.name}
                  description={product.description}
                  price={product.price}
                  imageUrl={product.image_url}
                  isFeatured={product.is_featured}
                  onAddClick={() => handleAddToCart(product)}
                />
              </motion.div>
            ))}

            {/* See All Products Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: topProducts.length * 0.05 }}
              viewport={{ once: true }}
            >
              <Link to="/menu">
                <div className="bg-primary hover:bg-primary/90 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 h-full flex items-center justify-center p-6 text-center cursor-pointer hover:scale-105">
                  <div>
                    <TrendingUp className="w-12 h-12 text-white mx-auto mb-3" />
                    <p className="text-white font-bold">
                      Voir toute
                      <br />
                      la carte
                    </p>
                  </div>
                </div>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Cart Drawer */}
      <CartDrawer
        open={drawerOpen}
        items={cartItems}
        onOpenChange={setDrawerOpen}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckout={() => {
          // This will be handled in the app routing
        }}
      />

      {/* Drink Selection Dialog */}
      <DrinkSelectionDialog
        open={drinkDialogOpen}
        menuName={selectedProduct?.name || ""}
        drinks={mockDrinks}
        onSelect={handleDrinkSelect}
        onCancel={() => {
          setDrinkDialogOpen(false);
          setSelectedProduct(null);
        }}
      />
    </Layout>
  );
}
