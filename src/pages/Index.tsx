import { useState, useMemo, useEffect } from "react";
import { Zap, Snowflake, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DebtForm } from "@/components/DebtForm";
import { DebtList } from "@/components/DebtList";
import { PayoffChart } from "@/components/PayoffChart";
import { PayoffSummary } from "@/components/PayoffSummary";
import { simulatePayoff, type Debt, type Strategy } from "@/lib/debt-engine";

const Index = () => {
  const [debts, setDebts] = useState<Debt[]>(() => {
    const saved = localStorage.getItem("debt-planner-debts");
    return saved ? JSON.parse(saved) : [];
  });
  const [strategy, setStrategy] = useState<Strategy>(() => {
    const saved = localStorage.getItem("debt-planner-strategy");
    return (saved as Strategy) || "avalanche";
  });
  const [extraPayment, setExtraPayment] = useState(() => {
    const saved = localStorage.getItem("debt-planner-extra");
    return saved ? JSON.parse(saved) : 200;
  });
  const [showForm, setShowForm] = useState(() => debts.length === 0);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);

  useEffect(() => {
    localStorage.setItem("debt-planner-debts", JSON.stringify(debts));
  }, [debts]);

  useEffect(() => {
    localStorage.setItem("debt-planner-strategy", strategy);
  }, [strategy]);

  useEffect(() => {
    localStorage.setItem("debt-planner-extra", JSON.stringify(extraPayment));
  }, [extraPayment]);

  const result = useMemo(() => simulatePayoff(debts, strategy, extraPayment), [debts, strategy, extraPayment]);
  const altResult = useMemo(() => simulatePayoff(debts, strategy === "avalanche" ? "snowball" : "avalanche", extraPayment), [debts, strategy, extraPayment]);

  const handleAddOrUpdate = (debt: Debt) => {
    if (editingDebt) {
      setDebts((prev) => prev.map((d) => (d.id === debt.id ? debt : d)));
      setEditingDebt(null);
    } else {
      setDebts((prev) => [...prev, debt]);
    }
    setShowForm(false);
  };

  const handleEdit = (debt: Debt) => {
    setEditingDebt(debt);
    setShowForm(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            <span className="text-primary">£</span> Debt Planner
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Simulate payoff strategies. Crush your debt faster.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          {/* Left: Inputs */}
          <div className="lg:col-span-2 space-y-4">
            {/* Strategy Toggle */}
            <div className="flex rounded-lg border border-border bg-card p-1 gap-1">
              <button
                onClick={() => setStrategy("avalanche")}
                className={`flex-1 flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  strategy === "avalanche" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Zap className="h-4 w-4" /> Avalanche
              </button>
              <button
                onClick={() => setStrategy("snowball")}
                className={`flex-1 flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  strategy === "snowball" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Snowflake className="h-4 w-4" /> Snowball
              </button>
            </div>

            {/* Extra Payment */}
            <div className="rounded-lg border border-border bg-card p-3">
              <Label className="text-xs text-muted-foreground">Extra Monthly Payment</Label>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-sm text-muted-foreground font-mono">£</span>
                <Input
                  type="number"
                  value={extraPayment}
                  onChange={(e) => setExtraPayment(Math.max(0, parseInt(e.target.value) || 0))}
                  className="bg-muted border-border font-mono text-sm"
                />
              </div>
            </div>

            {/* Debt Form / List */}
            {showForm ? (
              <DebtForm 
                onAdd={handleAddOrUpdate} 
                onCancel={debts.length > 0 ? () => {
                  setShowForm(false);
                  setEditingDebt(null);
                } : undefined} 
                initialData={editingDebt}
              />
            ) : (
              <Button variant="outline" className="w-full gap-2" onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4" /> Add Another Debt
              </Button>
            )}

            <DebtList 
              debts={debts} 
              onEdit={handleEdit}
              onRemove={(id) => setDebts((prev) => prev.filter((d) => d.id !== id))} 
            />
          </div>

          {/* Right: Results */}
          <div className="lg:col-span-3 space-y-4">
            {debts.length === 0 ? (
              <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-border">
                <p className="text-sm text-muted-foreground">Add debts to see your payoff plan</p>
              </div>
            ) : (
              <>
                <PayoffChart result={result} />
                <div className="grid gap-4 sm:grid-cols-2">
                  <PayoffSummary
                    result={result}
                    comparisonResult={altResult}
                    strategyLabel={strategy === "avalanche" ? "Avalanche" : "Snowball"}
                  />
                  <PayoffSummary
                    result={altResult}
                    comparisonResult={result}
                    strategyLabel={strategy === "avalanche" ? "Snowball" : "Avalanche"}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
