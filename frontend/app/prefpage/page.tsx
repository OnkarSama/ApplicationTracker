"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import Link from "next/link";
import { Input, Button, Switch } from "@heroui/react";

/* ─────────────────────────────────────────────
   TYPES
───────────────────────────────────────────── */
interface NotifPrefs {
    appUpdates: boolean;
    weeklyDigest: boolean;
    interviewReminders: boolean;
    pushMessages: boolean;
    pushStatus: boolean;
}
type FeedbackState = { kind: "success" | "error"; msg: string } | null;

/* ─────────────────────────────────────────────
   SECTION CARD  — Three.js-themed frosted shell
───────────────────────────────────────────── */
function SectionCard({
                         eyebrow, title, accentColor, dotColor, children, fullHeight = false,
                     }: {
    eyebrow: string; title: string;
    accentColor: string; dotColor: string;
    children: React.ReactNode;
    fullHeight?: boolean;
}) {
    return (
        <div className="settings-card-pad" style={{
            background: "rgba(4,12,28,0.82)",
            border: `1px solid ${accentColor}`,
            borderRadius: "16px",
            backdropFilter: "blur(28px)",
            WebkitBackdropFilter: "blur(28px)",
            padding: "2rem",
            boxShadow: "0 0 60px rgba(0,212,255,0.04),inset 0 1px 0 rgba(255,255,255,0.05)",
            display: "flex",
            flexDirection: "column" as const,
            gap: "1.4rem",
            ...(fullHeight ? { flex: 1 } : {}),
        }}>
            <div>
                <div style={{
                    display: "inline-flex", alignItems: "center", gap: "0.45rem",
                    fontFamily: "'DM Mono',monospace", fontSize: "0.6rem",
                    letterSpacing: "0.2em", color: "rgba(0,212,255,0.55)",
                    textTransform: "uppercase" as const, marginBottom: "0.6rem",
                    border: "1px solid rgba(0,212,255,0.12)", padding: "0.28rem 0.75rem",
                    borderRadius: "999px", background: "rgba(0,212,255,0.04)",
                }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: dotColor, boxShadow: `0 0 6px ${dotColor}`, display: "inline-block", flexShrink: 0 }} />
                    {eyebrow}
                </div>
                <h2 style={{ fontFamily: "'Syne','Helvetica Neue',sans-serif", fontWeight: 800, fontSize: "1.25rem", letterSpacing: "-0.02em", color: "#f0f8ff", margin: 0 }}>
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
function Feedback({ state }: { state: FeedbackState }) {
    if (!state) return null;
    const ok = state.kind === "success";
    return (
        <div style={{
            display: "flex", alignItems: "center", gap: "0.6rem",
            padding: "0.65rem 0.9rem", borderRadius: "8px",
            background: ok ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)",
            border: `1px solid ${ok ? "rgba(16,185,129,0.25)" : "rgba(239,68,68,0.25)"}`,
            fontFamily: "'DM Sans',sans-serif", fontSize: "0.82rem",
            color: ok ? "rgba(110,231,183,0.9)" : "rgba(252,165,165,0.9)",
        }}>
            {ok
                ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
            }
            {state.msg}
        </div>
    );
}

