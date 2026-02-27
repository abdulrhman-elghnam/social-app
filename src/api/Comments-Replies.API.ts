import axios from "axios";
import { useAuthStore } from "@/store/authStore";

const getToken = () => useAuthStore.getState().token;
const url = import.meta.env.VITE_API_URL || 'https://route-posts.routemisr.com';

export interface CommentsParams {
    page?: number;
    limit?: number;
}

export function getPostComments(postId: string, params?: CommentsParams) {
    return axios.get(`${url}/posts/${postId}/comments`, {
        params,
        headers: {
            Authorization: `Bearer ${getToken()}`,
        },
    });
}

// Data can be FormData (if image included) or JSON { text: "..." }
export function createComment(postId: string, data: any) {
    // Determine if data is FormData to set the correct content type automatically (axios handles this for FormData)
    return axios.post(`${url}/posts/${postId}/comments`, data, {
        headers: {
            Authorization: `Bearer ${getToken()}`,
            // If it's FormData, let Axios set Content-Type correctly,
            // otherwise 'application/json' is default
            ...(data instanceof FormData ? { "Content-Type": "multipart/form-data" } : {}),
        },
    });
}

export function getCommentReplies(postId: string, commentId: string, params?: CommentsParams) {
    return axios.get(`${url}/posts/${postId}/comments/${commentId}/replies`, {
        params,
        headers: {
            Authorization: `Bearer ${getToken()}`,
        },
    });
}

export function createReply(postId: string, commentId: string, data: any) {
    return axios.post(`${url}/posts/${postId}/comments/${commentId}/replies`, data, {
        headers: {
            Authorization: `Bearer ${getToken()}`,
            ...(data instanceof FormData ? { "Content-Type": "multipart/form-data" } : {}),
        },
    });
}

export function updateComment(postId: string, commentId: string, data: any) {
    return axios.put(`${url}/posts/${postId}/comments/${commentId}`, data, {
        headers: {
            Authorization: `Bearer ${getToken()}`,
            ...(data instanceof FormData ? { "Content-Type": "multipart/form-data" } : {}),
        },
    });
}

export function deleteComment(postId: string, commentId: string) {
    return axios.delete(`${url}/posts/${postId}/comments/${commentId}`, {
        headers: {
            Authorization: `Bearer ${getToken()}`,
        },
    });
}

export function toggleCommentLike(postId: string, commentId: string) {
    return axios.put(`${url}/posts/${postId}/comments/${commentId}/like`, {}, {
        headers: {
            Authorization: `Bearer ${getToken()}`,
        },
    });
}
