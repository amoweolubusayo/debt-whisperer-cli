import { Trash2, Clock, Percent, Edit2 } from "lucide-react";
import type { Debt } from "@/lib/debt-engine";

interface DebtListProps {
  debts: Debt[];
  onRemove: (id: string) => void;
  onEdit: (debt: Debt) => void;
}

export function DebtList({ debts, onRemove, onEdit }: DebtListProps) {
  if (debts.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-8 text-center">
        <p className="text-sm text-muted-foreground">No debts added yet. Add your first debt above.</p>
      </div>
    );
  }

  const totalBalance = debts.reduce((sum, d) => sum + d.balance, 0);
  const totalMinPayment = debts.reduce((sum, d) => sum + d.minimumPayment, 0);

  return (
    <div className="space-y-2">
      {debts.map((debt) => (
        <div key={debt.id} className="group flex items-center justify-between rounded-lg border border-border bg-card p-3 transition-colors hover:border-primary/30">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground truncate">{debt.name}</span>
              {debt.promoAprEnd && (
                <span className="inline-flex items-center gap-1 rounded-full bg-warning/10 px-2 py-0.5 text-[10px] font-mono text-warning">
                  <Clock className="h-3 w-3" /> 0% for {debt.promoAprEnd}mo
                </span>
              )}
            </div>
            <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground font-mono">
              <span>£{debt.balance.toLocaleString()}</span>
              <span className="flex items-center gap-0.5"><Percent className="h-3 w-3" />{debt.apr}</span>
              <span>£{debt.minimumPayment}/mo</span>
            </div>
          </div>
          <div className="ml-2 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <button onClick={() => onEdit(debt)} className="p-1 text-muted-foreground hover:text-foreground">
              <Edit2 className="h-4 w-4" />
            </button>
            <button onClick={() => onRemove(debt.id)} className="p-1 text-muted-foreground hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
      <div className="flex justify-between rounded-lg bg-muted px-3 py-2 text-xs font-mono">
        <span className="text-muted-foreground">Total: <span className="text-foreground">£{totalBalance.toLocaleString()}</span></span>
        <span className="text-muted-foreground">Min/mo: <span className="text-foreground">£{totalMinPayment.toLocaleString()}</span></span>
      </div>
    </div>
  );
}
