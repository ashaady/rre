import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Plus, Minus, ChevronLeft, Truck, Package } from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PaymentMethodSelector from "@/components/PaymentMethodSelector";
import { toast } from "sonner";
import { orders, payments } from "@/lib/api";

interface CartItem {
  id: string;
  product_id: string;
  product_name: string;
  price: number;
  quantity: number;
  image_url: string;
  selected_drink?: string;
}

interface CartPageProps {
  items?: CartItem[];
  onUpdateQuantity?: (itemId: string, quantity: number) => void;
  onRemoveItem?: (itemId: string) => void;
}

export default function CartPage({
  items = [],
  onUpdateQuantity = () => {},
  onRemoveItem = () => {},
}: CartPageProps) {
  const navigate = useNavigate();
  const [orderType, setOrderType] = useState<"livraison" | "emporter">(
    "livraison",
  );
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const DELIVERY_FEE = 1000;
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const deliveryFee = orderType === "livraison" ? DELIVERY_FEE : 0;
  const total = subtotal + deliveryFee;

  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    if (quantity === 0) {
      handleRemoveItem(itemId);
    } else {
      onUpdateQuantity?.(itemId, quantity);
    }
  };

  const handleRemoveItem = (itemId: string) => {
    onRemoveItem?.(itemId);
    toast.success("Produit retiré du panier");
  };

  const validateForm = () => {
    if (!name.trim()) {
      toast.error("Veuillez entrer votre nom");
      return false;
    }
    if (!phone.trim()) {
      toast.error("Veuillez entrer votre téléphone");
      return false;
    }
    if (orderType === "livraison" && !address.trim()) {
      toast.error("Veuillez entrer votre adresse de livraison");
      return false;
    }
    return true;
  };

  const handlePaymentSelect = async (method: "wave" | "orange-money") => {
    console.log("handlePaymentSelect called with method:", method);
    console.log("Current items:", items);
    console.log("Cart state - name:", name, "phone:", phone, "address:", address, "orderType:", orderType);

    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);
    try {
      // Generate order number
      const orderNumber = "CM" + Date.now().toString().slice(-8);
      console.log("Generated order number:", orderNumber);

      // Step 1: Create Order
      const orderPayload = {
        order_number: orderNumber,
        customer_name: name,
        customer_phone: phone,
        delivery_address: address,
        items: items.map((item) => ({
          product_name: item.product_name,
          quantity: item.quantity,
          price: item.price,
          selected_drink: item.selected_drink,
        })),
        total,
        order_type: orderType,
      };

      console.log("=== Creating Order ===");
      const { data: orderData, error: orderError } =
        await orders.create(orderPayload);

      console.log("Order response received:", { orderData, orderError });

      if (orderError) {
        console.error("❌ Order creation error:", orderError);
        toast.error(
          orderError.message || "Erreur lors de la création de la commande",
        );
        setIsProcessing(false);
        setPaymentOpen(false);
        return;
      }

      if (!orderData) {
        console.error("❌ Order data is empty!");
        toast.error("Erreur: pas de données de commande reçues");
        setIsProcessing(false);
        setPaymentOpen(false);
        return;
      }

      console.log("✅ Order created successfully, full response:", orderData);
      const orderId = (orderData as any).id;
      console.log("Order ID extracted:", orderId, "Type:", typeof orderId);

      if (!orderId) {
        console.error("❌ Order ID is missing! Checking structure:", {
          orderData,
          keys: Object.keys(orderData),
        });
        toast.error("Erreur: ID de commande manquant");
        setIsProcessing(false);
        setPaymentOpen(false);
        return;
      }
      console.log("✅ Order ID valid:", orderId);

      // Step 2: Create Payment
      console.log("=== Creating Payment ===");
      const paymentPayload = {
        order_id: orderId,
        amount: total,
        payment_method: method,
        customer_name: name,
        customer_phone: phone,
      };
      console.log("Payment payload:", paymentPayload);

      const { data: paymentData, error: paymentError } =
        await payments.create(paymentPayload);

      console.log("Payment response received:", { paymentData, paymentError });

      if (paymentError) {
        console.error("❌ Payment creation error:", paymentError);
        toast.error(
          paymentError.message || "Erreur lors de la création du paiement",
        );
        setIsProcessing(false);
        setPaymentOpen(false);
        return;
      }

      if (!paymentData) {
        console.error("❌ Payment data is empty!");
        toast.error("Erreur: pas de données de paiement reçues");
        setIsProcessing(false);
        setPaymentOpen(false);
        return;
      }

      console.log("✅ Payment created successfully:", paymentData);
      const paymentId = (paymentData as any).id;
      console.log("Payment ID extracted:", paymentId, "Type:", typeof paymentId);

      if (!paymentId) {
        console.error("❌ Payment ID is missing! Checking structure:", {
          paymentData,
          keys: Object.keys(paymentData),
        });
        toast.error("Erreur: ID de paiement manquant");
        setIsProcessing(false);
        setPaymentOpen(false);
        return;
      }
      console.log("✅ Payment ID valid:", paymentId);

      console.log("=== Finalizing Payment ===");

      // Store backup copy in localStorage for demo purposes
      try {
        localStorage.setItem(`order-${orderId}`, JSON.stringify(orderData));
        localStorage.setItem(`payment-${paymentId}`, JSON.stringify(paymentData));
        console.log("✅ Stored in localStorage");
      } catch (e) {
        console.warn("⚠️ localStorage failed:", e);
      }

      const paymentUrl = `/payment?order_id=${orderId}&payment_id=${paymentId}`;
      console.log("=== Ready to navigate ===", { orderId, paymentId, paymentUrl });

      toast.success("Redirection vers le paiement...");

      // Step 3: Redirect to payment page
      console.log("🔄 Navigating to:", paymentUrl);
      navigate(paymentUrl);
      console.log("✅ Navigate called successfully");
    } catch (error) {
      console.error("❌ Unexpected error in payment flow:", error);
      const message =
        error instanceof Error ? error.message : "Une erreur s'est produite";
      console.error("Error message:", message);
      console.error("Error details:", error);
      toast.error(message);
    } finally {
      console.log("=== Payment flow completed (finally block) ===");
      setIsProcessing(false);
      setPaymentOpen(false);
    }
  };

  if (items.length === 0) {
    return (
      <Layout cartCount={0}>
        <div className="bg-gradient-to-r from-primary to-red-700 text-white py-8 md:py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-2 mb-4">
              <Link
                to="/menu"
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <ChevronLeft className="w-5 h-5" />
                <span className="font-semibold">Continuer mes achats</span>
              </Link>
            </div>
            <h1 className="text-4xl md:text-5xl font-black">Mon Panier</h1>
          </div>
        </div>

        <div className="bg-chicken-gray py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-8 text-center">
              <div className="text-6xl mb-4">🛒</div>
              <h3 className="text-2xl font-bold text-foreground mb-2">
                Votre panier est vide
              </h3>
              <p className="text-muted-foreground mb-6">
                Ajoutez des produits pour commencer votre commande
              </p>
              <Link to="/menu">
                <Button className="w-full bg-primary text-white hover:bg-primary/90">
                  Voir le menu
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout cartCount={items.length}>
      {/* Hero */}
      <div className="bg-gradient-to-r from-primary to-red-700 text-white py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 mb-4">
            <Link
              to="/menu"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="font-semibold">Continuer mes achats</span>
            </Link>
          </div>
          <h1 className="text-4xl md:text-5xl font-black flex items-center gap-3">
            <ShoppingCart className="w-10 h-10" />
            Mon Panier
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-chicken-gray py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {/* Left Column: Cart Items */}
            <div className="md:col-span-2 space-y-4">
              <AnimatePresence mode="popLayout">
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    className="bg-white rounded-xl shadow-md p-4 flex gap-4"
                  >
                    {/* Image */}
                    <img
                      src={item.image_url}
                      alt={item.product_name}
                      className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                    />

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-foreground line-clamp-2">
                        {item.product_name}
                      </h3>
                      {item.selected_drink && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Boisson: {item.selected_drink}
                        </p>
                      )}
                      <p className="text-primary font-bold mt-2">
                        {item.price.toLocaleString()} F
                      </p>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 mt-3 bg-gray-100 rounded-lg w-fit">
                        <button
                          onClick={() =>
                            handleUpdateQuantity(item.id, item.quantity - 1)
                          }
                          className="p-1 hover:bg-gray-200 transition-colors"
                        >
                          <Minus className="w-4 h-4 text-gray-600" />
                        </button>
                        <span className="w-6 text-center font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            handleUpdateQuantity(item.id, item.quantity + 1)
                          }
                          className="p-1 hover:bg-gray-200 transition-colors"
                        >
                          <Plus className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    </div>

                    {/* Total & Delete */}
                    <div className="flex flex-col items-end justify-between">
                      <p className="font-bold text-foreground">
                        {(item.price * item.quantity).toLocaleString()} F
                      </p>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Right Column: Order Form */}
            <div className="space-y-4">
              {/* Order Type */}
              <Card>
                <CardHeader>
                  <CardTitle>Mode de commande</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={orderType}
                    onValueChange={(v) => setOrderType(v as any)}
                  >
                    <div className="space-y-2">
                      <Label
                        htmlFor="delivery"
                        className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-primary transition-colors"
                        style={{
                          borderColor:
                            orderType === "livraison"
                              ? "hsl(var(--primary))"
                              : undefined,
                          backgroundColor:
                            orderType === "livraison"
                              ? "hsl(var(--primary) / 0.05)"
                              : undefined,
                        }}
                      >
                        <RadioGroupItem value="livraison" id="delivery" />
                        <div className="flex items-center gap-2">
                          <Truck className="w-4 h-4" />
                          <div>
                            <p className="font-semibold">Livraison</p>
                            <p className="text-xs text-muted-foreground">
                              +1.000 F
                            </p>
                          </div>
                        </div>
                      </Label>
                      <Label
                        htmlFor="takeout"
                        className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-chicken-green transition-colors"
                        style={{
                          borderColor:
                            orderType === "emporter"
                              ? "hsl(var(--chicken-green))"
                              : undefined,
                          backgroundColor:
                            orderType === "emporter"
                              ? "hsl(var(--chicken-green) / 0.05)"
                              : undefined,
                        }}
                      >
                        <RadioGroupItem value="emporter" id="takeout" />
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4" />
                          <div>
                            <p className="font-semibold">À emporter</p>
                            <p className="text-xs text-muted-foreground">
                              Gratuit
                            </p>
                          </div>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              {/* Customer Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Vos informations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-sm font-semibold">
                      Nom complet *
                    </Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Votre nom"
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-sm font-semibold">
                      Téléphone *
                    </Label>
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="77 123 45 67"
                      className="mt-1.5"
                    />
                  </div>

                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{
                      height: orderType === "livraison" ? "auto" : 0,
                      opacity: orderType === "livraison" ? 1 : 0,
                    }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    {orderType === "livraison" && (
                      <div>
                        <Label
                          htmlFor="address"
                          className="text-sm font-semibold"
                        >
                          Adresse de livraison *
                        </Label>
                        <Input
                          id="address"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="Sicap Liberté 6, Villa 123"
                          className="mt-1.5"
                        />
                      </div>
                    )}
                  </motion.div>
                </CardContent>
              </Card>

              {/* Summary */}
              <Card>
                <CardContent className="pt-6 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Sous-total</span>
                    <span className="font-semibold">
                      {subtotal.toLocaleString()} F
                    </span>
                  </div>
                  {orderType === "livraison" && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Livraison</span>
                      <span className="font-semibold">
                        {deliveryFee.toLocaleString()} F
                      </span>
                    </div>
                  )}
                  <div className="pt-3 border-t border-border flex items-center justify-between">
                    <span className="font-bold text-lg">Total</span>
                    <span className="text-2xl font-bold text-primary">
                      {total.toLocaleString()} F
                    </span>
                  </div>

                  <Button
                    onClick={() => {
                      if (validateForm()) {
                        setPaymentOpen(true);
                      }
                    }}
                    disabled={isProcessing}
                    className="w-full h-12 bg-primary text-white hover:bg-primary/90 font-bold text-base mt-4"
                  >
                    {isProcessing ? "Traitement..." : "Procéder au paiement"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Method Selector */}
      <PaymentMethodSelector
        open={paymentOpen}
        total={total}
        isLoading={isProcessing}
        onSelect={handlePaymentSelect}
        onCancel={() => setPaymentOpen(false)}
      />
    </Layout>
  );
}

function ShoppingCart({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}
