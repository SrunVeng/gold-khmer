import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";
import {
    ArrowRightLeft,
    DollarSign,
    ExternalLink,
    LineChart,
    Lock,
    ShoppingCart,
    TrendingDown,
    TrendingUp,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatCurrency, formatNumber } from "../utils/format";

// ⬇️ new imports
import { useToast } from "./Toast.jsx";
import { useConfirm } from "./ConfirmGuard.jsx";

const STORAGE_KEY = "goldTradeCard:v6";

function cls(...xs) {
    return xs.filter(Boolean).join(" ");
}

/** ---------- Smooth number helpers (no flicker) ---------- */
function useSpringNumber(target, { stiffness = 160, damping = 22, mass = 0.25 } = {}) {
    const prefersReduce = useReducedMotion();
    const mv = useMotionValue(typeof target === "number" ? target : 0);
    const spring = useSpring(mv, prefersReduce ? { stiffness: 1000, damping: 1000 } : { stiffness, damping, mass });
    const [v, setV] = useState(typeof target === "number" ? target : 0);

    useEffect(() => {
        const unsub = spring.on("change", (val) => setV(val));
        return () => unsub();
    }, [spring]);

    useEffect(() => {
        if (typeof target === "number" && Number.isFinite(target)) {
            mv.set(target);
        }
    }, [target, mv]);

    return v;
}

function AnimatedNumber({ value, format, digits = 2, placeholder = "—" }) {
    if (value == null || !Number.isFinite(value)) return <>{placeholder}</>;
    const v = useSpringNumber(value);
    const out = format ? format(v) : formatNumber(v, { digits });
    return <>{out}</>;
}

function AnimatedCurrency({ value, currency = "USD", locale }) {
    if (value == null || !Number.isFinite(value)) return <>—</>;
    const v = useSpringNumber(value);
    return <>{formatCurrency(v, { currency, locale })}</>;
}

/** ---------- Small UI atoms ---------- */
function Stat({ label, value, sub }) {
    return (
        <div className="rounded-xl border border-gray-200 p-3 bg-white/60">
            <div className="text-xs text-gray-500">{label}</div>
            <div className="text-lg font-semibold">{value}</div>
            {sub && <div className="text-xs text-gray-400">{sub}</div>}
        </div>
    );
}

function ActionBtn({ icon: Icon, children, onClick, variant = "primary", disabled }) {
    const styles =
        variant === "primary"
            ? "bg-gray-900 text-white hover:bg-black focus-visible:ring-gray-900"
            : variant === "danger"
                ? "bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-600"
                : "bg-white text-gray-800 hover:bg-gray-50 border border-gray-200 focus-visible:ring-gray-300";

    return (
        <motion.button
            type="button"
            whileHover={{ scale: disabled ? 1 : 1.02 }}
            whileTap={{ scale: disabled ? 1 : 0.98 }}
            onClick={onClick}
            disabled={disabled}
            className={cls(
                "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:opacity-50 disabled:cursor-not-allowed",
                styles
            )}
        >
            {Icon && <Icon className="size-4" />}
            {children}
        </motion.button>
    );
}

