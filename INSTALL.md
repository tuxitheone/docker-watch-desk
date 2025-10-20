# Quick Install Guide

## 1. Copy Environment File

```bash
cp .env.example .env
```

## 2. Edit Your Credentials

```bash
nano .env
```

Change these values:
```env
ADMIN_EMAIL=your-email@example.com
ADMIN_PASSWORD=YourSecurePassword123
TZ=Europe/Copenhagen
```

**Security Note:** The `.env` file is ignored by git and won't be committed.

## 3. Start Docker Container

```bash
docker-compose up -d --build
```

## 4. Create Admin Account

1. Open browser: `http://your-server-ip:8080`
2. Click "First time? Create admin account"
3. Enter your credentials from the `.env` file
4. Click "Create Admin Account"
5. Once created, click "Already have an account? Sign in"
6. Login with your credentials

---

## Quick Commands

```bash
# View logs
docker-compose logs -f

# Restart
docker-compose restart

# Stop
docker-compose down

# Update
git pull && docker-compose up -d --build
```

## Troubleshooting

**Can't access from other machines?**
- Check firewall: `sudo ufw status`
- Verify host networking: `docker inspect docker-webui | grep NetworkMode`

**Metrics not updating?**
- Check WebSocket connection (WiFi icon in header)
- Verify socket mount: `docker exec docker-webui ls -la /var/run/docker.sock`

**Wrong credentials?**
- Edit `.env` file
- Recreate container: `docker-compose down && docker-compose up -d`
- Create new admin account in Settings
