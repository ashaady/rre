import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, Loader, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { orders, payments } from "@/lib/api";

interface OrderItem {
  product_name: string;
  quantity: number;
  price: number;
  selected_drink?: string;
}

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  items: OrderItem[];
  total: number;
  order_type: "livraison" | "emporter";
  delivery_address?: string;
}

interface Payment {
  id: string;
  order_id: string;
  amount: number;
  payment_method: "wave" | "orange-money";
  status: string;
}

export default function PaymentPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const orderId = searchParams.get("order_id");
  const paymentId = searchParams.get("payment_id");

  const [order, setOrder] = useState<Order | null>(null);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [fullName, setFullName] = useState<string>("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<"wave" | "orange-money">("wave");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load order and payment data
  useEffect(() => {
    const loadData = async () => {
      console.log("Payment page loaded with params:", { orderId, paymentId });
      if (!orderId || !paymentId) {
        console.error("Missing parameters!");
        toast.error("Paramètres manquants");
        navigate("/");
        return;
      }

      try {
        // Load order
        const { data: orderData, error: orderError } =
          await orders.get(orderId);
        console.log("Payment page - Order fetch response:", {
          orderData,
          orderError,
          orderId,
        });
        if (orderError || !orderData) {
          toast.error("Commande non trouvée");
          navigate("/");
          return;
        }
        setOrder(orderData as any);

        // Load payment
        const { data: paymentData, error: paymentError } =
          await payments.get(paymentId);
        console.log("Payment page - Payment fetch response:", {
          paymentData,
          paymentError,
          paymentId,
        });
        if (paymentError || !paymentData) {
          toast.error("Enregistrement de paiement non trouvé");
          navigate("/");
          return;
        }
        setPayment(paymentData as any);
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Erreur lors du chargement des données");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [orderId, paymentId, navigate]);

  const handlePayment = async () => {
    if (!order || !payment) {
      toast.error("Données manquantes");
      return;
    }

    // Validate required fields
    if (!phoneNumber.trim() || !fullName.trim()) {
      toast.error("Veuillez entrer votre numéro et votre nom complet");
      return;
    }

    setIsProcessing(true);

    try {
      // PayTech payment flow
      const paymentInitPayload = {
        item_name: `Commande ${order.order_number}`,
        item_price: order.total,
        command_name: `Commande de nourriture - ${order.items.map((i) => i.product_name).join(", ")}`,
        target_payment: "Orange Money",
        phone_number: phoneNumber.startsWith("+")
          ? phoneNumber
          : `+221${phoneNumber}`,
        full_name: fullName,
        custom_field: {
          order_id: order.id,
          user_id: `user_${Date.now()}`,
          email: "",
        },
      };

      console.log("Sending PayTech payment request:", paymentInitPayload);

      // Create payment via API
      const response = await fetch(
        "https://unskeptical-unmournfully-fawn.ngrok-free.app/api/paytech/create-payment",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(paymentInitPayload),
        },
      );

      const paymentResult = await response.json();
      console.log("PayTech response:", paymentResult);

      if (!response.ok || !paymentResult.success) {
        const errorMsg =
          paymentResult.message ||
          paymentResult.error ||
          "Erreur lors de l'initialisation du paiement PayTech";
        toast.error(`❌ ${errorMsg}`);
        setIsProcessing(false);
        return;
      }

      // Show success message
      toast.success("✅ Redirection vers PayTech...");

      // Wait a moment then redirect to PayTech
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const redirectUrl = paymentResult.redirect_url;
      if (redirectUrl) {
        // Update payment status
        await payments.update(payment.id, {
          status: "processing",
        });

        // Redirect to PayTech payment page
        window.location.href = redirectUrl;
      } else {
        toast.error("❌ URL de paiement non reçue");
        setIsProcessing(false);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Une erreur s'est produite";
      console.error("Payment error:", error);
      toast.error(`❌ Erreur: ${message}`);
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!order || !payment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Commande non trouvée
          </h1>
          <Button
            onClick={() => navigate("/")}
            className="mt-4 bg-primary text-white"
          >
            Retour à l'accueil
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm py-6 border-b border-border">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl">🍗</span>
          </div>
          <h1 className="text-xl font-black text-chicken-navy">
            CHICKEN MASTER
          </h1>
          <p className="text-sm text-muted-foreground">
            Finalisation du paiement
          </p>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Order Summary */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-6"
        >
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Récapitulatif commande
          </h2>

          <div className="space-y-3 mb-6 pb-6 border-b border-border">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Commande N°</span>
              <span className="font-bold text-red-600">
                {order.order_number}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Client</span>
              <span className="font-semibold">{order.customer_name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Type</span>
              <span className="font-semibold">
                {order.order_type === "livraison"
                  ? "🚚 Livraison"
                  : "📦 À emporter"}
              </span>
            </div>
          </div>

          {/* Items */}
          <div className="space-y-2 mb-6 pb-6 border-b border-border">
            {order.items.map((item, idx) => (
              <div key={idx} className="text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {item.quantity}x {item.product_name}
                  </span>
                  <span className="font-semibold">
                    {(item.price * item.quantity).toLocaleString()} F
                  </span>
                </div>
                {item.selected_drink && (
                  <div className="text-xs text-muted-foreground ml-4 mt-0.5">
                    (Boisson: {item.selected_drink})
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="space-y-2 mb-6 pb-6 border-b-2 border-gray-900">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Sous-total</span>
              <span className="font-semibold">
                {order.items
                  .reduce((sum, item) => sum + item.price * item.quantity, 0)
                  .toLocaleString()}{" "}
                F
              </span>
            </div>
            {order.order_type === "livraison" && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Frais de livraison
                </span>
                <span className="font-semibold">1.000 F</span>
              </div>
            )}
          </div>

          {/* Total */}
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-foreground">Total</span>
            <span className="text-4xl font-black text-primary">
              {order.total.toLocaleString()} F
            </span>
          </div>
        </motion.div>

        {/* Payment Information Form */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-6"
        >
          <h2 className="text-lg font-bold text-foreground mb-4">
            Vos informations de contact
          </h2>

          <div className="space-y-4">
            <div>
              <Label
                htmlFor="fullName"
                className="block text-sm font-semibold mb-2 text-foreground"
              >
                Nom complet
              </Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Ex: Moustapha Fall"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-600"
              />
            </div>

            <div>
              <Label
                htmlFor="phoneNumber"
                className="block text-sm font-semibold mb-2 text-foreground"
              >
                Numéro de téléphone
              </Label>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="Ex: +221768887766 ou 768887766"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-600"
              />
              <p className="text-xs text-muted-foreground mt-1">
                ℹ️ Incluez l'indicatif pays (+221 pour le Sénégal) ou nous
                l'ajouterons automatiquement
              </p>
            </div>
          </div>
        </motion.div>

        {/* Payment Methods Selection */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-6"
        >
          <h2 className="text-lg font-bold text-foreground mb-4">
            Choisir un moyen de paiement
          </h2>

          <div className="grid grid-cols-2 gap-4">
            {/* Wave Payment Method */}
            <div
              onClick={() => setSelectedPaymentMethod("wave")}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                selectedPaymentMethod === "wave"
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-200 bg-gray-50 hover:border-blue-300"
              }`}
            >
              <div className="flex items-center justify-center mb-3">
                <img
                  src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 80'%3E%3Crect fill='%23007AFF' width='200' height='80' rx='10'/%3E%3Ctext x='50%' y='50%' font-family='Arial,sans-serif' font-size='28' font-weight='bold' fill='white' text-anchor='middle' dominant-baseline='central'%3EWAVE%3C/text%3E%3C/svg%3E"
                  alt="Wave"
                  className="h-12"
                />
              </div>
              <p className="text-sm font-semibold text-center text-foreground">
                Wave
              </p>
              <p className="text-xs text-muted-foreground text-center mt-1">
                Paiement mobile
              </p>
            </div>

            {/* Orange Money Payment Method */}
            <div
              onClick={() => setSelectedPaymentMethod("orange-money")}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                selectedPaymentMethod === "orange-money"
                  ? "border-orange-600 bg-orange-50"
                  : "border-gray-200 bg-gray-50 hover:border-orange-300"
              }`}
            >
              <div className="flex items-center justify-center mb-3">
                <img
                  src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 80'%3E%3Crect fill='%23FF6600' width='200' height='80' rx='10'/%3E%3Ctext x='50%' y='50%' font-family='Arial,sans-serif' font-size='20' font-weight='bold' fill='white' text-anchor='middle' dominant-baseline='central'%3EORANGE%3C/text%3E%3C/svg%3E"
                  alt="Orange Money"
                  className="h-12"
                />
              </div>
              <p className="text-sm font-semibold text-center text-foreground">
                Orange Money
              </p>
              <p className="text-xs text-muted-foreground text-center mt-1">
                Portefeuille Orange
              </p>
            </div>
          </div>
        </motion.div>

        {/* Security Notice */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="bg-green-50 border border-green-200 rounded-3xl p-4 mb-6 flex items-start gap-3"
        >
          <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-green-900">
              🛡️ Paiement 100% sécurisé
            </p>
            <p className="text-sm text-green-700 mt-1">
              Vos données sont protégées et cryptées. Vous serez redirigé vers
              PayTech pour compléter votre paiement.
            </p>
          </div>
        </motion.div>

        {/* Payment Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Button
            onClick={handlePayment}
            disabled={isProcessing || !phoneNumber.trim() || !fullName.trim()}
            className="w-full h-16 bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-lg flex items-center justify-center gap-2 rounded-xl transition-all"
          >
            {isProcessing ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Redirection sécurisée...
              </>
            ) : (
              <>
                <Lock className="w-5 h-5" />
                Payer {order.total.toLocaleString()} F
              </>
            )}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
