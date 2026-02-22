import { useAuth } from "@/context/AuthContext";
import { MOCK_BOOKINGS, MOCK_USERS } from "@/data/mockData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, Languages, TrendingUp } from "lucide-react";

const statusColor: Record<string, string> = {
  upcoming: "bg-info text-info-foreground",
  completed: "bg-success text-success-foreground",
  cancelled: "bg-destructive text-destructive-foreground",
};

const DashboardPage = () => {
  const { user } = useAuth();
  if (!user) return null;

  const myBookings =
    user.role === "admin"
      ? MOCK_BOOKINGS
      : MOCK_BOOKINGS.filter((b) =>
          user.role === "translator" ? b.translatorId === user.id : b.customerId === user.id
        );

  const upcoming = myBookings.filter((b) => b.status === "upcoming");
  const completed = myBookings.filter((b) => b.status === "completed");
  const totalMinutes = completed.reduce((sum, b) => sum + b.duration, 0);

  const stats = [
    { label: "Total Bookings", value: myBookings.length, icon: Calendar, color: "text-primary" },
    { label: "Upcoming", value: upcoming.length, icon: Clock, color: "text-info" },
    { label: "Completed", value: completed.length, icon: TrendingUp, color: "text-success" },
    ...(user.role === "admin"
      ? [
          { label: "Translators", value: MOCK_USERS.filter((u) => u.role === "translator").length, icon: Languages, color: "text-accent-foreground" },
          { label: "Customers", value: MOCK_USERS.filter((u) => u.role === "customer").length, icon: Users, color: "text-warning" },
        ]
      : [{ label: "Total Hours", value: Math.round(totalMinutes / 60), icon: Clock, color: "text-warning" }]),
  ];

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="page-header">Welcome back, {user.name.split(" ")[0]}</h1>
        <p className="page-subtitle capitalize">{user.role} Dashboard</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className="mt-1 text-3xl font-bold text-foreground">{s.value}</p>
              </div>
              <s.icon className={`h-8 w-8 ${s.color} opacity-80`} />
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Upcoming Sessions</h2>
          {upcoming.length === 0 ? (
            <p className="text-sm text-muted-foreground">No upcoming sessions</p>
          ) : (
            <div className="space-y-3">
              {upcoming.slice(0, 5).map((b) => (
                <div key={b.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium text-foreground">{user.role === "customer" ? b.translatorName : b.customerName}</p>
                    <p className="text-sm text-muted-foreground">
                      {b.date} · {b.startTime}–{b.endTime}
                    </p>
                  </div>
                  <Badge className={statusColor[b.status]}>{b.language}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Recent Sessions</h2>
          {completed.length === 0 ? (
            <p className="text-sm text-muted-foreground">No completed sessions</p>
          ) : (
            <div className="space-y-3">
              {completed.slice(0, 5).map((b) => (
                <div key={b.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium text-foreground">{user.role === "customer" ? b.translatorName : b.customerName}</p>
                    <p className="text-sm text-muted-foreground">
                      {b.date} · {b.duration} min
                    </p>
                  </div>
                  <Badge variant="secondary">{b.language}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
