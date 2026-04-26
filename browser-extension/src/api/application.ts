import api from './index'

export type ApplicationPayload = {
    application: {
        id: number,
        company: string,
        position?: string,
        status: string | "Applied",
        priority: string,
        category: string,
    }
}

export type CreateApplicationPayload = {
    company: string
    position?: string
    status?: string
    priority?: string
    category?: string
    notes?: string
}

export type ApplicationCredential = {
    portal_link: string
    username: string
    password_digest: string
    status_page_link: string
}

export type Application = {
    id: number
    company: string
    position?: string
    status: string
    priority: string
    category: string
    credential: ApplicationCredential
}

const endpoints = {

    getApplications: async () => {
        const response = await api("/applications");
        return response.applications;
    },

    createApplication: async (payload: CreateApplicationPayload) => {
        const response = await api("/applications", { method: "post", data: { application: payload } });
        return response;
    },

}

export default endpoints;