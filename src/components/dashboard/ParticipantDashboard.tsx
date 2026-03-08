import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Users, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { format } from "date-fns";

const ParticipantDashboard = () => {
  const { user } = useAuth();

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">My Dashboard</h1>
          <p className="text-muted-foreground">Your events and teams at a glance</p>
        </div>
        <Link to="/events">
          <Button className="gradient-primary">Browse Events</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardContent className="pt-6 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <CalendarDays className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-display font-bold">{myRegistrations?.length || 0}</p>
                <p className="text-xs text-muted-foreground">Registered Events</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardContent className="pt-6 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10 text-accent">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-display font-bold">{myTeams?.length || 0}</p>
                <p className="text-xs text-muted-foreground">Teams Joined</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardContent className="pt-6 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10 text-warning">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-display font-bold">{upcomingEvents.length}</p>
                <p className="text-xs text-muted-foreground">Upcoming Events</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Registered Events</CardTitle>
        </CardHeader>
        <CardContent>
          {myRegistrations && myRegistrations.length > 0 ? (
            <div className="space-y-3">
              {myRegistrations.map((reg) => (
                <Link key={reg.id} to={`/events/${reg.event_id}`} className="block">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <div>
                      <p className="font-medium text-sm">{reg.events?.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {reg.events?.start_date && format(new Date(reg.events.start_date), "MMM d, yyyy")}
                        {reg.events?.venue && ` · ${reg.events.venue}`}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${reg.checked_in ? "bg-success/10 text-success" : "bg-primary/10 text-primary"}`}>
                      {reg.checked_in ? "Checked In" : "Registered"}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">You haven't registered for any events yet</p>
              <Link to="/events">
                <Button variant="outline">Browse Events</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ParticipantDashboard;
