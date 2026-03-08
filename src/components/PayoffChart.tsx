import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import type { PayoffResult } from "@/lib/debt-engine";

interface PayoffChartProps {
  result: PayoffResult;
}

export function PayoffChart({ result }: PayoffChartProps) {
  if (result.timeline.length === 0) return null;

  const data = result.timeline
    .filter((_, i) => i % Math.max(1, Math.floor(result.timeline.length / 60)) === 0 || i === result.timeline.length - 1)
    .map((snap) => ({
      month: snap.month,
      balance: Math.round(snap.totalBalance),
      interest: Math.round(snap.totalInterestThisMonth),
    }));

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="mb-4 text-sm font-medium text-foreground">Balance Over Time</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(168, 80%, 48%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(168, 80%, 48%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="month"
              tick={{ fill: "hsl(215, 12%, 50%)", fontSize: 11, fontFamily: "JetBrains Mono" }}
              axisLine={{ stroke: "hsl(220, 14%, 18%)" }}
              tickLine={false}
              tickFormatter={(v) => `${v}mo`}
            />
            <YAxis
              tick={{ fill: "hsl(215, 12%, 50%)", fontSize: 11, fontFamily: "JetBrains Mono" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(220, 18%, 12%)",
                border: "1px solid hsl(220, 14%, 18%)",
                borderRadius: 8,
                fontFamily: "JetBrains Mono",
                fontSize: 12,
              }}
              labelFormatter={(v) => `Month ${v}`}
              formatter={(value: number) => [`$${value.toLocaleString()}`, "Balance"]}
            />
            <Area type="monotone" dataKey="balance" stroke="hsl(168, 80%, 48%)" fill="url(#balanceGrad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
