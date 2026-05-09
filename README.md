# Claude Code Telemetry Dashboard

A modern, responsive observability dashboard for monitoring [Claude Code](https://docs.anthropic.com/en/docs/claude-code) usage, costs, and productivity across individuals, teams, and organizations. Built on OpenTelemetry standards with a full observability stack.

![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![OpenTelemetry](https://img.shields.io/badge/OpenTelemetry-OTLP-F5A800?logo=opentelemetry&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Dashboard Views](#dashboard-views)
- [Claude Code Telemetry Configuration](#claude-code-telemetry-configuration)
- [Observability Stack](#observability-stack)
- [Metrics Reference](#metrics-reference)
- [Configuration Reference](#configuration-reference)
- [Customization](#customization)
- [Production Deployment](#production-deployment)
- [Troubleshooting](#troubleshooting)
- [References](#references)

---

## Overview

Claude Code natively exports telemetry via [OpenTelemetry (OTel)](https://opentelemetry.io/), including **metrics**, **events/logs**, and **traces**. This project provides:

1. **A React dashboard** — Real-time visualization of Claude Code metrics with individual, team, and org-level views
2. **An OTel Collector** — Receives telemetry from Claude Code instances via OTLP
3. **Prometheus** — Time-series storage for metrics
4. **Grafana** — Additional dashboarding and alerting (pre-configured)
5. **Mock data layer** — Realistic simulated data for development and demos

---

## Features

### 🔍 Three View Levels

| View | Description |
|------|-------------|
| **Individual** | Personal metrics — your sessions, tokens, cost, productivity, tool usage |
| **Team** | Team-wide aggregation — member comparisons, leaderboards, active users |
| **Organization** | Org-wide rollups — cross-team comparison, cost governance, adoption trends |

### 📊 Visualizations

- **Token Usage** — Stacked area chart (input, output, cache read, cache creation)
- **Cost Trends** — Daily cost bars with cumulative line overlay
- **Model Distribution** — Donut chart of model usage by sessions and cost
- **Tool Usage** — Horizontal bar chart with call counts, durations, success rates
- **Productivity** — Lines added/removed, commits over time
- **Team Leaderboard** — Teams ranked by cost efficiency, productivity, or adoption
- **Active Users** — Real-time status table (active/idle/offline)
- **Sessions** — Paginated, searchable, sortable, expandable session history

### 🎨 Design

- Dark theme with glassmorphism cards
- Fully responsive (mobile, tablet, desktop)
- Collapsible sidebar navigation
- Smooth hover transitions
- Inter typeface via Google Fonts

---

## Architecture

```
┌─────────────────────┐
│   Claude Code CLI   │  CLAUDE_CODE_ENABLE_TELEMETRY=1
│   (Developer 1..N)  │  OTEL_METRICS_EXPORTER=otlp
└────────┬────────────┘  OTEL_LOGS_EXPORTER=otlp
         │ OTLP (gRPC/HTTP)
         ▼
┌─────────────────────┐
│  OTel Collector     │  Receives, batches, processes
│  :4317 gRPC         │  telemetry from all instances
│  :4318 HTTP         │
│  :8889 Prometheus   │
└────────┬────────────┘
         │ Scrape
         ▼
┌─────────────────────┐     ┌─────────────────────┐
│  Prometheus         │────▶│  Grafana             │
│  :9090              │     │  :3000               │
└────────┬────────────┘     └──────────────────────┘
         │ Query API
         ▼
┌─────────────────────┐
│  React Dashboard    │
│  :5173              │
└─────────────────────┘
```

---

## Quick Start

### Option 1: Dashboard Only (Development)

```bash
cd dashboard
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). The dashboard starts with mock data — no backend required.

### Option 2: Full Observability Stack (Docker Compose)

```bash
docker compose up -d
```

| Service | URL |
|---------|-----|
| Dashboard | [http://localhost:5173](http://localhost:5173) |
| Grafana | [http://localhost:3000](http://localhost:3000) |
| Prometheus | [http://localhost:9090](http://localhost:9090) |
| OTel Collector (gRPC) | `localhost:4317` |
| OTel Collector (HTTP) | `localhost:4318` |

### Option 3: Connect Claude Code to the Stack

After starting the stack with Docker Compose, configure your Claude Code instances:

```bash
# Enable telemetry and point to your collector
export CLAUDE_CODE_ENABLE_TELEMETRY=1
export OTEL_METRICS_EXPORTER=otlp
export OTEL_LOGS_EXPORTER=otlp
export OTEL_EXPORTER_OTLP_PROTOCOL=grpc
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4317

# Optional: Enable enhanced tracing (beta)
export CLAUDE_CODE_ENHANCED_TELEMETRY_BETA=1
export OTEL_TRACES_EXPORTER=otlp

# Optional: Add team/department context
export OTEL_RESOURCE_ATTRIBUTES="department=engineering,team.id=platform,cost_center=eng-123"

# Launch Claude Code
claude
```

---

## Project Structure

```
CC-Telemetry/
├── README.md                          # This file
├── docker-compose.yml                 # Full observability stack
├── otel-collector-config.yaml         # OTel Collector configuration
├── prometheus.yml                     # Prometheus scrape config
├── grafana/
│   └── provisioning/
│       └── datasources/
│           └── datasource.yml         # Grafana ← Prometheus datasource
├── dashboard/
│   ├── Dockerfile                     # Multi-stage production build
│   ├── nginx.conf                     # SPA routing for production
│   ├── package.json
│   ├── vite.config.ts                 # Vite + Tailwind + Prometheus proxy
│   ├── index.html
│   ├── public/
│   │   └── favicon.svg
│   └── src/
│       ├── main.tsx                   # Entry point
│       ├── App.tsx                    # Root component + view routing
│       ├── index.css                  # Tailwind imports + theme tokens
│       ├── types.ts                   # TypeScript interfaces
│       ├── data/
│       │   └── mockData.ts            # Realistic mock data generators
│       ├── components/
│       │   ├── Layout.tsx             # Sidebar + header + view switcher
│       │   ├── StatCard.tsx           # Reusable metric cards
│       │   ├── ActiveUsersTable.tsx   # Real-time user status table
│       │   ├── SessionsTable.tsx      # Paginated session history
│       │   ├── TeamLeaderboard.tsx    # Team ranking component
│       │   └── charts/
│       │       ├── TokenUsageChart.tsx        # Stacked area chart
│       │       ├── CostTrendChart.tsx         # Bar + line composed chart
│       │       ├── ModelDistributionChart.tsx  # Donut pie chart
│       │       ├── ToolUsageChart.tsx          # Horizontal bar chart
│       │       └── ProductivityChart.tsx       # Lines + commits chart
│       └── views/
│           ├── IndividualView.tsx     # Personal metrics view
│           ├── TeamView.tsx           # Team-level metrics view
│           └── OrgView.tsx            # Organization-wide view
```

---

## Dashboard Views

### Individual View

The default view shows your personal Claude Code usage:

- **Stat Cards** — Sessions, Tokens Used, Cost (USD), Lines Changed, Commits, Active Time
- **Token Usage Over Time** — Stacked area chart breaking down input, output, and cache tokens
- **Cost Trend** — Daily spend with cumulative overlay
- **Model Distribution** — Which models you use most (by sessions and cost)
- **Tool Usage** — Frequency and success rate of tools (Bash, Read, Edit, Write, etc.)
- **Productivity** — Lines of code added/removed and commits over time
- **Recent Sessions** — Full session history with search, sort, and expandable details

### Team View

Aggregated metrics for your team with member comparisons:

- **Team Selector** — Switch between teams
- **Member Comparison** — Side-by-side token/cost breakdown per member
- **Active Users** — Real-time table of who's using Claude Code right now
- **Tool Usage** — Team-wide tool usage patterns

### Organization View

Executive-level view across all teams:

- **Team Leaderboard** — Rank teams by cost efficiency, productivity, or adoption rate
- **Cross-Team Comparison** — Side-by-side bar chart of team metrics
- **Cost Distribution** — Pie chart of cost allocation by team
- **Org-Wide Trends** — Token usage and cost trends across the organization

---

## Claude Code Telemetry Configuration

### Environment Variables

Claude Code exports telemetry via standard OpenTelemetry environment variables:

| Variable | Description | Values |
|----------|-------------|--------|
| `CLAUDE_CODE_ENABLE_TELEMETRY` | **Required**. Enable telemetry | `1` |
| `OTEL_METRICS_EXPORTER` | Metrics exporter | `otlp`, `prometheus`, `console`, `none` |
| `OTEL_LOGS_EXPORTER` | Logs/events exporter | `otlp`, `console`, `none` |
| `OTEL_TRACES_EXPORTER` | Traces exporter (beta) | `otlp`, `console`, `none` |
| `OTEL_EXPORTER_OTLP_PROTOCOL` | Transport protocol | `grpc`, `http/json`, `http/protobuf` |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | Collector endpoint | `http://localhost:4317` |
| `OTEL_EXPORTER_OTLP_HEADERS` | Auth headers | `Authorization=Bearer <token>` |
| `OTEL_METRIC_EXPORT_INTERVAL` | Export interval (ms) | `60000` (default) |
| `OTEL_RESOURCE_ATTRIBUTES` | Custom resource attributes | `team.id=platform,cost_center=123` |
| `CLAUDE_CODE_ENHANCED_TELEMETRY_BETA` | Enable span tracing | `1` |

### Privacy & Data Controls

| Variable | Description | Default |
|----------|-------------|---------|
| `OTEL_LOG_USER_PROMPTS` | Include prompt content in events | Disabled |
| `OTEL_LOG_TOOL_DETAILS` | Include tool parameters/commands | Disabled |
| `OTEL_LOG_TOOL_CONTENT` | Include tool I/O content in spans | Disabled |
| `OTEL_METRICS_INCLUDE_SESSION_ID` | Attach session.id to metrics | `true` |
| `OTEL_METRICS_INCLUDE_ACCOUNT_UUID` | Attach user.account_uuid | `true` |
| `OTEL_METRICS_INCLUDE_VERSION` | Attach app.version | `false` |

### Organization-Wide Deployment

Administrators can enforce telemetry settings via the [managed settings file](https://docs.anthropic.com/en/docs/claude-code/settings):

```json
{
  "env": {
    "CLAUDE_CODE_ENABLE_TELEMETRY": "1",
    "OTEL_METRICS_EXPORTER": "otlp",
    "OTEL_LOGS_EXPORTER": "otlp",
    "OTEL_EXPORTER_OTLP_PROTOCOL": "grpc",
    "OTEL_EXPORTER_OTLP_ENDPOINT": "http://collector.internal:4317",
    "OTEL_RESOURCE_ATTRIBUTES": "department=engineering"
  }
}
```

### Multi-Team Tagging

Use `OTEL_RESOURCE_ATTRIBUTES` to tag telemetry with team/department metadata:

```bash
export OTEL_RESOURCE_ATTRIBUTES="department=engineering,team.id=platform,cost_center=eng-123"
```

These attributes enable filtering, team dashboards, and per-cost-center reporting.

---

## Observability Stack

### OpenTelemetry Collector

The collector (`otel-collector-config.yaml`) receives telemetry via OTLP and exports to Prometheus:

- **Receivers**: OTLP on gRPC (`:4317`) and HTTP (`:4318`)
- **Processors**: Batch (5s timeout, 1024 batch size), Memory Limiter (512 MiB)
- **Exporters**: Prometheus (`:8889`), Logging
- **Pipelines**: Metrics → Prometheus, Logs → Logging, Traces → Logging

### Prometheus

Scrapes metrics from the OTel Collector every 15 seconds. Accessible at `:9090`.

### Grafana

Pre-configured with anonymous admin access and Prometheus datasource. Build custom dashboards at `:3000`.

---

## Metrics Reference

These are the official Claude Code OpenTelemetry metrics. See the [official docs](https://docs.anthropic.com/en/docs/claude-code/monitoring-usage) for the full reference.

### Counters

| Metric | Unit | Description | Key Attributes |
|--------|------|-------------|----------------|
| `claude_code.session.count` | count | CLI sessions started | `start_type` (fresh/resume/continue) |
| `claude_code.token.usage` | tokens | Tokens consumed | `type` (input/output/cacheRead/cacheCreation), `model` |
| `claude_code.cost.usage` | USD | Estimated API cost | `model`, `query_source`, `speed`, `effort` |
| `claude_code.lines_of_code.count` | count | Lines modified | `type` (added/removed) |
| `claude_code.commit.count` | count | Git commits created | — |
| `claude_code.pull_request.count` | count | PRs created | — |
| `claude_code.active_time.total` | seconds | Active usage time | `type` (user/cli) |
| `claude_code.code_edit_tool.decision` | count | Tool permission decisions | `tool_name`, `decision`, `source`, `language` |

### Standard Attributes (on all metrics)

| Attribute | Description |
|-----------|-------------|
| `session.id` | Unique session identifier |
| `organization.id` | Organization UUID |
| `user.account_uuid` | User account UUID |
| `user.id` | Anonymous device/installation identifier |
| `user.email` | User email (OAuth only) |
| `terminal.type` | Terminal (vscode, iTerm, cursor, tmux) |
| `app.version` | Claude Code version |

### Events (via OTEL Logs)

| Event | Description |
|-------|-------------|
| `claude_code.user_prompt` | User submitted a prompt |
| `claude_code.tool_result` | Tool execution completed |
| `claude_code.api_request` | API call to Claude |
| `claude_code.api_error` | API call failed |

### Trace Spans (Beta)

| Span | Description |
|------|-------------|
| `claude_code.interaction` | Root span for each user prompt |
| `claude_code.llm_request` | Individual API request |
| `claude_code.tool` | Tool call (includes permission + execution) |
| `claude_code.tool.blocked_on_user` | Time waiting for user permission |
| `claude_code.tool.execution` | Tool body execution |
| `claude_code.hook` | Hook execution (detailed beta) |

---

## Configuration Reference

### Vite Dev Server

The dashboard proxies `/api/v1/*` requests to Prometheus at `localhost:9090`:

```typescript
// vite.config.ts
server: {
  proxy: {
    '/api/v1': {
      target: 'http://localhost:9090',
      changeOrigin: true,
    },
  },
}
```

### Switching from Mock to Live Data

The dashboard ships with mock data for development. To connect to live Prometheus:

1. Replace mock data imports with `fetch('/api/v1/query?query=...')` calls
2. Use PromQL to query Claude Code metrics:

```promql
# Total tokens by type (last hour)
sum by (type) (rate(claude_code_token_usage_tokens_total[1h]))

# Cost per user (last 24h)
sum by (user_account_uuid) (increase(claude_code_cost_usage_USD_total[24h]))

# Active sessions
count(count by (session_id) (claude_code_session_count_total))

# Lines of code by team
sum by (team_id) (increase(claude_code_lines_of_code_count_total[24h]))

# Model distribution
sum by (model) (increase(claude_code_token_usage_tokens_total[24h]))

# Tool success rate
sum(rate(claude_code_tool_result_total{success="true"}[1h]))
/
sum(rate(claude_code_tool_result_total[1h]))
```

---

## Customization

### Adding New Charts

1. Create a component in `src/components/charts/`
2. Import Recharts components (`AreaChart`, `BarChart`, etc.)
3. Follow the dark theme pattern:

```tsx
<ResponsiveContainer width="100%" height={300}>
  <AreaChart data={data}>
    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" />
    <XAxis dataKey="timestamp" stroke="#55556a" fontSize={11} />
    <YAxis stroke="#55556a" fontSize={11} />
    <Tooltip
      contentStyle={{
        backgroundColor: '#12121a',
        border: '1px solid #2a2a3a',
        borderRadius: 8,
      }}
    />
    <Area type="monotone" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} />
  </AreaChart>
</ResponsiveContainer>
```

### Adding Custom Resource Attributes

Tag Claude Code telemetry with custom dimensions:

```bash
export OTEL_RESOURCE_ATTRIBUTES="team.id=backend,project=api-v2,env=production"
```

Then filter/group by these in PromQL or in the dashboard.

### Adjusting Metrics Cardinality

Control which attributes appear on metrics:

```bash
export OTEL_METRICS_INCLUDE_SESSION_ID=false   # Lower cardinality
export OTEL_METRICS_INCLUDE_VERSION=true        # Track version adoption
export OTEL_METRICS_INCLUDE_ACCOUNT_UUID=true   # Per-user metrics
```

---

## Production Deployment

### 1. Build the Dashboard

```bash
cd dashboard
npm run build
```

Static output is in `dashboard/dist/`.

### 2. Deploy with Docker Compose

```bash
docker compose up -d --build
```

### 3. Secure the Stack

- **Replace anonymous Grafana auth** with proper authentication
- **Add OTEL_EXPORTER_OTLP_HEADERS** for authenticated collector endpoints
- **Enable TLS** on the OTel Collector for production traffic
- **Configure Prometheus retention** in `prometheus.yml`
- **Set up alerting rules** in Prometheus/Grafana for cost thresholds

### 4. Scale

- Use a managed Prometheus backend (Thanos, Cortex, Grafana Cloud) for multi-cluster
- Deploy the OTel Collector as a DaemonSet or sidecar in Kubernetes
- Use `OTEL_EXPORTER_OTLP_METRICS_TEMPORALITY_PREFERENCE=cumulative` if your backend expects it

---

## Troubleshooting

### No data appearing in dashboard

1. Verify telemetry is enabled: `echo $CLAUDE_CODE_ENABLE_TELEMETRY` → should be `1`
2. Check collector is running: `curl http://localhost:8889/metrics`
3. Check Prometheus targets: [http://localhost:9090/targets](http://localhost:9090/targets)
4. Enable console exporter for debugging:
   ```bash
   export OTEL_METRICS_EXPORTER=console,otlp
   export OTEL_METRIC_EXPORT_INTERVAL=5000
   ```

### Collector not receiving data

- Ensure Claude Code is pointed at the right endpoint
- Check network/firewall rules for ports 4317/4318
- Verify protocol matches (`grpc` for `:4317`, `http/protobuf` for `:4318`)

### High cardinality warnings

Disable high-cardinality attributes:

```bash
export OTEL_METRICS_INCLUDE_SESSION_ID=false
```

### Docker build fails

```bash
# Clean rebuild
docker compose down
docker compose build --no-cache
docker compose up -d
```

---

## References

- [Claude Code Monitoring & Usage Docs](https://docs.anthropic.com/en/docs/claude-code/monitoring-usage) — Official Anthropic documentation
- [Claude Code Settings](https://docs.anthropic.com/en/docs/claude-code/settings) — Managed settings for organizations
- [OpenTelemetry Protocol Specification](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/protocol/exporter.md) — OTLP exporter configuration
- [OpenTelemetry Collector](https://opentelemetry.io/docs/collector/) — Collector architecture and config
- [Prometheus Querying](https://prometheus.io/docs/prometheus/latest/querying/basics/) — PromQL basics
- [Recharts Documentation](https://recharts.org/en-US/) — Chart library used in the dashboard
- [Tailwind CSS](https://tailwindcss.com/docs) — Utility-first CSS framework

---

## License

MIT — Free to use. See [LICENSE](./LICENSE). Created by [@Ab3y](https://github.com/Ab3y).
