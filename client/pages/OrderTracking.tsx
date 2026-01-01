import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Clock,
  CheckCircle,
  ChefHat,
  Package,
  Truck,
  MapPin,
  Phone,
  User,
  ChevronLeft,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { orders, payments } from "@/lib/api";

interface OrderItem {
  product_name: string;
  quantity: number;
  price: number;
}

interface StatusHistoryEntry {
  status: string;
  timestamp: string;
  note: string;
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  order_type: "livraison" | "emporter";
  items: OrderItem[];
  total: number;
  created_at: string;
  customer_name: string;
  customer_phone: string;
  delivery_address?: string;
  status_history?: StatusHistoryEntry[];
  estimated_delivery_time?: string;
}

interface Payment {
  id: string;
  order_id: string;
  amount: number;
  payment_method: string;
  status: string;
  paydunya_token?: string;
  paid_at?: string;
  error_message?: string;
  created_at: string;
}

const statusConfig: Record<
  string,
  { icon: React.ReactNode; label: string; color: string; bgColor: string }
> = {
  pending: {
    icon: <Clock className="w-8 h-8" />,
    label: "En attente",
    color: "text-gray-600",
    bgColor: "bg-gray-100",
  },
  confirmed: {
    icon: <CheckCircle className="w-8 h-8" />,
    label: "Confirmée",
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  preparing: {
    icon: <ChefHat className="w-8 h-8" />,
    label: "En préparation",
    color: "text-orange-600",
    bgColor: "bg-orange-100",
  },
  ready: {
    icon: <Package className="w-8 h-8" />,
    label: "Prête",
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
  out_for_delivery: {
    icon: <Truck className="w-8 h-8" />,
    label: "En livraison",
    color: "text-indigo-600",
    bgColor: "bg-indigo-100",
  },
  delivered: {
    icon: <CheckCircle className="w-8 h-8" />,
    label: "Livrée",
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  cancelled: {
    icon: <Clock className="w-8 h-8" />,
    label: "Annulée",
    color: "text-red-600",
    bgColor: "bg-red-100",
  },
};

export default function OrderTracking() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<Order | null>(null);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load order and payment
  useEffect(() => {
    if (!orderId) {
      navigate("/orders");
      return;
    }

    const loadData = async () => {
      try {
        // Load order from API
        const { data: orderData, error: orderError } =
          await orders.get(orderId);

        if (orderError || !orderData) {
          toast.error("Commande non trouvée");
          navigate("/orders");
          return;
        }

        setOrder(orderData as any);

        // Try to load payment for this order
        try {
          const { data: paymentData } = await payments.get(
            `payment-for-order-${orderId}`,
          );
          if (paymentData) {
            setPayment(paymentData as any);
          }
        } catch (err) {
          // Payment not found is OK
          console.log("Payment not found for order");
        }
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Erreur lors du chargement");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [orderId, navigate]);

  // Setup polling for payment status
  useEffect(() => {
    if (!order || !payment) return;

    const setupPolling = () => {
      // Clean up existing interval
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }

      const pollPaymentStatus = async () => {
        try {
          // If payment has a token, verify it
          if (payment.paydunya_token) {
            const { data: statusData } = await payments.get(payment.id);
            if (statusData) {
              const updatedPayment = statusData as any;
              setPayment(updatedPayment);

              // If payment was just completed, update order
              if (
                updatedPayment.status === "completed" &&
                payment.status !== "completed"
              ) {
                toast.success(
                  "✅ Paiement confirmé ! Votre commande est en cours de préparation",
                );
                // Refresh order status
                const { data: updatedOrder } = await orders.get(orderId!);
                if (updatedOrder) {
                  setOrder(updatedOrder as any);
                }
              }
            }
          }
        } catch (error) {
          console.error("Polling error:", error);
        }
      };

      // Determine polling interval based on payment status
      let interval = 10000; // 10 seconds for confirmed
      if (payment.status === "pending" || payment.status === "processing") {
        interval = 5000; // 5 seconds for pending/processing
      }

      pollIntervalRef.current = setInterval(pollPaymentStatus, interval);
    };

    setupPolling();

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [order, payment, orderId]);

  // Handle manual payment verification
  const handleVerifyPayment = async () => {
    if (!payment?.paydunya_token) {
      toast.error("Token de paiement non disponible");
      return;
    }

    setVerifyingPayment(true);
    try {
      const response = await fetch(
        `/api/paydunya/verify/${payment.paydunya_token}`,
      );
      const data = await response.json();

      if (data.success && data.data) {
        const paymentStatus = data.data.status;
        setPayment((prev) =>
          prev ? { ...prev, status: paymentStatus } : null,
        );

        if (paymentStatus === "completed") {
          toast.success("✅ Paiement confirmé!");
          // Reload order
          const { data: updatedOrder } = await orders.get(orderId!);
          if (updatedOrder) {
            setOrder(updatedOrder as any);
          }
        } else if (paymentStatus === "pending") {
          toast.info("⏳ Le paiement est toujours en attente");
        } else if (paymentStatus === "failed") {
          toast.error("❌ Le paiement a échoué");
        }
      } else {
        toast.error("Impossible de vérifier le paiement");
      }
    } catch (error) {
      console.error("Verify payment error:", error);
      toast.error("Erreur lors de la vérification du paiement");
    } finally {
      setVerifyingPayment(false);
    }
  };

  if (loading) {
    return (
      <Layout cartCount={0}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Chargement...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!order) {
    return (
      <Layout cartCount={0}>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-foreground">
            Commande non trouvée
          </h1>
          <Link
            to="/orders"
            className="mt-4 inline-block text-primary font-semibold"
          >
            Retour aux commandes
          </Link>
        </div>
      </Layout>
    );
  }

  const currentStatusConfig = statusConfig[order.status];
  const steps =
    order.order_type === "livraison"
      ? [
          "pending",
          "confirmed",
          "preparing",
          "ready",
          "out_for_delivery",
          "delivered",
        ]
      : ["pending", "confirmed", "preparing", "ready"];

  const subtotal = order.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const deliveryFee = order.order_type === "livraison" ? 1000 : 0;

  // Check if payment is pending
  const isPending = order.status === "pending" && payment?.status === "pending";

  return (
    <Layout cartCount={0}>
      {/* Hero */}
      <div className="bg-gradient-to-r from-primary to-red-700 text-white py-8 md:py-12">
        <div className="container mx-auto px-4">
          <Link
            to="/orders"
            className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity w-fit"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="font-semibold">Mes commandes</span>
          </Link>
          <h1 className="text-3xl md:text-4xl font-black mb-2">
            Commande #{order.order_number}
          </h1>
          <p className="text-white/90">
            {new Date(order.created_at).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-chicken-gray py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {/* Left Column: Timeline */}
            <div className="md:col-span-2 space-y-6">
              {/* Payment Pending Alert */}
              {isPending && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg flex items-start gap-4"
                >
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-bold text-yellow-800">
                      ⏳ En attente de paiement
                    </h3>
                    <p className="text-sm text-yellow-700 mt-1">
                      Votre paiement n'a pas encore été confirmé. Cela peut
                      prendre quelques minutes.
                    </p>
                    <Button
                      onClick={handleVerifyPayment}
                      disabled={verifyingPayment}
                      className="mt-3 bg-yellow-600 hover:bg-yellow-700 text-white h-9 text-sm flex items-center gap-2"
                    >
                      {verifyingPayment ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Vérification...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-4 h-4" />
                          Vérifier le statut du paiement
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}

              {order.status === "cancelled" ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 text-center"
                >
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-4xl">❌</span>
                  </div>
                  <h2 className="text-2xl font-bold text-red-600 mb-2">
                    Commande Annulée
                  </h2>
                  <p className="text-red-600">
                    Cette commande a été annulée. Veuillez contacter le support
                    si vous avez des questions.
                  </p>
                </motion.div>
              ) : (
                <>
                  {/* Current Status Card */}
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`${currentStatusConfig.bgColor} rounded-2xl p-6 md:p-8`}
                  >
                    <div className="flex items-center gap-6">
                      <div
                        className="w-20 h-20 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{
                          background: currentStatusConfig.bgColor,
                        }}
                      >
                        <div className={currentStatusConfig.color}>
                          {currentStatusConfig.icon}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-foreground mb-1">
                          {currentStatusConfig.label}
                        </h3>
                        <p className="text-muted-foreground">
                          {order.estimated_delivery_time &&
                            `⏱️ Temps estimé: ${order.estimated_delivery_time}`}
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Timeline */}
                  <div className="space-y-4">
                    {steps.map((stepStatus, idx) => {
                      const stepConfig = statusConfig[stepStatus];
                      const isCompleted = steps.indexOf(order.status) >= idx;
                      const isActive = order.status === stepStatus;

                      return (
                        <motion.div
                          key={stepStatus}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="flex gap-4 relative"
                        >
                          {/* Timeline Line */}
                          {idx < steps.length - 1 && (
                            <div
                              className="absolute left-10 top-20 w-1 h-12 bg-gray-200 -z-10"
                              style={{
                                backgroundColor: isCompleted
                                  ? "hsl(var(--chicken-green))"
                                  : "hsl(var(--border))",
                              }}
                            />
                          )}

                          {/* Step Circle */}
                          <div
                            className="w-20 h-20 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300"
                            style={{
                              background: isCompleted
                                ? "hsl(var(--chicken-green))"
                                : "hsl(var(--border))",
                              border: isActive
                                ? "3px solid hsl(var(--chicken-green))"
                                : "none",
                            }}
                          >
                            <div
                              className={`${
                                isCompleted
                                  ? "text-white"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {isCompleted ? (
                                <CheckCircle className="w-8 h-8" />
                              ) : (
                                stepConfig.icon
                              )}
                            </div>
                          </div>

                          {/* Step Info */}
                          <div className="pt-2 flex-1">
                            <h4
                              className={`font-bold text-lg ${
                                isCompleted
                                  ? "text-foreground"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {stepConfig.label}
                            </h4>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Right Column: Info Cards */}
            <div className="space-y-4">
              {/* Customer Info */}
              <Card>
                <CardHeader className="flex flex-row items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  <CardTitle className="text-lg">Informations client</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-foreground">
                      {order.customer_name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-foreground">
                      {order.customer_phone}
                    </span>
                  </div>
                  {order.delivery_address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <span className="text-foreground text-sm">
                        {order.delivery_address}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Order Summary */}
              <Card>
                <CardHeader className="flex flex-row items-center gap-2">
                  <Package className="w-5 h-5 text-primary" />
                  <CardTitle className="text-lg">Résumé</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {order.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-start gap-2 text-sm"
                    >
                      <span className="text-muted-foreground">
                        {item.quantity}x {item.product_name}
                      </span>
                      <span className="font-semibold text-foreground">
                        {(item.price * item.quantity).toLocaleString()} F
                      </span>
                    </div>
                  ))}

                  <div className="pt-3 border-t border-border space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Sous-total</span>
                      <span className="text-foreground font-semibold">
                        {subtotal.toLocaleString()} F
                      </span>
                    </div>
                    {order.order_type === "livraison" && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Livraison</span>
                        <span className="text-foreground font-semibold">
                          {deliveryFee.toLocaleString()} F
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 border-t border-border">
                      <span className="font-bold">Total</span>
                      <span className="text-xl font-bold text-primary">
                        {order.total.toLocaleString()} F
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Info */}
              {payment && (
                <Card>
                  <CardHeader className="flex flex-row items-center gap-2">
                    <Package className="w-5 h-5 text-primary" />
                    <CardTitle className="text-lg">Paiement</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Méthode</span>
                      <span className="font-semibold capitalize">
                        {payment.payment_method}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Montant</span>
                      <span className="font-semibold">
                        {payment.amount.toLocaleString()} F
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Statut</span>
                      <Badge
                        variant={
                          payment.status === "completed"
                            ? "default"
                            : payment.status === "failed"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {payment.status === "completed"
                          ? "✓ Complété"
                          : payment.status === "pending"
                            ? "En attente"
                            : payment.status === "processing"
                              ? "Traitement"
                              : payment.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
