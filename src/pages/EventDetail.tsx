import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, MapPin, Users, Clock, ArrowLeft, CheckCircle2 } from "lucide-react";
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

  if (!event) return (
    <div className="text-center py-20">
      <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
      <p className="text-muted-foreground text-sm mt-4">Loading event...</p>
    </div>
  );

  const isPast = new Date(event.end_date) < new Date();
  const isRegistered = !!registration;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-2 rounded-full text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back
      </Button>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Card className="overflow-hidden shadow-card border-border/40">
          {event.banner_url ? (
            <div className="relative w-full h-52 md:h-72 overflow-hidden">
              <img src={event.banner_url} alt={event.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
              {isPast && <div className="absolute inset-0 bg-background/50 backdrop-blur-sm" />}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h1 className="text-3xl font-display font-bold text-foreground">{event.title}</h1>
                {isPast && <Badge className="mt-2 bg-muted/80 text-muted-foreground border-0">Past Event</Badge>}
              </div>
            </div>
          ) : (
            <>
              <div className={`h-2 ${isPast ? "bg-muted" : "gradient-primary"}`} />
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-3xl font-display">{event.title}</CardTitle>
                    {isPast && <Badge className="mt-2 bg-muted text-muted-foreground border-0">Past Event</Badge>}
                  </div>
                </div>
              </CardHeader>
            </>
          )}
          <CardContent className={`space-y-5 ${event.banner_url ? "pt-4" : ""}`}>
            {/* Register button */}
            {!isAdmin && !isPast && (
              <div className="flex items-center gap-3">
                {isRegistered ? (
                  <div className="flex items-center gap-2 text-success text-sm font-medium bg-success/10 px-4 py-2.5 rounded-xl">
                    <CheckCircle2 className="h-4 w-4" /> You're registered for this event
                  </div>
                ) : (
                  <Button
                    className="gradient-primary rounded-full px-8 h-11 shadow-glow"
                    disabled={registerMutation.isPending}
                    onClick={() => setConfirmOpen(true)}
                  >
                    Register Now
                  </Button>
                )}
              </div>
            )}

            {event.description && <p className="text-muted-foreground leading-relaxed">{event.description}</p>}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: CalendarDays, label: format(new Date(event.start_date), "MMM d, yyyy") },
                { icon: Clock, label: `${format(new Date(event.start_date), "h:mm a")} - ${format(new Date(event.end_date), "h:mm a")}` },
                ...(event.venue ? [{ icon: MapPin, label: event.venue }] : []),
                ...(event.max_participants ? [{ icon: Users, label: `Max ${event.max_participants}` }] : []),
              ].map((info, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-sm p-3 rounded-xl bg-muted/50">
                  <info.icon className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-foreground/80">{info.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <ScheduleSection eventId={id!} isAdmin={isAdmin && event.created_by === user?.id} />
      <TeamSection eventId={id!} maxTeamSize={event.max_team_size || 4} isRegistered={isRegistered} />
      {isAdmin && <AttendeeList eventId={id!} />}

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
