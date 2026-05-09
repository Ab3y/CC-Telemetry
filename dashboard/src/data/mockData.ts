import type {
  SessionMetrics,
  UserSummary,
  TeamSummary,
  OrgSummary,
  CostTrend,
  MetricDataPoint,
  ToolUsageBreakdown,
  ModelUsageBreakdown,
  ActiveUser,
} from '../types';

const MODELS = ['claude-sonnet-4-6', 'claude-opus-4.7', 'claude-haiku-4.5'];
const MODEL_COSTS: Record<string, { input: number; output: number }> = {
  'claude-sonnet-4-6': { input: 3.0 / 1_000_000, output: 15.0 / 1_000_000 },
  'claude-opus-4.7': { input: 15.0 / 1_000_000, output: 75.0 / 1_000_000 },
  'claude-haiku-4.5': { input: 0.8 / 1_000_000, output: 4.0 / 1_000_000 },
};
const TERMINALS = ['iTerm2', 'VS Code', 'Warp', 'Terminal.app', 'Windows Terminal', 'Alacritty'];
const VERSIONS = ['1.0.12', '1.0.11', '1.0.10', '1.0.9'];

const TEAMS = [
  { id: 'team-platform', name: 'Platform Engineering' },
  { id: 'team-frontend', name: 'Frontend' },
  { id: 'team-backend', name: 'Backend Services' },
  { id: 'team-data', name: 'Data Engineering' },
];

const USERS = [
  { id: 'u01', name: 'alice.chen', email: 'alice.chen@acme.dev', teamIdx: 0 },
  { id: 'u02', name: 'bob.martinez', email: 'bob.martinez@acme.dev', teamIdx: 0 },
  { id: 'u03', name: 'carol.johnson', email: 'carol.johnson@acme.dev', teamIdx: 0 },
  { id: 'u04', name: 'david.kim', email: 'david.kim@acme.dev', teamIdx: 0 },
  { id: 'u05', name: 'eva.mueller', email: 'eva.mueller@acme.dev', teamIdx: 0 },
  { id: 'u06', name: 'frank.zhao', email: 'frank.zhao@acme.dev', teamIdx: 1 },
  { id: 'u07', name: 'grace.patel', email: 'grace.patel@acme.dev', teamIdx: 1 },
  { id: 'u08', name: 'henry.wilson', email: 'henry.wilson@acme.dev', teamIdx: 1 },
  { id: 'u09', name: 'iris.tanaka', email: 'iris.tanaka@acme.dev', teamIdx: 1 },
  { id: 'u10', name: 'jack.brown', email: 'jack.brown@acme.dev', teamIdx: 1 },
  { id: 'u11', name: 'karen.lee', email: 'karen.lee@acme.dev', teamIdx: 2 },
  { id: 'u12', name: 'liam.garcia', email: 'liam.garcia@acme.dev', teamIdx: 2 },
  { id: 'u13', name: 'mia.nguyen', email: 'mia.nguyen@acme.dev', teamIdx: 2 },
  { id: 'u14', name: 'noah.smith', email: 'noah.smith@acme.dev', teamIdx: 2 },
  { id: 'u15', name: 'olivia.jones', email: 'olivia.jones@acme.dev', teamIdx: 2 },
  { id: 'u16', name: 'peter.wang', email: 'peter.wang@acme.dev', teamIdx: 3 },
  { id: 'u17', name: 'quinn.davis', email: 'quinn.davis@acme.dev', teamIdx: 3 },
  { id: 'u18', name: 'rachel.kumar', email: 'rachel.kumar@acme.dev', teamIdx: 3 },
  { id: 'u19', name: 'sam.taylor', email: 'sam.taylor@acme.dev', teamIdx: 3 },
  { id: 'u20', name: 'tina.andersson', email: 'tina.andersson@acme.dev', teamIdx: 3 },
  { id: 'u21', name: 'uma.hassan', email: 'uma.hassan@acme.dev', teamIdx: 3 },
  { id: 'u22', name: 'victor.ross', email: 'victor.ross@acme.dev', teamIdx: 1 },
];

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}
function randInt(min: number, max: number) {
  return Math.floor(rand(min, max));
}
function pick<T>(arr: T[]): T {
  return arr[randInt(0, arr.length)];
}
function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export function generateMockSessions(count: number): SessionMetrics[] {
  const now = Date.now();
  return Array.from({ length: count }, (_, i) => {
    const user = USERS[i % USERS.length];
    const team = TEAMS[user.teamIdx];
    const model = pick(MODELS);
    const inputTokens = randInt(500, 80000);
    const outputTokens = randInt(200, 30000);
    const cacheRead = randInt(0, 50000);
    const cacheCreation = randInt(0, 10000);
    const costs = MODEL_COSTS[model];
    const cost = inputTokens * costs.input + outputTokens * costs.output;
    const duration = randInt(60, 7200);
    return {
      sessionId: uuid(),
      userId: user.id,
      userName: user.name,
      teamId: team.id,
      teamName: team.name,
      organizationId: 'org-acme',
      model,
      startTime: new Date(now - randInt(0, 7 * 86400000)).toISOString(),
      duration,
      tokens: { input: inputTokens, output: outputTokens, cacheRead, cacheCreation },
      costUsd: parseFloat(cost.toFixed(4)),
      linesAdded: randInt(0, 500),
      linesRemoved: randInt(0, 200),
      commits: randInt(0, 5),
      pullRequests: Math.random() > 0.7 ? 1 : 0,
      toolCalls: randInt(5, 150),
      activeTimeUser: randInt(30, duration),
      activeTimeCli: randInt(30, duration),
      terminalType: pick(TERMINALS),
      appVersion: pick(VERSIONS),
    };
  });
}

