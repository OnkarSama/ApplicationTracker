"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import Link from "next/link";

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
   FIELD
───────────────────────────────────────────── */
function Field({ label, type = "text", value, onChange, placeholder, error, rightSlot }: {
    label: string; type?: string; value: string; onChange: (v: string) => void;
    placeholder?: string; error?: string; rightSlot?: React.ReactNode;
}) {
    const [focused, setFocused] = useState(false);
    return (
        <div style={{ display:"flex", flexDirection:"column", gap:"0.36rem" }}>
            <label style={{ fontFamily:"'DM Mono',monospace", fontSize:"0.6rem", letterSpacing:"0.18em", textTransform:"uppercase" as const, color: focused ? "rgba(0,212,255,0.85)" : "rgba(160,200,240,0.38)", transition:"color 0.2s" }}>
                {label}
            </label>
            <div style={{ position:"relative" }}>
                <input
                    type={type} value={value} placeholder={placeholder ?? ""}
                    onChange={e => onChange(e.target.value)}
                    onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
                    style={{ width:"100%", boxSizing:"border-box" as const, fontFamily:"'DM Sans',sans-serif", fontSize:"0.875rem", color: error ? "rgba(252,165,165,0.9)" : "#e8f4ff", background: focused ? "rgba(0,212,255,0.06)" : "rgba(255,255,255,0.035)", border:`1px solid ${error ? "rgba(239,68,68,0.5)" : focused ? "rgba(0,212,255,0.5)" : "rgba(255,255,255,0.09)"}`, borderRadius:"8px", padding: rightSlot ? "0.62rem 2.8rem 0.62rem 0.88rem" : "0.62rem 0.88rem", outline:"none", backdropFilter:"blur(8px)", boxShadow: error ? "0 0 14px rgba(239,68,68,0.1)" : focused ? "0 0 14px rgba(0,212,255,0.1)" : "none", transition:"all 0.2s" }}
                />
                {rightSlot && <div style={{ position:"absolute", right:"0.75rem", top:"50%", transform:"translateY(-50%)" }}>{rightSlot}</div>}
            </div>
            {error && <span style={{ fontFamily:"'DM Mono',monospace", fontSize:"0.62rem", color:"rgba(252,165,165,0.8)" }}>{error}</span>}
        </div>
    );
}

/* ─────────────────────────────────────────────
   TOGGLE
───────────────────────────────────────────── */
function Toggle({ checked, onChange, label, description }: { checked: boolean; onChange: (v: boolean) => void; label: string; description: string }) {
    return (
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:"1rem" }}>
            <div style={{ display:"flex", flexDirection:"column", gap:"0.2rem" }}>
                <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"0.875rem", color:"#e0f0ff", fontWeight:500 }}>{label}</span>
                <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"0.75rem", color:"rgba(160,200,240,0.4)" }}>{description}</span>
            </div>
            <button type="button" onClick={() => onChange(!checked)} style={{ flexShrink:0, width:"42px", height:"24px", borderRadius:"999px", border:`1px solid ${checked ? "rgba(0,212,255,0.5)" : "rgba(255,255,255,0.1)"}`, background: checked ? "rgba(0,212,255,0.18)" : "rgba(255,255,255,0.04)", boxShadow: checked ? "0 0 12px rgba(0,212,255,0.2)" : "none", cursor:"pointer", position:"relative", transition:"all 0.25s", outline:"none" }}>
                <span style={{ position:"absolute", top:"2px", left: checked ? "20px" : "2px", width:"18px", height:"18px", borderRadius:"50%", background: checked ? "#00d4ff" : "rgba(160,200,240,0.3)", boxShadow: checked ? "0 0 8px rgba(0,212,255,0.6)" : "none", transition:"all 0.25s" }} />
            </button>
        </div>
    );
}

