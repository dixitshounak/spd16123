import React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { parseRupee } from "../../utils/formatCurrency";

const COLORS = ["#0D9488", "#F59E0B", "#3B82F6", "#8B5CF6", "#EC4899"];
const CATEGORY_LABELS = {
  hotels: "🏨 Hotels",
  food: "🍜 Food",
  activities: "🎯 Activities",
  transport: "🚕 Transport",
  misc: "🛍️ Misc",
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white px-4 py-3 rounded-xl shadow-card border border-border">
        <p className="font-semibold text-primary text-sm">{payload[0].name}</p>
        <p className="text-accent font-bold">₹{payload[0].value?.toLocaleString("en-IN")}</p>
      </div>
    );
  }
  return null;
};

const BudgetChart = ({ budgetBreakdown, totalBudget, estimatedTotal, days = [] }) => {
  if (!budgetBreakdown) return null;

  // Build pie data
  const pieData = Object.entries(budgetBreakdown)
    .map(([key, value]) => ({
      name: CATEGORY_LABELS[key] || key,
      value: parseRupee(value),
    }))
    .filter((d) => d.value > 0);

  // Build daily cost bar data
  const barData = days.map((d) => ({
    name: `Day ${d.day}`,
    cost: parseRupee(d.dailyCost),
  }));

  const estimated = parseRupee(estimatedTotal);
  const budget = typeof totalBudget === "number" ? totalBudget : parseRupee(totalBudget);
  const overBudget = estimated > budget;

  return (
    <div className="space-y-8">
      {/* Budget Comparison */}
      <div className="card p-5 space-y-4">
        <h3 className="font-bold text-primary">Budget Overview</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 text-center">
            <p className="text-xs text-muted mb-1 font-medium">Your Budget</p>
            <p className="text-2xl font-bold text-primary">₹{budget?.toLocaleString("en-IN")}</p>
          </div>
          <div className={`p-4 rounded-xl text-center ${overBudget ? "bg-red-50" : "bg-green-50"}`}>
            <p className="text-xs text-muted mb-1 font-medium">Estimated Cost</p>
            <p className={`text-2xl font-bold ${overBudget ? "text-danger" : "text-success"}`}>
              ₹{estimated?.toLocaleString("en-IN")}
            </p>
          </div>
        </div>
        {/* Progress bar */}
        {budget > 0 && (
          <div>
            <div className="flex justify-between text-xs text-muted mb-1.5">
              <span>Budget used</span>
              <span className={overBudget ? "text-danger font-semibold" : "text-success font-semibold"}>
                {Math.round((estimated / budget) * 100)}%
              </span>
            </div>
            <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${overBudget ? "bg-danger" : "bg-success"}`}
                style={{ width: `${Math.min((estimated / budget) * 100, 100)}%` }}
              />
            </div>
            {overBudget && (
              <p className="text-xs text-danger mt-1.5">
                ⚠️ Estimated cost exceeds your budget by ₹{(estimated - budget)?.toLocaleString("en-IN")}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Pie Chart */}
      <div className="card p-5">
        <h3 className="font-bold text-primary mb-4">Spending Breakdown</h3>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={3}
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>

        {/* Breakdown table */}
        <div className="mt-4 space-y-2">
          {Object.entries(budgetBreakdown).map(([key, value], i) => (
            <div key={key} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-sm text-primary-lighter">{CATEGORY_LABELS[key] || key}</span>
              </div>
              <span className="font-semibold text-sm text-primary">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Daily Cost Bar Chart */}
      {barData.length > 0 && (
        <div className="card p-5">
          <h3 className="font-bold text-primary mb-4">Daily Spending</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#94a3b8" }} />
              <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="cost" fill="#0D9488" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default BudgetChart;
