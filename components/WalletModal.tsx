import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';

interface WalletModalProps {
    onClose: () => void;
}

const WalletModal: React.FC<WalletModalProps> = ({ onClose }) => {
    const { user, addBalance } = useUser();
    const [amount, setAmount] = useState(10);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleAddCredit = () => {
        addBalance(Number(amount));
        setIsSuccess(true);
        setTimeout(() => {
            onClose();
        }, 1500);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-gray-800 text-white rounded-2xl shadow-xl w-full max-w-md transform transition-all duration-300 scale-95 animate-scale-in" onClick={(e) => e.stopPropagation()}>
                <div className="p-8 relative">
                    <button onClick={onClose} className="absolute top-4 left-4 text-gray-400 hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                    <h2 className="text-2xl font-bold text-center mb-2">شحن الرصيد</h2>
                    <p className="text-center text-gray-400 mb-6">رصيدك الحالي: <span className="font-bold text-primary-400">${user?.balance ? user.balance.toFixed(2) : '0.00'}</span></p>

                    {!isSuccess ? (
                        <>
                            <div className="mb-4">
                                <label htmlFor="amount" className="block mb-2 text-sm font-medium text-gray-300">المبلغ</label>
                                <input
                                    type="number"
                                    id="amount"
                                    value={amount}
                                    onChange={(e) => setAmount(Number(e.target.value))}
                                    className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5"
                                    min="1"
                                />
                            </div>
                            <button onClick={handleAddCredit} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">
                                إضافة ${amount} للرصيد
                            </button>
                        </>
                    ) : (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-green-500/10 text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            </div>
                            <h2 className="text-xl font-bold mb-2">تم الشحن بنجاح!</h2>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WalletModal;
