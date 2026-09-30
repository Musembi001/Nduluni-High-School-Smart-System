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
import { AccountSettingsModal } from './components/AccountSettingsModal';

function MainAppContent() {
  const [currentTab, setCurrentTab] = useState<string>('overview');
  const [targetAdmissionNo, setTargetAdmissionNo] = useState<string | undefined>(undefined);
  const { role, currentUser, isAuthenticated, setIsAuthModalOpen } = useAuth();

  // Scroll to top when changing tab
  const handleSelectTab = (tab: string) => {
    setCurrentTab(tab);
    if ((tab === 'my_dashboard' || tab === 'fees') && !isAuthenticated) {
      setIsAuthModalOpen(true);
    }
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
    if (!isAuthenticated) setIsAuthModalOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 font-sans text-stone-900 selection:bg-rose-950 selection:text-amber-300">
      {/* Top Navbar */}
      <Navbar currentTab={currentTab} onSelectTab={handleSelectTab} />

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 w-full">
        {currentTab === 'overview' && (
          <HeroSection onNavigate={handleSelectTab} />
        )}

        {/* Dynamic Role-Based Unique Dashboard */}
        {currentTab === 'my_dashboard' && (
          isAuthenticated ? <>
            {role === 'PRINCIPAL' && <PrincipalDashboard />}
            {role === 'BURSAR' && <BursarDashboard />}
            {role === 'TEACHER' && <TeacherDashboard />}
            {role === 'STUDENT_PARENT' && (
              <StudentPortal admissionNo={currentUser.admissionNo} onNavigateToFees={handleNavigateToFees} />
            )}
          </> : (
            <section className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
              <h1 className="text-2xl font-bold font-display text-stone-900">Sign in to your school dashboard</h1>
              <p className="text-sm text-stone-600">Use your approved school account to open the dashboard assigned to your role.</p>
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="px-4 py-2.5 text-sm font-semibold text-white bg-rose-950 rounded-lg hover:bg-rose-900"
              >
                Sign in
              </button>
            </section>
          )
        )}

        {currentTab === 'fees' && (
          isAuthenticated && (role === 'STUDENT_PARENT' || role === 'BURSAR') ? (
            <FeePaymentSystem
              initialAdmissionNo={targetAdmissionNo}
              onNavigateToPortal={handleNavigateToPortal}
            />
          ) : (
            <section className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
              <h1 className="text-2xl font-bold font-display text-stone-900">Fee services require an authorized account</h1>
              <p className="text-sm text-stone-600">Sign in as a parent/guardian or bursar to view balances and payment records.</p>
              {!isAuthenticated && (
                <button onClick={() => setIsAuthModalOpen(true)} className="px-4 py-2.5 text-sm font-semibold text-white bg-rose-950 rounded-lg hover:bg-rose-900">
                  Sign in
                </button>
              )}
            </section>
          )
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
      <AccountSettingsModal />
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
