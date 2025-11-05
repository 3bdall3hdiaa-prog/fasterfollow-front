import React, { useState, useEffect } from 'react';
import { Provider } from '../../types';

interface ManageProvidersProps {
    providers: Provider[];
    setProviders: React.Dispatch<React.SetStateAction<Provider[]>>;
}

const StatusBadge: React.FC<{ status: 'Active' | 'Inactive' }> = ({ status }) => {
    const statusClasses = {
        Active: 'bg-green-900 text-green-300',
        Inactive: 'bg-gray-700 text-gray-300',
    };
    return <span className={`px-2 py-1 text-xs rounded-full ${statusClasses[status]}`}>{status}</span>;
};

const ManageProviders: React.FC<ManageProvidersProps> = ({ providers, setProviders }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
    const [syncingProviderId, setSyncingProviderId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        apiEndpoint: '',
        apiKey: '',
        status: 'Active' as 'Active' | 'Inactive',
    });

    // دالة لتحويل البيانات من _id إلى id
    const transformProviderData = (data: any[]): Provider[] => {
        return data.map(provider => ({
            id: provider._id, // استخدام _id كـ id
            name: provider.name,
            apiEndpoint: provider.apiEndpoint,
            apiKey: provider.apiKey,
            status: provider.status,
            balance: provider.balance || 0
        }));
    };

    // جلب البيانات من الـ endpoint عند تحميل المكون
    useEffect(() => {
        fetchProviders();
    }, []);

    const fetchProviders = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${import.meta.env.VITE_API_URL}/manage-providers`);
            if (!response.ok) {
                throw new Error('فشل في جلب البيانات');
            }
            const data = await response.json();
            console.log('Raw data from API:', data);

            // تحويل البيانات من _id إلى id
            const transformedData = transformProviderData(data);
            console.log('Transformed data:', transformedData);

            setProviders(transformedData);
        } catch (error) {
            console.error('Error fetching providers:', error);
            alert('فشل في جلب بيانات المزودين');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (provider: Provider | null) => {
        if (provider) {
            console.log('Opening modal for provider:', provider);
            console.log('Provider ID:', provider.id);

            setEditingProvider(provider);
            setFormData({
                name: provider.name,
                apiEndpoint: provider.apiEndpoint,
                apiKey: '', // Don't show existing API key for security
                status: provider.status,
            });
        } else {
            setEditingProvider(null);
            setFormData({ name: '', apiEndpoint: '', apiKey: '', status: 'Active' });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingProvider(null);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setLoading(true);

            if (editingProvider) {
                // التحقق من وجود ID صالح
                if (!editingProvider.id) {
                    alert('خطأ: معرف المزود غير صالح');
                    return;
                }

                console.log('Editing provider ID:', editingProvider.id);
                console.log('Editing provider:', editingProvider);

                // تعديل مزود موجود
                const updateData: any = {
                    name: formData.name,
                    apiEndpoint: formData.apiEndpoint,
                    status: formData.status,
                };

                // إضافة apiKey فقط إذا تم إدخال قيمة جديدة
                if (formData.apiKey.trim() !== '') {
                    updateData.apiKey = formData.apiKey;
                }

                console.log('Sending update data:', updateData);

                const response = await fetch(`${import.meta.env.VITE_API_URL}/manage-providers/${editingProvider.id}`, {
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
                    throw new Error(`فشل في تعديل المزود: ${response.status} ${response.statusText}`);
                }

                const updatedProviderData = await response.json();
                console.log('Raw updated provider:', updatedProviderData);

                // تحويل البيانات المستلمة
                const updatedProvider = {
                    id: updatedProviderData._id || updatedProviderData.id,
                    name: updatedProviderData.name,
                    apiEndpoint: updatedProviderData.apiEndpoint,
                    apiKey: updatedProviderData.apiKey,
                    status: updatedProviderData.status,
                    balance: updatedProviderData.balance || 0
                };

                console.log('Transformed updated provider:', updatedProvider);

                setProviders(providers.map(p => p.id === editingProvider.id ? updatedProvider : p));
                alert('تم تعديل المزود بنجاح');
            } else {
                // إضافة مزود جديد
                console.log('Sending new provider data:', formData);

                const response = await fetch(`${import.meta.env.VITE_API_URL}/manage-providers`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData),
                });

                console.log('Response status:', response.status);

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Server response:', errorText);
                    throw new Error(`فشل في إضافة المزود: ${response.status} ${response.statusText}`);
                }

                const newProviderData = await response.json();
                console.log('Raw new provider:', newProviderData);

                // تحويل البيانات المستلمة
                const newProvider = {
                    id: newProviderData._id || newProviderData.id,
                    name: newProviderData.name,
                    apiEndpoint: newProviderData.apiEndpoint,
                    apiKey: newProviderData.apiKey,
                    status: newProviderData.status,
                    balance: newProviderData.balance || 0
                };

                console.log('Transformed new provider:', newProvider);

                setProviders([...providers, newProvider]);
                alert('تم إضافة المزود بنجاح');
            }

            handleCloseModal();
        } catch (error) {
            console.error('Error saving provider:', error);
            alert(`فشل في حفظ البيانات: ${error instanceof Error ? error.message : 'حدث خطأ غير معروف'}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (providerId: string) => {
        if (window.confirm('هل أنت متأكد من رغبتك في حذف هذا المزود؟ سيؤثر هذا على الخدمات المرتبطة به.')) {
            try {
                setLoading(true);
                console.log('Deleting provider ID:', providerId);

                const response = await fetch(`${import.meta.env.VITE_API_URL}/manage-providers/${providerId}`, {
                    method: 'DELETE',
                });

                console.log('Delete response status:', response.status);

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Server response:', errorText);
                    throw new Error(`فشل في حذف المزود: ${response.status} ${response.statusText}`);
                }

                setProviders(providers.filter(p => p.id !== providerId));
                alert('تم حذف المزود بنجاح');
            } catch (error) {
                console.error('Error deleting provider:', error);
                alert(`فشل في حذف المزود: ${error instanceof Error ? error.message : 'حدث خطأ غير معروف'}`);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleSync = async (providerId: string) => {
        setSyncingProviderId(providerId);
        try {
            console.log('Syncing provider ID:', providerId);

            const response = await fetch(`${import.meta.env.VITE_API_URL}/manage-providers/${providerId}/sync`, {
                method: 'POST',
            });

            console.log('Sync response status:', response.status);

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message || `فشل في مزامنة الرصيد: ${response.status}`);
            }

            const result = await response.json();
            console.log('Sync result:', result);

            if (result.success && result.balance !== undefined) {
                setProviders(prevProviders =>
                    prevProviders.map(p =>
                        p.id === providerId ? { ...p, balance: result.balance } : p
                    )
                );
                alert('تمت مزامنة الرصيد بنجاح');
            } else {
                alert(`فشلت المزامنة: ${result.message || 'حدث خطأ غير معروف'}`);
            }
        } catch (error) {
            console.error("Sync failed:", error);
            alert(`فشلت المزامنة: ${error instanceof Error ? error.message : 'حدث خطأ غير معروف'}`);
        } finally {
            setSyncingProviderId(null);
        }
    };

    if (loading && providers.length === 0) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-white">جاري تحميل البيانات...</div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-white">إدارة المزودين</h1>
                <button
                    onClick={() => handleOpenModal(null)}
                    className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg w-full md:w-auto"
                    disabled={loading}
                >
                    إضافة مزود جديد
                </button>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right text-gray-300">
                        <thead className="text-xs text-gray-400 uppercase bg-gray-700/50">
                            <tr>
                                <th className="px-4 py-3">الاسم</th>
                                <th className="px-4 py-3">نقطة النهاية (API)</th>
                                <th className="px-4 py-3">API_KEY</th>
                                <th className="px-4 py-3">الحالة</th>
                                <th className="px-4 py-3">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {providers.map(provider => (
                                <tr key={provider.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                                    <td className="px-4 py-4 text-white font-medium">{provider.name}</td>
                                    <td className="px-4 py-4 font-mono text-xs">{provider.apiEndpoint}</td>
                                    <td className="px-4 py-4 font-mono text-xs">
                                        {provider.apiKey ? `${provider.apiKey}` : 'N/A'}
                                    </td>
                                    <td className="px-4 py-4"><StatusBadge status={provider.status} /></td>
                                    <td className="px-4 py-4 flex space-x-2 space-x-reverse">
                                        <button
                                            onClick={() => handleOpenModal(provider)}
                                            className="text-primary-400 hover:text-primary-300 text-sm"
                                            disabled={loading}
                                        >
                                            تعديل
                                        </button>

                                        <button
                                            onClick={() => handleDelete(provider.id)}
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
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" onClick={handleCloseModal}>
                    <div className="bg-gray-800 text-white rounded-2xl shadow-xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
                        <form onSubmit={handleSubmit}>
                            <div className="p-6">
                                <h3 className="text-xl font-bold mb-6">{editingProvider ? 'تعديل مزود' : 'إضافة مزود جديد'}</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">اسم المزود</label>
                                        <input
                                            type="text"
                                            name="name"
                                            id="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            className="w-full bg-gray-700 rounded-md p-2 border border-gray-600"
                                            disabled={loading}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="apiEndpoint" className="block text-sm font-medium text-gray-300 mb-1">نقطة النهاية (API)</label>
                                        <input
                                            type="url"
                                            name="apiEndpoint"
                                            id="apiEndpoint"
                                            value={formData.apiEndpoint}
                                            onChange={handleChange}
                                            required
                                            className="w-full bg-gray-700 rounded-md p-2 border border-gray-600"
                                            placeholder="https://provider.com/api"
                                            disabled={loading}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="apiKey" className="block text-sm font-medium text-gray-300 mb-1">مفتاح الـ API</label>
                                        <input
                                            type="text"
                                            name="apiKey"
                                            id="apiKey"
                                            value={formData.apiKey}
                                            onChange={handleChange}
                                            required={!editingProvider}
                                            placeholder={editingProvider ? 'اتركه فارغاً لعدم التغيير' : ''}
                                            className="w-full bg-gray-700 rounded-md p-2 border border-gray-600"
                                            disabled={loading}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-1">الحالة</label>
                                        <select
                                            name="status"
                                            id="status"
                                            value={formData.status}
                                            onChange={handleChange}
                                            className="w-full bg-gray-700 rounded-md p-2 border border-gray-600"
                                            disabled={loading}
                                        >
                                            <option value="Active">نشط</option>
                                            <option value="Inactive">غير نشط</option>
                                        </select>
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

export default ManageProviders;