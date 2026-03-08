import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ImagePlus, X } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

const CreateEventDialog = ({ open, onOpenChange, onCreated }: Props) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    venue: "",
    start_date: "",
    end_date: "",
    max_participants: "",
    max_team_size: "4",
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }
    setBannerFile(file);
    setBannerPreview(URL.createObjectURL(file));
  };

  const removeBanner = () => {
    setBannerFile(null);
    setBannerPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const uploadBanner = async (): Promise<string | null> => {
    if (!bannerFile || !user) return null;
    const ext = bannerFile.name.split(".").pop();
    const path = `${user.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("event-banners").upload(path, bannerFile);
    if (error) throw new Error("Failed to upload banner: " + error.message);
    const { data } = supabase.storage.from("event-banners").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      const bannerUrl = await uploadBanner();
      const { error } = await supabase.from("events").insert({
        title: form.title,
        description: form.description || null,
        venue: form.venue || null,
        start_date: new Date(form.start_date).toISOString(),
        end_date: new Date(form.end_date).toISOString(),
        max_participants: form.max_participants ? parseInt(form.max_participants) : null,
        max_team_size: parseInt(form.max_team_size) || 4,
        created_by: user.id,
        banner_url: bannerUrl,
      });
      if (error) throw error;
      toast.success("Event created!");
      onOpenChange(false);
      onCreated();
      setForm({ title: "", description: "", venue: "", start_date: "", end_date: "", max_participants: "", max_team_size: "4" });
      removeBanner();
    } catch (err: any) {
      toast.error(err.message || "Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">Create New Event</DialogTitle>
          <DialogDescription>Fill in the details to create a new hackathon or event.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Banner Image Upload */}
          <div className="space-y-2">
            <Label>Hackathon Banner Image</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            {bannerPreview ? (
              <div className="relative rounded-lg overflow-hidden border border-border">
                <img
                  src={bannerPreview}
                  alt="Banner preview"
                  className="w-full h-40 object-cover"
                />
                <button
                  type="button"
                  onClick={removeBanner}
                  className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm rounded-full p-1 hover:bg-destructive hover:text-destructive-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-40 rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
              >
                <ImagePlus className="h-8 w-8" />
                <span className="text-sm font-medium">Click to upload banner image</span>
                <span className="text-xs">PNG, JPG up to 5MB</span>
              </button>
            )}
          </div>

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
