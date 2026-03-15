import api from './index'

export type ApplicationPayload = {
    application: {
        id: number,
        title: string,
        notes: string,
        status: string | "Applied",
        priority: number,
        category: string,
    }
}

export type Application = {
    id: number
    title: string
    notes: string
    status: string
    priority: number
    category: string
}

const endpoints = {

    getApplications: async (q?: string) => {
        if (!q) return await api("/applications");
        return await api(`/applications?q[title_or_notes_or_status_or_category_cont]=${q}`);
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
    }

}

export default endpoints;