import React from 'react';
import { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import CookieBanner from './components/CookieBanner';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ServicesPage from './pages/ServicesPage';
import ProjectsPage from './pages/ProjectsPage';
import RecruitmentPage from './pages/RecruitmentPage';
import ContactPage from './pages/ContactPage';
import JobOffersPage from './pages/JobOffersPage';
import LoginPage from './pages/LoginPage';
import ManagementApp from './pages/ManagementApp';
import WorkerLoginPage from './pages/WorkerLoginPage';
import WorkerPanelPage from './pages/WorkerPanelPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsConditionsPage from './pages/TermsConditionsPage';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [currentWorkerId, setCurrentWorkerId] = useState<string | null>(null);

  const handleWorkerLogin = (workerId: string) => {
    setCurrentWorkerId(workerId);
    setCurrentPage('worker-panel');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={setCurrentPage} />;
      case 'about':
        return <AboutPage />;
      case 'services':
        return <ServicesPage onNavigate={setCurrentPage} />;
      case 'projects':
        return <ProjectsPage />;
      case 'recruitment':
        return <RecruitmentPage />;
      case 'job-offers':
        return <JobOffersPage />;
      case 'contact':
        return <ContactPage />;
      case 'login':
        return <LoginPage onNavigate={setCurrentPage} />;
      case 'management':
        return <ManagementApp onNavigate={setCurrentPage} />;
      case 'worker-login':
        return <WorkerLoginPage onNavigate={setCurrentPage} onWorkerLogin={handleWorkerLogin} />;
      case 'worker-panel':
        return currentWorkerId ? (
          <WorkerPanelPage workerId={currentWorkerId} onNavigate={setCurrentPage} />
        ) : (
          <WorkerLoginPage onNavigate={setCurrentPage} onWorkerLogin={handleWorkerLogin} />
        );
      case 'privacy':
        return <PrivacyPolicyPage />;
      case 'terms':
        return <TermsConditionsPage />;
      default:
        return <HomePage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentPage={currentPage} onNavigate={setCurrentPage} />
      <main>
        {renderPage()}
      </main>
      <Footer onNavigate={setCurrentPage} />
      <WhatsAppButton />
      <CookieBanner />
    </div>
  );
}

export default App;
