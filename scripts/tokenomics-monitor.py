#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
tokenomics-monitor.py — сборщик живых цен на LLM по провайдерам.

Зачем: главный тезис лендинга nacenka.html — «одна и та же модель у разных
провайдеров стоит по-разному». Этот скрипт тянет публичные машиночитаемые
источники цен и строит таблицу «модель × провайдер», чтобы не собирать
цифры руками каждый раз.

Источники (все отдают JSON без ключа, проверено 26.09.2026):
  1. models.dev        — 223 провайдера, ~7800 пар «модель+провайдер» с ценами
                         (это первоисточник llmpricing.dev). ЕДИНИЦА: USD / 1M.
  2. LiteLLM           — canonical model_prices_and_context_window.json,
                         ~4400 записей. ЕДИНИЦА: USD / token.
  3. llmoney.ru        — РФ-калькулятор, 150+ моделей, цены в USD с кэшем.
  4. VseGPT            — РФ-агрегатор, ~465 моделей. ЕДИНИЦА: RUB / 1000 символов.
  5. RouterAI          — РФ-агрегатор, ~527 моделей. ЕДИНИЦА: USD / token + кэш.
  6. Polza.ai          — РФ-агрегатор, 419 моделей (каталог без цен в /models).

Запуск:  python market-intel/tokenomics-monitor.py
Вывод:   market-intel/tokenomics-<дата>.md  +  печать в stdout
"""

import json
import sys
import urllib.request
from datetime import date, datetime, timezone
from pathlib import Path

HERE = Path(__file__).resolve().parent
# Отчёты пишем в приватный market-intel/ (в .gitignore) — скрипт публичен, отчёты нет.
OUT_DIR = HERE.parent / "market-intel"
OUT_DIR.mkdir(exist_ok=True)
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126 Safari/537.36"

SOURCES = {
    "models.dev": "https://models.dev/api.json",
    "litellm": "https://raw.githubusercontent.com/BerriAI/litellm/main/model_prices_and_context_window.json",
    "llmoney": "https://api.llmoney.ru/api/v1/models",
    "vsegpt": "https://api.vsegpt.ru/v1/models",
    "routerai": "https://routerai.ru/api/v1/models",
    "polza": "https://api.polza.ai/v1/models",
}

# Модели, которые сравниваются на лендинге (фрагмент имени в нижнем регистре).
TARGETS = {
    "deepseek v4.1 flash": ["deepseek-v4.1-flash", "deepseek-v4-1-flash"],
    "claude sonnet 5": ["claude-sonnet-5"],
    "glm 5.2": ["glm-5.2"],
    "kimi k3": ["kimi-k3"],
    "minimax m3": ["minimax-m3"],
}


def fetch(url: str, timeout: int = 60, attempts: int = 3):
    """Грузим через curl: часть РФ-эндпоинтов не отвечает на urllib (виснет)."""
    import subprocess
    last = None
    for i in range(attempts):
        try:
            p = subprocess.run(
                ["curl", "-sS", "--max-time", str(timeout), "-A", UA,
                 "-H", "Accept: application/json", url],
                capture_output=True, timeout=timeout + 20,
            )
            if p.returncode != 0 or not p.stdout:
                raise RuntimeError(p.stderr.decode("utf-8", "replace").strip() or f"curl rc={p.returncode}")
            return json.loads(p.stdout.decode("utf-8", "replace"))
        except Exception as e:  # noqa: BLE001
            last = e
            print(f"         попытка {i+1}/{attempts} не удалась: {e}")
    raise last


def norm_usd_per_m(value, unit):
    """Привести цену к USD за 1M токенов."""
    if value in (None, ""):
        return None
    try:
        v = float(value)
    except (TypeError, ValueError):
        return None
    if unit == "usd_per_token":
        return v * 1_000_000
    if unit == "usd_per_m":
        return v
    if unit == "rub_per_1k_chars":
        # VseGPT: ₽ за 1000 символов. ~3.5 символа/токен (грубая оценка),
        # в USD по курсу 84,3414 ₽/$ (ЦБ 26.09.2026).
        return v / 3.5 * 1000 / 84.3414
    return v


CBR_RATE = 84.3414  # ₽/$ — ЦБ РФ, данные 2026-09-26

# Вендоры-первоисточники: их собственная цена = базовая линия для implied-курса.
VENDOR_PROVIDERS = {
    "anthropic", "openai", "deepseek", "zai", "moonshotai", "minimax",
    "google", "xai", "alibaba", "mistral",
}


def build_vendor_usd(rows):
    """Для каждого model_id — цена вендора-первоисточника ($/1M, вход).

    Нужна как базовая линия: implied-курс = рублёвая цена роутера ÷ цена вендора.
    """
    out = {}
    for r in rows:
        if r.get("source") != "models.dev":
            continue
        prov = (r.get("provider") or "").lower()
        if prov not in VENDOR_PROVIDERS:
            continue
        mid = (r.get("model_id") or "").lower()
        v = r.get("in_usd_m")
        if not mid or not v or v <= 0:
            continue
        # ключ — последний сегмент id без префикса провайдера
        short = mid.split("/")[-1]
        for key in (mid, short):
            out.setdefault(key, v)
    return out


def collect():
    data = {}
    errors = {}
    for name, url in SOURCES.items():
        try:
            data[name] = fetch(url)
            print(f"  [ok]   {name:12s} {url}")
        except Exception as e:  # noqa: BLE001
            errors[name] = str(e)
            print(f"  [FAIL] {name:12s} {e}")
    return data, errors


def rows_from_modelsdev(j):
    """models.dev: provider -> {models: {id: {cost:{input,output,cache_read,cache_write}}}}"""
    out = []
    for prov, pd in j.items():
        for mid, md in (pd.get("models") or {}).items():
            c = md.get("cost") or {}
            if not c:
                continue
            out.append({
                "source": "models.dev",
                "provider": prov,
                "model_id": mid,
                "model_name": md.get("name") or mid,
                "in_usd_m": norm_usd_per_m(c.get("input"), "usd_per_m"),
                "out_usd_m": norm_usd_per_m(c.get("output"), "usd_per_m"),
                "cache_read_usd_m": norm_usd_per_m(c.get("cache_read"), "usd_per_m"),
                "cache_write_usd_m": norm_usd_per_m(c.get("cache_write"), "usd_per_m"),
                "currency_note": "USD/1M (публичный прайс провайдера)",
            })
    return out


def rows_from_litellm(j):
    out = []
    for mid, md in j.items():
        if mid == "sample_spec" or not isinstance(md, dict):
            continue
        inp = md.get("input_cost_per_token")
        outp = md.get("output_cost_per_token")
        if inp is None and outp is None:
            continue
        out.append({
            "source": "litellm",
            "provider": md.get("litellm_provider", "?"),
            "model_id": mid,
            "model_name": mid,
            "in_usd_m": norm_usd_per_m(inp, "usd_per_token"),
            "out_usd_m": norm_usd_per_m(outp, "usd_per_token"),
            "cache_read_usd_m": norm_usd_per_m(md.get("cache_read_input_token_cost"), "usd_per_token"),
            "cache_write_usd_m": norm_usd_per_m(md.get("cache_creation_input_token_cost"), "usd_per_token"),
            "currency_note": "USD/1M (из $/token)",
        })
    return out


def rows_from_llmoney(j):
    out = []
    for m in j.get("models", []):
        cur = (m.get("currency") or "usd").lower()
        inp = m.get("input_price")
        outp = m.get("output_price")
        cr = m.get("cached_input_price")
        if cur == "rub":
            in_usd = norm_usd_per_m(inp, "usd_per_m")
            in_usd = in_usd / CBR_RATE if in_usd is not None else None
            out_usd = norm_usd_per_m(outp, "usd_per_m")
            out_usd = out_usd / CBR_RATE if out_usd is not None else None
            cr_usd = norm_usd_per_m(cr, "usd_per_m")
            cr_usd = cr_usd / CBR_RATE if cr_usd is not None else None
        else:
            in_usd = norm_usd_per_m(inp, "usd_per_m")
            out_usd = norm_usd_per_m(outp, "usd_per_m")
            cr_usd = norm_usd_per_m(cr, "usd_per_m")
        out.append({
            "source": "llmoney.ru",
            "provider": m.get("provider_display_name") or m.get("provider", "?"),
            "model_id": m.get("name") or m.get("id"),
            "model_name": m.get("display_name") or m.get("name") or m.get("id"),
            "currency": cur,
            "in_native_m": inp,
            "out_native_m": outp,
            "in_usd_m": in_usd,
            "out_usd_m": out_usd,
            "cache_read_usd_m": cr_usd,
            "cache_write_usd_m": None,
            "provider_kind": m.get("provider_kind"),
            "currency_note": "₽/1M" if cur == "rub" else "USD/1M",
        })
    return out


def rows_from_vsegpt(j):
    """VseGPT: ₽ за 1000 СИМВОЛОВ (не токенов) — оценка, помечаем отдельно."""
    out = []
    for m in j.get("data", []):
        p = m.get("pricing") or {}
        in_rub = p.get("prompt")
        out_rub = p.get("completion")
        # перевод: ₽/1000 симв. → ₽/1M токенов (~3.5 симв./токен)
        in_rub_m = (float(in_rub) / 3.5 * 1000) if in_rub not in (None, "") else None
        out_rub_m = (float(out_rub) / 3.5 * 1000) if out_rub not in (None, "") else None
        out.append({
            "source": "vsegpt",
            "provider": "VseGPT",
            "model_id": m.get("id"),
            "model_name": m.get("name") or m.get("id"),
            "currency": "rub_est",
            "in_native_m": in_rub_m,
            "out_native_m": out_rub_m,
            "in_usd_m": in_rub_m / CBR_RATE if in_rub_m is not None else None,
            "out_usd_m": out_rub_m / CBR_RATE if out_rub_m is not None else None,
            "cache_read_usd_m": None,
            "cache_write_usd_m": None,
            "provider_kind": "router",
            "currency_note": "₽/1000 символов → оценка ₽/1M",
        })
    return out


def rows_from_routerai(j):
    """RouterAI отдаёт цены в ₽ за токен (проверено: implied-курс ~109,6 ₽/$)."""
    out = []
    for m in j.get("data", []):
        p = m.get("pricing") or {}
        inp = p.get("prompt")
        outp = p.get("completion")
        cr = p.get("input_cache_read")
        cw = p.get("input_cache_write")
        in_rub = inp * 1_000_000 if inp is not None else None
        out_rub = outp * 1_000_000 if outp is not None else None
        cr_rub = cr * 1_000_000 if cr is not None else None
        cw_rub = cw * 1_000_000 if cw is not None else None
        out.append({
            "source": "routerai.ru",
            "provider": "RouterAI",
            "model_id": m.get("id"),
            "model_name": m.get("name") or m.get("id"),
            "currency": "rub",
            "in_native_m": in_rub,
            "out_native_m": out_rub,
            "in_usd_m": in_rub / CBR_RATE if in_rub is not None else None,
            "out_usd_m": out_rub / CBR_RATE if out_rub is not None else None,
            "cache_read_usd_m": cr_rub / CBR_RATE if cr_rub is not None else None,
            "cache_write_usd_m": cw_rub / CBR_RATE if cw_rub is not None else None,
            "provider_kind": "router",
            "currency_note": "₽/1M (из ₽/token)",
        })
    return out


def match_targets(rows):
    """Для каждой целевой модели — все провайдеры, у которых она есть."""
    result = {t: [] for t in TARGETS}
    for r in rows:
        hay = ((r.get("model_id") or "") + " " + (r.get("model_name") or "")).lower()
        for t, frags in TARGETS.items():
            if any(f in hay for f in frags):
                result[t].append(r)
    return result


def fmt(v):
    if v is None:
        return "—"
    if v == 0:
        return "0"
    if v < 0.01:
        return f"{v:.4f}"
    if v < 1:
        return f"{v:.3f}"
    return f"{v:.2f}"


def main():
    today = date.today().isoformat()
    print("Сбор живых цен LLM по провайдерам")
    print("=" * 60)
    data, errors = collect()

    rows = []
    if "models.dev" in data:
        rows += rows_from_modelsdev(data["models.dev"])
    if "litellm" in data:
        rows += rows_from_litellm(data["litellm"])
    if "llmoney" in data:
        rows += rows_from_llmoney(data["llmoney"])
    if "vsegpt" in data:
        rows += rows_from_vsegpt(data["vsegpt"])
    if "routerai" in data:
        rows += rows_from_routerai(data["routerai"])

    print(f"\nВсего строк «модель×провайдер»: {len(rows)}")
    per_source = {}
    for r in rows:
        per_source[r["source"]] = per_source.get(r["source"], 0) + 1
    for s, n in sorted(per_source.items(), key=lambda x: -x[1]):
        print(f"  {s:12s} {n}")

    matched = match_targets(rows)
    VENDOR_USD = build_vendor_usd(rows)
    print(f"Вендорских базовых цен (models.dev): {len(VENDOR_USD)}")

    lines = []
    lines.append(f"# Токеномика: живые цены по провайдерам — {today}")
    lines.append("")
    lines.append("Автосбор `market-intel/tokenomics-monitor.py`. Все цены приведены к **USD за 1M токенов**.")
    lines.append("Единица сравнения — **одна и та же модель у разных провайдеров** (тезис лендинга).")
    lines.append("")
    lines.append("## Источники (машиночитаемые, без ключа)")
    lines.append("")
    lines.append("Полный каталог площадок с бенчмарками (включая сайты-аналитику и РФ-разборы):")
    lines.append("`market-intel/benchmark-sites-catalog-2026-09-26.md`")
    lines.append("")
    lines.append("| Источник | URL | Моделей | Единица в источнике |")
    lines.append("|---|---|---:|---|")
    src_meta = {
        "models.dev": ("https://models.dev/api.json", "223 провайдера, ~7800 пар", "USD / 1M"),
        "litellm": ("github.com/BerriAI/litellm model_prices…json", "~4400 записей", "USD / token"),
        "llmoney": ("https://api.llmoney.ru/api/v1/models", "151", "USD / 1M"),
        "vsegpt": ("https://api.vsegpt.ru/v1/models", "465", "RUB / 1000 символов"),
        "routerai": ("https://routerai.ru/api/v1/models", "527", "USD / token"),
        "polza": ("https://api.polza.ai/v1/models", "419", "каталог без цен"),
    }
    for s, (u, n, unit) in src_meta.items():
        st = "ok" if s in data else "FAIL"
        lines.append(f"| {s} [{st}] | {u} | {n} | {unit} |")
    lines.append("")
    if errors:
        lines.append("**Ошибки сбора:** " + "; ".join(f"{k}: {v}" for k, v in errors.items()))
        lines.append("")

    # ---- Executive summary: разброс по нашим 5 моделям ----
    lines.append("## Главное (TL;DR)")
    lines.append("")
    lines.append("Наценка не публикуется строкой «комиссия N%» — её видно только в сравнении.")
    lines.append("Формула: `implied-курс = цена роутера ₽/1M ÷ цена вендора $/1M`, `наценка = implied ÷ курс ЦБ`.")
    lines.append("")
    for t in TARGETS:
        rws = [r for r in (matched.get(t) or [])
               if r.get("in_usd_m") and r["in_usd_m"] > 0.001 and r.get("currency") != "rub_est"]
        if len(rws) < 2:
            continue
        rws.sort(key=lambda r: r["in_usd_m"])
        lo, hi = rws[0], rws[-1]
        lines.append(
            f"- **{t}**: ${lo['in_usd_m']:.3f} ({lo['provider']}) … ${hi['in_usd_m']:.3f} ({hi['provider']}) "
            f"→ разброс **×{hi['in_usd_m']/lo['in_usd_m']:.1f}** по {len(rws)} провайдерам с ценой"
        )
    lines.append("")
    lines.append("_Из разброса исключены free/token-plan (цена 0) и источник vsegpt (единица — символы, не токены)._")
    lines.append("")

    lines.append("## Одна модель у разных провайдеров (USD / 1M)")
    lines.append("")
    for t in TARGETS:
        rws = matched.get(t) or []
        # только строки с ценой
        priced = [r for r in rws if r.get("in_usd_m") is not None]
        # сортируем по входу, берём топ-40
        priced.sort(key=lambda r: (r["in_usd_m"], r["provider"]))
        lines.append(f"### {t} — {len(priced)} провайдеров с ценой")
        lines.append("")
        if not priced:
            lines.append("_нет совпадений с ценой в собранных источниках_")
            lines.append("")
            continue
        lines.append("| Источник | Провайдер | Модель (id) | Вход $/1M | Выход $/1M | Кэш-чтение | Кэш-запись | Единица |")
        lines.append("|---|---|---|---:|---:|---:|---:|---|")
        for r in priced[:40]:
            lines.append(
                f"| {r['source']} | {r['provider']} | {r['model_id']} | "
                f"{fmt(r['in_usd_m'])} | {fmt(r['out_usd_m'])} | "
                f"{fmt(r['cache_read_usd_m'])} | {fmt(r['cache_write_usd_m'])} | "
                f"{r.get('currency_note') or 'USD/1M'} |"
            )
        # разброс: считаем только сопоставимые (не нулевые, не free-планы)
        ins = [r["in_usd_m"] for r in priced if r["in_usd_m"] and r["in_usd_m"] > 0.001]
        if len(ins) >= 2:
            lo, hi = min(ins), max(ins)
            lines.append("")
            lines.append(f"**Разброс по входу:** ${lo:.4f} … ${hi:.4f} за 1M → **×{hi/lo:.1f}** между самой дешёвой и самой дорогой кассой.")
        lines.append("")

    # ---- РФ-агрегаторы: рубли как есть + implied-курс ----
    ru = [r for r in rows if r.get("currency") in ("rub", "rub_est") and r.get("in_native_m")]
    if ru:
        lines.append("## РФ-агрегаторы: рублёвый прайс и наценка к курсу ЦБ")
        lines.append("")
        lines.append(f"Курс ЦБ на дату сбора: **{CBR_RATE} ₽/$**. Наценка = implied-курс / курс ЦБ,")
        lines.append("где implied-курс = (цена в ₽ за 1M) / (официальная цена вендора в $ за 1M).")
        lines.append("Это независимая проверка тезиса лендинга про «наценку перекупа».")
        lines.append("")
        lines.append("| Провайдер | Модель | Вход ₽/1M | Выход ₽/1M | Кэш ₽/1M | Вход $/1M (по ЦБ) |")
        lines.append("|---|---|---:|---:|---:|---:|")
        for r in sorted(ru, key=lambda x: (x["provider"], -(x["in_native_m"] or 0)))[:120]:
            lines.append(
                f"| {r['provider']} | {r['model_id']} | {fmt(r['in_native_m'])} | "
                f"{fmt(r['out_native_m'])} | {fmt(r['cache_read_usd_m'] * CBR_RATE if r['cache_read_usd_m'] else None)} | "
                f"{fmt(r['in_usd_m'])} |"
            )
        lines.append("")
        lines.append("**Готовые implied-курсы по РФ-роутерам** (вход, ₽/1M ÷ вендорский $/1M):")
        lines.append("")
        lines.append("| Провайдер | Модель | Вендор $/1M | ₽/1M у роутера | Implied ₽/$ | Наценка к ЦБ |")
        lines.append("|---|---|---:|---:|---:|---:|")
        for r in sorted(ru, key=lambda x: (x["provider"], x["model_id"])):
            vend = VENDOR_USD.get(r["model_id"]) or VENDOR_USD.get((r["model_id"] or "").split("/")[-1])
            if vend and r["in_native_m"]:
                implied = r["in_native_m"] / vend
                lines.append(
                    f"| {r['provider']} | {r['model_id']} | ${vend:.4f} | {fmt(r['in_native_m'])} | "
                    f"{implied:.1f} | **×{implied/CBR_RATE:.1f}** |"
                )
        lines.append("")

    lines.append("---")
    lines.append("")
    lines.append(f"Сгенерировано: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}")
    lines.append("")
    lines.append("**Важно:** models.dev / LiteLLM — это цены, опубликованные самими провайдерами;")
    lines.append("они не включают рублёвую наценку РФ-агрегаторов (курс, комиссия). Для РФ-картины")
    lines.append("смотри llmoney / VseGPT / RouterAI и отдельный разбор `provider-benchmark-4cash-*.md`.")

    text = "\n".join(lines)
    out = OUT_DIR / f"tokenomics-{today}.md"
    out.write_text(text, encoding="utf-8")
    print(f"\nЗаписано: {out}  ({len(text)} символов)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
