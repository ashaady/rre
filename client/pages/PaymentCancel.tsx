import { useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { XCircle, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { orders, payments } from "@/lib/api";

export default function PaymentCancel() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const orderId = searchParams.get("order_id");
  const paymentId = searchParams.get("payment_id");

  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Show cancel toast
    toast.error("❌ Paiement annulé");

    // Load order to get order number
    const loadOrder = async () => {
      // If no orderId (PayTech redirect without params), still show cancel page
      if (!orderId) {
        setOrderNumber(null);
        setIsLoading(false);
        return;
      }

      try {
        const { data: orderData, error } = await orders.get(orderId);
        if (error || !orderData) {
          // Don't navigate, still show cancel page
          setOrderNumber(null);
          setIsLoading(false);
          return;
        }
        setOrderNumber((orderData as any).order_number);

        // Update payment status to cancelled (if paymentId available)
        if (paymentId) {
          await payments.update(paymentId, {
            status: "cancelled",
            error_message: "Paiement annulé par l'utilisateur",
          });
        }
      } catch (err) {
        console.error("Error loading order:", err);
        toast.error("Erreur lors du chargement de la commande");
        setOrderNumber(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadOrder();
  }, [orderId, paymentId, navigate]);

  const retryPaymentUrl =
    orderId && paymentId
      ? `/payment?order_id=${orderId}&payment_id=${paymentId}`
      : "/menu";

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
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center"
      >
        {/* Cancel Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
          className="w-20 h-20 bg-orange-100 rounded-full mx-auto mb-6 flex items-center justify-center"
        >
          <XCircle className="w-12 h-12 text-orange-600" />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-black text-foreground mb-3"
        >
          Paiement annulé
        </motion.h1>

        {/* Main Message */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-6"
        >
          <p className="text-foreground mb-2">Vous avez annulé le paiement</p>
          <p className="text-sm text-muted-foreground">
            {orderNumber ? (
              <>
                Votre commande{" "}
                <span className="font-bold text-primary">#{orderNumber}</span> est
                toujours en attente. Vous pouvez réessayer le paiement.
              </>
            ) : (
              <>Votre paiement a été annulé. Vous pouvez retenter le paiement à tout moment.</>
            )}
          </p>
        </motion.div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-6 text-left"
        >
          <p className="text-xs text-orange-700">
            ⚠️ Si vous avez été débité, le montant sera remboursé dans 24-48
            heures
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-3"
        >
          {orderId && paymentId && (
            <Link to={retryPaymentUrl} className="block w-full">
              <Button className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-all">
                Réessayer le paiement
              </Button>
            </Link>
          )}

          <Link to="/menu" className="block w-full">
            <Button
              variant="outline"
              className="w-full h-12 font-bold rounded-lg border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Continuer vos achats
            </Button>
          </Link>

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
