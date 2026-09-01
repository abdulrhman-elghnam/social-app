import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
} from "@/api/Notifications.API";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import {
    Bell,
    BellDot,
    CheckCheck,
    Heart,
    MessageCircle,
    UserPlus,
    Share2,
    Loader2,
} from "lucide-react";
import PageLayout from "@/components/layout/pageLayout";
import Sidebar from "@/components/layout/Sidebar";
import RightSidebar from "@/components/layout/RightSidebar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const typeConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
    LIKE: {
        label: "liked your post",
        icon: <Heart className="w-3 h-3" />,
        color: "bg-red-500",
    },
    COMMENT: {
        label: "commented on your post",
        icon: <MessageCircle className="w-3 h-3" />,
        color: "bg-blue-500",
    },
    FOLLOW: {
        label: "started following you",
        icon: <UserPlus className="w-3 h-3" />,
        color: "bg-emerald-500",
    },
    SHARE: {
        label: "shared your post",
        icon: <Share2 className="w-3 h-3" />,
        color: "bg-purple-500",
    },
};

const Notification = () => {
    const queryClient = useQueryClient();
    const [filter, setFilter] = useState<"all" | "unread">("all");

    const {
        data: notificationsData,
        isLoading,
        error,
        refetch,
    } = useQuery({
        queryKey: ["notifications"],
        queryFn: () => getNotifications({ limit: 50 }),
    });

    const markAsReadMutation = useMutation({
        mutationFn: (id: string) => markNotificationAsRead(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
            queryClient.invalidateQueries({ queryKey: ["unreadNotificationsCount"] });
        },
    });

    const markAllAsReadMutation = useMutation({
        mutationFn: () => markAllNotificationsAsRead(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
            queryClient.invalidateQueries({ queryKey: ["unreadNotificationsCount"] });
            toast.success("All notifications marked as read!");
        },
        onError: () => toast.error("Failed to mark all as read"),
    });

    const raw = notificationsData?.data;
    const notifications: any[] =
        raw?.notifications ||
        raw?.data?.notifications ||
        (Array.isArray(raw?.data) ? raw.data : []) ||
        (Array.isArray(raw) ? raw : []) ||
        [];

    const unreadCount = notifications.filter((n: any) => !n.isRead).length;

    const displayedNotifications =
        filter === "unread" ? notifications.filter((n: any) => !n.isRead) : notifications;

    return (
        <PageLayout className="max-w-7xl px-4 sm:px-6 lg:px-8 py-6 flex gap-6 items-start justify-center pb-20">
            <Sidebar />

            <main className="flex-1 min-w-0 max-w-2xl w-full space-y-4">
                <Card className="border border-slate-200/80 dark:border-slate-800 shadow-xs bg-white dark:bg-slate-900 rounded-3xl overflow-hidden">
                    {/* Header */}
                    <CardHeader className="p-5 sm:p-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between gap-3">
                        <div>
                            <div className="flex items-center gap-2">
                                <CardTitle className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
                                    <BellDot className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    Notifications
                                </CardTitle>
                                {unreadCount > 0 && (
                                    <span className="px-2 py-0.5 text-xs font-bold bg-blue-600 text-white rounded-full">
                                        {unreadCount}
                                    </span>
                                )}
                            </div>
                            <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                Real-time activity and interactions from your network
                            </CardDescription>
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            className="rounded-xl h-8 px-3 text-xs font-bold gap-1.5 border-slate-200 dark:border-slate-800 shrink-0"
                            onClick={() => markAllAsReadMutation.mutate()}
                            disabled={markAllAsReadMutation.isPending || unreadCount === 0}
                        >
                            {markAllAsReadMutation.isPending ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                                <CheckCheck className="w-3.5 h-3.5 text-emerald-500" />
                            )}
                            <span className="hidden sm:inline">Mark all read</span>
                        </Button>
                    </CardHeader>

                    {/* Filter Tabs */}
                    <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/30">
                        <button
                            onClick={() => setFilter("all")}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                filter === "all"
                                    ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs"
                                    : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
                            }`}
                        >
                            All ({notifications.length})
                        </button>
                        <button
                            onClick={() => setFilter("unread")}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                filter === "unread"
                                    ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs"
                                    : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
                            }`}
                        >
                            Unread ({unreadCount})
                        </button>
                    </div>

                    <CardContent className="p-0">
                        {/* Loading State */}
                        {isLoading && (
                            <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
                                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                                <span className="text-xs font-semibold">Loading notifications...</span>
                            </div>
                        )}

                        {/* Error State */}
                        {error && !isLoading && (
                            <div className="p-8 text-center space-y-3">
                                <p className="text-sm font-semibold text-red-500">Failed to load notifications.</p>
                                <Button size="sm" onClick={() => refetch()} className="rounded-xl text-xs">
                                    Retry
                                </Button>
                            </div>
                        )}

                        {/* Empty State */}
                        {!isLoading && !error && displayedNotifications.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-20 px-4 text-center space-y-3">
                                <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                                    <Bell className="w-8 h-8" />
                                </div>
                                <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">
                                    {filter === "unread" ? "No unread notifications" : "You're all caught up!"}
                                </h3>
                                <p className="text-xs text-slate-500 max-w-xs">
                                    When people like, comment, or interact with your posts, you'll see alerts here.
                                </p>
                            </div>
                        )}

                        {/* Notification List */}
                        <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                            {displayedNotifications.map((notification: any) => (
                                <NotificationItem
                                    key={notification._id}
                                    notification={notification}
                                    onRead={(id, isRead) => {
                                        if (!isRead) markAsReadMutation.mutate(id);
                                    }}
                                />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </main>

            <RightSidebar />
        </PageLayout>
    );
};

function NotificationItem({
    notification,
    onRead,
}: {
    notification: any;
    onRead: (id: string, isRead: boolean) => void;
}) {
    const navigate = useNavigate();
    const isRead = Boolean(notification.isRead);
    const author = notification.sender || notification.user || {};
    const authorName = author.name || "A user";
    const authorPhoto = author.photo || "";
    const authorId = author._id || author.id;

    const type = (notification.type || "").toUpperCase();
    const config = typeConfig[type] || {
        label: notification.message || "interacted with your content",
        icon: <Bell className="w-3 h-3" />,
        color: "bg-slate-400",
    };

    const time = notification.createdAt
        ? formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })
        : "just now";

    return (
        <div
            onClick={() => onRead(notification._id, isRead)}
            className={cn(
                "flex items-center gap-3.5 px-5 py-4 cursor-pointer transition-colors group relative",
                !isRead
                    ? "bg-blue-50/50 dark:bg-blue-950/20 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                    : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
            )}
        >
            {/* Avatar with type badge */}
            <div
                className="relative shrink-0"
                onClick={(e) => {
                    if (authorId) {
                        e.stopPropagation();
                        navigate(`/user/${authorId}`);
                    }
                }}
            >
                <Avatar className="w-11 h-11 border border-slate-200 dark:border-slate-700 shadow-xs">
                    <AvatarImage src={authorPhoto} alt={authorName} className="object-cover" />
                    <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold text-xs">
                        {authorName.charAt(0)?.toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                <div
                    className={cn(
                        "absolute -bottom-0.5 -right-0.5 p-1 rounded-full text-white ring-2 ring-white dark:ring-slate-900 shadow-xs",
                        config.color
                    )}
                >
                    {config.icon}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-snug">
                    <span
                        onClick={(e) => {
                            if (authorId) {
                                e.stopPropagation();
                                navigate(`/user/${authorId}`);
                            }
                        }}
                        className="font-bold text-slate-900 dark:text-slate-100 hover:text-blue-600 hover:underline cursor-pointer"
                    >
                        {authorName}
                    </span>{" "}
                    <span className="text-slate-600 dark:text-slate-400">
                        {notification.message || config.label}
                    </span>
                </p>
                <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold mt-1 block">
                    {time}
                </span>
            </div>

            {/* Unread indicator */}
            {!isRead && (
                <div className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0 ring-4 ring-blue-500/20" />
            )}
        </div>
    );
}

export default Notification;
