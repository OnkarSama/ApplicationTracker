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

export type ApplicationCredential = {
    portal_link: string
    username: string
    password_digest: string
}

export type Application = {
    id: number
    title: string
    notes: string
    status: string
    priority: number
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