import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, Server, HardDrive, Network, Play, Square, RotateCw, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Dashboard = () => {
  const containers = [
    { id: "abc123", name: "redis-prod", status: "running", cpu: "2.5%", memory: "128 MB", uptime: "3d 14h" },
    { id: "def456", name: "postgres-main", status: "running", cpu: "5.2%", memory: "512 MB", uptime: "7d 2h" },
    { id: "ghi789", name: "nginx-proxy", status: "running", cpu: "0.8%", memory: "64 MB", uptime: "12d 8h" },
    { id: "jkl012", name: "api-backend", status: "stopped", cpu: "0%", memory: "0 MB", uptime: "-" },
  ];

  return (
    <div className="min-h-screen bg-background dark">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Server className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Docker WebUI</h1>
              <p className="text-sm text-muted-foreground">docker-node-01</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => window.location.href = '/settings'}>
            Settings
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* System Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-card-foreground">CPU</h3>
              </div>
              <span className="text-2xl font-bold text-primary">24%</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: "24%" }} />
            </div>
            <p className="text-xs text-muted-foreground mt-2">4 cores @ 3.2 GHz</p>
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Server className="w-5 h-5 text-accent" />
                <h3 className="font-semibold text-card-foreground">Memory</h3>
              </div>
              <span className="text-2xl font-bold text-accent">8.2 GB</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-accent rounded-full" style={{ width: "51%" }} />
            </div>
            <p className="text-xs text-muted-foreground mt-2">51% of 16 GB</p>
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <HardDrive className="w-5 h-5 text-warning" />
                <h3 className="font-semibold text-card-foreground">Disk</h3>
              </div>
              <span className="text-2xl font-bold text-warning">124 GB</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-warning rounded-full" style={{ width: "62%" }} />
            </div>
            <p className="text-xs text-muted-foreground mt-2">62% of 200 GB</p>
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Network className="w-5 h-5 text-success" />
                <h3 className="font-semibold text-card-foreground">Network</h3>
              </div>
              <span className="text-2xl font-bold text-success">2.4 MB/s</span>
            </div>
            <div className="flex gap-2 text-xs text-muted-foreground">
              <span>↓ 1.8 MB/s</span>
              <span>•</span>
              <span>↑ 0.6 MB/s</span>
            </div>
          </Card>
        </div>

        {/* Container Stats */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-foreground">Containers</h2>
          <div className="flex gap-4 text-sm">
            <span className="text-success flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-success" />
              3 Running
            </span>
            <span className="text-destructive flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-destructive" />
              1 Stopped
            </span>
          </div>
        </div>

        {/* Container List */}
        <Card className="bg-card border-border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">ID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">CPU</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">Memory</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">Uptime</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {containers.map((container) => (
                  <tr key={container.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                    <td className="px-6 py-4">
                      <Badge variant={container.status === "running" ? "default" : "destructive"} className={container.status === "running" ? "bg-success hover:bg-success" : ""}>
                        {container.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 font-medium text-foreground">{container.name}</td>
                    <td className="px-6 py-4 font-mono text-sm text-muted-foreground">{container.id}</td>
                    <td className="px-6 py-4 text-sm text-foreground">{container.cpu}</td>
                    <td className="px-6 py-4 text-sm text-foreground">{container.memory}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{container.uptime}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {container.status === "running" ? (
                          <>
                            <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                              <Square className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                              <RotateCw className="w-4 h-4" />
                            </Button>
                          </>
                        ) : (
                          <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                            <Play className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Active Alerts */}
        <Card className="mt-8 p-6 bg-card border-border">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-warning" />
            <h3 className="text-lg font-semibold text-foreground">Recent Alerts</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <div>
                <p className="font-medium text-foreground">api-backend stopped</p>
                <p className="text-sm text-muted-foreground">2 minutes ago</p>
              </div>
              <Badge variant="destructive">Container Stopped</Badge>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
