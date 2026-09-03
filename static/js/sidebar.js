// static/js/sidebar.js (versão mais resiliente)
// Tenta carregar components/sidebar.html a partir de várias bases
(function () {
  const SIDEBAR_CONTAINER = '#sidebar-container';
  // bases candidatas: document.baseURI (resolve corretamente quando página está em subpasta),
  // location.origin (site root), e algumas variações práticas.
  const bases = [
    document.baseURI,                   // ex: http://localhost:5500/pages/
    window.location.origin + '/',       // ex: http://localhost:5500/
    window.location.origin + window.location.pathname.replace(/\/[^\/]*$/, '/') // current dir
  ];

  // Gera candidatos resolvendo 'components/sidebar.html' contra cada base
  function makeCandidates() {
    const candidates = new Set();
    bases.forEach(b => {
      try {
        const url = new URL('components/sidebar.html', b).href;
        candidates.add(url);
      } catch (e) { /* ignore */ }
      // também tente com ../components e ../../components (por precaução)
      try { candidates.add(new URL('../components/sidebar.html', b).href); } catch(e){}
      try { candidates.add(new URL('../../components/sidebar.html', b).href); } catch(e){}
      try { candidates.add(new URL('/components/sidebar.html', b).href); } catch(e){}
    });
    return Array.from(candidates);
  }

  async function fetchFirstAvailable(urls) {
    for (const u of urls) {
      try {
        console.debug('sidebar.js: tentando', u);
        const res = await fetch(u, { cache: 'no-store' });
        if (res && res.ok) {
          console.debug('sidebar.js: carregou sidebar de', u);
          return res.text();
        } else {
          console.warn('sidebar.js: tentativa falhou', u, res && res.status);
        }
      } catch (err) {
        console.warn('sidebar.js: erro ao tentar fetch', u, err);
      }
    }
    throw new Error('Nenhum dos paths de sidebar respondeu com 200');
  }

  async function initSidebar() {
    const container = document.querySelector(SIDEBAR_CONTAINER);
    if (!container) {
      console.warn('sidebar.js: container não encontrado:', SIDEBAR_CONTAINER);
      return;
    }

    const candidates = makeCandidates();
    try {
      const html = await fetchFirstAvailable(candidates);
      container.innerHTML = html;
      container.querySelectorAll('[aria-hidden]').forEach(el => el.removeAttribute('aria-hidden'));
      bindSidebarEvents(container);
      highlightActiveLink(container);
      restoreSubmenuState(container);
    } catch (err) {
      container.textContent = 'Não foi possível carregar o menu.';
      console.error('sidebar.js: Falha ao carregar Sidebar', err);
      console.error('sidebar.js: paths testados:', candidates);
    }
  }

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