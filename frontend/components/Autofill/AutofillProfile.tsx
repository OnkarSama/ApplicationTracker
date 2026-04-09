"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
    Input, Button, Textarea, Modal, ModalContent,
    ModalHeader, ModalBody, ModalFooter, useDisclosure,
    Checkbox,
} from "@heroui/react";
import apiRouter from "@/api/router";

/* ─────────────────────────────────────────────
   TYPES
───────────────────────────────────────────── */
interface WorkExperience {
    id?: number;
    employer: string;
    job_title: string;
    start_date: string;
    end_date: string | null;
    current: boolean | null;
    description: string;
}

interface Education {
    id?: number;
    institution: string;
    degree: string;
    area_of_study: string;
    start_year: number | string;
    end_year: number | string;
    gpa: string;
}

interface ProfileData {
    preferred_name: string;
    contact_email: string;
    phone_number: string;
    linkedin_url: string;
    portfolio_url: string;
    github_url: string;
    bio: string;
    pronouns: string;
    nationality: string;
    date_of_birth: string;
    address_line_1: string;
    address_line_2: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
    work_experiences: WorkExperience[];
    educations: Education[];
}

type FeedbackState = { kind: "success" | "error"; msg: string } | null;

const EMPTY_PROFILE: ProfileData = {
    preferred_name: "", contact_email: "", phone_number: "",
    linkedin_url: "", portfolio_url: "", github_url: "",
    bio: "", pronouns: "", nationality: "", date_of_birth: "",
    address_line_1: "", address_line_2: "", city: "", state: "",
    zip_code: "", country: "",
    work_experiences: [],
    educations: [{ institution: "", degree: "", area_of_study: "", start_year: "", end_year: "", gpa: "" }],
};

/* ─────────────────────────────────────────────
   VALIDATION
───────────────────────────────────────────── */
const RE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RE_URL   = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z]{2,}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)$/;
const RE_PHONE = /^\+?[\d\s\-().]{7,20}$/;

function validateProfile(f: ProfileData): Record<string, string> {
    const e: Record<string, string> = {};
    if (f.contact_email && !RE_EMAIL.test(f.contact_email)) e.contact_email = "Enter a valid email address";
    if (f.linkedin_url  && !RE_URL.test(f.linkedin_url))   e.linkedin_url  = "Enter a valid URL (include https://)";
    if (f.portfolio_url && !RE_URL.test(f.portfolio_url))  e.portfolio_url = "Enter a valid URL (include https://)";
    if (f.github_url    && !RE_URL.test(f.github_url))     e.github_url    = "Enter a valid URL (include https://)";
    if (f.phone_number  && !RE_PHONE.test(f.phone_number)) e.phone_number  = "Enter a valid phone number";
    if (f.bio && f.bio.length > 320) e.bio = `Bio too long (${f.bio.length}/320)`;
    return e;
}

function blankWork(): WorkExperience {
    return { employer: "", job_title: "", start_date: "", end_date: "", current: false, description: "" };
}
function blankEdu(): Education {
    return { institution: "", degree: "", area_of_study: "", start_year: "", end_year: "", gpa: "" };
}

/* ─────────────────────────────────────────────
   HEROUI INPUT classNames — accent variants
───────────────────────────────────────────── */
type Accent = "cyan" | "violet" | "amber" | "emerald" | "red";

const iCN = (accent: Accent = "cyan") => {
    const ring: Record<Accent, string> = {
        cyan:    "data-[focus=true]:border-cyan-500/60",
        violet:  "data-[focus=true]:border-violet-500/60",
        amber:   "data-[focus=true]:border-amber-400/55",
        emerald: "data-[focus=true]:border-emerald-500/55",
        red:     "data-[focus=true]:border-red-500/60",
    };
    const hover: Record<Accent, string> = {
        cyan:    "hover:border-cyan-500/35",
        violet:  "hover:border-violet-500/35",
        amber:   "hover:border-amber-400/30",
        emerald: "hover:border-emerald-400/30",
        red:     "hover:border-red-500/35",
    };
    return {
        inputWrapper: `border-border/50 bg-foreground/[0.04] ${hover[accent]} ${ring[accent]} backdrop-blur-sm`,
        input:        "text-foreground placeholder:text-muted text-sm",
        label:        "text-muted text-xs",
        errorMessage: "text-danger/80 text-xs",
        description:  "text-muted/60 text-xs mt-0.5",
    };
};

const taCN = (accent: "cyan" | "violet" = "cyan") => ({
    inputWrapper: `border-border/50 bg-foreground/[0.04] ${
        accent === "cyan"
            ? "hover:border-cyan-500/35 data-[focus=true]:border-cyan-500/60"
            : "hover:border-violet-500/35 data-[focus=true]:border-violet-500/60"
    } backdrop-blur-sm`,
    input:        "text-foreground placeholder:text-muted text-sm",
    label:        "text-muted text-xs",
    errorMessage: "text-danger/80 text-xs",
});

