export type AuthStore = {
    user: User | null;
    token: string | null;
    setUser: (data: any) => void;
    removeUser: () => void;
    setToken: (data: any) => void;
    removeToken: () => void;
    updateUserIcon: (data: any) => void;
    updateUserData: (data: any) => void;
}
export type AuthResponse = {
    success: boolean
    message: string
    data: {
        token: string
        tokenType: "Bearer"
        expiresIn: string
        user: User
    }
}

export type createPost2 = {
    body: string,
    image: FormData
}

export type User = {
    _id: string;
    id?: string;
    name: string;
    username: string;
    email: string;
    photo: string;
    cover: string;
    gender?: string;
    dateOfBirth?: string;
    createdAt?: string;
    passwordChangedAt?: string;
    followersCount?: number;
    followingCount?: number;
    bookmarksCount?: number;
    bookmarks?: any[];
    followers?: any[];
    following?: any[];
};
// Auth data (inside data.data)
// type AuthData = {
//     token: string;
//     tokenType: "Bearer";
//     expiresIn: string; // e.g. "7d"
//     user: User;
// };

// Main API response data
// type ApiResponseData = {
//     success: boolean;
//     message: string;
//     data: AuthData;
// };

// Axios response schema
// type SignupResponse = {
//     data: ApiResponseData;
//     status: number; // 201
//     statusText: string; // "Created"
//     headers: {
//         "content-length": string;
//         "content-type": string;
//     };
//     config: {
//         transitional: {
//             silentJSONParsing: boolean;
//             forcedJSONParsing: boolean;
//             clarifyTimeoutError: boolean;
//             legacyInterceptorReqResOrdering: boolean;
//         };
//         adapter: string[];
//         transformRequest: (null | ((data: any) => any))[];
//         transformResponse: (null | ((data: any) => any))[];
//         timeout: number;
//         xsrfCookieName: string;
//         xsrfHeaderName: string;
//         maxContentLength: number;
//         maxBodyLength: number;
//         env: Record<string, unknown>;
//         headers: {
//             Accept: string;
//             "Content-Type": string;
//         };
//         method: "post";
//         url: string;
//         data: string; // JSON string
//         allowAbsoluteUrls: boolean;
//     };
//     request: Record<string, unknown>;
// };


export type changePasswordType = {
    password: string;
    newPassword: string;
}