export function generateUserSummaries(): UserSummary[] {
  return USERS.map((u) => {
    const team = TEAMS[u.teamIdx];
    const sessions = randInt(20, 200);
    const tokensPerSession = randInt(10000, 60000);
    const totalTokens = sessions * tokensPerSession;
    const model = pick(MODELS);
    const costs = MODEL_COSTS[model];
    const totalCost = totalTokens * ((costs.input + costs.output) / 2);
    return {
      userId: u.id,
      userName: u.name,
      email: u.email,
      teamId: team.id,
      teamName: team.name,
      totalSessions: sessions,
      totalTokens,
      totalCost: parseFloat(totalCost.toFixed(2)),
      totalLinesAdded: randInt(500, 15000),
      totalLinesRemoved: randInt(200, 8000),
      totalCommits: randInt(10, 200),
      totalPRs: randInt(3, 50),
      activeTimeHours: parseFloat(rand(10, 200).toFixed(1)),
      avgSessionDuration: randInt(300, 3600),
      topModel: model,
      lastActive: new Date(Date.now() - randInt(0, 3 * 86400000)).toISOString(),
    };
  });
}

export function generateTeamSummaries(): TeamSummary[] {
  const users = generateUserSummaries();
  return TEAMS.map((t) => {
    const members = users.filter((u) => u.teamId === t.id);
    return {
      teamId: t.id,
      teamName: t.name,
      memberCount: members.length,
      totalSessions: members.reduce((s, m) => s + m.totalSessions, 0),
      totalTokens: members.reduce((s, m) => s + m.totalTokens, 0),
      totalCost: parseFloat(members.reduce((s, m) => s + m.totalCost, 0).toFixed(2)),
      totalLinesChanged: members.reduce((s, m) => s + m.totalLinesAdded + m.totalLinesRemoved, 0),
      totalCommits: members.reduce((s, m) => s + m.totalCommits, 0),
      totalPRs: members.reduce((s, m) => s + m.totalPRs, 0),
      activeTimeHours: parseFloat(members.reduce((s, m) => s + m.activeTimeHours, 0).toFixed(1)),
      topModel: 'claude-sonnet-4-6',
      members,
    };
  });
}

export function generateOrgSummary(): OrgSummary {
  const teams = generateTeamSummaries();
  return {
    organizationId: 'org-acme',
    organizationName: 'Acme Corp',
    teamCount: teams.length,
    totalUsers: teams.reduce((s, t) => s + t.memberCount, 0),
    totalSessions: teams.reduce((s, t) => s + t.totalSessions, 0),
    totalTokens: teams.reduce((s, t) => s + t.totalTokens, 0),
    totalCost: parseFloat(teams.reduce((s, t) => s + t.totalCost, 0).toFixed(2)),
    totalLinesChanged: teams.reduce((s, t) => s + t.totalLinesChanged, 0),
    totalCommits: teams.reduce((s, t) => s + t.totalCommits, 0),
    totalPRs: teams.reduce((s, t) => s + t.totalPRs, 0),
    activeTimeHours: parseFloat(teams.reduce((s, t) => s + t.activeTimeHours, 0).toFixed(1)),
    teams,
  };
}

