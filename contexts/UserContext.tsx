import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import axios from 'axios';
import { User } from '../types';

interface AuthResult {
    success: boolean;
    message?: string;
}

interface UserContextType {
    user: User | null;
    login: (username: string, password: string) => Promise<AuthResult>;
    register: (username: string, email: string, password: string) => Promise<AuthResult>;
    logout: () => void;
    addBalance: (amount: number) => void;
    deductBalance: (amount: number) => boolean;
    isProcessingGoogleAuth: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isProcessingGoogleAuth, setIsProcessingGoogleAuth] = useState(false);

    // ✅ دالة لمعالجة الـ Google callback
    const processGoogleCallback = () => {
        const hash = window.location.hash.substring(1);
        const urlParams = new URLSearchParams(hash.split('?')[1]);
        const token = urlParams.get('token');
        const userParam = urlParams.get('user');

        if (token && userParam) {
            setIsProcessingGoogleAuth(true);
            try {
                const userData = JSON.parse(decodeURIComponent(userParam));

                // تنظيف البيانات ووحد الأسماء
                const cleanedUserData = {
                    ...userData,
                    name: userData.name ? userData.name.replace(' undefined', '') : 'User',
                    username: userData.username ? userData.username.replace(' undefined', '') : 'User', // أضف username
                    email: userData.email,
                    picture: userData.picture,
                    accessToken: userData.access_token,
                    balance: userData.balance || 0,
                    role: userData.role || 'user'
                };

                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(cleanedUserData));
                setUser(cleanedUserData);

                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                // توجيه للصفحة الرئيسية
                window.location.href = '#/client';

            } catch (error) {
                console.error('Error processing Google callback:', error);
                window.location.href = '#/login?error=invalid_data';
            } finally {
                setIsProcessingGoogleAuth(false);
            }
        }
    };
    // ✅ تحميل المستخدم عند فتح الصفحة
    useEffect(() => {
        const initializeUser = () => {
            const token = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');

            // اتأكد إننا مش في صفحة الـ callback
            const currentHash = window.location.hash;
            const isCallbackPage = currentHash.includes('/callback?token=');

            if (isCallbackPage) {
                console.log('Callback page detected, processing...');
                processGoogleCallback();
                return;
            }

            if (token && storedUser) {
                try {
                    const userData = JSON.parse(storedUser);
                    setUser(userData);
                    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    console.log('User loaded from localStorage:', userData);
                } catch (error) {
                    console.error('Error parsing stored user:', error);
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                }
            }
        };

        initializeUser();
    }, []);

    // ✅ استمع لتغييرات الـ hash علشان تمسك الـ callback
    useEffect(() => {
        const handleHashChange = () => {
            const currentHash = window.location.hash;
            if (currentHash.includes('/callback?token=')) {
                console.log('Hash changed to callback, processing...');
                processGoogleCallback();
            }
        };

        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    // ✅ دالة تسجيل الدخول العادي
    const login = async (username: string, password: string): Promise<AuthResult> => {
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/signin`, {
                username,
                password,
            });

            if (res.data.token) {
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('user', JSON.stringify(res.data.user));
                setUser(res.data.user);
                axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
                return { success: true };
            } else {
                return { success: false, message: 'لم يتم استلام توكن من السيرفر.' };
            }
        } catch (err: any) {
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
            });

            const token = res.data.token;
            const userData = res.data.user;

            if (token && userData) {
                localStorage.setItem("token", token);
                localStorage.setItem("user", JSON.stringify(userData));
                setUser(userData);
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                return { success: true, message: "تم التسجيل بنجاح" };
            } else {
                return { success: false, message: "لم يتم استلام التوكن أو بيانات المستخدم من السيرڤر" };
            }
        } catch (err: any) {
            return {
                success: false,
                message: err.response?.data?.message || "حدث خطأ أثناء التسجيل"
            };
        }
    };

    // ✅ تسجيل الخروج
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        delete axios.defaults.headers.common['Authorization'];
        window.location.href = '#/login';
    };

    // ✅ إضافة رصيد
    const addBalance = (amount: number) => {
        if (user) {
            const updatedUser = { ...user, balance: (user.balance || 0) + amount };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
        }
    };

    // ✅ خصم رصيد
    const deductBalance = (amount: number): boolean => {
        if (user && user.balance >= amount) {
            const updatedUser = { ...user, balance: user.balance - amount };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
            return true;
        }
        return false;
    };

    return (
        <UserContext.Provider value={{
            user,
            login,
            register,
            logout,
            addBalance,
            deductBalance,
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
