import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

const CreateEventDialog = ({ open, onOpenChange, onCreated }: Props) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    venue: "",
    start_date: "",
    end_date: "",
    max_participants: "",
    max_team_size: "4",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      const { error } = await supabase.from("events").insert({
        title: form.title,
        description: form.description || null,
        venue: form.venue || null,
        start_date: new Date(form.start_date).toISOString(),
        end_date: new Date(form.end_date).toISOString(),
        max_participants: form.max_participants ? parseInt(form.max_participants) : null,
        max_team_size: parseInt(form.max_team_size) || 4,
        created_by: user.id,
      });
      if (error) throw error;
      toast.success("Event created!");
      onOpenChange(false);
      onCreated();
      setForm({ title: "", description: "", venue: "", start_date: "", end_date: "", max_participants: "", max_team_size: "4" });
    } catch (err: any) {
      toast.error(err.message || "Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display">Create New Event</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Event Title *</Label>
            <Input required value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="Hackathon 2026" />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="Describe the event..." rows={3} />
          </div>
          <div className="space-y-2">
            <Label>Venue</Label>
            <Input value={form.venue} onChange={(e) => update("venue", e.target.value)} placeholder="Auditorium A" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Start Date *</Label>
              <Input type="datetime-local" required value={form.start_date} onChange={(e) => update("start_date", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>End Date *</Label>
              <Input type="datetime-local" required value={form.end_date} onChange={(e) => update("end_date", e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Max Participants</Label>
              <Input type="number" value={form.max_participants} onChange={(e) => update("max_participants", e.target.value)} placeholder="100" />
            </div>
            <div className="space-y-2">
              <Label>Max Team Size</Label>
              <Input type="number" value={form.max_team_size} onChange={(e) => update("max_team_size", e.target.value)} placeholder="4" />
            </div>
          </div>
          <Button type="submit" className="w-full gradient-primary" disabled={loading}>
            {loading ? "Creating..." : "Create Event"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateEventDialog;
