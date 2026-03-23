"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import * as THREE from "three";

export default function ZeroState() {
    const canvasRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        if (!canvasRef.current) return;
        const mount = canvasRef.current;
        let w = mount.clientWidth, h = mount.clientHeight;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(w, h);
        renderer.setClearColor(0x000000, 0);
        mount.appendChild(renderer.domElement);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 200);
        camera.position.set(0, 0, 28);

        scene.add(new THREE.AmbientLight(0xffffff, 0.3));
        const L1 = new THREE.PointLight(0x6366f1, 3.5, 80); L1.position.set(-14, 10, 12); scene.add(L1);
        const L2 = new THREE.PointLight(0x7c3aed, 2.8, 80); L2.position.set(14, -8, 8);  scene.add(L2);
        const L3 = new THREE.PointLight(0xa5b4fc, 1.5, 60); L3.position.set(0, 14, -6);  scene.add(L3);

        interface FM extends THREE.Mesh { userData: { vx: number; vy: number; vz: number; rx: number; ry: number; rz: number } }
        const cards: FM[] = [];
        [
            { w: 4.8, h: 3.0, c: 0x6366f1, x: -13, y: 4,   z: -4 },
            { w: 4.2, h: 2.6, c: 0x7c3aed, x: 12,  y: -6,  z: -2 },
            { w: 5.2, h: 3.2, c: 0xa5b4fc, x: -9,  y: -7,  z:  2 },
            { w: 3.8, h: 2.4, c: 0x6366f1, x: 14,  y: 6,   z: -5 },
            { w: 4.6, h: 2.8, c: 0x7c3aed, x: -17, y: -2,  z:  1 },
            { w: 4.0, h: 2.5, c: 0xa5b4fc, x: 10,  y: 10,  z: -7 },
            { w: 5.0, h: 3.0, c: 0x6366f1, x: -5,  y: 10,  z:  2 },
            { w: 3.6, h: 2.2, c: 0x7c3aed, x: 18,  y: -1,  z: -3 },
            { w: 4.4, h: 2.7, c: 0xa5b4fc, x: -20, y: 8,   z: -1 },
            { w: 3.4, h: 2.1, c: 0x6366f1, x: 6,   y: -14, z:  3 },
        ].forEach(({ w, h, c, x, y, z }) => {
            const geo = new THREE.BoxGeometry(w, h, 0.05);
            const card = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({
                color: c, roughness: 0.05, metalness: 0.8, transparent: true, opacity: 0.11,
            })) as FM;
            card.position.set(x, y, z);
            card.rotation.set((Math.random() - .5) * .6, (Math.random() - .5) * .6, (Math.random() - .5) * .4);
            card.userData = {
                vx: (Math.random() - .5) * .005, vy: (Math.random() - .5) * .004,
                vz: (Math.random() - .5) * .003, rx: (Math.random() - .5) * .001,
                ry: (Math.random() - .5) * .0015, rz: (Math.random() - .5) * .001,
            };
            card.add(new THREE.LineSegments(
                new THREE.EdgesGeometry(geo),
                new THREE.LineBasicMaterial({ color: c, transparent: true, opacity: 0.5 })
            ));
            scene.add(card); cards.push(card);
        });

        const ring1 = new THREE.Mesh(
            new THREE.TorusGeometry(13, .03, 8, 100),
            new THREE.MeshBasicMaterial({ color: 0x6366f1, transparent: true, opacity: .1 })
        );
        ring1.rotation.x = Math.PI / 2.8; scene.add(ring1);

        const ring2 = new THREE.Mesh(
            new THREE.TorusGeometry(20, .025, 8, 120),
            new THREE.MeshBasicMaterial({ color: 0x7c3aed, transparent: true, opacity: .07 })
        );
        ring2.rotation.x = Math.PI / 3.5; ring2.rotation.z = 0.5; scene.add(ring2);

        const orbCols = [0x6366f1, 0x7c3aed, 0xa5b4fc, 0x818cf8];
        const orbs: THREE.Mesh[] = [];
        for (let i = 0; i < 20; i++) {
            const col = orbCols[i % orbCols.length];
            const orb = new THREE.Mesh(
                new THREE.SphereGeometry(.1 + Math.random() * .16, 12, 12),
                new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: .9, roughness: 0, metalness: .2 })
            );
            orb.position.set((Math.random() - .5) * 46, (Math.random() - .5) * 34, (Math.random() - .5) * 22);
            (orb as any).userData = { vx: (Math.random() - .5) * .011, vy: (Math.random() - .5) * .009, pulse: Math.random() * Math.PI * 2 };
            orbs.push(orb); scene.add(orb);
        }

        const sPos = new Float32Array(1500);
        for (let i = 0; i < 1500; i++) sPos[i] = (Math.random() - .5) * 120;
        const sg = new THREE.BufferGeometry();
        sg.setAttribute("position", new THREE.BufferAttribute(sPos, 3));
        scene.add(new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xc7d2fe, size: .06, transparent: true, opacity: .3 })));

        const mouse = { x: 0, y: 0 };
        const onMM = (e: MouseEvent) => {
            const r = mount.getBoundingClientRect();
            mouse.x = ((e.clientX - r.left) / r.width  - .5) * 2;
            mouse.y = -((e.clientY - r.top)  / r.height - .5) * 2;
        };
        window.addEventListener("mousemove", onMM);

        const ro = new ResizeObserver(() => {
            w = mount.clientWidth; h = mount.clientHeight;
            renderer.setSize(w, h);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
        });
        ro.observe(mount);

        let fId: number;
        const clock = new THREE.Clock();
        const animate = () => {
            fId = requestAnimationFrame(animate);
            const t = clock.getElapsedTime();
            camera.position.x += (mouse.x * 2.8 - camera.position.x) * 0.03;
            camera.position.y += (mouse.y * 1.8 - camera.position.y) * 0.03;
            camera.lookAt(scene.position);
            cards.forEach(c => {
                const d = c.userData;
                c.position.x += d.vx; c.position.y += d.vy; c.position.z += d.vz;
                c.rotation.x += d.rx; c.rotation.y += d.ry; c.rotation.z += d.rz;
                if (Math.abs(c.position.x) > 26) d.vx *= -1;
                if (Math.abs(c.position.y) > 19) d.vy *= -1;
                if (Math.abs(c.position.z) > 12) d.vz *= -1;
            });
            orbs.forEach(o => {
                const d = (o as any).userData;
                o.position.x += d.vx; o.position.y += d.vy;
                if (Math.abs(o.position.x) > 28) d.vx *= -1;
                if (Math.abs(o.position.y) > 21) d.vy *= -1;
                (o.material as THREE.MeshStandardMaterial).emissiveIntensity = .5 + .5 * Math.sin(t * 2 + d.pulse);
            });
            ring1.rotation.z = t * .055;
            ring2.rotation.z = -t * .035; ring2.rotation.y = t * .018;
            L1.position.x = Math.sin(t * .32) * 18; L1.position.y = Math.cos(t * .24) * 12;
            L2.position.x = Math.cos(t * .28) * 18; L2.position.y = Math.sin(t * .22) * 10;
            renderer.render(scene, camera);
        };
        animate();

        return () => {
            cancelAnimationFrame(fId);
            window.removeEventListener("mousemove", onMM);
            ro.disconnect();
            renderer.dispose();
            if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
        };
    }, []);

    return (
        <div style={{
            position: "relative",
            width: "100%",
            /* fills the remaining viewport height after the nav */
            height: "calc(100vh - 120px)",
            minHeight: 520,
            borderRadius: "16px",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--heroui-foreground, #ffffff)",
            border: "1px solid rgba(226,232,240,1)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        }}>

            {/* Three.js canvas */}
            <div ref={canvasRef} style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" }} />

            {/* Radial vignette — fades 3D scene into white card bg */}
            <div style={{
                position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
                background: "radial-gradient(ellipse 60% 55% at 50% 50%, transparent 5%, rgba(255,255,255,0.88) 100%)",
            }} />

            {/* Content */}
            <div style={{
                position: "relative", zIndex: 2,
                display: "flex", flexDirection: "column",
                alignItems: "center", gap: "2rem",
                padding: "2rem 1.5rem",
                textAlign: "center",
            }}>

                {/* Icon */}
                <div style={{
                    width: 96, height: 96, borderRadius: "50%",
                    background: "linear-gradient(135deg, rgba(99,102,241,0.14) 0%, rgba(124,58,237,0.1) 100%)",
                    border: "1.5px solid rgba(99,102,241,0.28)",
                    boxShadow: "0 12px 40px rgba(99,102,241,0.18)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                    <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="rgba(99,102,241,0.82)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="7" width="20" height="14" rx="2"/>
                        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
                        <line x1="12" y1="12" x2="12" y2="16"/>
                        <line x1="10" y1="14" x2="14" y2="14"/>
                    </svg>
                </div>

                {/* Text */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.55rem", maxWidth: 400 }}>
                    <h2 style={{
                        fontFamily: "'Sora', 'DM Sans', sans-serif",
                        fontWeight: 800, fontSize: "clamp(1.3rem, 3vw, 1.65rem)",
                        color: "#1e1b4b", margin: 0, letterSpacing: "-0.025em",
                    }}>
                        No applications yet
                    </h2>
                    <p style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: "clamp(0.875rem, 2vw, 1rem)",
                        lineHeight: 1.7, color: "#6b7280", margin: 0,
                    }}>
                        Your job search command centre is ready. Start tracking applications, monitor your pipeline, and land your next role.
                    </p>
                </div>

                {/* CTA */}
                <button
                    onClick={() => router.push("/application/create")}
                    style={{
                        display: "inline-flex", alignItems: "center", gap: "0.55rem",
                        fontFamily: "'DM Sans', sans-serif", fontWeight: 700,
                        fontSize: "clamp(0.9rem, 2vw, 1rem)", cursor: "pointer",
                        padding: "0.85rem 2.4rem", borderRadius: "10px",
                        background: "linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)",
                        color: "#fff", border: "none",
                        boxShadow: "0 6px 24px rgba(99,102,241,0.42)",
                        transition: "transform 0.15s, box-shadow 0.15s",
                    }}
                    onMouseEnter={e => {
                        const el = e.currentTarget as HTMLButtonElement;
                        el.style.transform = "translateY(-2px)";
                        el.style.boxShadow = "0 10px 32px rgba(99,102,241,0.52)";
                    }}
                    onMouseLeave={e => {
                        const el = e.currentTarget as HTMLButtonElement;
                        el.style.transform = "translateY(0)";
                        el.style.boxShadow = "0 6px 24px rgba(99,102,241,0.42)";
                    }}
                >
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <line x1="12" y1="5" x2="12" y2="19"/>
                        <line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    Add your first application
                </button>
            </div>
        </div>
    );
}