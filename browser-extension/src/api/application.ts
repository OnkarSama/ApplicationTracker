import api from './index'

export type ApplicationPayload = {
    application: {
        id: number,
        company: string,
        position?: string,
        notes: string,
        status: string | "Applied",
        priority: string,
        category: string,
    }
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

}

export default endpoints;