import { useState, useEffect, useCallback, useRef } from 'react'
import type { Application } from '@/api/application.ts'

// ── helpers ──────────────────────────────────────────────────────────────────

const PENDING_LOGIN_KEY = '_crx_pending_login'

// Selectors for common job application form fields (ordered: most-specific → broadest)
const FIELD_SELECTORS = {
    firstName:  [
        'input[autocomplete="given-name"]',
        'input[id="first_name"]',
        'input[name="first_name"]',
        'input[name="firstName"]',
        'input[id="firstName"]',
        'input[name*="[first_name]"]',
        'input[aria-label="First Name" i]',
        'input[aria-label*="first name" i]',
        'input[name*="first" i]:not([name*="password" i]):not([name*="last" i])',
        'input[id*="first" i]:not([id*="last" i])',
        'input[placeholder*="first name" i]',
    ],
    lastName:   [
        'input[autocomplete="family-name"]',
        'input[id="last_name"]',
        'input[name="last_name"]',
        'input[name="lastName"]',
        'input[id="lastName"]',
        'input[name*="[last_name]"]',
        'input[aria-label="Last Name" i]',
        'input[aria-label*="last name" i]',
        'input[aria-label*="surname" i]',
        'input[name*="last" i]:not([name*="password" i]):not([name*="class" i])',
        'input[id*="last" i]:not([id*="class" i])',
        'input[placeholder*="last name" i]',
    ],
    email:      [
        'input[autocomplete="email"]',
        'input[type="email"]',
        'input[id="email"]',
        'input[name="email"]',
        'input[aria-label="Email" i]',
        'input[aria-label*="email address" i]',
        'input[name*="[email]"]',
        'input[name*="email" i]',
        'input[id*="email" i]',
    ],
    phone:      [
        'input[autocomplete="tel"]',
        'input[type="tel"]',
        'input[id="phone"]',
        'input[name="phone"]',
        'input[aria-label="Phone" i]',
        'input[aria-label*="phone number" i]',
        'input[aria-label*="mobile" i]',
        'input[name*="[phone]"]',
        'input[name*="phone" i]',
        'input[id*="phone" i]',
        'input[placeholder*="phone" i]',
    ],
    linkedin:   [
        'input[aria-label="LinkedIn Profile" i]',
        'input[aria-label*="linkedin" i]',
        'input[name*="linkedin" i]',
        'input[id*="linkedin" i]',
        'input[placeholder*="linkedin" i]',
    ],
    github:     [
        'input[aria-label="GitHub" i]',
        'input[aria-label*="github" i]',
        'input[name*="github" i]',
        'input[id*="github" i]',
        'input[placeholder*="github" i]',
    ],
    portfolio:  [
        'input[aria-label="Website" i]',
        'input[aria-label*="portfolio" i]',
        'input[aria-label*="personal website" i]',
        'input[aria-label*="personal site" i]',
        'input[name*="portfolio" i]',
        'input[name*="personal_url" i]',
        'input[name*="website" i]:not([name*="company" i])',
        'input[id*="website" i]:not([id*="company" i])',
        'input[placeholder*="portfolio" i]',
        'input[placeholder*="personal website" i]',
    ],
    addressLine1:    [
        'input[autocomplete="street-address"]',
        'input[aria-label*="street address" i]',
        'input[aria-label*="address line 1" i]',
        'input[name="address"]',
        'input[id="address"]',
        'input[name*="address_line_1" i]',
        'input[name*="address1" i]',
        'input[id*="address1" i]',
        'input[name*="street" i]',
        'input[placeholder*="street address" i]',
        'input[id="address--addressLine1"]'
    ],
    addressLine2:    [
        'input[aria-label*="address line 2" i]',
        'input[name*="address_line_2" i]',
        'input[name*="address2" i]',
        'input[id*="address2" i]',
        'input[id="address--addressLine2"]'
    ],
    city:       [
        'input[autocomplete="address-level2"]',
        'input[aria-label="City" i]',
        'input[name="city"]',
        'input[id="city"]',
        'input[name*="[city]"]',
        'input[name*="city" i]',
        'input[id*="city" i]',
    ],
    state:      [
        'input[autocomplete="address-level1"]',
        'input[aria-label="State" i]',
        'input[aria-label*="province" i]',
        'input[name="state"]',
        'input[id="state"]',
        'input[name*="[state]"]',
        'input[name*="state" i]:not([type="hidden"])',
        'input[id*="state" i]:not([type="hidden"])',
    ],
    zip:        [
        'input[autocomplete="postal-code"]',
        'input[aria-label*="zip" i]',
        'input[aria-label*="postal" i]',
        'input[name="zip"]',
        'input[id="zip"]',
        'input[name*="zip_code" i]',
        'input[name*="postal" i]',
        'input[name*="zip" i]',
        'input[id*="zip" i]',
    ],
    country:    [
        'input[autocomplete="country-name"]',
        'input[aria-label="Country" i]',
        'input[name="country"]',
        'input[id="country"]',
        'input[name*="country" i]',
        'input[id*="country" i]',
    ],
    // Combined full-name field used by Ashby and similar ATS platforms
    fullName:   [
        'input[autocomplete="name"]',
        'input[id="_systemfield_name"]',
        'input[name="_systemfield_name"]',
        'input[aria-label="Full Name" i]',
        'input[aria-label="Name" i]',
        'input[name="name"]:not([name*="company" i])',
        'input[id="name"]:not([id*="company" i])',
        'input[placeholder*="full name" i]',
        'input[aria-label*="full name" i]',
    ],
    preferredName: [
        'input[aria-label="Preferred Name"]',

    ],
    jobTitle: [
        'input[id="workExperience-i--jobTitle"]',
        'input[name="jobTitle"]'
    ],
    company: [
        'input[id="workExperience-i--companyName"]',
        'input[name="companyName"]'
    ],
    location: [
        'input[id="workExperience-i--location"]',
        'input[name="location"]'
    ],
    roleDescription: [
        '[data-automation-id="formField-roleDescription"] textarea'
    ],
    schoolName: [
        'input[id="workExperience-i--schoolName"]',
        'input[name="schoolName"]'
    ],
    fieldOfStudy: [
        'input[id="education-i--fieldOfStudy"]',
        'input[name="fieldOfStudy"]',
        '[data-automation-id="formField-fieldOfStudy"] input[placeholder="Search"]'
    ],
    gradePointAverage: [
        'input[id="workExperience-i--gradePointAverage"]',
        'input[name="gradeAverage"]',
    ],
    workStartMonth: [
        '[data-automation-id="formField-startDate"] [data-automation-id="dateSectionMonth-input"]',
    ],
    workStartYear: [
        '[data-automation-id="formField-startDate"] [data-automation-id="dateSectionYear-input"]',
    ],
    workEndMonth: [
        '[data-automation-id="formField-endDate"] [data-automation-id="dateSectionMonth-input"]',
    ],
    workEndYear: [
        '[data-automation-id="formField-endDate"] [data-automation-id="dateSectionYear-input"]',
    ],
    educationStartYear: [
        '[data-automation-id="formField-firstYearAttended"] [data-automation-id="dateSectionYear-input"]',
    ],
    educationEndYear: [
        '[data-automation-id="formField-lastYearAttended"] [data-automation-id="dateSectionYear-input"]',

    ]

}

const ACTION_SELECTORS = {

    workExperiences: [
        '[aria-labelledby="Work-Experience-section"] button[data-automation-id="add-button"]'

    ],
    educations: [
        '[aria-labelledby="Education-section"] button[data-automation-id="add-button"]',
    ],

}

const DROPDOWN_SELECTORS = {

    state:      [
        'button[name="countryRegion"]',
        'button[id="address--countryRegion"]',
        'button[aria-label*="state" i]',
    ],
    country:    [
        'button[name="country"]',
        'button[id="country--country"]',
        'button[aria-label*="country" i]',

    ],
    degree: [
        'button[aria-label="Degree Select One Required"]',
        'button[name="degree"]',
    ]
}

const CHECKBOX_SELECTORS = {

    currentPosition: [
        'input[type="checkbox"][name="currentlyWorkHere"]'
    ]
}

// Native setter bypasses React's synthetic event system so onChange fires correctly
const nativeInputSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set
const nativeTextareaSetter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set


function fillField(selectors: string[], value: string | undefined) {
    if (!value) return
    for (const selector of selectors) {
        const el = document.querySelector<HTMLInputElement>(selector)
        if (!el || el.type === 'hidden' || el.disabled || el.readOnly) continue


        const isTextarea = el instanceof HTMLTextAreaElement
        if (isTextarea ? nativeTextareaSetter : nativeInputSetter) {
            (isTextarea ? nativeTextareaSetter : nativeInputSetter)!.call(el, value)
        } else {
            el.value = value
        }
        el.dispatchEvent(new Event('input',  { bubbles: true }))
        el.dispatchEvent(new Event('change', { bubbles: true }))
        el.dispatchEvent(new Event('blur',   { bubbles: true }))
        return  // stop at first match
    }
}

function fillCustomDropdown(selectors: string[], value: string | undefined) {
    if (!value) return
    for (const selector of selectors) {
        const el = document.querySelector<HTMLInputElement>(selector)
        if (!el || el.type === 'hidden' || el.disabled || el.readOnly) continue

        el.click()

        setTimeout(() => {
                let liElement = Array.from(document.querySelectorAll('li[role="option"]')).find(li => li.textContent?.trim().toLowerCase() === value.trim().toLowerCase())
                if (!liElement) {
                    liElement = Array.from(document.querySelectorAll('li[role="option"]')).find(li => li.textContent?.trim().toLowerCase().replace(/'/g, '') === value.trim().toLowerCase().replace(/'/g, ''))
                }
                liElement?.click()
            }
        ,500)
    }
}

function fillCheckbox(selectors: string[], isCurrent: boolean) {
    for (const selector of selectors) {
        const el = document.querySelector<HTMLInputElement>(selector)
        if (!el || el.type === 'hidden' || el.disabled || el.readOnly) continue

        if(isCurrent) {
            el.click()
        }
    }
}


function fillActionSelector(selectors: string[], profile: any, isWorkExperiences: boolean) {
    for (const selector of selectors) {
        const el = document.querySelector<HTMLInputElement>(selector)
        if (!el || el.type === 'hidden' || el.disabled || el.readOnly) continue

        el.click()

        setTimeout(() => {
            if (isWorkExperiences) {
                fillField(FIELD_SELECTORS.jobTitle, profile.work_experiences[0]?.job_title)
                fillField(FIELD_SELECTORS.company, profile.work_experiences[0]?.employer)
                fillField(FIELD_SELECTORS.location, profile.work_experiences[0]?.location)

                const startDate = profile.work_experiences[0]?.start_date.split("-")
                fillField(FIELD_SELECTORS.workStartMonth, startDate[1])
                fillField(FIELD_SELECTORS.workStartYear, startDate[0])

                const isCurrent = profile.work_experiences[0]?.current

                if (isCurrent) {
                    fillCheckbox(CHECKBOX_SELECTORS.currentPosition, isCurrent)
                } else {
                    const endDate = profile.work_experiences[0]?.end_date.split("-")
                    fillField(FIELD_SELECTORS.workEndMonth, endDate[1])
                    fillField(FIELD_SELECTORS.workEndYear, endDate[0])
                }

                fillField(FIELD_SELECTORS.roleDescription, profile.work_experiences[0]?.description)
                console.log(profile.work_experiences[0]?.description)


            } else {
                fillField(FIELD_SELECTORS.schoolName, profile.educations[0]?.institution)
                fillCustomDropdown(DROPDOWN_SELECTORS.degree, profile.educations[0]?.degree)
                fillField(FIELD_SELECTORS.fieldOfStudy, profile.educations[0]?.area_of_study)
                fillField(FIELD_SELECTORS.gradePointAverage, profile.educations[0]?.gpa)

                fillField(FIELD_SELECTORS.educationStartYear, profile.educations[0]?.start_year)
                fillField(FIELD_SELECTORS.educationEndYear, profile.educations[0]?.end_year)


            }

        }, 500)


    }
}


function queryAny(selectorList: string[]): Element | null {
    for (const s of selectorList) {
        const el = document.querySelector(s)
        if (el) return el
    }
    return null
}

function detectAppForm(): boolean {
    const hasName = !!(
        queryAny(FIELD_SELECTORS.firstName) ||
        queryAny(FIELD_SELECTORS.lastName)  ||
        queryAny(FIELD_SELECTORS.fullName)
    )
    const hasContact = !!(
        queryAny(FIELD_SELECTORS.email) ||
        queryAny(FIELD_SELECTORS.phone) ||
        queryAny(FIELD_SELECTORS.city)
    )
    return hasName && hasContact
}

function getPasswordInput(): HTMLInputElement | null {

    const el = document.querySelector<HTMLInputElement>('input[type="password"]')

    if (!el || el.type === 'hidden' || el.disabled || el.readOnly) {
        return null
    }

    return el
}

function getUsernameInput(passwordInput: HTMLInputElement): HTMLInputElement | null {
    return (
        document.querySelector<HTMLInputElement>('input[type="email"]') ??
        document.querySelector<HTMLInputElement>('input[name*="email"]') ??
        document.querySelector<HTMLInputElement>('input[name*="user"]') ??
        document.querySelector<HTMLInputElement>('input[id*="email"]') ??
        document.querySelector<HTMLInputElement>('input[id*="user"]') ??
        document.querySelector<HTMLInputElement>('input[data-automation-id="email"]') ??
        (passwordInput.previousElementSibling instanceof HTMLInputElement
            ? passwordInput.previousElementSibling
            : null)
    )
}

