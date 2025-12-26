import { useEffect } from 'react';

declare global {
  interface Window {
    tarteaucitron: {
      init: (config: Record<string, unknown>) => void;
      user: Record<string, unknown>;
      job: string[];
    };
  }
}

const CookieConsent = () => {
  useEffect(() => {
    // Load tarteaucitron CSS
    const cssLink = document.createElement('link');
    cssLink.rel = 'stylesheet';
    cssLink.href = '/tarteaucitron/tarteaucitron.css';
    document.head.appendChild(cssLink);

    // Load tarteaucitron script
    const script = document.createElement('script');
    script.src = '/tarteaucitron/tarteaucitron.min.js';
    script.async = true;
    script.onload = () => {
      if (window.tarteaucitron) {
        // Initialize tarteaucitron with GDPR-compliant config
        window.tarteaucitron.init({
          privacyUrl: '/privacy',
          bodyPosition: 'top',
          hashtag: '#tarteaucitron',
          cookieName: 'tarteaucitron',
          orientation: 'middle',
          groupServices: true,
          showDetailsOnClick: true,
          serviceDefaultState: 'wait',
          showAlertSmall: false,
          cookieslist: false,
          cookieslistEmbed: false,
          closePopup: true,
          showIcon: true,
          iconPosition: 'BottomRight',
          adblocker: false,
          DenyAllCta: true,
          AcceptAllCta: true,
          highPrivacy: true,
          alwaysNeedConsent: false,
          handleBrowserDNTRequest: false,
          removeCredit: false,
          moreInfoLink: true,
          useExternalCss: false,
          useExternalJs: false,
          readmoreLink: '',
          mandatory: true,
          mandatoryCta: false,
          googleConsentMode: true,
          bingConsentMode: true,
          pianoConsentMode: true,
          pianoConsentModeEssential: false,
          softConsentMode: false,
          dataLayer: false,
          serverSide: false,
          partnersList: true
        });

        // Define services (ready to use when IDs are configured)
        // GA4 - Google Analytics 4
        window.tarteaucitron.user.gtagUa = ''; // Add your GA4 measurement ID here when ready
        window.tarteaucitron.user.gtagMore = function () {
          // Additional gtag config can go here
        };
        if (window.tarteaucitron.user.gtagUa) {
          (window.tarteaucitron.job = window.tarteaucitron.job || []).push('gtag');
        }

        // Facebook Pixel - ready when ID is configured
        window.tarteaucitron.user.facebookpixelId = ''; // Add your Facebook Pixel ID when ready
        window.tarteaucitron.user.facebookpixelMore = function () {
          // Additional Facebook Pixel config
        };
        if (window.tarteaucitron.user.facebookpixelId) {
          (window.tarteaucitron.job = window.tarteaucitron.job || []).push('facebookpixel');
        }

        // TikTok Pixel - ready when ID is configured
        window.tarteaucitron.user.tiktokId = ''; // Add your TikTok Pixel ID when ready
        if (window.tarteaucitron.user.tiktokId) {
          (window.tarteaucitron.job = window.tarteaucitron.job || []).push('tiktok');
        }
      }
    };
    document.body.appendChild(script);

    return () => {
      // Cleanup
      if (document.head.contains(cssLink)) {
        document.head.removeChild(cssLink);
      }
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return null;
};

export default CookieConsent;
