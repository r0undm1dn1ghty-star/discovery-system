/* ============================================================
   Discovery System — платёжные ссылки (единый источник правды)
   ------------------------------------------------------------
   Все ссылки создаются в личном кабинете Robokassa и вставляются
   сюда в кавычки. Больше нигде их дублировать не нужно.
   Подключается в: services.html, pay.html, calculator.html,
   clarity.html.
   ------------------------------------------------------------
   ПОКА СТРОКА ПУСТА — кнопка ведёт в Telegram с готовым текстом
   заказа, контекст из калькулятора сохраняется. Ничего не ломается.
   ------------------------------------------------------------
   Разовые услуги (Robokassa, карта РФ или СБП):
   ============================================================ */
var PAY_LINK_ROBOKASSA_GUIDE         = 'https://auth.robokassa.ru/merchant/Invoice/cckSfDB22k2PQtri5TVSnw'; /* гайд «20 конфигураций» · 3 000 ₽ */
var PAY_LINK_ROBOKASSA_BUILD         = 'https://auth.robokassa.ru/merchant/Invoice/4iIqaJEDUkqvFXmDN46HVw'; /* персональная сборка · 5 000 ₽ */
var PAY_LINK_ROBOKASSA_INSTALL_PC    = 'https://auth.robokassa.ru/merchant/Invoice/KgLCbRoMKUCVzCZ0_0ROlA'; /* установка на ПК · 7 000 ₽ */
var PAY_LINK_ROBOKASSA_INSTALL_VPS   = 'https://auth.robokassa.ru/merchant/Invoice/OY1jS0GqG02bvkffIKxuPQ'; /* установка на VPS РФ · 10 000 ₽ */
var PAY_LINK_ROBOKASSA_INSTALL_INTEG = 'https://auth.robokassa.ru/merchant/Invoice/TMcj5y7inUyuEOHnGaC-dg'; /* интеграция МСБ/самозанятые · 15 000 ₽ */
var PAY_LINK_ROBOKASSA_OPTIMIZATION  = 'https://auth.robokassa.ru/merchant/Invoice/biGOMDdi3EavbVcNFpARTA'; /* оптимизация ИИ-агента · от 20 000 ₽ */

/* ------------------------------------------------------------
   Подписки — РЕШЕНИЕ 29.09: продаём через Tribute, Robokassa
   для них не используем.

   Почему: Robokassa для подписок требует ResultUrl — серверный
   POST на адрес магазина. У сайта (GitHub Pages) сервера нет,
   принять уведомления нечем. Плюс Tribute сам выдаёт доступ к
   закрытому каналу (оплатил → доступ → отменил → доступ закрылся),
   чего Robokassa не делает.

   Вернуться к Robokassa для подписок можно при >100 подписчиков:
   тогда имеет смысл поднять serverless-обработчик (Cloudflare
   Worker, бесплатно) ради экономии на комиссии (~10% → ~3,5%).
   Сокеты ниже оставлены для этого переезда, сейчас пусты.
   ============================================================ */
var PAY_LINK_ROBOKASSA_INSIGHTS_MONTH = ''; /* не используется — инсайты в Tribute */
var PAY_LINK_ROBOKASSA_SUPPORT_MONTH  = ''; /* не используется — поддержка в Tribute */
var PAY_LINK_ROBOKASSA_SUPPORT_YEAR   = ''; /* не используется — поддержка в Tribute */

/* ------------------------------------------------------------
   Tribute — действующий канал подписок.
   ============================================================ */
var DS_TRIBUTE_INSIGHTS = 'https://web.tribute.tg/s/16eU';
var DS_TRIBUTE_SUPPORT  = 'https://web.tribute.tg/s/16eW';

/* ------------------------------------------------------------
   Фолбэк: Telegram. Используется, пока ссылка не заполнена.
   ============================================================ */
var DS_TG_ORDER = 'https://t.me/discoverysystem';

/* ------------------------------------------------------------
   Адреса возврата для ЛК Robokassa (SuccessUrl / FailUrl):
     SuccessUrl → https://discovery-system.ru/thanks.html
     FailUrl    → https://discovery-system.ru/fail.html
   thanks.html читает OutSum из адреса и сам показывает, что
   за продукт оплачен и что делать дальше.
   ============================================================ */
