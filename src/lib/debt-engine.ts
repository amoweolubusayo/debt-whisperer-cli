export interface Debt {
  id: string;
  name: string;
  balance: number;
  apr: number;
  minimumPayment: number;
  promoAprEnd: number | null; // month number when 0% promo ends (null = no promo)
}

export type Strategy = "avalanche" | "snowball";

export interface MonthSnapshot {
  month: number;
  debts: { id: string; name: string; balance: number; interestPaid: number; payment: number }[];
  totalBalance: number;
  totalInterestThisMonth: number;
}

export interface PayoffResult {
  timeline: MonthSnapshot[];
  totalInterestPaid: number;
  totalMonths: number;
  debtPayoffOrder: { id: string; name: string; month: number }[];
}

export function simulatePayoff(
  debts: Debt[],
  strategy: Strategy,
  extraPayment: number
): PayoffResult {
  if (debts.length === 0) {
    return { timeline: [], totalInterestPaid: 0, totalMonths: 0, debtPayoffOrder: [] };
  }

  let balances = new Map<string, number>();
  debts.forEach((d) => balances.set(d.id, d.balance));

  const timeline: MonthSnapshot[] = [];
  const debtPayoffOrder: { id: string; name: string; month: number }[] = [];
  let totalInterestPaid = 0;
  let month = 0;
  const MAX_MONTHS = 600;

  while (month < MAX_MONTHS) {
    const totalBalance = Array.from(balances.values()).reduce((a, b) => a + b, 0);
    if (totalBalance <= 0.01) break;

    month++;
    let monthInterest = 0;
    const monthDebts: MonthSnapshot["debts"] = [];

    // Calculate interest
    debts.forEach((d) => {
      const bal = balances.get(d.id) || 0;
      if (bal <= 0) return;
      const isPromo = d.promoAprEnd !== null && month <= d.promoAprEnd;
      const rate = isPromo ? 0 : d.apr / 100 / 12;
      const interest = bal * rate;
      balances.set(d.id, bal + interest);
      monthInterest += interest;
    });

    totalInterestPaid += monthInterest;

    // Pay minimums first
    let availableExtra = extraPayment;
    debts.forEach((d) => {
      const bal = balances.get(d.id) || 0;
      if (bal <= 0) return;
      const payment = Math.min(d.minimumPayment, bal);
      balances.set(d.id, bal - payment);
    });

    // Sort remaining debts by strategy for extra payment
    const activeDebts = debts
      .filter((d) => (balances.get(d.id) || 0) > 0.01)
      .sort((a, b) => {
        if (strategy === "avalanche") {
          const aRate = a.promoAprEnd !== null && month <= a.promoAprEnd ? 0 : a.apr;
          const bRate = b.promoAprEnd !== null && month <= b.promoAprEnd ? 0 : b.apr;
          return bRate - aRate; // highest interest first
        }
        return (balances.get(a.id) || 0) - (balances.get(b.id) || 0); // lowest balance first
      });

    // Apply extra payment
    for (const d of activeDebts) {
      if (availableExtra <= 0) break;
      const bal = balances.get(d.id) || 0;
      if (bal <= 0) continue;
      const extra = Math.min(availableExtra, bal);
      balances.set(d.id, bal - extra);
      availableExtra -= extra;
    }

    // Record snapshot
    debts.forEach((d) => {
      const bal = Math.max(0, balances.get(d.id) || 0);
      balances.set(d.id, bal);
      const isPromo = d.promoAprEnd !== null && month <= d.promoAprEnd;
      const rate = isPromo ? 0 : d.apr / 100 / 12;
      monthDebts.push({
        id: d.id,
        name: d.name,
        balance: bal,
        interestPaid: bal > 0 ? (balances.get(d.id) || 0) * rate : 0, // approximate
        payment: d.minimumPayment,
      });
    });

    // Check for newly paid off debts
    debts.forEach((d) => {
      const bal = balances.get(d.id) || 0;
      if (bal <= 0.01 && !debtPayoffOrder.find((p) => p.id === d.id)) {
        debtPayoffOrder.push({ id: d.id, name: d.name, month });
      }
    });

    timeline.push({
      month,
      debts: monthDebts,
      totalBalance: Array.from(balances.values()).reduce((a, b) => a + b, 0),
      totalInterestThisMonth: monthInterest,
    });
  }

  return { timeline, totalInterestPaid, totalMonths: month, debtPayoffOrder };
}
