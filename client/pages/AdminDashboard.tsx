import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3,
  Clock,
  TrendingUp,
  Timer,
  Download,
  Phone,
  MessageCircle,
  Check,
  X,
  LogOut,
} from "lucide-react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

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
  delivery_address?: string;
}

// Mock orders for admin dashboard
const mockOrders: Order[] = [
  {
    id: "order-1",
    orderNumber: "CM12345678",
    status: "ready",
    orderType: "livraison",
    items: [
      { product_name: "Menu Classique", quantity: 1, price: 4500 },
      { product_name: "Frites Sauce", quantity: 1, price: 1500 },
    ],
    total: 7000,
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    customer_name: "Amadou Diop",
    customer_phone: "77 123 45 67",
    delivery_address: "Sicap Liberté 6",
  },
  {
    id: "order-2",
    orderNumber: "CM87654321",
    status: "preparing",
    orderType: "emporter",
    items: [
      { product_name: "Double Chicken", quantity: 2, price: 4500 },
    ],
    total: 9000,
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
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
    createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    customer_name: "Cheikh Ba",
    customer_phone: "76 111 22 33",
    delivery_address: "Mermoz",
  },
  {
    id: "order-4",
    orderNumber: "CM44444444",
    status: "confirmed",
    orderType: "emporter",
    items: [
      { product_name: "Chicken Burger Master", quantity: 3, price: 3500 },
      { product_name: "Frites Classiques", quantity: 2, price: 1000 },
    ],
    total: 12500,
    createdAt: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
    customer_name: "Mariam Ndiaye",
    customer_phone: "70 555 66 77",
  },
];

const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  pending: { label: "En attente", color: "bg-gray-100", bgColor: "text-gray-700" },
  confirmed: { label: "Confirmée", color: "bg-blue-100", bgColor: "text-blue-700" },
  preparing: { label: "En préparation", color: "bg-orange-100", bgColor: "text-orange-700" },
  ready: { label: "Prête", color: "bg-purple-100", bgColor: "text-purple-700" },
  out_for_delivery: { label: "En livraison", color: "bg-indigo-100", bgColor: "text-indigo-700" },
  delivered: { label: "Livrée", color: "bg-green-100", bgColor: "text-green-700" },
  cancelled: { label: "Annulée", color: "bg-red-100", bgColor: "text-red-700" },
};

