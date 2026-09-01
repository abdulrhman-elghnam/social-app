import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Search, TrendingUp, Users, Sparkles, Hash } from "lucide-react";

import { useQuery } from "@tanstack/react-query";
import { getUserSuggestions } from "@/api/Auth-User.API";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

const trendingTopics = [
    { tag: "React19", posts: "24.5k", category: "Technology" },
    { tag: "TailwindCSS", posts: "18.2k", category: "Design" },
    { tag: "WebDev", posts: "12.8k", category: "Coding" },
    { tag: "AIRevolution", posts: "45.1k", category: "Trends" },
    { tag: "UIUXDesign", posts: "9.3k", category: "Design" },
];

export default function RightSidebar() {
    const navigate = useNavigate();
    const { user: currentUser } = useAuthStore();
    const [searchQuery, setSearchQuery] = useState("");

    const currentUserId = (currentUser as any)?._id || (currentUser as any)?.id;

    const { data: suggestionsData, isLoading } = useQuery({
        queryKey: ["userSuggestions"],
        queryFn: async () => {
            try {
                const res = await getUserSuggestions({ limit: 5 });
                const raw = res.data;
                const users =
                    raw?.users ||
                    raw?.data?.users ||
                    (Array.isArray(raw?.data) ? raw.data : []) ||
                    (Array.isArray(raw) ? raw : []) ||
                    [];
                return users.filter((u: any) => (u._id || u.id) !== currentUserId);
            } catch {
                return [];
            }
        },
        staleTime: 1000 * 60 * 5,
    });

    const suggestions = suggestionsData || [];

    return (
        <aside className="hidden xl:flex flex-col w-80 shrink-0 gap-4 sticky top-20 select-none">
            {/* Search Box */}
            <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search topics or people..."
                    className="pl-10 h-11 bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 rounded-2xl text-sm focus-visible:ring-2 focus-visible:ring-blue-500/20 shadow-xs"
                />
            </div>

            {/* Who to follow / Suggested Users */}
            <Card className="border border-slate-200/80 dark:border-slate-800 shadow-xs bg-white dark:bg-slate-900 overflow-hidden">
                <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        Suggested for you
                    </CardTitle>
                    <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-0.5">
                        <Sparkles className="w-3 h-3" /> New
                    </span>
                </CardHeader>
                <CardContent className="p-2 space-y-1">
                    {isLoading ? (
                        <div className="p-4 text-center text-xs text-slate-400">Loading suggestions...</div>
                    ) : suggestions.length === 0 ? (
                        <div className="p-4 text-center text-xs text-slate-400">No suggestions right now</div>
                    ) : (
                        suggestions.slice(0, 4).map((user: any) => {
                            const uId = user._id || user.id;
                            const uName = user.name || "User";
                            const uPhoto = user.photo || "";
                            const uHandle = user.username ? `@${user.username}` : "";

                            return (
                                <div
                                    key={uId}
                                    className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group cursor-pointer"
                                    onClick={() => navigate(`/user/${uId}`)}
                                >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <Avatar className="w-9 h-9 border border-slate-200 dark:border-slate-700 shrink-0">
                                            <AvatarImage src={uPhoto} alt={uName} className="object-cover" />
                                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-xs">
                                                {uName.charAt(0)?.toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col min-w-0">
                                            <span className="font-semibold text-xs text-slate-900 dark:text-slate-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                {uName}
                                            </span>
                                            {uHandle && (
                                                <span className="text-[11px] text-slate-400 truncate">{uHandle}</span>
                                            )}
                                        </div>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-7 px-3 text-xs font-semibold rounded-full border-blue-200 dark:border-blue-900 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 shrink-0"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/user/${uId}`);
                                        }}
                                    >
                                        View
                                    </Button>
                                </div>
                            );
                        })
                    )}
                </CardContent>
            </Card>

            {/* Trending Topics */}
            <Card className="border border-slate-200/80 dark:border-slate-800 shadow-xs bg-white dark:bg-slate-900">
                <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        Trending Topics
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-2 space-y-1">
                    {trendingTopics.map(({ tag, posts, category }) => (
                        <div
                            key={tag}
                            className="p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer group"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-medium text-slate-400">{category}</span>
                                <span className="text-[11px] text-slate-400">{posts} posts</span>
                            </div>
                            <div className="flex items-center gap-1 mt-0.5">
                                <Hash className="w-3.5 h-3.5 text-blue-500" />
                                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    {tag}
                                </span>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Footer info */}
            <div className="px-3 text-[11px] text-slate-400 dark:text-slate-500 flex flex-wrap gap-x-3 gap-y-1">
                <Link to="/settings" className="hover:underline">Settings</Link>
                <span>•</span>
                <span className="hover:underline cursor-pointer">Privacy</span>
                <span>•</span>
                <span className="hover:underline cursor-pointer">Terms</span>
                <span>•</span>
                <span>© 2026 SocialSphere</span>
            </div>
        </aside>
    );
}
