"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import apiRouter from "@/api/router";
import { useRouter } from "next/navigation";
import type { LoginPayload } from "@/api/session";

export default function LoginPage() {
    const canvasRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    const [isVisible, setIsVisible] = React.useState(false);
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [emailFocused, setEmailFocused] = React.useState(false);
    const [passwordFocused, setPasswordFocused] = React.useState(false);

    const loginMutation = useMutation({
        mutationFn: (payload: LoginPayload) =>
            apiRouter.sessions.createSession(payload),
        onSuccess: (data) => {
            console.log("Login Success:", data);
            router.push("/dashboard");
        },
        onError: (error) => {
            console.error("Login Error:", error);
        },
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        loginMutation.mutate({ email_address: email.toLowerCase(), password });
    };

    /* ── Three.js scene ── */
    useEffect(() => {
        if (!canvasRef.current) return;
        const mount = canvasRef.current;
        let width = window.innerWidth;
        let height = window.innerHeight;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(width, height);
        renderer.setClearColor(0x00020a, 1);
        mount.appendChild(renderer.domElement);

        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x000000, 0.016);
        const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 300);
        camera.position.set(0, 0, 34);

        scene.add(new THREE.AmbientLight(0xffffff, 0.25));
        const L1 = new THREE.PointLight(0x00d4ff, 3.5, 90); L1.position.set(-18, 12, 14); scene.add(L1);
        const L2 = new THREE.PointLight(0x7c3aed, 3.0, 90); L2.position.set(18, -10, 10); scene.add(L2);
        const L3 = new THREE.PointLight(0x10b981, 1.8, 70); L3.position.set(0, 18, -8);   scene.add(L3);

        interface FM extends THREE.Mesh { userData: { vx:number;vy:number;vz:number;rx:number;ry:number;rz:number } }
        const cards: FM[] = [];
        [
            {w:5.5,h:3.2,c:0x00d4ff,x:-16,y:5,z:-5},{w:4.8,h:2.8,c:0x7c3aed,x:15,y:-7,z:-3},
            {w:6.0,h:3.6,c:0x10b981,x:-11,y:-9,z:3},{w:5.0,h:3.0,c:0x00d4ff,x:17,y:8,z:-7},
            {w:4.4,h:2.6,c:0xf59e0b,x:5,y:-13,z:5},{w:5.2,h:3.1,c:0x7c3aed,x:-20,y:-3,z:1},
            {w:4.6,h:2.9,c:0x10b981,x:12,y:13,z:-9},{w:5.8,h:3.4,c:0xf59e0b,x:-6,y:12,z:3},
            {w:4.2,h:2.5,c:0x00d4ff,x:22,y:-2,z:-5},{w:5.4,h:3.3,c:0x7c3aed,x:-8,y:-15,z:-3},
        ].forEach(({w,h,c,x,y,z}) => {
            const geo = new THREE.BoxGeometry(w,h,0.06);
            const card = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({color:c,roughness:0.05,metalness:0.9,transparent:true,opacity:0.13})) as FM;
            card.position.set(x,y,z);
            card.rotation.set((Math.random()-.5)*.5,(Math.random()-.5)*.5,(Math.random()-.5)*.3);
            card.userData={vx:(Math.random()-.5)*.006,vy:(Math.random()-.5)*.005,vz:(Math.random()-.5)*.003,rx:(Math.random()-.5)*.0015,ry:(Math.random()-.5)*.002,rz:(Math.random()-.5)*.001};
            card.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo), new THREE.LineBasicMaterial({color:c,transparent:true,opacity:0.55})));
            scene.add(card); cards.push(card);
        });

        const ring1 = new THREE.Mesh(new THREE.TorusGeometry(14,.04,8,120), new THREE.MeshBasicMaterial({color:0x00d4ff,transparent:true,opacity:.14}));
        ring1.rotation.x=Math.PI/2.8; scene.add(ring1);
        const ring2 = new THREE.Mesh(new THREE.TorusGeometry(20,.03,8,140), new THREE.MeshBasicMaterial({color:0x7c3aed,transparent:true,opacity:.1}));
        ring2.rotation.x=Math.PI/3.5; ring2.rotation.z=0.4; scene.add(ring2);

        const orbColors=[0x10b981,0x00d4ff,0xf59e0b,0xef4444,0x7c3aed];
        const orbs: THREE.Mesh[]=[];
        for(let i=0;i<20;i++){
            const col=orbColors[i%orbColors.length];
            const orb=new THREE.Mesh(new THREE.SphereGeometry(.12+Math.random()*.18,14,14), new THREE.MeshStandardMaterial({color:col,emissive:col,emissiveIntensity:.9,roughness:0,metalness:.3}));
            orb.position.set((Math.random()-.5)*52,(Math.random()-.5)*38,(Math.random()-.5)*24);
            (orb as any).userData={vx:(Math.random()-.5)*.013,vy:(Math.random()-.5)*.01,pulse:Math.random()*Math.PI*2};
            orbs.push(orb); scene.add(orb);
        }

        const grid=new THREE.GridHelper(120,40,0x00d4ff,0x0a1628);
        grid.position.y=-20;
        (grid.material as THREE.Material).transparent=true;
        (grid.material as THREE.Material).opacity=0.14;
        scene.add(grid);

        const sPos=new Float32Array(1500);
        for(let i=0;i<1500;i++) sPos[i]=(Math.random()-.5)*130;
        const starGeo=new THREE.BufferGeometry();
        starGeo.setAttribute("position",new THREE.BufferAttribute(sPos,3));
        const stars=new THREE.Points(starGeo, new THREE.PointsMaterial({color:0xffffff,size:.08,transparent:true,opacity:.42}));
        scene.add(stars);

        const mouse={x:0,y:0};
        const onMM=(e:MouseEvent)=>{mouse.x=(e.clientX/window.innerWidth-.5)*2;mouse.y=-(e.clientY/window.innerHeight-.5)*2;};
        window.addEventListener("mousemove",onMM);
        const onResize=()=>{width=window.innerWidth;height=window.innerHeight;renderer.setSize(width,height);camera.aspect=width/height;camera.updateProjectionMatrix();};
        window.addEventListener("resize",onResize);

        let fId: number;
        const clock=new THREE.Clock();
        const animate=()=>{
            fId=requestAnimationFrame(animate);
            const t=clock.getElapsedTime();
            camera.position.x+=(mouse.x*3.5-camera.position.x)*0.03;
            camera.position.y+=(mouse.y*2.2-camera.position.y)*0.03;
            camera.lookAt(scene.position);
            cards.forEach(c=>{
                const d=c.userData;
                c.position.x+=d.vx;c.position.y+=d.vy;c.position.z+=d.vz;
                c.rotation.x+=d.rx;c.rotation.y+=d.ry;c.rotation.z+=d.rz;
                if(Math.abs(c.position.x)>28)d.vx*=-1;
                if(Math.abs(c.position.y)>20)d.vy*=-1;
                if(Math.abs(c.position.z)>12)d.vz*=-1;
            });
            orbs.forEach(o=>{
                const d=(o as any).userData;
                o.position.x+=d.vx;o.position.y+=d.vy;
                if(Math.abs(o.position.x)>30)d.vx*=-1;
                if(Math.abs(o.position.y)>22)d.vy*=-1;
                (o.material as THREE.MeshStandardMaterial).emissiveIntensity=.55+.5*Math.sin(t*2.1+d.pulse);
            });
            ring1.rotation.z=t*.065;ring2.rotation.z=-t*.04;ring2.rotation.y=t*.022;
            L1.position.x=Math.sin(t*.38)*22;L1.position.y=Math.cos(t*.28)*15;
            L2.position.x=Math.cos(t*.33)*22;L2.position.y=Math.sin(t*.26)*13;
            grid.position.z=(t*1.8)%3;stars.rotation.y=t*.005;
            renderer.render(scene,camera);
        };
        animate();

        return ()=>{
            cancelAnimationFrame(fId);
            window.removeEventListener("mousemove",onMM);
            window.removeEventListener("resize",onResize);
            renderer.dispose();
            if(mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
        };
    },[]);

    /* ── Style helpers ── */
    const inputStyle = (focused: boolean): React.CSSProperties => ({
        fontFamily: "'DM Sans', sans-serif",
        fontSize: "0.875rem",
        color: "#e8f4ff",
        background: focused ? "rgba(0,212,255,0.07)" : "rgba(255,255,255,0.04)",
        border: `1px solid ${focused ? "rgba(0,212,255,0.5)" : "rgba(255,255,255,0.1)"}`,
        borderRadius: "7px",
        padding: "0.62rem 0.88rem",
        outline: "none",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        boxShadow: focused ? "0 0 18px rgba(0,212,255,0.12)" : "none",
        transition: "background 0.2s, border-color 0.2s, box-shadow 0.2s",
        width: "100%",
        boxSizing: "border-box" as const,
    });

    const labelStyle = (focused: boolean): React.CSSProperties => ({
        fontFamily: "'DM Mono', monospace",
        fontSize: "0.61rem",
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        color: focused ? "rgba(0,212,255,0.85)" : "rgba(160,200,240,0.4)",
        transition: "color 0.2s",
    });

    return (
        <div style={{ position:"fixed", inset:0, background:"linear-gradient(160deg,#00020a 0%,#020b18 45%,#050e1f 100%)", overflow:"hidden" }}>

            {/* Layer 0 — canvas, never intercepts clicks */}
            <div ref={canvasRef} style={{ position:"absolute", inset:0, zIndex:0, pointerEvents:"none" }} />

            {/* Layer 1 — vignette */}
            <div style={{ position:"absolute", inset:0, zIndex:1, pointerEvents:"none", background:"radial-gradient(ellipse 80% 70% at 50% 50%,transparent 20%,rgba(0,2,10,0.72) 100%)" }} />

            {/* Layer 2 — UI */}
            <div style={{ position:"absolute", inset:0, zIndex:2, pointerEvents:"auto", overflowY:"auto", display:"flex", flexDirection:"column", alignItems:"center" }}>

                {/* Nav */}
                <nav style={{ width:"100%", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"1.4rem 2.5rem", boxSizing:"border-box" as const }}>
                    <Link
                        href="/"
                        style={{ fontFamily:"'DM Mono',monospace", fontSize:"0.78rem", letterSpacing:"0.22em", color:"rgba(0,212,255,0.65)", textTransform:"uppercase", textDecoration:"none", transition:"color 0.2s" }}
                        onMouseEnter={e=>{(e.currentTarget as HTMLAnchorElement).style.color="#00d4ff"}}
                        onMouseLeave={e=>{(e.currentTarget as HTMLAnchorElement).style.color="rgba(0,212,255,0.65)"}}
                    >
                        ApplyOS
                    </Link>
                    <Link
                        href="/"
                        style={{ fontFamily:"'DM Sans',sans-serif", fontWeight:500, fontSize:"0.84rem", letterSpacing:"0.06em", padding:"0.52rem 1.5rem", borderRadius:"6px", background:"rgba(0,212,255,0.07)", color:"rgba(0,212,255,0.88)", border:"1px solid rgba(0,212,255,0.22)", cursor:"pointer", backdropFilter:"blur(12px)", textDecoration:"none", display:"inline-block", transition:"background 0.2s,border-color 0.2s,box-shadow 0.2s" }}
                        onMouseEnter={e=>{const el=e.currentTarget as HTMLAnchorElement;el.style.background="rgba(0,212,255,0.14)";el.style.borderColor="rgba(0,212,255,0.55)";el.style.boxShadow="0 0 22px rgba(0,212,255,0.22)"}}
                        onMouseLeave={e=>{const el=e.currentTarget as HTMLAnchorElement;el.style.background="rgba(0,212,255,0.07)";el.style.borderColor="rgba(0,212,255,0.22)";el.style.boxShadow="none"}}
                    >
                        ← Home
                    </Link>
                </nav>

                {/* Card — vertically centred */}
                <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", width:"100%", padding:"1rem 1.5rem", boxSizing:"border-box" as const }}>
                    <div style={{ width:"100%", maxWidth:"420px" }}>
                        <div style={{ background:"rgba(4,12,28,0.82)", border:"1px solid rgba(0,212,255,0.13)", borderRadius:"16px", backdropFilter:"blur(28px)", WebkitBackdropFilter:"blur(28px)", padding:"2.4rem 2.2rem 2.2rem", boxShadow:"0 0 60px rgba(0,212,255,0.06),0 0 120px rgba(124,58,237,0.06),inset 0 1px 0 rgba(255,255,255,0.05)" }}>

                            {/* Header */}
                            <div style={{ marginBottom:"1.8rem" }}>
                                <div style={{ display:"inline-flex", alignItems:"center", gap:"0.45rem", fontFamily:"'DM Mono',monospace", fontSize:"0.61rem", letterSpacing:"0.2em", color:"rgba(0,212,255,0.55)", textTransform:"uppercase", marginBottom:"0.8rem", border:"1px solid rgba(0,212,255,0.12)", padding:"0.3rem 0.8rem", borderRadius:"999px", background:"rgba(0,212,255,0.04)" }}>
                                    <span style={{ width:6, height:6, borderRadius:"50%", background:"#10b981", boxShadow:"0 0 6px #10b981", display:"inline-block", flexShrink:0 }}/>
                                    Welcome Back
                                </div>
                                <h2 style={{ fontFamily:"'Syne','Helvetica Neue',sans-serif", fontWeight:800, fontSize:"1.8rem", letterSpacing:"-0.025em", color:"#f0f8ff", margin:0, lineHeight:1.1 }}>
                                    Log in to{" "}
                                    <span style={{ background:"linear-gradient(90deg,#00d4ff 0%,#7c3aed 55%,#10b981 100%)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>
                    ApplyOS
                  </span>
                                </h2>
                                <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"0.83rem", color:"rgba(160,200,240,0.42)", marginTop:"0.35rem", marginBottom:0 }}>
                                    Pick up right where you left off.
                                </p>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:"0.9rem" }}>

                                {/* Email */}
                                <div style={{ display:"flex", flexDirection:"column", gap:"0.38rem" }}>
                                    <label style={labelStyle(emailFocused)}>Email Address</label>
                                    <input
                                        type="email" name="email" required placeholder="i.e jane@email.com"
                                        value={email} onChange={e=>setEmail(e.target.value)}
                                        onFocus={()=>setEmailFocused(true)} onBlur={()=>setEmailFocused(false)}
                                        style={inputStyle(emailFocused)}
                                    />
                                </div>

                                {/* Password */}
                                <div style={{ display:"flex", flexDirection:"column", gap:"0.38rem" }}>
                                    <label style={labelStyle(passwordFocused)}>Password</label>
                                    <div style={{ position:"relative" }}>
                                        <input
                                            type={isVisible ? "text" : "password"} name="password" required placeholder="••••••••"
                                            value={password} onChange={e=>setPassword(e.target.value)}
                                            onFocus={()=>setPasswordFocused(true)} onBlur={()=>setPasswordFocused(false)}
                                            style={{ ...inputStyle(passwordFocused), paddingRight:"2.8rem" }}
                                        />
                                        <button
                                            type="button" onClick={()=>setIsVisible(v=>!v)}
                                            style={{ position:"absolute", right:"0.75rem", top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", padding:0, color:"rgba(160,200,240,0.45)", display:"flex", alignItems:"center", transition:"color 0.2s" }}
                                            onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.color="rgba(0,212,255,0.8)"}}
                                            onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.color="rgba(160,200,240,0.45)"}}
                                        >
                                            {isVisible ? (
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                                                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                                                    <line x1="1" y1="1" x2="23" y2="23"/>
                                                </svg>
                                            ) : (
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                                    <circle cx="12" cy="12" r="3"/>
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Divider */}
                                <div style={{ height:1, background:"rgba(255,255,255,0.055)", margin:"0.4rem 0" }}/>

                                {/* Submit */}
                                <button
                                    type="submit"
                                    disabled={loginMutation.isPending}
                                    style={{
                                        width:"100%", fontFamily:"'Syne',sans-serif", fontWeight:700,
                                        fontSize:"0.9rem", letterSpacing:"0.07em", padding:"0.82rem",
                                        borderRadius:"8px",
                                        background: loginMutation.isPending
                                            ? "rgba(0,212,255,0.06)"
                                            : "linear-gradient(135deg,rgba(0,212,255,0.16) 0%,rgba(124,58,237,0.16) 100%)",
                                        color: loginMutation.isPending ? "rgba(160,200,240,0.35)" : "#e8f4ff",
                                        border:"1px solid rgba(0,212,255,0.28)",
                                        cursor: loginMutation.isPending ? "not-allowed" : "pointer",
                                        backdropFilter:"blur(8px)",
                                        transition:"background 0.22s,box-shadow 0.22s,border-color 0.22s,transform 0.14s",
                                        display:"flex", alignItems:"center", justifyContent:"center", gap:"0.5rem",
                                    }}
                                    onMouseEnter={e=>{if(!loginMutation.isPending){const el=e.currentTarget as HTMLButtonElement;el.style.background="linear-gradient(135deg,rgba(0,212,255,0.26) 0%,rgba(124,58,237,0.26) 100%)";el.style.boxShadow="0 0 36px rgba(0,212,255,0.18),0 0 70px rgba(124,58,237,0.14)";el.style.borderColor="rgba(0,212,255,0.52)";el.style.transform="translateY(-1px)"}}}
                                    onMouseLeave={e=>{const el=e.currentTarget as HTMLButtonElement;el.style.background="linear-gradient(135deg,rgba(0,212,255,0.16) 0%,rgba(124,58,237,0.16) 100%)";el.style.boxShadow="none";el.style.borderColor="rgba(0,212,255,0.28)";el.style.transform="translateY(0)"}}
                                >
                                    {loginMutation.isPending ? (
                                        <>
                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation:"spin 0.8s linear infinite" }}>
                                                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                                            </svg>
                                            Signing in…
                                        </>
                                    ) : "Sign In →"}
                                </button>

                            </form>

                            {/* Feedback banners */}
                            {loginMutation.isError && (
                                <div style={{ marginTop:"1rem", padding:"0.65rem 0.9rem", borderRadius:"7px", background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.25)", fontFamily:"'DM Sans',sans-serif", fontSize:"0.8rem", color:"rgba(252,165,165,0.9)" }}>
                                    Login failed. Please check your credentials and try again.
                                </div>
                            )}
                            {loginMutation.isSuccess && (
                                <div style={{ marginTop:"1rem", padding:"0.65rem 0.9rem", borderRadius:"7px", background:"rgba(16,185,129,0.08)", border:"1px solid rgba(16,185,129,0.25)", fontFamily:"'DM Sans',sans-serif", fontSize:"0.8rem", color:"rgba(110,231,183,0.9)" }}>
                                    Login successful! Redirecting…
                                </div>
                            )}

                            {/* Footer */}
                            <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"0.77rem", color:"rgba(160,200,240,0.32)", textAlign:"center", marginTop:"1.2rem", marginBottom:0 }}>
                                Don&apos;t have an account?{" "}
                                <Link
                                    href="/signup"
                                    style={{ color:"rgba(0,212,255,0.68)", textDecoration:"none", borderBottom:"1px solid rgba(0,212,255,0.22)", paddingBottom:"1px", transition:"color 0.2s", display:"inline" }}
                                    onMouseEnter={e=>{(e.currentTarget as HTMLAnchorElement).style.color="#00d4ff"}}
                                    onMouseLeave={e=>{(e.currentTarget as HTMLAnchorElement).style.color="rgba(0,212,255,0.68)"}}
                                >
                                    Sign up
                                </Link>
                            </p>

                        </div>
                    </div>
                </div>
            </div>

            <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
        </div>
    );
}