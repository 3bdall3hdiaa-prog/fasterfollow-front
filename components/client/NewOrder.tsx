import React, { useState, useMemo, useEffect } from 'react';
import { ServicePackage } from '../../types';
import { useUser } from '../../contexts/UserContext';
import axios from 'axios';
import { useCurrency } from '../../contexts/CurrencyContext';

interface NewOrderProps {
    services: ServicePackage[];
}

const NewOrder: React.FC<NewOrderProps> = ({ services }) => {
    const { user, deductBalance } = useUser();
    const [selectedPlatform, setSelectedPlatform] = useState<string>('');
    const [selectedServiceId, setSelectedServiceId] = useState<string>('');
    const [link, setLink] = useState('');
    const [quantity, setQuantity] = useState(0);
    const [totalCost, setTotalCost] = useState<any>(0);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [serverServices, setServerServices] = useState<ServicePackage[]>([]);
    const [walletBalance, setWalletBalance] = useState<any>();
    const { formatPrice } = useCurrency();

    // جلب الرصيد الحالي للمستخدم
    useEffect(() => {
        if (user) {
            fetchUserBalance();
        }
    }, [user]);

    const fetchUserBalance = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/paypal`);
            if (!res.ok) throw new Error('خطأ أثناء جلب بيانات PayPal');
            const payments = await res.json();

            if (!Array.isArray(payments)) return;

            const userPayments = payments.filter(
                (p: any) => p.userName === user?.username
            );

            const totalBalance = userPayments.reduce(
                (sum: number, p: any) => sum + parseFloat(p.amount || 0),
                0
            );

            setWalletBalance(totalBalance);
        } catch (err) {
            console.error('PayPal Fetch Error:', err);
        }
    };

    // جلب البيانات من السيرفر
    useEffect(() => {
        const fetchServices = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/services-list`);

                const servicesData = response.data.map((service: any) => ({
                    id: service.providerServiceId || service.id,
                    platform: service.platform || '',
                    title: service.title || '',
                    price: service.Price || service.price || 0,
                    min: service.min || 0,
                    max: service.max || 0,
                    provider: service.provider || '',
                    description: service.description || ''
                }));

                setServerServices(servicesData);
            } catch (err) {
                console.error('خطأ في جلب الخدمات:', err);
                setError('فشل في تحميل الخدمات. يرجى المحاولة مرة أخرى.');
            } finally {
                setLoading(false);
            }
        };

        fetchServices();
    }, []);

    const platforms = useMemo(() => [...new Set(serverServices.map(s => s.platform))], [serverServices]);
    const filteredServices = useMemo(() => {
        return serverServices.filter(s => s.platform === selectedPlatform);
    }, [serverServices, selectedPlatform]);

    const selectedService = useMemo(() => {
        return serverServices.find(s => s.id === +selectedServiceId);
    }, [serverServices, selectedServiceId]);

    React.useEffect(() => {
        if (selectedService) {
            const cost = (quantity / 1000) * selectedService.price;
            setTotalCost(cost);
        } else {
            setTotalCost(0);
        }
    }, [quantity, selectedService]);

    const handlePlatformChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedPlatform(e.target.value);
        setSelectedServiceId('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // 1. التحقق من الرصيد أولاً
        if (totalCost > walletBalance) {
            setError('رصيدك غير كافٍ لإتمام هذا الطلب.');
            return;
        }

        try {
            const x = await axios.post(`${import.meta.env.VITE_API_URL}/balance-users`, {
                userName: user?.username,
                amount: -totalCost
            })
            if (!x) {
                throw new Error('فشل في خصم الرصيد');
            }
            const getuser = localStorage.getItem('user')
            const userObject = getuser ? JSON.parse(getuser) : null;

            // 2. أولاً: خصم الرصيد
            // const newBalance = walletBalance - totalCost;

            // const balanceResponse = await fetch('${import.meta.env.VITE_API_URL}/balance-users', {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json',
            //     },
            //     body: JSON.stringify({
            //         username: userObject.username,
            //         amount: -totalCost
            //     }),
            // });

            // if (!balanceResponse.ok) {
            //     throw new Error('فشل في خصم الرصيد');
            // }

            // 3. ثانياً: إرسال الطلب بعد ما الرصيد إتخصم
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/new-order`, {
                username: userObject.username,
                id_user: userObject._id,
                selectedPlatform,
                serviceId: selectedService.id,
                selectedServiceId: selectedService.id,
                selectedCategory: selectedService.platform,
                serviceTitle: selectedService.title,
                link,
                quantity,
                totalCost,
                provider: selectedService?.provider
            });

            if (res.data) {
                // 4. تحديث الرصيد محلياً
                // setWalletBalance(newBalance);

                setSuccess(`تم إرسال طلبك بنجاح! تم خصم ${totalCost.toFixed(2)}$ من رصيدك.`);

                // إعادة تعيين الحقول
                setSelectedPlatform('');
                setSelectedServiceId('');
                setLink('');
                setQuantity(1000);
            }

        } catch (err) {
            setError(err.response?.data?.message || "خطأ في إتمام الطلب");
            console.error('خطأ في إرسال الطلب:', err);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-white text-lg">جاري تحميل الخدمات...</div>
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-6">طلب جديد</h1>

            {/* عرض الرصيد الحالي */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-6 max-w-3xl mx-auto">
                <div className="flex justify-between items-center">
                    <span className="text-gray-300">الرصيد الحالي:</span>
                    <span className="text-2xl font-bold text-primary-400">{formatPrice(walletBalance?.toFixed(2))}</span>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-gray-800 border border-gray-700 rounded-lg p-8 max-w-3xl mx-auto">
                {error && <div className="bg-red-900/50 border border-red-700 text-red-300 p-3 rounded-md mb-6 text-center">{error}</div>}
                {success && <div className="bg-green-900/50 border border-green-700 text-green-300 p-3 rounded-md mb-6 text-center">{success}</div>}

                <div className="space-y-6">
                    {/* اختيار المنصة */}
                    <div>
                        <label htmlFor="platform" className="block text-sm font-medium text-gray-300 mb-2">المنصة</label>
                        <select
                            id="platform"
                            value={selectedPlatform}
                            onChange={handlePlatformChange}
                            required
                            className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-3 focus:ring-primary-500 focus:border-primary-500"
                        >
                            <option value="" disabled>-- اختر المنصة --</option>
                            {platforms.map(platform => (
                                <option key={platform} value={platform}>{platform}</option>
                            ))}
                        </select>
                    </div>

                    {/* اختيار الخدمة */}
                    <div>
                        <label htmlFor="service" className="block text-sm font-medium text-gray-300 mb-2">الخدمة</label>
                        <select
                            id="service"
                            value={selectedServiceId}
                            onChange={e => setSelectedServiceId(e.target.value)}
                            required
                            disabled={!selectedPlatform}
                            className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-3 focus:ring-primary-500 focus:border-primary-500"
                        >
                            <option value="" disabled>-- اختر خدمة --</option>
                            {filteredServices.map(service => (
                                <option key={service.id} value={service.id}>
                                    {service.title} - {formatPrice(service.price)}/1000
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* ✅ عرض وصف الخدمة المختارة */}
                    {selectedService?.description && (
                        <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-4">
                            <h3 className="text-sm font-medium text-gray-300 mb-2">وصف الخدمة:</h3>
                            <p className="text-white text-sm leading-relaxed">
                                {selectedService.description}
                            </p>
                        </div>
                    )}

                    {/* إدخال الرابط */}
                    <div>
                        <label htmlFor="link" className="block text-sm font-medium text-gray-300 mb-2">الرابط</label>
                        <input
                            type="text"
                            id="link"
                            value={link}
                            onChange={e => setLink(e.target.value)}
                            required
                            className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-3 focus:ring-primary-500 focus:border-primary-500"
                            placeholder="https://www.instagram.com/username"
                        />
                    </div>

                    {/* إدخال الكمية */}
                    <div>
                        <label htmlFor="quantity" className="block text-sm font-medium text-gray-300 mb-2">الكمية</label>
                        <input
                            type="number"
                            id="quantity"
                            value={quantity}
                            onChange={e => setQuantity(parseInt(e.target.value) || 0)}
                            required
                            className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-3 focus:ring-primary-500 focus:border-primary-500"
                        />
                        {selectedService && (
                            <p className="text-xs text-gray-400 mt-2">
                                الحد الأدنى: {selectedService.min.toLocaleString()} / الحد الأقصى: {selectedService.max.toLocaleString()}
                            </p>
                        )}
                    </div>
                </div>

                {/* عرض التكلفة وزر الإرسال */}
                <div className="mt-8 border-t border-gray-700 pt-6 flex flex-col sm:flex-row justify-between items-center">
                    <div className="mb-4 sm:mb-0">
                        <span className="text-gray-400">التكلفة الإجمالية:</span>
                        <span className="text-2xl font-bold text-primary-400 mr-2">{formatPrice(totalCost.toFixed(2))}</span>
                        <div className="text-sm text-gray-400 mt-1">
                            الرصيد المتبقي بعد الشراء: {formatPrice((walletBalance - totalCost))}
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={totalCost > walletBalance}
                        className={`w-full sm:w-auto font-bold py-3 px-8 rounded-lg transition-colors ${totalCost > walletBalance
                            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                            : 'bg-primary-600 hover:bg-primary-700 text-white'
                            }`}
                    >
                        {totalCost > walletBalance ? 'رصيد غير كافي' : 'إرسال الطلب'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default NewOrder;