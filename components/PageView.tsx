import React from 'react';
import { Page } from '../types';

interface PageViewProps {
    page: Page;
}

const PageView: React.FC<PageViewProps> = ({ page }) => {
    return (
        <div className="pt-24 pb-20 bg-gray-800/50 min-h-screen">
            <div className="container mx-auto px-6 max-w-4xl">
                <div className="bg-gray-900 border border-gray-700 rounded-lg p-8">
                    <h1 className="text-4xl font-extrabold text-white mb-6">{page.title}</h1>
                    <div 
                        className="prose prose-invert prose-lg max-w-none text-gray-300"
                        dangerouslySetInnerHTML={{ __html: page.content }}
                    />
                </div>
            </div>
        </div>
    );
};

export default PageView;
