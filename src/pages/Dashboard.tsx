import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, Server, HardDrive, Network, Play, Square, RotateCw, AlertTriangle, Wifi, WifiOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useDockerMetrics } from "@/hooks/useDockerMetrics";
import { useDockerContainers } from "@/hooks/useDockerContainers";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const { metrics, connected } = useDockerMetrics();
  const { containers, loading, controlContainer } = useDockerContainers();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getContainerMetrics = (containerId: string) => {
    if (!metrics) return null;
    return metrics.containers.find(c => c.id.startsWith(containerId.substring(0, 12)));
  };

  const runningCount = containers.filter(c => c.State === 'running').length;
  const stoppedCount = containers.filter(c => c.State !== 'running').length;

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
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground">docker-node-01</p>
                {connected ? (
                  <Wifi className="w-3 h-3 text-success" />
                ) : (
                  <WifiOff className="w-3 h-3 text-destructive" />
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/settings')}>
              Settings
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
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
              <span className="text-2xl font-bold text-primary">
                {metrics?.host?.cpu?.usage || '0'}%
              </span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-300" 
                style={{ width: `${metrics?.host?.cpu?.usage || 0}%` }} 
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Host CPU usage</p>
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Server className="w-5 h-5 text-accent" />
                <h3 className="font-semibold text-card-foreground">Memory</h3>
              </div>
              <span className="text-2xl font-bold text-accent">
                {metrics?.host?.memory ? formatBytes(metrics.host.memory.used * 1024) : '0 MB'}
              </span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-accent rounded-full transition-all duration-300" 
                style={{ width: `${metrics?.host?.memory?.usage || 0}%` }} 
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {metrics?.host?.memory?.usage || '0'}% of {metrics?.host?.memory ? formatBytes(metrics.host.memory.total * 1024) : '0 GB'}
            </p>
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <HardDrive className="w-5 h-5 text-warning" />
                <h3 className="font-semibold text-card-foreground">Containers</h3>
              </div>
              <span className="text-2xl font-bold text-warning">{containers.length}</span>
            </div>
            <div className="flex gap-2 text-xs text-muted-foreground">
              <span className="text-success">{runningCount} running</span>
              <span>•</span>
              <span className="text-destructive">{stoppedCount} stopped</span>
            </div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Network className="w-5 h-5 text-success" />
                <h3 className="font-semibold text-card-foreground">Uptime</h3>
              </div>
              <span className="text-2xl font-bold text-success">
                {metrics?.host?.uptime ? Math.floor(metrics.host.uptime / 86400) + 'd' : '0d'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics?.host?.uptime ? new Date(Date.now() - metrics.host.uptime * 1000).toLocaleString() : 'Loading...'}
            </p>
          </Card>
        </div>

        {/* Container Stats */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-foreground">Containers</h2>
          <div className="flex gap-4 text-sm">
            <span className="text-success flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              {runningCount} Running
            </span>
            <span className="text-destructive flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-destructive" />
              {stoppedCount} Stopped
            </span>
          </div>
        </div>

        {/* Container List */}
        <Card className="bg-card border-border">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground">Loading containers...</div>
            ) : containers.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No containers found. Create one using Docker CLI and it will appear here automatically.
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">Image</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">CPU</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">Memory</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">Network</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {containers.map((container) => {
                    const containerMetrics = getContainerMetrics(container.Id);
                    const isRunning = container.State === 'running';
                    
                    return (
                      <tr key={container.Id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                        <td className="px-6 py-4">
                          <Badge 
                            variant={isRunning ? "default" : "destructive"} 
                            className={isRunning ? "bg-success hover:bg-success" : ""}
                          >
                            {container.State}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-foreground">{container.Names[0].replace(/^\//, '')}</p>
                            <p className="text-xs text-muted-foreground font-mono">{container.Id.substring(0, 12)}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-foreground">{container.Image}</td>
                        <td className="px-6 py-4 text-sm text-foreground">
                          {containerMetrics?.cpu || '0'}%
                        </td>
                        <td className="px-6 py-4 text-sm text-foreground">
                          {containerMetrics?.memory ? formatBytes(containerMetrics.memory.used) : '0 MB'}
                        </td>
                        <td className="px-6 py-4 text-xs text-muted-foreground">
                          {containerMetrics?.network ? (
                            <div>
                              <div>↓ {formatBytes(containerMetrics.network.rx)}</div>
                              <div>↑ {formatBytes(containerMetrics.network.tx)}</div>
                            </div>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            {isRunning ? (
                              <>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="h-8 w-8 p-0"
                                  onClick={() => controlContainer(container.Id, 'stop')}
                                  title="Stop"
                                >
                                  <Square className="w-4 h-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="h-8 w-8 p-0"
                                  onClick={() => controlContainer(container.Id, 'restart')}
                                  title="Restart"
                                >
                                  <RotateCw className="w-4 h-4" />
                                </Button>
                              </>
                            ) : (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-8 w-8 p-0"
                                onClick={() => controlContainer(container.Id, 'start')}
                                title="Start"
                              >
                                <Play className="w-4 h-4" />
                              </Button>
                            )}
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => navigate(`/container/${container.Id}`)}
                            >
                              Details
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </Card>

        {/* Connection Status */}
        {!connected && (
          <Card className="mt-8 p-6 bg-card border-border border-warning">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              <div>
                <h3 className="text-lg font-semibold text-foreground">Metrics Disconnected</h3>
                <p className="text-sm text-muted-foreground">
                  Real-time metrics are temporarily unavailable. Attempting to reconnect...
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
