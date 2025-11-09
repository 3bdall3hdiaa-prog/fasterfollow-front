import React, { useState, useEffect } from 'react';
import { SiteSettings } from '../../types';

interface SiteSettingsProps {
    settings: SiteSettings;
    setSettings: React.Dispatch<React.SetStateAction<SiteSettings>>;
}

const SiteSettingsComponent: React.FC<SiteSettingsProps> = ({ settings, setSettings }) => {
    const [formData, setFormData] = useState(settings);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setFormData(settings);
    }, [settings]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (name.startsWith('announcement.')) {
            const key = name.split('.')[1];
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({
                ...prev,
                announcement: { ...prev.announcement, [key]: type === 'checkbox' ? checked : value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleContentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const [section, key] = name.split('.');
        setFormData(prev => ({
            ...prev,
            homepageContent: {
                ...prev.homepageContent,
                [section]: {
                    ...prev.homepageContent[section],
                    [key]: value
                }
            }
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage('');
        setSuccessMessage('');

        try {
            console.log('🔄 جاري حفظ الإعدادات...', formData);

            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/manage-setting`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `فشل في الحفظ: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();
            console.log('✅ تم حفظ الإعدادات بنجاح:', result);

            // تحديث الـ state بالبيانات الجديدة
            setSettings(formData);
            setSuccessMessage('تم حفظ الإعدادات بنجاح!');

        } catch (error) {
            console.error('❌ خطأ في حفظ الإعدادات:', error);
            setErrorMessage(error.message || 'حدث خطأ أثناء حفظ الإعدادات. يرجى المحاولة مرة أخرى.');
        } finally {
            setIsLoading(false);
            setTimeout(() => {
                setSuccessMessage('');
                setErrorMessage('');
            }, 5000);
        }
    };

    const FormInput = ({ label, name, value, onChange, type = "text", placeholder = "" }) => (
        <div>
            <label className="block text-sm font-medium mb-1">{label}</label>
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                disabled={isLoading}
                className="w-full bg-gray-700 rounded-md p-2 border border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            />
        </div>
    );

    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-6">إعدادات الموقع</h1>

            {/* عرض رسائل التنبيه */}
            {successMessage && (
                <div className="bg-green-500/20 border border-green-700 text-green-300 px-4 py-3 rounded-lg mb-6">
                    ✅ {successMessage}
                </div>
            )}

            {errorMessage && (
                <div className="bg-red-500/20 border border-red-700 text-red-300 px-4 py-3 rounded-lg mb-6">
                    ❌ {errorMessage}
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-gray-800 border border-gray-700 rounded-lg p-6 space-y-6 max-w-4xl mx-auto relative">

                {isLoading && (
                    <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center rounded-lg z-10">
                        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2"></div>
                            <p className="text-white">جاري حفظ الإعدادات...</p>
                        </div>
                    </div>
                )}

                <div className="border-b border-gray-700 pb-6">
                    <h2 className="text-xl font-semibold text-white mb-4">الإعدادات العامة</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormInput
                            label="اسم الموقع"
                            name="siteName"
                            value={formData.siteName}
                            onChange={handleChange}
                            placeholder="أدخل اسم الموقع"
                        />
                        <FormInput
                            label="رابط شعار الموقع (Logo)"
                            name="logoUrl"
                            value={formData.logoUrl}
                            onChange={handleChange}
                            placeholder="https://example.com/logo.png"
                        />
                        <div>
                            <label className="block text-sm font-medium mb-1">اللون الأساسي</label>
                            <input
                                type="color"
                                name="primaryColor"
                                value={formData.primaryColor}
                                onChange={handleChange}
                                disabled={isLoading}
                                className="w-full h-10 p-1 bg-gray-700 rounded-md border border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                        </div>
                        <FormInput
                            label="رابط الأيقونة (Favicon)"
                            name="faviconUrl"
                            value={formData.faviconUrl}
                            onChange={handleChange}
                            placeholder="/favicon.ico"
                        />
                    </div>
                </div>

                <div className="border-b border-gray-700 pb-6">
                    <h2 className="text-xl font-semibold text-white mb-4">محتوى الصفحة الرئيسية</h2>
                    <div className="space-y-4">
                        <h3 className="font-semibold text-primary-400">قسم Hero</h3>
                        <FormInput
                            label="العنوان الرئيسي"
                            name="hero.title"
                            value={formData.homepageContent.hero.title}
                            onChange={handleContentChange}
                            placeholder="عزز حضورك الرقمي مع"
                        />
                        <FormInput
                            label="العنوان الفرعي (الوصف)"
                            name="hero.subtitle"
                            value={formData.homepageContent.hero.subtitle}
                            onChange={handleContentChange}
                            placeholder="وصف قصير عن الخدمات"
                        />
                        <FormInput
                            label="نص الزر الأول"
                            name="hero.cta1"
                            value={formData.homepageContent.hero.cta1}
                            onChange={handleContentChange}
                            placeholder="اكتشف خدماتنا"
                        />
                        <FormInput
                            label="نص الزر الثاني"
                            name="hero.cta2"
                            value={formData.homepageContent.hero.cta2}
                            onChange={handleContentChange}
                            placeholder="كيف نعمل؟"
                        />
                        <h3 className="font-semibold text-primary-400 mt-4">قسم الخدمات</h3>
                        <FormInput
                            label="عنوان قسم الخدمات"
                            name="services.title"
                            value={formData.homepageContent.services.title}
                            onChange={handleContentChange}
                            placeholder="خدماتنا المميزة"
                        />
                        <FormInput
                            label="الوصف المرافق لعنوان الخدمات"
                            name="services.subtitle"
                            value={formData.homepageContent.services.subtitle}
                            onChange={handleContentChange}
                            placeholder="اختر الباقة التي تناسب احتياجاتك"
                        />
                    </div>
                </div>

                <div className="border-b border-gray-700 pb-6">
                    <h2 className="text-xl font-semibold text-white mb-4">إعدادات SEO</h2>
                    <FormInput
                        label="عنوان الصفحة الرئيسية (SEO)"
                        name="seoTitle"
                        value={formData.seoTitle}
                        onChange={handleChange}
                        placeholder="عنوان SEO للموقع"
                    />
                    <div className="mt-4">
                        <label className="block text-sm font-medium mb-1">وصف الموقع (SEO)</label>
                        <textarea
                            name="seoDescription"
                            value={formData.seoDescription}
                            onChange={handleChange}
                            placeholder="وصف SEO للموقع"
                            rows={3}
                            disabled={isLoading}
                            className="w-full bg-gray-700 rounded-md p-2 border border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                    </div>
                </div>

                <div>
                    <h2 className="text-xl font-semibold text-white mb-4">شريط الإعلانات</h2>
                    <FormInput
                        label="نص الإعلان"
                        name="announcement.text"
                        value={formData.announcement.text}
                        onChange={handleChange}
                        placeholder="🎉 إعلان خاص!"
                    />
                    <div className="mt-4">
                        <label className="flex items-center space-x-2 space-x-reverse">
                            <input
                                type="checkbox"
                                name="announcement.isEnabled"
                                checked={formData.announcement.isEnabled}
                                onChange={handleChange}
                                disabled={isLoading}
                                className="form-checkbox disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                            <span className={isLoading ? 'opacity-50' : ''}>تفعيل شريط الإعلانات</span>
                        </label>
                    </div>
                </div>

                <div className="pt-6 border-t border-gray-700">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="bg-primary-600 hover:bg-primary-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-2 px-6 rounded-lg transition-colors duration-200"
                    >
                        {isLoading ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SiteSettingsComponent;