import { useThemeStore } from '@/store/theme.store';
import React, { useState, useEffect } from 'react';

interface Coupon {
    _id?: string;
    id: string;
    code: string;
    amount: number;
    createdAt: string;
    status: 'active' | 'notactive';
}

const ManageCoupons: React.FC = () => {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        code: '',
        amount: 0,
        status: 'active' as 'active' | 'notactive'
    });

    const API_BASE = import.meta.env.VITE_API_URL;

    // دالة لجلب الكوبونات من API
    const fetchCoupons = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/managecopons`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch coupons: ${response.status}`);
            }

            const data = await response.json();

            // تحويل البيانات من API إلى الشكل المطلوب وفلترة الكوبونات التي تحتوي على code فقط
            const formattedCoupons: Coupon[] = data
                .filter((coupon: any) => coupon.code && coupon.code.trim() !== '')
                .map((coupon: any) => ({
                    id: coupon._id || coupon.id,
                    _id: coupon._id,
                    code: coupon.code || '',
                    amount: coupon.amount || coupon.discountValue || 0,
                    createdAt: coupon.createdAt || new Date().toISOString(),
                    status: coupon.status || 'notactive'
                }));

            setCoupons(formattedCoupons);
        } catch (error) {
            console.error('Error fetching coupons:', error);
            alert('فشل في تحميل الكوبونات');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCoupons();
    }, []);

    const handleOpenModal = (coupon: Coupon | null = null) => {
        if (coupon) {
            setEditingCoupon(coupon);
            setFormData({
                code: coupon.code,
                amount: coupon.amount,
                status: coupon.status
            });
        } else {
            setEditingCoupon(null);
            setFormData({
                code: '',
                amount: 0,
                status: 'active'
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingCoupon(null);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) || 0 : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // التحقق من أن code غير فارغ
            if (!formData.code || formData.code.trim() === '') {
                alert('يرجى إدخال كود الشحن');
                return;
            }
            const couponData = {
                code: formData.code.trim(),
                amount: formData.amount,
                status: formData.status
            };

            if (editingCoupon) {
                // تحديث كوبون موجود
                const response = await fetch(`${API_BASE}/managecopons/${editingCoupon.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify(couponData)
                });

                if (!response.ok) {
                    throw new Error('فشل في تحديث الكوبون');
                }

                const updatedCoupon = await response.json();

                // تحديث القائمة محلياً
                setCoupons(coupons.map(c =>
                    c.id === editingCoupon.id
                        ? {
                            ...c,
                            ...couponData,
                            id: updatedCoupon._id || c.id
                        }
                        : c
                ));

                alert('تم تحديث الكوبون بنجاح');
            } else {
                // إضافة كوبون جديد
                const response = await fetch(`${API_BASE}/managecopons`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify(couponData)
                });

                if (!response.ok) {
                    throw new Error('فشل في إضافة الكوبون');
                }

                const newCoupon = await response.json();

                // إضافة الكوبون الجديد للقائمة فقط إذا كان يحتوي على code
                if (newCoupon.code && newCoupon.code.trim() !== '') {
                    const formattedCoupon: Coupon = {
                        id: newCoupon._id || newCoupon.id,
                        _id: newCoupon._id,
                        code: newCoupon.code,
                        amount: newCoupon.amount,
                        createdAt: newCoupon.createdAt || new Date().toISOString(),
                        status: newCoupon.status
                    };

                    setCoupons([...coupons, formattedCoupon]);
                }
                alert('تم إضافة الكوبون بنجاح');
            }

            handleCloseModal();
        } catch (error) {
            console.error('Error saving coupon:', error);
            alert('فشل في حفظ الكوبون');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (couponId: string) => {
        if (!window.confirm('هل أنت متأكد من حذف هذا الكوبون؟')) return;

        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/managecopons/${couponId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('فشل في حذف الكوبون');
            }

            // حذف محلي من القائمة
            setCoupons(coupons.filter(c => c.id !== couponId));
            alert('تم حذف الكوبون بنجاح');
        } catch (error) {
            console.error('Error deleting coupon:', error);
            alert('فشل في حذف الكوبون');
        } finally {
            setLoading(false);
        }
    };

    const toggleCouponStatus = async (couponId: string, currentStatus: 'active' | 'notactive') => {
        setLoading(true);
        try {
            const newStatus = currentStatus === 'active' ? 'notactive' : 'active';

            const response = await fetch(`${API_BASE}/managecopons/${couponId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (!response.ok) {
                throw new Error('فشل في تغيير حالة الكوبون');
            }

            // تحديث الحالة محلياً
            setCoupons(coupons.map(c =>
                c.id === couponId ? { ...c, status: newStatus } : c
            ));

            alert(`تم ${newStatus === 'active' ? 'تفعيل' : 'إلغاء تفعيل'} الكوبون بنجاح`);
        } catch (error) {
            console.error('Error updating coupon status:', error);
            alert('فشل في تغيير حالة الكوبون');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString('ar-EG');
        } catch {
            return 'تاريخ غير معروف';
        }
    };

    const getStatusText = (status: 'active' | 'notactive') => {
        return status === 'active' ? 'نشط' : 'غير نشط';
    };

    const getStatusClass = (status: 'active' | 'notactive') => {
        return status === 'active'
            ? 'bg-green-900 text-green-300'
            : 'bg-gray-600 text-gray-200';
    };

    // فلترة الكوبونات حسب البحث
    const filteredCoupons = coupons.filter(coupon =>
        coupon.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coupon.amount?.toString().includes(searchTerm) ||
        coupon.status?.toLowerCase().includes(searchTerm.toLowerCase())
    );




    const { isDark } = useThemeStore();
    // ... باقي الـ states

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

    const getCardHeaderBackground = () => {
        return isDark ? '#2f3450' : '#f0ede4';
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

    return (
        <div className="p-4" style={{
            backgroundColor: isDark ? '#1e2235' : '#f8f6f0',
            minHeight: "100vh",
            transition: "all 0.3s ease"
        }}>
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-2xl md:text-3xl font-bold text-center md:text-right" style={{ color: getTextColor() }}>
                    إدارة كوبونات الشحن
                </h1>
                <button
                    onClick={() => handleOpenModal()}
                    className={`font-bold py-3 px-6 rounded-lg w-full md:w-auto transition-all duration-300 ${isDark
                        ? 'bg-primary-600 hover:bg-primary-700 text-white'
                        : 'bg-[#c9a84c] hover:bg-[#b8973a] text-white shadow-md hover:shadow-lg'
                        }`}
                    disabled={loading}
                >
                    {loading ? 'جاري التحميل...' : 'إضافة كوبون جديد'}
                </button>
            </div>

            {/* حقل البحث */}
            <div className={`rounded-lg p-4 mb-6 transition-all duration-300 ${isDark
                ? 'bg-gray-800 border border-gray-700'
                : 'bg-white border border-[#dfd7bb] shadow-md'
                }`}>
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                    <input
                        type="text"
                        placeholder="ابحث بكود الشحن، القيمة، أو الحالة..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`rounded-md p-3 w-full md:w-1/2 text-sm md:text-base transition-all duration-300 ${isDark
                            ? 'bg-gray-700 border border-gray-600 text-white'
                            : 'bg-gray-50 border border-[#dfd7bb] text-gray-800'
                            }`}
                    />
                    <div className="text-sm md:text-base" style={{ color: getMutedTextColor() }}>
                        إجمالي الكوبونات: {coupons.length} | المعروض: {filteredCoupons.length}
                    </div>
                </div>
            </div>

            {loading && coupons.length === 0 ? (
                <div className="text-center py-8" style={{ color: getMutedTextColor() }}>جاري تحميل الكوبونات...</div>
            ) : (
                <>
                    {/*  جدول الكوبونات - للشاشات الكبيرة */}
                    <div className={`hidden md:block rounded-lg overflow-hidden transition-all duration-300 ${isDark
                        ? 'bg-gray-800 border border-gray-700'
                        : 'bg-white border border-[#dfd7bb] shadow-md'
                        }`}>
                        <table className="w-full text-sm text-right" style={{ color: getTextColor() }}>
                            <thead className={`text-xs uppercase ${isDark ? 'text-gray-400 bg-gray-700/50' : 'text-gray-500 bg-gray-50'
                                }`}>
                                <tr>
                                    <th className="px-4 py-3">كود الشحن</th>
                                    <th className="px-4 py-3">قيمة الرصيد</th>
                                    <th className="px-4 py-3">تاريخ الإنشاء</th>
                                    <th className="px-4 py-3">الحالة</th>
                                    <th className="px-4 py-3">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCoupons.map(coupon => (
                                    <tr key={coupon.id} className={`border-b transition-colors ${isDark
                                        ? 'border-gray-700 hover:bg-gray-700/50'
                                        : 'border-[#dfd7bb] hover:bg-gray-50'
                                        }`}>
                                        <td className="px-4 py-4">
                                            <div className="font-bold text-lg" style={{ color: getTextColor() }}>{coupon.code}</div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="text-green-400 font-bold text-lg">${coupon.amount}</div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div style={{ color: getTextColor() }}>{formatDate(coupon.createdAt)}</div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className={`px-3 py-1 text-xs rounded-full ${getStatusClass(coupon.status)}`}>
                                                {getStatusText(coupon.status)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex justify-end gap-2 flex-wrap">
                                                <button
                                                    onClick={() => handleOpenModal(coupon)}
                                                    className={`p-2 rounded flex items-center gap-1 text-xs transition-colors ${isDark
                                                        ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                                                        : 'bg-yellow-500 hover:bg-yellow-600 text-white'
                                                        }`}
                                                    disabled={loading}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                    تعديل
                                                </button>
                                                <button
                                                    onClick={() => toggleCouponStatus(coupon.id, coupon.status)}
                                                    className={`p-2 rounded flex items-center gap-1 text-xs transition-colors ${isDark
                                                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                                                        }`}
                                                    disabled={loading}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    {coupon.status === 'active' ? 'إلغاء' : 'تفعيل'}
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(coupon.id)}
                                                    className={`p-2 rounded flex items-center gap-1 text-xs transition-colors ${isDark
                                                        ? 'bg-red-600 hover:bg-red-700 text-white'
                                                        : 'bg-red-500 hover:bg-red-600 text-white'
                                                        }`}
                                                    disabled={loading}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                    حذف
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {filteredCoupons.length === 0 && !loading && (
                            <div className="text-center py-8" style={{ color: getMutedTextColor() }}>
                                {coupons.length === 0 ? 'لا توجد كوبونات شحن' : 'لم يتم العثور على كوبونات تطابق البحث'}
                            </div>
                        )}
                    </div>

                    {/*  تصميم البطاقات للهواتف */}
                    <div className="block md:hidden">
                        <div className={`rounded-lg overflow-hidden transition-all duration-300 ${isDark
                            ? 'bg-gray-800 border border-gray-700'
                            : 'bg-white border border-[#dfd7bb] shadow-md'
                            }`}>
                            {filteredCoupons.length === 0 ? (
                                <div className="text-center py-8" style={{ color: getMutedTextColor() }}>
                                    {coupons.length === 0 ? 'لا توجد كوبونات شحن حالياً' : 'لم يتم العثور على كوبونات تطابق البحث'}
                                </div>
                            ) : (
                                filteredCoupons.map(coupon => (
                                    <div key={coupon.id} className={`border-b p-4 transition-colors ${isDark
                                        ? 'border-gray-700 hover:bg-gray-700/50'
                                        : 'border-[#dfd7bb] hover:bg-gray-50'
                                        }`}>
                                        {/* رأس البطاقة */}
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <div className="font-bold text-xl mb-1" style={{ color: getTextColor() }}>{coupon.code}</div>
                                                <div className="text-green-400 font-bold text-lg">${coupon.amount}</div>
                                            </div>
                                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusClass(coupon.status)}`}>
                                                {getStatusText(coupon.status)}
                                            </span>
                                        </div>

                                        {/* معلومات الكوبون */}
                                        <div className="mb-4">
                                            <div className="text-xs mb-1" style={{ color: getMutedTextColor() }}>تاريخ الإنشاء</div>
                                            <div className="text-sm" style={{ color: getTextColor() }}>{formatDate(coupon.createdAt)}</div>
                                        </div>

                                        {/* أزرار الإجراءات */}
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleOpenModal(coupon)}
                                                className={`p-2 rounded flex items-center gap-1 flex-1 justify-center text-sm transition-colors ${isDark
                                                    ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                                                    : 'bg-yellow-500 hover:bg-yellow-600 text-white'
                                                    }`}
                                                disabled={loading}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                                تعديل
                                            </button>
                                            <button
                                                onClick={() => toggleCouponStatus(coupon.id, coupon.status)}
                                                className={`p-2 rounded flex items-center gap-1 flex-1 justify-center text-sm transition-colors ${isDark
                                                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                                                    }`}
                                                disabled={loading}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                {coupon.status === 'active' ? 'إلغاء' : 'تفعيل'}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(coupon.id)}
                                                className={`p-2 rounded flex items-center gap-1 flex-1 justify-center text-sm transition-colors ${isDark
                                                    ? 'bg-red-600 hover:bg-red-700 text-white'
                                                    : 'bg-red-500 hover:bg-red-600 text-white'
                                                    }`}
                                                disabled={loading}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                                حذف
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}

            {/* Modal لإضافة/تعديل الكوبون */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className={`rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden transition-all duration-300 ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
                        }`}>
                        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4">
                            <h3 className="text-xl font-bold" style={{ color: getTextColor() }}>
                                {editingCoupon ? 'تعديل كوبون الشحن' : 'إضافة كوبون شحن جديد'}
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: getMutedTextColor() }}>
                                        كود الشحن *
                                    </label>
                                    <input
                                        type="text"
                                        name="code"
                                        value={formData.code}
                                        onChange={handleChange}
                                        className={`w-full rounded-lg p-3 focus:ring-primary-500 focus:border-primary-500 text-sm md:text-base transition-all duration-300 ${isDark
                                            ? 'bg-gray-700 border border-gray-600 text-white'
                                            : 'bg-gray-50 border border-[#dfd7bb] text-gray-800'
                                            }`}
                                        required
                                        placeholder="مثال: CHARGE25"
                                        disabled={loading}
                                    />
                                    <div className="text-xs mt-1" style={{ color: getMutedTextColor() }}>
                                        الكود الذي سيدخله المستخدم لشحن رصيده
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: getMutedTextColor() }}>
                                        قيمة الرصيد (بالدولار) *
                                    </label>
                                    <input
                                        type="number"
                                        name="amount"
                                        value={formData.amount}
                                        onChange={handleChange}
                                        className={`w-full rounded-lg p-3 focus:ring-primary-500 focus:border-primary-500 text-sm md:text-base transition-all duration-300 ${isDark
                                            ? 'bg-gray-700 border border-gray-600 text-white'
                                            : 'bg-gray-50 border border-[#dfd7bb] text-gray-800'
                                            }`}
                                        required
                                        min="1"
                                        step="0.01"
                                        placeholder="0.00"
                                        disabled={loading}
                                    />
                                    <div className="text-xs mt-1" style={{ color: getMutedTextColor() }}>
                                        المبلغ الذي سيتم إضافته لرصيد المستخدم عند استخدام الكود
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: getMutedTextColor() }}>
                                        الحالة *
                                    </label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        className={`w-full rounded-lg p-3 focus:ring-primary-500 focus:border-primary-500 text-sm md:text-base transition-all duration-300 ${isDark
                                            ? 'bg-gray-700 border border-gray-600 text-white'
                                            : 'bg-gray-50 border border-[#dfd7bb] text-gray-800'
                                            }`}
                                        disabled={loading}
                                    >
                                        <option value="active">نشط</option>
                                        <option value="notactive">غير نشط</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t" style={{
                                borderColor: isDark ? '#374151' : '#dfd7bb'
                            }}>
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className={`py-2 px-4 rounded transition-colors text-sm md:text-base flex-1 md:flex-none ${isDark
                                        ? 'bg-gray-600 hover:bg-gray-500 text-white'
                                        : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                                        }`}
                                    disabled={loading}
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    className={`py-2 px-4 rounded transition-all duration-300 text-sm md:text-base flex-1 md:flex-none ${isDark
                                        ? 'bg-primary-600 hover:bg-primary-500 text-white'
                                        : 'bg-[#c9a84c] hover:bg-[#b8973a] text-white shadow-md hover:shadow-lg'
                                        }`}
                                    disabled={loading}
                                >
                                    {loading ? 'جاري الحفظ...' : (editingCoupon ? 'تحديث' : 'إضافة')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageCoupons;