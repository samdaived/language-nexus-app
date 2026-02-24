import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { AppLocale, LOCALE_CONFIG } from "@/i18n/translations";
import { MOCK_USERS } from "@/data/mockData";
import { UserRole } from "@/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe, Shield, Languages, User, Mail, Lock } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const LoginPage = () => {
  const { login, loginWithCredentials } = useAuth();
  const { t, locale, setLocale } = useLanguage();
  const [mode, setMode] = useState<"choose" | "credentials">("choose");
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const roleConfig: { role: UserRole; label: string; icon: React.ReactNode; description: string }[] = [
    { role: "admin", label: t("admin"), icon: <Shield className="h-8 w-8" />, description: t("adminDesc") },
    { role: "translator", label: t("translator"), icon: <Languages className="h-8 w-8" />, description: t("translatorDesc") },
    { role: "customer", label: t("customer"), icon: <User className="h-8 w-8" />, description: t("customerDesc") },
  ];

  const usersForRole = selectedRole ? MOCK_USERS.filter((u) => u.role === selectedRole) : [];

  const handleCredentialLogin = () => {
    const success = loginWithCredentials(email, password);
    if (!success) {
      toast({ title: t("invalidCredentials"), variant: "destructive" });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg animate-fade-in">
        {/* Language switcher */}
        <div className="mb-4 flex justify-end">
          <Select value={locale} onValueChange={(v) => setLocale(v as AppLocale)}>
            <SelectTrigger className="w-36 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.entries(LOCALE_CONFIG) as [AppLocale, { name: string }][]).map(([code, cfg]) => (
                <SelectItem key={code} value={code}>{cfg.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary">
            <Globe className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{t("loginTitle")}</h1>
          <p className="mt-2 text-muted-foreground">{t("loginSubtitle")}</p>
        </div>

        {mode === "credentials" ? (
          <Card className="p-6 space-y-4">
            <Button variant="ghost" size="sm" onClick={() => setMode("choose")} className="mb-2">
              ← {t("backToRoles")}
            </Button>
            <h3 className="text-lg font-semibold text-foreground">{t("orLoginWith")}</h3>
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Mail className="h-4 w-4" /> {t("email")}</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. sarah@translathub.com"
                onKeyDown={(e) => e.key === "Enter" && handleCredentialLogin()}
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Lock className="h-4 w-4" /> {t("password")}</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("password")}
                onKeyDown={(e) => e.key === "Enter" && handleCredentialLogin()}
              />
            </div>
            <Button onClick={handleCredentialLogin} className="w-full">{t("signIn")}</Button>
            <div className="rounded-lg bg-muted p-3 text-xs text-muted-foreground space-y-1">
              <p className="font-medium text-foreground text-sm mb-1">{t("demoCredentials")}:</p>
              <p>Admin: sarah@translathub.com / admin123</p>
              <p>Translator: carlos@translathub.com / trans123</p>
              <p>Customer: emily@acmecorp.com / cust123</p>
            </div>
          </Card>
        ) : !selectedRole ? (
          <div className="space-y-3">
            <Card
              className="cursor-pointer p-5 transition-all hover:border-primary hover:shadow-md border-dashed"
              onClick={() => setMode("credentials")}
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Lock className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{t("orLoginWith")}</h3>
                  <p className="text-sm text-muted-foreground">{t("email")} & {t("password")}</p>
                </div>
              </div>
            </Card>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">{t("selectRole")}</span></div>
            </div>

            {roleConfig.map((rc) => (
              <Card
                key={rc.role}
                className="cursor-pointer p-5 transition-all hover:border-primary hover:shadow-md"
                onClick={() => setSelectedRole(rc.role)}
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                    {rc.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{rc.label}</h3>
                    <p className="text-sm text-muted-foreground">{rc.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            <Button variant="ghost" size="sm" onClick={() => setSelectedRole(null)} className="mb-2">
              ← {t("backToRoles")}
            </Button>
            <p className="text-sm font-medium text-muted-foreground mb-4">
              {t("selectUser")}
            </p>
            {usersForRole.map((u) => (
              <Card
                key={u.id}
                className="cursor-pointer p-4 transition-all hover:border-primary hover:shadow-md"
                onClick={() => login(u.role, u.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                    {u.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{u.name}</p>
                    <p className="text-sm text-muted-foreground">{u.email}</p>
                    {u.languages && (
                      <p className="text-xs text-accent-foreground mt-0.5">{u.languages.join(", ")}</p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
