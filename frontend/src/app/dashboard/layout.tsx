"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Briefcase, 
  CheckSquare, 
  Users, 
  LogOut, 
  LayoutDashboard,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { logout } from "@/app/actions/auth-actions";

const navigation = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Proyectos", href: "/dashboard/projects", icon: Briefcase },
  { name: "Tareas", href: "/dashboard/tasks", icon: CheckSquare },
  { name: "Equipo", href: "/dashboard/team", icon: Users },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Restore collapsed preference from localStorage after client hydration
  useEffect(() => {
    const saved = localStorage.getItem("sidebar_collapsed");
    if (saved !== null) {
      setIsCollapsed(saved === "true");
    }
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("sidebar_collapsed", String(next));
      return next;
    });
  };

  const handleLogout = () => {
    startTransition(() => {
      logout();
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row">
      {/* Collapsible Sidebar */}
      <aside 
        className={`w-full ${
          isCollapsed ? "md:w-20" : "md:w-64"
        } bg-slate-900 border-r border-slate-800 flex flex-col md:fixed md:h-full md:inset-y-0 z-10 transition-all duration-300 ease-in-out`}
      >
        {/* Sidebar Header & Toggle Button */}
        <div className="p-4 flex items-center justify-between border-b border-slate-800/40">
          {!isCollapsed ? (
            <>
              <Link href="/dashboard" className="flex items-center space-x-3 overflow-hidden">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                  <Briefcase className="w-5 h-5 text-indigo-400" />
                </div>
                <span className="text-lg font-bold text-white tracking-tight whitespace-nowrap">
                  Aztec PM
                </span>
              </Link>

              <button
                onClick={toggleCollapse}
                className="hidden md:flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
                title="Colapsar menú"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button
              onClick={toggleCollapse}
              className="w-full flex items-center justify-center py-2 text-indigo-400 hover:text-white bg-indigo-500/10 hover:bg-indigo-500/20 rounded-xl border border-indigo-500/20 transition-colors"
              title="Expandir menú"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                title={isCollapsed ? item.name : undefined}
                className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all ${
                  isCollapsed ? "justify-center" : ""
                } ${
                  isActive
                    ? "bg-indigo-500/10 text-indigo-400"
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                }`}
              >
                <item.icon
                  className={`flex-shrink-0 h-5 w-5 ${
                    isCollapsed ? "" : "-ml-1 mr-3"
                  } ${
                    isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300"
                  }`}
                />
                {!isCollapsed && (
                  <>
                    <span className="truncate">{item.name}</span>
                    {isActive && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Footer */}
        <div className="p-3 mt-auto border-t border-slate-800/80">
          <div className={`bg-slate-800/40 rounded-2xl p-3 border border-slate-700/40 ${isCollapsed ? "flex flex-col items-center gap-2" : ""}`}>
            <div className="flex items-center">
              <div className="h-9 w-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-inner shrink-0">
                PU
              </div>
              {!isCollapsed && (
                <div className="ml-3 overflow-hidden">
                  <p className="text-xs font-semibold text-white truncate">Project User</p>
                  <p className="text-[10px] font-medium text-slate-400">Admin</p>
                </div>
              )}
            </div>
            
            <button
              onClick={handleLogout}
              disabled={isPending}
              title={isCollapsed ? "Cerrar sesión" : undefined}
              className={`mt-2 flex items-center justify-center border border-slate-700 rounded-xl shadow-sm text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 focus:outline-none transition-colors ${
                isCollapsed ? "w-9 h-9 p-0" : "w-full px-3 py-2"
              }`}
            >
              <LogOut className={`h-4 w-4 ${isCollapsed ? "" : "mr-2"}`} />
              {!isCollapsed && <span>Sign out</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area with dynamic padding */}
      <main 
        className={`flex-1 ${
          isCollapsed ? "md:pl-20" : "md:pl-64"
        } flex flex-col min-h-screen transition-all duration-300 ease-in-out`}
      >
        <div className="flex-1 p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
