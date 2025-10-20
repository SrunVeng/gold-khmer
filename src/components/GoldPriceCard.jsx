import React from "react";
import { useTranslation } from "react-i18next";
import { formatCurrency, formatNumber } from "../utils/format";

export default function GoldPriceCard({ computed, currencyLabel, gold, locale }) {
    const { t } = useTranslation();
    const goldDelta = gold?.chg ?? 0;   // absolute change in USD (from your feed)
    const goldPc = gold?.pc ?? 0;       // % change
    const up = goldDelta >= 0;

    // Fallbacks if caller doesn’t supply these explicitly
    const perChi = computed?.perChi;
    const perHun = computed?.perHun ?? (typeof perChi === "number" ? perChi / 10 : undefined);
    const perLi = computed?.perLi ?? (typeof perHun === "number" ? perHun / 10 : undefined);

    return (
        <div className="rounded-2xl border border-gray-200 p-4 sm:p-6 shadow-sm bg-white">
            <div className="flex items-start justify-between">
                <div>
                    <div className="text-xs uppercase tracking-wide text-gray-500">
                        {t("gold", "Gold")}
                    </div>
                    <div className="flex items-baseline gap-3">
                        <div className="text-3xl sm:text-4xl font-semibold">
                            {formatCurrency(computed.perDomleng, { currency: currencyLabel, locale })}
                        </div>
                        <div className={`text-sm ${up ? "text-emerald-600" : "text-rose-600"}`}>
                            {up ? "▲" : "▼"} {formatNumber(Math.abs(goldPc), { locale, digits: 2 })}%{" "}
                            {/* NEW: absolute change in USD */}
                            ({up ? "+" : "-"}
                            {formatCurrency(Math.abs(goldDelta), { currency: "USD", locale })}){" "}
                            <span className="text-gray-400">({t("gold_change", "change")})</span>
                        </div>
                    </div>
                    <div className="text-gray-500 mt-1 text-sm">
                        {t("per_domleng", "per domleng")}
                    </div>
                </div>
            </div>

            <div className="mt-4 flex flex-col gap-2 text-sm text-gray-700">
                <div>
                    <span className="text-gray-500">{t("per_chi", "per chi")}:</span>{" "}
                    <span className="font-medium">
                        {formatCurrency(perChi, { currency: currencyLabel, locale })}
                    </span>
                </div>

                <div>
                    <span className="text-gray-500">{t("per_hun", "per hun")}:</span>{" "}
                    <span className="font-medium">
                        {formatCurrency(perHun, { currency: currencyLabel, locale })}
                    </span>
                </div>

                <div>
                    <span className="text-gray-500">{t("per_li", "per li")}:</span>{" "}
                    <span className="font-medium">
                        {formatCurrency(perLi, { currency: currencyLabel, locale })}
                    </span>
                </div>
            </div>
        </div>
    );
}
