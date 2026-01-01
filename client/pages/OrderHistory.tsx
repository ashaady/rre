import { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Filter } from "lucide-react";
import Layout from "@/components/Layout";
import OrderCard from "@/components/OrderCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";

interface OrderItem {
  product_name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  orderNumber: string;
  status: "pending" | "confirmed" | "preparing" | "ready" | "out_for_delivery" | "delivered" | "cancelled";
  orderType: "livraison" | "emporter";
  items: OrderItem[];
  total: number;
  createdAt: string;
  customer_name: string;
  customer_phone: string;
}

// Mock orders for demo
const mockOrders: Order[] = [
  {
    id: "order-1",
    orderNumber: "CM12345678",
    status: "delivered",
    orderType: "livraison",
    items: [
      { product_name: "Menu Classique", quantity: 1, price: 4500 },
      { product_name: "Frites Sauce", quantity: 1, price: 1500 },
    ],
    total: 7000,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    customer_name: "Amadou Diop",
    customer_phone: "77 123 45 67",
  },
  {
    id: "order-2",
    orderNumber: "CM87654321",
    status: "ready",
    orderType: "emporter",
    items: [
      { product_name: "Double Chicken", quantity: 2, price: 4500 },
    ],
    total: 9000,
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    customer_name: "Fatou Sall",
    customer_phone: "78 987 65 43",
  },
  {
    id: "order-3",
    orderNumber: "CM55555555",
    status: "pending",
    orderType: "livraison",
    items: [
      { product_name: "Menu Famille", quantity: 1, price: 12000 },
    ],
    total: 13000,
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    customer_name: "Cheikh Ba",
    customer_phone: "76 111 22 33",
  },
  {
    id: "order-4",
    orderNumber: "CM44444444",
    status: "preparing",
    orderType: "emporter",
    items: [
      { product_name: "Chicken Burger Master", quantity: 3, price: 3500 },
      { product_name: "Frites Classiques", quantity: 2, price: 1000 },
    ],
    total: 12500,
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    customer_name: "Mariam Ndiaye",
    customer_phone: "70 555 66 77",
  },
];

export default function OrderHistory() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");

  const filteredOrders = useMemo(() => {
    if (activeTab === "all") {
      return mockOrders;
    }
    if (activeTab === "active") {
      return mockOrders.filter(
        (o) => !["delivered", "cancelled"].includes(o.status)
      );
    }
    if (activeTab === "completed") {
      return mockOrders.filter((o) => ["delivered", "cancelled"].includes(o.status));
    }
    return mockOrders.filter((o) => o.status === activeTab);
  }, [activeTab]);

  return (
    <Layout cartCount={0}>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-red-700 text-white py-8 md:py-12">
        <div className="container mx-auto px-4">
          <Link
            to="/"
            className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity w-fit"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="font-semibold">Retour à l'accueil</span>
          </Link>
          <h1 className="text-4xl md:text-5xl font-black flex items-center gap-3">
            <span>📋</span>
            Mes Commandes
          </h1>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="font-semibold text-sm">Filtrer par statut</span>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 md:grid-cols-5 w-full">
              <TabsTrigger value="all" className="text-xs md:text-sm">
                Toutes
              </TabsTrigger>
              <TabsTrigger value="active" className="text-xs md:text-sm">
                En cours
              </TabsTrigger>
              <TabsTrigger value="completed" className="text-xs md:text-sm">
                Terminées
              </TabsTrigger>
              <TabsTrigger value="preparing" className="text-xs md:text-sm hidden md:inline-flex">
                Préparation
              </TabsTrigger>
              <TabsTrigger value="out_for_delivery" className="text-xs md:text-sm hidden md:inline-flex">
                Livraison
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Orders List */}
      <section className="bg-chicken-gray py-8 md:py-12">
        <div className="container mx-auto px-4">
          {filteredOrders.length > 0 ? (
            <div className="space-y-4 max-w-4xl mx-auto">
              <AnimatePresence mode="popLayout">
                {filteredOrders.map((order, idx) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => navigate(`/order/${order.id}`)}
                  >
                    <OrderCard
                      id={order.id}
                      orderNumber={order.orderNumber}
                      status={order.status}
                      orderType={order.orderType}
                      items={order.items}
                      total={order.total}
                      createdAt={order.createdAt}
                      onClick={() => navigate(`/order/${order.id}`)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center max-w-md mx-auto">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-2xl font-bold text-foreground mb-2">
                Aucune commande
              </h3>
              <p className="text-muted-foreground mb-6">
                Vous n'avez aucune commande avec ce statut
              </p>
              <Link to="/menu">
                <button className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors">
                  Passer une commande
                </button>
              </Link>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
