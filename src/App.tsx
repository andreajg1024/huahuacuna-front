import { useState, useEffect } from 'react';
import { Toaster } from './components/ui/sonner';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SponsorshipProvider } from './contexts/SponsorshipContext';
import { BitacoraProvider } from './contexts/BitacoraContext';
import { ProjectsProvider } from './contexts/ProjectsContext';
import { VolunteeringProvider } from './contexts/VolunteeringContext';
import { NewsProvider } from './contexts/NewsContext';
import { DonationsProvider } from './contexts/DonationsContext';
import { ReportsProvider } from './contexts/ReportsContext';

// Public Pages
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HeroSection } from './components/HeroSection';
import { AboutSection } from './components/AboutSection';
import { ProgramsSection } from './components/ProgramsSection';
import { ImpactSection } from './components/ImpactSection';
import { EventsSection } from './components/EventsSection';
import { ContactSection } from './components/ContactSection';

// Auth Pages
import { LoginPage } from './components/auth/LoginPage';
import { RegisterPage } from './components/auth/RegisterPage';
import { PasswordRecoveryPage } from './components/auth/PasswordRecoveryPage';
import { VerifyEmailPage } from './components/auth/VerifyEmailPage';

// Dashboard Pages
import { DashboardLayout } from './components/layouts/DashboardLayout';
import { SuperAdminDashboard } from './components/dashboards/SuperAdminDashboard';
import { AdminDashboard } from './components/dashboards/AdminDashboard';
import { PadrinoDashboard } from './components/dashboards/PadrinoDashboard';
import { ProfilePage } from './components/profile/ProfilePage';
import { AdminManagementPage } from './components/admin/AdminManagementPage';

// Sponsorship Pages
import { ChildrenCatalogPage } from './components/sponsorship/ChildrenCatalogPage';
import { SponsoredChildProfilePage } from './components/sponsorship/SponsoredChildProfilePage';

// Bitácora Pages
import { ChildFormPage } from './components/bitacora/ChildFormPage';
import { BitacoraTimelinePage } from './components/bitacora/BitacoraTimelinePage';
import { ChildrenManagementPage } from './components/bitacora/ChildrenManagementPage';

// Projects Pages
import { PublicProjectsPage } from './components/projects/PublicProjectsPage';
import { ProjectManagementPage } from './components/projects/ProjectManagementPage';
import { VolunteerManagementPage } from './components/projects/VolunteerManagementPage';

// Volunteering Pages
import { PublicVolunteeringPage } from './components/volunteering/PublicVolunteeringPage';
import { AdminVolunteerManagement } from './components/volunteering/AdminVolunteerManagement';

// News Pages
import { PublicNewsPage } from './components/news/PublicNewsPage';
import { AdminNewsManagement } from './components/news/AdminNewsManagement';

// Donations Pages
import { PublicDonationsPage } from './components/donations/PublicDonationsPage';
import { DonorDashboard } from './components/donations/DonorDashboard';
import { AdminDonationsManagement } from './components/donations/AdminDonationsManagement';

// Reports Pages
import { AdministrativeDashboard } from './components/reports/AdministrativeDashboard';
import { SponsorshipReports } from './components/reports/SponsorshipReports';
import { DonationReports } from './components/reports/DonationReports';

// Messaging & settings
import { MessagesPage } from './components/sponsorship/MessagesPage';
import { SystemSettingsPage } from './components/admin/SystemSettingsPage';

