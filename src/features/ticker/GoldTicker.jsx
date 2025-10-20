import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import useLivePrices from "../../hooks/useLivePrices.js";
import GoldPriceCard from "../../components/GoldPriceCard";
import { DEFAULT_DOMLENG_GRAMS, TROY_OUNCE_GRAMS } from "../../utils/units";
import { formatTime } from "../../utils/format";

const TZ_PP = "Asia/Phnom_Penh";
const TZ_NY = "America/New_York";

export default function GoldTicker() {
    const { t, i18n } = useTranslation();
    const { gold, ready } = useLivePrices(); // only use gold + ready

    const domlengG = DEFAULT_DOMLENG_GRAMS;
    const locale = i18n.resolvedLanguage || i18n.language || "en";

    const computed = useMemo(() => {
        const priceOzUSD = gold?.xau;
        if (!priceOzUSD) return null;

        const perDomlengUSD = priceOzUSD * (domlengG / TROY_OUNCE_GRAMS);
        const perChiUSD = perDomlengUSD / 10;
        const perHunUSD = perChiUSD / 10;
        const perLiUSD = perHunUSD / 10;

        return {
            // generic keys commonly used by the card
            perDomleng: perDomlengUSD,
            perChi: perChiUSD,
            perHun: perHunUSD,
            perLi: perLiUSD,
            // explicit USD keys if the card needs them
            perDomlengUSD,
            perChiUSD,
            perHunUSD,
            perLiUSD,
            priceOzUSD,
        };
    }, [gold?.xau, domlengG]);

    if (!ready || !computed || !gold?.ts) {
        return (
            <div className="w-full max-w-3xl mx-auto">
                <div className="animate-pulse h-24 rounded-2xl bg-gray-100" />
            </div>
        );
    }

    const tsPP = formatTime(gold.ts, TZ_PP);
    const dateNY = gold.dateNY ?? formatTime(gold.ts, TZ_NY);
    const currencyLabel = "USD";

    return (
        <div className="w-full max-w-3xl mx-auto">
            <GoldPriceCard
                computed={computed}
                currencyLabel={currencyLabel}
                gold={{ ...gold, tsPP, dateNY }}
                locale={locale}
            />

            <div className="mt-2 text-xs text-gray-500 text-right">
                {t("last_updated_pp", "Last updated (PP)")}:{" "}
                <span className="font-medium">{tsPP}</span>
                <span className="mx-2">•</span>
                {t("ny_time", "NY time")}: <span className="font-medium">{dateNY}</span>
            </div>
        </div>
    );
}
