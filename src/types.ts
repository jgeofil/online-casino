
export interface GameState {
  balance: number;
  winRatio: number; // 0 to 1
  totalSpins: number;
  lastWinAmount: number;
  isNauseous: boolean; // For visual effects
  winStreak: number;
  user: {
    uid: string;
    email: string | null;
    photoURL: string | null;
  } | null;
}

export interface Promotion {
  id: string;
  text: string;
  intensity: 'low' | 'medium' | 'high' | 'CRITICAL';
  type: 'bonus' | 'scam' | 'weird';
}
