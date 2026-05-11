import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase, type Employee, type Attendance } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Loader2, CheckCircle2, XCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/attendance")({
  component: AttendancePage,
});

type Status = "Present" | "Absent" | "Late";

/**
 * AttendancePage Component
 * 
 * Manages daily attendance marking for employees with:
 * - Date selection (any date)
 * - Employee search and filtering
 * - Status marking (Present/Absent/Late)
 * - Real-time attendance counts
 * - Duplicate prevention (upsert)
 * 
 * Features:
 * - Search employees by name or ID
 * - Auto-generated check-in times
 * - Visual status indicators
 * - Live count updates
 */
function AttendancePage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [records, setRecords] = useState<Record<string, Attendance>>({});
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [search, setSearch] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const [{ data: emps }, { data: att }] = await Promise.all([
      supabase
        .from("employees")
        .select("*")
        .eq("status", "Active")
        .order("name"),
      supabase.from("attendance").select("*").eq("date", date),
    ]);
    setEmployees((emps ?? []) as Employee[]);
    const map: Record<string, Attendance> = {};
    ((att ?? []) as Attendance[]).forEach((r) => {
      map[r.employee_id] = r;
    });
    setRecords(map);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  const filtered = useMemo(
    () =>
      employees.filter((e) => {
        const q = search.toLowerCase();
        return (
          !q ||
          e.name.toLowerCase().includes(q) ||
          e.employee_id.toLowerCase().includes(q)
        );
      }),
    [employees, search],
  );

  const setStatus = async (emp: Employee, status: Status) => {
    setSavingId(emp.id);
    const checkInTime =
      status === "Absent" ? null : format(new Date(), "HH:mm");
    const payload = {
      employee_id: emp.employee_id,
      employee_name: emp.name,
      status,
      date,
      check_in_time: checkInTime,
    };
    const { data, error } = await supabase
      .from("attendance")
      .upsert(payload, { onConflict: "employee_id,date" })
      .select()
      .single();
    if (error) {
      toast.error(error.message);
    } else {
      setRecords((r) => ({ ...r, [emp.employee_id]: data as Attendance }));
      toast.success(`${emp.name} marked ${status}`);
    }
    setSavingId(null);
  };

  const counts = {
    Present: Object.values(records).filter((r) => r.status === "Present").length,
    Late: Object.values(records).filter((r) => r.status === "Late").length,
    Absent: Object.values(records).filter((r) => r.status === "Absent").length,
    Pending:
      employees.length -
      Object.keys(records).filter((id) =>
        employees.some((e) => e.employee_id === id),
      ).length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mark Attendance</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Record daily attendance for active employees.
        </p>
      </div>

      <Card className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            max={format(new Date(), "yyyy-MM-dd")}
            className="w-full sm:w-48"
          />
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search employees..."
              className="pl-9"
            />
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatBadge label="Present" count={counts.Present} tone="success" />
        <StatBadge label="Late" count={counts.Late} tone="warning" />
        <StatBadge label="Absent" count={counts.Absent} tone="destructive" />
        <StatBadge label="Pending" count={counts.Pending} tone="muted" />
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">Employee</th>
                <th className="px-4 py-3 text-left">Department</th>
                <th className="px-4 py-3 text-left">Current</th>
                <th className="px-4 py-3 text-right">Mark</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-12 text-center text-muted-foreground"
                  >
                    No active employees found.
                  </td>
                </tr>
              ) : (
                filtered.map((e) => {
                  const rec = records[e.employee_id];
                  return (
                    <tr key={e.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold text-primary-foreground"
                            style={{ background: "var(--gradient-primary)" }}
                          >
                            {e.name
                              .split(" ")
                              .map((n) => n[0])
                              .slice(0, 2)
                              .join("")}
                          </div>
                          <div>
                            <div className="font-medium">{e.name}</div>
                            <div className="font-mono text-xs text-muted-foreground">
                              {e.employee_id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {e.department}
                      </td>
                      <td className="px-4 py-3">
                        {rec ? (
                          <div className="flex items-center gap-2">
                            <StatusBadge status={rec.status} />
                            {rec.check_in_time && (
                              <span className="text-xs text-muted-foreground">
                                {rec.check_in_time}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            Not marked
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          {(["Present", "Late", "Absent"] as Status[]).map(
                            (s) => (
                              <Button
                                key={s}
                                size="sm"
                                variant={rec?.status === s ? "default" : "outline"}
                                disabled={savingId === e.id}
                                onClick={() => setStatus(e, s)}
                                className={
                                  rec?.status === s
                                    ? s === "Present"
                                      ? "bg-success text-success-foreground hover:bg-success/90"
                                      : s === "Late"
                                        ? "bg-warning text-warning-foreground hover:bg-warning/90"
                                        : "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    : ""
                                }
                              >
                                {s}
                              </Button>
                            ),
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function StatBadge({
  label,
  count,
  tone,
}: {
  label: string;
  count: number;
  tone: "success" | "warning" | "destructive" | "muted";
}) {
  const tones = {
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning-foreground",
    destructive: "bg-destructive/10 text-destructive",
    muted: "bg-muted text-muted-foreground",
  };
  return (
    <Card className="p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 flex items-center justify-between">
        <div className="text-2xl font-bold">{count}</div>
        <div
          className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${tones[tone]}`}
        >
          {label}
        </div>
      </div>
    </Card>
  );
}

function StatusBadge({ status }: { status: Status }) {
  if (status === "Present")
    return (
      <Badge className="bg-success/15 text-success hover:bg-success/20">
        <CheckCircle2 className="mr-1 h-3 w-3" />
        Present
      </Badge>
    );
  if (status === "Late")
    return (
      <Badge className="bg-warning/20 text-warning-foreground hover:bg-warning/30">
        <Clock className="mr-1 h-3 w-3" />
        Late
      </Badge>
    );
  return (
    <Badge className="bg-destructive/15 text-destructive hover:bg-destructive/20">
      <XCircle className="mr-1 h-3 w-3" />
      Absent
    </Badge>
  );
}
