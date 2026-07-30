import { serverFetch } from "@/lib/api";

export default async function DashboardOverview() {
  // We can fetch data here securely because middleware ensures we have a token
  // Let's just render a placeholder for now
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Overview</h1>
        <p className="text-sm text-slate-400 mt-1">Welcome back to Aztec PM.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Placeholder cards */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-slate-400 text-sm font-medium">Active Projects</h3>
          <p className="text-3xl font-bold text-white mt-2">--</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-slate-400 text-sm font-medium">Tasks Overdue</h3>
          <p className="text-3xl font-bold text-white mt-2">--</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-slate-400 text-sm font-medium">Team Members</h3>
          <p className="text-3xl font-bold text-white mt-2">--</p>
        </div>
      </div>
    </div>
  );
}
