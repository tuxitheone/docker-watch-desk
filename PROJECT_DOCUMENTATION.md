# Docker WebUI - Complete Project Documentation

## Project Overview

Docker WebUI is a web-based management interface for Docker containers. It provides a clean, modern UI for monitoring and controlling Docker containers on a host system, with authentication, real-time metrics, and audit logging.

## Technology Stack

### Frontend
- **React 18.3.1** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component library
- **TanStack Query** - Data fetching and caching
- **React Router** - Routing

### Backend
- **Lovable Cloud (Supabase)** - Backend infrastructure
  - Authentication
  - Database (PostgreSQL)
  - Edge Functions (Deno)
  - Real-time subscriptions

### Infrastructure
- **Docker** - Containerization
- **Nginx** - Production web server
- **Unix Socket** - Direct Docker API access

## Core Features

### 1. Authentication System
- Single admin user model
- Email/password authentication via Supabase Auth
- Auto-confirm email signups (for development)
- Protected routes with session management
- JWT token-based API authorization

### 2. Dashboard
- Lists all Docker containers (running and stopped)
- Container status indicators
- Quick actions: Start, Stop, Restart
- Auto-refresh every 5 seconds
- Loading states and error handling

### 3. Real-time Metrics
- WebSocket connection for live data
- Host metrics:
  - CPU usage
  - Memory (total, free, available, used)
  - System uptime
- Per-container metrics:
  - CPU percentage
  - Memory usage/limit
  - Network I/O (RX/TX)
  - Block I/O (read/write)
- Automatic reconnection on disconnect

### 4. Container Management
- View detailed container information
- Control container lifecycle (start/stop/restart)
- View container logs
- Monitor container-specific metrics
- Audit trail for all actions

### 5. Settings Page
- User profile management
- Global settings configuration
- Admin account management

## Architecture

### Frontend Structure

```
src/
├── components/
│   ├── ui/                    # shadcn/ui components
│   └── ProtectedRoute.tsx     # Auth wrapper
├── hooks/
│   ├── useDockerContainers.ts # Container data fetching
│   └── useDockerMetrics.ts    # Real-time metrics WebSocket
├── integrations/
│   └── supabase/              # Auto-generated Supabase client
├── pages/
│   ├── Login.tsx              # Authentication page
│   ├── Dashboard.tsx          # Main container list
│   ├── ContainerDetails.tsx   # Single container view
│   ├── Settings.tsx           # Settings page
│   └── NotFound.tsx           # 404 page
└── App.tsx                    # Root component with routing
```

### Backend Structure

```
supabase/
├── functions/
│   ├── docker-api/            # Main Docker operations
│   ├── docker-logs/           # Container log streaming
│   └── docker-metrics/        # Real-time metrics WebSocket
└── migrations/                # Database schema migrations
```

## Database Schema

### Tables

#### `global_settings`
- `id` (UUID, Primary Key)
- `user_id` (UUID, references auth.users)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)
- Stores global application settings

#### `audit_logs`
- `id` (UUID, Primary Key)
- `user_id` (UUID, references auth.users)
- `action` (Text) - start/stop/restart
- `container_id` (Text)
- `container_name` (Text)
- `details` (JSONB)
- `created_at` (Timestamp)
- Tracks all container actions for auditing

### Row Level Security (RLS)
- All tables have RLS enabled
- Users can only access their own data
- Policies enforce user_id checks

## API Endpoints

### Docker API Edge Function
**Base URL**: `/functions/v1/docker-api`

#### GET `/containers`
Lists all Docker containers
- Returns: Array of container objects

#### GET `/containers/:id`
Get specific container details
- Returns: Detailed container object

#### POST `/containers/:id/start`
Start a container
- Creates audit log entry

#### POST `/containers/:id/stop`
Stop a container
- Creates audit log entry

#### POST `/containers/:id/restart`
Restart a container
- Creates audit log entry

### Docker Logs Edge Function
**Endpoint**: `/functions/v1/docker-logs`

WebSocket connection for streaming container logs
- Query params: `container_id`

### Docker Metrics Edge Function
**Endpoint**: `/functions/v1/docker-metrics`

WebSocket connection for real-time metrics
- Streams host and container metrics every 2 seconds

## Docker Integration

### Unix Socket Access
The application accesses Docker via Unix socket at `/var/run/docker.sock`

**docker-compose.yml configuration**:
```yaml
volumes:
  - /var/run/docker.sock:/var/run/docker.sock:ro
```

### Container Deployment

