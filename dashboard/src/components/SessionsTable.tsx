import { useState, useMemo } from 'react';
import type { SessionMetrics } from '../types';
import { Search, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';


interface SessionsTableProps {
  data: SessionMetrics[];
}

type SortKey = 'startTime' | 'userName' | 'model' | 'duration' | 'costUsd' | 'linesAdded' | 'toolCalls';

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

const PAGE_SIZE = 10;

export default function SessionsTable({ data }: SessionsTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('startTime');
  const [sortAsc, setSortAsc] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return data.filter((s) =>
      s.sessionId.toLowerCase().includes(q) ||
      s.userName.toLowerCase().includes(q) ||
      s.model.toLowerCase().includes(q)
    );
  }, [data, search]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let cmp: number;
      if (sortKey === 'startTime') cmp = new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
      else if (typeof a[sortKey] === 'number') cmp = (a[sortKey] as number) - (b[sortKey] as number);
      else cmp = String(a[sortKey]).localeCompare(String(b[sortKey]));
      return sortAsc ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortAsc]);

  const pageCount = Math.ceil(sorted.length / PAGE_SIZE);
  const paged = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const th = (label: string, key: SortKey) => (
    <th
      className="cursor-pointer px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-secondary hover:text-text-primary transition-colors"
      onClick={() => handleSort(key)}
    >
      <span className="flex items-center gap-1">
        {label}
        {sortKey === key && (sortAsc ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
      </span>
    </th>
  );

  return (
    <div className="rounded-xl border border-border bg-surface overflow-hidden">
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <h3 className="text-sm font-semibold text-text-primary">Recent Sessions</h3>
        <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5">
          <Search size={14} className="text-text-muted" />
          <input
            type="text"
            placeholder="Search sessions..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="bg-transparent text-xs text-text-primary outline-none placeholder:text-text-muted w-36"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-border">
            <tr>
              {th('Time', 'startTime')}
              {th('User', 'userName')}
              {th('Model', 'model')}
              {th('Duration', 'duration')}
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">Tokens</th>
              {th('Cost', 'costUsd')}
              {th('Lines +/-', 'linesAdded')}
              {th('Tools', 'toolCalls')}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {paged.map((s) => (
              <>
                <tr
                  key={s.sessionId}
                  className="cursor-pointer transition-colors hover:bg-surface-hover"
                  onClick={() => setExpandedId(expandedId === s.sessionId ? null : s.sessionId)}
                >
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-text-secondary">
                    {new Date(s.startTime).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-text-primary font-medium">{s.userName}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs font-mono text-text-secondary">{s.model}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-text-secondary">{formatDuration(s.duration)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs font-mono text-text-secondary">
                    {(s.tokens.input + s.tokens.output).toLocaleString()}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs font-mono text-accent">${s.costUsd.toFixed(4)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-text-secondary">
                    <span className="text-success">+{s.linesAdded}</span>{' / '}
                    <span className="text-danger">-{s.linesRemoved}</span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-text-secondary">{s.toolCalls}</td>
                </tr>
                {expandedId === s.sessionId && (
                  <tr key={`${s.sessionId}-detail`}>
                    <td colSpan={8} className="bg-background px-6 py-4">
                      <div className="grid grid-cols-2 gap-4 text-xs sm:grid-cols-4">
                        <div><span className="text-text-muted">Session ID:</span> <span className="font-mono text-text-secondary">{s.sessionId.slice(0, 12)}...</span></div>
                        <div><span className="text-text-muted">Team:</span> <span className="text-text-secondary">{s.teamName}</span></div>
                        <div><span className="text-text-muted">Terminal:</span> <span className="text-text-secondary">{s.terminalType}</span></div>
                        <div><span className="text-text-muted">Version:</span> <span className="text-text-secondary">{s.appVersion}</span></div>
                        <div><span className="text-text-muted">Input Tokens:</span> <span className="font-mono text-text-secondary">{s.tokens.input.toLocaleString()}</span></div>
                        <div><span className="text-text-muted">Output Tokens:</span> <span className="font-mono text-text-secondary">{s.tokens.output.toLocaleString()}</span></div>
                        <div><span className="text-text-muted">Cache Read:</span> <span className="font-mono text-text-secondary">{s.tokens.cacheRead.toLocaleString()}</span></div>
                        <div><span className="text-text-muted">Commits:</span> <span className="text-text-secondary">{s.commits}</span></div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between border-t border-border px-5 py-3">
        <span className="text-xs text-text-muted">{filtered.length} sessions</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
            className="rounded p-1 text-text-secondary hover:bg-surface-hover disabled:opacity-30"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-xs text-text-secondary">{page + 1} / {pageCount || 1}</span>
          <button
            onClick={() => setPage(Math.min(pageCount - 1, page + 1))}
            disabled={page >= pageCount - 1}
            className="rounded p-1 text-text-secondary hover:bg-surface-hover disabled:opacity-30"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
