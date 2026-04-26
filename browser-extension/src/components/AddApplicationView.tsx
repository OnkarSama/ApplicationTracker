import { useState } from "react"
import { Icon } from "@iconify/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { addToast } from "@heroui/react"
import apiRouter from "@/api/router"
import type { Theme } from "@/popup/App"

const STATUSES   = ["Applied", "Under Review", "Interview", "Awaiting Decision", "Offer", "Rejected"]
const CATEGORIES = ["Full-time", "Part-time", "Internship", "Contract", "Co-op"]
const PRIORITIES = ["Low", "Medium", "High"]

export default function AddApplicationView({
    theme,
    toggleTheme,
    onBack,
    onSuccess,
}: {
    theme: Theme
    toggleTheme: () => void
    onBack: () => void
    onSuccess: () => void
}) {
    const queryClient = useQueryClient()
    const [form, setForm] = useState({
        company:  "",
        position: "",
        status:   "Applied",
        category: "Full-time",
        priority: "Medium",
    })

    const mutation = useMutation({
        mutationFn: () => apiRouter.applications.createApplication(form),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["applications"] })
            addToast({ title: "Application added", timeout: 1500, shouldShowTimeoutProgress: true, variant: "solid", color: "success" })
            onSuccess()
        },
        onError: () => {
            addToast({ title: "Failed to add application", timeout: 2000, variant: "solid", color: "danger" })
        },
    })

    const set = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }))

    const inputBase = "w-full px-3 py-2 rounded-xl border border-heroui-border bg-heroui-card text-sm text-heroui-text placeholder:text-heroui-muted outline-none focus:border-heroui-primary transition-colors"
    const labelBase = "text-[11px] font-semibold text-heroui-muted uppercase tracking-wider mb-1 block"

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
                <div className="flex-1 min-w-0">
                    <h1 className="text-sm font-bold text-heroui-heading">Add Application</h1>
                    <p className="text-[11px] text-heroui-muted">Log a job you just applied to</p>
                </div>
                <button onClick={toggleTheme} className="w-8 h-8 rounded-full flex items-center justify-center text-heroui-muted hover:text-heroui-text hover:bg-heroui-card transition-all">
                    <Icon icon={theme === 'dark' ? 'solar:sun-bold' : 'solar:moon-bold'} width={15} />
                </button>
            </div>

            {/* Form */}
            <div className="flex-1 px-4 py-4 flex flex-col gap-4 overflow-y-auto min-h-0">

                <div>
                    <label className={labelBase}>Company *</label>
                    <input
                        className={inputBase}
                        placeholder="e.g. Google"
                        value={form.company}
                        onChange={e => set("company", e.target.value)}
                    />
                </div>

                <div>
                    <label className={labelBase}>Position</label>
                    <input
                        className={inputBase}
                        placeholder="e.g. Software Engineer"
                        value={form.position}
                        onChange={e => set("position", e.target.value)}
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className={labelBase}>Status</label>
                        <select className={inputBase} value={form.status} onChange={e => set("status", e.target.value)}>
                            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className={labelBase}>Priority</label>
                        <select className={inputBase} value={form.priority} onChange={e => set("priority", e.target.value)}>
                            {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                </div>

                <div>
                    <label className={labelBase}>Category</label>
                    <select className={inputBase} value={form.category} onChange={e => set("category", e.target.value)}>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>

            </div>

            {/* Footer */}
            <div className="px-4 pb-4 pt-2 border-t border-heroui-border flex-shrink-0">
                <button
                    onClick={() => mutation.mutate()}
                    disabled={!form.company.trim() || mutation.isPending}
                    className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}
                >
                    {mutation.isPending ? (
                        <><Icon icon="solar:refresh-bold" className="animate-spin" width={15} /> Saving…</>
                    ) : (
                        <><Icon icon="solar:add-circle-linear" width={15} /> Add Application</>
                    )}
                </button>
            </div>

        </div>
    )
}
