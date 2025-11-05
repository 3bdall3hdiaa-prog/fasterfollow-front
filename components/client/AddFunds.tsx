import React, { useState, useEffect } from 'react';
import { Transaction, TransactionStatus } from '../../types';
import axios from 'axios';

const statusClasses: Record<TransactionStatus, string> = {
    Completed: 'bg-green-900 text-green-300',
    Pending: 'bg-yellow-900 text-yellow-300',
    Failed: 'bg-red-900 text-red-300',
};

const AddFunds: React.FC = () => {
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
        { id: 'bank', name: ' دفع عبر (فيزا-ماستركارد-ابل باي) ', icon: '🏦', description: "" }
    ]);
    const [selectedMethodDescription, setSelectedMethodDescription] = useState('');

    // دالة لجلب بيانات payment methods مع الـ description
    useEffect(() => {
        const fetchdata = async () => {
            try {
                const data = await fetch(`${import.meta.env.VITE_API_URL}/mange-payments`);
                const res = await data.json();

                console.log('Data from API:', res);

                // تحويل البيانات من API إلى الشكل المطلوب مع الـ description
                const formattedMethods = res.map((item: any) => ({
                    id: item.id,
                    name: item.name,
                    icon: item.icon,
                    paymentUrl: item.url,
                    description: item.description || '' // إضافة الـ description
                }));

                console.log('Formatted methods:', formattedMethods);

                // دمج الطرق الافتراضية مع الطرق من API
                const defaultMethods = [
                    { id: 'paypal', name: 'PayPal', icon: '🅿️', description: 'الدفع عبر PayPal بشكل آمن' },
                    { id: 'bank', name: ' دفع عبر (فيزا-ماستركارد-ابل باي) ', icon: '🏦', description: 'الدفع بالبطاقات الائتمانية وبطاقات الخصم' }
                ];

                const allMethods = [...defaultMethods, ...formattedMethods];
                setPaymentMethods(allMethods);

                // تعيين الـ description الافتراضي للطريقة المختارة
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

            // تحويل البيانات من API إلى الشكل المطلوب في Transaction[]
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

    // دالة لتحويل status من API إلى القيم المطلوبة
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

    // دالة لتطبيق الكوبون - معدلة لاستخدام API الحقيقي
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

            // استدعاء API الحقيقي للتحقق من الكوبون
            const response = await fetch(`${import.meta.env.VITE_API_URL}/managecopons/cheeckcoupon`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
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

            // افترض أن الـ API يرجع بيانات تحتوي على amount أو قيمة الرصيد
            if (result.success) {
                setCouponApplied(true);
                // إذا كان الـ API يرجع قيمة الرصيد مباشرة
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

    // دالة لإزالة الكوبون
    const removeCoupon = () => {
        setCouponApplied(false);
        setCouponDiscount(0);
        setCouponCode('');
        setCouponMessage('');
        setAmount('25'); // إعادة تعيين المبلغ إلى القيمة الافتراضية
    };

    // جلب البيانات عند تحميل المكون
    useEffect(() => {
        fetchPayPalTransactions();
    }, []);

    // الدوال الخاصة بكل طريقة دفع
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
        } catch (error) {
            console.error('Error creating PayPal order:', error.response?.data || error.message);
        }
    }

    // دالة ديناميكية للدفع بناءً على طريقة الدفع المختارة
    const handle_payment = () => {
        const selectedMethod = paymentMethods.find(m => m.id === paymentMethod);

        if (!selectedMethod) return alert('من فضلك اختر وسيلة دفع');

        console.log('Selected payment method:', selectedMethod);

        // إذا كانت الطريقة لها paymentUrl، استخدمه مباشرة
        if (selectedMethod.paymentUrl) {
            console.log('Redirecting to:', selectedMethod.paymentUrl);
            window.location.href = selectedMethod.paymentUrl;
            return;
        }

        // إذا لم يكن هناك paymentUrl، استخدم الـ cases الخاصة
        switch (selectedMethod.id) {
            case 'paypal':
                payPal_payment();
                break;
            case 'bank':
                bank_payment();
                break;
            default:
                // لأي طريقة دفع أخرى من الـ API، استخدم الـ paymentUrl إذا كان موجوداً
                if (selectedMethod.paymentUrl) {
                    window.location.href = selectedMethod.paymentUrl;
                } else {
                    alert(`طريقة الدفع ${selectedMethod.name} غير مدعومة حالياً`);
                }
        }
    };

    // دالة محسّنة للدفع - تتعامل مع جميع الحالات
    const handle_payment_enhanced = () => {
        const selectedMethod = paymentMethods.find(m => m.id === paymentMethod);

        if (!selectedMethod) {
            alert('من فضلك اختر وسيلة دفع');
            return;
        }

        console.log('Processing payment with:', selectedMethod);

        // الحالات الخاصة التي تحتاج معالجة مخصصة
        const specialCases: Record<string, () => void> = {
            'paypal': payPal_payment,
            'bank': bank_payment,
            // يمكن إضافة المزيد من الحالات الخاصة هنا
        };

        // إذا كانت الطريقة من الحالات الخاصة
        if (specialCases[selectedMethod.id]) {
            specialCases[selectedMethod.id]();
            return;
        }

        // إذا كانت الطريقة لها paymentUrl مباشر
        if (selectedMethod.paymentUrl) {
            // إضافة البيانات إلى الرابط إذا لزم الأمر
            let finalUrl = selectedMethod.paymentUrl;

            // إضافة المبلغ إلى الرابط إذا كان يحتوي على معلمات
            if (finalUrl.includes('?')) {
                finalUrl += `&amount=${amount}`;
            } else {
                finalUrl += `?amount=${amount}`;
            }

            // إضافة اسم المستخدم إذا كان متوفراً
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            if (user.username) {
                finalUrl += `&username=${user.username}`;
            }

            console.log('Redirecting to payment URL:', finalUrl);
            window.location.href = finalUrl;
            return;
        }

        // إذا لم تكن هناك طريقة معالجة محددة
        alert(`طريقة الدفع ${selectedMethod.name} غير مدعومة حالياً`);
    };

    // حساب المبلغ بعد الخصم (إذا كان الكوبون للخصم)
    const originalAmount = parseFloat(amount) / (1 - couponDiscount / 100) || parseFloat(amount);
    const discountAmount = originalAmount * (couponDiscount / 100);

    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-6">شحن الرصيد</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* قسم شحن الرصيد */}
                <div className="lg:col-span-2">
                    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-6">
                        <h2 className="text-xl font-semibold text-white mb-4">استخدام كوبون</h2>

                        <div className="mb-4">
                            <label htmlFor="couponCode" className="block text-sm font-medium text-gray-300 mb-2">
                                لديك كوبون؟ أدخل كود الكوبون الخاص بك هنا لشحن الرصيد فورا
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    id="couponCode"
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value)}
                                    placeholder="أدخل كود الكوبون هنا"
                                    className="flex-1 bg-gray-700 border border-gray-600 text-white rounded-lg p-3 focus:ring-primary-500 focus:border-primary-500"
                                    disabled={couponApplied || loading}
                                />
                                {!couponApplied ? (
                                    <button
                                        onClick={applyCoupon}
                                        disabled={loading}
                                        className="bg-primary-600 hover:bg-primary-700 text-white font-bold px-4 rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        {loading ? 'جاري التطبيق...' : 'تطبيق'}
                                    </button>
                                ) : (
                                    <button
                                        onClick={removeCoupon}
                                        className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 rounded-lg transition-colors"
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
                            <div className="bg-green-900/20 border border-green-800 rounded-lg p-4">
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

                    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                        <h2 className="text-xl font-semibold text-white mb-4">اختر طريقة الدفع</h2>

                        <div className="space-y-4 mb-6">
                            {paymentMethods.map(method => (
                                <label key={method.id} className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-colors ${paymentMethod === method.id ? 'bg-primary-900/50 border-primary-500' : 'bg-gray-700 border-gray-600 hover:border-gray-500'}`}>
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
                                        <span className="font-medium block">{method.name}</span>
                                        {method.paymentUrl && (
                                            <span className="text-xs text-gray-400">(رابط مباشر)</span>
                                        )}
                                    </div>
                                </label>
                            ))}
                        </div>

                        {/* عرض description طريقة الدفع المختارة */}
                        {selectedMethodDescription && (
                            <div className="mb-4 p-3 bg-gray-700/50 rounded-lg border border-gray-600">
                                <h3 className="text-sm font-medium text-gray-300 mb-1">معلومات عن طريقة الدفع:</h3>
                                <p className="text-sm text-gray-400">{selectedMethodDescription}</p>
                            </div>
                        )}

                        <div className="mb-4">
                            <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-2">
                                المبلغ (بالدولار)
                            </label>
                            <input
                                type="number"
                                id="amount"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full bg-gray-700 border border-gray-600 text-white text-lg rounded-lg p-3 focus:ring-primary-500 focus:border-primary-500"
                                placeholder="e.g., 25"
                                min="1"
                                step="0.01"
                                disabled={loading}
                            />
                        </div>

                        {/* عرض تفاصيل المبلغ إذا كان الكوبون مطبق */}
                        {couponApplied && (
                            <div className="bg-gray-700 rounded-lg p-4 mb-4">
                                <div className="flex justify-between items-center text-green-400 mb-2">
                                    <span>قيمة الرصيد المضافة:</span>
                                    <span className="font-bold">+${couponDiscount}</span>
                                </div>
                                <div className="flex justify-between items-center text-white font-bold text-lg border-t border-gray-600 pt-2">
                                    <span>المبلغ الإجمالي:</span>
                                    <span>${amount}</span>
                                </div>
                            </div>
                        )}

                        <button
                            onClick={handle_payment_enhanced}
                            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 text-lg rounded-lg transition-colors disabled:opacity-50"
                            disabled={loading}
                        >
                            {couponApplied ? 'المتابعة للدفع مع الرصيد الإضافي' : 'المتابعة للدفع'}
                        </button>
                    </div>
                </div>

                {/* قسم سجل الشحن */}
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-white">سجل عمليات الشحن</h2>
                        <button
                            onClick={fetchPayPalTransactions}
                            className="text-sm bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded transition-colors"
                            disabled={loading}
                        >
                            تحديث
                        </button>
                    </div>

                    {loading && (
                        <div className="text-center text-gray-400 py-4">جاري التحميل...</div>
                    )}

                    {error && (
                        <div className="text-red-400 text-sm mb-4">{error}</div>
                    )}

                    <div className="space-y-4">
                        {transactions.length > 0 ? (
                            transactions.map(tx => (
                                <div key={tx.id} className="flex justify-between items-center bg-gray-700/50 p-3 rounded-md">
                                    <div>
                                        <p className="font-bold text-white">${tx.amount}</p>
                                        <p className="text-xs text-gray-400">{tx.status}</p>
                                    </div>
                                    <span className={`px-2 py-1 text-xs rounded-full ${statusClasses[tx.status]}`}>
                                        {tx.status}
                                    </span>
                                </div>
                            ))
                        ) : (
                            !loading && <div className="text-center text-gray-400 py-4">لا توجد معاملات</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddFunds;