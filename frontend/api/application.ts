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

const endpoints = {

    getApplications: async () => {
        return await api('/applications')
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