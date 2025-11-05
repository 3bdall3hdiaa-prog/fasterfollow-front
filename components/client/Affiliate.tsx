import React, { useState } from 'react';
import { useUser } from '../../contexts/UserContext';
import { AffiliateReferral, ReferralStatus, AffiliatePayout, PayoutStatus } from '../../types';

// Mock Data
const mockReferrals: AffiliateReferral[] = [
    // { id: 'REF001', referredUsername: 'user_one', signupDate: '2024-07-20', totalSpent: 150, commissionEarned: 22.50, status: 'Active' },
    // { id: 'REF002', referredUsername: 'another_user', signupDate: '2024-07-15', totalSpent: 50, commissionEarned: 7.50, status: 'Active' },
    // { id: 'REF003', referredUsername: 'newbie', signupDate: '2024-07-28', totalSpent: 0, commissionEarned: 0, status: 'Pending' },
];

const mockPayouts: AffiliatePayout[] = [
    // { id: 'PAY001', amount: 50.00, method: 'PayPal', status: 'Completed', requestedAt: '2024-07-10', completedAt: '2024-07-11' },
    // { id: 'PAY002', amount: 45.50, method: 'Bank Transfer', status: 'Completed', requestedAt: '2024-06-25', completedAt: '2024-06-27' },
    // { id: 'PAY003', amount: 30.00, method: 'PayPal', status: 'Pending', requestedAt: '2024-07-28' },
];

// Status Badge Components
const ReferralStatusBadge: React.FC<{ status: ReferralStatus }> = ({ status }) => {
    const statusClasses = {
        Active: 'bg-green-900 text-green-300',
        Pending: 'bg-yellow-900 text-yellow-300',
    };
    return <span className={`px-2 py-1 text-xs rounded-full ${statusClasses[status]}`}>{status}</span>;
};

const PayoutStatusBadge: React.FC<{ status: PayoutStatus }> = ({ status }) => {
    const statusClasses = {
        Completed: 'bg-green-900 text-green-300',
        Pending: 'bg-yellow-900 text-yellow-300',
        Failed: 'bg-red-900 text-red-300',
    };
    return <span className={`px-2 py-1 text-xs rounded-full ${statusClasses[status]}`}>{status}</span>;
};