/* ─────────────────────────────────────────────
   SECTION CARD
───────────────────────────────────────────── */
function SectionCard({ eyebrow, title, accentColor, dotColor, children }: { eyebrow: string; title: string; accentColor: string; dotColor: string; children: React.ReactNode }) {
    return (
        <div style={{ background:"rgba(4,12,28,0.80)", border:`1px solid ${accentColor}`, borderRadius:"16px", backdropFilter:"blur(28px)", WebkitBackdropFilter:"blur(28px)", padding:"2rem", boxShadow:"0 0 60px rgba(0,212,255,0.04),inset 0 1px 0 rgba(255,255,255,0.05)" }}>
            <div style={{ marginBottom:"1.5rem" }}>
                <div style={{ display:"inline-flex", alignItems:"center", gap:"0.45rem", fontFamily:"'DM Mono',monospace", fontSize:"0.6rem", letterSpacing:"0.2em", color:"rgba(0,212,255,0.55)", textTransform:"uppercase" as const, marginBottom:"0.75rem", border:"1px solid rgba(0,212,255,0.12)", padding:"0.28rem 0.75rem", borderRadius:"999px", background:"rgba(0,212,255,0.04)" }}>
                    <span style={{ width:6, height:6, borderRadius:"50%", background:dotColor, boxShadow:`0 0 6px ${dotColor}`, display:"inline-block", flexShrink:0 }} />
                    {eyebrow}
                </div>
                <h2 style={{ fontFamily:"'Syne','Helvetica Neue',sans-serif", fontWeight:800, fontSize:"1.25rem", letterSpacing:"-0.02em", color:"#f0f8ff", margin:0 }}>{title}</h2>
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
        <div style={{ display:"flex", alignItems:"center", gap:"0.6rem", padding:"0.65rem 0.9rem", borderRadius:"8px", background: ok ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)", border:`1px solid ${ok ? "rgba(16,185,129,0.25)" : "rgba(239,68,68,0.25)"}`, fontFamily:"'DM Sans',sans-serif", fontSize:"0.82rem", color: ok ? "rgba(110,231,183,0.9)" : "rgba(252,165,165,0.9)" }}>
            {ok
                ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>}
            {state.msg}
        </div>
    );
}

/* ─────────────────────────────────────────────
   SUBMIT BUTTON
───────────────────────────────────────────── */
function SubmitBtn({ loading, label = "Save Changes", danger = false }: { loading: boolean; label?: string; danger?: boolean }) {
    return (
        <button type="submit" disabled={loading} style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:"0.88rem", letterSpacing:"0.06em", padding:"0.7rem 1.8rem", borderRadius:"8px", background: danger ? "rgba(239,68,68,0.1)" : "linear-gradient(135deg,rgba(0,212,255,0.15) 0%,rgba(124,58,237,0.15) 100%)", color: danger ? "rgba(252,165,165,0.9)" : "#e8f4ff", border:`1px solid ${danger ? "rgba(239,68,68,0.3)" : "rgba(0,212,255,0.28)"}`, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.5 : 1, display:"flex", alignItems:"center", gap:"0.5rem", transition:"all 0.2s" }}
                onMouseEnter={e => { if(loading) return; const el=e.currentTarget as HTMLButtonElement; el.style.background=danger?"rgba(239,68,68,0.18)":"linear-gradient(135deg,rgba(0,212,255,0.24) 0%,rgba(124,58,237,0.24) 100%)"; el.style.borderColor=danger?"rgba(239,68,68,0.55)":"rgba(0,212,255,0.52)"; el.style.boxShadow=danger?"0 0 24px rgba(239,68,68,0.18)":"0 0 28px rgba(0,212,255,0.16)"; el.style.transform="translateY(-1px)"; }}
                onMouseLeave={e => { const el=e.currentTarget as HTMLButtonElement; el.style.background=danger?"rgba(239,68,68,0.1)":"linear-gradient(135deg,rgba(0,212,255,0.15) 0%,rgba(124,58,237,0.15) 100%)"; el.style.borderColor=danger?"rgba(239,68,68,0.3)":"rgba(0,212,255,0.28)"; el.style.boxShadow="none"; el.style.transform="translateY(0)"; }}
        >
            {loading && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation:"spin 0.8s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>}
            {loading ? "Saving…" : label}
        </button>
    );
}

