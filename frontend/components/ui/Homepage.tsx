"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import Link from "next/link";

// Reads HeroUI's injected CSS variables from the document root at runtime
function getThemeColors() {
    const style = getComputedStyle(document.documentElement);
    const get = (v: string) => style.getPropertyValue(v).trim();

    // HeroUI injects colors as HSL channels e.g. "--heroui-primary: 239 84% 67%"
    // We convert to hex for Three.js
    const hslToHex = (hsl: string): string => {
        const parts = hsl.split(" ").map(Number);
        if (parts.length < 3) return "#6366f1";
        const [h, s, l] = parts;
        const ll = l / 100;
        const a = (s / 100) * Math.min(ll, 1 - ll);
        const f = (n: number) => {
            const k = (n + h / 30) % 12;
            const color = ll - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
            return Math.round(255 * color).toString(16).padStart(2, "0");
        };
        return `#${f(0)}${f(8)}${f(4)}`;
    };

    const hexToInt = (hex: string) => parseInt(hex.replace("#", ""), 16);

    const primary   = hslToHex(get("--heroui-primary"));
    const secondary = hslToHex(get("--heroui-secondary"));
    const success   = hslToHex(get("--heroui-success"));
    const warning   = hslToHex(get("--heroui-warning"));
    const danger    = hslToHex(get("--heroui-danger"));
    const info      = hslToHex(get("--heroui-info"));
    const bg        = hslToHex(get("--heroui-background"));
    const accent    = hslToHex(get("--heroui-accent"));

    return {
        css: { primary, secondary, success, warning, danger, info, bg, accent },
        three: {
            primary:   hexToInt(primary),
            secondary: hexToInt(secondary),
            success:   hexToInt(success),
            warning:   hexToInt(warning),
            danger:    hexToInt(danger),
            info:      hexToInt(info),
            bg:        hexToInt(bg),
            accent:    hexToInt(accent),
        },
    };
}

