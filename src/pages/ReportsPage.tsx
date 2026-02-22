import { useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { MOCK_BOOKINGS } from "@/data/mockData";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Printer } from "lucide-react";

const ReportsPage = () => {
  const { user } = useAuth();
  const today = new Date().toISOString().split("T")[0];
  const thirtyAgo = new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0];

  const [from, setFrom] = useState(thirtyAgo);
  const [to, setTo] = useState(today);

  const myBookings = useMemo(() => {
    if (!user) return [];
    return user.role === "admin"
      ? MOCK_BOOKINGS
      : MOCK_BOOKINGS.filter((b) =>
          user.role === "translator" ? b.translatorId === user.id : b.customerId === user.id
        );
  }, [user]);

  const filtered = useMemo(
    () => myBookings.filter((b) => b.date >= from && b.date <= to && b.status === "completed"),
    [myBookings, from, to]
  );

  const totalMinutes = filtered.reduce((s, b) => s + b.duration, 0);
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;

  const langBreakdown = useMemo(() => {
    const map: Record<string, { count: number; minutes: number }> = {};
    filtered.forEach((b) => {
      if (!map[b.language]) map[b.language] = { count: 0, minutes: 0 };
      map[b.language].count++;
      map[b.language].minutes += b.duration;
    });
    return Object.entries(map).sort((a, b) => b[1].minutes - a[1].minutes);
  }, [filtered]);

  if (!user) return null;

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header">Session Report</h1>
          <p className="page-subtitle">Generate and print reports for completed sessions</p>
        </div>
        <Button onClick={() => window.print()} className="no-print gap-2">
          <Printer className="h-4 w-4" />
          Print Report
        </Button>
      </div>

      <Card className="no-print p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <Label>From</Label>
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-44" />
          </div>
          <div>
            <Label>To</Label>
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-44" />
          </div>
        </div>
      </Card>

      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="stat-card">
            <p className="text-sm text-muted-foreground">Total Sessions</p>
            <p className="mt-1 text-3xl font-bold text-foreground">{filtered.length}</p>
          </Card>
          <Card className="stat-card">
            <p className="text-sm text-muted-foreground">Total Duration</p>
            <p className="mt-1 text-3xl font-bold text-foreground">{hours}h {mins}m</p>
          </Card>
          <Card className="stat-card">
            <p className="text-sm text-muted-foreground">Languages Used</p>
            <p className="mt-1 text-3xl font-bold text-foreground">{langBreakdown.length}</p>
          </Card>
        </div>

        {langBreakdown.length > 0 && (
          <Card className="p-6">
            <h3 className="mb-4 font-semibold text-foreground">Breakdown by Language</h3>
            <div className="space-y-3">
              {langBreakdown.map(([lang, data]) => (
                <div key={lang} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-primary" />
                    <span className="font-medium text-foreground">{lang}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {data.count} sessions · {Math.floor(data.minutes / 60)}h {data.minutes % 60}m
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}

        <Card className="overflow-hidden">
          <h3 className="px-4 py-3 font-semibold text-foreground border-b">Session Details</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted">
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Date</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Time</th>
                  {user.role !== "customer" && <th className="px-4 py-2 text-left font-medium text-muted-foreground">Customer</th>}
                  {user.role !== "translator" && <th className="px-4 py-2 text-left font-medium text-muted-foreground">Translator</th>}
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Language</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Duration</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No completed sessions in this period</td></tr>
                ) : (
                  filtered.map((b) => (
                    <tr key={b.id} className="border-b last:border-0">
                      <td className="px-4 py-2 text-foreground">{b.date}</td>
                      <td className="px-4 py-2 text-muted-foreground">{b.startTime}–{b.endTime}</td>
                      {user.role !== "customer" && <td className="px-4 py-2 text-foreground">{b.customerName}</td>}
                      {user.role !== "translator" && <td className="px-4 py-2 text-foreground">{b.translatorName}</td>}
                      <td className="px-4 py-2 text-foreground">{b.language}</td>
                      <td className="px-4 py-2 text-muted-foreground">{b.duration} min</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ReportsPage;
