// static/js/logo.js
// Atualizado para trabalhar com os SVGs que você providenciou:
// - Logo_Supersonic-01.svg (color / header claro)
// - Logo_Supersonic-05.svg (white / header/sidebar escuro)
// O script respeita .logo-on-dark / .logo-on-light e body.theme-dark.

(function () {
  function updateLogos() {
    const darkContext = document.body.classList.contains('theme-dark');

    // Forçar branco onde container indica explicitamente logo-on-dark
    document.querySelectorAll('.logo-on-dark').forEach(container => {
      container.querySelectorAll('img.logo-color').forEach(i => i.style.display = 'none');
      container.querySelectorAll('img.logo-white').forEach(i => i.style.display = 'block');
    });

    // Para containers marcados logo-on-light, preferir colorida
    document.querySelectorAll('.logo-on-light').forEach(container => {
      container.querySelectorAll('img.logo-color').forEach(i => i.style.display = 'block');
      container.querySelectorAll('img.logo-white').forEach(i => i.style.display = 'none');
    });

    // Se o body tiver theme-dark e não houver marcação específica, aplicar globalmente
    if (darkContext) {
      document.querySelectorAll('img.logo-color').forEach(i => {
        if (i.closest('.logo-on-light')) return;
        i.style.display = 'none';
      });
      document.querySelectorAll('img.logo-white').forEach(i => {
        if (i.closest('.logo-on-light')) return;
        i.style.display = 'block';
      });
    } else {
      document.querySelectorAll('img.logo-color').forEach(i => {
        if (i.closest('.logo-on-dark')) return;
        i.style.display = 'block';
      });
      document.querySelectorAll('img.logo-white').forEach(i => {
        if (i.closest('.logo-on-dark')) return;
        i.style.display = 'none';
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateLogos);
  } else {
    updateLogos();
  }

  window.__erpToggleTheme = function (theme) {
    if (theme === 'dark') document.body.classList.add('theme-dark');
    else document.body.classList.remove('theme-dark');
    updateLogos();
  };

  const observer = new MutationObserver(mutations => {
    for (const m of mutations) {
      if (m.type === 'attributes' && m.attributeName === 'class') {
        updateLogos();
        break;
      }
    }
  });
  observer.observe(document.body, { attributes: true });
})();