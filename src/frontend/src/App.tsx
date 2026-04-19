import {
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from "@tanstack/react-router";
import { Layout } from "./components/Layout";

import { AnalyticsPage } from "./pages/Analytics";
import { CollectionsPage } from "./pages/Collections";
// ─── Page imports (lazy-ish — direct import for small app) ───────────────────
import { DashboardPage } from "./pages/Dashboard";
import { SettingsPage } from "./pages/Settings";
import { StudyPage } from "./pages/Study";

// ─── Route definitions ───────────────────────────────────────────────────────
const rootRoute = createRootRoute({ component: Layout });

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: DashboardPage,
});

const studyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/study",
  component: StudyPage,
});

const collectionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/collections",
  component: CollectionsPage,
});

const analyticsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/analytics",
  component: AnalyticsPage,
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings",
  component: SettingsPage,
});

const routeTree = rootRoute.addChildren([
  dashboardRoute,
  studyRoute,
  collectionsRoute,
  analyticsRoute,
  settingsRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
