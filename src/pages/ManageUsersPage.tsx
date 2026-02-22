import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { MOCK_USERS } from "@/data/mockData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus } from "lucide-react";
import { User, UserRole } from "@/types";

const ManageUsersPage = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [filterRole, setFilterRole] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<UserRole>("customer");

  if (!user || user.role !== "admin") return null;

  const filtered = filterRole === "all" ? users : users.filter((u) => u.role === filterRole);

  const handleAdd = () => {
    if (!newName || !newEmail) return;
    const newUser: User = {
      id: `${newRole}-${Date.now()}`,
      name: newName,
      email: newEmail,
      role: newRole,
    };
    setUsers([...users, newUser]);
    setNewName("");
    setNewEmail("");
    setDialogOpen(false);
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header">Manage Users</h1>
          <p className="page-subtitle">{users.length} total users</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><UserPlus className="h-4 w-4" />Add User</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label>Name</Label>
                <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Full name" />
              </div>
              <div>
                <Label>Email</Label>
                <Input value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="email@example.com" />
              </div>
              <div>
                <Label>Role</Label>
                <Select value={newRole} onValueChange={(v) => setNewRole(v as UserRole)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer">Customer</SelectItem>
                    <SelectItem value="translator">Translator</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAdd} className="w-full">Add User</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-2 no-print">
        {["all", "admin", "translator", "customer"].map((r) => (
          <Button
            key={r}
            variant={filterRole === r ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterRole(r)}
            className="capitalize"
          >
            {r === "all" ? "All" : `${r}s`}
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
              </div>
              <Badge variant="secondary" className="capitalize shrink-0">{u.role}</Badge>
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
    </div>
  );
};

export default ManageUsersPage;
