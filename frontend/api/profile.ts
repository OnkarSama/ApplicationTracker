import api from './index'

export type ProfilePayload = {
    applicant_profile: {
        preferred_name?: string
        contact_email?: string
        phone_number?: string
        linkedin_url?: string
        portfolio_url?: string
        bio?: string
        date_of_birth?: string
        nationality?: string
        pronouns?: string
        address_line_1?: string
        address_line_2?: string
        city?: string
        state?: string
        zip_code?: string
        country?: string
        github_url?: string
    }
}

export type WorkExperiencePayload = {
    work_experience: {
        employer: string
        job_title: string
        start_date: string
        end_date?: string
        current: boolean
        description?: string
    }
}

export type EducationPayload = {
    education: {
        institution: string
        degree: string
        area_of_study: string
        start_year: number
        end_year?: number
        gpa?: number
    }
}

interface WizardData {
    personal: {
        firstName: string
        lastName: string
        dateOfBirth: string
        nationality: string
        pronouns: string
    }
    contact: {
        email: string
        phone: string
        addressLine1: string
        addressLine2: string
        city: string
        state: string
        zip: string
        country: string
    }
    education: {
        id: string
        institution: string
        degree: string
        field: string
        startYear: string
        endYear: string
        gpa: string
    }[]
    employment: {
        id: string
        employer: string
        title: string
        startDate: string
        endDate: string
        current: boolean
        description: string
    }[]
    links: {
        linkedinUrl: string
        githubUrl: string
        portfolioUrl: string
        resumeText: string
    }
}

const endpoints = {

    getProfile: async () => {
        return await api('/applicant_profile')
    },

    updateProfile: async (wizard: WizardData) => {
        await api('/applicant_profile', {
            method: 'patch',
            data: {
                applicant_profile: {
                    preferred_name:  `${wizard.personal.firstName} ${wizard.personal.lastName}`.trim(),
                    date_of_birth:   wizard.personal.dateOfBirth   || undefined,
                    nationality:     wizard.personal.nationality    || undefined,
                    pronouns:        wizard.personal.pronouns       || undefined,
                    contact_email:   wizard.contact.email           || undefined,
                    phone_number:    wizard.contact.phone           || undefined,
                    address_line_1:  wizard.contact.addressLine1    || undefined,
                    address_line_2:  wizard.contact.addressLine2    || undefined,
                    city:            wizard.contact.city            || undefined,
                    state:           wizard.contact.state           || undefined,
                    zip_code:        wizard.contact.zip             || undefined,
                    country:         wizard.contact.country         || undefined,
                    linkedin_url:    wizard.links.linkedinUrl       || undefined,
                    github_url:      wizard.links.githubUrl         || undefined,
                    portfolio_url:   wizard.links.portfolioUrl      || undefined,
                    bio:             wizard.links.resumeText        || undefined,
                },
            } satisfies ProfilePayload,
        })

        await Promise.all(
            wizard.education.map((edu) =>
                api('/applicant_profile/educations', {
                    method: 'post',
                    data: {
                        education: {
                            institution:   edu.institution,
                            degree:        edu.degree,
                            area_of_study: edu.field,
                            start_year:    parseInt(edu.startYear) || undefined,
                            end_year:      parseInt(edu.endYear)   || undefined,
                            gpa:           parseFloat(edu.gpa)     || undefined,
                        },
                    } satisfies EducationPayload,
                })
            )
        )

        await Promise.all(
            wizard.employment.map((job) =>
                api('/applicant_profile/work_experiences', {
                    method: 'post',
                    data: {
                        work_experience: {
                            employer:    job.employer,
                            job_title:   job.title,
                            start_date:  job.startDate,
                            end_date:    job.current ? undefined : job.endDate || undefined,
                            current:     job.current,
                            description: job.description || undefined,
                        },
                    } satisfies WorkExperiencePayload,
                })
            )
        )
    },

}

export default endpoints