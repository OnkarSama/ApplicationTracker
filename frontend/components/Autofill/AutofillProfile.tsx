"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import {
    Input, Button, Textarea, Modal, ModalContent,
    ModalHeader, ModalBody, ModalFooter, useDisclosure,
    Checkbox,
} from "@heroui/react";

/* ─────────────────────────────────────────────
   TYPES — mirror backend JSON
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

/* ─────────────────────────────────────────────
   MOCK BACKEND DATA
───────────────────────────────────────────── */
/* TODO: replace with your real API fetch — e.g. apiRouter.profile.get() */
const API_DATA: ProfileData = {
    preferred_name: "",
    contact_email: "",
    phone_number: "",
    linkedin_url: "",
    portfolio_url: "",
    github_url: "",
    bio: "",
    pronouns: "",
    nationality: "",
    date_of_birth: "",
    address_line_1: "",
    address_line_2: "",
    city: "",
    state: "",
    zip_code: "",
    country: "",
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
   SHARED HeroUI classNames
───────────────────────────────────────────── */
const iCN = (accent: "cyan" | "violet" | "amber" | "emerald" | "red" = "cyan") => {
    const ring    = { cyan: "data-[focus=true]:border-cyan-500/60",   violet: "data-[focus=true]:border-violet-500/60", amber: "data-[focus=true]:border-amber-400/55",   emerald: "data-[focus=true]:border-emerald-500/55", red: "data-[focus=true]:border-red-500/60"   }[accent];
    const hover   = { cyan: "hover:border-cyan-500/35",               violet: "hover:border-violet-500/35",             amber: "hover:border-amber-400/30",               emerald: "hover:border-emerald-400/30",             red: "hover:border-red-500/35"               }[accent];
    return {
        inputWrapper: `border-white/10 bg-white/[0.04] ${hover} ${ring} backdrop-blur-sm`,
        input:        "text-slate-100 placeholder:text-slate-600 text-sm",
        label:        "text-slate-400 text-xs",
        errorMessage: "text-red-400/80 text-xs",
        description:  "text-slate-600 text-xs mt-0.5",
    };
};
const taCN = (accent: "cyan" | "violet" = "cyan") => ({
    inputWrapper: `border-white/10 bg-white/[0.04] ${{ cyan: "hover:border-cyan-500/35 data-[focus=true]:border-cyan-500/60", violet: "hover:border-violet-500/35 data-[focus=true]:border-violet-500/60" }[accent]} backdrop-blur-sm`,
    input:        "text-slate-100 placeholder:text-slate-600 text-sm",
    label:        "text-slate-400 text-xs",
    errorMessage: "text-red-400/80 text-xs",
});

/* ─────────────────────────────────────────────
   FEEDBACK BANNER
───────────────────────────────────────────── */
function Feedback({ state }: { state: FeedbackState }) {
    if (!state) return null;
    const ok = state.kind === "success";
    return (
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.7rem 1rem", borderRadius: "10px", background: ok ? "rgba(16,185,129,0.07)" : "rgba(239,68,68,0.07)", border: `1px solid ${ok ? "rgba(16,185,129,0.22)" : "rgba(239,68,68,0.22)"}`, fontFamily: "'DM Sans',sans-serif", fontSize: "0.85rem", color: ok ? "rgba(110,231,183,0.92)" : "rgba(252,165,165,0.92)" }}>
            {ok
                ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>}
            {state.msg}
        </div>
    );
}

/* ─────────────────────────────────────────────
   SECTION CARD SHELL
───────────────────────────────────────────── */
function Card({ accentColor, dotColor, eyebrow, title, children, action }: {
    accentColor: string; dotColor: string; eyebrow: string; title: string;
    children: React.ReactNode; action?: React.ReactNode;
}) {
    return (
        <div className="pf-card" style={{ background: "rgba(4,12,28,0.82)", border: `1px solid ${accentColor}`, borderRadius: "16px", backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)", padding: "1.75rem", boxShadow: "0 0 60px rgba(0,212,255,0.03),inset 0 1px 0 rgba(255,255,255,0.05)", display: "flex", flexDirection: "column" as const, gap: "1.1rem" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem" }}>
                <div>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", fontFamily: "'DM Mono',monospace", fontSize: "0.58rem", letterSpacing: "0.2em", color: "rgba(0,212,255,0.55)", textTransform: "uppercase" as const, marginBottom: "0.45rem", border: "1px solid rgba(0,212,255,0.12)", padding: "0.22rem 0.65rem", borderRadius: "999px", background: "rgba(0,212,255,0.04)" }}>
                        <span style={{ width: 5, height: 5, borderRadius: "50%", background: dotColor, boxShadow: `0 0 5px ${dotColor}`, display: "inline-block", flexShrink: 0 }} />
                        {eyebrow}
                    </div>
                    <h2 style={{ fontFamily: "'Syne','Helvetica Neue',sans-serif", fontWeight: 800, fontSize: "1.1rem", letterSpacing: "-0.02em", color: "#f0f8ff", margin: 0 }}>{title}</h2>
                </div>
                {action}
            </div>
            <div style={{ height: 1, background: "rgba(255,255,255,0.055)" }} />
            {children}
        </div>
    );
}

