import React, { useState, useEffect } from 'react';
import { SiteSettings } from '../../types';

interface SiteSettingsProps {
    settings: SiteSettings;
    setSettings: React.Dispatch<React.SetStateAction<SiteSettings>>;
}

const SiteSettingsComponent: React.FC<SiteSettingsProps> = ({ settings, setSettings }) => {
    const [formData, setFormData] = useState(settings);
    const [successMessage, setSuccessMessage] = useState('');

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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSettings(formData);
        setSuccessMessage('تم حفظ الإعدادات بنجاح!');
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    const FormInput = ({ label, name, value, onChange }) => (
        <div>
            <label className="block text-sm font-medium mb-1">{label}</label>
            <input type="text" name={name} value={value} onChange={onChange} className="w-full bg-gray-700 rounded-md p-2 border border-gray-600" />
        </div>
    );

    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-6">إعدادات الموقع</h1>
            <form onSubmit={handleSubmit} className="bg-gray-800 border border-gray-700 rounded-lg p-6 space-y-6 max-w-4xl mx-auto relative">
                {successMessage && <div className="absolute top-4 left-4 bg-green-500/20 text-green-300 text-sm px-4 py-2 rounded-md animate-fade-in-out">{successMessage}</div>}

                <div className="border-b border-gray-700 pb-6">
                    <h2 className="text-xl font-semibold text-white mb-4">الإعدادات العامة</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormInput label="اسم الموقع" name="siteName" value={formData.siteName} onChange={handleChange} />
                        <FormInput label="رابط شعار الموقع (Logo)" name="logoUrl" value={formData.logoUrl} onChange={handleChange} />
                        <div>
                            <label className="block text-sm font-medium mb-1">اللون الأساسي</label>
                            <input type="color" name="primaryColor" value={formData.primaryColor} onChange={handleChange} className="w-full h-10 p-1 bg-gray-700 rounded-md border border-gray-600" />
                        </div>
                    </div>
                </div>

                <div className="border-b border-gray-700 pb-6">
                    <h2 className="text-xl font-semibold text-white mb-4">محتوى الصفحة الرئيسية</h2>
                    <div className="space-y-4">
                        <h3 className="font-semibold text-primary-400">قسم Hero</h3>
                        <FormInput label="العنوان الرئيسي" name="hero.title" value={formData.homepageContent.hero.title} onChange={handleContentChange} />
                        <FormInput label="العنوان الفرعي (الوصف)" name="hero.subtitle" value={formData.homepageContent.hero.subtitle} onChange={handleContentChange} />
                        <FormInput label="نص الزر الأول" name="hero.cta1" value={formData.homepageContent.hero.cta1} onChange={handleContentChange} />
                        <FormInput label="نص الزر الثاني" name="hero.cta2" value={formData.homepageContent.hero.cta2} onChange={handleContentChange} />
                         <h3 className="font-semibold text-primary-400 mt-4">قسم الخدمات</h3>
                         <FormInput label="عنوان قسم الخدمات" name="services.title" value={formData.homepageContent.services.title} onChange={handleContentChange} />
                         <FormInput label="الوصف المرافق لعنوان الخدمات" name="services.subtitle" value={formData.homepageContent.services.subtitle} onChange={handleContentChange} />
                    </div>
                </div>

                <div className="border-b border-gray-700 pb-6">
                    <h2 className="text-xl font-semibold text-white mb-4">إعدادات SEO</h2>
                     <FormInput label="عنوان الصفحة الرئيسية (SEO)" name="seoTitle" value={formData.seoTitle} onChange={handleChange} />
                     <div className="mt-4">
                        <label className="block text-sm font-medium mb-1">وصف الموقع (SEO)</label>
                        <textarea name="seoDescription" value={formData.seoDescription} onChange={handleChange} rows={3} className="w-full bg-gray-700 rounded-md p-2 border border-gray-600"></textarea>
                    </div>
                </div>

                <div>
                    <h2 className="text-xl font-semibold text-white mb-4">شريط الإعلانات</h2>
                    <FormInput label="نص الإعلان" name="announcement.text" value={formData.announcement.text} onChange={handleChange} />
                    <div className="mt-4">
                        <label className="flex items-center space-x-2 space-x-reverse">
                            <input type="checkbox" name="announcement.isEnabled" checked={formData.announcement.isEnabled} onChange={handleChange} className="form-checkbox" />
                            <span>تفعيل شريط الإعلانات</span>
                        </label>
                    </div>
                </div>

                <div className="pt-6 border-t border-gray-700">
                    <button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-6 rounded-lg">حفظ الإعدادات</button>
                </div>
            </form>
        </div>
    );
};

export default SiteSettingsComponent;