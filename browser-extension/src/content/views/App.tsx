import { useState, useEffect, useCallback, useRef } from 'react'
import type { Application } from '@/api/application.ts'

// ── helpers ──────────────────────────────────────────────────────────────────

const PENDING_LOGIN_KEY = '_crx_pending_login'

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

export default function FillOverlay() {
    const [apps, setApps]                 = useState<Application[]>([])
    const [formDetected, setFormDetected] = useState(false)
    const [autoFilled, setAutoFilled]     = useState(false)
    const [showPicker, setShowPicker]     = useState(false)
    const [pickerMode, setPickerMode]     = useState<PickerMode>('fill')
    const [saveState, setSaveState]       = useState<Record<number, SaveStatus>>({})
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

    // ── save status page: just save current URL as portal_link ──────────────
    const doSaveStatusPage = useCallback((app: Application) => {
        setSaveState(s => ({ ...s, [app.id]: 'saving' }))
        const credential = {
            portal_link:     currentUrl.current,
            username:        app.credential?.username        ?? '',
            password_digest: app.credential?.password_digest ?? '',
        }
        chrome.runtime.sendMessage({ type: 'SAVE_PORTAL', appId: app.id, credential }, (res) => {
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
        return () => observer?.disconnect()
    }, [])

    if (!formDetected) return null

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

                    {/* Save login — always visible when form is on page */}
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

                    {/* Fill — only shown when not yet autofilled */}
                    {!autoFilled && (
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
                                            {pickerMode === 'save' ? (
                                                <button
                                                    onClick={() => doSaveLogin(app)}
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
