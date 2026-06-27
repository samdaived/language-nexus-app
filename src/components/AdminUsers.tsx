import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/customSupabase";
import { useEffect, useState } from "react";

type ProfileRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  company: string | null;
};

type CompanyRow = {
  id: string;
  name: string;
  ice: string;
  rc: string;
  city: string;
  phone: string;
  office_address: string;
  storage_office: string;
};

export const AdminUsers = () => {
  const { t } = useLanguage();
  const tp: any = (t as any).profile;
  const ta: any = (t as any).admin;

  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [companies, setCompanies] = useState<CompanyRow[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // editable fields
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [companyId, setCompanyId] = useState<string>("");

  const [companyName, setCompanyName] = useState("");
  const [ice, setIce] = useState("");
  const [rc, setRc] = useState("");
  const [city, setCity] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [officeAddress, setOfficeAddress] = useState("");
  const [storageOffice, setStorageOffice] = useState("");

  const loadAll = async () => {
    const [{ data: ps }, { data: cs }] = await Promise.all([
      supabase
        .from("profiles")
        .select("id,email,full_name,phone,company")
        .order("email"),
      supabase
        .from("companies")
        .select("id,name,ice,rc,city,phone,office_address,storage_office")
        .order("name"),
    ]);
    setProfiles((ps as any) ?? []);
    setCompanies((cs as any) ?? []);
  };

  useEffect(() => {
    loadAll();
  }, []);

  const pickUser = async (uid: string) => {
    setSelectedUserId(uid);
    setLoading(true);
    const p = profiles.find((x) => x.id === uid);
    if (!p) return setLoading(false);
    setEmail(p.email ?? "");
    setFullName(p.full_name ?? "");
    setPhone(p.phone ?? "");
    setCompanyId(p.company ?? "");
    loadCompany(p.company ?? "");
    setLoading(false);
  };

  const loadCompany = (cid: string) => {
    const c = companies.find((x) => x.id === cid);
    setCompanyName(c?.name ?? "");
    setIce(c?.ice ?? "");
    setRc(c?.rc ?? "");
    setCity(c?.city ?? "");
    setCompanyPhone(c?.phone ?? "");
    setOfficeAddress(c?.office_address ?? "");
    setStorageOffice(c?.storage_office ?? "");
  };

  const save = async () => {
    if (!selectedUserId) return;
    setSaving(true);

    // update company if one is selected
    if (companyId) {
      const { error: cErr } = await supabase
        .from("companies")
        .update({
          name: companyName.trim(),
          ice: ice.trim(),
          rc: rc.trim(),
          city: city.trim(),
          phone: companyPhone.trim(),
          office_address: officeAddress.trim(),
          storage_office: storageOffice.trim(),
        })
        .eq("id", companyId);
      if (cErr) {
        setSaving(false);
        return toast({
          title: ta.error,
          description: cErr.message,
          variant: "destructive",
        });
      }
    }

    const { error: pErr } = await supabase
      .from("profiles")
      .update({
        full_name: fullName.trim() || null,
        phone: phone.trim() || null,
        company: companyId || null,
      })
      .eq("id", selectedUserId);

    setSaving(false);
    if (pErr)
      return toast({
        title: ta.error,
        description: pErr.message,
        variant: "destructive",
      });
    toast({ title: tp.saved });
    loadAll();
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="space-y-2 max-w-md">
        <Label>{ta.selectUser ?? "Select user"}</Label>
        <Select value={selectedUserId} onValueChange={pickUser}>
          <SelectTrigger>
            <SelectValue placeholder={ta.selectUser ?? "Select user"} />
          </SelectTrigger>
          <SelectContent>
            {profiles.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.email ?? p.id.slice(0, 8)}
                {p.full_name ? ` — ${p.full_name}` : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedUserId && (
        <>
          <div className="space-y-4">
            <h3 className="font-semibold">{tp.personalSection}</h3>
            <div className="space-y-2">
              <Label>{tp.email}</Label>
              <Input value={email} disabled />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{tp.fullName}</Label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label>{tp.phone}</Label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">{tp.companySection}</h3>
            <div className="space-y-2 max-w-md">
              <Label>{ta.assignCompany ?? "Assigned company"}</Label>
              <Select
                value={companyId}
                onValueChange={(v) => {
                  setCompanyId(v);
                  loadCompany(v);
                }}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={ta.assignCompany ?? "Assigned company"}
                  />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name || c.id.slice(0, 8)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {companyId && (
              <>
                <div className="space-y-2">
                  <Label>{tp.companyName}</Label>
                  <Input
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{tp.ice}</Label>
                    <Input
                      value={ice}
                      onChange={(e) => setIce(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{tp.rc}</Label>
                    <Input
                      value={rc}
                      onChange={(e) => setRc(e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{tp.city}</Label>
                    <Input
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{tp.companyPhone}</Label>
                    <Input
                      value={companyPhone}
                      onChange={(e) => setCompanyPhone(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{tp.officeAddress}</Label>
                  <Input
                    value={officeAddress}
                    onChange={(e) => setOfficeAddress(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{tp.storageOffice}</Label>
                  <Input
                    value={storageOffice}
                    onChange={(e) => setStorageOffice(e.target.value)}
                  />
                </div>
              </>
            )}
          </div>

          <div className="flex justify-end">
            <Button onClick={save} disabled={saving || loading}>
              {saving ? tp.saving : tp.save}
            </Button>
          </div>
        </>
      )}
    </Card>
  );
};
