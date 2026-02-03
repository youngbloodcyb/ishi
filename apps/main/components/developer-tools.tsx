"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Wrench,
  House,
  Gear,
  DotsSixVertical,
} from "@phosphor-icons/react";
import { ROUTES } from "@/lib/routes";

const SCREENS = [
  { name: "Dashboard", path: ROUTES.HOME, icon: House },
  { name: "Settings", path: ROUTES.SETTINGS, icon: Gear },
];

interface Position {
  x: number;
  y: number;
}

export function DeveloperTools() {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<Position>({ x: 20, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{
    startX: number;
    startY: number;
    startPosX: number;
    startPosY: number;
  } | null>(null);
  const pathname = usePathname();

  const environment = process.env.NEXT_PUBLIC_VERCEL_ENV || "development";

  // Load saved position from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("dev-tools-position");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPosition(parsed);
      } catch {
        // ignore invalid JSON
      }
    }
  }, []);

  // Save position to localStorage
  useEffect(() => {
    localStorage.setItem("dev-tools-position", JSON.stringify(position));
  }, [position]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startPosX: position.x,
      startPosY: position.y,
    };
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !dragRef.current) return;

      const deltaX = e.clientX - dragRef.current.startX;
      const deltaY = e.clientY - dragRef.current.startY;

      setPosition({
        x: Math.max(
          0,
          Math.min(window.innerWidth - 60, dragRef.current.startPosX + deltaX),
        ),
        y: Math.max(
          0,
          Math.min(window.innerHeight - 60, dragRef.current.startPosY + deltaY),
        ),
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      dragRef.current = null;
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  const handleClick = () => {
    // Only open if we didn't drag
    if (!isDragging) {
      setIsOpen(true);
    }
  };

  const envColors: Record<string, string> = {
    development: "bg-yellow-500",
    preview: "bg-blue-500",
    production: "bg-green-500",
  };

  return (
    <>
      {/* Floating Button */}
      <div
        className="fixed z-[9999] select-none"
        style={{ left: position.x, bottom: position.y }}
      >
        <div className="flex items-center gap-1 bg-gray-900 rounded-lg shadow-lg border border-gray-700">
          {/* Drag Handle */}
          <div
            onMouseDown={handleMouseDown}
            className="px-1 py-2 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-200"
          >
            <DotsSixVertical className="h-4 w-4" />
          </div>

          {/* Open Button */}
          <Button
            onClick={handleClick}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-gray-800 hover:text-white gap-2 pr-3"
          >
            <Wrench className="h-4 w-4" />
            <span className="text-xs font-medium">Dev</span>
            <span
              className={`w-2 h-2 rounded-full ${envColors[environment] || envColors.development}`}
            />
          </Button>
        </div>
      </div>

      {/* Sheet Menu */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="left" className="w-80">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              Developer Tools
            </SheetTitle>
            <SheetDescription>
              <Badge variant="secondary" className="text-xs">
                {environment}
              </Badge>
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-6 px-4">
            {/* Screen Navigation */}
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Screens
              </h3>
              <div className="space-y-1">
                {SCREENS.map((screen) => {
                  const Icon = screen.icon;
                  const isActive = pathname === screen.path;
                  return (
                    <Link
                      key={screen.path}
                      href={screen.path}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                        isActive
                          ? "bg-gray-100 dark:bg-gray-800 font-medium"
                          : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      }`}
                    >
                      <Icon className="h-4 w-4 text-gray-500" />
                      <span>{screen.name}</span>
                      {isActive && (
                        <Badge
                          variant="secondary"
                          className="ml-auto text-[10px] px-1.5"
                        >
                          current
                        </Badge>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Environment Info */}
            <div className="border-t pt-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Environment
              </h3>
              <div className="px-3 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Mode</span>
                  <span className="font-mono">{environment}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Path</span>
                  <span className="font-mono truncate max-w-40">
                    {pathname}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
