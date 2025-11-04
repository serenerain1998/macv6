// Vercel Analytics integration
if (typeof window !== 'undefined') {
  // Initialize the analytics queue
  if (!window.va) {
    window.va = function a(...params) {
      (window.vaq = window.vaq || []).push(params);
    };
  }

  // Set mode based on environment
  try {
    const env = process?.env?.NODE_ENV;
    if (env === 'development' || env === 'test') {
      window.vam = 'development';
    } else {
      window.vam = 'production';
    }
  } catch (e) {
    window.vam = 'production';
  }

  // Get the script source
  const getScriptSrc = () => {
    if (window.vam === 'development') {
      return 'https://va.vercel-scripts.com/v1/script.debug.js';
    }
    return '/_vercel/insights/script.js';
  };

  // Inject the analytics script
  const src = getScriptSrc();
  if (!document.head.querySelector(`script[src*="${src}"]`)) {
    const script = document.createElement('script');
    script.src = src;
    script.defer = true;
    script.dataset.sdkn = '@vercel/analytics';
    script.dataset.sdkv = '1.5.0';
    script.onerror = () => {
      const errorMessage = window.vam === 'development' 
        ? 'Please check if any ad blockers are enabled and try again.' 
        : 'Be sure to enable Web Analytics for your project and deploy again. See https://vercel.com/docs/analytics/quickstart for more information.';
      console.log(`[Vercel Web Analytics] Failed to load script from ${src}. ${errorMessage}`);
    };
    document.head.appendChild(script);
  }
}



