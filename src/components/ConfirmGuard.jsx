import React, { createContext, useCallback, useContext, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ShieldAlert, X } from "lucide-react";

const ConfirmContext = createContext(null);

/**
 * Wrap your app with <ConfirmProvider> to use `useConfirm()`.
 * const confirm = useConfirm();
 * const ok = await confirm({ title, description, confirmText, cancelText, variant });
 */
export function ConfirmProvider({ children }) {
    const [open, setOpen] = useState(false);
    const [opts, setOpts] = useState({});
    const resolverRef = useRef(null);

    const confirm = useCallback((options = {}) => {
        return new Promise((resolve) => {
            setOpts(options);
            setOpen(true);
            resolverRef.current = resolve;
        });
    }, []);

    const close = (answer) => {
        setOpen(false);
        if (resolverRef.current) {
            resolverRef.current(Boolean(answer));
            resolverRef.current = null;
        }
    };

    return (
        <ConfirmContext.Provider value={confirm}>
            {children}
            <ConfirmDialog open={open} options={opts} onClose={close} />
        </ConfirmContext.Provider>
    );
}

export function useConfirm() {
    const ctx = useContext(ConfirmContext);
    if (!ctx) throw new Error("useConfirm must be used within <ConfirmProvider>");
    return ctx;
}

function ConfirmDialog({ open, options, onClose }) {
    const {
        title = "Are you sure?",
        description = "",
        confirmText = "Confirm",
        cancelText = "Cancel",
        variant = "primary", // "primary" | "danger"
    } = options || {};

    const confirmBtn =
        variant === "danger"
            ? "bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-600"
            : "bg-gray-900 text-white hover:bg-black focus-visible:ring-gray-900";

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    className="fixed inset-0 z-[100] grid place-items-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => onClose(false)} />
                    <motion.div
                        role="dialog"
                        aria-modal="true"
                        initial={{ y: 20, opacity: 0, scale: 0.98 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ y: 10, opacity: 0, scale: 0.98 }}
                        transition={{ type: "spring", stiffness: 320, damping: 26 }}
                        className="relative z-[101] w-[92vw] max-w-md rounded-2xl border border-gray-200 bg-white p-5 shadow-xl"
                    >
                        <button
                            className="absolute right-3 top-3 rounded-md p-1 text-gray-400 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300"
                            onClick={() => onClose(false)}
                            aria-label="Close"
                        >
                            <X className="size-5" />
                        </button>

                        <div className="flex items-start gap-3">
                            <ShieldAlert className={variant === "danger" ? "size-6 text-rose-600" : "size-6 text-gray-900"} />
                            <div>
                                <h2 className="text-base font-semibold text-gray-900">{title}</h2>
                                {description ? <p className="mt-1 text-sm text-gray-600">{description}</p> : null}
                            </div>
                        </div>

                        <div className="mt-4 flex justify-end gap-2">
                            <button
                                onClick={() => onClose(false)}
                                className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300"
                            >
                                {cancelText}
                            </button>
                            <button
                                onClick={() => onClose(true)}
                                className={`rounded-xl px-4 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 ${confirmBtn}`}
                            >
                                {confirmText}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
