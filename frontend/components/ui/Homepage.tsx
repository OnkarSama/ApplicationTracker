"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import Link from "next/link";

function getThemeColors() {
    const style = getComputedStyle(document.documentElement);
    const get = (v: string) => style.getPropertyValue(v).trim();

    const hslToHex = (hsl: string): string => {
        const parts = hsl.trim().split(/\s+/).map(Number);
        if (parts.length < 3 || parts.some(isNaN)) return "#6366f1";
        const [h, s, l] = parts;
        const ll = l / 100;
        const a = (s / 100) * Math.min(ll, 1 - ll);
        const f = (n: number) => {
            const k = (n + h / 30) % 12;
            const color = ll - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
            return Math.round(255 * Math.max(0, Math.min(1, color))).toString(16).padStart(2, "0");
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

// ── Static job/school card data ────────────────────────────────────────────────
const JOB_CARDS = [
    // Tech companies
    { company: "Stripe",    role: "Eng II",          status: "success",   x: -14, y:  6, z: -6  },
    { company: "Vercel",    role: "FE Lead",          status: "info",      x:  13, y: -5, z: -3  },
    { company: "Linear",    role: "Product Eng",      status: "warning",   x:  -9, y: -9, z:  1  },
    { company: "Figma",     role: "SWE III",          status: "secondary", x:  16, y:  8, z: -7  },
    { company: "Notion",    role: "Full Stack",       status: "danger",    x:   3, y:-13, z:  3  },
    { company: "GitHub",    role: "Infra Eng",        status: "success",   x: -17, y: -1, z:  0  },
    { company: "Shopify",   role: "Senior SWE",       status: "info",      x:  10, y: 13, z: -9  },
    { company: "Railway",   role: "Infra Lead",       status: "info",      x:   8, y: -4, z:  5  },
    // Grad schools
    { company: "MIT",       role: "MS Computer Sci",  status: "success",   x: -20, y:  9, z: -4  },
    { company: "Stanford",  role: "MS CS / AI",       status: "info",      x:  20, y:  0, z: -5  },
    { company: "CMU",       role: "MSML Program",     status: "warning",   x:  -4, y: 10, z:  2  },
    { company: "Harvard",   role: "MBA",              status: "secondary", x:  -7, y:-15, z: -2  },
    { company: "Berkeley",  role: "MEng EECS",        status: "danger",    x:  18, y: -9, z: -1  },
    { company: "Columbia",  role: "MS Data Science",  status: "warning",   x: -12, y: 14, z: -3  },
] as const;

type StatusKey = "success" | "info" | "warning" | "secondary" | "danger" | "primary" | "accent";

// Status label text rendered onto cards via canvas texture
function makeCardTexture(
    company: string,
    role: string,
    statusLabel: string,
    statusHex: string,
    isDark: boolean,
): THREE.CanvasTexture {
    const W = 420, H = 230;
    const canvas = document.createElement("canvas");
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext("2d")!;

    // ── Solid card body ────────────────────────────────────────────────────────
    const bodyBg = isDark ? "#0f172a" : "#f8fafc";
    ctx.fillStyle = bodyBg;
    roundRect(ctx, 0, 0, W, H, 14);
    ctx.fill();

    // ── Solid colored header strip (top 72px) ──────────────────────────────────
    ctx.fillStyle = statusHex;
    roundRect(ctx, 0, 0, W, 72, { tl: 14, tr: 14, bl: 0, br: 0 });
    ctx.fill();

    // Thin dark overlay on header so white text pops on light colors like amber
    ctx.fillStyle = "rgba(0,0,0,0.18)";
    roundRect(ctx, 0, 0, W, 72, { tl: 14, tr: 14, bl: 0, br: 0 });
    ctx.fill();

    // ── Company name — always white on the colored header ──────────────────────
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 34px system-ui, sans-serif";
    ctx.fillText(company, 20, 48);

    // ── Body text ──────────────────────────────────────────────────────────────
    const bodyTextCol = isDark ? "#e2e8f0" : "#1e293b";
    const mutedCol    = isDark ? "#64748b"  : "#64748b";

    ctx.fillStyle = bodyTextCol;
    ctx.font = "bold 22px system-ui, sans-serif";
    ctx.fillText(role, 20, 108);

    // ── Divider ────────────────────────────────────────────────────────────────
    ctx.strokeStyle = isDark ? "#1e293b" : "#e2e8f0";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(20, 128); ctx.lineTo(W - 20, 128);
    ctx.stroke();

    // ── Status pill — SOLID fill, always readable ──────────────────────────────
    ctx.font = "bold 16px monospace";
    const labelText = statusLabel.toUpperCase();
    const textW = ctx.measureText(labelText).width;
    const pillW = textW + 40;
    const pillH = 30;
    const pillX = 18, pillY = 142;

    // Solid pill background
    ctx.fillStyle = statusHex;
    roundRect(ctx, pillX, pillY, pillW, pillH, 6);
    ctx.fill();

    // Dark overlay so white text is always legible (handles light colors like amber)
    ctx.fillStyle = "rgba(0,0,0,0.20)";
    roundRect(ctx, pillX, pillY, pillW, pillH, 6);
    ctx.fill();

    // White label text — always max contrast on solid pill
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 16px monospace";
    ctx.fillText(labelText, pillX + 20, pillY + pillH / 2 + 6);

    // ── Card border ────────────────────────────────────────────────────────────
    ctx.strokeStyle = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.10)";
    ctx.lineWidth = 1;
    roundRect(ctx, 0.5, 0.5, W - 1, H - 1, 14);
    ctx.stroke();

    return new THREE.CanvasTexture(canvas);
}

function roundRect(
    ctx: CanvasRenderingContext2D,
    x: number, y: number, w: number, h: number,
    r: number | { tl: number; tr: number; bl: number; br: number },
) {
    const rad = typeof r === "number" ? { tl: r, tr: r, bl: r, br: r } : r;
    ctx.beginPath();
    ctx.moveTo(x + rad.tl, y);
    ctx.lineTo(x + w - rad.tr, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + rad.tr);
    ctx.lineTo(x + w, y + h - rad.br);
    ctx.quadraticCurveTo(x + w, y + h, x + w - rad.br, y + h);
    ctx.lineTo(x + rad.bl, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - rad.bl);
    ctx.lineTo(x, y + rad.tl);
    ctx.quadraticCurveTo(x, y, x + rad.tl, y);
    ctx.closePath();
}

const STATUS_LABELS: Record<StatusKey, string> = {
    success:   "Offer",
    info:      "Interview",
    warning:   "Applied",
    secondary: "Saved",
    danger:    "Rejected",
    primary:   "Applied",
    accent:    "Saved",
};

const STATUS_PILLS = [
    { colorClass: "bg-emerald-500", glowClass: "shadow-emerald-500/60", label: "Offer"     },
    { colorClass: "bg-sky-400",     glowClass: "shadow-sky-400/60",     label: "Interview" },
    { colorClass: "bg-amber-400",   glowClass: "shadow-amber-400/60",   label: "Applied"   },
    { colorClass: "bg-rose-500",    glowClass: "shadow-rose-500/60",    label: "Rejected"  },
    { colorClass: "bg-violet-400",  glowClass: "shadow-violet-400/60",  label: "Saved"     },
];

export default function HomepageAnimation() {
    const mountRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        document.body.style.overflow = "hidden";
        if (!mountRef.current) return;
        const mount = mountRef.current;
        let width = mount.clientWidth;
        let height = mount.clientHeight;
        let { css, three } = getThemeColors();

        // ── Renderer ──────────────────────────────────────────────────────────
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

        // ── Scene / Camera ─────────────────────────────────────────────────────
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(52, width / height, 0.1, 300);
        camera.position.set(0, 0, 32);
        scene.fog = new THREE.FogExp2(three.bg, 0.022);

        // ── Lights ─────────────────────────────────────────────────────────────
        scene.add(new THREE.AmbientLight(0xffffff, 0.4));
        const keyLight = new THREE.PointLight(three.info, 4, 70);
        keyLight.position.set(-16, 14, 14);
        scene.add(keyLight);
        const fillLight = new THREE.PointLight(three.secondary, 3, 70);
        fillLight.position.set(16, -10, 10);
        scene.add(fillLight);

        // ── Job cards ──────────────────────────────────────────────────────────
        interface CardMesh extends THREE.Mesh {
            userData: {
                vx: number; vy: number; vz: number;
                rx: number; ry: number;
                baseX: number; baseY: number;
                statusKey: StatusKey;
            };
        }

        const cardMeshes: CardMesh[] = [];
        const cardGeo = new THREE.PlaneGeometry(5.8, 3.3);

        JOB_CARDS.forEach((d) => {
            const statusKey = d.status as StatusKey;
            const statusHex = css[statusKey] ?? "#6366f1";
            const isDark = document.documentElement.classList.contains("dark");
            const tex = makeCardTexture(d.company, d.role, STATUS_LABELS[statusKey], statusHex, isDark);

            const mat = new THREE.MeshStandardMaterial({
                map: tex,
                transparent: true,
                opacity: 0.82,
                roughness: 0.15,
                metalness: 0.4,
                side: THREE.DoubleSide,
            });

            const mesh = new THREE.Mesh(cardGeo, mat) as CardMesh;
            mesh.position.set(d.x, d.y, d.z);
            mesh.rotation.set(
                (Math.random() - 0.5) * 0.3,
                (Math.random() - 0.5) * 0.5,
                (Math.random() - 0.5) * 0.15,
            );
            mesh.userData = {
                vx: (Math.random() - 0.5) * 0.005,
                vy: (Math.random() - 0.5) * 0.004,
                vz: (Math.random() - 0.5) * 0.003,
                rx: (Math.random() - 0.5) * 0.0008,
                ry: (Math.random() - 0.5) * 0.001,
                baseX: d.x,
                baseY: d.y,
                statusKey,
            };

            // Glowing edge outline
            const edgeGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(5.8, 3.3, 0.01));
            const edgeMat = new THREE.LineBasicMaterial({ color: three[statusKey] ?? three.primary, transparent: true, opacity: 0.55 });
            mesh.add(new THREE.LineSegments(edgeGeo, edgeMat));

            scene.add(mesh);
            cardMeshes.push(mesh);
        });

        // ── Connection lines between nearby cards ──────────────────────────────
        // We draw lines between cards that share the same status to suggest a pipeline
        const lineGroup = new THREE.Group();
        scene.add(lineGroup);

        const buildLines = () => {
            lineGroup.clear();
            for (let i = 0; i < cardMeshes.length; i++) {
                for (let j = i + 1; j < cardMeshes.length; j++) {
                    const a = cardMeshes[i].position;
                    const b = cardMeshes[j].position;
                    const dist = a.distanceTo(b);
                    if (dist > 22) continue;
                    const alpha = 1 - dist / 22;
                    const geo = new THREE.BufferGeometry().setFromPoints([a.clone(), b.clone()]);
                    const col = three[cardMeshes[i].userData.statusKey] ?? three.primary;
                    const mat = new THREE.LineBasicMaterial({ color: col, transparent: true, opacity: alpha * 0.25 });
                    lineGroup.add(new THREE.Line(geo, mat));
                }
            }
        };
        buildLines();

        // ── Kanban column ghost pillars ────────────────────────────────────────
        // Faint vertical planes evoke kanban columns floating in the background
        const columnColors: StatusKey[] = ["info", "warning", "success", "danger", "secondary"];
        columnColors.forEach((key, i) => {
            const x = (i - 2) * 11;
            const geo = new THREE.PlaneGeometry(7, 28);
            const mat = new THREE.MeshBasicMaterial({
                color: three[key],
                transparent: true,
                opacity: 0.03,
                side: THREE.DoubleSide,
            });
            const plane = new THREE.Mesh(geo, mat);
            plane.position.set(x, 0, -18);
            scene.add(plane);

            // Column top accent line
            const lineGeo = new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(x - 3.5, 14, -17.8),
                new THREE.Vector3(x + 3.5, 14, -17.8),
            ]);
            const lineMat = new THREE.LineBasicMaterial({ color: three[key], transparent: true, opacity: 0.4 });
            scene.add(new THREE.Line(lineGeo, lineMat));
        });

        // ── Floating status dots (like notification badges) ────────────────────
        const dotKeys: StatusKey[] = ["success", "info", "warning", "danger", "secondary"];
        const dots: THREE.Mesh[] = [];
        for (let i = 0; i < 30; i++) {
            const key = dotKeys[i % dotKeys.length];
            const dot = new THREE.Mesh(
                new THREE.SphereGeometry(0.1 + Math.random() * 0.12, 10, 10),
                new THREE.MeshStandardMaterial({
                    color: three[key],
                    emissive: three[key],
                    emissiveIntensity: 1.2,
                    roughness: 0,
                }),
            );
            dot.position.set(
                (Math.random() - 0.5) * 52,
                (Math.random() - 0.5) * 36,
                (Math.random() - 0.5) * 18,
            );
            (dot as any).userData = {
                vy: (Math.random() - 0.5) * 0.008,
                vx: (Math.random() - 0.5) * 0.006,
                pulse: Math.random() * Math.PI * 2,
                key,
            };
            dots.push(dot);
            scene.add(dot);
        }

        // ── Progress arc (like a circular progress indicator) ─────────────────
        const arcMat = new THREE.MeshBasicMaterial({ color: three.success, transparent: true, opacity: 0.15 });
        const arc = new THREE.Mesh(new THREE.TorusGeometry(16, 0.035, 8, 100, Math.PI * 1.4), arcMat);
        arc.rotation.z = -Math.PI / 2;
        arc.position.z = -14;
        scene.add(arc);

        const arcMat2 = new THREE.MeshBasicMaterial({ color: three.info, transparent: true, opacity: 0.1 });
        const arc2 = new THREE.Mesh(new THREE.TorusGeometry(22, 0.025, 8, 120, Math.PI * 0.8), arcMat2);
        arc2.rotation.z = Math.PI * 0.6;
        arc2.position.z = -18;
        scene.add(arc2);

        // ── Theme observer ─────────────────────────────────────────────────────
        const applyTheme = () => {
            const t = getThemeColors();
            css = t.css; three = t.three;
            keyLight.color.setHex(three.info);
            fillLight.color.setHex(three.secondary);
            (scene.fog as THREE.FogExp2).color.setHex(three.bg);

            // Regenerate card textures with new theme
            const nowDark = document.documentElement.classList.contains("dark");
            cardMeshes.forEach((card, i) => {
                const d = JOB_CARDS[i];
                const statusKey = d.status as StatusKey;
                const statusHex = t.css[statusKey] ?? "#6366f1";
                const mat = card.material as THREE.MeshStandardMaterial;
                if (mat.map) mat.map.dispose();
                mat.map = makeCardTexture(d.company, d.role, STATUS_LABELS[statusKey], statusHex, nowDark);
                mat.map.needsUpdate = true;
                mat.needsUpdate = true;
                const edge = card.children[0] as THREE.LineSegments;
                (edge.material as THREE.LineBasicMaterial).color.setHex(t.three[statusKey] ?? t.three.primary);
            });
        };
        const observer = new MutationObserver(applyTheme);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

        // ── Mouse / Resize ─────────────────────────────────────────────────────
        const mouse = { x: 0, y: 0 };
        const onMouseMove = (e: MouseEvent) => {
            mouse.x = (e.clientX / window.innerWidth  - 0.5) * 2;
            mouse.y = -(e.clientY / window.innerHeight - 0.5) * 2;
        };
        window.addEventListener("mousemove", onMouseMove);

        const onResize = () => {
            width = mount.clientWidth; height = mount.clientHeight;
            renderer.setSize(width, height);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        };
        window.addEventListener("resize", onResize);

        // ── Animate ────────────────────────────────────────────────────────────
        let frameId: number;
        const clock = new THREE.Clock();
        let lineTimer = 0;

        const animate = () => {
            frameId = requestAnimationFrame(animate);
            const t = clock.getElapsedTime();
            const dt = clock.getDelta ? 0.016 : 0.016;

            camera.position.x += (mouse.x * 3.5 - camera.position.x) * 0.03;
            camera.position.y += (mouse.y * 2   - camera.position.y) * 0.03;
            camera.lookAt(scene.position);

            // Float cards with gentle bobbing
            cardMeshes.forEach((c, i) => {
                const d = c.userData;
                c.position.x += d.vx;
                c.position.y += d.vy + Math.sin(t * 0.4 + i) * 0.002;
                c.position.z += d.vz;
                c.rotation.x += d.rx;
                c.rotation.y += d.ry;
                if (Math.abs(c.position.x) > 28) d.vx *= -1;
                if (Math.abs(c.position.y) > 20) d.vy *= -1;
                if (Math.abs(c.position.z) > 14) d.vz *= -1;
            });

            // Rebuild connection lines periodically
            lineTimer += 0.016;
            if (lineTimer > 0.5) { buildLines(); lineTimer = 0; }

            // Pulse status dots
            dots.forEach((dot) => {
                const d = (dot as any).userData;
                dot.position.x += d.vx;
                dot.position.y += d.vy;
                if (Math.abs(dot.position.x) > 28) d.vx *= -1;
                if (Math.abs(dot.position.y) > 20) d.vy *= -1;
                (dot.material as THREE.MeshStandardMaterial).emissiveIntensity =
                    0.7 + 0.6 * Math.sin(t * 2.5 + d.pulse);
            });

            // Rotate arcs slowly
            arc.rotation.z  = -Math.PI / 2 + t * 0.06;
            arc2.rotation.z = Math.PI * 0.6 - t * 0.035;

            // Orbit lights
            keyLight.position.x  = Math.sin(t * 0.38) * 22;
            keyLight.position.y  = Math.cos(t * 0.28) * 14;
            fillLight.position.x = Math.cos(t * 0.33) * 20;
            fillLight.position.y = Math.sin(t * 0.25) * 12;

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
            className="h-screen w-screen overflow-hidden bg-linear-gradient"
        >
            {/* ── Nav ────────────────────────────────────────────────────────── */}
            <nav className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-10 py-6">
                <span className="font-mono text-sm tracking-[0.22em] uppercase text-[hsl(var(--heroui-info))] opacity-65 select-none">
                    ApplyOS
                </span>

                <div className="flex items-center gap-3">
                    <Link
                        href="/signup"
                        className="
                            group relative text-sm font-semibold inline-flex items-center
                            px-5 h-[36px] rounded-md overflow-hidden
                            border-2 border-[hsl(var(--heroui-secondary)/0.45)]
                            text-[hsl(var(--heroui-secondary))]
                            transition-all duration-300 ease-out
                            hover:border-transparent hover:text-white
                            hover:-translate-y-0.5 hover:scale-[1.05]
                            active:translate-y-0 active:scale-[0.97]
                        "
                        onMouseEnter={e => e.currentTarget.style.boxShadow = "0 0 24px 5px hsl(var(--heroui-secondary) / 0.4)"}
                        onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
                    >
                        <span className="absolute inset-0 bg-[hsl(var(--heroui-secondary)/0.12)] group-hover:opacity-0 transition-opacity duration-300" />
                        <span className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--heroui-secondary))] via-[hsl(var(--heroui-accent))] to-[hsl(var(--heroui-secondary))] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <span className="absolute inset-y-0 w-10 -left-10 skew-x-[-20deg] bg-white/30 group-hover:left-[110%] transition-all duration-500 ease-in-out" />
                        <span className="relative z-10">Sign up</span>
                    </Link>

                    <Link
                        href="/login"
                        className="
                            group relative text-sm font-medium inline-flex items-center
                            px-5 h-[36px] rounded-md overflow-hidden
                            border-2 border-[hsl(var(--heroui-info)/0.45)]
                            text-[hsl(var(--heroui-info))]
                            transition-all duration-300 ease-out
                            hover:border-transparent hover:text-white
                            hover:-translate-y-0.5 hover:scale-[1.05]
                            active:translate-y-0 active:scale-[0.97]
                        "
                        onMouseEnter={e => e.currentTarget.style.boxShadow = "0 0 24px 5px hsl(var(--heroui-info) / 0.38)"}
                        onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
                    >
                        <span className="absolute inset-0 bg-[hsl(var(--heroui-info)/0.10)] group-hover:opacity-0 transition-opacity duration-300" />
                        <span className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--heroui-info))] via-[hsl(var(--heroui-primary))] to-[hsl(var(--heroui-secondary))] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <span className="absolute inset-y-0 w-10 -left-10 skew-x-[-20deg] bg-white/30 group-hover:left-[110%] transition-all duration-500 ease-in-out" />
                        <span className="relative z-10">Log in</span>
                    </Link>
                </div>
            </nav>

            {/* ── Hero ───────────────────────────────────────────────────────── */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" style={{ paddingTop: "4rem", zIndex: 10 }}>
                <div
                    className="inline-flex items-center gap-2 font-mono text-sm tracking-[0.22em] uppercase mb-8 rounded-full px-4 py-1.5 backdrop-blur-sm"
                    style={{
                        border: "1px solid hsl(var(--heroui-info) / 0.25)",
                        background: "hsl(var(--heroui-info) / 0.08)",
                        color: "hsl(var(--heroui-info) / 0.75)",
                    }}
                >
                    <span
                        className="inline-block w-2 h-2 rounded-full shrink-0"
                        style={{ background: "hsl(var(--heroui-success))", boxShadow: "0 0 6px hsl(var(--heroui-success))" }}
                    />
                    Application Tracker
                </div>

                <h1 className="text-[clamp(.8rem,8vw,5.8rem)] font-sora text-heroui-heading font-extrabold mb-6 text-center leading-none tracking-[-0.03em] max-w-5xl">
                    Land your next
                    <br />
                    <span className="text-transparent bg-clip-text bg-hero-gradient">
                        dream role.
                    </span>
                </h1>

                <p className="font-sans text-center text-xl text-heroui-subheading max-w-lg leading-[1.78]">
                    Every application, follow-up, and offer — tracked in one elegant workspace built for focused job seekers.
                </p>

                <div className="flex gap-3 mt-14 flex-wrap justify-center">
                    {STATUS_PILLS.map(({ colorClass, glowClass, label }) => (
                        <div
                            key={label}
                            className="flex items-center gap-2 font-mono text-xs tracking-widest px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-heroui-subheading"
                        >
                            <span className={`inline-block w-2 h-2 rounded-full shrink-0 ${colorClass} shadow-lg ${glowClass}`} />
                            {label.toUpperCase()}
                        </div>
                    ))}
                </div>
            </div>

            {/* Vignette */}
            <div className="absolute inset-0 pointer-events-none z-5 bg-radial-gradient" />
            {/* Bottom fade */}
            <div className="absolute bottom-0 left-0 right-0 pointer-events-none z-6 bg-linear-gradient h-36" />
        </div>
    );
}