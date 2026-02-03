"use client"

import * as React from "react"
import { Moon, Sun } from "@phosphor-icons/react"
import { useTheme } from "next-themes"
import { SidebarMenuButton } from "@/components/ui/sidebar"

export function ModeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <SidebarMenuButton size="sm" className="size-6 p-0 justify-center bg-transparent hover:bg-transparent rounded-none">
        <Sun className="size-4" />
      </SidebarMenuButton>
    )
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <SidebarMenuButton
      size="sm"
      className="size-6 p-0 justify-center bg-transparent hover:bg-transparent rounded-none"
      onClick={toggleTheme}
      tooltip={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      {theme === "dark" ? (
        <Sun className="size-4" />
      ) : (
        <Moon className="size-4" />
      )}
    </SidebarMenuButton>
  )
}
