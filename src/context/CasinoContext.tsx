
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { GameState } from '../types';

interface CasinoContextType {
  state: GameState;
  spin: (bet: number) => boolean;
  adjustRatio: (newRatio: number) => void;
  resetBalance: () => void;
  toggleNausea: () => void;
  addCurrency: (amount: number) => void;
}

const CasinoContext = createContext<CasinoContextType | undefined>(undefined);

export const CasinoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<GameState>({
    balance: 1000,
    winRatio: 0.1, // Default quite low for that authentic scam feel
    totalSpins: 0,
    lastWinAmount: 0,
    isNauseous: false,
  });

  const spin = useCallback((bet: number) => {
    if (state.balance < bet) return false;

    const isWinner = Math.random() < state.winRatio;
    const winAmount = isWinner ? bet * (Math.floor(Math.random() * 10) + 2) : 0;

    setState(prev => ({
      ...prev,
      balance: prev.balance - bet + winAmount,
      totalSpins: prev.totalSpins + 1,
      lastWinAmount: winAmount,
    }));

    return isWinner;
  }, [state.balance, state.winRatio]);

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
    <CasinoContext.Provider value={{ state, spin, adjustRatio, resetBalance, toggleNausea, addCurrency }}>
      {children}
    </CasinoContext.Provider>
  );
};

export const useCasino = () => {
  const context = useContext(CasinoContext);
  if (!context) throw new Error('useCasino must be used within a CasinoProvider');
  return context;
};
