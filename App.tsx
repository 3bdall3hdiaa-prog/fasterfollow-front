import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import image1 from './assests/images/bitmap2.png';
import image2 from './assests/images/b92164c9-7af4-45b6-94fb-95fdecf76609.webp';
import Services from './components/Services';
import Testimonials from './components/Testimonials';
import Footer from './components/Footer';
import AdminPanel from './components/AdminPanel';
import ClientPanel from './components/ClientPanel';
import Blog from './components/Blog';
import BlogPost from './components/BlogPost';
import PageView from './components/PageView';
import { useUser } from './contexts/UserContext';
import { useSEO } from './hooks/useSEO';
import { Page, BlogPost as BlogPostType, ServiceResponse, Provider, BannerResponse, SiteSettings, Platform } from './types';
import axios from 'axios';
import { useThemeStore } from './store/theme.store';
import ServicesSection from './components/ServicesSection';
import ServiceView from './components/ServiceView';
import { useAuthStore } from './store/auth.store';



const Redirector: React.FC<{ message: string; to?: string }> = ({ message, to = '/' }) => {
    useEffect(() => {
        window.location.hash = to;
    }, [to]);
    return <div className="text-center pt-40">{message}</div>;
};

type View = 'home' | 'page' | 'blog' | 'blogPost' | 'client' | 'admin' | 'services';
type AppView = {
    view: View;
    slug?: string;
    id?: string;
};