export default function HomepageAnimation() {
    const mountRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!mountRef.current) return;
        const mount = mountRef.current;
        let width  = mount.clientWidth;
        let height = mount.clientHeight;

        let { css, three } = getThemeColors();

        // ── Renderer ──────────────────────────────────────────────────────────────
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(width, height);
        renderer.setClearColor(0x000000, 0);
        Object.assign(renderer.domElement.style, {
            position: "absolute", inset: "0",
            width: "100%", height: "100%",
            zIndex: "0", pointerEvents: "none",
        });
        mount.appendChild(renderer.domElement);

        // ── Scene / Camera ────────────────────────────────────────────────────────
        const scene  = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 300);
        camera.position.set(0, 0, 34);
        scene.fog = new THREE.FogExp2(three.bg, 0.018);

        // ── Lights ────────────────────────────────────────────────────────────────
        scene.add(new THREE.AmbientLight(0xffffff, 0.3));

        const light1 = new THREE.PointLight(three.info,      3.5, 80);
        light1.position.set(-18, 12, 14);
        scene.add(light1);

        const light2 = new THREE.PointLight(three.secondary, 3.0, 80);
        light2.position.set(18, -10, 10);
        scene.add(light2);

        const light3 = new THREE.PointLight(three.success,   2.0, 60);
        light3.position.set(0, 18, -8);
        scene.add(light3);

        // ── Floating glass cards ──────────────────────────────────────────────────
        interface FloatMesh extends THREE.Mesh {
            userData: { vx:number; vy:number; vz:number; rx:number; ry:number; rz:number };
        }
        const cards: FloatMesh[] = [];

        const cardDefs = [
            { w:5.5, h:3.2, key:"info",      x:-14, y:  5, z:-4 },
            { w:4.8, h:2.8, key:"secondary", x: 13, y: -6, z:-2 },
            { w:6.0, h:3.6, key:"success",   x:-10, y: -8, z: 2 },
            { w:5.0, h:3.0, key:"info",      x: 16, y:  7, z:-6 },
            { w:4.4, h:2.6, key:"warning",   x:  4, y:-12, z: 4 },
            { w:5.2, h:3.1, key:"primary",   x:-18, y: -2, z: 0 },
            { w:4.6, h:2.9, key:"success",   x: 10, y: 12, z:-8 },
            { w:5.8, h:3.4, key:"warning",   x: -5, y: 11, z: 2 },
            { w:4.2, h:2.5, key:"info",      x: 20, y: -1, z:-4 },
            { w:5.4, h:3.3, key:"accent",    x: -7, y:-14, z:-2 },
        ] as const;

        cardDefs.forEach((d) => {
            const col  = three[d.key];
            const geo  = new THREE.BoxGeometry(d.w, d.h, 0.06);
            const mat  = new THREE.MeshStandardMaterial({
                color: col, roughness: 0.05, metalness: 0.9, transparent: true, opacity: 0.22,
            });
            const card = new THREE.Mesh(geo, mat) as FloatMesh;
            card.position.set(d.x, d.y, d.z);
            card.rotation.set(
                (Math.random() - 0.5) * 0.5,
                (Math.random() - 0.5) * 0.5,
                (Math.random() - 0.5) * 0.3,
            );
            card.userData = {
                vx: (Math.random() - 0.5) * 0.006, vy: (Math.random() - 0.5) * 0.005,
                vz: (Math.random() - 0.5) * 0.003, rx: (Math.random() - 0.5) * 0.0015,
                ry: (Math.random() - 0.5) * 0.002,  rz: (Math.random() - 0.5) * 0.001,
            };
            const edge = new THREE.LineSegments(
                new THREE.EdgesGeometry(geo),
                new THREE.LineBasicMaterial({ color: col, transparent: true, opacity: 0.6 }),
            );
            card.add(edge);
            scene.add(card);
            cards.push(card);
        });

        // ── Glowing rings ─────────────────────────────────────────────────────────
        const torusMat1 = new THREE.MeshBasicMaterial({ color: three.info,      transparent: true, opacity: 0.18 });
        const torusMat2 = new THREE.MeshBasicMaterial({ color: three.secondary, transparent: true, opacity: 0.12 });

        const torus  = new THREE.Mesh(new THREE.TorusGeometry(12, 0.04, 8, 120), torusMat1);
        torus.rotation.x = Math.PI / 2.8;
        scene.add(torus);

        const torus2 = new THREE.Mesh(new THREE.TorusGeometry(18, 0.03, 8, 140), torusMat2);
        torus2.rotation.x = Math.PI / 3.5;
        torus2.rotation.z = 0.4;
        scene.add(torus2);

        // ── Status orbs ───────────────────────────────────────────────────────────
        const orbColorKeys = ["success", "info", "warning", "danger", "secondary"] as const;
        const orbs: THREE.Mesh[] = [];

        for (let i = 0; i < 22; i++) {
            const r   = 0.12 + Math.random() * 0.18;
            const col = three[orbColorKeys[i % orbColorKeys.length]];
            const orb = new THREE.Mesh(
                new THREE.SphereGeometry(r, 14, 14),
                new THREE.MeshStandardMaterial({
                    color: col, emissive: col, emissiveIntensity: 0.9,
                    roughness: 0.0, metalness: 0.3,
                }),
            );
            orb.position.set(
                (Math.random() - 0.5) * 50,
                (Math.random() - 0.5) * 36,
                (Math.random() - 0.5) * 22,
            );
            (orb as any).userData = {
                vx: (Math.random() - 0.5) * 0.014,
                vy: (Math.random() - 0.5) * 0.011,
                pulse: Math.random() * Math.PI * 2,
                colorKey: orbColorKeys[i % orbColorKeys.length],
            };
            orbs.push(orb);
            scene.add(orb);
        }

        // ── Grid / Stars ──────────────────────────────────────────────────────────
        const grid = new THREE.GridHelper(120, 40, three.info, three.bg);
        grid.position.y = -18;
        (grid.material as THREE.Material).transparent = true;
        (grid.material as THREE.Material).opacity = 0.18;
        scene.add(grid);

        const starPos = new Float32Array(1500);
        for (let i = 0; i < 1500; i++) starPos[i] = (Math.random() - 0.5) * 130;
        const starGeo = new THREE.BufferGeometry();
        starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
        const stars = new THREE.Points(
            starGeo,
            new THREE.PointsMaterial({ color: 0xffffff, size: 0.09, transparent: true, opacity: 0.5 }),
        );
        scene.add(stars);

        // ── Theme observer — watches <html class="dark/light"> changes ────────────
        const applyTheme = () => {
            const t = getThemeColors();
            css   = t.css;
            three = t.three;

            // Update lights
            light1.color.setHex(three.info);
            light2.color.setHex(three.secondary);
            light3.color.setHex(three.success);

            // Update fog
            (scene.fog as THREE.FogExp2).color.setHex(three.bg);

            // Update cards
            cards.forEach((card, i) => {
                const key  = cardDefs[i].key;
                const col  = three[key];
                const mat  = card.material as THREE.MeshStandardMaterial;
                mat.color.setHex(col);
                const edge = card.children[0] as THREE.LineSegments;
                (edge.material as THREE.LineBasicMaterial).color.setHex(col);
            });

            // Update rings
            torusMat1.color.setHex(three.info);
            torusMat2.color.setHex(three.secondary);

            // Update orbs
            orbs.forEach((o) => {
                const key = (o as any).userData.colorKey as keyof typeof three;
                const col = three[key];
                const mat = o.material as THREE.MeshStandardMaterial;
                mat.color.setHex(col);
                mat.emissive.setHex(col);
            });

            // Update grid
            const gridMats = Array.isArray(grid.material) ? grid.material : [grid.material];
            gridMats.forEach((m) => (m as THREE.LineBasicMaterial).color.setHex(three.info));
        };

        const observer = new MutationObserver(applyTheme);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

        // ── Mouse / Resize ────────────────────────────────────────────────────────
        const mouse = { x: 0, y: 0 };
        const onMouseMove = (e: MouseEvent) => {
            mouse.x =  (e.clientX / window.innerWidth  - 0.5) * 2;
            mouse.y = -(e.clientY / window.innerHeight - 0.5) * 2;
        };
        window.addEventListener("mousemove", onMouseMove);

        const onResize = () => {
            width  = mount.clientWidth;
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

            camera.position.x += (mouse.x * 4   - camera.position.x) * 0.035;
            camera.position.y += (mouse.y * 2.5 - camera.position.y) * 0.035;
            camera.lookAt(scene.position);

            cards.forEach((c) => {
                const d = c.userData;
                c.position.x += d.vx; c.position.y += d.vy; c.position.z += d.vz;
                c.rotation.x  += d.rx; c.rotation.y  += d.ry; c.rotation.z  += d.rz;
                if (Math.abs(c.position.x) > 26) d.vx *= -1;
                if (Math.abs(c.position.y) > 18) d.vy *= -1;
                if (Math.abs(c.position.z) > 12) d.vz *= -1;
            });

            orbs.forEach((o) => {
                const d = (o as any).userData;
                o.position.x += d.vx; o.position.y += d.vy;
                if (Math.abs(o.position.x) > 28) d.vx *= -1;
                if (Math.abs(o.position.y) > 20) d.vy *= -1;
                (o.material as THREE.MeshStandardMaterial).emissiveIntensity =
                    0.6 + 0.5 * Math.sin(t * 2.2 + d.pulse);
            });

            torus.rotation.z  =  t * 0.07;
            torus2.rotation.z = -t * 0.045;
            torus2.rotation.y =  t * 0.025;
            light1.position.x = Math.sin(t * 0.4)  * 20;
            light1.position.y = Math.cos(t * 0.3)  * 14;
            light2.position.x = Math.cos(t * 0.35) * 20;
            light2.position.y = Math.sin(t * 0.28) * 12;
            grid.position.z   = (t * 2) % 3;
            stars.rotation.y  = t * 0.006;

            renderer.render(scene, camera);
        };
        animate();

        return () => {
            cancelAnimationFrame(frameId);
            observer.disconnect();
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
                background: "linear-gradient(160deg, var(--heroui-background) 0%, #0f172a 45%, #050e1f 100%)",
                overflow: "hidden",
            }}
        >
            {/* ── Nav ──────────────────────────────────────────────────────────────── */}
            <nav
                className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between"
                style={{ padding: "1.5rem 2.5rem" }}
            >
        <span className="font-mono text-xs tracking-[0.22em] uppercase" style={{ color: "hsl(var(--heroui-info) / 0.65)" }}>
          ApplyOS
        </span>
                <div style={{ display: "flex", gap: "0.75rem" }}>
                    <Link
                        href="/signup"
                        className="text-sm font-semibold inline-flex items-center px-4 h-[34px] rounded-md border transition-colors"
                        style={{
                            background: "hsl(var(--heroui-secondary) / 0.10)",
                            color:      "hsl(var(--heroui-secondary) / 0.95)",
                            border:     "1px solid hsl(var(--heroui-secondary) / 0.28)",
                        }}
                    >
                        Sign up
                    </Link>
                    <Link
                        href="/login"
                        className="text-sm font-medium inline-flex items-center px-4 h-[34px] rounded-md border transition-colors"
                        style={{
                            background: "hsl(var(--heroui-info) / 0.07)",
                            color:      "hsl(var(--heroui-info) / 0.88)",
                            border:     "1px solid hsl(var(--heroui-info) / 0.22)",
                        }}
                    >
                        Log in
                    </Link>
                </div>
            </nav>

            {/* ── Hero ─────────────────────────────────────────────────────────────── */}
            <div
                className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
                style={{ paddingTop: "4rem", zIndex: 10 }}
            >
                <div
                    className="inline-flex items-center gap-2 font-mono text-[0.67rem] tracking-[0.22em] uppercase mb-8 rounded-full px-4 py-1.5 backdrop-blur-sm"
                    style={{
                        color:      "hsl(var(--heroui-info) / 0.6)",
                        border:     "1px solid hsl(var(--heroui-info) / 0.14)",
                        background: "hsl(var(--heroui-info) / 0.04)",
                    }}
                >
          <span
              className="inline-block w-1.5 h-1.5 rounded-full shrink-0"
              style={{ background: "hsl(var(--heroui-success))", boxShadow: "0 0 6px hsl(var(--heroui-success))" }}
          />
                    Job Application Tracker
                </div>

                <h1
                    className="font-sora font-extrabold text-center"
                    style={{
                        fontSize: "clamp(2.8rem, 8vw, 5.8rem)",
                        lineHeight: 1.02,
                        letterSpacing: "-0.03em",
                        color: "hsl(var(--heroui-heading))",
                        maxWidth: "860px",
                        marginBottom: "1.4rem",
                    }}
                >
                    Land your next
                    <br />
                    <span
                        style={{
                            background: "linear-gradient(90deg, hsl(var(--heroui-info)) 0%, hsl(var(--heroui-primary)) 40%, hsl(var(--heroui-secondary)) 70%, hsl(var(--heroui-success)) 100%)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text",
                        }}
                    >
            dream role.
          </span>
                </h1>

                <p
                    className="font-sans text-center"
                    style={{
                        fontSize: "clamp(0.9rem, 2vw, 1.1rem)",
                        color: "hsl(var(--heroui-subheading) / 0.55)",
                        maxWidth: "460px",
                        lineHeight: 1.78,
                    }}
                >
                    Every application, follow-up, and offer — tracked in one elegant workspace built for focused job seekers.
                </p>

                <div className="flex flex-wrap gap-6 mt-16 justify-center" style={{ opacity: 0.48 }}>
                    {[
                        { key: "success",   label: "Offer"     },
                        { key: "info",      label: "Interview" },
                        { key: "warning",   label: "Applied"   },
                        { key: "danger",    label: "Rejected"  },
                        { key: "secondary", label: "Saved"     },
                    ].map((s) => (
                        <div key={s.label} className="flex items-center gap-1.5 font-mono text-[0.64rem] tracking-[0.1em]"
                             style={{ color: "hsl(var(--heroui-subheading) / 0.7)" }}
                        >
              <span
                  className="inline-block w-2 h-2 rounded-full shrink-0"
                  style={{
                      background: `hsl(var(--heroui-${s.key}))`,
                      boxShadow:  `0 0 8px hsl(var(--heroui-${s.key}) / 0.53)`,
                  }}
              />
                            {s.label.toUpperCase()}
                        </div>
                    ))}
                </div>
            </div>

            {/* Vignette */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    zIndex: 5,
                    background: "radial-gradient(ellipse 70% 60% at 50% 50%, transparent 28%, hsl(var(--heroui-background) / 0.72) 100%)",
                }}
            />

            {/* Bottom fade */}
            <div
                className="absolute bottom-0 left-0 right-0 pointer-events-none"
                style={{
                    zIndex: 6, height: "140px",
                    background: "linear-gradient(to top, hsl(var(--heroui-background) / 0.88) 0%, transparent 100%)",
                }}
            />
        </div>
    );
}