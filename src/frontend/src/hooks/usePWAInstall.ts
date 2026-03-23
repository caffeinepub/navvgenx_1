import { useCallback, useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function usePWAInstall() {
  const [promptEvent, setPromptEvent] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isDismissed, setIsDismissed] = useState(
    () => localStorage.getItem("navvura-install-dismissed") === "1",
  );
  const [isInstalled, setIsInstalled] = useState(
    () =>
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as { standalone?: boolean }).standalone === true,
  );

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setPromptEvent(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);

    const mq = window.matchMedia("(display-mode: standalone)");
    const mqHandler = (e: MediaQueryListEvent) => {
      if (e.matches) setIsInstalled(true);
    };
    mq.addEventListener("change", mqHandler);

    window.addEventListener("appinstalled", () => setIsInstalled(true));

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      mq.removeEventListener("change", mqHandler);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!promptEvent) return;
    await promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    if (outcome === "accepted") {
      setIsInstalled(true);
    }
    setPromptEvent(null);
  }, [promptEvent]);

  const dismiss = useCallback(() => {
    localStorage.setItem("navvura-install-dismissed", "1");
    setIsDismissed(true);
  }, []);

  const canInstall = !!promptEvent && !isInstalled && !isDismissed;

  return { canInstall, promptInstall, dismiss, isDismissed, isInstalled };
}
