import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import axios from 'axios';
import { useAuthStore } from '@/store/auth.store';

interface AuthResult {
    success: boolean;
    message?: string;
}

interface UserContextType {
    // user: User | null;
    login: (username: string, password: string) => Promise<AuthResult>;
    register: (username: string, email: string, password: string) => Promise<AuthResult>;
    // logout: () => void;
    // addBalance: (amount: number) => void;
    // deductBalance: (amount: number) => boolean;
    isProcessingGoogleAuth: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { setUser } = useAuthStore();
    // const [user, setUser] = useState<User | null>(null);
    const [isProcessingGoogleAuth, setIsProcessingGoogleAuth] = useState(false);

    // ✅ دالة لمعالجة الـ Google callback
    const processGoogleCallback = () => {
        setIsProcessingGoogleAuth(true);
        try {
            // توجيه للصفحة الرئيسية
            window.location.href = '#/client';

        } catch (error) {
            console.error('Error processing Google callback:', error);
            window.location.href = '#/login?error=invalid_data';
        } finally {
            setIsProcessingGoogleAuth(false);
        }
    }

    // ✅ تحميل المستخدم عند فتح الصفحة
    useEffect(() => {
        const initializeUser = async () => {
            try {
                const res = await axios.get(
                    `${import.meta.env.VITE_API_URL}/auth/me`,
                    {
                        withCredentials: true, headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    }
                );

                if (res.data) {
                    setUser(res.data);
                }
            } catch (err: any) {
                console.log(err);
                window.location.hash = '/';

            }
        };

        initializeUser();
    }, []);

    // ✅ استمع لتغييرات الـ hash علشان تمسك الـ callback
    useEffect(() => {
        const handleHashChange = () => {
            const currentHash = window.location.hash;
            if (currentHash.includes('/callback')) {
                console.log('Hash changed to callback, processing...');
                processGoogleCallback();
            }
        };

        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    // ✅ دالة تسجيل الدخول العادي
    // في ملف contexts/UserContext.tsx
    const login = async (username: string, password: string): Promise<AuthResult> => {
        try {

            const res = await axios.post(`${import.meta.env.VITE_API_URL}/signin`, {
                username,
                password,
            }, { withCredentials: true });
            localStorage.setItem('token', res.data.token)
            return { success: true, message: res.data.message || "تم تسجيل الدخول بنجاح" };

        } catch (err: any) {
            console.log(err)
            return { success: false, message: err.response?.data?.message || 'خطأ في تسجيل الدخول.' };
        }
    };

    // ✅ دالة التسجيل
    const register = async (username: string, email: string, password: string): Promise<AuthResult> => {
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/signup`, {
                username,
                email,
                password
            }, { withCredentials: true });
            return { success: true, message: res.data.message || "تم انشاء الحساب بنجاح" };


        } catch (err: any) {
            return {
                success: false,
                message: err.response?.data?.message || "حدث خطأ أثناء التسجيل"
            };
        }
    };



    // ✅ إضافة رصيد
    // const addBalance = (amount: number) => {
    //     if (user) {
    //         const updatedUser = { ...user, balance: (user.balance || 0) + amount };
    //         localStorage.setItem('user', JSON.stringify(updatedUser));
    //         setUser(updatedUser);
    //     }
    // };

    // ✅ خصم رصيد
    // const deductBalance = (amount: number): boolean => {
    //     if (user && user.balance >= amount) {
    //         const updatedUser = { ...user, balance: user.balance - amount };
    //         localStorage.setItem('user', JSON.stringify(updatedUser));
    //         setUser(updatedUser);
    //         return true;
    //     }
    //     return false;
    // };

    return (
        <UserContext.Provider value={{
            login,
            register,
            isProcessingGoogleAuth
        }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};
