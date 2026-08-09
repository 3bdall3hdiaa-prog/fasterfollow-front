import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { useThemeStore } from '@/store/theme.store';
import axios from 'axios';

interface AuthModalProps {
    onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
    const { isDark } = useThemeStore();
    const [view, setView] = useState<'login' | 'register' | 'forgotPassword' | 'verifyCode' | 'newPassword' | 'verify2FA'>('login');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [resetCode, setResetCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [resetMessage, setResetMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // states for 2FA
    const [twoFAUsername, setTwoFAUsername] = useState('');

    const { login, register } = useUser();

    // دوال مساعدة للألوان
    const getTextColor = () => {
        return isDark ? '#ffffff' : '#1e2235';
    };

    const getMutedTextColor = () => {
        return isDark ? '#8a8fa8' : '#6c757d';
    };

    const getCardBackground = () => {
        return isDark ? '#252a41' : '#ffffff';
    };

    const getInputBackground = () => {
        return isDark ? '#1e2235' : '#ffffff';
    };

    const getInputTextColor = () => {
        return isDark ? '#ffffff' : '#1e2235';
    };

    const getBorderColor = () => {
        return isDark ? '#374151' : '#dfd7bb';
    };

    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (username.trim() && password.trim()) {
            const result = await login(username, password);
            setIsLoading(false);

            if (result.success) {
                onClose();
                window.location.reload();
            } else {
                setError(result.message || 'حدث خطأ ما.');
            }
        } else {
            setError("يرجى إدخال اسم المستخدم وكلمة المرور.");
            setIsLoading(false);
        }
    };

    const handleRegisterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (username.trim() && email.trim() && password.trim()) {
            const result = await register(username, email, password);
            setIsLoading(false);
            if (result.success) {
                onClose();
            } else {
                setError(result.message || 'حدث خطأ ما.');
            }
        } else {
            setError("يرجى ملء جميع الحقول.");
            setIsLoading(false);
        }
    };

