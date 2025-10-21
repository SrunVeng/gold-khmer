import React, { createContext, useCallback, useContext, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";

const ToastContext = createContext(null);

/**
 * Wrap your app with <ToastProvider> to use `useToast()`.
 * const toast = useToast();
 * toast.success({ title, description, duration });
 */
export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const remove = useCallback((id) => {
        setToasts((ts) => ts.filter((t) => t.id !== id));
    }, []);

    const push = useCallback(
        ({ title, description, variant = "info", duration = 3000 }) => {
            const id = Math.random().toString(36).slice(2);
            setToasts((ts) => [...ts, { id, title, description, variant, duration }]);
            if (duration !== Infinity) {
                setTimeout(() => remove(id), duration);
            }
            return id;
        },
        [remove]
    );

    const api = {
        push,
        success: (o) => push({ ...o, variant: "success" }),
        error: (o) => push({ ...o, variant: "error" }),
        info: (o) => push({ ...o, variant: "info" }),
        remove,
    };

    return (
        <ToastContext.Provider value={api}>
            {children}
            <ToastViewport toasts={toasts} onClose={remove} />
        </ToastContext.Provider>
    );
}

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
    return ctx;
}

function Icon({ variant }) {
    if (variant === "success") return <CheckCircle2 className="size-5" />;
    if (variant === "error") return <AlertTriangle className="size-5" />;
    return <Info className="size-5" />;
}

function bgClasses(variant) {
    if (variant === "success") return "border-emerald-200 bg-emerald-50 text-emerald-900";
    if (variant === "error") return "border-rose-200 bg-rose-50 text-rose-900";
    return "border-gray-200 bg-white text-gray-900";
}

function ToastViewport({ toasts, onClose }) {
    return (
        <div className="pointer-events-none fixed inset-x-0 top-3 z-[120] flex justify-center sm:justify-end">
            <div className="mx-3 flex w-full max-w-sm flex-col gap-2 sm:mr-3">
                <AnimatePresence initial={false}>
                    {toasts.map((t) => (
                        <motion.div
                            key={t.id}
                            initial={{ y: -10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -8, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 420, damping: 30 }}
                            className={`pointer-events-auto rounded-xl border p-3 shadow-lg ${bgClasses(t.variant)}`}
                        >
                            <div className="flex items-start gap-3">
                                <div className="mt-0.5">
                                    <Icon variant={t.variant} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="truncate text-sm font-semibold">{t.title}</div>
                                    {t.description ? <div className="mt-0.5 truncate text-sm opacity-80">{t.description}</div> : null}
                                </div>
                                <button
                                    onClick={() => onClose(t.id)}
                                    className="ml-2 rounded-md p-1 text-gray-500 hover:text-gray-700"
                                >
                                    <X className="size-4" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
