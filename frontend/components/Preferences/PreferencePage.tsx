"use client";

import { useRef, useState } from "react";
import {
    Input,
    Button,
    Switch,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure,
} from "@heroui/react";

/* ─────────────────────────────────────────────
   TYPES
───────────────────────────────────────────── */
export interface NotifPrefs {
    appUpdates: boolean;
    weeklyDigest: boolean;
    interviewReminders: boolean;
    pushMessages: boolean;
    pushStatus: boolean;
}

export type FeedbackState = { kind: "success" | "error"; msg: string } | null;

/* ─────────────────────────────────────────────
   SHARED INPUT CLASS NAMES
───────────────────────────────────────────── */
export const inputCN = (accent: "cyan" | "violet" | "red" = "cyan") => {
    const map = {
        cyan:   { focus: "data-[focus=true]:border-info/60",       hover: "hover:border-info/40" },
        violet: { focus: "data-[focus=true]:border-secondary/60",   hover: "hover:border-secondary/40" },
        red:    { focus: "data-[focus=true]:border-danger/60",      hover: "hover:border-danger/40" },
    }[accent];
    return {
        inputWrapper: `border-border bg-card ${map.hover} ${map.focus}`,
        input: "text-text placeholder:text-muted",
        label: "text-muted text-xs",
    };
};

/* ─────────────────────────────────────────────
   DIVIDER
───────────────────────────────────────────── */
const Divider = () => <div className="h-px bg-border w-full" />;

/* ─────────────────────────────────────────────
   SECTION CARD
───────────────────────────────────────────── */
export function SectionCard({
                                eyebrow,
                                title,
                                dotClass,
                                borderClass,
                                children,
                            }: {
    eyebrow: string;
    title: string;
    dotClass: string;
    borderClass: string;
    children: React.ReactNode;
}) {
    return (
        <div className={`flex flex-col gap-4 rounded-xl p-5 bg-card border ${borderClass} w-full h-full flex-1`}>
            <div className="flex flex-col gap-0.5">
                <div className="inline-flex items-center gap-1.5 w-fit px-3 py-1 rounded-full border border-border bg-background">
                    <span className={`inline-block w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotClass}`} />
                    <span className="text-muted text-[0.6rem] tracking-[0.2em] uppercase font-mono">
                        {eyebrow}
                    </span>
                </div>
                <h2 className="text-heading font-extrabold text-xl tracking-tight m-0">
                    {title}
                </h2>
            </div>
            {children}
        </div>
    );
}

/* ─────────────────────────────────────────────
   FEEDBACK BANNER
───────────────────────────────────────────── */
export function Feedback({ state }: { state: FeedbackState }) {
    if (!state) return null;
    const ok = state.kind === "success";
    return (
        <div className={`flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-sm border ${
            ok
                ? "bg-success/10 border-success/25 text-success"
                : "bg-danger/10 border-danger/25 text-danger"
        }`}>
            {ok ? (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                </svg>
            ) : (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
            )}
            <span>{state.msg}</span>
        </div>
    );
}

/* ─────────────────────────────────────────────
   PASSWORD STRENGTH BAR
───────────────────────────────────────────── */
export function StrengthBar({ password }: { password: string }) {
    if (!password) return null;
    let s = 0;
    if (password.length >= 8) s++;
    if (password.length >= 12) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;

    const levels: { label: string; widthClass: string; colorClass: string; textClass: string }[] = [
        { label: "Weak",   widthClass: "w-1/4",  colorClass: "bg-danger",  textClass: "text-danger" },
        { label: "Weak",   widthClass: "w-1/4",  colorClass: "bg-danger",  textClass: "text-danger" },
        { label: "Weak",   widthClass: "w-1/4",  colorClass: "bg-danger",  textClass: "text-danger" },
        { label: "Fair",   widthClass: "w-1/2",  colorClass: "bg-warning", textClass: "text-warning" },
        { label: "Good",   widthClass: "w-3/4",  colorClass: "bg-info",    textClass: "text-info" },
        { label: "Strong", widthClass: "w-full", colorClass: "bg-success", textClass: "text-success" },
    ];
    const { label, widthClass, colorClass, textClass } = levels[Math.min(s, 5)];

    return (
        <div className="flex flex-col gap-1.5">
            <div className="h-[3px] w-full rounded-full overflow-hidden bg-border">
                <div className={`h-full rounded-full transition-all duration-300 ${widthClass} ${colorClass}`} />
            </div>
            <span className={`text-[0.58rem] tracking-[0.14em] uppercase font-mono ${textClass}`}>
                Strength: {label}
            </span>
        </div>
    );
}

