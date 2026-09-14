// static/js/sidebar.js (versão mais resiliente)
(function () {
  const SIDEBAR_CONTAINER = '#sidebar-container';
  // bases candidatas: document.baseURI (resolve corretamente quando página está em subpasta),
  // location.origin (site root), e algumas variações práticas.
  const bases = [
    document.baseURI,                   // ex: "http://127.0.0.1:5500"/pages/
    window.location.origin + '/',       // ex: "http://127.0.0.1:5500"/
    window.location.origin + window.location.pathname.replace(/\/[^\/]*$/, '/') // current dir
  ];

  /* ==================================================
   SIDEBAR
================================================== */

async function initSidebar() {

    const container =
        document.querySelector(
            "#sidebar-container"
        );

    if (!container) return;

    try {

        const response =
            await fetch(
                "/components/sidebar.html"
            );

        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );

        }

        const html =
            await response.text();

        container.innerHTML = html;

        registerSidebarEvents();

        if (window.lucide) {
            lucide.createIcons();
        }

    } catch (error) {

        console.error(
            "Sidebar:",
            error
        );

    }

}

document.addEventListener(
    "DOMContentLoaded",
    initSidebar
);

  /* (mantém as funções auxiliares existentes: highlightActiveLink, bindSidebarEvents,
     saveSubmenuState, restoreSubmenuState) — copie-as do arquivo original sem alteração. */

  // --- código auxiliar: copie do sidebar.js anterior ---
  function highlightActiveLink(container) {
    const current = window.location.pathname || '/index.html';
    const normalized = current.replace(/\/+$/, '');
    const links = container.querySelectorAll('.nav-link');
    let matched = false;
    links.forEach(link => {
      const target = link.getAttribute('data-path') || link.getAttribute('href') || '';
      const normTarget = target.replace(/\/+$/, '');
      if (normTarget === normalized || (normTarget.endsWith(normalized) && normalized !== '')) {
        link.classList.add('active');
        matched = true;
        const parentSubmenu = link.closest('.submenu');
        if (parentSubmenu) {
          parentSubmenu.hidden = false;
          const toggle = parentSubmenu.previousElementSibling;
          if (toggle && toggle.classList.contains('submenu-toggle')) {
            toggle.setAttribute('aria-expanded', 'true');
          }
        }
      } else {
        link.classList.remove('active');
      }
    });
    if (!matched) {
      const filename = normalized.split('/').pop();
      links.forEach(link => {
        const href = (link.getAttribute('href') || '');
        if (href.endsWith(filename)) link.classList.add('active');
      });
    }
  }

  function bindSidebarEvents(container) {
    const toggleButton = document.querySelector('#sidebar-toggle');
    const closeButton = container.querySelector('#sidebar-close');

    function openSidebar() {
      document.body.classList.add('sidebar-open');
      if (toggleButton) toggleButton.setAttribute('aria-expanded', 'true');
    }
    function closeSidebar() {
      document.body.classList.remove('sidebar-open');
      if (toggleButton) toggleButton.setAttribute('aria-expanded', 'false');
    }

    if (toggleButton) {
      toggleButton.addEventListener('click', () => {
        if (document.body.classList.contains('sidebar-open')) closeSidebar(); else openSidebar();
      });
    }
    if (closeButton) {
      closeButton.addEventListener('click', () => closeSidebar());
    }

    document.addEventListener('click', (ev) => {
      if (!document.body.classList.contains('sidebar-open')) return;
      const target = ev.target;
      if (!container.contains(target) && !(toggleButton && toggleButton.contains(target))) {
        closeSidebar();
      }
    });

    container.querySelectorAll('.submenu-toggle').forEach(btn => {
      const submenu = btn.parentElement.querySelector('.submenu');
      btn.addEventListener('click', () => {
        const expanded = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', (!expanded).toString());
        if (submenu) submenu.hidden = expanded;
        saveSubmenuState();
      });
    });
  }

  function saveSubmenuState() {
    try {
      const toggles = document.querySelectorAll('.submenu-toggle');
      const state = Array.from(toggles).map(btn => btn.getAttribute('aria-expanded') === 'true');
      localStorage.setItem('erp.sidebar.submenus', JSON.stringify(state));
    } catch (e) { /* ignore */ }
  }

  function restoreSubmenuState(container) {
    try {
      const raw = localStorage.getItem('erp.sidebar.submenus');
      if (!raw) return;
      const arr = JSON.parse(raw);
      const toggles = container.querySelectorAll('.submenu-toggle');
      toggles.forEach((btn, i) => {
        const expanded = !!arr[i];
        btn.setAttribute('aria-expanded', expanded.toString());
        const submenu = btn.parentElement.querySelector('.submenu');
        if (submenu) submenu.hidden = !expanded;
      });
    } catch (e) { /* ignore */ }
  }
  // --- fim das funções auxiliares ---

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initSidebar);
  else initSidebar();
})();