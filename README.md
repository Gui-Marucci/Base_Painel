                      Previsão                    


Fazer a previsão com upload de planilha para fazer o comparativo visual. 

                   O cabeçalho consiste nestas colunas:               

PREV	EMISSÃO	Nº DOCTO	TIPO	FORNECEDOR	VL. LIQ	REFERENCIA	CLASSIFICAÇÃO SSONIC	USU. INCLUSÃO


Devemos adaptar o modelo atual para conter o campo de upload destas planilhas e o preenchimento automático de das informações e formulas 
onde o arquivo puxa das contas pagas e faz um comparativo da previsão versus o que foi pago. com com um campo extra de em 
reais positivos(verde) negativos(vermelho) e porcentagem positiva/negativa.





Resumo para reproduzir o estado do chat / projeto (prompt reutilizável)

Você é um desenvolvedor que recebeu um protótipo de ERP (ERP Previsao de pagamentos).
Contexto:
- Projeto modular estático (HTML/CSS/JS), sem Jinja.
- Estrutura esperada (exemplo):
  BaseV2/
    components/sidebar.html
    core/data/*.json
    pages/*.html
    static/css/*.css
    static/js/*.js
    static/img/*.svg
    tamplates/index.html

Tarefas que já foram feitas:
- index.html como hub com container #sidebar-container.
- Sidebar em components/sidebar.html, carregada via fetch por static/js/sidebar.js.
- CSS modular com static/css/geral.css (variáveis, layout, centralização).
- static/js/index.js carrega data/*.json (com fallback multi-path e validação).
- static/js/logo.js troca variantes dos SVGs quando theme-dark ou containers do tipo .logo-on-dark.

Problemas resolvidos:
- Fetch falhando em file:// → instruir uso de servidor (Live Server ou python -m http.server).
- Paths relativos causando 404 → scripts agora testam vários caminhos (/, relative, ../, ../../).
- JSON parsing falhando → index.js valida res.ok e conteúdo antes de JSON.parse.

O que fazer agora (passos imediatos, em camadas)
1) Garantir layout:
   - Aplicar CSS (geral.css) para `.app-root { grid-template-columns: var(--sidebar-width) 1fr }`.
   - `.container { max-width:1100px; margin:0 auto; }` para centralizar conteúdo.
2) Teste visual:
   - Desktop: sidebar fixa à esquerda; topbar no topo da coluna do main; conteúdo centralizado.
   - Mobile: botão #sidebar-toggle alterna class `body.sidebar-open` e sidebar off-canvas.
3) Corrigir sidebar:
    -  A Sidebar deve ocupar UMA COLUNA no layout (grid) e não ficar em cima do conteúdo do index.
    - No desktop: sidebar participa do fluxo (coluna esquerda); no mobile: sidebar vira off-canvas via toggle.
    - Evitar position:fixed para desktop; usar fixed apenas em mobile.
Comandos úteis
- Rodar servidor simples:
  - Live Server: "Open with Live Server" no VSCode (recomenda-se abrir a raiz do projeto)
- Encontrar arquivos:
Logs a observar no DevTools
- `sidebar.js: tentando ...`
- `sidebar.js: carregou sidebar de ...`
- `index.js: tentando ...`
- `index.js: parse JSON OK em ...` ou mensagens de fallback

Resultado esperado (descrição para validação final)
- Página hub com sidebar fixa, header no topo da area principal, cards e widgets centralizados e responsivos.
- Console sem 404 persistentes relacionados à sidebar; apenas tentativas que resultaram em sucesso (ou mensagens de filtro se base suspeita foi ignorada).
- Index populando indicadores com dados mock quando JSONs estiverem acessíveis.

Use este prompt para reconstituir o estado atual em uma nova estação de trabalho: garanta que as pastas e arquivos mencionados existam, inicie um servidor, abra a página e siga os logs do console.

```}