/* ─────────────────────────────────────────────
   EYE TOGGLE
───────────────────────────────────────────── */
export function EyeToggle({ visible, onToggle }: { visible: boolean; onToggle: () => void }) {
    return (
        <button
            type="button"
            onClick={onToggle}
            className="flex items-center bg-transparent border-none cursor-pointer text-muted hover:text-info transition-colors"
        >
            {visible ? (
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
            ) : (
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                </svg>
            )}
        </button>
    );
}

/* ─────────────────────────────────────────────
   PROFILE CARD
───────────────────────────────────────────── */
export function ProfileCard() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [displayName, setDisplayName] = useState("Jane Doe");
    const [editingName, setEditingName] = useState(false);
    const [nameInput, setNameInput] = useState("Jane Doe");
    const [avatarSrc, setAvatarSrc] = useState<string | null>(null);
    const [pendingAvatar, setPendingAvatar] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<FeedbackState>(null);

    const email = "jane.doe@email.com";
    const joinedDate = "March 2025";
    const initials = displayName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    const currentAvatar = pendingAvatar ?? avatarSrc;
    const hasChanges = !!pendingAvatar || (editingName && nameInput !== displayName);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = ev => setPendingAvatar(ev.target?.result as string);
        reader.readAsDataURL(file);
    };

    const handleSave = () => {
        if (pendingAvatar) setAvatarSrc(pendingAvatar);
        if (editingName) setDisplayName(nameInput);
        setPendingAvatar(null);
        setEditingName(false);
        setFeedback({ kind: "success", msg: "Profile updated successfully." });
        setTimeout(() => setFeedback(null), 4000);
    };

    return (
        <SectionCard eyebrow="Profile" title="Your Profile" dotClass="bg-info" borderClass="border-info/20">
            <div className="flex flex-row gap-5 items-center">

                {/* Avatar column */}
                <div className="flex flex-col items-center gap-2 flex-shrink-0">
                    <div
                        className="relative cursor-pointer rounded-full w-[72px] h-[72px]"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {currentAvatar ? (
                            <img
                                src={currentAvatar}
                                alt="avatar"
                                className="w-full h-full rounded-full object-cover border-2 border-info/35"
                            />
                        ) : (
                            <div className="w-full h-full rounded-full border-2 border-info/35 bg-background flex items-center justify-center text-info font-extrabold text-xl tracking-tight font-mono">
                                {initials}
                            </div>
                        )}
                        <div className="absolute inset-0 rounded-full bg-background/70 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-info">
                                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                                <circle cx="12" cy="13" r="4"/>
                            </svg>
                        </div>
                    </div>

                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-[0.58rem] tracking-[0.14em] uppercase font-mono text-muted hover:text-info border border-border hover:border-info/40 rounded px-2.5 py-1 bg-transparent hover:bg-card transition-all cursor-pointer"
                    >
                        Upload
                    </button>

                    {pendingAvatar && (
                        <span className="text-[0.55rem] tracking-[0.1em] uppercase font-mono text-warning border border-warning/25 bg-warning/5 px-2.5 py-1 rounded-full">
                            Preview
                        </span>
                    )}
                </div>

                {/* Info — all in one row */}
                <div className="flex-1 flex flex-wrap gap-x-8 gap-y-2 min-w-0">

                    {/* Display name */}
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[0.58rem] tracking-[0.16em] uppercase font-mono text-muted">Display Name</span>
                        {editingName ? (
                            <div className="flex gap-2 items-center">
                                <Input
                                    value={nameInput}
                                    onValueChange={setNameInput}
                                    variant="bordered"
                                    size="sm"
                                    classNames={inputCN("cyan")}
                                    autoFocus
                                />
                                <button
                                    type="button"
                                    onClick={() => { setEditingName(false); setNameInput(displayName); }}
                                    className="bg-transparent border-none cursor-pointer text-muted hover:text-danger transition-colors flex-shrink-0"
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                                    </svg>
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-1.5">
                                <span className="text-heading font-bold text-base tracking-tight">{displayName}</span>
                                <button
                                    type="button"
                                    onClick={() => { setEditingName(true); setNameInput(displayName); }}
                                    className="bg-transparent border-none cursor-pointer text-muted hover:text-info transition-colors"
                                    title="Edit name"
                                >
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                    </svg>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Email */}
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[0.58rem] tracking-[0.16em] uppercase font-mono text-muted">Email</span>
                        <div className="flex items-center gap-1.5">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-info/50 flex-shrink-0">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                            </svg>
                            <span className="text-sm text-subheading">{email}</span>
                        </div>
                    </div>

                    {/* Member since */}
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[0.58rem] tracking-[0.16em] uppercase font-mono text-muted">Member Since</span>
                        <div className="flex items-center gap-1.5">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-success/60 flex-shrink-0">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                            </svg>
                            <span className="text-sm text-subheading">{joinedDate}</span>
                        </div>
                    </div>

                    {hasChanges && (
                        <div className="w-full flex gap-2 flex-wrap">
                            <Button size="sm" variant="bordered" onPress={handleSave}
                                    className="border-info/30 bg-info/10 text-foreground hover:bg-info/20 hover:border-info/55 font-bold tracking-wide">
                                Save Profile
                            </Button>
                            {pendingAvatar && (
                                <Button size="sm" variant="bordered"
                                        onPress={() => { setPendingAvatar(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                                        className="border-border bg-card text-muted hover:bg-card_hover hover:text-subheading font-medium tracking-wide">
                                    Discard Photo
                                </Button>
                            )}
                        </div>
                    )}

                    {feedback && <div className="w-full"><Feedback state={feedback} /></div>}
                </div>
            </div>
        </SectionCard>
    );
}

/* ─────────────────────────────────────────────
   ACCOUNT CARD (email + password combined)
───────────────────────────────────────────── */
export function AccountCard() {
    const [newEmail, setNewEmail] = useState("");
    const [confirmEmail, setConfirmEmail] = useState("");
    const [emailErrors, setEmailErrors] = useState<Record<string, string>>({});
    const [emailLoading, setEmailLoading] = useState(false);
    const [emailFeedback, setEmailFeedback] = useState<FeedbackState>(null);

    const [currentPw, setCurrentPw] = useState("");
    const [newPw, setNewPw] = useState("");
    const [confirmPw, setConfirmPw] = useState("");
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [pwErrors, setPwErrors] = useState<Record<string, string>>({});
    const [pwLoading, setPwLoading] = useState(false);
    const [pwFeedback, setPwFeedback] = useState<FeedbackState>(null);

    const validateEmail = () => {
        const e: Record<string, string> = {};
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!newEmail) e.newEmail = "Email is required";
        else if (!re.test(newEmail)) e.newEmail = "Enter a valid email";
        if (!confirmEmail) e.confirmEmail = "Please confirm your email";
        else if (newEmail !== confirmEmail) e.confirmEmail = "Emails do not match";
        setEmailErrors(e);
        return !Object.keys(e).length;
    };

    const validatePw = () => {
        const e: Record<string, string> = {};
        if (!currentPw) e.currentPw = "Current password is required";
        if (!newPw) e.newPw = "New password is required";
        else if (newPw.length < 8) e.newPw = "At least 8 characters";
        else if (!/[A-Z]/.test(newPw)) e.newPw = "Must include uppercase letter";
        else if (!/[0-9]/.test(newPw)) e.newPw = "Must include a number";
        if (!confirmPw) e.confirmPw = "Please confirm your password";
        else if (newPw !== confirmPw) e.confirmPw = "Passwords do not match";
        setPwErrors(e);
        return !Object.keys(e).length;
    };

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateEmail()) return;
        setEmailLoading(true);
        await new Promise(r => setTimeout(r, 900));
        setEmailLoading(false);
        setNewEmail(""); setConfirmEmail(""); setEmailErrors({});
        setEmailFeedback({ kind: "success", msg: "Email updated successfully." });
        setTimeout(() => setEmailFeedback(null), 4000);
    };

    const handlePwSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validatePw()) return;
        setPwLoading(true);
        await new Promise(r => setTimeout(r, 900));
        setPwLoading(false);
        setCurrentPw(""); setNewPw(""); setConfirmPw(""); setPwErrors({});
        setPwFeedback({ kind: "success", msg: "Password changed successfully." });
        setTimeout(() => setPwFeedback(null), 4000);
    };

    return (
        <SectionCard eyebrow="Credentials" title="Email & Password" dotClass="bg-info" borderClass="border-info/20">
            {/* Email section */}
            <form onSubmit={handleEmailSubmit} className="flex flex-col gap-3" noValidate>
                <p className="text-[0.58rem] tracking-[0.16em] uppercase font-mono text-muted m-0">Email Address</p>
                <Input
                    label="New Email Address"
                    type="email"
                    placeholder="new@email.com"
                    value={newEmail}
                    onValueChange={setNewEmail}
                    variant="bordered"
                    isInvalid={!!emailErrors.newEmail}
                    errorMessage={emailErrors.newEmail}
                    classNames={inputCN("cyan")}
                />
                <Input
                    label="Confirm New Email"
                    type="email"
                    placeholder="new@email.com"
                    value={confirmEmail}
                    onValueChange={setConfirmEmail}
                    variant="bordered"
                    isInvalid={!!emailErrors.confirmEmail}
                    errorMessage={emailErrors.confirmEmail}
                    classNames={inputCN("cyan")}
                />
                {emailFeedback && <Feedback state={emailFeedback} />}
                <div className="flex justify-end">
                    <Button type="submit" isLoading={emailLoading} variant="bordered"
                            className="border-info/30 bg-info/10 text-foreground hover:bg-info/20 hover:border-info/55 font-bold tracking-wide">
                        Update Email
                    </Button>
                </div>
            </form>

            <Divider />

            {/* Password section */}
            <form onSubmit={handlePwSubmit} className="flex flex-col gap-3" noValidate>
                <p className="text-[0.58rem] tracking-[0.16em] uppercase font-mono text-muted m-0">Password</p>
                <Input
                    label="Current Password"
                    type={showCurrent ? "text" : "password"}
                    placeholder="••••••••"
                    value={currentPw}
                    onValueChange={setCurrentPw}
                    variant="bordered"
                    isInvalid={!!pwErrors.currentPw}
                    errorMessage={pwErrors.currentPw}
                    endContent={<EyeToggle visible={showCurrent} onToggle={() => setShowCurrent(v => !v)} />}
                    classNames={inputCN("violet")}
                />
                <Input
                    label="New Password"
                    type={showNew ? "text" : "password"}
                    placeholder="••••••••"
                    value={newPw}
                    onValueChange={setNewPw}
                    variant="bordered"
                    isInvalid={!!pwErrors.newPw}
                    errorMessage={pwErrors.newPw}
                    endContent={<EyeToggle visible={showNew} onToggle={() => setShowNew(v => !v)} />}
                    classNames={inputCN("violet")}
                />
                <StrengthBar password={newPw} />
                <Input
                    label="Confirm New Password"
                    type={showConfirm ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPw}
                    onValueChange={setConfirmPw}
                    variant="bordered"
                    isInvalid={!!pwErrors.confirmPw}
                    errorMessage={pwErrors.confirmPw}
                    endContent={<EyeToggle visible={showConfirm} onToggle={() => setShowConfirm(v => !v)} />}
                    classNames={inputCN("violet")}
                />
                {pwFeedback && <Feedback state={pwFeedback} />}
                <div className="flex justify-end">
                    <Button type="submit" isLoading={pwLoading} variant="bordered"
                            className="border-secondary/30 bg-secondary/10 text-foreground hover:bg-secondary/20 hover:border-secondary/55 font-bold tracking-wide">
                        Update Password
                    </Button>
                </div>
            </form>
        </SectionCard>
    );
}


