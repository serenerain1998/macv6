// SPA-style navigation. Intercepts internal link clicks and replaces
// #mainContent without a full page reload, so the chat widget and
// in-flight TTS audio (which live on <body>, outside #mainContent) survive.
(function () {
  if (window.__spaNavInitialized) return;
  window.__spaNavInitialized = true;

  const MAIN_ID = 'mainContent';

  // Take full control of scroll restoration. Browsers default to 'auto', which
  // can race with our pushState + scrollTo and leave the user mid-page.
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  function isInternalNav(a, e) {
    if (!a || !a.href) return false;
    if (a.target && a.target !== '_self') return false;
    if (a.hasAttribute('download')) return false;
    if (a.dataset.spaSkip === 'true') return false;
    if (e && (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0)) return false;
    let url;
    try { url = new URL(a.href, location.href); } catch (_) { return false; }
    if (url.origin !== location.origin) return false;
    if (/\.(pdf|zip|jpe?g|png|gif|svg|mp4|mov|webm|webp|ico|css|js|json)$/i.test(url.pathname)) return false;
    return true;
  }

  function scrollToHash(hash) {
    const id = hash.startsWith('#') ? hash.slice(1) : hash;
    if (!id) { window.scrollTo(0, 0); return; }
    const el = document.getElementById(id);
    if (!el) return;
    // Account for the fixed navbar so the section header isn't hidden behind it.
    const navbar = document.querySelector('.navbar');
    const offset = (navbar ? navbar.offsetHeight : 0) + 40;
    const top = el.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  }

  // Re-execute <script> nodes inside `container` so inline page scripts run
  // again after a DOM swap (cloned-and-replaced is the only way browsers
  // will execute them).
  function reExecuteScripts(container) {
    const scripts = container.querySelectorAll('script');
    for (const oldScript of scripts) {
      const newScript = document.createElement('script');
      for (const attr of oldScript.attributes) newScript.setAttribute(attr.name, attr.value);
      newScript.textContent = oldScript.textContent;
      oldScript.replaceWith(newScript);
    }
  }

  async function navigate(href, opts = {}) {
    const url = new URL(href, location.href);
    const hash = url.hash || '';

    // Same-page hash link → just scroll, no fetch.
    if (url.pathname === location.pathname && url.search === location.search && hash) {
      if (!opts.skipPushState) history.pushState(null, '', url.href);
      scrollToHash(hash);
      return;
    }

    let html;
    try {
      const res = await fetch(url.href, { headers: { 'X-SPA-Nav': '1' } });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      html = await res.text();
    } catch (err) {
      console.warn('[spa] fetch failed, falling back to full reload', err);
      location.href = url.href;
      return;
    }

    const doc = new DOMParser().parseFromString(html, 'text/html');
    const newMain = doc.getElementById(MAIN_ID);
    const oldMain = document.getElementById(MAIN_ID);
    if (!newMain || !oldMain) {
      console.warn('[spa] no #mainContent in source/target — full reload');
      location.href = url.href;
      return;
    }

    if (doc.title) document.title = doc.title;
    if (doc.body && doc.body.className !== document.body.className) {
      // Preserve body classes that other scripts may have added at runtime
      // (e.g., the password-protected gate). Keep both new + dynamic.
      const dynamic = ['password-protected'].filter((c) => document.body.classList.contains(c));
      document.body.className = doc.body.className;
      for (const c of dynamic) document.body.classList.add(c);
    }

    // Sync inline <style> blocks: each page has its own page-specific styles
    // in <head>. Replace ours with the target's wholesale.
    document.head.querySelectorAll('style').forEach((s) => s.remove());
    doc.head.querySelectorAll('style').forEach((s) => {
      const ns = document.createElement('style');
      for (const attr of s.attributes) ns.setAttribute(attr.name, attr.value);
      ns.textContent = s.textContent;
      document.head.appendChild(ns);
    });

    // Add any <link rel="stylesheet"> we don't already have. We don't remove
    // existing ones — leftover library styles are harmless and avoid FOUC.
    const haveHrefs = new Set(
      Array.from(document.head.querySelectorAll('link[rel="stylesheet"]')).map((l) => l.href)
    );
    doc.head.querySelectorAll('link[rel="stylesheet"]').forEach((l) => {
      if (!haveHrefs.has(l.href)) {
        const nl = document.createElement('link');
        for (const attr of l.attributes) nl.setAttribute(attr.name, attr.value);
        document.head.appendChild(nl);
      }
    });

    oldMain.innerHTML = newMain.innerHTML;
    reExecuteScripts(oldMain);

    if (!opts.skipPushState) history.pushState(null, '', url.href);

    if (hash) {
      scrollToHash(hash);
    } else {
      // Force-scroll to the very top of the new page. Run twice (sync + rAF)
      // so it lands even if any inline init in the swapped scripts shifts
      // scroll on its own first.
      window.scrollTo(0, 0);
      requestAnimationFrame(() => window.scrollTo(0, 0));
    }

    // Best-effort re-init for libraries we know are on the page.
    try {
      if (window.AOS && typeof window.AOS.refreshHard === 'function') window.AOS.refreshHard();
      else if (window.AOS && typeof window.AOS.refresh === 'function') window.AOS.refresh();
    } catch (_) {}
    try {
      if (window.ScrollTrigger && typeof window.ScrollTrigger.refresh === 'function') window.ScrollTrigger.refresh();
    } catch (_) {}

    // Re-run main.js's element-level init functions so click handlers on the
    // freshly-swapped DOM (filter buttons, mosaic tiles, image sliders, etc.)
    // get bound. This must happen AFTER reExecuteScripts so that any
    // page-specific inline init has already run.
    if (window.MainApp && typeof window.MainApp.spaReInit === 'function') {
      try { window.MainApp.spaReInit(); } catch (err) { console.warn('[spa] spaReInit failed', err); }
    }

    document.dispatchEvent(new CustomEvent('spa:navigated', { detail: { href: url.href } }));
  }

  // Capture-phase handler for hash links — runs BEFORE element-level handlers
  // (e.g., main.js's smooth-scroll handler that uses target.offsetTop, which
  // miscalculates when any ancestor creates a positioning/transform context).
  // We claim the event for hash navigation, do our own correct scroll, and
  // stop propagation so the broken handler can't fire and overwrite the scroll.
  document.addEventListener('click', (e) => {
    if (e.defaultPrevented) return;
    const a = e.target.closest && e.target.closest('a');
    if (!a || !a.href) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    let url;
    try { url = new URL(a.href, location.href); } catch (_) { return; }
    if (url.origin !== location.origin) return;
    if (!url.hash) return;
    if (url.pathname !== location.pathname || url.search !== location.search) return;
    // Same-page hash link → handle here, exclusively.
    e.preventDefault();
    e.stopPropagation();
    history.pushState(null, '', url.href);
    scrollToHash(url.hash);
  }, true);

  document.addEventListener('click', (e) => {
    if (e.defaultPrevented) return;
    const a = e.target.closest && e.target.closest('a');
    if (!isInternalNav(a, e)) return;
    e.preventDefault();
    navigate(a.href);
  });

  window.addEventListener('popstate', () => {
    navigate(location.href, { skipPushState: true });
  });
})();
