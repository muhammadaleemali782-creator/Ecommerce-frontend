import React, { createContext, useContext, useState, useEffect } from "react"

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem("app_theme")
      if (saved === "light" || saved === "dark") return saved
      return "dark"
    } catch {
      return "dark"
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem("app_theme", theme)
      const root = document.documentElement
      if (theme === "light") {
        root.classList.remove("dark")
        root.classList.add("light")
        document.body.classList.remove("dark-theme")
        document.body.classList.add("light-theme")
      } else {
        root.classList.remove("light")
        root.classList.add("dark")
        document.body.classList.remove("light-theme")
        document.body.classList.add("dark-theme")
      }
    } catch (e) {
      console.error("Theme apply error:", e)
    }
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => (prev === "dark" ? "light" : "dark"))
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, isDark: theme === "dark" }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    return { theme: "dark", setTheme: () => {}, toggleTheme: () => {}, isDark: true }
  }
  return context
}
