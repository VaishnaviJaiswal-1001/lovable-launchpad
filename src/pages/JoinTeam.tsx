import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Crown, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const JoinTeam = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: team, isLoading } = useQuery({
    queryKey: ["join-team", teamId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("teams")
        .select("*, events(title, id, max_team_size, start_date), team_members(*, profiles:user_id(full_name))")
        .eq("id", teamId!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!teamId,
  });

  const alreadyMember = team?.team_members?.some((m: any) => m.user_id === user?.id);
  const maxSize = (team?.events as any)?.max_team_size || 4;
  const isFull = (team?.team_members?.length || 0) >= maxSize;

  const joinMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("team_members").insert({
        team_id: teamId!,
        user_id: user!.id,
      });
      if (error) throw error;

      // Send confirmation email
      try {
        await supabase.functions.invoke("send-registration-email", {
          body: {
            participantName: profile?.full_name || user?.email || "Participant",
            participantEmail: profile?.email || user?.email,
            eventTitle: `Team "${team?.name}" - ${(team?.events as any)?.title}`,
            eventDate: "You've joined via invite link",
            eventVenue: null,
          },
        });
      } catch (e) {
        console.error("Email failed:", e);
      }
    },
    onSuccess: () => {
      toast.success("You've joined the team!");
      queryClient.invalidateQueries({ queryKey: ["join-team", teamId] });
      queryClient.invalidateQueries({ queryKey: ["event-teams"] });
      setTimeout(() => navigate(`/events/${(team?.events as any)?.id}`), 1500);
    },
    onError: (err: any) => toast.error(err.message),
  });

  if (isLoading) return <div className="text-center py-16 text-muted-foreground">Loading...</div>;

  if (!team) {
    return (
      <div className="max-w-md mx-auto mt-20 text-center space-y-4">
        <XCircle className="h-12 w-12 mx-auto text-destructive" />
        <h2 className="text-xl font-display font-bold">Team Not Found</h2>
        <p className="text-muted-foreground">This invite link may be invalid or the team has been disbanded.</p>
        <Button onClick={() => navigate("/dashboard")}>Go to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto mt-12 px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <CardHeader className="text-center">
            <Users className="h-10 w-10 mx-auto text-primary mb-2" />
            <CardTitle className="font-display text-xl">Join Team</CardTitle>
            <p className="text-muted-foreground text-sm">You've been invited to join a team</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-muted/50 space-y-2">
              <p className="font-semibold text-lg">{team.name}</p>
              <p className="text-sm text-muted-foreground">{(team.events as any)?.title}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                {team.team_members?.map((m: any) => (
                  <span key={m.id} className="text-xs px-2 py-1 rounded-full bg-card border flex items-center gap-1">
                    {m.user_id === team.leader_id && <Crown className="h-3 w-3 text-primary" />}
                    {m.profiles?.full_name || "Member"}
                  </span>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {team.team_members?.length || 0}/{maxSize} members
              </p>
            </div>

            {alreadyMember ? (
              <div className="text-center space-y-3">
                <CheckCircle className="h-8 w-8 mx-auto text-green-500" />
                <p className="text-sm font-medium">You're already a member of this team!</p>
                <Button onClick={() => navigate(`/events/${(team.events as any)?.id}`)} className="w-full">
                  Go to Event
                </Button>
              </div>
            ) : isFull ? (
              <div className="text-center space-y-3">
                <XCircle className="h-8 w-8 mx-auto text-destructive" />
                <p className="text-sm font-medium">This team is full</p>
                <Button variant="outline" onClick={() => navigate("/events")} className="w-full">
                  Browse Events
                </Button>
              </div>
            ) : (
              <Button
                className="w-full gradient-primary"
                onClick={() => joinMutation.mutate()}
                disabled={joinMutation.isPending}
              >
                {joinMutation.isPending ? "Joining..." : "Join Team"}
              </Button>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default JoinTeam;
