import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import {
  Bell,
  ChevronRight,
  Moon,
  Palette,
  Shield,
  Sun,
  User,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface SettingRowProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description?: string;
  children: React.ReactNode;
  ocid?: string;
}

function SettingRow({
  icon: Icon,
  label,
  description,
  children,
  ocid,
}: SettingRowProps) {
  return (
    <div
      data-ocid={ocid}
      className="flex items-center justify-between gap-4 py-4"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">{label}</p>
          {description && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {description}
            </p>
          )}
        </div>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

export function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, login, logout, principal } = useAuth();
  const [notifStudy, setNotifStudy] = useState(true);
  const [notifStreak, setNotifStreak] = useState(true);

  function handleSave() {
    toast.success("Settings saved!");
  }

  return (
    <div data-ocid="settings.page" className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">
          Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Customize your MemoryOS experience
        </p>
      </div>

      {/* Account */}
      <Card
        data-ocid="settings.account_section"
        className="border-border shadow-subtle"
      >
        <CardHeader>
          <CardTitle className="text-base font-display">Account</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border">
          <SettingRow
            icon={User}
            label="Identity"
            description={
              isAuthenticated
                ? `${principal?.toText().slice(0, 20)}…`
                : "Not signed in"
            }
            ocid="settings.identity_row"
          >
            {isAuthenticated ? (
              <Button
                variant="outline"
                size="sm"
                data-ocid="settings.logout_button"
                onClick={logout}
                className="text-xs"
              >
                Sign Out
              </Button>
            ) : (
              <Button
                size="sm"
                data-ocid="settings.login_button"
                onClick={() => login()}
                className="text-xs"
              >
                Sign In
              </Button>
            )}
          </SettingRow>
          <SettingRow
            icon={Shield}
            label="Data Privacy"
            description="Your data lives on the Internet Computer"
            ocid="settings.privacy_row"
          >
            <Badge
              variant="secondary"
              className="text-xs border-chart-3/40 text-chart-3 bg-chart-3/10"
            >
              Encrypted
            </Badge>
          </SettingRow>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card
        data-ocid="settings.appearance_section"
        className="border-border shadow-subtle"
      >
        <CardHeader>
          <CardTitle className="text-base font-display">Appearance</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border">
          <SettingRow
            icon={theme === "dark" ? Moon : Sun}
            label="Dark Mode"
            description="Switch between light and dark themes"
            ocid="settings.theme_row"
          >
            <Switch
              data-ocid="settings.theme_toggle"
              checked={theme === "dark"}
              onCheckedChange={toggleTheme}
              aria-label="Toggle dark mode"
            />
          </SettingRow>
          <SettingRow
            icon={Palette}
            label="Font Scale"
            description="Adjust text size"
            ocid="settings.font_row"
          >
            <Badge variant="outline" className="text-xs">
              Default
            </Badge>
          </SettingRow>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card
        data-ocid="settings.notifications_section"
        className="border-border shadow-subtle"
      >
        <CardHeader>
          <CardTitle className="text-base font-display">
            Notifications
          </CardTitle>
          <CardDescription className="text-xs">
            Control when MemoryOS reminds you to study
          </CardDescription>
        </CardHeader>
        <CardContent className="divide-y divide-border">
          <SettingRow
            icon={Bell}
            label="Daily Study Reminders"
            description="Get notified when cards are due"
            ocid="settings.study_reminder_row"
          >
            <Switch
              data-ocid="settings.study_reminder_toggle"
              checked={notifStudy}
              onCheckedChange={setNotifStudy}
              aria-label="Toggle study reminders"
            />
          </SettingRow>
          <SettingRow
            icon={Bell}
            label="Streak Alerts"
            description="Reminder to keep your streak alive"
            ocid="settings.streak_alert_row"
          >
            <Switch
              data-ocid="settings.streak_alert_toggle"
              checked={notifStreak}
              onCheckedChange={setNotifStreak}
              aria-label="Toggle streak alerts"
            />
          </SettingRow>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          data-ocid="settings.save_button"
          onClick={handleSave}
          className="gap-2"
        >
          Save Settings
        </Button>
      </div>
    </div>
  );
}
