"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import Link from "next/link";
import { Input, Button, Textarea } from "@heroui/react";

/* ─────────────────────────────────────────────
   TYPES
───────────────────────────────────────────── */
type FeedbackState = { kind: "success" | "error"; msg: string } | null;

interface ProfileData {
    preferredName: string;
    contactEmail: string;
    phone: string;
    linkedIn: string;
    portfolio: string;
    bio: string;
}

const SAVED_DEFAULTS: ProfileData = {
    preferredName: "Jane",
    contactEmail:  "jane.doe@email.com",
    phone:         "+1 (555) 000-1234",
    linkedIn:      "https://linkedin.com/in/janedoe",
    portfolio:     "https://janedoe.dev",
    bio:           "Full-stack engineer passionate about building delightful products. Open to remote opportunities.",
};

/* ─────────────────────────────────────────────
   VALIDATION HELPERS
───────────────────────────────────────────── */
const RE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RE_URL   = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z]{2,}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)$/;
const RE_PHONE = /^\+?[\d\s\-().]{7,20}$/;

function validate(form: ProfileData): Record<string, string> {
    const e: Record<string, string> = {};
    if (form.contactEmail && !RE_EMAIL.test(form.contactEmail))
        e.contactEmail = "Enter a valid email address";
    if (form.linkedIn && !RE_URL.test(form.linkedIn))
        e.linkedIn = "Enter a valid URL (include https://)";
    if (form.portfolio && !RE_URL.test(form.portfolio))
        e.portfolio = "Enter a valid URL (include https://)";
    if (form.phone && !RE_PHONE.test(form.phone))
        e.phone = "Enter a valid phone number";
    if (form.bio && form.bio.length > 320)
        e.bio = `Bio too long (${form.bio.length}/320 chars)`;
    return e;
}

/* ─────────────────────────────────────────────
   SHARED HeroUI classNames
───────────────────────────────────────────── */
const iCN = (accent: "cyan" | "violet" | "amber" | "red" = "cyan") => {
    const ring = {
        cyan:   "data-[focus=true]:border-cyan-500/60",
        violet: "data-[focus=true]:border-violet-500/60",
        amber:  "data-[focus=true]:border-amber-500/55",
        red:    "data-[focus=true]:border-red-500/60",
    }[accent];
    const hover = {
        cyan:   "hover:border-cyan-500/35",
        violet: "hover:border-violet-500/35",
        amber:  "hover:border-amber-500/30",
        red:    "hover:border-red-500/35",
    }[accent];
    return {
        inputWrapper: `border-white/10 bg-white/[0.04] ${hover} ${ring} backdrop-blur-sm`,
        input:        "text-slate-100 placeholder:text-slate-600",
        label:        "text-slate-400 text-xs",
        errorMessage: "text-red-400/80 text-xs",
    };
};

const taCN = () => ({
    inputWrapper: "border-white/10 bg-white/[0.04] hover:border-cyan-500/35 data-[focus=true]:border-cyan-500/60 backdrop-blur-sm",
    input:        "text-slate-100 placeholder:text-slate-600",
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
        <div style={{
            display: "flex", alignItems: "center", gap: "0.6rem",
            padding: "0.7rem 1rem", borderRadius: "10px",
            background: ok ? "rgba(16,185,129,0.07)" : "rgba(239,68,68,0.07)",
            border: `1px solid ${ok ? "rgba(16,185,129,0.22)" : "rgba(239,68,68,0.22)"}`,
            fontFamily: "'DM Sans',sans-serif", fontSize: "0.85rem",
            color: ok ? "rgba(110,231,183,0.92)" : "rgba(252,165,165,0.92)",
        }}>
            {ok
                ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            }
            {state.msg}
        </div>
    );
}

