import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, UserPlus, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const registerSchema = z.object({
  firstName: z.string().min(1, "Förnamn krävs"),
  lastName: z.string().min(1, "Efternamn krävs"),
  password: z.string().min(6, "Lösenordet måste vara minst 6 tecken"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Lösenorden matchar inte",
  path: ["confirmPassword"],
});

interface Invitation {
  id: string;
  email: string;
  organization_id: string;
  role: string;
  organizations: {
    name: string;
  };
}

export default function AcceptInvite() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const { toast } = useToast();

  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [isLoadingInvite, setIsLoadingInvite] = useState(true);
  const [isInvalid, setIsInvalid] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchInvitation = async () => {
      if (!token) {
        setIsInvalid(true);
        setIsLoadingInvite(false);
        return;
      }

      const { data, error } = await supabase
        .from("user_invitations")
        .select("id, email, organization_id, role, organizations(name)")
        .eq("token", token)
        .is("accepted_at", null)
        .gt("expires_at", new Date().toISOString())
        .single();

      if (error || !data) {
        setIsInvalid(true);
      } else {
        setInvitation(data as unknown as Invitation);
      }
      setIsLoadingInvite(false);
    };

    fetchInvitation();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!invitation) return;

    const result = registerSchema.safeParse({
      firstName,
      lastName,
      password,
      confirmPassword,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);

    // Sign up the user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: invitation.email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/portal`,
      },
    });

    if (authError) {
      setIsLoading(false);
      toast({
        title: "Ett fel uppstod",
        description: authError.message,
        variant: "destructive",
      });
      return;
    }

    if (!authData.user) {
      setIsLoading(false);
      toast({
        title: "Ett fel uppstod",
        description: "Kunde inte skapa användarkonto",
        variant: "destructive",
      });
      return;
    }

    // Create user profile
    const { error: profileError } = await supabase.from("user_profiles").insert({
      user_id: authData.user.id,
      organization_id: invitation.organization_id,
      first_name: firstName,
      last_name: lastName,
      email: invitation.email,
    } as any);

    if (profileError) {
      console.error("Profile error:", profileError);
    }

    // Create user role
    const { error: roleError } = await supabase.from("user_roles").insert({
      user_id: authData.user.id,
      role: invitation.role as any,
    } as any);

    if (roleError) {
      console.error("Role error:", roleError);
    }

    // Mark invitation as accepted
    await supabase
      .from("user_invitations")
      .update({ accepted_at: new Date().toISOString() })
      .eq("id", invitation.id);

    setIsLoading(false);

    toast({
      title: "Välkommen!",
      description: "Ditt konto har skapats. Du är nu inloggad.",
    });

    navigate("/portal");
  };

  if (isLoadingInvite) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isInvalid) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-card rounded-2xl shadow-elegant p-8 border border-border text-center">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            <h1 className="text-2xl font-serif font-semibold text-foreground mb-2">
              Ogiltig eller utgången inbjudan
            </h1>
            <p className="text-muted-foreground mb-6">
              Denna inbjudningslänk är inte längre giltig. Kontakta din administratör för en ny inbjudan.
            </p>
            <Link to="/">
              <Button className="w-full">Gå till startsidan</Button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-card rounded-2xl shadow-elegant p-8 border border-border">
          <Link to="/" className="flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-serif text-2xl font-bold">L</span>
            </div>
          </Link>

          <h1 className="text-2xl font-serif font-semibold text-center text-foreground mb-2">
            Skapa ditt konto
          </h1>
          <p className="text-muted-foreground text-center mb-2">
            Du har blivit inbjuden till
          </p>
          <p className="text-primary font-medium text-center mb-8">
            {invitation?.organizations?.name}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Förnamn</Label>
                <Input
                  id="firstName"
                  placeholder="Anna"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={isLoading}
                  className={errors.firstName ? "border-destructive" : ""}
                />
                {errors.firstName && (
                  <p className="text-xs text-destructive">{errors.firstName}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Efternamn</Label>
                <Input
                  id="lastName"
                  placeholder="Andersson"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={isLoading}
                  className={errors.lastName ? "border-destructive" : ""}
                />
                {errors.lastName && (
                  <p className="text-xs text-destructive">{errors.lastName}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>E-post</Label>
              <Input value={invitation?.email || ""} disabled className="bg-muted" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Lösenord</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className={errors.password ? "border-destructive pr-10" : "pr-10"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Bekräfta lösenord</Label>
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                className={errors.confirmPassword ? "border-destructive" : ""}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Skapa konto
                </>
              )}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
