import axios from "axios";
import { useAuthStore } from "@/store/authStore";

const getToken = () => useAuthStore.getState().token;
const url = import.meta.env.VITE_API_URL || 'https://route-posts.routemisr.com';

export interface NotificationsParams {
    page?: number;
    limit?: number;
}

export function getNotifications(params?: NotificationsParams) {
    return axios.get(`${url}/notifications`, {
        params,
        headers: {
            Authorization: `Bearer ${getToken()}`,
        },
    });
}

export function getUnreadNotificationsCount() {
    return axios.get(`${url}/notifications/unread-count`, {
        headers: {
            Authorization: `Bearer ${getToken()}`,
        },
    });
}

export function markNotificationAsRead(notificationId: string) {
    return axios.patch(`${url}/notifications/${notificationId}/read`, {}, {
        headers: {
            Authorization: `Bearer ${getToken()}`,
        },
    });
}

export function markAllNotificationsAsRead() {
    return axios.patch(`${url}/notifications/read-all`, {}, {
        headers: {
            Authorization: `Bearer ${getToken()}`,
        },
    });
}
