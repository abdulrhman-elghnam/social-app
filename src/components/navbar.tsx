import { Link, useNavigate, useLocation } from "react-router-dom";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { Home, User, Settings, Camera, LogOut, ChevronDown, Bell, Sparkles } from "lucide-react";
import { ShareIcon } from "@/assets/icons/share-icon";
import { useRef } from "react";
import { changeUserIcon } from "@/api/Auth-User.API";
import { getUnreadNotificationsCount } from "@/api/Notifications.API";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ThemeToggle } from "./ThemeToggle";

export function Navbar({ className }: React.ComponentProps<"nav">) {
    const navigate = useNavigate();
    const location = useLocation();
    const ref = useRef<HTMLInputElement>(null);
    const queryClient = useQueryClient();

    const { user, setToken, updateUserIcon } = useAuthStore();
    const displayName = user?.name || "User";
    const displayPhoto = user?.photo;

    // Fetch live unread count
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

    function handlePhotoChange() {
        ref.current?.click();
    }

    async function handleUserImage() {
        const file = ref.current?.files?.[0];
        if (!file) return;
        const myFormData = new FormData();
        myFormData.append("photo", file);
        mutate(myFormData);
    }

    const { mutate } = useMutation({
        mutationFn: (data: FormData) => changeUserIcon(data),
        onMutate: () => toast.loading("Uploading new avatar...", { id: "photo-toast" }),
        onSuccess: (res) => {
            updateUserIcon(res.data);
            queryClient.invalidateQueries({ queryKey: ["user"] });
            toast.success("Profile photo updated successfully!", { id: "photo-toast" });
        },
        onError: () => toast.error("Failed to upload photo", { id: "photo-toast" }),
    });

    const handleLogout = () => {
        setToken(null);
        localStorage.removeItem("auth-storage");
        toast.info("Logged out successfully");
        navigate("/login");
    };

    const isFeed = location.pathname === "/feed" || location.pathname === "/";
    const isProfile = location.pathname.toLowerCase().startsWith("/profile");
    const isNotifications = location.pathname.toLowerCase().startsWith("/notifications");
    const isSettings = location.pathname.toLowerCase().startsWith("/settings") || location.pathname.toLowerCase().startsWith("/setting");

    return (
        <nav
            className={cn(
                "sticky top-0 z-50 w-full border-b border-slate-200/80 dark:border-slate-800/80",
                "bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl transition-colors shadow-xs",
                className
            )}
        >
            <div className="flex h-16 items-center px-4 md:px-6 lg:px-8 max-w-7xl mx-auto w-full gap-4 justify-between">
                {/* Brand Logo */}
                <div className="flex items-center gap-3">
                    <Link
                        to="/feed"
                        className="flex items-center gap-2.5 group transition-transform active:scale-95"
                    >
                        <div className="bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 p-2 rounded-xl text-white shadow-md shadow-blue-500/20 group-hover:shadow-indigo-500/30 transition-all duration-300">
                            <ShareIcon size={20} />
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 dark:from-blue-400 dark:via-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
                                SocialSphere
                            </span>
                            <span className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
                                <Sparkles className="w-2.5 h-2.5" /> v2
                            </span>
                        </div>
                    </Link>
                </div>

                {/* Center Navigation Links (Desktop) */}
                <div className="hidden md:flex items-center gap-1 bg-slate-100/80 dark:bg-slate-900/80 p-1 rounded-full border border-slate-200/60 dark:border-slate-800/60 shadow-inner">
                    <Link
                        to="/feed"
                        className={cn(
                            "flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200",
                            isFeed
                                ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs"
                                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/50 dark:hover:bg-slate-800/50"
                        )}
                    >
                        <Home className="w-4 h-4" />
                        <span>Feed</span>
                    </Link>

                    <Link
                        to="/notifications"
                        className={cn(
                            "relative flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200",
                            isNotifications
                                ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs"
                                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/50 dark:hover:bg-slate-800/50"
                        )}
                    >
                        <Bell className="w-4 h-4" />
                        <span>Notifications</span>
                        {unreadCount > 0 && (
                            <span className="ml-0.5 px-1.5 py-0.2 text-[10px] font-bold bg-blue-600 text-white rounded-full">
                                {unreadCount > 99 ? "99+" : unreadCount}
                            </span>
                        )}
                    </Link>

                    <Link
                        to="/profile"
                        className={cn(
                            "flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200",
                            isProfile
                                ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs"
                                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/50 dark:hover:bg-slate-800/50"
                        )}
                    >
                        <User className="w-4 h-4" />
                        <span>Profile</span>
                    </Link>
                </div>

                {/* Right Action Icons & Profile */}
                <div className="flex items-center gap-2.5">
                    {/* Theme Toggle */}
                    <ThemeToggle />

                    {/* Notification Bell (Mobile / Quick action) */}
                    <Link
                        to="/notifications"
                        className="relative md:hidden p-2 rounded-full text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        aria-label="Notifications"
                    >
                        <Bell className="w-5 h-5" />
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white dark:ring-slate-950" />
                        )}
                    </Link>

                    {/* User Profile Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger className="group flex items-center gap-2 border border-slate-200/80 dark:border-slate-800 rounded-full pl-1 pr-2.5 py-1 bg-white/60 dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all shadow-xs hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer">
                            <Avatar className="h-8 w-8 border border-slate-200 dark:border-slate-700 shadow-xs">
                                <AvatarImage src={displayPhoto} alt={displayName} className="object-cover" />
                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-xs">
                                    {displayName?.charAt(0)?.toUpperCase() || "U"}
                                </AvatarFallback>
                            </Avatar>
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 hidden lg:inline-block max-w-[100px] truncate">
                                {displayName}
                            </span>
                            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors" />
                        </DropdownMenuTrigger>

                        <DropdownMenuContent
                            className="w-64 mt-2 p-2 rounded-2xl shadow-xl dark:shadow-slate-950/80 border-slate-200/80 dark:border-slate-800 animate-in fade-in zoom-in-95"
                            align="end"
                        >
                            <DropdownMenuLabel className="font-normal p-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl mb-1 border border-slate-100 dark:border-slate-800/80">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10 border border-slate-200 dark:border-slate-700">
                                        <AvatarImage src={displayPhoto} className="object-cover" />
                                        <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold">
                                            {displayName?.charAt(0)?.toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col min-w-0">
                                        <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                                            {displayName}
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                            {user?.email || ""}
                                        </p>
                                    </div>
                                </div>
                            </DropdownMenuLabel>

                            <DropdownMenuSeparator className="my-1.5 opacity-50" />

                            <DropdownMenuItem
                                asChild
                                className="rounded-xl cursor-pointer px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                <Link to="/profile" className="flex items-center gap-3 w-full">
                                    <User className="w-4 h-4 text-blue-500" />
                                    <span>My Profile</span>
                                </Link>
                            </DropdownMenuItem>

                            <DropdownMenuItem
                                onClick={handlePhotoChange}
                                className="rounded-xl cursor-pointer px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 gap-3"
                            >
                                <Camera className="w-4 h-4 text-indigo-500" />
                                <span>Change Profile Photo</span>
                            </DropdownMenuItem>

                            <DropdownMenuItem
                                asChild
                                className="rounded-xl cursor-pointer px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                <Link to="/settings" className="flex items-center gap-3 w-full">
                                    <Settings className="w-4 h-4 text-slate-500" />
                                    <span>Settings & Security</span>
                                </Link>
                            </DropdownMenuItem>

                            <DropdownMenuSeparator className="my-1.5 opacity-50" />

                            <DropdownMenuItem
                                onClick={handleLogout}
                                className="rounded-xl cursor-pointer px-3 py-2 text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 focus:bg-red-50 dark:focus:bg-red-950/40 gap-3"
                            >
                                <LogOut className="w-4 h-4 text-red-500" />
                                <span>Log Out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Mobile Bottom Navigation Bar */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl px-2 py-1.5 shadow-lg">
                <Link
                    to="/feed"
                    className={cn(
                        "flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200",
                        isFeed
                            ? "text-blue-600 dark:text-blue-400 font-bold"
                            : "text-slate-500 dark:text-slate-400 hover:text-slate-800"
                    )}
                >
                    <Home className="w-5 h-5" />
                    <span className="text-[11px] mt-0.5 font-medium">Feed</span>
                </Link>

                <Link
                    to="/notifications"
                    className={cn(
                        "relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200",
                        isNotifications
                            ? "text-blue-600 dark:text-blue-400 font-bold"
                            : "text-slate-500 dark:text-slate-400 hover:text-slate-800"
                    )}
                >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-0.5 right-2 px-1 text-[9px] font-bold bg-blue-600 text-white rounded-full min-w-[14px] text-center">
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                    )}
                    <span className="text-[11px] mt-0.5 font-medium">Alerts</span>
                </Link>

                <Link
                    to="/profile"
                    className={cn(
                        "flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200",
                        isProfile
                            ? "text-blue-600 dark:text-blue-400 font-bold"
                            : "text-slate-500 dark:text-slate-400 hover:text-slate-800"
                    )}
                >
                    <User className="w-5 h-5" />
                    <span className="text-[11px] mt-0.5 font-medium">Profile</span>
                </Link>

                <Link
                    to="/settings"
                    className={cn(
                        "flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200",
                        isSettings
                            ? "text-blue-600 dark:text-blue-400 font-bold"
                            : "text-slate-500 dark:text-slate-400 hover:text-slate-800"
                    )}
                >
                    <Settings className="w-5 h-5" />
                    <span className="text-[11px] mt-0.5 font-medium">Settings</span>
                </Link>
            </div>

            {/* Hidden Photo Input */}
            <input
                type="file"
                className="hidden"
                ref={ref}
                onChange={handleUserImage}
                accept="image/*"
            />
        </nav>
    );
}