/* ─────────────────────────────────────────────
   WORK EXPERIENCE MODAL
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
            base: "bg-[#040c1c] border border-white/10 backdrop-blur-2xl",
            header: "border-b border-white/[0.06]", footer: "border-t border-white/[0.06]",
        }}>
            <ModalContent>
                <ModalHeader style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, color: "#f0f8ff", fontSize: "1.1rem" }}>
                    {initial?.id ? "Edit Experience" : "Add Experience"}
                </ModalHeader>
                <ModalBody style={{ display: "flex", flexDirection: "column", gap: "0.9rem", paddingTop: "1.25rem", paddingBottom: "1.25rem" }}>
                    <div className="pf-modal-grid" style={{ display: "grid", gap: "0.9rem" }}>
                        <Input label="Employer" placeholder="Google" value={w.employer} onValueChange={set("employer")} variant="bordered" classNames={iCN("violet")} />
                        <Input label="Job Title" placeholder="Software Engineer" value={w.job_title} onValueChange={set("job_title")} variant="bordered" classNames={iCN("violet")} />
                    </div>
                    <div className="pf-modal-grid" style={{ display: "grid", gap: "0.9rem" }}>
                        <Input label="Start Date" type="date" value={w.start_date} onValueChange={set("start_date")} variant="bordered" classNames={iCN("violet")} />
                        <Input label="End Date" type="date" value={w.end_date ?? ""} onValueChange={set("end_date")} variant="bordered" isDisabled={!!w.current} classNames={iCN("violet")} />
                    </div>
                    <Checkbox isSelected={!!w.current} onValueChange={v => setW(p => ({ ...p, current: v, end_date: v ? null : p.end_date }))}
                              classNames={{ label: "text-slate-400 text-sm", wrapper: "border-white/20 bg-white/[0.03] group-data-[selected=true]:bg-cyan-500/20 group-data-[selected=true]:border-cyan-500/50" }}>
                        Currently working here
                    </Checkbox>
                    <Textarea label="Description" placeholder="What did you build, improve, or accomplish?" value={w.description} onValueChange={set("description")} variant="bordered" minRows={3} classNames={taCN("violet")} />
                </ModalBody>
                <ModalFooter>
                    <Button variant="bordered" onPress={onClose} className="border-white/10 bg-white/[0.03] text-slate-400 hover:bg-white/[0.07] hover:text-slate-200">Cancel</Button>
                    <Button isDisabled={!valid} onPress={() => { onSave(w); onClose(); }} variant="bordered" className="border-violet-500/30 bg-violet-500/10 text-slate-100 hover:bg-violet-500/20 hover:border-violet-500/55 font-bold">
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
function EduModal({ isOpen, onClose, initial, onSave, isOnly }: {
    isOpen: boolean; onClose: () => void;
    initial: Education | null;
    onSave: (e: Education) => void;
    isOnly: boolean;
}) {
    const [ed, setEd] = useState<Education>(initial ?? blankEdu());
    useEffect(() => { setEd(initial ?? blankEdu()); }, [initial, isOpen]);
    const set = (k: keyof Education) => (v: any) => setEd(p => ({ ...p, [k]: v }));
    const valid = ed.institution.trim() && ed.degree.trim() && ed.area_of_study.trim() && ed.start_year && ed.end_year;

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="2xl" classNames={{
            base: "bg-[#040c1c] border border-white/10 backdrop-blur-2xl",
            header: "border-b border-white/[0.06]", footer: "border-t border-white/[0.06]",
        }}>
            <ModalContent>
                <ModalHeader style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, color: "#f0f8ff", fontSize: "1.1rem" }}>
                    {initial?.id ? "Edit Education" : "Add Education"}
                </ModalHeader>
                <ModalBody style={{ display: "flex", flexDirection: "column", gap: "0.9rem", paddingTop: "1.25rem", paddingBottom: "1.25rem" }}>
                    <Input label="Institution" placeholder="Adelphi University" value={ed.institution} onValueChange={set("institution")} variant="bordered" classNames={iCN("emerald")} />
                    <div className="pf-modal-grid" style={{ display: "grid", gap: "0.9rem" }}>
                        <Input label="Degree" placeholder="Bachelor's" value={ed.degree} onValueChange={set("degree")} variant="bordered" classNames={iCN("emerald")} />
                        <Input label="Area of Study" placeholder="Computer Science" value={ed.area_of_study} onValueChange={set("area_of_study")} variant="bordered" classNames={iCN("emerald")} />
                    </div>
                    <div className="pf-modal-grid" style={{ display: "grid", gap: "0.9rem" }}>
                        <Input label="Start Year" type="number" placeholder="2022" value={String(ed.start_year)} onValueChange={v => set("start_year")(v)} variant="bordered" classNames={iCN("emerald")} />
                        <Input label="End Year" type="number" placeholder="2026" value={String(ed.end_year)} onValueChange={v => set("end_year")(v)} variant="bordered" classNames={iCN("emerald")} />
                    </div>
                    <Input label="GPA (optional)" placeholder="3.8" value={ed.gpa} onValueChange={set("gpa")} variant="bordered" classNames={iCN("emerald")} />
                </ModalBody>
                <ModalFooter>
                    <Button variant="bordered" onPress={onClose} className="border-white/10 bg-white/[0.03] text-slate-400 hover:bg-white/[0.07] hover:text-slate-200">Cancel</Button>
                    <Button isDisabled={!valid} onPress={() => { onSave(ed); onClose(); }} variant="bordered" className="border-emerald-500/30 bg-emerald-500/10 text-slate-100 hover:bg-emerald-500/20 hover:border-emerald-500/55 font-bold">
                        {initial?.id ? "Save" : "Add"}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

/* ─────────────────────────────────────────────
   WORK EXPERIENCE ENTRY ROW
───────────────────────────────────────────── */
function WorkRow({ exp, onEdit, onDelete }: { exp: WorkExperience; onEdit: () => void; onDelete: () => void }) {
    const fmt = (d: string | null) => d ? d.slice(0, 7).replace("-", "/") : "Present";
    return (
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", padding: "0.9rem 1rem", background: "rgba(255,255,255,0.025)", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.055)" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem", minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" as const }}>
                    <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: "0.9rem", color: "#f0f8ff" }}>{exp.job_title}</span>
                    <span style={{ fontFamily: "'DM Mono',monospace", fontSize: "0.58rem", letterSpacing: "0.1em", color: "rgba(0,212,255,0.6)", background: "rgba(0,212,255,0.07)", border: "1px solid rgba(0,212,255,0.15)", borderRadius: "999px", padding: "0.15rem 0.55rem" }}>{exp.employer}</span>
                </div>
                <span style={{ fontFamily: "'DM Mono',monospace", fontSize: "0.6rem", color: "rgba(160,200,240,0.38)", letterSpacing: "0.08em" }}>
                    {fmt(exp.start_date)} — {fmt(exp.end_date)}
                </span>
                {exp.description && <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.78rem", color: "rgba(160,200,240,0.5)", margin: 0, marginTop: "0.25rem", lineHeight: 1.5 }}>{exp.description}</p>}
            </div>
            <div style={{ display: "flex", gap: "0.4rem", flexShrink: 0 }}>
                <IconBtn onClick={onEdit} title="Edit" color="rgba(0,212,255,0.5)" hoverColor="#00d4ff">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </IconBtn>
                <IconBtn onClick={onDelete} title="Delete" color="rgba(239,68,68,0.4)" hoverColor="#ef4444">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                </IconBtn>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────
   EDUCATION ENTRY ROW
───────────────────────────────────────────── */
function EduRow({ edu, onEdit, onDelete, isOnly }: { edu: Education; onEdit: () => void; onDelete: () => void; isOnly: boolean }) {
    return (
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", padding: "0.9rem 1rem", background: "rgba(255,255,255,0.025)", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.055)" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" as const }}>
                    <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: "0.9rem", color: "#f0f8ff" }}>{edu.institution}</span>
                    {edu.gpa && <span style={{ fontFamily: "'DM Mono',monospace", fontSize: "0.58rem", letterSpacing: "0.1em", color: "rgba(16,185,129,0.7)", background: "rgba(16,185,129,0.07)", border: "1px solid rgba(16,185,129,0.18)", borderRadius: "999px", padding: "0.15rem 0.55rem" }}>GPA {edu.gpa}</span>}
                </div>
                <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.82rem", color: "rgba(160,200,240,0.65)" }}>{edu.degree} in {edu.area_of_study}</span>
                <span style={{ fontFamily: "'DM Mono',monospace", fontSize: "0.6rem", color: "rgba(160,200,240,0.35)", letterSpacing: "0.08em" }}>{edu.start_year} — {edu.end_year}</span>
            </div>
            <div style={{ display: "flex", gap: "0.4rem", flexShrink: 0 }}>
                <IconBtn onClick={onEdit} title="Edit" color="rgba(16,185,129,0.5)" hoverColor="#10b981">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </IconBtn>
                <IconBtn onClick={onDelete} title="Delete" color="rgba(239,68,68,0.4)" hoverColor="#ef4444" disabled={isOnly}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                </IconBtn>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────
   ICON BUTTON
───────────────────────────────────────────── */
function IconBtn({ onClick, title, color, hoverColor, children, disabled }: { onClick: () => void; title: string; color: string; hoverColor: string; children: React.ReactNode; disabled?: boolean }) {
    return (
        <button type="button" title={title} onClick={disabled ? undefined : onClick} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "6px", padding: "0.35rem", cursor: disabled ? "not-allowed" : "pointer", color, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.18s", opacity: disabled ? 0.3 : 1 }}
                onMouseEnter={e => { if (!disabled) { const el = e.currentTarget as HTMLButtonElement; el.style.color = hoverColor; el.style.borderColor = `${hoverColor}44`; el.style.background = `${hoverColor}11`; } }}
                onMouseLeave={e => { if (!disabled) { const el = e.currentTarget as HTMLButtonElement; el.style.color = color; el.style.borderColor = "rgba(255,255,255,0.08)"; el.style.background = "rgba(255,255,255,0.04)"; } }}
        >{children}</button>
    );
}

/* ─────────────────────────────────────────────
   ADD BUTTON
───────────────────────────────────────────── */
function AddBtn({ label, onClick, accent }: { label: string; onClick: () => void; accent: string }) {
    return (
        <button type="button" onClick={onClick} style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontFamily: "'DM Mono',monospace", fontSize: "0.6rem", letterSpacing: "0.14em", textTransform: "uppercase" as const, color: accent, background: "none", border: `1px dashed ${accent}55`, borderRadius: "8px", padding: "0.55rem 1rem", cursor: "pointer", transition: "all 0.2s", width: "100%" }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLButtonElement; el.style.background = `${accent}0d`; el.style.borderColor = `${accent}99`; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLButtonElement; el.style.background = "none"; el.style.borderColor = `${accent}55`; }}
        >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            {label}
        </button>
    );
}

