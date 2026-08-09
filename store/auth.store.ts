import { create } from 'zustand'

// Define types for state & actions
interface AuthState {
    isInitializing: boolean,
    setIsInitializing: (isInitializing: boolean) => void

    user: { _id: string, username: string, role: string, email: string },
    setUser: (user: { _id: string, username: string, role: string, email: string }) => void

}

// Create store using the curried form of `create`
export const useAuthStore = create<AuthState>()((set) => ({
    isInitializing: true,
    setIsInitializing: (isInitializing: boolean) => set({ isInitializing }),
    user: { _id: '', username: '', role: '', email: '' },
    setUser: (user: { _id: string, username: string, role: string, email: string }) => set({ user }),

}))