export function NotificationsCard() {
    const [notifs, setNotifs] = useState<NotifPrefs>({
        appUpdates: true,
        weeklyDigest: false,
        interviewReminders: true,
        pushMessages: true,
        pushStatus: false,
    });
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState<FeedbackState>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        await new Promise(r => setTimeout(r, 700));
        setLoading(false);
        setFeedback({ kind: "success", msg: "Notification preferences saved." });
        setTimeout(() => setFeedback(null), 4000);
    };

    const NotifLabel = ({ label, desc }: { label: string; desc: string }) => (
        <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-text">{label}</span>
            <span className="text-xs text-muted">{desc}</span>
        </div>
    );

    const emailSwitchCN = {
        wrapper: "bg-border group-data-[selected=true]:bg-success/30",
        thumb: "bg-muted group-data-[selected=true]:bg-success",
    };
    const pushSwitchCN = {
        wrapper: "bg-border group-data-[selected=true]:bg-info/30",
        thumb: "bg-muted group-data-[selected=true]:bg-info",
    };

    return (
        <SectionCard eyebrow="Notifications" title="Notification Preferences" dotClass="bg-success" borderClass="border-success/20">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 flex-1" noValidate>
                <div className="flex flex-col gap-2">
                    <p className="text-[0.58rem] tracking-[0.16em] uppercase font-mono text-muted m-0">Email</p>
                    <Switch isSelected={notifs.appUpdates} onValueChange={v => setNotifs(p => ({ ...p, appUpdates: v }))} classNames={emailSwitchCN}>
                        <NotifLabel label="Application Updates" desc="Get notified when your application status changes." />
                    </Switch>
                    <Switch isSelected={notifs.weeklyDigest} onValueChange={v => setNotifs(p => ({ ...p, weeklyDigest: v }))} classNames={emailSwitchCN}>
                        <NotifLabel label="Weekly Digest" desc="A summary of your pipeline activity every Monday." />
                    </Switch>
                    <Switch isSelected={notifs.interviewReminders} onValueChange={v => setNotifs(p => ({ ...p, interviewReminders: v }))} classNames={emailSwitchCN}>
                        <NotifLabel label="Interview Reminders" desc="Reminders 24 hours before scheduled interviews." />
                    </Switch>
                </div>
                <Divider />
                <div className="flex flex-col gap-2">
                    <p className="text-[0.58rem] tracking-[0.16em] uppercase font-mono text-muted m-0">Push</p>
                    <Switch isSelected={notifs.pushMessages} onValueChange={v => setNotifs(p => ({ ...p, pushMessages: v }))} classNames={pushSwitchCN}>
                        <NotifLabel label="New Messages" desc="Push alerts when a recruiter sends you a message." />
                    </Switch>
                    <Switch isSelected={notifs.pushStatus} onValueChange={v => setNotifs(p => ({ ...p, pushStatus: v }))} classNames={pushSwitchCN}>
                        <NotifLabel label="Status Changes" desc="Instant push notifications for pipeline status changes." />
                    </Switch>
                </div>
                {feedback && <Feedback state={feedback} />}
                <div className="flex-1" />
                <Divider />
                <div className="flex justify-end">
                    <Button
                        type="submit"
                        isLoading={loading}
                        variant="bordered"
                        className="border-success/30 bg-success/10 text-foreground hover:bg-success/20 hover:border-success/55 font-bold tracking-wide"
                    >
                        Save Preferences
                    </Button>
                </div>
            </form>
        </SectionCard>
    );
}

