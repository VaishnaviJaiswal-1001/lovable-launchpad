import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserCheck, UserX, Users, Crown, Clock, Mail } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface Props {
  eventId: string;
}

const AttendeeList = ({ eventId }: Props) => {
  const queryClient = useQueryClient();

  const { data: registrations } = useQuery({
    queryKey: ["event-registrations", eventId],
    queryFn: async () => {
      const { data } = await supabase
        .from("registrations")
        .select("*, profiles:user_id(full_name, email)")
        .eq("event_id", eventId)
        .order("registered_at");
      return data || [];
    },
  });

  const { data: teams } = useQuery({
    queryKey: ["event-teams-admin", eventId],
    queryFn: async () => {
      const { data } = await supabase
        .from("teams")
        .select("*, team_members(user_id)")
        .eq("event_id", eventId);
      return data || [];
    },
  });

  const toggleCheckIn = useMutation({
    mutationFn: async ({ regId, checkedIn }: { regId: string; checkedIn: boolean }) => {
      const { error } = await supabase.from("registrations").update({
        checked_in: !checkedIn,
        checked_in_at: !checkedIn ? new Date().toISOString() : null,
      }).eq("id", regId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-registrations", eventId] });
      toast.success("Updated!");
    },
    onError: (err: any) => toast.error(err.message),
  });

  // Build a map: userId -> { teamName, isLeader }
  const userTeamMap = new Map<string, { teamName: string; isLeader: boolean }>();
  teams?.forEach((team) => {
    const memberIds = (team.team_members as any[])?.map((m: any) => m.user_id) || [];
    memberIds.forEach((uid: string) => {
      userTeamMap.set(uid, { teamName: team.name, isLeader: team.leader_id === uid });
    });
  });

  const checkedInCount = registrations?.filter((r) => r.checked_in).length || 0;

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="font-display">Attendees ({registrations?.length || 0})</CardTitle>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <UserCheck className="h-3.5 w-3.5 text-success" /> {checkedInCount} checked in
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {registrations && registrations.length > 0 ? (
          <div className="space-y-2">
            {registrations.map((reg) => {
              const profile = (reg as any).profiles;
              const teamInfo = userTeamMap.get(reg.user_id);

              return (
                <div key={reg.id} className="flex items-center justify-between p-4 rounded-xl bg-muted/40 border border-border/40 hover:bg-muted/60 transition-colors">
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-sm">{profile?.full_name || "Unknown"}</p>
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
                        {format(new Date(reg.registered_at), "MMM d, yyyy 'at' h:mm a")}
                      </span>
                      {reg.checked_in && reg.checked_in_at && (
                        <span className="flex items-center gap-1 text-success">
                          <UserCheck className="h-3 w-3" />
                          Checked in {format(new Date(reg.checked_in_at), "h:mm a")}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant={reg.checked_in ? "default" : "outline"}
                    className="gap-1.5 rounded-full ml-3 shrink-0"
                    onClick={() => toggleCheckIn.mutate({ regId: reg.id, checkedIn: reg.checked_in })}
                  >
                    {reg.checked_in ? (
                      <><UserCheck className="h-3.5 w-3.5" /> Checked In</>
                    ) : (
                      <><UserX className="h-3.5 w-3.5" /> Check In</>
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-6">No attendees registered yet</p>
        )}
      </CardContent>
    </Card>
  );
};

export default AttendeeList;
