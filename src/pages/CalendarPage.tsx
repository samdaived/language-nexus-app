import { useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useBookings } from "@/context/BookingsContext";
import { useLanguage } from "@/context/LanguageContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

const statusDot: Record<string, string> = {
  upcoming: "bg-info",
  completed: "bg-success",
  cancelled: "bg-destructive",
};

const CalendarPage = () => {
  const { user } = useAuth();
  const { bookings } = useBookings();
  const { t } = useLanguage();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const DAYS = [t("sun"), t("mon"), t("tue"), t("wed"), t("thu"), t("fri"), t("sat")];

  const myBookings = useMemo(() => {
    if (!user) return [];
    return user.role === "admin"
      ? bookings
      : bookings.filter((b) =>
          user.role === "translator" ? b.translatorId === user.id : b.customerId === user.id
        );
  }, [user, bookings]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayStr = new Date().toISOString().split("T")[0];

  const bookingsByDate = useMemo(() => {
    const map: Record<string, typeof myBookings> = {};
    myBookings.forEach((b) => {
      if (!map[b.date]) map[b.date] = [];
      map[b.date].push(b);
    });
    return map;
  }, [myBookings]);

  if (!user) return null;

  const selectedBookings = selectedDate ? bookingsByDate[selectedDate] || [] : [];
  const prev = () => setCurrentDate(new Date(year, month - 1, 1));
  const next = () => setCurrentDate(new Date(year, month + 1, 1));
  const monthName = currentDate.toLocaleString("default", { month: "long", year: "numeric" });

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="page-header">{t("calendar")}</h1>
        <p className="page-subtitle">{t("calendarSubtitle")}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-xl border bg-card p-4">
            <div className="mb-4 flex items-center justify-between">
              <Button variant="ghost" size="icon" onClick={prev}><ChevronLeft className="h-4 w-4" /></Button>
              <h2 className="text-lg font-semibold text-foreground">{monthName}</h2>
              <Button variant="ghost" size="icon" onClick={next}><ChevronRight className="h-4 w-4" /></Button>
            </div>

            <div className="grid grid-cols-7 gap-px">
              {DAYS.map((d) => (
                <div key={d} className="py-2 text-center text-xs font-medium text-muted-foreground">{d}</div>
              ))}
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} className="h-20" />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const dayBookings = bookingsByDate[dateStr] || [];
                const isToday = dateStr === todayStr;
                const isSelected = dateStr === selectedDate;

                return (
                  <div
                    key={day}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`h-20 cursor-pointer rounded-lg border p-1.5 text-sm transition-colors ${
                      isSelected ? "border-primary bg-accent" : "border-transparent hover:bg-muted"
                    } ${isToday ? "ring-1 ring-primary" : ""}`}
                  >
                    <span className={`text-xs font-medium ${isToday ? "text-primary" : "text-foreground"}`}>{day}</span>
                    <div className="mt-0.5 space-y-0.5">
                      {dayBookings.slice(0, 2).map((b) => (
                        <div key={b.id} className="flex items-center gap-1">
                          <span className={`h-1.5 w-1.5 rounded-full ${statusDot[b.status]}`} />
                          <span className="truncate text-[10px] text-muted-foreground">{b.startTime} {b.language}</span>
                        </div>
                      ))}
                      {dayBookings.length > 2 && (
                        <span className="text-[10px] text-muted-foreground">+{dayBookings.length - 2} {t("more")}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-4">
          <h3 className="mb-3 font-semibold text-foreground">
            {selectedDate
              ? new Date(selectedDate + "T12:00:00").toLocaleDateString("default", { weekday: "long", month: "long", day: "numeric" })
              : t("selectDate")}
          </h3>
          {selectedDate && selectedBookings.length === 0 && (
            <p className="text-sm text-muted-foreground">{t("noSessionsDate")}</p>
          )}
          <div className="space-y-3">
            {selectedBookings.map((b) => (
              <div key={b.id} className="rounded-lg border p-3">
                <div className="flex items-center justify-between mb-1">
                  <Badge className={`${statusDot[b.status]} text-primary-foreground text-[10px]`}>{b.status}</Badge>
                  <span className="text-xs text-muted-foreground">{b.duration} {t("min")}</span>
                </div>
                <p className="font-medium text-foreground text-sm">
                  {user.role === "customer" ? b.translatorName : b.customerName}
                </p>
                <p className="text-xs text-muted-foreground">{b.startTime} – {b.endTime} · {b.language}</p>
                {b.notes && <p className="mt-1 text-xs text-muted-foreground italic">{b.notes}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
