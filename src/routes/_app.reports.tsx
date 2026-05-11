import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase, type Employee, type Attendance } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { Download, Loader2 } from "lucide-react";
import { format, subDays } from "date-fns";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/reports")({
  component: ReportsPage,
});

function ReportsPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [records, setRecords] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState(format(subDays(new Date(), 13), "yyyy-MM-dd"));
  const [to, setTo] = useState(format(new Date(), "yyyy-MM-dd"));
  const [dept, setDept] = useState("all");
  const [status, setStatus] = useState("all");

  const load = async () => {
    setLoading(true);
    const [{ data: emps }, { data: att }] = await Promise.all([
      supabase.from("employees").select("*"),
      supabase
        .from("attendance")
        .select("*")
        .gte("date", from)
        .lte("date", to)
        .order("date", { ascending: false }),
    ]);
    setEmployees((emps ?? []) as Employee[]);
    setRecords((att ?? []) as Attendance[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, to]);

  const empMap = useMemo(() => {
    const m: Record<string, Employee> = {};
    employees.forEach((e) => (m[e.employee_id] = e));
    return m;
  }, [employees]);

  const filtered = useMemo(
    () =>
      records.filter((r) => {
        const e = empMap[r.employee_id];
        if (dept !== "all" && (!e || e.department !== dept)) return false;
        if (status !== "all" && r.status !== status) return false;
        return true;
      }),
    [records, empMap, dept, status],
  );

  const departments = Array.from(new Set(employees.map((e) => e.department)));

  // Department stats
  const deptStats = departments.map((d) => {
    const ids = employees.filter((e) => e.department === d).map((e) => e.employee_id);
    const dr = records.filter((r) => ids.includes(r.employee_id));
    return {
      name: d,
      Present: dr.filter((r) => r.status === "Present").length,
      Late: dr.filter((r) => r.status === "Late").length,
      Absent: dr.filter((r) => r.status === "Absent").length,
    };
  });

  const summary = {
    total: filtered.length,
    present: filtered.filter((r) => r.status === "Present").length,
    late: filtered.filter((r) => r.status === "Late").length,
    absent: filtered.filter((r) => r.status === "Absent").length,
  };

  const exportCSV = () => {
    const rows = [
      ["Date", "Employee ID", "Employee Name", "Department", "Status", "Check-in"],
      ...filtered.map((r) => [
        r.date,
        r.employee_id,
        r.employee_name,
        empMap[r.employee_id]?.department ?? "",
        r.status,
        r.check_in_time ?? "",
      ]),
    ];
    const csv = rows
      .map((row) =>
        row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance-${from}-to-${to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Report exported");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Analyze attendance trends and export records.
          </p>
        </div>
        <Button onClick={exportCSV} disabled={filtered.length === 0}>
          <Download className="mr-2 h-4 w-4" /> Export CSV
        </Button>
      </div>

      <Card className="p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">From</label>
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">To</label>
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              Department
            </label>
            <Select value={dept} onValueChange={setDept}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {departments.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Status</label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="Present">Present</SelectItem>
                <SelectItem value="Late">Late</SelectItem>
                <SelectItem value="Absent">Absent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryCard label="Total Records" value={summary.total} />
        <SummaryCard label="Present" value={summary.present} tone="success" />
        <SummaryCard label="Late" value={summary.late} tone="warning" />
        <SummaryCard label="Absent" value={summary.absent} tone="destructive" />
      </div>

      <Card className="p-6">
        <h3 className="font-semibold">Department breakdown</h3>
        <p className="text-xs text-muted-foreground">
          Attendance counts per department in selected range
        </p>
        <div className="mt-4 h-72">
          {deptStats.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              No data
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 255)" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="oklch(0.5 0.03 258)" />
                <YAxis tick={{ fontSize: 12 }} stroke="oklch(0.5 0.03 258)" />
                <Tooltip
                  contentStyle={{
                    background: "oklch(1 0 0)",
                    border: "1px solid oklch(0.92 0.01 255)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Present" stackId="a" fill="oklch(0.65 0.17 155)" />
                <Bar dataKey="Late" stackId="a" fill="oklch(0.78 0.16 75)" />
                <Bar dataKey="Absent" stackId="a" fill="oklch(0.6 0.24 27)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="border-b border-border px-6 py-4">
          <h3 className="font-semibold">Records</h3>
          <p className="text-xs text-muted-foreground">
            {filtered.length} matching {filtered.length === 1 ? "record" : "records"}
          </p>
        </div>
        <div className="max-h-[500px] overflow-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-muted/80 text-xs uppercase tracking-wider text-muted-foreground backdrop-blur">
              <tr>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Employee</th>
                <th className="px-4 py-3 text-left">Department</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Check-in</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                    No records in selected range
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-mono text-xs">{r.date}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{r.employee_name}</div>
                      <div className="font-mono text-xs text-muted-foreground">
                        {r.employee_id}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {empMap[r.employee_id]?.department ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          r.status === "Present"
                            ? "rounded-full bg-success/15 px-2 py-0.5 text-xs font-medium text-success"
                            : r.status === "Late"
                              ? "rounded-full bg-warning/20 px-2 py-0.5 text-xs font-medium text-warning-foreground"
                              : "rounded-full bg-destructive/15 px-2 py-0.5 text-xs font-medium text-destructive"
                        }
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {r.check_in_time ?? "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "success" | "warning" | "destructive";
}) {
  const color =
    tone === "success"
      ? "text-success"
      : tone === "warning"
        ? "text-warning-foreground"
        : tone === "destructive"
          ? "text-destructive"
          : "text-foreground";
  return (
    <Card className="p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`mt-1 text-2xl font-bold ${color}`}>{value}</div>
    </Card>
  );
}
