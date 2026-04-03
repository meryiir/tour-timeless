const GSI_SCRIPT_SRC = "https://accounts.google.com/gsi/client";

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: { access_token: string }) => void;
          }) => {
            requestAccessToken: () => void;
          };
        };
      };
    };
  }
}

function isGsiReady(): boolean {
  return !!(typeof window !== "undefined" && window.google?.accounts?.oauth2);
}

let inflightLoad: Promise<void> | null = null;

/**
 * Ensures the Google Identity Services script is loaded and `window.google.accounts.oauth2` exists.
 * Deduplicates concurrent loads and reuses an existing script tag if present.
 */
export function ensureGoogleIdentityLoaded(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google Sign-In is only available in the browser."));
  }
  if (isGsiReady()) {
    return Promise.resolve();
  }
  if (inflightLoad) {
    return inflightLoad;
  }

  inflightLoad = new Promise((resolve, reject) => {
    let script = document.querySelector(
      `script[src="${GSI_SCRIPT_SRC}"]`,
    ) as HTMLScriptElement | null;

    if (!script) {
      script = document.createElement("script");
      script.src = GSI_SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    let settled = false;

    const finishOk = () => {
      if (settled) return;
      if (isGsiReady()) {
        settled = true;
        resolve();
      }
    };

    const finishErr = (message: string) => {
      if (settled) return;
      settled = true;
      reject(new Error(message));
    };

    const onLoad = () => {
      script!.removeEventListener("load", onLoad);
      script!.removeEventListener("error", onError);
      if (isGsiReady()) {
        finishOk();
      } else {
        finishErr("Google Identity Services failed to initialize.");
      }
    };

    const onError = () => {
      script!.removeEventListener("load", onLoad);
      script!.removeEventListener("error", onError);
      finishErr("Failed to load Google Sign-In script. Check your network or try again.");
    };

    if (isGsiReady()) {
      finishOk();
      return;
    }

    script.addEventListener("load", onLoad);
    script.addEventListener("error", onError);

    // Cached scripts may run before `load` listeners attach — check after the current task.
    queueMicrotask(() => {
      if (isGsiReady()) finishOk();
    });
  }).finally(() => {
    inflightLoad = null;
  });

  return inflightLoad;
}
