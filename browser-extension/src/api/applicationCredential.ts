import api from './index'

export type ApplicationCredential = {
    portal_link: string
    username: string
    password_digest: string
}

const endpoints = {

    updateCredential: async (appId: number, payload: { application_credential: ApplicationCredential }) => {
        return await api(`/applications/${appId}/application_credential`, {
            method: 'patch',
            data: payload,
        });
    },

}

export default endpoints;