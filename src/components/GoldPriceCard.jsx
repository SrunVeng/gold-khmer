import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { formatCurrency, formatNumber } from "../utils/format";

export default function GoldPriceCard({ computed, currencyLabel, gold, locale }) {
    const { t } = useTranslation();

    // Price movement (from your gold feed)
    const goldDelta = gold?.chg ?? 0; // absolute change in USD
    const goldPc = gold?.pc ?? 0;     // % change
    const up = goldDelta >= 0;

    // Unit prices in *display currency* (USD or KHR typically)
    const perDomleng = computed?.perDomleng;
    const perChi = computed?.perChi ?? (typeof perDomleng === "number" ? perDomleng / 10 : undefined);
    const perHun = computed?.perHun ?? (typeof perDomleng === "number" ? perDomleng / 100 : undefined);
    const perLi  = computed?.perLi  ?? (typeof perDomleng === "number" ? perDomleng / 1000 : undefined);

    // For precise USD calculator:
    // If display currency is not USD, we need FX: 1 USD = fxUsdToCurrency (e.g. 4100 KHR)
    const fxUsdToCurrency = computed?.fxUsdToCurrency;

    const toUSD = (priceInDisplay) => {
        if (priceInDisplay == null) return undefined;
        if (currencyLabel === "USD") return priceInDisplay;
        if (typeof fxUsdToCurrency === "number" && fxUsdToCurrency > 0) {
            return priceInDisplay / fxUsdToCurrency;
        }
        return undefined; // cannot convert without FX
    };

    const perDomlengUSD = toUSD(perDomleng);
    const perChiUSD     = toUSD(perChi);
    const perHunUSD     = toUSD(perHun);
    const perLiUSD      = toUSD(perLi);

    // USD input (user entered)
    const [usdInput, setUsdInput] = useState("");

    const usdValue = useMemo(() => {
        const n = parseFloat(String(usdInput).replace(/,/g, ""));
        return Number.isFinite(n) && n >= 0 ? n : 0;
    }, [usdInput]);

    const canCalcUSD = useMemo(() => {
        if (currencyLabel === "USD") return true;
        return typeof fxUsdToCurrency === "number" && fxUsdToCurrency > 0;
    }, [currencyLabel, fxUsdToCurrency]);

    // Canonical decomposition using integer math in 'li' (1 domleng = 1000 li)
    const breakdown = useMemo(() => {
        // Need per-domleng USD price to compute price per li
        if (!canCalcUSD || typeof perDomlengUSD !== "number" || perDomlengUSD <= 0) {
            return null;
        }

        // Total 'li' purchasable without overspending:
        // liTotal = floor( (USD * 1000) / perDomlengUSD )
        const rawLi = (usdValue * 1000) / perDomlengUSD;
        const liTotal = Math.floor(rawLi + 1e-9); // epsilon guards tiny FP error

        // Decompose liTotal → domleng / chi / hun / li
        const domleng = Math.floor(liTotal / 1000);
        let rem = liTotal - domleng * 1000;

        const chi = Math.floor(rem / 100);
        rem -= chi * 100;

        const hun = Math.floor(rem / 10);
        rem -= hun * 10;

        const li = rem;

        // Compute spent USD from exact li count (for optional display)
        // spent = liTotal * (perDomlengUSD / 1000)
        const spentUSD = (liTotal * perDomlengUSD) / 1000;
        const changeUSD = Math.max(0, usdValue - spentUSD);

        return { domleng, chi, hun, li, spentUSD, changeUSD, liTotal };
    }, [usdValue, perDomlengUSD, canCalcUSD]);

    return (
        <div className="rounded-2xl border border-gray-200 p-4 sm:p-6 shadow-sm bg-white">
            {/* Header: current price & change */}
            <div className="flex items-start justify-between">
                <div>
                    <div className="text-xs uppercase tracking-wide text-gray-500">
                        {t("gold", "Gold")}
                    </div>
                    <div className="flex items-baseline gap-3">
                        <div className="text-3xl sm:text-4xl font-semibold">
                            {formatCurrency(perDomleng, { currency: currencyLabel, locale })}
                        </div>
                        <div className={`text-sm ${up ? "text-emerald-600" : "text-rose-600"}`}>
                            {up ? "▲" : "▼"}{" "}
                            {formatNumber(Math.abs(goldPc), { locale, digits: 2 })}%{" "}
                            ({up ? "+" : "-"}
                            {formatCurrency(Math.abs(goldDelta), { currency: "USD", locale })}){" "}
                            <span className="text-gray-400">
                ({t("gold_change", "Change")})
              </span>
                        </div>
                    </div>
                    <div className="text-gray-500 mt-1 text-sm">
                        {t("per_domleng", "per Dom Leng")}
                    </div>
                </div>
            </div>

            {/* Unit price table */}
            <div className="mt-4 flex flex-col gap-2 text-sm text-gray-700">
                <div>
                    <span className="text-gray-500">{t("per_chi", "per Chi")}:</span>{" "}
                    <span className="font-medium">
            {formatCurrency(perChi, { currency: currencyLabel, locale })}
          </span>
                </div>
                <div>
                    <span className="text-gray-500">{t("per_hun", "per Hun")}:</span>{" "}
                    <span className="font-medium">
            {formatCurrency(perHun, { currency: currencyLabel, locale })}
          </span>
                </div>
                <div>
                    <span className="text-gray-500">{t("per_li", "per Li")}:</span>{" "}
                    <span className="font-medium">
            {formatCurrency(perLi, { currency: currencyLabel, locale })}
          </span>
                </div>
            </div>

            {/* USD Calculator */}
            <div className="mt-6 border-t pt-4">
                <label htmlFor="usdInput" className="block text-sm font-medium text-gray-700">
                    {t("enter_usd", "Enter amount (USD)")}
                </label>
                <div className="mt-2 flex items-center gap-2">
                    <div className="relative flex-1">
            <span className="pointer-events-none absolute inset-y-0 left-3 grid place-items-center text-gray-500">
              $
            </span>
                        <input
                            id="usdInput"
                            inputMode="decimal"
                            type="text"
                            placeholder="0.00"
                            aria-label={t("enter_usd", "Enter amount (USD)")}
                            className="w-full rounded-xl border px-6 py-2 text-base outline-none focus:ring-2 focus:ring-blue-500"
                            value={usdInput}
                            onChange={(e) => setUsdInput(e.target.value)}
                        />
                    </div>
                    {usdInput && (
                        <button
                            type="button"
                            onClick={() => setUsdInput("")}
                            className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
                            aria-label={t("clear", "Clear")}
                            title={t("clear", "Clear")}
                        >
                            {t("clear", "Clear")}
                        </button>
                    )}
                </div>

                {!canCalcUSD ? (
                    <p className="mt-3 text-sm text-amber-600">
                        {t(
                            "usd_calc_needs_fx",
                            "To calculate accurately from USD, provide computed.fxUsdToCurrency (e.g., USD→KHR)."
                        )}
                    </p>
                ) : (typeof perDomlengUSD !== "number" || perDomlengUSD <= 0) ? (
                    <p className="mt-3 text-sm text-rose-600">
                        {t("error_price_missing", "Price per domleng unavailable.")}
                    </p>
                ) : (
                    <>
                        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div className="rounded-xl border p-3">
                                <div className="text-xs text-gray-500">{t("domleng", "Dom Leng")}</div>
                                <div className="text-lg font-semibold">
                                    {breakdown
                                        ? formatNumber(breakdown.domleng, { locale, digits: 0 })
                                        : "—"}
                                </div>
                            </div>
                            <div className="rounded-xl border p-3">
                                <div className="text-xs text-gray-500">{t("chi", "Chi")}</div>
                                <div className="text-lg font-semibold">
                                    {breakdown
                                        ? formatNumber(breakdown.chi, { locale, digits: 0 })
                                        : "—"}
                                </div>
                            </div>
                            <div className="rounded-xl border p-3">
                                <div className="text-xs text-gray-500">{t("hun", "Hun")}</div>
                                <div className="text-lg font-semibold">
                                    {breakdown
                                        ? formatNumber(breakdown.hun, { locale, digits: 0 })
                                        : "—"}
                                </div>
                            </div>
                            <div className="rounded-xl border p-3">
                                <div className="text-xs text-gray-500">{t("li", "Li")}</div>
                                <div className="text-lg font-semibold">
                                    {breakdown
                                        ? formatNumber(breakdown.li, { locale, digits: 0 })
                                        : "—"}
                                </div>
                            </div>
                        </div>

                        {/* Optional: show how much USD is used and change */}
                        {usdInput && breakdown && (
                            <div className="mt-2 text-xs text-gray-500">
                <span className="mr-3">
                  {t("used", "Used")}:{" "}
                    {formatCurrency(breakdown.spentUSD, { currency: "USD", locale })}
                </span>
                                <span>
                  {t("change", "Change")}:{" "}
                                    {formatCurrency(breakdown.changeUSD, { currency: "USD", locale })}
                </span>
                            </div>
                        )}

                        <p className="mt-2 text-xs text-gray-500">
                            {t(
                                "calc_note_precise",
                                "Quantities use USD unit prices (converted from the current display currency)."
                            )}
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}
