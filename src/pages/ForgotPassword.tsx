import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const emailSchema = z.object({
  email: z.string().email("Ogiltig e-postadress"),
});

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState("");

  const { resetPassword } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const result = emailSchema.safeParse({ email });
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }

    setIsLoading(true);
    const { error: resetError } = await resetPassword(email);
    setIsLoading(false);

    if (resetError) {
      toast({
        title: "Ett fel uppstod",
        description: resetError.message,
        variant: "destructive",
      });
      return;
    }

    setIsSent(true);
  };

  if (isSent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-card rounded-2xl shadow-elegant p-8 border border-border text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-serif font-semibold text-foreground mb-2">
              E-post skickad!
            </h1>
            <p className="text-muted-foreground mb-6">
              Vi har skickat instruktioner för att återställa ditt lösenord till{" "}
              <strong>{email}</strong>
            </p>
            <Link to="/login">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="w-4 h-4" />
                Tillbaka till inloggning
              </Button>
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
            Glömt lösenordet?
          </h1>
          <p className="text-muted-foreground text-center mb-8">
            Ange din e-postadress så skickar vi en återställningslänk
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">E-post</Label>
              <Input
                id="email"
                type="email"
                placeholder="din@email.se"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className={error ? "border-destructive" : ""}
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  Skicka återställningslänk
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            <Link to="/login" className="text-primary hover:underline">
              <ArrowLeft className="w-4 h-4 inline mr-1" />
              Tillbaka till inloggning
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
