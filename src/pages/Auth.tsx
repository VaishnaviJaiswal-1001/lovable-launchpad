import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, Shield, User, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

const Auth = () => {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [selectedRole, setSelectedRole] = useState<AppRole>("participant");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(loginEmail, loginPassword);
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signUp(signupEmail, signupPassword, signupName, selectedRole);
      toast.success("Account created! You can now log in.");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex relative">
      {/* Background */}
      <div className="fixed inset-0 gradient-mesh pointer-events-none" />
      <div className="fixed inset-0 dot-pattern pointer-events-none opacity-30" />

      {/* Left decorative panel */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden items-center justify-center gradient-primary">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_hsl(0_0%_100%_/_0.12)_0%,_transparent_60%)]" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center px-12 max-w-md"
        >
          <div className="h-20 w-20 rounded-3xl bg-card/20 backdrop-blur-lg flex items-center justify-center mx-auto mb-8 border border-white/10">
            <CalendarDays className="h-10 w-10 text-primary-foreground" />
          </div>
          <h2 className="text-4xl font-display font-bold text-primary-foreground mb-4">
            Welcome to Manageve
          </h2>
          <p className="text-primary-foreground/70 text-lg leading-relaxed">
            The smartest way to organize hackathons, meetups, and events.
          </p>
          <div className="mt-12 grid grid-cols-3 gap-4 text-primary-foreground/50 text-xs">
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <p className="text-2xl font-display font-bold text-primary-foreground/80">10K+</p>
              <p>Events</p>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <p className="text-2xl font-display font-bold text-primary-foreground/80">50K+</p>
              <p>Users</p>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <p className="text-2xl font-display font-bold text-primary-foreground/80">99.9%</p>
              <p>Uptime</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[420px]"
        >
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
            <ArrowLeft className="h-4 w-4" /> Back to home
          </Link>

          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4 lg:hidden">
              <div className="h-11 w-11 rounded-2xl gradient-primary flex items-center justify-center shadow-glow">
                <CalendarDays className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-xl">Manageve</span>
            </div>
            <h1 className="text-3xl font-display font-bold tracking-tight">Get started</h1>
            <p className="text-muted-foreground mt-1.5">Create an account or sign in to continue</p>
          </div>

          <Card className="shadow-card glass-strong border-border/30">
            <Tabs defaultValue="login">
              <div className="px-6 pt-6">
                <TabsList className="grid w-full grid-cols-2 h-11 rounded-xl bg-muted/70">
                  <TabsTrigger value="login" className="rounded-lg text-sm font-medium">Log in</TabsTrigger>
                  <TabsTrigger value="signup" className="rounded-lg text-sm font-medium">Sign up</TabsTrigger>
                </TabsList>
              </div>

              <CardContent className="pt-6 pb-6">
                <TabsContent value="login" className="mt-0">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email" className="text-sm font-medium">Email</Label>
                      <Input id="login-email" type="email" required value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="you@example.com" className="h-11 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password" className="text-sm font-medium">Password</Label>
                      <div className="relative">
                        <Input id="login-password" type={showPassword ? "text" : "password"} required value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="••••••••" className="h-11 rounded-xl pr-10" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <Button type="submit" className="w-full h-11 rounded-xl gradient-primary shadow-glow text-sm font-medium" disabled={loading}>
                      {loading ? "Logging in..." : "Log In"}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup" className="mt-0">
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name" className="text-sm font-medium">Full Name</Label>
                      <Input id="signup-name" required value={signupName} onChange={(e) => setSignupName(e.target.value)} placeholder="John Doe" className="h-11 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email" className="text-sm font-medium">Email</Label>
                      <Input id="signup-email" type="email" required value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} placeholder="you@example.com" className="h-11 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password" className="text-sm font-medium">Password</Label>
                      <Input id="signup-password" type="password" required minLength={6} value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} placeholder="Min 6 characters" className="h-11 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">I am a...</Label>
                      <div className="grid grid-cols-2 gap-3">
                        {([
                          { role: "participant" as AppRole, icon: User, label: "Participant", desc: "Join events & teams" },
                          { role: "admin" as AppRole, icon: Shield, label: "Organizer", desc: "Create & manage events" },
                        ] as const).map((opt) => (
                          <button
                            key={opt.role}
                            type="button"
                            onClick={() => setSelectedRole(opt.role)}
                            className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                              selectedRole === opt.role
                                ? "border-primary bg-primary/5 shadow-sm"
                                : "border-border hover:border-muted-foreground/30 hover:bg-muted/30"
                            }`}
                          >
                            <opt.icon className={`h-5 w-5 mb-2 ${selectedRole === opt.role ? "text-primary" : "text-muted-foreground"}`} />
                            <p className="text-sm font-semibold">{opt.label}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                    <Button type="submit" className="w-full h-11 rounded-xl gradient-primary shadow-glow text-sm font-medium" disabled={loading}>
                      {loading ? "Creating Account..." : "Create Account"}
                    </Button>
                  </form>
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>

          <p className="text-xs text-muted-foreground text-center mt-6">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
