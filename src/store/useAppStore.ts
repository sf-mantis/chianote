import { create } from 'zustand';

interface AppState {
    isMenuOpen: boolean;
    toggleMenu: () => void;
    selectedChildId: string | null;
    setSelectedChildId: (id: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
    isMenuOpen: false,
    toggleMenu: () => set((state) => ({ isMenuOpen: !state.isMenuOpen })),
    selectedChildId: null,
    setSelectedChildId: (id) => set({ selectedChildId: id }),
}));
