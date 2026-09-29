import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/common/Navbar';
import { BottomNav } from './components/common/BottomNav';
import { CustomerDashboard } from './components/customer/CustomerDashboard';
import { BreakdownModal } from './components/customer/BreakdownModal';
import { TrackingScreen } from './components/customer/TrackingScreen';
import { PaymentModal } from './components/customer/PaymentModal';
import { ReviewModal } from './components/customer/ReviewModal';
import { SosModal } from './components/customer/SosModal';
import { AIAssistantModal } from './components/customer/AIAssistantModal';
import { ImageDamageModal } from './components/customer/ImageDamageModal';
import { VehiclesView } from './components/customer/VehiclesView';
import { RepairHistoryView } from './components/customer/RepairHistoryView';
import { MaintenanceView } from './components/customer/MaintenanceView';
import { MechanicDashboard } from './components/mechanic/MechanicDashboard';
import { MechanicJobScreen } from './components/mechanic/MechanicJobScreen';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { ChatDrawer } from './components/chat/ChatDrawer';
import { LoginPage } from './components/auth/LoginPage';
import { UserProfilePage } from './components/auth/UserProfilePage';
import { RoadfixSplashScreen } from './components/common/RoadfixSplashScreen';
import { Wrench } from 'lucide-react';
import { BreakdownProblem } from './types';