const Affiliate: React.FC = () => {
    const { user } = useUser();
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState('referrals');
    const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);

    if (!user) return null;

    const referralLink = `https://yoursite.com/register?ref=${user.affiliateCode}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const commissionRatePercent =
        typeof user?.commissionRate === 'number'
            ? (user.commissionRate * 100).toFixed(0)
            : '0';

    const totalEarnings =
        typeof user?.affiliateEarnings?.total === 'number'
            ? user.affiliateEarnings.total
            : 0;

    const withdrawnEarnings =
        typeof user?.affiliateEarnings?.withdrawn === 'number'
            ? user.affiliateEarnings.withdrawn
            : 0;

    const withdrawableBalance = totalEarnings - withdrawnEarnings;

    const handleRequestPayout = () => {
        alert(
            `تم إرسال طلب سحب بمبلغ ${withdrawableBalance > 0 ? withdrawableBalance.toFixed(2) : '0.00'
            }$ بنجاح. ستتم مراجعته قريباً.`
        );
        setIsPayoutModalOpen(false);
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-6">نظام الإحالة</h1>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="إجمالي الأرباح"
                    value={`$${totalEarnings.toFixed(2)}`}
                />
                <StatCard
                    title="إجمالي المسجلين"
                    value={mockReferrals.length.toString()}
                />
                <StatCard
                    title="نسبة العمولة"
                    value={`${commissionRatePercent}%`}
                />
                <StatCard
                    title="الأرباح المسحوبة"
                    value={`$${withdrawnEarnings.toFixed(2)}`}
                />
            </div>

            {/* Referral Link Section */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-8">
                <h2 className="text-xl font-semibold text-white mb-4">
                    رابط الإحالة الخاص بك
                </h2>
                <p className="text-gray-400 mb-4 text-sm">
                    شارك هذا الرابط مع أصدقائك واكسب عمولة بنسبة{' '}
                    {commissionRatePercent}% على كل عملية شراء يقومون بها!
                </p>
                <div className="relative flex items-center">
                    <input
                        type="text"
                        readOnly
                        value={referralLink}
                        className="w-full bg-gray-900/50 border border-gray-600 text-gray-300 rounded-lg p-3 pl-4 pr-24 font-mono text-sm"
                    />
                    <button
                        onClick={handleCopy}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-md text-sm transition-colors"
                    >
                        {copied ? 'تم النسخ!' : 'نسخ'}
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg">
                <div className="p-4 border-b border-gray-700 flex space-x-2 space-x-reverse">
                    <button
                        onClick={() => setActiveTab('referrals')}
                        className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${activeTab === 'referrals'
                            ? 'bg-primary-600 text-white'
                            : 'text-gray-300 hover:bg-gray-700'
                            }`}
                    >
                        المسجلون عن طريقك
                    </button>
                    <button
                        onClick={() => setActiveTab('payouts')}
                        className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${activeTab === 'payouts'
                            ? 'bg-primary-600 text-white'
                            : 'text-gray-300 hover:bg-gray-700'
                            }`}
                    >
                        سجل السحوبات
                    </button>
                </div>

                {/* Referrals Table */}
                {activeTab === 'referrals' && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-right text-gray-300">
                            <thead className="text-xs text-gray-400 uppercase bg-gray-700/50">
                                <tr>
                                    <th className="px-4 py-3">اسم المستخدم</th>
                                    <th className="px-4 py-3">تاريخ التسجيل</th>
                                    <th className="px-4 py-3">إجمالي الإنفاق</th>
                                    <th className="px-4 py-3">العمولة المكتسبة</th>
                                    <th className="px-4 py-3">الحالة</th>
                                </tr>
                            </thead>
                            <tbody>
                                {mockReferrals.map((ref) => (
                                    <tr
                                        key={ref.id}
                                        className="border-b border-gray-700 last:border-0 hover:bg-gray-700/50"
                                    >
                                        <td className="px-4 py-4 text-white font-medium">
                                            {ref.referredUsername}
                                        </td>
                                        <td className="px-4 py-4">{ref.signupDate}</td>
                                        <td className="px-4 py-4">
                                            ${ref.totalSpent.toFixed(2)}
                                        </td>
                                        <td className="px-4 py-4 text-green-400 font-semibold">
                                            ${ref.commissionEarned.toFixed(2)}
                                        </td>
                                        <td className="px-4 py-4">
                                            <ReferralStatusBadge status={ref.status} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Payouts Table */}
                {activeTab === 'payouts' && (
                    <div>
                        <div className="p-4 border-b border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4">
                            <div>
                                <span className="text-gray-400">
                                    الرصيد القابل للسحب:{' '}
                                </span>
                                <span className="text-xl font-bold text-primary-400">
                                    ${withdrawableBalance.toFixed(2)}
                                </span>
                            </div>
                            <button
                                onClick={() => setIsPayoutModalOpen(true)}
                                className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={withdrawableBalance < 50}
                            >
                                طلب سحب (الحد الأدنى 50$)
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-right text-gray-300">
                                <thead className="text-xs text-gray-400 uppercase bg-gray-700/50">
                                    <tr>
                                        <th className="px-4 py-3">المبلغ</th>
                                        <th className="px-4 py-3">الطريقة</th>
                                        <th className="px-4 py-3">تاريخ الطلب</th>
                                        <th className="px-4 py-3">تاريخ الإكمال</th>
                                        <th className="px-4 py-3">الحالة</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {mockPayouts.map((payout) => (
                                        <tr
                                            key={payout.id}
                                            className="border-b border-gray-700 last:border-0 hover:bg-gray-700/50"
                                        >
                                            <td className="px-4 py-4 text-white font-medium">
                                                ${payout.amount.toFixed(2)}
                                            </td>
                                            <td className="px-4 py-4">{payout.method}</td>
                                            <td className="px-4 py-4">{payout.requestedAt}</td>
                                            <td className="px-4 py-4">
                                                {payout.completedAt || '-'}
                                            </td>
                                            <td className="px-4 py-4">
                                                <PayoutStatusBadge status={payout.status} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Payout Modal */}
            {isPayoutModalOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
                    onClick={() => setIsPayoutModalOpen(false)}
                >
                    <div
                        className="bg-gray-800 text-white rounded-2xl shadow-xl w-full max-w-md"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6">
                            <h3 className="text-xl font-bold mb-4 text-center">
                                تأكيد طلب السحب
                            </h3>
                            <p className="text-center text-gray-400 mb-6">
                                سيتم إرسال طلب لسحب أرباحك القابلة للسحب.
                            </p>
                            <div className="bg-gray-700/50 p-4 rounded-lg text-center mb-6">
                                <p className="text-gray-400 text-sm">المبلغ</p>
                                <p className="text-3xl font-bold text-primary-400">
                                    ${withdrawableBalance.toFixed(2)}
                                </p>
                                <p className="text-xs text-gray-500 mt-2">
                                    سيتم إرسال المبلغ إلى وسيلة الدفع المسجلة لديك.
                                </p>
                            </div>
                        </div>
                        <div className="bg-gray-700/50 px-6 py-4 flex justify-end space-x-3 space-x-reverse rounded-b-2xl">
                            <button
                                onClick={() => setIsPayoutModalOpen(false)}
                                className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg"
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={handleRequestPayout}
                                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg"
                            >
                                تأكيد وإرسال الطلب
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// A simplified StatCard for this component
const StatCard: React.FC<{ title: string; value: string }> = ({ title, value }) => (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-5">
        <p className="text-sm text-gray-400 font-medium">{title}</p>
        <p className="text-2xl font-bold text-white mt-1">{value}</p>
    </div>
);

export default Affiliate;
