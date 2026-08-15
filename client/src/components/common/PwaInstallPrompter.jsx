import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function PwaInstallPrompter() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const { t } = useTranslation();

    useEffect(() => {
        // Fast fail if dismissed or already running as PWA
        if (localStorage.getItem("pwa-prompt-dismissed")) {
            return;
        }
        if (window.matchMedia("(display-mode: standalone)").matches) {
            return;
        }

        const handleBeforeInstallPrompt = (e) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            setDeferredPrompt(e);
            // Slight delay so the user isn't instantly blasted before the page renders
            setTimeout(() => setShowPrompt(true), 1500);
        };

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === "accepted") {
            setShowPrompt(false);
        }
        setDeferredPrompt(null);
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        localStorage.setItem("pwa-prompt-dismissed", "true");
    };

    if (!showPrompt) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:w-96 z-50 animate-slide-up">
            <div className="bg-ink border border-signal shadow-2xl rounded-2xl p-4 sm:p-5 flex flex-col gap-3 relative overflow-hidden">
                <button
                    onClick={handleDismiss}
                    className="absolute top-2 right-2 p-1.5 text-paper/60 hover:text-paper hover:bg-paper/10 rounded-full transition-colors"
                    aria-label="Close"
                >
                    <X size={16} />
                </button>

                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-xl shadow-inner flex items-center justify-center p-1.5 shrink-0">
                        <img src="/icon.svg" alt="Nagrik" className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1 pr-6">
                        <h3 className="font-display text-paper text-base tracking-wide">Install Nagrik App</h3>
                        <p className="text-paper/60 text-xs mt-1 leading-tight">Fast access to report civic issues & track progress from your home screen.</p>
                    </div>
                </div>

                <div className="flex gap-2 mt-2">
                    <button
                        onClick={handleDismiss}
                        className="flex-1 py-2 rounded-xl border border-paper/10 text-paper/80 text-xs font-medium hover:bg-paper/10 hover:text-paper transition-colors"
                    >
                        Not right now
                    </button>
                    <button
                        onClick={handleInstallClick}
                        className="flex-1 py-2 rounded-xl bg-signal text-paper text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-signal-dark shadow-lg shadow-signal/20 transition-all"
                    >
                        <Download size={14} />
                        Install App
                    </button>
                </div>
            </div>
        </div>
    );
}
