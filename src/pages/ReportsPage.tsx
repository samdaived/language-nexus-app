import { useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useBookings } from "@/context/BookingsContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Printer } from "lucide-react";

const ReportsPage = () => {
  const { user, users } = useAuth();
  const today = new Date().toISOString().split("T")[0];
  const thirtyAgo = new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0];

  const [from, setFrom] = useState(thirtyAgo);
  const [to, setTo] = useState(today);
  const [rateOverrides, setRateOverrides] = useState<Record<string, number>>({});
  const [selectedTranslatorIds, setSelectedTranslatorIds] = useState<string[]>([]);

  const { bookings } = useBookings();

  const allTranslators = useMemo(() => users.filter((u) => u.role === "translator"), [users]);

  const toggleTranslator = (id: string) => {
    setSelectedTranslatorIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const selectAllTranslators = () => {
    if (selectedTranslatorIds.length === allTranslators.length) {
      setSelectedTranslatorIds([]);
    } else {
      setSelectedTranslatorIds(allTranslators.map((t) => t.id));
    }
  };

  const myBookings = useMemo(() => {
    if (!user) return [];
    if (user.role === "admin") {
      if (selectedTranslatorIds.length === 0) return bookings;
      return bookings.filter((b) => selectedTranslatorIds.includes(b.translatorId));
    }
    return bookings.filter((b) =>
      user.role === "translator" ? b.translatorId === user.id : b.customerId === user.id
    );
  }, [user, bookings, selectedTranslatorIds]);

  const filtered = useMemo(
    () => myBookings.filter((b) => b.date >= from && b.date <= to && b.status === "completed"),
    [myBookings, from, to]
  );

  const totalMinutes = filtered.reduce((s, b) => s + b.duration, 0);
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;

  const getRate = (translatorId: string) => {
    if (rateOverrides[translatorId] !== undefined) return rateOverrides[translatorId];
    const translator = users.find((u) => u.id === translatorId);
    return translator?.hourlyRate || 0;
  };

  const totalCost = useMemo(() => {
    return filtered.reduce((sum, b) => {
      const rate = getRate(b.translatorId);
      return sum + (rate * b.duration) / 60;
    }, 0);
  }, [filtered, rateOverrides, users]);

  const langBreakdown = useMemo(() => {
    const map: Record<string, { count: number; minutes: number; cost: number }> = {};
    filtered.forEach((b) => {
      if (!map[b.language]) map[b.language] = { count: 0, minutes: 0, cost: 0 };
      map[b.language].count++;
      map[b.language].minutes += b.duration;
      map[b.language].cost += (getRate(b.translatorId) * b.duration) / 60;
    });
    return Object.entries(map).sort((a, b) => b[1].minutes - a[1].minutes);
  }, [filtered, rateOverrides, users]);

  // Get unique translators in filtered results
  const translatorRates = useMemo(() => {
    const map = new Map<string, { name: string; rate: number }>();
    filtered.forEach((b) => {
      if (!map.has(b.translatorId)) {
        map.set(b.translatorId, { name: b.translatorName, rate: getRate(b.translatorId) });
      }
    });
    return Array.from(map.entries());
  }, [filtered, rateOverrides, users]);

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

        {user.role === "admin" && (
          <div className="mt-4 border-t pt-4">
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-semibold">Filter by Translator</Label>
              <Button variant="ghost" size="sm" onClick={selectAllTranslators} className="text-xs h-7">
                {selectedTranslatorIds.length === allTranslators.length ? "Deselect All" : "Select All"}
              </Button>
            </div>
            <div className="flex flex-wrap gap-3">
              {allTranslators.map((t) => (
                <label key={t.id} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={selectedTranslatorIds.includes(t.id)}
                    onCheckedChange={() => toggleTranslator(t.id)}
                  />
                  <span className="text-sm text-foreground">{t.name}</span>
                  {t.hourlyRate && <span className="text-xs text-muted-foreground">(€{t.hourlyRate}/hr)</span>}
                </label>
              ))}
            </div>
            {selectedTranslatorIds.length === 0 && (
              <p className="text-xs text-muted-foreground mt-2">No filter applied — showing all translators</p>
            )}
          </div>
        )}
      </Card>

      {/* Adjustable hourly rates */}
      {translatorRates.length > 0 && (
        <Card className="no-print p-4">
          <h3 className="mb-3 font-semibold text-foreground text-sm">Translator Hourly Rates (adjustable)</h3>
          <div className="flex flex-wrap gap-4">
            {translatorRates.map(([id, { name, rate }]) => (
              <div key={id} className="flex items-center gap-2">
                <Label className="text-sm whitespace-nowrap">{name}</Label>
                <div className="flex items-center gap-1">
                  <span className="text-sm text-muted-foreground">€</span>
                  <Input
                    type="number"
                    className="w-20 h-8"
                    value={rateOverrides[id] !== undefined ? rateOverrides[id] : rate}
                    onChange={(e) =>
                      setRateOverrides((prev) => ({ ...prev, [id]: Number(e.target.value) }))
                    }
                  />
                  <span className="text-xs text-muted-foreground">/hr</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-4">
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
          <Card className="stat-card">
            <p className="text-sm text-muted-foreground">Total Cost</p>
            <p className="mt-1 text-3xl font-bold text-foreground">€{totalCost.toFixed(2)}</p>
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
                    {data.count} sessions · {Math.floor(data.minutes / 60)}h {data.minutes % 60}m · €{data.cost.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {user.role === "admin" && translatorRates.length > 0 && (
          <Card className="p-6">
            <h3 className="mb-4 font-semibold text-foreground">Breakdown by Translator</h3>
            <div className="space-y-3">
              {translatorRates.map(([id, { name }]) => {
                const tBookings = filtered.filter((b) => b.translatorId === id);
                const tMinutes = tBookings.reduce((s, b) => s + b.duration, 0);
                const tCost = tBookings.reduce((s, b) => s + (getRate(b.translatorId) * b.duration) / 60, 0);
                return (
                  <div key={id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-3 w-3 rounded-full bg-accent-foreground" />
                      <span className="font-medium text-foreground">{name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {tBookings.length} sessions · {Math.floor(tMinutes / 60)}h {tMinutes % 60}m · €{tCost.toFixed(2)}
                    </span>
                  </div>
                );
              })}
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
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Rate</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Cost</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">No completed sessions in this period</td></tr>
                ) : (
                  filtered.map((b) => {
                    const rate = getRate(b.translatorId);
                    const cost = (rate * b.duration) / 60;
                    return (
                      <tr key={b.id} className="border-b last:border-0">
                        <td className="px-4 py-2 text-foreground">{b.date}</td>
                        <td className="px-4 py-2 text-muted-foreground">{b.startTime}–{b.endTime}</td>
                        {user.role !== "customer" && <td className="px-4 py-2 text-foreground">{b.customerName}</td>}
                        {user.role !== "translator" && <td className="px-4 py-2 text-foreground">{b.translatorName}</td>}
                        <td className="px-4 py-2 text-foreground">{b.language}</td>
                        <td className="px-4 py-2 text-muted-foreground">{b.duration} min</td>
                        <td className="px-4 py-2 text-muted-foreground">€{rate}/hr</td>
                        <td className="px-4 py-2 font-medium text-foreground">€{cost.toFixed(2)}</td>
                      </tr>
                    );
                  })
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
