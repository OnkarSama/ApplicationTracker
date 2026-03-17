import axios from "axios";
import baseUrl from "@/api/baseUrl";

const axiosInstance = axios.create({
    baseURL: baseUrl,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

axiosInstance.interceptors.request.use(
    async (config) => {
        const token = await chrome.storage.local.get("jwtToken");
        config.headers.Authorization = `Bearer ${token["jwtToken"]}`;

        return config;
    },
    (error) => {
        console.error('Request Interceptor Error:', error);
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            await chrome.storage.local.remove('jwtToken')
            window.location.reload()
        }
        return Promise.reject(error)
    }
)

type ApiOptions = {
    data?: object | string | FormData;
    method?: "get" | "post" | "put" | "delete" | "patch";
    params?: object;
    headers?: Record<string, string>;
};

export const api = async (url: string, options: ApiOptions = {}) => {
    const {data, method = "get", params, headers} = options;

    try {
        const response = await axiosInstance.request({
            url,
            method,
            data,
            params,
            headers,
            responseType: "json",
        });

        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export default api;
