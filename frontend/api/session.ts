
import api from './index'


export type LoginPayload = {
    email: string,
    password: string
};

const endpoints = {
    createSession: async (payload: LoginPayload) => {
        return await api('/session', {
            method: 'post',
            data: payload,
        });
    },

    destroySession: async () => {
        return await api('/session', {
            method: 'delete'
        })
    },

    showUser: async () => {
        return await api('/session', {
            method: 'get'
        })
    }

};

export default endpoints;
