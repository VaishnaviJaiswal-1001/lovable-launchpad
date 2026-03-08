import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CalendarDays, Users, Shield, ArrowRight, Sparkles, Zap, Globe, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};
const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
};

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>
  );
  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Background mesh */}
      <div className="fixed inset-0 gradient-mesh pointer-events-none" />
      <div className="fixed inset-0 dot-pattern pointer-events-none opacity-50" />

      {/* Animated orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: [0, 40, 0], y: [0, -30, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-40 left-1/4 w-[800px] h-[800px] rounded-full bg-primary/6 blur-[120px]"
        />
        <motion.div
          animate={{ x: [0, -30, 0], y: [0, 40, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-40 right-1/4 w-[700px] h-[700px] rounded-full bg-accent/6 blur-[120px]"
        />
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/3 right-1/3 w-[400px] h-[400px] rounded-full border border-primary/5"
        />
      </div>

      {/* Nav */}
      <header className="relative z-20 container flex items-center justify-between h-20">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl gradient-primary flex items-center justify-center shadow-glow">
            <CalendarDays className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-xl tracking-tight">Manageve</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/auth">
            <Button variant="ghost" className="rounded-full px-5 text-sm font-medium">
              Log in
            </Button>
          </Link>
          <Link to="/auth">
            <Button className="rounded-full px-6 gradient-primary shadow-glow text-sm font-medium">
              Get Started
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <motion.section
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 container pt-20 md:pt-32 pb-24 text-center"
      >
        <motion.div variants={item}>
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass text-sm text-muted-foreground mb-10 border border-primary/10">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>Smart event management for modern teams</span>
            <ArrowRight className="h-3.5 w-3.5 text-primary" />
          </div>
        </motion.div>

        <motion.h1
          variants={item}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-display font-bold tracking-tight max-w-5xl mx-auto leading-[1.05]"
        >
          Organize Events
          <br />
          <span className="text-gradient">Effortlessly</span>
        </motion.h1>

        <motion.p
          variants={item}
          className="text-lg md:text-xl text-muted-foreground mt-8 max-w-2xl mx-auto leading-relaxed"
        >
          Create hackathons, form teams, track registrations, and manage check-ins — all from one beautifully crafted dashboard.
        </motion.p>

        <motion.div variants={item} className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
          <Link to="/auth">
            <Button size="lg" className="gradient-primary gap-2.5 text-base px-10 h-14 rounded-full shadow-glow hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5">
              Start for Free <ArrowRight className="h-4.5 w-4.5" />
            </Button>
          </Link>
          <Link to="/auth">
            <Button size="lg" variant="outline" className="gap-2 text-base px-8 h-14 rounded-full border-border/60 hover:bg-card/80 transition-all">
              <Globe className="h-4 w-4" /> Explore Events
            </Button>
          </Link>
        </motion.div>

        {/* Stats row */}
        <motion.div variants={item} className="flex flex-wrap justify-center gap-8 md:gap-16 mt-16">
          {[
            { value: "10K+", label: "Events Created" },
            { value: "50K+", label: "Participants" },
            { value: "99.9%", label: "Uptime" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl md:text-4xl font-display font-bold text-gradient">{stat.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </motion.section>

      {/* Features */}
      <motion.section
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
        className="relative z-10 container pb-32"
      >
        <motion.div variants={item} className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold">Everything you need</h2>
          <p className="text-muted-foreground mt-3 max-w-lg mx-auto">
            Powerful tools to manage events of any size, from small meetups to large hackathons.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            {
              icon: CalendarDays,
              title: "Event Management",
              desc: "Create events with schedules, venues, banners, and participant limits in minutes.",
              color: "bg-primary/10 text-primary",
            },
            {
              icon: Users,
              title: "Team Formation",
              desc: "Participants create or join teams, collaborate seamlessly across your events.",
              color: "bg-accent/10 text-accent",
            },
            {
              icon: Shield,
              title: "Admin Dashboard",
              desc: "Track attendees, manage check-ins, and send real-time notifications at scale.",
              color: "bg-warning/10 text-warning",
            },
          ].map((feature, i) => (
            <motion.div
              key={feature.title}
              variants={item}
              className="group relative p-8 rounded-3xl glass-hero hover-lift cursor-default"
            >
              <div className={`h-14 w-14 rounded-2xl ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="h-7 w-7" />
              </div>
              <h3 className="font-display font-semibold text-xl mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Extra features list */}
        <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-12">
          {[
            "Email Notifications",
            "QR Check-in",
            "Team Limits",
            "Event Banners",
            "Registration Confirm",
            "Real-time Updates",
            "Role Management",
            "Schedule Builder",
          ].map((feat) => (
            <div key={feat} className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-accent shrink-0" />
              <span>{feat}</span>
            </div>
          ))}
        </motion.div>
      </motion.section>

      {/* CTA */}
      <section className="relative z-10 container pb-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative rounded-3xl overflow-hidden gradient-primary p-12 md:p-20 text-center"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(0_0%_100%_/_0.15)_0%,_transparent_60%)]" />
          <div className="relative z-10">
            <Zap className="h-10 w-10 text-primary-foreground/80 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-display font-bold text-primary-foreground mb-4">
              Ready to manage your next event?
            </h2>
            <p className="text-primary-foreground/70 max-w-lg mx-auto mb-8">
              Join thousands of organizers who trust Manageve to deliver flawless events.
            </p>
            <Link to="/auth">
              <Button size="lg" className="bg-card text-foreground hover:bg-card/90 rounded-full px-10 h-14 text-base font-semibold shadow-xl">
                Get Started — It's Free
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/40">
        <div className="container py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl gradient-primary flex items-center justify-center">
              <CalendarDays className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-sm">Manageve</span>
          </div>
          <p className="text-xs text-muted-foreground">© 2026 Manageve. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
