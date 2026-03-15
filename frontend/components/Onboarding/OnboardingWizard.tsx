"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import apiRouter from "@/api/router";
import ThreeBackground from "@/components/ui/ThreeBackground";

/* ═══════════════════════════════════════════
   TYPES
═══════════════════════════════════════════ */

type StepId =
    | "welcome"
    | "profile"
    | "contact"
    | "education"
    | "employment"
    | "links"
    | "done";

interface PersonalData {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    nationality: string;
    pronouns: string;
}

interface ContactData {
    email: string;
    phone: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    zip: string;
    country: string;
}

interface EducationEntry {
    id: string;
    institution: string;
    degree: string;
    field: string;
    startYear: string;
    endYear: string;
    gpa: string;
}

interface EmploymentEntry {
    id: string;
    employer: string;
    title: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
}

interface LinksData {
    linkedinUrl: string;
    githubUrl: string;
    portfolioUrl: string;
    resumeText: string;
}

interface WizardData {
    personal:   PersonalData;
    contact:    ContactData;
    education:  EducationEntry[];
    employment: EmploymentEntry[];
    links:      LinksData;
}

interface StepConfig {
    id: StepId;
    label: string;
    optional?: boolean;
}

/* ═══════════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════════ */

const STEPS: StepConfig[] = [
    { id: "welcome",    label: "Welcome"    },
    { id: "profile",    label: "Personal"   },
    { id: "contact",    label: "Contact"    },
    { id: "education",  label: "Education"  },
    { id: "employment", label: "Employment", optional: true },
    { id: "links",      label: "Links",      optional: true },
    { id: "done",       label: "Done"       },
];

const EMPTY_DATA: WizardData = {
    personal: { firstName: "", lastName: "", dateOfBirth: "", nationality: "", pronouns: "" },
    contact:  { email: "", phone: "", addressLine1: "", addressLine2: "", city: "", state: "", zip: "", country: "" },
    education:  [],
    employment: [],
    links: { linkedinUrl: "", githubUrl: "", portfolioUrl: "", resumeText: "" },
};

const newEducation = (): EducationEntry => ({
    id: crypto.randomUUID(), institution: "", degree: "", field: "",
    startYear: "", endYear: "", gpa: "",
});

const newEmployment = (): EmploymentEntry => ({
    id: crypto.randomUUID(), employer: "", title: "", startDate: "",
    endDate: "", current: false, description: "",
});

/* ═══════════════════════════════════════════
   SHARED FORM PRIMITIVES
═══════════════════════════════════════════ */

function Label({ children }: { children: React.ReactNode }) {
    return <label className="font-mono text-[0.61rem] tracking-[0.18em] uppercase" style={{ color: "hsl(var(--heroui-muted) / 0.55)" }}>{children}</label>;
}

function Hint({ children }: { children: React.ReactNode }) {
    return <p className="text-xs mt-0.5 mb-0" style={{ color: "hsl(var(--heroui-subheading) / 0.40)" }}>{children}</p>;
}

function Field({ label, hint, children, half }: { label: string; hint?: string; children: React.ReactNode; half?: boolean }) {
    return (
        <div className={`flex flex-col gap-1 ${half ? "w-[calc(50%-0.5rem)]" : "w-full"}`}>
            <Label>{label}</Label>
            {children}
            {hint && <Hint>{hint}</Hint>}
        </div>
    );
}

function inputStyle(focused: boolean) {
    return {
        color:       "hsl(var(--heroui-foreground))",
        background:  focused ? "hsl(var(--heroui-info) / 0.07)" : "hsl(var(--heroui-foreground) / 0.04)",
        borderColor: focused ? "hsl(var(--heroui-info) / 0.50)" : "hsl(var(--heroui-foreground) / 0.10)",
        boxShadow:   focused ? "0 0 18px hsl(var(--heroui-info) / 0.12)" : "none",
    };
}

function SI({ value, onChange, placeholder, type = "text" }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
    const [f, setF] = useState(false);
    return <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} onFocus={() => setF(true)} onBlur={() => setF(false)} className="w-full font-sans text-sm rounded-[7px] px-3.5 py-2.5 outline-none backdrop-blur-sm transition-all duration-200 border" style={inputStyle(f)} />;
}

