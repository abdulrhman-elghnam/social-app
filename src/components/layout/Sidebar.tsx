import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Home, User, Settings, PenSquare, LogOut, ArrowUpRight, BadgeCheck } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { getUnreadNotificationsCount } from "@/api/Notifications.API";
import { toast } from "sonner";

export default function Sidebar() {
    const navigate = useNavigate();
    const { user, setToken } = useAuthStore();
    const name = user?.name || "User";
    const photo = user?.photo || "";
    const username = user?.username || "";
    const email = user?.email || "";

    const { data: unreadData } = useQuery({
        queryKey: ["unreadNotificationsCount"],
        queryFn: async () => {
            try {
                const res = await getUnreadNotificationsCount();
                return res.data?.unreadCount || res.data?.data?.unreadCount || 0;
            } catch {
                return 0;
            }
        },
        refetchInterval: 30000,
    });

    const unreadCount = typeof unreadData === "number" ? unreadData : 0;

    const navItems = [
        { label: "Home Feed", icon: Home, to: "/feed" },
        {
            label: "Notifications",
            icon: Bell,
            to: "/notifications",
            badge: unreadCount > 0 ? (unreadCount > 99 ? "99+" : unreadCount) : undefined,
        },
        { label: "My Profile", icon: User, to: "/profile" },
        { label: "Settings", icon: Settings, to: "/settings" },
    ];

    const handleLogout = () => {
        setToken(null);
        localStorage.removeItem("auth-storage");
        toast.info("Logged out successfully");
        navigate("/login");
    };

    return (
        <aside className="hidden lg:flex flex-col w-72 shrink-0 gap-4 sticky top-20 select-none">
            {/* User Profile Card */}
            <Card
                className="relative overflow-hidden border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-950/5 hover:border-blue-200 dark:hover:border-blue-900/60 group"
                onClick={() => navigate("/profile")}
            >
                <div className="relative h-[88px] overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600">
                    <div className="absolute -right-8 -top-12 h-32 w-32 rounded-full bg-white/15 blur-2xl" />
                    <div className="absolute -bottom-16 left-8 h-28 w-44 rotate-12 rounded-full border border-white/20" />
                    <div className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-slate-950/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white/90 backdrop-blur-sm">
                        Your space
                    </div>
                    <ArrowUpRight className="absolute right-4 top-4 h-4 w-4 text-white/70 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </div>
                <CardContent className="relative p-4 pt-0">
                    <Avatar className="h-[72px] w-[72px] -mt-9 border-4 border-white dark:border-slate-900 shadow-lg ring-2 ring-blue-500/20 transition-transform duration-300 group-hover:scale-105">
                        <AvatarImage src={photo} alt={name} className="object-cover" />
                        <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold text-xl">
                            {name.charAt(0)?.toUpperCase()}
                        </AvatarFallback>
                    </Avatar>

                    <div className="mt-3 min-w-0">
                        <div className="flex items-center gap-1.5 min-w-0">
                            <h3 className="truncate font-extrabold text-[15px] tracking-tight text-slate-900 dark:text-slate-100">
                                {name}
                            </h3>
                            <BadgeCheck className="h-4 w-4 shrink-0 text-blue-500" aria-label="Profile verified" />
                        </div>
                        {username ? (
                            <p className="mt-0.5 truncate text-xs font-semibold text-slate-500 dark:text-slate-400">
                                @{username}
                            </p>
                        ) : (
                            <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                                {email}
                            </p>
                        )}
                    </div>

                    <div className="mt-4 grid grid-cols-2 overflow-hidden rounded-xl border border-slate-100 bg-slate-50/80 text-xs dark:border-slate-800 dark:bg-slate-950/40">
                        <div className="flex flex-col gap-0.5 px-3 py-2.5">
                            <span className="font-extrabold text-sm tabular-nums text-slate-900 dark:text-slate-100">
                                {user?.followingCount ?? 0}
                            </span>
                            <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Following</span>
                        </div>
                        <div className="flex flex-col gap-0.5 border-l border-slate-100 px-3 py-2.5 dark:border-slate-800">
                            <span className="font-extrabold text-sm tabular-nums text-slate-900 dark:text-slate-100">
                                {user?.followersCount ?? 0}
                            </span>
                            <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Followers</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Navigation Card */}
            <Card className="border border-slate-200/80 dark:border-slate-800 shadow-xs bg-white dark:bg-slate-900">
                <CardContent className="flex flex-col gap-1 p-2">
                    {navItems.map(({ label, icon: Icon, to, badge }) => (
                        <NavLink key={to} to={to}>
                            {({ isActive }) => (
                                <Button
                                    variant="ghost"
                                    className={cn(
                                        "justify-start px-3.5 h-11 w-full gap-3 font-semibold text-sm rounded-xl transition-all duration-200",
                                        isActive
                                            ? "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 shadow-xs"
                                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                                    )}
                                >
                                    <Icon className={cn("w-4 h-4", isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-500")} />
                                    <span className="flex-1 text-left">{label}</span>
                                    {badge && (
                                        <span className="px-2 py-0.5 text-[11px] font-bold bg-blue-600 text-white rounded-full">
                                            {badge}
                                        </span>
                                    )}
                                </Button>
                            )}
                        </NavLink>
                    ))}
                </CardContent>
            </Card>

            {/* Quick Actions & Logout */}
            <div className="flex flex-col gap-2">
                <Button
                    onClick={() => {
                        window.scrollTo({ top: 0, behavior: "smooth" });
                        const textarea = document.querySelector("textarea");
                        if (textarea) textarea.focus();
                    }}
                    className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-md shadow-blue-500/20 gap-2 transition-all active:scale-98"
                >
                    <PenSquare className="w-4 h-4" />
                    <span>Create Post</span>
                </Button>

                <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="w-full h-10 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl gap-2 font-medium text-xs justify-center transition-colors"
                >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                </Button>
            </div>
        </aside>
    );
}
