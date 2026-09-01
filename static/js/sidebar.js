/* static/js/sidebar.js
   - Carrega components/sidebar.html via fetch e injeta em #sidebar-container
   - Detecta a página atual via window.location.pathname e aplica .active no link correspondente
   - Controla abertura/fechamento no mobile (adiciona/remover class 'sidebar-open' no body)
   - Controla submenus (aria-expanded) e salva estado em localStorage para persistência simples
*/

/* IIFE para isolar o escopo */
(function () {
  // ID do container onde o HTML da sidebar será injetado
  const SIDEBAR_CONTAINER = '#sidebar-container';
  const SIDEBAR_PATH = 'components/sidebar.html';
  const STORAGE_KEY = 'erp.sidebar.submenus';

  // Carrega e inicializa a sidebar
  async function initSidebar() {
    const container = document.querySelector(SIDEBAR_CONTAINER);
    if (!container) return;

    try {
      const res = await fetch(SIDEBAR_PATH, { cache: 'no-store' });
      if (!res.ok) throw new Error('Falha ao carregar Sidebar');
      const html = await res.text();
      container.innerHTML = html;

      // Permitir que o conteúdo seja acessível agora
      container.querySelectorAll('[aria-hidden]').forEach(el => el.removeAttribute('aria-hidden'));

      bindSidebarEvents(container);
      highlightActiveLink(container);
      restoreSubmenuState(container);
    } catch (err) {
      // Em produção, reportar/logar; aqui mostramos mensagem simples
      container.innerHTML = '<div class="sidebar-error">Não foi possível carregar o menu.</div>';
      console.error('sidebar.js:', err);
    }
  }

  // Destaca automaticamente o link correspondente à página atual
  function highlightActiveLink(container) {
    // path de referência: uso pathname (ex: /pages/previsao.html ou /index.html)
    const current = window.location.pathname || '/index.html';
    // Normalizar removendo eventual barra final
    const normalized = current.replace(/\/+$/, '');

    // Procurar link cujo data-path corresponda exatamente ao normalized ou que termine com same filename
    const links = container.querySelectorAll('.nav-link');
    let matched = false;
    links.forEach(link => {
      const target = link.getAttribute('data-path') || link.getAttribute('href') || '';
      const normTarget = target.replace(/\/+$/, '');
      if (normTarget === normalized || (normTarget.endsWith(normalized) && normalized !== '')) {
        link.classList.add('active');
        matched = true;
        // expand parent submenu se houver
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

    // Caso nenhum link exato encontrado, tentar combinar pelo filename
    if (!matched) {
      const filename = normalized.split('/').pop();
      links.forEach(link => {
        const href = (link.getAttribute('href') || '');
        if (href.endsWith(filename)) link.classList.add('active');
      });
    }
  }

  // Bind de eventos de toggle e submenus
  function bindSidebarEvents(container) {
    // Toggle global control (botão no header)
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
        // alterna
        if (document.body.classList.contains('sidebar-open')) closeSidebar(); else openSidebar();
      });
    }
    if (closeButton) {
      closeButton.addEventListener('click', () => closeSidebar());
    }

    // Fechar ao clicar fora (mobile)
    document.addEventListener('click', (ev) => {
      if (!document.body.classList.contains('sidebar-open')) return;
      const target = ev.target;
      if (!container.contains(target) && ! (toggleButton && toggleButton.contains(target))) {
        closeSidebar();
      }
    });

    // Submenu toggles
    container.querySelectorAll('.submenu-toggle').forEach(btn => {
      const submenu = btn.parentElement.querySelector('.submenu');
      btn.addEventListener('click', () => {
        const expanded = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', (!expanded).toString());
        if (submenu) submenu.hidden = expanded;
        saveSubmenuState(); // persistir estado
      });
    });

    // Accessibility: trap focus could be added aqui (futuro)
  }

  // Salva estado dos submenus em localStorage
  function saveSubmenuState() {
    try {
      const toggles = document.querySelectorAll('.submenu-toggle');
      const state = Array.from(toggles).map(btn => btn.getAttribute('aria-expanded') === 'true');
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      // Ignorar se localStorage não disponível
    }
  }

  // Restaura estado dos submenus
  function restoreSubmenuState(container) {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const arr = JSON.parse(raw);
      const toggles = container.querySelectorAll('.submenu-toggle');
      toggles.forEach((btn, i) => {
        const expanded = !!arr[i];
        btn.setAttribute('aria-expanded', expanded.toString());
        const submenu = btn.parentElement.querySelector('.submenu');
        if (submenu) submenu.hidden = !expanded;
      });
    } catch (e) {
      // ignore
    }
  }

  // Inicializa quando DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSidebar);
  } else {
    initSidebar();
  }

})();