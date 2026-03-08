import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, Plus, UserPlus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
  eventId: string;
  maxTeamSize: number;
  isRegistered: boolean;
}

const TeamSection = ({ eventId, maxTeamSize, isRegistered }: Props) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [teamName, setTeamName] = useState("");

  const { data: teams } = useQuery({
    queryKey: ["event-teams", eventId],
    queryFn: async () => {
      const { data } = await supabase
        .from("teams")
        .select("*, team_members(*, profiles:user_id(full_name, email))")
        .eq("event_id", eventId);
      return data || [];
    },
  });

  const myTeam = teams?.find((t) =>
    t.leader_id === user?.id || t.team_members.some((m: any) => m.user_id === user?.id)
  );

  const createTeam = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.from("teams").insert({
        event_id: eventId,
        name: teamName,
        leader_id: user!.id,
      }).select().single();
      if (error) throw error;
      // Add self as member
      await supabase.from("team_members").insert({ team_id: data.id, user_id: user!.id });
    },
    onSuccess: () => {
      toast.success("Team created!");
      queryClient.invalidateQueries({ queryKey: ["event-teams", eventId] });
      setCreateOpen(false);
      setTeamName("");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const joinTeam = useMutation({
    mutationFn: async (teamId: string) => {
      const { error } = await supabase.from("team_members").insert({
        team_id: teamId,
        user_id: user!.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Joined team!");
      queryClient.invalidateQueries({ queryKey: ["event-teams", eventId] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-display">Teams</CardTitle>
        {isRegistered && !myTeam && (
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="gap-1">
                <Plus className="h-3 w-3" /> Create Team
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create a Team</DialogTitle>
              </DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); createTeam.mutate(); }} className="space-y-3">
                <div className="space-y-1">
                  <Label>Team Name *</Label>
                  <Input required value={teamName} onChange={(e) => setTeamName(e.target.value)} placeholder="Team Alpha" />
                </div>
                <Button type="submit" className="w-full" disabled={createTeam.isPending}>
                  {createTeam.isPending ? "Creating..." : "Create Team"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent>
        {teams && teams.length > 0 ? (
          <div className="space-y-3">
            {teams.map((team) => {
              const members = team.team_members || [];
              const isFull = members.length >= maxTeamSize;
              const isMember = members.some((m: any) => m.user_id === user?.id);

              return (
                <div key={team.id} className="p-3 rounded-lg bg-muted/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-accent" />
                      <span className="font-medium text-sm">{team.name}</span>
                      <span className="text-xs text-muted-foreground">({members.length}/{maxTeamSize})</span>
                    </div>
                    {isRegistered && !myTeam && !isFull && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1 text-xs"
                        onClick={() => joinTeam.mutate(team.id)}
                        disabled={joinTeam.isPending}
                      >
                        <UserPlus className="h-3 w-3" /> Join
                      </Button>
                    )}
                    {isMember && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-success/10 text-success">Your Team</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {members.map((m: any) => (
                      <span key={m.id} className="text-xs px-2 py-1 rounded-full bg-card border">
                        {m.profiles?.full_name || m.profiles?.email || "Member"}
                        {m.user_id === team.leader_id && " ★"}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No teams yet. Be the first to create one!</p>
        )}
      </CardContent>
    </Card>
  );
};

export default TeamSection;
