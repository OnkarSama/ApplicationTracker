"use client";

import { useEffect, useRef, useState } from "react";
import {
    Input,
    Button,
    Switch,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure, addToast
} from "@heroui/react";

import { useQuery, useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import apiRouter from "@/api/router";

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
   SHARED INPUT CLASS NAMES — tailwind config tokens
───────────────────────────────────────────── */
export const inputCN = (accent: "primary" | "secondary" | "danger" = "primary") => {
    const map = {
        primary:   { focus: "data-[focus=true]:border-primary",   hover: "hover:border-primary/40" },
        secondary: { focus: "data-[focus=true]:border-secondary",  hover: "hover:border-secondary/40" },
        danger:    { focus: "data-[focus=true]:border-danger",     hover: "hover:border-danger/40" },
    }[accent];
    return {
        inputWrapper: `border-border bg-background ${map.hover} ${map.focus}`,
        input:        "text-foreground placeholder:text-muted text-sm",
        label:        "text-subheading text-xs font-medium",
        errorMessage: "text-danger text-xs",
    };
};

/* ─────────────────────────────────────────────
   DIVIDER
───────────────────────────────────────────── */
const Divider = () => <div className="h-px bg-border w-full" />;

/* ─────────────────────────────────────────────
   SECTION CARD — pill is the heading, no h2 title
───────────────────────────────────────────── */
type CardAccent = "primary" | "secondary" | "success" | "danger";

const cardStyles: Record<CardAccent, { border: string; pill: string; dot: string }> = {
    primary:   { border: "border-primary/25",   pill: "text-primary border-primary/50 bg-primary/[0.1] font-extrabold",   dot: "bg-primary" },
    secondary: { border: "border-secondary/25", pill: "text-secondary border-secondary/50 bg-secondary/[0.1] font-extrabold", dot: "bg-secondary" },
    success:   { border: "border-success/25",   pill: "text-success border-success/50 bg-success/[0.1] font-extrabold",   dot: "bg-success" },
    danger:    { border: "border-danger/25",    pill: "text-danger border-danger/50 bg-danger/[0.1] font-extrabold",      dot: "bg-danger" },
};

export function SectionCard({
                                eyebrow, accent = "primary", children,
                            }: {
    eyebrow: string;
    accent?: CardAccent;
    children: React.ReactNode;
}) {
    const s = cardStyles[accent];
    return (
        <div className={`flex flex-col gap-5 rounded-2xl p-4 sm:p-6 bg-card border ${s.border} w-full`}>
            {/* Pill IS the heading — bigger, bolder */}
            <div className={`inline-flex items-center gap-2 font-mono text-[0.65rem] tracking-[0.2em] uppercase border px-3.5 py-1 rounded-full w-fit ${s.pill}`}>
                <span className={`w-2 h-2 rounded-full shrink-0 ${s.dot}`} />
                {eyebrow}
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
        <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm border ${
            ok
                ? "bg-success/[0.07] border-success/25 text-success"
                : "bg-danger/[0.07] border-danger/25 text-danger"
        }`}>
            {ok ? (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            ) : (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            )}
            <span className="text-sm">{state.msg}</span>
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

    const levels = [
        { label: "Weak",   width: "w-1/4",  bar: "bg-danger",  text: "text-danger" },
        { label: "Weak",   width: "w-1/4",  bar: "bg-danger",  text: "text-danger" },
        { label: "Weak",   width: "w-1/4",  bar: "bg-danger",  text: "text-danger" },
        { label: "Fair",   width: "w-1/2",  bar: "bg-warning", text: "text-warning" },
        { label: "Good",   width: "w-3/4",  bar: "bg-primary", text: "text-primary" },
        { label: "Strong", width: "w-full", bar: "bg-success", text: "text-success" },
    ];
    const { label, width, bar, text } = levels[Math.min(s, 5)];

    return (
        <div className="flex flex-col gap-1.5">
            <div className="h-[3px] w-full rounded-full overflow-hidden bg-border">
                <div className={`h-full rounded-full transition-all duration-300 ${width} ${bar}`} />
            </div>
            <span className={`text-xs tracking-[0.14em] uppercase font-mono font-semibold ${text}`}>
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
            className="flex items-center bg-transparent border-none cursor-pointer text-muted hover:text-primary transition-colors"
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
   PROFILE CARD — bigger layout
───────────────────────────────────────────── */
export function ProfileCard() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [feedback, setFeedback] = useState<FeedbackState>(null);
    const [pendingFile, setPendingFile] = useState<File | null>(null);
    const [pendingAvatar, setPendingAvatar] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [avatarSrc, setAvatarSrc] = useState<string | null>(null);

    const { data: sessionData } = useQuery({
        queryKey: ["currentUser"],
        queryFn: () => apiRouter.sessions.showUser(),
    });

    const user = sessionData?.user;
    const displayName = user ? `${user.first_name} ${user.last_name}` : "—";
    const email = user?.email_address ?? "—";
    const initials = displayName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
    const currentAvatar = pendingAvatar ?? avatarSrc;

    useEffect(() => {
        if (user?.avatar_url) setAvatarSrc(user.avatar_url);
    }, [user]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setPendingFile(file);
        const reader = new FileReader();
        reader.onload = ev => setPendingAvatar(ev.target?.result as string);
        reader.readAsDataURL(file);
    };

    const handleSave = async () => {
        if (!pendingFile) return;
        setIsUploading(true);
        try {
            const result = await apiRouter.users.uploadAvatar(pendingFile);
            setAvatarSrc(result.avatar_url);
            setPendingAvatar(null);
            setPendingFile(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
            setFeedback({ kind: "success", msg: "Avatar updated successfully." });
        } catch {
            setFeedback({ kind: "error", msg: "Failed to upload avatar. Please try again." });
        } finally {
            setIsUploading(false);
            setTimeout(() => setFeedback(null), 4000);
        }
    };

    return (
        <SectionCard eyebrow="Profile" accent="primary">
            <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-start sm:items-center">

                {/* Avatar — bigger */}
                <div className="flex flex-row sm:flex-col items-center gap-3 sm:gap-3 shrink-0">
                    <div
                        className="relative cursor-pointer rounded-full w-20 h-20 sm:w-24 sm:h-24"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {currentAvatar ? (
                            <img
                                src={currentAvatar}
                                alt="avatar"
                                className="w-full h-full rounded-full object-cover border-2 border-primary/40"
                            />
                        ) : (
                            <div className="w-full h-full rounded-full border-2 border-primary/40 bg-background flex items-center justify-center text-primary font-extrabold text-2xl tracking-tight font-mono">
                                {initials}
                            </div>
                        )}
                        {/* Camera overlay */}
                        <div className="absolute inset-0 rounded-full bg-background/70 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                                <circle cx="12" cy="13" r="4"/>
                            </svg>
                        </div>
                    </div>

                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-[0.6rem] tracking-[0.14em] uppercase font-mono text-muted hover:text-primary border border-border hover:border-primary/40 rounded-lg px-2.5 py-1 bg-transparent hover:bg-primary/[0.05] transition-all cursor-pointer font-semibold whitespace-nowrap"
                    >
                        Upload
                    </button>

                    {pendingAvatar && (
                        <span className="text-xs tracking-[0.1em] uppercase font-mono text-warning border border-warning/25 bg-warning/[0.07] px-2.5 py-1 rounded-full font-semibold">
                            Preview
                        </span>
                    )}
                </div>

                {/* Info — bigger text */}
                <div className="w-full sm:flex-1 flex flex-wrap gap-x-10 gap-y-3 min-w-0">
                    <div className="flex flex-col gap-1">
                        <span className="text-[0.6rem] tracking-[0.16em] uppercase font-mono text-muted font-semibold">Display Name</span>
                        <span className="text-foreground font-bold text-lg tracking-tight">{displayName}</span>
                    </div>

                    <div className="flex flex-col gap-1">
                        <span className="text-[0.6rem] tracking-[0.16em] uppercase font-mono text-muted font-semibold">Email</span>
                        <div className="flex items-center gap-2">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary/50 shrink-0">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                            </svg>
                            <span className="text-sm text-subheading font-medium break-all">{email}</span>
                        </div>
                    </div>

                    {pendingAvatar && (
                        <div className="w-full flex gap-2 flex-wrap">
                            <Button size="sm" variant="bordered" onPress={handleSave} isLoading={isUploading}
                                    className="border-primary/30 bg-primary/10 text-foreground hover:bg-primary/20 hover:border-primary/55 font-bold tracking-wide">
                                Save Avatar
                            </Button>
                            <Button size="sm" variant="bordered"
                                    onPress={() => { setPendingAvatar(null); setPendingFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                                    className="border-border bg-card text-muted hover:bg-card_hover hover:text-subheading font-medium tracking-wide">
                                Discard
                            </Button>
                        </div>
                    )}

                    {feedback && <div className="w-full"><Feedback state={feedback} /></div>}
                </div>
            </div>
        </SectionCard>
    );
}

/* ─────────────────────────────────────────────
   ACCOUNT CARD (email + password)
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
    const [pwFeedback, setPwFeedback] = useState<FeedbackState>(null);

    const pwMutation = useMutation({
        mutationFn: () => apiRouter.users.changePassword(currentPw, newPw, confirmPw),
        onSuccess: () => {
            setCurrentPw(""); setNewPw(""); setConfirmPw(""); setPwErrors({});
            setPwFeedback({ kind: "success", msg: "Password changed successfully." });
            setTimeout(() => setPwFeedback(null), 4000);
        },
        onError: (error: any) => {
            const msg = error?.response?.data?.errors?.join(", ") ?? "Failed to change password.";
            setPwFeedback({ kind: "error", msg });
            setTimeout(() => setPwFeedback(null), 5000);
        },
    });

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

    const handlePwSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validatePw()) return;
        pwMutation.mutate();
    };

    return (
        <SectionCard eyebrow="Credentials" accent="primary">
            {/* Email */}
            <form onSubmit={handleEmailSubmit} className="flex flex-col gap-3.5" noValidate>
                <p className="text-[0.6rem] tracking-[0.16em] uppercase font-mono text-muted font-semibold m-0">Email Address</p>
                <Input
                    label="New Email Address"
                    type="email"
                    placeholder="new@email.com"
                    value={newEmail}
                    onValueChange={setNewEmail}
                    variant="bordered"
                    isInvalid={!!emailErrors.newEmail}
                    errorMessage={emailErrors.newEmail}
                    classNames={inputCN("primary")}
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
                    classNames={inputCN("primary")}
                />
                {emailFeedback && <Feedback state={emailFeedback} />}
                <div className="flex justify-end">
                    <Button type="submit" isLoading={emailLoading} variant="bordered"
                            className="border-primary/30 bg-primary/10 text-foreground hover:bg-primary/20 hover:border-primary/55 font-bold tracking-wide">
                        Update Email
                    </Button>
                </div>
            </form>

            <Divider />

            {/* Password */}
            <form onSubmit={handlePwSubmit} className="flex flex-col gap-3.5" noValidate>
                <p className="text-[0.6rem] tracking-[0.16em] uppercase font-mono text-muted font-semibold m-0">Password</p>
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
                    classNames={inputCN("secondary")}
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
                    classNames={inputCN("secondary")}
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
                    classNames={inputCN("secondary")}
                />
                {pwFeedback && <Feedback state={pwFeedback} />}
                <div className="flex justify-end">
                    <Button type="submit" isLoading={pwMutation.isPending} variant="bordered"
                            className="border-secondary/30 bg-secondary/10 text-foreground hover:bg-secondary/20 hover:border-secondary/55 font-bold tracking-wide">
                        Update Password
                    </Button>
                </div>
            </form>
        </SectionCard>
    );
}

/* ─────────────────────────────────────────────
   NOTIFICATIONS CARD — all switches same success green
───────────────────────────────────────────── */
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

    /* ALL switches use the same success/green classNames */
    const switchCN = {
        wrapper: "bg-border group-data-[selected=true]:bg-success/40",
        thumb:   "bg-muted group-data-[selected=true]:bg-success",
    };

    const NotifRow = ({ label, desc, selected, onChange }: {
        label: string; desc: string; selected: boolean; onChange: (v: boolean) => void;
    }) => (
        <Switch isSelected={selected} onValueChange={onChange} classNames={switchCN}>
            <div className="flex flex-col gap-0.5">
                <span className="text-sm font-semibold text-foreground">{label}</span>
                <span className="text-xs text-muted">{desc}</span>
            </div>
        </Switch>
    );

    return (
        <SectionCard eyebrow="Notifications" accent="success">
            <form onSubmit={handleSubmit} className="flex flex-col gap-5 flex-1" noValidate>
                <div className="flex flex-col gap-3">
                    <p className="text-xs tracking-[0.16em] uppercase font-mono text-muted font-semibold m-0">Email</p>
                    <NotifRow
                        label="Application Updates"
                        desc="Get notified when your application status changes."
                        selected={notifs.appUpdates}
                        onChange={v => setNotifs(p => ({ ...p, appUpdates: v }))}
                    />
                    <NotifRow
                        label="Weekly Digest"
                        desc="A summary of your pipeline activity every Monday."
                        selected={notifs.weeklyDigest}
                        onChange={v => setNotifs(p => ({ ...p, weeklyDigest: v }))}
                    />
                    <NotifRow
                        label="Interview Reminders"
                        desc="Reminders 24 hours before scheduled interviews."
                        selected={notifs.interviewReminders}
                        onChange={v => setNotifs(p => ({ ...p, interviewReminders: v }))}
                    />
                </div>

                <Divider />

                <div className="flex flex-col gap-3">
                    <p className="text-[0.6rem] tracking-[0.16em] uppercase font-mono text-muted font-semibold m-0">Push</p>
                    <NotifRow
                        label="New Messages"
                        desc="Push alerts when a recruiter sends you a message."
                        selected={notifs.pushMessages}
                        onChange={v => setNotifs(p => ({ ...p, pushMessages: v }))}
                    />
                    <NotifRow
                        label="Status Changes"
                        desc="Instant push notifications for pipeline status changes."
                        selected={notifs.pushStatus}
                        onChange={v => setNotifs(p => ({ ...p, pushStatus: v }))}
                    />
                </div>

                {feedback && <Feedback state={feedback} />}
                <div className="flex-1" />
                <Divider />
                <div className="flex justify-end">
                    <Button type="submit" isLoading={loading} variant="bordered"
                            className="border-success/30 bg-success/10 text-foreground hover:bg-success/20 hover:border-success/55 font-bold tracking-wide">
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
    const router = useRouter();

    const deleteMutation = useMutation({
        mutationFn: () => apiRouter.users.deleteUser(),
        onSuccess: () => {
            addToast({
                title: "Success",
                description: "Sorry to see you go!",
                timeout: 1000,
                shouldShowTimeoutProgress: true,
                variant: "solid",
                color: "success",
            });
            handleClose();
            router.push("/");
        },
        onError: (error: any) => {
            setLoading(false);
            addToast({
                title: "Error",
                description: error?.response?.data?.errors
                    ? Object.values(error.response.data.errors).flat().join(", ")
                    : "Failed to delete account.",
                timeout: 3000,
                shouldShowTimeoutProgress: true,
                variant: "solid",
                color: "danger",
            });
        },
    });

    const handleDelete = () => {
        if (deleteInput !== "DELETE") return;
        setLoading(true);
        deleteMutation.mutate();
    };

    const handleClose = () => {
        setDeleteInput("");
        setLoading(false);
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
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-9 h-9 rounded-xl shrink-0 bg-danger/10 border border-danger/25">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-danger">
                                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                                        <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                                    </svg>
                                </div>
                                <span className="text-foreground font-extrabold text-lg tracking-tight">Delete Account</span>
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
                                        <span className="inline-block w-1 h-1 rounded-full shrink-0 bg-danger" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                            <div className="rounded-xl px-4 py-3 text-sm leading-relaxed bg-danger/[0.05] border border-danger/15 text-danger/80">
                                There is no grace period. Once confirmed, your data cannot be recovered by you or our support team.
                            </div>
                            <div className="flex flex-col gap-2 mt-1">
                                <label className="text-sm text-muted font-medium">
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
                                        inputWrapper: "border-danger/20 bg-card hover:border-danger/40 data-[focus=true]:border-danger",
                                        input: "text-danger placeholder:text-muted font-mono text-base",
                                    }}
                                />
                            </div>
                        </ModalBody>

                        <ModalFooter className="gap-2">
                            <Button variant="bordered" onPress={handleClose}
                                    className="border-border bg-card text-muted hover:bg-card_hover hover:text-subheading font-medium">
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
   PREFERENCE PAGE
───────────────────────────────────────────── */
export default function PreferencePage() {
    const { isOpen, onOpen, onClose } = useDisclosure();

    return (
        <div className="flex flex-col gap-5 p-4 sm:p-6 md:p-8 bg-background min-h-screen">

            {/* Page header */}
            <div className="flex flex-col gap-1">
                <div className="inline-flex items-center gap-2 font-mono text-[0.65rem] tracking-[0.2em] uppercase border px-3.5 py-1 rounded-full w-fit text-primary border-primary/50 bg-primary/[0.1] font-extrabold mb-1">
                    <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                    Account Settings
                </div>
                <h1 className="text-foreground font-extrabold text-xl sm:text-2xl md:text-3xl tracking-tight m-0">
                    Manage your account
                </h1>
                <p className="text-foreground/70 text-sm mt-1">
                    Update your credentials, notifications, and account preferences.
                </p>
            </div>

            {/* Profile — full width */}
            <ProfileCard />

            {/* Two-column */}
            <div className="flex flex-col md:flex-row gap-5 items-stretch w-full">
                <div className="flex-1 min-w-0">
                    <AccountCard />
                </div>
                <div className="flex-1 min-w-0">
                    <NotificationsCard />
                </div>
            </div>

            {/* Delete account */}
            <div className="flex items-center gap-4 pt-1">
                <Divider />
                <Button
                    variant="bordered"
                    onPress={onOpen}
                    size="sm"
                    className="shrink-0 border-danger/40 text-danger hover:bg-danger/10 hover:border-danger/70 font-semibold tracking-wide text-sm"
                >
                    Delete account
                </Button>
                <Divider />
            </div>

            <DeleteAccountModal isOpen={isOpen} onClose={onClose} />
        </div>
    );
}