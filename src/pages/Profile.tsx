import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/customSupabase";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirect = params.get("redirect");
  const { t, direction } = useLanguage();
  const tp = (t as any).profile;

  // Personal (profiles table)
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  // Company (companies table, linked via profiles.company)
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [ice, setIce] = useState("");
  const [rc, setRc] = useState("");
  const [city, setCity] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [officeAddress, setOfficeAddress] = useState("");
  const [storageOffice, setStorageOffice] = useState("");

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // RC is always disabled if a value already exists; otherwise editable so the
  // user can submit it on initial onboarding, after which it is locked forever.
  const iceLocked = ice.trim().length > 0;

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, phone, company")
        .eq("id", user.id)
        .maybeSingle();

      if (profile) {
        setFullName((profile as any).full_name ?? "");
        setPhone((profile as any).phone ?? "");
        const cid = (profile as any).company as string | null;
        if (cid) {
          setCompanyId(cid);
          const { data: company } = await supabase
            .from("companies")
            .select(
              "id, name, ice, rc, city, phone, office_address, storage_office",
            )
            .eq("id", cid)
            .maybeSingle();
          if (company) {
            setCompanyName((company as any).name ?? "");
            setIce((company as any).ice ?? "");
            setRc((company as any).rc ?? "");
            setCity((company as any).city ?? "");
            setCompanyPhone((company as any).phone ?? "");
            setOfficeAddress((company as any).office_address ?? "");
            setStorageOffice((company as any).storage_office ?? "");
          }
        }
      }
      setLoading(false);
    })();
  }, [user]);

  const save = async () => {
    if (!user) return;
    if (
      !fullName.trim() ||
      !phone.trim() ||
      !companyName.trim() ||
      !ice.trim() ||
      !rc.trim() ||
      !city.trim() ||
      !companyPhone.trim() ||
      !officeAddress.trim() ||
      !storageOffice.trim()
    ) {
      return toast({ title: tp.required, variant: "destructive" });
    }
    setSaving(true);

    // 1) Upsert company
    let cid = companyId;
    const companyPayload: any = {
      name: companyName.trim(),
      rc: rc.trim(),
      city: city.trim(),
      phone: companyPhone.trim(),
      office_address: officeAddress.trim(),
      storage_office: storageOffice.trim(),
    };
    if (cid) {
      // never update rc on existing companies
      const { error: cErr } = await supabase
        .from("companies")
        .update(companyPayload)
        .eq("id", cid);
      if (cErr) {
        setSaving(false);
        return toast({
          title: tp.error,
          description: cErr.message,
          variant: "destructive",
        });
      }
    } else {
      const { data: created, error: cErr } = await supabase
        .from("companies")
        .insert({ ...companyPayload, ice: ice.trim() })
        .select("id")
        .single();
      if (cErr || !created) {
        setSaving(false);
        return toast({
          title: tp.error,
          description: cErr?.message,
          variant: "destructive",
        });
      }
      cid = (created as any).id;
      setCompanyId(cid);
    }

    // 2) Upsert profile (email is set by auth, never edited here)
    const { error: pErr } = await supabase.from("profiles").upsert({
      id: user.id,
      email: user.email ?? null,
      full_name: fullName.trim(),
      phone: phone.trim(),
      company: cid,
    } as any);

    setSaving(false);
    if (pErr)
      return toast({
        title: tp.error,
        description: pErr.message,
        variant: "destructive",
      });
    toast({ title: tp.saved });
    if (redirect) navigate(redirect);
  };

  return (
    <div dir={direction} className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 p-4 md:p-8 pt-24 md:pt-28">
        <div className="max-w-2xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">{tp.title}</h1>
            <p className="text-sm text-muted-foreground">{tp.subtitle}</p>
          </div>

          {/* Personal information */}
          <Card className="p-6 space-y-4">
            <h2 className="text-lg font-semibold">{tp.personalSection}</h2>
            <div className="space-y-2">
              <Label>{tp.email}</Label>
              <Input value={user?.email ?? ""} disabled />
              <p className="text-xs text-muted-foreground">{tp.emailLocked}</p>
            </div>
            <div className="space-y-2">
              <Label>{tp.fullName} *</Label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label>{tp.phone} *</Label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={loading}
              />
            </div>
          </Card>

          {/* Company information */}
          <Card className="p-6 space-y-4">
            <h2 className="text-lg font-semibold">{tp.companySection}</h2>
            <div className="space-y-2">
              <Label>{tp.companyName} *</Label>
              <Input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{tp.ice} *</Label>
                <Input
                  value={ice}
                  onChange={(e) => setIce(e.target.value)}
                  disabled={loading || iceLocked}
                />
                {iceLocked && (
                  <p className="text-xs text-muted-foreground">
                    {tp.iceLocked}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>{tp.rc} *</Label>
                <Input
                  value={rc}
                  onChange={(e) => setRc(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{tp.city} *</Label>
                <Input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label>{tp.companyPhone} *</Label>
                <Input
                  value={companyPhone}
                  onChange={(e) => setCompanyPhone(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{tp.officeAddress} *</Label>
              <Input
                value={officeAddress}
                onChange={(e) => setOfficeAddress(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label>{tp.storageOffice} *</Label>
              <Input
                value={storageOffice}
                onChange={(e) => setStorageOffice(e.target.value)}
                disabled={loading}
              />
            </div>
          </Card>

          <div className="flex justify-end">
            <Button onClick={save} disabled={saving || loading}>
              {saving ? tp.saving : tp.save}
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
