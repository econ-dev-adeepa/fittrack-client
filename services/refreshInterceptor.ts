import { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { logout, refreshAccessToken, saveCredentials } from "../lib/authenticate";
import keyStore from "../stores/keyStore";
import awaitable from "../lib/awaitable";
import { router } from "expo-router";

const onResponseSuccess = (response: AxiosResponse) => response;

type RetriableRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean };

// TODO: Implement queueing of requests to avoid multiple simultaneous refresh attempts
async function onResponseError(api: AxiosInstance, error: AxiosError) {
    const originalRequest = error.config as RetriableRequestConfig;
    
    if (error.response?.status !== 401 || originalRequest._retry) {
        return Promise.reject(error);
    }
    
    originalRequest._retry = true;
    const [err, newTokens] = await awaitable(refreshAccessToken(keyStore.getState().refreshToken!));

    if (err) {
        await logout();
        router.replace('/login');
        return Promise.reject(err);
    }

    saveCredentials(newTokens.accessToken, newTokens.refreshToken);
    originalRequest.headers['Authorization'] = `Bearer ${newTokens.accessToken}`;
    
    return api(originalRequest);
}

export default function setupTokenRefreshInterceptor(api: AxiosInstance) {
    api.interceptors.response.use(onResponseSuccess, error => onResponseError(api, error));
}