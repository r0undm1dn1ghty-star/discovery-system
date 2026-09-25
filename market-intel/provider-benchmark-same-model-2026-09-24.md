# Benchmark: одна модель у разных провайдеров

Дата живого замера: **24.09.2026**.
Публичная страница: https://discovery-system.ru/nacenka.html.
Курс для пересчёта USD → RUB: **84,9057 ₽/$**, ЦБ РФ на 24.09.2026.

## Что сравнивается

Не сравниваются DeepSeek с Claude и GLM между собой.

Сравнивается **одна и та же модель** у трёх касс:

1. официальный API вендора;
2. OpenRouter, обычные `prompt/completion`, без подмены входа cache-read;
3. ProxyAPI, публичный прайс в рублях.

AITunnel в замер не включён.

## Единый benchmark-workload

Для каждой модели одинаковый расход:

- **1 000 запросов**;
- **2 000 input-токенов** на запрос;
- **500 output-токенов** на запрос;
- итого: **2,0 млн input + 0,5 млн output**;
- кэш в основной цене не учитывается, чтобы не смешивать cache-hit с обычным input.

Стоимость считается так:

`2 × input ₽/1M + 0,5 × output ₽/1M`.

Округление до целого рубля только в итоговой колонке. Вход и выход в исходной матрице остаются раздельными.

## Исходные цены

Все значения ниже — ₽ за 1 млн токенов, кроме помеченных USD.

| Одна и та же модель | Вендор input / output | OpenRouter input / output | ProxyAPI input / output |
|---|---:|---:|---:|
| DeepSeek V4.1 Flash | 25,47 / 101,89 | 12,74 / 50,94 | 41,05 / 168,42 |
| Claude Sonnet 5 | 169,81 / 849,06 | 169,81 / 849,06 | 600 / 3 030 |
| GLM 5.2 | 118,87 / 373,59 | 55,14 / 173,31 | 125 / 450 |
| Kimi K3 | 254,72 / 1 273,59 | 254,72 / 1 273,59 | 550 / 2 700 |
| MiniMax M3 | 50,94 / 203,77 | 25,47 / 101,89 | 41,05 / 168,42 |

### Исходные значения в валюте источника

| Модель | Вендор | OpenRouter | ProxyAPI |
|---|---|---|---|
| DeepSeek V4.1 Flash | $0,30 / $1,20, peak | $0,15 / $0,60 | ₽41,05 / ₽168,42 |
| Claude Sonnet 5 | $2 / $10 | $2 / $10 | ₽600 / ₽3 030 |
| GLM 5.2 | $1,40 / $4,40 | $0,6496 / $2,0416 | ₽125 / ₽450 |
| Kimi K3 | $3 / $15 | $3 / $15 | ₽550 / ₽2 700 |
| MiniMax M3 | $0,60 / $2,40 | $0,30 / $1,20 | ₽41,05 / ₽168,42 |

## Итог одного и того же workload

| Модель | Вендор | OpenRouter | ProxyAPI | ProxyAPI к вендору | Разница ProxyAPI |
|---|---:|---:|---:|---:|---:|
| DeepSeek V4.1 Flash | **102 ₽** | **51 ₽** | **166 ₽** | **×1,63** | +64 ₽ |
| Claude Sonnet 5 | **764 ₽** | **764 ₽** | **2 715 ₽** | **×3,55** | +1 951 ₽ |
| GLM 5.2 | **425 ₽** | **197 ₽** | **475 ₽** | **×1,12** | +50 ₽ |
| Kimi K3 | **1 146 ₽** | **1 146 ₽** | **2 450 ₽** | **×2,14** | +1 304 ₽ |
| MiniMax M3 | **204 ₽** | **102 ₽** | **166 ₽** | **×0,82** | −37 ₽ |

## Что можно честно сказать

- На одном и том же workload самый большой абсолютный разрыв в этой выборке у **Claude Sonnet 5**: ProxyAPI дороже прямого API на **1 951 ₽**.
- Для **Kimi K3** разница составляет **1 304 ₽**.
- ProxyAPI не имеет одной общей «наценки на всё»: для MiniMax M3 итог ниже прямого vendor-профиля, а для GLM 5.2 разница всего 50 ₽.
- OpenRouter в текущем API-ответе равен вендору для Claude/Kimi и ниже вендора для DeepSeek/GLM/MiniMax. Причина не доказывается одной таблицей; факт цены фиксируется отдельно.
- Это benchmark **стоимости вызова**, а не benchmark качества, скорости, SLA, доступности карт или юридического контура.

