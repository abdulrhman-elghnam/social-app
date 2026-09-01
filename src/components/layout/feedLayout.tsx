import { useEffect, useRef, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getHomeFeed } from "@/api/Posts.API";
import CreatePostCard from "../createPostCard";
import PostItem from "../PostItem";
import { Loader2, LayoutList, RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FeedLayout() {
    const [activeFeedTab, setActiveFeedTab] = useState<"following" | "all">("following");

    const {
        data,
        isLoading,
        isRefetching,
        error,
        refetch,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteQuery({
        queryKey: ["homeFeed", activeFeedTab],
        queryFn: async ({ pageParam }) => {
            const res = await getHomeFeed({ only: activeFeedTab, page: pageParam, limit: 10 });
            return res.data;
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage, allPages) => {
            const pagination = lastPage?.pagination || lastPage?.data?.pagination || lastPage?.meta || lastPage?.data?.meta;
            if (pagination?.hasNextPage === false || pagination?.hasNext === false) return undefined;
            if (pagination?.nextPage) return pagination.nextPage;
            return (lastPage?.posts || lastPage?.data?.posts || []).length < 10 ? undefined : allPages.length + 1;
        },
    });

    // Extract posts
    const rawPosts = data?.pages.flatMap((page: any) => {
        return (
            page?.posts ||
            page?.data?.posts ||
            page?.data?.data?.posts ||
            (Array.isArray(page?.data) ? page.data : []) ||
            (Array.isArray(page) ? page : []) ||
            []
        );
    }) || [];

    // Filter or sort if needed
    const posts = rawPosts;

    // Infinite scroll observer
    const sentinelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
                    fetchNextPage();
                }
            },
            { threshold: 0.1 }
        );

        const el = sentinelRef.current;
        if (el) observer.observe(el);
        return () => {
            if (el) observer.unobserve(el);
        };
    }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

    return (
        <div className="w-full space-y-4 pb-20">
            {/* Create Post Header */}
            <CreatePostCard />

            {/* Feed Filter Header */}
            <div className="flex items-center justify-between px-2 py-1">
                <div className="flex items-center gap-1 bg-slate-200/60 dark:bg-slate-900/60 p-1 rounded-xl border border-slate-200/80 dark:border-slate-800">
                    <button
                        onClick={() => setActiveFeedTab("following")}
                        className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                            activeFeedTab === "following"
                                ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs"
                                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                        }`}
                    >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Following</span>
                    </button>
                    <button
                        onClick={() => setActiveFeedTab("all")}
                        className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                            activeFeedTab === "all"
                                ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs"
                                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                        }`}
                    >
                        <span>Discover</span>
                    </button>
                </div>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => refetch()}
                    disabled={isRefetching || isLoading}
                    className="h-8 px-2.5 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 rounded-xl gap-1.5 font-medium"
                >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRefetching ? "animate-spin text-blue-500" : ""}`} />
                    <span className="hidden sm:inline">Refresh</span>
                </Button>
            </div>

            {/* Loading Skeletons */}
            {isLoading && (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4 animate-pulse"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800" />
                                <div className="space-y-1.5 flex-1">
                                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
                                    <div className="h-3 bg-slate-100 dark:bg-slate-800/60 rounded w-1/6" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full" />
                                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                            </div>
                            <div className="h-48 bg-slate-100 dark:bg-slate-800/40 rounded-xl" />
                        </div>
                    ))}
                </div>
            )}

            {/* Error State */}
            {error && !isLoading && (
                <div className="p-6 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-2xl text-center space-y-3">
                    <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                        Failed to load feed posts. Please check your connection.
                    </p>
                    <Button
                        size="sm"
                        onClick={() => refetch()}
                        className="bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold"
                    >
                        Try Again
                    </Button>
                </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && posts.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 px-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl text-center shadow-xs">
                    <div className="p-4 bg-blue-50 dark:bg-blue-950/40 rounded-2xl text-blue-600 dark:text-blue-400 mb-3">
                        <LayoutList className="w-8 h-8" />
                    </div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 mb-1">
                        No posts in your feed yet
                    </h3>
                    <p className="text-xs text-slate-500 max-w-sm mb-4">
                        Share your thoughts, photos, or follow people to start seeing activity in your feed!
                    </p>
                    <Button
                        onClick={() => {
                            const textarea = document.querySelector("textarea");
                            if (textarea) {
                                textarea.focus();
                                window.scrollTo({ top: 0, behavior: "smooth" });
                            }
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold px-4 h-9"
                    >
                        Create First Post
                    </Button>
                </div>
            )}

            {/* Posts Stream */}
            <div className="space-y-4">
                {posts.map((post: any) => (
                    <PostItem key={post._id || post.id} post={post} />
                ))}
            </div>

            {/* Infinite Scroll Sentinel */}
            <div ref={sentinelRef} className="flex justify-center py-4">
                {isFetchingNextPage && (
                    <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
                        <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                        <span>Loading more posts...</span>
                    </div>
                )}
            </div>

            {!hasNextPage && posts.length > 0 && !isLoading && (
                <div className="flex items-center justify-center gap-2 py-6 text-xs text-slate-400 font-semibold uppercase tracking-wider">
                    <span className="w-12 h-px bg-slate-200 dark:bg-slate-800" />
                    <span>You're all caught up</span>
                    <span className="w-12 h-px bg-slate-200 dark:bg-slate-800" />
                </div>
            )}
        </div>
    );
}