export default function GoldTradeCard({
                                          computed,
                                          gold,
                                          locale,
                                          suggestBuyUrl,
                                          suggestSellUrl,
                                          onBuy,
                                          onSell,
                                      }) {
    const { t } = useTranslation();
    const toast = useToast();       // ⬅️ toasts
    const confirm = useConfirm();   // ⬅️ confirm dialog

    // ---------- Spot / movement ----------
    const perDomleng =
        typeof computed?.perDomleng === "number" && computed.perDomleng > 0
            ? computed.perDomleng
            : undefined;

    const perChi = computed?.perChi ?? (perDomleng ? perDomleng / 10 : undefined);
    const perHun = computed?.perHun ?? (perDomleng ? perDomleng / 100 : undefined);
    const perLi = computed?.perLi ?? (perDomleng ? perDomleng / 1000 : undefined);

    const goldDelta = Number.isFinite(gold?.chg) ? gold?.chg : null; // USD
    const goldPcRaw = Number.isFinite(gold?.pc) ? gold?.pc : null;   // %
    const up = (goldDelta ?? 0) >= 0;

    // ---------- Local state (persist) ----------
    const [amountInput, setAmountInput] = useState("");
    const [position, setPosition] = useState(null);

    // Load once
    const loadedRef = useRef(false);
    useEffect(() => {
        if (loadedRef.current) return;
        loadedRef.current = true;
        try {
            const raw = sessionStorage.getItem(STORAGE_KEY);
            if (raw) {
                const j = JSON.parse(raw);
                if (typeof j.amountInput === "string") setAmountInput(j.amountInput);
                if (j.position && typeof j.position === "object") setPosition(j.position);
            }
        } catch {}
    }, []);

    // Persist
    useEffect(() => {
        try {
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ amountInput, position }));
        } catch {}
    }, [amountInput, position]);

    // ---------- Input focus: keep sticky while typing ----------
    const inputRef = useRef(null);

    useLayoutEffect(() => {
        if (inputRef.current && !position) {
            inputRef.current.focus({ preventScroll: true });
            try {
                const end = inputRef.current.value.length;
                inputRef.current.setSelectionRange(end, end);
            } catch {}
        }
    }, [position]);

    // ---------- Buy preview (EXACT amount) ----------
    const usdValue = useMemo(() => {
        const raw = String(amountInput).replace(/,/g, "");
        const n = parseFloat(raw);
        return Number.isFinite(n) && n > 0 ? n : 0;
    }, [amountInput]);

    const preview = useMemo(() => {
        if (!perDomleng || !usdValue) return null;
        const qtyDomleng = usdValue / perDomleng;
        const costUSD = usdValue;

        const liRounded = Math.round(qtyDomleng * 1000);
        const domleng = Math.floor(liRounded / 1000);
        let rem = liRounded - domleng * 1000;
        const chi = Math.floor(rem / 100);
        rem -= chi * 100;
        const hun = Math.floor(rem / 10);
        rem -= hun * 10;
        const li = rem;

        return {
            qtyDomleng,
            costUSD,
            fyi: { domleng, chi, hun, li },
        };
    }, [usdValue, perDomleng]);

    // ---------- Position (after Buy) ----------
    const livePnL = useMemo(() => {
        if (!position || !perDomleng) return null;
        const pnl = position.qtyDomleng * (perDomleng - position.entryPrice);
        const retPc = position.costUSD > 0 ? (pnl / position.costUSD) * 100 : 0;
        return { pnl, retPc, spot: perDomleng };
    }, [position, perDomleng]);

    // ---------- Selling (always at spot) ----------
    const projected = useMemo(() => {
        if (!position || !perDomleng) return null;
        const px = perDomleng;
        const proceeds = position.qtyDomleng * px;
        const net = proceeds - position.costUSD;
        const retPc = position.costUSD > 0 ? (net / position.costUSD) * 100 : 0;
        return { px, proceeds, net, retPc };
    }, [position, perDomleng]);

    // ---------- Actions (now with toast + confirm) ----------
    const handleBuy = () => {
        if (!perDomleng) {
            toast.error({
                title: t("error_price_missing", "Price per domleng unavailable."),
                description: t("try_again_later", "Please try again later.")
            });
            return;
        }
        if (!preview || usdValue <= 0) {
            toast.info({
                title: t("enter_valid_amount", "Enter a valid amount"),
                description: t("amount_must_be_positive", "Amount must be a positive number.")
            });
            return;
        }

        const pos = {
            qtyDomleng: preview.qtyDomleng,
            entryPrice: perDomleng,
            costUSD: preview.costUSD,
            ts: Date.now(),
        };
        setPosition(pos);
        if (typeof onBuy === "function") onBuy(pos);

        toast.success({
            title: t("buy_placed", "Buy placed"),
            description: t("you_bought_domleng_worth", "You bought gold worth") + " " + formatCurrency(preview.costUSD, { currency: "USD", locale })
        });
    };

    const handleSell = async () => {
        if (!position || !perDomleng || !projected) {
            toast.error({
                title: t("cannot_sell", "Cannot sell"),
                description: t("missing_position_or_price", "Missing position or live price.")
            });
            return;
        }

        const ok = await confirm({
            title: t("confirm_sell_title", "Sell position?"),
            description: t("confirm_sell_desc", "This will sell your entire position at the current spot price."),
            confirmText: t("sell_now", "Sell Now"),
            cancelText: t("cancel", "Cancel"),
            variant: "danger",
        });
        if (!ok) return;

        const px = perDomleng;
        const proceeds = position.qtyDomleng * px;
        const net = proceeds - position.costUSD;
        const trade = {
            ...position,
            exitPrice: px,
            proceedsUSD: proceeds,
            pnlUSD: net,
            closedAt: Date.now(),
        };

        if (typeof onSell === "function") onSell(trade);
        setPosition(null);

        toast.success({
            title: net >= 0 ? t("sold_with_profit", "Sold • Profit") : t("sold_with_loss", "Sold • Loss"),
            description:
                `${t("proceeds", "Proceeds")}: ${formatCurrency(proceeds, { currency: "USD", locale })} • ` +
                `${t("pnl", "P&L")}: ${formatCurrency(net, { currency: "USD", locale })}`
        });
    };

    const handleReset = async () => {
        const ok = await confirm({
            title: t("confirm_reset_trade", "Reset trade and unlock amount?"),
            description: t("confirm_reset_desc", "This clears your simulated position and input."),
            confirmText: t("reset", "Reset"),
            cancelText: t("cancel", "Cancel"),
            variant: "danger",
        });
        if (!ok) return;

        setPosition(null);
        setAmountInput("");
        requestAnimationFrame(() => {
            if (inputRef.current) inputRef.current.focus({ preventScroll: true });
        });

        toast.info({
            title: t("reset_done", "Reset complete"),
            description: t("you_can_enter_again", "You can enter a new amount now.")
        });
    };

    // ---------- Small UI helpers ----------
    const firstMountRef = useRef(true);
    useEffect(() => {
        firstMountRef.current = false;
    }, []);

    const Card = ({ children, className = "" }) => (
        <motion.div
            initial={firstMountRef.current ? { opacity: 0, y: 6 } : false}
            animate={{ opacity: 1, y: 0 }}
            className={cls("rounded-2xl border border-gray-200 bg-white/90 shadow-sm backdrop-blur", className)}
        >
            {children}
        </motion.div>
    );

    const locked = Boolean(position);

    // ---------- Render ----------
    return (
        <Card className="p-5 sm:p-6">
            {/* Header / Spot */}
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className="leading-tight">
                        <div className="text-xs uppercase tracking-wide text-gray-500">
                            {t("gold", "Gold")}
                        </div>
                        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                            <div className="text-3xl sm:text-4xl font-semibold">
                                <AnimatedCurrency value={perDomleng} currency="USD" locale={locale} />
                            </div>

                            {/* No `key` here — no remounts; color changes are CSS-transitioned */}
                            <motion.div
                                initial={false}
                                className={cls(
                                    "text-sm flex items-center gap-1 rounded-full px-2 py-0.5 transition-colors",
                                    goldPcRaw == null
                                        ? "text-gray-500 bg-gray-100"
                                        : up
                                            ? "text-emerald-700 bg-emerald-50"
                                            : "text-rose-700 bg-rose-50"
                                )}
                                aria-live="polite"
                            >
                                {goldPcRaw == null ? (
                                    <LineChart className="size-4" />
                                ) : up ? (
                                    <TrendingUp className="size-4" />
                                ) : (
                                    <TrendingDown className="size-4" />
                                )}

                                {/* % change */}
                                {goldPcRaw == null ? (
                                    "—"
                                ) : Math.abs(goldPcRaw) > 0 && Math.abs(goldPcRaw) < 0.01 ? (
                                    "<0.01%"
                                ) : (
                                    <>
                                        <AnimatedNumber
                                            value={Math.abs(goldPcRaw)}
                                            digits={2}
                                            placeholder="—"
                                            format={(v) => formatNumber(v, { locale, digits: 2 })}
                                        />
                                        %
                                    </>
                                )}

                                {/* USD delta */}
                                {goldDelta != null && (
                                    <span>
                    {" ("}
                                        {up ? "+" : "-"}
                                        <AnimatedCurrency value={Math.abs(goldDelta)} currency="USD" locale={locale} />
                                        {")"}
                  </span>
                                )}
                            </motion.div>
                        </div>
                        <div className="text-gray-500 mt-1 text-sm">
                            {t("per_domleng", "per Dom Leng")} (USD)
                        </div>
                    </div>
                </div>

                {/* Quick suggestions */}
                <div className="flex flex-col sm:flex-row gap-2">
                    {suggestBuyUrl && (
                        <a
                            className="group inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 transition"
                            href={suggestBuyUrl}
                            target="_blank"
                            rel="noreferrer"
                        >
                            {t("suggest_buy", "Suggest: Buy")}
                            <ExternalLink className="size-3 group-hover:translate-x-px transition-transform" />
                        </a>
                    )}
                    {suggestSellUrl && (
                        <a
                            className="group inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 transition"
                            href={suggestSellUrl}
                            target="_blank"
                            rel="noreferrer"
                        >
                            {t("suggest_sell", "Suggest: Sell")}
                            <ExternalLink className="size-3 group-hover:translate-x-px transition-transform" />
                        </a>
                    )}
                </div>
            </div>

            {/* Unit prices (FYI) */}
            <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
                <Stat label={t("per_chi", "per Chi")} value={<AnimatedCurrency value={perChi} currency="USD" locale={locale} />} />
                <Stat label={t("per_hun", "per Hun")} value={<AnimatedCurrency value={perHun} currency="USD" locale={locale} />} />
                <Stat label={t("per_li", "per Li")} value={<AnimatedCurrency value={perLi} currency="USD" locale={locale} />} />
            </div>

            {/* Buy Section */}
            <div className="mt-6 border-t pt-4">
                <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-medium text-gray-700">
            {t("enter_usd", "Enter amount (USD)")}
          </span>
                    <span className="inline-flex items-center gap-1 text-xs text-gray-500">
            <DollarSign className="size-3" />
                        {locked ? t("locked_after_buy", "Locked after Buy") : t("live_preview", "Live preview")}
          </span>
                </div>

                {/* Floating-label input */}
                <div className="mt-2 flex items-center gap-2">
                    <div className={cls("relative flex-1 group", locked && "opacity-75")}>
                        {/* currency prefix */}
                        <span className="pointer-events-none absolute inset-y-0 left-3 grid place-items-center text-gray-500">
              $
            </span>

                        <input
                            ref={inputRef}
                            name="usdAmount"
                            inputMode="decimal"
                            type="text"
                            placeholder="0.00"
                            autoComplete="off"
                            spellCheck={false}
                            readOnly={locked}
                            autoFocus
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !locked && preview) {
                                    e.preventDefault();
                                    handleBuy();
                                }
                            }}
                            className={cls(
                                "peer w-full rounded-2xl border px-6 py-3 text-base outline-none transition",
                                "focus:ring-2 focus:ring-gray-900 focus:border-gray-900",
                                "placeholder:text-transparent"
                            )}
                            value={amountInput}
                            onChange={(e) => {
                                const v = e.target.value;
                                if (/^[\d.,]*$/.test(v)) {
                                    setAmountInput(v);
                                }
                            }}
                        />

                        {/* floating label (kept blank intentionally) */}
                        <label
                            className={cls(
                                "pointer-events-none absolute left-9 top-1/2 -translate-y-1/2",
                                "text-gray-500 transition-all",
                                "peer-focus:-top-2 peer-focus:left-2 peer-focus:text-xs peer-focus:text-gray-700",
                                amountInput ? "-top-2 left-2 text-xs text-gray-700" : ""
                            )}
                        />

                        {locked && (
                            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 text-xs text-gray-500">
                                <Lock className="size-3.5" />
                                {t("locked", "Locked")}
                            </div>
                        )}
                    </div>

                    {!locked && amountInput && (
                        <ActionBtn icon={ArrowRightLeft} variant="secondary" onClick={() => setAmountInput("")}>
                            {t("clear", "Clear")}
                        </ActionBtn>
                    )}
                </div>

                {!perDomleng && (
                    <p className="mt-3 text-sm text-rose-600">
                        {t("error_price_missing", "Price per domleng unavailable.")}
                    </p>
                )}

                {preview && (
                    <>
                        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <Stat
                                label={t("you_receive", "You receive (Domleng)")}
                                value={<AnimatedNumber value={preview.qtyDomleng} digits={6} format={(v) => formatNumber(v, { locale, digits: 6 })} />}
                            />
                            <Stat
                                label={t("amount", "Amount")}
                                value={<AnimatedCurrency value={preview.costUSD} currency="USD" locale={locale} />}
                            />
                            <Stat
                                label={t("fyi_units", "FYI Units (rounded)")}
                                value=""
                                sub={
                                    `${t("domleng_short","Domleng")}: ${formatNumber(preview.fyi.domleng, { locale })} • ` +
                                    `${t("chi","Chi")}: ${formatNumber(preview.fyi.chi, { locale })} • ` +
                                    `${t("hun","Hun")}: ${formatNumber(preview.fyi.hun, { locale })} • ` +
                                    `${t("li","Li")}: ${formatNumber(preview.fyi.li, { locale })}`
                                }
                            />

                        </div>

                        <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
                            {!locked ? (
                                <ActionBtn
                                    icon={ShoppingCart}
                                    onClick={handleBuy}
                                    disabled={!preview || !perDomleng || usdValue <= 0}
                                >
                                    {t("buy_now", "Buy Now")}
                                </ActionBtn>
                            ) : (
                                <ActionBtn icon={Lock} variant="secondary" onClick={handleReset}>
                                    {t("reset_trade", "Reset Trade")}
                                </ActionBtn>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Position / Live P&L */}
            {position && (
                <div className="mt-6 border-t pt-4">
                    <div className="flex items-center justify-between gap-3">
                        <div className="text-sm font-medium">{t("your_position", "Your position")}</div>
                        <div
                            className={cls(
                                "inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                                (livePnL?.pnl ?? 0) >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                            )}
                        >
                            <LineChart className="size-3.5" />
                            {t("live_pl", "Live P&L")}:
                            <span><AnimatedCurrency value={livePnL?.pnl ?? null} currency="USD" locale={locale} /></span>
                            <span className="text-gray-400">
                (
                                {livePnL ? (
                                    <>
                                        {livePnL.retPc >= 0 ? "+" : ""}
                                        <AnimatedNumber
                                            value={livePnL.retPc}
                                            digits={2}
                                            format={(v) => formatNumber(v, { locale, digits: 2 })}
                                        />
                                        %
                                    </>
                                ) : "—"}
                                )
              </span>
                        </div>
                    </div>

                    <div className="mt-3 grid gap-3 sm:grid-cols-4">
                        <Stat
                            label={t("qty_domleng", "Qty (Domleng)")}
                            value={
                                <>
                                    <AnimatedNumber
                                        value={position.qtyDomleng}
                                        digits={6}
                                        format={(v) => formatNumber(v, { locale, digits: 6 })}
                                    />{" "}
                                    {t("domleng_short", "Domleng")}
                                </>
                            }
                        />
                        <Stat label={t("entry", "Entry")} value={<AnimatedCurrency value={position.entryPrice} currency="USD" locale={locale} />} />
                        <Stat label={t("cost", "Cost")} value={<AnimatedCurrency value={position.costUSD} currency="USD" locale={locale} />} />
                        <Stat label={t("spot", "Spot")} value={<AnimatedCurrency value={livePnL?.spot ?? null} currency="USD" locale={locale} />} />
                    </div>

                    {/* Sell at market (no custom price) */}
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl border border-gray-200 p-3 bg-white/70">
                            <div className="text-xs text-gray-500">{t("sell_at_market", "Sell at market")}</div>
                            <div className="mt-1 text-sm text-gray-600">
                                {t("market_price_current_spot", "Your sell will execute at the current spot price.")}
                            </div>
                            <div className="mt-2 text-xs text-gray-500">
                                {t("projected_with", "Projected with")}{" "}
                                <span className="font-medium"><AnimatedCurrency value={perDomleng} currency="USD" locale={locale} /></span>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-gray-200 p-3 bg-white/70">
                            <div className="text-xs text-gray-500">{t("projection", "Projection")}</div>
                            <div className="text-sm mt-1 space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <span>{t("proceeds", "Proceeds")}</span>
                                    <span className="font-semibold"><AnimatedCurrency value={projected?.proceeds ?? null} currency="USD" locale={locale} /></span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>{t("net_pnl", "Net P&L")}</span>
                                    <span
                                        className={cls(
                                            "font-semibold",
                                            (projected?.net ?? 0) >= 0 ? "text-emerald-600" : "text-rose-600"
                                        )}
                                    >
                    <AnimatedCurrency value={projected?.net ?? null} currency="USD" locale={locale} />
                  </span>
                                </div>
                                <div className="flex items-center justify-between text-gray-400">
                                    <span>{t("return", "Return")}</span>
                                    <span>
                    {projected ? (
                        <>
                            {projected.retPc >= 0 ? "+" : ""}
                            <AnimatedNumber
                                value={projected.retPc}
                                digits={2}
                                format={(v) => formatNumber(v, { locale, digits: 2 })}
                            />
                            %
                        </>
                    ) : "—"}
                  </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
                        <ActionBtn
                            icon={ShoppingCart}
                            variant="danger"
                            onClick={handleSell}
                            disabled={!projected}
                        >
                            {t("sell_now", "Sell Now")}
                        </ActionBtn>
                    </div>
                </div>
            )}
        </Card>
    );
}