## Кэш и условия

Кэш не включён в основной workload. Ниже — отдельные условия из живых прайсов. Значения в USD за 1 млн токенов.

| Модель | Вендор | OpenRouter | ProxyAPI |
|---|---|---|---|
| DeepSeek V4.1 Flash | cache hit $0,006 peak; miss $0,30; output $1,20; off-peak тарифы в 2 раза ниже | обычный input $0,15; cache-read $0,003 | публичное cache-read/write условие не найдено |
| Claude Sonnet 5 | cache-read $0,20; cache-write $2,50; input $2; output $10 | cache-read $0,20; cache-write $2,50 | публичное cache-read/write условие не найдено |
| GLM 5.2 | cache-read $0,26; хранение кэша временно бесплатно | cache-read $0,12064 | публичное cache-read/write условие не найдено |
| Kimi K3 | cache-read $0,30; write $3 для TTL 5 мин или $6 для TTL 1 ч | cache-read $0,30 | публичное cache-read/write условие не найдено |
| MiniMax M3 | cache-read $0,12 для input ≤512k | cache-read $0,06 | публичное cache-read/write условие не найдено |

Нельзя использовать cache-read как обычный input. Нельзя выдавать отсутствие опубликованной цены ProxyAPI за бесплатный кэш.

## Exact model IDs

| Модель | Vendor ID | OpenRouter ID | ProxyAPI URL |
|---|---|---|---|
| DeepSeek V4.1 Flash | `deepseek-flash` / `DeepSeek-V4.1-Flash` | `deepseek/deepseek-v4.1-flash` | `https://proxyapi.ru/models/deepseek/deepseek-v4.1-flash` |
| Claude Sonnet 5 | `claude-sonnet-5` | `anthropic/claude-sonnet-5` | `https://proxyapi.ru/models/anthropic/claude-sonnet-5` |
| GLM 5.2 | `glm-5.2` | `z-ai/glm-5.2` | `https://proxyapi.ru/models/z-ai/glm-5.2` |
| Kimi K3 | `kimi-k3` | `moonshotai/kimi-k3` | `https://proxyapi.ru/models/moonshotai/kimi-k3` |
| MiniMax M3 | `MiniMax-M3` | `minimax/minimax-m3` | `https://proxyapi.ru/models/minimax/minimax-m3` |

## Live sources

### Vendor

- DeepSeek pricing: https://api-docs.deepseek.com/quick_start/pricing
- Anthropic pricing: https://www.anthropic.com/pricing
- Z.AI pricing: https://docs.z.ai/guides/overview/pricing.md
- Kimi pricing: https://platform.moonshot.ai/docs/pricing
- MiniMax pay-as-you-go pricing: https://platform.minimax.io/docs/guides/pricing-paygo

### OpenRouter

- Live model catalogue and `pricing.prompt`, `pricing.completion`, `pricing.input_cache_read`, `pricing.input_cache_write`: https://openrouter.ai/api/v1/models

### ProxyAPI

- Catalogue: https://proxyapi.ru/models
- DeepSeek V4.1 Flash: https://proxyapi.ru/models/deepseek/deepseek-v4.1-flash
- Claude Sonnet 5: https://proxyapi.ru/models/anthropic/claude-sonnet-5
- GLM 5.2: https://proxyapi.ru/models/z-ai/glm-5.2
- Kimi K3: https://proxyapi.ru/models/moonshotai/kimi-k3
- MiniMax M3: https://proxyapi.ru/models/minimax/minimax-m3

## Ограничения

- DeepSeek vendor имеет peak/off-peak тариф. Основной benchmark использует peak, чтобы не прятать диапазон времени.
- Цены могут измениться. В HTML нельзя писать «навсегда» или «рыночная наценка».
- ProxyAPI не показывает на этих публичных карточках полный cache contract. Поэтому в cache-колонке стоит «не найдено», а не ноль.
- Вендор, OpenRouter и ProxyAPI могут различаться по доступности, оплате, SLA и региональным ограничениям. Это отдельные свойства кассы, не часть стоимости токена.
