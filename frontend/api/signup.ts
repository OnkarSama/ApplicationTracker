import api from './index'
import {LoginPayload} from "@/api/session";

export type SignupPayload = {
    user: {
        first_name: string,
        last_name: string,
        email_address: string,
        password: string,
        password_confirmation : string,
    }
};

const endpoints = {

    createUser: async (payload: SignupPayload) => {
        return await api('/signup', {
            method: 'post',
            data: payload,
        });
    },

}

export default endpoints;
