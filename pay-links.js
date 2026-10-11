/* ============================================================
   Discovery System — платёжные ссылки (ЕДИНЫЙ ИСТОЧНИК ПРАВДЫ)
   ------------------------------------------------------------
   ВСТАВЛЯТЬ ССЫЛКИ ТОЛЬКО ЗДЕСЬ. Больше нигде дублировать не надо.

   КАК ВСТАВИТЬ ВИДЖЕТ ROBOKASSA:
     1. В ЛК Robokassa создай ссылку на оплату с НУЖНОЙ суммой.
     2. Скопируй адрес (https://auth.robokassa.ru/merchant/Invoice/XXXX).
     3. Вставь между кавычек у нужного ключа.
     4. Сохрани и запушь. Всё — кнопки на сайте подхватят сами.

   ВАЖНО ПРО СУММЫ: Robokassa передаёт в thanks.html только сумму.
   Суммы повторяются (15 000 = агент на ПК И контент-завод фото),
   поэтому у каждой ссылки добавляй в ЛК параметр p=<ключ>:
     .../Invoice/ХХХ?p=pc   .../Invoice/ХХХ?p=photo
   Тогда thanks.html покажет верный продукт, а не угадает по сумме.
   Если p= не добавить — клиент увидит «сумму не распознали».

   ПОДПИСКИ — в Tribute (решение 29.09). Robokassa для подписок
   требует серверный ResultUrl, которого у статичного сайта нет.
   ============================================================ */

var DS_PAY = {

  /* ── Разовые: цифровые материалы ───────────────────────── */
  guide:   {price:5000,  name:'Гайд «20 сборок»',
            url:'https://auth.robokassa.ru/merchant/Invoice/GEV6reyqiEWXzYG_Mkulbw'},
  build:   {price:7000,  name:'Гайд персональной сборки',
            url:'https://auth.robokassa.ru/merchant/Invoice/RjF3Mh-GhUmFIiCWVxkMFA'},

  /* ── Разовые: внедрение (лестница 15/20/30/60) ─────────── */
  personal:{price:15000, name:'ИИ-агент для личных целей (не-бизнес)',
            url:'https://auth.robokassa.ru/merchant/Invoice/xp2UNX65i0GBewjBqkgJOw'},
  pc:      {price:15000, name:'Личный агент на ПК',
            url:'https://auth.robokassa.ru/merchant/Invoice/xp2UNX65i0GBewjBqkgJOw'},
  self:    {price:20000, name:'ИИ-агент для самозанятых и микробизнеса',
            url:'https://auth.robokassa.ru/merchant/Invoice/AuPs4sLt3USvwXypMewUDw'},
  smb:     {price:30000, name:'ИИ-агент для ИП и малого бизнеса',
            url:'https://auth.robokassa.ru/merchant/Invoice/jjPrDM9xSkK1qKCLSGB-MA'},
  mid:     {price:60000, name:'ИИ-агент для среднего бизнеса',
            url:'https://auth.robokassa.ru/merchant/Invoice/ga2H8Nr6zUadphD3DvygDQ'},

  /* ── Разовые: дополнительные решения ───────────────────── */
  factory_photo: {price:15000, name:'Контент-завод: фото',
            url:'https://auth.robokassa.ru/merchant/Invoice/DkLlmgasJUSlcEP4qFsS8w'},
  factory_video: {price:30000, name:'Контент-завод: видео',
            url:'https://auth.robokassa.ru/merchant/Invoice/mckApiXe0kSeCp7YLTkIWw'},
  office:  {price:25000, name:'Офис ИИ-агентов (отдел из 5)',
            url:'https://auth.robokassa.ru/merchant/Invoice/OUoEK8kSYEWUW05bDAhlVg'},
  optimize:{price:25000, name:'Оптимизация ИИ-агента (не работает/сломан/дорогой)',
            url:'https://auth.robokassa.ru/merchant/Invoice/qCJpZ0vYGUaNVkfbhMj7og'},

  /* ── Подписки: Tribute (Robokassa не используем) ───────── */
  insights:   {price:2000,  name:'Инсайты Discovery System',
            url:'https://web.tribute.tg/s/16eU', sub:true},
  support:    {price:15000, name:'Персональная поддержка',
            url:'https://web.tribute.tg/s/16eW', sub:true},
  support_smb:{price:25000, name:'Поддержка ИИ-агента МСБ',
            url:'https://web.tribute.tg/s/18R4', sub:true},
  support_dept:{price:40000,name:'Поддержка продуктового отдела',
            url:'https://web.tribute.tg/s/18R9', sub:true}
};

