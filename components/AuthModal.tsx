import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';

interface AuthModalProps {
    onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
    const [view, setView] = useState<'login' | 'register' | 'forgotPassword' | 'verifyCode' | 'newPassword'>('login');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [resetCode, setResetCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [resetMessage, setResetMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login, register } = useUser();

    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (username.trim() && password.trim()) {
            const result = await login(username, password);
            setIsLoading(false);
            if (result.success) {
                onClose();
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
                // الانتقال إلى نافذة إدخال الكود بعد نجاح الإرسال
                setTimeout(() => {
                    setView('verifyCode');
                    setResetMessage('');
                }, 1500);
            } else {
                setError(data.message || 'حدث خطأ أثناء إرسال رمز التحقق.');
            }
        } catch (error) {
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
            const response = await fetch(`${import.meta.env.VITE_API_URL}/resetpassword/verify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ verificationCode: resetCode }),
            });

            const data = await response.json();

            if (response.ok) {
                setResetMessage('تم التحقق من الرمز بنجاح.');
                setTimeout(() => {
                    setView('newPassword');
                    setResetMessage('');
                }, 1500);
            } else {
                setError(data.message || 'رمز التحقق غير صحيح.');
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
            const response = await fetch(`${import.meta.env.VITE_API_URL}/resetpassword/change-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: email, password: newPassword }),
            });

            const data = await response.json();

            if (response.ok) {
                setResetMessage('تم تغيير كلمة المرور بنجاح.');
                setTimeout(() => {
                    setView('login');
                    setResetMessage('');
                    // إعادة تعيين الحقول
                    setNewPassword('');
                    setConfirmPassword('');
                    setResetCode('');
                }, 2000);
            } else {
                setError(data.message || 'حدث خطأ أثناء تغيير كلمة المرور.');
            }
        } catch (error) {
            setError('حدث خطأ في الاتصال بالخادم.');
        } finally {
            setIsLoading(false);
        }
    };

    const renderContent = () => {
        if (view === 'forgotPassword') {
            return (
                <>
                    <h2 className="text-2xl font-bold text-center mb-6">استعادة كلمة المرور</h2>
                    <form onSubmit={handlePasswordReset}>
                        {resetMessage && (
                            <p className="bg-green-900/50 text-green-300 text-center text-sm p-3 rounded-md mb-4">{resetMessage}</p>
                        )}
                        <p className="text-center text-gray-400 mb-4 text-sm">أدخل بريدك الإلكتروني لإرسال رمز التحقق.</p>
                        <div className="mb-4">
                            <label htmlFor="email-reset" className="block mb-2 text-sm font-medium text-gray-300">البريد الإلكتروني</label>
                            <input
                                type="email"
                                id="email-reset"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5"
                                placeholder="your@email.com"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
                        >
                            {isLoading ? 'جاري الإرسال...' : 'إرسال رمز التحقق'}
                        </button>
                    </form>
                    <div className="mt-6 text-center">
                        <button onClick={() => { setView('login'); setError(''); setResetMessage(''); }} className="text-sm text-primary-400 hover:underline">
                            العودة إلى تسجيل الدخول
                        </button>
                    </div>
                </>
            );
        }

        if (view === 'verifyCode') {
            return (
                <>
                    <h2 className="text-2xl font-bold text-center mb-6">إدخال رمز التحقق</h2>
                    <form onSubmit={handleVerifyCode}>
                        {resetMessage && (
                            <p className="bg-green-900/50 text-green-300 text-center text-sm p-3 rounded-md mb-4">{resetMessage}</p>
                        )}
                        <p className="text-center text-gray-400 mb-4 text-sm">تم إرسال رمز التحقق إلى بريدك الإلكتروني. يرجى إدخاله أدناه.</p>
                        <div className="mb-4">
                            <label htmlFor="reset-code" className="block mb-2 text-sm font-medium text-gray-300">رمز التحقق</label>
                            <input
                                type="text"
                                id="reset-code"
                                value={resetCode}
                                onChange={(e) => setResetCode(e.target.value)}
                                className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5"
                                placeholder="أدخل الرمز المكون من 6 أرقام"
                                required
                                maxLength={6}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
                        >
                            {isLoading ? 'جاري التحقق...' : 'تحقق من الرمز'}
                        </button>
                    </form>
                    <div className="mt-6 text-center">
                        <button onClick={() => { setView('forgotPassword'); setError(''); setResetMessage(''); }} className="text-sm text-primary-400 hover:underline">
                            العودة إلى إدخال البريد الإلكتروني
                        </button>
                    </div>
                </>
            );
        }

        if (view === 'newPassword') {
            return (
                <>
                    <h2 className="text-2xl font-bold text-center mb-6">تعيين كلمة مرور جديدة</h2>
                    <form onSubmit={handleChangePassword}>
                        {resetMessage && (
                            <p className="bg-green-900/50 text-green-300 text-center text-sm p-3 rounded-md mb-4">{resetMessage}</p>
                        )}
                        <p className="text-center text-gray-400 mb-4 text-sm">أدخل كلمة المرور الجديدة.</p>

                        {/* حقل الإيميل المضاف */}
                        <div className="mb-4">
                            <label htmlFor="email-new-password" className="block mb-2 text-sm font-medium text-gray-300">البريد الإلكتروني</label>
                            <input
                                type="email"
                                id="email-new-password"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5"
                                placeholder="your@email.com"
                                required
                                disabled={isLoading}
                            />
                        </div>

                        <div className="mb-4">
                            <label htmlFor="new-password" className="block mb-2 text-sm font-medium text-gray-300">كلمة المرور الجديدة</label>
                            <input
                                type="password"
                                id="new-password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        {/* <div className="mb-4">
                            <label htmlFor="confirm-password" className="block mb-2 text-sm font-medium text-gray-300">تأكيد كلمة المرور</label>
                            <input
                                type="password"
                                id="confirm-password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5"
                                placeholder="••••••••"
                                required
                            />
                        </div> */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
                        >
                            {isLoading ? 'جاري التغيير...' : 'تغيير كلمة المرور'}
                        </button>
                    </form>
                    <div className="mt-6 text-center">
                        <button onClick={() => { setView('login'); setError(''); setResetMessage(''); }} className="text-sm text-primary-400 hover:underline">
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
                <h2 className="text-2xl font-bold text-center mb-6">{view === 'register' ? 'إنشاء حساب جديد' : 'تسجيل الدخول'}</h2>

                <form onSubmit={view === 'register' ? handleRegisterSubmit : handleLoginSubmit}>
                    {error && <p className="bg-red-900/50 text-red-300 text-center text-sm p-3 rounded-md mb-4">{error}</p>}

                    {view === 'register' && (
                        <div className="mb-4">
                            <label htmlFor="email-auth" className="block mb-2 text-sm font-medium text-gray-300">البريد الإلكتروني</label>
                            <input
                                type="email"
                                id="email-auth"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5"
                                placeholder="your@email.com"
                                required
                            />
                        </div>
                    )}
                    <div className="mb-4">
                        <label htmlFor="username-auth" className="block mb-2 text-sm font-medium text-gray-300">اسم المستخدم</label>
                        <input
                            type="text"
                            id="username-auth"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5"
                            placeholder="username"
                            required
                        />
                    </div>
                    <div className="mb-2">
                        <label htmlFor="password-auth" className="block mb-2 text-sm font-medium text-gray-300">كلمة المرور</label>
                        <input
                            type="password"
                            id="password-auth"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    {view === 'login' && (
                        <div className="flex justify-end mb-6">
                            <button type="button" onClick={() => { setView('forgotPassword'); setError(''); }} className="text-sm text-gray-400 hover:text-primary-400 hover:underline">
                                هل نسيت كلمة المرور؟
                            </button>
                        </div>
                    )}
                    {view === 'register' && <div className="h-10"></div>}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
                    >
                        {isLoading ? 'جاري المعالجة...' : (view === 'register' ? 'إنشاء حساب' : 'دخول')}
                    </button>
                    <div className="mt-4">
                        <button
                            onClick={() => signInWithGoogle()}
                            type="button"
                            className="w-full bg-white text-gray-800 font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors"
                        >
                            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                            {view === 'register' ? 'إنشاء حساب بجوجل' : 'تسجيل الدخول بجوجل'}
                        </button>
                    </div>
                </form>
                <div className="mt-6 text-center">
                    <button onClick={() => { setView(view === 'register' ? 'login' : 'register'); setError(''); }} className="text-sm text-primary-400 hover:underline">
                        {view === 'register' ? 'لديك حساب بالفعل؟ تسجيل الدخول' : 'ليس لديك حساب؟ إنشاء حساب جديد'}
                    </button>
                </div>
            </>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-gray-800 text-white rounded-2xl shadow-xl w-full max-w-md transform transition-all duration-300 scale-95 animate-scale-in" onClick={(e) => e.stopPropagation()}>
                <div className="p-8 relative">
                    <button onClick={onClose} className="absolute top-4 left-4 text-gray-400 hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default AuthModal;