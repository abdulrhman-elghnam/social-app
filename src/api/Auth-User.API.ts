

import { useAuthStore } from "@/store/authStore";
import type { changePasswordType } from "@/types/user.type";
import type { UserDataTypeModified, UserLoginType } from "@/types/validation";
import axios from "axios";

const getToken = () => useAuthStore.getState().token;
const url = import.meta.env.VITE_API_URL || "https://route-posts.routemisr.com";
export function setSignUp(data: UserDataTypeModified) {
    return axios.post(`${url}/users/signup`, data, {
        headers: {
            'Content-Type': 'application/json'
        }
    })
}

export function setLogin(data: UserLoginType) {
    return axios.post(`${url}/users/signin`, data, {
        headers: {
            'Content-Type': 'application/json'
        }
    })
}

export function changPassword(data: changePasswordType) {
    return axios.patch(`${url}/users/change-password`, data, {
        headers: {
            Authorization: `Bearer ${getToken()}`,
            "Content-Type": "application/json",
        },
    })
}

export function changeUserIcon(data: FormData) {
    return axios.put(`${url}/users/upload-photo`, data, {
        headers: {
            Authorization: `Bearer ${getToken()}`,
        },
    })
}

export async function getMyUserProfile() {
    return await axios.get(`${url}/users/profile-data`, {
        headers: {
            Authorization: `Bearer ${getToken()}`,
        },
    })
}

export interface SuggestionsParams {
    page?: number;
    limit?: number;
}

export function getUserSuggestions(params?: SuggestionsParams) {
    return axios.get(`${url}/users/suggestions`, {
        params,
        headers: {
            Authorization: `Bearer ${getToken()}`,
        },
    });
}