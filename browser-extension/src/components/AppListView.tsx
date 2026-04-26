import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import apiRouter from "@/api/router";
import type { Application } from "@/api/application";
import { addToast } from "@heroui/react";
import { Icon } from "@iconify/react";
import type { Theme } from "@/popup/App";

// Deterministic avatar gradient from company name
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

export default function AppListView({
    theme,
    toggleTheme,
    onAppClick,
    onLogout,
    onAddApplication,
}: {
    theme: Theme
    toggleTheme: () => void
    onAppClick: (app: Application) => void
    onLogout: () => void
    onAddApplication: () => void
}) {
    const [selectedCompany, setSelectedCompany] = useState<string | null>(null)
    const [search, setSearch] = useState('')

    const { data = [], isLoading } = useQuery<Application[]>({
        queryKey: ["applications"],
        queryFn: () => apiRouter.applications.getApplications(),
        refetchInterval: 300000,
    })

    const handleLogout = () => {
        addToast({ title: "Signed out", timeout: 1200, shouldShowTimeoutProgress: true, variant: "solid", color: "success" })
        onLogout()
    }

    const grouped = data.reduce<Record<string, Application[]>>((acc, app) => {
        (acc[app.company] ??= []).push(app)
        return acc
    }, {})

    const companies = Object.keys(grouped)
        .filter(c => c.toLowerCase().includes(search.toLowerCase()))
        .sort()

    // ── Company positions sub-view ──────────────────────────────────────────────
    if (selectedCompany) {
        const apps = grouped[selectedCompany] ?? []
        return (
            <div className="flex flex-col h-full bg-heroui-background">
                {/* Header */}
                <div className="px-4 pt-4 pb-3 border-b border-heroui-border flex items-center gap-3 flex-shrink-0">
                    <button
                        onClick={() => setSelectedCompany(null)}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-heroui-muted hover:text-heroui-text hover:bg-heroui-card transition-all flex-shrink-0"
                    >
                        <Icon icon="solar:arrow-left-linear" width={18} />
                    </button>
                    <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm"
                        style={{ background: avatarGradient(selectedCompany) }}
                    >
                        {selectedCompany.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-sm font-semibold text-heroui-heading truncate">{selectedCompany}</h1>
                        <p className="text-[11px] text-heroui-muted">{apps.length} position{apps.length !== 1 ? 's' : ''}</p>
                    </div>
                    <button onClick={toggleTheme} className="w-8 h-8 rounded-full flex items-center justify-center text-heroui-muted hover:text-heroui-text hover:bg-heroui-card transition-all">
                        <Icon icon={theme === 'dark' ? 'solar:sun-bold' : 'solar:moon-bold'} width={15} />
                    </button>
                </div>

                {/* Position list */}
                <div className="flex-1 px-3 py-3 flex flex-col gap-2 overflow-y-auto min-h-0">
                    {apps.map((app) => (
                        <button
                            key={app.id}
                            onClick={() => onAppClick(app)}
                            className="w-full text-left px-4 py-3 rounded-xl border border-heroui-border bg-heroui-card hover:bg-heroui-card_hover transition-all flex items-center justify-between group"
                        >
                            <div className="min-w-0">
                                <p className="text-sm font-medium text-heroui-text truncate">
                                    {app.position ?? "General Application"}
                                </p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <span
                                        className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0"
                                        style={{ background: statusColor(app.category) }}
                                    />
                                    <p className="text-[11px] text-heroui-muted truncate">{app.category}</p>
                                </div>
                            </div>
                            <Icon icon="solar:arrow-right-linear" width={15} className="text-heroui-muted group-hover:text-heroui-text transition-colors flex-shrink-0 ml-2" />
                        </button>
                    ))}
                </div>

                {/* Bottom logout */}
                <div className="px-4 py-3 border-t border-heroui-border flex-shrink-0">
                    <button
                        onClick={handleLogout}
                        className="w-full py-2.5 rounded-xl text-sm font-medium text-heroui-muted hover:text-red-500 hover:bg-heroui-card border border-heroui-border transition-all flex items-center justify-center gap-2"
                    >
                        <Icon icon="solar:logout-3-linear" width={16} />
                        Sign Out
                    </button>
                </div>
            </div>
        )
    }

    // ── Top-level company list ──────────────────────────────────────────────────
    return (
        <div className="flex flex-col h-full bg-heroui-background">

            {/* Header */}
            <div className="px-4 pt-4 pb-3 border-b border-heroui-border flex-shrink-0">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                        <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm"
                            style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}
                        >
                            <Icon icon="solar:case-minimalistic-bold" width={16} color="#fff" />
                        </div>
                        <div>
                            <h1 className="text-sm font-bold text-heroui-heading leading-none">ApplyOS</h1>
                            <p className="text-[10px] text-heroui-muted mt-0.5">
                                {data.length} application{data.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <button onClick={onAddApplication} className="w-8 h-8 rounded-full flex items-center justify-center text-heroui-muted hover:text-heroui-text hover:bg-heroui-card transition-all">
                            <Icon icon="solar:add-circle-linear" width={17} />
                        </button>
                        <button onClick={toggleTheme} className="w-8 h-8 rounded-full flex items-center justify-center text-heroui-muted hover:text-heroui-text hover:bg-heroui-card transition-all">
                            <Icon icon={theme === 'dark' ? 'solar:sun-bold' : 'solar:moon-bold'} width={15} />
                        </button>
                        <button onClick={handleLogout} className="w-8 h-8 rounded-full flex items-center justify-center text-heroui-muted hover:text-red-500 hover:bg-heroui-card transition-all">
                            <Icon icon="solar:logout-3-linear" width={16} />
                        </button>
                    </div>
                </div>

                {/* Search */}
                <div className="relative">
                    <Icon icon="solar:magnifer-linear" width={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-heroui-muted pointer-events-none" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search companies…"
                        className="w-full pl-8 pr-3 py-2 rounded-xl border border-heroui-border bg-heroui-card text-sm text-heroui-text placeholder:text-heroui-muted outline-none focus:border-heroui-primary transition-colors"
                    />
                    {search && (
                        <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-heroui-muted hover:text-heroui-text">
                            <Icon icon="solar:close-circle-bold" width={14} />
                        </button>
                    )}
                </div>
            </div>

            {/* List */}
            <div className="flex-1 px-3 py-3 flex flex-col gap-2 overflow-y-auto min-h-0">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-full gap-3">
                        <div
                            className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
                            style={{ borderColor: '#6366f1', borderTopColor: 'transparent' }}
                        />
                        <p className="text-sm text-heroui-muted">Loading applications…</p>
                    </div>
                ) : companies.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-heroui-card border border-heroui-border flex items-center justify-center">
                            <Icon icon="solar:case-minimalistic-linear" width={24} className="text-heroui-muted" />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-medium text-heroui-text">
                                {search ? 'No results found' : 'No applications yet'}
                            </p>
                            <p className="text-xs text-heroui-muted mt-1">
                                {search ? `Nothing matches "${search}"` : 'Add applications from the web app'}
                            </p>
                        </div>
                    </div>
                ) : (
                    companies.map((company) => {
                        const apps = grouped[company]
                        const single = apps.length === 1
                        const hasCredentials = single && !!(apps[0].credential?.username || apps[0].credential?.portal_link)
                        return (
                            <button
                                key={company}
                                onClick={() => single ? onAppClick(apps[0]) : setSelectedCompany(company)}
                                className="w-full text-left px-3 py-3 rounded-xl border border-heroui-border bg-heroui-card hover:bg-heroui-card_hover transition-all flex items-center gap-3 group"
                            >
                                {/* Avatar */}
                                <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm"
                                    style={{ background: avatarGradient(company) }}
                                >
                                    {company.charAt(0).toUpperCase()}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-heroui-text truncate">{company}</p>
                                    {single ? (
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <span className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: statusColor(apps[0].category) }} />
                                            <p className="text-[11px] text-heroui-muted truncate">{apps[0].position ?? apps[0].category}</p>
                                        </div>
                                    ) : (
                                        <p className="text-[11px] text-heroui-muted mt-0.5">{apps.length} positions</p>
                                    )}
                                </div>

                                {/* Right side */}
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    {hasCredentials && (
                                        <div className="w-5 h-5 rounded-full bg-heroui-primary bg-opacity-10 flex items-center justify-center">
                                            <Icon icon="solar:key-minimalistic-2-bold" width={11} style={{ color: '#6366f1' }} />
                                        </div>
                                    )}
                                    <Icon icon={single ? 'solar:arrow-right-linear' : 'solar:alt-arrow-right-linear'} width={15} className="text-heroui-muted group-hover:text-heroui-text transition-colors" />
                                </div>
                            </button>
                        )
                    })
                )}
            </div>
        </div>
    )
}

function statusColor(category: string): string {
    const c = category?.toLowerCase() ?? ''
    if (c.includes('offer'))     return '#10b981'
    if (c.includes('interview')) return '#f59e0b'
    if (c.includes('reject'))    return '#ef4444'
    if (c.includes('applied'))   return '#6366f1'
    return '#64748b'
}
