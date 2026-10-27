/* ═══════════════════════════════════════════════════════════════════════════
   DS-HERO — консоль живого агента: три сборки, строки работы по мере работы.
   Правила: строки появляются по шагам (печатает → действие → результат),
   артефакты (таблица, csv, план) видны как файлы, а не как описание.
   prefers-reduced-motion → мгновенный статичный кадр, без таймеров.
   Все цифры — из состава сборки-примера; таймкоды демо-смены = placeholder.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── данные сборок: строки работы, а не описания ───────────────────────── */

  var ASM = {
    shift: {
      label: 'Смена закрывается сама',
      result: 'Смена закрыта — <b>сводка ушла в Telegram сама</b>, таблица дописана',
      steps: [
        { k: 'day', text: 'Понедельник · смена Ильи' },
        { k: 'log', t: '08:58:11', text: 'смена открыта · слушаю Telegram', hl: 'слушаю Telegram' },
        { k: 'user', text: 'Принял товар, 14 позиций. Накладную сфоткал.', meta: 'голосовое · 0:09 · Илья' },
        { k: 'log', t: '08:59:04', text: 'речь разобрана в текст' },
        { k: 'log', t: '08:59:05', text: 'строка добавлена в таблицу учёта, фото вложено', hl: 'строка добавлена в таблицу учёта' },
        { k: 'file', name: 'Учёт · Смена Пн', meta: 'Google Таблица · лист «Смена»', add: '+1 строка · 14 позиций' },
        { k: 'log', t: '21:00:00', text: 'смена закрыта · собрана сводка за день', hl: 'смена закрыта' },
        { k: 'res', title: 'Сводка за день — агент прислал её сам', rows: [
          ['Записи за день', '14 позиций'],
          ['Сводки', 'в 9:00 и 21:00, сами'],
          ['Абонентка за агента', '0 ₽'],
          ['Провайдер моделей', '3 400–5 400 ₽/мес']
        ]}
      ]
    },
    requests: {
      label: 'Заявка не ждёт утра',
      result: 'К утру на столе: <b>разобранная заявка и черновик ответа</b> — отправляешь ты',
      steps: [
        { k: 'day', text: 'Вторник · 21:40, входящая заявка' },
        { k: 'user', text: 'Добрый день! Сколько стоит работа и когда сможет приехать специалист?', meta: '21:40 · клиент' },
        { k: 'log', t: '21:40:41', text: 'заявка разобрана: услуга, район, срочность', hl: 'разобрана' },
        { k: 'log', t: '21:40:58', text: 'цена взята из прайса, свободные слоты — из календаря', hl: 'из прайса' },
        { k: 'agent', text: 'Черновик ответа готов: цена по прайсу и два свободных слота. Отправляешь одной кнопкой — правила ответа задал ты.' },
        { k: 'res', title: 'К утру на столе', rows: [
          ['Заявка разобрана', 'в 21:40, а не наутро'],
          ['Черновик', 'цена + два слота'],
          ['Отправка', 'за тобой — агент сам не пишет'],
          ['Владение', 'твой сервер · ~150 ₽/мес']
        ]}
      ]
    },
    orders: {
      label: 'Утром — список заказов',
      result: 'Отбор готов к разговору — <b>с задачей и контактом</b>, код открыт',
      steps: [
        { k: 'day', text: 'Среда · 07:30, обход площадок' },
        { k: 'user', text: 'Найди заказы, где нужен агент или бот. К утру нужен список.', meta: '07:29 · в Telegram' },
        { k: 'log', t: '07:30:02', text: 'старт обхода: 7 площадок', hl: '7 площадок' },
        { k: 'log', t: '07:34:19', text: 'карточек собрано: 1106', hl: '1106' },
        { k: 'log', t: '07:36:50', text: 'отсев: дубли, закрытые, без бюджета' },
        { k: 'log', t: '07:39:05', text: 'скоринг: срок, бюджет, история заказчика', hl: 'скоринг' },
        { k: 'file', name: 'leads_week.csv', meta: '7 площадок · 1106 карточек', add: 'лучшие сверху · контакт внутри' },
        { k: 'agent', text: 'К отбору пришло меньше карточек, зато в каждой — задача и контакт. Мусор отсеян по признакам, а не на глаз.' },
        { k: 'res', title: 'Точность отбора — на своих же данных', rows: [
          ['Площадок', '7'],
          ['Карточек собрано', '1106'],
          ['Точность', '63% против 47%'],
          ['F1', '0.61 против 0.39']
        ]}
      ]
    }
  };

  /* ── окружение ─────────────────────────────────────────────────────────── */

  var mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  var forced = /(?:\?|&)static=1(?:&|$)/.test(window.location.search);
  var root = document.documentElement;

  var state = {
    reduced: mq.matches,
    static: forced || mq.matches,
    mode: (forced || mq.matches) ? 'static' : 'live',
    asm: 'shift',
    running: false,
    started: 0,
    finished: 0,
    timers: 0,
    lines: 0,
    total: 0,
    linesFor: {}
  };
  window.__dsHero = state;

  var stream = document.getElementById('stream');
  var typing = document.getElementById('typing');
  var resEl = document.getElementById('agRes');
  var recEl = document.getElementById('agRec');
  var shiftEl = document.getElementById('agShift');
  var againBtn = document.getElementById('agAgain');
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.ag-tab'));
  if (!stream) return;

  var seq = 0;

  function mk(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function highlight(text, hl) {
    var frag = document.createDocumentFragment();
    var i = hl ? text.indexOf(hl) : -1;
    if (i < 0) { frag.appendChild(document.createTextNode(text)); return frag; }
    frag.appendChild(document.createTextNode(text.slice(0, i)));
    var b = mk('b', null, hl);
    frag.appendChild(b);
    frag.appendChild(document.createTextNode(text.slice(i + hl.length)));
    return frag;
  }

  var SVG_SHEET = 'M4.5 3.5h9l4 4v13h-13z M13.5 3.5v4h4 M8 12.5h7 M8 16h7';
  var SVG_FILE = 'M6 3.5h8l4.5 4.5v12.5H6z M14 3.5V8h4.5 M9 12.5h6 M9 16h4';

  function node(step) {
    var el;
    if (step.k === 'day') {
      el = mk('div', 'l-day', step.text);
    } else if (step.k === 'log') {
      el = mk('div', 'l-log');
      el.appendChild(mk('span', 't', step.t));
      var x = mk('span', 'x');
      x.appendChild(highlight(step.text, step.hl));
      el.appendChild(x);
    } else if (step.k === 'file') {
      el = mk('div', 'l-file');
      var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', '0 0 24 24');
      svg.setAttribute('fill', 'none');
      svg.setAttribute('stroke', 'currentColor');
      svg.setAttribute('stroke-width', '1.5');
      svg.setAttribute('stroke-linecap', 'round');
      svg.setAttribute('stroke-linejoin', 'round');
      svg.setAttribute('aria-hidden', 'true');
      var p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      p.setAttribute('d', /\.csv|\.md/.test(step.name) ? SVG_FILE : SVG_SHEET);
      svg.appendChild(p);
      el.appendChild(svg);
      var body = mk('div');
      body.appendChild(mk('div', 'n', step.name));
      body.appendChild(mk('div', 'm', step.meta));
      if (step.add) body.appendChild(mk('div', 'add', step.add));
      el.appendChild(body);
    } else if (step.k === 'user' || step.k === 'agent') {
      el = mk('div', 'msg ' + (step.k === 'user' ? 'user' : 'agent'));
      el.appendChild(document.createTextNode(step.text));
      if (step.meta) el.appendChild(mk('span', 'meta', step.meta));
    } else if (step.k === 'res') {
      el = mk('div', 'l-res');
      el.appendChild(mk('div', 'rt', step.title));
      step.rows.forEach(function (r) {
        var row = mk('div', 'rr');
        row.appendChild(mk('span', 'k', r[0]));
        row.appendChild(mk('span', 'v', r[1]));
        el.appendChild(row);
      });
    }
    if (el && !state.static) { el.classList.add('line-in'); }
    if (el && state.static) { el.classList.add('in'); }
    return el;
  }

  function clearStream() {
    while (stream.firstChild) {
      if (stream.firstChild === typing) break;
      stream.removeChild(stream.firstChild);
    }
    // на случай, если typing оказался первым — вернуть его в конец
    stream.appendChild(typing);
    typing.hidden = true;
    stream.scrollTop = 0;
    resEl.innerHTML = '';
    state.lines = 0;
  }

  function add(step) {
    var el = node(step);
    stream.insertBefore(el, typing);
    if (step.k === 'res') { requestAnimationFrame(function () { el.classList.add('in'); }); }
    state.lines++;
    if (state.mode === 'live') reveal(el);
  }

  // держим в кадре ВЕСЬ новый блок, а не только его низ: иначе файл приходит обрезанным краем консоли
  function reveal(el) {
    var sr = stream.getBoundingClientRect();
    var er = el.getBoundingClientRect();
    if (er.bottom > sr.bottom - 6) {
      stream.scrollTop += (er.bottom - sr.bottom) + 12;
    } else if (er.top < sr.top + 6) {
      stream.scrollTop -= (sr.top - er.top) + 12;
    }
  }

  function speak(step, done) {
    // «печатает» перед действием агента, кроме системных и пользовательских строк
    if (state.static) { done(); return; }
    var d = { day: 240, log: 200, file: 240, agent: 340, user: 0, res: 280 }[step.k] || 200;
    if (d === 0) { done(); return; }
    typing.hidden = false;
    stream.scrollTop = stream.scrollHeight;
    state.timers++;
    setTimeout(function () { typing.hidden = true; state.timers--; done(); }, d);
  }

  function gap(step) {
    return { day: 320, log: 280, file: 340, agent: 460, user: 280, res: 520 }[step.k] || 300;
  }

  function render(key) {
    if (!ASM[key]) return;
    var asm = ASM[key];
    var token = ++seq;
    // программный доскролл — мгновенный: smooth-ретаргеты съедали финальный
    // scrollTop (поток оставался наверху, итоговая карточка обрезалась краем)
    stream.style.scrollBehavior = 'auto';
    state.asm = key;
    state.running = true;
    state.total = asm.steps.length;
    state.linesFor[key] = asm.steps.length;
    state.started = Date.now();
    state.finished = 0;
    state.timers = 0;

    clearStream();
    root.setAttribute('data-asm', key);
    shiftEl.textContent = key === 'shift' ? 'смена идёт' : 'сборка запущена';
    recEl.textContent = state.static ? 'итог' : 'запись';
    recEl.classList.toggle('on', !state.static);

    if (state.static) {
      asm.steps.forEach(add);
      shiftEl.textContent = 'смена завершена';
      recEl.textContent = 'итог';
      resEl.innerHTML = asm.result;
      state.running = false;
      state.finished = Date.now();
      return;
    }

    var i = 0;
    function next() {
      if (token !== seq) return;           // переключили сборку — старый поток молчит
      if (i >= asm.steps.length) {
        state.running = false;
        state.finished = Date.now();
        shiftEl.textContent = 'смена завершена';
        recEl.textContent = 'ожидание';
        recEl.classList.remove('on');
        resEl.innerHTML = asm.result;
        // итог и последний файл — в кадре, без «недогруженного» хвоста
        setTimeout(function () {
          if (token !== seq) return;
          stream.scrollTop = stream.scrollHeight;
        }, 60);
        return;
      }
      var step = asm.steps[i++];
      speak(step, function () {
        if (token !== seq) return;
        add(step);
        state.timers++;
        setTimeout(function () {
          state.timers--;
          if (token !== seq) return;
          next();
        }, gap(step));
      });
    }
    next();
  }

  /* ── переключатель сборок ──────────────────────────────────────────────── */

  function select(key, focus) {
    tabs.forEach(function (t) {
      var on = t.getAttribute('data-asm') === key;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      if (on && focus) t.focus();
    });
    stream.setAttribute('aria-labelledby', 'tab-' + key);
    render(key);
  }

  tabs.forEach(function (t) {
    t.addEventListener('click', function () { select(t.getAttribute('data-asm'), false); });
    t.addEventListener('keydown', function (e) {
      var i = tabs.indexOf(t), n = -1;
      if (e.key === 'ArrowRight') n = (i + 1) % tabs.length;
      else if (e.key === 'ArrowLeft') n = (i - 1 + tabs.length) % tabs.length;
      else if (e.key === 'Home') n = 0;
      else if (e.key === 'End') n = tabs.length - 1;
      if (n >= 0) { e.preventDefault(); select(tabs[n].getAttribute('data-asm'), true); }
    });
  });

  if (againBtn) againBtn.addEventListener('click', function () { render(state.asm); });

  /* ── запуск: когда консоль попала в кадр ───────────────────────────────── */

  function boot() {
    if (state.mode === 'live') {
      if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (es) {
          es.forEach(function (e) {
            if (e.isIntersecting && !state.started) { io.disconnect(); render('shift'); }
          });
        }, { threshold: 0.18 });
        io.observe(stream);
        // страховка: если консоль уже в кадре, но IO молчит (headless/файл)
        state.timers++;
        setTimeout(function () {
          state.timers--;
          if (!state.started) render('shift');
        }, 1400);
      } else {
        render('shift');
      }
    } else {
      render('shift');
    }
    state.booted = true;
  }

  // смена настройки «меньше движения» на живую — переключаемся в статичный кадр
  function onMqChange() {
    state.reduced = mq.matches;
    if (mq.matches) {
      state.mode = 'static';
      state.static = true;
      root.setAttribute('data-motion', 'static');
      render(state.asm);
    }
  }
  if (mq.addEventListener) mq.addEventListener('change', onMqChange);
  else if (mq.addListener) mq.addListener(onMqChange);

  root.setAttribute('data-motion', state.mode);
  boot();
})();
