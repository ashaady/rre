import { ChevronRight, Clock, CheckCircle, ChefHat, Package, Truck } from "lucide-react";
import { motion } from "framer-motion";

interface OrderItem {
  product_name: string;
  quantity: number;
  price: number;
}

interface OrderCardProps {
  id: string;
  orderNumber: string;
  status: "pending" | "confirmed" | "preparing" | "ready" | "out_for_delivery" | "delivered" | "cancelled";
  orderType: "livraison" | "emporter";
  items: OrderItem[];
  total: number;
  createdAt: string;
  onClick: () => void;
}

const statusConfig: Record<
  string,
  { icon: React.ReactNode; label: string; color: string; bgColor: string }
> = {
  pending: {
    icon: <Clock className="w-5 h-5" />,
    label: "En attente",
    color: "text-gray-600",
    bgColor: "bg-gray-100",
  },
  confirmed: {
    icon: <CheckCircle className="w-5 h-5" />,
    label: "Confirmée",
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  preparing: {
    icon: <ChefHat className="w-5 h-5" />,
    label: "En préparation",
    color: "text-orange-600",
    bgColor: "bg-orange-100",
  },
  ready: {
    icon: <Package className="w-5 h-5" />,
    label: "Prête",
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
  out_for_delivery: {
    icon: <Truck className="w-5 h-5" />,
    label: "En livraison",
    color: "text-indigo-600",
    bgColor: "bg-indigo-100",
  },
  delivered: {
    icon: <CheckCircle className="w-5 h-5" />,
    label: "Livrée",
    color: "text-chicken-green",
    bgColor: "bg-green-100",
  },
  cancelled: {
    icon: <Clock className="w-5 h-5" />,
    label: "Annulée",
    color: "text-red-600",
    bgColor: "bg-red-100",
  },
};

export default function OrderCard({
  id,
  orderNumber,
  status,
  orderType,
  items,
  total,
  createdAt,
  onClick,
}: OrderCardProps) {
  const statusInfo = statusConfig[status];
  const date = new Date(createdAt).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="w-full bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 p-4 md:p-6 text-left"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-start gap-4 flex-1">
          <div className={`p-2 rounded-lg ${statusInfo.bgColor}`}>
            <div className={statusInfo.color}>{statusInfo.icon}</div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg text-foreground">
              Commande #{orderNumber}
            </h3>
            <p className="text-sm text-muted-foreground">{date}</p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
      </div>

      {/* Status and Type Badges */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.bgColor} ${statusInfo.color}`}>
          {statusInfo.label}
        </div>
        <div className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-600">
          {orderType === "livraison" ? "🚚 Livraison" : "📦 À emporter"}
        </div>
      </div>

      {/* Items Summary */}
      <div className="text-sm text-muted-foreground mb-4 space-y-1">
        <p className="font-medium text-foreground">{items.length} article(s)</p>
        <div className="space-y-0.5">
          {items.slice(0, 2).map((item, idx) => (
            <p key={idx} className="text-xs">
              {item.quantity}x {item.product_name}
            </p>
          ))}
          {items.length > 2 && (
            <p className="text-xs font-medium text-primary">
              +{items.length - 2} article(s)
            </p>
          )}
        </div>
      </div>

      {/* Total */}
      <div className="pt-4 border-t border-border flex items-center justify-between">
        <span className="text-muted-foreground text-sm">Total</span>
        <span className="text-lg font-bold text-primary">
          {total.toLocaleString()} F
        </span>
      </div>
    </motion.button>
  );
}
