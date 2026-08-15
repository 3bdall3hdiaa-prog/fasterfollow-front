import React from 'react';
import { Page } from '../types';
import { useThemeStore } from '@/store/theme.store';

interface PageViewProps {
    page: Page;
}

const PageView: React.FC<PageViewProps> = ({ page }) => {
    const { isDark } = useThemeStore();

    console.log("Scaascascascaacsascasasaasc");
    console.log(page);

    return (
        <div className={`pt-24 pb-20 min-h-screen transition-colors duration-300 ${isDark ? 'bg-gray-800/50' : 'bg-gray-100/50'
            }`}>
            <div className="container mx-auto px-6 max-w-4xl">
                <div className={`rounded-lg p-8 transition-colors duration-300 ${isDark
                        ? 'bg-gray-900 border border-gray-700'
                        : 'bg-white border border-gray-200 shadow-lg'
                    }`}>
                    <h1 className={`text-4xl font-extrabold mb-6 transition-colors duration-300 ${isDark ? 'text-white' : 'text-gray-900'
                        }`}>
                        {page.title}
                    </h1>
                    <div
                        className={`prose prose-lg max-w-none transition-colors duration-300 ${isDark
                                ? 'prose-invert text-gray-300'
                                : 'text-gray-700'
                            }`}
                        dangerouslySetInnerHTML={{ __html: page.content }}
                    />
                </div>
            </div>
        </div>
    );
};

export default PageView;