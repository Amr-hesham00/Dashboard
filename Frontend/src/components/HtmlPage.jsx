import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

function reinitThemeHandlers(root) {
  const getStoredTheme = () => localStorage.getItem('theme');
  const getPreferredTheme = () => {
    const storedTheme = getStoredTheme();
    if (storedTheme) return storedTheme;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };
  const setTheme = (theme) => {
    if (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.setAttribute('data-bs-theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-bs-theme', theme);
    }
  };
  const updateDropdownIcon = (theme) => {
    const themeIconActive = root.querySelector('.theme-icon-active') || document.querySelector('.theme-icon-active');
    const iconElement = root.querySelector(`[data-bs-theme-value="${theme}"] .theme-icon`) || document.querySelector(`[data-bs-theme-value="${theme}"] .theme-icon`);
    if (themeIconActive && iconElement) {
      themeIconActive.innerHTML = iconElement.outerHTML;
    }
  };
  const showActiveTheme = (theme) => {
    const toggles = root.querySelectorAll('[data-bs-theme-value]');
    toggles.forEach((element) => {
      element.classList.remove('active');
      element.setAttribute('aria-pressed', 'false');
    });
    const btnToActive = root.querySelector(`[data-bs-theme-value="${theme}"]`) || document.querySelector(`[data-bs-theme-value="${theme}"]`);
    if (!btnToActive) return;
    btnToActive.classList.add('active');
    btnToActive.setAttribute('aria-pressed', 'true');
    updateDropdownIcon(theme);
  };

  const preferredTheme = getPreferredTheme();
  setTheme(preferredTheme);
  showActiveTheme(preferredTheme);

  root.querySelectorAll('[data-bs-theme-value]').forEach((toggle) => {
    toggle.addEventListener('click', () => {
      const theme = toggle.getAttribute('data-bs-theme-value');
      localStorage.setItem('theme', theme);
      setTheme(theme);
      showActiveTheme(theme);
    });
  });
}

function reinitBootstrap(root) {
  if (!window.bootstrap) return;
  root.querySelectorAll('[data-bs-toggle="tooltip"]').forEach((el) => {
    window.bootstrap.Tooltip.getOrCreateInstance(el);
  });
  root.querySelectorAll('[data-bs-toggle="popover"]').forEach((el) => {
    window.bootstrap.Popover.getOrCreateInstance(el);
  });
  root.querySelectorAll('.needs-validation').forEach((form) => {
    form.addEventListener(
      'submit',
      (event) => {
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        }
        form.classList.add('was-validated');
      },
      false
    );
  });
}

export default function HtmlPage({ html, title, scripts = [] }) {
  const containerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = title;
  }, [title]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const handleClick = (event) => {
      const anchor = event.target.closest('a[data-internal-link="true"]');
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('http')) return;
      event.preventDefault();
      if (window.location.pathname !== href) {
        navigate(href);
      }
    };

    container.addEventListener('click', handleClick);
    return () => container.removeEventListener('click', handleClick);
  }, [html, navigate]);

  useEffect(() => {
    let cancelled = false;
    const loadedScripts = [];

    const loadScript = (src) =>
      new Promise((resolve, reject) => {
        if (document.querySelector(`script[data-page-script="${src}"]`)) {
          resolve();
          return;
        }
        const script = document.createElement('script');
        script.src = src;
        script.async = false;
        script.dataset.pageScript = src;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load ${src}`));
        document.body.appendChild(script);
        loadedScripts.push(script);
      });

    const run = async () => {
      for (const src of scripts) {
        if (cancelled) return;
        await loadScript(src);
      }
      if (cancelled) return;
      const container = containerRef.current;
      if (container) {
        reinitThemeHandlers(container);
        reinitBootstrap(container);
      }
    };

    run();

    return () => {
      cancelled = true;
      loadedScripts.forEach((script) => script.remove());
    };
  }, [html, scripts]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    reinitThemeHandlers(container);
    reinitBootstrap(container);
  }, [html]);

  return <div ref={containerRef} dangerouslySetInnerHTML={{ __html: html }} />;
}
