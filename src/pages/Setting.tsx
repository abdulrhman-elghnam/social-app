import { useState, useRef } from "react";
import PageLayout from "@/components/layout/pageLayout";
import Sidebar from "@/components/layout/Sidebar";
import RightSidebar from "@/components/layout/RightSidebar";
import RestPasswordForm from "@/components/RestPasswordForm";
import { useAuthStore } from "@/store/authStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
    User,
    KeyRound,
    Palette,
    Shield,
    Camera,
    Sun,
    Moon,
    Laptop,
    LogOut,
    Check,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { changeUserIcon } from "@/api/Auth-User.API";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function Setting() {
    const navigate = useNavigate();
    const photoRef = useRef<HTMLInputElement>(null);
    const queryClient = useQueryClient();
    const { user, setToken, updateUserIcon } = useAuthStore();
    const { theme, setTheme } = useTheme();
    const [selectedTab, setSelectedTab] = useState("security");

    const displayName = user?.name || "User";
    const displayPhoto = user?.photo || "";
    const username = user?.username ? `@${user.username}` : "";
    const email = user?.email || "";

    const photoMutation = useMutation({
        mutationFn: (form: FormData) => changeUserIcon(form),
        onMutate: () => toast.loading("Uploading photo...", { id: "settings-photo" }),
        onSuccess: (res) => {
            updateUserIcon(res.data);
            queryClient.invalidateQueries({ queryKey: ["user"] });
            toast.success("Profile photo updated!", { id: "settings-photo" });
        },
        onError: () => toast.error("Failed to upload photo", { id: "settings-photo" }),
    });

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const form = new FormData();
        form.append("photo", file);
        photoMutation.mutate(form);
    };

    const handleLogout = () => {
        setToken(null);
        localStorage.removeItem("auth-storage");
        toast.info("Logged out successfully");
        navigate("/login");
    };

    return (
        <PageLayout className="max-w-7xl px-4 sm:px-6 lg:px-8 py-6 flex gap-6 items-start justify-center pb-20">
            <Sidebar />

            <main className="flex-1 min-w-0 max-w-2xl w-full space-y-4">
                <Card className="border border-slate-200/80 dark:border-slate-800 shadow-xs bg-white dark:bg-slate-900 rounded-3xl overflow-hidden">
                    <CardHeader className="p-5 sm:p-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                        <CardTitle className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
                            <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            Account Settings
                        </CardTitle>
                        <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                            Manage your personal profile, security preferences, and appearance
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="p-5 sm:p-6">
                        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full space-y-6">
                            <TabsList className="w-full grid grid-cols-3 bg-slate-100 dark:bg-slate-950 p-1 rounded-2xl border border-slate-200/80 dark:border-slate-800 h-11">
                                <TabsTrigger
                                    value="security"
                                    className="rounded-xl font-bold text-xs gap-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 shadow-xs"
                                >
                                    <KeyRound className="w-3.5 h-3.5" />
                                    <span>Security</span>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="profile"
                                    className="rounded-xl font-bold text-xs gap-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 shadow-xs"
                                >
                                    <User className="w-3.5 h-3.5" />
                                    <span>Profile</span>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="appearance"
                                    className="rounded-xl font-bold text-xs gap-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 shadow-xs"
                                >
                                    <Palette className="w-3.5 h-3.5" />
                                    <span>Theme</span>
                                </TabsTrigger>
                            </TabsList>

                            {/* ── Security & Password Tab ── */}
                            <TabsContent value="security" className="m-0 focus-visible:outline-none">
                                <RestPasswordForm />
                            </TabsContent>

                            {/* ── Profile Information Tab ── */}
                            <TabsContent value="profile" className="m-0 space-y-6 focus-visible:outline-none">
                                <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800">
                                    <div className="relative">
                                        <Avatar className="w-16 h-16 border-2 border-white dark:border-slate-800 shadow-md">
                                            <AvatarImage src={displayPhoto} alt={displayName} className="object-cover" />
                                            <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold text-xl">
                                                {displayName.charAt(0)?.toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <button
                                            onClick={() => photoRef.current?.click()}
                                            className="absolute bottom-0 right-0 p-1.5 bg-blue-600 text-white rounded-full shadow hover:bg-blue-700 transition cursor-pointer"
                                            aria-label="Change photo"
                                        >
                                            <Camera className="w-3 h-3" />
                                        </button>
                                        <input
                                            type="file"
                                            ref={photoRef}
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handlePhotoUpload}
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">{displayName}</h3>
                                        <p className="text-xs text-slate-500">{email}</p>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => photoRef.current?.click()}
                                            className="mt-2 h-7 px-2.5 text-xs font-semibold rounded-lg"
                                        >
                                            Upload New Photo
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="p-3.5 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200/60 dark:border-slate-800 flex justify-between items-center text-xs">
                                        <span className="text-slate-500 font-medium">Full Name</span>
                                        <span className="font-bold text-slate-900 dark:text-slate-100">{displayName}</span>
                                    </div>
                                    {username && (
                                        <div className="p-3.5 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200/60 dark:border-slate-800 flex justify-between items-center text-xs">
                                            <span className="text-slate-500 font-medium">Username</span>
                                            <span className="font-bold text-slate-900 dark:text-slate-100">{username}</span>
                                        </div>
                                    )}
                                    <div className="p-3.5 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200/60 dark:border-slate-800 flex justify-between items-center text-xs">
                                        <span className="text-slate-500 font-medium">Email Address</span>
                                        <span className="font-bold text-slate-900 dark:text-slate-100">{email}</span>
                                    </div>
                                </div>
                            </TabsContent>

                            {/* ── Appearance & Theme Tab ── */}
                            <TabsContent value="appearance" className="m-0 space-y-4 focus-visible:outline-none">
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Customize the visual experience of SocialSphere on this device.
                                </p>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {/* Light Card */}
                                    <div
                                        onClick={() => setTheme("light")}
                                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                                            theme === "light"
                                                ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/20 shadow-xs"
                                                : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <Sun className="w-5 h-5 text-amber-500" />
                                            {theme === "light" && <Check className="w-4 h-4 text-blue-600" />}
                                        </div>
                                        <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">Light Mode</h4>
                                        <p className="text-[11px] text-slate-500 mt-0.5">Clean, bright appearance</p>
                                    </div>

                                    {/* Dark Card */}
                                    <div
                                        onClick={() => setTheme("dark")}
                                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                                            theme === "dark"
                                                ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/20 shadow-xs"
                                                : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <Moon className="w-5 h-5 text-blue-400" />
                                            {theme === "dark" && <Check className="w-4 h-4 text-blue-600" />}
                                        </div>
                                        <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">Dark Mode</h4>
                                        <p className="text-[11px] text-slate-500 mt-0.5">Easy on the eyes at night</p>
                                    </div>

                                    {/* System Card */}
                                    <div
                                        onClick={() => setTheme("system")}
                                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                                            theme === "system"
                                                ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/20 shadow-xs"
                                                : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <Laptop className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                                            {theme === "system" && <Check className="w-4 h-4 text-blue-600" />}
                                        </div>
                                        <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">System</h4>
                                        <p className="text-[11px] text-slate-500 mt-0.5">Sync with device settings</p>
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>

                        {/* Danger zone / Logout */}
                        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <div>
                                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">Session Management</h4>
                                <p className="text-[11px] text-slate-500">Sign out of your account on this device</p>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleLogout}
                                className="rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/30 border-red-200 dark:border-red-900/50 gap-1.5"
                            >
                                <LogOut className="w-3.5 h-3.5" />
                                <span>Log Out</span>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </main>

            <RightSidebar />
        </PageLayout>
    );
}
