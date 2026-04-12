import { create } from 'zustand';
import { Deposit, ModerationStatus, SkinId } from '../types/deposit';

interface DepositStore {
  feed: Deposit[];
  myDeposits: Deposit[];
  isDepositing: boolean;
  depositError: string | null;

  addToFeed: (deposit: Deposit) => void;
  updateStatus: (id: string, status: ModerationStatus) => void;
  incrementResonance: (id: string) => void;
  setDepositing: (val: boolean) => void;
  setError: (msg: string | null) => void;
  clearError: () => void;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export const useDepositStore = create<DepositStore>((set) => ({
  feed: [],
  myDeposits: [],
  isDepositing: false,
  depositError: null,

  addToFeed: (deposit) =>
    set((s) => ({
      feed: [deposit, ...s.feed],
      myDeposits: deposit.sessionId
        ? [deposit, ...s.myDeposits]
        : s.myDeposits,
    })),

  updateStatus: (id, status) =>
    set((s) => ({
      feed: s.feed.map((d) =>
        d.id === id ? { ...d, status } : d
      ),
    })),

  incrementResonance: (id) =>
    set((s) => ({
      feed: s.feed.map((d) =>
        d.id === id ? { ...d, resonances: d.resonances + 1 } : d
      ),
    })),

  setDepositing: (val) => set({ isDepositing: val }),
  setError: (msg) => set({ depositError: msg }),
  clearError: () => set({ depositError: null }),
}));

export function createDeposit(
  text: string,
  sessionId: string,
  skinId: SkinId = 'void'
): Deposit {
  return {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2),
    text,
    createdAt: Date.now(),
    status: 'pending',
    resonances: 0,
    trend: 0,
    skinId,
    sessionId,
  };
}
