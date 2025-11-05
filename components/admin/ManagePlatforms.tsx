import React, { useState } from 'react';
import { Platform } from '../../types';

interface ManagePlatformsProps {
    platforms: Platform[];
    setPlatforms: React.Dispatch<React.SetStateAction<Platform[]>>;
}

const ManagePlatforms: React.FC<ManagePlatformsProps> = ({ platforms, setPlatforms }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPlatform, setEditingPlatform] = useState<Platform | null>(null);
    const [formData, setFormData] = useState<Partial<Platform>>({});

    const handleOpenModal = (platform: Platform | null) => {
        setEditingPlatform(platform);
        setFormData(platform || { name: '', iconUrl: '' });
        setIsModalOpen(true);
    };
    
    const handleCloseModal = () => setIsModalOpen(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingPlatform) {
            setPlatforms(platforms.map(p => p.id === editingPlatform.id ? { ...editingPlatform, ...formData } as Platform : p));
        } else {
            const newPlatform: Platform = { id: `platform_${Date.now()}`, ...formData } as Platform;
            setPlatforms([...platforms, newPlatform]);
        }
        handleCloseModal();
    };

    const handleDelete = (platformId: string) => {
        if (window.confirm('هل أنت متأكد من حذف هذه المنصة؟')) {
            setPlatforms(platforms.filter(p => p.id !== platformId));
        }
    };
    
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">إدارة المنصات</h1>
                <button onClick={() => handleOpenModal(null)} className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg">إضافة منصة جديدة</button>
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
                <table className="w-full text-sm text-right text-gray-300">
                    <thead className="text-xs text-gray-400 uppercase bg-gray-700/50">
                        <tr>
                            <th className="px-4 py-3">الاسم</th>
                            <th className="px-4 py-3">الأيقونة</th>
                            <th className="px-4 py-3">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {platforms.map(platform => (
                            <tr key={platform.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                                <td className="px-4 py-4 text-white">{platform.name}</td>
                                <td className="px-4 py-4 text-2xl">{platform.iconUrl}</td>
                                <td className="px-4 py-4 flex space-x-2 space-x-reverse">
                                    <button onClick={() => handleOpenModal(platform)} className="text-primary-400 hover:text-primary-300">تعديل</button>
                                    <button onClick={() => handleDelete(platform.id)} className="text-red-400 hover:text-red-300">حذف</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {isModalOpen && (
                 <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" onClick={handleCloseModal}>
                    <div className="bg-gray-800 text-white rounded-2xl shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                         <form onSubmit={handleSubmit} className="p-6 space-y-4">
                             <h3 className="text-xl font-bold">{editingPlatform ? 'تعديل منصة' : 'إضافة منصة'}</h3>
                             <input name="name" value={formData.name || ''} onChange={handleChange} placeholder="اسم المنصة" className="w-full bg-gray-700 p-2 rounded" required />
                             <input name="iconUrl" value={formData.iconUrl || ''} onChange={handleChange} placeholder="الأيقونة (Emoji)" className="w-full bg-gray-700 p-2 rounded" />
                             <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
                                 <button type="button" onClick={handleCloseModal} className="bg-gray-600 py-2 px-4 rounded">إلغاء</button>
                                 <button type="submit" className="bg-primary-600 py-2 px-4 rounded">حفظ</button>
                             </div>
                         </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManagePlatforms;
