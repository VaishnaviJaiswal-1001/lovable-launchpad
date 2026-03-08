import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CalendarDays, Users, Shield, ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen bg-background overflow-hidden relative">
      {/* Animated BG elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-32 left-1/4 w-[700px] h-[700px] rounded-full bg-primary/8 blur-[100px]"
        />
        <motion.div
          animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-32 right-1/4 w-[600px] h-[600px] rounded-full bg-accent/8 blur-[100px]"
        />
        <motion.div
          animate={{ x: [0, 15, 0], y: [0, 15, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/4 blur-[80px]"
        />
      </div>

      {/* Nav */}
      <header className="relative z-10 container flex items-center justify-between h-20">
        <div className="flex items-center gap-2.5">
          <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
            <CalendarDays className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-xl tracking-tight">Manageve</span>
        </div>
        <Link to="/auth">
          <Button variant="outline" className="rounded-full px-6 border-border/60 hover:shadow-md transition-all">
            Login
          </Button>
        </Link>
      </header>

      {/* Hero */}
      <section className="relative z-10 container pt-24 pb-36 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm text-muted-foreground mb-8"
          >
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Smart event management made simple
          </motion.div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold tracking-tight max-w-5xl mx-auto leading-[1.05]">
            Organize Events
            <br />
            <span className="gradient-primary bg-clip-text text-transparent">Effortlessly</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mt-8 max-w-2xl mx-auto leading-relaxed">
            Create events, form teams, track registrations, and check-in attendees — all from one powerful dashboard.
          </p>
          <div className="flex gap-4 justify-center mt-10">
            <Link to="/auth">
              <Button size="lg" className="gradient-primary gap-2 text-base px-10 h-13 rounded-full shadow-glow hover:shadow-lg transition-all">
                Get Started <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-28 max-w-5xl mx-auto">
          {[
            { icon: CalendarDays, title: "Event Management", desc: "Create events with schedules, venues, and team configurations in minutes" },
            { icon: Users, title: "Team Formation", desc: "Create or join teams, collaborate with participants seamlessly across events" },
            { icon: Shield, title: "Admin Dashboard", desc: "Track attendees, manage check-ins, and send real-time notifications" },
          ].map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.15, duration: 0.6 }}
              className="group p-8 rounded-2xl glass-strong text-left hover:-translate-y-1 transition-all duration-300 hover:shadow-lg"
            >
              <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center mb-5 group-hover:shadow-glow transition-shadow duration-300">
                <feature.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="font-display font-semibold text-lg">{feature.title}</h3>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Index;
