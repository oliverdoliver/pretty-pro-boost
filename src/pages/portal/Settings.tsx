import { useState } from "react";
import { motion } from "framer-motion";
import { User, Building2, Key, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import PortalLayout from "@/components/portal/PortalLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function Settings() {
  const { profile, updatePassword } = useAuth();
  const { toast } = useToast();

  const [firstName, setFirstName] = useState(profile?.first_name || "");
  const [lastName, setLastName] = useState(profile?.last_name || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const handleSaveProfile = async () => {
    if (!profile) return;

    setIsSavingProfile(true);

    const { error } = await supabase
      .from("user_profiles")
      .update({
        first_name: firstName,
        last_name: lastName,
        phone: phone || null,
      })
      .eq("id", profile.id);

    setIsSavingProfile(false);

    if (error) {
      toast({
        title: "Ett fel uppstod",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Profil uppdaterad",
      description: "Dina uppgifter har sparats.",
    });
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Lösenorden matchar inte",
        description: "Kontrollera att du har skrivit samma lösenord två gånger.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Lösenordet är för kort",
        description: "Lösenordet måste vara minst 6 tecken.",
        variant: "destructive",
      });
      return;
    }

    setIsSavingPassword(true);
    const { error } = await updatePassword(newPassword);
    setIsSavingPassword(false);

    if (error) {
      toast({
        title: "Ett fel uppstod",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Lösenord ändrat",
      description: "Ditt lösenord har uppdaterats.",
    });

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <PortalLayout>
      <div className="p-6 lg:p-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-serif font-semibold text-foreground">
            Inställningar
          </h1>
          <p className="text-muted-foreground mt-1">
            Hantera dina personliga uppgifter
          </p>
        </div>

        <div className="space-y-6">
          {/* Profile */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Personliga uppgifter
                </CardTitle>
                <CardDescription>
                  Uppdatera ditt namn och kontaktuppgifter
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Förnamn</Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Efternamn</Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-post</Label>
                  <Input id="email" value={profile?.email || ""} disabled className="bg-muted" />
                  <p className="text-xs text-muted-foreground">
                    E-postadressen kan inte ändras
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefon</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="070-123 45 67"
                  />
                </div>
                <Button onClick={handleSaveProfile} disabled={isSavingProfile}>
                  {isSavingProfile ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Spara ändringar"
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Password */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  Byt lösenord
                </CardTitle>
                <CardDescription>
                  Uppdatera ditt lösenord för ökad säkerhet
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nytt lösenord</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Bekräfta nytt lösenord</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
                <Button onClick={handleChangePassword} disabled={isSavingPassword}>
                  {isSavingPassword ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Byt lösenord"
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </PortalLayout>
  );
}
