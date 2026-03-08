import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const MyTeams = () => {
  const { user } = useAuth();

  const { data: teamMemberships } = useQuery({
    queryKey: ["my-team-memberships", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("team_members")
        .select("*, teams(*, events(title, id), team_members(*, profiles:user_id(full_name)))")
        .eq("user_id", user!.id);
      return data || [];
    },
    enabled: !!user,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold">My Teams</h1>
        <p className="text-muted-foreground">Teams you've created or joined</p>
      </div>

      {teamMemberships && teamMemberships.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teamMemberships.map((tm, i) => {
            const team = tm.teams as any;
            if (!team) return null;
            return (
              <motion.div key={tm.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Link to={`/events/${team.events?.id}`}>
                  <Card className="hover:shadow-md transition-all hover:-translate-y-0.5">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-accent" />
                        <CardTitle className="text-lg font-display">{team.name}</CardTitle>
                      </div>
                      <p className="text-xs text-muted-foreground">{team.events?.title}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {team.team_members?.map((m: any) => (
                          <span key={m.id} className="text-xs px-2 py-1 rounded-full bg-muted">
                            {m.profiles?.full_name || "Member"}
                            {m.user_id === team.leader_id && " ★"}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">You haven't joined any teams yet</p>
        </div>
      )}
    </div>
  );
};

export default MyTeams;
