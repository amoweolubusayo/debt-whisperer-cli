import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { Debt } from "@/lib/debt-engine";

interface DebtFormProps {
  onAdd: (debt: Debt) => void;
  onCancel?: () => void;
}

export function DebtForm({ onAdd, onCancel }: DebtFormProps) {
  const [name, setName] = useState("");
  const [balance, setBalance] = useState("");
  const [apr, setApr] = useState("");
  const [minPayment, setMinPayment] = useState("");
  const [hasPromo, setHasPromo] = useState(false);
  const [promoMonths, setPromoMonths] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !balance || !apr || !minPayment) return;
    onAdd({
      id: crypto.randomUUID(),
      name,
      balance: parseFloat(balance),
      apr: parseFloat(apr),
      minimumPayment: parseFloat(minPayment),
      promoAprEnd: hasPromo && promoMonths ? parseInt(promoMonths) : null,
    });
    setName("");
    setBalance("");
    setApr("");
    setMinPayment("");
    setHasPromo(false);
    setPromoMonths("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">Add Debt</h3>
        {onCancel && (
          <button type="button" onClick={onCancel} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <Label className="text-xs text-muted-foreground">Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Credit Card #1" className="mt-1 bg-muted border-border font-mono text-sm" />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Balance (£)</Label>
          <Input type="number" step="0.01" value={balance} onChange={(e) => setBalance(e.target.value)} placeholder="5,000" className="mt-1 bg-muted border-border font-mono text-sm" />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">APR (%)</Label>
          <Input type="number" step="0.01" value={apr} onChange={(e) => setApr(e.target.value)} placeholder="22.99" className="mt-1 bg-muted border-border font-mono text-sm" />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Min Payment ($)</Label>
          <Input type="number" step="0.01" value={minPayment} onChange={(e) => setMinPayment(e.target.value)} placeholder="150" className="mt-1 bg-muted border-border font-mono text-sm" />
        </div>
        <div className="flex flex-col justify-end">
          <div className="flex items-center gap-2">
            <Switch checked={hasPromo} onCheckedChange={setHasPromo} />
            <Label className="text-xs text-muted-foreground">0% Promo</Label>
          </div>
        </div>
        {hasPromo && (
          <div className="col-span-2">
            <Label className="text-xs text-warning">Promo months remaining</Label>
            <Input type="number" value={promoMonths} onChange={(e) => setPromoMonths(e.target.value)} placeholder="12" className="mt-1 bg-muted border-border font-mono text-sm" />
          </div>
        )}
      </div>
      <Button type="submit" className="w-full gap-2">
        <Plus className="h-4 w-4" /> Add Debt
      </Button>
    </form>
  );
}
