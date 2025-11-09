
import React from 'react';
import type { SocialLink } from '../../types';

interface SocialLinkPreviewProps {
  data: Partial<SocialLink>;
}

const SocialLinkPreview: React.FC<SocialLinkPreviewProps> = ({ data }) => {
    const {
        name = 'Social Media',
        url = '#',
        icon_svg, // Can be undefined
    } = data;

    const placeholderIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" class="text-gray-500"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8s8 3.59 8 8s-3.59 8-8 8z"/></svg>';

    const iconHtml = icon_svg || placeholderIcon;

    return (
        <div className="animate-fade-in p-4">
            <h3 className="text-lg font-semibold text-gray-400 border-b border-gray-700 pb-2 mb-4">Header Preview</h3>
            
            {/* Mock Header */}
            <header className="bg-gray-800 rounded-lg p-4 flex items-center justify-between shadow-md">
                <div className="text-xl font-bold text-white">G2Gaming</div>
                <div className="flex items-center space-x-4">
                    {/* Mock existing links */}
                    <div className="w-6 h-6 bg-gray-600 rounded-full"></div>
                    <div className="w-6 h-6 bg-gray-600 rounded-full"></div>
                    
                    {/* Live preview of the new link */}
                    <a
                        href={url || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={name}
                        className="text-gray-400 hover:text-white transition-colors"
                        // It's important to prevent click events inside the preview
                        onClick={(e) => e.preventDefault()}
                        dangerouslySetInnerHTML={{ __html: iconHtml }}
                    />
                </div>
            </header>

            <div className="mt-8 p-4 bg-gray-800 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-400 border-b border-gray-700 pb-2 mb-4">Data Inspector</h3>
                <div className="space-y-2 text-sm">
                    <p><span className="font-bold text-gray-400">Name:</span> <span className="text-white">{name}</span></p>
                    <p><span className="font-bold text-gray-400">URL:</span> <span className="text-purple-400 break-all">{url}</span></p>
                    <div className="mt-2">
                        <p className="font-bold text-gray-400 mb-2">Icon Preview:</p>
                        <div 
                            className="w-12 h-12 p-2 bg-gray-700 rounded-md flex items-center justify-center text-white" 
                            dangerouslySetInnerHTML={{ __html: iconHtml }} 
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SocialLinkPreview;
