import { platform } from "./platform.js";

const DEFAULT_LOCALE = "en";
const SUPPORTED_LOCALES = new Set(["en", "fr"]);
const TRANSLATION_OVERRIDES_KEY = "youtubeChannelShelfTranslationOverrides";

function normalizedLocale(value) {
  const locale = String(value || "").trim().replace(/_/g, "-").split("-")[0].toLowerCase();
  return SUPPORTED_LOCALES.has(locale) ? locale : DEFAULT_LOCALE;
}

async function loadMessages(locale) {
  const url = platform.assetUrl(`_locales/${locale}/messages.json`);
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Unable to load locale ${locale}`);
  return response.json();
}

function substitute(message, substitutions = []) {
  const values = Array.isArray(substitutions) ? substitutions : [substitutions];
  return String(message || "").replace(/\$(\d+)/g, (match, index) => values[Number(index) - 1] ?? match);
}

function readTranslationOverrides() {
  try {
    const value = JSON.parse(localStorage.getItem(TRANSLATION_OVERRIDES_KEY) || "{}");
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
  } catch {
    return {};
  }
}

function mergedMessages(base, overrides) {
  const merged = { ...base };
  if (!overrides || typeof overrides !== "object" || Array.isArray(overrides)) return merged;
  for (const [key, entry] of Object.entries(overrides)) {
    if (!entry || typeof entry !== "object" || typeof entry.message !== "string") continue;
    merged[key] = { ...(base[key] || {}), ...entry };
  }
  return merged;
}

export async function createI18n(preference = "auto") {
  const browserLocale = platform.browserLanguage();
  const locale = preference === "auto" ? normalizedLocale(browserLocale) : normalizedLocale(preference);
  const packagedDefaultMessages = await loadMessages(DEFAULT_LOCALE);
  const packagedSelectedMessages = locale === DEFAULT_LOCALE
    ? packagedDefaultMessages
    : await loadMessages(locale);
  const overrides = readTranslationOverrides();
  const defaultMessages = mergedMessages(packagedDefaultMessages, overrides[DEFAULT_LOCALE]);
  const selectedMessages = locale === DEFAULT_LOCALE
    ? defaultMessages
    : mergedMessages(packagedSelectedMessages, overrides[locale]);
  const sourceKeys = new Map(
    Object.entries(packagedDefaultMessages)
      .map(([key, value]) => [String(value?.message || ""), key])
      .filter(([message]) => message)
  );

  function getMessage(key, substitutions = []) {
    const entry = selectedMessages[key] || defaultMessages[key];
    return entry?.message ? substitute(entry.message, substitutions) : "";
  }

  function translateText(source) {
    const text = String(source || "");
    const key = sourceKeys.get(text);
    return key ? getMessage(key) || text : text;
  }

  function localizeTree(root = document) {
    document.documentElement.lang = locale;
    const elements = root instanceof Element ? [root, ...root.querySelectorAll("*")] : [...document.querySelectorAll("*")];
    for (const element of elements) {
      for (const attribute of ["title", "aria-label", "placeholder"]) {
        if (element.hasAttribute(attribute)) {
          element.setAttribute(attribute, translateText(element.getAttribute(attribute)));
        }
      }
    }

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      const match = node.nodeValue.match(/^(\s*)(.*?)(\s*)$/s);
      if (!match?.[2]) continue;
      const translated = translateText(match[2]);
      if (translated !== match[2]) node.nodeValue = `${match[1]}${translated}${match[3]}`;
    }
  }

  function observe(root = document.body) {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node instanceof Element) localizeTree(node);
          else if (node.nodeType === Node.TEXT_NODE && node.parentElement) localizeTree(node.parentElement);
        }
      }
    });
    observer.observe(root, { childList: true, subtree: true });
    return observer;
  }

  return { locale, getMessage, translateText, localizeTree, observe };
}
