import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CalendarDays, Users, Shield, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* BG blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-accent/5 blur-3xl" />
      </div>

      {/* Nav */}
      <header className="relative z-10 container flex items-center justify-between h-16">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
            <CalendarDays className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-lg">EventHub</span>
        </div>
        <Link to="/auth">
          <Button variant="outline">Login</Button>
        </Link>
      </header>

      {/* Hero */}
      <section className="relative z-10 container pt-20 pb-32 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight max-w-4xl mx-auto leading-tight">
            Smart Platform for
            <span className="gradient-primary bg-clip-text text-transparent"> Multi-Event </span>
            Management
          </h1>
          <p className="text-lg text-muted-foreground mt-6 max-w-2xl mx-auto">
            Create events, manage teams, track registrations, and check-in attendees — all in one place. Built for colleges, hackathons, and organizations.
          </p>
          <div className="flex gap-3 justify-center mt-8">
            <Link to="/auth">
              <Button size="lg" className="gradient-primary gap-2 text-base px-8">
                Get Started <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 max-w-4xl mx-auto">
          {[
            { icon: CalendarDays, title: "Event Management", desc: "Create events with schedules, venues, and team configurations" },
            { icon: Users, title: "Team Formation", desc: "Create or join teams, collaborate with participants seamlessly" },
            { icon: Shield, title: "Admin Dashboard", desc: "Track attendees, manage check-ins, and send notifications" },
          ].map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.15, duration: 0.5 }}
              className="p-6 rounded-2xl glass text-left"
            >
              <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center mb-4">
                <feature.icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <h3 className="font-display font-semibold text-lg">{feature.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Index;
