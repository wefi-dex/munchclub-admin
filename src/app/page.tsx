import { Users, ShoppingCart, DollarSign, BookOpen, ChefHat, TrendingUp } from "lucide-react";

type StatCard = {
  title: string;
  value: string | number;
  delta: string;
  icon: (props: any) => JSX.Element;
  gradient: string;
  note?: string;
};

const stats: StatCard[] = [
  { title: "Users", value: 1247, delta: "+12%", icon: Users, gradient: "gradient-primary", note: "Active this month" },
  { title: "Orders", value: 3421, delta: "+8%", icon: ShoppingCart, gradient: "gradient-success", note: "Processed" },
  { title: "Revenue", value: "$45,678", delta: "+15%", icon: DollarSign, gradient: "gradient-warning", note: "Last 30 days" },
  { title: "Books", value: 156, delta: "+3%", icon: BookOpen, gradient: "gradient-secondary" },
  { title: "Recipes", value: 89, delta: "+7%", icon: ChefHat, gradient: "gradient-danger" },
];

const revenuePoints = [12, 14, 11, 16, 18, 15, 20, 22, 19, 24, 26, 30];

export default function Home() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gradient mb-2">Dashboard</h1>
        <p className="text-slate-600">Overview of your Munchclub platform</p>
        <div className="w-20 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mx-auto mt-4"></div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {stats.map((s, i) => (
          <div key={s.title} className="card-modern p-6 group hover:scale-105 transition-all duration-300" style={{ animationDelay: `${i * 0.05}s` }}>
            <div className="flex items-start justify-between mb-4">
              <div className={`p-4 rounded-2xl ${s.gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <s.icon className="w-7 h-7 text-white" />
              </div>
              <div className="flex items-center space-x-1">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-sm font-semibold text-green-600">{s.delta}</span>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">{s.title}</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{s.value}</p>
              {s.note && <p className="text-xs text-slate-500 mt-1">{s.note}</p>}
            </div>
          </div>
        ))}
      </div>

      {/* Revenue + Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="card-modern p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-slate-900">Revenue Overview</h3>
            <span className="text-sm text-slate-500">Last 12 months</span>
          </div>
          <div className="h-56">
            <svg viewBox="0 0 400 160" className="w-full h-full">
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                </linearGradient>
              </defs>
              <polyline
                fill="none"
                stroke="#6366f1"
                strokeWidth="3"
                points={revenuePoints
                  .map((v, idx) => {
                    const x = (idx / (revenuePoints.length - 1)) * 380 + 10;
                    const y = 150 - (v / 32) * 140;
                    return `${x},${y}`;
                  })
                  .join(" ")}
              />
              <polygon
                fill="url(#grad)"
                points={(() => {
                  const pts = revenuePoints.map((v, idx) => {
                    const x = (idx / (revenuePoints.length - 1)) * 380 + 10;
                    const y = 150 - (v / 32) * 140;
                    return `${x},${y}`;
                  });
                  return `10,150 ${pts.join(" ")} 390,150`;
                })()}
              />
              <line x1="10" y1="150" x2="390" y2="150" stroke="#e2e8f0" />
              <line x1="10" y1="10" x2="10" y2="150" stroke="#e2e8f0" />
            </svg>
          </div>
        </div>

        <div className="card-modern p-6">
          <h3 className="text-xl font-bold text-slate-900 mb-4">Conversion Funnel</h3>
          <div className="space-y-4">
            {[
              { label: "Visits", value: 10000, color: "bg-blue-600" },
              { label: "Views", value: 6800, color: "bg-indigo-500" },
              { label: "Adds to cart", value: 2400, color: "bg-purple-500" },
              { label: "Orders", value: 1200, color: "bg-emerald-500" },
            ].map((row) => (
              <div key={row.label}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-slate-600">{row.label}</span>
                  <span className="font-semibold text-slate-900">{row.value.toLocaleString()}</span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${row.color}`} style={{ width: `${(row.value / 10000) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders + Top Items */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="card-modern p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-slate-900">Recent Orders</h3>
            <button className="btn-secondary text-sm">View all</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500">
                  <th className="py-2">Order</th>
                  <th className="py-2">Customer</th>
                  <th className="py-2">Total</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="hover:bg-slate-50/60">
                    <td className="py-3 font-medium text-slate-900">#{1000 + i}</td>
                    <td className="py-3 text-slate-600">Customer {i + 1}</td>
                    <td className="py-3 font-semibold text-slate-900">${(79 + i * 12).toFixed(2)}</td>
                    <td className="py-3">
                      <span className="px-2 py-1 text-xs rounded-full bg-emerald-50 text-emerald-700">Paid</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card-modern p-6">
          <h3 className="text-xl font-bold text-slate-900 mb-4">Top Items</h3>
          <div className="space-y-4">
            {[
              { name: "Mediterranean Cookbook", sales: 432 },
              { name: "Vegan Delight", sales: 321 },
              { name: "Dessert Mastery", sales: 298 },
              { name: "Quick Recipes", sales: 243 },
            ].map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <span className="text-slate-700">{item.name}</span>
                <span className="text-slate-900 font-semibold">{item.sales}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
