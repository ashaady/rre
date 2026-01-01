import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertCircle, Home, RotateCcw, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PaymentCancel() {
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-redirect to cart after 10 seconds
    const timer = setTimeout(() => {
      navigate("/");
    }, 10000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        {/* Cancel Icon */}
        <div className="flex justify-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
          >
            <AlertCircle className="w-24 h-24 text-orange-500" />
          </motion.div>
        </div>

        {/* Cancel Message */}
        <div className="bg-white rounded-3xl shadow-xl p-8 text-center mb-6">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-black text-orange-600 mb-3"
          >
            Paiement annulé
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-foreground mb-2"
          >
            Vous pouvez réessayer
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-muted-foreground mb-6"
          >
            Votre paiement a été annulé. Votre commande n'a pas été confirmée.
          </motion.p>

          {/* Information Box */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-orange-50 rounded-2xl p-4 mb-6 border border-orange-200"
          >
            <div className="text-left space-y-2 text-sm text-muted-foreground">
              <p>
                <span className="font-semibold text-foreground">
                  Que s'est-il passé?
                </span>
              </p>
              <p>
                Vous avez annulé le paiement sur la plateforme PayTech. Vous
                pouvez à tout moment reprendre votre commande.
              </p>
            </div>
          </motion.div>

          {/* Why might this happen */}
          <div className="text-left bg-gray-50 rounded-2xl p-4 mb-6 border border-gray-200">
            <p className="font-semibold text-foreground text-sm mb-3">
              Autres raisons possibles:
            </p>
            <ul className="text-xs text-muted-foreground space-y-2">
              <li>✓ Solde insuffisant sur votre Orange Money</li>
              <li>✓ Erreur de numéro de téléphone</li>
              <li>✓ Problème de connexion réseau</li>
              <li>✓ Timeout du paiement</li>
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={() => window.history.back()}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold h-12 rounded-xl flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            Réessayer le paiement
          </Button>

          <Button
            onClick={() => navigate("/")}
            variant="outline"
            className="w-full h-12 rounded-xl flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            Retour à l'accueil
          </Button>

          <Button
            onClick={() => navigate("/")}
            variant="ghost"
            className="w-full h-12 rounded-xl flex items-center justify-center gap-2 text-muted-foreground"
          >
            <ShoppingCart className="w-5 h-5" />
            Consulter mon panier
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

        {/* Support hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl text-center"
        >
          <p className="text-xs text-blue-900">
            <span className="font-semibold">Besoin d'aide?</span> Contactez-nous
            si le problème persiste.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
