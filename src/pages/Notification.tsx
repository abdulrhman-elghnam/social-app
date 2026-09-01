import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '@/api123/Notifications.API';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { Bell, BellDot, CheckCheck, Heart, MessageCircle, UserPlus, Share2, Loader2 } from "lucide-react";
import PageLayout from '@/components/layout/pageLayout';
import Sidebar from '@/components/layout/Sidebar';
import { cn } from '@/lib/utils';
import { toast, Toaster } from 'sonner';

const typeConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
    LIKE: {
        label: "liked your post",
        icon: <Heart className="w-3.5 h-3.5" />,
        color: "bg-red-500",
    },
    COMMENT: {
        label: "commented on your post",
        icon: <MessageCircle className="w-3.5 h-3.5" />,
        color: "bg-blue-500",
    },
    FOLLOW: {
        label: "started following you",
        icon: <UserPlus className="w-3.5 h-3.5" />,
        color: "bg-green-500",
    },
    SHARE: {
        label: "shared your post",
        icon: <Share2 className="w-3.5 h-3.5" />,
        color: "bg-purple-500",
    },
};

const Notification = () => {
    const queryClient = useQueryClient();

    const {
        data: notificationsData,
        isLoading,
        error,
    } = useQuery({
        queryKey: ['notifications'],
        queryFn: () => getNotifications({ limit: 50 }),
    });

    const markAsReadMutation = useMutation({
        mutationFn: (id: string) => markNotificationAsRead(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });

    const markAllAsReadMutation = useMutation({
        mutationFn: () => markAllNotificationsAsRead(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            toast.success("All notifications marked as read");
        },
        onError: () => toast.error("Failed to mark all as read"),
    });

    // Try multiple data shapes
    const notifications: any[] =
        notificationsData?.data?.notifications ||
        notificationsData?.data?.data?.notifications ||
        (Array.isArray(notificationsData?.data) ? notificationsData.data : []) ||
        [];

    const unreadCount = notifications.filter((n: any) => !n.isRead).length;

    return (
        <PageLayout className="max-w-6xl flex gap-6 items-start">
            <Toaster />
            <Sidebar />

            {/* Notifications Main Panel */}
            <div className="flex-1 min-w-0">
                <Card className="border-none shadow-md bg-white dark:bg-zinc-950 overflow-hidden">
                    {/* Header */}
                    <CardHeader className="flex flex-row items-center justify-between pb-4 border-b dark:border-zinc-800 sticky top-0 bg-white dark:bg-zinc-950 z-10">
                        <div>
                            <CardTitle className="text-xl flex items-center gap-2">
                                <BellDot className="w-5 h-5 text-blue-500" />
                                Notifications
                                {unreadCount > 0 && (
                                    <span className="ml-1 text-xs bg-blue-500 text-white rounded-full px-2 py-0.5 font-bold">
                                        {unreadCount}
                                    </span>
                                )}
                            </CardTitle>
                            <CardDescription className="mt-0.5 text-xs">
                                Stay updated with your activity
                            </CardDescription>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5 text-xs h-8"
                            onClick={() => markAllAsReadMutation.mutate()}
                            disabled={markAllAsReadMutation.isPending || unreadCount === 0}
                        >
                            {markAllAsReadMutation.isPending
                                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                : <CheckCheck className="w-3.5 h-3.5 text-green-500" />
                            }
                            Mark all read
                        </Button>
                    </CardHeader>

                    <CardContent className="p-0">
                        {/* Loading */}
                        {isLoading && (
                            <div className="flex flex-col items-center justify-center py-20 gap-3 text-zinc-400">
                                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                                <span className="text-sm">Loading notifications...</span>
                            </div>
                        )}

                        {/* Error */}
                        {error && !isLoading && (
                            <div className="p-8 text-center text-red-500 text-sm font-medium">
                                Failed to load notifications.
                            </div>
                        )}

                        {/* Empty */}
                        {!isLoading && !error && notifications.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-24 text-zinc-400 gap-4">
                                <div className="p-5 rounded-full bg-zinc-100 dark:bg-zinc-900">
                                    <Bell className="w-8 h-8 opacity-30" />
                                </div>
                                <div className="text-center">
                                    <h3 className="font-semibold text-base text-zinc-700 dark:text-zinc-300 mb-1">
                                        You're all caught up!
                                    </h3>
                                    <p className="text-sm">New notifications will appear here.</p>
                                </div>
                            </div>
                        )}

                        {/* Notification List */}
                        <div className="divide-y dark:divide-zinc-800/60">
                            {notifications.map((notification: any) => (
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
            </div>
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
    const isRead = !!notification.isRead;
    const author = notification.sender || notification.user || {};
    const authorName = author.name || "A user";
    const authorPhoto = author.photo || "";

    const type = (notification.type || "").toUpperCase();
    const config = typeConfig[type] || {
        label: notification.message || "interacted with you",
        icon: <Bell className="w-3.5 h-3.5" />,
        color: "bg-zinc-400",
    };

    const time = notification.createdAt
        ? formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })
        : "just now";

    return (
        <div
            onClick={() => onRead(notification._id, isRead)}
            className={cn(
                "flex gap-4 px-5 py-4 cursor-pointer transition-colors group",
                !isRead
                    ? "bg-blue-50/60 dark:bg-blue-900/10 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    : "hover:bg-zinc-50 dark:hover:bg-zinc-900/40"
            )}
        >
            {/* Avatar with type badge */}
            <div className="relative shrink-0">
                <Avatar className="w-11 h-11 border">
                    <AvatarImage src={authorPhoto} alt={authorName} />
                    <AvatarFallback>{authorName.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className={cn(
                    "absolute -bottom-0.5 -right-0.5 p-1 rounded-full text-white border-2 border-white dark:border-zinc-950",
                    config.color
                )}>
                    {config.icon}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <p className="text-sm text-zinc-800 dark:text-zinc-200 leading-snug">
                    <span className="font-semibold text-zinc-900 dark:text-white">{authorName}</span>
                    {" "}{notification.message || config.label}
                </p>
                <span className="text-xs text-blue-500 font-medium mt-1 block">{time}</span>
            </div>

            {/* Unread dot */}
            {!isRead && (
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0 self-center" />
            )}
        </div>
    );
}

export default Notification;
