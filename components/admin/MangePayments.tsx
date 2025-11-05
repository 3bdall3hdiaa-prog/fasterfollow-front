import React, { useState, useEffect } from 'react';

interface PaymentMethod {
    _id: string;
    id: string;
    name: string;
    icon: string;
    paymentUrl: string;
    description: string; // إضافة حقل description
}

const ManagePayments: React.FC = () => {
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPayment, setEditingPayment] = useState<PaymentMethod | null>(null);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        icon: '',
        paymentUrl: '',
        description: '', // إضافة description في formData
    });

    // دالة لتحويل البيانات من API إلى الشكل المطلوب
    const transformPaymentData = (data: any[]): PaymentMethod[] => {
        return data.map(payment => ({
            _id: payment._id,
            id: payment.id,
            name: payment.name,
            icon: payment.icon,
            paymentUrl: payment.url,
            description: payment.description || '', // إضافة description مع قيمة افتراضية
        }));
    };

    // جلب البيانات من الـ endpoint عند تحميل المكون
    useEffect(() => {
        fetchPaymentMethods();
    }, []);

    const fetchPaymentMethods = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${import.meta.env.VITE_API_URL}/mange-payments`);
            if (!response.ok) {
                throw new Error('فشل في جلب البيانات');
            }
            const data = await response.json();
            console.log('Raw data from API:', data);

            // تحويل البيانات من API إلى الشكل المطلوب
            const transformedData = transformPaymentData(data);
            console.log('Transformed data:', transformedData);

            setPaymentMethods(transformedData);
        } catch (error) {
            console.error('Error fetching payment methods:', error);
            alert('فشل في جلب بيانات طرق الدفع');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (payment: PaymentMethod | null) => {
        if (payment) {
            setEditingPayment(payment);
            setFormData({
                id: payment.id,
                name: payment.name,
                icon: payment.icon,
                paymentUrl: payment.paymentUrl,
                description: payment.description, // تعيين قيمة description
            });
        } else {
            setEditingPayment(null);
            setFormData({
                id: '',
                name: '',
                icon: '',
                paymentUrl: '',
                description: '' // إعادة تعيين description
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingPayment(null);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setLoading(true);

            if (editingPayment) {
                // التحقق من وجود _id صالح
                if (!editingPayment._id) {
                    alert('خطأ: معرف طريقة الدفع غير صالح');
                    return;
                }

                console.log('Editing payment _id:', editingPayment._id);
                console.log('Editing payment:', editingPayment);

                // تعديل طريقة دفع موجودة - استخدام _id في الـ URL
                const updateData: any = {
                    id: formData.id,
                    name: formData.name,
                    icon: formData.icon,
                    url: formData.paymentUrl,
                    description: formData.description, // إضافة description
                };

                console.log('Sending update data:', updateData);

                const response = await fetch(`${import.meta.env.VITE_API_URL}/mange-payments/${editingPayment._id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updateData),
                });

                console.log('Response status:', response.status);

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Server response:', errorText);
                    throw new Error(`فشل في تعديل طريقة الدفع: ${response.status} ${response.statusText}`);
                }

                const updatedPaymentData = await response.json();
                console.log('Raw updated payment:', updatedPaymentData);

                // تحويل البيانات المستلمة
                const updatedPayment = {
                    _id: updatedPaymentData._id,
                    id: updatedPaymentData.id,
                    name: updatedPaymentData.name,
                    icon: updatedPaymentData.icon,
                    paymentUrl: updatedPaymentData.url,
                    description: updatedPaymentData.description || '', // إضافة description
                };

                console.log('Transformed updated payment:', updatedPayment);

                setPaymentMethods(prev => prev.map(p => p._id === editingPayment._id ? updatedPayment : p));
                alert('تم تعديل طريقة الدفع بنجاح');
            } else {
                // إضافة طريقة دفع جديدة
                console.log('Sending new payment data:', formData);

                const newPaymentData = {
                    id: formData.id,
                    name: formData.name,
                    icon: formData.icon,
                    url: formData.paymentUrl,
                    description: formData.description, // إضافة description
                };

                console.log('Sending data to API:', newPaymentData);

                const response = await fetch(`${import.meta.env.VITE_API_URL}/mange-payments`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(newPaymentData),
                });

                console.log('Response status:', response.status);

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Server response:', errorText);
                    throw new Error(`فشل في إضافة طريقة الدفع: ${response.status} ${response.statusText}`);
                }

                const newPaymentResponse = await response.json();
                console.log('Raw new payment:', newPaymentResponse);

                // تحويل البيانات المستلمة
                const newPayment = {
                    _id: newPaymentResponse._id,
                    id: newPaymentResponse.id,
                    name: newPaymentResponse.name,
                    icon: newPaymentResponse.icon,
                    paymentUrl: newPaymentResponse.url,
                    description: newPaymentResponse.description || '', // إضافة description
                };

                console.log('Transformed new payment:', newPayment);

                setPaymentMethods(prev => [...prev, newPayment]);
                alert('تم إضافة طريقة الدفع بنجاح');
            }

            handleCloseModal();
        } catch (error) {
            console.error('Error saving payment method:', error);
            alert(`فشل في حفظ البيانات: ${error instanceof Error ? error.message : 'حدث خطأ غير معروف'}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (paymentId: string) => {
        if (window.confirm('هل أنت متأكد من رغبتك في حذف طريقة الدفع هذه؟')) {
            try {
                setLoading(true);
                console.log('Deleting payment _id:', paymentId);

                // استخدام _id في الـ URL للحذف
                const response = await fetch(`${import.meta.env.VITE_API_URL}/mange-payments/${paymentId}`, {
                    method: 'DELETE',
                });

                console.log('Delete response status:', response.status);

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Server response:', errorText);
                    throw new Error(`فشل في حذف طريقة الدفع: ${response.status} ${response.statusText}`);
                }

                setPaymentMethods(prev => prev.filter(p => p._id !== paymentId));
                alert('تم حذف طريقة الدفع بنجاح');
            } catch (error) {
                console.error('Error deleting payment method:', error);
                alert(`فشل في حذف طريقة الدفع: ${error instanceof Error ? error.message : 'حدث خطأ غير معروف'}`);
            } finally {
                setLoading(false);
            }
        }
    };

    if (loading && paymentMethods.length === 0) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-white">جاري تحميل البيانات...</div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-white">إدارة طرق الدفع</h1>
                <button
                    onClick={() => handleOpenModal(null)}
                    className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg w-full md:w-auto"
                    disabled={loading}
                >
                    إضافة طريقة دفع جديدة
                </button>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right text-gray-300">
                        <thead className="text-xs text-gray-400 uppercase bg-gray-700/50">
                            <tr>
                                <th className="px-4 py-3">ID</th>
                                <th className="px-4 py-3">الاسم</th>
                                <th className="px-4 py-3">الأيقونة</th>
                                <th className="px-4 py-3">الوصف</th>
                                <th className="px-4 py-3">رابط بوابة الدفع</th>
                                <th className="px-4 py-3">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paymentMethods.map(payment => (
                                <tr key={payment._id} className="border-b border-gray-700 hover:bg-gray-700/50">
                                    <td className="px-4 py-4 font-mono text-xs">
                                        <code className="bg-gray-700 px-2 py-1 rounded">
                                            {payment.id}
                                        </code>
                                    </td>
                                    <td className="px-4 py-4 text-white font-medium">{payment.name}</td>
                                    <td className="px-4 py-4 text-2xl">
                                        {payment.icon}
                                    </td>
                                    <td className="px-4 py-4 max-w-xs">
                                        <div className="text-gray-300 text-sm line-clamp-2" title={payment.description}>
                                            {payment.description || 'لا يوجد وصف'}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 font-mono text-xs">
                                        <a
                                            href={payment.paymentUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary-400 hover:text-primary-300 break-all"
                                        >
                                            {payment.paymentUrl}
                                        </a>
                                    </td>
                                    <td className="px-4 py-4 flex space-x-2 space-x-reverse">
                                        <button
                                            onClick={() => handleOpenModal(payment)}
                                            className="text-primary-400 hover:text-primary-300 text-sm"
                                            disabled={loading}
                                        >
                                            تعديل
                                        </button>

                                        <button
                                            onClick={() => handleDelete(payment._id)}
                                            className="text-red-400 hover:text-red-300 text-sm"
                                            disabled={loading}
                                        >
                                            حذف
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {paymentMethods.length === 0 && !loading && (
                        <div className="text-center text-gray-400 py-8">
                            لا توجد طرق دفع
                        </div>
                    )}
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" onClick={handleCloseModal}>
                    <div className="bg-gray-800 text-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <form onSubmit={handleSubmit}>
                            <div className="p-6">
                                <h3 className="text-xl font-bold mb-6">{editingPayment ? 'تعديل طريقة الدفع' : 'إضافة طريقة دفع جديدة'}</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="id" className="block text-sm font-medium text-gray-300 mb-1">ID (معرف فريد)</label>
                                        <input
                                            type="text"
                                            name="id"
                                            id="id"
                                            value={formData.id}
                                            onChange={handleChange}
                                            required
                                            className="w-full bg-gray-700 rounded-md p-2 border border-gray-600"
                                            placeholder="مثال: paypal, stripe, etc."
                                            disabled={loading || !!editingPayment}
                                        />
                                        {editingPayment && (
                                            <p className="text-xs text-gray-400 mt-1">لا يمكن تعديل ID بعد الإنشاء</p>
                                        )}
                                    </div>
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">اسم طريقة الدفع</label>
                                        <input
                                            type="text"
                                            name="name"
                                            id="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            className="w-full bg-gray-700 rounded-md p-2 border border-gray-600"
                                            placeholder="مثال: PayPal, Stripe, etc."
                                            disabled={loading}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="icon" className="block text-sm font-medium text-gray-300 mb-1">الأيقونة</label>
                                        <input
                                            type="text"
                                            name="icon"
                                            id="icon"
                                            value={formData.icon}
                                            onChange={handleChange}
                                            className="w-full bg-gray-700 rounded-md p-2 border border-gray-600"
                                            placeholder="مثال: 🅿️, 💳, etc."
                                            disabled={loading}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">الوصف</label>
                                        <textarea
                                            name="description"
                                            id="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            rows={3}
                                            className="w-full bg-gray-700 rounded-md p-2 border border-gray-600 resize-none"
                                            placeholder="أدخل وصفاً لطريقة الدفع يظهر للمستخدم..."
                                            disabled={loading}
                                        />
                                        <p className="text-xs text-gray-400 mt-1">
                                            هذا الوصف سيظهر للمستخدم عند اختيار طريقة الدفع
                                        </p>
                                    </div>
                                    <div>
                                        <label htmlFor="paymentUrl" className="block text-sm font-medium text-gray-300 mb-1">رابط بوابة الدفع</label>
                                        <input
                                            type="url"
                                            name="paymentUrl"
                                            id="paymentUrl"
                                            value={formData.paymentUrl}
                                            onChange={handleChange}
                                            required
                                            className="w-full bg-gray-700 rounded-md p-2 border border-gray-600"
                                            placeholder="https://example.com/payment"
                                            disabled={loading}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-700/50 px-6 py-3 flex justify-end space-x-3 space-x-reverse rounded-b-2xl">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg"
                                    disabled={loading}
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg"
                                    disabled={loading}
                                >
                                    {loading ? 'جاري الحفظ...' : 'حفظ'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManagePayments;