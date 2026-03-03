"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import Link from "next/link";

export default function HomepageAnimation() {
    const mountRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!mountRef.current) return;
        const mount = mountRef.current;
        let width = mount.clientWidth;
        let height = mount.clientHeight;

        // ── Renderer ──────────────────────────────────────────────────────────────
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(width, height);
        renderer.setClearColor(0x000000, 0);

        // ✅ Make canvas a true background layer
        renderer.domElement.style.position = "absolute";
        renderer.domElement.style.inset = "0";
        renderer.domElement.style.width = "100%";
        renderer.domElement.style.height = "100%";
        renderer.domElement.style.zIndex = "0";
        renderer.domElement.style.pointerEvents = "none";

        mount.appendChild(renderer.domElement);

        // ── Scene / Camera ────────────────────────────────────────────────────────
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 300);
        camera.position.set(0, 0, 34);

        // ── Fog ───────────────────────────────────────────────────────────────────
        scene.fog = new THREE.FogExp2(0x000000, 0.018);

        // ── Lights ────────────────────────────────────────────────────────────────
        scene.add(new THREE.AmbientLight(0xffffff, 0.3));

        const light1 = new THREE.PointLight(0x00d4ff, 3.5, 80);
        light1.position.set(-18, 12, 14);
        scene.add(light1);

        const light2 = new THREE.PointLight(0x7c3aed, 3.0, 80);
        light2.position.set(18, -10, 10);
        scene.add(light2);

        const light3 = new THREE.PointLight(0x10b981, 2.0, 60);
        light3.position.set(0, 18, -8);
        scene.add(light3);

        // ── Floating glass cards ──────────────────────────────────────────────────
        interface FloatMesh extends THREE.Mesh {
            userData: {
                vx: number;
                vy: number;
                vz: number;
                rx: number;
                ry: number;
                rz: number;
            };
        }

        const cards: FloatMesh[] = [];

        const makeCard = (
            w: number,
            h: number,
            colorHex: number,
            x: number,
            y: number,
            z: number
        ) => {
            const geo = new THREE.BoxGeometry(w, h, 0.06);
            const mat = new THREE.MeshStandardMaterial({
                color: colorHex,
                roughness: 0.05,
                metalness: 0.9,
                transparent: true,
                opacity: 0.22,
            });

            const card = new THREE.Mesh(geo, mat) as FloatMesh;
            card.position.set(x, y, z);
            card.rotation.set(
                (Math.random() - 0.5) * 0.5,
                (Math.random() - 0.5) * 0.5,
                (Math.random() - 0.5) * 0.3
            );
            card.userData = {
                vx: (Math.random() - 0.5) * 0.006,
                vy: (Math.random() - 0.5) * 0.005,
                vz: (Math.random() - 0.5) * 0.003,
                rx: (Math.random() - 0.5) * 0.0015,
                ry: (Math.random() - 0.5) * 0.002,
                rz: (Math.random() - 0.5) * 0.001,
            };

            const edgeGeo = new THREE.EdgesGeometry(geo);
            const edgeMat = new THREE.LineBasicMaterial({
                color: colorHex,
                transparent: true,
                opacity: 0.6,
            });
            card.add(new THREE.LineSegments(edgeGeo, edgeMat));

            scene.add(card);
            cards.push(card);
        };

        [
            { w: 5.5, h: 3.2, c: 0x00d4ff, x: -14, y: 5, z: -4 },
            { w: 4.8, h: 2.8, c: 0x7c3aed, x: 13, y: -6, z: -2 },
            { w: 6.0, h: 3.6, c: 0x10b981, x: -10, y: -8, z: 2 },
            { w: 5.0, h: 3.0, c: 0x00d4ff, x: 16, y: 7, z: -6 },
            { w: 4.4, h: 2.6, c: 0xf59e0b, x: 4, y: -12, z: 4 },
            { w: 5.2, h: 3.1, c: 0x7c3aed, x: -18, y: -2, z: 0 },
            { w: 4.6, h: 2.9, c: 0x10b981, x: 10, y: 12, z: -8 },
            { w: 5.8, h: 3.4, c: 0xf59e0b, x: -5, y: 11, z: 2 },
            { w: 4.2, h: 2.5, c: 0x00d4ff, x: 20, y: -1, z: -4 },
            { w: 5.4, h: 3.3, c: 0x7c3aed, x: -7, y: -14, z: -2 },
        ].forEach((d) => makeCard(d.w, d.h, d.c, d.x, d.y, d.z));

        // ── Glowing rings ─────────────────────────────────────────────────────────
        const torus = new THREE.Mesh(
            new THREE.TorusGeometry(12, 0.04, 8, 120),
            new THREE.MeshBasicMaterial({
                color: 0x00d4ff,
                transparent: true,
                opacity: 0.18,
            })
        );
        torus.rotation.x = Math.PI / 2.8;
        scene.add(torus);

        const torus2 = new THREE.Mesh(
            new THREE.TorusGeometry(18, 0.03, 8, 140),
            new THREE.MeshBasicMaterial({
                color: 0x7c3aed,
                transparent: true,
                opacity: 0.12,
            })
        );
        torus2.rotation.x = Math.PI / 3.5;
        torus2.rotation.z = 0.4;
        scene.add(torus2);

        // ── Status orbs ───────────────────────────────────────────────────────────
        const orbColors = [0x10b981, 0x00d4ff, 0xf59e0b, 0xef4444, 0x7c3aed];
        const orbs: THREE.Mesh[] = [];

        for (let i = 0; i < 22; i++) {
            const r = 0.12 + Math.random() * 0.18;
            const col = orbColors[i % orbColors.length];
            const orb = new THREE.Mesh(
                new THREE.SphereGeometry(r, 14, 14),
                new THREE.MeshStandardMaterial({
                    color: col,
                    emissive: col,
                    emissiveIntensity: 0.9,
                    roughness: 0.0,
                    metalness: 0.3,
                })
            );
            orb.position.set(
                (Math.random() - 0.5) * 50,
                (Math.random() - 0.5) * 36,
                (Math.random() - 0.5) * 22
            );
            (orb as any).userData = {
                vx: (Math.random() - 0.5) * 0.014,
                vy: (Math.random() - 0.5) * 0.011,
                pulse: Math.random() * Math.PI * 2,
            };
            orbs.push(orb);
            scene.add(orb);
        }

        // ── Grid horizon ──────────────────────────────────────────────────────────
        const grid = new THREE.GridHelper(120, 40, 0x00d4ff, 0x0a1628);
        grid.position.y = -18;
        (grid.material as THREE.Material).transparent = true;
        (grid.material as THREE.Material).opacity = 0.18;
        scene.add(grid);

        // ── Stars ─────────────────────────────────────────────────────────────────
        const starPos = new Float32Array(500 * 3);
        for (let i = 0; i < 1500; i++) starPos[i] = (Math.random() - 0.5) * 130;
        const starGeo = new THREE.BufferGeometry();
        starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
        const stars = new THREE.Points(
            starGeo,
            new THREE.PointsMaterial({
                color: 0xffffff,
                size: 0.09,
                transparent: true,
                opacity: 0.5,
            })
        );
        scene.add(stars);

        // ── Mouse parallax ────────────────────────────────────────────────────────
        const mouse = { x: 0, y: 0 };
        const onMouseMove = (e: MouseEvent) => {
            mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
            mouse.y = -(e.clientY / window.innerHeight - 0.5) * 2;
        };
        window.addEventListener("mousemove", onMouseMove);

        const onResize = () => {
            width = mount.clientWidth;
            height = mount.clientHeight;
            renderer.setSize(width, height);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        };
        window.addEventListener("resize", onResize);

        // ── Animate ───────────────────────────────────────────────────────────────
        let frameId: number;
        const clock = new THREE.Clock();

        const animate = () => {
            frameId = requestAnimationFrame(animate);
            const t = clock.getElapsedTime();

            camera.position.x += (mouse.x * 4 - camera.position.x) * 0.035;
            camera.position.y += (mouse.y * 2.5 - camera.position.y) * 0.035;
            camera.lookAt(scene.position);

            cards.forEach((c) => {
                const d = c.userData;
                c.position.x += d.vx;
                c.position.y += d.vy;
                c.position.z += d.vz;
                c.rotation.x += d.rx;
                c.rotation.y += d.ry;
                c.rotation.z += d.rz;
                if (Math.abs(c.position.x) > 26) d.vx *= -1;
                if (Math.abs(c.position.y) > 18) d.vy *= -1;
                if (Math.abs(c.position.z) > 12) d.vz *= -1;
            });

            orbs.forEach((o) => {
                const d = (o as any).userData;
                o.position.x += d.vx;
                o.position.y += d.vy;
                if (Math.abs(o.position.x) > 28) d.vx *= -1;
                if (Math.abs(o.position.y) > 20) d.vy *= -1;
                (o.material as THREE.MeshStandardMaterial).emissiveIntensity =
                    0.6 + 0.5 * Math.sin(t * 2.2 + d.pulse);
            });

            torus.rotation.z = t * 0.07;
            torus2.rotation.z = -t * 0.045;
            torus2.rotation.y = t * 0.025;

            light1.position.x = Math.sin(t * 0.4) * 20;
            light1.position.y = Math.cos(t * 0.3) * 14;
            light2.position.x = Math.cos(t * 0.35) * 20;
            light2.position.y = Math.sin(t * 0.28) * 12;

            grid.position.z = (t * 2) % 3;
            stars.rotation.y = t * 0.006;

            renderer.render(scene, camera);
        };
        animate();

        return () => {
            cancelAnimationFrame(frameId);
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("resize", onResize);
            renderer.dispose();
            if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
        };
    }, []);

    return (
        <div
            ref={mountRef}
            className="relative w-full h-full"
            style={{
                minHeight: "100vh",
                background: "linear-gradient(160deg, #00020a 0%, #020b18 45%, #050e1f 100%)",
                overflow: "hidden",
            }}
        >
            {/* ── Top nav bar ────────────────────────────────────────────────────── */}
            <nav
                className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between"
                style={{ padding: "1.5rem 2.5rem" }}
            >
        <span
            style={{
                fontFamily: "'DM Mono', 'Courier New', monospace",
                fontSize: "0.78rem",
                letterSpacing: "0.22em",
                color: "rgba(0,212,255,0.65)",
                textTransform: "uppercase",
            }}
        >
          ApplyOS
        </span>

                <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                    <Link
                        href="/signup"
                        style={{
                            fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
                            fontWeight: 600,
                            fontSize: "0.84rem",
                            letterSpacing: "0.06em",
                            padding: "0.52rem 1.2rem",
                            borderRadius: "6px",
                            background: "rgba(124,58,237,0.10)",
                            color: "rgba(210,190,255,0.95)",
                            border: "1px solid rgba(124,58,237,0.28)",
                            textDecoration: "none",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            height: "34px",
                        }}
                    >
                        Sign up
                    </Link>

                    <Link
                        href="/login"
                        style={{
                            fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
                            fontWeight: 500,
                            fontSize: "0.84rem",
                            letterSpacing: "0.06em",
                            padding: "0.52rem 1.2rem",
                            borderRadius: "6px",
                            background: "rgba(0,212,255,0.07)",
                            color: "rgba(0,212,255,0.88)",
                            border: "1px solid rgba(0,212,255,0.22)",
                            textDecoration: "none",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            height: "34px",
                        }}
                    >
                        Log in
                    </Link>
                </div>
            </nav>

            {/* ── Hero copy ──────────────────────────────────────────────────────── */}
            <div
                className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
                style={{ paddingTop: "4rem", zIndex: 10 }}
            >
                <div
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        fontFamily: "'DM Mono', monospace",
                        fontSize: "0.67rem",
                        letterSpacing: "0.22em",
                        color: "rgba(0,212,255,0.6)",
                        textTransform: "uppercase",
                        marginBottom: "1.8rem",
                        border: "1px solid rgba(0,212,255,0.14)",
                        padding: "0.34rem 0.9rem",
                        borderRadius: "999px",
                        backdropFilter: "blur(8px)",
                        background: "rgba(0,212,255,0.04)",
                    }}
                >
          <span
              style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#10b981",
                  boxShadow: "0 0 6px #10b981",
                  display: "inline-block",
                  flexShrink: 0,
              }}
          />
                    Job Application Tracker
                </div>

                <h1
                    style={{
                        fontFamily: "'Syne', 'Helvetica Neue', sans-serif",
                        fontWeight: 800,
                        fontSize: "clamp(2.8rem, 8vw, 5.8rem)",
                        lineHeight: 1.02,
                        textAlign: "center",
                        letterSpacing: "-0.03em",
                        color: "#f0f8ff",
                        maxWidth: "860px",
                        marginBottom: "1.4rem",
                    }}
                >
                    Land your next
                    <br />
                    <span
                        style={{
                            background:
                                "linear-gradient(90deg, #00d4ff 0%, #7c3aed 55%, #10b981 100%)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text",
                        }}
                    >
            dream role.
          </span>
                </h1>

                <p
                    style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: "clamp(0.9rem, 2vw, 1.1rem)",
                        color: "rgba(160,200,240,0.55)",
                        textAlign: "center",
                        maxWidth: "460px",
                        lineHeight: 1.78,
                    }}
                >
                    Every application, follow-up, and offer — tracked in one elegant workspace built for focused job seekers.
                </p>

                <div
                    style={{
                        display: "flex",
                        gap: "1.6rem",
                        marginTop: "3.8rem",
                        flexWrap: "wrap",
                        justifyContent: "center",
                        opacity: 0.48,
                    }}
                >
                    {[
                        { color: "#10b981", label: "Offer" },
                        { color: "#00d4ff", label: "Interview" },
                        { color: "#f59e0b", label: "Applied" },
                        { color: "#ef4444", label: "Rejected" },
                        { color: "#7c3aed", label: "Saved" },
                    ].map((s) => (
                        <div
                            key={s.label}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.38rem",
                                fontFamily: "'DM Mono', monospace",
                                fontSize: "0.64rem",
                                color: "rgba(160,200,240,0.7)",
                                letterSpacing: "0.1em",
                            }}
                        >
              <span
                  style={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: s.color,
                      boxShadow: `0 0 8px ${s.color}88`,
                      display: "inline-block",
                      flexShrink: 0,
                  }}
              />
                            {s.label.toUpperCase()}
                        </div>
                    ))}
                </div>
            </div>

            {/* Radial vignette */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    zIndex: 5,
                    background:
                        "radial-gradient(ellipse 70% 60% at 50% 50%, transparent 28%, rgba(0,2,10,0.72) 100%)",
                }}
            />

            {/* Bottom fade */}
            <div
                className="absolute bottom-0 left-0 right-0 pointer-events-none"
                style={{
                    zIndex: 6,
                    height: "140px",
                    background: "linear-gradient(to top, rgba(0,2,10,0.88) 0%, transparent 100%)",
                }}
            />
        </div>
    );
}