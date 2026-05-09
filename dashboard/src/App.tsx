import { useState } from 'react';
import type { ViewLevel, TimeRange, NavPage } from './types';
import Layout from './components/Layout';
import IndividualView from './views/IndividualView';
import TeamView from './views/TeamView';
import OrgView from './views/OrgView';
import ActivityView from './views/ActivityView';
import UsageView from './views/UsageView';

export default function App() {
  const [viewLevel, setViewLevel] = useState<ViewLevel>('individual');
  const [timeRange, setTimeRange] = useState<TimeRange>('24h');
  const [activePage, setActivePage] = useState<NavPage>('dashboard');

  const renderContent = () => {
    switch (activePage) {
      case 'activity':
        return <ActivityView timeRange={timeRange} viewLevel={viewLevel} />;
      case 'usage':
        return <UsageView timeRange={timeRange} viewLevel={viewLevel} />;
      case 'dashboard':
      default:
        if (viewLevel === 'team') return <TeamView timeRange={timeRange} />;
        if (viewLevel === 'organization') return <OrgView timeRange={timeRange} />;
        return <IndividualView timeRange={timeRange} />;
    }
  };

  return (
    <Layout
      viewLevel={viewLevel}
      onViewLevelChange={setViewLevel}
      timeRange={timeRange}
      onTimeRangeChange={setTimeRange}
      activePage={activePage}
      onPageChange={setActivePage}
    >
      {renderContent()}
    </Layout>
  );
}
