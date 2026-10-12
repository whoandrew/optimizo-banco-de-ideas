(function () {
  'use strict';
  var DATA = window.DATA || { cats: [], ideas: [] };
  var KEY = 'optimizo-ideas-decisiones-v1';
  var CRIT = { rec: ['Recomendada', 'ins--rec'], dud: ['Dudosa', 'ins--dud'], mala: ['Mala idea', 'ins--mala'] };
  var MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  // Los titulares dicen la conclusión, no el tema (regla de presentaciones de la marca).
  var TITULOS = [
    '{n} ideas para contar el camino hasta el 3 de noviembre',
    '{n} ideas para que nos conozcan por nuestros nombres',
    '{n} ideas para mostrar lo que ya funciona',
    '{n} ideas para explicar la IA sin jerga',
    '{n} ideas pensadas para que nos compartan',
    '{n} ideas para conversar con quien nos mira',
    '{n} ideas para llegar al evento con reuniones agendadas',
    '{n} ideas que conviene cambiar o descartar'
  ];
  var SVG_CHECK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  var SVG_X = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var raiz = document.documentElement;

  function leer(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function guardar(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  var decisions = {};
  try { decisions = JSON.parse(leer(KEY) || '{}') || {}; } catch (e) { decisions = {}; }
  function save() { guardar(KEY, JSON.stringify(decisions)); }

  var deck = document.getElementById('deck');
  var slides = [], cur = -1, busy = false;

  function el(tag, cls, html) { var n = document.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function limpia(name) { return name.replace(/^\S+\s+/, ''); }
  function fmtDate(s) { if (!s) return ''; var p = s.split('-'); return parseInt(p[2], 10) + ' ' + MONTHS[parseInt(p[1], 10) - 1]; }
  function daysLeft() { var now = new Date(); now.setHours(0, 0, 0, 0); return Math.max(0, Math.round((new Date(2026, 10, 3) - now) / 86400000)); }
  function ideasOf(cat) { return DATA.ideas.filter(function (i) { return i.cat === cat; }); }
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  // si la pestaña está en segundo plano las animaciones pueden pausarse: nunca dejamos la interfaz esperando
  function fin(anim, ms) { return Promise.race([anim.finished, wait(ms)]); }

  /* isotipo: el disco, la mordida y el punto que se escapa */
  function isotipo() {
    return '<svg class="iso" viewBox="0 0 138.305 138.305" role="img" aria-label="Optimizo"><defs>' +
      '<linearGradient id="gia" gradientUnits="userSpaceOnUse" x1="8.574219" y1="0" x2="43.152344" y2="0"><stop offset="0" stop-color="#91CEC4"/><stop offset="1" stop-color="#387E80"/></linearGradient>' +
      '<linearGradient id="gib" gradientUnits="userSpaceOnUse" x1="6.054688" y1="0" x2="144.359375" y2="0"><stop offset="0" stop-color="#91CEC4"/><stop offset="1" stop-color="#387E80"/></linearGradient></defs>' +
      '<g transform="translate(-6.054688 -2.601562)"><path fill="url(#gib)" fill-rule="evenodd" d="M 55.757812 5.390625 C 58.730469 10.496094 60.441406 16.425781 60.441406 22.753906 C 60.441406 41.851562 44.960938 57.332031 25.863281 57.332031 C 19.621094 57.332031 13.769531 55.667969 8.710938 52.773438 C 6.992188 58.804688 6.054688 65.167969 6.054688 71.753906 C 6.054688 109.945312 37.011719 140.90625 75.207031 140.90625 C 113.398438 140.90625 144.359375 109.945312 144.359375 71.753906 C 144.359375 33.5625 113.398438 2.601562 75.207031 2.601562 C 68.453125 2.601562 61.929688 3.585938 55.757812 5.390625 Z M 57.917969 71.753906 C 57.917969 62.207031 65.65625 54.464844 75.207031 54.464844 C 84.753906 54.464844 92.492188 62.207031 92.492188 71.753906 C 92.492188 81.300781 84.753906 89.042969 75.207031 89.042969 C 65.65625 89.042969 57.917969 81.300781 57.917969 71.753906 Z"/>' +
      '<path class="punto" fill="url(#gia)" d="M 8.574219 22.753906 C 8.574219 32.300781 16.316406 40.042969 25.863281 40.042969 C 35.414062 40.042969 43.152344 32.300781 43.152344 22.753906 C 43.152344 13.207031 35.414062 5.464844 25.863281 5.464844 C 16.316406 5.464844 8.574219 13.207031 8.574219 22.753906 Z"/></g></svg>';
  }

  /* ---------- láminas ---------- */
  function buildPortada() {
    var s = el('section', 'lamina visible activa portada');
    s.dataset.title = 'Portada';
    var plan = DATA.ideas.filter(function (i) { return i.ord; }).length;
    s.innerHTML =
      '<div class="portada__texto entra">' +
      '<span class="ceja" style="--d:0">Banco de ideas · TechAI Summit · 3 de noviembre</span>' +
      '<h1 class="titulo titulo--hero" style="--d:1">' + DATA.ideas.length + ' ideas.<br><span class="acento">Tú eliges cuáles se graban.</span></h1>' +
      '<p class="sub" style="--d:2">Cada categoría tiene su lámina. Lee la idea, decide y, al final, te queda el resumen de lo que vamos a grabar antes del evento.</p>' +
      '<div class="etiquetas" style="--d:3"><span class="etq"><i></i>Instagram y TikTok</span><span class="etq"><i></i>70 % video · 30 % posts</span><span class="etq"><i></i>Hasta el 31 de octubre</span></div>' +
      '<div class="numeros" style="--d:4">' +
      '<div class="numero ceramica"><b data-count="' + DATA.ideas.length + '">0</b><span>ideas para evaluar</span></div>' +
      '<div class="numero ceramica"><b data-count="' + DATA.cats.length + '">0</b><span>categorías</span></div>' +
      '<div class="numero ceramica"><b data-count="' + plan + '">0</b><span>publicaciones en el plan</span></div>' +
      '<div class="numero ceramica"><b data-count="' + daysLeft() + '">0</b><span>días para el evento</span></div>' +
      '</div></div>' +
      '<div class="portada__iso">' + isotipo() + '</div>';
    return s;
  }

  function buildComo() {
    var s = el('section', 'lamina como');
    s.dataset.title = 'Cómo funciona';
    s.innerHTML =
      '<div class="entra" style="display:grid;gap:16px"><span class="ceja" style="--d:0">Antes de empezar</span>' +
      '<h2 class="titulo titulo--1" style="--d:1">Cada idea se elige o se descarta<br>con un clic</h2></div>' +
      '<div class="pasos entra">' +
      '<div class="paso ceramica" style="--d:2"><span class="paso__n">01</span><h3>Lee la idea</h3><p>Cada tarjeta trae la idea, el criterio del equipo y de qué trata. Toca el texto para verlo completo.</p></div>' +
      '<div class="paso ceramica" style="--d:3"><span class="paso__n">02</span><h3>Decide</h3><p>Pulsa Elegir para grabarla o Descartar para sacarla. Si cambias de opinión, vuelve a pulsar el mismo botón.</p></div>' +
      '<div class="paso ceramica" style="--d:4"><span class="paso__n">03</span><h3>Mira el resumen</h3><p>En la última lámina ves lo elegido y lo descartado. Puedes copiarlo o descargarlo.</p></div>' +
      '</div>' +
      '<div class="leyenda entra" style="--d:5"><span class="ins ins--rec"><i></i>Recomendada · conviene grabarla</span><span class="ins ins--dud"><i></i>Dudosa · depende de ustedes</span><span class="ins ins--mala"><i></i>Mala idea · mejor cambiarla</span></div>';
    return s;
  }

  function buildCard(idea, i) {
    var c = el('article', 'idea ceramica');
    c.dataset.id = idea.id; c.dataset.sub = idea.sub || '';
    c.style.setProperty('--i', i);
    var cr = CRIT[idea.crit] || CRIT.dud;
    var parts = idea.title.split(' · ');
    var ceja = parts.length > 1 ? parts.shift() : '';
    var title = parts.join(' · ');
    var datos = '';
    if (idea.ord) datos += '<span class="dato dato--plan">Plan #' + idea.ord + ' · ' + fmtDate(idea.fecha) + '</span>';
    if (idea.dur) datos += '<span class="dato">' + esc(idea.dur) + '</span>';
    (idea.cam || []).forEach(function (n) { datos += '<span class="dato">' + esc(n) + '</span>'; });
    c.innerHTML =
      '<span class="sello sello--si">' + SVG_CHECK + '</span><span class="sello sello--no">' + SVG_X + '</span>' +
      '<div class="idea__top"><span class="ins ' + cr[1] + '"><i></i>' + cr[0] + '</span><span class="idea__fmt">' + esc(idea.format || '') + '</span></div>' +
      '<div>' + (ceja ? '<div class="idea__ceja">' + esc(ceja) + '</div>' : '') + '<h3>' + esc(title) + '</h3></div>' +
      '<p class="idea__que" title="Toca para ver completo"><span class="idea__rotulo">De qué trata</span>' + esc(idea.que) + '</p>' +
      '<div class="idea__meta">' + datos + '</div>' +
      '<div class="idea__acciones">' +
      '<button class="boton boton--sec ceramica" data-act="no" aria-pressed="false">' + SVG_X + '<span>Descartar</span></button>' +
      '<button class="boton boton--pri ceramica" data-act="yes" aria-pressed="false">' + SVG_CHECK + '<span>Elegir</span></button>' +
      '</div>';
    paint(c, decisions[idea.id]);
    c.querySelector('.idea__que').addEventListener('click', function (e) { e.currentTarget.classList.toggle('abierto'); });
    c.querySelectorAll('.boton').forEach(function (b) { b.addEventListener('click', function () { decide(idea, c, b.dataset.act, b); }); });
    return c;
  }

  function paint(card, state) {
    card.classList.toggle('es-si', state === 'yes');
    card.classList.toggle('es-no', state === 'no');
    var y = card.querySelector('[data-act=yes]'), n = card.querySelector('[data-act=no]');
    y.setAttribute('aria-pressed', state === 'yes'); n.setAttribute('aria-pressed', state === 'no');
    y.querySelector('span').textContent = state === 'yes' ? 'Elegida' : 'Elegir';
    n.querySelector('span').textContent = state === 'no' ? 'Descartada' : 'Descartar';
  }

  function decide(idea, card, act, btn) {
    var prev = decisions[idea.id];
    var next = prev === act ? null : act;
    if (next) decisions[idea.id] = next; else delete decisions[idea.id];
    save();
    if (!next) { paint(card, null); refreshCounts(true); return; }
    card.classList.remove('hunde'); void card.offsetWidth; card.classList.add('hunde');
    var sello = card.querySelector(next === 'yes' ? '.sello--si' : '.sello--no');
    if (REDUCED || !sello.animate) { paint(card, next); refreshCounts(true); return; }
    // el punto sale del botón y aterriza en el sello: lo único que se mueve tiene función
    var a = btn.getBoundingClientRect(), b = sello.getBoundingClientRect();
    var p = el('i', 'punto-decide punto-decide--' + (next === 'yes' ? 'si' : 'no'));
    document.body.appendChild(p);
    var sx = a.left + a.width / 2, sy = a.top + a.height / 2, ex = b.left + b.width / 2, ey = b.top + b.height / 2;
    var anim = p.animate([
      { transform: 'translate(' + sx + 'px,' + sy + 'px) scale(1)', opacity: 1 },
      { transform: 'translate(' + (sx + (ex - sx) * .5) + 'px,' + (sy + (ey - sy) * .5 - 40) + 'px) scale(1.5)', opacity: 1, offset: .55 },
      { transform: 'translate(' + ex + 'px,' + ey + 'px) scale(.6)', opacity: 1 }
    ], { duration: 520, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'forwards' });
    var hecho = false;
    function aterrizar() {
      if (hecho) return; hecho = true;
      p.remove();
      paint(card, next);
      card.classList.remove('aterriza'); void card.offsetWidth; card.classList.add('aterriza');
      refreshCounts(true);
    }
    anim.onfinish = aterrizar; setTimeout(aterrizar, 800);
  }

  function buildCat(cat, idx) {
    var nombre = limpia(cat.name);
    var list = ideasOf(cat.name);
    var s = el('section', 'lamina cat');
    s.dataset.title = nombre; s.dataset.cat = cat.name;
    var side = el('div', 'cat__lado entra');
    var titulo = (TITULOS[idx] || '{n} ideas').replace('{n}', list.length);
    side.innerHTML =
      '<span class="ceja" style="--d:0">Categoría ' + pad(idx + 1) + ' · ' + esc(nombre) + '</span>' +
      '<h2 class="titulo" style="--d:1">' + esc(titulo) + '</h2>' +
      '<p class="sub" style="--d:2">' + esc(cat.desc) + '</p>' +
      '<div class="anillo-fila" style="--d:3"><div class="anillo"><svg viewBox="0 0 56 56" aria-hidden="true"><circle class="a" cx="28" cy="28" r="25"/><circle class="b" cx="28" cy="28" r="25"/></svg><span class="anillo-n">0%</span></div>' +
      '<div class="anillo-txt"><b class="r-dec">0</b> de <b>' + list.length + '</b> decididas<br><span class="r-split"></span></div></div>' +
      '<div class="filtros" style="--d:4"></div>';
    var main = el('div', 'cat__main');
    var grid = el('div', 'tarjetas');
    var n = 0;
    cat.subs.forEach(function (sub) { list.filter(function (x) { return x.sub === sub; }).forEach(function (x) { grid.appendChild(buildCard(x, n++)); }); });
    list.filter(function (x) { return cat.subs.indexOf(x.sub) < 0; }).forEach(function (x) { grid.appendChild(buildCard(x, n++)); });
    main.appendChild(grid);
    s.appendChild(side); s.appendChild(main);

    var filtros = side.querySelector('.filtros');
    var subs = cat.subs.filter(function (sub) { return list.some(function (x) { return x.sub === sub; }); });
    if (subs.length > 1) {
      filtros.appendChild(chipBtn('Todas', list.length, true));
      subs.forEach(function (sub) { filtros.appendChild(chipBtn(sub, list.filter(function (x) { return x.sub === sub; }).length, false)); });
      filtros.addEventListener('click', function (e) {
        var b = e.target.closest('.filtro'); if (!b) return;
        filtros.querySelectorAll('.filtro').forEach(function (c) { c.classList.toggle('on', c === b); });
        var f = b.dataset.sub, i = 0;
        grid.querySelectorAll('.idea').forEach(function (c) {
          var show = !f || c.dataset.sub === f;
          c.classList.toggle('oculta', !show);
          if (show) { c.style.animation = 'none'; void c.offsetWidth; c.style.setProperty('--i', i++); c.style.animation = ''; }
        });
        main.scrollTop = 0;
      });
    } else { filtros.remove(); }
    return s;
  }
  function chipBtn(label, count, on) {
    var b = el('button', 'filtro' + (on ? ' on' : ''), esc(label) + '<small>' + count + '</small>');
    b.dataset.sub = label === 'Todas' ? '' : label;
    return b;
  }

  function buildResumen() {
    var s = el('section', 'lamina lamina--oscura resumen');
    s.dataset.title = 'Resumen'; s.dataset.summary = '1';
    s.innerHTML =
      '<div class="resumen__cab entra"><div><span class="ceja" style="--d:0">Última lámina</span><h2 class="titulo titulo--1" style="--d:1">Esto es lo que <span class="acento">decidimos</span></h2></div>' +
      '<div class="res-nums" style="--d:2"><div class="res-num res-num--si ceramica"><b id="nY">0</b><span>elegidas</span></div><div class="res-num res-num--no ceramica"><b id="nN">0</b><span>descartadas</span></div><div class="res-num ceramica"><b id="nW">0</b><span>sin decidir</span></div></div></div>' +
      '<div class="resumen__cuerpo"><div class="col" id="colY"></div><div class="col" id="colN"></div></div>' +
      '<div class="resumen__pie"><button class="boton boton--pri ceramica" id="bCopy"><span>Copiar resumen</span></button><button class="boton boton--sec ceramica" id="bDown"><span>Descargar JSON</span></button><button class="boton boton--sec ceramica" id="bReset"><span>Reiniciar decisiones</span></button><span class="firma">Todo proceso tiene una salida.</span></div>';
    return s;
  }

  function renderSummary() {
    var by = { yes: [], no: [] }, wt = 0;
    DATA.ideas.forEach(function (i) { var d = decisions[i.id]; if (d) by[d].push(i); else wt++; });
    countTo(document.getElementById('nY'), by.yes.length);
    countTo(document.getElementById('nN'), by.no.length);
    countTo(document.getElementById('nW'), wt);
    fillCol(document.getElementById('colY'), 'Elegidas', by.yes, 'Todavía no has elegido ninguna idea.');
    fillCol(document.getElementById('colN'), 'Descartadas', by.no, 'Todavía no has descartado ninguna idea.');
  }
  function fillCol(col, title, items, empty) {
    var html = '<h3>' + title + ' <span style="color:var(--texto-3);font-weight:500">(' + items.length + ')</span></h3>';
    if (!items.length) html += '<p class="vacio">' + empty + '</p>';
    DATA.cats.forEach(function (c) {
      var l = items.filter(function (i) { return i.cat === c.name; });
      if (!l.length) return;
      html += '<h4>' + esc(limpia(c.name)) + '</h4><ul>' + l.map(function (i) { return '<li>' + esc(i.title) + (i.ord ? ' <span class="dato dato--plan">Plan #' + i.ord + '</span>' : '') + '</li>'; }).join('') + '</ul>';
    });
    col.innerHTML = html;
  }
  function summaryText() {
    var out = [];
    ['yes', 'no'].forEach(function (k) {
      var l = DATA.ideas.filter(function (i) { return decisions[i.id] === k; });
      out.push((k === 'yes' ? 'ELEGIDAS' : 'DESCARTADAS') + ' (' + l.length + ')');
      DATA.cats.forEach(function (c) {
        var m = l.filter(function (i) { return i.cat === c.name; });
        if (m.length) { out.push('\n' + limpia(c.name)); m.forEach(function (i) { out.push('- ' + i.title); }); }
      });
      out.push('');
    });
    out.push('SIN DECIDIR (' + DATA.ideas.filter(function (i) { return !decisions[i.id]; }).length + ')');
    return out.join('\n');
  }

  function toast(msg) {
    var t = document.getElementById('toast');
    t.textContent = msg; t.classList.add('ver');
    clearTimeout(toast._t); toast._t = setTimeout(function () { t.classList.remove('ver'); }, 2200);
  }
  function wireSummary() {
    document.getElementById('bCopy').addEventListener('click', function () {
      var txt = summaryText();
      function fallback() {
        var ta = document.createElement('textarea'); ta.value = txt; document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); toast('Resumen copiado.'); } catch (e) { toast('No se pudo copiar.'); }
        ta.remove();
      }
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(txt).then(function () { toast('Resumen copiado.'); }, fallback);
      else fallback();
    });
    document.getElementById('bDown').addEventListener('click', function () {
      var data = DATA.ideas.map(function (i) { return { id: i.id, titulo: i.title, categoria: limpia(i.cat), subcategoria: i.sub, criterio: i.crit, decision: decisions[i.id] === 'yes' ? 'elegida' : decisions[i.id] === 'no' ? 'descartada' : 'pendiente', notion: i.url }; });
      var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'decisiones-ideas-optimizo.json';
      document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 500);
      toast('JSON descargado.');
    });
    document.getElementById('bReset').addEventListener('click', function () {
      if (!confirm('¿Borrar todas las decisiones?')) return;
      decisions = {}; save();
      document.querySelectorAll('.idea').forEach(function (c) { paint(c, null); });
      refreshCounts(false); renderSummary(); toast('Decisiones reiniciadas.');
    });
  }

  /* ---------- contadores ---------- */
  function countTo(node, to) {
    if (!node) return;
    var from = parseInt(node.textContent, 10) || 0;
    if (from === to || REDUCED) { node.textContent = to; return; }
    var t0 = performance.now(), dur = 900;
    (function step(t) {
      var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 4);
      node.textContent = Math.round(from + (to - from) * e);
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  }
  function refreshCounts(animate) {
    var y = 0, n = 0;
    DATA.ideas.forEach(function (i) { var d = decisions[i.id]; if (d === 'yes') y++; else if (d === 'no') n++; });
    var w = DATA.ideas.length - y - n;
    [['tYes', y], ['tNo', n], ['tWait', w]].forEach(function (p) {
      var node = document.getElementById(p[0]);
      if (String(node.textContent) !== String(p[1]) && animate) { node.classList.remove('salta'); void node.offsetWidth; node.classList.add('salta'); }
      node.textContent = p[1];
    });
    slides.forEach(function (s) {
      if (!s.dataset.cat) return;
      var list = ideasOf(s.dataset.cat);
      var dec = list.filter(function (i) { return decisions[i.id]; }).length;
      var yy = list.filter(function (i) { return decisions[i.id] === 'yes'; }).length;
      s.querySelector('.r-dec').textContent = dec;
      s.querySelector('.anillo-n').textContent = list.length ? Math.round(dec / list.length * 100) + '%' : '0%';
      s.querySelector('.b').style.strokeDashoffset = 157 - 157 * (list.length ? dec / list.length : 0);
      s.querySelector('.r-split').textContent = yy + ' elegidas · ' + (dec - yy) + ' descartadas';
    });
  }

  /* ---------- navegación: el punto viaja y abre un círculo que revela la siguiente lámina ---------- */
  function onEnter(i) {
    var act = slides[i];
    act.querySelectorAll('[data-count]').forEach(function (n) { n.textContent = '0'; countTo(n, parseInt(n.dataset.count, 10)); });
    var cm = act.querySelector('.cat__main'); if (cm) cm.scrollTop = 0;
    if (act.dataset.summary) renderSummary();
    document.getElementById('cNow').textContent = pad(i + 1);
    document.getElementById('dTitle').textContent = act.dataset.title;
    document.getElementById('bar').style.width = ((i + 1) / slides.length * 100) + '%';
    document.getElementById('prev').disabled = i === 0;
    document.getElementById('next').disabled = i === slides.length - 1;
    try { history.replaceState(null, '', '#' + (i + 1)); } catch (e) {}
  }
  async function go(n, origin) {
    n = Math.max(0, Math.min(slides.length - 1, n));
    if (n === cur || busy) return;
    busy = true;
    var nueva = slides[n], vieja = cur >= 0 ? slides[cur] : null;
    if (vieja && !REDUCED && nueva.animate) {
      var r = (origin || document.getElementById(n > cur ? 'next' : 'prev')).getBoundingClientRect();
      var cx = innerWidth / 2, cy = innerHeight / 2, sx = r.left + r.width / 2, sy = r.top + r.height / 2;
      var p = el('i', 'punto-viaja'); document.body.appendChild(p);
      await fin(p.animate([{ transform: 'translate(' + sx + 'px,' + sy + 'px) scale(1)' }, { transform: 'translate(' + cx + 'px,' + cy + 'px) scale(1.6)' }], { duration: 520, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'forwards' }), 900);
      nueva.classList.add('visible', 'activa'); nueva.style.zIndex = 2;
      onEnter(n);
      p.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 400, fill: 'forwards' });
      await fin(nueva.animate([{ clipPath: 'circle(0% at 50% 50%)' }, { clipPath: 'circle(75% at 50% 50%)' }], { duration: 900, easing: 'cubic-bezier(.16,1,.3,1)' }), 1400);
      p.remove(); nueva.style.zIndex = '';
    } else {
      nueva.classList.add('visible', 'activa'); onEnter(n);
    }
    if (vieja) { vieja.classList.remove('visible', 'activa'); }
    cur = n; busy = false;
  }

  function setTema(t) { raiz.dataset.tema = t; guardar('op-tema', t); }
  function setPaleta(p) {
    raiz.dataset.paleta = p; guardar('op-paleta', p);
    document.querySelectorAll('.segmento button').forEach(function (b) { b.classList.toggle('on', b.dataset.paleta === p); });
  }

  function init() {
    setPaleta(leer('op-paleta') === 'naranjo' ? 'naranjo' : 'teal');
    setTema(leer('op-tema') === 'oscuro' ? 'oscuro' : 'claro');
    var arr = [buildPortada(), buildComo()];
    DATA.cats.forEach(function (c, i) { arr.push(buildCat(c, i)); });
    arr.push(buildResumen());
    arr.forEach(function (s) { deck.appendChild(s); slides.push(s); s.classList.remove('visible', 'activa'); });
    document.getElementById('cTotal').textContent = pad(slides.length);
    document.getElementById('prev').addEventListener('click', function (e) { go(cur - 1, e.currentTarget); });
    document.getElementById('next').addEventListener('click', function (e) { go(cur + 1, e.currentTarget); });
    document.getElementById('tema').addEventListener('click', function () { setTema(raiz.dataset.tema === 'oscuro' ? 'claro' : 'oscuro'); });
    document.querySelectorAll('.segmento button').forEach(function (b) { b.addEventListener('click', function () { setPaleta(b.dataset.paleta); }); });
    document.getElementById('full').addEventListener('click', function () {
      if (document.fullscreenElement) document.exitFullscreen(); else if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen();
    });
    document.addEventListener('keydown', function (e) {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      var k = e.key;
      if (k === 'ArrowRight' || k === 'PageDown' || (k === ' ' && !e.target.closest('button'))) { e.preventDefault(); go(cur + 1); }
      else if (k === 'ArrowLeft' || k === 'PageUp') { e.preventDefault(); go(cur - 1); }
      else if (k === 'Home') go(0);
      else if (k === 'End') go(slides.length - 1);
      else if (k.toLowerCase() === 'f') document.getElementById('full').click();
    });
    var tx = null;
    document.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; }, { passive: true });
    document.addEventListener('touchend', function (e) {
      if (tx == null) return;
      var dx = e.changedTouches[0].clientX - tx; tx = null;
      if (Math.abs(dx) > 80) go(cur + (dx < 0 ? 1 : -1));
    }, { passive: true });
    wireSummary();
    refreshCounts(false);
    var start = parseInt((location.hash || '').replace('#', ''), 10);
    var first = isNaN(start) ? 0 : Math.max(0, Math.min(slides.length - 1, start - 1));
    slides[first].classList.add('visible', 'activa'); cur = first; onEnter(first);
  }
  init();
})();
