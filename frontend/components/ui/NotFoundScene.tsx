"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import * as THREE from "three";

/* ─── Three.js void scene ──────────────────────────────────────────────── */
function useVoidScene(mountRef: React.RefObject<HTMLDivElement>) {
    useEffect(() => {
        const mount = mountRef.current;
        if (!mount) return;

        let w = mount.clientWidth, h = mount.clientHeight;

        // Renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(w, h);
        renderer.setClearColor(0x000000, 0);
        mount.appendChild(renderer.domElement);

        // Scene + camera
        const scene  = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 300);
        camera.position.set(0, 0, 32);

        // Lights
        scene.add(new THREE.AmbientLight(0xffffff, 0.2));
        const L1 = new THREE.PointLight(0x6366f1, 4, 90); L1.position.set(-16, 12, 14); scene.add(L1);
        const L2 = new THREE.PointLight(0x7c3aed, 3, 90); L2.position.set(16, -10, 10); scene.add(L2);
        const L3 = new THREE.PointLight(0xf472b6, 2, 60); L3.position.set(0, 0, 18);    scene.add(L3);

        // ── Shattered shards ──────────────────────────────────────────────
        type Shard = THREE.Mesh & { userData: { vx: number; vy: number; vz: number; rx: number; ry: number; rz: number } };
        const shards: Shard[] = [];
        const shardData = [
            { w: 3.2, h: 1.8, c: 0x6366f1, x: -15, y:  6,  z: -6  },
            { w: 2.4, h: 1.4, c: 0x7c3aed, x:  13, y: -8,  z: -4  },
            { w: 4.0, h: 2.2, c: 0xa78bfa, x:  -8, y: -9,  z:  3  },
            { w: 1.8, h: 1.0, c: 0x6366f1, x:  16, y:  8,  z: -7  },
            { w: 3.6, h: 2.0, c: 0xf472b6, x: -18, y: -3,  z:  2  },
            { w: 2.8, h: 1.6, c: 0x7c3aed, x:   9, y: 12,  z: -9  },
            { w: 2.0, h: 1.2, c: 0xa78bfa, x:  -4, y: 12,  z:  4  },
            { w: 1.6, h: 0.9, c: 0x6366f1, x:  20, y: -2,  z: -5  },
            { w: 3.0, h: 1.7, c: 0xf472b6, x: -21, y:  9,  z: -2  },
            { w: 1.4, h: 0.8, c: 0x7c3aed, x:   5, y:-16,  z:  4  },
            { w: 2.6, h: 1.5, c: 0x6366f1, x:  -11, y: -14, z: -3  },
            { w: 1.2, h: 0.7, c: 0xa78bfa, x:   18, y:  14, z:  1  },
        ];

        shardData.forEach(({ w, h, c, x, y, z }) => {
            // Random triangle-like shape via a custom geometry
            const geo  = new THREE.BufferGeometry();
            const rx   = (Math.random() - 0.5) * w * 0.3;
            const ry   = (Math.random() - 0.5) * h * 0.3;
            const verts = new Float32Array([
                -w/2 + rx,  -h/2,       0,
                 w/2,       -h/2 + ry,  0,
                 w/2 + rx,   h/2,       0,
                -w/2,        h/2 + ry,  0,
            ]);
            geo.setAttribute("position", new THREE.BufferAttribute(verts, 3));
            geo.setIndex([0,1,2, 0,2,3]);
            geo.computeVertexNormals();

            const mat = new THREE.MeshStandardMaterial({
                color: c, roughness: 0.08, metalness: 0.75,
                transparent: true, opacity: 0.13,
                side: THREE.DoubleSide,
            });
            const shard = new THREE.Mesh(geo, mat) as unknown as Shard;
            shard.position.set(x, y, z);
            shard.rotation.set(
                (Math.random() - 0.5) * 0.8,
                (Math.random() - 0.5) * 0.8,
                (Math.random() - 0.5) * 0.5
            );
            shard.userData = {
                vx: (Math.random() - 0.5) * 0.006,
                vy: (Math.random() - 0.5) * 0.005,
                vz: (Math.random() - 0.5) * 0.003,
                rx: (Math.random() - 0.5) * 0.0012,
                ry: (Math.random() - 0.5) * 0.0018,
                rz: (Math.random() - 0.5) * 0.0010,
            };

            // Glowing edge lines
            const edges = new THREE.LineSegments(
                new THREE.EdgesGeometry(new THREE.BufferGeometry().copy(geo)),
                new THREE.LineBasicMaterial({ color: c, transparent: true, opacity: 0.55 })
            );
            shard.add(edges);
            scene.add(shard);
            shards.push(shard);
        });

        // ── Central broken ring ───────────────────────────────────────────
        const ring1 = new THREE.Mesh(
            new THREE.TorusGeometry(8.5, 0.04, 6, 120),
            new THREE.MeshBasicMaterial({ color: 0x6366f1, transparent: true, opacity: 0.18 })
        );
        ring1.rotation.x = Math.PI / 2.4;
        scene.add(ring1);

        const ring2 = new THREE.Mesh(
            new THREE.TorusGeometry(14, 0.028, 6, 140),
            new THREE.MeshBasicMaterial({ color: 0x7c3aed, transparent: true, opacity: 0.10 })
        );
        ring2.rotation.x = Math.PI / 3; ring2.rotation.z = 0.4;
        scene.add(ring2);

        const ring3 = new THREE.Mesh(
            new THREE.TorusGeometry(20, 0.02, 6, 160),
            new THREE.MeshBasicMaterial({ color: 0xf472b6, transparent: true, opacity: 0.06 })
        );
        ring3.rotation.x = Math.PI / 2.8; ring3.rotation.y = 0.6;
        scene.add(ring3);

        // ── Floating orbs ─────────────────────────────────────────────────
        const orbColors = [0x6366f1, 0x7c3aed, 0xa78bfa, 0xf472b6, 0x818cf8];
        type Orb = THREE.Mesh & { userData: { vx: number; vy: number; pulse: number } };
        const orbs: Orb[] = [];
        for (let i = 0; i < 24; i++) {
            const c   = orbColors[i % orbColors.length];
            const orb = new THREE.Mesh(
                new THREE.SphereGeometry(0.08 + Math.random() * 0.18, 12, 12),
                new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 1.1, roughness: 0, metalness: 0.2 })
            ) as unknown as Orb;
            orb.position.set(
                (Math.random() - 0.5) * 52,
                (Math.random() - 0.5) * 38,
                (Math.random() - 0.5) * 24
            );
            orb.userData = {
                vx:    (Math.random() - 0.5) * 0.012,
                vy:    (Math.random() - 0.5) * 0.010,
                pulse: Math.random() * Math.PI * 2,
            };
            orbs.push(orb);
            scene.add(orb);
        }

        // ── Star field ────────────────────────────────────────────────────
        const starPos = new Float32Array(2400);
        for (let i = 0; i < 2400; i++) starPos[i] = (Math.random() - 0.5) * 160;
        const starGeo = new THREE.BufferGeometry();
        starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
        scene.add(new THREE.Points(
            starGeo,
            new THREE.PointsMaterial({ color: 0xc7d2fe, size: 0.055, transparent: true, opacity: 0.28 })
        ));

        // ── Mouse parallax ────────────────────────────────────────────────
        const mouse = { x: 0, y: 0 };
        const onMouseMove = (e: MouseEvent) => {
            const r = mount.getBoundingClientRect();
            mouse.x = ((e.clientX - r.left) / r.width  - 0.5) * 2;
            mouse.y = -((e.clientY - r.top)  / r.height - 0.5) * 2;
        };
        window.addEventListener("mousemove", onMouseMove);

        // ── Resize ────────────────────────────────────────────────────────
        const ro = new ResizeObserver(() => {
            w = mount.clientWidth; h = mount.clientHeight;
            renderer.setSize(w, h);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
        });
        ro.observe(mount);

        // ── Animation loop ────────────────────────────────────────────────
        let frameId: number;
        const clock = new THREE.Clock();

        const animate = () => {
            frameId = requestAnimationFrame(animate);
            const t = clock.getElapsedTime();

            camera.position.x += (mouse.x * 3 - camera.position.x) * 0.025;
            camera.position.y += (mouse.y * 2 - camera.position.y) * 0.025;
            camera.lookAt(scene.position);

            shards.forEach(s => {
                const d = s.userData;
                s.position.x += d.vx; s.position.y += d.vy; s.position.z += d.vz;
                s.rotation.x  += d.rx; s.rotation.y += d.ry; s.rotation.z += d.rz;
                if (Math.abs(s.position.x) > 28) d.vx *= -1;
                if (Math.abs(s.position.y) > 21) d.vy *= -1;
                if (Math.abs(s.position.z) > 14) d.vz *= -1;
            });

            orbs.forEach(o => {
                const d = o.userData;
                o.position.x += d.vx; o.position.y += d.vy;
                if (Math.abs(o.position.x) > 30) d.vx *= -1;
                if (Math.abs(o.position.y) > 22) d.vy *= -1;
                (o.material as THREE.MeshStandardMaterial).emissiveIntensity =
                    0.5 + 0.6 * Math.sin(t * 1.8 + d.pulse);
            });

            ring1.rotation.z =  t * 0.06;
            ring2.rotation.z = -t * 0.04; ring2.rotation.y = t * 0.02;
            ring3.rotation.z =  t * 0.025; ring3.rotation.x = Math.PI / 2.8 + Math.sin(t * 0.15) * 0.08;

            L1.position.x = Math.sin(t * 0.30) * 20; L1.position.y = Math.cos(t * 0.22) * 14;
            L2.position.x = Math.cos(t * 0.26) * 20; L2.position.y = Math.sin(t * 0.20) * 12;
            L3.intensity   = 1.5 + Math.sin(t * 0.9) * 0.8;

            renderer.render(scene, camera);
        };
        animate();

        return () => {
            cancelAnimationFrame(frameId);
            window.removeEventListener("mousemove", onMouseMove);
            ro.disconnect();
            renderer.dispose();
            if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
        };
    }, []);
}

