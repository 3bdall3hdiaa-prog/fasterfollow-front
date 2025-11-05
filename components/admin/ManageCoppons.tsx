import React, { useState, useEffect } from 'react';

interface Coupon {
    _id?: string;
    id: string;
    code: string;
    amount: number; // القيمة التي ستضاف للرصيد
    createdAt: string;
    status: 'active' | 'notactive';
}

const ManageCoupons: React.FC = () => {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        code: '',
        amount: 0, // قيمة الرصيد التي ستضاف
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
                .filter((coupon: any) => coupon.code && coupon.code.trim() !== '') // فلترة الكوبونات التي تحتوي على code
                .map((coupon: any) => ({
                    id: coupon._id || coupon.id,
                    _id: coupon._id,
                    code: coupon.code || '',
                    amount: coupon.amount || coupon.discountValue || 0, // استخدام amount أو discountValue
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
                amount: formData.amount, // إرسال amount بدلاً من discountValue
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

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">إدارة كوبونات الشحن</h1>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg"
                    disabled={loading}
                >
                    {loading ? 'جاري التحميل...' : 'إضافة كوبون جديد'}
                </button>
            </div>

            {loading && coupons.length === 0 ? (
                <div className="text-center text-gray-400 py-8">جاري تحميل الكوبونات...</div>
            ) : (
                <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
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
                            {coupons.map(coupon => (
                                <tr key={coupon.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                                    <td className="px-4 py-4">
                                        <div className="font-bold text-white text-lg">{coupon.code}</div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="text-white font-bold">${coupon.amount}</div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="text-white">{formatDate(coupon.createdAt)}</div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusClass(coupon.status)}`}>
                                            {getStatusText(coupon.status)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 flex space-x-2 space-x-reverse">
                                        <button
                                            onClick={() => handleOpenModal(coupon)}
                                            className="text-primary-400 hover:text-primary-300"
                                            disabled={loading}
                                        >
                                            تعديل
                                        </button>
                                        <button
                                            onClick={() => toggleCouponStatus(coupon.id, coupon.status)}
                                            className="text-yellow-400 hover:text-yellow-300"
                                            disabled={loading}
                                        >
                                            {coupon.status === 'active' ? 'إلغاء' : 'تفعيل'}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(coupon.id)}
                                            className="text-red-400 hover:text-red-300"
                                            disabled={loading}
                                        >
                                            حذف
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {coupons.length === 0 && !loading && (
                        <div className="text-center text-gray-400 py-8">
                            لا توجد كوبونات شحن
                        </div>
                    )}
                </div>
            )}

            {/* Modal لإضافة/تعديل الكوبون */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 text-white rounded-2xl shadow-xl w-full max-w-md">
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
                                        className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-3 focus:ring-primary-500 focus:border-primary-500"
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
                                        className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-3 focus:ring-primary-500 focus:border-primary-500"
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
                                        className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-3 focus:ring-primary-500 focus:border-primary-500"
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
                                    className="bg-gray-600 hover:bg-gray-500 py-2 px-4 rounded transition-colors"
                                    disabled={loading}
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    className="bg-primary-600 hover:bg-primary-500 py-2 px-4 rounded transition-colors"
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