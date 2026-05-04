// Vercel Analytics integration
if (typeof window !== 'undefined') {
  const host = window.location.hostname;
  const isLocal =
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host === '0.0.0.0' ||
    host.endsWith('.local') ||
    /^192\.168\./.test(host) ||
    /^10\./.test(host);

  if (!isLocal) {
    // Initialize the analytics queue
    if (!window.va) {
      window.va = function a(...params) {
        (window.vaq = window.vaq || []).push(params);
      };
    }

    window.vam = 'production';

    const src = '/_vercel/insights/script.js';
    if (!document.head.querySelector(`script[src*="${src}"]`)) {
      const script = document.createElement('script');
      script.src = src;
      script.defer = true;
      script.dataset.sdkn = '@vercel/analytics';
      script.dataset.sdkv = '1.5.0';
      script.onerror = () => {
        console.log(`[Vercel Web Analytics] Failed to load script from ${src}. Be sure to enable Web Analytics for your project and deploy again. See https://vercel.com/docs/analytics/quickstart for more information.`);
      };
      document.head.appendChild(script);
    }
  }
}



