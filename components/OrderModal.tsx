import React, { useState } from 'react';
import { ServiceResponse } from '../types';
import { useUser } from '../contexts/UserContext';
import { useCurrency } from '../contexts/CurrencyContext';
import AuthModal from './AuthModal';

interface OrderModalProps {
    service: ServiceResponse;
    onClose: () => void;
}

const OrderModal: React.FC<OrderModalProps> = ({ service, onClose }) => {
    const [step, setStep] = useState(1);
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { user, deductBalance } = useUser();
    const { formatPrice } = useCurrency();
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    const handleNext = () => {
        if (username.trim() === '') {
            setError('الرجاء إدخال اسم المستخدم أو الرابط.');
            return;
        }
        setError('');
        setStep(2);
    };

    const handleWalletPayment = () => {
        setIsLoading(true);
        const success = deductBalance(service.price);
        if (success) {
            setTimeout(() => {
                setIsLoading(false);
                setStep(3);
            }, 1000);
        } else {
            alert("رصيد غير كاف!");
            setIsLoading(false);
        }
    };

    const hasEnoughBalance = user && user.balance >= service.price;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-gray-800 text-white rounded-2xl shadow-xl w-full max-w-md transform transition-all duration-300 scale-95 animate-scale-in" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 relative">
                    <button onClick={onClose} className="absolute top-4 left-4 text-gray-400 hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>

                    {step === 1 && (
                        <div>
                            <h2 className="text-2xl font-bold text-center mb-2">إكمال الطلب</h2>
                            <p className="text-center text-gray-400 mb-6">أنت على وشك شراء: <span className="font-bold text-primary-400">{service.title}</span></p>
                            <div className="mb-4">
                                <label htmlFor="username" className="block mb-2 text-sm font-medium text-gray-300">اسم المستخدم أو رابط الحساب</label>
                                <input
                                    type="text"
                                    id="username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5"
                                    placeholder={`@username or https://...`}
                                />
                                {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
                            </div>
                            <button onClick={handleNext} className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">
                                المتابعة للدفع
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div>
                            <p className="text-center text-gray-400 mb-1">المبلغ الإجمالي: <span className="text-xl font-bold text-white">{formatPrice(service.price)}</span></p>
                            <p className="text-center text-gray-400 mb-6 text-sm">الحساب: <span className="font-mono">{username}</span></p>

                            {user ? (
                                <>
                                    <h2 className="text-2xl font-bold text-center mb-6">الدفع من المحفظة</h2>
                                    <button onClick={handleWalletPayment} disabled={!hasEnoughBalance || isLoading} className="w-full p-4 border border-gray-600 rounded-lg flex justify-between items-center cursor-pointer hover:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed text-right">
                                        <div>
                                            <span>تأكيد الدفع</span>
                                            <p className={`text-xs ${hasEnoughBalance ? 'text-gray-400' : 'text-red-400'}`}>
                                                الرصيد المتاح: ${user.balance.toFixed(2)} (USD)
                                            </p>
                                        </div>
                                        <span className="text-2xl">💰</span>
                                    </button>
                                    {isLoading && <p className="text-center text-sm text-primary-400 mt-4">جاري المعالجة...</p>}
                                </>
                            ) : (
                                <div className="bg-primary-900/30 border border-primary-700 rounded-lg p-6 text-center">
                                    <h3 className="text-lg font-bold text-white mb-2">مطلوب تسجيل الدخول</h3>
                                    <p className="text-gray-400 mb-4">للدفع من المحفظة، يجب أن يكون لديك حساب.</p>
                                    <button onClick={() => setIsAuthModalOpen(true)} className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">
                                        تسجيل الدخول أو إنشاء حساب
                                    </button>
                                </div>
                            )}

                            <button onClick={() => setStep(1)} className="w-full mt-4 text-gray-400 hover:text-white text-sm">
                                الرجوع
                            </button>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="text-center py-8">
                            <div className="w-20 h-20 bg-green-500/10 text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            </div>
                            <h2 className="text-2xl font-bold mb-2">تم استلام طلبك بنجاح!</h2>
                            <p className="text-gray-400 mb-6">سنبدأ في تنفيذ طلبك خلال الدقائق القادمة. شكرًا لثقتك بنا!</p>
                            <button onClick={onClose} className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">
                                إغلاق
                            </button>
                        </div>
                    )}
                </div>
            </div>
            {isAuthModalOpen && <AuthModal onClose={() => setIsAuthModalOpen(false)} />}
        </div>
    );
};

export default OrderModal;