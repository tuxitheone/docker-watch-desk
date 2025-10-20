import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Bell, Clock, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Switch } from "@/components/ui/switch";

const Settings = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background dark">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 max-w-4xl space-y-6">
        {/* Discord Webhooks */}
        <Card className="p-6 bg-card border-border">
          <div className="flex items-center gap-2 mb-6">
            <Bell className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Discord Webhooks</h3>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="font-medium text-foreground">Global Webhook URL</label>
              <Input
                placeholder="https://discord.com/api/webhooks/..."
                className="font-mono bg-secondary border-border"
              />
              <p className="text-xs text-muted-foreground">
                Default webhook for all containers without a custom webhook
              </p>
            </div>
            <Button variant="outline" className="w-full">
              Test Webhook
            </Button>
          </div>
        </Card>

        {/* Metrics & Monitoring */}
        <Card className="p-6 bg-card border-border">
          <div className="flex items-center gap-2 mb-6">
            <Clock className="w-5 h-5 text-accent" />
            <h3 className="text-lg font-semibold text-foreground">Metrics & Monitoring</h3>
          </div>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="font-medium text-foreground">Scrape Interval (ms)</label>
              <Input
                type="number"
                defaultValue="2000"
                className="bg-secondary border-border"
              />
              <p className="text-xs text-muted-foreground">
                How often to collect metrics from Docker (lower = more resource usage)
              </p>
            </div>

            <div className="space-y-2">
              <label className="font-medium text-foreground">Retention Points</label>
              <Input
                type="number"
                defaultValue="120"
                className="bg-secondary border-border"
              />
              <p className="text-xs text-muted-foreground">
                Number of data points to keep in memory (for charts)
              </p>
            </div>

            <div className="space-y-2">
              <label className="font-medium text-foreground">Default Error Pattern</label>
              <Input
                defaultValue="(?i)(error|err|exception|traceback|crit(ical)?)"
                className="font-mono bg-secondary border-border"
              />
              <p className="text-xs text-muted-foreground">
                Default regex pattern for detecting errors in logs
              </p>
            </div>

            <div className="space-y-2">
              <label className="font-medium text-foreground">Default Debounce (seconds)</label>
              <Input
                type="number"
                defaultValue="30"
                className="bg-secondary border-border"
              />
              <p className="text-xs text-muted-foreground">
                Default time between alerts to prevent spam
              </p>
            </div>
          </div>
        </Card>

        {/* General Settings */}
        <Card className="p-6 bg-card border-border">
          <div className="flex items-center gap-2 mb-6">
            <Globe className="w-5 h-5 text-success" />
            <h3 className="text-lg font-semibold text-foreground">General</h3>
          </div>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="font-medium text-foreground">Timezone</label>
              <Input
                defaultValue="Europe/Copenhagen"
                className="bg-secondary border-border"
              />
              <p className="text-xs text-muted-foreground">
                Used for timestamps in logs and alerts
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Dark Mode</p>
                <p className="text-sm text-muted-foreground">
                  Use dark theme (recommended for monitoring dashboards)
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </Card>

        {/* Admin */}
        <Card className="p-6 bg-card border-border">
          <h3 className="text-lg font-semibold text-foreground mb-6">Admin</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="font-medium text-foreground">Change Password</label>
              <Input
                type="password"
                placeholder="Current password"
                className="bg-secondary border-border"
              />
              <Input
                type="password"
                placeholder="New password"
                className="bg-secondary border-border"
              />
              <Input
                type="password"
                placeholder="Confirm new password"
                className="bg-secondary border-border"
              />
            </div>
            <Button className="w-full bg-primary hover:bg-primary/90">
              Update Password
            </Button>
          </div>
        </Card>

        {/* Save All */}
        <div className="flex gap-4">
          <Button variant="outline" className="flex-1" onClick={() => navigate("/dashboard")}>
            Cancel
          </Button>
          <Button className="flex-1 bg-primary hover:bg-primary/90">
            Save All Settings
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