function SS({ value, onChange, options, placeholder }: { value: string; onChange: (v: string) => void; options: string[]; placeholder?: string }) {
    const [f, setF] = useState(false);
    return <select value={value} onChange={(e) => onChange(e.target.value)} onFocus={() => setF(true)} onBlur={() => setF(false)} className="w-full font-sans text-sm rounded-[7px] px-3.5 py-2.5 outline-none transition-all duration-200 border appearance-none cursor-pointer" style={inputStyle(f)}>{placeholder && <option value="" disabled>{placeholder}</option>}{options.map((o) => <option key={o} value={o}>{o}</option>)}</select>;
}

function STA({ value, onChange, placeholder, rows = 3 }: { value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
    const [f, setF] = useState(false);
    return <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={rows} onFocus={() => setF(true)} onBlur={() => setF(false)} className="w-full font-sans text-sm rounded-[7px] px-3.5 py-2.5 outline-none backdrop-blur-sm transition-all duration-200 border resize-none" style={inputStyle(f)} />;
}

function Divider() {
    return <div className="h-px" style={{ background: "hsl(var(--heroui-foreground) / 0.055)" }} />;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
    return <h3 className="font-sora font-bold text-sm m-0" style={{ color: "hsl(var(--heroui-info) / 0.80)" }}>{children}</h3>;
}

function AddBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
    return (
        <button onClick={onClick} className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-200 border"
                style={{ color: "hsl(var(--heroui-info) / 0.75)", borderColor: "hsl(var(--heroui-info) / 0.20)", background: "hsl(var(--heroui-info) / 0.06)" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "hsl(var(--heroui-info) / 0.12)"; e.currentTarget.style.borderColor = "hsl(var(--heroui-info) / 0.35)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "hsl(var(--heroui-info) / 0.06)"; e.currentTarget.style.borderColor = "hsl(var(--heroui-info) / 0.20)"; }}
        >
            <span className="text-base leading-none">+</span> {children}
        </button>
    );
}

function RemoveBtn({ onClick }: { onClick: () => void }) {
    return (
        <button onClick={onClick} className="text-xs px-2 py-1 rounded transition-all duration-150"
                style={{ color: "hsl(var(--heroui-danger) / 0.60)", background: "hsl(var(--heroui-danger) / 0.06)" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "hsl(var(--heroui-danger) / 0.14)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "hsl(var(--heroui-danger) / 0.06)"; }}
        >Remove</button>
    );
}

/* ═══════════════════════════════════════════
   PROGRESS BAR
═══════════════════════════════════════════ */

function ProgressBar({ current }: { current: number }) {
    return (
        <div className="flex items-start justify-between mb-6 overflow-x-auto pb-1">
            {STEPS.map((step, i) => {
                const isPast = i < current, isCurrent = i === current;
                return (
                    <React.Fragment key={step.id}>
                        <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                            <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold border-2 transition-all duration-300"
                                 style={{ background: isPast ? "hsl(var(--heroui-primary))" : isCurrent ? "hsl(var(--heroui-info) / 0.12)" : "hsl(var(--heroui-foreground) / 0.04)", borderColor: isPast || isCurrent ? "hsl(var(--heroui-info))" : "hsl(var(--heroui-foreground) / 0.12)", color: isPast ? "#fff" : isCurrent ? "hsl(var(--heroui-info))" : "hsl(var(--heroui-foreground) / 0.35)", boxShadow: isCurrent ? "0 0 14px hsl(var(--heroui-info) / 0.30)" : "none" }}>
                                {isPast ? <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none"><path d="M3 8l3.5 3.5L13 5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg> : i + 1}
                            </div>
                            <span className="font-mono text-[0.5rem] tracking-[0.12em] uppercase hidden sm:block text-center"
                                  style={{ color: isCurrent ? "hsl(var(--heroui-info) / 0.75)" : "hsl(var(--heroui-foreground) / 0.28)" }}>
                                {step.label}{step.optional && <span className="opacity-40"> opt</span>}
                            </span>
                        </div>
                        {i < STEPS.length - 1 && (
                            <div className="flex-1 h-px mx-1.5 mt-3.5 overflow-hidden" style={{ background: "hsl(var(--heroui-foreground) / 0.08)" }}>
                                <div className="h-full transition-all duration-500" style={{ width: i < current ? "100%" : "0%", background: "hsl(var(--heroui-info))" }} />
                            </div>
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
}

/* ═══════════════════════════════════════════
   NAV BUTTONS
═══════════════════════════════════════════ */

function PrimaryBtn({ onClick, disabled, children, wide }: { onClick: () => void; disabled?: boolean; children: React.ReactNode; wide?: boolean }) {
    return (
        <button onClick={onClick} disabled={disabled}
                className={`font-sora font-bold text-[0.88rem] tracking-[0.06em] px-6 py-2.5 rounded-lg cursor-pointer backdrop-blur-sm transition-all duration-200 hover:-translate-y-px active:translate-y-0 disabled:opacity-40 disabled:cursor-not-allowed ${wide ? "w-full" : ""}`}
                style={{ color: "hsl(var(--heroui-foreground))", background: "linear-gradient(135deg, hsl(var(--heroui-info) / 0.16) 0%, hsl(var(--heroui-secondary) / 0.16) 100%)", border: "1px solid hsl(var(--heroui-info) / 0.28)" }}
                onMouseEnter={(e) => { if (!disabled) { e.currentTarget.style.background = "linear-gradient(135deg, hsl(var(--heroui-info) / 0.26) 0%, hsl(var(--heroui-secondary) / 0.26) 100%)"; e.currentTarget.style.boxShadow = "0 0 36px hsl(var(--heroui-info) / 0.18)"; }}}
                onMouseLeave={(e) => { e.currentTarget.style.background = "linear-gradient(135deg, hsl(var(--heroui-info) / 0.16) 0%, hsl(var(--heroui-secondary) / 0.16) 100%)"; e.currentTarget.style.boxShadow = "none"; }}
        >{children}</button>
    );
}

function NavButtons({ onBack, onNext, onSkip, isOptional, isLoading, nextDisabled, nextLabel }: {
    onBack?: () => void; onNext: () => void; onSkip?: () => void;
    isOptional?: boolean; isLoading?: boolean; nextDisabled?: boolean; nextLabel?: string;
}) {
    return (
        <div className="flex items-center justify-between pt-5 mt-5" style={{ borderTop: "1px solid hsl(var(--heroui-foreground) / 0.055)" }}>
            <div>
                {onBack && (
                    <button onClick={onBack} className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border"
                            style={{ color: "hsl(var(--heroui-foreground) / 0.50)", borderColor: "hsl(var(--heroui-foreground) / 0.10)", background: "transparent" }}
                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "hsl(var(--heroui-info) / 0.40)"; e.currentTarget.style.color = "hsl(var(--heroui-info))"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "hsl(var(--heroui-foreground) / 0.10)"; e.currentTarget.style.color = "hsl(var(--heroui-foreground) / 0.50)"; }}
                    >← Back</button>
                )}
            </div>
            <div className="flex items-center gap-3">
                {isOptional && onSkip && (
                    <button onClick={onSkip} className="px-3 py-2 text-sm font-medium transition-colors duration-200"
                            style={{ color: "hsl(var(--heroui-foreground) / 0.35)" }}
                            onMouseEnter={(e) => { e.currentTarget.style.color = "hsl(var(--heroui-foreground) / 0.65)"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.color = "hsl(var(--heroui-foreground) / 0.35)"; }}
                    >Skip →</button>
                )}
                <PrimaryBtn onClick={onNext} disabled={nextDisabled || isLoading}>
                    {isLoading ? "Saving…" : nextLabel ?? "Continue →"}
                </PrimaryBtn>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════
   STEP: WELCOME
═══════════════════════════════════════════ */

function StepWelcome({ onNext }: { onNext: () => void }) {
    return (
        <div className="flex flex-col items-center text-center gap-6 py-2">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl" style={{ background: "hsl(var(--heroui-info) / 0.10)" }}>🗂️</div>
            <div>
                <h2 className="font-sora font-extrabold text-[1.8rem] tracking-[-0.025em] leading-tight m-0" style={{ color: "hsl(var(--heroui-heading))" }}>
                    Welcome to{" "}
                    <span style={{ background: "linear-gradient(90deg, hsl(var(--heroui-info)) 0%, hsl(var(--heroui-primary)) 50%, hsl(var(--heroui-secondary)) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                        ApplyOS
                    </span>
                </h2>
                <p className="font-sans text-[0.83rem] mt-2 mb-0" style={{ color: "hsl(var(--heroui-subheading) / 0.55)" }}>
                    Track every application — jobs, grad school, fellowships, internships — all in one place. Let's build your profile so we can autofill applications for you.
                </p>
            </div>
            <div className="grid grid-cols-2 gap-3 w-full text-left">
                {[
                    { icon: "💼", label: "Jobs & Internships" },
                    { icon: "🎓", label: "Grad School & PhDs" },
                    { icon: "🏆", label: "Fellowships & Grants" },
                    { icon: "⚡", label: "Autofill Applications" },
                ].map(({ icon, label }) => (
                    <div key={label} className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm" style={{ background: "hsl(var(--heroui-foreground) / 0.03)", border: "1px solid hsl(var(--heroui-foreground) / 0.07)", color: "hsl(var(--heroui-foreground) / 0.70)" }}>
                        <span className="text-base">{icon}</span> {label}
                    </div>
                ))}
            </div>
            <PrimaryBtn onClick={onNext} wide>Let's get started →</PrimaryBtn>
        </div>
    );
}

/* ═══════════════════════════════════════════
   STEP: PERSONAL INFO
═══════════════════════════════════════════ */

function StepPersonal({ data, onChange, onNext, onBack, isLoading }: { data: PersonalData; onChange: (d: PersonalData) => void; onNext: () => void; onBack: () => void; isLoading?: boolean }) {
    const isValid = data.firstName.trim().length > 0 && data.lastName.trim().length > 0;
    const s = (k: keyof PersonalData) => (v: string) => onChange({ ...data, [k]: v });
    return (
        <div className="flex flex-col gap-4">
            <div>
                <h2 className="font-sora font-extrabold text-[1.4rem] tracking-tight m-0" style={{ color: "hsl(var(--heroui-heading))" }}>Personal Info</h2>
                <p className="font-sans text-[0.83rem] mt-1 mb-0" style={{ color: "hsl(var(--heroui-subheading) / 0.55)" }}>Used to autofill your name and identity fields on applications.</p>
            </div>
            <div className="flex gap-4">
                <Field label="First Name *" half><SI value={data.firstName} onChange={s("firstName")} placeholder="Jane" /></Field>
                <Field label="Last Name *" half><SI value={data.lastName} onChange={s("lastName")} placeholder="Smith" /></Field>
            </div>
            <Field label="Date of Birth" hint="Used for applications that require it"><SI type="date" value={data.dateOfBirth} onChange={s("dateOfBirth")} /></Field>
            <div className="flex gap-4">
                <Field label="Nationality" half><SI value={data.nationality} onChange={s("nationality")} placeholder="e.g. American" /></Field>
                <Field label="Pronouns" half><SS value={data.pronouns} onChange={s("pronouns")} options={["He/Him", "She/Her", "They/Them", "Prefer not to say"]} placeholder="Select…" /></Field>
            </div>
            <NavButtons onBack={onBack} onNext={onNext} nextDisabled={!isValid} isLoading={isLoading} />
        </div>
    );
}

/* ═══════════════════════════════════════════
   STEP: CONTACT & ADDRESS
═══════════════════════════════════════════ */

function StepContact({ data, onChange, onNext, onBack, isLoading }: { data: ContactData; onChange: (d: ContactData) => void; onNext: () => void; onBack: () => void; isLoading?: boolean }) {
    const isValid = data.email.trim().length > 0;
    const s = (k: keyof ContactData) => (v: string) => onChange({ ...data, [k]: v });
    return (
        <div className="flex flex-col gap-4">
            <div>
                <h2 className="font-sora font-extrabold text-[1.4rem] tracking-tight m-0" style={{ color: "hsl(var(--heroui-heading))" }}>Contact & Address</h2>
                <p className="font-sans text-[0.83rem] mt-1 mb-0" style={{ color: "hsl(var(--heroui-subheading) / 0.55)" }}>Your primary contact details and mailing address for applications.</p>
            </div>
            <SectionTitle>Contact</SectionTitle>
            <Field label="Email Address *"><SI type="email" value={data.email} onChange={s("email")} placeholder="jane@email.com" /></Field>
            <Field label="Phone Number"><SI type="tel" value={data.phone} onChange={s("phone")} placeholder="+1 (555) 000-0000" /></Field>
            <Divider />
            <SectionTitle>Mailing Address</SectionTitle>
            <Field label="Address Line 1"><SI value={data.addressLine1} onChange={s("addressLine1")} placeholder="123 Main St" /></Field>
            <Field label="Address Line 2"><SI value={data.addressLine2} onChange={s("addressLine2")} placeholder="Apt 4B (optional)" /></Field>
            <div className="flex gap-4">
                <Field label="City" half><SI value={data.city} onChange={s("city")} placeholder="New York" /></Field>
                <Field label="State / Province" half><SI value={data.state} onChange={s("state")} placeholder="NY" /></Field>
            </div>
            <div className="flex gap-4">
                <Field label="ZIP / Postal Code" half><SI value={data.zip} onChange={s("zip")} placeholder="10001" /></Field>
                <Field label="Country" half><SI value={data.country} onChange={s("country")} placeholder="United States" /></Field>
            </div>
            <NavButtons onBack={onBack} onNext={onNext} nextDisabled={!isValid} isLoading={isLoading} />
        </div>
    );
}

/* ═══════════════════════════════════════════
   STEP: EDUCATION
═══════════════════════════════════════════ */

const DEGREE_OPTIONS = ["High School Diploma", "Associate's", "Bachelor's", "Master's", "MBA", "PhD", "JD", "MD", "Certificate", "Other"];

function StepEducation({ data, onChange, onNext, onBack, isLoading }: { data: EducationEntry[]; onChange: (d: EducationEntry[]) => void; onNext: () => void; onBack: () => void; isLoading?: boolean }) {
    const add = () => onChange([...data, newEducation()]);
    const remove = (id: string) => onChange(data.filter((e) => e.id !== id));
    const update = (id: string, field: keyof EducationEntry, value: string) =>
        onChange(data.map((e) => e.id === id ? { ...e, [field]: value } : e));
    return (
        <div className="flex flex-col gap-4">
            <div>
                <h2 className="font-sora font-extrabold text-[1.4rem] tracking-tight m-0" style={{ color: "hsl(var(--heroui-heading))" }}>Education</h2>
                <p className="font-sans text-[0.83rem] mt-1 mb-0" style={{ color: "hsl(var(--heroui-subheading) / 0.55)" }}>Add your academic history. Required for grad school and most job applications.</p>
            </div>
            {data.length === 0 && (
                <div className="rounded-lg px-4 py-6 text-center text-sm" style={{ background: "hsl(var(--heroui-foreground) / 0.03)", border: "1px dashed hsl(var(--heroui-foreground) / 0.12)", color: "hsl(var(--heroui-foreground) / 0.40)" }}>
                    No education added yet. Add at least one entry.
                </div>
            )}
            {data.map((entry, idx) => (
                <div key={entry.id} className="rounded-xl p-4 flex flex-col gap-3" style={{ background: "hsl(var(--heroui-foreground) / 0.03)", border: "1px solid hsl(var(--heroui-foreground) / 0.08)" }}>
                    <div className="flex items-center justify-between">
                        <SectionTitle>Education #{idx + 1}</SectionTitle>
                        <RemoveBtn onClick={() => remove(entry.id)} />
                    </div>
                    <Field label="Institution"><SI value={entry.institution} onChange={(v) => update(entry.id, "institution", v)} placeholder="e.g. MIT, Stanford, Community College" /></Field>
                    <div className="flex gap-4">
                        <Field label="Degree" half><SS value={entry.degree} onChange={(v) => update(entry.id, "degree", v)} options={DEGREE_OPTIONS} placeholder="Select…" /></Field>
                        <Field label="Field of Study" half><SI value={entry.field} onChange={(v) => update(entry.id, "field", v)} placeholder="e.g. Computer Science" /></Field>
                    </div>
                    <div className="flex gap-4">
                        <Field label="Start Year" half><SI value={entry.startYear} onChange={(v) => update(entry.id, "startYear", v)} placeholder="2020" /></Field>
                        <Field label="End Year (or Expected)" half><SI value={entry.endYear} onChange={(v) => update(entry.id, "endYear", v)} placeholder="2024" /></Field>
                    </div>
                    <Field label="GPA" hint="Optional — only include if strong"><SI value={entry.gpa} onChange={(v) => update(entry.id, "gpa", v)} placeholder="e.g. 3.8 / 4.0" /></Field>
                </div>
            ))}
            <AddBtn onClick={add}>Add Education</AddBtn>
            <NavButtons onBack={onBack} onNext={onNext} nextDisabled={data.length === 0} isLoading={isLoading} />
        </div>
    );
}

/* ═══════════════════════════════════════════
   STEP: EMPLOYMENT (optional)
═══════════════════════════════════════════ */

function StepEmployment({ data, onChange, onNext, onBack, onSkip, isLoading }: { data: EmploymentEntry[]; onChange: (d: EmploymentEntry[]) => void; onNext: () => void; onBack: () => void; onSkip: () => void; isLoading?: boolean }) {
    const add = () => onChange([...data, newEmployment()]);
    const remove = (id: string) => onChange(data.filter((e) => e.id !== id));
    const update = (id: string, field: keyof EmploymentEntry, value: string | boolean) =>
        onChange(data.map((e) => e.id === id ? { ...e, [field]: value } : e));
    return (
        <div className="flex flex-col gap-4">
            <div>
                <h2 className="font-sora font-extrabold text-[1.4rem] tracking-tight m-0" style={{ color: "hsl(var(--heroui-heading))" }}>Work Experience</h2>
                <p className="font-sans text-[0.83rem] mt-1 mb-0" style={{ color: "hsl(var(--heroui-subheading) / 0.55)" }}>Your employment history for job applications. Skip this if you're only applying to graduate programs.</p>
            </div>
            <div className="rounded-lg px-3.5 py-2.5 text-xs" style={{ background: "hsl(var(--heroui-warning) / 0.06)", border: "1px solid hsl(var(--heroui-warning) / 0.18)", color: "hsl(var(--heroui-warning) / 0.80)" }}>
                💡 Skip this step if you're applying primarily to academic programs — you can always add it later.
            </div>
            {data.length === 0 && (
                <div className="rounded-lg px-4 py-6 text-center text-sm" style={{ background: "hsl(var(--heroui-foreground) / 0.03)", border: "1px dashed hsl(var(--heroui-foreground) / 0.12)", color: "hsl(var(--heroui-foreground) / 0.40)" }}>
                    No work experience added yet.
                </div>
            )}
            {data.map((entry, idx) => (
                <div key={entry.id} className="rounded-xl p-4 flex flex-col gap-3" style={{ background: "hsl(var(--heroui-foreground) / 0.03)", border: "1px solid hsl(var(--heroui-foreground) / 0.08)" }}>
                    <div className="flex items-center justify-between">
                        <SectionTitle>Position #{idx + 1}</SectionTitle>
                        <RemoveBtn onClick={() => remove(entry.id)} />
                    </div>
                    <div className="flex gap-4">
                        <Field label="Employer" half><SI value={entry.employer} onChange={(v) => update(entry.id, "employer", v)} placeholder="e.g. Google, Startup Inc." /></Field>
                        <Field label="Job Title" half><SI value={entry.title} onChange={(v) => update(entry.id, "title", v)} placeholder="e.g. Software Engineer" /></Field>
                    </div>
                    <div className="flex gap-4">
                        <Field label="Start Date" half><SI type="month" value={entry.startDate} onChange={(v) => update(entry.id, "startDate", v)} /></Field>
                        <Field label="End Date" hint={entry.current ? "Currently working here" : undefined} half>
                            {entry.current
                                ? <div className="w-full rounded-[7px] px-3.5 py-2.5 text-sm" style={{ background: "hsl(var(--heroui-foreground) / 0.03)", border: "1px solid hsl(var(--heroui-foreground) / 0.10)", color: "hsl(var(--heroui-foreground) / 0.35)" }}>Present</div>
                                : <SI type="month" value={entry.endDate} onChange={(v) => update(entry.id, "endDate", v)} />}
                        </Field>
                    </div>
                    <label className="flex items-center gap-2 text-xs cursor-pointer" style={{ color: "hsl(var(--heroui-foreground) / 0.60)" }}>
                        <input type="checkbox" checked={entry.current} onChange={(e) => update(entry.id, "current", e.target.checked)} className="rounded" />
                        I currently work here
                    </label>
                    <Field label="Description" hint="Brief summary of responsibilities / achievements">
                        <STA value={entry.description} onChange={(v) => update(entry.id, "description", v)} placeholder="Led a team of 3 engineers, built X feature, improved Y by Z%…" rows={3} />
                    </Field>
                </div>
            ))}
            <AddBtn onClick={add}>Add Position</AddBtn>
            <NavButtons onBack={onBack} onNext={onNext} onSkip={onSkip} isOptional isLoading={isLoading} />
        </div>
    );
}

/* ═══════════════════════════════════════════
   STEP: LINKS & DOCUMENTS (optional)
═══════════════════════════════════════════ */

function StepLinks({ data, onChange, onNext, onBack, onSkip, isLoading }: { data: LinksData; onChange: (d: LinksData) => void; onNext: () => void; onBack: () => void; onSkip: () => void; isLoading?: boolean }) {
    const s = (k: keyof LinksData) => (v: string) => onChange({ ...data, [k]: v });
    return (
        <div className="flex flex-col gap-4">
            <div>
                <h2 className="font-sora font-extrabold text-[1.4rem] tracking-tight m-0" style={{ color: "hsl(var(--heroui-heading))" }}>Links & Documents</h2>
                <p className="font-sans text-[0.83rem] mt-1 mb-0" style={{ color: "hsl(var(--heroui-subheading) / 0.55)" }}>Your online presence and documents. We'll use these to autofill relevant fields.</p>
            </div>
            <SectionTitle>Professional Links</SectionTitle>
            <Field label="LinkedIn URL"><SI type="url" value={data.linkedinUrl} onChange={s("linkedinUrl")} placeholder="https://linkedin.com/in/yourname" /></Field>
            <Field label="GitHub URL"><SI type="url" value={data.githubUrl} onChange={s("githubUrl")} placeholder="https://github.com/yourname" /></Field>
            <Field label="Portfolio / Personal Site"><SI type="url" value={data.portfolioUrl} onChange={s("portfolioUrl")} placeholder="https://yoursite.com" /></Field>
            <Divider />
            <SectionTitle>Resume / CV Summary</SectionTitle>
            <div className="rounded-lg px-3.5 py-2.5 text-xs" style={{ background: "hsl(var(--heroui-info) / 0.06)", border: "1px solid hsl(var(--heroui-info) / 0.14)", color: "hsl(var(--heroui-info) / 0.70)" }}>
                💡 Paste your resume or a short bio. We'll use this to help autofill essay prompts and summaries.
            </div>
            <Field label="Resume Text / Bio" hint="Plain text — no formatting needed">
                <STA value={data.resumeText} onChange={s("resumeText")} placeholder="Paste your resume or a short professional bio here…" rows={5} />
            </Field>
            <NavButtons onBack={onBack} onNext={onNext} onSkip={onSkip} isOptional isLoading={isLoading} />
        </div>
    );
}

/* ═══════════════════════════════════════════
   STEP: DONE
═══════════════════════════════════════════ */

function StepDone({ onFinish, isLoading }: { onFinish: () => void; isLoading: boolean }) {
    return (
        <div className="flex flex-col items-center text-center gap-6 py-2">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl animate-bounce" style={{ background: "hsl(var(--heroui-success) / 0.12)" }}>🎉</div>
            <div>
                <h2 className="font-sora font-extrabold text-[1.8rem] tracking-[-0.025em] leading-tight m-0" style={{ color: "hsl(var(--heroui-heading))" }}>You're all set!</h2>
                <p className="font-sans text-[0.83rem] mt-2 mb-0" style={{ color: "hsl(var(--heroui-subheading) / 0.55)" }}>
                    Your profile is saved. Head to your dashboard to start tracking applications — jobs, grad school, fellowships, and more.
                </p>
            </div>
            <div className="grid grid-cols-3 gap-2 w-full text-xs text-center">
                {[{ icon: "✅", label: "Profile saved" }, { icon: "⚡", label: "Autofill ready" }, { icon: "🗂️", label: "Track anything" }].map(({ icon, label }) => (
                    <div key={label} className="rounded-lg py-2.5 px-2" style={{ background: "hsl(var(--heroui-success) / 0.06)", border: "1px solid hsl(var(--heroui-success) / 0.14)", color: "hsl(var(--heroui-success) / 0.80)" }}>
                        <div className="text-lg mb-0.5">{icon}</div>{label}
                    </div>
                ))}
            </div>
            <PrimaryBtn onClick={onFinish} disabled={isLoading} wide>{isLoading ? "Saving…" : "Go to Dashboard →"}</PrimaryBtn>
        </div>
    );
}

/* ═══════════════════════════════════════════
   MAIN WIZARD
═══════════════════════════════════════════ */

export default function OnboardingWizard() {
    const router = useRouter();
    const [stepIndex, setStepIndex] = useState(0);
    const [data, setData]           = useState<WizardData>(EMPTY_DATA);
    const [isSaving, setIsSaving]   = useState(false);
    const [error, setError]         = useState<string | null>(null);

    // ── Prefill from current user session ─────────────────────────────────────
    const { data: currentUser } = useQuery({
        queryKey: ["currentUser"],
        queryFn:  () => apiRouter.sessions.showUser(),
    });

    useEffect(() => {
        if (!currentUser?.user) return;
        setData((d) => ({
            ...d,
            personal: {
                ...d.personal,
                firstName: currentUser.user.first_name ?? "",
                lastName:  currentUser.user.last_name  ?? "",
            },
            contact: {
                ...d.contact,
                email: currentUser.user.email_address ?? "",
            },
        }));
    }, [currentUser]);

    // ── Navigation ─────────────────────────────────────────────────────────────
    const goBack   = () => setStepIndex((i) => Math.max(i - 1, 0));
    const skipNext = () => setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));

    const saveAndNext = async () => {
        setError(null);
        setIsSaving(true);
        try {
            const result = await apiRouter.profile.updateProfile(data);

            if (result?.savedEducations?.length) {
                setData((d) => ({
                    ...d,
                    education: d.education.map((edu) => {
                        const saved = result.savedEducations.find((s: any) => s.localId === edu.id);
                        return saved ? { ...edu, id: saved.dbId } : edu;
                    }),
                }));
            }

            if (result?.savedEmployments?.length) {
                setData((d) => ({
                    ...d,
                    employment: d.employment.map((job) => {
                        const saved = result.savedEmployments.find((s: any) => s.localId === job.id);
                        return saved ? { ...job, id: saved.dbId } : job;
                    }),
                }));
            }

            setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
        } catch (err) {
            setError("Failed to save. Please try again.");
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    const finish = async () => {
        setError(null);
        setIsSaving(true);
        try {
            await apiRouter.profile.updateProfile(data);
            router.push("/dashboard");
        } catch (err) {
            setError("Failed to save. Please try again.");
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    const currentId = STEPS[stepIndex].id;

    return (
        <ThreeBackground>
            {/* Nav */}
            <nav className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-10 py-6">
                <span className="font-mono text-sm tracking-[0.22em] uppercase opacity-65 select-none" style={{ color: "hsl(var(--heroui-info))" }}>ApplyOS</span>
            </nav>

            {/* Scrollable form */}
            <div className="absolute inset-0 z-20 overflow-y-auto">
                <div className="min-h-full flex flex-col items-center justify-center py-24">
                    <div className="w-[90%]">

                        {/* Glass card */}
                        <div className="rounded-2xl backdrop-blur-[28px] px-9 pt-8 pb-8 transition-colors duration-500"
                             style={{ background: "hsl(var(--heroui-card) / 0.80)", border: "1px solid hsl(var(--heroui-info) / 0.13)", boxShadow: "0 0 60px hsl(var(--heroui-info) / 0.06), 0 0 120px hsl(var(--heroui-secondary) / 0.06), inset 0 1px 0 hsl(var(--heroui-foreground) / 0.05)" }}>

                            {/* Badge */}
                            <div className="mb-5">
                                <div className="inline-flex items-center gap-[0.45rem] font-mono text-[0.61rem] tracking-[0.2em] uppercase rounded-full px-3 py-1.5 backdrop-blur-sm"
                                     style={{ color: "hsl(var(--heroui-info) / 0.60)", border: "1px solid hsl(var(--heroui-info) / 0.14)", background: "hsl(var(--heroui-info) / 0.04)" }}>
                                    <span className="inline-block w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "hsl(var(--heroui-success))", boxShadow: "0 0 6px hsl(var(--heroui-success))" }} />
                                    Profile Setup
                                </div>
                            </div>

                            <ProgressBar current={stepIndex} />

                            {/* Error banner */}
                            {error && (
                                <div className="mb-4 px-4 py-2.5 rounded-lg text-sm" style={{ background: "hsl(var(--heroui-danger) / 0.08)", border: "1px solid hsl(var(--heroui-danger) / 0.25)", color: "hsl(var(--heroui-danger) / 0.85)" }}>
                                    {error}
                                </div>
                            )}

                            {currentId === "welcome"    && <StepWelcome    onNext={skipNext} />}
                            {currentId === "profile"    && <StepPersonal   data={data.personal}   onChange={(p) => setData((d) => ({ ...d, personal: p }))}   onNext={saveAndNext} onBack={goBack} isLoading={isSaving} />}
                            {currentId === "contact"    && <StepContact    data={data.contact}    onChange={(c) => setData((d) => ({ ...d, contact: c }))}    onNext={saveAndNext} onBack={goBack} isLoading={isSaving} />}
                            {currentId === "education"  && <StepEducation  data={data.education}  onChange={(e) => setData((d) => ({ ...d, education: e }))}  onNext={saveAndNext} onBack={goBack} isLoading={isSaving} />}
                            {currentId === "employment" && <StepEmployment data={data.employment} onChange={(e) => setData((d) => ({ ...d, employment: e }))} onNext={saveAndNext} onBack={goBack} onSkip={skipNext} isLoading={isSaving} />}
                            {currentId === "links"      && <StepLinks      data={data.links}      onChange={(l) => setData((d) => ({ ...d, links: l }))}      onNext={saveAndNext} onBack={goBack} onSkip={skipNext} isLoading={isSaving} />}
                            {currentId === "done"       && <StepDone       onFinish={finish} isLoading={isSaving} />}
                        </div>

                        <p className="font-sans text-[0.77rem] text-center mt-4" style={{ color: "hsl(var(--heroui-subheading) / 0.35)" }}>
                            All fields can be updated anytime from your profile settings.
                        </p>
                    </div>
                </div>
            </div>
        </ThreeBackground>
    );
}