export function generateCostTrends(days: number): CostTrend[] {
  const now = new Date();
  return Array.from({ length: days }, (_, i) => {
    const date = new Date(now);
    date.setDate(date.getDate() - (days - 1 - i));
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const baseSessions = isWeekend ? randInt(5, 30) : randInt(40, 120);
    const baseTokens = baseSessions * randInt(15000, 45000);
    const baseCost = baseTokens * 0.000009;
    return {
      date: date.toISOString().split('T')[0],
      cost: parseFloat(baseCost.toFixed(2)),
      tokens: baseTokens,
      sessions: baseSessions,
    };
  });
}

export function generateTokenTimeSeries(hours: number): MetricDataPoint[] {
  const now = Date.now();
  return Array.from({ length: hours }, (_, i) => {
    const ts = new Date(now - (hours - 1 - i) * 3600000);
    const hour = ts.getHours();
    const isWorkHours = hour >= 9 && hour <= 18;
    const base = isWorkHours ? randInt(50000, 200000) : randInt(5000, 40000);
    return {
      timestamp: ts.toISOString(),
      value: base,
    };
  });
}

export function generateToolBreakdown(): ToolUsageBreakdown[] {
  return [
    { toolName: 'Read', count: randInt(3000, 8000), avgDurationMs: randInt(10, 50), successRate: rand(0.97, 1.0) },
    { toolName: 'Edit', count: randInt(2000, 6000), avgDurationMs: randInt(15, 80), successRate: rand(0.92, 0.99) },
    { toolName: 'Bash', count: randInt(1500, 5000), avgDurationMs: randInt(500, 5000), successRate: rand(0.85, 0.95) },
    { toolName: 'Write', count: randInt(800, 3000), avgDurationMs: randInt(20, 100), successRate: rand(0.95, 1.0) },
    { toolName: 'Glob', count: randInt(1000, 4000), avgDurationMs: randInt(5, 30), successRate: rand(0.98, 1.0) },
    { toolName: 'Grep', count: randInt(1200, 4500), avgDurationMs: randInt(10, 60), successRate: rand(0.97, 1.0) },
    { toolName: 'Task', count: randInt(200, 1000), avgDurationMs: randInt(2000, 15000), successRate: rand(0.88, 0.96) },
    { toolName: 'WebFetch', count: randInt(100, 600), avgDurationMs: randInt(800, 4000), successRate: rand(0.80, 0.95) },
    { toolName: 'TodoRead', count: randInt(300, 1200), avgDurationMs: randInt(5, 20), successRate: rand(0.99, 1.0) },
    { toolName: 'TodoWrite', count: randInt(200, 800), avgDurationMs: randInt(5, 20), successRate: rand(0.99, 1.0) },
  ].map((t) => ({ ...t, successRate: parseFloat(t.successRate.toFixed(3)) }));
}

export function generateModelBreakdown(): ModelUsageBreakdown[] {
  return [
    { model: 'claude-sonnet-4-6', sessions: randInt(400, 800), tokens: randInt(5_000_000, 15_000_000), cost: parseFloat(rand(80, 250).toFixed(2)) },
    { model: 'claude-opus-4.7', sessions: randInt(50, 150), tokens: randInt(1_000_000, 4_000_000), cost: parseFloat(rand(150, 500).toFixed(2)) },
    { model: 'claude-haiku-4.5', sessions: randInt(200, 500), tokens: randInt(3_000_000, 10_000_000), cost: parseFloat(rand(20, 80).toFixed(2)) },
  ];
}

export function generateActiveUsers(): ActiveUser[] {
  const statuses: ActiveUser['status'][] = ['active', 'active', 'active', 'idle', 'idle', 'offline'];
  return USERS.slice(0, 12).map((u) => ({
    userId: u.id,
    userName: u.name,
    status: pick(statuses),
    currentModel: pick(MODELS),
    sessionDuration: randInt(60, 5400),
    tokensUsed: randInt(1000, 80000),
  }));
}

export function generateCostByTokenType(hours: number) {
  const now = Date.now();
  return Array.from({ length: hours }, (_, i) => {
    const ts = new Date(now - (hours - 1 - i) * 3600000);
    const hour = ts.getHours();
    const mult = hour >= 9 && hour <= 18 ? 1 : 0.2;
    return {
      timestamp: ts.toISOString(),
      input: Math.round(randInt(10000, 60000) * mult),
      output: Math.round(randInt(5000, 25000) * mult),
      cacheRead: Math.round(randInt(15000, 80000) * mult),
      cacheCreation: Math.round(randInt(2000, 15000) * mult),
    };
  });
}
