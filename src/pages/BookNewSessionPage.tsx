import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useBookings } from "@/context/BookingsContext";
import { useLanguage } from "@/context/LanguageContext";
import { LANGUAGES } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Clock, User, Languages, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

const BookNewSessionPage = () => {
  const { user, users } = useAuth();
  const { addBooking } = useBookings();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [step, setStep] = useState(1);
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTranslatorId, setSelectedTranslatorId] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [duration, setDuration] = useState("60");
  const [notes, setNotes] = useState("");

  const availableTranslators = useMemo(() => {
    if (!selectedLanguage) return [];
    return users.filter(
      (u) => u.role === "translator" && u.languages?.includes(selectedLanguage)
    );
  }, [selectedLanguage, users]);

  const selectedTranslator = users.find((u) => u.id === selectedTranslatorId);

  if (!user || user.role !== "customer") return null;

  const calcEndTime = (start: string, dur: number) => {
    const [h, m] = start.split(":").map(Number);
    const totalMin = h * 60 + m + dur;
    return `${String(Math.floor(totalMin / 60) % 24).padStart(2, "0")}:${String(totalMin % 60).padStart(2, "0")}`;
  };

  const handleSubmit = () => {
    if (!selectedDate || !selectedTranslatorId || !selectedLanguage) return;

    const endTime = calcEndTime(startTime, Number(duration));
    const newBooking = {
      id: `b${Date.now()}`,
      customerId: user.id,
      customerName: user.name,
      translatorId: selectedTranslatorId,
      translatorName: selectedTranslator?.name || "",
      language: selectedLanguage,
      date: format(selectedDate, "yyyy-MM-dd"),
      startTime,
      endTime,
      status: "upcoming" as const,
      duration: Number(duration),
      notes: notes || undefined,
    };

    addBooking(newBooking);
    toast({ title: t("sessionBooked"), description: `${selectedLanguage} ${t("sessionOn")} ${format(selectedDate, "PPP")} ${t("with")} ${selectedTranslator?.name}` });
    navigate("/bookings");
  };

  const canProceedStep2 = !!selectedLanguage && !!selectedDate;
  const canProceedStep3 = canProceedStep2 && !!selectedTranslatorId;

  const steps = [
    { n: 1, label: t("languageAndDate") },
    { n: 2, label: t("selectTranslator") },
    { n: 3, label: t("confirm") },
  ];

  return (
    <div className="animate-fade-in space-y-6 max-w-2xl">
      <div>
        <h1 className="page-header">{t("bookSessionDesc")}</h1>
        <p className="page-subtitle">{t("bookSessionSubtitle")}</p>
      </div>

      <div className="flex items-center gap-2">
        {steps.map((s) => (
          <div key={s.n} className="flex items-center gap-2">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors",
                step >= s.n
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {step > s.n ? <CheckCircle2 className="h-4 w-4" /> : s.n}
            </div>
            <span className={cn("text-sm hidden sm:inline", step >= s.n ? "text-foreground font-medium" : "text-muted-foreground")}>{s.label}</span>
            {s.n < 3 && <div className="mx-2 h-px w-8 bg-border" />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <Card className="p-6 space-y-5">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Languages className="h-4 w-4 text-primary" /> {t("language")}
            </Label>
            <Select value={selectedLanguage} onValueChange={(v) => { setSelectedLanguage(v); setSelectedTranslatorId(""); }}>
              <SelectTrigger>
                <SelectValue placeholder={t("selectLanguage")} />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((l) => (
                  <SelectItem key={l.code} value={l.name}>{l.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedLanguage && (
              <p className="text-xs text-muted-foreground">
                {availableTranslators.length} {t("translatorsAvailable")} {selectedLanguage}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-primary" /> {t("date")}
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !selectedDate && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : t("pickDate")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          <Button onClick={() => setStep(2)} disabled={!canProceedStep2} className="w-full">
            {t("nextSelectTranslator")}
          </Button>
        </Card>
      )}

      {step === 2 && (
        <Card className="p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                {selectedLanguage} · {selectedDate && format(selectedDate, "PPP")}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setStep(1)}>{t("change")}</Button>
          </div>

          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <User className="h-4 w-4 text-primary" /> {t("availableTranslators")}
            </Label>
            {availableTranslators.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("noTranslatorsAvailable")} {selectedLanguage}.</p>
            ) : (
              availableTranslators.map((tr) => (
                <div
                  key={tr.id}
                  onClick={() => setSelectedTranslatorId(tr.id)}
                  className={cn(
                    "cursor-pointer rounded-lg border p-4 transition-colors",
                    selectedTranslatorId === tr.id
                      ? "border-primary bg-accent"
                      : "border-border hover:bg-muted"
                  )}
                >
                  <p className="font-medium text-foreground">{tr.name}</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {tr.languages?.map((lang) => (
                      <Badge key={lang} variant={lang === selectedLanguage ? "default" : "secondary"} className="text-[10px]">
                        {lang}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          <Button onClick={() => setStep(3)} disabled={!canProceedStep3} className="w-full">
            {t("nextSessionDetails")}
          </Button>
        </Card>
      )}

      {step === 3 && (
        <Card className="p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">{selectedLanguage} {t("with")} {selectedTranslator?.name}</p>
              <p className="text-sm text-muted-foreground">{selectedDate && format(selectedDate, "PPP")}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setStep(2)}>{t("change")}</Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" /> {t("startTime")}
              </Label>
              <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{t("duration")}</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 {t("min")}</SelectItem>
                  <SelectItem value="60">60 {t("min")}</SelectItem>
                  <SelectItem value="90">90 {t("min")}</SelectItem>
                  <SelectItem value="120">120 {t("min")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t("notesOptional")}</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t("notesPlaceholder")} />
          </div>

          <div className="rounded-lg bg-muted p-4 text-sm space-y-1">
            <p><span className="text-muted-foreground">{t("language")}:</span> <span className="font-medium text-foreground">{selectedLanguage}</span></p>
            <p><span className="text-muted-foreground">{t("translator")}:</span> <span className="font-medium text-foreground">{selectedTranslator?.name}</span></p>
            <p><span className="text-muted-foreground">{t("date")}:</span> <span className="font-medium text-foreground">{selectedDate && format(selectedDate, "PPP")}</span></p>
            <p><span className="text-muted-foreground">{t("time")}:</span> <span className="font-medium text-foreground">{startTime} – {calcEndTime(startTime, Number(duration))} ({duration} {t("min")})</span></p>
          </div>

          <Button onClick={handleSubmit} className="w-full">
            {t("confirmBooking")}
          </Button>
        </Card>
      )}
    </div>
  );
};

export default BookNewSessionPage;
