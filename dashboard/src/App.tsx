import { useState } from 'react';
import type { ViewLevel, TimeRange } from './types';
import Layout from './components/Layout';
import IndividualView from './views/IndividualView';
import TeamView from './views/TeamView';
import OrgView from './views/OrgView';

export default function App() {
  const [viewLevel, setViewLevel] = useState<ViewLevel>('individual');
  const [timeRange, setTimeRange] = useState<TimeRange>('24h');

  return (
    <Layout
      viewLevel={viewLevel}
      onViewLevelChange={setViewLevel}
      timeRange={timeRange}
      onTimeRangeChange={setTimeRange}
    >
      {viewLevel === 'individual' && <IndividualView timeRange={timeRange} />}
      {viewLevel === 'team' && <TeamView timeRange={timeRange} />}
      {viewLevel === 'organization' && <OrgView timeRange={timeRange} />}
    </Layout>
  );
}