    const handlePasswordReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setResetMessage('');
        setIsLoading(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/resetpassword`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                setResetMessage('تم إرسال رمز التحقق إلى بريدك الإلكتروني.');
                setTimeout(() => {
                    setView('verifyCode');
                    setResetMessage('');
                }, 1500);
            } else {
                alert(data.message);
                setError(data.message || 'حدث خطأ أثناء إرسال رمز التحقق.');
            }
        } catch (error: any) {
            alert(error?.response?.data?.message);
            setError('حدث خطأ في الاتصال بالخادم.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/resetpassword/verify`, { verificationCode: resetCode }, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.data) {
                setResetMessage('تم التحقق من الرمز بنجاح.');
                setTimeout(() => {
                    setView('newPassword');
                    setResetMessage('');
                }, 1500);
            } else {
                setError(response.data.message || 'رمز التحقق غير صحيح.');
            }
        } catch (error) {
            setError('حدث خطأ في الاتصال بالخادم.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (newPassword.length < 3) {
            setError('كلمة المرور يجب أن تكون 3 أحرف على الأقل.');
            return;
        }

        setIsLoading(true);

        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/resetpassword/change-password`,
                { email, password: newPassword }
                , {

                });
            if (response.data) {
                setResetMessage('تم تغيير كلمة المرور بنجاح.');
                setTimeout(() => {
                    setView('login');
                    setResetMessage('');
                    setNewPassword('');
                    setConfirmPassword('');
                    setResetCode('');
                }, 2000);
            } else {
                setError(response.data.message || 'حدث خطأ أثناء تغيير كلمة المرور.');
            }
        } catch (error) {
            setError('حدث خطأ في الاتصال بالخادم.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerify2FACode = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/2FA/verify2fa`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: twoFAUsername,
                    verificationCode: resetCode
                }),
            });

            const data = await response.json();
            if (response.ok && data.token) {
                setResetMessage('تم تسجيل الدخول بنجاح!');
                setTimeout(() => {
                    onClose();
                    window.location.reload();
                }, 1500);
            } else {
                setError(data.message || 'رمز التحقق غير صحيح.');
            }
        } catch (error: any) {
            console.error('2FA Verification error:', error);
            setError(error.response?.data?.message || 'حدث خطأ في الاتصال بالخادم.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend2FACode = async () => {
        setError('');
        setIsLoading(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/signin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: twoFAUsername,
                    password: password
                }),
            });

            const data = await response.json();

            if (response.ok && data.message === "2fa enabled") {
                setResetMessage('تم إعادة إرسال كود التحقق إلى بريدك الإلكتروني');
            } else {
                setError('حدث خطأ أثناء إعادة الإرسال');
            }
        } catch (error) {
            setError('حدث خطأ في الاتصال بالخادم.');
        } finally {
            setIsLoading(false);
        }
    };

    const renderContent = () => {
        if (view === 'verify2FA') {
            return (
                <>
                    <h2 className="text-2xl font-bold text-center mb-6" style={{ color: getTextColor() }}>التحقق بخطوتين</h2>
                    <form onSubmit={handleVerify2FACode}>
                        {resetMessage && (
                            <p className={`text-center text-sm p-3 rounded-md mb-4 ${isDark
                                ? 'bg-green-900/50 text-green-300'
                                : 'bg-green-50 text-green-700 border border-green-200'
                                }`}>{resetMessage}</p>
                        )}
                        <p className="text-center mb-4 text-sm" style={{ color: getMutedTextColor() }}>
                            تم إرسال كود التحقق إلى بريدك الإلكتروني. يرجى إدخاله أدناه.
                        </p>
                        <div className="mb-4">
                            <label htmlFor="2fa-code" className="block mb-2 text-sm font-medium" style={{ color: getMutedTextColor() }}>
                                كود التحقق
                            </label>
                            <input
                                type="text"
                                id="2fa-code"
                                value={resetCode}
                                onChange={(e) => setResetCode(e.target.value)}
                                className={`text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 text-center transition-all duration-300 ${isDark
                                    ? 'bg-gray-700 border border-gray-600 text-white'
                                    : 'bg-gray-50 border border-[#dfd7bb] text-gray-800'
                                    }`}
                                placeholder="أدخل الكود المكون من 6 أرقام"
                                required
                                maxLength={6}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full font-bold py-3 px-6 rounded-lg transition-all duration-300 disabled:opacity-50 ${isDark
                                ? 'bg-primary-600 hover:bg-primary-700 text-white'
                                : 'bg-[#c9a84c] hover:bg-[#b8973a] text-white shadow-md hover:shadow-lg'
                                }`}
                        >
                            {isLoading ? 'جاري التحقق...' : 'تحقق وتسجيل الدخول'}
                        </button>
                    </form>
                    <div className="mt-4 text-center">
                        <button
                            type="button"
                            onClick={handleResend2FACode}
                            disabled={isLoading}
                            className={`text-sm hover:underline disabled:opacity-50 transition-colors ${isDark ? 'text-primary-400' : 'text-[#c9a84c]'
                                }`}
                        >
                            لم تستلم الكود؟ إعادة الإرسال
                        </button>
                    </div>
                    <div className="mt-4 text-center">
                        <button
                            onClick={() => {
                                setView('login');
                                setError('');
                                setResetMessage('');
                                setResetCode('');
                            }}
                            className={`text-sm hover:underline transition-colors ${isDark ? 'text-primary-400' : 'text-[#c9a84c]'
                                }`}
                        >
                            العودة إلى تسجيل الدخول
                        </button>
                    </div>
                </>
            );
        }

        if (view === 'forgotPassword') {
            return (
                <>
                    <h2 className="text-2xl font-bold text-center mb-6" style={{ color: getTextColor() }}>استعادة كلمة المرور</h2>
                    <form onSubmit={handlePasswordReset}>
                        {resetMessage && (
                            <p className={`text-center text-sm p-3 rounded-md mb-4 ${isDark
                                ? 'bg-green-900/50 text-green-300'
                                : 'bg-green-50 text-green-700 border border-green-200'
                                }`}>{resetMessage}</p>
                        )}
                        <p className="text-center mb-4 text-sm" style={{ color: getMutedTextColor() }}>أدخل بريدك الإلكتروني لإرسال رمز التحقق.</p>
                        <div className="mb-4">
                            <label htmlFor="email-reset" className="block mb-2 text-sm font-medium" style={{ color: getMutedTextColor() }}>البريد الإلكتروني</label>
                            <input
                                type="email"
                                id="email-reset"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={`text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 transition-all duration-300 ${isDark
                                    ? 'bg-gray-700 border border-gray-600 text-white'
                                    : 'bg-gray-50 border border-[#dfd7bb] text-gray-800'
                                    }`}
                                placeholder="your@email.com"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full font-bold py-3 px-6 rounded-lg transition-all duration-300 disabled:opacity-50 ${isDark
                                ? 'bg-primary-600 hover:bg-primary-700 text-white'
                                : 'bg-[#c9a84c] hover:bg-[#b8973a] text-white shadow-md hover:shadow-lg'
                                }`}
                        >
                            {isLoading ? 'جاري الإرسال...' : 'إرسال رمز التحقق'}
                        </button>
                    </form>
                    <div className="mt-6 text-center">
                        <button onClick={() => { setView('login'); setError(''); setResetMessage(''); }} className={`text-sm hover:underline transition-colors ${isDark ? 'text-primary-400' : 'text-[#c9a84c]'
                            }`}>
                            العودة إلى تسجيل الدخول
                        </button>
                    </div>
                </>
            );
        }

        if (view === 'verifyCode') {
            return (
                <>
                    <h2 className="text-2xl font-bold text-center mb-6" style={{ color: getTextColor() }}>إدخال رمز التحقق</h2>
                    <form onSubmit={handleVerifyCode}>
                        {resetMessage && (
                            <p className={`text-center text-sm p-3 rounded-md mb-4 ${isDark
                                ? 'bg-green-900/50 text-green-300'
                                : 'bg-green-50 text-green-700 border border-green-200'
                                }`}>{resetMessage}</p>
                        )}
                        <p className="text-center mb-4 text-sm" style={{ color: getMutedTextColor() }}>تم إرسال رمز التحقق إلى بريدك الإلكتروني. يرجى إدخاله أدناه.</p>
                        <div className="mb-4">
                            <label htmlFor="reset-code" className="block mb-2 text-sm font-medium" style={{ color: getMutedTextColor() }}>رمز التحقق</label>
                            <input
                                type="text"
                                id="reset-code"
                                value={resetCode}
                                onChange={(e) => setResetCode(e.target.value)}
                                className={`text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 transition-all duration-300 ${isDark
                                    ? 'bg-gray-700 border border-gray-600 text-white'
                                    : 'bg-gray-50 border border-[#dfd7bb] text-gray-800'
                                    }`}
                                placeholder="أدخل الرمز المكون من 6 أرقام"
                                required
                                maxLength={6}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full font-bold py-3 px-6 rounded-lg transition-all duration-300 disabled:opacity-50 ${isDark
                                ? 'bg-primary-600 hover:bg-primary-700 text-white'
                                : 'bg-[#c9a84c] hover:bg-[#b8973a] text-white shadow-md hover:shadow-lg'
                                }`}
                        >
                            {isLoading ? 'جاري التحقق...' : 'تحقق من الرمز'}
                        </button>
                    </form>
                    <div className="mt-6 text-center">
                        <button onClick={() => { setView('forgotPassword'); setError(''); setResetMessage(''); }} className={`text-sm hover:underline transition-colors ${isDark ? 'text-primary-400' : 'text-[#c9a84c]'
                            }`}>
                            العودة إلى إدخال البريد الإلكتروني
                        </button>
                    </div>
                </>
            );
        }

        if (view === 'newPassword') {
            return (
                <>
                    <h2 className="text-2xl font-bold text-center mb-6" style={{ color: getTextColor() }}>تعيين كلمة مرور جديدة</h2>
                    <form onSubmit={handleChangePassword}>
                        {resetMessage && (
                            <p className={`text-center text-sm p-3 rounded-md mb-4 ${isDark
                                ? 'bg-green-900/50 text-green-300'
                                : 'bg-green-50 text-green-700 border border-green-200'
                                }`}>{resetMessage}</p>
                        )}
                        <p className="text-center mb-4 text-sm" style={{ color: getMutedTextColor() }}>أدخل كلمة المرور الجديدة.</p>

                        <div className="mb-4">
                            <label htmlFor="email-new-password" className="block mb-2 text-sm font-medium" style={{ color: getMutedTextColor() }}>البريد الإلكتروني</label>
                            <input
                                type="email"
                                id="email-new-password"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={`text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 transition-all duration-300 ${isDark
                                    ? 'bg-gray-700 border border-gray-600 text-white'
                                    : 'bg-gray-50 border border-[#dfd7bb] text-gray-800'
                                    }`}
                                placeholder="your@email.com"
                                required
                                disabled={isLoading}
                            />
                        </div>

                        <div className="mb-4">
                            <label htmlFor="new-password" className="block mb-2 text-sm font-medium" style={{ color: getMutedTextColor() }}>كلمة المرور الجديدة</label>
                            <input
                                type="password"
                                id="new-password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className={`text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 transition-all duration-300 ${isDark
                                    ? 'bg-gray-700 border border-gray-600 text-white'
                                    : 'bg-gray-50 border border-[#dfd7bb] text-gray-800'
                                    }`}
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full font-bold py-3 px-6 rounded-lg transition-all duration-300 disabled:opacity-50 ${isDark
                                ? 'bg-primary-600 hover:bg-primary-700 text-white'
                                : 'bg-[#c9a84c] hover:bg-[#b8973a] text-white shadow-md hover:shadow-lg'
                                }`}
                        >
                            {isLoading ? 'جاري التغيير...' : 'تغيير كلمة المرور'}
                        </button>
                    </form>
                    <div className="mt-6 text-center">
                        <button onClick={() => { setView('login'); setError(''); setResetMessage(''); }} className={`text-sm hover:underline transition-colors ${isDark ? 'text-primary-400' : 'text-[#c9a84c]'
                            }`}>
                            العودة إلى تسجيل الدخول
                        </button>
                    </div>
                </>
            );
        }

        function signInWithGoogle() {
            window.location.href = `${import.meta.env.VITE_API_URL}/auth/login`;
        }

        return (
            <>
                <h2 className="text-2xl font-bold text-center mb-6" style={{ color: getTextColor() }}>
                    {view === 'register' ? 'إنشاء حساب جديد' : 'تسجيل الدخول'}
                </h2>

                <form onSubmit={view === 'register' ? handleRegisterSubmit : handleLoginSubmit}>
                    {error && (
                        <p className={`text-center text-sm p-3 rounded-md mb-4 ${isDark
                            ? 'bg-red-900/50 text-red-300'
                            : 'bg-red-50 text-red-700 border border-red-200'
                            }`}>{error}</p>
                    )}

                    {view === 'register' && (
                        <div className="mb-4">
                            <label htmlFor="email-auth" className="block mb-2 text-sm font-medium" style={{ color: getMutedTextColor() }}>البريد الإلكتروني</label>
                            <input
                                type="email"
                                id="email-auth"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={`text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 transition-all duration-300 ${isDark
                                    ? 'bg-gray-700 border border-gray-600 text-white'
                                    : 'bg-gray-50 border border-[#dfd7bb] text-gray-800'
                                    }`}
                                placeholder="your@email.com"
                                required
                            />
                        </div>
                    )}
                    <div className="mb-4">
                        <label htmlFor="username-auth" className="block mb-2 text-sm font-medium" style={{ color: getMutedTextColor() }}>اسم المستخدم</label>
                        <input
                            type="text"
                            id="username-auth"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className={`text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 transition-all duration-300 ${isDark
                                ? 'bg-gray-700 border border-gray-600 text-white'
                                : 'bg-gray-50 border border-[#dfd7bb] text-gray-800'
                                }`}
                            placeholder="username"
                            required
                        />
                    </div>
                    <div className="mb-2">
                        <label htmlFor="password-auth" className="block mb-2 text-sm font-medium" style={{ color: getMutedTextColor() }}>كلمة المرور</label>
                        <input
                            type="password"
                            id="password-auth"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={`text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 transition-all duration-300 ${isDark
                                ? 'bg-gray-700 border border-gray-600 text-white'
                                : 'bg-gray-50 border border-[#dfd7bb] text-gray-800'
                                }`}
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    {view === 'login' && (
                        <div className="flex justify-end mb-6">
                            <button type="button" onClick={() => { setView('forgotPassword'); setError(''); }} className={`text-sm hover:underline transition-colors ${isDark ? 'text-gray-400 hover:text-primary-400' : 'text-gray-500 hover:text-[#c9a84c]'
                                }`}>
                                هل نسيت كلمة المرور؟
                            </button>
                        </div>
                    )}
                    {view === 'register' && <div className="h-10"></div>}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full font-bold py-3 px-6 rounded-lg transition-all duration-300 disabled:opacity-50 ${isDark
                            ? 'bg-primary-600 hover:bg-primary-700 text-white'
                            : 'bg-[#c9a84c] hover:bg-[#b8973a] text-white shadow-md hover:shadow-lg'
                            }`}
                    >
                        {isLoading ? 'جاري المعالجة...' : (view === 'register' ? 'إنشاء حساب' : 'دخول')}
                    </button>
                    <div className="mt-4">
                        <button
                            onClick={() => signInWithGoogle()}
                            type="button"
                            className={`w-full font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors ${isDark
                                ? 'bg-white text-gray-800 hover:bg-gray-100'
                                : 'bg-white text-gray-800 border border-[#dfd7bb] hover:bg-gray-50 shadow-sm'
                                }`}
                        >
                            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                            {view === 'register' ? 'إنشاء حساب بجوجل' : 'تسجيل الدخول بجوجل'}
                        </button>
                    </div>
                </form>
                <div className="mt-6 text-center">
                    <button onClick={() => { setView(view === 'register' ? 'login' : 'register'); setError(''); }} className={`text-sm hover:underline transition-colors ${isDark ? 'text-primary-400' : 'text-[#c9a84c]'
                        }`}>
                        {view === 'register' ? 'لديك حساب بالفعل؟ تسجيل الدخول' : 'ليس لديك حساب؟ إنشاء حساب جديد'}
                    </button>
                </div>
            </>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className={`rounded-2xl shadow-xl w-full max-w-md transform transition-all duration-300 scale-95 animate-scale-in ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
                }`} onClick={(e) => e.stopPropagation()}>
                <div className="p-8 relative">
                    <button onClick={onClose} className={`absolute top-4 left-4 transition-colors ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-400 hover:text-gray-600'
                        }`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default AuthModal;