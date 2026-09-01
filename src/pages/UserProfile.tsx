import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getUserPostsById } from "@/api/Posts.API";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, LayoutList, Globe } from "lucide-react";
import PageLayout from "@/components/layout/pageLayout";
import Sidebar from "@/components/layout/Sidebar";
import RightSidebar from "@/components/layout/RightSidebar";
import PostItem from "@/components/PostItem";
import { useAuthStore } from "@/store/authStore";

export default function UserProfile() {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();
    const { user: currentUser } = useAuthStore();
    const currentUserId = (currentUser as any)?._id || (currentUser as any)?.id || (currentUser as any)?.user?._id;

    // Redirect to own profile if visiting own profile
    useEffect(() => {
        if (userId && userId === currentUserId) {
            navigate("/profile", { replace: true });
        }
    }, [userId, currentUserId, navigate]);

    // Fetch this user's posts
    const { data: postsData, isLoading: loadingPosts } = useQuery({
        queryKey: ["userPostsById", userId],
        queryFn: () => getUserPostsById(userId!, { limit: 30 }),
        enabled: !!userId,
    });

    const rawPosts = postsData?.data;
    const posts: any[] =
        rawPosts?.posts ||
        rawPosts?.data?.posts ||
        (Array.isArray(rawPosts?.data) ? rawPosts.data : []) ||
        (Array.isArray(rawPosts) ? rawPosts : []) ||
        [];

    // Author details from first post
    const author = posts[0]?.user || null;
    const authorName = author?.name || "User";
    const authorPhoto = author?.photo || "";
    const authorUsername = author?.username ? `@${author.username}` : "";
    const authorEmail = author?.email || "";

    return (
        <PageLayout className="max-w-7xl px-4 sm:px-6 lg:px-8 py-6 flex gap-6 items-start justify-center pb-20">
            <Sidebar />

            <main className="flex-1 min-w-0 max-w-2xl w-full space-y-4">
                {/* Back button */}
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(-1)}
                        className="gap-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl h-9 px-3 text-xs font-bold"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back</span>
                    </Button>
                </div>

                {/* User Header Profile Card */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
                    {/* Cover Photo */}
                    <div className="h-36 sm:h-44 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 relative">
                        <div className="absolute inset-0 bg-black/20" />
                    </div>

                    <div className="p-5 sm:p-6 pt-0 relative">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end -mt-12 sm:-mt-14 mb-4 gap-3">
                            <Avatar className="w-24 h-24 sm:w-28 sm:h-28 border-4 border-white dark:border-slate-900 shadow-xl ring-2 ring-indigo-500/20">
                                <AvatarImage src={authorPhoto} alt={authorName} className="object-cover" />
                                <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-indigo-600 to-violet-600 text-white">
                                    {authorName.charAt(0)?.toUpperCase()}
                                </AvatarFallback>
                            </Avatar>

                        </div>

                        <div className="space-y-1">
                            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
                                {authorName}
                            </h1>
                            {authorUsername && (
                                <p className="text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400">
                                    {authorUsername}
                                </p>
                            )}
                            <p className="text-xs text-slate-500 flex items-center gap-1.5 pt-1">
                                <Globe className="w-3.5 h-3.5 text-slate-400" />
                                <span>Public Social Profile</span>
                                {authorEmail && <span>• {authorEmail}</span>}
                            </p>
                        </div>

                        <div className="flex gap-6 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                            <div>
                                <strong className="text-sm font-bold text-slate-900 dark:text-white mr-1.5">
                                    {posts.length}
                                </strong>
                                <span className="text-slate-500">Public Posts</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Posts Section */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 px-2 pt-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                            Posts by {authorName}
                        </span>
                    </div>

                    {loadingPosts ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl">
                            <Loader2 className="w-7 h-7 animate-spin text-blue-500" />
                            <span className="text-xs font-semibold">Loading posts...</span>
                        </div>
                    ) : posts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 px-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl text-center shadow-xs">
                            <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-400 mb-2">
                                <LayoutList className="w-7 h-7" />
                            </div>
                            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">No public posts yet</h3>
                            <p className="text-xs text-slate-500 max-w-xs mt-1">
                                {authorName} hasn't published any public posts yet.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {posts.map((post: any) => (
                                <PostItem key={post._id || post.id} post={post} />
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <RightSidebar />
        </PageLayout>
    );
}
