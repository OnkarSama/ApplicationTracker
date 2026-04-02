import { useState, useEffect, useCallback, useRef } from 'react'
import type { Application } from '@/api/application.ts'

// ── helpers ──────────────────────────────────────────────────────────────────

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

type PickerMode = 'fill' | 'save' | 'status'
type SaveStatus = 'saving' | 'saved' | 'error'

const POST_LOGIN_FLAG = 'apptracker_post_login'

export default function FillOverlay() {
    const [apps, setApps]             = useState<Application[]>([])
    const [formDetected, setFormDetected] = useState(false)
    const [autoFilled, setAutoFilled] = useState(false)
    const [showPicker, setShowPicker] = useState(false)
    const [pickerMode, setPickerMode] = useState<PickerMode>('fill')
    const [saveState, setSaveState]   = useState<Record<number, SaveStatus>>({})
    const [showStatusPrompt, setShowStatusPrompt] = useState(false)
    const currentUrl = useRef(window.location.href)

    // ── fill: write saved credentials into the form ──────────────────────────
    const doFill = useCallback((app: Application) => {
        const pwInput = getPasswordInput()
        if (!pwInput) return
        fillInputs(getUsernameInput(pwInput), pwInput, app)
        setAutoFilled(true)
        setShowPicker(false)
    }, [])

    // ── save portal URL only (no credential capture) ─────────────────────────
    const doSaveUrl = useCallback((app: Application) => {
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

    const doSaveStatusPage = useCallback((app: Application) => {
        setSaveState(s => ({ ...s, [app.id]: 'saving' }))
        const credential = {
            portal_link:      app.credential?.portal_link     ?? '',
            status_page_link: currentUrl.current,
            username:         app.credential?.username        ?? '',
            password_digest:  app.credential?.password_digest ?? '',
        }
        chrome.runtime.sendMessage({ type: 'SAVE_PORTAL', appId: app.id, credential }, (res) => {
            if (res?.success) sessionStorage.removeItem(POST_LOGIN_FLAG)
            setSaveState(s => ({ ...s, [app.id]: res?.success ? 'saved' : 'error' }))
        })
    }, [])

    const dismissStatusPrompt = useCallback(() => {
        sessionStorage.removeItem(POST_LOGIN_FLAG)
        setShowStatusPrompt(false)
    }, [])

    // ── save login: capture what the user typed + current URL ────────────────
    const doSaveLogin = useCallback((app: Application) => {
        const pwInput    = getPasswordInput()
        const userInput  = pwInput ? getUsernameInput(pwInput) : null
        const username   = userInput?.value?.trim() ?? ''
        const password   = pwInput?.value ?? ''

        setSaveState(s => ({ ...s, [app.id]: 'saving' }))
        const credential = {
            portal_link:     currentUrl.current,
            username,
            password_digest: password,
        }
        chrome.runtime.sendMessage({ type: 'SAVE_PORTAL', appId: app.id, credential }, (res) => {
            setSaveState(s => ({ ...s, [app.id]: res?.success ? 'saved' : 'error' }))
        })
    }, [])

    // ── form detection + autofill ─────────────────────────────────────────────
    useEffect(() => {
        let observer: MutationObserver | null = null
        let didFill = false

        async function init() {
            const response = await chrome.runtime.sendMessage({ type: 'FETCH_APPS' })
            const fetchedApps: Application[] = response?.apps ?? []
            setApps(fetchedApps)

            // ── post-login redirect detection ────────────────────────────────
            const postLoginFlag = sessionStorage.getItem(POST_LOGIN_FLAG)
            if (postLoginFlag === '1') {
                const pwInput = getPasswordInput()
                if (!pwInput) {
                    // No login form — we're on a post-login page.
                    // Keep the flag so it persists across further navigations (e.g. /apply → /apply/status)
                    // until the user explicitly saves or dismisses.
                    setShowStatusPrompt(true)
                    return
                }
                // Still on a login-like page (e.g. 2FA step) — keep the flag so the
                // next redirect will still trigger the check, and re-attach listeners
                // so submitting this step also marks the next navigation.
                attachLoginListeners(pwInput)
            }

            function tryAutoFill(): 'filled' | 'no-match' | 'no-form' {
                const pwInput = getPasswordInput()
                if (!pwInput) return 'no-form'

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
            // Marks the flag + handles SPA navigation where there's no full page reload
            function markLoginAndWatch() {
                sessionStorage.setItem(POST_LOGIN_FLAG, '1')

                // For SPAs: if the URL changes without a reload, check if the login form is gone
                let lastHref = window.location.href
                const navInterval = setInterval(() => {
                    if (window.location.href !== lastHref) {
                        lastHref = window.location.href
                        currentUrl.current = window.location.href
                        // Give the SPA time to render the new page
                        setTimeout(() => {
                            if (!getPasswordInput()) {
                                clearInterval(navInterval)
                                sessionStorage.removeItem(POST_LOGIN_FLAG)
                                setShowStatusPrompt(true)
                            }
                        }, 600)
                    }
                }, 400)

                // Clean up after 30s to avoid leaking intervals
                setTimeout(() => clearInterval(navInterval), 30_000)
            }

            function attachLoginListeners(pwInput: HTMLInputElement) {
                // Native form submit
                document.addEventListener('submit', markLoginAndWatch, true)

                // JS-driven submit: click on submit button inside the same form
                const form = pwInput.closest('form')
                const submitBtn = form
                    ? form.querySelector<HTMLElement>('[type="submit"], button:not([type="button"])')
                    : pwInput.parentElement?.querySelector<HTMLElement>('[type="submit"], button:not([type="button"])')
                if (submitBtn) {
                    submitBtn.addEventListener('click', markLoginAndWatch, { once: true, capture: true })
                }
            }

            if (result === 'filled') {
                // Set flag so the next page (after login redirect) triggers the status page prompt
                attachLoginListeners(getPasswordInput()!)
                return
            }

            // Watch for dynamically rendered forms (SPAs)
            observer = new MutationObserver(() => {
                if (didFill) { observer?.disconnect(); return }
                const r = tryAutoFill()
                if (r === 'filled') {
                    observer?.disconnect()
                    attachLoginListeners(getPasswordInput()!)
                }
            })
            observer.observe(document.body, { childList: true, subtree: true })

            // If form is present (no match yet), still listen for submit to catch the redirect
            const handleFormSubmit = () => {
                if (fetchedApps.some(hostnameMatches)) {
                    markLoginAndWatch()
                }
            }
            document.addEventListener('submit', handleFormSubmit, true)
        }

        init()
        return () => observer?.disconnect()
    }, [])

    if (!formDetected && !showStatusPrompt) return null

    const openPicker = (mode: PickerMode) => {
        // reset save states when opening fresh
        setSaveState({})
        setPickerMode(mode)
        setShowPicker(true)
    }

    return (
        <div style={{ position: 'relative', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            {!showPicker ? (
                // ── pill buttons ─────────────────────────────────────────────
                <div style={{ display: 'flex', gap: '8px', flexDirection: 'column', alignItems: 'flex-end' }}>

                    {/* Status page prompt — shown after post-login redirect */}
                    {showStatusPrompt && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <button
                                onClick={() => openPicker('status')}
                                style={{
                                    ...pillBase,
                                    background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
                                    color: '#fff',
                                    boxShadow: '0 4px 18px rgba(14,165,233,0.5)',
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.transform = 'translateY(-2px)'
                                    e.currentTarget.style.boxShadow = '0 6px 24px rgba(14,165,233,0.65)'
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.transform = 'translateY(0)'
                                    e.currentTarget.style.boxShadow = '0 4px 18px rgba(14,165,233,0.5)'
                                }}
                            >
                                📊 Save as status page?
                            </button>
                            <button
                                onClick={dismissStatusPrompt}
                                title="Dismiss"
                                style={{
                                    background: 'rgba(0,0,0,0.25)',
                                    border: 'none',
                                    borderRadius: '50%',
                                    color: '#fff',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    lineHeight: '1',
                                    width: '20px',
                                    height: '20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                }}
                            >
                                ×
                            </button>
                        </div>
                    )}

                    {/* Save login — only visible when login form is on page */}
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

                    {/* Fill — only shown when not yet autofilled */}
                    {!autoFilled && formDetected && (
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
                        background: pickerMode === 'save' ? '#f5f3ff' : pickerMode === 'status' ? '#f0f9ff' : '#fff',
                    }}>
                        <span style={{ fontWeight: 700, color: '#111827' }}>
                            {pickerMode === 'save' ? '💾 Save login to…' : pickerMode === 'status' ? '📊 Save status page to…' : '🔑 Fill credentials from…'}
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
                    {pickerMode === 'save' && (
                        <div style={{
                            padding: '8px 14px',
                            background: '#faf5ff',
                            borderBottom: '1px solid #f3f4f6',
                            color: '#7c3aed',
                            fontSize: '11px',
                        }}>
                            Saves what you've typed in the form + this page URL
                        </div>
                    )}
                    {pickerMode === 'status' && (
                        <div style={{
                            padding: '8px 14px',
                            background: '#f0f9ff',
                            borderBottom: '1px solid #f3f4f6',
                            color: '#0369a1',
                            fontSize: '11px',
                        }}>
                            Saves this page as the application status page
                        </div>
                    )}

                    {/* app list */}
                    <div style={{ maxHeight: '260px', overflowY: 'auto' }}>
                        {apps.length === 0 ? (
                            <div style={{ padding: '18px', textAlign: 'center', color: '#6b7280' }}>
                                No applications found
                            </div>
                        ) : (
                            apps.map(app => {
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
                                                {app.title}
                                            </div>
                                            {hasCredentials && (
                                                <div style={{
                                                    color: '#6b7280', fontSize: '11px', marginTop: '2px',
                                                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                                }}>
                                                    {app.credential.username}
                                                </div>
                                            )}
                                        </div>

                                        {/* action button */}
                                        <div style={{ flexShrink: 0 }}>
                                            {pickerMode === 'save' ? (
                                                // Save login button
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
                                            ) : pickerMode === 'status' ? (
                                                // Save status page button
                                                <button
                                                    onClick={() => doSaveStatusPage(app)}
                                                    disabled={status === 'saving' || status === 'saved'}
                                                    style={{
                                                        padding: '5px 10px',
                                                        borderRadius: '6px',
                                                        border: '1px solid',
                                                        borderColor: status === 'saved' ? '#10b981' : status === 'error' ? '#ef4444' : '#0ea5e9',
                                                        background: status === 'saved' ? '#ecfdf5' : status === 'error' ? '#fef2f2' : status === 'saving' ? '#f0f9ff' : '#0ea5e9',
                                                        color: status === 'saved' ? '#059669' : status === 'error' ? '#dc2626' : '#fff',
                                                        fontSize: '11px',
                                                        fontWeight: 600,
                                                        cursor: status === 'saving' || status === 'saved' ? 'default' : 'pointer',
                                                        whiteSpace: 'nowrap',
                                                        transition: 'all 0.15s',
                                                    }}
                                                >
                                                    {status === 'saving' ? '...' : status === 'saved' ? '✓ Saved' : status === 'error' ? '✗ Error' : 'Save'}
                                                </button>
                                            ) : (
                                                // Fill button — only for apps with credentials
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
                        )}
                    </div>

                    {/* footer: switch mode (not shown in status mode) */}
                    {pickerMode !== 'status' && (
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
                    )}
                </div>
            )}
        </div>
    )
}
