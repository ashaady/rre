import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import CartDrawer from "@/components/CartDrawer";
import DrinkSelectionDialog from "@/components/DrinkSelectionDialog";
import { toast } from "sonner";

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
    image_url: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500&h=500&fit=crop",
    category: "menus",
    is_featured: true,
    is_top_product: true,
  },
  {
    id: "2",
    name: "Menu Famille",
    description: "12 pièces + 2 grandes frites + 4 boissons",
    price: 12000,
    image_url: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=500&h=500&fit=crop",
    category: "menus",
    is_featured: true,
    is_top_product: false,
  },
  {
    id: "3",
    name: "Menu Solo",
    description: "2 pièces de poulet + petite frite + boisson",
    price: 2500,
    image_url: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=500&h=500&fit=crop",
    category: "menus",
    is_featured: false,
    is_top_product: true,
  },
  {
    id: "4",
    name: "Chicken Burger Master",
    description: "Burger signature avec poulet croustillant et sauce maison",
    price: 3500,
    image_url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&h=500&fit=crop",
    category: "burgers",
    is_featured: true,
    is_top_product: true,
  },
  {
    id: "5",
    name: "Double Chicken",
    description: "Double portion de poulet, double fromage, sauce barbecue",
    price: 4500,
    image_url: "https://images.unsplash.com/photo-1550547660-d9450f859450?w=500&h=500&fit=crop",
    category: "burgers",
    is_featured: true,
    is_top_product: false,
  },
  {
    id: "6",
    name: "Spicy Chicken",
    description: "Poulet épicé, jalapeños, sauce piquante",
    price: 3800,
    image_url: "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=500&h=500&fit=crop",
    category: "burgers",
    is_featured: false,
    is_top_product: true,
  },
  {
    id: "7",
    name: "Tacos Poulet",
    description: "Tacos garni de poulet croustillant et fromage",
    price: 2500,
    image_url: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=500&h=500&fit=crop",
    category: "tacos",
    is_featured: true,
    is_top_product: false,
  },
  {
    id: "8",
    name: "Wrap Poulet",
    description: "Tortilla avec poulet grillé, légumes frais et sauce caesar",
    price: 2800,
    image_url: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=500&h=500&fit=crop",
    category: "tacos",
    is_featured: false,
    is_top_product: true,
  },
  {
    id: "9",
    name: "Frites Classiques",
    description: "Portion généreuse de frites croustillantes",
    price: 1000,
    image_url: "https://images.unsplash.com/photo-1576107232684-1279f390859f?w=500&h=500&fit=crop",
    category: "snacks",
    is_featured: false,
    is_top_product: false,
  },
  {
    id: "10",
    name: "Frites Sauce",
    description: "Frites accompagnées de 3 sauces au choix",
    price: 1500,
    image_url: "https://images.unsplash.com/photo-1630431341973-02e1bb7a6408?w=500&h=500&fit=crop",
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

const filterOptions = [
  { id: "all", label: "Tout 🍽️" },
  { id: "menus", label: "Menus 📦" },
  { id: "burgers", label: "Burgers 🍔" },
  { id: "tacos", label: "Tacos & Wraps 🌮" },
  { id: "snacks", label: "Snacks 🍟" },
  { id: "drinks", label: "Boissons 🥤" },
];

export default function Menu() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drinkDialogOpen, setDrinkDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const activeFilter = searchParams.get("category") || "all";

  const filteredProducts = useMemo(() => {
    if (activeFilter === "all") {
      return mockProducts;
    }
    return mockProducts.filter((p) => p.category === activeFilter);
  }, [activeFilter]);

  const handleFilterChange = (filterId: string) => {
    setSearchParams(filterId === "all" ? {} : { category: filterId });
  };

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
        prev.map((item) =>
          item.id === itemId ? { ...item, quantity } : item
        )
      );
    }
  };

  const handleRemoveItem = (itemId: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== itemId));
    toast.success("Produit retiré du panier");
  };

  return (
    <Layout cartCount={cartItems.length}>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-red-700 text-white py-8 md:py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-black mb-2">Notre Menu</h1>
          <p className="text-lg text-white/90">
            Découvrez toutes nos délicieuses spécialités
          </p>
        </div>
      </div>

      {/* Sticky Filter Tabs */}
      <div className="sticky top-16 z-30 bg-white border-b border-border shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex gap-2 overflow-x-auto py-3 scrollbar-hide">
            {filterOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => handleFilterChange(option.id)}
                className={`px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap transition-all duration-200 flex-shrink-0 ${
                  activeFilter === option.id
                    ? "bg-primary text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <section className="py-8 md:py-12 px-4 bg-chicken-gray">
        <div className="container mx-auto">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4 md:gap-6">
              <AnimatePresence mode="popLayout">
                {filteredProducts.map((product, idx) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: idx * 0.05 }}
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
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-foreground mb-2">
                Aucun produit
              </h3>
              <p className="text-muted-foreground">
                Aucun produit dans cette catégorie
              </p>
            </div>
          )}
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
          // This will be handled in app routing
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
