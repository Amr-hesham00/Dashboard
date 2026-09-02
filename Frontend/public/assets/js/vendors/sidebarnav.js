(function () {
  function initSidebarNav() {
    // Prevent submenu from closing the main dropdown
    const dropdownSubmenus = document.querySelectorAll('.dropdown-submenu');
    dropdownSubmenus.forEach((submenu) => {
      submenu.addEventListener('click', (event) => {
        const submenuDropdown = submenu.querySelector('.dropdown-menu');
        const targetLink = event.target.closest('a');
        if (targetLink && targetLink.getAttribute('href') !== '#!') {
          return;
        }
        event.stopPropagation();
        event.preventDefault();
        if (submenuDropdown) {
          submenuDropdown.classList.toggle('show');
        }
      });
    });

    var currentUrl = window.location.href;
    var currentPath = window.location.pathname;
    if (currentPath.startsWith('/')) {
      currentPath = currentPath.substring(1);
    }

    document.querySelectorAll('#miniSidebar .nav-item .nav-link, #miniSidebar .dropdown-item').forEach(function (link) {
      var linkHref = link.getAttribute('href');
      if (!linkHref || linkHref === '#') return;
      if (linkHref.startsWith('/')) {
        linkHref = linkHref.substring(1);
      }
      if (linkHref === currentPath || link.href === currentUrl) {
        link.classList.add('active');
        if (link.closest('.dropdown-menu')) {
          var parentDropdown = link.closest('.dropdown')?.querySelector('.dropdown-toggle');
          if (parentDropdown) {
            parentDropdown.classList.add('active');
            parentDropdown.setAttribute('aria-expanded', 'true');
            var dropdownMenu = parentDropdown.nextElementSibling;
            if (dropdownMenu) dropdownMenu.classList.add('show');
          }
          if (link.closest('.dropdown-submenu')) {
            var parentSubmenu = link.closest('.dropdown-submenu')?.querySelector('.dropdown-toggle');
            if (parentSubmenu) {
              parentSubmenu.classList.add('active');
              parentSubmenu.setAttribute('aria-expanded', 'true');
              var submenu = parentSubmenu.nextElementSibling;
              if (submenu) submenu.classList.add('show');
            }
          }
        }
      }
    });
  }

  function setSidebarHeight() {
    const sidebar = document.getElementById('miniSidebar');
    const content = document.getElementById('content');
    if (sidebar && content) {
      const contentHeight = content.getBoundingClientRect().height;
      const viewportHeight = window.innerHeight;
      const offset = 45;
      sidebar.style.height = `${Math.max(viewportHeight - offset, contentHeight)}px`;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSidebarNav);
  } else {
    initSidebarNav();
  }

  window.addEventListener('resize', setSidebarHeight);

  const contentEl = document.getElementById('content');
  if (contentEl && !window._sidebarObserver) {
    window._sidebarObserver = new MutationObserver(setSidebarHeight);
    window._sidebarObserver.observe(contentEl, { childList: true, subtree: true });
  }
})();
