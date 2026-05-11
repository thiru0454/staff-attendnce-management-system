import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase, type Employee, type Attendance } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  TrendingUp,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { format, subDays } from "date-fns";

export const Route = createFileRoute("/_app/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const since = format(subDays(new Date(), 13), "yyyy-MM-dd");
      const [{ data: emps }, { data: att }] = await Promise.all([
        supabase.from("employees").select("*"),
        supabase.from("attendance").select("*").gte("date", since),
      ]);
      setEmployees((emps ?? []) as Employee[]);
      setAttendance((att ?? []) as Attendance[]);
      setLoading(false);
    })();
  }, []);

  const today = format(new Date(), "yyyy-MM-dd");
  const todayAtt = attendance.filter((a) => a.date === today);
  const presentToday = todayAtt.filter((a) => a.status === "Present").length;
  const lateToday = todayAtt.filter((a) => a.status === "Late").length;
  const absentToday = todayAtt.filter((a) => a.status === "Absent").length;
  const totalEmployees = employees.length;
  const rate = totalEmployees
    ? Math.round(((presentToday + lateToday) / totalEmployees) * 100)
    : 0;

  // Last 7 days trend
  const trend = Array.from({ length: 7 }).map((_, i) => {
    const d = format(subDays(new Date(), 6 - i), "yyyy-MM-dd");
    const day = attendance.filter((a) => a.date === d);
    return {
      date: format(subDays(new Date(), 6 - i), "MMM d"),
      Present: day.filter((a) => a.status === "Present").length,
      Late: day.filter((a) => a.status === "Late").length,
      Absent: day.filter((a) => a.status === "Absent").length,
    };
  });

  // Department distribution
  const deptMap: Record<string, number> = {};
  employees.forEach((e) => {
    deptMap[e.department] = (deptMap[e.department] ?? 0) + 1;
  });
  const deptData = Object.entries(deptMap).map(([name, value]) => ({
    name,
    value,
  }));
  const colors = [
    "oklch(0.55 0.22 265)",
    "oklch(0.65 0.17 155)",
    "oklch(0.78 0.16 75)",
    "oklch(0.6 0.24 27)",
    "oklch(0.6 0.18 320)",
    "oklch(0.55 0.18 200)",
  ];

  const stats = [
    {
      label: "Total Employees",
      value: totalEmployees,
      icon: Users,
      tone: "text-primary bg-primary/10",
    },
    {
      label: "Present Today",
      value: presentToday,
      icon: UserCheck,
      tone: "text-success bg-success/10",
    },
    {
      label: "Late Today",
      value: lateToday,
      icon: Clock,
      tone: "text-warning bg-warning/10",
    },
    {
      label: "Absent Today",
      value: absentToday,
      icon: UserX,
      tone: "text-destructive bg-destructive/10",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Overview of your workforce and today's attendance.
          </p>
        </div>
        <div
          className="hidden items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm md:flex"
          title="Attendance rate today"
        >
          <TrendingUp className="h-4 w-4 text-success" />
          <span className="font-medium">{rate}%</span>
          <span className="text-muted-foreground">attendance today</span>
        </div>
      </div>

      {loading ? (
        <SkeletonGrid />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((s) => (
              <Card
                key={s.label}
                className="p-5"
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground">
                      {s.label}
                    </div>
                    <div className="mt-2 text-3xl font-bold tracking-tight">
                      {s.value}
                    </div>
                  </div>
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${s.tone}`}
                  >
                    <s.icon className="h-5 w-5" />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card className="p-6 lg:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Attendance — last 7 days</h3>
                  <p className="text-xs text-muted-foreground">
                    Daily breakdown by status
                  </p>
                </div>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trend}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="oklch(0.92 0.01 255)"
                    />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      stroke="oklch(0.5 0.03 258)"
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      stroke="oklch(0.5 0.03 258)"
                    />
                    <Tooltip
                      contentStyle={{
                        background: "oklch(1 0 0)",
                        border: "1px solid oklch(0.92 0.01 255)",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar
                      dataKey="Present"
                      fill="oklch(0.65 0.17 155)"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="Late"
                      fill="oklch(0.78 0.16 75)"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="Absent"
                      fill="oklch(0.6 0.24 27)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold">By Department</h3>
              <p className="text-xs text-muted-foreground">
                Headcount distribution
              </p>
              <div className="mt-2 h-72">
                {deptData.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    No employee data yet
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={deptData}
                        innerRadius={50}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {deptData.map((_, i) => (
                          <Cell key={i} fill={colors[i % colors.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: "oklch(1 0 0)",
                          border: "1px solid oklch(0.92 0.01 255)",
                          borderRadius: 8,
                          fontSize: 12,
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </Card>
          </div>

          <Card className="p-6">
            <h3 className="font-semibold">Attendance trend</h3>
            <p className="text-xs text-muted-foreground">
              Present count over time
            </p>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="oklch(0.92 0.01 255)"
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    stroke="oklch(0.5 0.03 258)"
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    stroke="oklch(0.5 0.03 258)"
                  />
                  <Tooltip
                    contentStyle={{
                      background: "oklch(1 0 0)",
                      border: "1px solid oklch(0.92 0.01 255)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="Present"
                    stroke="oklch(0.55 0.22 265)"
                    strokeWidth={2.5}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-28 animate-pulse rounded-xl bg-muted" />
      ))}
    </div>
  );
}
