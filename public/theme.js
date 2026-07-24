(() => {
  const STORAGE_KEY = "youtubeChannelShelfTheme";
  const THEMES = new Set(["auto", "light", "dark"]);
  const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");
  const extensionStorage = globalThis.chrome?.storage?.local;

  function normalizeTheme(value) {
    return THEMES.has(value) ? value : "auto";
  }

  function resolvedTheme(preference) {
    return preference === "auto" ? (systemTheme.matches ? "dark" : "light") : preference;
  }

  function applyTheme(value) {
    const preference = normalizeTheme(value);
    const resolved = resolvedTheme(preference);
    document.documentElement.dataset.theme = preference;
    document.documentElement.dataset.resolvedTheme = resolved;
    document.documentElement.style.colorScheme = preference === "auto" ? "light dark" : preference;

    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) themeColor.content = resolved === "dark" ? "#101010" : "#f6f7f9";
    return preference;
  }

  function setTheme(value) {
    const preference = applyTheme(value);
    localStorage.setItem(STORAGE_KEY, preference);
    extensionStorage?.set({ [STORAGE_KEY]: preference });
    return preference;
  }

  let preference = applyTheme(localStorage.getItem(STORAGE_KEY));
  systemTheme.addEventListener("change", () => {
    if (preference === "auto") applyTheme(preference);
  });

  globalThis.youtubeShelfTheme = {
    get preference() {
      return preference;
    },
    set(value) {
      preference = setTheme(value);
      return preference;
    }
  };

  extensionStorage?.get(STORAGE_KEY, (result) => {
    if (result[STORAGE_KEY] === undefined) return;
    preference = applyTheme(result[STORAGE_KEY]);
    localStorage.setItem(STORAGE_KEY, preference);
  });

  globalThis.chrome?.storage?.onChanged?.addListener((changes, areaName) => {
    if (areaName !== "local" || !changes[STORAGE_KEY]?.newValue) return;
    preference = applyTheme(changes[STORAGE_KEY].newValue);
    localStorage.setItem(STORAGE_KEY, preference);
  });
})();
