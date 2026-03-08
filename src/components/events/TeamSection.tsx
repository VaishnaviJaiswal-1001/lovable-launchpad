import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Users, Plus, UserPlus, LogOut, Crown, Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

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
  const [searchQuery, setSearchQuery] = useState("");

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

  const filteredTeams = teams?.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const createTeam = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.from("teams").insert({
        event_id: eventId,
        name: teamName,
        leader_id: user!.id,
      }).select().single();
      if (error) throw error;
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

  const leaveTeam = useMutation({
    mutationFn: async (teamId: string) => {
      const { error } = await supabase
        .from("team_members")
        .delete()
        .eq("team_id", teamId)
        .eq("user_id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Left team");
      queryClient.invalidateQueries({ queryKey: ["event-teams", eventId] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteTeam = useMutation({
    mutationFn: async (teamId: string) => {
      // Delete members first, then team
      await supabase.from("team_members").delete().eq("team_id", teamId);
      const { error } = await supabase.from("teams").delete().eq("id", teamId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Team disbanded");
      queryClient.invalidateQueries({ queryKey: ["event-teams", eventId] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="font-display">Teams</CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            {teams?.length || 0} team{(teams?.length || 0) !== 1 ? "s" : ""} • Max {maxTeamSize} per team
          </p>
        </div>
        {isRegistered && !myTeam && (
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="gap-1">
                <Plus className="h-3 w-3" /> Create Team
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-display">Create a Team</DialogTitle>
                <DialogDescription>Start a new team for this event. Others can join after you create it.</DialogDescription>
              </DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); createTeam.mutate(); }} className="space-y-4">
                <div className="space-y-2">
                  <Label>Team Name *</Label>
                  <Input required value={teamName} onChange={(e) => setTeamName(e.target.value)} placeholder="e.g., Team Alpha" maxLength={50} />
                </div>
                <Button type="submit" className="w-full gradient-primary" disabled={createTeam.isPending}>
                  {createTeam.isPending ? "Creating..." : "Create Team"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search teams */}
        {teams && teams.length > 3 && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search teams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        )}

        {/* My Team highlight */}
        {myTeam && (
          <div className="rounded-lg border-2 border-primary/30 bg-primary/5 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4 text-primary" />
                <span className="font-display font-semibold">{myTeam.name}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">Your Team</span>
                <span className="text-xs text-muted-foreground">({myTeam.team_members?.length || 0}/{maxTeamSize})</span>
              </div>
              <div className="flex gap-2">
                {myTeam.leader_id === user?.id ? (
                  <Button
                    size="sm"
                    variant="destructive"
                    className="gap-1 text-xs"
                    onClick={() => deleteTeam.mutate(myTeam.id)}
                    disabled={deleteTeam.isPending}
                  >
                    Disband
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1 text-xs text-destructive hover:text-destructive"
                    onClick={() => leaveTeam.mutate(myTeam.id)}
                    disabled={leaveTeam.isPending}
                  >
                    <LogOut className="h-3 w-3" /> Leave
                  </Button>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {myTeam.team_members?.map((m: any) => (
                <span key={m.id} className="text-xs px-2 py-1 rounded-full bg-card border flex items-center gap-1">
                  {m.user_id === myTeam.leader_id && <Crown className="h-3 w-3 text-primary" />}
                  {m.profiles?.full_name || m.profiles?.email || "Member"}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Other teams */}
        {filteredTeams && filteredTeams.length > 0 ? (
          <AnimatePresence>
            <div className="space-y-3">
              {filteredTeams
                .filter((t) => t.id !== myTeam?.id)
                .map((team, i) => {
                  const members = team.team_members || [];
                  const isFull = members.length >= maxTeamSize;

                  return (
                    <motion.div
                      key={team.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="p-3 rounded-lg bg-muted/50 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-accent" />
                          <span className="font-medium text-sm">{team.name}</span>
                          <span className="text-xs text-muted-foreground">({members.length}/{maxTeamSize})</span>
                          {isFull && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">Full</span>
                          )}
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
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {members.map((m: any) => (
                          <span key={m.id} className="text-xs px-2 py-1 rounded-full bg-card border flex items-center gap-1">
                            {m.user_id === team.leader_id && <Crown className="h-3 w-3 text-primary" />}
                            {m.profiles?.full_name || m.profiles?.email || "Member"}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  );
                })}
            </div>
          </AnimatePresence>
        ) : (
          !myTeam && <p className="text-sm text-muted-foreground text-center py-4">No teams yet. Be the first to create one!</p>
        )}
      </CardContent>
    </Card>
  );
};

export default TeamSection;
