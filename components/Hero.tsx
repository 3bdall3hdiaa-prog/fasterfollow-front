import React from 'react';
import { SiteSettings } from '../types';
import { useThemeStore } from '@/store/theme.store';
import HeroImage from '../assests/images/البانر الرئيسي لمتجر متوفر 2.webp';
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
        <div className='xl:px-[120px]  mt-16 md:mt-20 xl:mt-[81px]'>
            <img src={HeroImage} alt="Hero" />
        </div>
    );
};

export default Hero;