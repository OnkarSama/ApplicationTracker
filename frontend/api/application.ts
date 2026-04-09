import api from './index'

export type ApplicationPayload = {
    application: {
        title: string,
        status: string | "Applied",
        priority: number,
        category: string,
        salary?: number | null,
    }
}

export type Application = {
    id: number
    title: string
    notes?: { id: number; content: string; created_at: string }[]
    status: string
    priority: number
    category: string
    salary?: number | null
    created_at: string
    updated_at: string
}

export type StatusHistory = {
    id: number
    from_status: string
    to_status: string
    change_type: "manual" | "automatic"
    created_at: string
}
const endpoints = {

    getApplications: async (q?: string) => {
        if (!q) return await api("/applications");
        return await api(`/applications?q[title_or_status_or_category_cont]=${encodeURIComponent(q)}`);
    },

    getApplicationById: async (id: number) => {
        return await api(`/applications/${id}`)
    },

    createApplication: async (payload: ApplicationPayload) => {
        return await api('/applications', {
            method: 'post',
            data: payload,
        });
    },

    updateApplication: async (id: number, payload: ApplicationPayload) => {
        return await api(`/applications/${id}`, {
            method: 'patch',
            data: payload,

        })
    },

    deleteApplication: async (id: number) => {
        return await api(`/applications/${id}`, {
            method : 'delete'
        })
    },

    syncApplications: async () => {
        return await api(`/applications/sync`, {
            method : 'post'
        })
    },

    getStatusHistories: async (id: number): Promise<StatusHistory[]> => {
        return await api(`/applications/${id}/status_histories`)
    },

}

export default endpoints;