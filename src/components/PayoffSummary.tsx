import { Calendar, DollarSign, TrendingDown, Trophy } from "lucide-react";
import type { PayoffResult } from "@/lib/debt-engine";

interface PayoffSummaryProps {
  result: PayoffResult;
  comparisonResult?: PayoffResult;
  strategyLabel: string;
}

export function PayoffSummary({ result, comparisonResult, strategyLabel }: PayoffSummaryProps) {
  if (result.totalMonths === 0) return null;

  const years = Math.floor(result.totalMonths / 12);
  const months = result.totalMonths % 12;
  const saved = comparisonResult
    ? comparisonResult.totalInterestPaid - result.totalInterestPaid
    : 0;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-foreground">{strategyLabel} Strategy</h3>
      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={<Calendar className="h-4 w-4 text-primary" />} label="Payoff Time" value={`${years > 0 ? `${years}y ` : ""}${months}mo`} />
        <StatCard icon={<DollarSign className="h-4 w-4 text-destructive" />} label="Total Interest" value={`$${Math.round(result.totalInterestPaid).toLocaleString()}`} />
        <StatCard icon={<TrendingDown className="h-4 w-4 text-primary" />} label="Total Months" value={`${result.totalMonths}`} />
        {saved > 0 && (
          <StatCard icon={<Trophy className="h-4 w-4 text-warning" />} label="Interest Saved" value={`$${Math.round(saved).toLocaleString()}`} highlight />
        )}
      </div>
      {result.debtPayoffOrder.length > 0 && (
        <div className="rounded-lg border border-border bg-muted/50 p-3">
          <p className="mb-2 text-xs text-muted-foreground font-medium">Payoff Order</p>
          <div className="space-y-1">
            {result.debtPayoffOrder.map((d, i) => (
              <div key={d.id} className="flex items-center justify-between text-xs font-mono">
                <span className="text-foreground">
                  <span className="text-primary mr-1">{i + 1}.</span>
                  {d.name}
                </span>
                <span className="text-muted-foreground">Month {d.month}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, highlight }: { icon: React.ReactNode; label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-lg border p-3 ${highlight ? "border-warning/30 bg-warning/5" : "border-border bg-card"}`}>
      <div className="flex items-center gap-1.5 mb-1">{icon}<span className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</span></div>
      <p className="text-lg font-mono font-semibold text-foreground">{value}</p>
    </div>
  );
}
