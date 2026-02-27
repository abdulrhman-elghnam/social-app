import axios from "axios";
import { useAuthStore } from "@/store/authStore";

const getToken = () => useAuthStore.getState().token;
const url = import.meta.env.VITE_API_URL || 'https://route-posts.routemisr.com';

export interface FeedParams {
    only?: string;
    limit?: number;
    hasImage?: boolean;
    page?: number;
    cursor?: string;
}

export interface LikesParams {
    page?: number;
    limit?: number;
}

export function getAllPosts() {
    return axios.get(`${url}/posts`, {
        headers: {
            Authorization: `Bearer ${getToken()}`,
        },
    });
}

// Fetch posts for the current logged-in user, optionally filtered by type
// type values: "public" | "private" | "friends"
export function getUserPosts(params?: { only?: string; limit?: number; page?: number }) {
    return axios.get(`${url}/posts`, {
        params,
        headers: {
            Authorization: `Bearer ${getToken()}`,
        },
    });
}

// Fetch any user's public posts by their userId
export function getUserPostsById(userId: string, params?: { limit?: number; page?: number }) {
    return axios.get(`${url}/posts`, {
        params: { ...params, user: userId },
        headers: {
            Authorization: `Bearer ${getToken()}`,
        },
    });
}

export function getHomeFeed(params?: FeedParams) {
    return axios.get(`${url}/posts/feed`, {
        params,
        headers: {
            Authorization: `Bearer ${getToken()}`,
        },
    });
}

export function createPost(data: FormData) {
    return axios.post(`${url}/posts`, data, {
        headers: {
            Authorization: `Bearer ${getToken()}`,
            "Content-Type": "multipart/form-data",
        },
    });
}

export function getSinglePost(postId: string) {
    return axios.get(`${url}/posts/${postId}`, {
        headers: {
            Authorization: `Bearer ${getToken()}`,
        },
    });
}

export function getPostLikes(postId: string, params?: LikesParams) {
    return axios.get(`${url}/posts/${postId}/likes`, {
        params,
        headers: {
            Authorization: `Bearer ${getToken()}`,
        },
    });
}

export function updatePost(postId: string, data: FormData) {
    return axios.put(`${url}/posts/${postId}`, data, {
        headers: {
            Authorization: `Bearer ${getToken()}`,
        },
    });
}

export function deletePost(postId: string) {
    return axios.delete(`${url}/posts/${postId}`, {
        headers: {
            Authorization: `Bearer ${getToken()}`,
        },
    });
}

export function toggleLikePost(postId: string) {
    return axios.put(`${url}/posts/${postId}/like`, {}, {
        headers: {
            Authorization: `Bearer ${getToken()}`,
        },
    });
}

export function toggleBookmarkPost(postId: string) {
    return axios.put(`${url}/posts/${postId}/bookmark`, {}, {
        headers: {
            Authorization: `Bearer ${getToken()}`,
        },
    });
}

export function sharePost(postId: string, data?: any) {
    return axios.post(`${url}/posts/${postId}/share`, data || {}, {
        headers: {
            Authorization: `Bearer ${getToken()}`,
        },
    });
}