// AppContent actúa como el "router" principal de la SPA.
// - Controla la página actual mediante currentPage (home, dashboard, etc.).
// - Cuando el usuario está autenticado, muestra el DashboardLayout y las páginas internas según el rol.
// - Cuando NO está autenticado, muestra el landing público (Header + secciones públicas).
// Este componente se monta dentro de Next (pages/index.tsx) para mantener la estructura original del Figma.
function AppContent() {
  const { user, isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState('home');

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  // Auto-navigate to dashboard when user logs in
  useEffect(() => {
    console.log('🔄 Efecto de navegación ejecutándose...');
    console.log('  - isAuthenticated:', isAuthenticated);
    console.log('  - user:', user);
    console.log('  - currentPage:', currentPage);

    if (isAuthenticated && user) {
      console.log('✅ Condiciones cumplidas, navegando a dashboard...');
      setCurrentPage('dashboard');
    } else {
      console.log('❌ Condiciones NO cumplidas para navegar');
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    console.log('📄 currentPage cambió a:', currentPage);
  }, [currentPage]);

  const handleNavigate = (page: string) => {
    console.log('🔀 Navegando manualmente a:', page);
    setCurrentPage(page);
  };

  // Authentication Pages
  if (currentPage === 'login') {
    return <LoginPage onNavigate={handleNavigate} />;
  }

  if (currentPage === 'register') {
    return <RegisterPage onNavigate={handleNavigate} />;
  }

  if (currentPage === 'password-recovery') {
    return <PasswordRecoveryPage onNavigate={handleNavigate} />;
  }

  if (currentPage === 'verify-email') {
    return <VerifyEmailPage onNavigate={handleNavigate} />;
  }

  // Dashboard Pages (require authentication)
  if (isAuthenticated && user) {
    const renderDashboardContent = () => {
      switch (currentPage) {
        case 'dashboard':
          if (user.role === 'super_admin') {
            return <SuperAdminDashboard onNavigate={handleNavigate} />;
          } else if (user.role === 'admin') {
            return <AdminDashboard onNavigate={handleNavigate} />;
          } else if (user.role === 'padrino') {
            return <PadrinoDashboard onNavigate={handleNavigate} />;
          }
          return <PadrinoDashboard onNavigate={handleNavigate} />;
        
        case 'profile':
          return <ProfilePage />;
        
        case 'admin-management':
          // Gestión de administradores / usuarios internos
          if (user.role === 'super_admin' || user.role === 'admin') {
            return <AdminManagementPage />;
          }
          // Redirect to dashboard if no permisos
          setCurrentPage('dashboard');
          return null;
        
        case 'catalog':
          return <ChildrenCatalogPage />;
        
        case 'my-child':
          if (user.role === 'padrino') {
            return <SponsoredChildProfilePage onNavigate={handleNavigate} />;
          }
          setCurrentPage('dashboard');
          return null;
        
        case 'bitacora':
          // For padrino users, it will use their first sponsored child
          // For admin users, childId can be passed via state if needed
          return <BitacoraTimelinePage />;
        
        case 'child-form':
          if (user.role === 'admin' || user.role === 'super_admin') {
            return <ChildFormPage onNavigate={handleNavigate} />;
          }
          setCurrentPage('dashboard');
          return null;
        
        case 'children-management':
          if (user.role === 'admin' || user.role === 'super_admin') {
            return <ChildrenManagementPage onNavigate={handleNavigate} />;
          }
          setCurrentPage('dashboard');
          return null;
        
        case 'project-management':
          if (user.role === 'admin' || user.role === 'super_admin') {
            return <ProjectManagementPage onNavigate={handleNavigate} />;
          }
          setCurrentPage('dashboard');
          return null;
        
        case 'volunteer-management':
          if (user.role === 'admin' || user.role === 'super_admin') {
            return <VolunteerManagementPage onNavigate={handleNavigate} />;
          }
          setCurrentPage('dashboard');
          return null;
        
        case 'volunteering-applications':
          if (user.role === 'admin' || user.role === 'super_admin') {
            return <AdminVolunteerManagement />;
          }
          setCurrentPage('dashboard');
          return null;
        
        case 'news-management':
          if (user.role === 'admin' || user.role === 'super_admin') {
            return <AdminNewsManagement onNavigate={handleNavigate} />;
          }
          setCurrentPage('dashboard');
          return null;
        
        case 'my-donations':
          return <DonorDashboard />;
        
        case 'donations-management':
          if (user.role === 'admin' || user.role === 'super_admin') {
            return <AdminDonationsManagement />;
          }
          setCurrentPage('dashboard');
          return null;
        
        case 'admin-dashboard':
          if (user.role === 'admin' || user.role === 'super_admin') {
            return <AdministrativeDashboard onNavigate={handleNavigate} />;
          }
          setCurrentPage('dashboard');
          return null;
        
        case 'sponsorship-reports':
          if (user.role === 'admin' || user.role === 'super_admin') {
            return <SponsorshipReports onNavigate={handleNavigate} />;
          }
          setCurrentPage('dashboard');
          return null;
        
        case 'donation-reports':
          if (user.role === 'admin' || user.role === 'super_admin') {
            return <DonationReports onNavigate={handleNavigate} />;
          }
          setCurrentPage('dashboard');
          return null;
        
        case 'eventos':
          // Vista de eventos reutiliza la sección pública pero dentro del layout privado
          return <EventsSection />;
        
        case 'messages':
          // Centro de mensajes solo aplica para padrinos
          if (user.role === 'padrino') {
            return <MessagesPage onNavigate={handleNavigate} />;
          }
          setCurrentPage('dashboard');
          return null;
        
        case 'system-settings':
          // Configuración avanzada solo para super admin (se puede abrir a admin en el futuro)
          if (user.role === 'super_admin') {
            return <SystemSettingsPage onNavigate={handleNavigate} />;
          }
          setCurrentPage('dashboard');
          return null;
        
        default:
          return <PadrinoDashboard onNavigate={handleNavigate} />;
      }
    };

    return (
      <DashboardLayout onNavigate={handleNavigate}>
        {renderDashboardContent()}
      </DashboardLayout>
    );
  }

  // Public Pages
  const renderPublicSection = () => {
    switch (currentPage) {
      case 'home':
        return <HeroSection onNavigate={handleNavigate} />;
      case 'nosotros':
        return <AboutSection />;
      case 'programas':
        return <ProgramsSection />;
      case 'impacto':
        return <ImpactSection />;
      case 'eventos':
        return <EventsSection />;
      case 'contacto':
        return <ContactSection />;
      case 'proyectos':
        return <PublicProjectsPage />;
      case 'voluntariado':
        return <PublicVolunteeringPage />;
      case 'noticias':
        return <PublicNewsPage />;
      case 'donar':
      case 'donaciones':
        return <PublicDonationsPage />;
      default:
        return <HeroSection onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header onNavigate={handleNavigate} currentSection={currentPage} />
      
      <main className="flex-1 pt-20">
        {renderPublicSection()}
      </main>

      <Footer onNavigate={handleNavigate} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SponsorshipProvider>
        <BitacoraProvider>
          <ProjectsProvider>
            <VolunteeringProvider>
              <NewsProvider>
                <DonationsProvider>
                  <ReportsProvider>
                    <AppContent />
                    <Toaster />
                  </ReportsProvider>
                </DonationsProvider>
              </NewsProvider>
            </VolunteeringProvider>
          </ProjectsProvider>
        </BitacoraProvider>
      </SponsorshipProvider>
    </AuthProvider>
  );
}
