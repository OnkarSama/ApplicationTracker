import { useState } from "react";
import { Application } from "@/api/application.ts";
import { Input, Divider } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiRouter from "@/api/router";
import type { Theme } from "@/popup/App";

type CredentialField = { username: string; password_digest: string; portal_link: string }

function shortenUrl(url: string): string {
    try {
        const { hostname, pathname } = new URL(url)
        const path = pathname.length > 1 ? pathname.replace(/\/$/, "") : ""
        const short = hostname + path
        return short.length > 38 ? short.slice(0, 35) + "…" : short
    } catch {
        return url.length > 38 ? url.slice(0, 35) + "…" : url
    }
}

const GRADIENTS: [string, string][] = [
    ['#6366f1', '#8b5cf6'],
    ['#3b82f6', '#06b6d4'],
    ['#10b981', '#059669'],
    ['#f59e0b', '#ef4444'],
    ['#ec4899', '#a855f7'],
    ['#14b8a6', '#3b82f6'],
    ['#f97316', '#ef4444'],
    ['#8b5cf6', '#ec4899'],
]
function avatarGradient(name: string): string {
    const i = (name.toLowerCase().charCodeAt(0) + (name.charCodeAt(1) || 0)) % GRADIENTS.length
    const [a, b] = GRADIENTS[i]
    return `linear-gradient(135deg, ${a} 0%, ${b} 100%)`
}

export default function AppDetailView({
    theme,
    toggleTheme,
    app,
    onBack,
}: {
    theme: Theme
    toggleTheme: () => void
    app: Application
    onBack: () => void
}) {
    const queryClient = useQueryClient()
    const [isEditing, setIsEditing]     = useState(false)
    const [fetchingUrl, setFetchingUrl] = useState(false)
    const [copied, setCopied]           = useState<string | null>(null)
    const [showPass, setShowPass]       = useState(false)
    const [form, setForm]               = useState<CredentialField>({
        username:        app.credential?.username        ?? "",
        password_digest: app.credential?.password_digest ?? "",
        portal_link:     app.credential?.portal_link     ?? "",
    })

    const updateMutation = useMutation({
        mutationFn: async () => {
            try {
                return await apiRouter.applicationCredentials.updateCredential(app.id, { application_credential: form })
            } catch (e: any) {
                if (e.response?.status === 404)
                    return await apiRouter.applicationCredentials.createCredential(app.id, { application_credential: form })
                throw e
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["applications"] })
            setIsEditing(false)
        },
    })

    function useCurrentPage() {
        setFetchingUrl(true)
        chrome.runtime.sendMessage({ type: "GET_CURRENT_TAB_URL" }, (res) => {
            setForm(f => ({ ...f, portal_link: res?.url ?? "" }))
            setFetchingUrl(false)
        })
    }

    function copyField(key: string, value: string) {
        if (!value) return
        navigator.clipboard.writeText(value).then(() => {
            setCopied(key)
            setTimeout(() => setCopied(null), 1500)
        })
    }

    const inputClass = {
        inputWrapper: 'border-heroui-border bg-heroui-background data-[hover=true]:border-heroui-primary',
        input: 'text-heroui-text placeholder:text-heroui-muted text-sm',
        label: 'text-heroui-muted text-xs',
    }

    return (
        <div className="flex flex-col h-full bg-heroui-background">

            {/* Header */}
            <div className="px-4 pt-4 pb-3 border-b border-heroui-border flex items-center gap-3 flex-shrink-0">
                <button
                    onClick={onBack}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-heroui-muted hover:text-heroui-text hover:bg-heroui-card transition-all flex-shrink-0"
                >
                    <Icon icon="solar:arrow-left-linear" width={18} />
                </button>

                <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm"
                    style={{ background: avatarGradient(app.company) }}
                >
                    {app.company.charAt(0).toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                    <h1 className="text-sm font-bold text-heroui-heading truncate">{app.company}</h1>
                    {app.position && <p className="text-[11px] text-heroui-muted truncate">{app.position}</p>}
                </div>

                <div className="flex items-center gap-1">
                    <button onClick={toggleTheme} className="w-8 h-8 rounded-full flex items-center justify-center text-heroui-muted hover:text-heroui-text hover:bg-heroui-card transition-all">
                        <Icon icon={theme === 'dark' ? 'solar:sun-bold' : 'solar:moon-bold'} width={15} />
                    </button>
                    <button
                        onClick={() => {
                            if (isEditing) setForm({ username: app.credential?.username ?? "", password_digest: app.credential?.password_digest ?? "", portal_link: app.credential?.portal_link ?? "" })
                            setIsEditing(e => !e)
                        }}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-heroui-muted hover:text-heroui-text hover:bg-heroui-card transition-all"
                    >
                        <Icon icon={isEditing ? "solar:close-circle-linear" : "solar:pen-2-linear"} width={16} />
                    </button>
                </div>
            </div>

            {/* Credential cards */}
            <div className="flex-1 px-4 py-4 flex flex-col gap-3 overflow-y-auto min-h-0">

                {/* Username */}
                <CredentialCard
                    icon="solar:user-rounded-linear"
                    label="Username"
                    copied={copied === 'username'}
                    isEditing={isEditing}
                    onCopy={() => copyField('username', form.username)}
                    editContent={
                        <Input
                            size="sm" variant="bordered"
                            placeholder="username or email"
                            value={form.username}
                            onChange={e => setForm({ ...form, username: e.target.value })}
                            classNames={inputClass}
                        />
                    }
                    displayContent={
                        <p className="font-mono text-sm text-heroui-text truncate">
                            {form.username || <span className="text-heroui-muted italic font-sans text-xs">Not set</span>}
                        </p>
                    }
                />

                {/* Password */}
                <CredentialCard
                    icon="solar:lock-password-linear"
                    label="Password"
                    copied={copied === 'password'}
                    isEditing={isEditing}
                    onCopy={() => copyField('password', form.password_digest)}
                    editContent={
                        <Input
                            size="sm" variant="bordered" type="password"
                            placeholder="••••••••"
                            value={form.password_digest}
                            onChange={e => setForm({ ...form, password_digest: e.target.value })}
                            classNames={inputClass}
                        />
                    }
                    displayContent={
                        <div className="flex items-center gap-2">
                            <p
                                className="font-mono text-sm text-heroui-text flex-1 truncate transition-all duration-200 cursor-pointer"
                                style={{ filter: showPass ? 'none' : 'blur(5px)' }}
                                onMouseEnter={() => setShowPass(true)}
                                onMouseLeave={() => setShowPass(false)}
                            >
                                {form.password_digest || "••••••••"}
                            </p>
                        </div>
                    }
                    hint={!isEditing ? "Hover to reveal · Click to copy" : undefined}
                />

                {/* Portal Link */}
                <CredentialCard
                    icon="solar:link-minimalistic-2-linear"
                    label="Portal Link"
                    isEditing={isEditing}
                    editContent={
                        <div className="flex flex-col gap-2">
                            <Input
                                size="sm" variant="bordered"
                                placeholder="https://portal.company.com/login"
                                value={form.portal_link}
                                onChange={e => setForm({ ...form, portal_link: e.target.value })}
                                classNames={inputClass}
                            />
                            <button
                                onClick={useCurrentPage}
                                disabled={fetchingUrl}
                                className="flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-heroui-border text-heroui-muted hover:text-heroui-text hover:border-heroui-primary text-xs transition-all disabled:opacity-50"
                            >
                                <Icon icon={fetchingUrl ? "solar:refresh-bold" : "solar:map-point-wave-bold"} width={13} />
                                {fetchingUrl ? "Fetching…" : "Use current page URL"}
                            </button>
                        </div>
                    }
                    displayContent={
                        form.portal_link ? (
                            <a
                                href={form.portal_link}
                                target="_blank" rel="noreferrer"
                                className="font-mono text-xs text-heroui-primary hover:text-heroui-primary truncate block transition-colors"
                            >
                                {shortenUrl(form.portal_link)}
                            </a>
                        ) : (
                            <span className="text-heroui-muted italic text-xs">Not set</span>
                        )
                    }
                    hint={!isEditing && form.portal_link ? "Click link to open" : undefined}
                />
            </div>

            {/* Save / Back footer */}
            <div className="px-4 pb-4 pt-2 border-t border-heroui-border flex-shrink-0">
                {isEditing ? (
                    <button
                        onClick={() => updateMutation.mutate()}
                        disabled={updateMutation.isPending}
                        className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                        style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}
                    >
                        {updateMutation.isPending ? (
                            <><Icon icon="solar:refresh-bold" className="animate-spin" width={15} /> Saving…</>
                        ) : (
                            <><Icon icon="solar:check-read-linear" width={15} /> Save Changes</>
                        )}
                    </button>
                ) : (
                    <button
                        onClick={onBack}
                        className="w-full py-2.5 rounded-xl text-sm font-medium text-heroui-muted hover:text-heroui-text hover:bg-heroui-card border border-heroui-border transition-all flex items-center justify-center gap-2"
                    >
                        <Icon icon="solar:arrow-left-linear" width={15} />
                        Back to Applications
                    </button>
                )}
            </div>
        </div>
    )
}

