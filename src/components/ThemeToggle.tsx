import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sun, Moon, Laptop } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <Button
                variant="ghost"
                size="icon"
                className={cn("h-9 w-9 rounded-full text-slate-500", className)}
                aria-label="Toggle theme"
            >
                <Sun className="h-4 w-4" />
            </Button>
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                        "h-9 w-9 rounded-full text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:ring-1 focus-visible:ring-blue-500",
                        className
                    )}
                    aria-label="Toggle theme"
                >
                    {theme === "dark" ? (
                        <Moon className="h-4 w-4 text-blue-400" />
                    ) : theme === "system" ? (
                        <Laptop className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                    ) : (
                        <Sun className="h-4 w-4 text-amber-500" />
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl p-1 min-w-[120px] shadow-lg border-slate-200 dark:border-slate-800">
                <DropdownMenuItem
                    onClick={() => setTheme("light")}
                    className={cn(
                        "cursor-pointer rounded-lg text-xs font-medium gap-2 px-2.5 py-2",
                        theme === "light" && "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-semibold"
                    )}
                >
                    <Sun className="h-3.5 w-3.5 text-amber-500" />
                    <span>Light</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => setTheme("dark")}
                    className={cn(
                        "cursor-pointer rounded-lg text-xs font-medium gap-2 px-2.5 py-2",
                        theme === "dark" && "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-semibold"
                    )}
                >
                    <Moon className="h-3.5 w-3.5 text-blue-400" />
                    <span>Dark</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => setTheme("system")}
                    className={cn(
                        "cursor-pointer rounded-lg text-xs font-medium gap-2 px-2.5 py-2",
                        theme === "system" && "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-semibold"
                    )}
                >
                    <Laptop className="h-3.5 w-3.5 text-slate-500" />
                    <span>System</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
