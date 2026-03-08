import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Users, UserCheck, Bell } from "lucide-react";
import { motion } from "framer-motion";

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

  const stats = [
    { label: "Total Events", value: totalEvents, icon: CalendarDays, color: "text-primary" },
    { label: "Registrations", value: totalRegistrations, icon: Users, color: "text-accent" },
    { label: "Checked In", value: checkedIn, icon: UserCheck, color: "text-success" },
    { label: "Upcoming", value: events?.filter((e) => new Date(e.start_date) > new Date()).length || 0, icon: Bell, color: "text-warning" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage your events and track participants</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-muted ${stat.color}`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-display font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Registrations</CardTitle>
        </CardHeader>
        <CardContent>
          {registrations && registrations.length > 0 ? (
            <div className="space-y-3">
              {registrations.slice(0, 10).map((reg) => (
                <div key={reg.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium text-sm">{(reg as any).profiles?.full_name || "Unknown"}</p>
                    <p className="text-xs text-muted-foreground">{(reg as any).events?.title}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${reg.checked_in ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>
                    {reg.checked_in ? "Checked In" : "Registered"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No registrations yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
