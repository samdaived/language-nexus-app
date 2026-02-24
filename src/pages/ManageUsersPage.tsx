import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, Pencil } from "lucide-react";
import { User, UserRole } from "@/types";
import { toast } from "@/hooks/use-toast";

const ManageUsersPage = () => {
  const { user, users, updateUser } = useAuth();
  const { t } = useLanguage();
  const [filterRole, setFilterRole] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<UserRole>("customer");
  const [newHourlyRate, setNewHourlyRate] = useState("");

  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editHourlyRate, setEditHourlyRate] = useState("");

  if (!user || user.role !== "admin") return null;

  const filtered = filterRole === "all" ? users : users.filter((u) => u.role === filterRole);

  const handleAdd = () => {
    if (!newName || !newEmail) return;
    const newUser: User = {
      id: `${newRole}-${Date.now()}`,
      name: newName,
      email: newEmail,
      role: newRole,
      password: "password123",
      ...(newRole === "translator" && newHourlyRate ? { hourlyRate: Number(newHourlyRate) } : {}),
    };
    updateUser(newUser);
    setNewName("");
    setNewEmail("");
    setNewHourlyRate("");
    setDialogOpen(false);
    toast({ title: t("userAdded"), description: `${newName} ${t("hasBeenAddedAs")} ${t(newRole as any)}` });
  };

  const openEdit = (u: User) => {
    setEditingUser(u);
    setEditName(u.name);
    setEditEmail(u.email);
    setEditHourlyRate(u.hourlyRate?.toString() || "");
    setEditDialogOpen(true);
  };

  const handleEdit = () => {
    if (!editingUser || !editName || !editEmail) return;
    const updated: User = {
      ...editingUser,
      name: editName,
      email: editEmail,
      ...(editingUser.role === "translator" ? { hourlyRate: editHourlyRate ? Number(editHourlyRate) : undefined } : {}),
    };
    updateUser(updated);
    setEditDialogOpen(false);
    toast({ title: t("userUpdated"), description: `${editName} ${t("hasBeenUpdated")}` });
  };

  const roleFilters = [
    { key: "all", label: t("all") },
    { key: "admin", label: t("admins") },
    { key: "translator", label: t("translatorPlural") },
    { key: "customer", label: t("customerPlural") },
  ];

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header">{t("manageUsers")}</h1>
          <p className="page-subtitle">{users.length} {t("totalUsers")}</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><UserPlus className="h-4 w-4" />{t("addUser")}</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("addNewUser")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label>{t("name")}</Label>
                <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder={t("fullName")} />
              </div>
              <div>
                <Label>{t("email")}</Label>
                <Input value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="email@example.com" />
              </div>
              <div>
                <Label>{t("role")}</Label>
                <Select value={newRole} onValueChange={(v) => setNewRole(v as UserRole)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer">{t("customer")}</SelectItem>
                    <SelectItem value="translator">{t("translator")}</SelectItem>
                    <SelectItem value="admin">{t("admin")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {newRole === "translator" && (
                <div>
                  <Label>{t("hourlyRate")} (€)</Label>
                  <Input type="number" value={newHourlyRate} onChange={(e) => setNewHourlyRate(e.target.value)} placeholder="e.g. 50" />
                </div>
              )}
              <Button onClick={handleAdd} className="w-full">{t("addUser")}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-2 no-print">
        {roleFilters.map((r) => (
          <Button
            key={r.key}
            variant={filterRole === r.key ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterRole(r.key)}
          >
            {r.label}
          </Button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((u) => (
          <Card key={u.id} className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                {u.name.split(" ").map((n) => n[0]).join("")}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{u.name}</p>
                <p className="text-sm text-muted-foreground truncate">{u.email}</p>
                {u.role === "translator" && u.hourlyRate && (
                  <p className="text-xs text-primary font-medium">€{u.hourlyRate}/hr</p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant="secondary" className="capitalize">{t(u.role as any)}</Badge>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(u)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            {u.languages && (
              <div className="mt-2 flex flex-wrap gap-1">
                {u.languages.map((l) => (
                  <Badge key={l} variant="outline" className="text-xs">{l}</Badge>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("editUser")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label>{t("name")}</Label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>
            <div>
              <Label>{t("email")}</Label>
              <Input value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
            </div>
            {editingUser?.role === "translator" && (
              <div>
                <Label>{t("hourlyRate")} (€)</Label>
                <Input type="number" value={editHourlyRate} onChange={(e) => setEditHourlyRate(e.target.value)} placeholder="e.g. 50" />
              </div>
            )}
            <Button onClick={handleEdit} className="w-full">{t("saveChanges")}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageUsersPage;
