
"use client";

import React, { useState, useEffect, useRef } from 'react';
import SocialLinkPreview from './previews/SocialLinkPreview';
import { Game, BlogPost, Product, SocialLink } from '../types';

type PreviewData = Partial<Game> | Partial<BlogPost> | Partial<Product> | Partial<SocialLink>;
type FormType = 'games' | 'blogs' | 'products' | 'social-links';

interface AdminPreviewProps {
  data: PreviewData;
  type: FormType;
}

type Device = 'desktop' | 'tablet' | 'mobile';

const deviceDimensions: Record<Device, { width: string; height: string }> = {
  desktop: { width: '100%', height: '100%' },
  tablet: { width: '768px', height: '1024px' },
  mobile: { width: '375px', height: '667px' },
};

const DeviceButton: React.FC<{
  device: Device;
  currentDevice: Device;
  onClick: (device: Device) => void;
  children: React.ReactNode;
}> = ({ device, currentDevice, onClick, children }) => (
  <button
    onClick={() => onClick(device)}
    className={`p-2 rounded-md transition-colors ${
      currentDevice === device ? 'bg-purple-600 text-white' : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
    }`}
    aria-label={`Switch to ${device} preview`}
  >
    {children}
  </button>
);

const AdminPreview: React.FC<AdminPreviewProps> = ({ data, type }) => {
  const [device, setDevice] = useState<Device>('desktop');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  // Map plural form types to singular preview page names
  const previewPageMap: Partial<Record<FormType, string>> = {
    games: 'game',
    blogs: 'blog',
    products: 'product',
  };

  const previewTarget = previewPageMap[type];

  useEffect(() => {
    if (iframeRef.current && iframeLoaded && data && previewTarget) {
      // Send data to the iframe for live updates
      iframeRef.current.contentWindow?.postMessage(
        { type: 'preview-update', payload: data },
        window.location.origin
      );
    }
  }, [data, iframeLoaded, previewTarget]);

  const dimensions = deviceDimensions[device];

  return (
    <div className="bg-gray-900 rounded-lg h-full flex flex-col p-4">
      <div className="flex justify-center items-center gap-2 mb-4 p-2 bg-gray-800 rounded-md">
        <DeviceButton device="desktop" currentDevice={device} onClick={setDevice}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
        </DeviceButton>
        <DeviceButton device="tablet" currentDevice={device} onClick={setDevice}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
        </DeviceButton>
        <DeviceButton device="mobile" currentDevice={device} onClick={setDevice}>
         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M6 21h12a2 2 0 002-2V5a2 2 0 00-2-2H6a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
        </DeviceButton>
      </div>
      <div className="flex-grow flex items-center justify-center overflow-auto bg-gray-800 rounded-md p-2">
        <div
          id="preview-frame-container"
          className="shadow-2xl rounded-lg border-2 border-gray-700 overflow-hidden transition-all duration-500 ease-in-out flex items-center justify-center"
          style={{ width: dimensions.width, height: dimensions.height, maxWidth: '100%', maxHeight: '100%' }}
        >
          {previewTarget ? (
            <iframe
              ref={iframeRef}
              src={`/admin/previews/${previewTarget}`}
              title={`${previewTarget} Preview`}
              className="w-full h-full bg-gray-900"
              onLoad={() => setIframeLoaded(true)}
              sandbox="allow-scripts allow-same-origin"
            />
          ) : type === 'social-links' ? (
            // Direct component rendering for types without a full page preview
            <div className="w-full h-full overflow-y-auto">
                 <SocialLinkPreview data={data as Partial<SocialLink>} />
            </div>
          ) : (
            <div className="text-center text-gray-500">Preview not available for this type.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPreview;
