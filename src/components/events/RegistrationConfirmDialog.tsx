import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, MapPin, Users, User, Mail, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";

interface EventData {
  title: string;
  start_date: string;
  end_date: string;
  venue?: string | null;
  max_participants?: number | null;
  description?: string | null;
}

interface ProfileData {
  full_name: string;
  email: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: EventData;
  profile: ProfileData;
  onConfirm: () => void;
  isPending: boolean;
}

const RegistrationConfirmDialog = ({ open, onOpenChange, event, profile, onConfirm, isPending }: Props) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            Confirm Registration
          </DialogTitle>
          <DialogDescription>
            Please review your details before registering for this event.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Event Details */}
          <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Event Details</h3>
            <p className="font-display font-bold text-lg">{event.title}</p>
            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center gap-2 text-sm">
                <CalendarDays className="h-4 w-4 text-primary" />
                <span>{format(new Date(event.start_date), "MMM d, yyyy 'at' h:mm a")}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CalendarDays className="h-4 w-4 text-primary" />
                <span>Ends: {format(new Date(event.end_date), "MMM d, yyyy 'at' h:mm a")}</span>
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
                  <span>Max {event.max_participants} participants</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Participant Details */}
          <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Your Details</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-accent" />
                <span className="font-medium">{profile.full_name || "—"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-accent" />
                <span>{profile.email}</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-primary/5 border border-primary/20 p-3">
            <p className="text-xs text-muted-foreground">
              By confirming, you'll be registered for this event. A confirmation email will be sent to your email address.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button className="gradient-primary" onClick={onConfirm} disabled={isPending}>
            {isPending ? "Registering..." : "Confirm Registration"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RegistrationConfirmDialog;
