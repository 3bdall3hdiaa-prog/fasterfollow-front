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
            const response = await fetch(`${API_BASE}/managecopons`);

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
                method: 'DELETE'
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

    return (
        <div className="p-4">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-2xl md:text-3xl font-bold text-white text-center md:text-right">
                    إدارة كوبونات الشحن
                </h1>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-6 rounded-lg w-full md:w-auto"
                    disabled={loading}
                >
                    {loading ? 'جاري التحميل...' : 'إضافة كوبون جديد'}
                </button>
            </div>

            {/* حقل البحث */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                    <input
                        type="text"
                        placeholder="ابحث بكود الشحن، القيمة، أو الحالة..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-gray-700 border border-gray-600 rounded-md p-3 text-white w-full md:w-1/2 text-sm md:text-base"
                    />
                    <div className="text-gray-400 text-sm md:text-base">
                        إجمالي الكوبونات: {coupons.length} | المعروض: {filteredCoupons.length}
                    </div>
                </div>
            </div>

            {loading && coupons.length === 0 ? (
                <div className="text-center text-gray-400 py-8">جاري تحميل الكوبونات...</div>
            ) : (
                <>
                    {/* ✅ جدول الكوبونات - للشاشات الكبيرة */}
                    <div className="hidden md:block bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
                        <table className="w-full text-sm text-right text-gray-300">
                            <thead className="text-xs text-gray-400 uppercase bg-gray-700/50">
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
                                    <tr key={coupon.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                                        <td className="px-4 py-4">
                                            <div className="font-bold text-white text-lg">{coupon.code}</div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="text-green-400 font-bold text-lg">${coupon.amount}</div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="text-white">{formatDate(coupon.createdAt)}</div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className={`px-3 py-1 text-xs rounded-full ${getStatusClass(coupon.status)}`}>
                                                {getStatusText(coupon.status)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleOpenModal(coupon)}
                                                    className="bg-yellow-600 hover:bg-yellow-700 text-white p-2 rounded flex items-center gap-1 text-xs"
                                                    disabled={loading}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                    تعديل
                                                </button>
                                                <button
                                                    onClick={() => toggleCouponStatus(coupon.id, coupon.status)}
                                                    className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded flex items-center gap-1 text-xs"
                                                    disabled={loading}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    {coupon.status === 'active' ? 'إلغاء' : 'تفعيل'}
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(coupon.id)}
                                                    className="bg-red-600 hover:bg-red-700 text-white p-2 rounded flex items-center gap-1 text-xs"
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
                            <div className="text-center text-gray-400 py-8">
                                {coupons.length === 0 ? 'لا توجد كوبونات شحن' : 'لم يتم العثور على كوبونات تطابق البحث'}
                            </div>
                        )}
                    </div>

                    {/* ✅ تصميم البطاقات للهواتف */}
                    <div className="block md:hidden">
                        <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
                            {filteredCoupons.length === 0 ? (
                                <div className="text-center py-8 text-gray-400">
                                    {coupons.length === 0 ? 'لا توجد كوبونات شحن حالياً' : 'لم يتم العثور على كوبونات تطابق البحث'}
                                </div>
                            ) : (
                                filteredCoupons.map(coupon => (
                                    <div key={coupon.id} className="border-b border-gray-700 p-4 hover:bg-gray-700/50 transition-colors">
                                        {/* رأس البطاقة */}
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <div className="font-bold text-white text-xl mb-1">{coupon.code}</div>
                                                <div className="text-green-400 font-bold text-lg">${coupon.amount}</div>
                                            </div>
                                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusClass(coupon.status)}`}>
                                                {getStatusText(coupon.status)}
                                            </span>
                                        </div>

                                        {/* معلومات الكوبون */}
                                        <div className="mb-4">
                                            <div className="text-gray-400 text-xs mb-1">تاريخ الإنشاء</div>
                                            <div className="text-white text-sm">{formatDate(coupon.createdAt)}</div>
                                        </div>

                                        {/* أزرار الإجراءات */}
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleOpenModal(coupon)}
                                                className="bg-yellow-600 hover:bg-yellow-700 text-white p-2 rounded flex items-center gap-1 flex-1 justify-center text-sm"
                                                disabled={loading}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                                تعديل
                                            </button>
                                            <button
                                                onClick={() => toggleCouponStatus(coupon.id, coupon.status)}
                                                className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded flex items-center gap-1 flex-1 justify-center text-sm"
                                                disabled={loading}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                {coupon.status === 'active' ? 'إلغاء' : 'تفعيل'}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(coupon.id)}
                                                className="bg-red-600 hover:bg-red-700 text-white p-2 rounded flex items-center gap-1 flex-1 justify-center text-sm"
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
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 text-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden">
                        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4">
                            <h3 className="text-xl font-bold">
                                {editingCoupon ? 'تعديل كوبون الشحن' : 'إضافة كوبون شحن جديد'}
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        كود الشحن *
                                    </label>
                                    <input
                                        type="text"
                                        name="code"
                                        value={formData.code}
                                        onChange={handleChange}
                                        className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-3 focus:ring-primary-500 focus:border-primary-500 text-sm md:text-base"
                                        required
                                        placeholder="مثال: CHARGE25"
                                        disabled={loading}
                                    />
                                    <div className="text-xs text-gray-400 mt-1">
                                        الكود الذي سيدخله المستخدم لشحن رصيده
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        قيمة الرصيد (بالدولار) *
                                    </label>
                                    <input
                                        type="number"
                                        name="amount"
                                        value={formData.amount}
                                        onChange={handleChange}
                                        className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-3 focus:ring-primary-500 focus:border-primary-500 text-sm md:text-base"
                                        required
                                        min="1"
                                        step="0.01"
                                        placeholder="0.00"
                                        disabled={loading}
                                    />
                                    <div className="text-xs text-gray-400 mt-1">
                                        المبلغ الذي سيتم إضافته لرصيد المستخدم عند استخدام الكود
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        الحالة *
                                    </label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-3 focus:ring-primary-500 focus:border-primary-500 text-sm md:text-base"
                                        disabled={loading}
                                    >
                                        <option value="active">نشط</option>
                                        <option value="notactive">غير نشط</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="bg-gray-600 hover:bg-gray-500 py-2 px-4 rounded transition-colors text-sm md:text-base flex-1 md:flex-none"
                                    disabled={loading}
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    className="bg-primary-600 hover:bg-primary-500 py-2 px-4 rounded transition-colors text-sm md:text-base flex-1 md:flex-none"
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