import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    Heart, MessageCircle, Share2, Bookmark,
    MoreHorizontal, Send, Loader2, Pencil, Trash2,
    Check, X, Globe, Lock, Users
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toggleLikePost, toggleBookmarkPost, updatePost, deletePost } from "@/api123/Posts.API";
import { getPostComments, createComment } from "@/api123/Comments-Replies.API";
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
    if (type === "private") return <Lock className="w-3 h-3" />;
    if (type === "friends") return <Users className="w-3 h-3" />;
    return <Globe className="w-3 h-3" />;
};

const privacyLabel = (type: string) => {
    if (type === "private") return "Only me";
    if (type === "friends") return "Friends";
    return "Public";
};

export default function PostItem({ post }: PostItemProps) {
    const author = post.user || {};
    const { user } = useAuthStore();
    const queryClient = useQueryClient();
    const postId = post._id || post.id;
    const currentUserId = (user as any)?.user?._id || (user as any)?._id || (user as any)?.id;
    const authorId = author?._id || author?.id;
    const isMyPost = currentUserId && authorId && currentUserId === authorId;
    const navigate = useNavigate();

    const goToAuthorProfile = () => {
        if (!authorId) return;
        if (isMyPost) {
            navigate('/Profile');
        } else {
            navigate(`/user/${authorId}`);
        }
    };

    // ─── Like & Bookmark state ───────────────────────────────────────────────
    const extractIsLiked = () => {
        if (typeof post.isLiked === "boolean") return post.isLiked;
        if (Array.isArray(post.likes)) return post.likes.some((id: any) => id === currentUserId || id._id === currentUserId);
        return false;
    };

    const [isLiked, setIsLiked] = useState<boolean>(extractIsLiked());
    const [likesCount, setLikesCount] = useState<number>(post.likesCount || (Array.isArray(post.likes) ? post.likes.length : 0));
    const [isSaved, setIsSaved] = useState<boolean>(false);

    // ─── Comments ────────────────────────────────────────────────────────────
    const [showComments, setShowComments] = useState<boolean>(false);
    const [commentText, setCommentText] = useState("");

    // ─── Edit state ──────────────────────────────────────────────────────────
    const [isEditing, setIsEditing] = useState(false);
    const [editBody, setEditBody] = useState(post.body || "");
    const [editImageFile, setEditImageFile] = useState<File | null>(null);
    const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
    const editFileRef = React.useRef<HTMLInputElement>(null);

    // ─── Delete dialog ───────────────────────────────────────────────────────
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const formattedTime = post.createdAt
        ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })
        : "just now";

    // ─── Mutations ───────────────────────────────────────────────────────────

    const likeMutation = useMutation({
        mutationFn: () => toggleLikePost(postId),
        onMutate: () => {
            const next = !isLiked;
            setIsLiked(next);
            setLikesCount(p => next ? p + 1 : Math.max(0, p - 1));
        },
        onError: () => {
            const prev = !isLiked;
            setIsLiked(prev);
            setLikesCount(p => prev ? p + 1 : Math.max(0, p - 1));
        },
    });

    const saveMutation = useMutation({
        mutationFn: () => toggleBookmarkPost(postId),
        onMutate: () => setIsSaved(p => !p),
        onError: () => setIsSaved(p => !p),
    });

    const commentMutation = useMutation({
        mutationFn: (text: string) => createComment(postId, { content: text }),
        onSuccess: () => {
            setCommentText("");
            queryClient.invalidateQueries({ queryKey: ['comments', postId] });
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
            toast.success("Post updated!", { id: "update-post" });
            setIsEditing(false);
            setEditImageFile(null);
            setEditImagePreview(null);
            queryClient.invalidateQueries({ queryKey: ["allPosts"] });
            queryClient.invalidateQueries({ queryKey: ["homeFeed"] });
        },
        onError: (err: any) => {
            const msg = err?.response?.data?.message || "Failed to update post";
            toast.error(msg, { id: "update-post" });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: () => deletePost(postId),
        onMutate: () => toast.loading("Deleting post...", { id: "delete-post" }),
        onSuccess: () => {
            toast.success("Post deleted", { id: "delete-post" });
            queryClient.invalidateQueries({ queryKey: ["allPosts"] });
            queryClient.invalidateQueries({ queryKey: ["homeFeed"] });
        },
        onError: () => toast.error("Failed to delete post", { id: "delete-post" }),
    });

    // ─── Comments Fetching ───────────────────────────────────────────────────
    const { data: commentsData, isLoading: loadingComments } = useQuery({
        queryKey: ['comments', postId],
        queryFn: () => getPostComments(postId, { limit: 10 }),
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
        commentMutation.mutate(commentText);
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
        if (editImagePreview) { URL.revokeObjectURL(editImagePreview); setEditImagePreview(null); }
    };

    // ─── Render ───────────────────────────────────────────────────────────────
    return (
        <>
            <Card className={cn(
                "w-full border-none shadow-md overflow-hidden bg-white dark:bg-zinc-950 transition-opacity",
                deleteMutation.isPending && "opacity-50 pointer-events-none"
            )}>
                <CardContent className="p-0">
                    {/* ── Post Header ── */}
                    <div className="p-4 sm:p-5 flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <button onClick={goToAuthorProfile} className="shrink-0 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                                <Avatar className="w-10 h-10 border hover:opacity-90 transition-opacity cursor-pointer">
                                    <AvatarImage src={author?.photo} alt={author?.name} />
                                    <AvatarFallback>{author?.name?.charAt(0) || "U"}</AvatarFallback>
                                </Avatar>
                            </button>
                            <div className="flex flex-col">
                                <button
                                    onClick={goToAuthorProfile}
                                    className="font-semibold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 hover:underline text-left"
                                >
                                    {author?.name || "Anonymous"}
                                </button>
                                <span className="flex items-center gap-1 text-xs text-zinc-500">
                                    {formattedTime} • {privacyIcon(post.type)} {privacyLabel(post.type)}
                                </span>
                            </div>
                        </div>

                        {/* Three-dot menu — only for own posts */}
                        {isMyPost ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-full h-9 w-9">
                                        <MoreHorizontal className="w-5 h-5" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-44 rounded-xl shadow-lg p-1">
                                    <DropdownMenuItem
                                        onClick={() => { setIsEditing(true); setEditBody(post.body || ""); }}
                                        className="cursor-pointer rounded-lg px-3 py-2.5 gap-3 font-medium text-zinc-700 dark:text-zinc-200"
                                    >
                                        <Pencil className="w-4 h-4 text-zinc-400" />
                                        Edit Post
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="my-1 opacity-50" />
                                    <DropdownMenuItem
                                        onClick={() => setShowDeleteDialog(true)}
                                        className="cursor-pointer rounded-lg px-3 py-2.5 gap-3 font-medium text-red-600 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-950/40"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Delete Post
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <Button variant="ghost" size="icon" className="text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-full h-9 w-9">
                                <MoreHorizontal className="w-5 h-5" />
                            </Button>
                        )}
                    </div>

                    {/* ── Edit Mode ── */}
                    {isEditing ? (
                        <div className="px-4 sm:px-5 pb-4 space-y-3">
                            <textarea
                                value={editBody}
                                onChange={e => setEditBody(e.target.value)}
                                rows={4}
                                autoFocus
                                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl p-3 text-sm text-zinc-800 dark:text-zinc-100 resize-none outline-none focus:ring-2 focus:ring-blue-500/30 transition"
                            />

                            {/* Edit image preview */}
                            {(editImagePreview || post.image) && (
                                <div className="relative rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 group">
                                    <img
                                        src={editImagePreview || post.image}
                                        alt="edit preview"
                                        className="w-full max-h-[260px] object-contain bg-zinc-100 dark:bg-zinc-900"
                                    />
                                    {editImagePreview && (
                                        <button
                                            onClick={() => { URL.revokeObjectURL(editImagePreview); setEditImagePreview(null); setEditImageFile(null); }}
                                            className="absolute top-2 right-2 bg-zinc-900/70 text-white rounded-full p-1 hover:bg-zinc-900 transition"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            )}

                            <div className="flex items-center justify-between pt-1">
                                <button
                                    onClick={() => editFileRef.current?.click()}
                                    className="text-xs text-blue-500 hover:underline font-medium"
                                >
                                    {post.image ? "Change photo" : "Add photo"}
                                </button>
                                <input type="file" accept="image/*" ref={editFileRef} className="hidden" onChange={handleEditImageChange} />
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={cancelEdit} className="rounded-full h-8 px-4 gap-1.5">
                                        <X className="w-3.5 h-3.5" /> Cancel
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={() => updateMutation.mutate()}
                                        disabled={updateMutation.isPending || !editBody.trim()}
                                        className="rounded-full h-8 px-4 gap-1.5 bg-blue-500 hover:bg-blue-600 text-white"
                                    >
                                        {updateMutation.isPending
                                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            : <Check className="w-3.5 h-3.5" />
                                        }
                                        Save
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* ── Post Body ── */}
                            {post.body && (
                                <div className="px-4 sm:px-5 pb-3">
                                    <p className="text-sm sm:text-base text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap">
                                        {post.body}
                                    </p>
                                </div>
                            )}

                            {/* ── Post Image ── */}
                            {post.image && (
                                <div className="w-full bg-zinc-100 dark:bg-zinc-900 max-h-[500px] overflow-hidden flex items-center justify-center">
                                    <img
                                        src={post.image}
                                        alt="Post attachment"
                                        className="w-full h-auto max-h-[500px] object-contain"
                                        loading="lazy"
                                    />
                                </div>
                            )}
                        </>
                    )}

                    {/* ── Stats Bar ── */}
                    <div className="px-4 sm:px-5 py-2 flex items-center justify-between text-xs text-zinc-500 border-b border-zinc-100 dark:border-zinc-800/60">
                        <div className="flex items-center gap-1">
                            <div className="bg-blue-500 rounded-full p-1 border-2 border-white dark:border-zinc-950">
                                <Heart className="w-3 h-3 text-white fill-current" />
                            </div>
                            <span className="ml-1">{likesCount}</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="hover:underline cursor-pointer" onClick={() => setShowComments(!showComments)}>
                                {post.commentsCount || 0} Comments
                            </span>
                        </div>
                    </div>

                    {/* ── Action Buttons ── */}
                    <div className="px-2 py-1 flex items-center">
                        <Button
                            variant="ghost"
                            onClick={() => likeMutation.mutate()}
                            className={cn("flex-1 rounded-lg h-10 gap-2",
                                isLiked
                                    ? "text-blue-600 dark:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                            )}
                        >
                            <Heart className={cn("w-5 h-5", isLiked && "fill-current")} />
                            <span className="font-medium">Like</span>
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => setShowComments(!showComments)}
                            className={cn("flex-1 rounded-lg h-10 gap-2",
                                showComments
                                    ? "text-blue-600 dark:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                            )}
                        >
                            <MessageCircle className={cn("w-5 h-5", showComments && "fill-current")} />
                            <span className="font-medium">Comment</span>
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => saveMutation.mutate()}
                            className={cn("flex-1 rounded-lg h-10 gap-2",
                                isSaved
                                    ? "text-blue-600 dark:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                            )}
                        >
                            <Bookmark className={cn("w-5 h-5", isSaved && "fill-current")} />
                            <span className="font-medium">Save</span>
                        </Button>
                        <Button
                            variant="ghost"
                            className="hidden sm:flex flex-1 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg h-10 gap-2"
                        >
                            <Share2 className="w-5 h-5" />
                            <span className="font-medium">Share</span>
                        </Button>
                    </div>

                    {/* ── Comments Section ── */}
                    {showComments && (
                        <div className="px-4 sm:px-5 py-4 border-t border-zinc-100 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-900/10">

                            {/* Comment Input */}
                            <form onSubmit={handleCommentSubmit} className="flex gap-3 mb-5">
                                <Avatar className="w-8 h-8 border shrink-0">
                                    <AvatarImage src={(user as any)?.user?.photo || (user as any)?.photo || ""} />
                                    <AvatarFallback className="text-xs font-bold">
                                        {((user as any)?.user?.name || (user as any)?.name || "U").charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 relative flex items-center">
                                    <input
                                        type="text"
                                        value={commentText}
                                        onChange={e => setCommentText(e.target.value)}
                                        placeholder="Write a comment..."
                                        className="w-full bg-zinc-100 dark:bg-zinc-900 rounded-full py-2 pl-4 pr-10 text-sm outline-none focus:ring-2 focus:ring-blue-500/30 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 border-none transition"
                                        disabled={commentMutation.isPending}
                                    />
                                    <button
                                        type="submit"
                                        disabled={!commentText.trim() || commentMutation.isPending}
                                        className="absolute right-2 p-1.5 text-blue-500 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full transition-colors disabled:opacity-40"
                                    >
                                        {commentMutation.isPending
                                            ? <Loader2 className="w-4 h-4 animate-spin" />
                                            : <Send className="w-4 h-4" />
                                        }
                                    </button>
                                </div>
                            </form>

                            {/* Loading */}
                            {loadingComments && (
                                <div className="flex justify-center py-4">
                                    <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                                </div>
                            )}

                            {/* Comments List */}
                            <div className="space-y-4">
                                {commentsList.map((comment: any) => (
                                    <div key={comment._id || comment.id} className="flex gap-3">
                                        <Avatar className="w-8 h-8 border shrink-0">
                                            <AvatarImage src={comment.commentCreator?.photo || comment.user?.photo} />
                                            <AvatarFallback className="text-xs font-bold">
                                                {(comment.commentCreator?.name || comment.user?.name || "U").charAt(0).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <div className="bg-zinc-100 dark:bg-zinc-900 rounded-2xl px-4 py-2.5 inline-block max-w-[95%]">
                                                <span className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 block mb-0.5">
                                                    {comment.commentCreator?.name || comment.user?.name || "Anonymous"}
                                                </span>
                                                <p className="text-sm text-zinc-800 dark:text-zinc-200 break-words leading-snug">
                                                    {comment.content || comment.text || comment.body}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-3 px-2 mt-1 text-xs text-zinc-400 font-medium">
                                                <span className="cursor-pointer hover:text-blue-500 transition-colors">Like</span>
                                                <span className="cursor-pointer hover:text-blue-500 transition-colors">Reply</span>
                                                {comment.createdAt && (
                                                    <span className="font-normal">{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {!loadingComments && commentsList.length === 0 && (
                                    <p className="text-center text-sm text-zinc-400 py-3">
                                        No comments yet. Be the first!
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* ── Delete Confirmation Overlay ── */}
            {showDeleteDialog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-zinc-200 dark:border-zinc-800 animate-in fade-in zoom-in-95">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/30">
                                <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                            </div>
                            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">Delete this post?</h3>
                        </div>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 ml-[3.25rem] mb-5 leading-relaxed">
                            This action cannot be undone. The post and all its comments will be permanently deleted.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <Button variant="outline" className="rounded-full px-5" onClick={() => setShowDeleteDialog(false)}>
                                Cancel
                            </Button>
                            <Button
                                className="rounded-full px-5 bg-red-600 hover:bg-red-700 text-white gap-2"
                                onClick={() => { setShowDeleteDialog(false); deleteMutation.mutate(); }}
                            >
                                {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                Yes, delete it
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
