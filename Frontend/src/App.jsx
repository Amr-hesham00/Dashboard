import HtmlPage from './components/HtmlPage.jsx';
import routes from './routes.json';
import AppBootstrap from './components/AppBootstrap.jsx';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import SignInPage from './components/SignInPage.jsx';
import SignUpPage from './components/SignUpPage.jsx';
import DashboardOverview from './components/DashboardOverview.jsx';
import ClientsPage from './components/ClientsPage.jsx';
import ClientDetailsPage from './components/ClientDetailsPage.jsx';
import PlatformsPage from './components/PlatformsPage.jsx';
import CampaignsPage from './components/CampaignsPage.jsx';
import AdSetsPage from './components/AdSetsPage.jsx';
import AccountSettingsPage from './components/AccountSettingsPage.jsx';

const pageModules = import.meta.glob('./content/**/*.html', { query: '?raw', import: 'default', eager: true });

const scriptMap = {
  sidebarnav: '/assets/js/vendors/sidebarnav.js',
  jsvectormap: [
    '/vendor/jsvectormap/dist/js/jsvectormap.min.js',
    '/vendor/jsvectormap/dist/maps/world.js',
    '/vendor/jsvectormap/dist/maps/world-merc.js',
  ],
  apexcharts: '/vendor/apexcharts/dist/apexcharts.min.js',
  chart: '/assets/js/vendors/chart.js',
  choices: ['/vendor/choices.js/public/assets/scripts/choices.min.js', '/assets/js/vendors/choice.js'],
  swiper: ['/vendor/swiper/swiper-bundle.min.js', '/assets/js/vendors/swiper.js'],
  password: '/assets/js/vendors/password.js',
};

function resolveScripts(keys = []) {
  const scripts = [];
  keys.forEach((key) => {
    const value = scriptMap[key];
    if (Array.isArray(value)) scripts.push(...value);
    else if (value) scripts.push(value);
  });
  return scripts;
}

function createPageComponent(routeMeta) {
  const html = pageModules[routeMeta.contentImport];
  if (!html) {
    return function MissingPage() {
      return <div>Missing content: {routeMeta.contentImport}</div>;
    };
  }

  const scripts = [...resolveScripts(routeMeta.scripts), ...routeMeta.externalScripts];

  return function Page() {
    return <HtmlPage html={html} title={routeMeta.title} scripts={scripts} />;
  };
}

const PUBLIC_ROUTES = [
  '/pages/authentication/sign-in',
  '/pages/authentication/sign-up',
  '/pages/authentication/forget-password',
  '/pages/authentication/reset-password',
  '/pages/authentication/otp-varification',
  '/pages/error/404-error',
  '/pages/error/maintenance',
];

const routeComponents = routes.map((routeMeta) => ({
  ...routeMeta,
  Component: createPageComponent(routeMeta),
}));

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppBootstrap />
        <Routes>
          <Route path="/pages/authentication/sign-in" element={<SignInPage />} />
          <Route path="/pages/authentication/sign-up" element={<SignUpPage />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardOverview />
              </ProtectedRoute>
            }
          />

          <Route
            path="/clients"
            element={
              <ProtectedRoute>
                <ClientsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/clients/:id"
            element={
              <ProtectedRoute>
                <ClientDetailsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/platforms"
            element={
              <ProtectedRoute>
                <PlatformsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/campaigns"
            element={
              <ProtectedRoute>
                <CampaignsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/adsets"
            element={
              <ProtectedRoute>
                <AdSetsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/account-settings"
            element={
              <ProtectedRoute>
                <AccountSettingsPage />
              </ProtectedRoute>
            }
          />

          <Route path="/account-setting" element={<Navigate to="/account-settings" replace />} />

          {routeComponents.map(({ route, Component }) => {
            if (
              route === '/' ||
              route === '/clients' ||
              route === '/platforms' ||
              route === '/campaigns' ||
              route === '/adsets' ||
              route === '/pages/clients' ||
              route === '/pages/platforms' ||
              route === '/pages/campaigns' ||
              route === '/pages/adsets' ||
              route === '/pages/authentication/sign-in' ||
              route === '/pages/authentication/sign-up'
            ) {
              return null;
            }

            const isPublic = PUBLIC_ROUTES.includes(route);
            const Element = isPublic ? (
              <Component />
            ) : (
              <ProtectedRoute>
                <Component />
              </ProtectedRoute>
            );

            return <Route key={route} path={route} element={Element} />;
          })}

          <Route path="*" element={<Navigate to="/pages/error/404-error" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
