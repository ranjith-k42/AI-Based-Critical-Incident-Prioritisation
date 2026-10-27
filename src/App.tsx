import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { TicketListPage } from './pages/TicketListPage';
import { TicketDetailPage } from './pages/TicketDetailPage';
import { CreateTicketPage } from './pages/CreateTicketPage';
import { EvidencePage } from './pages/EvidencePage';
import { OverridePage } from './pages/OverridePage';
import { AuditTrailPage } from './pages/AuditTrailPage';
import { FalsePositivePage } from './pages/FalsePositivePage';
import { FalseNegativePage } from './pages/FalseNegativePage';
import { PerformancePage } from './pages/PerformancePage';
import { RolesPage } from './pages/RolesPage';
import { OrganisationsPage } from './pages/OrganisationsPage';
import { ConfigurationPage } from './pages/ConfigurationPage';
import { EdgeCasesPage } from './pages/EdgeCasesPage';
import { StakeholderEthicsPage } from './pages/StakeholderEthicsPage';
import { DeploymentChecklistPage } from './pages/DeploymentChecklistPage';
import { fetchUsers } from './api/client';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ToastProvider } from './components/Toast';

export function App() {
  const [users, setUsers] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activePage, setActivePage] = useState<string>('dashboard');
  const [pageParams, setPageParams] = useState<any>({});
  const [loadingUsers, setLoadingUsers] = useState<boolean>(true);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      setLoadingUsers(true);
      const list = await fetchUsers();
      setUsers(list || []);
      if (list && list.length > 0) {
        // Default to MSP Administrator
        const admin = list.find((u: any) => u.role === 'MSP Administrator') || list[0];
        setCurrentUser(admin);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      // Fallback default user
      const fallback = {
        id: 'USR-01',
        username: 'admin',
        name: 'Marcus Bradley',
        role: 'MSP Administrator',
        organisation_id: 'MSP-INTERNAL',
        organisation_name: 'Global Managed Services'
      };
      setUsers([fallback]);
      setCurrentUser(fallback);
    } finally {
      setLoadingUsers(false);
    }
  }

  function handleNavigate(page: string, params: any = {}) {
    setActivePage(page);
    setPageParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleSelectUser(user: any) {
    setCurrentUser(user);
  }

  return (
    <ErrorBoundary>
    <ToastProvider>
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      
      {/* Top Header & Role Navigation */}
      <Header
        currentUser={currentUser}
        users={users}
        onSelectUser={handleSelectUser}
        activePage={activePage}
        onNavigate={handleNavigate}
      />

      {/* Main Container Rendering Active Page */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activePage === 'login' && (
          <LoginPage
            currentUser={currentUser}
            users={users}
            onSelectUser={handleSelectUser}
            onNavigate={handleNavigate}
          />
        )}

        {activePage === 'dashboard' && (
          <DashboardPage
            currentUser={currentUser}
            onNavigate={handleNavigate}
          />
        )}

        {activePage === 'tickets' && (
          <TicketListPage
            currentUser={currentUser}
            onNavigate={handleNavigate}
            initialFilters={pageParams}
          />
        )}

        {activePage === 'ticket-detail' && (
          <TicketDetailPage
            ticketId={pageParams.id || 'TICK-00001'}
            currentUser={currentUser}
            onNavigate={handleNavigate}
          />
        )}

        {activePage === 'create-ticket' && (
          <CreateTicketPage
            currentUser={currentUser}
            onNavigate={handleNavigate}
          />
        )}

        {activePage === 'evidence' && (
          <EvidencePage
            ticketId={pageParams.id}
            onNavigate={handleNavigate}
          />
        )}

        {activePage === 'override' && (
          <OverridePage
            ticketId={pageParams.id}
            currentUser={currentUser}
            onNavigate={handleNavigate}
          />
        )}

        {activePage === 'audit-trail' && (
          <AuditTrailPage />
        )}

        {activePage === 'false-positives' && (
          <FalsePositivePage />
        )}

        {activePage === 'false-negatives' && (
          <FalseNegativePage />
        )}

        {activePage === 'performance' && (
          <PerformancePage />
        )}

        {activePage === 'roles' && (
          <RolesPage
            currentUser={currentUser}
            users={users}
            onSelectUser={handleSelectUser}
            onNavigate={handleNavigate}
          />
        )}

        {activePage === 'organisations' && (
          <OrganisationsPage
            onNavigate={handleNavigate}
          />
        )}

        {activePage === 'configuration' && (
          <ConfigurationPage
            currentUser={currentUser}
            onNavigate={handleNavigate}
          />
        )}

        {activePage === 'edge-cases' && (
          <EdgeCasesPage
            onNavigate={handleNavigate}
          />
        )}

        {activePage === 'stakeholder-ethics' && (
          <StakeholderEthicsPage />
        )}

        {activePage === 'deployment-checklist' && (
          <DeploymentChecklistPage />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Clinical & Business Impact Prioritiser &copy; 2026</span>
          <span className="font-mono text-slate-600">
            Node.js 22 SQLite • 5,000 Synthetic Records • Multi-Tenant RBAC
          </span>
        </div>
      </footer>

    </div>
    </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
