import { useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { orders } from "@/lib/api";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get("order_id");

  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load order to get order number
    const loadOrder = async () => {
      // If no orderId (PayTech redirect without params), just show success
      if (!orderId) {
        setOrderNumber(null);
        setIsLoading(false);
        return;
      }

      try {
        const { data: orderData, error } = await orders.get(orderId);
        if (error || !orderData) {
          toast.error("Commande non trouvée");
          // Don't navigate, still show success page
          setOrderNumber(null);
          setIsLoading(false);
          return;
        }
        setOrderNumber((orderData as any).order_number);
      } catch (err) {
        console.error("Error loading order:", err);
        toast.error("Erreur lors du chargement de la commande");
        setOrderNumber(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadOrder();
  }, [orderId, navigate]);

  useEffect(() => {
    // Show success toast
    toast.success("✅ Paiement effectué avec succès!");

    // Trigger confetti effect (optional)
    launchConfetti();

    // Clear cart data from localStorage
    const clearCart = () => {
      // Remove all cart-related items from localStorage
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith("cart-") || key === "cartItems") {
          localStorage.removeItem(key);
        }
      });
    };
    clearCart();
  }, []);

  // Simple confetti effect using CSS animations
  const launchConfetti = () => {
    const confetti = document.createElement("div");
    confetti.innerHTML = "🎉";
    confetti.style.position = "fixed";
    confetti.style.fontSize = "2rem";
    confetti.style.left = Math.random() * 100 + "%";
    confetti.style.top = "0";
    confetti.style.animation = `fall ${2 + Math.random() * 1}s linear forwards`;
    confetti.style.pointerEvents = "none";
    confetti.style.zIndex = "50";
    document.body.appendChild(confetti);

    setTimeout(() => confetti.remove(), 3000);

    // Add multiple confetti
    for (let i = 0; i < 10; i++) {
      setTimeout(() => {
        const newConfetti = confetti.cloneNode(true) as HTMLElement;
        newConfetti.style.left = Math.random() * 100 + "%";
        document.body.appendChild(newConfetti);
        setTimeout(() => newConfetti.remove(), 3000);
      }, i * 100);
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

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <style>{`
        @keyframes fall {
          to {
            transform: translateY(100vh) rotateZ(360deg);
            opacity: 0;
          }
        }
      `}</style>

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center"
      >
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
          className="w-20 h-20 bg-green-100 rounded-full mx-auto mb-6 flex items-center justify-center"
        >
          <CheckCircle className="w-12 h-12 text-green-600" />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-black text-foreground mb-3"
        >
          Paiement réussi !
        </motion.h1>

        {/* Main Message */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-6"
        >
          {orderNumber ? (
            <>
              <p className="text-foreground mb-2">
                Votre commande{" "}
                <span className="font-bold text-primary">#{orderNumber}</span> a
                été confirmée
              </p>
              <p className="text-sm text-muted-foreground">
                Vous recevrez une notification à chaque étape
              </p>
            </>
          ) : (
            <>
              <p className="text-foreground mb-2">
                Votre paiement a été accepté avec succès
              </p>
              <p className="text-sm text-muted-foreground">
                Nous traitons votre commande et vous enverrons les détails par SMS
              </p>
            </>
          )}
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-3"
        >
          {orderId && (
            <Link to={`/order/${orderId}`} className="block w-full">
              <Button className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-all">
                Suivre ma commande
              </Button>
            </Link>
          )}

          <Link to="/" className="block w-full">
            <Button
              variant="outline"
              className="w-full h-12 font-bold rounded-lg border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Retour à l'accueil
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