const MainAppContent: React.FC = () => {
  const { role, user, isInitializing } = useAuth();

  // App splash screen animation state
  const [showSplash, setShowSplash] = useState(true);

  // Navigation tab
  const [currentTab, setCurrentTab] = useState<string>('home');

  // Modals
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isBreakdownModalOpen, setIsBreakdownModalOpen] = useState(false);
  const [preselectedProblem, setPreselectedProblem] = useState<BreakdownProblem | undefined>(undefined);
  const [isSosModalOpen, setIsSosModalOpen] = useState(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [isDamageAnalysisOpen, setIsDamageAnalysisOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentBookingId, setPaymentBookingId] = useState<string>('');
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewBookingId, setReviewBookingId] = useState<string>('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatBookingId, setChatBookingId] = useState<string>('');

  // Selected active job for mechanic job screen
  const [activeMechanicJobId, setActiveMechanicJobId] = useState<string>('RF-2026-00125');

  // Switch tabs cleanly when role changes
  React.useEffect(() => {
    if (role === 'customer') {
      setCurrentTab('home');
    } else if (role === 'mechanic') {
      setCurrentTab('dashboard');
    } else if (role === 'admin') {
      setCurrentTab('dashboard');
    }
  }, [role]);

  const handleStartBreakdown = (problem?: BreakdownProblem) => {
    setPreselectedProblem(problem);
    setIsBreakdownModalOpen(true);
  };

  const handleBookingCreated = (bookingId: string) => {
    setCurrentTab('tracking');
    setPaymentBookingId(bookingId);
  };

  const handleOpenChat = (bookingId: string) => {
    setChatBookingId(bookingId);
    setIsChatOpen(true);
  };

  const handleOpenPayment = (bookingId: string) => {
    setPaymentBookingId(bookingId);
    setIsPaymentModalOpen(true);
  };

  const handleOpenReview = (bookingId: string) => {
    setReviewBookingId(bookingId);
    setIsReviewModalOpen(true);
  };

  const handleOpenMechanicJob = (bookingId: string) => {
    setActiveMechanicJobId(bookingId);
    setCurrentTab('active-job');
  };

  // 1. AT FIRSTLY: SHOW ROADFIX TEMPLATE & LOADING ANIMATION
  if (showSplash) {
    return <RoadfixSplashScreen onComplete={() => setShowSplash(false)} />;
  }

  // 2. Initial Authentication Check Loader
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 p-0.5 shadow-2xl shadow-amber-500/30 animate-pulse">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
            <Wrench className="w-7 h-7 text-amber-400" />
          </div>
        </div>
        <h2 className="mt-4 text-base font-bold tracking-tight text-white flex items-center gap-1.5">
          Roadfix <span className="text-amber-400">24/7</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">Starting 24/7 Roadside Assistance Network...</p>
      </div>
    );
  }

  // 3. AT FIRSTLY SHOW LOGIN PAGE (When user is not authenticated)
  // Only registered users in the database can sign in
  if (!user) {
    return (
      <LoginPage
        onSuccess={() => {
          if (role === 'mechanic' || role === 'admin') {
            setCurrentTab('dashboard');
          } else {
            setCurrentTab('home');
          }
        }}
      />
    );
  }

  // 3. AFTER LOGIN: OPEN FULL APPLICATION
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Navbar */}
      <Navbar
        onOpenSos={() => setIsSosModalOpen(true)}
        onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
        onOpenDamageAnalysis={() => setIsDamageAnalysisOpen(true)}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Dedicated User Profile / Details Tab (Available for all roles) */}
        {currentTab === 'profile' && (
          <UserProfilePage
            onOpenVehicles={() => setCurrentTab('vehicles')}
            onOpenSos={() => setIsSosModalOpen(true)}
            onOpenLogin={() => setIsLoginModalOpen(true)}
            onBackToDashboard={() => {
              if (role === 'customer') setCurrentTab('home');
              else setCurrentTab('dashboard');
            }}
          />
        )}

            {/* ROLE 1: CUSTOMER VIEWS */}
            {role === 'customer' && currentTab !== 'profile' && (
              <>
                {currentTab === 'home' && (
                  <CustomerDashboard
                    onStartBreakdown={handleStartBreakdown}
                    onOpenTracking={() => setCurrentTab('tracking')}
                    onOpenVehicles={() => setCurrentTab('vehicles')}
                    onOpenMaintenance={() => setCurrentTab('maintenance')}
                    onOpenHistory={() => setCurrentTab('history')}
                    onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
                  />
                )}

                {currentTab === 'tracking' && (
                  <TrackingScreen
                    onOpenChat={handleOpenChat}
                    onOpenPayment={handleOpenPayment}
                    onOpenReview={handleOpenReview}
                    onBackToHome={() => setCurrentTab('home')}
                  />
                )}

                {currentTab === 'vehicles' && (
                  <VehiclesView onBack={() => setCurrentTab('home')} />
                )}

                {currentTab === 'history' && (
                  <RepairHistoryView
                    onViewInvoice={handleOpenPayment}
                    onRateBooking={handleOpenReview}
                    onBack={() => setCurrentTab('home')}
                  />
                )}

                {currentTab === 'maintenance' && (
                  <MaintenanceView onBack={() => setCurrentTab('home')} />
                )}
              </>
            )}

            {/* ROLE 2: MECHANIC VIEWS */}
            {role === 'mechanic' && currentTab !== 'profile' && (
              <>
                {currentTab === 'dashboard' && (
                  <MechanicDashboard
                    onOpenJobScreen={handleOpenMechanicJob}
                    onOpenChat={handleOpenChat}
                  />
                )}

                {currentTab === 'requests' && (
                  <MechanicDashboard
                    onOpenJobScreen={handleOpenMechanicJob}
                    onOpenChat={handleOpenChat}
                  />
                )}

                {currentTab === 'active-job' && (
                  <MechanicJobScreen
                    bookingId={activeMechanicJobId}
                    onBack={() => setCurrentTab('dashboard')}
                    onOpenChat={handleOpenChat}
                  />
                )}

                {currentTab === 'earnings' && (
                  <MechanicDashboard
                    onOpenJobScreen={handleOpenMechanicJob}
                    onOpenChat={handleOpenChat}
                  />
                )}
              </>
            )}

            {/* ROLE 3: ADMIN VIEWS */}
            {role === 'admin' && currentTab !== 'profile' && <AdminDashboard />}
      </main>

      {/* Global Interactive Modals */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl my-auto">
            <button
              onClick={() => setIsLoginModalOpen(false)}
              className="absolute top-4 right-4 z-10 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
            >
              ✕
            </button>
            <LoginPage
              onSuccess={() => setIsLoginModalOpen(false)}
              onClose={() => setIsLoginModalOpen(false)}
            />
          </div>
        </div>
      )}

      <BreakdownModal
        isOpen={isBreakdownModalOpen}
        onClose={() => setIsBreakdownModalOpen(false)}
        preselectedProblem={preselectedProblem}
        onBookingCreated={handleBookingCreated}
      />

      <SosModal
        isOpen={isSosModalOpen}
        onClose={() => setIsSosModalOpen(false)}
      />

      <AIAssistantModal
        isOpen={isAiAssistantOpen}
        onClose={() => setIsAiAssistantOpen(false)}
        onDispatchHelp={(query) => {
          setIsBreakdownModalOpen(true);
        }}
      />

      <ImageDamageModal
        isOpen={isDamageAnalysisOpen}
        onClose={() => setIsDamageAnalysisOpen(false)}
        onProceedToBooking={(problemType) => {
          setPreselectedProblem(problemType as any);
          setIsBreakdownModalOpen(true);
        }}
      />

      <PaymentModal
        bookingId={paymentBookingId || 'RR-2026-00125'}
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onPaymentSuccess={() => {}}
      />

      <ReviewModal
        bookingId={reviewBookingId || 'RR-2026-00120'}
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
      />

      <ChatDrawer
        bookingId={chatBookingId || 'RR-2026-00125'}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />

      {/* Mobile-first bottom navigation bar */}
      <BottomNav currentTab={currentTab} setCurrentTab={setCurrentTab} />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}

export default App;
