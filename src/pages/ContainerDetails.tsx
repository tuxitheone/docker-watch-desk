import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Play, Square, RotateCw, Activity, Database, Network, HardDrive } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";

const ContainerDetails = () => {
  const navigate = useNavigate();

  const logLines = [
    { time: "2025-10-20T10:22:31Z", level: "INFO", message: "Server started on port 8080" },
    { time: "2025-10-20T10:22:35Z", level: "INFO", message: "Connected to database" },
    { time: "2025-10-20T10:22:42Z", level: "WARN", message: "High memory usage detected: 87%" },
    { time: "2025-10-20T10:23:01Z", level: "INFO", message: "Request processed: GET /api/health" },
    { time: "2025-10-20T10:23:15Z", level: "ERROR", message: "Connection timeout to external service" },
  ];

  return (
    <div className="min-h-screen bg-background dark">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={() => navigate("/dashboard")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-foreground">redis-prod</h1>
                  <Badge variant="default" className="bg-success hover:bg-success">
                    Running
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground font-mono mt-1">abc123def456</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Square className="w-4 h-4 mr-2" />
                Stop
              </Button>
              <Button variant="outline" size="sm">
                <RotateCw className="w-4 h-4 mr-2" />
                Restart
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Container Info */}
            <Card className="p-6 bg-card border-border">
              <h3 className="text-lg font-semibold text-foreground mb-4">Container Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Image</p>
                  <p className="font-mono text-foreground">redis:7.2-alpine</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Status</p>
                  <p className="text-foreground">Running (3d 14h)</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">IP Address</p>
                  <p className="font-mono text-foreground">172.18.0.5</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Ports</p>
                  <p className="font-mono text-foreground">6379:6379/tcp</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Network</p>
                  <p className="font-mono text-foreground">bridge</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Restart Policy</p>
                  <p className="text-foreground">unless-stopped</p>
                </div>
              </div>
            </Card>

            {/* Mounts */}
            <Card className="p-6 bg-card border-border">
              <h3 className="text-lg font-semibold text-foreground mb-4">Volume Mounts</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                  <div>
                    <p className="font-mono text-sm text-foreground">/var/lib/docker/volumes/redis_data</p>
                    <p className="text-xs text-muted-foreground mt-1">→ /data</p>
                  </div>
                  <Badge variant="outline">Read/Write</Badge>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="metrics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-6 bg-card border-border">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-card-foreground">CPU</h3>
                  </div>
                  <span className="text-2xl font-bold text-primary">2.5%</span>
                </div>
                <p className="text-xs text-muted-foreground">Real-time usage</p>
              </Card>

              <Card className="p-6 bg-card border-border">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-accent" />
                    <h3 className="font-semibold text-card-foreground">Memory</h3>
                  </div>
                  <span className="text-2xl font-bold text-accent">128 MB</span>
                </div>
                <p className="text-xs text-muted-foreground">of 512 MB limit</p>
              </Card>

              <Card className="p-6 bg-card border-border">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Network className="w-5 h-5 text-success" />
                    <h3 className="font-semibold text-card-foreground">Network</h3>
                  </div>
                  <span className="text-2xl font-bold text-success">1.2 MB/s</span>
                </div>
                <p className="text-xs text-muted-foreground">↓ 0.8 MB/s ↑ 0.4 MB/s</p>
              </Card>

              <Card className="p-6 bg-card border-border">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-5 h-5 text-warning" />
                    <h3 className="font-semibold text-card-foreground">Block I/O</h3>
                  </div>
                  <span className="text-2xl font-bold text-warning">45 KB/s</span>
                </div>
                <p className="text-xs text-muted-foreground">Read + Write</p>
              </Card>
            </div>

            <Card className="p-6 bg-card border-border">
              <h3 className="text-lg font-semibold text-foreground mb-4">Resource Usage Over Time</h3>
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                Live metrics chart (real-time WebSocket updates)
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="logs" className="space-y-4">
            <Card className="p-6 bg-card border-border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Live Log Stream</h3>
                <div className="flex gap-2">
                  <Input
                    placeholder="Filter logs (regex)..."
                    className="w-64 bg-secondary border-border"
                  />
                  <Button variant="outline" size="sm">
                    Pause
                  </Button>
                </div>
              </div>
              <div className="bg-background rounded-lg p-4 font-mono text-sm space-y-1 max-h-[600px] overflow-y-auto">
                {logLines.map((log, i) => (
                  <div key={i} className="flex gap-4 hover:bg-secondary/50 px-2 py-1 rounded">
                    <span className="text-muted-foreground">{log.time}</span>
                    <span
                      className={
                        log.level === "ERROR"
                          ? "text-destructive font-bold"
                          : log.level === "WARN"
                          ? "text-warning font-bold"
                          : "text-success"
                      }
                    >
                      [{log.level}]
                    </span>
                    <span className="text-foreground">{log.message}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Logs are streamed in real-time and not stored. Filtering happens client-side.
              </p>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card className="p-6 bg-card border-border">
              <h3 className="text-lg font-semibold text-foreground mb-6">Alert Configuration</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Enable Alerts</p>
                    <p className="text-sm text-muted-foreground">
                      Send Discord notifications for this container
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Alert on Stop</p>
                    <p className="text-sm text-muted-foreground">
                      Notify when container stops or crashes
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="space-y-2">
                  <label className="font-medium text-foreground">Error Pattern (Regex)</label>
                  <Input
                    defaultValue="(?i)(error|err|exception|traceback|crit(ical)?)"
                    className="font-mono bg-secondary border-border"
                  />
                  <p className="text-xs text-muted-foreground">
                    Logs matching this pattern will trigger an alert
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="font-medium text-foreground">Debounce Interval (seconds)</label>
                  <Input
                    type="number"
                    defaultValue="30"
                    className="bg-secondary border-border"
                  />
                  <p className="text-xs text-muted-foreground">
                    Minimum time between alerts to prevent spam
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="font-medium text-foreground">Custom Webhook URL (Optional)</label>
                  <Input
                    placeholder="https://discord.com/api/webhooks/..."
                    className="font-mono bg-secondary border-border"
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave empty to use global webhook
                  </p>
                </div>

                <Button className="w-full bg-primary hover:bg-primary/90">
                  Save Settings
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ContainerDetails;
