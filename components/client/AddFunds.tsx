import React, { useState, useEffect } from 'react';
import { Transaction, TransactionStatus } from '../../types';
import axios from 'axios';
import { useThemeStore } from '@/store/theme.store';

const statusClasses: Record<TransactionStatus, string> = {
    Completed: 'bg-green-900 text-green-300',
    Pending: 'bg-yellow-900 text-yellow-300',
    Failed: 'bg-red-900 text-red-300',
};

// تحديث statusClasses للوضع الفاتح
const getStatusClasses = (isDark: boolean) => {
    if (isDark) {
        return {
            Completed: 'bg-green-900 text-green-300',
            Pending: 'bg-yellow-900 text-yellow-300',
            Failed: 'bg-red-900 text-red-300',
        };
    } else {
        return {
            Completed: 'bg-green-100 text-green-700',
            Pending: 'bg-yellow-100 text-yellow-700',
            Failed: 'bg-red-100 text-red-700',
        };
    }
};

const AddFunds: React.FC = () => {
    const { isDark } = useThemeStore();
    const [amount, setAmount] = useState('25');
    const [paymentMethod, setPaymentMethod] = useState('stripe');
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [couponCode, setCouponCode] = useState('');
    const [couponApplied, setCouponApplied] = useState(false);
    const [couponDiscount, setCouponDiscount] = useState(0);
    const [couponMessage, setCouponMessage] = useState('');
    const [paymentMethods, setPaymentMethods] = useState([
        { id: 'paypal', name: 'PayPal', icon: '🅿️', paymentUrl: "", description: "" },
    ]);
    const [selectedMethodDescription, setSelectedMethodDescription] = useState('');

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

    // دالة لجلب بيانات payment methods مع الـ description
    useEffect(() => {
        const fetchdata = async () => {
            try {
                const data = await fetch(`${import.meta.env.VITE_API_URL}/mange-payments`, {
                    method: 'GET',
                });
                const res = await data.json();

                console.log('Data from API:', res);

                const formattedMethods = res.map((item: any) => ({
                    id: item.id,
                    name: item.name,
                    icon: item.icon,
                    paymentUrl: item.url,
                    description: item.description || ''
                }));

                console.log('Formatted methods:', formattedMethods);

                const defaultMethods = [
                    { id: 'paypal', name: 'PayPal', icon: '🅿️', description: 'الدفع عبر PayPal بشكل آمن' },
                ];

                const allMethods = [...defaultMethods, ...formattedMethods];
                setPaymentMethods(allMethods);

                const initialMethod = allMethods.find(m => m.id === paymentMethod);
                if (initialMethod) {
                    setSelectedMethodDescription(initialMethod.description);
                }

                console.log('All payment methods:', allMethods);
            } catch (error) {
                console.error('Error fetching payment methods:', error);
            }
        };
        fetchdata();
    }, []);

    // تحديث الـ description عند تغيير طريقة الدفع
    useEffect(() => {
        const selectedMethod = paymentMethods.find(m => m.id === paymentMethod);
        if (selectedMethod) {
            setSelectedMethodDescription(selectedMethod.description || '');
        } else {
            setSelectedMethodDescription('');
        }
    }, [paymentMethod, paymentMethods]);

    const fetchPayPalTransactions = async () => {
        setLoading(true);
        setError('');
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const userName = user.username;
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/paypal`);

            const formattedTransactions: Transaction[] = response.data.filter((item: any) => {
                return item.status && item.userName === userName;
            });

            setTransactions(formattedTransactions);
        } catch (err) {
            console.error('Error fetching PayPal transactions:', err);
            setError('فشل في تحميل سجل المعاملات');
        } finally {
            setLoading(false);
        }
    };

    const mapStatus = (status: string): TransactionStatus => {
        const statusMap: Record<string, TransactionStatus> = {
            'completed': 'Completed',
            'pending': 'Pending',
            'failed': 'Failed',
            'success': 'Completed',
            'approved': 'Completed',
            'canceled': 'Failed',
            'denied': 'Failed'
        };
        return statusMap[status.toLowerCase()] || 'Pending';
    };

    // دالة لتطبيق الكوبون
    const applyCoupon = async () => {
        if (!couponCode.trim()) {
            setCouponMessage('يرجى إدخال كود الكوبون');
            return;
        }

        setLoading(true);
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const userName = user.username;

            if (!userName) {
                setCouponMessage('يرجى تسجيل الدخول أولاً');
                return;
            }
            const response = await fetch(`${import.meta.env.VITE_API_URL}/managecopons/cheeckcoupon`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    userName,
                    code: couponCode.trim()
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'فشل في التحقق من الكوبون');
            }

            const result = await response.json();

            if (result.success) {
                setCouponApplied(true);
                const creditAmount = result.amount || result.value || 0;
                setCouponDiscount(creditAmount);
                setCouponMessage(`تم تطبيق الكوبون بنجاح! سيتم إضافة $${creditAmount} إلى رصيدك`);
            } else {
                setCouponApplied(false);
                setCouponDiscount(0);
                setCouponMessage(result.message || 'كود الكوبون غير صالح');
            }

        } catch (error) {
            console.error('Error applying coupon:', error);
            setCouponApplied(false);
            setCouponDiscount(0);
            setCouponMessage(error instanceof Error ? error.message : 'حدث خطأ في التحقق من الكوبون');
        } finally {
            setLoading(false);
        }
    };

    const removeCoupon = () => {
        setCouponApplied(false);
        setCouponDiscount(0);
        setCouponCode('');
        setCouponMessage('');
        setAmount('25');
    };

    useEffect(() => {
        fetchPayPalTransactions();
    }, []);

    function bank_payment() {
        window.location.href = `https://pay.fasterfollow.site/pages/choose-pay`;
    }

    const payPal_payment = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const userName = user.username;
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/paypal/create-order`, {
                amount,
                userName
            });

            const approveLink = response.data.links.find((link: any) => link.rel === 'approve')?.href;

            if (approveLink) {
                window.location.href = approveLink;
            } else {
                console.error('Approve link not found');
            }
        } catch (error: any) {
            console.error('Error creating PayPal order:', error.response?.data || error.message);
        }
    }

    const handle_payment_enhanced = () => {
        const selectedMethod = paymentMethods.find(m => m.id === paymentMethod);

        if (!selectedMethod) {
            alert('من فضلك اختر وسيلة دفع');
            return;
        }

        console.log('Processing payment with:', selectedMethod);

        const specialCases: Record<string, () => void> = {
            'paypal': payPal_payment,
            'bank': bank_payment,
        };

        if (specialCases[selectedMethod.id]) {
            specialCases[selectedMethod.id]();
            return;
        }

        if (selectedMethod.paymentUrl) {
            let finalUrl = selectedMethod.paymentUrl;

            if (finalUrl.includes('?')) {
                finalUrl += `&amount=${amount}`;
            } else {
                finalUrl += `?amount=${amount}`;
            }

            const user = JSON.parse(localStorage.getItem('user') || '{}');
            if (user.username) {
                finalUrl += `&username=${user.username}`;
            }

            console.log('Redirecting to payment URL:', finalUrl);
            window.location.href = finalUrl;
            return;
        }

        alert(`طريقة الدفع ${selectedMethod.name} غير مدعومة حالياً`);
    };

    const originalAmount = parseFloat(amount) / (1 - couponDiscount / 100) || parseFloat(amount);
    const discountAmount = originalAmount * (couponDiscount / 100);
    const statusClassesMap = getStatusClasses(isDark);

    return (
        <div className="p-4" style={{
            backgroundColor: isDark ? '#1e2235' : '#f8f6f0',
            minHeight: "100vh",
            transition: "all 0.3s ease"
        }}>
            <h1 className="text-2xl md:text-3xl font-bold mb-6" style={{ color: getTextColor() }}>شحن الرصيد</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* قسم شحن الرصيد */}
                <div className="lg:col-span-2">
                    <div className={`rounded-lg p-6 mb-6 transition-all duration-300 ${isDark
                        ? 'bg-gray-800 border border-gray-700'
                        : 'bg-white border border-[#dfd7bb] shadow-md'
                        }`}>
                        <h2 className="text-xl font-semibold mb-4" style={{ color: getTextColor() }}>استخدام كوبون</h2>

                        <div className="mb-4">
                            <label htmlFor="couponCode" className="block text-sm font-medium mb-2" style={{ color: getMutedTextColor() }}>
                                لديك كوبون؟ أدخل كود الكوبون الخاص بك هنا لشحن الرصيد فورا
                            </label>
                            <div className="flex flex-col gap-y-4">
                                <input
                                    type="text"
                                    id="couponCode"
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value)}
                                    placeholder="أدخل كود الكوبون هنا"
                                    className={`flex-1 rounded-lg p-3 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300 ${isDark
                                        ? 'bg-gray-700 border border-gray-600 text-white'
                                        : 'bg-gray-50 border border-[#dfd7bb] text-gray-800'
                                        }`}
                                    disabled={couponApplied || loading}
                                />
                                {!couponApplied ? (
                                    <button
                                        onClick={applyCoupon}
                                        disabled={loading}
                                        className={`font-bold py-3 rounded-lg transition-all duration-300 disabled:opacity-50 ${isDark
                                            ? 'bg-primary-600 hover:bg-primary-700 text-white'
                                            : 'bg-[#c9a84c] hover:bg-[#b8973a] text-white shadow-md hover:shadow-lg'
                                            }`}
                                    >
                                        {loading ? 'جاري التطبيق...' : 'تطبيق'}
                                    </button>
                                ) : (
                                    <button
                                        onClick={removeCoupon}
                                        className="bg-red-600 hover:bg-red-700 text-white font-bold  rounded-lg transition-colors"
                                        disabled={loading}
                                    >
                                        إزالة
                                    </button>
                                )}
                            </div>
                            {couponMessage && (
                                <p className={`mt-2 text-sm ${couponApplied ? 'text-green-400' : 'text-red-400'}`}>
                                    {couponMessage}
                                </p>
                            )}
                        </div>

                        {couponApplied && (
                            <div className={`rounded-lg p-4 ${isDark ? 'bg-green-900/20 border border-green-800' : 'bg-green-50 border border-green-200'
                                }`}>
                                <div className="flex justify-between items-center text-green-400">
                                    <span>قيمة الرصيد المضافة:</span>
                                    <span className="font-bold">+${couponDiscount}</span>
                                </div>
                                <div className="flex justify-between items-center text-green-400 mt-2">
                                    <span>المبلغ الإجمالي:</span>
                                    <span className="font-bold">${amount}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className={`rounded-lg p-6 transition-all duration-300 ${isDark
                        ? 'bg-gray-800 border border-gray-700'
                        : 'bg-white border border-[#dfd7bb] shadow-md'
                        }`}>
                        <h2 className="text-xl font-semibold mb-4" style={{ color: getTextColor() }}>اختر طريقة الدفع</h2>

                        <div className="space-y-4 mb-6">
                            {paymentMethods.map(method => (
                                <label key={method.id} className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 ${paymentMethod === method.id
                                    ? isDark ? 'bg-primary-900/50 border-primary-500' : 'bg-[#c9a84c]/10 border-[#c9a84c]'
                                    : isDark ? 'bg-gray-700 border-gray-600 hover:border-gray-500' : 'bg-gray-50 border-[#dfd7bb] hover:border-gray-300'
                                    }`}>
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value={method.id}
                                        checked={paymentMethod === method.id}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        className="hidden"
                                        disabled={loading}
                                    />
                                    <span className="text-2xl ml-4">{method.icon}</span>
                                    <div className="flex-1">
                                        <span className="font-medium block" style={{ color: getTextColor() }}>{method.name}</span>
                                        {method.paymentUrl && (
                                            <span className="text-xs" style={{ color: getMutedTextColor() }}>(رابط مباشر)</span>
                                        )}
                                    </div>
                                </label>
                            ))}
                        </div>

                        {/* عرض description طريقة الدفع المختارة */}
                        {selectedMethodDescription && (
                            <div className={`mb-4 p-3 rounded-lg border ${isDark
                                ? 'bg-gray-700/50 border-gray-600'
                                : 'bg-gray-50 border-[#dfd7bb]'
                                }`}>
                                <h3 className="text-sm font-medium mb-1" style={{ color: getMutedTextColor() }}>معلومات عن طريقة الدفع:</h3>
                                <p className="text-sm" style={{ color: getMutedTextColor() }}>{selectedMethodDescription}</p>
                            </div>
                        )}

                        <div className="mb-4">
                            <label htmlFor="amount" className="block text-sm font-medium mb-2" style={{ color: getMutedTextColor() }}>
                                المبلغ (بالدولار)
                            </label>
                            <input
                                type="number"
                                id="amount"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className={`w-full text-lg rounded-lg p-3 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300 ${isDark
                                    ? 'bg-gray-700 border border-gray-600 text-white'
                                    : 'bg-gray-50 border border-[#dfd7bb] text-gray-800'
                                    }`}
                                placeholder="e.g., 25"
                                min="1"
                                step="0.01"
                                disabled={loading}
                            />
                        </div>

                        {couponApplied && (
                            <div className={`rounded-lg p-4 mb-4 ${isDark ? 'bg-gray-700' : 'bg-gray-50 border border-[#dfd7bb]'
                                }`}>
                                <div className="flex justify-between items-center text-green-400 mb-2">
                                    <span>قيمة الرصيد المضافة:</span>
                                    <span className="font-bold">+${couponDiscount}</span>
                                </div>
                                <div className={`flex justify-between items-center font-bold text-lg pt-2 border-t ${isDark ? 'text-white border-gray-600' : 'text-gray-800 border-[#dfd7bb]'
                                    }`}>
                                    <span>المبلغ الإجمالي:</span>
                                    <span>${amount}</span>
                                </div>
                            </div>
                        )}

                        <button
                            onClick={handle_payment_enhanced}
                            className={`w-full font-bold py-3 text-lg rounded-lg transition-all duration-300 disabled:opacity-50 ${isDark
                                ? 'bg-primary-600 hover:bg-primary-700 text-white'
                                : 'bg-[#c9a84c] hover:bg-[#b8973a] text-white shadow-md hover:shadow-lg'
                                }`}
                            disabled={loading}
                        >
                            {couponApplied ? 'المتابعة للدفع مع الرصيد الإضافي' : 'المتابعة للدفع'}
                        </button>
                    </div>
                </div>

                {/* قسم سجل الشحن */}
                <div className={`rounded-lg p-6 transition-all duration-300 ${isDark
                    ? 'bg-gray-800 border border-gray-700'
                    : 'bg-white border border-[#dfd7bb] shadow-md'
                    }`}>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold" style={{ color: getTextColor() }}>سجل عمليات الشحن</h2>
                        <button
                            onClick={fetchPayPalTransactions}
                            className={`text-sm px-3 py-1 rounded transition-colors ${isDark
                                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                                }`}
                            disabled={loading}
                        >
                            تحديث
                        </button>
                    </div>

                    {loading && (
                        <div className="text-center py-4" style={{ color: getMutedTextColor() }}>جاري التحميل...</div>
                    )}

                    {error && (
                        <div className="text-red-400 text-sm mb-4">{error}</div>
                    )}

                    <div className="space-y-4">
                        {transactions.length > 0 ? (
                            transactions.map(tx => (
                                <div key={tx.id} className={`flex justify-between items-center p-3 rounded-md ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'
                                    }`}>
                                    <div>
                                        <p className="font-bold" style={{ color: getTextColor() }}>${tx.amount}</p>
                                        <p className="text-xs" style={{ color: getMutedTextColor() }}>{tx.status}</p>
                                    </div>
                                    <span className={`px-2 py-1 text-xs rounded-full ${statusClassesMap[tx.status]}`}>
                                        {tx.status}
                                    </span>
                                </div>
                            ))
                        ) : (
                            !loading && <div className="text-center py-4" style={{ color: getMutedTextColor() }}>لا توجد معاملات</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddFunds;