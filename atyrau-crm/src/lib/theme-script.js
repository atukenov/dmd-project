(function () {
  try {
    var theme = localStorage.getItem("theme");
    var root = document.documentElement;

    if (
      theme === "dark" ||
      (theme === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      root.setAttribute("data-theme", "dark");
      root.classList.add("dark");
    } else {
      root.setAttribute("data-theme", "light");
      root.classList.remove("dark");
    }
  } catch (e) {
    // fallback to light theme
    document.documentElement.setAttribute("data-theme", "light");
  }
})();
