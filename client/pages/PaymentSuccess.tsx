import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, Home, Package } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PaymentSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-redirect to home after 8 seconds
    const timer = setTimeout(() => {
      navigate("/");
    }, 8000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
          >
            <CheckCircle className="w-24 h-24 text-green-500" />
          </motion.div>
        </div>

        {/* Success Message */}
        <div className="bg-white rounded-3xl shadow-xl p-8 text-center mb-6">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-black text-green-600 mb-3"
          >
            Paiement réussi! 🎉
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-foreground mb-2"
          >
            Merci pour votre commande!
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-muted-foreground mb-6"
          >
            Votre commande est confirmée et sera préparée dès que possible.
          </motion.p>

          {/* Order Details */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-green-50 rounded-2xl p-4 mb-6 border border-green-200"
          >
            <div className="flex items-center justify-center gap-2 text-green-700">
              <Package className="w-5 h-5" />
              <p className="text-sm font-semibold">
                Vous recevrez bientôt un SMS de confirmation
              </p>
            </div>
          </motion.div>

          {/* Info Messages */}
          <div className="space-y-3 mb-8 text-sm">
            <div className="text-muted-foreground">
              <p className="font-semibold text-foreground mb-1">
                ✓ Paiement effectué
              </p>
              <p>Votre transaction a été traitée avec succès par PayTech</p>
            </div>
            <div className="text-muted-foreground">
              <p className="font-semibold text-foreground mb-1">
                ✓ Commande confirmée
              </p>
              <p>Nous commençons à préparer votre commande</p>
            </div>
            <div className="text-muted-foreground">
              <p className="font-semibold text-foreground mb-1">
                ✓ Suivi disponible
              </p>
              <p>Vous pouvez suivre votre commande dans l'onglet "Commandes"</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={() => navigate("/orders")}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold h-12 rounded-xl flex items-center justify-center gap-2"
          >
            <Package className="w-5 h-5" />
            Suivi de ma commande
          </Button>

          <Button
            onClick={() => navigate("/")}
            variant="outline"
            className="w-full h-12 rounded-xl flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            Retour à l'accueil
          </Button>
        </div>

        {/* Auto-redirect notice */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-xs text-muted-foreground mt-6"
        >
          Redirection automatique vers l'accueil dans quelques secondes...
        </motion.p>
      </motion.div>
    </div>
  );
}