/* ─────────────────────────────────────────────
   FEEDBACK BANNER
───────────────────────────────────────────── */
function Feedback({ state }: { state: FeedbackState }) {
    if (!state) return null;
    const ok = state.kind === "success";
    return (
        <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-[family-name:var(--font-dm-sans)] ${
            ok
                ? "bg-success/[0.07] border border-success/22 text-success/92"
                : "bg-danger/[0.07] border border-danger/22 text-danger/92"
        }`}>
            {ok
                ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>}
            {state.msg}
        </div>
    );
}

/* ─────────────────────────────────────────────
   SECTION CARD
───────────────────────────────────────────── */
type AccentBorder = "cyan" | "violet" | "emerald";
const cardBorder: Record<AccentBorder, string> = {
    cyan:    "border-cyan-500/18",
    violet:  "border-violet-500/18",
    emerald: "border-emerald-500/18",
};
const dotBg: Record<AccentBorder, string> = {
    cyan:    "bg-cyan-400 shadow-[0_0_6px_theme(colors.cyan.400)]",
    violet:  "bg-violet-500 shadow-[0_0_6px_theme(colors.violet.500)]",
    emerald: "bg-emerald-500 shadow-[0_0_6px_theme(colors.emerald.500)]",
};
const eyebrowColor: Record<AccentBorder, string> = {
    cyan:    "text-cyan-400/55 border-cyan-400/12 bg-cyan-400/[0.04]",
    violet:  "text-violet-400/55 border-violet-400/12 bg-violet-400/[0.04]",
    emerald: "text-emerald-400/55 border-emerald-400/12 bg-emerald-400/[0.04]",
};

function Card({ accent = "cyan", eyebrow, title, children, action }: {
    accent?: AccentBorder;
    eyebrow: string;
    title: string;
    children: React.ReactNode;
    action?: React.ReactNode;
}) {
    return (
        <div className={`flex flex-col gap-4 bg-card border ${cardBorder[accent]} rounded-2xl backdrop-blur-[28px] p-7 shadow-[0_0_60px_rgba(0,212,255,0.03),inset_0_1px_0_rgba(255,255,255,0.05)]`}>
            <div className="flex items-start justify-between gap-4">
                <div>
                    <div className={`inline-flex items-center gap-1.5 font-mono text-[0.58rem] tracking-[0.2em] uppercase mb-1.5 border px-2.5 py-[0.22rem] rounded-full ${eyebrowColor[accent]}`}>
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotBg[accent]}`} />
                        {eyebrow}
                    </div>
                    <h2 className="font-[family-name:var(--font-syne)] font-extrabold text-[1.1rem] tracking-tight text-heading m-0">{title}</h2>
                </div>
                {action}
            </div>
            <div className="h-px bg-border/30" />
            {children}
        </div>
    );
}

/* ─────────────────────────────────────────────
   ICON BUTTON
───────────────────────────────────────────── */
function IconBtn({ onClick, title, children, disabled, variant = "default" }: {
    onClick: () => void; title: string; children: React.ReactNode;
    disabled?: boolean; variant?: "default" | "danger" | "emerald";
}) {
    const colors: Record<string, string> = {
        default: "text-cyan-400/50 hover:text-cyan-400 hover:border-cyan-400/27 hover:bg-cyan-400/[0.07]",
        danger:  "text-red-400/40  hover:text-red-400  hover:border-red-400/27  hover:bg-red-400/[0.07]",
        emerald: "text-emerald-500/50 hover:text-emerald-400 hover:border-emerald-400/27 hover:bg-emerald-400/[0.07]",
    };
    return (
        <button
            type="button"
            title={title}
            onClick={disabled ? undefined : onClick}
            className={`flex items-center justify-center p-1.5 bg-foreground/[0.04] border border-border/40 rounded-md transition-all duration-[180ms] ${
                disabled ? "opacity-30 cursor-not-allowed" : `cursor-pointer ${colors[variant]}`
            }`}
        >
            {children}
        </button>
    );
}

/* ─────────────────────────────────────────────
   ADD BUTTON (dashed)
───────────────────────────────────────────── */
function AddBtn({ label, onClick, accent }: { label: string; onClick: () => void; accent: "violet" | "emerald" }) {
    const cls: Record<string, string> = {
        violet:  "text-violet-500 border-violet-500/33 hover:bg-violet-500/[0.05] hover:border-violet-500/60",
        emerald: "text-emerald-500 border-emerald-500/33 hover:bg-emerald-500/[0.05] hover:border-emerald-500/60",
    };
    return (
        <button
            type="button"
            onClick={onClick}
            className={`flex items-center gap-1.5 font-mono text-[0.6rem] tracking-[0.14em] uppercase border border-dashed rounded-lg px-4 py-2 w-full cursor-pointer transition-all duration-200 ${cls[accent]}`}
        >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            {label}
        </button>
    );
}

