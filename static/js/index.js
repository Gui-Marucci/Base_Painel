// static/js/index.js (versão robusta)
// Substitua o arquivo atual por este. Ele tenta múltiplos caminhos e valida a resposta JSON antes do parse.

(function () {
  const IDS = {
    previsao: 'indicator-previsao',
    orcamentos: 'indicator-orcamentos',
    recibos: 'indicator-recibos',
    widgetPrevisto: 'widget-total-previsto',
    widgetOrcamentos: 'widget-total-orcamentos',
    widgetRecibosHoje: 'widget-recibos-hoje'
  };

  function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  // monta candidatos resolvendo em relação a várias bases (document.baseURI, origin, current dir)
  function makeCandidates(filename) {
    const bases = [
      document.baseURI,
      window.location.origin + '/',
      window.location.origin + window.location.pathname.replace(/\/[^\/]*$/, '/')
    ];
    const candidates = new Set();
    bases.forEach(b => {
      try { candidates.add(new URL(filename, b).href); } catch(e){}
      try { candidates.add(new URL('../' + filename, b).href); } catch(e){}
      try { candidates.add(new URL('../../' + filename, b).href); } catch(e){}
      try { candidates.add(new URL('/' + filename, b).href); } catch(e){}
    });
    return Array.from(candidates);
  }

  // tenta os paths em sequência e retorna o primeiro Response.ok
  async function fetchFirstJson(paths) {
    for (const p of paths) {
      try {
        console.debug('index.js: tentando', p);
        const res = await fetch(p, { cache: 'no-store' });
        if (!res) {
          console.warn('index.js: resposta vazia para', p);
          continue;
        }
        if (!res.ok) {
          console.warn('index.js: status não OK para', p, res.status);
          continue;
        }
        const contentType = res.headers.get('content-type') || '';
        const text = await res.text(); // ler como texto primeiro para validar
        if (!text || text.trim().length === 0) {
          console.warn('index.js: resposta vazia para', p);
          continue;
        }
        if (!contentType.includes('application/json') && !text.trim().startsWith('{') && !text.trim().startsWith('[')) {
          console.warn('index.js: conteúdo não parece JSON para', p, 'content-type=', contentType);
          // ainda tentamos parsear se for algo que parece JSON
        }
        try {
          const json = JSON.parse(text);
          console.debug('index.js: parse JSON OK em', p);
          return json;
        } catch (parseErr) {
          console.warn('index.js: falha ao parsear JSON de', p, parseErr);
          continue;
        }
      } catch (fetchErr) {
        console.warn('index.js: erro ao fetch', p, fetchErr);
        continue;
      }
    }
    throw new Error('Nenhum dos paths retornou JSON válido');
  }

  async function loadIndicators() {
    const previsaoCandidates = makeCandidates('data/previsoes.json');
    const orcamentosCandidates = makeCandidates('data/orcamentos.json');
    const recibosCandidates = makeCandidates('data/recibos.json');

    // PREVISÕES
    try {
      const data = await fetchFirstJson(previsaoCandidates);
      const total = (Array.isArray(data) ? data : []).reduce((s, item) => s + (Number(item.valorPrevisto) || 0), 0);
      setText(IDS.previsao, total > 0 ? `R$ ${total.toLocaleString('pt-BR')}` : 'R$ 0,00');
      setText(IDS.widgetPrevisto, total > 0 ? `R$ ${total.toLocaleString('pt-BR')}` : 'R$ 0,00');
    } catch (err) {
      setText(IDS.previsao, '—');
      setText(IDS.widgetPrevisto, '—');
      console.info('index.js: previsoes.json não disponível (mock).', err);
    }

    // ORÇAMENTOS
    try {
      const data = await fetchFirstJson(orcamentosCandidates);
      setText(IDS.orcamentos, (Array.isArray(data) ? data.length : 0) || '—');
      setText(IDS.widgetOrcamentos, (Array.isArray(data) ? data.length : 0) || '—');
    } catch (err) {
      setText(IDS.orcamentos, '—');
      setText(IDS.widgetOrcamentos, '—');
      console.info('index.js: orcamentos.json não disponível (mock).', err);
    }

    // RECIBOS
    try {
      const data = await fetchFirstJson(recibosCandidates);
      const today = new Date().toISOString().slice(0, 10);
      const hojeCount = (Array.isArray(data) ? data.filter(r => (r.data || '').startsWith(today)).length : 0);
      setText(IDS.recibos, hojeCount || '0');
      setText(IDS.widgetRecibosHoje, hojeCount || '0');
    } catch (err) {
      setText(IDS.recibos, '—');
      setText(IDS.widgetRecibosHoje, '—');
      console.info('index.js: recibos.json não disponível (mock).', err);
    }
  }

  function syncSidebarToggle() {
    const toggle = document.getElementById('sidebar-toggle');
    if (!toggle) return;
    const obs = new MutationObserver(() => {
      const open = document.body.classList.contains('sidebar-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    obs.observe(document.body, { attributes: true, attributeFilter: ['class'] });
  }

  function init() {
    loadIndicators();
    syncSidebarToggle();
    document.querySelectorAll('.card').forEach(card => {
      card.addEventListener('click', (ev) => {
        card.classList.add('card-activated');
        setTimeout(() => card.classList.remove('card-activated'), 300);
      });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();