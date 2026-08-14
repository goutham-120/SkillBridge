import { useTheme } from "../hooks/useTheme.jsx";

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      className="theme-toggle"
      onClick={toggleTheme}
      type="button"
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      title={`${theme === "light" ? "Dark" : "Light"} mode`}
    >
      {theme === "light" ? "🌙" : "☀️"}
    </button>
  );
}

export default ThemeToggle;
