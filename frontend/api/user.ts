import api from './index'

export type User = {

    id: number,
    first_name: string,
    last_name: string,
    email: string,
};

const endpoints = {

    showUsers: async () => {
        return await api('/users', {
            method: 'get'
        })
    },

    deleteUser: async () => {
        return await api('/users/', {
            method: 'delete'
        })

    }

};

export default endpoints;