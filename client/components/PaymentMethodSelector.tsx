import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { AlertCircle, Loader } from "lucide-react";
import { useState } from "react";

interface PaymentMethodSelectorProps {
  open: boolean;
  total: number;
  isLoading?: boolean;
  onSelect: (method: "wave" | "orange-money") => void;
  onCancel: () => void;
}

export default function PaymentMethodSelector({
  open,
  total,
  isLoading = false,
  onSelect,
  onCancel,
}: PaymentMethodSelectorProps) {
  const [selectedMethod, setSelectedMethod] = useState<"wave" | "orange-money" | "">("");

  const handleConfirm = () => {
    if (selectedMethod === "wave" || selectedMethod === "orange-money") {
      onSelect(selectedMethod);
    }
  };

  const handleCancel = () => {
    setSelectedMethod("");
    onCancel();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleCancel()}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <span className="text-2xl">💳</span>
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl">Mode de paiement</DialogTitle>
              <p className="text-2xl font-bold text-primary mt-1">
                {total.toLocaleString()} F
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4">
          <RadioGroup value={selectedMethod} onValueChange={(v) => setSelectedMethod(v as any)}>
            <div className="space-y-3 mb-6">
              {/* Wave */}
              <div>
                <Label
                  htmlFor="wave"
                  className="flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-50"
                  style={{
                    borderColor: selectedMethod === "wave" ? "hsl(var(--primary))" : "hsl(var(--border))",
                    backgroundColor: selectedMethod === "wave" ? "hsl(var(--primary) / 0.05)" : "transparent",
                  }}
                >
                  <RadioGroupItem value="wave" id="wave" className="flex-shrink-0" />
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-12 h-8 bg-blue-500 rounded flex items-center justify-center text-white font-bold text-xs">
                      Wave
                    </div>
                    <span className="font-medium text-foreground">Wave</span>
                  </div>
                </Label>
              </div>

              {/* Orange Money */}
              <div>
                <Label
                  htmlFor="orange-money"
                  className="flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-50"
                  style={{
                    borderColor: selectedMethod === "orange-money" ? "hsl(var(--primary))" : "hsl(var(--border))",
                    backgroundColor: selectedMethod === "orange-money" ? "hsl(var(--primary) / 0.05)" : "transparent",
                  }}
                >
                  <RadioGroupItem value="orange-money" id="orange-money" className="flex-shrink-0" />
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-12 h-8 bg-orange-500 rounded flex items-center justify-center text-white font-bold text-xs">
                      Orange
                    </div>
                    <span className="font-medium text-foreground">Orange Money</span>
                  </div>
                </Label>
              </div>
            </div>
          </RadioGroup>

          {/* Security Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-semibold mb-1">🔒 Paiement sécurisé</p>
              <p className="text-xs">Vous serez redirigé vers la page de paiement sécurisée</p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
            Annuler
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedMethod || isLoading}
            className="bg-primary text-white hover:bg-primary/90 flex items-center gap-2"
          >
            {isLoading && <Loader className="w-4 h-4 animate-spin" />}
            {isLoading ? "Traitement..." : "Procéder au paiement"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
