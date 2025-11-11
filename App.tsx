import React, { useState, useEffect, useRef } from 'react';
// import 'bootstrap/dist/css/bootstrap.min.css';

import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import Services from './components/Services';
import HowItWorks from './components/HowItWorks';
import Testimonials from './components/Testimonials';
import Footer from './components/Footer';
import Chatbot from './components/Chatbot';
import AdminPanel from './components/AdminPanel';
import ClientPanel from './components/ClientPanel';
import Blog from './components/Blog';
import BlogPost from './components/BlogPost';
import PageView from './components/PageView';
import Banners from './components/Banners';

import { useUser } from './contexts/UserContext';
import { useSEO } from './hooks/useSEO';
import { Page, BlogPost as BlogPostType, ServicePackage, Provider, Banner, SiteSettings, Platform } from './types';
import axios from 'axios';

// MOCK DATA - Placed here to avoid creating new files
const mockServices: ServicePackage[] = [
];

const mockBlogPosts: BlogPostType[] = [
    { id: '1', title: '5 نصائح لزيادة متابعينك على انستغرام', slug: 'increase-instagram-followers', excerpt: 'تعلم أفضل الاستراتيجيات لزيادة عدد متابعينك بشكل طبيعي وفعال على منصة انستغرام.', content: '<h2>مقدمة</h2><p>هنا محتوى المقال الكامل...</p>', imageUrl: 'https://images.unsplash.com/photo-1611162617213-6d22e7a3c7ba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80', author: 'Admin', publishedAt: '2024-07-20', status: 'Published', metaTitle: 'نصائح لزيادة متابعين انستغرام', metaDescription: 'أفضل 5 نصائح لزيادة متابعينك على انستغرام في عام 2024.' },
    { id: '2', title: 'كيف تصبح مشهوراً على تيك توك؟', slug: 'become-famous-on-tiktok', excerpt: 'استكشف أسرار خوارزمية تيك توك وكيفية إنشاء محتوى ينتشر بسرعة البرق.', content: '<h2>مقدمة</h2><p>هنا محتوى المقال الكامل...</p>', imageUrl: 'https://images.unsplash.com/photo-1611605698335-8b1569810432?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80', author: 'Admin', publishedAt: '2024-07-15', status: 'Published' },
];

const mockProviders: Provider[] = [
    { id: 'prov_1', name: 'InstaBoost API', apiEndpoint: 'https://instaboost.com/api/v2', apiKey: 'key_12345', status: 'Active', balance: 1500.75 },
    { id: 'prov_2', name: 'TikFast Services', apiEndpoint: 'https://tikfast.net/api', apiKey: 'key_67890', status: 'Active', balance: 850.20 },
    { id: 'prov_3', name: 'TweetGrow API', apiEndpoint: 'https://tweetgrow.io/api', apiKey: 'key_abcde', status: 'Inactive' },
    { id: 'prov_4', name: 'TubeUp Services', apiEndpoint: 'https://tubeup.com/api', apiKey: 'key_fghij', status: 'Active', balance: 2100.00 },
];

const mockPlatforms: Platform[] = [
    { id: '1', name: 'Instagram', iconUrl: '📸' },
    { id: '2', name: 'TikTok', iconUrl: '🎵' },
    { id: '3', name: 'Twitter', iconUrl: '🐦' },
    { id: '4', name: 'YouTube', iconUrl: '▶️' },
    { id: '5', name: 'Facebook', iconUrl: '👍' },
]

const Redirector: React.FC<{ message: string; to?: string }> = ({ message, to = '/' }) => {
    useEffect(() => {
        window.location.hash = to;
    }, [to]);
    return <div className="text-center pt-40">{message}</div>;
};

type View = 'home' | 'page' | 'blog' | 'blogPost' | 'client' | 'admin';
type AppView = {
    view: View;
    slug?: string;
};

