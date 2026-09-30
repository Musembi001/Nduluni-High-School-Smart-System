/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { StudentPortal } from './components/StudentPortal';
import { FeePaymentSystem } from './components/FeePaymentSystem';
import { LibraryPortal } from './components/LibraryPortal';
import { EventCalendar } from './components/EventCalendar';
import { AcademicsSection } from './components/AcademicsSection';
import { AdmissionsSection } from './components/AdmissionsSection';
import { CampusSection } from './components/CampusSection';
import { ContactSection } from './components/ContactSection';
import { PrincipalDashboard } from './components/dashboards/PrincipalDashboard';
import { BursarDashboard } from './components/dashboards/BursarDashboard';
import { TeacherDashboard } from './components/dashboards/TeacherDashboard';
import { Footer } from './components/Footer';
import { AuthPortalModal } from './components/AuthPortalModal';

function MainAppContent() {
  const [currentTab, setCurrentTab] = useState<string>('overview');
  const [targetAdmissionNo, setTargetAdmissionNo] = useState<string | undefined>(undefined);
  const { role } = useAuth();

  // Scroll to top when changing tab
  const handleSelectTab = (tab: string) => {
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToFees = (admissionNo?: string) => {
    if (admissionNo) {
      setTargetAdmissionNo(admissionNo);
    }
    setCurrentTab('fees');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToPortal = () => {
    setCurrentTab('my_dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 font-sans text-stone-900 selection:bg-rose-950 selection:text-amber-300">
      {/* Top Navbar */}
      <Navbar currentTab={currentTab} onSelectTab={handleSelectTab} />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentTab === 'overview' && (
          <HeroSection onNavigate={handleSelectTab} />
        )}

        {/* Dynamic Role-Based Unique Dashboard */}
        {currentTab === 'my_dashboard' && (
          <>
            {role === 'PRINCIPAL' && <PrincipalDashboard />}
            {role === 'BURSAR' && <BursarDashboard />}
            {role === 'TEACHER' && <TeacherDashboard />}
            {role === 'STUDENT_PARENT' && (
              <StudentPortal onNavigateToFees={handleNavigateToFees} />
            )}
          </>
        )}

        {currentTab === 'fees' && (
          <FeePaymentSystem 
            initialAdmissionNo={targetAdmissionNo} 
            onNavigateToPortal={handleNavigateToPortal}
          />
        )}

        {currentTab === 'library' && (
          <LibraryPortal onNavigateToPortal={handleNavigateToPortal} />
        )}

        {currentTab === 'calendar' && (
          <EventCalendar />
        )}

        {currentTab === 'academics' && (
          <AcademicsSection />
        )}

        {currentTab === 'admissions' && (
          <AdmissionsSection />
        )}

        {currentTab === 'campus' && (
          <CampusSection />
        )}

        {currentTab === 'contact' && (
          <ContactSection />
        )}
      </main>

      {/* Institutional Footer */}
      <Footer onNavigate={handleSelectTab} />

      {/* Role-Based Authentication & Registration Modal */}
      <AuthPortalModal />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}
