import React, { createContext, useState, useEffect, useContext, ReactNode, useRef, useCallback } from 'react';

const SESSION_DURATION = 14 * 24 * 60 * 60 * 1000; // 14 days
const LOGIN_LINK_DURATION = 3 * 60; // 3 minutes in seconds

interface User {
  email: string;
  plan: 'free' | 'pro';
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// A simple in-memory store to simulate the backend process
const loginAttempt = {
  token: '',
  email: '',
  isConfirmed: false,
};

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

  useEffect(() => {
    try {
      const sessionData = localStorage.getItem('session');
      if (sessionData) {
        const session = JSON.parse(sessionData);
        if (session.expiry > Date.now()) {
          setUser({ email: session.email, plan: session.plan || 'free' });
        } else {
          localStorage.removeItem('session');
        }
      }
    } catch (error) {
      console.error("Failed to parse session data", error);
      localStorage.removeItem('session');
    }
  }, []);

  const persistSession = (userData: User) => {
    setUser(userData);
    localStorage.setItem('session', JSON.stringify({ ...userData, expiry: Date.now() + SESSION_DURATION }));
  };

  const updateUserPlan = (plan: 'free' | 'pro') => {
    if (user) {
      const updatedUser = { ...user, plan };
      persistSession(updatedUser);
    }
  };
  
  const pollForConfirmation = useCallback(() => {
      if (loginAttempt.isConfirmed) {
          const email = loginAttempt.email;
          // New users default to the 'free' plan
          persistSession({ email, plan: 'free' });
          
          // Reset
          cleanupTimers();
          setLoginState('idle');
          loginAttempt.isConfirmed = false;
          loginAttempt.token = '';
          loginAttempt.email = '';
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
      
      // Start countdown timer
      timers.current.countdown = window.setInterval(() => {
        setCountdown(prev => prev > 0 ? prev - 1 : 0);
      }, 1000);
      
      // Start polling for confirmation
      timers.current.poll = window.setTimeout(pollForConfirmation, 2000);
      
      // Set link expiry timer
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

  const value = { user, loginState, loginError, countdown, loginEmail, openLoginDialog, closeLoginDialog, sendLoginLink, confirmLogin, logout, updateUserPlan };

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