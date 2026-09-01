import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    Heart,
    MessageCircle,
    Share2,
    Bookmark,
    MoreHorizontal,
    Send,
    Loader2,
    Pencil,
    Check,
    X,
    Globe,
    Lock,
    Users,
    Copy,
    ExternalLink,
    Maximize2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toggleLikePost, toggleBookmarkPost, updatePost } from "@/api/Posts.API";
import { getPostComments, createComment } from "@/api/Comments-Replies.API";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface PostItemProps {
    post: any;
}

const privacyIcon = (type: string) => {
    if (type === "private" || type === "onlyme") return <Lock className="w-3 h-3 text-amber-500" />;
    if (type === "friends") return <Users className="w-3 h-3 text-green-500" />;
    return <Globe className="w-3 h-3 text-blue-500" />;
};

const privacyLabel = (type: string) => {
    if (type === "private" || type === "onlyme") return "Only me";
    if (type === "friends") return "Friends";
    return "Public";
};

export default function PostItem({ post }: PostItemProps) {
    const author =
        (typeof post.user === "object" && post.user) ||
        post.userDetails ||
        post.author ||
        post.createdBy ||
        {};
    const { user } = useAuthStore();
    const queryClient = useQueryClient();
    const postId = post._id || post.id;
    const currentUserId = (user as any)?._id || (user as any)?.id || (user as any)?.user?._id;
    const authorId =
        author?._id ||
        author?.id ||
        (typeof post.user === "string" ? post.user : undefined) ||
        (typeof post.userId === "string" ? post.userId : post.userId?._id || post.userId?.id);
    const isMyPost = Boolean(currentUserId && authorId && currentUserId === authorId);
    const navigate = useNavigate();

    const goToAuthorProfile = () => {
        if (!authorId) return;
        if (isMyPost) {
            navigate("/profile");
        } else {
            navigate(`/user/${authorId}`);
        }
    };

    // ─── Like & Bookmark State ───────────────────────────────────────────────
    const extractIsLiked = () => {
        if (typeof post.isLiked === "boolean") return post.isLiked;
        if (Array.isArray(post.likes)) {
            return post.likes.some((id: any) => id === currentUserId || id?._id === currentUserId);
        }
        return false;
    };

    const [isLiked, setIsLiked] = useState<boolean>(extractIsLiked());
    const [likesCount, setLikesCount] = useState<number>(
        post.likesCount || (Array.isArray(post.likes) ? post.likes.length : 0)
    );
    const [isSaved, setIsSaved] = useState<boolean>(false);
    const [likeBouncing, setLikeBouncing] = useState(false);

    // ─── Comments ────────────────────────────────────────────────────────────
    const [showComments, setShowComments] = useState<boolean>(false);
    const [commentText, setCommentText] = useState("");

    // ─── Edit State ──────────────────────────────────────────────────────────
    const [isEditing, setIsEditing] = useState(false);
    const [editBody, setEditBody] = useState(post.body || "");
    const [editImageFile, setEditImageFile] = useState<File | null>(null);
    const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
    const editFileRef = React.useRef<HTMLInputElement>(null);

    // ─── Delete & Lightbox Dialogs ───────────────────────────────────────────
    const [showLightbox, setShowLightbox] = useState(false);

    const formattedTime = post.createdAt
        ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })
        : "just now";

    // ─── Mutations ───────────────────────────────────────────────────────────

    const likeMutation = useMutation({
        mutationFn: () => toggleLikePost(postId),
        onMutate: () => {
            setLikeBouncing(true);
            setTimeout(() => setLikeBouncing(false), 400);
            const next = !isLiked;
            setIsLiked(next);
            setLikesCount((p) => (next ? p + 1 : Math.max(0, p - 1)));
        },
        onError: () => {
            const prev = !isLiked;
            setIsLiked(prev);
            setLikesCount((p) => (prev ? p + 1 : Math.max(0, p - 1)));
            toast.error("Failed to update like");
        },
    });

    const saveMutation = useMutation({
        mutationFn: () => toggleBookmarkPost(postId),
        onMutate: () => {
            const next = !isSaved;
            setIsSaved(next);
            toast.success(next ? "Post saved to bookmarks!" : "Post removed from bookmarks");
        },
        onError: () => {
            setIsSaved((p) => !p);
            toast.error("Failed to update bookmark");
        },
    });

    const commentMutation = useMutation({
        mutationFn: (text: string) => createComment(postId, { content: text }),
        onSuccess: () => {
            setCommentText("");
            queryClient.invalidateQueries({ queryKey: ["comments", postId] });
            toast.success("Comment added!");
        },
        onError: () => {
            toast.error("Failed to post comment");
        },
    });

    const updateMutation = useMutation({
        mutationFn: () => {
            const form = new FormData();
            if (editBody.trim()) form.append("body", editBody.trim());
            if (editImageFile) form.append("image", editImageFile);
            return updatePost(postId, form);
        },
        onMutate: () => toast.loading("Updating post...", { id: "update-post" }),
        onSuccess: () => {
            toast.success("Post updated successfully!", { id: "update-post" });
            setIsEditing(false);
            setEditImageFile(null);
            setEditImagePreview(null);
            queryClient.invalidateQueries({ queryKey: ["allPosts"] });
            queryClient.invalidateQueries({ queryKey: ["userPosts"] });
            queryClient.invalidateQueries({ queryKey: ["homeFeed"] });
        },
        onError: (err: any) => {
            const msg = err?.response?.data?.message || "Failed to update post";
            toast.error(msg, { id: "update-post" });
        },
    });

    // ─── Comments Fetching ───────────────────────────────────────────────────
    const { data: commentsData, isLoading: loadingComments } = useQuery({
        queryKey: ["comments", postId],
        queryFn: () => getPostComments(postId, { limit: 15 }),
        enabled: showComments,
    });

    const raw = commentsData?.data;
    const commentsList: any[] =
        raw?.comments ||
        raw?.data?.comments ||
        (Array.isArray(raw?.data) ? raw.data : []) ||
        (Array.isArray(raw) ? raw : []) ||
        [];

    const handleCommentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentText.trim()) return;
        commentMutation.mutate(commentText.trim());
    };

    const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setEditImageFile(file);
        setEditImagePreview(URL.createObjectURL(file));
    };

    const cancelEdit = () => {
        setIsEditing(false);
        setEditBody(post.body || "");
        setEditImageFile(null);
        if (editImagePreview) {
            URL.revokeObjectURL(editImagePreview);
            setEditImagePreview(null);
        }
    };

    const handleShare = async () => {
        const shareUrl = `${window.location.origin}/user/${authorId || ""}`;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `${author?.name || "User"}'s Post on SocialSphere`,
                    text: post.body || "Check out this post on SocialSphere",
                    url: shareUrl,
                });
                return;
            } catch {
                // fallback to copy
            }
        }
        navigator.clipboard.writeText(shareUrl);
        toast.success("Link copied to clipboard!");
    };

    return (
        <>
            <Card
                className={cn(
                    "w-full border border-slate-200/80 dark:border-slate-800 shadow-xs bg-white dark:bg-slate-900 rounded-2xl overflow-hidden transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-700",
                    updateMutation.isPending && "opacity-70 pointer-events-none"
                )}
            >
                <CardContent className="p-0">
                    {/* ── Post Header ── */}
                    <div className="p-4 sm:p-5 flex items-start justify-between gap-3">
                        <button
                            type="button"
                            onClick={goToAuthorProfile}
                            disabled={!authorId}
                            title={authorId ? `View ${author?.name || "author"}'s profile` : undefined}
                            className="group flex min-w-0 items-center gap-3 rounded-xl text-left outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-default disabled:hover:opacity-100"
                        >
                            <Avatar className="h-10 w-10 shrink-0 border border-slate-200 dark:border-slate-700">
                                <AvatarImage src={author?.photo} alt={author?.name} className="object-cover" />
                                <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-600 text-sm font-bold text-white">
                                    {author?.name?.charAt(0)?.toUpperCase() || "U"}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col min-w-0">
                                <span className="truncate text-sm font-bold text-slate-900 transition-colors group-hover:text-blue-600 dark:text-slate-100 dark:group-hover:text-blue-400 sm:text-base">
                                    {author?.name || "Anonymous User"}
                                </span>
                                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                    <span>{formattedTime}</span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                        {privacyIcon(post.type)}
                                        <span>{privacyLabel(post.type)}</span>
                                    </span>
                                </div>
                            </div>
                        </button>

                        {/* Dropdown Menu */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full h-8 w-8 shrink-0"
                                >
                                    <MoreHorizontal className="w-4 h-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 rounded-2xl shadow-xl p-1.5 border-slate-200 dark:border-slate-800">
                                {isMyPost && (
                                    <>
                                        <DropdownMenuItem
                                            onClick={() => {
                                                setIsEditing(true);
                                                setEditBody(post.body || "");
                                            }}
                                            className="cursor-pointer rounded-xl px-3 py-2 gap-2.5 font-medium text-xs text-slate-700 dark:text-slate-200"
                                        >
                                            <Pencil className="w-3.5 h-3.5 text-slate-400" />
                                            Edit Post
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator className="my-1 opacity-50" />
                                    </>
                                )}
                                <DropdownMenuItem
                                    onClick={handleShare}
                                    className="cursor-pointer rounded-xl px-3 py-2 gap-2.5 font-medium text-xs text-slate-700 dark:text-slate-200"
                                >
                                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                                    Copy Post Link
                                </DropdownMenuItem>
                                {!isMyPost && authorId && (
                                    <DropdownMenuItem
                                        onClick={goToAuthorProfile}
                                        className="cursor-pointer rounded-xl px-3 py-2 gap-2.5 font-medium text-xs text-slate-700 dark:text-slate-200"
                                    >
                                        <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                                        View Author Profile
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* ── Edit Mode ── */}
                    {isEditing ? (
                        <div className="px-4 sm:px-5 pb-4 space-y-3">
                            <textarea
                                value={editBody}
                                onChange={(e) => setEditBody(e.target.value)}
                                rows={3}
                                autoFocus
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm text-slate-800 dark:text-slate-100 resize-none outline-none focus:ring-2 focus:ring-blue-500/20"
                            />

                            {(editImagePreview || post.image) && (
                                <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 group max-h-[260px] bg-slate-900 flex items-center justify-center">
                                    <img
                                        src={editImagePreview || post.image}
                                        alt="Edit preview"
                                        className="w-full max-h-[260px] object-contain"
                                    />
                                    {editImagePreview && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                URL.revokeObjectURL(editImagePreview);
                                                setEditImagePreview(null);
                                                setEditImageFile(null);
                                            }}
                                            className="absolute top-2 right-2 bg-slate-900/80 text-white rounded-full p-1.5 hover:bg-slate-900 transition"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            )}

                            <div className="flex items-center justify-between pt-1">
                                <button
                                    type="button"
                                    onClick={() => editFileRef.current?.click()}
                                    className="text-xs text-blue-600 hover:underline font-semibold"
                                >
                                    {post.image ? "Change photo" : "+ Add photo"}
                                </button>
                                <input
                                    type="file"
                                    accept="image/*"
                                    ref={editFileRef}
                                    className="hidden"
                                    onChange={handleEditImageChange}
                                />
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={cancelEdit}
                                        className="rounded-xl h-8 px-3 text-xs"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={() => updateMutation.mutate()}
                                        disabled={updateMutation.isPending || !editBody.trim()}
                                        className="rounded-xl h-8 px-4 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
                                    >
                                        {updateMutation.isPending ? (
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        ) : (
                                            <Check className="w-3.5 h-3.5" />
                                        )}
                                        Save Changes
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* ── Post Body ── */}
                            {post.body && (
                                <div className="px-4 sm:px-5 pb-3.5">
                                    <p className="text-sm sm:text-base text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                                        {post.body}
                                    </p>
                                </div>
                            )}

                            {/* ── Post Image with Lightbox Trigger ── */}
                            {post.image && (
                                <div
                                    className="relative w-full bg-slate-950 max-h-[520px] overflow-hidden flex items-center justify-center cursor-pointer group"
                                    onClick={() => setShowLightbox(true)}
                                >
                                    <img
                                        src={post.image}
                                        alt="Post attachment"
                                        className="w-full h-auto max-h-[520px] object-contain transition-transform duration-300 group-hover:scale-[1.01]"
                                        loading="lazy"
                                    />
                                    <div className="absolute bottom-2 right-2 p-1.5 bg-black/60 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-xs">
                                        <Maximize2 className="w-3.5 h-3.5" />
                                        <span>Click to view</span>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {/* ── Stats Row ── */}
                    <div className="px-4 sm:px-5 py-2.5 flex items-center justify-between text-xs text-slate-500 border-b border-slate-100 dark:border-slate-800/80">
                        <div className="flex items-center gap-1.5">
                            <span className="p-1 bg-red-500 text-white rounded-full flex items-center justify-center">
                                <Heart className="w-2.5 h-2.5 fill-current" />
                            </span>
                            <span className="font-semibold text-slate-700 dark:text-slate-300">{likesCount} likes</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowComments(!showComments)}
                                className="hover:underline cursor-pointer hover:text-blue-600 transition-colors"
                            >
                                {post.commentsCount || commentsList.length || 0} Comments
                            </button>
                        </div>
                    </div>

                    {/* ── Action Buttons Bar ── */}
                    <div className="px-2 py-1 flex items-center justify-between gap-1">
                        <Button
                            variant="ghost"
                            onClick={() => likeMutation.mutate()}
                            className={cn(
                                "flex-1 rounded-xl h-9 gap-2 text-xs font-bold transition-all",
                                isLiked
                                    ? "text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                            )}
                        >
                            <Heart
                                className={cn(
                                    "w-4 h-4 transition-transform duration-200",
                                    isLiked && "fill-current text-red-500",
                                    likeBouncing && "scale-130"
                                )}
                            />
                            <span>{isLiked ? "Liked" : "Like"}</span>
                        </Button>

                        <Button
                            variant="ghost"
                            onClick={() => setShowComments(!showComments)}
                            className={cn(
                                "flex-1 rounded-xl h-9 gap-2 text-xs font-bold transition-colors",
                                showComments
                                    ? "text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                            )}
                        >
                            <MessageCircle className={cn("w-4 h-4", showComments && "fill-current")} />
                            <span>Comment</span>
                        </Button>

                        <Button
                            variant="ghost"
                            onClick={() => saveMutation.mutate()}
                            className={cn(
                                "flex-1 rounded-xl h-9 gap-2 text-xs font-bold transition-colors",
                                isSaved
                                    ? "text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                            )}
                        >
                            <Bookmark className={cn("w-4 h-4", isSaved && "fill-current")} />
                            <span>{isSaved ? "Saved" : "Save"}</span>
                        </Button>

                        <Button
                            variant="ghost"
                            onClick={handleShare}
                            className="hidden sm:flex flex-1 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl h-9 gap-2 text-xs font-bold"
                        >
                            <Share2 className="w-4 h-4" />
                            <span>Share</span>
                        </Button>
                    </div>

                    {/* ── Comments Section ── */}
                    {showComments && (
                        <div className="px-4 sm:px-5 py-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-950/30 animate-in fade-in duration-200">
                            {/* Comment Input */}
                            <form onSubmit={handleCommentSubmit} className="flex gap-2.5 mb-4">
                                <Avatar className="w-8 h-8 border border-slate-200 dark:border-slate-700 shrink-0">
                                    <AvatarImage src={user?.photo || ""} />
                                    <AvatarFallback className="text-xs font-bold bg-blue-100 text-blue-600">
                                        {(user?.name || "U").charAt(0)?.toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 relative flex items-center">
                                    <input
                                        type="text"
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                        placeholder="Write a comment..."
                                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full py-2 pl-4 pr-10 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 transition"
                                        disabled={commentMutation.isPending}
                                    />
                                    <button
                                        type="submit"
                                        disabled={!commentText.trim() || commentMutation.isPending}
                                        className="absolute right-1.5 p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-full transition-colors disabled:opacity-30 cursor-pointer"
                                        aria-label="Send comment"
                                    >
                                        {commentMutation.isPending ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Send className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                            </form>

                            {/* Loading State */}
                            {loadingComments && (
                                <div className="flex justify-center py-4">
                                    <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                                </div>
                            )}

                            {/* Comments Stream */}
                            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                                {commentsList.map((comment: any) => {
                                    const creator = comment.commentCreator || comment.user || {};
                                    const cName = creator.name || "Anonymous";
                                    const cPhoto = creator.photo || "";
                                    const cTime = comment.createdAt
                                        ? formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })
                                        : "recently";

                                    return (
                                        <div key={comment._id || comment.id} className="flex gap-2.5 items-start">
                                            <Avatar className="w-7 h-7 border border-slate-200 dark:border-slate-700 shrink-0 mt-0.5">
                                                <AvatarImage src={cPhoto} alt={cName} className="object-cover" />
                                                <AvatarFallback className="text-[10px] font-bold bg-blue-100 text-blue-700">
                                                    {cName.charAt(0)?.toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl px-3.5 py-2 inline-block max-w-[95%] shadow-xs">
                                                    <span className="font-bold text-xs text-slate-900 dark:text-slate-100 block mb-0.5">
                                                        {cName}
                                                    </span>
                                                    <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 break-words leading-relaxed">
                                                        {comment.content || comment.text || comment.body}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-3 px-2 mt-1 text-[11px] text-slate-400 font-medium">
                                                    <span className="cursor-pointer hover:text-blue-600 transition-colors">Like</span>
                                                    <span className="cursor-pointer hover:text-blue-600 transition-colors">Reply</span>
                                                    <span>{cTime}</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}

                                {!loadingComments && commentsList.length === 0 && (
                                    <p className="text-center text-xs text-slate-400 py-3 font-medium">
                                        No comments yet. Be the first to start the conversation!
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* ── Image Lightbox Modal ── */}
            {showLightbox && post.image && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in"
                    onClick={() => setShowLightbox(false)}
                >
                    <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={() => setShowLightbox(false)}
                            className="absolute -top-10 right-0 p-2 text-white/80 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
                        >
                            <X className="w-6 h-6" />
                        </button>
                        <img
                            src={post.image}
                            alt="Full post attachment"
                            className="max-h-[85vh] max-w-full object-contain rounded-2xl shadow-2xl"
                        />
                    </div>
                </div>
            )}

        </>
    );
}
