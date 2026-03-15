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

    },

    uploadAvatar: async (file: File) => {
        const formData = new FormData();
        formData.append("avatar", file);
        return await api('/users/update_avatar', {
            method: 'post',
            data: formData,
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },

};

export default endpoints;