/* ─────────────────────────────────────────────
   SECTION SHELL
───────────────────────────────────────────── */
function Card({ accentColor, dotColor, eyebrow, title, children }: {
    accentColor: string; dotColor: string;
    eyebrow: string; title: string;
    children: React.ReactNode;
}) {
    return (
        <div className="pf-card" style={{
            background: "rgba(4,12,28,0.82)",
            border: `1px solid ${accentColor}`,
            borderRadius: "16px",
            backdropFilter: "blur(28px)",
            WebkitBackdropFilter: "blur(28px)",
            padding: "2rem",
            boxShadow: "0 0 60px rgba(0,212,255,0.03),inset 0 1px 0 rgba(255,255,255,0.05)",
            display: "flex", flexDirection: "column" as const, gap: "1.25rem",
        }}>
            <div>
                <div style={{
                    display: "inline-flex", alignItems: "center", gap: "0.4rem",
                    fontFamily: "'DM Mono',monospace", fontSize: "0.58rem",
                    letterSpacing: "0.2em", color: "rgba(0,212,255,0.55)",
                    textTransform: "uppercase" as const, marginBottom: "0.55rem",
                    border: "1px solid rgba(0,212,255,0.12)", padding: "0.25rem 0.7rem",
                    borderRadius: "999px", background: "rgba(0,212,255,0.04)",
                }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: dotColor, boxShadow: `0 0 5px ${dotColor}`, display: "inline-block", flexShrink: 0 }} />
                    {eyebrow}
                </div>
                <h2 style={{ fontFamily: "'Syne','Helvetica Neue',sans-serif", fontWeight: 800, fontSize: "1.15rem", letterSpacing: "-0.02em", color: "#f0f8ff", margin: 0 }}>{title}</h2>
            </div>
            {children}
        </div>
    );
}

