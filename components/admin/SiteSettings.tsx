import React, { useState, useEffect } from 'react';
import { SiteSettings } from '../../types';
import { useThemeStore } from '@/store/theme.store';

interface SiteSettingsProps {
    settings: SiteSettings;
    setSettings: React.Dispatch<React.SetStateAction<SiteSettings>>;
}

const SiteSettingsComponent: React.FC<SiteSettingsProps> = ({ settings, setSettings }) => {
    const { isDark } = useThemeStore();
    const [formData, setFormData] = useState(settings);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

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
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `فشل في الحفظ: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();
            console.log('✅ تم حفظ الإعدادات بنجاح:', result);

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
            <label className="block text-sm font-medium mb-1" style={{ color: getMutedTextColor() }}>{label}</label>
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                disabled={isLoading}
                className={`w-full rounded-md p-2 border disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 ${isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-gray-50 border-[#dfd7bb] text-gray-800'
                    }`}
            />
        </div>
    );

    return (
        <div className="p-4" style={{
            backgroundColor: isDark ? '#1e2235' : '#f8f6f0',
            minHeight: "100vh",
            transition: "all 0.3s ease"
        }}>
            <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center md:text-right" style={{ color: getTextColor() }}>
                إعدادات الموقع
            </h1>

            {/* عرض رسائل التنبيه */}
            {successMessage && (
                <div className={`px-4 py-3 rounded-lg mb-6 ${isDark
                        ? 'bg-green-500/20 border border-green-700 text-green-300'
                        : 'bg-green-50 border border-green-200 text-green-700'
                    }`}>
                    ✅ {successMessage}
                </div>
            )}

            {errorMessage && (
                <div className={`px-4 py-3 rounded-lg mb-6 ${isDark
                        ? 'bg-red-500/20 border border-red-700 text-red-300'
                        : 'bg-red-50 border border-red-200 text-red-700'
                    }`}>
                    ❌ {errorMessage}
                </div>
            )}

            <form onSubmit={handleSubmit} className={`rounded-lg p-6 space-y-6 max-w-4xl mx-auto relative transition-all duration-300 ${isDark
                    ? 'bg-gray-800 border border-gray-700'
                    : 'bg-white border border-[#dfd7bb] shadow-md'
                }`}>

                {isLoading && (
                    <div className={`absolute inset-0 flex items-center justify-center rounded-lg z-10 ${isDark ? 'bg-gray-900/50' : 'bg-white/70'
                        }`}>
                        <div className={`rounded-lg p-6 ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-[#dfd7bb] shadow-lg'
                            }`}>
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2"></div>
                            <p style={{ color: getTextColor() }}>جاري حفظ الإعدادات...</p>
                        </div>
                    </div>
                )}

                <div className={`pb-6 ${isDark ? 'border-b border-gray-700' : 'border-b border-[#dfd7bb]'
                    }`}>
                    <h2 className="text-xl font-semibold mb-4" style={{ color: getTextColor() }}>الإعدادات العامة</h2>
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
                            <label className="block text-sm font-medium mb-1" style={{ color: getMutedTextColor() }}>اللون الأساسي</label>
                            <input
                                type="color"
                                name="primaryColor"
                                value={formData.primaryColor}
                                onChange={handleChange}
                                disabled={isLoading}
                                className={`w-full h-10 p-1 rounded-md border disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 ${isDark
                                        ? 'bg-gray-700 border-gray-600'
                                        : 'bg-gray-50 border-[#dfd7bb]'
                                    }`}
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

                <div className={`pb-6 ${isDark ? 'border-b border-gray-700' : 'border-b border-[#dfd7bb]'
                    }`}>
                    <h2 className="text-xl font-semibold mb-4" style={{ color: getTextColor() }}>محتوى الصفحة الرئيسية</h2>
                    <div className="space-y-4">
                        <h3 className="font-semibold" style={{ color: isDark ? '#60a5fa' : '#c9a84c' }}>
                            قسم Hero
                        </h3>
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
                        <h3 className="font-semibold mt-4" style={{ color: isDark ? '#60a5fa' : '#c9a84c' }}>
                            قسم الخدمات
                        </h3>
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

                <div className={`pb-6 ${isDark ? 'border-b border-gray-700' : 'border-b border-[#dfd7bb]'
                    }`}>
                    <h2 className="text-xl font-semibold mb-4" style={{ color: getTextColor() }}>إعدادات SEO</h2>
                    <FormInput
                        label="عنوان الصفحة الرئيسية (SEO)"
                        name="seoTitle"
                        value={formData.seoTitle}
                        onChange={handleChange}
                        placeholder="عنوان SEO للموقع"
                    />
                    <div className="mt-4">
                        <label className="block text-sm font-medium mb-1" style={{ color: getMutedTextColor() }}>وصف الموقع (SEO)</label>
                        <textarea
                            name="seoDescription"
                            value={formData.seoDescription}
                            onChange={handleChange}
                            placeholder="وصف SEO للموقع"
                            rows={3}
                            disabled={isLoading}
                            className={`w-full rounded-md p-2 border disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 ${isDark
                                    ? 'bg-gray-700 border-gray-600 text-white'
                                    : 'bg-gray-50 border-[#dfd7bb] text-gray-800'
                                }`}
                        />
                    </div>
                </div>

                <div className={`pb-6 ${isDark ? 'border-b border-gray-700' : 'border-b border-[#dfd7bb]'
                    }`}>
                    <h2 className="text-xl font-semibold mb-4" style={{ color: getTextColor() }}>شريط الإعلانات</h2>
                    <FormInput
                        label="نص الإعلان"
                        name="announcement.text"
                        value={formData.announcement.text}
                        onChange={handleChange}
                        placeholder="🎉 إعلان خاص!"
                    />
                    <div className="mt-4">
                        <label className="flex items-center space-x-2 space-x-reverse" style={{ color: getTextColor() }}>
                            <input
                                type="checkbox"
                                name="announcement.isEnabled"
                                checked={formData.announcement.isEnabled}
                                onChange={handleChange}
                                disabled={isLoading}
                                className="form-checkbox rounded disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                            <span className={isLoading ? 'opacity-50' : ''}>تفعيل شريط الإعلانات</span>
                        </label>
                    </div>
                </div>

                <div className="pt-6 border-t" style={{
                    borderColor: isDark ? '#374151' : '#dfd7bb'
                }}>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`font-bold py-2 px-6 rounded-lg transition-all duration-300 ${isDark
                                ? 'bg-primary-600 hover:bg-primary-700 disabled:bg-gray-600 text-white'
                                : 'bg-[#c9a84c] hover:bg-[#b8973a] disabled:bg-gray-400 text-white shadow-md hover:shadow-lg disabled:shadow-none'
                            }`}
                    >
                        {isLoading ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SiteSettingsComponent;