function CredentialCard({
    icon, label, copied, isEditing, onCopy, editContent, displayContent, hint,
}: {
    icon: string
    label: string
    copied?: boolean
    isEditing: boolean
    onCopy?: () => void
    editContent: React.ReactNode
    displayContent: React.ReactNode
    hint?: string
}) {
    return (
        <div className="rounded-xl border border-heroui-border bg-heroui-card overflow-hidden">
            {/* Card header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-heroui-border">
                <div className="flex items-center gap-2">
                    <Icon icon={icon} width={14} className="text-heroui-muted flex-shrink-0" />
                    <span className="text-xs font-semibold text-heroui-muted uppercase tracking-wider">{label}</span>
                </div>
                {!isEditing && onCopy && (
                    <button
                        onClick={onCopy}
                        className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md transition-all"
                        style={copied
                            ? { color: '#10b981', background: 'rgba(16,185,129,0.1)' }
                            : { color: '#64748b' }
                        }
                    >
                        <Icon icon={copied ? "solar:check-read-bold" : "solar:copy-linear"} width={11} />
                        {copied ? "Copied!" : "Copy"}
                    </button>
                )}
            </div>

            {/* Card body */}
            <div
                className={`px-3 py-3 ${!isEditing && onCopy ? 'cursor-pointer hover:bg-heroui-card_hover transition-colors' : ''}`}
                onClick={!isEditing ? onCopy : undefined}
            >
                {isEditing ? editContent : displayContent}
            </div>

            {/* Card footer hint */}
            {hint && !isEditing && (
                <>
                    <Divider />
                    <div className="px-3 py-1.5">
                        <p className="text-[10px] text-heroui-muted">{hint}</p>
                    </div>
                </>
            )}
        </div>
    )
}
