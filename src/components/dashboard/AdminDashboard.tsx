import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Users, UserCheck, Bell, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const AdminDashboard = () => {
  const { user } = useAuth();

  const { data: events } = useQuery({
    queryKey: ["admin-events", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("events").select("*").eq("created_by", user!.id).order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  const { data: registrations } = useQuery({
    queryKey: ["admin-registrations"],
    queryFn: async () => {
      const { data } = await supabase.from("registrations").select("*, events(title), profiles:user_id(full_name, email)");
      return data || [];
    },
    enabled: !!user,
  });

  const totalEvents = events?.length || 0;
  const totalRegistrations = registrations?.length || 0;
  const checkedIn = registrations?.filter((r) => r.checked_in).length || 0;
  const upcoming = events?.filter((e) => new Date(e.start_date) > new Date()).length || 0;

  const stats = [
    { label: "Total Events", value: totalEvents, icon: CalendarDays, color: "bg-primary/10 text-primary" },
    { label: "Registrations", value: totalRegistrations, icon: Users, color: "bg-accent/10 text-accent" },
    { label: "Checked In", value: checkedIn, icon: UserCheck, color: "bg-success/10 text-success" },
    { label: "Upcoming", value: upcoming, icon: Bell, color: "bg-warning/10 text-warning" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title text-3xl">Admin Dashboard</h1>
          <p className="section-subtitle">Manage your events and track participants</p>
        </div>
        <Link to="/events">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <div className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline">
              View Events <ArrowUpRight className="h-3.5 w-3.5" />
            </div>
          </motion.div>
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08, duration: 0.4 }}>
            <Card className="shadow-card border-border/40 hover-lift">
              <CardContent className="pt-6 pb-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-3xl font-display font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-1 font-medium">{stat.label}</p>
                  </div>
                  <div className={`stat-icon ${stat.color}`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="shadow-card border-border/40">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Recent Registrations</CardTitle>
        </CardHeader>
        <CardContent>
          {registrations && registrations.length > 0 ? (
            <div className="space-y-2">
              {registrations.slice(0, 10).map((reg, i) => (
                <motion.div
                  key={reg.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-muted/40 hover:bg-muted/60 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                      {((reg as any).profiles?.full_name?.[0] || "?").toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{(reg as any).profiles?.full_name || "Unknown"}</p>
                      <p className="text-xs text-muted-foreground">{(reg as any).events?.title}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                    reg.checked_in
                      ? "bg-success/10 text-success"
                      : "bg-warning/10 text-warning"
                  }`}>
                    {reg.checked_in ? "Checked In" : "Registered"}
                  </span>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm py-4 text-center">No registrations yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
