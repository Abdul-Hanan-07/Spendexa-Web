import { api } from './api';
import type { DashboardSummary } from './api';

// Login/register resolve the auth cookie before react-router has finished
// navigating to /dashboard and mounting DashboardPage -- without this, the
// dashboard fetch only starts once that mount happens, wasting the time in
// between. Firing it here, right as auth succeeds, lets it run in parallel
// with the navigation instead.
let prefetchedDashboard: Promise<DashboardSummary> | null = null;

export function prefetchDashboard() {
  prefetchedDashboard = api.getDashboard();
  // Swallow here so an unconsumed rejection doesn't surface as an unhandled
  // promise rejection -- useDashboardData's own .catch handles the real
  // error once it actually consumes this.
  prefetchedDashboard.catch(() => {});
}

export function consumePrefetchedDashboard(): Promise<DashboardSummary> | null {
  const promise = prefetchedDashboard;
  prefetchedDashboard = null;
  return promise;
}
