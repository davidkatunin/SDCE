import { injectBlockedSiteOverlay } from "@/components/Overlay";

let currentOverlay: HTMLElement | null = null;

function removeOverlay() {
  if (currentOverlay) {
    currentOverlay.remove();
    currentOverlay = null;
  }
}

export function safeGet(keys: string[], callback: (data: any) => void) {
  try {
    if (!chrome?.runtime?.id) {
      console.warn("Extension context invalidated, skipping storage call");
      return;
    }
    chrome.storage.local.get(keys, callback);
  } catch (err) {
    console.warn("Failed to access chrome.storage:", err);
  }
}

function pathStartsWithAny(pathname: string, prefixes: string[]) {
  const clean = pathname.split(/[?#]/)[0].toLowerCase();
  return prefixes.some(prefix => clean.startsWith(prefix.toLowerCase()));
}

function shouldBlockSite(hostname: string, pathname: string) {
  const path = pathname.toLowerCase();
  const host = hostname.toLowerCase();

  if (host.includes("instagram")) return pathStartsWithAny(path, ["/reel", "/reels"]);
  if (host.includes("tiktok")) return true;
  if (host.includes("youtube")) return pathStartsWithAny(path, ["/shorts"]);
  if (host.includes("facebook")) return pathStartsWithAny(path, ["/reel", "/reels"]);

  return false;
}

function checkAndInject() {
  safeGet(["isEnabled", "blockedSites", "isPaused"], (data) => {
    const { isEnabled, blockedSites, isPaused } = data;
    if (!isEnabled) {
      removeOverlay();
      return;
    }

    const hostname = window.location.hostname.toLowerCase();
    const pathname = (window.location.pathname || "/").toLowerCase();

    const siteName = Object.keys(blockedSites || {}).find((key) =>
      hostname.includes(key.toLowerCase())
    );

    if (!siteName || !blockedSites[siteName]) {
      removeOverlay();
      return;
    }

    if (shouldBlockSite(hostname, pathname) && !isPaused) {
      if (!currentOverlay) {
        currentOverlay = injectBlockedSiteOverlay(siteName);
      }
    } else {
      removeOverlay();
    }
  });
}

checkAndInject();

(() => {
  let lastUrl = location.href;
  const observer = new MutationObserver(() => {
    const currentUrl = location.href;
    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;
      if (chrome?.runtime?.id) {
        setTimeout(checkAndInject, 250);
      }
    }
  });

  observer.observe(document, { subtree: true, childList: true });
  window.addEventListener("beforeunload", () => observer.disconnect());
})();
