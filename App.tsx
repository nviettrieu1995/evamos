import React, { useEffect, useState } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { LocalizationProvider } from './contexts/LocalizationContext';
import AppRouter from './routes/AppRouter';
import OnboardingModal from './components/ui/OnboardingModal';
import { ONBOARDING_COMPLETED_KEY } from './constants';

// Thêm các dòng sau để dùng Firebase Auth
import { auth } from './firebase/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

const AppContent: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isOnboardingCheckDone, setIsOnboardingCheckDone] = useState(false);

  // Lắng nghe đăng nhập/đăng xuất realtime từ Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Hiển thị onboarding nếu chưa hoàn thành
  useEffect(() => {
    if (!authLoading && currentUser && !isOnboardingCheckDone) {
      const onboardingCompleted = localStorage.getItem(ONBOARDING_COMPLETED_KEY);
      if (onboardingCompleted !== 'true') {
        setShowOnboarding(true);
      }
      setIsOnboardingCheckDone(true);
    }

    if (!currentUser) {
      setIsOnboardingCheckDone(false);
    }
  }, [currentUser, authLoading, isOnboardingCheckDone]);

  const handleCloseOnboarding = (skippedOrFinished: boolean) => {
    setShowOnboarding(false);
    if (skippedOrFinished) {
      localStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
    }
  };

  if (authLoading) return <div className="text-center p-8">Đang kiểm tra đăng nhập...</div>;

  return (
    <>
      <AppRouter currentUser={currentUser} />
      {showOnboarding && <OnboardingModal onClose={handleCloseOnboarding} />}
    </>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <LocalizationProvider>
        <AppContent />
      </LocalizationProvider>
    </ThemeProvider>
  );
};

export default App;
