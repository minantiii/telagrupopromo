// Abas + lista das últimas promos. O bot publica promos.json e as fotos na
// branch 'promos' do GitHub (fora da main, para não gerar deploy no Netlify).
(function () {
    var abas = document.querySelectorAll('.tab');

    function abrir(nome) {
        abas.forEach(function (t) { t.classList.toggle('ativa', t.dataset.aba === nome); });
        document.getElementById('aba-grupos').hidden = nome !== 'grupos';
        document.getElementById('aba-promos').hidden = nome !== 'promos';
    }

    abas.forEach(function (t) {
        t.addEventListener('click', function () {
            abrir(t.dataset.aba);
            history.replaceState(null, '', t.dataset.aba === 'promos' ? '#promos' : location.pathname);
        });
    });
    if (location.hash === '#promos') abrir('promos');

    function esc(s) {
        return s.replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }

    function linkar(texto) {
        return esc(texto).replace(/https?:\/\/[^\s<]+/g, function (u) {
            return '<a href="' + u + '" target="_blank" rel="noopener">' + u + '</a>';
        });
    }

    function quando(iso) {
        var min = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
        if (min < 1) return 'agora mesmo';
        if (min < 60) return 'há ' + min + ' min';
        var h = Math.round(min / 60);
        if (h < 24) return 'há ' + h + 'h';
        return new Date(iso).toLocaleDateString('pt-BR');
    }

    var DADOS = 'https://raw.githubusercontent.com/minantiii/telagrupopromo/promos/';
    var promos = [];
    var ultimoId = null;

    function render() {
        var lista = document.getElementById('lista-promos');
        if (!promos.length) {
            lista.innerHTML = '<p class="vazio">Nenhuma promo por aqui ainda. Entra no grupo que chega rapidinho! ⚡</p>';
            return;
        }
        lista.innerHTML = promos.map(function (p) {
            var link = (p.texto.match(/https?:\/\/[^\s]+/) || [])[0];
            return '<article class="promo-card">' +
                (p.img ? '<img loading="lazy" src="' + esc(DADOS + p.img) + '" alt="">' : '') +
                '<div class="promo-texto">' + linkar(p.texto) + '</div>' +
                (link ? '<a class="promo-botao" href="' + esc(link) + '" target="_blank" rel="noopener">🛒 Ir para a oferta</a>' : '') +
                '<span class="promo-hora">' + quando(p.data) + '</span>' +
                '</article>';
        }).join('');
        ultimoId = promos[0].id;
    }

    // Busca a lista ao abrir e depois a cada 60s, sem recarregar a página.
    function atualizar() {
        fetch(DADOS + 'promos.json?t=' + Date.now(), { cache: 'no-store' })
            .then(function (r) { if (!r.ok) throw r.status; return r.json(); })
            .then(function (lista) {
                promos = lista || [];
                if (!promos.length || promos[0].id !== ultimoId) render();
            })
            .catch(function () {
                if (ultimoId === null) render();
            });
    }

    atualizar();
    setInterval(atualizar, 60000);
})();
