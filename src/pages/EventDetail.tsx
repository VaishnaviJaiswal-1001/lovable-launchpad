import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, MapPin, Users, Clock, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useState } from "react";
import TeamSection from "@/components/events/TeamSection";
import ScheduleSection from "@/components/events/ScheduleSection";
import AttendeeList from "@/components/events/AttendeeList";
import RegistrationConfirmDialog from "@/components/events/RegistrationConfirmDialog";

const EventDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user, role, profile } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isAdmin = role === "admin";
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { data: event } = useQuery({
    queryKey: ["event", id],
    queryFn: async () => {
      const { data } = await supabase.from("events").select("*").eq("id", id!).single();
      return data;
    },
    enabled: !!id,
  });

  const { data: registration } = useQuery({
    queryKey: ["my-registration", id, user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("registrations").select("*").eq("event_id", id!).eq("user_id", user!.id).maybeSingle();
      return data;
    },
    enabled: !!id && !!user,
  });

  const registerMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("registrations").insert({
        event_id: id!,
        user_id: user!.id,
      });
      if (error) throw error;

      // Trigger registration email via edge function
      try {
        await supabase.functions.invoke("send-registration-email", {
          body: {
            participantName: profile?.full_name || user?.email || "Participant",
            participantEmail: profile?.email || user?.email,
            eventTitle: event?.title,
            eventDate: format(new Date(event!.start_date), "MMM d, yyyy 'at' h:mm a"),
            eventVenue: event?.venue,
          },
        });
      } catch (emailErr) {
        console.error("Email notification failed:", emailErr);
      }
    },
    onSuccess: () => {
      toast.success("Registered successfully! A confirmation email has been sent.");
      setConfirmOpen(false);
      queryClient.invalidateQueries({ queryKey: ["my-registration", id] });
      queryClient.invalidateQueries({ queryKey: ["event-registrations", id] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  if (!event) return <div className="text-center py-16 text-muted-foreground">Loading...</div>;

  const isPast = new Date(event.end_date) < new Date();
  const isRegistered = !!registration;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-2">
        <ArrowLeft className="h-4 w-4" /> Back
      </Button>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="overflow-hidden">
          <div className={`h-3 ${isPast ? "bg-muted" : "gradient-primary"}`} />
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl font-display">{event.title}</CardTitle>
                {isPast && <Badge variant="secondary" className="mt-2">Past Event</Badge>}
              </div>
              {!isAdmin && !isPast && (
                <Button
                  className="gradient-primary"
                  disabled={isRegistered || registerMutation.isPending}
                  onClick={() => setConfirmOpen(true)}
                >
                  {isRegistered ? "✓ Registered" : "Register Now"}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {event.description && <p className="text-muted-foreground">{event.description}</p>}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <CalendarDays className="h-4 w-4 text-primary" />
                <span>{format(new Date(event.start_date), "MMM d, yyyy")}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-primary" />
                <span>{format(new Date(event.start_date), "h:mm a")} - {format(new Date(event.end_date), "h:mm a")}</span>
              </div>
              {event.venue && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>{event.venue}</span>
                </div>
              )}
              {event.max_participants && (
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-primary" />
                  <span>Max {event.max_participants}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <ScheduleSection eventId={id!} isAdmin={isAdmin && event.created_by === user?.id} />

      <TeamSection eventId={id!} maxTeamSize={event.max_team_size || 4} isRegistered={isRegistered} />

      {isAdmin && <AttendeeList eventId={id!} />}

      {/* Registration Confirmation Dialog */}
      {event && profile && (
        <RegistrationConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          event={event}
          profile={{ full_name: profile.full_name, email: profile.email }}
          onConfirm={() => registerMutation.mutate()}
          isPending={registerMutation.isPending}
        />
      )}
    </div>
  );
};

export default EventDetail;