/* ─────────────────────────────────────────────
   PASSWORD STRENGTH BAR
───────────────────────────────────────────── */
function StrengthBar({ password }: { password: string }) {
    if (!password) return null;
    let s = 0;
    if (password.length >= 8) s++;
    if (password.length >= 12) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    const levels = [
        { label: "Weak",   pct: "25%",  color: "#ef4444" },
        { label: "Weak",   pct: "25%",  color: "#ef4444" },
        { label: "Weak",   pct: "25%",  color: "#ef4444" },
        { label: "Fair",   pct: "50%",  color: "#f59e0b" },
        { label: "Good",   pct: "75%",  color: "#00d4ff" },
        { label: "Strong", pct: "100%", color: "#10b981" },
    ];
    const { label, pct, color } = levels[Math.min(s, 5)];
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <div style={{ height: "3px", width: "100%", borderRadius: "999px", background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                <div style={{ height: "100%", width: pct, background: color, borderRadius: "999px", boxShadow: `0 0 8px ${color}88`, transition: "all 0.4s" }} />
            </div>
            <span style={{ fontFamily: "'DM Mono',monospace", fontSize: "0.58rem", letterSpacing: "0.14em", textTransform: "uppercase" as const, color }}>
        Strength: {label}
      </span>
        </div>
    );
}

/* shared HeroUI input classNames */
const inputCN = (accent: "cyan" | "violet" | "red" = "cyan") => {
    const focusBorder = { cyan: "data-[focus=true]:border-cyan-500/60", violet: "data-[focus=true]:border-violet-500/60", red: "data-[focus=true]:border-red-500/60" }[accent];
    const hoverBorder = { cyan: "hover:border-cyan-500/40", violet: "hover:border-violet-500/40", red: "hover:border-red-500/40" }[accent];
    return {
        inputWrapper: `border-white/10 bg-white/[0.04] ${hoverBorder} ${focusBorder} backdrop-blur-sm`,
        input: "text-slate-100 placeholder:text-slate-600",
        label: "text-slate-400 text-xs",
    };
};

/* ─────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────── */
export default function SettingsPage() {
    const canvasRef = useRef<HTMLDivElement>(null);

    /* Email */
    const [newEmail, setNewEmail] = useState("");
    const [confirmEmail, setConfirmEmail] = useState("");
    const [emailErrors, setEmailErrors] = useState<Record<string, string>>({});
    const [emailLoading, setEmailLoading] = useState(false);
    const [emailFeedback, setEmailFeedback] = useState<FeedbackState>(null);

    /* Password */
    const [currentPw, setCurrentPw] = useState("");
    const [newPw, setNewPw] = useState("");
    const [confirmPw, setConfirmPw] = useState("");
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [pwErrors, setPwErrors] = useState<Record<string, string>>({});
    const [pwLoading, setPwLoading] = useState(false);
    const [pwFeedback, setPwFeedback] = useState<FeedbackState>(null);

    /* Notifications */
    const [notifs, setNotifs] = useState<NotifPrefs>({ appUpdates: true, weeklyDigest: false, interviewReminders: true, pushMessages: true, pushStatus: false });
    const [notifLoading, setNotifLoading] = useState(false);
    const [notifFeedback, setNotifFeedback] = useState<FeedbackState>(null);

    /* Delete */
    const [deleteInput, setDeleteInput] = useState("");
    const [deleteLoading, setDeleteLoading] = useState(false);

    const flash = useCallback((set: (v: FeedbackState) => void, kind: "success" | "error", msg: string) => {
        set({ kind, msg });
        setTimeout(() => set(null), 4000);
    }, []);

    const validateEmail = () => {
        const e: Record<string, string> = {};
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!newEmail) e.newEmail = "Email is required";
        else if (!re.test(newEmail)) e.newEmail = "Enter a valid email";
        if (!confirmEmail) e.confirmEmail = "Please confirm your email";
        else if (newEmail !== confirmEmail) e.confirmEmail = "Emails do not match";
        setEmailErrors(e); return !Object.keys(e).length;
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
        setPwErrors(e); return !Object.keys(e).length;
    };

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); if (!validateEmail()) return;
        setEmailLoading(true);
        await new Promise(r => setTimeout(r, 900)); // TODO: wire API
        setEmailLoading(false); setNewEmail(""); setConfirmEmail(""); setEmailErrors({});
        flash(setEmailFeedback, "success", "Email address updated successfully.");
    };

    const handlePwSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); if (!validatePw()) return;
        setPwLoading(true);
        await new Promise(r => setTimeout(r, 900)); // TODO: wire API
        setPwLoading(false); setCurrentPw(""); setNewPw(""); setConfirmPw(""); setPwErrors({});
        flash(setPwFeedback, "success", "Password changed successfully.");
    };

    const handleNotifSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setNotifLoading(true);
        await new Promise(r => setTimeout(r, 700)); // TODO: wire API
        setNotifLoading(false);
        flash(setNotifFeedback, "success", "Notification preferences saved.");
    };

    const handleDelete = async (e: React.FormEvent) => {
        e.preventDefault(); if (deleteInput !== "DELETE") return;
        setDeleteLoading(true);
        await new Promise(r => setTimeout(r, 1200)); // TODO: wire API
        setDeleteLoading(false);
        console.log("Account deletion requested");
    };

    /* eye SVGs */
    const EyeOpen = () => (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
            <line x1="1" y1="1" x2="23" y2="23"/>
        </svg>
    );
    const EyeClosed = () => (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
        </svg>
    );
    const eyeBtn = (visible: boolean, toggle: () => void) => (
        <button type="button" onClick={toggle} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "rgba(160,200,240,0.4)", display: "flex", alignItems: "center", transition: "color 0.2s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(0,212,255,0.8)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(160,200,240,0.4)"; }}>
            {visible ? <EyeOpen /> : <EyeClosed />}
        </button>
    );

    /* ── Three.js scene ── */
    useEffect(() => {
        if (!canvasRef.current) return;
        const mount = canvasRef.current;
        let w = window.innerWidth, h = window.innerHeight;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(w, h); renderer.setClearColor(0x00020a, 1);
        mount.appendChild(renderer.domElement);

        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x000000, 0.016);
        const camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 300);
        camera.position.set(0, 0, 34);

        scene.add(new THREE.AmbientLight(0xffffff, 0.25));
        const L1 = new THREE.PointLight(0x00d4ff, 3.5, 90); L1.position.set(-18, 12, 14); scene.add(L1);
        const L2 = new THREE.PointLight(0x7c3aed, 3.0, 90); L2.position.set(18, -10, 10); scene.add(L2);
        const L3 = new THREE.PointLight(0x10b981, 1.8, 70); L3.position.set(0, 18, -8);   scene.add(L3);

        interface FM extends THREE.Mesh { userData: { vx: number; vy: number; vz: number; rx: number; ry: number; rz: number } }
        const cards: FM[] = [];
        [
            { w: 5.5, h: 3.2, c: 0x00d4ff, x: -16, y: 5,   z: -5 },
            { w: 4.8, h: 2.8, c: 0x7c3aed, x: 15,  y: -7,  z: -3 },
            { w: 6.0, h: 3.6, c: 0x10b981, x: -11, y: -9,  z:  3 },
            { w: 5.0, h: 3.0, c: 0x00d4ff, x: 17,  y: 8,   z: -7 },
            { w: 4.4, h: 2.6, c: 0xf59e0b, x: 5,   y: -13, z:  5 },
            { w: 5.2, h: 3.1, c: 0x7c3aed, x: -20, y: -3,  z:  1 },
            { w: 4.6, h: 2.9, c: 0x10b981, x: 12,  y: 13,  z: -9 },
            { w: 5.8, h: 3.4, c: 0xf59e0b, x: -6,  y: 12,  z:  3 },
            { w: 4.2, h: 2.5, c: 0x00d4ff, x: 22,  y: -2,  z: -5 },
            { w: 5.4, h: 3.3, c: 0x7c3aed, x: -8,  y: -15, z: -3 },
        ].forEach(({ w, h, c, x, y, z }) => {
            const geo = new THREE.BoxGeometry(w, h, 0.06);
            const card = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: c, roughness: 0.05, metalness: 0.9, transparent: true, opacity: 0.13 })) as FM;
            card.position.set(x, y, z);
            card.rotation.set((Math.random() - .5) * .5, (Math.random() - .5) * .5, (Math.random() - .5) * .3);
            card.userData = { vx: (Math.random() - .5) * .006, vy: (Math.random() - .5) * .005, vz: (Math.random() - .5) * .003, rx: (Math.random() - .5) * .0015, ry: (Math.random() - .5) * .002, rz: (Math.random() - .5) * .001 };
            card.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo), new THREE.LineBasicMaterial({ color: c, transparent: true, opacity: 0.55 })));
            scene.add(card); cards.push(card);
        });

        const ring1 = new THREE.Mesh(new THREE.TorusGeometry(14, .04, 8, 120), new THREE.MeshBasicMaterial({ color: 0x00d4ff, transparent: true, opacity: .14 }));
        ring1.rotation.x = Math.PI / 2.8; scene.add(ring1);
        const ring2 = new THREE.Mesh(new THREE.TorusGeometry(20, .03, 8, 140), new THREE.MeshBasicMaterial({ color: 0x7c3aed, transparent: true, opacity: .1 }));
        ring2.rotation.x = Math.PI / 3.5; ring2.rotation.z = 0.4; scene.add(ring2);

        const orbColors = [0x10b981, 0x00d4ff, 0xf59e0b, 0xef4444, 0x7c3aed];
        const orbs: THREE.Mesh[] = [];
        for (let i = 0; i < 20; i++) {
            const col = orbColors[i % orbColors.length];
            const orb = new THREE.Mesh(new THREE.SphereGeometry(.12 + Math.random() * .18, 14, 14), new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: .9, roughness: 0, metalness: .3 }));
            orb.position.set((Math.random() - .5) * 52, (Math.random() - .5) * 38, (Math.random() - .5) * 24);
            (orb as any).userData = { vx: (Math.random() - .5) * .013, vy: (Math.random() - .5) * .01, pulse: Math.random() * Math.PI * 2 };
            orbs.push(orb); scene.add(orb);
        }

        const grid = new THREE.GridHelper(120, 40, 0x00d4ff, 0x0a1628);
        grid.position.y = -20;
        (grid.material as THREE.Material).transparent = true;
        (grid.material as THREE.Material).opacity = 0.14;
        scene.add(grid);

        const sPos = new Float32Array(1500);
        for (let i = 0; i < 1500; i++) sPos[i] = (Math.random() - .5) * 130;
        const starGeo = new THREE.BufferGeometry();
        starGeo.setAttribute("position", new THREE.BufferAttribute(sPos, 3));
        scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: .08, transparent: true, opacity: .42 })));

        const mouse = { x: 0, y: 0 };
        const onMM = (e: MouseEvent) => { mouse.x = (e.clientX / window.innerWidth - .5) * 2; mouse.y = -(e.clientY / window.innerHeight - .5) * 2; };
        window.addEventListener("mousemove", onMM);
        const onResize = () => { w = window.innerWidth; h = window.innerHeight; renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix(); };
        window.addEventListener("resize", onResize);

        let fId: number;
        const clock = new THREE.Clock();
        const animate = () => {
            fId = requestAnimationFrame(animate);
            const t = clock.getElapsedTime();
            camera.position.x += (mouse.x * 3.5 - camera.position.x) * 0.03;
            camera.position.y += (mouse.y * 2.2 - camera.position.y) * 0.03;
            camera.lookAt(scene.position);
            cards.forEach(c => {
                const d = c.userData;
                c.position.x += d.vx; c.position.y += d.vy; c.position.z += d.vz;
                c.rotation.x += d.rx; c.rotation.y += d.ry; c.rotation.z += d.rz;
                if (Math.abs(c.position.x) > 28) d.vx *= -1;
                if (Math.abs(c.position.y) > 20) d.vy *= -1;
                if (Math.abs(c.position.z) > 12) d.vz *= -1;
            });
            orbs.forEach(o => {
                const d = (o as any).userData;
                o.position.x += d.vx; o.position.y += d.vy;
                if (Math.abs(o.position.x) > 30) d.vx *= -1;
                if (Math.abs(o.position.y) > 22) d.vy *= -1;
                (o.material as THREE.MeshStandardMaterial).emissiveIntensity = .55 + .5 * Math.sin(t * 2.1 + d.pulse);
            });
            ring1.rotation.z = t * .065; ring2.rotation.z = -t * .04; ring2.rotation.y = t * .022;
            L1.position.x = Math.sin(t * .38) * 22; L1.position.y = Math.cos(t * .28) * 15;
            L2.position.x = Math.cos(t * .33) * 22; L2.position.y = Math.sin(t * .26) * 13;
            grid.position.z = (t * 1.8) % 3;
            renderer.render(scene, camera);
        };
        animate();

        return () => {
            cancelAnimationFrame(fId);
            window.removeEventListener("mousemove", onMM);
            window.removeEventListener("resize", onResize);
            renderer.dispose();
            if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
        };
    }, []);

    const divider = <div style={{ height: 1, background: "rgba(255,255,255,0.06)" }} />;

    /* HeroUI Switch child layout */
    const notifLabel = (label: string, desc: string) => (
        <div style={{ display: "flex", flexDirection: "column" as const, gap: "0.1rem" }}>
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.875rem", color: "#e0f0ff", fontWeight: 500 }}>{label}</span>
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.75rem", color: "rgba(160,200,240,0.4)" }}>{desc}</span>
        </div>
    );

    return (
        <div style={{ position: "fixed", inset: 0, background: "linear-gradient(160deg,#00020a 0%,#020b18 45%,#050e1f 100%)", overflow: "hidden" }}>

            {/* Layer 0 — Three.js canvas */}
            <div ref={canvasRef} style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" }} />

            {/* Layer 1 — vignette */}
            <div style={{ position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none", background: "radial-gradient(ellipse 80% 70% at 50% 50%,transparent 20%,rgba(0,2,10,0.72) 100%)" }} />

            {/* Layer 2 — scrollable UI */}
            <div style={{ position: "absolute", inset: 0, zIndex: 2, pointerEvents: "auto", overflowY: "auto", display: "flex", flexDirection: "column" }}>

                {/* ── Sticky nav ── */}
                <nav className="settings-nav" style={{
                    position: "sticky", top: 0, zIndex: 10, flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    boxSizing: "border-box" as const,
                    backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
                    background: "rgba(0,2,10,0.6)", borderBottom: "1px solid rgba(255,255,255,0.05)",
                }}>
                    <Link href="/" className="settings-nav-logo" style={{ fontFamily: "'DM Mono',monospace", fontSize: "0.78rem", letterSpacing: "0.22em", color: "rgba(0,212,255,0.65)", textTransform: "uppercase", textDecoration: "none", transition: "color 0.2s" }}
                          onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = "#00d4ff"; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(0,212,255,0.65)"; }}>
                        ApplyOS
                    </Link>
                    <Link href="/dashboard" className="settings-nav-link" style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 500, fontSize: "0.84rem", padding: "0.5rem 1.4rem", borderRadius: "6px", background: "rgba(0,212,255,0.07)", color: "rgba(0,212,255,0.88)", border: "1px solid rgba(0,212,255,0.22)", textDecoration: "none", display: "inline-block", transition: "all 0.2s" }}
                          onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.background = "rgba(0,212,255,0.14)"; el.style.borderColor = "rgba(0,212,255,0.52)"; el.style.boxShadow = "0 0 22px rgba(0,212,255,0.2)"; }}
                          onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.background = "rgba(0,212,255,0.07)"; el.style.borderColor = "rgba(0,212,255,0.22)"; el.style.boxShadow = "none"; }}>
                        ← Dashboard
                    </Link>
                </nav>

                {/* ── Page body ── */}
                <div className="settings-body" style={{ flex: 1, boxSizing: "border-box" as const, display: "flex", flexDirection: "column", gap: "1.5rem" }}>

                    {/* Page header */}
                    <div>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.45rem", fontFamily: "'DM Mono',monospace", fontSize: "0.6rem", letterSpacing: "0.2em", color: "rgba(0,212,255,0.55)", textTransform: "uppercase" as const, marginBottom: "0.8rem", border: "1px solid rgba(0,212,255,0.12)", padding: "0.28rem 0.75rem", borderRadius: "999px", background: "rgba(0,212,255,0.04)" }}>
                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 6px #10b981", display: "inline-block" }} />
                            Account Settings
                        </div>
                        <h1 className="settings-h1" style={{ fontFamily: "'Syne','Helvetica Neue',sans-serif", fontWeight: 800, fontSize: "clamp(1.5rem,5vw,2.6rem)", letterSpacing: "-0.03em", color: "#f0f8ff", margin: 0, lineHeight: 1.05 }}>
                            Manage your{" "}
                            <span style={{ background: "linear-gradient(90deg,#00d4ff 0%,#7c3aed 55%,#10b981 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                account
              </span>
                        </h1>
                        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.82rem", color: "rgba(160,200,240,0.42)", marginTop: "0.4rem" }}>
                            Update your credentials, notifications, and account preferences.
                        </p>
                    </div>

                    {/* ══════════════════════════════════════
              RESPONSIVE GRID — 2 col on desktop,
              1 col on mobile (≤ 640px)
          ══════════════════════════════════════ */}
                    <div className="settings-grid" style={{ display: "grid", gap: "1.25rem", width: "100%" }}>

                        {/* ── TOP-LEFT: Change Email ── */}
                        <SectionCard eyebrow="Email Address" title="Change Email" accentColor="rgba(0,212,255,0.18)" dotColor="#00d4ff">
                            <form onSubmit={handleEmailSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem", flex: 1 }} noValidate>
                                <Input
                                    label="New Email Address" type="email" placeholder="new@email.com"
                                    value={newEmail} onValueChange={setNewEmail} variant="bordered"
                                    isInvalid={!!emailErrors.newEmail} errorMessage={emailErrors.newEmail}
                                    classNames={inputCN("cyan")}
                                />
                                <Input
                                    label="Confirm New Email" type="email" placeholder="new@email.com"
                                    value={confirmEmail} onValueChange={setConfirmEmail} variant="bordered"
                                    isInvalid={!!emailErrors.confirmEmail} errorMessage={emailErrors.confirmEmail}
                                    classNames={inputCN("cyan")}
                                />
                                {emailFeedback && <Feedback state={emailFeedback} />}
                                <div style={{ flex: 1 }} />
                                {divider}
                                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                                    <Button type="submit" isLoading={emailLoading} variant="bordered"
                                            className="border-cyan-500/30 bg-cyan-500/10 text-slate-100 hover:bg-cyan-500/20 hover:border-cyan-500/55 font-bold tracking-wide">
                                        Save Changes
                                    </Button>
                                </div>
                            </form>
                        </SectionCard>

                        {/* ── TOP-RIGHT: Notification Preferences ── */}
                        <SectionCard eyebrow="Notifications" title="Notification Preferences" accentColor="rgba(16,185,129,0.18)" dotColor="#10b981">
                            <form onSubmit={handleNotifSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.2rem", flex: 1 }} noValidate>

                                <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
                                    <p style={{ fontFamily: "'DM Mono',monospace", fontSize: "0.58rem", letterSpacing: "0.16em", textTransform: "uppercase" as const, color: "rgba(160,200,240,0.3)", margin: 0 }}>Email</p>
                                    <Switch isSelected={notifs.appUpdates} onValueChange={v => setNotifs(p => ({ ...p, appUpdates: v }))}
                                            classNames={{ wrapper: "bg-white/10 group-data-[selected=true]:bg-emerald-500/30", thumb: "bg-slate-400 group-data-[selected=true]:bg-emerald-400" }}>
                                        {notifLabel("Application Updates", "Get notified when your application status changes.")}
                                    </Switch>
                                    <Switch isSelected={notifs.weeklyDigest} onValueChange={v => setNotifs(p => ({ ...p, weeklyDigest: v }))}
                                            classNames={{ wrapper: "bg-white/10 group-data-[selected=true]:bg-emerald-500/30", thumb: "bg-slate-400 group-data-[selected=true]:bg-emerald-400" }}>
                                        {notifLabel("Weekly Digest", "A summary of your pipeline activity every Monday.")}
                                    </Switch>
                                    <Switch isSelected={notifs.interviewReminders} onValueChange={v => setNotifs(p => ({ ...p, interviewReminders: v }))}
                                            classNames={{ wrapper: "bg-white/10 group-data-[selected=true]:bg-emerald-500/30", thumb: "bg-slate-400 group-data-[selected=true]:bg-emerald-400" }}>
                                        {notifLabel("Interview Reminders", "Reminders 24 hours before scheduled interviews.")}
                                    </Switch>
                                </div>

                                <div style={{ height: 1, background: "rgba(255,255,255,0.06)" }} />

                                <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
                                    <p style={{ fontFamily: "'DM Mono',monospace", fontSize: "0.58rem", letterSpacing: "0.16em", textTransform: "uppercase" as const, color: "rgba(160,200,240,0.3)", margin: 0 }}>Push</p>
                                    <Switch isSelected={notifs.pushMessages} onValueChange={v => setNotifs(p => ({ ...p, pushMessages: v }))}
                                            classNames={{ wrapper: "bg-white/10 group-data-[selected=true]:bg-cyan-500/30", thumb: "bg-slate-400 group-data-[selected=true]:bg-cyan-400" }}>
                                        {notifLabel("New Messages", "Push alerts when a recruiter sends you a message.")}
                                    </Switch>
                                    <Switch isSelected={notifs.pushStatus} onValueChange={v => setNotifs(p => ({ ...p, pushStatus: v }))}
                                            classNames={{ wrapper: "bg-white/10 group-data-[selected=true]:bg-cyan-500/30", thumb: "bg-slate-400 group-data-[selected=true]:bg-cyan-400" }}>
                                        {notifLabel("Status Changes", "Instant push notifications for pipeline status changes.")}
                                    </Switch>
                                </div>

                                {notifFeedback && <Feedback state={notifFeedback} />}
                                <div style={{ flex: 1 }} />
                                {divider}
                                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                                    <Button type="submit" isLoading={notifLoading} variant="bordered"
                                            className="border-emerald-500/30 bg-emerald-500/10 text-slate-100 hover:bg-emerald-500/20 hover:border-emerald-500/55 font-bold tracking-wide">
                                        Save Preferences
                                    </Button>
                                </div>
                            </form>
                        </SectionCard>

                        {/* ── BOTTOM-LEFT: Change Password ── */}
                        <SectionCard eyebrow="Security" title="Change Password" accentColor="rgba(124,58,237,0.18)" dotColor="#7c3aed">
                            <form onSubmit={handlePwSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem", flex: 1 }} noValidate>
                                <Input
                                    label="Current Password" type={showCurrent ? "text" : "password"} placeholder="••••••••"
                                    value={currentPw} onValueChange={setCurrentPw} variant="bordered"
                                    isInvalid={!!pwErrors.currentPw} errorMessage={pwErrors.currentPw}
                                    endContent={eyeBtn(showCurrent, () => setShowCurrent(v => !v))}
                                    classNames={inputCN("violet")}
                                />
                                <Input
                                    label="New Password" type={showNew ? "text" : "password"} placeholder="••••••••"
                                    value={newPw} onValueChange={setNewPw} variant="bordered"
                                    isInvalid={!!pwErrors.newPw} errorMessage={pwErrors.newPw}
                                    endContent={eyeBtn(showNew, () => setShowNew(v => !v))}
                                    classNames={inputCN("violet")}
                                />
                                <StrengthBar password={newPw} />
                                <Input
                                    label="Confirm New Password" type={showConfirm ? "text" : "password"} placeholder="••••••••"
                                    value={confirmPw} onValueChange={setConfirmPw} variant="bordered"
                                    isInvalid={!!pwErrors.confirmPw} errorMessage={pwErrors.confirmPw}
                                    endContent={eyeBtn(showConfirm, () => setShowConfirm(v => !v))}
                                    classNames={inputCN("violet")}
                                />
                                {pwFeedback && <Feedback state={pwFeedback} />}
                                <div style={{ flex: 1 }} />
                                {divider}
                                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                                    <Button type="submit" isLoading={pwLoading} variant="bordered"
                                            className="border-violet-500/30 bg-violet-500/10 text-slate-100 hover:bg-violet-500/20 hover:border-violet-500/55 font-bold tracking-wide">
                                        Save Changes
                                    </Button>
                                </div>
                            </form>
                        </SectionCard>

                        {/* ── BOTTOM-RIGHT: Danger Zone ── */}
                        <SectionCard eyebrow="Irreversible Actions" title="Danger Zone" accentColor="rgba(239,68,68,0.22)" dotColor="#ef4444">
                            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.875rem", color: "rgba(160,200,240,0.5)", lineHeight: 1.75, margin: 0 }}>
                                Permanently delete your account and all associated data. This action{" "}
                                <span style={{ color: "rgba(252,165,165,0.85)", fontWeight: 600 }}>cannot be undone</span>.
                                All your applications, notes, and preferences will be erased immediately.
                            </p>
                            <form onSubmit={handleDelete} style={{ display: "flex", flexDirection: "column", gap: "1rem", flex: 1 }} noValidate>
                                <Input
                                    label={<>Type <span style={{ color: "rgba(252,165,165,0.8)" }}>DELETE</span> to confirm</>}
                                    placeholder="DELETE"
                                    value={deleteInput} onValueChange={setDeleteInput} variant="bordered"
                                    classNames={{
                                        inputWrapper: "border-red-500/20 bg-white/[0.04] hover:border-red-500/40 data-[focus=true]:border-red-500/60",
                                        input: "text-red-300/90 placeholder:text-slate-700 font-mono",
                                        label: "text-slate-400 text-xs",
                                    }}
                                />
                                <div style={{ flex: 1 }} />
                                {divider}
                                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                                    <Button type="submit" isLoading={deleteLoading} isDisabled={deleteInput !== "DELETE"} variant="bordered"
                                            className="border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20 hover:border-red-500/55 font-bold tracking-wide disabled:opacity-40">
                                        Delete My Account
                                    </Button>
                                </div>
                            </form>
                        </SectionCard>

                    </div>{/* end grid */}
                </div>{/* end page body */}
            </div>{/* end UI layer */}

            <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        /* ── Desktop: 2 columns, comfortable padding ── */
        .settings-grid { grid-template-columns: repeat(2, 1fr); }
        .settings-body { padding: 2.5rem 2rem 4rem; }
        .settings-nav  { padding: 1.2rem 2rem; }
        .settings-nav-link { font-size: 0.84rem; padding: 0.5rem 1.4rem; }

        /* ── Tablet (≤ 900px): tighter padding ── */
        @media (max-width: 900px) {
          .settings-body { padding: 2rem 1.25rem 3rem; }
          .settings-nav  { padding: 1rem 1.25rem; }
        }

        /* ── Mobile (≤ 640px): single column ── */
        @media (max-width: 640px) {
          .settings-grid { grid-template-columns: 1fr !important; }
          .settings-body { padding: 1.25rem 1rem 3rem; gap: 1rem; }
          .settings-nav  { padding: 0.85rem 1rem; }
          .settings-nav-logo { font-size: 0.68rem !important; letter-spacing: 0.16em !important; }
          .settings-nav-link { font-size: 0.75rem !important; padding: 0.4rem 0.9rem !important; }
          .settings-card-pad { padding: 1.25rem !important; }
          .settings-h1 { font-size: 1.5rem !important; }
        }

        /* ── iPhone SE (≤ 375px): ultra tight ── */
        @media (max-width: 375px) {
          .settings-body { padding: 1rem 0.75rem 2.5rem; }
          .settings-nav  { padding: 0.75rem 0.75rem; }
          .settings-card-pad { padding: 1rem !important; }
        }
      `}</style>
        </div>
    );
}