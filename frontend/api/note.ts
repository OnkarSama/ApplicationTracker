import api from './index'

export type Note = {
    id: number
    content: string
    created_at: string
    updated_at: string
}

export type NotePayload = {
    note: {
        content: string
    }
}

const endpoints = {
    getNotes: async (applicationId: number) => {
        return await api(`/applications/${applicationId}/notes`)
    },

    createNote: async (applicationId: number, content: string) => {
        const payload: NotePayload = { note: { content } }
        return await api(`/applications/${applicationId}/notes`, {
            method: 'post',
            data: payload
        })
    },

    updateNote: async (applicationId: number, noteId: number, content: string) => {
        const payload: NotePayload = { note: { content } }
        return await api(`/applications/${applicationId}/notes/${noteId}`, {
            method: 'patch',
            data: payload
        })
    },

    deleteNote: async (applicationId: number, noteId: number) => {
        return await api(`/applications/${applicationId}/notes/${noteId}`, {
            method: 'delete'
        })
    }
}

export default endpoints