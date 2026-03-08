import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CalendarDays, MapPin, Users, Plus, Search } from "lucide-react";
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">{isAdmin ? "Manage Events" : "Browse Events"}</h1>
          <p className="text-muted-foreground">
            {isAdmin ? "Create and manage your events" : "Find events to participate in"}
          </p>
        </div>
        {isAdmin && (
          <Button className="gradient-primary gap-2" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" /> Create Event
          </Button>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search events..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((event, i) => {
            const isPast = new Date(event.end_date) < new Date();
            return (
              <motion.div key={event.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Link to={`/events/${event.id}`}>
                  <Card className="h-full hover:shadow-lg transition-all hover:-translate-y-0.5 cursor-pointer overflow-hidden">
                    <div className={`h-2 ${isPast ? "bg-muted" : "gradient-primary"}`} />
                    <CardContent className="pt-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <h3 className="font-display font-semibold text-lg leading-tight">{event.title}</h3>
                        {isPast && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground shrink-0">Past</span>
                        )}
                      </div>
                      {event.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
                      )}
                      <div className="space-y-1.5 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="h-3.5 w-3.5" />
                          <span>{format(new Date(event.start_date), "MMM d, yyyy · h:mm a")}</span>
                        </div>
                        {event.venue && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3.5 w-3.5" />
                            <span>{event.venue}</span>
                          </div>
                        )}
                        {event.max_participants && (
                          <div className="flex items-center gap-2">
                            <Users className="h-3.5 w-3.5" />
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
        <div className="text-center py-16">
          <CalendarDays className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">No events found</p>
        </div>
      )}

      {isAdmin && <CreateEventDialog open={createOpen} onOpenChange={setCreateOpen} onCreated={refetch} />}
    </div>
  );
};

export default Events;
