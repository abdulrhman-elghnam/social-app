import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Home } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const navItems = [
    { label: "Feed", icon: Home, to: "/feed" },
    { label: "Notifications", icon: Bell, to: "/notifications" },
];

export default function Sidebar() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const currentUser = (user as any)?.user || user as any;
    const name = currentUser?.name || "User";
    const photo = currentUser?.photo || "";
    const username = currentUser?.username || "";

    return (
        <div className="hidden md:flex flex-col w-64 shrink-0 gap-4">
            {/* Profile mini card */}
            <Card
                className="border-none shadow-sm dark:bg-zinc-950 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate("/Profile")}
            >
                <CardContent className="p-4 flex items-center gap-3">
                    <Avatar className="w-12 h-12 border-2 border-blue-100 dark:border-zinc-800">
                        <AvatarImage src={photo} alt={name} />
                        <AvatarFallback className="bg-blue-50 text-blue-600 font-bold text-lg">
                            {name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col overflow-hidden">
                        <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 truncate">{name}</span>
                        {username && (
                            <span className="text-xs text-zinc-500 truncate">@{username}</span>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Navigation */}
            <Card className="border-none shadow-sm dark:bg-zinc-950">
                <CardContent className="flex flex-col gap-1 p-2">
                    {navItems.map(({ label, icon: Icon, to }) => (
                        <NavLink key={to} to={to}>
                            {({ isActive }) => (
                                <Button
                                    variant="ghost"
                                    className={cn(
                                        "justify-start px-4 h-12 w-full gap-3 font-medium",
                                        isActive
                                            ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20"
                                            : "text-zinc-600 dark:text-zinc-400"
                                    )}
                                >
                                    <Icon className="w-5 h-5" />
                                    {label}
                                </Button>
                            )}
                        </NavLink>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
