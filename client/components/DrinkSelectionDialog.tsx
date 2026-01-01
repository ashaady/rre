import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Droplet } from "lucide-react";
import { useState } from "react";

interface DrinkSelectionDialogProps {
  open: boolean;
  menuName: string;
  drinks: Array<{ id: string; name: string; emoji: string }>;
  onSelect: (drinkId: string) => void;
  onCancel: () => void;
}

export default function DrinkSelectionDialog({
  open,
  menuName,
  drinks,
  onSelect,
  onCancel,
}: DrinkSelectionDialogProps) {
  const [selectedDrink, setSelectedDrink] = useState<string>("");

  const handleConfirm = () => {
    if (selectedDrink) {
      onSelect(selectedDrink);
      setSelectedDrink("");
    }
  };

  const handleCancel = () => {
    setSelectedDrink("");
    onCancel();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleCancel()}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Droplet className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <DialogTitle className="text-xl">Choisissez votre boisson</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">Pour: {menuName}</p>
            </div>
          </div>
        </DialogHeader>

        <div className="py-6">
          <RadioGroup value={selectedDrink} onValueChange={setSelectedDrink}>
            <div className="space-y-3">
              {drinks.map((drink) => (
                <div key={drink.id}>
                  <Label
                    htmlFor={drink.id}
                    className="flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-50"
                    style={{
                      borderColor: selectedDrink === drink.id ? "hsl(var(--primary))" : "hsl(var(--border))",
                      backgroundColor: selectedDrink === drink.id ? "hsl(var(--primary) / 0.05)" : "transparent",
                    }}
                  >
                    <RadioGroupItem value={drink.id} id={drink.id} className="flex-shrink-0" />
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className="text-2xl">{drink.emoji}</span>
                      <span className="font-medium text-foreground">{drink.name}</span>
                    </div>
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Annuler
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedDrink}
            className="bg-primary text-white hover:bg-primary/90"
          >
            Confirmer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
