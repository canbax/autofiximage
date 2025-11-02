import React, { createContext, useState, useEffect, useContext, ReactNode, useRef, useCallback } from 'react';

const SESSION_DURATION = 14 * 24 * 60 * 60 * 1000; // 14 days
const LOGIN_LINK_DURATION = 3 * 60; // 3 minutes in seconds
const USAGE_RESET_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days
const PLAN_LIMITS = { free: 5, pro: Infinity };

interface User {
  email: string;
  plan: 'free' | 'pro';
  apiKey: string;
  apiUsage: number;
  usageResetDate: number; // Timestamp
}

interface AuthContextType {
  user: User | null;
  loginState: 'idle' | 'prompting' | 'sending' | 'waiting' | 'error';
  loginError: string | null;
  countdown: number;
  loginEmail: string;
  openLoginDialog: () => void;
  closeLoginDialog: () => void;
  sendLoginLink: (email: string) => void;
  confirmLogin: (token: string) => void;
  logout: () => void;
  updateUserPlan: (plan: 'free' | 'pro') => void;
  regenerateApiKey: () => void;
  consumeApiCredit: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// A simple in-memory store to simulate the backend process
const loginAttempt = {
  token: '',
  email: '',
  isConfirmed: false,
};

const generateApiKey = () => `pk_demo_${Math.random().toString(36).substring(2)}`;

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loginState, setLoginState] = useState<AuthContextType['loginState']>('idle');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(LOGIN_LINK_DURATION);
  const [loginEmail, setLoginEmail] = useState('');

  const timers = useRef<{ expiry?: number, poll?: number, countdown?: number }>({});

  const cleanupTimers = useCallback(() => {
    if (timers.current.expiry) clearTimeout(timers.current.expiry);
    if (timers.current.poll) clearTimeout(timers.current.poll);
    if (timers.current.countdown) clearInterval(timers.current.countdown);
    timers.current = {};
  }, []);
  
  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('session');
    cleanupTimers();
    setLoginState('idle');
  }, [cleanupTimers]);
  
  const persistSession = (userData: Omit<User, 'apiKey' | 'apiUsage' | 'usageResetDate'> & Partial<User>) => {
    const sessionData: User & { expiry: number } = {
        email: userData.email,
        plan: userData.plan,
        apiKey: userData.apiKey || generateApiKey(),
        apiUsage: userData.apiUsage || 0,
        usageResetDate: userData.usageResetDate || Date.now() + USAGE_RESET_DURATION,
        expiry: Date.now() + SESSION_DURATION
    };
    
    setUser({ 
        email: sessionData.email, 
        plan: sessionData.plan, 
        apiKey: sessionData.apiKey, 
        apiUsage: sessionData.apiUsage, 
        usageResetDate: sessionData.usageResetDate 
    });
    localStorage.setItem('session', JSON.stringify(sessionData));
  };

  useEffect(() => {
    try {
      const sessionData = localStorage.getItem('session');
      if (sessionData) {
        const session = JSON.parse(sessionData);
        if (session.expiry > Date.now()) {
          // Check for usage reset
          if (Date.now() > session.usageResetDate) {
              session.apiUsage = 0;
              session.usageResetDate = Date.now() + USAGE_RESET_DURATION;
              localStorage.setItem('session', JSON.stringify(session));
          }
          setUser({ 
              email: session.email, 
              plan: session.plan || 'free',
              apiKey: session.apiKey || generateApiKey(),
              apiUsage: session.apiUsage || 0,
              usageResetDate: session.usageResetDate
          });
        } else {
          localStorage.removeItem('session');
        }
      }
    } catch (error) {
      localStorage.removeItem('session');
    }
  }, []);

  const updateUserPlan = (plan: 'free' | 'pro') => {
    if (user) {
      const updatedUser = { ...user, plan };
      persistSession(updatedUser);
    }
  };
  
  const regenerateApiKey = () => {
    if (user) {
        const updatedUser = { ...user, apiKey: generateApiKey() };
        persistSession(updatedUser);
    }
  };
  
  const consumeApiCredit = (): boolean => {
    if (!user) return false;
    
    // Create a mutable copy to update
    let currentUserState = { ...user };

    // Check if usage should be reset
    if (Date.now() > currentUserState.usageResetDate) {
        currentUserState.apiUsage = 0;
        currentUserState.usageResetDate = Date.now() + USAGE_RESET_DURATION;
    }

    if (currentUserState.apiUsage >= PLAN_LIMITS[currentUserState.plan]) {
        return false; // Over limit
    }
    
    const updatedUser = { ...currentUserState, apiUsage: currentUserState.apiUsage + 1 };
    persistSession(updatedUser);
    return true;
  };

  const pollForConfirmation = useCallback(() => {
      if (loginAttempt.isConfirmed) {
          const email = loginAttempt.email;
          persistSession({ email, plan: 'free' });
          cleanupTimers();
          setLoginState('idle');
          loginAttempt.isConfirmed = false;
      } else {
         timers.current.poll = window.setTimeout(pollForConfirmation, 2000);
      }
  }, [cleanupTimers]);


  const sendLoginLink = (email: string) => {
    setLoginState('sending');
    setLoginError(null);
    cleanupTimers();

    setTimeout(() => {
      loginAttempt.token = Math.random().toString(36).substring(2);
      loginAttempt.email = email;
      loginAttempt.isConfirmed = false;
      setLoginEmail(email);
      setCountdown(LOGIN_LINK_DURATION);
      setLoginState('waiting');
      
      timers.current.countdown = window.setInterval(() => setCountdown(prev => prev > 0 ? prev - 1 : 0), 1000);
      timers.current.poll = window.setTimeout(pollForConfirmation, 2000);
      timers.current.expiry = window.setTimeout(() => {
        setLoginState('error');
        setLoginError('loginDialog.error.expired');
        cleanupTimers();
      }, LOGIN_LINK_DURATION * 1000);
    }, 1000);
  };
  
  const confirmLogin = (token: string) => {
    if (token === loginAttempt.token) {
        loginAttempt.isConfirmed = true;
    }
  };

  const openLoginDialog = () => setLoginState('prompting');
  
  const closeLoginDialog = () => {
    cleanupTimers();
    setLoginState('idle');
    setLoginError(null);
  };

  const value = { user, loginState, loginError, countdown, loginEmail, openLoginDialog, closeLoginDialog, sendLoginLink, confirmLogin, logout, updateUserPlan, regenerateApiKey, consumeApiCredit };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const getLoginToken = () => loginAttempt.token;