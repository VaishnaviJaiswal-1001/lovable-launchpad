import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Users, UserCheck, Bell, Crown, Mail, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

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

  const { data: teams } = useQuery({
    queryKey: ["admin-all-teams"],
    queryFn: async () => {
      const { data } = await supabase.from("teams").select("*, team_members(user_id)");
      return data || [];
    },
    enabled: !!user,
  });

  // Build userId -> team info map
  const userTeamMap = new Map<string, { teamName: string; isLeader: boolean }>();
  teams?.forEach((team) => {
    const memberIds = (team.team_members as any[])?.map((m: any) => m.user_id) || [];
    memberIds.forEach((uid: string) => {
      userTeamMap.set(uid, { teamName: team.name, isLeader: team.leader_id === uid });
    });
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
            <Card className="shadow-card">
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

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Recent Registrations</CardTitle>
        </CardHeader>
        <CardContent>
          {registrations && registrations.length > 0 ? (
            <div className="space-y-2">
              {registrations.slice(0, 15).map((reg) => {
                const profile = (reg as any).profiles;
                const teamInfo = userTeamMap.get(reg.user_id);

                return (
                  <div key={reg.id} className="flex items-center justify-between p-4 rounded-xl bg-muted/40 border border-border/40">
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-sm">{profile?.full_name || "Unknown"}</p>
                        <Badge variant="outline" className="text-xs rounded-full">
                          {(reg as any).events?.title}
                        </Badge>
                        {teamInfo && (
                          <Badge variant="secondary" className="text-xs gap-1 rounded-full">
                            {teamInfo.isLeader && <Crown className="h-3 w-3 text-warning" />}
                            <Users className="h-3 w-3" />
                            {teamInfo.teamName}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {profile?.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(reg.registered_at), "MMM d 'at' h:mm a")}
                        </span>
                      </div>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full shrink-0 ${reg.checked_in ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>
                      {reg.checked_in ? "Checked In" : "Registered"}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm text-center py-6">No registrations yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
