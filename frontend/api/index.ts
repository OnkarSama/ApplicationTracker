
import axios from "axios";
import baseUrl from "@/api/baseUrl";

const axiosInstance = axios.create({
    baseURL: baseUrl,
    timeout: 10000,
    withCredentials: true,
});

type ApiOptions = {
    data?: object | string;
    method?: "get" | "post" | "put" | "delete" | "patch";
    params?: object;
};

export const api = async (url: string, options: ApiOptions = {}) => {
    const { data, method = "get", params } = options;

    try {
        const response = await axiosInstance.request({
            url,
            method,
            data,
            params,
            responseType: "json",
        });

        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export default api;
