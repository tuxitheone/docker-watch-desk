# Docker WebUI Setup Guide

## First-Time Setup

### Step 1: Configure Environment

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` with your admin credentials:
```env
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=YourSecurePassword123
TZ=Europe/Copenhagen
```

### Step 2: Build and Start

```bash
docker-compose up -d --build
```

This will:
- Build the React frontend
- Create the Docker container
- Mount `/var/run/docker.sock` (read-only)
- Mount `/proc` for host metrics
- Start the web server on port 8080

### Step 3: Create Admin Account

⚠️ **Important**: You must create the admin account before you can login.

1. Open your browser to `http://your-server-ip:8080`
2. You'll see the login page
3. Click on the Settings page link (or navigate to `/settings`)
4. Look for the "Sign Up" option
5. Enter the EXACT credentials from your `.env` file:
   - Email: The value from `ADMIN_EMAIL`
   - Password: The value from `ADMIN_PASSWORD`
6. Submit the signup form

### Step 4: Login

After creating the account:
1. Return to the login page (`/login`)
2. Login with your admin credentials
3. You'll be redirected to the dashboard

## System Requirements

- **Docker**: 20.10+
- **Docker Compose**: 1.29+
- **OS**: Linux (tested on Ubuntu 20.04+, Debian 11+)
- **RAM**: Minimum 512MB available
- **Network**: Port 8080 available (or customize in nginx.conf)

## Port Configuration

The default port is **8080**. To change it:

1. Edit `nginx.conf`:
```nginx
server {
    listen 8082;  # Change this
    server_name _;
    # ... rest of config
}
```

2. Rebuild the container:
```bash
docker-compose down
docker-compose up -d --build
```

## Reverse Proxy Setup (Recommended)

For production, always use HTTPS via a reverse proxy.

### Nginx Reverse Proxy

Create `/etc/nginx/sites-available/docker-webui`:

```nginx
server {
    listen 443 ssl http2;
    server_name docker.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/docker.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/docker.yourdomain.com/privkey.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        
        # WebSocket support
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # Headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name docker.yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

Enable and restart:
```bash
sudo ln -s /etc/nginx/sites-available/docker-webui /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Traefik (Docker)

Add labels to `docker-compose.yml`:

```yaml
services:
  docker-webui:
    # ... existing config
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.docker-webui.rule=Host(`docker.yourdomain.com`)"
      - "traefik.http.routers.docker-webui.entrypoints=websecure"
      - "traefik.http.routers.docker-webui.tls.certresolver=letsencrypt"
      - "traefik.http.services.docker-webui.loadbalancer.server.port=8080"
```

## Firewall Configuration

If using UFW:
```bash
# Allow from specific IP
sudo ufw allow from 192.168.1.0/24 to any port 8080

# Or allow from anywhere (not recommended)
sudo ufw allow 8080/tcp
```

## Discord Webhook Setup

1. In Discord, go to Server Settings → Integrations → Webhooks
2. Click "New Webhook"
3. Name it "Docker WebUI"
4. Copy the webhook URL
5. In Docker WebUI, go to Settings
6. Paste webhook URL
7. Configure per-container alerts

## Troubleshooting

### "Cannot connect to Docker daemon"

Check socket permissions:
```bash
ls -la /var/run/docker.sock
# Should show: srw-rw---- 1 root docker

# Add your user to docker group
sudo usermod -aG docker $USER
newgrp docker
```

### WebUI not accessible from other machines

Check host networking:
```bash
# Verify the container is using host network
docker inspect docker-webui | grep NetworkMode
# Should show: "NetworkMode": "host"

# Check if port is listening
sudo netstat -tulpn | grep 8080
```

### Metrics not updating

1. Check WebSocket connection (WiFi icon in header)
2. View edge function logs in Lovable Cloud
3. Verify container can access Docker socket:
```bash
docker exec docker-webui ls -la /var/run/docker.sock
```

### High CPU usage

Reduce metrics refresh interval in Settings:
- Default: 2000ms (2 seconds)
- Recommended for many containers: 5000ms (5 seconds)

## Security Best Practices

1. **Change default credentials** in `.env` before first run
2. **Use strong passwords** (minimum 12 characters)
3. **Enable HTTPS** via reverse proxy
4. **Restrict network access** to trusted IPs only
5. **Keep Docker updated** for security patches
6. **Review audit logs** regularly for suspicious activity
7. **Backup configuration** and database regularly

## Updating

```bash
# Pull latest changes
git pull

# Rebuild and restart
docker-compose down
docker-compose up -d --build
```

## Uninstalling

```bash
# Stop and remove container
docker-compose down

# Remove images
docker rmi docker-webui:latest

# Remove volumes (if any)
docker volume prune
```

## Getting Help

- GitHub Issues: Report bugs
- GitHub Discussions: Ask questions
- Documentation: Check README.md
