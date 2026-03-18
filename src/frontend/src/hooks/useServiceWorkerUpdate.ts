import { useEffect } from "react";
import { toast } from "sonner";

export function useServiceWorkerUpdate() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    let refreshing = false;

    const handleControllerChange = () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener(
      "controllerchange",
      handleControllerChange,
    );

    // Check for waiting SW (new update available)
    const checkWaiting = async () => {
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) return;

      const showUpdateToast = () => {
        toast("New version of NavvGenX AI is available", {
          duration: Number.POSITIVE_INFINITY,
          action: {
            label: "Update now",
            onClick: () => {
              if (registration.waiting) {
                registration.waiting.postMessage({ type: "SKIP_WAITING" });
              } else {
                window.location.reload();
              }
            },
          },
        });
      };

      if (registration.waiting) {
        showUpdateToast();
      }

      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        if (!newWorker) return;
        newWorker.addEventListener("statechange", () => {
          if (
            newWorker.state === "installed" &&
            navigator.serviceWorker.controller
          ) {
            showUpdateToast();
          }
        });
      });
    };

    checkWaiting();

    return () => {
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        handleControllerChange,
      );
    };
  }, []);
}
