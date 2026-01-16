'use client';

import { useState } from 'react';
import { FaShareAlt, FaFacebook, FaTwitter, FaLinkedin, FaWhatsapp, FaEnvelope, FaLink } from 'react-icons/fa';

interface ShareButtonProps {
  url: string;
  title: string;
  description?: string;
  className?: string;
  variant?: 'button' | 'icon' | 'dropdown';
  onShare?: (platform: string) => void;  // Callback when share happens
}

export default function ShareButton({ 
  url, 
  title, 
  description = '', 
  className = '',
  variant = 'button',
  onShare
}: ShareButtonProps) {
  const [showDropdown, setShowDropdown] = useState(false);

  const shareText = description || title;
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedText = encodeURIComponent(shareText);

  // Social media share URLs
  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedText}%20${encodedUrl}`,
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      // Show a brief success message (you can use toast here if available)
      alert('Link copied to clipboard!');
      setShowDropdown(false);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShare = (platform: keyof typeof shareLinks) => {
    window.open(shareLinks[platform], '_blank', 'width=600,height=400');
    setShowDropdown(false);
    // Call onShare callback if provided
    if (onShare) {
      onShare(platform);
    }
  };
  
  const handleNativeShare = async () => {
    if ('share' in navigator && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title,
          text: shareText,
          url,
        });
        setShowDropdown(false);
        // Call onShare callback if provided
        if (onShare) {
          onShare('native');
        }
      } catch (err) {
        // User cancelled or error occurred
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      copyToClipboard();
    }
  };

  if (variant === 'icon') {
    return (
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className={`p-2 rounded-lg hover:bg-gray-100 transition-colors ${className}`}
          aria-label="Share job"
        >
          <FaShareAlt className="w-5 h-5 text-gray-600" />
        </button>
        
        {showDropdown && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setShowDropdown(false)}
            />
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50 py-2">
              {'share' in navigator && typeof navigator.share === 'function' && (
                <button
                  onClick={handleNativeShare}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-sm text-gray-700"
                >
                  <FaShareAlt className="w-4 h-4 text-gray-500" />
                  Share via...
                </button>
              )}
              <button
                onClick={() => handleShare('facebook')}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-sm text-gray-700"
              >
                <FaFacebook className="w-4 h-4 text-blue-600" />
                Facebook
              </button>
              <button
                onClick={() => handleShare('twitter')}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-sm text-gray-700"
              >
                <FaTwitter className="w-4 h-4 text-blue-400" />
                Twitter
              </button>
              <button
                onClick={() => handleShare('linkedin')}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-sm text-gray-700"
              >
                <FaLinkedin className="w-4 h-4 text-blue-700" />
                LinkedIn
              </button>
              <button
                onClick={() => handleShare('whatsapp')}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-sm text-gray-700"
              >
                <FaWhatsapp className="w-4 h-4 text-green-500" />
                WhatsApp
              </button>
              <button
                onClick={() => handleShare('email')}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-sm text-gray-700"
              >
                <FaEnvelope className="w-4 h-4 text-gray-500" />
                Email
              </button>
              <button
                onClick={copyToClipboard}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-sm text-gray-700 border-t border-gray-200 mt-1 pt-2"
              >
                <FaLink className="w-4 h-4 text-gray-500" />
                Copy Link
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  if (variant === 'dropdown') {
    return (
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700 ${className}`}
        >
          <FaShareAlt className="w-4 h-4" />
          Share
        </button>
        
        {showDropdown && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setShowDropdown(false)}
            />
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50 py-2">
              {'share' in navigator && typeof navigator.share === 'function' && (
                <button
                  onClick={handleNativeShare}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-sm text-gray-700"
                >
                  <FaShareAlt className="w-4 h-4 text-gray-500" />
                  Share via...
                </button>
              )}
              <button
                onClick={() => handleShare('facebook')}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-sm text-gray-700"
              >
                <FaFacebook className="w-4 h-4 text-blue-600" />
                Facebook
              </button>
              <button
                onClick={() => handleShare('twitter')}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-sm text-gray-700"
              >
                <FaTwitter className="w-4 h-4 text-blue-400" />
                Twitter
              </button>
              <button
                onClick={() => handleShare('linkedin')}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-sm text-gray-700"
              >
                <FaLinkedin className="w-4 h-4 text-blue-700" />
                LinkedIn
              </button>
              <button
                onClick={() => handleShare('whatsapp')}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-sm text-gray-700"
              >
                <FaWhatsapp className="w-4 h-4 text-green-500" />
                WhatsApp
              </button>
              <button
                onClick={() => handleShare('email')}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-sm text-gray-700"
              >
                <FaEnvelope className="w-4 h-4 text-gray-500" />
                Email
              </button>
              <button
                onClick={copyToClipboard}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-sm text-gray-700 border-t border-gray-200 mt-1 pt-2"
              >
                <FaLink className="w-4 h-4 text-gray-500" />
                Copy Link
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  // Default button variant
  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700 ${className}`}
      >
        <FaShareAlt className="w-4 h-4" />
        Share
      </button>
      
      {showDropdown && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowDropdown(false)}
          />
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50 py-2">
            {'share' in navigator && typeof navigator.share === 'function' && (
              <button
                onClick={handleNativeShare}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-sm text-gray-700"
              >
                <FaShareAlt className="w-4 h-4 text-gray-500" />
                Share via...
              </button>
            )}
            <button
              onClick={() => handleShare('facebook')}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-sm text-gray-700"
            >
              <FaFacebook className="w-4 h-4 text-blue-600" />
              Facebook
            </button>
            <button
              onClick={() => handleShare('twitter')}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-sm text-gray-700"
            >
              <FaTwitter className="w-4 h-4 text-blue-400" />
              Twitter
            </button>
            <button
              onClick={() => handleShare('linkedin')}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-sm text-gray-700"
            >
              <FaLinkedin className="w-4 h-4 text-blue-700" />
              LinkedIn
            </button>
            <button
              onClick={() => handleShare('whatsapp')}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-sm text-gray-700"
            >
              <FaWhatsapp className="w-4 h-4 text-green-500" />
              WhatsApp
            </button>
            <button
              onClick={() => handleShare('email')}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-sm text-gray-700"
            >
              <FaEnvelope className="w-4 h-4 text-gray-500" />
              Email
            </button>
            <button
              onClick={copyToClipboard}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-sm text-gray-700 border-t border-gray-200 mt-1 pt-2"
            >
              <FaLink className="w-4 h-4 text-gray-500" />
              Copy Link
            </button>
          </div>
        </>
      )}
    </div>
  );
}
