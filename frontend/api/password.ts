import api from './index'

const endpoints = {
    requestReset: async (email_address: string) => {
        return await api('/passwords', {
            method: 'post',
            data: { email_address },
        })
    },

    resetPassword: async (token: string, password: string, password_confirmation: string) => {
        return await api(`/passwords/${token}`, {
            method: 'patch',
            data: { password, password_confirmation },
        })
    },
}

export default endpoints
