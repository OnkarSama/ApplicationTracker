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
        'input[name*="last" i]:not([name*="password" i]):not([name*="class" i])',
        'input[id*="last" i]:not([id*="class" i])',
        'input[placeholder*="last name" i]',
    ],
    email:      [
        'input[autocomplete="email"]',
        'input[type="email"]',
        'input[id="email"]',
        'input[name="email"]',
        'input[name*="[email]"]',
        'input[name*="email" i]',
        'input[id*="email" i]',
    ],
    phone:      [
        'input[autocomplete="tel"]',
        'input[type="tel"]',
        'input[id="phone"]',
        'input[name="phone"]',
        'input[name*="[phone]"]',
        'input[name*="phone" i]',
        'input[id*="phone" i]',
        'input[placeholder*="phone" i]',
    ],
    linkedin:   [
        'input[name*="linkedin" i]',
        'input[id*="linkedin" i]',
        'input[placeholder*="linkedin" i]',
    ],
    github:     [
        'input[name*="github" i]',
        'input[id*="github" i]',
        'input[placeholder*="github" i]',
    ],
    portfolio:  [
        'input[name*="portfolio" i]',
        'input[name*="personal_url" i]',
        'input[name*="website" i]:not([name*="company" i])',
        'input[id*="website" i]:not([id*="company" i])',
        'input[placeholder*="portfolio" i]',
        'input[placeholder*="personal website" i]',
    ],
    address:    [
        'input[autocomplete="street-address"]',
        'input[name="address"]',
        'input[id="address"]',
        'input[name*="address_line_1" i]',
        'input[name*="address1" i]',
        'input[id*="address1" i]',
        'input[name*="street" i]',
        'input[placeholder*="street address" i]',
    ],
    city:       [
        'input[autocomplete="address-level2"]',
        'input[name="city"]',
        'input[id="city"]',
        'input[name*="[city]"]',
        'input[name*="city" i]',
        'input[id*="city" i]',
    ],
    state:      [
        'input[autocomplete="address-level1"]',
        'input[name="state"]',
        'input[id="state"]',
        'input[name*="[state]"]',
        'input[name*="state" i]:not([type="hidden"])',
        'input[id*="state" i]:not([type="hidden"])',
    ],
    zip:        [
        'input[autocomplete="postal-code"]',
        'input[name="zip"]',
        'input[id="zip"]',
        'input[name*="zip_code" i]',
        'input[name*="postal" i]',
        'input[name*="zip" i]',
        'input[id*="zip" i]',
    ],
    country:    [
        'input[autocomplete="country-name"]',
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
        'input[name="name"]:not([name*="company" i])',
        'input[id="name"]:not([id*="company" i])',
        'input[placeholder*="full name" i]',
        'input[aria-label*="full name" i]',
    ],
}

// Native setter bypasses React's synthetic event system so onChange fires correctly
const nativeInputSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set

function fillField(selectors: string[], value: string | undefined) {
    if (!value) return
    for (const selector of selectors) {
        const el = document.querySelector<HTMLInputElement>(selector)
        if (!el || el.type === 'hidden' || el.disabled || el.readOnly) continue
        if (nativeInputSetter) {
            nativeInputSetter.call(el, value)
        } else {
            el.value = value
        }
        el.dispatchEvent(new Event('input',  { bubbles: true }))
        el.dispatchEvent(new Event('change', { bubbles: true }))
        el.dispatchEvent(new Event('blur',   { bubbles: true }))
        return  // stop at first match
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
    return document.querySelector('input[type="password"]')
}

function getUsernameInput(passwordInput: HTMLInputElement): HTMLInputElement | null {
    return (
        document.querySelector<HTMLInputElement>('input[type="email"]') ??
        document.querySelector<HTMLInputElement>('input[name*="email"]') ??
        document.querySelector<HTMLInputElement>('input[name*="user"]') ??
        document.querySelector<HTMLInputElement>('input[id*="email"]') ??
        document.querySelector<HTMLInputElement>('input[id*="user"]') ??
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

type PickerMode = 'fill' | 'save' | 'status_page'
type SaveStatus = 'saving' | 'saved' | 'error'
type ProfileFillStatus = 'idle' | 'filling' | 'done' | 'error'

export default function FillOverlay() {
    const [apps, setApps]                 = useState<Application[]>([])
    const [formDetected, setFormDetected] = useState(false)
    const [appFormDetected, setAppFormDetected] = useState(false)
    const [autoFilled, setAutoFilled]     = useState(false)
    const [showPicker, setShowPicker]     = useState(false)
    const [pickerMode, setPickerMode]     = useState<PickerMode>('fill')
    const [saveState, setSaveState]       = useState<Record<number, SaveStatus>>({})
    const [profileFillStatus, setProfileFillStatus] = useState<ProfileFillStatus>('idle')
    // Credentials captured at form-submit time, carried to post-login page
    const [capturedLogin, setCapturedLogin] = useState<{ username: string; password: string } | null>(null)
    const currentUrl = useRef(window.location.href)

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
            fillField(FIELD_SELECTORS.address,    profile.address_line_1)
            fillField(FIELD_SELECTORS.city,       profile.city)
            fillField(FIELD_SELECTORS.state,      profile.state)
            fillField(FIELD_SELECTORS.zip,        profile.zip_code)
            fillField(FIELD_SELECTORS.country,    profile.country)

            setProfileFillStatus('done')
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
        })
    }, [])

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
                    setCapturedLogin({ username, password })
                    setFormDetected(true)
                    setPickerMode('status_page')
                    setShowPicker(true)
                }
                sessionStorage.removeItem(PENDING_LOGIN_KEY)
            }
        } catch {}

        // Detect application form fields (name + contact = job app form)
        const appFormObserver = new MutationObserver(() => {
            if (detectAppForm()) {
                setAppFormDetected(true)
                appFormObserver.disconnect()
            }
        })
        if (detectAppForm()) {
            setAppFormDetected(true)
        } else {
            appFormObserver.observe(document.body, { childList: true, subtree: true })
        }

        async function init() {
            const response = await chrome.runtime.sendMessage({ type: 'FETCH_APPS' })
            const fetchedApps: Application[] = response?.apps ?? []
            setApps(fetchedApps)

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

    if (!formDetected && !appFormDetected) return null

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
                    {formDetected && (
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
                    )}

                    {/* Fill credentials — only shown when not yet autofilled */}
                    {formDetected && !autoFilled && (
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
                            {pickerMode === 'save' ? '💾 Save login to…' : pickerMode === 'status_page' ? '📍 Save status page for…' : '🔑 Fill credentials from…'}
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

                    {/* app list */}
                    <div style={{ maxHeight: '260px', overflowY: 'auto' }}>
                        {(() => {
                            const pickerApps = pickerMode === 'fill'
                                ? apps.filter(a => hostnameMatches(a) && !!a.credential?.username)
                                : pickerMode === 'status_page'
                                ? apps.filter(a => !a.credential?.status_page_link)
                                : [
                                    ...apps.filter(hostnameMatches),
                                    ...apps.filter(a => !a.credential?.portal_link),
                                  ]

                            if (pickerApps.length === 0) return (
                                <div style={{ padding: '18px', textAlign: 'center', color: '#6b7280', fontSize: '12px' }}>
                                    {pickerMode === 'fill'
                                        ? 'No saved credentials for this site'
                                        : 'No matching applications for this domain'}
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

                    {/* footer: switch mode */}
                    <div style={{
                        padding: '9px 14px',
                        borderTop: '1px solid #f3f4f6',
                        textAlign: 'center',
                    }}>
                        <button
                            onClick={() => { setSaveState({}); setPickerMode(m => m === 'save' ? 'fill' : 'save') }}
                            style={{
                                background: 'none', border: 'none', cursor: 'pointer',
                                color: '#6366f1', fontSize: '11px', fontWeight: 600,
                            }}
                        >
                            {pickerMode === 'save' ? 'Switch to Fill mode' : 'Switch to Save mode'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