/* ─────────────────────────────────────────────
   DELETE ACCOUNT MODAL
───────────────────────────────────────────── */
export function DeleteAccountModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [deleteInput, setDeleteInput] = useState("");
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        if (deleteInput !== "DELETE") return;
        setLoading(true);
        await new Promise(r => setTimeout(r, 1200));
        setLoading(false);
        console.log("Account deletion requested");
        handleClose();
    };

    const handleClose = () => {
        setDeleteInput("");
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            classNames={{
                base: "border border-danger/20 bg-card",
                header: "border-b border-border",
                footer: "border-t border-border",
                closeButton: "hover:bg-card_hover text-muted hover:text-subheading",
            }}
        >
            <ModalContent>
                {() => (
                    <>
                        <ModalHeader>
                            <div className="flex items-center gap-2.5">
                                <div className="flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0 bg-danger/10 border border-danger/25">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-danger">
                                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                                        <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                                    </svg>
                                </div>
                                <span className="text-heading font-extrabold text-lg tracking-tight">Delete Account</span>
                            </div>
                        </ModalHeader>

                        <ModalBody className="py-5 flex flex-col gap-4">
                            <p className="text-sm leading-relaxed text-subheading m-0">
                                This action is{" "}
                                <span className="text-danger font-semibold">permanent and irreversible</span>.
                                Deleting your account will immediately erase all of your:
                            </p>

                            <ul className="m-0 pl-0 flex flex-col gap-2 list-none">
                                {[
                                    "Job applications & pipeline data",
                                    "Interview notes & documents",
                                    "Notification preferences & settings",
                                ].map(item => (
                                    <li key={item} className="flex items-center gap-2.5 text-sm text-muted">
                                        <span className="inline-block w-1 h-1 rounded-full flex-shrink-0 bg-danger" />
                                        {item}
                                    </li>
                                ))}
                            </ul>

                            <div className="rounded-lg px-3.5 py-3 text-xs leading-relaxed bg-danger/5 border border-danger/15 text-danger/75">
                                There is no grace period. Once confirmed, your data cannot be recovered by you or our support team.
                            </div>

                            <div className="flex flex-col gap-2 mt-1">
                                <label className="text-xs text-muted">
                                    Type{" "}
                                    <span className="text-danger font-semibold font-mono">DELETE</span>
                                    {" "}to confirm
                                </label>
                                <Input
                                    placeholder="DELETE"
                                    value={deleteInput}
                                    onValueChange={setDeleteInput}
                                    variant="bordered"
                                    classNames={{
                                        inputWrapper: "border-danger/20 bg-card hover:border-danger/40 data-[focus=true]:border-danger/60",
                                        input: "text-danger/90 placeholder:text-muted font-mono",
                                    }}
                                />
                            </div>
                        </ModalBody>

                        <ModalFooter className="gap-2">
                            <Button
                                variant="bordered"
                                onPress={handleClose}
                                className="border-border bg-card text-muted hover:bg-card_hover hover:text-subheading font-medium"
                            >
                                Cancel
                            </Button>
                            <Button
                                isLoading={loading}
                                isDisabled={deleteInput !== "DELETE"}
                                variant="bordered"
                                onPress={handleDelete}
                                className="border-danger/30 bg-danger/10 text-danger hover:bg-danger/20 hover:border-danger/55 font-bold tracking-wide disabled:opacity-40"
                            >
                                Delete My Account
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}

/* ─────────────────────────────────────────────
   PREFERENCE PAGE — default export
───────────────────────────────────────────── */
export default function PreferencePage() {
    const { isOpen, onOpen, onClose } = useDisclosure();

    return (
        <div className="flex flex-col gap-4 p-5 md:p-6 bg-background min-h-screen">
            {/* Page header */}
            <div className="flex flex-col gap-0.5">
                <div className="inline-flex items-center gap-1.5 w-fit px-3 py-1 rounded-full border border-border bg-card mb-1">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-success flex-shrink-0" />
                    <span className="text-muted text-[0.6rem] tracking-[0.2em] uppercase font-mono">
                        Account Settings
                    </span>
                </div>
                <h1 className="text-heading font-extrabold text-3xl md:text-4xl tracking-tight m-0">
                    Manage your account
                </h1>
                <p className="text-muted text-sm mt-0.5">
                    Update your credentials, notifications, and account preferences.
                </p>
            </div>

            {/* Profile — full width */}
            <ProfileCard />

            {/* Two-column layout — equal height */}
            <div className="flex flex-col md:flex-row gap-4 items-stretch">
                <div className="flex-1 min-w-0 flex">
                    <AccountCard />
                </div>
                <div className="flex-1 min-w-0 flex">
                    <NotificationsCard />
                </div>
            </div>

            {/* Delete — bordered danger button, clearly visible */}
            <div className="flex items-center gap-4 pt-1">
                <Divider />
                <Button
                    variant="bordered"
                    onPress={onOpen}
                    size="sm"
                    className="flex-shrink-0 border-danger/40 text-danger hover:bg-danger/10 hover:border-danger/70 font-semibold tracking-wide text-xs"
                >
                    Delete account
                </Button>
                <Divider />
            </div>

            {/* Delete modal */}
            <DeleteAccountModal isOpen={isOpen} onClose={onClose} />
        </div>
    );
}