const App: React.FC = () => {
    const { user } = useUser();
    const [appView, setAppView] = useState<AppView>({ view: 'home' });
    const prevUser = useRef(user);

    // Mock data state
    const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
    const [services, setServices] = useState<ServicePackage[]>([]); // Empty array initially
    const [pages, setPages] = useState<Page[]>([]); // Empty array initially
    const [posts, setPosts] = useState<BlogPostType[]>(mockBlogPosts);
    const [providers, setProviders] = useState<Provider[]>(mockProviders);
    const [banners, setBanners] = useState<Banner[]>([]); // Empty array initially
    const [platforms, setPlatforms] = useState<Platform[]>();
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPlatforms = async () => {
            try {
                const storedProviders = await axios.get(`${import.meta.env.VITE_API_URL}/manageplatforms`);
                // const data = {
                //     _id: storedProviders.data._id,
                //     id: storedProviders.data.id,
                //     name: storedProviders.data.name,
                //     iconUrl: storedProviders.data.iconUrl
                // };
                // console.log(data);

                setPlatforms(storedProviders.data);
            } catch (error) {
                console.error('Error fetching platforms:', error);
            }
        };

        fetchPlatforms();
    }, []);


    // Function to fetch site settings from endpoint
    const fetchSiteSettingsFromEndpoint = async () => {
        try {
            setError(null);
            const response = await fetch(`${import.meta.env.VITE_API_URL}/manage-setting`);

            if (!response.ok) {
                throw new Error(`Failed to fetch site settings: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            // Transform the API data to match the SiteSettings type
            const formattedSiteSettings: SiteSettings = {
                siteName: data[0].siteName || '',
                logoUrl: data[0].logoUrl || 'https://i.imgur.com/3Z4Qj4a.png',
                faviconUrl: data[0].faviconUrl || '/favicon.ico',
                primaryColor: data[0].primaryColor || '#6366f1',
                seoTitle: data[0].seoTitle || 'فاستر فولو - أفضل خدمات دعم حسابات التواصل الاجتماعي',
                seoDescription: data[0].seoDescription || 'زيادة متابعين، لايكات، ومشاهدات لجميع المنصات. أسعار تنافسية وجودة عالية.',
                announcement: data.announcement || {
                    text: data[0].announcement.text || '🎉 خصم 15% على جميع خدمات انستغرام لفترة محدودة!',
                    isEnabled: data[0].announcement.isEnabled || true,
                },
                homepageContent: data.homepageContent || {
                    hero: {
                        title: data[0].homepageContent.hero.title || 'عزز حضورك الرقمي مع',
                        subtitle: data[0].homepageContent.hero.subtitle || 'نقدم لك أفضل خدمات الدعم لشبكات التواصل الاجتماعي لزيادة متابعينك وتفاعلك بأسعار تنافسية وجودة عالية.',
                        cta1: data[0].homepageContent.hero.cta1 || 'اكتشف خدماتنا',
                        cta2: data[0].homepageContent.hero.cta2 || 'كيف نعمل؟'
                    },
                    features: {
                        title: 'لماذا تختارنا؟',
                        items: [
                            { icon: '⚡️', title: 'تنفيذ فوري', description: 'تبدأ طلباتك في التنفيذ فور إتمام عملية الدفع مباشرة لضمان سرعة الخدمة.' },
                            { icon: '🛡️', title: 'جودة عالية وضمان', description: 'نقدم متابعين وحسابات عالية الجودة مع ضمان تعويض النقص في بعض الخدمات.' },
                            { icon: '💵', title: 'أسعار تنافسية', description: 'نوفر لك أفضل الأسعار في السوق لتتمكن من تحقيق أهدافك بأقل تكلفة ممكنة.' },
                            { icon: '🎧', title: 'دعم فني 24/7', description: 'فريق دعم فني متخصص جاهز للإجابة على استفساراتك وحل مشاكلك في أي وقت.' }
                        ]
                    },
                    services: {
                        title: data[0].homepageContent.services.title || 'خدماتنا المميزة',
                        subtitle: data[0].homepageContent.services.subtitle || 'اختر الباقة التي تناسب احتياجاتك وابدأ في تنمية حسابك اليوم.'
                    },
                    howItWorks: {
                        title: 'كيف يعمل الموقع؟',
                        subtitle: 'ثلاث خطوات بسيطة تفصلك عن تحقيق أهدافك.',
                        steps: [
                            { title: 'اختر الخدمة', description: 'تصفح خدماتنا المتنوعة واختر الباقة التي تناسب أهدافك وميزانيتك.' },
                            { title: 'أدخل معلوماتك', description: 'أضف رابط حسابك أو المنشور الذي تريد دعمه. لا نطلب كلمة المرور أبداً.' },
                            { title: 'شاهد النتائج', description: 'استرخ وشاهد حسابك ينمو. تبدأ النتائج بالظهور في وقت قصير جداً.' }
                        ]
                    },
                    testimonials: {
                        title: 'آراء عملائنا',
                        subtitle: 'ماذا يقول عملاؤنا عن خدماتنا.'
                    }
                }
            };

            setSiteSettings(formattedSiteSettings);
        } catch (error) {
            console.error('Error fetching site settings:', error);
            setError('فشل في تحميل إعدادات الموقع. يرجى المحاولة مرة أخرى.');
            // Use default settings if fetch fails
            setSiteSettings({
                siteName: 'فاستر فولو',
                logoUrl: 'https://i.imgur.com/3Z4Qj4a.png',
                faviconUrl: '/favicon.ico',
                primaryColor: '#6366f1',
                seoTitle: 'فاستر فولو - أفضل خدمات دعم حسابات التواصل الاجتماعي',
                seoDescription: 'زيادة متابعين، لايكات، ومشاهدات لجميع المنصات. أسعار تنافسية وجودة عالية.',
                announcement: {
                    text: '🎉 خصم 15% على جميع خدمات انستغرام لفترة محدودة!',
                    isEnabled: true,
                },
                homepageContent: {
                    hero: {
                        title: 'عزز حضورك الرقمي مع',
                        subtitle: 'نقدم لك أفضل خدمات الدعم لشبكات التواصل الاجتماعي لزيادة متابعينك وتفاعلك بأسعار تنافسية وجودة عالية.',
                        cta1: 'اكتشف خدماتنا',
                        cta2: 'كيف نعمل؟'
                    },
                    features: {
                        title: 'لماذا تختارنا؟',
                        items: [
                            { icon: '⚡️', title: 'تنفيذ فوري', description: 'تبدأ طلباتك في التنفيذ فور إتمام عملية الدفع مباشرة لضمان سرعة الخدمة.' },
                            { icon: '🛡️', title: 'جودة عالية وضمان', description: 'نقدم متابعين وحسابات عالية الجودة مع ضمان تعويض النصف في بعض الخدمات.' },
                            { icon: '💵', title: 'أسعار تنافسية', description: 'نوفر لك أفضل الأسعار في السوق لتتمكن من تحقيق أهدافك بأقل تكلفة ممكنة.' },
                            { icon: '🎧', title: 'دعم فني 24/7', description: 'فريق دعم فني متخصص جاهز للإجابة على استفساراتك وحل مشاكلك في أي وقت.' }
                        ]
                    },
                    services: {
                        title: 'خدماتنا المميزة',
                        subtitle: 'اختر الباقة التي تناسب احتياجاتك وابدأ في تنمية حسابك اليوم.'
                    },
                    howItWorks: {
                        title: 'كيف يعمل الموقع؟',
                        subtitle: 'ثلاث خطوات بسيطة تفصلك عن تحقيق أهدافك.',
                        steps: [
                            { title: 'اختر الخدمة', description: 'تصفح خدماتنا المتنوعة واختر الباقة التي تناسب أهدافك وميزانيتك.' },
                            { title: 'أدخل معلوماتك', description: 'أضف رابط حسابك أو المنشور الذي تريد دعمه. لا نطلب كلمة المرور أبداً.' },
                            { title: 'شاهد النتائج', description: 'استرخ وشاهد حسابك ينمو. تبدأ النتائج بالظهور في وقت قصير جداً.' }
                        ]
                    },
                    testimonials: {
                        title: 'آراء عملائنا',
                        subtitle: 'ماذا يقول عملاؤنا عن خدماتنا.'
                    }
                }
            });
        }
    };

    // Function to fetch pages from endpoint
    const fetchPagesFromEndpoint = async () => {
        try {
            setError(null);
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/managepages`);

            if (!response.ok) {
                throw new Error(`Failed to fetch pages: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            // Transform the API data to match the Page type
            const formattedPages: Page[] = data.map((page: any) => ({
                id: page._id || page.id?.toString() || Math.random().toString(),
                title: page.title || 'Untitled',
                slug: page.slug || page.title?.toLowerCase().replace(/\s+/g, '-'),
                content: page.content || '<p>No content available</p>',
                isPublished: page.isPublished !== undefined ? page.isPublished : true,
                createdAt: page.createdAt || new Date().toISOString().split('T')[0]
            }));

            setPages(formattedPages);
        } catch (error) {
            console.error('Error fetching pages:', error);
            setError('فشل في تحميل الصفحات. يرجى المحاولة مرة أخرى.');
        }
    };

    // Function to fetch services from endpoint
    const fetchServicesFromEndpoint = async () => {
        try {
            setError(null);
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/services-list`);

            if (!response.ok) {
                throw new Error(`Failed to fetch services: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            // Transform the API data to match the ServicePackage type
            const formattedServices: ServicePackage[] = data.map((service: any) => ({
                id: service._id || service.id?.toString() || Math.random().toString(),
                title: service.title || 'Untitled',
                name: service.title || 'Unnamed Service',
                description: service.description || 'No description available',
                price: service.price || 0,
                originalPrice: service.price || 0, // نفس السعر إذا مفيش original price
                platform: service.platform || 'Unknown',
                isActive: service.status !== undefined ? service.status : true,
                minOrder: service.min || 1,
                maxOrder: service.max || 1000,
                provider: service.provider || 'Unknown Provider',
                providerServiceId: service.providerServiceId || '',
                providerRate: service.providerRate || 0,
                imageUrl: service.imageUrl || '',
                createdAt: service.createdAt ? new Date(service.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                updatedAt: service.updatedAt || ''
            }));

            setServices(formattedServices);
        } catch (error) {
            console.error('Error fetching services:', error);
            setError('فشل في تحميل الخدمات. يرجى المحاولة مرة أخرى.');
        }
    };

    // Function to fetch banners from endpoint
    const fetchBannersFromEndpoint = async () => {
        try {
            setError(null);
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/managepanners`);

            if (!response.ok) {
                throw new Error(`Failed to fetch banners: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            // Transform the API data to match the Banner type
            const formattedBanners: Banner[] = data.map((banner: any) => ({
                id: banner._id || banner.id?.toString() || Math.random().toString(),
                title: banner.title || 'No Title',
                subtitle: banner.subtitle || '',
                ctaText: banner.ctaText || 'اطلب الآن',
                ctaLink: banner.ctaLink || '#',
                imageUrl: banner.imageUrl || 'https://images.unsplash.com/photo-1611605698335-8b1569810432?auto=format&fit=crop&w=1000&q=80',
                isActive: banner.isActive !== undefined ? banner.isActive : true
            }));

            setBanners(formattedBanners);
        } catch (error) {
            console.error('Error fetching banners:', error);
            setError('فشل في تحميل البانرات. يرجى المحاولة مرة أخرى.');
        }
    };

    // Effect for fetching data on component mount
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            await Promise.all([
                fetchSiteSettingsFromEndpoint(),
                fetchPagesFromEndpoint(),
                fetchServicesFromEndpoint(),
                fetchBannersFromEndpoint()
            ]);
            setLoading(false);
        };

        fetchData();
    }, []);

    // Effect for handling navigation from URL hash
    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash.replace('#/', '');
            const [path, slug] = hash.split('/');

            switch (path) {
                case 'admin':
                    // دعم كل من coupons و copons (للتأكد من العمل في جميع الحالات)
                    if (slug === 'coupons' || slug === 'copons') {
                        setAppView({ view: 'admin', slug: 'coupons' });
                    } else {
                        setAppView({ view: 'admin', slug: slug || 'dashboard' });
                    }
                    break;
                case 'client':
                    setAppView({ view: 'client', slug: slug || 'dashboard' });
                    break;
                case 'blog':
                    setAppView(slug ? { view: 'blogPost', slug } : { view: 'blog' });
                    break;
                case 'page':
                    setAppView(slug ? { view: 'page', slug } : { view: 'home' });
                    break;
                default:
                    setAppView({ view: 'home' });
                    break;
            }
        };

        window.addEventListener('hashchange', handleHashChange);
        handleHashChange(); // Initial check

        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    // Effect for handling redirection on login/logout
    useEffect(() => {
        // User just logged in: redirect to their panel
        if (!prevUser.current && user) {
            window.location.hash = user.role === 'admin' ? '/admin' : '/client';
        }

        // User just logged out: redirect to home if they were on a private page
        if (prevUser.current && !user) {
            if (appView.view === 'client' || appView.view === 'admin') {
                window.location.hash = '/';
            }
        }

        prevUser.current = user;
    }, [user, appView.view]);

    const onNavigate = (view: 'page' | 'blogPost' | 'home' | 'blog', slug: string = '') => {
        window.location.hash = `/${view}${slug ? `/${slug}` : ''}`;
    };

    const renderView = () => {
        if (loading && pages.length === 0 && services.length === 0) {
            return <div className="text-center pt-40">جاري تحميل البيانات...</div>;
        }

        if (error && pages.length === 0 && services.length === 0) {
            return <div className="text-center pt-40 text-red-400">{error}</div>;
        }

        // Show loading if siteSettings is not loaded yet
        if (!siteSettings) {
            return <div className="text-center pt-40">جاري تحميل إعدادات الموقع...</div>;
        }

        switch (appView.view) {
            case 'admin':
                if (user?.role !== 'admin') {
                    return <Redirector message="Access Denied. Redirecting..." />;
                }
                return <AdminPanel
                    initialView={appView.slug}
                    services={services} setServices={setServices}
                    pages={pages} setPages={setPages}
                    posts={posts} setPosts={setPosts}
                    providers={providers} setProviders={setProviders}
                    banners={banners} setBanners={setBanners}
                    settings={siteSettings} setSettings={setSiteSettings}
                    platforms={platforms} setPlatforms={setPlatforms}
                />;
            case 'client':
                if (!user) {
                    return <Redirector message="Please login. Redirecting..." />;
                }
                return <ClientPanel services={services} initialView={appView.slug} />;
            case 'page':
                const page = pages.find(p => p.slug === appView.slug && p.isPublished);
                return page ? <PageView page={page} /> : <div className="text-center pt-40">الصفحة غير موجودة</div>;
            case 'blog':
                return <Blog onPostClick={(slug) => onNavigate('blogPost', slug)} />;

            case 'blogPost':
                const post = posts.find(p => p.slug === appView.slug && p.status === 'Published');
                return post ? <BlogPost post={post} /> : <div className="text-center pt-40">المقال غير موجود</div>;
            case 'home':

            default:
                return (
                    <>
                        <Hero
                            siteName={siteSettings.siteName}
                            content={siteSettings.homepageContent.hero}
                        />
                        <Banners banners={banners.filter(b => b.isActive)} />
                        <Features content={siteSettings.homepageContent.features} />
                        <Services
                            services={services}
                            platforms={platforms}
                            content={siteSettings.homepageContent.services}
                        />
                        <HowItWorks content={siteSettings.homepageContent.howItWorks} />
                        <Testimonials content={siteSettings.homepageContent.testimonials} />
                    </>
                );
        }
    };

    let pageTitle = siteSettings?.siteName || 'فاستر فولو';
    let pageDescription = siteSettings?.seoDescription || 'زيادة متابعين، لايكات، ومشاهدات لجميع المنصات. أسعار تنافسية وجودة عالية.';

    if (appView.view === 'page') {
        const currentPage = pages.find(p => p.slug === appView.slug);
        if (currentPage) {
            pageTitle = `${currentPage.title} | ${siteSettings?.siteName || 'فاستر فولو'}`;
            pageDescription = currentPage.content.replace(/<[^>]*>?/gm, '').substring(0, 160);
        }
    } else if (appView.view === 'blogPost') {
        const currentPost = posts.find(p => p.slug === appView.slug);
        if (currentPost) {
            pageTitle = `${currentPost.metaTitle || currentPost.title} | ${siteSettings?.siteName || 'فاستر فولو'}`;
            pageDescription = currentPost.metaDescription || currentPost.excerpt;
        }
    }
    useSEO(pageTitle, pageDescription);

    useEffect(() => {
        if (siteSettings?.primaryColor) {
            document.documentElement.style.setProperty('--color-primary-500', siteSettings.primaryColor);
            document.documentElement.style.setProperty('--color-primary-600', `${siteSettings.primaryColor}E6`);
            document.documentElement.style.setProperty('--color-primary-700', `${siteSettings.primaryColor}CC`);
            document.documentElement.style.setProperty('--color-primary-400', `${siteSettings.primaryColor}B3`);
            document.documentElement.style.setProperty('--color-primary-900', `${siteSettings.primaryColor}33`);
        }
    }, [siteSettings?.primaryColor]);

    return (
        <div className="bg-gray-900 text-white min-h-screen font-sans" dir="rtl">
            <Header siteName={siteSettings?.siteName || 'فاستر فولو'} logoUrl={siteSettings?.logoUrl} pages={pages} />
            <main>{renderView()}</main>
            {(appView.view === 'home' || appView.view === 'blog' || appView.view === 'blogPost' || appView.view === 'page') && <Footer siteName={siteSettings?.siteName || 'فاستر فولو'} pages={pages} onNavigate={onNavigate} />}
            <Chatbot />
        </div>
    );
};

export default App;