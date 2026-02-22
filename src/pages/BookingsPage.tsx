import { useAuth } from "@/context/AuthContext";
import { MOCK_BOOKINGS } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const statusStyle: Record<string, string> = {
  upcoming: "bg-info text-info-foreground",
  completed: "bg-success text-success-foreground",
  cancelled: "bg-destructive text-destructive-foreground",
};

const BookingsPage = () => {
  const { user } = useAuth();
  if (!user) return null;

  const myBookings =
    user.role === "admin"
      ? MOCK_BOOKINGS
      : MOCK_BOOKINGS.filter((b) =>
          user.role === "translator" ? b.translatorId === user.id : b.customerId === user.id
        );

  const sorted = [...myBookings].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="page-header">Bookings</h1>
        <p className="page-subtitle">{sorted.length} total sessions</p>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Time</th>
                {user.role !== "customer" && <th className="px-4 py-3 text-left font-medium text-muted-foreground">Customer</th>}
                {user.role !== "translator" && <th className="px-4 py-3 text-left font-medium text-muted-foreground">Translator</th>}
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Language</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Duration</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((b) => (
                <tr key={b.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">{b.date}</td>
                  <td className="px-4 py-3 text-muted-foreground">{b.startTime}–{b.endTime}</td>
                  {user.role !== "customer" && <td className="px-4 py-3 text-foreground">{b.customerName}</td>}
                  {user.role !== "translator" && <td className="px-4 py-3 text-foreground">{b.translatorName}</td>}
                  <td className="px-4 py-3 text-foreground">{b.language}</td>
                  <td className="px-4 py-3 text-muted-foreground">{b.duration} min</td>
                  <td className="px-4 py-3">
                    <Badge className={statusStyle[b.status]}>{b.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default BookingsPage;
