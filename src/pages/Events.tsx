import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CalendarDays, MapPin, Users, Plus, Search, Image } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { useState } from "react";
import { motion } from "framer-motion";
import CreateEventDialog from "@/components/events/CreateEventDialog";

const Events = () => {
  const { role } = useAuth();
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const isAdmin = role === "admin";

  const { data: events, refetch } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const { data } = await supabase.from("events").select("*").order("start_date", { ascending: true });
      return data || [];
    },
  });

  const filtered = events?.filter((e) =>
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    e.venue?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title text-3xl">{isAdmin ? "Manage Events" : "Browse Events"}</h1>
          <p className="section-subtitle">
            {isAdmin ? "Create and manage your events" : "Find events to participate in"}
          </p>
        </div>
        {isAdmin && (
          <Button className="gradient-primary gap-2 rounded-full px-6 shadow-glow" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" /> Create Event
          </Button>
        )}
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search events by name or venue..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-11 h-11 rounded-xl bg-card/80 border-border/50"
        />
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((event, i) => {
            const isPast = new Date(event.end_date) < new Date();
            return (
              <motion.div key={event.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05, duration: 0.4 }}>
                <Link to={`/events/${event.id}`}>
                  <Card className="h-full hover-lift cursor-pointer overflow-hidden shadow-card border-border/40 group">
                    {event.banner_url ? (
                      <div className="relative h-40 overflow-hidden">
                        <img src={event.banner_url} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        {isPast && <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" />}
                        {isPast && (
                          <span className="absolute top-3 right-3 text-xs px-2.5 py-1 rounded-full bg-background/80 backdrop-blur text-muted-foreground font-medium">Past</span>
                        )}
                      </div>
                    ) : (
                      <div className={`h-2 rounded-t-lg ${isPast ? "bg-muted" : "gradient-primary"}`} />
                    )}
                    <CardContent className="pt-5 pb-5 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-display font-semibold text-lg leading-tight group-hover:text-primary transition-colors">{event.title}</h3>
                        {isPast && !event.banner_url && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground shrink-0 font-medium">Past</span>
                        )}
                      </div>
                      {event.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
                      )}
                      <div className="space-y-1.5 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="h-3.5 w-3.5 text-primary/60" />
                          <span>{format(new Date(event.start_date), "MMM d, yyyy · h:mm a")}</span>
                        </div>
                        {event.venue && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3.5 w-3.5 text-primary/60" />
                            <span>{event.venue}</span>
                          </div>
                        )}
                        {event.max_participants && (
                          <div className="flex items-center gap-2">
                            <Users className="h-3.5 w-3.5 text-primary/60" />
                            <span>Max {event.max_participants} participants</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <CalendarDays className="h-8 w-8 text-muted-foreground/40" />
          </div>
          <p className="text-muted-foreground font-medium">No events found</p>
          <p className="text-sm text-muted-foreground/60 mt-1">Try adjusting your search</p>
        </div>
      )}

      {isAdmin && <CreateEventDialog open={createOpen} onOpenChange={setCreateOpen} onCreated={refetch} />}
    </div>
  );
};

export default Events;
