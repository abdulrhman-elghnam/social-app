import { Link, useNavigate, useLocation } from "react-router-dom"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/store/authStore"
import { Home, User, Settings, Camera, LogOut, ChevronDown } from "lucide-react"
import { ShareIcon } from "@/assets/icons/share-icon"
import { useRef } from "react"
import { changeUserIcon } from "@/api123/Auth-User.API"
import { useMutation } from "@tanstack/react-query"
import { toast, Toaster } from "sonner"

export function Navbar({ className }: React.ComponentProps<"nav">) {
    const navigate = useNavigate();
    const location = useLocation();
    const ref = useRef<HTMLInputElement>(null);

    function handlePhotoChange() { ref.current?.click(); }

    async function handleUserImage() {
        const file = ref.current?.files?.[0];
        if (!file) return;
        const myFormData = new FormData();
        myFormData.append("photo", file);
        mutate(myFormData);
    }

    const { mutate } = useMutation({
        mutationFn: (data: FormData) => changeUserIcon(data),
        onSuccess: (res) => {
            updateUser(res.data);
            toast.success("Profile photo updated!", { id: "photo-toast" });
        },
        onError: () => toast.error("Upload failed", { id: "photo-toast" }),
        onMutate: () => toast.loading("Uploading photo...", { id: "photo-toast" }),
    });

    const setToken = useAuthStore((state) => state.setToken);
    const handleLogout = () => {
        setToken(null);
        localStorage.removeItem("auth-storage");
        navigate("/login");
    };

    const updateUser = useAuthStore((state) => state.updateUserIcon);
    const user = useAuthStore((state) => state.user);
    const displayName = user?.name || "User";
    const displayPhoto = user?.photo;

    // Active check: only Feed and Profile tabs now
    const activeTab = location.pathname.startsWith("/Profile") ? "/Profile" : "/feed";

    return (
        <nav className={cn(
            "sticky top-0 z-50 w-full border-b border-slate-200/60 dark:border-slate-800/60",
            "bg-white/85 dark:bg-slate-950/85 backdrop-blur-xl shadow-sm transition-all",
            className
        )}>
            <Toaster richColors />
            <div className="flex h-16 items-center px-4 md:px-6 lg:px-8 max-w-7xl mx-auto w-full gap-4">

                {/* Logo */}
                <div className="flex items-center shrink-0">
                    <Link to="/feed" className="flex items-center gap-2.5 group transition-transform hover:scale-[1.03] active:scale-95">
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-xl text-white shadow-md group-hover:shadow-lg transition-shadow">
                            <ShareIcon />
                        </div>
                        <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400 hidden sm:inline-block">
                            Social App
                        </span>
                    </Link>
                </div>

                {/* Center Tabs: Feed + Profile only */}
                <div className="hidden md:flex flex-1 justify-center">
                    <Tabs
                        value={activeTab}
                        onValueChange={(v) => navigate(v)}
                        className="w-full max-w-[280px] bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800/60 rounded-full p-1 shadow-inner"
                    >
                        <TabsList className="flex h-10 w-full bg-transparent p-0">
                            <TabsTrigger
                                value="/feed"
                                className="flex flex-1 items-center justify-center gap-2 rounded-full px-5 py-2 text-sm font-bold transition-all duration-300
                                    data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md
                                    data-[state=inactive]:text-slate-500 data-[state=inactive]:hover:text-slate-900
                                    dark:data-[state=active]:bg-slate-800 dark:data-[state=active]:text-blue-400
                                    dark:data-[state=inactive]:text-slate-400 dark:data-[state=inactive]:hover:text-slate-200"
                            >
                                <Home className="w-4 h-4" /> Feed
                            </TabsTrigger>
                            <TabsTrigger
                                value="/Profile"
                                className="flex flex-1 items-center justify-center gap-2 rounded-full px-5 py-2 text-sm font-bold transition-all duration-300
                                    data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md
                                    data-[state=inactive]:text-slate-500 data-[state=inactive]:hover:text-slate-900
                                    dark:data-[state=active]:bg-slate-800 dark:data-[state=active]:text-blue-400
                                    dark:data-[state=inactive]:text-slate-400 dark:data-[state=inactive]:hover:text-slate-200"
                            >
                                <User className="w-4 h-4" /> Profile
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                {/* Right: User Dropdown */}
                <div className="ml-auto shrink-0">
                    <DropdownMenu>
                        <DropdownMenuTrigger className="group flex items-center gap-2.5 border border-slate-200 dark:border-slate-700 rounded-full pl-1 pr-3 py-1 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer">
                            <Avatar className="h-8 w-8 border-2 border-white dark:border-slate-800 shadow-sm">
                                <AvatarImage src={displayPhoto} alt={displayName} className="object-cover" />
                                <AvatarFallback className="bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-800 dark:from-blue-900 dark:to-indigo-900 dark:text-blue-200 font-bold text-sm">
                                    {displayName?.charAt(0) || "U"}
                                </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 hidden md:inline-block max-w-[120px] truncate">
                                {displayName}
                            </span>
                            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
                        </DropdownMenuTrigger>

                        <DropdownMenuContent className="w-60 mt-2 p-2 rounded-2xl shadow-xl dark:shadow-slate-900/60 border-slate-200/80 dark:border-slate-800/60" align="end">
                            <DropdownMenuLabel className="font-normal px-3 py-3 bg-gradient-to-br from-blue-50/60 to-indigo-50/60 dark:from-slate-900/40 dark:to-slate-900/40 rounded-xl mb-1 border border-blue-100/60 dark:border-slate-800/40">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-9 w-9">
                                        <AvatarImage src={displayPhoto} />
                                        <AvatarFallback className="bg-blue-100 text-blue-700 font-bold">
                                            {displayName?.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col overflow-hidden">
                                        <p className="text-sm font-bold text-slate-900 dark:text-slate-50 truncate">{displayName}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email || ""}</p>
                                    </div>
                                </div>
                            </DropdownMenuLabel>

                            <DropdownMenuSeparator className="my-1.5 opacity-50" />

                            <DropdownMenuItem asChild className="rounded-lg cursor-pointer px-3 py-2.5 font-medium text-slate-700 dark:text-slate-200">
                                <Link to="/Profile" className="flex items-center gap-3">
                                    <User className="w-4 h-4 text-slate-400" /> Profile
                                </Link>
                            </DropdownMenuItem>

                            <DropdownMenuItem className="rounded-lg cursor-pointer px-3 py-2.5 font-medium text-slate-700 dark:text-slate-200" onClick={handlePhotoChange}>
                                <Camera className="w-4 h-4 mr-3 text-slate-400" /> Change Photo
                            </DropdownMenuItem>

                            <DropdownMenuItem asChild className="rounded-lg cursor-pointer px-3 py-2.5 font-medium text-slate-700 dark:text-slate-200">
                                <Link to="/setting" className="flex items-center gap-3">
                                    <Settings className="w-4 h-4 text-slate-400" /> Settings
                                </Link>
                            </DropdownMenuItem>

                            <DropdownMenuSeparator className="my-1.5 opacity-50" />

                            <DropdownMenuItem
                                onClick={handleLogout}
                                className="rounded-lg cursor-pointer px-3 py-2.5 text-red-600 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-950/40 font-bold gap-3"
                            >
                                <LogOut className="w-4 h-4" /> Logout
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Mobile bottom nav: Feed + Profile only */}
            <div className="md:hidden flex border-t border-slate-200/50 dark:border-slate-800/50 bg-white/60 dark:bg-slate-950/60 backdrop-blur-md">
                <Link
                    to="/feed"
                    className={cn(
                        "flex flex-1 flex-col items-center py-2.5 gap-1 text-[10px] font-bold uppercase tracking-wider transition-colors",
                        location.pathname === "/feed" ? "text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-400"
                    )}
                >
                    <Home className="w-5 h-5" />
                    Feed
                </Link>
                <Link
                    to="/Profile"
                    className={cn(
                        "flex flex-1 flex-col items-center py-2.5 gap-1 text-[10px] font-bold uppercase tracking-wider transition-colors",
                        location.pathname.startsWith("/Profile") ? "text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-400"
                    )}
                >
                    <User className="w-5 h-5" />
                    Profile
                </Link>
            </div>

            <input type="file" className="hidden" ref={ref} onChange={handleUserImage} accept="image/*" />
        </nav>
    )
}