/* ─── Page component ──────────────────────────────────────────────────── */
export default function NotFoundScene() {
    const mountRef = useRef<HTMLDivElement>(null);
    useVoidScene(mountRef as React.RefObject<HTMLDivElement>);

    return (
        <div className="relative min-h-screen w-full bg-background overflow-hidden flex items-center justify-center">

            {/* Three.js canvas layer */}
            <div ref={mountRef} className="absolute inset-0 z-0 pointer-events-none" />

            {/* Radial vignette — keeps text readable */}
            <div className="absolute inset-0 z-10 pointer-events-none"
                style={{ background: "radial-gradient(ellipse 65% 60% at 50% 50%, transparent 10%, var(--heroui-background) 80%)" }}
            />

            {/* Content */}
            <div className="relative z-20 flex flex-col items-center gap-7 text-center px-6 max-w-lg w-full"
                style={{ animation: "nf-fade-up 0.7s cubic-bezier(0.16,1,0.3,1) both" }}
            >
                <style>{`
                    @keyframes nf-fade-up {
                        from { opacity: 0; transform: translateY(24px); }
                        to   { opacity: 1; transform: translateY(0); }
                    }
                    @keyframes nf-float {
                        0%, 100% { transform: translateY(0); }
                        50%      { transform: translateY(-10px); }
                    }
                    @keyframes nf-pulse-ring {
                        0%, 100% { transform: scale(1);    opacity: 0.45; }
                        50%      { transform: scale(1.2);  opacity: 0.1; }
                    }
                `}</style>

                {/* Floating icon */}
                <div style={{ animation: "nf-float 4s ease-in-out infinite", position: "relative" }}>
                    <div style={{
                        position: "absolute", inset: -16, borderRadius: "50%",
                        border: "1.5px solid rgba(99,102,241,0.35)",
                        animation: "nf-pulse-ring 3s ease-in-out infinite",
                    }} />
                    <div className="w-20 h-20 rounded-full flex items-center justify-center"
                        style={{
                            background: "linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(124,58,237,0.10) 100%)",
                            border: "1.5px solid rgba(99,102,241,0.32)",
                            boxShadow: "0 12px 40px rgba(99,102,241,0.25), 0 0 0 1px rgba(99,102,241,0.08)",
                        }}
                    >
                        <svg width="34" height="34" viewBox="0 0 24 24" fill="none"
                            stroke="rgba(99,102,241,0.9)" strokeWidth="1.5"
                            strokeLinecap="round" strokeLinejoin="round"
                        >
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                            <line x1="12" y1="9" x2="12" y2="13"/>
                            <line x1="12" y1="17" x2="12.01" y2="17"/>
                        </svg>
                    </div>
                </div>

                {/* Eyebrow pill */}
                <div className="inline-flex items-center gap-1.5 font-mono text-[0.6rem] tracking-[0.2em] uppercase text-primary/70 border border-primary/20 bg-primary/[0.06] px-3 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_6px_theme(colors.indigo.500)] inline-block" />
                    Page Not Found
                </div>

                {/* 404 */}
                <div
                    className="font-sora font-extrabold leading-none select-none"
                    style={{
                        fontSize: "clamp(5.5rem, 20vw, 10rem)",
                        letterSpacing: "-0.05em",
                        background: "linear-gradient(135deg, #6366f1 0%, #7c3aed 45%, #a78bfa 75%, #f472b6 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                        filter: "drop-shadow(0 0 40px rgba(99,102,241,0.35))",
                    }}
                >
                    404
                </div>

                {/* Text */}
                <div className="flex flex-col gap-2">
                    <h1 className="font-sora font-extrabold text-heading tracking-tight"
                        style={{ fontSize: "clamp(1.2rem, 4vw, 1.6rem)" }}
                    >
                        Lost in the void
                    </h1>
                    <p className="text-muted/60 leading-relaxed max-w-sm mx-auto"
                        style={{ fontSize: "clamp(0.875rem, 2.5vw, 0.95rem)" }}
                    >
                        The page you're looking for doesn't exist or has been moved.
                        Head back and keep your job search on track.
                    </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 flex-wrap justify-center">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 font-semibold text-sm px-6 py-2.5 rounded-xl no-underline transition-all duration-200"
                        style={{
                            background: "linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)",
                            color: "#fff",
                            boxShadow: "0 6px 24px rgba(99,102,241,0.42)",
                        }}
                        onMouseEnter={e => {
                            (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 10px 32px rgba(99,102,241,0.58)";
                            (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)";
                        }}
                        onMouseLeave={e => {
                            (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 6px 24px rgba(99,102,241,0.42)";
                            (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)";
                        }}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                            <polyline points="9 22 9 12 15 12 15 22"/>
                        </svg>
                        Go Home
                    </Link>
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-2 font-medium text-sm px-5 py-2.5 rounded-xl border border-border/50 bg-foreground/[0.04] text-muted no-underline transition-all duration-200 hover:text-foreground hover:border-border hover:bg-foreground/[0.08]"
                    >
                        Dashboard
                    </Link>
                </div>

                {/* Footnote */}
                <p className="font-mono text-[0.6rem] tracking-[0.16em] uppercase text-muted/25">
                    HTTP 404 · Resource not found
                </p>
            </div>
        </div>
    );
}
