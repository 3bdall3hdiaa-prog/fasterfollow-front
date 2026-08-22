export type UserRole = 'user' | 'admin';
export type OrderStatus = 'pending' | 'In Progress' | 'completed' | 'cancelled' | 'failed' | 'Pending' | 'In progress' | 'Completed' | 'Cancelled' | 'Failed';
export type TransactionStatus = 'Completed' | 'Pending' | 'Failed';
export type TicketStatus = 'Open' | 'Answered' | 'Closed';
export type PostStatus = 'Published' | 'Draft';

export interface User {
    id: string;
    _id?: string;
    username: string;
    role: UserRole;
    balance: number;
    email?: string;
    password?: string; // For authentication database
    status: 'Active' | 'Banned';
    createdAt: string; // YYYY-MM-DD
    affiliateCode: string;
    commissionRate: number; // e.g., 0.15 for 15%
    affiliateEarnings: {
        total: number;
        pending: number;
        withdrawn: number;
    };
}

// export interface ServiceForm {
//     _id?: string; // 👈 ده الـ ID اللي بيجي من MongoDB
//     id?: number; // ID محلي في الواجهة فقط (اختياري)
//     providerServiceId: number; // رقم الخدمة عند المزود
//     provider: { _id: string; name: string }; // ID الخاص بالمزود
//     platform: string; // اسم المنصة (Instagram, YouTube...)
//     title: string; // اسم الخدمة
//     description?: string; // وصف الخدمة
//     providerRate: number; // سعر المزود
//     price: number; // سعر العميل
//     min: number; // الحد الأدنى
//     max: number; // الحد الأقصى
//     type?: string; // نوع الخدمة (اختياري)
//     status: boolean; // الحالة (نشطة / موقوفة)
//    
//     discount_for_greater_than_100000?: string;
//     discount_for_greater_than_4000?: string;
//     discount_for_4000?: string;
//     discount_for_3000?: string;
//     discount_for_2000?: string;
// }
export interface ServiceResponse {
    _id?: string; // 👈 ده الـ ID اللي بيجي من MongoDB
    id?: number; // ID محلي في الواجهة فقط (اختياري)
    providerServiceId: number; // رقم الخدمة عند المزود
    provider: { _id: string; name: string, apiKey: string, apiEndpoint: string }; // ID الخاص بالمزود
    platform: string; // اسم المنصة (Instagram, YouTube...)
    title: string; // اسم الخدمة
    description?: string; // وصف الخدمة
    providerRate: number; // سعر المزود
    price: number; // سعر العميل
    min: number; // الحد الأدنى
    max: number; // الحد الأقصى
    type?: string; // نوع الخدمة (اختياري)
    status: boolean; // الحالة (نشطة / موقوفة)
    image?: {
        url: string;
        public_id: string;
    };
    discount_for_greater_than_100000?: string;
    discount_for_greater_than_4000?: string;
    discount_for_4000?: string;
    discount_for_3000?: string;
    discount_for_2000?: string;
}



export interface Order {
    id: string;
    _id?: string;
    selectedCategory: string;
    serviceId: any;
    serviceTitle: string;
    providerOrderId: string;
    id_user: {
        id: string;
        username: string;
    };
    provider: {
        title: string;
        apiKey: string;
        apiEndpoint: string;
    };
    link: string;
    quantity: number;
    price: number;
    status: OrderStatus;
    createdAt: string;
    username: string
    totalCost: number;
}

export interface Transaction {
    id: string;
    amount: number;
    method: string;
    status: TransactionStatus;
    createdAt: string; // YYYY-MM-DD
}

export interface ChatMessage {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    isLoading?: boolean;
}

export interface Page {
    _id?: string;
    id: string;
    title: string;
    slug: string;
    content: string; // HTML content
    isPublished: boolean;
    createdAt: string; // YYYY-MM-DD
}

export interface Notification {
    id: number;
    text: string;
    isRead: boolean;
    createdAt: string; // e.g., 'قبل 5 دقائق'
}

export interface TicketMessage {
    sender: 'user' | 'admin';
    text: string;
    time: string;
}

export interface SupportTicket {
    id: string;
    user: { username: string };
    subject: string;
    status: TicketStatus;
    createdAt: string; // YYYY-MM-DD
    lastUpdate: string; // YYYY-MM-DD
    messages: TicketMessage[];
}

export type ReferralStatus = 'Active' | 'Pending';
export type PayoutStatus = 'Completed' | 'Pending' | 'Failed';

export interface AffiliateReferral {
    id: string;
    referredUsername: string;
    signupDate: string;
    totalSpent: number;
    commissionEarned: number;
    status: ReferralStatus;
}

export interface AffiliatePayout {
    id: string;
    amount: number;
    method: string;
    status: PayoutStatus;
    requestedAt: string;
    completedAt?: string;
}

export interface Provider {
    _id?: string; // 👈 ده الـ ID اللي بيجي من MongoDB
    id: string;
    name: string;
    apiEndpoint: string;
    apiKey: string;
    status: 'Active' | 'Inactive';
    balance?: number;
}

export interface BlogPost {
    id: string;
    title: string;
    link: string;
    excerpt: string;
    content: string; // HTML content
    urlimage: string;
    author: string;
    publishedAt: string; // YYYY-MM-DD
    status: PostStatus;
    metaTitle?: string;
    metaDescription?: string;
}

export interface BannerResponse {
    _id?: string;
    id?: string;
    title: string;
    subtitle: string;
    ctaText: string;
    ctaLink: string;
    image?: {
        url: string;
        public_id: string;
    };
    isActive: boolean;
}
// في ملف types.ts
export interface BannerFormData {
    title: string;
    subtitle: string;
    ctaText: string;
    ctaLink: string;
    file?: File | string;  // ✅ يقبل الاثنين
    isActive: boolean;
}

export interface Platform {
    _id: string;
    name: string;
    image?: {
        url: string;
        public_id: string;
    }
    slug: string;

}


export interface SiteSettings {
    siteName: string;
    logo?: {
        url: string;
        public_id: string;
    };
    file?: File
    primaryColor: string;
    seoTitle: string;
    seoDescription: string;
    announcement: {
        text: string;
        isEnabled: boolean;
    };
    homepageContent: {
        hero: {
            title: string;
            subtitle: string;
            cta1: string;
            cta2: string;
        };
        features: {
            title: string;
            items: { icon: string; title: string; description: string }[];
        };
        services: {
            title: string;
            subtitle: string;
        };
        howItWorks: {
            title: string;
            subtitle: string;
            steps: { title: string; description: string }[];
        };
        testimonials: {
            title: string;
            subtitle: string;
        };
    };
}