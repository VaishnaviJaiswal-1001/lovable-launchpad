import { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CalendarDays, LayoutDashboard, Users, Bell, LogOut, Menu, X
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const AppLayout = ({ children }: { children: ReactNode }) => {
  const { user, role, profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAdmin = role === "admin";

  const navItems = isAdmin
    ? [
        { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { to: "/events", label: "Events", icon: CalendarDays },
        { to: "/notifications", label: "Notifications", icon: Bell },
      ]
    : [
        { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { to: "/events", label: "Browse Events", icon: CalendarDays },
        { to: "/my-teams", label: "My Teams", icon: Users },
        { to: "/notifications", label: "Notifications", icon: Bell },
      ];

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 gradient-mesh pointer-events-none" />

      {/* Top nav */}
      <header className="sticky top-0 z-50 bg-card/70 backdrop-blur-2xl border-b border-border/30">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
                <CalendarDays className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-lg tracking-tight">Manageve</span>
            </Link>
            <Badge className="hidden sm:inline-flex text-[10px] rounded-full px-2.5 py-0.5 bg-muted text-muted-foreground border-0 font-medium">
              {isAdmin ? "Admin" : "Participant"}
            </Badge>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1 bg-muted/50 rounded-full p-1">
            {navItems.map((navItem) => {
              const active = location.pathname === navItem.to;
              return (
                <Link key={navItem.to} to={navItem.to}>
                  <Button
                    variant={active ? "default" : "ghost"}
                    size="sm"
                    className={`gap-2 rounded-full h-9 px-4 text-xs font-medium ${
                      active ? "shadow-md" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <navItem.icon className="h-3.5 w-3.5" />
                    {navItem.label}
                  </Button>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 mr-1">
              <div className="h-8 w-8 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                {(profile?.full_name?.[0] || user?.email?.[0] || "U").toUpperCase()}
              </div>
              <span className="text-sm font-medium text-foreground max-w-[120px] truncate">
                {profile?.full_name || user?.email}
              </span>
            </div>
            <Button variant="ghost" size="icon" onClick={handleSignOut} className="rounded-full h-9 w-9 text-muted-foreground hover:text-foreground">
              <LogOut className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden rounded-full h-9 w-9"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile nav */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-border/30 overflow-hidden bg-card/80 backdrop-blur-xl"
            >
              <nav className="container py-3 flex flex-col gap-1">
                {navItems.map((navItem) => {
                  const active = location.pathname === navItem.to;
                  return (
                    <Link key={navItem.to} to={navItem.to} onClick={() => setMobileOpen(false)}>
                      <Button variant={active ? "default" : "ghost"} size="sm" className="w-full justify-start gap-2 rounded-xl h-10">
                        <navItem.icon className="h-4 w-4" />
                        {navItem.label}
                      </Button>
                    </Link>
                  );
                })}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="container py-8 relative z-10">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
};

export default AppLayout;
