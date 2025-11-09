import React, { useState, useEffect } from 'react';
import { useUser } from '../../contexts/UserContext';
import axios from 'axios';

const Profile: React.FC = () => {
    const { user } = useUser();
    const [activeTab, setActiveTab] = useState('account');
    const [successMessage, setSuccessMessage] = useState('');
    const [is2FAEnabled, setIs2FAEnabled] = useState(false);

    // جلب حالة الـ 2FA عند تحميل المكون
    useEffect(() => {
        fetch2FAStatus();
    }, []);

    const fetch2FAStatus = async () => {
        try {
            const getuser = localStorage.getItem('user');
            if (getuser) {
                const userData = JSON.parse(getuser);
                // هنا ممكن تضيف endpoint علشان يجيب حالة الـ 2FA
                // أو استخدم البيانات المخزنة في الـ user
                if (userData.is2FA !== undefined) {
                    setIs2FAEnabled(userData.is2FA);
                }
            }
        } catch (error) {
            console.error('Error fetching 2FA status:', error);
        }
    };

    const showSuccess = (message: string) => {
        setSuccessMessage(message);
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    const TabButton: React.FC<{ tabName: string, label: string }> = ({ tabName, label }) => (
        <button
            onClick={() => setActiveTab(tabName)}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${activeTab === tabName ? 'bg-primary-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>
            {label}
        </button>
    );

    const AccountSettings = () => {
        const [email, setEmail] = useState(user?.email || 'user@example.com');

        async function handleupdate() {
            try {
                const token = await localStorage.getItem('token')
                const res = await axios.patch(`${import.meta.env.VITE_API_URL}/user/update`, { email },
                    { headers: { Authorization: `Bearer ${token}` } });
                if (res) {
                    alert('تم حفظ تغييرات الحساب بنجاح!');
                }
                window.location.reload();
            } catch (err) {
                alert('حدث خطأ. يرجى المحاولة مرة أخرى.');
            }
        }

        return (
            <form onSubmit={handleupdate} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium mb-1">اسم المستخدم</label>
                    <input type="text" disabled value={user?.username || ''} className="w-full bg-gray-700 rounded-md p-2 border border-gray-600 cursor-not-allowed" />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">البريد الإلكتروني</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-gray-700 rounded-md p-2 border border-gray-600" />
                </div>
                <button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-6 rounded-lg">حفظ التغييرات</button>
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
                const token = localStorage.getItem('token');
                const response = await axios.patch(
                    `${import.meta.env.VITE_API_URL}/user/updatepassword`,
                    {
                        currentPassword: passwords.current,
                        newPassword: passwords.new,
                        confirmPassword: passwords.confirm
                    },
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
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

        async function handle2FA() {
            setIsLoading(true);
            try {
                const getuser = localStorage.getItem('user');
                const userData = JSON.parse(getuser || '{}');
                const username = userData.username;

                const senddata = await axios.patch(`${import.meta.env.VITE_API_URL}/2FA`, { username, is2FA: !is2FAEnabled });

                if (senddata.data) {
                    // تحديث حالة الـ 2FA بناءً على الرد
                    const new2FAStatus = !is2FAEnabled; // قلب الحالة
                    setIs2FAEnabled(new2FAStatus);

                    // تحديث بيانات المستخدم في localStorage
                    const updatedUser = { ...userData, is2FA: new2FAStatus };
                    localStorage.setItem('user', JSON.stringify(updatedUser));

                    // إظهار الرسالة المناسبة
                    if (new2FAStatus) {
                        alert('تم تفعيل المصادقة الثنائية بنجاح!');
                    } else {
                        alert('تم تعطيل المصادقة الثنائية بنجاح!');
                    }
                } else {
                    alert('حدث خطأ يرجى المحاولة مرة أخرى');
                }
            } catch (error: any) {
                console.error('2FA Error:', error);
                alert(error.response?.data?.message || 'حدث خطأ يرجى المحاولة مرة أخرى');
            } finally {
                setIsLoading(false);
            }
        }

        // تحديد النص واللون بناءً على حالة الـ 2FA
        const get2FAButtonText = () => {
            return is2FAEnabled ? 'تعطيل' : 'تفعيل';
        };

        const get2FAButtonColor = () => {
            return is2FAEnabled
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-green-600 hover:bg-green-700';
        };

        const get2FAStatusText = () => {
            return is2FAEnabled
                ? 'مفعلة. سيتم إرسال كود تحقق إلى بريدك الإلكتروني عند تسجيل الدخول.'
                : 'غير مفعلة. قم بتفعيلها لزيادة أمان حسابك.';
        };

        return (
            <div className="space-y-6">
                <form onSubmit={handlechangepassword} className="space-y-6">
                    <h3 className="text-lg font-semibold text-white">تغيير كلمة المرور</h3>
                    <div>
                        <label className="block text-sm font-medium mb-1">كلمة المرور الحالية</label>
                        <input type="password" name="current" value={passwords.current} onChange={handleInputChange} placeholder="••••••••" className="w-full bg-gray-700 rounded-md p-2 border border-gray-600" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">كلمة المرور الجديدة</label>
                        <input type="password" name="new" value={passwords.new} onChange={handleInputChange} placeholder="••••••••" className="w-full bg-gray-700 rounded-md p-2 border border-gray-600" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">تأكيد كلمة المرور الجديدة</label>
                        <input type="password" name="confirm" value={passwords.confirm} onChange={handleInputChange} placeholder="••••••••" className="w-full bg-gray-700 rounded-md p-2 border border-gray-600" />
                    </div>
                    <button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-6 rounded-lg">تحديث كلمة المرور</button>
                </form>
                <hr className="border-gray-700" />
                <h3 className="text-lg font-semibold text-white">المصادقة الثنائية (2FA)</h3>
                <div className="bg-gray-700/50 p-4 rounded-lg flex items-center justify-between">
                    <div>
                        <p className="font-medium text-white">حالة المصادقة الثنائية</p>
                        <p className="text-sm text-gray-400">{get2FAStatusText()}</p>
                    </div>
                    <button
                        onClick={handle2FA}
                        disabled={isLoading}
                        className={`${get2FAButtonColor()} text-white font-bold py-2 px-4 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {isLoading ? 'جاري المعالجة...' : get2FAButtonText()}
                    </button>
                </div>

                {/* رسالة تأكيد إضافية */}
                {is2FAEnabled && (
                    <div className="bg-blue-600/20 border border-blue-500/50 p-3 rounded-lg">
                        <p className="text-sm text-blue-300">
                            ⚠️ المصادقة الثنائية مفعلة. عند تسجيل الدخول سيتم إرسال كود تحقق إلى بريدك الإلكتروني.
                        </p>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-6">الملف الشخصي</h1>
            <div className="bg-gray-800 border border-gray-700 rounded-lg relative">
                {successMessage && <div className="absolute top-4 right-4 bg-green-500/20 text-green-300 text-sm px-4 py-2 rounded-md animate-fade-in-out">{successMessage}</div>}
                <div className="p-4 border-b border-gray-700 flex space-x-2 space-x-reverse">
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