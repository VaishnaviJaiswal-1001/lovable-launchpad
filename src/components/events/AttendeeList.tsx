import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserCheck, UserX } from "lucide-react";
import { toast } from "sonner";

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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display">Attendees ({registrations?.length || 0})</CardTitle>
      </CardHeader>
      <CardContent>
        {registrations && registrations.length > 0 ? (
          <div className="space-y-2">
            {registrations.map((reg) => (
              <div key={reg.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium text-sm">{(reg as any).profiles?.full_name || "Unknown"}</p>
                  <p className="text-xs text-muted-foreground">{(reg as any).profiles?.email}</p>
                </div>
                <Button
                  size="sm"
                  variant={reg.checked_in ? "default" : "outline"}
                  className="gap-1"
                  onClick={() => toggleCheckIn.mutate({ regId: reg.id, checkedIn: reg.checked_in })}
                >
                  {reg.checked_in ? (
                    <><UserCheck className="h-3 w-3" /> Checked In</>
                  ) : (
                    <><UserX className="h-3 w-3" /> Check In</>
                  )}
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No attendees yet</p>
        )}
      </CardContent>
    </Card>
  );
};

export default AttendeeList;
