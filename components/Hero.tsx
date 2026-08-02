import React from 'react';
import { SiteSettings } from '../types';
import { useThemeStore } from '@/store/theme.store';

interface HeroProps {
    siteName: string;
    content: SiteSettings['homepageContent']['hero'];
}

const Hero: React.FC = () => {
    const { isDark } = useThemeStore();
    const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
        e.preventDefault();
        const element = document.getElementById(targetId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <div className='xl:px-[120px] mt-[81px]'>
            <img src='../assests/images/البانر الرئيسي لمتجر متوفر 2.webp' />
        </div>
    );
};

export default Hero;