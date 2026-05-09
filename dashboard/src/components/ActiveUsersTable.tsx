import { useState } from 'react';
import type { ActiveUser } from '../types';
import clsx from 'clsx';

interface ActiveUsersTableProps {
  data: ActiveUser[];
}

type SortKey = 'userName' | 'status' | 'currentModel' | 'sessionDuration' | 'tokensUsed';

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

const STATUS_COLORS: Record<ActiveUser['status'], string> = {
  active: 'bg-success',
  idle: 'bg-warning',
  offline: 'bg-text-muted',
};

export default function ActiveUsersTable({ data }: ActiveUsersTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('status');
  const [sortAsc, setSortAsc] = useState(true);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  };

  const statusOrder = { active: 0, idle: 1, offline: 2 };
  const sorted = [...data].sort((a, b) => {
    let cmp: number;
    if (sortKey === 'status') cmp = statusOrder[a.status] - statusOrder[b.status];
    else if (sortKey === 'sessionDuration' || sortKey === 'tokensUsed') cmp = a[sortKey] - b[sortKey];
    else cmp = a[sortKey].localeCompare(b[sortKey]);
    return sortAsc ? cmp : -cmp;
  });

  const th = (label: string, key: SortKey) => (
    <th
      className="cursor-pointer px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-secondary hover:text-text-primary transition-colors"
      onClick={() => handleSort(key)}
    >
      {label} {sortKey === key ? (sortAsc ? '↑' : '↓') : ''}
    </th>
  );

  return (
    <div className="rounded-xl border border-border bg-surface overflow-hidden">
      <h3 className="px-5 pt-5 pb-3 text-sm font-semibold text-text-primary">Active Users</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-border">
            <tr>
              {th('User', 'userName')}
              {th('Status', 'status')}
              {th('Model', 'currentModel')}
              {th('Duration', 'sessionDuration')}
              {th('Tokens', 'tokensUsed')}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sorted.map((u) => (
              <tr key={u.userId} className="transition-colors hover:bg-surface-hover">
                <td className="whitespace-nowrap px-4 py-3 text-sm text-text-primary font-medium">{u.userName}</td>
                <td className="whitespace-nowrap px-4 py-3">
                  <span className="flex items-center gap-2 text-xs">
                    <span className={clsx('h-2 w-2 rounded-full', STATUS_COLORS[u.status])} />
                    <span className="capitalize text-text-secondary">{u.status}</span>
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-xs font-mono text-text-secondary">{u.currentModel}</td>
                <td className="whitespace-nowrap px-4 py-3 text-xs text-text-secondary">{formatDuration(u.sessionDuration)}</td>
                <td className="whitespace-nowrap px-4 py-3 text-xs font-mono text-text-secondary">{u.tokensUsed.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