/* ─────────────────────────────────────────────
   WORK EXPERIENCE ROW
───────────────────────────────────────────── */
function WorkRow({ exp, onEdit, onDelete }: { exp: WorkExperience; onEdit: () => void; onDelete: () => void }) {
    const fmt = (d: string | null) => d ? d.slice(0, 7).replace("-", "/") : "Present";
    return (
        <div className="flex items-start justify-between gap-4 p-4 bg-foreground/[0.025] rounded-xl border border-border/30">
            <div className="flex flex-col gap-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-[family-name:var(--font-syne)] font-bold text-[0.9rem] text-heading">{exp.job_title}</span>
                    <span className="font-mono text-[0.58rem] tracking-[0.1em] text-cyan-400/60 bg-cyan-400/[0.07] border border-cyan-400/15 rounded-full px-2 py-0.5">{exp.employer}</span>
                </div>
                <span className="font-mono text-[0.6rem] text-muted/40 tracking-[0.08em]">
          {fmt(exp.start_date)} — {fmt(exp.end_date)}
        </span>
                {exp.description && (
                    <p className="text-[0.78rem] text-muted/50 mt-1 leading-relaxed">{exp.description}</p>
                )}
            </div>
            <div className="flex gap-1.5 shrink-0">
                <IconBtn onClick={onEdit} title="Edit" variant="default">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </IconBtn>
                <IconBtn onClick={onDelete} title="Delete" variant="danger">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                </IconBtn>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────
   EDUCATION ROW
───────────────────────────────────────────── */
function EduRow({ edu, onEdit, onDelete, isOnly }: { edu: Education; onEdit: () => void; onDelete: () => void; isOnly: boolean }) {
    return (
        <div className="flex items-start justify-between gap-4 p-4 bg-foreground/[0.025] rounded-xl border border-border/30">
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-[family-name:var(--font-syne)] font-bold text-[0.9rem] text-heading">{edu.institution}</span>
                    {edu.gpa && (
                        <span className="font-mono text-[0.58rem] tracking-[0.1em] text-emerald-400/70 bg-emerald-500/[0.07] border border-emerald-500/18 rounded-full px-2 py-0.5">GPA {edu.gpa}</span>
                    )}
                </div>
                <span className="text-[0.82rem] text-muted/65">{edu.degree} in {edu.area_of_study}</span>
                <span className="font-mono text-[0.6rem] text-muted/35 tracking-[0.08em]">{edu.start_year} — {edu.end_year}</span>
            </div>
            <div className="flex gap-1.5 shrink-0">
                <IconBtn onClick={onEdit} title="Edit" variant="emerald">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </IconBtn>
                <IconBtn onClick={onDelete} title="Delete" variant="danger" disabled={isOnly}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                </IconBtn>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────
   WORK MODAL
───────────────────────────────────────────── */
function WorkModal({ isOpen, onClose, initial, onSave }: {
    isOpen: boolean; onClose: () => void;
    initial: WorkExperience | null;
    onSave: (w: WorkExperience) => void;
}) {
    const [w, setW] = useState<WorkExperience>(initial ?? blankWork());
    useEffect(() => { setW(initial ?? blankWork()); }, [initial, isOpen]);
    const set = (k: keyof WorkExperience) => (v: any) => setW(p => ({ ...p, [k]: v }));
    const valid = w.employer.trim() && w.job_title.trim() && w.start_date;

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="2xl" classNames={{
            base: "bg-card border border-border/50 backdrop-blur-2xl",
            header: "border-b border-border/30",
            footer: "border-t border-border/30",
        }}>
            <ModalContent>
                <ModalHeader className="font-[family-name:var(--font-syne)] font-extrabold text-heading text-[1.1rem]">
                    {initial?.id ? "Edit Experience" : "Add Experience"}
                </ModalHeader>
                <ModalBody className="flex flex-col gap-3.5 pt-5 pb-5">
                    <div className="grid grid-cols-2 gap-3.5 max-sm:grid-cols-1">
                        <Input label="Employer" placeholder="Google" value={w.employer} onValueChange={set("employer")} variant="bordered" classNames={iCN("violet")} />
                        <Input label="Job Title" placeholder="Software Engineer" value={w.job_title} onValueChange={set("job_title")} variant="bordered" classNames={iCN("violet")} />
                    </div>
                    <div className="grid grid-cols-2 gap-3.5 max-sm:grid-cols-1">
                        <Input label="Start Date" type="date" value={w.start_date} onValueChange={set("start_date")} variant="bordered" classNames={iCN("violet")} />
                        <Input label="End Date" type="date" value={w.end_date ?? ""} onValueChange={set("end_date")} variant="bordered" isDisabled={!!w.current} classNames={iCN("violet")} />
                    </div>
                    <Checkbox
                        isSelected={!!w.current}
                        onValueChange={v => setW(p => ({ ...p, current: v, end_date: v ? null : p.end_date }))}
                        classNames={{
                            label: "text-muted text-sm",
                            wrapper: "border-border bg-foreground/[0.03] group-data-[selected=true]:bg-cyan-500/20 group-data-[selected=true]:border-cyan-500/50",
                        }}
                    >
                        Currently working here
                    </Checkbox>
                    <Textarea label="Description" placeholder="What did you build, improve, or accomplish?" value={w.description} onValueChange={set("description")} variant="bordered" minRows={3} classNames={taCN("violet")} />
                </ModalBody>
                <ModalFooter>
                    <Button variant="bordered" onPress={onClose} className="border-border/50 bg-foreground/[0.03] text-muted hover:bg-foreground/[0.07] hover:text-subheading">Cancel</Button>
                    <Button isDisabled={!valid} onPress={() => { onSave(w); onClose(); }} variant="bordered" className="border-violet-500/30 bg-violet-500/10 text-foreground hover:bg-violet-500/20 hover:border-violet-500/55 font-bold">
                        {initial?.id ? "Save" : "Add"}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

/* ─────────────────────────────────────────────
   EDUCATION MODAL
───────────────────────────────────────────── */
function EduModal({ isOpen, onClose, initial, onSave }: {
    isOpen: boolean; onClose: () => void;
    initial: Education | null;
    onSave: (e: Education) => void;
}) {
    const [ed, setEd] = useState<Education>(initial ?? blankEdu());
    useEffect(() => { setEd(initial ?? blankEdu()); }, [initial, isOpen]);
    const set = (k: keyof Education) => (v: any) => setEd(p => ({ ...p, [k]: v }));
    const valid = ed.institution.trim() && ed.degree.trim() && ed.area_of_study.trim() && ed.start_year && ed.end_year;

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="2xl" classNames={{
            base: "bg-card border border-border/50 backdrop-blur-2xl",
            header: "border-b border-border/30",
            footer: "border-t border-border/30",
        }}>
            <ModalContent>
                <ModalHeader className="font-[family-name:var(--font-syne)] font-extrabold text-heading text-[1.1rem]">
                    {initial?.id ? "Edit Education" : "Add Education"}
                </ModalHeader>
                <ModalBody className="flex flex-col gap-3.5 pt-5 pb-5">
                    <Input label="Institution" placeholder="Adelphi University" value={ed.institution} onValueChange={set("institution")} variant="bordered" classNames={iCN("emerald")} />
                    <div className="grid grid-cols-2 gap-3.5 max-sm:grid-cols-1">
                        <Input label="Degree" placeholder="Bachelor's" value={ed.degree} onValueChange={set("degree")} variant="bordered" classNames={iCN("emerald")} />
                        <Input label="Area of Study" placeholder="Computer Science" value={ed.area_of_study} onValueChange={set("area_of_study")} variant="bordered" classNames={iCN("emerald")} />
                    </div>
                    <div className="grid grid-cols-2 gap-3.5 max-sm:grid-cols-1">
                        <Input label="Start Year" type="number" placeholder="2022" value={String(ed.start_year)} onValueChange={v => set("start_year")(v)} variant="bordered" classNames={iCN("emerald")} />
                        <Input label="End Year" type="number" placeholder="2026" value={String(ed.end_year)} onValueChange={v => set("end_year")(v)} variant="bordered" classNames={iCN("emerald")} />
                    </div>
                    <Input label="GPA (optional)" placeholder="3.8" value={ed.gpa} onValueChange={set("gpa")} variant="bordered" classNames={iCN("emerald")} />
                </ModalBody>
                <ModalFooter>
                    <Button variant="bordered" onPress={onClose} className="border-border/50 bg-foreground/[0.03] text-muted hover:bg-foreground/[0.07] hover:text-subheading">Cancel</Button>
                    <Button isDisabled={!valid} onPress={() => { onSave(ed); onClose(); }} variant="bordered" className="border-emerald-500/30 bg-emerald-500/10 text-foreground hover:bg-emerald-500/20 hover:border-emerald-500/55 font-bold">
                        {initial?.id ? "Save" : "Add"}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

/* ─────────────────────────────────────────────
   LOADING SKELETON
───────────────────────────────────────────── */
function Skeleton() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-8 h-8 rounded-full border-2 border-cyan-400/30 border-t-cyan-400 animate-spin" />
                <span className="font-mono text-[0.6rem] tracking-[0.2em] uppercase text-muted/40">Loading profile…</span>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────
   HELPERS — map API response → ProfileData
───────────────────────────────────────────── */
function mapApiToForm(raw: any): ProfileData {
    const p = raw?.applicant_profile ?? raw ?? {};
    return {
        preferred_name: p.preferred_name ?? "",
        contact_email:  p.contact_email  ?? "",
        phone_number:   p.phone_number   ?? "",
        linkedin_url:   p.linkedin_url   ?? "",
        portfolio_url:  p.portfolio_url  ?? "",
        github_url:     p.github_url     ?? "",
        bio:            p.bio            ?? "",
        pronouns:       p.pronouns       ?? "",
        nationality:    p.nationality    ?? "",
        date_of_birth:  p.date_of_birth  ?? "",
        address_line_1: p.address_line_1 ?? "",
        address_line_2: p.address_line_2 ?? "",
        city:           p.city           ?? "",
        state:          p.state          ?? "",
        zip_code:       p.zip_code       ?? "",
        country:        p.country        ?? "",
        work_experiences: (p.work_experiences ?? []).map((w: any) => ({
            id:          w.id,
            employer:    w.employer    ?? "",
            job_title:   w.job_title   ?? "",
            start_date:  w.start_date  ?? "",
            end_date:    w.end_date    ?? null,
            current:     w.current     ?? false,
            description: w.description ?? "",
        })),
        educations: (p.educations ?? []).length > 0
            ? (p.educations ?? []).map((e: any) => ({
                id:            e.id,
                institution:   e.institution   ?? "",
                degree:        e.degree        ?? "",
                area_of_study: e.area_of_study ?? "",
                start_year:    e.start_year    ?? "",
                end_year:      e.end_year      ?? "",
                gpa:           e.gpa != null   ? String(e.gpa) : "",
            }))
            : [blankEdu()],
    };
}


/* ─────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────── */
export default function ProfileEditPage() {

    const [form,     setForm]     = useState<ProfileData>({ ...EMPTY_PROFILE });
    const [saved,    setSaved]    = useState<ProfileData>({ ...EMPTY_PROFILE });
    const [errors,   setErrors]   = useState<Record<string, string>>({});
    const [loading,  setLoading]  = useState(false);
    const [fetching, setFetching] = useState(true);
    const [feedback, setFeedback] = useState<FeedbackState>(null);

    /* work modal */
    const workModal    = useDisclosure();
    const [editWork,    setEditWork]    = useState<WorkExperience | null>(null);
    const [editWorkIdx, setEditWorkIdx] = useState<number | null>(null);

    /* edu modal */
    const eduModal     = useDisclosure();
    const [editEdu,    setEditEdu]    = useState<Education | null>(null);
    const [editEduIdx, setEditEduIdx] = useState<number | null>(null);

    const isDirty = JSON.stringify(form) !== JSON.stringify(saved);

    /* ── Fetch on mount ── */
    useEffect(() => {
        (async () => {
            try {
                const raw = await apiRouter.profile.getProfile();
                const mapped = mapApiToForm(raw);
                setForm(mapped);
                setSaved(mapped);
            } catch (err) {
                setFeedback({ kind: "error", msg: "Failed to load profile. Please refresh." });
            } finally {
                setFetching(false);
            }
        })();
    }, []);

    const setField = useCallback(<K extends keyof ProfileData>(key: K) =>
        (v: ProfileData[K]) => {
            setForm(p => ({ ...p, [key]: v }));
            setErrors(p => { const n = { ...p }; delete n[key as string]; return n; });
        }, []);

    /* ── Work handlers ── */
    const openAddWork  = () => { setEditWork(null); setEditWorkIdx(null); workModal.onOpen(); };
    const openEditWork = (idx: number) => { setEditWork(form.work_experiences[idx]); setEditWorkIdx(idx); workModal.onOpen(); };
    const saveWork     = (w: WorkExperience) => {
        setForm(p => {
            const exps = [...p.work_experiences];
            if (editWorkIdx !== null) exps[editWorkIdx] = w; else exps.push(w);
            return { ...p, work_experiences: exps };
        });
    };
    const deleteWork = (idx: number) => setForm(p => ({ ...p, work_experiences: p.work_experiences.filter((_, i) => i !== idx) }));

    /* ── Education handlers ── */
    const openAddEdu  = () => { setEditEdu(null); setEditEduIdx(null); eduModal.onOpen(); };
    const openEditEdu = (idx: number) => { setEditEdu(form.educations[idx]); setEditEduIdx(idx); eduModal.onOpen(); };
    const saveEdu     = (e: Education) => {
        setForm(p => {
            const edus = [...p.educations];
            if (editEduIdx !== null) edus[editEduIdx] = e; else edus.push(e);
            return { ...p, educations: edus };
        });
    };
    const deleteEdu = (idx: number) => {
        if (form.educations.length <= 1) return;
        setForm(p => ({ ...p, educations: p.educations.filter((_, i) => i !== idx) }));
    };

    /* ── Save ── */
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const errs = validateProfile(form);
        setErrors(errs);
        if (Object.keys(errs).length) return;

        setLoading(true);
        setFeedback(null);
        try {
            // 1. PATCH core profile fields
            await apiRouter.profile.patchProfile({
                applicant_profile: {
                    preferred_name:  form.preferred_name  || undefined,
                    contact_email:   form.contact_email   || undefined,
                    phone_number:    form.phone_number    || undefined,
                    linkedin_url:    form.linkedin_url    || undefined,
                    portfolio_url:   form.portfolio_url   || undefined,
                    github_url:      form.github_url      || undefined,
                    bio:             form.bio             || undefined,
                    pronouns:        form.pronouns        || undefined,
                    nationality:     form.nationality     || undefined,
                    date_of_birth:   form.date_of_birth   || undefined,
                    address_line_1:  form.address_line_1  || undefined,
                    address_line_2:  form.address_line_2  || undefined,
                    city:            form.city            || undefined,
                    state:           form.state           || undefined,
                    zip_code:        form.zip_code        || undefined,
                    country:         form.country         || undefined,
                },
            });

            // 2. Work experiences — delete removed, update existing, create new
            const savedWorkIds = new Set(saved.work_experiences.filter(w => w.id).map(w => w.id!));
            const formWorkIds  = new Set(form.work_experiences.filter(w => w.id).map(w => w.id!));

            await Promise.all([...savedWorkIds].filter(id => !formWorkIds.has(id)).map(id =>
                apiRouter.profile.deleteWorkExperience(id)
            ));
            await Promise.all(form.work_experiences.filter(w => w.id).map(w =>
                apiRouter.profile.updateWorkExperience(w.id!, {
                    employer:    w.employer,
                    job_title:   w.job_title,
                    start_date:  w.start_date,
                    end_date:    w.current ? undefined : w.end_date ?? undefined,
                    current:     !!w.current,
                    description: w.description || undefined,
                })
            ));
            await Promise.all(form.work_experiences.filter(w => !w.id).map(w =>
                apiRouter.profile.createWorkExperience({
                    employer:    w.employer,
                    job_title:   w.job_title,
                    start_date:  w.start_date,
                    end_date:    w.current ? undefined : w.end_date ?? undefined,
                    current:     !!w.current,
                    description: w.description || undefined,
                })
            ));

            // 3. Education — delete removed, update existing, create new
            const savedEduIds = new Set(saved.educations.filter(e => e.id).map(e => e.id!));
            const formEduIds  = new Set(form.educations.filter(e => e.id).map(e => e.id!));

            await Promise.all([...savedEduIds].filter(id => !formEduIds.has(id)).map(id =>
                apiRouter.profile.deleteEducation(id)
            ));
            await Promise.all(form.educations.filter(e => e.id).map(e =>
                apiRouter.profile.updateEducation(e.id!, {
                    institution:   e.institution,
                    degree:        e.degree,
                    area_of_study: e.area_of_study,
                    start_year:    parseInt(String(e.start_year)) || undefined,
                    end_year:      parseInt(String(e.end_year))   || undefined,
                    gpa:           parseFloat(e.gpa)              || undefined,
                })
            ));
            await Promise.all(form.educations.filter(e => !e.id).map(e =>
                apiRouter.profile.createEducation({
                    institution:   e.institution,
                    degree:        e.degree,
                    area_of_study: e.area_of_study,
                    start_year:    parseInt(String(e.start_year)) || undefined,
                    end_year:      parseInt(String(e.end_year))   || undefined,
                    gpa:           parseFloat(e.gpa)              || undefined,
                })
            ));

            setSaved({ ...form });
            setFeedback({ kind: "success", msg: "Profile saved successfully." });
            setTimeout(() => setFeedback(null), 4000);
        } catch (err) {
            setFeedback({ kind: "error", msg: "Failed to save. Please try again." });
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => { setForm({ ...saved }); setErrors({}); setFeedback(null); };

    if (fetching) return <Skeleton />;

    return (
        <div className="min-h-screen bg-background">
            <div className="flex flex-col">

                {/* ── Body ── */}
                <div className="flex flex-col gap-6 px-8 pt-10 pb-16 max-sm:px-5 max-sm:pt-6 max-sm:gap-4">

                    {/* Header */}
                    <div>
                        <div className="inline-flex items-center gap-1.5 font-mono text-[0.6rem] tracking-[0.2em] uppercase text-heading border bg-background px-3 py-1 rounded-full mb-3">
                            <span className="w-1.5 h-1.5 rounded-full bg-foreground inline-block" />
                            Autofill Information
                        </div>
                        <h1 className="font-[family-name:var(--font-syne)] font-extrabold text-[clamp(1.5rem,5vw,2.6rem)] tracking-tight text-heading leading-[1.05] m-0">
                            Edit autofill{" "}
                            <span className="text-transparent bg-clip-text bg-hero-gradient">
                information
              </span>
                        </h1>
                        <p className="text-[0.82rem] text-muted/42 mt-1.5">
                            This information is used to autofill job applications — keep it accurate and up to date.
                        </p>
                    </div>

                    {/* ── Form ── */}
                    <form onSubmit={handleSave} noValidate className="flex flex-col gap-5">

                        {/* Row 1 — Identity + Contact */}
                        <div className="grid grid-cols-2 gap-5 max-md:grid-cols-1">

                            {/* Identity */}
                            <Card accent="cyan" eyebrow="Identity" title="Personal Details">
                                <Input label="Preferred Name" placeholder="What should we call you?" value={form.preferred_name} onValueChange={v => setField("preferred_name")(v)} variant="bordered" classNames={iCN("cyan")} />
                                <Input label="Pronouns" placeholder="he/him, she/her, they/them…" value={form.pronouns} onValueChange={v => setField("pronouns")(v)} variant="bordered" classNames={iCN("cyan")} />
                                <Input label="Nationality" placeholder="American" value={form.nationality} onValueChange={v => setField("nationality")(v)} variant="bordered" classNames={iCN("cyan")} />
                                <Input label="Date of Birth" type="date" value={form.date_of_birth} onValueChange={v => setField("date_of_birth")(v)} variant="bordered" classNames={iCN("cyan")} />
                                <div>
                                    <Textarea
                                        label="Bio"
                                        placeholder="Short paragraph about you, your skills, or what you're looking for…"
                                        value={form.bio}
                                        onValueChange={v => setField("bio")(v)}
                                        variant="bordered"
                                        minRows={3} maxRows={5}
                                        isInvalid={!!errors.bio}
                                        errorMessage={errors.bio}
                                        classNames={taCN("cyan")}
                                    />
                                    <div className="flex justify-end mt-1">
                    <span className={`font-mono text-[0.55rem] tracking-[0.1em] ${form.bio.length > 300 ? "text-amber-400/70" : "text-muted/25"}`}>
                      {form.bio.length} / 320
                    </span>
                                    </div>
                                </div>
                            </Card>

                            {/* Contact */}
                            <Card accent="violet" eyebrow="Contact" title="Contact Details">
                                <Input label="Contact Email" type="email" placeholder="recruiter@email.com" value={form.contact_email} onValueChange={v => setField("contact_email")(v)} variant="bordered" isInvalid={!!errors.contact_email} errorMessage={errors.contact_email} classNames={iCN("violet")} />
                                <Input label="Phone Number" type="tel" placeholder="+1 (555) 000-0000" value={form.phone_number} onValueChange={v => setField("phone_number")(v)} variant="bordered" isInvalid={!!errors.phone_number} errorMessage={errors.phone_number} classNames={iCN("violet")} />
                                <div className="h-px bg-border/30" />
                                <p className="font-mono text-[0.58rem] tracking-[0.14em] uppercase text-muted/30 m-0">Address</p>
                                <Input label="Address Line 1" placeholder="123 Main St" value={form.address_line_1} onValueChange={v => setField("address_line_1")(v)} variant="bordered" classNames={iCN("violet")} />
                                <Input label="Address Line 2" placeholder="Apt 4B (optional)" value={form.address_line_2} onValueChange={v => setField("address_line_2")(v)} variant="bordered" classNames={iCN("violet")} />
                                <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
                                    <Input label="City" value={form.city} onValueChange={v => setField("city")(v)} variant="bordered" classNames={iCN("violet")} />
                                    <Input label="State" value={form.state} onValueChange={v => setField("state")(v)} variant="bordered" classNames={iCN("violet")} />
                                </div>
                                <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
                                    <Input label="Zip Code" value={form.zip_code} onValueChange={v => setField("zip_code")(v)} variant="bordered" classNames={iCN("violet")} />
                                    <Input label="Country" value={form.country} onValueChange={v => setField("country")(v)} variant="bordered" classNames={iCN("violet")} />
                                </div>
                            </Card>
                        </div>

                        {/* Row 2 — Links */}
                        <Card accent="emerald" eyebrow="Links" title="Online Presence">
                            <div className="grid grid-cols-3 gap-4 max-md:grid-cols-2 max-sm:grid-cols-1">
                                <Input
                                    label="LinkedIn URL" placeholder="https://linkedin.com/in/yourprofile"
                                    value={form.linkedin_url} onValueChange={v => setField("linkedin_url")(v)}
                                    variant="bordered" isInvalid={!!errors.linkedin_url} errorMessage={errors.linkedin_url}
                                    classNames={iCN("emerald")}
                                    startContent={<svg width="13" height="13" viewBox="0 0 24 24" fill="rgba(16,185,129,0.55)" className="shrink-0"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>}
                                />
                                <Input
                                    label="Portfolio URL" placeholder="https://yoursite.dev"
                                    value={form.portfolio_url} onValueChange={v => setField("portfolio_url")(v)}
                                    variant="bordered" isInvalid={!!errors.portfolio_url} errorMessage={errors.portfolio_url}
                                    classNames={iCN("emerald")}
                                    startContent={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(16,185,129,0.55)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>}
                                />
                                <Input
                                    label="GitHub URL" placeholder="https://github.com/yourhandle"
                                    value={form.github_url} onValueChange={v => setField("github_url")(v)}
                                    variant="bordered" isInvalid={!!errors.github_url} errorMessage={errors.github_url}
                                    classNames={iCN("emerald")}
                                    startContent={<svg width="13" height="13" viewBox="0 0 24 24" fill="rgba(16,185,129,0.55)" className="shrink-0"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>}
                                />
                            </div>
                        </Card>

                        {/* Row 3 — Work + Education */}
                        <div className="grid grid-cols-2 gap-5 max-md:grid-cols-1">
                            <Card accent="violet" eyebrow="Experience" title="Work Experience"
                                  action={<AddBtn label="Add" onClick={openAddWork} accent="violet" />}>
                                {form.work_experiences.length === 0 ? (
                                    <p className="text-[0.82rem] text-muted/30 text-center py-6 m-0">No work experience added yet.</p>
                                ) : (
                                    <div className="flex flex-col gap-2.5">
                                        {form.work_experiences.map((exp, i) => (
                                            <WorkRow key={exp.id ?? i} exp={exp} onEdit={() => openEditWork(i)} onDelete={() => deleteWork(i)} />
                                        ))}
                                    </div>
                                )}
                            </Card>

                            <Card accent="emerald" eyebrow="Education" title="Education"
                                  action={<AddBtn label="Add" onClick={openAddEdu} accent="emerald" />}>
                                <div className="flex flex-col gap-2.5">
                                    {form.educations.map((edu, i) => (
                                        <EduRow key={edu.id ?? i} edu={edu} onEdit={() => openEditEdu(i)} onDelete={() => deleteEdu(i)} isOnly={form.educations.length === 1} />
                                    ))}
                                </div>
                            </Card>
                        </div>

                        {/* Form actions */}
                        {feedback && <Feedback state={feedback} />}
                        <div className="flex items-center justify-between flex-wrap gap-3">
                            <div className="flex gap-2.5 flex-wrap">
                                <Button
                                    type="submit"
                                    isLoading={loading}
                                    isDisabled={!isDirty && !loading}
                                    variant="bordered"
                                    className="border-cyan-500/30 bg-cyan-500/10 text-foreground hover:bg-cyan-500/20 hover:border-cyan-500/55 font-bold tracking-wide disabled:opacity-40"
                                >
                                    Save Changes
                                </Button>
                                <Button
                                    type="button"
                                    onPress={handleClear}
                                    isDisabled={!isDirty}
                                    variant="bordered"
                                    className="border-border/50 bg-foreground/3 text-muted hover:bg-foreground/[0.07] hover:text-subheading hover:border-border font-medium tracking-wide disabled:opacity-30"
                                >
                                    Discard
                                </Button>
                            </div>
                            {isDirty && (
                                <span className="font-mono text-[0.58rem] tracking-[0.12em] uppercase text-amber-400/65 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
                  Unsaved changes
                </span>
                            )}
                        </div>
                    </form>

                    <div className="h-8" />
                </div>
            </div>

            {/* Modals */}
            <WorkModal isOpen={workModal.isOpen} onClose={workModal.onClose} initial={editWork} onSave={saveWork} />
            <EduModal  isOpen={eduModal.isOpen}  onClose={eduModal.onClose}  initial={editEdu}  onSave={saveEdu} />
        </div>
    );
}