const nextStatusMap: Record<string, string> = {
  pending: "confirmed",
  confirmed: "preparing",
  preparing: "ready",
  ready: "out_for_delivery",
  out_for_delivery: "delivered",
};

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Calculate stats
  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const ordersToday = orders.filter(
      (o) => new Date(o.createdAt) >= today
    );

    const activeOrders = orders.filter(
      (o) => !["delivered", "cancelled"].includes(o.status)
    );

    const revenue = ordersToday.reduce((sum, o) => sum + o.total, 0);

    return {
      total: ordersToday.length,
      active: activeOrders.length,
      revenue,
      averageTime: "28 min",
    };
  }, [orders]);

  // Filter orders
  const filteredOrders = useMemo(() => {
    switch (selectedFilter) {
      case "pending":
        return orders.filter((o) => o.status === "pending");
      case "preparing":
        return orders.filter((o) => ["confirmed", "preparing"].includes(o.status));
      case "ready":
        return orders.filter((o) => o.status === "ready");
      case "delivery":
        return orders.filter((o) => o.status === "out_for_delivery");
      case "completed":
        return orders.filter((o) => ["delivered", "cancelled"].includes(o.status));
      default:
        return orders;
    }
  }, [orders, selectedFilter]);

  // Get filter counts
  const filterCounts = useMemo(() => {
    return {
      all: orders.length,
      pending: orders.filter((o) => o.status === "pending").length,
      preparing: orders.filter((o) => ["confirmed", "preparing"].includes(o.status)).length,
      ready: orders.filter((o) => o.status === "ready").length,
      delivery: orders.filter((o) => o.status === "out_for_delivery").length,
      completed: orders.filter((o) => ["delivered", "cancelled"].includes(o.status)).length,
    };
  }, [orders]);

  const handleStatusUpdate = (orderId: string, newStatus: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, status: newStatus as any } : o
      )
    );
    setSelectedOrder(null);
    toast.success(`Commande mise à jour - ${statusConfig[newStatus].label}`);
  };

  const handleExportCSV = () => {
    const headers = ["N°", "Client", "Téléphone", "Type", "Total", "Statut", "Heure"];
    const rows = filteredOrders.map((o) => [
      o.orderNumber,
      o.customer_name,
      o.customer_phone,
      o.orderType === "livraison" ? "Livraison" : "À emporter",
      `${o.total} F`,
      statusConfig[o.status].label,
      new Date(o.createdAt).toLocaleTimeString("fr-FR"),
    ]);

    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  return (
    <Layout cartCount={0}>
      {/* Header */}
      <div className="bg-chicken-navy text-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                <span className="text-lg">🍗</span>
              </div>
              <h1 className="text-3xl font-black">Dashboard Admin</h1>
              <div className="flex items-center gap-2 ml-4 px-3 py-1 bg-white/10 rounded-full">
                <div className="w-2 h-2 bg-chicken-green rounded-full animate-pulse" />
                <span className="text-sm font-semibold">Commandes en direct</span>
              </div>
            </div>
            <Button variant="outline" className="text-white border-white hover:bg-white/10">
              <LogOut className="w-4 h-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-chicken-gray py-6 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                title: "Commandes du jour",
                value: stats.total,
                icon: <BarChart3 className="w-6 h-6" />,
                color: "from-blue-500 to-blue-600",
              },
              {
                title: "En cours",
                value: stats.active,
                icon: <Clock className="w-6 h-6" />,
                color: "from-orange-500 to-orange-600",
              },
              {
                title: "Chiffre d'affaires",
                value: `${stats.revenue.toLocaleString()} F`,
                icon: <TrendingUp className="w-6 h-6" />,
                color: "from-green-500 to-green-600",
              },
              {
                title: "Temps moyen",
                value: stats.averageTime,
                icon: <Timer className="w-6 h-6" />,
                color: "from-purple-500 to-purple-600",
              },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className={`bg-gradient-to-br ${stat.color} p-3 rounded-lg w-fit mb-3`}>
                      <div className="text-white">{stat.icon}</div>
                    </div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold text-foreground mt-1">
                      {stat.value}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Orders Management */}
      <div className="bg-white py-6">
        <div className="container mx-auto px-4">
          {/* Filters */}
          <div className="mb-6 flex items-center justify-between">
            <Tabs value={selectedFilter} onValueChange={setSelectedFilter}>
              <TabsList className="grid grid-cols-3 md:grid-cols-6">
                {[
                  { id: "all", label: "Toutes" },
                  { id: "pending", label: "Nouvelles" },
                  { id: "preparing", label: "Préparation" },
                  { id: "ready", label: "Prêtes" },
                  { id: "delivery", label: "Livraison" },
                  { id: "completed", label: "Terminées" },
                ].map((tab) => (
                  <TabsTrigger key={tab.id} value={tab.id} className="relative">
                    {tab.label}
                    {filterCounts[tab.id as keyof typeof filterCounts] > 0 && (
                      <Badge className="ml-2 bg-primary text-white">
                        {filterCounts[tab.id as keyof typeof filterCounts]}
                      </Badge>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            <Button
              onClick={handleExportCSV}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
          </div>

          {/* Orders Table/Cards */}
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order, idx) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card
                      className="cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between gap-4 flex-wrap">
                          {/* Order Number */}
                          <div className="min-w-0">
                            <p className="font-bold text-foreground">
                              #{order.orderNumber}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(order.createdAt).toLocaleTimeString("fr-FR")}
                            </p>
                          </div>

                          {/* Customer */}
                          <div className="min-w-0">
                            <p className="font-semibold text-foreground">
                              {order.customer_name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {order.customer_phone}
                            </p>
                          </div>

                          {/* Type */}
                          <div>
                            <Badge
                              variant="outline"
                              className={order.orderType === "livraison" ? "bg-blue-50" : "bg-green-50"}
                            >
                              {order.orderType === "livraison" ? "🚚 Livraison" : "📦 À emporter"}
                            </Badge>
                          </div>

                          {/* Total */}
                          <div className="text-right">
                            <p className="text-lg font-bold text-primary">
                              {order.total.toLocaleString()} F
                            </p>
                          </div>

                          {/* Status */}
                          <div>
                            <Badge className={statusConfig[order.status].color}>
                              <span className={statusConfig[order.status].bgColor}>
                                {statusConfig[order.status].label}
                              </span>
                            </Badge>
                          </div>

                          {/* Quick Actions */}
                          <div className="flex gap-2">
                            {order.status !== "delivered" && order.status !== "cancelled" && (
                              <Button
                                size="sm"
                                className="bg-primary hover:bg-primary/90"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const next = nextStatusMap[order.status];
                                  if (next) handleStatusUpdate(order.id, next);
                                }}
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Aucune commande dans ce filtre</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white border-b border-border p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">
                Commande #{selectedOrder.orderNumber}
              </h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left Column */}
              <div className="md:col-span-2 space-y-6">
                {/* Order Info */}
                <div>
                  <h3 className="font-bold text-lg mb-3">Informations commande</h3>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="text-muted-foreground">Statut :</span>{" "}
                      <Badge className={statusConfig[selectedOrder.status].color}>
                        <span className={statusConfig[selectedOrder.status].bgColor}>
                          {statusConfig[selectedOrder.status].label}
                        </span>
                      </Badge>
                    </p>
                    <p>
                      <span className="text-muted-foreground">Type :</span>{" "}
                      {selectedOrder.orderType === "livraison" ? "🚚 Livraison" : "📦 À emporter"}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Date/Heure :</span>{" "}
                      {new Date(selectedOrder.createdAt).toLocaleString("fr-FR")}
                    </p>
                  </div>
                </div>

                {/* Items */}
                <div>
                  <h3 className="font-bold text-lg mb-3">Articles</h3>
                  <div className="space-y-2 border-l-2 border-primary pl-4">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span>
                          {item.quantity}x {item.product_name}
                        </span>
                        <span className="font-semibold">
                          {(item.price * item.quantity).toLocaleString()} F
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Customer Info */}
                <div>
                  <h3 className="font-bold text-lg mb-3">Client</h3>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="text-muted-foreground">Nom :</span>{" "}
                      {selectedOrder.customer_name}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Téléphone :</span>{" "}
                      {selectedOrder.customer_phone}
                    </p>
                    {selectedOrder.delivery_address && (
                      <p>
                        <span className="text-muted-foreground">Adresse :</span>{" "}
                        {selectedOrder.delivery_address}
                      </p>
                    )}
                  </div>
                </div>

                {/* Total */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Total</p>
                  <p className="text-3xl font-bold text-primary">
                    {selectedOrder.total.toLocaleString()} F
                  </p>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <a
                    href={`tel:${selectedOrder.customer_phone}`}
                    className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-semibold transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    Appeler
                  </a>
                  <a
                    href={`https://wa.me/${selectedOrder.customer_phone.replace(/\s/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-semibold transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp
                  </a>

                  {selectedOrder.status !== "delivered" && selectedOrder.status !== "cancelled" && (
                    <Button
                      onClick={() => {
                        const next = nextStatusMap[selectedOrder.status];
                        if (next) handleStatusUpdate(selectedOrder.id, next);
                      }}
                      className="w-full bg-primary text-white hover:bg-primary/90"
                    >
                      Étape suivante
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </Layout>
  );
}
