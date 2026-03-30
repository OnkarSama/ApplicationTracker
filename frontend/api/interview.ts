import api from './index'

export type Interview = {
    id: number
    interview_type: string
    scheduled_at: string
    notes: string | null
    created_at: string
    updated_at: string
}

export type InterviewPayload = {
    interview: {
        interview_type: string
        scheduled_at: string
        notes?: string
    }
}

const endpoints = {
    getInterviews: async (applicationId: number) => {
        return await api(`/applications/${applicationId}/interviews`)
    },

    createInterview: async (applicationId: number, payload: InterviewPayload['interview']) => {
        return await api(`/applications/${applicationId}/interviews`, {
            method: 'post',
            data: { interview: payload },
        })
    },

    deleteInterview: async (applicationId: number, interviewId: number) => {
        return await api(`/applications/${applicationId}/interviews/${interviewId}`, {
            method: 'delete',
        })
    },
}

export default endpoints
