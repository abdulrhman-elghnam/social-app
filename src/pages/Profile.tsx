import PageLayout from "@/components/layout/pageLayout";
import Sidebar from "@/components/layout/Sidebar";
import RightSidebar from "@/components/layout/RightSidebar";
import { useAuthStore } from "@/store/authStore";
import {
    Camera,
    Settings,
    Lock,
    Globe,
    Users,
    Loader2,
    Calendar,
    Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { getMyUserProfile, changeUserIcon } from "@/api/Auth-User.API";
import { getUserPosts } from "@/api/Posts.API";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import PostItem from "@/components/PostItem";
import CreatePostCard from "@/components/createPostCard";

export default function Profile() {
    const navigate = useNavigate();
    const photoInputRef = useRef<HTMLInputElement>(null);
    const queryClient = useQueryClient();
    const { user, setUser, updateUserIcon } = useAuthStore();
    const [activeTab, setActiveTab] = useState("public");

    // ─── Fetch profile data ───────────────────────────────────────────────
    const { data: profileData } = useQuery({
        queryKey: ["user"],
        queryFn: getMyUserProfile,
    });

    useEffect(() => {
        if (profileData?.data?.data?.user) {
            setUser(profileData.data.data.user);
        }
    }, [profileData, setUser]);

    // ─── Fetch posts by privacy ───────────────────────────────────────────
    const { data: publicPostsData, isLoading: loadingPublic } = useQuery({
        queryKey: ["userPosts", "public"],
        queryFn: () => getUserPosts({ only: "public", limit: 30 }),
    });

    const { data: privatePostsData, isLoading: loadingPrivate } = useQuery({
        queryKey: ["userPosts", "private"],
        queryFn: () => getUserPosts({ only: "onlyme", limit: 30 }),
    });

    const { data: friendsPostsData, isLoading: loadingFriends } = useQuery({
        queryKey: ["userPosts", "friends"],
        queryFn: () => getUserPosts({ only: "friends", limit: 30 }),
    });

    const extractPosts = (data: any): any[] => {
        const body = data?.data;
        return (
            body?.posts ||
            body?.data?.posts ||
            (Array.isArray(body?.data) ? body.data : []) ||
            (Array.isArray(body) ? body : []) ||
            []
        );
    };

    const publicPosts = extractPosts(publicPostsData);
    const privatePosts = extractPosts(privatePostsData);
    const friendsPosts = extractPosts(friendsPostsData);

    // ─── Change avatar mutation ────────────────────────────────────────────
    const avatarMutation = useMutation({
        mutationFn: (form: FormData) => changeUserIcon(form),
        onMutate: () => toast.loading("Uploading photo...", { id: "avatar" }),
        onSuccess: (res) => {
            updateUserIcon(res.data);
            queryClient.invalidateQueries({ queryKey: ["user"] });
            toast.success("Profile photo updated!", { id: "avatar" });
        },
        onError: () => toast.error("Failed to update photo", { id: "avatar" }),
    });

    function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        const form = new FormData();
        form.append("photo", file);
        avatarMutation.mutate(form);
    }

    const displayName = user?.name || "User";
    const displayPhoto = user?.photo || "";
    const username = user?.username ? `@${user.username}` : "";
    const email = user?.email || "";
    const coverPhoto =
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2864&auto=format&fit=crop";

    return (
        <PageLayout className="max-w-7xl px-4 sm:px-6 lg:px-8 py-6 flex gap-6 items-start justify-center pb-20">
            <Sidebar />

            <main className="flex-1 min-w-0 max-w-2xl w-full space-y-5">
                {/* ── Profile Header Card ── */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
                    {/* Cover Banner */}
                    <div className="relative w-full h-44 sm:h-56 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 overflow-hidden">
                        <img
                            src={coverPhoto}
                            alt="Profile Cover"
                            className="w-full h-full object-cover opacity-80"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    </div>

                    {/* Profile details */}
                    <div className="px-5 sm:px-6 pb-6 relative">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end -mt-14 sm:-mt-16 mb-4 gap-3">
                            {/* Avatar with change button */}
                            <div className="relative">
                                <Avatar className="w-28 h-28 sm:w-32 sm:h-32 border-4 border-white dark:border-slate-900 shadow-xl ring-2 ring-blue-500/20">
                                    <AvatarImage src={displayPhoto} className="object-cover" />
                                    <AvatarFallback className="text-3xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold">
                                        {displayName.charAt(0)?.toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <button
                                    onClick={() => photoInputRef.current?.click()}
                                    className="absolute bottom-1 right-1 p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full shadow-md text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer hover:scale-105"
                                    aria-label="Change profile photo"
                                >
                                    <Camera className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                </button>
                                <input
                                    type="file"
                                    accept="image/*"
                                    ref={photoInputRef}
                                    className="hidden"
                                    onChange={handleAvatarChange}
                                />
                            </div>

                            {/* Settings Button */}
                            <Button
                                onClick={() => navigate("/settings")}
                                className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 text-white rounded-xl text-xs font-bold px-4 h-9 gap-1.5 shadow-xs"
                            >
                                <Settings className="w-3.5 h-3.5" />
                                <span>Edit Profile</span>
                            </Button>
                        </div>

                        {/* Name & Handles */}
                        <div className="space-y-1 mb-4">
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
                                    {displayName}
                                </h1>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                                    Member
                                </span>
                            </div>
                            {username && (
                                <p className="text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400">
                                    {username}
                                </p>
                            )}
                            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1">
                                {email && (
                                    <span className="flex items-center gap-1.5">
                                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                                        <span>{email}</span>
                                    </span>
                                )}
                                <span className="flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                    <span>Joined SocialSphere</span>
                                </span>
                            </div>
                        </div>

                        {/* Follower Stats */}
                        <div className="flex gap-6 py-3 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                            <div>
                                <strong className="text-sm font-bold text-slate-900 dark:text-white mr-1.5">
                                    {publicPosts.length + friendsPosts.length + privatePosts.length}
                                </strong>
                                <span className="text-slate-500">Posts</span>
                            </div>
                            <div>
                                <strong className="text-sm font-bold text-slate-900 dark:text-white mr-1.5">
                                    {(user as any)?.followingCount ?? 0}
                                </strong>
                                <span className="text-slate-500">Following</span>
                            </div>
                            <div>
                                <strong className="text-sm font-bold text-slate-900 dark:text-white mr-1.5">
                                    {(user as any)?.followersCount ?? 0}
                                </strong>
                                <span className="text-slate-500">Followers</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Create Post on Profile */}
                <CreatePostCard />

                {/* ── Posts Tabs ── */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-4">
                    <TabsList className="w-full grid grid-cols-3 bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl border border-slate-200/80 dark:border-slate-800 h-11">
                        <TabsTrigger
                            value="public"
                            className="rounded-xl font-bold text-xs gap-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:shadow-xs transition-all"
                        >
                            <Globe className="w-3.5 h-3.5" />
                            <span>Public ({publicPosts.length})</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="friends"
                            className="rounded-xl font-bold text-xs gap-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:shadow-xs transition-all"
                        >
                            <Users className="w-3.5 h-3.5" />
                            <span>Friends ({friendsPosts.length})</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="private"
                            className="rounded-xl font-bold text-xs gap-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:shadow-xs transition-all"
                        >
                            <Lock className="w-3.5 h-3.5" />
                            <span>Only Me ({privatePosts.length})</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="public">
                        <PostsFeedList
                            posts={publicPosts}
                            isLoading={loadingPublic}
                            emptyTitle="No public posts yet"
                            emptyDesc="Posts you share with everyone will appear here."
                            emptyIcon={<Globe className="w-7 h-7 text-blue-500" />}
                        />
                    </TabsContent>

                    <TabsContent value="friends">
                        <PostsFeedList
                            posts={friendsPosts}
                            isLoading={loadingFriends}
                            emptyTitle="No friends posts yet"
                            emptyDesc="Posts shared exclusively with your friends will appear here."
                            emptyIcon={<Users className="w-7 h-7 text-green-500" />}
                        />
                    </TabsContent>

                    <TabsContent value="private">
                        <PostsFeedList
                            posts={privatePosts}
                            isLoading={loadingPrivate}
                            emptyTitle="No private notes yet"
                            emptyDesc="Posts visible only to you will appear here."
                            emptyIcon={<Lock className="w-7 h-7 text-amber-500" />}
                        />
                    </TabsContent>
                </Tabs>
            </main>

            <RightSidebar />
        </PageLayout>
    );
}

function PostsFeedList({
    posts,
    isLoading,
    emptyTitle,
    emptyDesc,
    emptyIcon,
}: {
    posts: any[];
    isLoading: boolean;
    emptyTitle: string;
    emptyDesc: string;
    emptyIcon: React.ReactNode;
}) {
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl">
                <Loader2 className="w-7 h-7 animate-spin text-blue-500" />
                <span className="text-xs font-semibold">Loading posts...</span>
            </div>
        );
    }

    if (posts.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 px-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl text-center shadow-xs space-y-2">
                <div className="p-3.5 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-1">
                    {emptyIcon}
                </div>
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">{emptyTitle}</h3>
                <p className="text-xs text-slate-500 max-w-xs">{emptyDesc}</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {posts.map((post: any) => (
                <PostItem key={post._id || post.id} post={post} />
            ))}
        </div>
    );
}