/* ── Куда ведём, когда ссылка ещё не создана ───────────── */
var DS_TG_ORDER   = 'https://t.me/discoverysystem';  /* канал */
var DS_TG_DIRECT  = 'https://t.me/soulvictor';       /* личка */
var DS_VK_DIRECT  = '';                              /* вставь ссылку ВК, когда будет */
var DS_MAX_MSG    = 2000;  /* макс. сумма для «напишите, если не нашли» */

/* ============================================================
   НИЖЕ — не трогать. Старые имена переменных оставлены, чтобы
   calculator.html и pay.html продолжали работать.
   ============================================================ */
var PAY_LINK_ROBOKASSA_GUIDE        = DS_PAY.guide.url;
var PAY_LINK_ROBOKASSA_BUILD        = DS_PAY.build.url;
var PAY_LINK_ROBOKASSA_INSTALL_PC   = DS_PAY.pc.url;
var PAY_LINK_ROBOKASSA_INSTALL_VPS  = DS_PAY.self.url;
var PAY_LINK_ROBOKASSA_INSTALL_INTEG= DS_PAY.smb.url;
var PAY_LINK_ROBOKASSA_INSTALL_MID  = DS_PAY.mid.url;
var PAY_LINK_ROBOKASSA_OPTIMIZATION = DS_PAY.optimize.url;
var PAY_LINK_ROBOKASSA_INSIGHTS_MONTH = '';
var PAY_LINK_ROBOKASSA_SUPPORT_MONTH  = '';
var PAY_LINK_ROBOKASSA_SUPPORT_YEAR   = '';
var DS_TRIBUTE_INSIGHTS = DS_PAY.insights.url;
var DS_TRIBUTE_SUPPORT  = DS_PAY.support.url;

/* ------------------------------------------------------------
   Адреса возврата в ЛК Robokassa:
     SuccessUrl → https://discovery-system.ru/thanks.html?p=<ключ>
     FailUrl    → https://discovery-system.ru/fail.html
   ------------------------------------------------------------ */

/* ============================================================
   АВТОПОДСТАНОВКА КНОПОК
   Любой элемент с атрибутом data-buy="ключ" получает href.
   Если ссылки нет — ведём в Telegram с готовым текстом заказа.
   data-buy-label — свой текст кнопки.
   ============================================================ */
(function(){
  function ready(fn){ if(document.readyState!=='loading'){fn();} else {document.addEventListener('DOMContentLoaded',fn);} }
  ready(function(){
    var nodes=document.querySelectorAll('[data-buy]');
    for(var i=0;i<nodes.length;i++){
      (function(el){
        var key=el.getAttribute('data-buy');
        var prod=DS_PAY[key];
        if(!prod) return;
        var isLink=el.tagName==='A';
        if(prod.url){
          if(isLink){ el.setAttribute('href',prod.url); el.setAttribute('target','_blank'); el.setAttribute('rel','noopener'); }
          el.classList.add('buy-ready');
          el.setAttribute('data-ready','1');
        } else {
          /* ссылки нет — собираем заказ текстом */
          var txt='Хочу: '+prod.name+' ('+prod.price.toLocaleString('ru-RU')+' ₽). Подскажите, как оплатить.';
          if(isLink){ el.setAttribute('href',DS_TG_DIRECT+'?text='+encodeURIComponent(txt)); el.setAttribute('target','_blank'); el.setAttribute('rel','noopener'); }
          el.classList.add('buy-pending');
        }
        var lbl=el.getAttribute('data-buy-label');
        if(lbl) el.textContent=lbl;
        /* на кнопке-ссылке без ссылки пишем «Написать →» */
      })(nodes[i]);
    }
  });
})();
