import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Clock, Plus } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
  eventId: string;
  isAdmin: boolean;
}

const ScheduleSection = ({ eventId, isAdmin }: Props) => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", start_time: "", end_time: "", venue: "" });

  const { data: schedules } = useQuery({
    queryKey: ["event-schedules", eventId],
    queryFn: async () => {
      const { data } = await supabase.from("event_schedules").select("*").eq("event_id", eventId).order("start_time");
      return data || [];
    },
  });

  const addSchedule = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("event_schedules").insert({
        event_id: eventId,
        title: form.title,
        description: form.description || null,
        start_time: new Date(form.start_time).toISOString(),
        end_time: new Date(form.end_time).toISOString(),
        venue: form.venue || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Schedule added!");
      queryClient.invalidateQueries({ queryKey: ["event-schedules", eventId] });
      setOpen(false);
      setForm({ title: "", description: "", start_time: "", end_time: "", venue: "" });
    },
    onError: (err: any) => toast.error(err.message),
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-display">Schedule</CardTitle>
        {isAdmin && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="gap-1">
                <Plus className="h-3 w-3" /> Add
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Schedule Item</DialogTitle>
              </DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); addSchedule.mutate(); }} className="space-y-3">
                <div className="space-y-1">
                  <Label>Title *</Label>
                  <Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label>Description</Label>
                  <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label>Start *</Label>
                    <Input type="datetime-local" required value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <Label>End *</Label>
                    <Input type="datetime-local" required value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>Venue</Label>
                  <Input value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} />
                </div>
                <Button type="submit" className="w-full" disabled={addSchedule.isPending}>
                  {addSchedule.isPending ? "Adding..." : "Add Schedule"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent>
        {schedules && schedules.length > 0 ? (
          <div className="space-y-3">
            {schedules.map((s) => (
              <div key={s.id} className="flex gap-3 p-3 rounded-lg bg-muted/50">
                <div className="p-2 rounded-lg bg-primary/10 text-primary self-start">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium text-sm">{s.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(s.start_time), "h:mm a")} - {format(new Date(s.end_time), "h:mm a")}
                    {s.venue && ` · ${s.venue}`}
                  </p>
                  {s.description && <p className="text-xs text-muted-foreground mt-1">{s.description}</p>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No schedule items yet</p>
        )}
      </CardContent>
    </Card>
  );
};

export default ScheduleSection;
