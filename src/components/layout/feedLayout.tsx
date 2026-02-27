import { useEffect, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getAllPosts } from "@/api123/Posts.API";
import CreatePostCard from "../createPostCard";
import PostItem from "../PostItem";
import { Loader2, LayoutList } from "lucide-react";

export default function FeedLayout() {
    const {
        data,
        isLoading,
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    } = useInfiniteQuery({
        queryKey: ["allPosts"],
        queryFn: async ({ pageParam: _page }) => {
            const res = await getAllPosts();
            return res.data;
        },
        initialPageParam: 1,
        getNextPageParam: (_lastPage, allPages) => {
            // Since getAllPosts doesn't paginate by default, we stop after first page
            if (allPages.length >= 1) return undefined;
            return allPages.length + 1;
        },
    });

    // Safely extract posts from any response shape
    const posts = data?.pages.flatMap((page: any) => {
        // Try the most common shapes
        return (
            page?.posts ||
            page?.data?.posts ||
            page?.data?.data?.posts ||
            (Array.isArray(page?.data) ? page.data : []) ||
            []
        );
    }) || [];

    // Infinite scroll sentinel ref
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
        return () => { if (el) observer.unobserve(el); };
    }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

    return (
        <div className="w-full space-y-5 pb-20">
            {/* Create Post */}
            <CreatePostCard />

            {/* Loading skeleton */}
            {isLoading && (
                <div className="flex flex-col items-center justify-center gap-3 py-16 text-zinc-400">
                    <Loader2 className="w-9 h-9 animate-spin text-blue-500" />
                    <span className="text-sm font-medium">Loading posts...</span>
                </div>
            )}

            {/* Error State */}
            {error && !isLoading && (
                <div className="p-5 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-xl text-center font-medium">
                    ⚠️ Failed to load posts. Please check your connection or log in again.
                </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && posts.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-zinc-400 gap-4">
                    <div className="p-5 bg-zinc-100 dark:bg-zinc-900 rounded-full">
                        <LayoutList className="w-8 h-8 opacity-40" />
                    </div>
                    <p className="text-sm font-medium">No posts yet. Be the first to post!</p>
                </div>
            )}

            {/* Posts List */}
            <div className="space-y-5">
                {posts.map((post: any) => (
                    <PostItem key={post._id || post.id} post={post} />
                ))}
            </div>

            {/* Infinite scroll sentinel */}
            <div ref={sentinelRef} className="flex justify-center py-4">
                {isFetchingNextPage && (
                    <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 text-sm">
                        <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                        Loading more posts...
                    </div>
                )}
            </div>

            {!hasNextPage && posts.length > 0 && !isLoading && (
                <p className="text-center text-xs text-zinc-400 dark:text-zinc-600 py-4 uppercase tracking-widest font-semibold">
                    — End of feed —
                </p>
            )}
        </div>
    );
}
