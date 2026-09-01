/* static/js/index.js
   Script da index:
   - Inicializa indicadores básicos tentando carregar data/*.json via fetch
   - Fornece feedback visual (carregando / erro)
   - Conecta-se com a API da sidebar via toggle (garante sincronia de aria-expanded)
   - Comentários explicam pontos de extensão para trocar JSON por API
*/

(function () {
  // IDs dos indicadores presentes no index.html
  const IDS = {
    previsao: 'indicator-previsao',
    orcamentos: 'indicator-orcamentos',
    recibos: 'indicator-recibos',
    widgetPrevisto: 'widget-total-previsto',
    widgetOrcamentos: 'widget-total-orcamentos',
    widgetRecibosHoje: 'widget-recibos-hoje'
  };

  // Função utilitária para escrever valor em elemento por ID
  function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  // Tenta carregar JSONs de exemplo; se falhar, deixa placeholders
  async function loadIndicators() {
    // Previsoes: somatória mínima de valores previstos (mock)
    try {
      const res = await fetch('/data/previsoes.json', { cache: 'no-store' });
      if (!res.ok) throw new Error('previsoes.json não encontrado');
      const data = await res.json();
      // Exemplo simples: somar campo valorPrevisto
      const total = (data || []).reduce((s, item) => s + (Number(item.valorPrevisto) || 0), 0);
      setText(IDS.previsao, total > 0 ? `R$ ${total.toLocaleString('pt-BR')}` : 'R$ 0,00');
      setText(IDS.widgetPrevisto, total > 0 ? `R$ ${total.toLocaleString('pt-BR')}` : 'R$ 0,00');
    } catch (err) {
      // Estado vazio / TODO: conectar API real
      setText(IDS.previsao, '—');
      setText(IDS.widgetPrevisto, '—');
      console.info('index.js: previsoes.json não disponível (ainda em mock).', err);
    }

    // Orcamentos: contar itens
    try {
      const res = await fetch('/data/orcamentos.json', { cache: 'no-store' });
      if (!res.ok) throw new Error('orcamentos.json não encontrado');
      const data = await res.json();
      setText(IDS.orcamentos, (data || []).length || '—');
      setText(IDS.widgetOrcamentos, (data || []).length || '—');
    } catch (err) {
      setText(IDS.orcamentos, '—');
      setText(IDS.widgetOrcamentos, '—');
      console.info('index.js: orcamentos.json não disponível (ainda em mock).', err);
    }

    // Recibos: filtrar por data de hoje (mock)
    try {
      const res = await fetch('/data/recibos.json', { cache: 'no-store' });
      if (!res.ok) throw new Error('recibos.json não encontrado');
      const data = await res.json();
      const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
      const hojeCount = (data || []).filter(r => (r.data || '').startsWith(today)).length;
      setText(IDS.recibos, hojeCount || '0');
      setText(IDS.widgetRecibosHoje, hojeCount || '0');
    } catch (err) {
      setText(IDS.recibos, '—');
      setText(IDS.widgetRecibosHoje, '—');
      console.info('index.js: recibos.json não disponível (ainda em mock).', err);
    }
  }

  // Sincroniza o estado do botão toggle se a sidebar for aberta manualmente (por sidebar.js)
  function syncSidebarToggle() {
    const toggle = document.getElementById('sidebar-toggle');
    if (!toggle) return;
    // observar mudanças na class do body para atualizar aria-expanded
    const obs = new MutationObserver(() => {
      const open = document.body.classList.contains('sidebar-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    obs.observe(document.body, { attributes: true, attributeFilter: ['class'] });
  }

  // Inicialização quando DOM pronto
  function init() {
    loadIndicators();
    syncSidebarToggle();

    // Exemplo de feedback: anima botão quando clicar em um card
    document.querySelectorAll('.card').forEach(card => {
      card.addEventListener('click', (ev) => {
        // For accessibility: se o click foi por tecla, permit default; se for link, deixa o navegador navegar.
        // Adicionamos uma classe temporária para efeito visual.
        card.classList.add('card-activated');
        setTimeout(() => card.classList.remove('card-activated'), 300);
      });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

})();