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
    }

};

export default endpoints;