function fillInputs(
    usernameInput: HTMLInputElement | null,
    passwordInput: HTMLInputElement,
    app: Application
) {
    if (usernameInput && app.credential.username) {
        usernameInput.value = app.credential.username
        usernameInput.dispatchEvent(new Event('input',  { bubbles: true }))
        usernameInput.dispatchEvent(new Event('change', { bubbles: true }))
    }
    passwordInput.value = app.credential.password_digest
    passwordInput.dispatchEvent(new Event('input',  { bubbles: true }))
    passwordInput.dispatchEvent(new Event('change', { bubbles: true }))
}

function hostnameMatches(app: Application): boolean {
    if (!app.credential?.portal_link) return false
    try {
        return new URL(app.credential.portal_link).hostname === window.location.hostname
    } catch {
        return false
    }
}

// ── shared button style helpers ───────────────────────────────────────────────

const pillBase: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '9px 15px',
    borderRadius: '24px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 600,
    letterSpacing: '0.01em',
    transition: 'transform 0.15s, box-shadow 0.15s',
    whiteSpace: 'nowrap',
}

// ── component ─────────────────────────────────────────────────────────────────

type PickerMode = 'fill' | 'save' | 'status_page' | 'save_application'
type SaveStatus = 'saving' | 'saved' | 'error'
type ProfileFillStatus = 'idle' | 'filling' | 'done' | 'error'

function guessCompany(): string {
    const hostname = window.location.hostname
    const stripped = hostname.replace(/^(www|careers|jobs|apply|talent|recruiting|work|hire)\./i, '')
    const name = stripped.split('.')[0]
    return name.charAt(0).toUpperCase() + name.slice(1)
}

function guessPosition(): string {
    const h1 = document.querySelector('h1')?.textContent?.trim()
    if (h1 && h1.length < 100) return h1
    const title = document.title
    const atMatch = title.match(/^(.+?)\s+(?:at|@|-|–|\|)\s+/i)
    if (atMatch) return atMatch[1].trim()
    return ''
}

