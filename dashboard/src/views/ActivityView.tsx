import { useState, useMemo } from 'react';
import type { TimeRange, ViewLevel } from '../types';
import SessionsTable from '../components/SessionsTable';
import ActiveUsersTable from '../components/ActiveUsersTable';
import { generateMockSessions, generateActiveUsers, TEAM_LIST } from '../data/mockData';

interface ActivityViewProps {
  timeRange: TimeRange;
  viewLevel: ViewLevel;
}

export default function ActivityView({ timeRange, viewLevel }: ActivityViewProps) {
  const [selectedTeam, setSelectedTeam] = useState(TEAM_LIST[0]);
  const allSessions = useMemo(() => generateMockSessions(200), []);
  const allActiveUsers = useMemo(() => generateActiveUsers(), []);

  const timeLabel = { '1h': 'Last Hour', '6h': 'Last 6 Hours', '24h': 'Last 24 Hours', '7d': 'Last 7 Days', '30d': 'Last 30 Days' }[timeRange];

  // Filter sessions by view level
  const sessions = useMemo(() => {
    if (viewLevel === 'individual') return allSessions.filter((s) => s.userName === 'alice.chen');
    if (viewLevel === 'team') return allSessions.filter((s) => s.teamName === selectedTeam);
    return allSessions;
  }, [allSessions, viewLevel, selectedTeam]);

  const activeUsers = useMemo(() => {
    if (viewLevel === 'individual') return allActiveUsers.filter((u) => u.userName === 'alice.chen');
    return allActiveUsers;
  }, [allActiveUsers, viewLevel]);

  const recentEvents = useMemo(() => {
    return sessions.slice(0, 25).map((s) => ({
      id: s.sessionId,
      time: new Date(s.startTime),
      user: s.userName,
      team: s.teamName,
      action: s.commits > 0
        ? `Committed ${s.commits} change${s.commits > 1 ? 's' : ''}`
        : s.pullRequests > 0
        ? 'Opened a pull request'
        : `Ran ${s.toolCalls} tool calls`,
      model: s.model,
      cost: s.costUsd,
    }));
  }, [sessions]);

  const scopeLabel = viewLevel === 'individual' ? 'Your' : viewLevel === 'team' ? selectedTeam : 'Organization-wide';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">Activity Feed</h2>
          <p className="text-sm text-text-secondary">{scopeLabel} — {timeLabel}</p>
        </div>
        {viewLevel === 'team' && (
          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-text-primary outline-none"
          >
            {TEAM_LIST.map((t) => (
              <option key={t} value={t} className="bg-surface">{t}</option>
            ))}
          </select>
        )}
      </div>

      {/* Active Users */}
      <ActiveUsersTable data={activeUsers} />

      {/* Activity timeline */}
      <div className="rounded-xl border border-border bg-surface p-5">
        <h3 className="mb-4 text-sm font-semibold text-text-primary">Recent Events</h3>
        <div className="space-y-3">
          {recentEvents.map((e) => (
            <div key={e.id} className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-surface-hover">
              <div className="h-2 w-2 flex-shrink-0 rounded-full bg-accent" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-text-primary truncate">
                  <span className="font-medium">{e.user}</span>
                  {viewLevel !== 'individual' && <span className="text-text-muted text-xs"> ({e.team})</span>}
                  <span className="text-text-secondary"> — {e.action}</span>
                </p>
                <p className="text-xs text-text-muted">
                  {e.time.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  {' · '}{e.model}{' · '}${e.cost.toFixed(4)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Full sessions table */}
      <SessionsTable data={sessions} />
    </div>
  );
}