/* ─────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────── */
export default function ProfileEditPage() {

    /* profile state */
    const [form,    setForm]    = useState<ProfileData>({ ...API_DATA });
    const [saved,   setSaved]   = useState<ProfileData>({ ...API_DATA });
    const [errors,  setErrors]  = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState<FeedbackState>(null);

    /* delete */
    const [deleteLoading, setDeleteLoading] = useState(false);

    /* work modal */
    const workModal  = useDisclosure();
    const [editWork, setEditWork] = useState<WorkExperience | null>(null);
    const [editWorkIdx, setEditWorkIdx] = useState<number | null>(null);

    /* edu modal */
    const eduModal  = useDisclosure();
    const [editEdu,    setEditEdu]    = useState<Education | null>(null);
    const [editEduIdx, setEditEduIdx] = useState<number | null>(null);

    const isDirty = JSON.stringify(form) !== JSON.stringify(saved);

    const setField = useCallback(<K extends keyof ProfileData>(key: K) =>
        (v: ProfileData[K]) => {
            setForm(p => ({ ...p, [key]: v }));
            setErrors(p => { const n = { ...p }; delete n[key as string]; return n; });
        }, []);

    /* ── Work experience handlers ── */
    const openAddWork = () => { setEditWork(null); setEditWorkIdx(null); workModal.onOpen(); };
    const openEditWork = (idx: number) => { setEditWork(form.work_experiences[idx]); setEditWorkIdx(idx); workModal.onOpen(); };
    const saveWork = (w: WorkExperience) => {
        setForm(p => {
            const exps = [...p.work_experiences];
            if (editWorkIdx !== null) exps[editWorkIdx] = w;
            else exps.push(w);
            return { ...p, work_experiences: exps };
        });
    };
    const deleteWork = (idx: number) => setForm(p => ({ ...p, work_experiences: p.work_experiences.filter((_, i) => i !== idx) }));

    /* ── Education handlers ── */
    const openAddEdu = () => { setEditEdu(null); setEditEduIdx(null); eduModal.onOpen(); };
    const openEditEdu = (idx: number) => { setEditEdu(form.educations[idx]); setEditEduIdx(idx); eduModal.onOpen(); };
    const saveEdu = (e: Education) => {
        setForm(p => {
            const edus = [...p.educations];
            if (editEduIdx !== null) edus[editEduIdx] = e;
            else edus.push(e);
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
        await new Promise(r => setTimeout(r, 900)); // TODO: wire API
        setLoading(false);
        setSaved({ ...form });
        setFeedback({ kind: "success", msg: "Profile saved successfully." });
        setTimeout(() => setFeedback(null), 4000);
    };

    const handleClear = () => { setForm({ ...saved }); setErrors({}); setFeedback(null); };

    const handleDelete = async () => {
        setDeleteLoading(true);
        await new Promise(r => setTimeout(r, 1200)); // TODO: wire API
        setDeleteLoading(false);
        console.log("Account deletion requested");
    };

    const divider = <div style={{ height: 1, background: "rgba(255,255,255,0.055)" }} />;

    return (
        <div style={{ minHeight: "100vh", background: "linear-gradient(160deg,#00020a 0%,#020b18 45%,#050e1f 100%)" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>

                {/* Nav */}
                <nav className="pf-nav" style={{ position: "sticky", top: 0, zIndex: 10, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", boxSizing: "border-box" as const, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", background: "rgba(0,2,10,0.6)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <Link href="/" style={{ fontFamily: "'DM Mono',monospace", fontSize: "0.78rem", letterSpacing: "0.22em", color: "rgba(0,212,255,0.65)", textTransform: "uppercase", textDecoration: "none", transition: "color 0.2s" }}
                          onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = "#00d4ff"; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(0,212,255,0.65)"; }}>
                        ApplyOS
                    </Link>
                    <Link href="/settings" className="pf-nav-link" style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 500, fontSize: "0.84rem", padding: "0.5rem 1.4rem", borderRadius: "6px", background: "rgba(0,212,255,0.07)", color: "rgba(0,212,255,0.88)", border: "1px solid rgba(0,212,255,0.22)", textDecoration: "none", display: "inline-block", transition: "all 0.2s" }}
                          onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.background = "rgba(0,212,255,0.14)"; el.style.borderColor = "rgba(0,212,255,0.52)"; el.style.boxShadow = "0 0 22px rgba(0,212,255,0.2)"; }}
                          onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.background = "rgba(0,212,255,0.07)"; el.style.borderColor = "rgba(0,212,255,0.22)"; el.style.boxShadow = "none"; }}>
                        ← Settings
                    </Link>
                </nav>

                {/* Body */}
                <div className="pf-body" style={{ boxSizing: "border-box" as const, display: "flex", flexDirection: "column", gap: "1.5rem" }}>

                    {/* Header */}
                    <div>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.45rem", fontFamily: "'DM Mono',monospace", fontSize: "0.6rem", letterSpacing: "0.2em", color: "rgba(0,212,255,0.55)", textTransform: "uppercase" as const, marginBottom: "0.8rem", border: "1px solid rgba(0,212,255,0.12)", padding: "0.28rem 0.75rem", borderRadius: "999px", background: "rgba(0,212,255,0.04)" }}>
                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#00d4ff", boxShadow: "0 0 6px #00d4ff", display: "inline-block" }} />
                            Autofill Information
                        </div>
                        <h1 className="pf-h1" style={{ fontFamily: "'Syne','Helvetica Neue',sans-serif", fontWeight: 800, fontSize: "clamp(1.5rem,5vw,2.6rem)", letterSpacing: "-0.03em", color: "#f0f8ff", margin: 0, lineHeight: 1.05 }}>
                            Edit autofill{" "}
                            <span style={{ background: "linear-gradient(90deg,#00d4ff 0%,#7c3aed 55%,#10b981 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>information</span>
                        </h1>
                        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.82rem", color: "rgba(160,200,240,0.42)", marginTop: "0.4rem" }}>
                            This information is used to autofill job applications — keep it accurate and up to date.
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSave} noValidate style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

                        {/* ROW 1: Identity + Contact */}
                        <div className="pf-grid-2" style={{ display: "grid", gap: "1.25rem" }}>
                            <Card eyebrow="Identity" title="Personal Details" accentColor="rgba(0,212,255,0.18)" dotColor="#00d4ff">
                                <Input label="Preferred Name" placeholder="What should we call you?" value={form.preferred_name} onValueChange={v => setField("preferred_name")(v)} variant="bordered" classNames={iCN("cyan")} />
                                <Input label="Pronouns" placeholder="he/him, she/her, they/them…" value={form.pronouns} onValueChange={v => setField("pronouns")(v)} variant="bordered" classNames={iCN("cyan")} />
                                <Input label="Nationality" placeholder="American" value={form.nationality} onValueChange={v => setField("nationality")(v)} variant="bordered" classNames={iCN("cyan")} />
                                <Input label="Date of Birth" type="date" value={form.date_of_birth} onValueChange={v => setField("date_of_birth")(v)} variant="bordered" classNames={iCN("cyan")} />
                                <div>
                                    <Textarea label="Bio" placeholder="Short paragraph about you, your skills, or what you're looking for…" value={form.bio} onValueChange={v => setField("bio")(v)} variant="bordered" minRows={3} maxRows={5} isInvalid={!!errors.bio} errorMessage={errors.bio} classNames={taCN("cyan")} />
                                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "0.3rem" }}>
                                        <span style={{ fontFamily: "'DM Mono',monospace", fontSize: "0.55rem", letterSpacing: "0.1em", color: form.bio.length > 300 ? "rgba(245,158,11,0.7)" : "rgba(160,200,240,0.25)" }}>{form.bio.length} / 320</span>
                                    </div>
                                </div>
                            </Card>

                            <Card eyebrow="Contact" title="Contact Details" accentColor="rgba(124,58,237,0.18)" dotColor="#7c3aed">
                                <Input label="Contact Email" type="email" placeholder="recruiter@email.com" value={form.contact_email} onValueChange={v => setField("contact_email")(v)} variant="bordered" isInvalid={!!errors.contact_email} errorMessage={errors.contact_email} classNames={iCN("violet")} />
                                <Input label="Phone Number" type="tel" placeholder="+1 (555) 000-0000" value={form.phone_number} onValueChange={v => setField("phone_number")(v)} variant="bordered" isInvalid={!!errors.phone_number} errorMessage={errors.phone_number} classNames={iCN("violet")} />
                                <div style={{ height: 1, background: "rgba(255,255,255,0.055)" }} />
                                <p style={{ fontFamily: "'DM Mono',monospace", fontSize: "0.58rem", letterSpacing: "0.14em", textTransform: "uppercase" as const, color: "rgba(160,200,240,0.3)", margin: 0 }}>Address</p>
                                <Input label="Address Line 1" placeholder="123 Main St" value={form.address_line_1} onValueChange={v => setField("address_line_1")(v)} variant="bordered" classNames={iCN("violet")} />
                                <Input label="Address Line 2" placeholder="Apt 4B (optional)" value={form.address_line_2} onValueChange={v => setField("address_line_2")(v)} variant="bordered" classNames={iCN("violet")} />
                                <div className="pf-grid-2b" style={{ display: "grid", gap: "0.75rem" }}>
                                    <Input label="City" value={form.city} onValueChange={v => setField("city")(v)} variant="bordered" classNames={iCN("violet")} />
                                    <Input label="State" value={form.state} onValueChange={v => setField("state")(v)} variant="bordered" classNames={iCN("violet")} />
                                </div>
                                <div className="pf-grid-2b" style={{ display: "grid", gap: "0.75rem" }}>
                                    <Input label="Zip Code" value={form.zip_code} onValueChange={v => setField("zip_code")(v)} variant="bordered" classNames={iCN("violet")} />
                                    <Input label="Country" value={form.country} onValueChange={v => setField("country")(v)} variant="bordered" classNames={iCN("violet")} />
                                </div>
                            </Card>
                        </div>

                        {/* ROW 2: Links */}
                        <Card eyebrow="Links" title="Online Presence" accentColor="rgba(16,185,129,0.18)" dotColor="#10b981">
                            <div className="pf-grid-3" style={{ display: "grid", gap: "1rem" }}>
                                <Input label="LinkedIn URL" placeholder="https://linkedin.com/in/yourprofile" value={form.linkedin_url} onValueChange={v => setField("linkedin_url")(v)} variant="bordered" isInvalid={!!errors.linkedin_url} errorMessage={errors.linkedin_url} classNames={iCN("emerald")}
                                       startContent={<svg width="13" height="13" viewBox="0 0 24 24" fill="rgba(16,185,129,0.55)" style={{ flexShrink: 0 }}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>} />
                                <Input label="Portfolio URL" placeholder="https://yoursite.dev" value={form.portfolio_url} onValueChange={v => setField("portfolio_url")(v)} variant="bordered" isInvalid={!!errors.portfolio_url} errorMessage={errors.portfolio_url} classNames={iCN("emerald")}
                                       startContent={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(16,185,129,0.55)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>} />
                                <Input label="GitHub URL" placeholder="https://github.com/yourhandle" value={form.github_url} onValueChange={v => setField("github_url")(v)} variant="bordered" isInvalid={!!errors.github_url} errorMessage={errors.github_url} classNames={iCN("emerald")}
                                       startContent={<svg width="13" height="13" viewBox="0 0 24 24" fill="rgba(16,185,129,0.55)" style={{ flexShrink: 0 }}><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>} />
                            </div>
                        </Card>

                        {/* ROW 3: Work + Education */}
                        <div className="pf-grid-2" style={{ display: "grid", gap: "1.25rem" }}>
                            <Card eyebrow="Experience" title="Work Experience" accentColor="rgba(124,58,237,0.18)" dotColor="#7c3aed"
                                  action={<AddBtn label="Add" onClick={openAddWork} accent="#7c3aed" />}>
                                {form.work_experiences.length === 0 ? (
                                    <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.82rem", color: "rgba(160,200,240,0.3)", textAlign: "center", padding: "1.5rem 0", margin: 0 }}>No work experience added yet.</p>
                                ) : (
                                    <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                                        {form.work_experiences.map((exp, i) => (
                                            <WorkRow key={exp.id ?? i} exp={exp} onEdit={() => openEditWork(i)} onDelete={() => deleteWork(i)} />
                                        ))}
                                    </div>
                                )}
                            </Card>

                            <Card eyebrow="Education" title="Education" accentColor="rgba(16,185,129,0.18)" dotColor="#10b981"
                                  action={<AddBtn label="Add" onClick={openAddEdu} accent="#10b981" />}>
                                <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                                    {form.educations.map((edu, i) => (
                                        <EduRow key={edu.id ?? i} edu={edu} onEdit={() => openEditEdu(i)} onDelete={() => deleteEdu(i)} isOnly={form.educations.length === 1} />
                                    ))}
                                </div>
                            </Card>
                        </div>

                        {/* FORM ACTIONS */}
                        {feedback && <Feedback state={feedback} />}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" as const, gap: "0.75rem" }}>
                            <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" as const }}>
                                <Button type="submit" isLoading={loading} isDisabled={!isDirty && !loading} variant="bordered" className="border-cyan-500/30 bg-cyan-500/10 text-slate-100 hover:bg-cyan-500/20 hover:border-cyan-500/55 font-bold tracking-wide disabled:opacity-40">
                                    Save Changes
                                </Button>
                                <Button type="button" onPress={handleClear} isDisabled={!isDirty} variant="bordered" className="border-white/10 bg-white/[0.03] text-slate-400 hover:bg-white/[0.07] hover:text-slate-200 hover:border-white/20 font-medium tracking-wide disabled:opacity-30">
                                    Clear Form
                                </Button>
                            </div>
                            {isDirty && (
                                <span style={{ fontFamily: "'DM Mono',monospace", fontSize: "0.58rem", letterSpacing: "0.12em", textTransform: "uppercase" as const, color: "rgba(245,158,11,0.65)", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#f59e0b", display: "inline-block" }} />
                                    Unsaved changes
                                </span>
                            )}
                        </div>

                        {/* DANGER ZONE */}
                        {divider}
                        <Card eyebrow="Irreversible Actions" title="Danger Zone" accentColor="rgba(239,68,68,0.22)" dotColor="#ef4444">
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" as const, gap: "1rem" }}>
                                <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                                    <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.875rem", color: "rgba(160,200,240,0.7)", fontWeight: 500 }}>Delete account</span>
                                    <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.8rem", color: "rgba(160,200,240,0.38)", lineHeight: 1.5 }}>
                                        Permanently removes your account and all data.{" "}
                                        <span style={{ color: "rgba(252,165,165,0.7)" }}>This cannot be undone.</span>
                                    </span>
                                </div>
                                <Button
                                    onPress={handleDelete}
                                    isLoading={deleteLoading}
                                    variant="bordered"
                                    className="border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20 hover:border-red-500/55 font-bold tracking-wide flex-shrink-0"
                                >
                                    Delete My Account
                                </Button>
                            </div>
                        </Card>

                    </form>
                    <div style={{ height: "2rem" }} />
                </div>
            </div>

            {/* Modals */}
            <WorkModal isOpen={workModal.isOpen} onClose={workModal.onClose} initial={editWork} onSave={saveWork} />
            <EduModal  isOpen={eduModal.isOpen}  onClose={eduModal.onClose}  initial={editEdu}  onSave={saveEdu}  isOnly={form.educations.length === 1} />

            <style>{`
                .pf-nav      { padding: 1.2rem 2rem; }
                .pf-body     { padding: 2.5rem 2rem 4rem; }
                .pf-grid-2   { grid-template-columns: repeat(2,1fr); }
                .pf-grid-3   { grid-template-columns: repeat(3,1fr); }
                .pf-grid-2b  { grid-template-columns: repeat(2,1fr); }
                .pf-modal-grid { grid-template-columns: repeat(2,1fr); }

                @media (max-width: 900px) {
                    .pf-nav  { padding: 1rem 1.25rem; }
                    .pf-body { padding: 2rem 1.25rem 3rem; }
                    .pf-grid-3 { grid-template-columns: repeat(2,1fr); }
                }
                @media (max-width: 640px) {
                    .pf-nav        { padding: 0.85rem 1rem; }
                    .pf-nav-link   { font-size: 0.75rem !important; padding: 0.4rem 0.9rem !important; }
                    .pf-body       { padding: 1.25rem 1rem 3rem; gap: 1rem; }
                    .pf-grid-2     { grid-template-columns: 1fr !important; }
                    .pf-grid-3     { grid-template-columns: 1fr !important; }
                    .pf-grid-2b    { grid-template-columns: 1fr !important; }
                    .pf-modal-grid { grid-template-columns: 1fr !important; }
                    .pf-card       { padding: 1.25rem !important; }
                    .pf-h1         { font-size: 1.5rem !important; }
                }
                @media (max-width: 375px) {
                    .pf-nav  { padding: 0.75rem; }
                    .pf-body { padding: 1rem 0.75rem 2.5rem; }
                    .pf-card { padding: 1rem !important; }
                }
            `}</style>
        </div>
    );
}