#### Build Arguments
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`

#### Runtime Environment
- `TZ` - Timezone
- `ADMIN_EMAIL` - Admin account email
- `ADMIN_PASSWORD` - Admin account password

#### Volumes
- `/var/run/docker.sock:/var/run/docker.sock:ro` - Docker API access
- `/proc:/host/proc:ro` - Host metrics access

## Security Considerations

### Authentication
1. All API endpoints require authentication
2. JWT tokens validated on every request
3. User session persisted in localStorage
4. Protected routes redirect to login if unauthenticated

### Docker Access
1. Docker socket mounted read-only (`:ro`)
2. All container actions logged to audit_logs
3. User authentication required for all operations

### Database
1. RLS policies enforce data isolation
2. No direct database access from frontend
3. All queries go through authenticated edge functions

### Environment Variables
1. Sensitive keys in Supabase Secrets (never in code)
2. Build-time variables for Vite
3. Runtime variables for container configuration

## Deployment

### Environment Setup

1. **Create `.env` file**:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
VITE_SUPABASE_PROJECT_ID=your_project_id
PORT=8080
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=secure_password
TZ=Europe/Copenhagen
```

2. **Build and run**:
```bash
docker-compose up -d --build
```

3. **Access**: `http://localhost:8080`

4. **First-time setup**:
   - Click "Create admin account"
   - Enter credentials from `.env`
   - Sign in with created account

## Current Issues

### Unauthorized Error
The application currently returns "Unauthorized" errors because:
1. Edge functions need Docker socket access
2. Edge functions run in Supabase cloud, not on the Docker host
3. Cannot access `/var/run/docker.sock` from cloud functions

### Solution Architecture Needed

To make this work, you need one of these approaches:

#### Option 1: Self-hosted Backend
- Deploy Supabase locally on the Docker host
- Or create custom backend API running on the host
- Backend has direct socket access

#### Option 2: Agent Architecture
- Install an agent on the Docker host
- Agent exposes REST/WebSocket API
- Frontend connects to agent instead of cloud functions
- Agent handles Docker socket communication

#### Option 3: Direct Access (Development Only)
- Frontend makes requests directly to Docker API
- Requires CORS and authentication setup
- Not recommended for production

## Rebuilding This Project

### Using Traditional Stack

**Backend**: Node.js/Express
```javascript
// Server running on Docker host
const express = require('express');
const Docker = require('dockerode');
const docker = new Docker({ socketPath: '/var/run/docker.sock' });

app.get('/api/containers', async (req, res) => {
  const containers = await docker.listContainers({ all: true });
  res.json(containers);
});
```

**Frontend**: Same React app, but connect to local backend

### Using Alternative Platforms

1. **Portainer** - Full-featured Docker management (already exists)
2. **Yacht** - Lightweight Docker dashboard
3. **Dockge** - Stack-oriented Docker compose manager
4. **Custom PHP/Python** - Traditional LAMP/LEMP stack with Docker SDK

## File Structure Reference

```
project/
├── .env                       # Environment configuration
├── .env.example               # Environment template
├── docker-compose.yml         # Docker orchestration
├── Dockerfile                 # Multi-stage build
├── nginx.conf                 # Nginx configuration
├── package.json               # Dependencies
├── tailwind.config.ts         # Tailwind configuration
├── vite.config.ts             # Vite configuration
├── src/
│   ├── App.tsx                # Root component
│   ├── main.tsx               # Entry point
│   ├── index.css              # Global styles
│   ├── components/            # React components
│   ├── pages/                 # Page components
│   ├── hooks/                 # Custom hooks
│   ├── lib/                   # Utilities
│   └── integrations/          # Third-party integrations
├── supabase/
│   ├── config.toml            # Supabase configuration
│   ├── functions/             # Edge functions
│   └── migrations/            # Database migrations
└── public/                    # Static assets
```

## Key Lessons

1. **Cloud functions can't access local Unix sockets** - Need agent on host
2. **WebSocket for real-time data** - Better UX than polling
3. **Multi-stage Docker builds** - Smaller production images
4. **RLS for security** - Database-level access control
5. **shadcn/ui for rapid development** - Pre-built accessible components

## Next Steps for Functional Implementation

1. **Create a local agent**:
   - Go/Rust/Node.js service on Docker host
   - REST API for container operations
   - WebSocket for metrics
   - Authentication via JWT

2. **Update frontend**:
   - Connect to agent instead of cloud functions
   - Keep same UI/UX
   - Add agent health monitoring

3. **Deployment**:
   - Agent runs on Docker host
   - Frontend can be anywhere (cloud/host)
   - Secure communication with TLS

## License & Credits

Built with:
- Lovable.dev - AI-powered development platform
- Supabase - Backend infrastructure
- shadcn/ui - Component library
- Tailwind CSS - Utility-first CSS framework
