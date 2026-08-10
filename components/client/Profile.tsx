import React, { useState, useEffect } from 'react';
import { useUser } from '../../contexts/UserContext';
import axios from 'axios';
import { useThemeStore } from '@/store/theme.store';
import { useAuthStore } from '@/store/auth.store';

const Profile: React.FC = () => {
    const { user } = useAuthStore();
    const { isDark } = useThemeStore();
    const [activeTab, setActiveTab] = useState('account');
    const [successMessage, setSuccessMessage] = useState('');
    const [is2FAEnabled, setIs2FAEnabled] = useState(false);
    console.log("the user is ", user)
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





    const showSuccess = (message: string) => {
        setSuccessMessage(message);
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    const TabButton: React.FC<{ tabName: string, label: string }> = ({ tabName, label }) => (
        <button
            onClick={() => setActiveTab(tabName)}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-all duration-300 ${activeTab === tabName
                ? isDark ? 'bg-primary-600 text-white' : 'bg-[#c9a84c] text-white shadow-md'
                : isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
        >
            {label}
        </button>
    );

    const AccountSettings = () => {
        const [email, setEmail] = useState(user?.email || 'user@example.com');

        async function handleupdate() {
            try {
                const res = await axios.patch(`${import.meta.env.VITE_API_URL}/user/update`, { email },
                    { withCredentials: true, headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } },);
                if (res) {
                    alert('  تم حفظ تغييرات الحساب بنجاح ! أعد التسجيل لتري التحديث');
                }
                window.location.reload();
            } catch (err) {
                alert('حدث خطأ. يرجى المحاولة مرة أخرى.');
            }
        }

        return (
            <form onSubmit={handleupdate} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: getMutedTextColor() }}>اسم المستخدم</label>
                    <input
                        type="text"
                        disabled
                        value={user?.username || ''}
                        className={`w-full rounded-md p-2 border cursor-not-allowed transition-all duration-300 ${isDark
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-gray-100 border-[#dfd7bb] text-gray-800'
                            }`}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: getMutedTextColor() }}>البريد الإلكتروني</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`w-full rounded-md p-2 border transition-all duration-300 ${isDark
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-gray-50 border-[#dfd7bb] text-gray-800'
                            }`}
                    />
                </div>
                <button
                    type="submit"
                    className={`font-bold py-2 px-6 rounded-lg transition-all duration-300 ${isDark
                        ? 'bg-primary-600 hover:bg-primary-700 text-white'
                        : 'bg-[#c9a84c] hover:bg-[#b8973a] text-white shadow-md hover:shadow-lg'
                        }`}
                >
                    حفظ التغييرات
                </button>
            </form>
        );
    };

    const SecuritySettings = () => {
        const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
        const [isLoading, setIsLoading] = useState(false);

        async function handlechangepassword(e: React.FormEvent) {
            e.preventDefault();

            if (passwords.new !== passwords.confirm) {
                alert('كلمة المرور الجديدة غير متطابقة.');
                return;
            }
            if (passwords.new.length < 3 && passwords.confirm.length < 3 && passwords.current.length < 3) {
                alert('كلمة المرور يجب ان تكون على الاقل 3 حروف');
                return;
            }

            try {
                const response = await axios.patch(
                    `${import.meta.env.VITE_API_URL}/user/updatepassword`,
                    {
                        currentPassword: passwords.current,
                        newPassword: passwords.new,
                        confirmPassword: passwords.confirm
                    }, { withCredentials: true }

                );

                if (response.data) {
                    alert('تم تحديث كلمة المرور بنجاح!');
                    setPasswords({ current: '', new: '', confirm: '' });
                }
            } catch (err: any) {
                console.error(err);
                alert(err.response?.data?.message || 'حدث خطأ. يرجى المحاولة مرة أخرى.');
            }
        }

        const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            setPasswords(prev => ({ ...prev, [e.target.name]: e.target.value }));
        };







        return (
            <div className="space-y-6">
                <form onSubmit={handlechangepassword} className="space-y-6">
                    <h3 className="text-lg font-semibold" style={{ color: getTextColor() }}>تغيير كلمة المرور</h3>
                    <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: getMutedTextColor() }}>كلمة المرور الحالية</label>
                        <input
                            type="password"
                            name="current"
                            value={passwords.current}
                            onChange={handleInputChange}
                            placeholder="••••••••"
                            className={`w-full rounded-md p-2 border transition-all duration-300 ${isDark
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-gray-50 border-[#dfd7bb] text-gray-800'
                                }`}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: getMutedTextColor() }}>كلمة المرور الجديدة</label>
                        <input
                            type="password"
                            name="new"
                            value={passwords.new}
                            onChange={handleInputChange}
                            placeholder="••••••••"
                            className={`w-full rounded-md p-2 border transition-all duration-300 ${isDark
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-gray-50 border-[#dfd7bb] text-gray-800'
                                }`}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: getMutedTextColor() }}>تأكيد كلمة المرور الجديدة</label>
                        <input
                            type="password"
                            name="confirm"
                            value={passwords.confirm}
                            onChange={handleInputChange}
                            placeholder="••••••••"
                            className={`w-full rounded-md p-2 border transition-all duration-300 ${isDark
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-gray-50 border-[#dfd7bb] text-gray-800'
                                }`}
                        />
                    </div>
                    <button
                        type="submit"
                        className={`font-bold py-2 px-6 rounded-lg transition-all duration-300 ${isDark
                            ? 'bg-primary-600 hover:bg-primary-700 text-white'
                            : 'bg-[#c9a84c] hover:bg-[#b8973a] text-white shadow-md hover:shadow-lg'
                            }`}
                    >
                        تحديث كلمة المرور
                    </button>
                </form>
                <hr className={isDark ? 'border-gray-700' : 'border-[#dfd7bb]'} />



            </div>
        );
    };

    return (
        <div className="p-4" style={{
            backgroundColor: isDark ? '#1e2235' : '#f8f6f0',
            minHeight: "100vh",
            transition: "all 0.3s ease"
        }}>
            <h1 className="text-2xl md:text-3xl font-bold mb-6" style={{ color: getTextColor() }}>الملف الشخصي</h1>
            <div className={`rounded-lg relative transition-all duration-300 ${isDark
                ? 'bg-gray-800 border border-gray-700'
                : 'bg-white border border-[#dfd7bb] shadow-md'
                }`}>
                {successMessage && (
                    <div className={`absolute top-4 right-4 text-sm px-4 py-2 rounded-md animate-fade-in-out ${isDark
                        ? 'bg-green-500/20 text-green-300'
                        : 'bg-green-50 border border-green-200 text-green-700'
                        }`}>
                        {successMessage}
                    </div>
                )}
                <div className={`p-4 border-b flex space-x-2 space-x-reverse ${isDark ? 'border-gray-700' : 'border-[#dfd7bb]'
                    }`}>
                    <TabButton tabName="account" label="إعدادات الحساب" />
                    <TabButton tabName="security" label="الأمان" />
                </div>
                <div className="p-6">
                    {activeTab === 'account' && <AccountSettings />}
                    {activeTab === 'security' && <SecuritySettings />}
                </div>
            </div>
        </div>
    );
};

export default Profile;