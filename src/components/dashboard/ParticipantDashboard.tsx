import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Users, Clock, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { format } from "date-fns";

const ParticipantDashboard = () => {
  const { user, profile } = useAuth();

  const { data: myRegistrations } = useQuery({
    queryKey: ["my-registrations", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("registrations")
        .select("*, events(*)")
        .eq("user_id", user!.id)
        .order("registered_at", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  const { data: myTeams } = useQuery({
    queryKey: ["my-teams", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("team_members")
        .select("*, teams(*, events(title))")
        .eq("user_id", user!.id);
      return data || [];
    },
    enabled: !!user,
  });

  const upcomingEvents = myRegistrations?.filter(
    (r) => r.events && new Date(r.events.start_date) > new Date()
  ) || [];

  const stats = [
    { label: "Registered Events", value: myRegistrations?.length || 0, icon: CalendarDays, color: "bg-primary/10 text-primary" },
    { label: "Teams Joined", value: myTeams?.length || 0, icon: Users, color: "bg-accent/10 text-accent" },
    { label: "Upcoming Events", value: upcomingEvents.length, icon: Clock, color: "bg-warning/10 text-warning" },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title text-3xl">
            Welcome back{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}
          </h1>
          <p className="section-subtitle">Your events and teams at a glance</p>
        </div>
        <Link to="/events">
          <Button className="gradient-primary gap-2 rounded-full px-6 shadow-glow">
            Browse Events <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
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

      {/* Registered events */}
      <Card className="shadow-card border-border/40">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">My Registered Events</CardTitle>
        </CardHeader>
        <CardContent>
          {myRegistrations && myRegistrations.length > 0 ? (
            <div className="space-y-2">
              {myRegistrations.map((reg, i) => (
                <Link key={reg.id} to={`/events/${reg.event_id}`} className="block">
                  <motion.div
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-muted/40 hover:bg-muted/60 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <CalendarDays className="h-4.5 w-4.5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm group-hover:text-primary transition-colors">{reg.events?.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {reg.events?.start_date && format(new Date(reg.events.start_date), "MMM d, yyyy")}
                          {reg.events?.venue && ` · ${reg.events.venue}`}
                        </p>
                      </div>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                      reg.checked_in
                        ? "bg-success/10 text-success"
                        : "bg-primary/10 text-primary"
                    }`}>
                      {reg.checked_in ? "Checked In" : "Registered"}
                    </span>
                  </motion.div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3">
                <CalendarDays className="h-7 w-7 text-muted-foreground/40" />
              </div>
              <p className="text-muted-foreground font-medium text-sm">No events yet</p>
              <p className="text-xs text-muted-foreground/60 mt-1 mb-4">Browse events to get started</p>
              <Link to="/events">
                <Button variant="outline" size="sm" className="rounded-full">Browse Events</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ParticipantDashboard;
