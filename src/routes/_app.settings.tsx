import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, User, Lock, Mail } from "lucide-react";

export const Route = createFileRoute("/_app/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { user } = useAuth();
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [saving, setSaving] = useState(false);

  const updatePw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.length < 6) return toast.error("Password must be at least 6 characters");
    if (pw !== pw2) return toast.error("Passwords do not match");
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    if (error) toast.error(error.message);
    else {
      toast.success("Password updated");
      setPw("");
      setPw2("");
    }
    setSaving(false);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your administrator account.
        </p>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-xl text-lg font-bold text-primary-foreground"
            style={{ background: "var(--gradient-primary)" }}
          >
            {user?.email?.[0]?.toUpperCase() ?? "A"}
          </div>
          <div>
            <div className="text-lg font-semibold">Administrator</div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Mail className="h-3.5 w-3.5" />
              {user?.email}
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <Lock className="h-4 w-4" />
          <h2 className="font-semibold">Change Password</h2>
        </div>
        <form onSubmit={updatePw} className="space-y-4">
          <div className="space-y-2">
            <Label>New password</Label>
            <Input
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              minLength={6}
              required
              placeholder="At least 6 characters"
            />
          </div>
          <div className="space-y-2">
            <Label>Confirm password</Label>
            <Input
              type="password"
              value={pw2}
              onChange={(e) => setPw2(e.target.value)}
              minLength={6}
              required
            />
          </div>
          <Button type="submit" disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update password
          </Button>
        </form>
      </Card>

      <Card className="p-6">
        <div className="mb-2 flex items-center gap-2">
          <User className="h-4 w-4" />
          <h2 className="font-semibold">About SAMS</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Staff Attendance Management System v1.0 — A modern attendance platform
          built with React, TanStack Start, Tailwind CSS, and Supabase.
        </p>
      </Card>
    </div>
  );
}
