import { createBrowserRouter, Navigate } from 'react-router';
import DashboardLayout from './components/layout/DashboardLayout';
import LoginPage from './pages/LoginPage';
import ClientsListPage from './pages/ClientsListPage';
import ClientDetailPage from './pages/ClientDetailPage';
import ClientReportPage from './pages/ClientReportPage';
import PrintReportPage from './pages/PrintReportPage';

export const router = createBrowserRouter([
  {
    path: '/login',
    Component: LoginPage,
  },
  // Client-safe shareable report (no sidebar, no internal data)
  {
    path: '/report/:id',
    Component: ClientReportPage,
  },
  // Print/PDF-optimized full report
  {
    path: '/print/:id',
    Component: PrintReportPage,
  },
  {
    path: '/',
    Component: DashboardLayout,
    children: [
      {
        index: true,
        Component: () => <Navigate to="/clients" replace />,
      },
      {
        path: 'clients',
        Component: ClientsListPage,
      },
      {
        path: 'clients/:id',
        Component: ClientDetailPage,
      },
    ],
  },
  {
    path: '*',
    Component: () => <Navigate to="/login" replace />,
  },
]);