const App: React.FC = () => {
    const { user } = useAuthStore();
    const [appView, setAppView] = useState<AppView>({ view: 'home' });
    const prevUser = useRef(user);
    const { isDark } = useThemeStore();
    console.log("app view", appView);
    // Mock data state
    const [blogPosts, setBlogPosts] = useState<BlogPostType[]>([]);
    const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
    const [services, setServices] = useState<ServiceResponse[]>([]); // Empty array initially
    const [filteredServices, setFilteredServices] = useState<any[]>([]);
    const [pages, setPages] = useState<Page[]>([]); // Empty array initially
    const [posts, setPosts] = useState<BlogPostType[]>([]);
    const [providers, setProviders] = useState<Provider[]>([]);
    const [banners, setBanners] = useState<BannerResponse[]>([]); // Empty array initially
    const [platforms, setPlatforms] = useState<Platform[]>();
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [reviews, setReviews] = useState<any[]>([]);


    const fetchSiteSettingsFromEndpoint = async () => {
        try {
            setError(null);
            const response = await fetch(`${import.meta.env.VITE_API_URL}/manage-setting`, { credentials: 'include' });

            if (!response.ok) {
                throw new Error(`Failed to fetch site settings: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            const settingsData = Array.isArray(data) ? data[0] : data;

            if (!settingsData || typeof settingsData !== 'object') {
                console.warn('Invalid settings data format, using defaults');
                setSiteSettings(getDefaultSettings());
                return;
            }
            const formattedSiteSettings: SiteSettings = {
                siteName: settingsData?.siteName || 'فاستر فولو',
                logo: { url: settingsData?.logo.url || 'https://i.imgur.com/3Z4Qj4a.png', public_id: settingsData?.logo.public_id || 'logo' },
                primaryColor: settingsData?.primaryColor || '#6366f1',
                seoTitle: settingsData?.seoTitle || 'فاستر فولو - أفضل خدمات دعم حسابات التواصل الاجتماعي',
                seoDescription: settingsData?.seoDescription || 'زيادة متابعين، لايكات، ومشاهدات لجميع المنصات. أسعار تنافسية وجودة عالية.',
                announcement: {
                    text: settingsData?.announcement?.text || '🎉 خصم 15% على جميع خدمات انستغرام لفترة محدودة!',
                    isEnabled: settingsData?.announcement?.isEnabled ?? true,
                },
                homepageContent: {
                    hero: {
                        title: settingsData?.homepageContent?.hero?.title || 'عزز حضورك الرقمي مع',
                        subtitle: settingsData?.homepageContent?.hero?.subtitle || 'نقدم لك أفضل خدمات الدعم لشبكات التواصل الاجتماعي لزيادة متابعينك وتفاعلك بأسعار تنافسية وجودة عالية.',
                        cta1: settingsData?.homepageContent?.hero?.cta1 || 'اكتشف خدماتنا',
                        cta2: settingsData?.homepageContent?.hero?.cta2 || 'كيف نعمل؟'
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
                        title: settingsData?.homepageContent?.services?.title || 'خدماتنا المميزة',
                        subtitle: settingsData?.homepageContent?.services?.subtitle || 'اختر الباقة التي تناسب احتياجاتك وابدأ في تنمية حسابك اليوم.'
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
            setSiteSettings(getDefaultSettings());
        }
    };
    const getReviews = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/reviews`, { withCredentials: true });
            if (response.data) {
                setReviews(response.data);
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
        }
    }

    const getDefaultSettings = (): SiteSettings => ({
        siteName: 'فاستر فولو',
        logo: { url: 'https://i.imgur.com/3Z4Qj4a.png', public_id: '' },
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
                    { icon: '🛡️', title: 'جودة عالية وضمان', description: 'نقدم متابعين وحسابات عالية الجودة مع ضمان تعويض النقص في بعض الخدمات.' },
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
    const fetchBlogsFromEndpoint = async () => {
        try {
            setError(null);
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/blog`, { credentials: 'include' });

            if (!response.ok) {
                throw new Error(`Failed to fetch blogs: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            const formattedBlogs: any[] = data.map((blog: any) => ({
                id: blog._id || blog.id?.toString() || Math.random().toString(),
                title: blog.title || 'Untitled',
                slug: blog.slug || blog.title?.toLowerCase().replace(/\s+/g, '-'),
                content: blog.content || '<p>No content available</p>',
                isPublished: blog.isPublished !== undefined ? blog.isPublished : true,
                createdAt: blog.createdAt || new Date().toISOString().split('T')[0],
                updatedAt: blog.updatedAt || '',
                urlimage: blog.urlimage || '',
                Metatitle: blog.Metatitle || '',
                Metadescription: blog.Metadescription || '',
                author: blog.author || '',
                status: blog.status || 'Published',
                extract: blog.extract || '',
                link: blog.link || '',


            }));
            setBlogPosts(formattedBlogs);
        } catch (error) {
            console.error('Error fetching blogs:', error);
            setError('Failed to fetch blogs');
        }
    }

    const fetchPagesFromEndpoint = async () => {
        try {
            setError(null);
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/managepages`, { credentials: 'include' });

            if (!response.ok) {
                throw new Error(`Failed to fetch pages: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

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
    // Function to fetch banners from endpoint
    const fetchBannersFromEndpoint = async () => {
        try {
            setError(null);
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/managepanners`, { credentials: 'include' });

            if (!response.ok) {
                throw new Error(`Failed to fetch banners: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            // Transform the API data to match the Banner type
            const formattedBanners: BannerResponse[] = data.map((banner: any) => ({
                id: banner._id || banner.id?.toString() || Math.random().toString(),
                title: banner.title || 'No Title',
                subtitle: banner.subtitle || '',
                ctaText: banner.ctaText || 'اطلب الآن',
                ctaLink: banner.ctaLink || '#',
                image: banner.image.url,
                isActive: banner.isActive !== undefined ? banner.isActive : true
            }));
            setBanners(formattedBanners);
        } catch (error) {
            console.error('Error fetching banners:', error);
            setError('فشل في تحميل البانرات. يرجى المحاولة مرة أخرى.');
        }
    };
    const getProviders = async () => {
        try {
            setError(null);
            const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/manage-providers`, { withCredentials: true });
            if (res.data) {
                setProviders(res.data);
            }
        } catch (error) {
            console.error('Error fetching providers:', error);
            setError('فشل في تحميل قائمة المزودين. يرجى المحاولة مرة أخرى.');
        }
    }
    const getPlatforms = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/manageplatforms`, { withCredentials: true });
            if (res.data) {
                setPlatforms(res.data);
            }
        } catch (error) {
            console.error('Error fetching platforms:', error);
        }
    }

    // Effect for fetching data on component mount
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                await getProviders();
                await getReviews();
                await getPlatforms();
                await fetchSiteSettingsFromEndpoint();
                await fetchBlogsFromEndpoint();
                await fetchPagesFromEndpoint();
                // await fetchServicesFromEndpoint();
                await fetchBannersFromEndpoint();
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Effect for handling navigation from URL hash
    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash.replace('#/', '');
            const [path, slug, id] = hash.split('/');

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
                case 'blogPost':
                    setAppView({ view: 'blogPost', slug: slug || '' });
                    break;
                case 'services':
                    if (slug) {
                        setAppView({ view: 'services', slug, id });
                    }
                    else {
                        setAppView({ view: 'services' });
                    }
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


    const handleGetServices = async (slug: any) => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/services-list/getOne/${slug}`, { withCredentials: true });
            console.log(res.data);
            if (res.data) {
                setFilteredServices(res.data.data);
            }
        } catch (error) {
            console.error('Error fetching services:', error);
        }
    }


    const onNavigate = (view: 'page' | 'blogPost' | 'home' | 'blog', slug: string) => {
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
                const page = pages.find((p: any) => p.link === appView.slug && p.isPublished);
                return page ? <PageView page={page} /> : <div className="text-center pt-40">الصفحة غير موجودة</div>;
            case 'blog':
                return <Blog onPostClick={(slug) => onNavigate('blogPost', slug)} />;

            case 'blogPost':
                const post = blogPosts.find((p: any) => p.link === appView.slug && p.status === 'Published');
                return post ? <BlogPost post={post} /> : <div className="text-center pt-40">المقال غير موجود</div>;

            case 'services':
                if (appView.id) {
                    return <ServiceView id={appView.id} />
                }
                else {
                    handleGetServices(appView.slug);
                    return <Services services={filteredServices} length={filteredServices.length} />
                }

            case 'home':

            default:
                return (
                    <>
                        <div className={` ${isDark ? "bg-gray-900" : "bg-gradient-to-t from-[#dfd7bb] to-white"}`}>

                            <Hero />
                            <div className={`mx-4 sm:px-6 md:px-10 lg:px-16 xl:px-32 `}>
                                <div className=''>

                                    <div className='mt-6 sm:mt-8 md:mt-[35px]'>
                                        <img
                                            src={image1}
                                            className='w-full h-auto'
                                            alt=''
                                        />
                                    </div>
                                    <div className='rounded-2xl overflow-hidden mt-6 sm:mt-8 md:mt-[35px]'>
                                        <img
                                            src={image2}
                                            className='w-full h-auto object-cover'
                                            alt=''
                                        />
                                    </div>

                                    <Testimonials content={reviews} />
                                    {platforms?.map((platform: any) => (
                                        <ServicesSection key={platform._id} platform={platform} />
                                    ))}
                                </div>
                            </div>
                        </div>
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
        const currentPost = posts.find(p => p.link === appView.slug);
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
        <div className={`bg-gray-900 text-white min-h-screen font-sans" dir="rtl  ${isDark ? 'bg-gray-900' : 'bg-gradient-to-t from-[#dfd7bb] to-white'}`}>
            <Header color={siteSettings?.primaryColor} siteName={siteSettings?.siteName || 'فاستر فولو'} logoUrl={siteSettings?.logo?.url} pages={pages} />
            <main className=''>{renderView()}</main>
            {(appView.view === 'home' || appView.view === 'blog' || appView.view === 'blogPost' || appView.view === 'page' || appView.view === 'services') && <Footer siteName={siteSettings?.siteName || 'فاستر فولو'} pages={pages} onNavigate={onNavigate} />}
            {/* <Chatbot /> */}
        </div>
    );
};

export default App;