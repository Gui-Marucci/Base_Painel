// static/js/logo.js
// Troca a visibilidade das variantes do logo com base no contexto visual.
// - Se sidebar/header estiver em modo escuro (classe .logo-on-dark ou body.theme-dark) exibe logo-white
// - Caso contrário exibe logo-color
(function () {
  function updateLogos() {
    const darkContext = document.body.classList.contains('theme-dark');
    // elementos que podem conter logos com a convenção logo-color / logo-white
    document.querySelectorAll('.brand-logo').forEach(img => {
      // mantém comportamento por atributo data-variant se necessário
    });

    // Logo groups: se o container (ou seu ancestor) tem classe logo-on-dark, forçar branco
    document.querySelectorAll('.logo-on-dark').forEach(container => {
      // esconder qualquer .logo-color dentro do container e mostrar .logo-white
      container.querySelectorAll('img.logo-color').forEach(i => i.style.display = 'none');
      container.querySelectorAll('img.logo-white').forEach(i => i.style.display = 'block');
    });

    // Para containers sem logo-on-dark: usar o tema geral
    document.querySelectorAll('.logo-on-light, body').forEach(container => {
      // se estiver no body e tema escuro ativado, forçar branco
      if (container === document.body && darkContext) {
        // body + theme-dark -> forçar branco em todas as áreas não explicitamente marcadas?
        document.querySelectorAll('img.logo-color').forEach(i => i.style.display = 'none');
        document.querySelectorAll('img.logo-white').forEach(i => i.style.display = 'block');
      } else {
        // padrão: mostrar color, esconder white
        container.querySelectorAll('img.logo-color').forEach(i => i.style.display = 'block');
        container.querySelectorAll('img.logo-white').forEach(i => i.style.display = 'none');
      }
    });
  }

  // Run on load
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', updateLogos);
  else updateLogos();

  // Expõe função para trocar tema (opcional)
  window.__erpToggleTheme = function (theme) {
    if (theme === 'dark') document.body.classList.add('theme-dark');
    else document.body.classList.remove('theme-dark');
    updateLogos();
  };
})();