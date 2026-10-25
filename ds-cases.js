/**
 * ds-cases.js — горизонтальная дорожка кейсов Discovery System.
 * Канон (case-proof-sections.md):
 *   • одна форма карточки: ниша → метка → задача → было → стало → цифра → мини-экран;
 *   • авто-прокрутка слева направо, отключается после первого касания/наведения;
 *   • стрелки — явное управление; scroll-snap по карточкам;
 *   • сильнейшие кейсы первыми; снизу — результат для человека, не оговорка.
 * Один источник правды: правка здесь меняет дорожку и на главной, и на «Внедрениях».
 */
(function () {
  'use strict';

  var CASES = [
    {
      niche: 'учёт и смены', tag: '17 000 ₽',
      task: 'Сводки по сменам собирались вручную каждый вечер',
      was: 'Учёт в Google Таблицах, работа из Telegram, в ИИ — ноль. «Что мы решили вчера?» — листал переписку.',
      became: 'Диктует голосом — строка сама падает в таблицу. Сотрудники пишут боту под своими именами. Сводка приходит сама.',
      num: 'сводка в 9:00 и 21:00 · 24/7 на его сервере · 0 ₽ абонентки',
      screen: [
        '$ hermes gateway status',
        '● gateway: running',
        'vault/смены/2026-09-11.md',
        '- [09:20] приход 12 000 · направление-1 · Николай',
        '- [09:22] расход 3 400 · направление-2 · сотрудник',
        'отчёт 21:00 · собрано автоматически'
      ]
    },
    {
      niche: 'дизайн и геймдев', tag: 'креатив',
      task: 'Макеты были, а разработка игры стояла — нужен был программист',
      was: 'Визуал собирался вручную, вход в разработку упирался в чужую зону: Unity не его.',
      became: 'Агент собирает визуал и ведёт проект по шагам: ассеты, сцены, сборка.',
      num: 'от макетов — до собственной игры · то, для чего раньше нужен был программист',
      screen: [
        '[unity] assets: 34 файла импортированы',
        '[scene] main.unity собран',
        '[build] 0 ошибок · 0 предупреждений',
        'префаб готов к сборке'
      ]
    },
    {
      niche: 'радар ниши · ювелирка', tag: '×40 дешевле',
      task: 'Чужие платные сервисы разбирали контент конкурентов за 5–6 000 ₽/мес',
      was: 'В открытом скилле — три чужих платных зависимости; замер ниши делался через подписки.',
      became: 'Заменил зависимости своими: сбор через yt-dlp и код. Ниша разобрана от и до, аутлаеры найдены.',
      num: '5–6 000 ₽/мес → 150 ₽/мес · 251 видео разобрано · 8 аутлаеров',
      screen: [
        'yt-dlp: 251 видео · 4 платформы',
        'аутлаер z 4.94 · 20 млн против 2.7K средних',
        'слой мастерских: процесс вместо рекламы',
        'расход: ~150 ₽/мес'
      ]
    },
    {
      niche: 'бухгалтерия', tag: '12 компаний',
      task: 'Сверка, первичка и актуализация съедали неделю главбуха',
      was: 'Самозанятая главбух ведёт 12 компаний руками: время уходит на сверку и первичку.',
      became: 'Агент забирает сверку и подготовку документов, обезличивая данные до модели.',
      num: '12 компаний · обезличивание до модели · подпись и проверка за главбухом',
      screen: [
        '152-ФЗ ст.3 п.9: обезличено до модели',
        'сверка: 34 документа разложены',
        'регистры по 402-ФЗ ст.9–10',
        'подпись — за главбухом'
      ]
    },
    {
      niche: 'видео и контент', tag: 'контент',
      task: 'Часы сырья лежали неразобранными, монтаж стоял',
      was: 'Нарезка и сценарии руками; подписки на монтажные сервисы.',
      became: 'Агент режет первичные нарезки, пишет сценарии и предлагает склейки.',
      num: 'часы сырья → готовые нарезки · без подписок на монтажные сервисы',
      screen: [
        'нарезка 01 · 00:14–00:31 ✓',
        'сценарий: 3 варианта склейки',
        'экспорт: локально, без подписок'
      ]
    },
    {
      niche: 'карьера', tag: 'карьера',
      task: 'Месяцы поиска без результата: отклики вручную, письма по шаблону',
      was: 'Ручной обход вакансий, однотипные сопроводительные, тишина в ответ.',
      became: 'Сначала брифинг и стратегия — потом инструмент: вакансии собираются сами, письмо — под каждую.',
      num: 'парсер вакансий из открытых источников · сопроводительное под каждую · дешевле рыночных подписок',
      screen: [
        'парсер: 62 вакансии · фильтр PM / AI',
        'письмо под вакансию #17 ✓',
        'стратегия: 3 приоритетных направления'
      ]
    },
    {
      niche: 'исследования рынков', tag: 'B2B',
      task: 'Данные старели к концу недели, пока собирались руками',
      was: 'Ручной сбор срезов; к моменту вывода цифры уже неактуальны.',
      became: 'Агент собирает срез с источниками и датами и отдельно помечает, чего данные НЕ доказывают.',
      num: '14 источников с датами за прогон · отдельно видно, что данные НЕ доказывают',
      screen: [
        '14 источников · даты сверены',
        'что НЕ доказано: помечено отдельно',
        'выгрузка: md + таблица'
      ]
    },
    {
      niche: 'поиск заказов', tag: 'инструмент · код открыт',
      task: 'Обход площадок часами, половина заявок — мимо',
      was: 'Ручной поиск по биржам, форумам и чатам; мусор отсеивался глазами.',
      became: 'Агент собирает заявки с площадок и отсеивает мусор по скорингу.',
      num: '63% точности против 47% у поиска по словам · F1 0.61 / 0.39 · на FL.ru 79% на 286 постах',
      screen: [
        'площадок: 7 · карточек: 1106',
        'точность 63% против 47% (F1 0.61 / 0.39)',
        'FL.ru: 79% на 286 постах',
        'код открыт'
      ]
    }
  ];

  var QUOTES = [
    { t: '«Нужно было перенести с текстового документа на интерактивную карту большой объём координат. Работа выполнена быстро, качественно и по привлекательной стоимости. Рекомендую исполнителя!»', s: 'заказчик с Авито · недвижимость, координаты на карту' },
    { t: 'Вернулся сам и попросил личный чат с агентом — через неделю после сдачи. Через месяц заказал гайд, как размножить агента на новые задачи.', s: 'кейс учёта и смен · три покупки подряд, ни одна по моему предложению' }
  ];

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }


  /* мини-экран: окно терминала с тремя точками и подсветкой чисел —
     это то, что отличает карточки друг от друга (канон: мини-экран вместо стоковой картинки) */
  var NUM_RE = /(×\s?\d[\d\s]*|F1\s?\d[.,]\d+|\d[\d\s]*\s?(?:₽|%)|\d[\d\s]{2,}\b|\b\d+\b)/g;

  function highlight(text) {
    var frag = document.createDocumentFragment();
    var last = 0, m;
    NUM_RE.lastIndex = 0;
    while ((m = NUM_RE.exec(text)) !== null) {
      if (m.index > last) frag.appendChild(document.createTextNode(text.slice(last, m.index)));
      frag.appendChild(el('span', 'hl', m[0]));
      last = m.index + m[0].length;
    }
    if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
    return frag;
  }

  function buildTerminal(lines) {
    var term = el('div', 'c-term');
    var bar = el('div', 'c-term-bar');
    for (var i = 0; i < 3; i++) bar.appendChild(el('span', 'c-dot'));
    bar.appendChild(el('span', 'c-term-name', 'лог агента'));
    term.appendChild(bar);
    var pre = el('pre', 'c-screen');
    lines.forEach(function (line, idx) {
      pre.appendChild(highlight(line));
      if (idx < lines.length - 1) pre.appendChild(document.createTextNode('\n'));
    });
    term.appendChild(pre);
    return term;
  }

  function buildCard(c) {
    var card = el('article', 'case');
    var top = el('div', 'c-top');
    top.appendChild(el('span', 'c-idx', String(CASES.indexOf(c) + 1).padStart(2, '0')));
    top.appendChild(el('span', 'c-niche', c.niche));
    top.appendChild(el('span', 'c-tag', c.tag));
    card.appendChild(top);
    card.appendChild(el('h3', 'c-task', c.task));
    var dl = el('dl', 'c-bs');
    [['было', c.was], ['стало', c.became]].forEach(function (pair) {
      var row = el('div');
      row.appendChild(el('dt', null, pair[0]));
      row.appendChild(el('dd', null, pair[1]));
      dl.appendChild(row);
    });
    card.appendChild(dl);
    card.appendChild(el('p', 'c-num', c.num));
    card.appendChild(buildTerminal(c.screen));
    return card;
  }

  function build(root) {
    var head = el('div', 'cases-head');
    head.innerHTML = '<p class="eyebrow rv">что уже собрано · внедрения</p>' +
      '<h2 class="rv">Восемь внедрений под разные задачи</h2>' +
      '<p class="lead rv">Одна форма у всех: задача, было, стало, цифра и настоящие строки работы. Учёт и смены, бухгалтерия, дизайн, видео, карьера, исследования, поиск заказов.</p>';
    root.appendChild(head);

    var wrap = el('div', 'cases-wrap');
    var track = el('div', 'cases-track');
    track.setAttribute('tabindex', '0');
    track.setAttribute('role', 'region');
    track.setAttribute('aria-label', 'Кейсы внедрений');
    CASES.forEach(function (c) { track.appendChild(buildCard(c)); });
    wrap.appendChild(track);

    var foot = el('div', 'cases-foot');
    var dots = el('div', 'cases-dots');
    CASES.forEach(function () { dots.appendChild(el('i')); });
    foot.appendChild(dots);
    var nav = el('div', 'cases-nav');
    var prev = el('button', 'cases-btn', '←');
    var next = el('button', 'cases-btn', '→');
    prev.type = next.type = 'button';
    prev.setAttribute('aria-label', 'Предыдущий кейс');
    next.setAttribute('aria-label', 'Следующий кейс');
    nav.appendChild(prev); nav.appendChild(next);
    foot.appendChild(nav);
    wrap.appendChild(foot);
    root.appendChild(wrap);

    // активная точка: считаем по ширине карточки из кэша (без чтения layout в кадре)
    var lastDot = 0, cardW = 340, dotItems = dots.querySelectorAll('i');
    function measure() {
      var c = track.querySelector('.case');
      cardW = c ? c.getBoundingClientRect().width + 14 : 340;
    }
    measure();
    window.addEventListener('resize', measure, { passive: true });
    track.addEventListener('scroll', function () {
      var idx = Math.max(0, Math.min(dotItems.length - 1, Math.round(track.scrollLeft / cardW)));
      if (idx === lastDot) return;
      lastDot = idx;
      for (var i = 0; i < dotItems.length; i++) dotItems[i].classList.toggle('on', i === idx);
    }, { passive: true });
    dotItems[0].classList.add('on');

    var q = el('div', 'cases-quotes');
    QUOTES.forEach(function (x) {
      var b = el('blockquote', 'cq');
      b.appendChild(el('p', null, x.t));
      b.appendChild(el('span', null, x.s));
      q.appendChild(b);
    });
    root.appendChild(q);
    return { track: track, prev: prev, next: next };
  }

  /* ── авто-прокрутка: едет слева направо, гаснет после первого касания/наведения ── */
  function autoscroll(track, prev, next) {
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var killed = false, raf = 0, acc = 0, last = 0, holdUntil = 0;
    var SPEED = 44; // px/сек — спокойно, но заметно

    // ВАЖНО: scroll-snap-type:mandatory возвращает дорожку назад каждый кадр —
    // программный сдвиг по пикселю просто не накапливается. Пока едем сами — снап выключен,
    // как только пользователь коснулся — включаем обратно, чтобы карточки вставали по сетке.
    track.style.scrollSnapType = 'none';

    function kill() {
      if (killed) return;
      killed = true;
      if (raf) cancelAnimationFrame(raf); raf = 0;
      track.style.scrollSnapType = 'x mandatory';
    }
    function loop(ts) {
      if (killed) return;
      if (!last) last = ts;
      var dt = Math.min(64, ts - last) / 1000; last = ts;
      if (ts > holdUntil && !document.hidden) {
        acc += SPEED * dt;
        if (acc >= 1) {
          var step = Math.floor(acc); acc -= step;
          track.scrollLeft += step;
          var max = track.scrollWidth - track.clientWidth;
          if (track.scrollLeft >= max - 1) { track.scrollLeft = 0; holdUntil = ts + 900; }
        }
      }
      raf = requestAnimationFrame(loop);
    }

    ['pointerenter', 'touchstart', 'wheel', 'focusin'].forEach(function (ev) {
      track.addEventListener(ev, kill, { passive: true, once: true });
    });
    [prev, next].forEach(function (b) { b.addEventListener('click', kill); });

    if (!reduced) raf = requestAnimationFrame(loop);
  }

  function step(track, dir) {
    var card = track.querySelector('.case');
    var w = card ? card.getBoundingClientRect().width + 14 : 340;
    track.scrollBy({ left: dir * w, behavior: 'smooth' });
  }

  function init() {
    document.querySelectorAll('[data-ds-cases]').forEach(function (root) {
      if (root.dataset.ready) return;
      root.dataset.ready = '1';
      var o = build(root);
      autoscroll(o.track, o.prev, o.next);
      o.prev.addEventListener('click', function () { step(o.track, -1); });
      o.next.addEventListener('click', function () { step(o.track, 1); });
      // проявить карточки (страховка от скролл-анимации)
      setTimeout(function () {
        root.querySelectorAll('.rv:not(.in)').forEach(function (n) { n.classList.add('in'); });
      }, 1200);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