/* ─────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────── */
export default function ProfileEditPage() {
    const canvasRef = useRef<HTMLDivElement>(null);

    /* form state */
    const [form,    setForm]    = useState<ProfileData>({ ...SAVED_DEFAULTS });
    const [saved,   setSaved]   = useState<ProfileData>({ ...SAVED_DEFAULTS });
    const [errors,  setErrors]  = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState<FeedbackState>(null);

    /* delete confirm state */
    const [deleteInput, setDeleteInput]   = useState("");
    const [deleteLoading, setDeleteLoading] = useState(false);

    const isDirty = JSON.stringify(form) !== JSON.stringify(saved);

    const set = (key: keyof ProfileData) => (v: string) => {
        setForm(p => ({ ...p, [key]: v }));
        if (errors[key]) setErrors(p => { const n = { ...p }; delete n[key]; return n; });
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const errs = validate(form);
        setErrors(errs);
        if (Object.keys(errs).length) return;
        setLoading(true);
        await new Promise(r => setTimeout(r, 900)); // TODO: wire API
        setLoading(false);
        setSaved({ ...form });
        setFeedback({ kind: "success", msg: "Profile saved successfully." });
        setTimeout(() => setFeedback(null), 4000);
    };

    const handleClear = () => {
        setForm({ ...saved });
        setErrors({});
        setFeedback(null);
    };

    const handleDelete = async (e: React.FormEvent) => {
        e.preventDefault();
        if (deleteInput !== "DELETE") return;
        setDeleteLoading(true);
        await new Promise(r => setTimeout(r, 1200)); // TODO: wire API
        setDeleteLoading(false);
        console.log("Account deletion requested");
    };

    /* ── Three.js (no special effects — base scene only) ── */
    useEffect(() => {
        if (!canvasRef.current) return;
        const mount = canvasRef.current;
        let w = window.innerWidth, h = window.innerHeight;
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(w, h);
        renderer.setClearColor(0x00020a, 1);
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
        const sg = new THREE.BufferGeometry();
        sg.setAttribute("position", new THREE.BufferAttribute(sPos, 3));
        scene.add(new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xffffff, size: .08, transparent: true, opacity: .42 })));

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

    const divider = <div style={{ height: 1, background: "rgba(255,255,255,0.055)" }} />;

    return (
        <div style={{ position: "fixed", inset: 0, background: "linear-gradient(160deg,#00020a 0%,#020b18 45%,#050e1f 100%)", overflow: "hidden" }}>

            {/* Layer 0 — canvas */}
            <div ref={canvasRef} style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" }} />

            {/* Layer 1 — vignette */}
            <div style={{ position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none", background: "radial-gradient(ellipse 80% 70% at 50% 50%,transparent 20%,rgba(0,2,10,0.72) 100%)" }} />

            {/* Layer 2 — UI */}
            <div style={{ position: "absolute", inset: 0, zIndex: 2, pointerEvents: "auto", overflowY: "auto", display: "flex", flexDirection: "column" }}>

                {/* ── Nav ── */}
                <nav className="pf-nav" style={{
                    position: "sticky", top: 0, zIndex: 10, flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    boxSizing: "border-box" as const,
                    backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
                    background: "rgba(0,2,10,0.6)", borderBottom: "1px solid rgba(255,255,255,0.05)",
                }}>
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

                {/* ── Page body ── */}
                <div className="pf-body" style={{ flex: 1, boxSizing: "border-box" as const, display: "flex", flexDirection: "column", gap: "1.5rem" }}>

                    {/* Page header */}
                    <div>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.45rem", fontFamily: "'DM Mono',monospace", fontSize: "0.6rem", letterSpacing: "0.2em", color: "rgba(0,212,255,0.55)", textTransform: "uppercase" as const, marginBottom: "0.8rem", border: "1px solid rgba(0,212,255,0.12)", padding: "0.28rem 0.75rem", borderRadius: "999px", background: "rgba(0,212,255,0.04)" }}>
                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#00d4ff", boxShadow: "0 0 6px #00d4ff", display: "inline-block" }} />
                            Public Profile
                        </div>
                        <h1 className="pf-h1" style={{ fontFamily: "'Syne','Helvetica Neue',sans-serif", fontWeight: 800, fontSize: "clamp(1.5rem,5vw,2.6rem)", letterSpacing: "-0.03em", color: "#f0f8ff", margin: 0, lineHeight: 1.05 }}>
                            Edit your{" "}
                            <span style={{ background: "linear-gradient(90deg,#00d4ff 0%,#7c3aed 55%,#10b981 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                profile
              </span>
                        </h1>
                        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.82rem", color: "rgba(160,200,240,0.42)", marginTop: "0.4rem" }}>
                            This information may be visible to recruiters and collaborators.
                        </p>
                    </div>

                    {/* ── FORM ── */}
                    <form onSubmit={handleSave} noValidate style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

                        {/* ── TOP GRID — Identity + Contact ── */}
                        <div className="pf-grid" style={{ display: "grid", gap: "1.25rem" }}>

                            {/* Identity card */}
                            <Card eyebrow="Identity" title="Personal Details" accentColor="rgba(0,212,255,0.18)" dotColor="#00d4ff">
                                <Input
                                    label="Preferred Name"
                                    placeholder="What should we call you?"
                                    value={form.preferredName}
                                    onValueChange={set("preferredName")}
                                    variant="bordered"
                                    classNames={iCN("cyan")}
                                    description="This is shown in the app instead of your legal name."
                                    classNames={{
                                        ...iCN("cyan"),
                                        description: "text-slate-600 text-xs mt-0.5",
                                    }}
                                />
                                <div>
                                    <Textarea
                                        label="Bio"
                                        placeholder="A short paragraph about you, your skills, or what you're looking for…"
                                        value={form.bio}
                                        onValueChange={set("bio")}
                                        variant="bordered"
                                        minRows={3}
                                        maxRows={6}
                                        isInvalid={!!errors.bio}
                                        errorMessage={errors.bio}
                                        classNames={taCN()}
                                    />
                                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "0.3rem" }}>
                    <span style={{ fontFamily: "'DM Mono',monospace", fontSize: "0.55rem", letterSpacing: "0.1em", color: form.bio.length > 300 ? "rgba(245,158,11,0.7)" : "rgba(160,200,240,0.25)" }}>
                      {form.bio.length} / 320
                    </span>
                                    </div>
                                </div>
                            </Card>

                            {/* Contact card */}
                            <Card eyebrow="Contact" title="Contact Details" accentColor="rgba(124,58,237,0.18)" dotColor="#7c3aed">
                                <Input
                                    label="Contact Email"
                                    type="email"
                                    placeholder="recruiter-facing@email.com"
                                    value={form.contactEmail}
                                    onValueChange={set("contactEmail")}
                                    variant="bordered"
                                    isInvalid={!!errors.contactEmail}
                                    errorMessage={errors.contactEmail}
                                    classNames={iCN("violet")}
                                    startContent={
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(124,58,237,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                                        </svg>
                                    }
                                />
                                <Input
                                    label="Phone Number"
                                    type="tel"
                                    placeholder="+1 (555) 000-0000"
                                    value={form.phone}
                                    onValueChange={set("phone")}
                                    variant="bordered"
                                    isInvalid={!!errors.phone}
                                    errorMessage={errors.phone}
                                    classNames={iCN("violet")}
                                    startContent={
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(124,58,237,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                                        </svg>
                                    }
                                />
                            </Card>
                        </div>

                        {/* ── LINKS CARD — full width ── */}
                        <Card eyebrow="Links" title="Online Presence" accentColor="rgba(16,185,129,0.18)" dotColor="#10b981">
                            <div className="pf-links-grid" style={{ display: "grid", gap: "1rem" }}>
                                <Input
                                    label="LinkedIn URL"
                                    placeholder="https://linkedin.com/in/your-profile"
                                    value={form.linkedIn}
                                    onValueChange={set("linkedIn")}
                                    variant="bordered"
                                    isInvalid={!!errors.linkedIn}
                                    errorMessage={errors.linkedIn}
                                    classNames={iCN("cyan")}
                                    startContent={
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="rgba(16,185,129,0.55)" style={{ flexShrink: 0 }}>
                                            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/>
                                        </svg>
                                    }
                                />
                                <Input
                                    label="Portfolio URL"
                                    placeholder="https://yoursite.dev"
                                    value={form.portfolio}
                                    onValueChange={set("portfolio")}
                                    variant="bordered"
                                    isInvalid={!!errors.portfolio}
                                    errorMessage={errors.portfolio}
                                    classNames={iCN("cyan")}
                                    startContent={
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(16,185,129,0.55)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                                            <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
                                            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                                        </svg>
                                    }
                                />
                            </div>
                        </Card>

                        {/* ── FORM ACTIONS ── */}
                        {feedback && <Feedback state={feedback} />}

                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" as const, gap: "0.75rem" }}>
                            <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" as const }}>
                                <Button
                                    type="submit"
                                    isLoading={loading}
                                    isDisabled={!isDirty && !loading}
                                    variant="bordered"
                                    className="border-cyan-500/30 bg-cyan-500/10 text-slate-100 hover:bg-cyan-500/22 hover:border-cyan-500/55 font-bold tracking-wide disabled:opacity-40"
                                >
                                    Save Changes
                                </Button>
                                <Button
                                    type="button"
                                    onPress={handleClear}
                                    isDisabled={!isDirty}
                                    variant="bordered"
                                    className="border-white/10 bg-white/[0.03] text-slate-400 hover:bg-white/[0.07] hover:text-slate-200 hover:border-white/20 font-medium tracking-wide disabled:opacity-30"
                                >
                                    Clear Form
                                </Button>
                            </div>
                            {isDirty && (
                                <span style={{ fontFamily: "'DM Mono',monospace", fontSize: "0.58rem", letterSpacing: "0.12em", textTransform: "uppercase" as const, color: "rgba(245,158,11,0.6)", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#f59e0b", display: "inline-block" }} />
                  Unsaved changes
                </span>
                            )}
                        </div>

                        {/* ── DANGER ZONE ── */}
                        {divider}

                        <Card eyebrow="Irreversible Actions" title="Danger Zone" accentColor="rgba(239,68,68,0.22)" dotColor="#ef4444">
                            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.875rem", color: "rgba(160,200,240,0.5)", lineHeight: 1.75, margin: 0 }}>
                                Permanently delete your account and all associated data. This action{" "}
                                <span style={{ color: "rgba(252,165,165,0.85)", fontWeight: 600 }}>cannot be undone</span>.
                                All your applications, notes, and profile information will be erased immediately.
                            </p>
                            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                <Input
                                    label={<>Type <span style={{ color: "rgba(252,165,165,0.8)" }}>DELETE</span> to confirm</>}
                                    placeholder="DELETE"
                                    value={deleteInput}
                                    onValueChange={setDeleteInput}
                                    variant="bordered"
                                    classNames={{
                                        inputWrapper: "border-red-500/20 bg-white/[0.03] hover:border-red-500/40 data-[focus=true]:border-red-500/60",
                                        input: "text-red-300/90 placeholder:text-slate-700 font-mono",
                                        label: "text-slate-400 text-xs",
                                    }}
                                />
                                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                                    <Button
                                        onPress={() => handleDelete({ preventDefault: () => {} } as any)}
                                        isLoading={deleteLoading}
                                        isDisabled={deleteInput !== "DELETE"}
                                        variant="bordered"
                                        className="border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20 hover:border-red-500/55 font-bold tracking-wide disabled:opacity-35"
                                    >
                                        Delete My Account
                                    </Button>
                                </div>
                            </div>
                        </Card>

                    </form>

                    <div style={{ height: "2rem" }} />
                </div>
            </div>

            <style>{`
        .pf-nav       { padding: 1.2rem 2rem; }
        .pf-body      { padding: 2.5rem 2rem 4rem; }
        .pf-grid      { grid-template-columns: repeat(2, 1fr); }
        .pf-links-grid { grid-template-columns: repeat(2, 1fr); }

        @media (max-width: 900px) {
          .pf-nav  { padding: 1rem 1.25rem; }
          .pf-body { padding: 2rem 1.25rem 3rem; }
        }

        @media (max-width: 640px) {
          .pf-nav        { padding: 0.85rem 1rem; }
          .pf-nav-link   { font-size: 0.75rem !important; padding: 0.4rem 0.9rem !important; }
          .pf-body       { padding: 1.25rem 1rem 3rem; gap: 1rem; }
          .pf-grid       { grid-template-columns: 1fr !important; }
          .pf-links-grid { grid-template-columns: 1fr !important; }
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