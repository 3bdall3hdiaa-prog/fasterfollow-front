export type UserRole = 'user' | 'admin';
export type OrderStatus = 'pending' | 'In Progress' | 'completed' | 'cancelled' | 'failed' | 'Pending' | 'In progress' | 'Completed' | 'Cancelled' | 'Failed';
export type TransactionStatus = 'Completed' | 'Pending' | 'Failed';
export type TicketStatus = 'Open' | 'Answered' | 'Closed';
export type PostStatus = 'Published' | 'Draft';

export interface User {
    id: string;
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

export interface ServicePackage {
    _id?: string; // 👈 ده الـ ID اللي بيجي من MongoDB
    id?: number; // ID محلي في الواجهة فقط (اختياري)
    providerServiceId: number; // رقم الخدمة عند المزود
    provider: string; // ID الخاص بالمزود
    platform: string; // اسم المنصة (Instagram, YouTube...)
    title: string; // اسم الخدمة
    description?: string; // وصف الخدمة
    providerRate: number; // سعر المزود
    price: number; // سعر العميل
    min: number; // الحد الأدنى
    max: number; // الحد الأقصى
    type?: string; // نوع الخدمة (اختياري)
    status: boolean; // الحالة (نشطة / موقوفة)
    imageUrl?: string;
}



export interface Order {
    id: string;
    order_number: string;
    serviceTitle: string;
    providerOrderId: string;
    user: {
        id: string;
        username: string;
    };
    service: {
        id: number;
        title: string;
    };
    link: string;
    quantity: number;
    price: number;
    status: OrderStatus;
    createdAt: string;
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
    slug: string;
    excerpt: string;
    content: string; // HTML content
    imageUrl: string;
    author: string;
    publishedAt: string; // YYYY-MM-DD
    status: PostStatus;
    metaTitle?: string;
    metaDescription?: string;
}

export interface Banner {
    id: string;
    title: string;
    subtitle: string;
    ctaText: string;
    ctaLink: string;
    imageUrl: string;
    isActive: boolean;
}

export interface Platform {
    _id?: string;
    id: string;
    name: string;
    iconUrl: string;
}

export interface SiteSettings {
    siteName: string;
    logoUrl: string;
    faviconUrl: string;
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