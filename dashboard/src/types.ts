export type ViewLevel = 'individual' | 'team' | 'organization';
export type TimeRange = '1h' | '6h' | '24h' | '7d' | '30d';
export type NavPage = 'dashboard' | 'activity' | 'usage';

export interface MetricDataPoint {
  timestamp: string;
  value: number;
}

export interface TokenUsage {
  input: number;
  output: number;
  cacheRead: number;
  cacheCreation: number;
}

export interface SessionMetrics {
  sessionId: string;
  userId: string;
  userName: string;
  teamId: string;
  teamName: string;
  organizationId: string;
  model: string;
  startTime: string;
  duration: number;
  tokens: TokenUsage;
  costUsd: number;
  linesAdded: number;
  linesRemoved: number;
  commits: number;
  pullRequests: number;
  toolCalls: number;
  activeTimeUser: number;
  activeTimeCli: number;
  terminalType: string;
  appVersion: string;
}

export interface UserSummary {
  userId: string;
  userName: string;
  email: string;
  teamId: string;
  teamName: string;
  totalSessions: number;
  totalTokens: number;
  totalCost: number;
  totalLinesAdded: number;
  totalLinesRemoved: number;
  totalCommits: number;
  totalPRs: number;
  activeTimeHours: number;
  avgSessionDuration: number;
  topModel: string;
  lastActive: string;
}

export interface TeamSummary {
  teamId: string;
  teamName: string;
  memberCount: number;
  totalSessions: number;
  totalTokens: number;
  totalCost: number;
  totalLinesChanged: number;
  totalCommits: number;
  totalPRs: number;
  activeTimeHours: number;
  topModel: string;
  members: UserSummary[];
}

export interface OrgSummary {
  organizationId: string;
  organizationName: string;
  teamCount: number;
  totalUsers: number;
  totalSessions: number;
  totalTokens: number;
  totalCost: number;
  totalLinesChanged: number;
  totalCommits: number;
  totalPRs: number;
  activeTimeHours: number;
  teams: TeamSummary[];
}

export interface ToolUsageBreakdown {
  toolName: string;
  count: number;
  avgDurationMs: number;
  successRate: number;
}

export interface ModelUsageBreakdown {
  model: string;
  sessions: number;
  tokens: number;
  cost: number;
}

export interface CostTrend {
  date: string;
  cost: number;
  tokens: number;
  sessions: number;
}

export interface ActiveUser {
  userId: string;
  userName: string;
  status: 'active' | 'idle' | 'offline';
  currentModel: string;
  sessionDuration: number;
  tokensUsed: number;
}