export default function FillOverlay() {
    const [apps, setApps]                 = useState<Application[]>([])
    const [formDetected, setFormDetected] = useState(false)
    const [appFormDetected, setAppFormDetected] = useState(false)
    const [autoFilled, setAutoFilled]     = useState(false)
    const [showPicker, setShowPicker]     = useState(false)
    const [pendingStatusPageSave, setPendingStatusPageSave] = useState<boolean>(false)
    const [pickerMode, setPickerMode]     = useState<PickerMode>('fill')
    const [saveState, setSaveState]       = useState<Record<number, SaveStatus>>({})
    const [profileFillStatus, setProfileFillStatus] = useState<ProfileFillStatus>('idle')
    const [capturedLogin, setCapturedLogin] = useState<{ username: string; password: string } | null>(null)
    const [appSaveForm, setAppSaveForm]   = useState({ company: '', position: '', status: 'Applied', saveStatus: 'idle' as 'idle' | 'saving' | 'saved' | 'error' })
    const currentUrl = useRef(window.location.href)
    const fillableApps = apps.filter(a => hostnameMatches(a) && !!a.credential?.username)
    const savableApps = apps.filter(a => guessCompany().toLowerCase() === a.company.toLowerCase())
    const savableStatusApps = apps.filter(a => hostnameMatches(a) && !a.credential?.status_page_link )

    // ── fill: write saved credentials into the form ──────────────────────────
    const doFill = useCallback((app: Application) => {
        const pwInput = getPasswordInput()
        if (!pwInput) return
        fillInputs(getUsernameInput(pwInput), pwInput, app)
        setAutoFilled(true)
        setShowPicker(false)
    }, [])

    // ── fill profile: write saved profile data into the application form ─────
    const doFillProfile = useCallback(() => {
        setProfileFillStatus('filling')
        chrome.runtime.sendMessage({ type: 'FETCH_PROFILE' }, (res) => {
            const profile = res?.profile?.applicant_profile ?? res?.profile
            if (!profile) { setProfileFillStatus('error'); return }

            const firstName = profile.first_name ?? profile.preferred_name?.split(' ')[0] ?? ''
            const lastName  = profile.last_name  ?? profile.preferred_name?.split(' ').slice(1).join(' ') ?? ''

            const hasFirst = !!queryAny(FIELD_SELECTORS.firstName)
            const hasLast  = !!queryAny(FIELD_SELECTORS.lastName)

            if (hasFirst || hasLast) {
                fillField(FIELD_SELECTORS.firstName, firstName)
                fillField(FIELD_SELECTORS.lastName,  lastName)
            } else {
                // Ashby / combined-name ATS
                fillField(FIELD_SELECTORS.fullName, `${firstName} ${lastName}`.trim())
            }
            fillField(FIELD_SELECTORS.email,      profile.contact_email)
            fillField(FIELD_SELECTORS.phone,      profile.phone_number)
            fillField(FIELD_SELECTORS.linkedin,   profile.linkedin_url)
            fillField(FIELD_SELECTORS.github,     profile.github_url)
            fillField(FIELD_SELECTORS.portfolio,  profile.portfolio_url)
            fillField(FIELD_SELECTORS.addressLine1,    profile.address_line_1)
            fillField(FIELD_SELECTORS.addressLine2,    profile.address_line_2)
            fillField(FIELD_SELECTORS.city,       profile.city)
            fillField(FIELD_SELECTORS.state,      profile.state)
            fillCustomDropdown(DROPDOWN_SELECTORS.state, profile.state)
            fillField(FIELD_SELECTORS.zip,        profile.zip_code)
            fillField(FIELD_SELECTORS.country,    profile.country)
            fillCustomDropdown(DROPDOWN_SELECTORS.country, profile.country)
            fillField(FIELD_SELECTORS.preferredName,     profile.preferred_name)
            fillActionSelector(ACTION_SELECTORS.workExperiences, profile, true)
            fillActionSelector(ACTION_SELECTORS.educations, profile, false)

            setProfileFillStatus('idle')
        })
    }, [])

    // ── save status page: save current URL as status_page_link ──────────────
    const doSaveStatusPage = useCallback((app: Application) => {
        setSaveState(s => ({ ...s, [app.id]: 'saving' }))
        chrome.runtime.sendMessage({
            type: 'SAVE_PORTAL',
            appId: app.id,
            credential: { status_page_link: currentUrl.current },
        }, (res) => {
            setSaveState(s => ({ ...s, [app.id]: res?.success ? 'saved' : 'error' }))
            if(res?.success) {
                sessionStorage.removeItem(PENDING_LOGIN_KEY)
                setPendingStatusPageSave(false)
            }
        })
    }, [])

    // ── save application: create a new application in the tracker ────────────
    const doSaveApplication = useCallback(() => {
        setAppSaveForm(f => ({ ...f, saveStatus: 'saving' }))
        chrome.runtime.sendMessage({
            type: 'CREATE_APPLICATION',
            payload: {
                company:  appSaveForm.company,
                position: appSaveForm.position,
                status:   appSaveForm.status,
            },
        }, (res) => {
            setAppSaveForm(f => ({ ...f, saveStatus: res?.success ? 'saved'  : 'error' }))
        })
    }, [appSaveForm.company, appSaveForm.position, appSaveForm.status])

    // ── save login: use form values if available, fall back to captured ───────
    const doSaveLogin = useCallback((app: Application) => {
        const pwInput   = getPasswordInput()
        const userInput = pwInput ? getUsernameInput(pwInput) : null
        const username  = userInput?.value?.trim() || capturedLogin?.username || ''
        const password  = pwInput?.value           || capturedLogin?.password || ''

        setSaveState(s => ({ ...s, [app.id]: 'saving' }))
        const credential = {
            portal_link:     currentUrl.current,
            username,
            password_digest: password,
        }
        chrome.runtime.sendMessage({ type: 'SAVE_PORTAL', appId: app.id, credential }, (res) => {
            setSaveState(s => ({ ...s, [app.id]: res?.success ? 'saved' : 'error' }))
        })
    }, [capturedLogin])


    // ── form detection, autofill, submit capture ──────────────────────────────
    useEffect(() => {
        let observer: MutationObserver | null = null
        let didFill = false

        // Check sessionStorage for credentials captured on the previous page's login form
        try {
            const stored = sessionStorage.getItem(PENDING_LOGIN_KEY)
            if (stored) {
                const { domain, username, password } = JSON.parse(stored)
                if (domain === window.location.hostname) {
                    if (!getPasswordInput()){
                        setCapturedLogin({ username, password })
                        setPickerMode('status_page')
                        setShowPicker(true)
                        setPendingStatusPageSave(true)

                    }
                }

            }
        } catch {}

        // Detect application form fields (name + contact = job app form)
        const appFormObserver = new MutationObserver(() => {
            if (detectAppForm()) {
                setAppFormDetected(true)
                attachAppFormSubmitListeners()
                appFormObserver.disconnect()
            }
        })
        if (detectAppForm()) {
            setAppFormDetected(true)
            attachAppFormSubmitListeners()
        } else {
            appFormObserver.observe(document.body, { childList: true, subtree: true })
        }

        function attachAppFormSubmitListeners() {
            document.querySelectorAll('form').forEach(form => {
                if (form.dataset.crxAppListening) return
                form.dataset.crxAppListening = '1'
                form.addEventListener('submit', () => {
                    setAppSaveForm({
                        company: guessCompany(),
                        position: guessPosition(),
                        status: 'Applied',
                        saveStatus: 'idle',
                    })
                    setPickerMode('save_application')
                    setShowPicker(true)
                })
            })
        }

        async function init() {
            const response = await chrome.runtime.sendMessage({ type: 'FETCH_APPS' })
            const fetchedApps: Application[] = response?.apps ?? []
            setApps(fetchedApps)

            const savableStatusApps = fetchedApps.filter(a => hostnameMatches(a) && !a.credential?.status_page_link)
            if (savableStatusApps.length === 0) setPendingStatusPageSave(false)


            function tryAutoFill(): 'filled' | 'no-match' | 'no-form' {
                const pwInput = getPasswordInput()
                if (!pwInput) return 'no-form'

                // Attach submit listener to capture credentials before redirect
                const formEl = pwInput.closest('form')
                if (formEl && !formEl.dataset.crxListening) {
                    formEl.dataset.crxListening = '1'
                    formEl.addEventListener('submit', () => {
                        const pw   = getPasswordInput()
                        const user = pw ? getUsernameInput(pw) : null
                        try {
                            sessionStorage.setItem(PENDING_LOGIN_KEY, JSON.stringify({
                                domain:   window.location.hostname,
                                username: user?.value?.trim() ?? '',
                                password: pw?.value ?? '',
                            }))
                        } catch {}
                    })
                }

                const matched = fetchedApps.find(hostnameMatches)
                if (matched) {
                    fillInputs(getUsernameInput(pwInput), pwInput, matched)
                    didFill = true
                    setAutoFilled(true)
                    setFormDetected(true)
                    return 'filled'
                }

                setFormDetected(true)
                return 'no-match'
            }

            const result = tryAutoFill()
            if (result === 'filled') return

            observer = new MutationObserver(() => {
                if (didFill) { observer?.disconnect(); return }
                const r = tryAutoFill()
                if (r === 'filled') observer?.disconnect()
            })
            observer.observe(document.body, { childList: true, subtree: true })
        }

        init()
        return () => {
            observer?.disconnect()
            appFormObserver.disconnect()
        }
    }, [])


    if (!formDetected && !appFormDetected && !pendingStatusPageSave) return null

    const openPicker = (mode: PickerMode) => {
        setSaveState({})
        setPickerMode(mode)
        setShowPicker(true)
    }

    return (
        <div style={{ position: 'relative', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            {!showPicker ? (
                // ── pill buttons ─────────────────────────────────────────────
                <div style={{ display: 'flex', gap: '8px', flexDirection: 'column', alignItems: 'flex-end' }}>

                    {/* Autofill profile — shown when application form fields detected */}
                    {appFormDetected && (
                        <button
                            onClick={doFillProfile}
                            disabled={profileFillStatus === 'filling' || profileFillStatus === 'done'}
                            style={{
                                ...pillBase,
                                background: profileFillStatus === 'done'
                                    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                                    : profileFillStatus === 'error'
                                    ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                                    : 'linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)',
                                color: '#fff',
                                boxShadow: '0 4px 18px rgba(99,102,241,0.5)',
                                opacity: profileFillStatus === 'filling' ? 0.7 : 1,
                                cursor: profileFillStatus === 'filling' || profileFillStatus === 'done' ? 'default' : 'pointer',
                            }}
                            onMouseEnter={e => {
                                if (profileFillStatus === 'idle') {
                                    e.currentTarget.style.transform = 'translateY(-2px)'
                                    e.currentTarget.style.boxShadow = '0 6px 24px rgba(99,102,241,0.6)'
                                }
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = 'translateY(0)'
                                e.currentTarget.style.boxShadow = '0 4px 18px rgba(99,102,241,0.5)'
                            }}
                        >
                            {profileFillStatus === 'filling' ? '⏳ Filling…'
                             : profileFillStatus === 'done'    ? '✓ Profile filled'
                             : profileFillStatus === 'error'   ? '✗ Error'
                             : '✨ Autofill profile'}
                        </button>
                    )}

                    {/* Save login — only shown when login form is on page */}
                    {formDetected  && savableApps.length > 0 &&(
                        <button
                            onClick={() => openPicker('save')}
                            style={{
                                ...pillBase,
                                background: 'linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)',
                                color: '#fff',
                                boxShadow: '0 4px 18px rgba(99,102,241,0.5)',
                            }}

                            onMouseEnter={e => {
                                e.currentTarget.style.transform = 'translateY(-2px)'
                                e.currentTarget.style.boxShadow = '0 6px 24px rgba(99,102,241,0.6)'
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = 'translateY(0)'
                                e.currentTarget.style.boxShadow = '0 4px 18px rgba(99,102,241,0.5)'
                            }}
                        >
                            💾 Save login
                        </button>

                    ) }

                    {!formDetected  && savableStatusApps.length > 0 &&(
                        <button
                            onClick={() => openPicker('status_page')}
                            style={{
                                ...pillBase,
                                background: 'linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)',
                                color: '#fff',
                                boxShadow: '0 4px 18px rgba(99,102,241,0.5)',
                            }}

                            onMouseEnter={e => {
                                e.currentTarget.style.transform = 'translateY(-2px)'
                                e.currentTarget.style.boxShadow = '0 6px 24px rgba(99,102,241,0.6)'
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = 'translateY(0)'
                                e.currentTarget.style.boxShadow = '0 4px 18px rgba(99,102,241,0.5)'
                            }}
                        >
                            💾 Save Staus Page
                        </button>

                    ) }


                    {/* Fill credentials — only shown when not yet autofilled */}
                    {formDetected && !autoFilled && fillableApps.length !== 0 &&(
                        <button
                            onClick={() => openPicker('fill')}
                            style={{
                                ...pillBase,
                                background: '#fff',
                                color: '#6366f1',
                                border: '1.5px solid #6366f1',
                                boxShadow: '0 2px 10px rgba(99,102,241,0.2)',
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.transform = 'translateY(-2px)'
                                e.currentTarget.style.background = '#f5f3ff'
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = 'translateY(0)'
                                e.currentTarget.style.background = '#fff'
                            }}
                        >
                            🔑 Fill credentials
                        </button>
                    )}
                </div>
            ) : (
                // ── picker card ───────────────────────────────────────────────
                <div style={{
                    background: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '14px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
                    width: '260px',
                    overflow: 'hidden',
                    fontSize: '13px',
                }}>
                    {/* header */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '11px 14px',
                        borderBottom: '1px solid #f3f4f6',
                        background: pickerMode === 'save' ? '#f5f3ff' : '#fff',
                    }}>
                        <span style={{ fontWeight: 700, color: '#111827' }}>
                            {pickerMode === 'save' ? '💾 Save login to…' : pickerMode === 'status_page' ? '📍 Save status page for…' : pickerMode === 'save_application' ? '📋 Save application' : '🔑 Fill credentials from…'}
                        </span>
                        <button
                            onClick={() => setShowPicker(false)}
                            style={{
                                background: 'none', border: 'none', cursor: 'pointer',
                                color: '#9ca3af', fontSize: '18px', lineHeight: '1', padding: '0 2px',
                            }}
                        >
                            ×
                        </button>
                    </div>

                    {/* mode hint */}
                    {(pickerMode === 'save' || pickerMode === 'status_page') && (
                        <div style={{
                            padding: '8px 14px',
                            background: '#faf5ff',
                            borderBottom: '1px solid #f3f4f6',
                            color: '#7c3aed',
                            fontSize: '11px',
                        }}>
                            {pickerMode === 'status_page'
                                ? `Saves ${window.location.hostname} as the status page URL`
                                : capturedLogin
                                    ? 'Saving credentials from your recent login'
                                    : 'Saves what you\'ve typed in the form + this page URL'}
                        </div>
                    )}

                    {/* save application form */}
                    {pickerMode === 'save_application' && (
                        <div style={{ padding: '14px' }}>
                            {(['company', 'position'] as const).map(field => (
                                <div key={field} style={{ marginBottom: '10px' }}>
                                    <label style={{ display: 'block', fontSize: '10px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', marginBottom: '4px' }}>
                                        {field === 'company' ? 'Company *' : 'Position'}
                                    </label>
                                    <input
                                        value={appSaveForm[field]}
                                        onChange={e => setAppSaveForm(f => ({ ...f, [field]: e.target.value }))}
                                        placeholder={field === 'company' ? 'e.g. Google' : 'e.g. Software Engineer'}
                                        style={{
                                            width: '100%', boxSizing: 'border-box',
                                            padding: '7px 10px', borderRadius: '8px',
                                            border: '1px solid #e5e7eb', fontSize: '13px',
                                            outline: 'none', color: '#111827',
                                        }}
                                    />
                                </div>
                            ))}
                            <div style={{ marginBottom: '12px' }}>
                                <label style={{ display: 'block', fontSize: '10px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', marginBottom: '4px' }}>Status</label>
                                <select
                                    value={appSaveForm.status}
                                    onChange={e => setAppSaveForm(f => ({ ...f, status: e.target.value }))}
                                    style={{ width: '100%', padding: '7px 10px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '13px', color: '#111827', background: '#fff' }}
                                >
                                    {['Applied', 'Under Review', 'Interview', 'Awaiting Decision', 'Offer', 'Rejected'].map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>
                            <button
                                onClick={doSaveApplication}
                                disabled={!appSaveForm.company.trim() || appSaveForm.saveStatus === 'saving' || appSaveForm.saveStatus === 'saved'}
                                style={{
                                    width: '100%', padding: '9px', borderRadius: '8px', border: 'none',
                                    background: appSaveForm.saveStatus === 'saved' ? '#10b981' : appSaveForm.saveStatus === 'error' ? '#ef4444' : 'linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)',
                                    color: '#fff', fontSize: '13px', fontWeight: 600, cursor: appSaveForm.saveStatus === 'saving' || appSaveForm.saveStatus === 'saved' ? 'default' : 'pointer',
                                    opacity: !appSaveForm.company.trim() || appSaveForm.saveStatus === 'saving' ? 0.6 : 1,
                                }}
                            >
                                {appSaveForm.saveStatus === 'saving' ? 'Saving…' : appSaveForm.saveStatus === 'saved' ? '✓ Saved!' : appSaveForm.saveStatus === 'error' ? '✗ Error — retry' : 'Save to tracker'}
                            </button>
                        </div>
                    )}

                    {/* app list */}
                    <div style={{ maxHeight: '260px', overflowY: 'auto', display: pickerMode === 'save_application' ? 'none' : undefined }}>
                        {(() => {
                            const pickerApps = pickerMode === 'fill'
                                ? fillableApps
                                : pickerMode === 'status_page'
                                ? savableStatusApps
                                : savableApps


                            if (pickerApps.length === 0) return (
                                <div style={{ padding: '18px', textAlign: 'center', color: '#6b7280', fontSize: '12px' }}>
                                    {pickerMode === 'fill'
                                        ? 'No saved credentials for this site'
                                        : 'No matching empty credentials for this site'}
                                </div>
                            )

                            return pickerApps.map(app => {
                                const status = saveState[app.id]
                                const hasCredentials = !!app.credential?.username

                                return (
                                    <div
                                        key={app.id}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '10px 14px',
                                            borderBottom: '1px solid #f9fafb',
                                            gap: '8px',
                                        }}
                                    >
                                        {/* app info */}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{
                                                fontWeight: 600, color: '#111827', fontSize: '13px',
                                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                            }}>
                                                {app.company}
                                            </div>
                                            {app.position && (
                                                <div style={{
                                                    color: '#6b7280', fontSize: '11px', marginTop: '1px',
                                                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                                }}>
                                                    {app.position}
                                                </div>
                                            )}
                                            {hasCredentials && (
                                                <div style={{
                                                    color: '#9ca3af', fontSize: '10px', marginTop: '1px',
                                                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                                }}>
                                                    {app.credential.username}
                                                </div>
                                            )}
                                        </div>

                                        {/* action button */}
                                        <div style={{ flexShrink: 0 }}>
                                            {(pickerMode === 'save' || pickerMode === 'status_page') ? (
                                                <button
                                                    onClick={() => pickerMode === 'status_page' ? doSaveStatusPage(app) : doSaveLogin(app)}
                                                    disabled={status === 'saving' || status === 'saved'}
                                                    style={{
                                                        padding: '5px 10px',
                                                        borderRadius: '6px',
                                                        border: '1px solid',
                                                        borderColor: status === 'saved' ? '#10b981' : status === 'error' ? '#ef4444' : '#6366f1',
                                                        background: status === 'saved' ? '#ecfdf5' : status === 'error' ? '#fef2f2' : status === 'saving' ? '#f5f3ff' : '#6366f1',
                                                        color: status === 'saved' ? '#059669' : status === 'error' ? '#dc2626' : '#fff',
                                                        fontSize: '11px',
                                                        fontWeight: 600,
                                                        cursor: status === 'saving' || status === 'saved' ? 'default' : 'pointer',
                                                        whiteSpace: 'nowrap',
                                                        transition: 'all 0.15s',
                                                    }}
                                                >
                                                    {status === 'saving' ? '...' : status === 'saved' ? '✓ Saved' : status === 'error' ? '✗ Error' : 'Save here'}
                                                </button>
                                            ) : (
                                                hasCredentials ? (
                                                    <button
                                                        onClick={() => doFill(app)}
                                                        style={{
                                                            padding: '5px 10px',
                                                            borderRadius: '6px',
                                                            border: '1px solid #6366f1',
                                                            background: '#6366f1',
                                                            color: '#fff',
                                                            fontSize: '11px',
                                                            fontWeight: 600,
                                                            cursor: 'pointer',
                                                            whiteSpace: 'nowrap',
                                                        }}
                                                    >
                                                        Fill
                                                    </button>
                                                ) : (
                                                    <span style={{ fontSize: '11px', color: '#d1d5db' }}>No credentials</span>
                                                )
                                            )}
                                        </div>
                                    </div>
                                )
                            })
                        })()}
                    </div>
                </div>
            )}
        </div>
    )
}
