
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { GameState } from '../types';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, writeBatch, collection, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

interface CasinoContextType {
  state: GameState;
  spin: (bet: number) => boolean;
  withdraw: (amount: number, address: string) => Promise<{ success: boolean; hash?: string; error?: string }>;
  adjustRatio: (newRatio: number) => void;
  resetBalance: () => void;
  toggleNausea: () => void;
  addCurrency: (amount: number) => void;
}

const CasinoContext = createContext<CasinoContextType | undefined>(undefined);

export const CasinoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<GameState>({
    balance: 1000,
    winRatio: 0.1,
    totalSpins: 0,
    lastWinAmount: 0,
    isNauseous: false,
    winStreak: 0,
    user: null,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authenticatedUser) => {
      if (authenticatedUser) {
        const userDocRef = doc(db, 'users', authenticatedUser.uid);
        
        const unsubDoc = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setState(prev => ({
              ...prev,
              balance: data.balance,
              totalSpins: data.totalSpins,
              user: {
                uid: authenticatedUser.uid,
                email: authenticatedUser.email,
                photoURL: authenticatedUser.photoURL,
              }
            }));
          } else {
            // First time login
            setDoc(userDocRef, {
              balance: 1000,
              totalSpins: 0,
              updatedAt: serverTimestamp()
            }).catch(err => handleFirestoreError(err, OperationType.WRITE, `users/${authenticatedUser.uid}`));
          }
        }, (err) => handleFirestoreError(err, OperationType.GET, `users/${authenticatedUser.uid}`));

        return () => unsubDoc();
      } else {
        setState(prev => ({ ...prev, user: null }));
      }
    });

    return () => unsubscribe();
  }, []);

  const spin = useCallback((bet: number) => {
    if (state.balance < bet) return false;

    const cycleIndex = state.totalSpins % 8;
    let isWinner = false;
    let winAmount = 0;

    if (cycleIndex < 6) {
      isWinner = Math.random() < 0.7;
      if (isWinner) {
        winAmount = Math.floor(bet * (1.1 + Math.random() * 0.4));
      }
    } else {
      isWinner = Math.random() < 0.05;
      if (isWinner) {
        winAmount = bet * 20;
      }
    }

    const newBalance = state.balance - bet + winAmount;
    const newTotalSpins = state.totalSpins + 1;

    // Local update for responsiveness
    setState(prev => ({
      ...prev,
      balance: newBalance,
      totalSpins: newTotalSpins,
      lastWinAmount: winAmount,
      winStreak: isWinner ? prev.winStreak + 1 : 0,
    }));

    // Sync to Firestore if logged in
    if (state.user) {
      setDoc(doc(db, 'users', state.user.uid), {
        balance: newBalance,
        totalSpins: newTotalSpins,
        updatedAt: serverTimestamp()
      }, { merge: true }).catch(err => handleFirestoreError(err, OperationType.WRITE, `users/${state.user?.uid}`));
    }

    return isWinner;
  }, [state.balance, state.totalSpins, state.user]);

  const withdraw = useCallback(async (amount: number, address: string) => {
    if (amount > state.balance) return { success: false, error: 'INSUFFICIENT_DOPAMINE' };
    if (amount <= 0) return { success: false, error: 'INVALID_AMOUNT' };
    if (!address || address.length < 10) return { success: false, error: 'INVALID_ADDRESS' };
    if (!state.user) return { success: false, error: 'AUTH_REQUIRED' };

    try {
      const idToken = await auth.currentUser?.getIdToken();

      const response = await fetch('/api/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount, address, idToken }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        return { success: true, hash: result.hash };
      } else {
        return { success: false, error: result.error || 'WITHDRAWAL_FAILED' };
      }
    } catch (error: any) {
      console.error("Fetch error:", error);
      return { success: false, error: 'NETWORK_ERROR' };
    }
  }, [state.balance, state.user]);

  const adjustRatio = (newRatio: number) => {
    setState(prev => ({ ...prev, winRatio: Math.min(Math.max(newRatio, 0), 1) }));
  };

  const resetBalance = () => {
    setState(prev => ({ ...prev, balance: 1000 }));
  };

  const toggleNausea = () => {
    setState(prev => ({ ...prev, isNauseous: !prev.isNauseous }));
  };

  const addCurrency = (amount: number) => {
     setState(prev => ({ ...prev, balance: prev.balance + amount }));
  };

  return (
    <CasinoContext.Provider value={{ state, spin, withdraw, adjustRatio, resetBalance, toggleNausea, addCurrency }}>
      {children}
    </CasinoContext.Provider>
  );
};

export const useCasino = () => {
  const context = useContext(CasinoContext);
  if (!context) throw new Error('useCasino must be used within a CasinoProvider');
  return context;
};