/* ─────────────────────────────────────────────
   EYE BUTTON
───────────────────────────────────────────── */
function EyeBtn({ visible, onToggle }: { visible: boolean; onToggle: () => void }) {
    return (
        <button type="button" onClick={onToggle} style={{ background:"none", border:"none", cursor:"pointer", padding:0, color:"rgba(160,200,240,0.4)", display:"flex", alignItems:"center", transition:"color 0.2s" }}
                onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.color="rgba(0,212,255,0.8)"}}
                onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.color="rgba(160,200,240,0.4)"}}>
            {visible
                ? <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                : <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
        </button>
    );
}

/* ─────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────── */
export default function SettingsPage() {
    const canvasRef = useRef<HTMLDivElement>(null);

    const [newEmail, setNewEmail] = useState("");
    const [confirmEmail, setConfirmEmail] = useState("");
    const [emailErrors, setEmailErrors] = useState<Record<string,string>>({});
    const [emailLoading, setEmailLoading] = useState(false);
    const [emailFeedback, setEmailFeedback] = useState<FeedbackState>(null);

    const [currentPw, setCurrentPw] = useState("");
    const [newPw, setNewPw] = useState("");
    const [confirmPw, setConfirmPw] = useState("");
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [pwErrors, setPwErrors] = useState<Record<string,string>>({});
    const [pwLoading, setPwLoading] = useState(false);
    const [pwFeedback, setPwFeedback] = useState<FeedbackState>(null);

    const [notifs, setNotifs] = useState<NotifPrefs>({ appUpdates:true, weeklyDigest:false, interviewReminders:true, pushMessages:true, pushStatus:false });
    const [notifLoading, setNotifLoading] = useState(false);
    const [notifFeedback, setNotifFeedback] = useState<FeedbackState>(null);

    const [deleteInput, setDeleteInput] = useState("");
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteFocused, setDeleteFocused] = useState(false);

    const flash = useCallback((set: (v: FeedbackState) => void, kind: "success"|"error", msg: string) => {
        set({ kind, msg });
        setTimeout(() => set(null), 4000);
    }, []);

    const strength = (() => {
        if (!newPw) return null;
        let s = 0;
        if (newPw.length >= 8) s++;
        if (newPw.length >= 12) s++;
        if (/[A-Z]/.test(newPw)) s++;
        if (/[0-9]/.test(newPw)) s++;
        if (/[^A-Za-z0-9]/.test(newPw)) s++;
        if (s <= 2) return { label:"Weak", pct:"25%", color:"#ef4444" };
        if (s === 3) return { label:"Fair", pct:"50%", color:"#f59e0b" };
        if (s === 4) return { label:"Good", pct:"75%", color:"#00d4ff" };
        return { label:"Strong", pct:"100%", color:"#10b981" };
    })();

    const validateEmail = () => {
        const e: Record<string,string> = {};
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!newEmail) e.newEmail = "Email is required";
        else if (!re.test(newEmail)) e.newEmail = "Enter a valid email";
        if (!confirmEmail) e.confirmEmail = "Please confirm your email";
        else if (newEmail !== confirmEmail) e.confirmEmail = "Emails do not match";
        setEmailErrors(e); return !Object.keys(e).length;
    };

    const validatePw = () => {
        const e: Record<string,string> = {};
        if (!currentPw) e.currentPw = "Current password is required";
        if (!newPw) e.newPw = "New password is required";
        else if (newPw.length < 8) e.newPw = "At least 8 characters required";
        else if (!/[A-Z]/.test(newPw)) e.newPw = "Must include an uppercase letter";
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

    /* Three.js */
    useEffect(() => {
        if (!canvasRef.current) return;
        const mount = canvasRef.current;
        let w = window.innerWidth, h = window.innerHeight;
        const renderer = new THREE.WebGLRenderer({ antialias:true, alpha:false });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
        renderer.setSize(w,h); renderer.setClearColor(0x00020a,1);
        mount.appendChild(renderer.domElement);
        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x000000,0.016);
        const camera = new THREE.PerspectiveCamera(55,w/h,0.1,300);
        camera.position.set(0,0,34);
        scene.add(new THREE.AmbientLight(0xffffff,0.25));
        const L1=new THREE.PointLight(0x00d4ff,3.5,90); L1.position.set(-18,12,14); scene.add(L1);
        const L2=new THREE.PointLight(0x7c3aed,3.0,90); L2.position.set(18,-10,10); scene.add(L2);
        const L3=new THREE.PointLight(0x10b981,1.8,70); L3.position.set(0,18,-8);   scene.add(L3);
        interface FM extends THREE.Mesh { userData:{vx:number;vy:number;vz:number;rx:number;ry:number;rz:number} }
        const cards:FM[]=[];
        [{w:5.5,h:3.2,c:0x00d4ff,x:-16,y:5,z:-5},{w:4.8,h:2.8,c:0x7c3aed,x:15,y:-7,z:-3},{w:6.0,h:3.6,c:0x10b981,x:-11,y:-9,z:3},{w:5.0,h:3.0,c:0x00d4ff,x:17,y:8,z:-7},{w:4.4,h:2.6,c:0xf59e0b,x:5,y:-13,z:5},{w:5.2,h:3.1,c:0x7c3aed,x:-20,y:-3,z:1},{w:4.6,h:2.9,c:0x10b981,x:12,y:13,z:-9},{w:5.8,h:3.4,c:0xf59e0b,x:-6,y:12,z:3},{w:4.2,h:2.5,c:0x00d4ff,x:22,y:-2,z:-5},{w:5.4,h:3.3,c:0x7c3aed,x:-8,y:-15,z:-3}].forEach(({w,h,c,x,y,z})=>{
            const geo=new THREE.BoxGeometry(w,h,0.06);
            const card=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color:c,roughness:0.05,metalness:0.9,transparent:true,opacity:0.13})) as FM;
            card.position.set(x,y,z); card.rotation.set((Math.random()-.5)*.5,(Math.random()-.5)*.5,(Math.random()-.5)*.3);
            card.userData={vx:(Math.random()-.5)*.006,vy:(Math.random()-.5)*.005,vz:(Math.random()-.5)*.003,rx:(Math.random()-.5)*.0015,ry:(Math.random()-.5)*.002,rz:(Math.random()-.5)*.001};
            card.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo),new THREE.LineBasicMaterial({color:c,transparent:true,opacity:0.55})));
            scene.add(card); cards.push(card);
        });
        const ring1=new THREE.Mesh(new THREE.TorusGeometry(14,.04,8,120),new THREE.MeshBasicMaterial({color:0x00d4ff,transparent:true,opacity:.14})); ring1.rotation.x=Math.PI/2.8; scene.add(ring1);
        const ring2=new THREE.Mesh(new THREE.TorusGeometry(20,.03,8,140),new THREE.MeshBasicMaterial({color:0x7c3aed,transparent:true,opacity:.1})); ring2.rotation.x=Math.PI/3.5; ring2.rotation.z=0.4; scene.add(ring2);
        const orbColors=[0x10b981,0x00d4ff,0xf59e0b,0xef4444,0x7c3aed]; const orbs:THREE.Mesh[]=[];
        for(let i=0;i<20;i++){ const col=orbColors[i%orbColors.length]; const orb=new THREE.Mesh(new THREE.SphereGeometry(.12+Math.random()*.18,14,14),new THREE.MeshStandardMaterial({color:col,emissive:col,emissiveIntensity:.9,roughness:0,metalness:.3})); orb.position.set((Math.random()-.5)*52,(Math.random()-.5)*38,(Math.random()-.5)*24); (orb as any).userData={vx:(Math.random()-.5)*.013,vy:(Math.random()-.5)*.01,pulse:Math.random()*Math.PI*2}; orbs.push(orb); scene.add(orb); }
        const grid=new THREE.GridHelper(120,40,0x00d4ff,0x0a1628); grid.position.y=-20; (grid.material as THREE.Material).transparent=true; (grid.material as THREE.Material).opacity=0.14; scene.add(grid);
        const sPos=new Float32Array(1500); for(let i=0;i<1500;i++) sPos[i]=(Math.random()-.5)*130;
        const starGeo=new THREE.BufferGeometry(); starGeo.setAttribute("position",new THREE.BufferAttribute(sPos,3));
        const stars=new THREE.Points(starGeo,new THREE.PointsMaterial({color:0xffffff,size:.08,transparent:true,opacity:.42})); scene.add(stars);
        const mouse={x:0,y:0};
        const onMM=(e:MouseEvent)=>{mouse.x=(e.clientX/window.innerWidth-.5)*2;mouse.y=-(e.clientY/window.innerHeight-.5)*2;};
        window.addEventListener("mousemove",onMM);
        const onResize=()=>{w=window.innerWidth;h=window.innerHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();};
        window.addEventListener("resize",onResize);
        let fId:number; const clock=new THREE.Clock();
        const animate=()=>{ fId=requestAnimationFrame(animate); const t=clock.getElapsedTime();
            camera.position.x+=(mouse.x*3.5-camera.position.x)*0.03; camera.position.y+=(mouse.y*2.2-camera.position.y)*0.03; camera.lookAt(scene.position);
            cards.forEach(c=>{const d=c.userData;c.position.x+=d.vx;c.position.y+=d.vy;c.position.z+=d.vz;c.rotation.x+=d.rx;c.rotation.y+=d.ry;c.rotation.z+=d.rz;if(Math.abs(c.position.x)>28)d.vx*=-1;if(Math.abs(c.position.y)>20)d.vy*=-1;if(Math.abs(c.position.z)>12)d.vz*=-1;});
            orbs.forEach(o=>{const d=(o as any).userData;o.position.x+=d.vx;o.position.y+=d.vy;if(Math.abs(o.position.x)>30)d.vx*=-1;if(Math.abs(o.position.y)>22)d.vy*=-1;(o.material as THREE.MeshStandardMaterial).emissiveIntensity=.55+.5*Math.sin(t*2.1+d.pulse);});
            ring1.rotation.z=t*.065;ring2.rotation.z=-t*.04;ring2.rotation.y=t*.022;
            L1.position.x=Math.sin(t*.38)*22;L1.position.y=Math.cos(t*.28)*15;L2.position.x=Math.cos(t*.33)*22;L2.position.y=Math.sin(t*.26)*13;
            grid.position.z=(t*1.8)%3;stars.rotation.y=t*.005; renderer.render(scene,camera);
        }; animate();
        return ()=>{ cancelAnimationFrame(fId); window.removeEventListener("mousemove",onMM); window.removeEventListener("resize",onResize); renderer.dispose(); if(mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement); };
    },[]);

    const D = <div style={{ height:1, background:"rgba(255,255,255,0.055)", margin:"1.4rem 0" }} />;

    return (
        <div style={{ position:"fixed", inset:0, background:"linear-gradient(160deg,#00020a 0%,#020b18 45%,#050e1f 100%)", overflow:"hidden" }}>
            <div ref={canvasRef} style={{ position:"absolute", inset:0, zIndex:0, pointerEvents:"none" }} />
            <div style={{ position:"absolute", inset:0, zIndex:1, pointerEvents:"none", background:"radial-gradient(ellipse 80% 70% at 50% 50%,transparent 20%,rgba(0,2,10,0.72) 100%)" }} />
            <div style={{ position:"absolute", inset:0, zIndex:2, pointerEvents:"auto", overflowY:"auto", display:"flex", flexDirection:"column", alignItems:"center" }}>

                {/* Nav */}
                <nav style={{ width:"100%", flexShrink:0, position:"sticky", top:0, zIndex:10, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"1.2rem 2.5rem", boxSizing:"border-box" as const, backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)", background:"rgba(0,2,10,0.55)", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
                    <Link href="/" style={{ fontFamily:"'DM Mono',monospace", fontSize:"0.78rem", letterSpacing:"0.22em", color:"rgba(0,212,255,0.65)", textTransform:"uppercase", textDecoration:"none", transition:"color 0.2s" }} onMouseEnter={e=>{(e.currentTarget as HTMLAnchorElement).style.color="#00d4ff"}} onMouseLeave={e=>{(e.currentTarget as HTMLAnchorElement).style.color="rgba(0,212,255,0.65)"}}>ApplyOS</Link>
                    <Link href="/dashboard" style={{ fontFamily:"'DM Sans',sans-serif", fontWeight:500, fontSize:"0.84rem", letterSpacing:"0.06em", padding:"0.5rem 1.4rem", borderRadius:"6px", background:"rgba(0,212,255,0.07)", color:"rgba(0,212,255,0.88)", border:"1px solid rgba(0,212,255,0.22)", textDecoration:"none", display:"inline-block", transition:"all 0.2s" }} onMouseEnter={e=>{const el=e.currentTarget as HTMLAnchorElement;el.style.background="rgba(0,212,255,0.14)";el.style.borderColor="rgba(0,212,255,0.55)";el.style.boxShadow="0 0 22px rgba(0,212,255,0.22)"}} onMouseLeave={e=>{const el=e.currentTarget as HTMLAnchorElement;el.style.background="rgba(0,212,255,0.07)";el.style.borderColor="rgba(0,212,255,0.22)";el.style.boxShadow="none"}}>← Dashboard</Link>
                </nav>

                {/* Page header */}
                <div style={{ width:"100%", maxWidth:"620px", padding:"2.5rem 1.5rem 1rem", boxSizing:"border-box" as const }}>
                    <div style={{ display:"inline-flex", alignItems:"center", gap:"0.45rem", fontFamily:"'DM Mono',monospace", fontSize:"0.6rem", letterSpacing:"0.2em", color:"rgba(0,212,255,0.55)", textTransform:"uppercase" as const, marginBottom:"0.9rem", border:"1px solid rgba(0,212,255,0.12)", padding:"0.28rem 0.75rem", borderRadius:"999px", background:"rgba(0,212,255,0.04)" }}>
                        <span style={{ width:6, height:6, borderRadius:"50%", background:"#10b981", boxShadow:"0 0 6px #10b981", display:"inline-block" }}/>
                        Account Settings
                    </div>
                    <h1 style={{ fontFamily:"'Syne','Helvetica Neue',sans-serif", fontWeight:800, fontSize:"clamp(1.8rem,4vw,2.6rem)", letterSpacing:"-0.03em", color:"#f0f8ff", margin:0, lineHeight:1.05 }}>
                        Manage your{" "}
                        <span style={{ background:"linear-gradient(90deg,#00d4ff 0%,#7c3aed 55%,#10b981 100%)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>account</span>
                    </h1>
                    <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"0.85rem", color:"rgba(160,200,240,0.42)", marginTop:"0.5rem" }}>
                        Update your credentials, notifications, and account preferences.
                    </p>
                </div>

                {/* Sections */}
                <div style={{ width:"100%", maxWidth:"620px", padding:"0 1.5rem 4rem", boxSizing:"border-box" as const, display:"flex", flexDirection:"column", gap:"1.5rem" }}>

                    {/* Change Email */}
                    <SectionCard eyebrow="Email Address" title="Change Email" accentColor="rgba(0,212,255,0.18)" dotColor="#00d4ff">
                        <form onSubmit={handleEmailSubmit} style={{ display:"flex", flexDirection:"column", gap:"1rem" }} noValidate>
                            <Field label="New Email Address" type="email" value={newEmail} onChange={setNewEmail} placeholder="new@email.com" error={emailErrors.newEmail} />
                            <Field label="Confirm New Email" type="email" value={confirmEmail} onChange={setConfirmEmail} placeholder="new@email.com" error={emailErrors.confirmEmail} />
                            {emailFeedback && <Feedback state={emailFeedback} />}
                            {D}
                            <div style={{ display:"flex", justifyContent:"flex-end" }}><SubmitBtn loading={emailLoading} /></div>
                        </form>
                    </SectionCard>

                    {/* Change Password */}
                    <SectionCard eyebrow="Security" title="Change Password" accentColor="rgba(124,58,237,0.18)" dotColor="#7c3aed">
                        <form onSubmit={handlePwSubmit} style={{ display:"flex", flexDirection:"column", gap:"1rem" }} noValidate>
                            <Field label="Current Password" type={showCurrent?"text":"password"} value={currentPw} onChange={setCurrentPw} placeholder="••••••••" error={pwErrors.currentPw} rightSlot={<EyeBtn visible={showCurrent} onToggle={()=>setShowCurrent(v=>!v)}/>} />
                            <Field label="New Password" type={showNew?"text":"password"} value={newPw} onChange={setNewPw} placeholder="••••••••" error={pwErrors.newPw} rightSlot={<EyeBtn visible={showNew} onToggle={()=>setShowNew(v=>!v)}/>} />
                            {strength && (
                                <div style={{ display:"flex", flexDirection:"column", gap:"0.4rem" }}>
                                    <div style={{ height:"3px", width:"100%", borderRadius:"999px", background:"rgba(255,255,255,0.06)", overflow:"hidden" }}>
                                        <div style={{ height:"100%", width:strength.pct, background:strength.color, borderRadius:"999px", boxShadow:`0 0 8px ${strength.color}88`, transition:"all 0.4s" }}/>
                                    </div>
                                    <span style={{ fontFamily:"'DM Mono',monospace", fontSize:"0.58rem", letterSpacing:"0.14em", textTransform:"uppercase" as const, color:strength.color }}>Strength: {strength.label}</span>
                                </div>
                            )}
                            <Field label="Confirm New Password" type={showConfirm?"text":"password"} value={confirmPw} onChange={setConfirmPw} placeholder="••••••••" error={pwErrors.confirmPw} rightSlot={<EyeBtn visible={showConfirm} onToggle={()=>setShowConfirm(v=>!v)}/>} />
                            {pwFeedback && <Feedback state={pwFeedback} />}
                            {D}
                            <div style={{ display:"flex", justifyContent:"flex-end" }}><SubmitBtn loading={pwLoading} /></div>
                        </form>
                    </SectionCard>

                    {/* Notifications */}
                    <SectionCard eyebrow="Notifications" title="Notification Preferences" accentColor="rgba(16,185,129,0.18)" dotColor="#10b981">
                        <form onSubmit={handleNotifSubmit} style={{ display:"flex", flexDirection:"column", gap:"1.4rem" }} noValidate>
                            <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
                                <p style={{ fontFamily:"'DM Mono',monospace", fontSize:"0.58rem", letterSpacing:"0.16em", textTransform:"uppercase" as const, color:"rgba(160,200,240,0.3)", margin:0 }}>Email</p>
                                <Toggle checked={notifs.appUpdates} onChange={v=>setNotifs(p=>({...p,appUpdates:v}))} label="Application Updates" description="Get notified when your application status changes." />
                                <Toggle checked={notifs.weeklyDigest} onChange={v=>setNotifs(p=>({...p,weeklyDigest:v}))} label="Weekly Digest" description="A summary of your pipeline activity every Monday." />
                                <Toggle checked={notifs.interviewReminders} onChange={v=>setNotifs(p=>({...p,interviewReminders:v}))} label="Interview Reminders" description="Reminders 24 hours before scheduled interviews." />
                            </div>
                            <div style={{ height:1, background:"rgba(255,255,255,0.055)" }} />
                            <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
                                <p style={{ fontFamily:"'DM Mono',monospace", fontSize:"0.58rem", letterSpacing:"0.16em", textTransform:"uppercase" as const, color:"rgba(160,200,240,0.3)", margin:0 }}>Push</p>
                                <Toggle checked={notifs.pushMessages} onChange={v=>setNotifs(p=>({...p,pushMessages:v}))} label="New Messages" description="Push alerts when a recruiter sends you a message." />
                                <Toggle checked={notifs.pushStatus} onChange={v=>setNotifs(p=>({...p,pushStatus:v}))} label="Status Changes" description="Instant push notifications for any pipeline status change." />
                            </div>
                            {notifFeedback && <Feedback state={notifFeedback} />}
                            {D}
                            <div style={{ display:"flex", justifyContent:"flex-end" }}><SubmitBtn loading={notifLoading} label="Save Preferences" /></div>
                        </form>
                    </SectionCard>

                    {/* Danger Zone */}
                    <SectionCard eyebrow="Irreversible Actions" title="Danger Zone" accentColor="rgba(239,68,68,0.2)" dotColor="#ef4444">
                        <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"0.875rem", color:"rgba(160,200,240,0.5)", lineHeight:1.7, margin:"0 0 1.2rem" }}>
                            Permanently delete your account and all associated data. This action{" "}
                            <span style={{ color:"rgba(252,165,165,0.85)", fontWeight:500 }}>cannot be undone</span>.
                            All your applications, notes, and preferences will be erased immediately.
                        </p>
                        <form onSubmit={handleDelete} style={{ display:"flex", flexDirection:"column", gap:"1rem" }} noValidate>
                            <div style={{ display:"flex", flexDirection:"column", gap:"0.36rem" }}>
                                <label style={{ fontFamily:"'DM Mono',monospace", fontSize:"0.6rem", letterSpacing:"0.18em", textTransform:"uppercase" as const, color: deleteFocused ? "rgba(239,68,68,0.85)" : "rgba(160,200,240,0.38)", transition:"color 0.2s" }}>
                                    Type <span style={{ color:"rgba(252,165,165,0.8)" }}>DELETE</span> to confirm
                                </label>
                                <input type="text" value={deleteInput} onChange={e=>setDeleteInput(e.target.value)} onFocus={()=>setDeleteFocused(true)} onBlur={()=>setDeleteFocused(false)} placeholder="DELETE"
                                       style={{ width:"100%", boxSizing:"border-box" as const, fontFamily:"'DM Mono',monospace", fontSize:"0.875rem", color:"rgba(252,165,165,0.9)", background: deleteFocused ? "rgba(239,68,68,0.06)" : "rgba(255,255,255,0.035)", border:`1px solid ${deleteFocused ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.09)"}`, borderRadius:"8px", padding:"0.62rem 0.88rem", outline:"none", backdropFilter:"blur(8px)", boxShadow: deleteFocused ? "0 0 14px rgba(239,68,68,0.1)" : "none", transition:"all 0.2s" }}
                                />
                            </div>
                            {D}
                            <div style={{ display:"flex", justifyContent:"flex-end" }}><SubmitBtn loading={deleteLoading} label="Delete My Account" danger /></div>
                        </form>
                    </SectionCard>

                </div>
            </div>
            <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
        </div>
    );
}