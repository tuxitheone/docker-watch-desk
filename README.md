# 🐳 Docker WebUI

A lightweight, self-hosted web interface for monitoring and controlling Docker containers in real-time.

## ✨ Features

- **Real-time Monitoring** - Live metrics via WebSocket (CPU, memory, network, I/O)
- **Auto-discovery** - Containers created/removed via CLI appear instantly in UI
- **Container Control** - Start, stop, restart containers from the web interface
- **Live Logs** - Stream container logs in real-time with filtering
- **Discord Alerts** - Per-container notifications on stop/error
- **Dark Mode** - Beautiful, responsive interface
- **Single Admin** - Simple authentication with one admin user

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- Host with Docker socket access (`/var/run/docker.sock`)

### Installation

1. Clone this repository:
```bash
git clone <your-repo-url>
cd docker-webui
```

2. Copy and configure environment:
```bash
cp .env.example .env
nano .env  # Edit admin credentials
```

3. Set your admin credentials in `.env`:
```env
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your-secure-password
TZ=Europe/Copenhagen
```

4. Build and start:
```bash
docker-compose up -d --build
```

5. Access the UI at `http://your-server-ip:8080`

6. **First Login:**
   - Navigate to `/settings` in your browser
   - Click "Sign Up" to create the admin account
   - Use the credentials from your `.env` file
   - After creating the account, login with the same credentials

## 🔧 Configuration

### Docker Compose

The service uses **host networking mode** for direct Docker socket access and requires:
- `/var/run/docker.sock` (read-only) - Docker API access
- `/proc` (read-only) - Host system metrics

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `ADMIN_EMAIL` | `admin@docker-webui.local` | Admin email address |
| `ADMIN_PASSWORD` | `changeme123` | Admin password (min 6 chars) |
| `TZ` | `Europe/Copenhagen` | Server timezone |

### Changing the Port

Edit `nginx.conf`:
```nginx
server {
    listen 8082;  # Change from 8080 to your desired port
    server_name _;
    # ...
}
```

Then rebuild:
```bash
docker-compose down
docker-compose up -d --build
```

## 📊 Usage

### Dashboard
- **Host Metrics** - CPU, RAM, network, uptime
- **Container List** - All containers with live stats
- **Quick Actions** - Start/stop/restart buttons
- **Auto-refresh** - Updates every 2-5 seconds

### Container Details
- Real-time metrics graphs
- Live log streaming (no storage, ephemeral)
- Container configuration details
- Per-container alert settings

### Settings
- Discord webhook configuration
- Metrics refresh interval
- Alert debounce settings
- Error pattern regex

## 🔔 Discord Alerts

Set up per-container Discord notifications:

1. Create a Discord webhook in your server
2. In WebUI Settings, add your webhook URL
3. Enable alerts for specific containers
4. Configure triggers:
   - **Container Stopped** - Alert when container stops/crashes
   - **Error Pattern** - Match regex in logs (default: `(?i)(error|err|exception|traceback|crit(ical)?)`)

Example alert:
```json
{
  "username": "Docker WebUI",
  "embeds": [{
    "title": "Container Stopped",
    "color": 15158332,
    "fields": [
      {"name": "Container", "value": "redis:prod"},
      {"name": "Reason", "value": "stop event"},
      {"name": "Time", "value": "2025-10-20T10:22:31Z"}
    ]
  }]
}
```

## 🔒 Security

⚠️ **Important Security Considerations:**

- **Root Required** - Container needs root access to Docker socket
- **Trusted Hosts Only** - Docker socket access = full system control
- **Single Admin** - Only one user (configured via env vars)
- **Read-only Mounts** - Socket and `/proc` are mounted read-only
- **No Public Exposure** - Always use behind HTTPS reverse proxy
- **Audit Logging** - All control actions logged to database

### Reverse Proxy Setup (Recommended)

Example Nginx configuration:
```nginx
server {
    listen 443 ssl http2;
    server_name docker.example.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 🛠️ Development

### Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Lovable Cloud (Supabase)
- **UI Framework**: shadcn/ui + Tailwind CSS
- **Real-time**: WebSocket for metrics streaming
- **Deployment**: Docker + Nginx

### Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

### Project Structure

```
docker-webui/
├── src/
│   ├── pages/           # Dashboard, Login, Settings
│   ├── components/      # Reusable UI components
│   ├── hooks/           # Custom React hooks
│   └── integrations/    # Supabase client
├── supabase/
│   ├── functions/       # Edge functions (Docker API)
│   └── config.toml      # Function configuration
├── Dockerfile           # Multi-stage build
├── nginx.conf           # Web server config
└── docker-compose.yml   # Service definition
```

## 📝 Architecture

```
┌──────────────┐        WebSocket         ┌───────────────┐
│   Browser    │◄────────────────────────►│ docker-metrics│
│   (React)    │                           │ Edge Function │
└──────────────┘                           └───────┬───────┘
                                                   │
┌──────────────┐        REST API          ┌───────▼───────┐
│  Dashboard   │◄────────────────────────►│  docker-api   │
│   Frontend   │                           │ Edge Function │
└──────────────┘                           └───────┬───────┘
                                                   │
                                            ┌──────▼─────────┐
                                            │ /var/run/      │
                                            │ docker.sock    │
                                            └────────────────┘
```

**Flow:**
1. Frontend connects via WebSocket for real-time metrics
2. Backend edge functions read Docker socket via Unix socket
3. Container stats streamed every 2 seconds
4. Container list auto-updates via polling + WebSocket

## 🚀 Features in Detail

### Auto-Discovery
- Detects new containers within 5 seconds
- Automatically removes deleted containers from UI
- No manual refresh needed
- Works with `docker run`, `docker-compose`, etc.

### Live Metrics
- **Host**: CPU %, RAM usage, network I/O, uptime
- **Containers**: CPU %, memory, network RX/TX, block I/O
- **Refresh**: 2-second intervals via WebSocket
- **No Storage**: All metrics are ephemeral (not saved)

### Log Streaming
- Streams directly from Docker (no disk storage)
- Client-side regex filtering
- Color-coded timestamps
- Auto-scroll with pause/resume
- Logs disappear on browser close

## 🔮 Roadmap

- [ ] Multi-host support (lightweight agent model)
- [ ] Historical metrics with charts
- [ ] Advanced health check rules
- [ ] Multi-language UI (English/Danish)
- [ ] Docker Compose stack management
- [ ] Volume and network management
- [ ] Resource limits configuration

## ⚠️ Limitations

- **No Shell Access** - WebUI does not provide terminal/exec access
- **No Log Storage** - Logs stream live but are not persisted
- **Single Host** - Multi-host requires future agent architecture
- **Rate Limits** - Discord webhooks have rate limits (use debounce)
- **Root Access** - Requires privileged Docker socket access

## 🐛 Troubleshooting

### Container not accessible from browser
- Check that you're using host networking mode
- Verify firewall allows port 8080
- Try accessing via `http://HOST_IP:8080`

### Metrics not updating
- Check WebSocket connection (WiFi icon in header)
- Verify `/var/run/docker.sock` is mounted
- Check edge function logs in Lovable Cloud

### Can't login
- Ensure you created the admin account first (Settings → Sign Up)
- Verify credentials match `.env` file
- Check browser console for errors

## 📄 License

MIT License

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Open a Pull Request

## 💬 Support

- **Issues**: Report bugs via GitHub Issues
- **Discussions**: Ask questions in GitHub Discussions
- **Documentation**: See inline code comments

---

**Built with ❤️ using [Lovable](https://lovable.dev)**

Deploy on trusted infrastructure only. Docker socket access = full system control.
