"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import * as THREE from "three";
import apiRouter from "@/api/router";

/* ═══════════════════════════════════════════
   TYPES
═══════════════════════════════════════════ */

type StepId =
    | "welcome"
    | "profile"
    | "contact"
    | "education"
    | "employment"
    | "links"
    | "done";

interface PersonalData {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    nationality: string;
    pronouns: string;
}

interface ContactData {
    email: string;
    phone: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    zip: string;
    country: string;
}

interface EducationEntry {
    id: string;
    institution: string;
    degree: string;
    field: string;
    startYear: string;
    endYear: string;
    gpa: string;
}

interface EmploymentEntry {
    id: string;
    employer: string;
    title: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
}

interface LinksData {
    linkedinUrl: string;
    githubUrl: string;
    portfolioUrl: string;
    resumeText: string;
}

interface WizardData {
    personal:   PersonalData;
    contact:    ContactData;
    education:  EducationEntry[];
    employment: EmploymentEntry[];
    links:      LinksData;
}

interface StepConfig {
    id: StepId;
    label: string;
    optional?: boolean;
}

/* ═══════════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════════ */

const STEPS: StepConfig[] = [
    { id: "welcome",    label: "Welcome"    },
    { id: "profile",    label: "Personal"   },
    { id: "contact",    label: "Contact"    },
    { id: "education",  label: "Education"  },
    { id: "employment", label: "Employment", optional: true },
    { id: "links",      label: "Links",      optional: true },
    { id: "done",       label: "Done"       },
];

const EMPTY_DATA: WizardData = {
    personal: { firstName: "", lastName: "", dateOfBirth: "", nationality: "", pronouns: "" },
    contact:  { email: "", phone: "", addressLine1: "", addressLine2: "", city: "", state: "", zip: "", country: "" },
    education:  [],
    employment: [],
    links: { linkedinUrl: "", githubUrl: "", portfolioUrl: "", resumeText: "" },
};

const newEducation = (): EducationEntry => ({
    id: crypto.randomUUID(), institution: "", degree: "", field: "",
    startYear: "", endYear: "", gpa: "",
});

const newEmployment = (): EmploymentEntry => ({
    id: crypto.randomUUID(), employer: "", title: "", startDate: "",
    endDate: "", current: false, description: "",
});

/* ═══════════════════════════════════════════
   THREE.JS BACKGROUND
═══════════════════════════════════════════ */

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

const JOB_CARDS = [
    { company: "Stripe",    role: "Eng II",          status: "success",   x: -14, y:  6, z: -6  },
    { company: "Vercel",    role: "FE Lead",          status: "info",      x:  13, y: -5, z: -3  },
    { company: "Linear",    role: "Product Eng",      status: "warning",   x:  -9, y: -9, z:  1  },
    { company: "Figma",     role: "SWE III",          status: "secondary", x:  16, y:  8, z: -7  },
    { company: "Notion",    role: "Full Stack",       status: "danger",    x:   3, y:-13, z:  3  },
    { company: "GitHub",    role: "Infra Eng",        status: "success",   x: -17, y: -1, z:  0  },
    { company: "Shopify",   role: "Senior SWE",       status: "info",      x:  10, y: 13, z: -9  },
    { company: "Railway",   role: "Infra Lead",       status: "info",      x:   8, y: -4, z:  5  },
    { company: "MIT",       role: "MS Computer Sci",  status: "success",   x: -20, y:  9, z: -4  },
    { company: "Stanford",  role: "MS CS / AI",       status: "info",      x:  20, y:  0, z: -5  },
    { company: "CMU",       role: "MSML Program",     status: "warning",   x:  -4, y: 10, z:  2  },
    { company: "Harvard",   role: "MBA",              status: "secondary", x:  -7, y:-15, z: -2  },
    { company: "Berkeley",  role: "MEng EECS",        status: "danger",    x:  18, y: -9, z: -1  },
    { company: "Columbia",  role: "MS Data Science",  status: "warning",   x: -12, y: 14, z: -3  },
    { company: "WPI",       role: "CS PhD",           status: "warning",   x:   4, y: 10, z: -3  },
] as const;

type StatusKey = "success" | "info" | "warning" | "secondary" | "danger" | "primary" | "accent";

function makeCardTexture(company: string, role: string, statusLabel: string, statusHex: string, isDark: boolean): THREE.CanvasTexture {
    const W = 420, H = 230;
    const canvas = document.createElement("canvas");
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext("2d")!;
    const bodyBg = isDark ? "#0f172a" : "#f8fafc";
    ctx.fillStyle = bodyBg;
    roundRect(ctx, 0, 0, W, H, 14); ctx.fill();
    ctx.fillStyle = statusHex;
    roundRect(ctx, 0, 0, W, 72, { tl: 14, tr: 14, bl: 0, br: 0 }); ctx.fill();
    ctx.fillStyle = "rgba(0,0,0,0.18)";
    roundRect(ctx, 0, 0, W, 72, { tl: 14, tr: 14, bl: 0, br: 0 }); ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 34px system-ui, sans-serif";
    ctx.fillText(company, 20, 48);
    const bodyTextCol = isDark ? "#e2e8f0" : "#1e293b";
    ctx.fillStyle = bodyTextCol;
    ctx.font = "bold 22px system-ui, sans-serif";
    ctx.fillText(role, 20, 108);
    ctx.strokeStyle = isDark ? "#1e293b" : "#e2e8f0";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(20, 128); ctx.lineTo(W - 20, 128); ctx.stroke();
    ctx.font = "bold 16px monospace";
    const labelText = statusLabel.toUpperCase();
    const textW = ctx.measureText(labelText).width;
    const pillW = textW + 40, pillH = 30, pillX = 18, pillY = 142;
    ctx.fillStyle = statusHex;
    roundRect(ctx, pillX, pillY, pillW, pillH, 6); ctx.fill();
    ctx.fillStyle = "rgba(0,0,0,0.20)";
    roundRect(ctx, pillX, pillY, pillW, pillH, 6); ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 16px monospace";
    ctx.fillText(labelText, pillX + 20, pillY + pillH / 2 + 6);
    ctx.strokeStyle = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.10)";
    ctx.lineWidth = 1;
    roundRect(ctx, 0.5, 0.5, W - 1, H - 1, 14); ctx.stroke();
    return new THREE.CanvasTexture(canvas);
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number | { tl: number; tr: number; bl: number; br: number }) {
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
    success: "Offer", info: "Interview", warning: "Applied",
    secondary: "Saved", danger: "Rejected", primary: "Applied", accent: "Saved",
};

function useThreeBackground(mountRef: React.RefObject<HTMLDivElement>) {
    useEffect(() => {
        document.body.style.overflow = "hidden";
        if (!mountRef.current) return;
        const mount = mountRef.current;
        let width = mount.clientWidth;
        let height = mount.clientHeight;
        let { css, three } = getThemeColors();

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(width, height);
        renderer.setClearColor(0x000000, 0);
        Object.assign(renderer.domElement.style, { position: "absolute", inset: "0", width: "100%", height: "100%", zIndex: "0", pointerEvents: "none" });
        mount.appendChild(renderer.domElement);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(52, width / height, 0.1, 300);
        camera.position.set(0, 0, 32);
        scene.fog = new THREE.FogExp2(three.bg, 0.022);

        scene.add(new THREE.AmbientLight(0xffffff, 0.4));
        const keyLight = new THREE.PointLight(three.info, 4, 70);
        keyLight.position.set(-16, 14, 14);
        scene.add(keyLight);
        const fillLight = new THREE.PointLight(three.secondary, 3, 70);
        fillLight.position.set(16, -10, 10);
        scene.add(fillLight);

        interface CardMesh extends THREE.Mesh {
            userData: { vx: number; vy: number; vz: number; rx: number; ry: number; baseX: number; baseY: number; statusKey: StatusKey };
        }

        const cardMeshes: CardMesh[] = [];
        const cardGeo = new THREE.PlaneGeometry(5.8, 3.3);

        JOB_CARDS.forEach((d) => {
            const statusKey = d.status as StatusKey;
            const statusHex = css[statusKey] ?? "#6366f1";
            const isDark = document.documentElement.classList.contains("dark");
            const tex = makeCardTexture(d.company, d.role, STATUS_LABELS[statusKey], statusHex, isDark);
            const mat = new THREE.MeshStandardMaterial({ map: tex, transparent: true, opacity: 0.82, roughness: 0.15, metalness: 0.4, side: THREE.DoubleSide });
            const mesh = new THREE.Mesh(cardGeo, mat) as CardMesh;
            mesh.position.set(d.x, d.y, d.z);
            mesh.rotation.set((Math.random() - 0.5) * 0.3, (Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 0.15);
            mesh.userData = { vx: (Math.random() - 0.5) * 0.005, vy: (Math.random() - 0.5) * 0.004, vz: (Math.random() - 0.5) * 0.003, rx: (Math.random() - 0.5) * 0.0008, ry: (Math.random() - 0.5) * 0.001, baseX: d.x, baseY: d.y, statusKey };
            const edgeGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(5.8, 3.3, 0.01));
            const edgeMat = new THREE.LineBasicMaterial({ color: three[statusKey] ?? three.primary, transparent: true, opacity: 0.55 });
            mesh.add(new THREE.LineSegments(edgeGeo, edgeMat));
            scene.add(mesh);
            cardMeshes.push(mesh);
        });

        const lineGroup = new THREE.Group();
        scene.add(lineGroup);

        const buildLines = () => {
            lineGroup.clear();
            for (let i = 0; i < cardMeshes.length; i++) {
                for (let j = i + 1; j < cardMeshes.length; j++) {
                    const a = cardMeshes[i].position, b = cardMeshes[j].position;
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

        const columnColors: StatusKey[] = ["info", "warning", "success", "danger", "secondary"];
        columnColors.forEach((key, i) => {
            const x = (i - 2) * 11;
            const geo = new THREE.PlaneGeometry(7, 28);
            const mat = new THREE.MeshBasicMaterial({ color: three[key], transparent: true, opacity: 0.03, side: THREE.DoubleSide });
            const plane = new THREE.Mesh(geo, mat);
            plane.position.set(x, 0, -18);
            scene.add(plane);
            const lineGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x - 3.5, 14, -17.8), new THREE.Vector3(x + 3.5, 14, -17.8)]);
            const lineMat = new THREE.LineBasicMaterial({ color: three[key], transparent: true, opacity: 0.4 });
            scene.add(new THREE.Line(lineGeo, lineMat));
        });

        const dotKeys: StatusKey[] = ["success", "info", "warning", "danger", "secondary"];
        const dots: THREE.Mesh[] = [];
        for (let i = 0; i < 30; i++) {
            const key = dotKeys[i % dotKeys.length];
            const dot = new THREE.Mesh(
                new THREE.SphereGeometry(0.1 + Math.random() * 0.12, 10, 10),
                new THREE.MeshStandardMaterial({ color: three[key], emissive: three[key], emissiveIntensity: 1.2, roughness: 0 }),
            );
            dot.position.set((Math.random() - 0.5) * 52, (Math.random() - 0.5) * 36, (Math.random() - 0.5) * 18);
            (dot as any).userData = { vy: (Math.random() - 0.5) * 0.008, vx: (Math.random() - 0.5) * 0.006, pulse: Math.random() * Math.PI * 2, key };
            dots.push(dot);
            scene.add(dot);
        }

        const arcMat = new THREE.MeshBasicMaterial({ color: three.success, transparent: true, opacity: 0.15 });
        const arc = new THREE.Mesh(new THREE.TorusGeometry(16, 0.035, 8, 100, Math.PI * 1.4), arcMat);
        arc.rotation.z = -Math.PI / 2; arc.position.z = -14;
        scene.add(arc);

        const arcMat2 = new THREE.MeshBasicMaterial({ color: three.info, transparent: true, opacity: 0.1 });
        const arc2 = new THREE.Mesh(new THREE.TorusGeometry(22, 0.025, 8, 120, Math.PI * 0.8), arcMat2);
        arc2.rotation.z = Math.PI * 0.6; arc2.position.z = -18;
        scene.add(arc2);

        const applyTheme = () => {
            const t = getThemeColors();
            css = t.css; three = t.three;
            keyLight.color.setHex(three.info);
            fillLight.color.setHex(three.secondary);
            (scene.fog as THREE.FogExp2).color.setHex(three.bg);
            const nowDark = document.documentElement.classList.contains("dark");
            cardMeshes.forEach((card, i) => {
                const d = JOB_CARDS[i];
                const statusKey = d.status as StatusKey;
                const statusHex = t.css[statusKey] ?? "#6366f1";
                const mat = card.material as THREE.MeshStandardMaterial;
                if (mat.map) mat.map.dispose();
                mat.map = makeCardTexture(d.company, d.role, STATUS_LABELS[statusKey], statusHex, nowDark);
                mat.map.needsUpdate = true; mat.needsUpdate = true;
                const edge = card.children[0] as THREE.LineSegments;
                (edge.material as THREE.LineBasicMaterial).color.setHex(t.three[statusKey] ?? t.three.primary);
            });
        };
        const observer = new MutationObserver(applyTheme);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

        const mouse = { x: 0, y: 0 };
        const onMouseMove = (e: MouseEvent) => { mouse.x = (e.clientX / window.innerWidth - 0.5) * 2; mouse.y = -(e.clientY / window.innerHeight - 0.5) * 2; };
        window.addEventListener("mousemove", onMouseMove);

        const onResize = () => { width = mount.clientWidth; height = mount.clientHeight; renderer.setSize(width, height); camera.aspect = width / height; camera.updateProjectionMatrix(); };
        window.addEventListener("resize", onResize);

        let frameId: number;
        const clock = new THREE.Clock();
        let lineTimer = 0;

        const animate = () => {
            frameId = requestAnimationFrame(animate);
            const t = clock.getElapsedTime();
            camera.position.x += (mouse.x * 3.5 - camera.position.x) * 0.03;
            camera.position.y += (mouse.y * 2 - camera.position.y) * 0.03;
            camera.lookAt(scene.position);
            cardMeshes.forEach((c, i) => {
                const d = c.userData;
                c.position.x += d.vx; c.position.y += d.vy + Math.sin(t * 0.4 + i) * 0.002; c.position.z += d.vz;
                c.rotation.x += d.rx; c.rotation.y += d.ry;
                if (Math.abs(c.position.x) > 28) d.vx *= -1;
                if (Math.abs(c.position.y) > 20) d.vy *= -1;
                if (Math.abs(c.position.z) > 14) d.vz *= -1;
            });
            lineTimer += 0.016;
            if (lineTimer > 0.5) { buildLines(); lineTimer = 0; }
            dots.forEach((dot) => {
                const d = (dot as any).userData;
                dot.position.x += d.vx; dot.position.y += d.vy;
                if (Math.abs(dot.position.x) > 28) d.vx *= -1;
                if (Math.abs(dot.position.y) > 20) d.vy *= -1;
                (dot.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.7 + 0.6 * Math.sin(t * 2.5 + d.pulse);
            });
            arc.rotation.z = -Math.PI / 2 + t * 0.06;
            arc2.rotation.z = Math.PI * 0.6 - t * 0.035;
            keyLight.position.x = Math.sin(t * 0.38) * 22; keyLight.position.y = Math.cos(t * 0.28) * 14;
            fillLight.position.x = Math.cos(t * 0.33) * 20; fillLight.position.y = Math.sin(t * 0.25) * 12;
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
}

/* ═══════════════════════════════════════════
   SHARED FORM PRIMITIVES
═══════════════════════════════════════════ */

function Label({ children }: { children: React.ReactNode }) {
    return <label className="font-mono text-[0.61rem] tracking-[0.18em] uppercase" style={{ color: "hsl(var(--heroui-muted) / 0.55)" }}>{children}</label>;
}

function Hint({ children }: { children: React.ReactNode }) {
    return <p className="text-xs mt-0.5 mb-0" style={{ color: "hsl(var(--heroui-subheading) / 0.40)" }}>{children}</p>;
}

function Field({ label, hint, children, half }: { label: string; hint?: string; children: React.ReactNode; half?: boolean }) {
    return (
        <div className={`flex flex-col gap-1 ${half ? "w-[calc(50%-0.5rem)]" : "w-full"}`}>
            <Label>{label}</Label>
            {children}
            {hint && <Hint>{hint}</Hint>}
        </div>
    );
}

function inputStyle(focused: boolean) {
    return {
        color:       "hsl(var(--heroui-foreground))",
        background:  focused ? "hsl(var(--heroui-info) / 0.07)" : "hsl(var(--heroui-foreground) / 0.04)",
        borderColor: focused ? "hsl(var(--heroui-info) / 0.50)" : "hsl(var(--heroui-foreground) / 0.10)",
        boxShadow:   focused ? "0 0 18px hsl(var(--heroui-info) / 0.12)" : "none",
    };
}

function SI({ value, onChange, placeholder, type = "text" }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
    const [f, setF] = useState(false);
    return <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} onFocus={() => setF(true)} onBlur={() => setF(false)} className="w-full font-sans text-sm rounded-[7px] px-3.5 py-2.5 outline-none backdrop-blur-sm transition-all duration-200 border" style={inputStyle(f)} />;
}

function SS({ value, onChange, options, placeholder }: { value: string; onChange: (v: string) => void; options: string[]; placeholder?: string }) {
    const [f, setF] = useState(false);
    return <select value={value} onChange={(e) => onChange(e.target.value)} onFocus={() => setF(true)} onBlur={() => setF(false)} className="w-full font-sans text-sm rounded-[7px] px-3.5 py-2.5 outline-none transition-all duration-200 border appearance-none cursor-pointer" style={inputStyle(f)}>{placeholder && <option value="" disabled>{placeholder}</option>}{options.map((o) => <option key={o} value={o}>{o}</option>)}</select>;
}

function STA({ value, onChange, placeholder, rows = 3 }: { value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
    const [f, setF] = useState(false);
    return <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={rows} onFocus={() => setF(true)} onBlur={() => setF(false)} className="w-full font-sans text-sm rounded-[7px] px-3.5 py-2.5 outline-none backdrop-blur-sm transition-all duration-200 border resize-none" style={inputStyle(f)} />;
}

function Divider() {
    return <div className="h-px" style={{ background: "hsl(var(--heroui-foreground) / 0.055)" }} />;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
    return <h3 className="font-sora font-bold text-sm m-0" style={{ color: "hsl(var(--heroui-info) / 0.80)" }}>{children}</h3>;
}

function AddBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
    return (
        <button onClick={onClick} className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-200 border"
                style={{ color: "hsl(var(--heroui-info) / 0.75)", borderColor: "hsl(var(--heroui-info) / 0.20)", background: "hsl(var(--heroui-info) / 0.06)" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "hsl(var(--heroui-info) / 0.12)"; e.currentTarget.style.borderColor = "hsl(var(--heroui-info) / 0.35)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "hsl(var(--heroui-info) / 0.06)"; e.currentTarget.style.borderColor = "hsl(var(--heroui-info) / 0.20)"; }}
        >
            <span className="text-base leading-none">+</span> {children}
        </button>
    );
}

function RemoveBtn({ onClick }: { onClick: () => void }) {
    return (
        <button onClick={onClick} className="text-xs px-2 py-1 rounded transition-all duration-150"
                style={{ color: "hsl(var(--heroui-danger) / 0.60)", background: "hsl(var(--heroui-danger) / 0.06)" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "hsl(var(--heroui-danger) / 0.14)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "hsl(var(--heroui-danger) / 0.06)"; }}
        >Remove</button>
    );
}

/* ═══════════════════════════════════════════
   PROGRESS BAR
═══════════════════════════════════════════ */

function ProgressBar({ current }: { current: number }) {
    return (
        <div className="flex items-start justify-between mb-6 overflow-x-auto pb-1">
            {STEPS.map((step, i) => {
                const isPast = i < current, isCurrent = i === current;
                return (
                    <React.Fragment key={step.id}>
                        <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                            <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold border-2 transition-all duration-300"
                                 style={{ background: isPast ? "hsl(var(--heroui-primary))" : isCurrent ? "hsl(var(--heroui-info) / 0.12)" : "hsl(var(--heroui-foreground) / 0.04)", borderColor: isPast || isCurrent ? "hsl(var(--heroui-info))" : "hsl(var(--heroui-foreground) / 0.12)", color: isPast ? "#fff" : isCurrent ? "hsl(var(--heroui-info))" : "hsl(var(--heroui-foreground) / 0.35)", boxShadow: isCurrent ? "0 0 14px hsl(var(--heroui-info) / 0.30)" : "none" }}>
                                {isPast ? <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none"><path d="M3 8l3.5 3.5L13 5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg> : i + 1}
                            </div>
                            <span className="font-mono text-[0.5rem] tracking-[0.12em] uppercase hidden sm:block text-center"
                                  style={{ color: isCurrent ? "hsl(var(--heroui-info) / 0.75)" : "hsl(var(--heroui-foreground) / 0.28)" }}>
                                {step.label}{step.optional && <span className="opacity-40"> opt</span>}
                            </span>
                        </div>
                        {i < STEPS.length - 1 && (
                            <div className="flex-1 h-px mx-1.5 mt-3.5 overflow-hidden" style={{ background: "hsl(var(--heroui-foreground) / 0.08)" }}>
                                <div className="h-full transition-all duration-500" style={{ width: i < current ? "100%" : "0%", background: "hsl(var(--heroui-info))" }} />
                            </div>
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
}

/* ═══════════════════════════════════════════
   NAV BUTTONS
═══════════════════════════════════════════ */

function PrimaryBtn({ onClick, disabled, children, wide }: { onClick: () => void; disabled?: boolean; children: React.ReactNode; wide?: boolean }) {
    return (
        <button onClick={onClick} disabled={disabled}
                className={`font-sora font-bold text-[0.88rem] tracking-[0.06em] px-6 py-2.5 rounded-lg cursor-pointer backdrop-blur-sm transition-all duration-200 hover:-translate-y-px active:translate-y-0 disabled:opacity-40 disabled:cursor-not-allowed ${wide ? "w-full" : ""}`}
                style={{ color: "hsl(var(--heroui-foreground))", background: "linear-gradient(135deg, hsl(var(--heroui-info) / 0.16) 0%, hsl(var(--heroui-secondary) / 0.16) 100%)", border: "1px solid hsl(var(--heroui-info) / 0.28)" }}
                onMouseEnter={(e) => { if (!disabled) { e.currentTarget.style.background = "linear-gradient(135deg, hsl(var(--heroui-info) / 0.26) 0%, hsl(var(--heroui-secondary) / 0.26) 100%)"; e.currentTarget.style.boxShadow = "0 0 36px hsl(var(--heroui-info) / 0.18)"; }}}
                onMouseLeave={(e) => { e.currentTarget.style.background = "linear-gradient(135deg, hsl(var(--heroui-info) / 0.16) 0%, hsl(var(--heroui-secondary) / 0.16) 100%)"; e.currentTarget.style.boxShadow = "none"; }}
        >{children}</button>
    );
}

function NavButtons({ onBack, onNext, onSkip, isOptional, isLoading, nextDisabled, nextLabel }: {
    onBack?: () => void; onNext: () => void; onSkip?: () => void;
    isOptional?: boolean; isLoading?: boolean; nextDisabled?: boolean; nextLabel?: string;
}) {
    return (
        <div className="flex items-center justify-between pt-5 mt-5" style={{ borderTop: "1px solid hsl(var(--heroui-foreground) / 0.055)" }}>
            <div>
                {onBack && (
                    <button onClick={onBack} className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border"
                            style={{ color: "hsl(var(--heroui-foreground) / 0.50)", borderColor: "hsl(var(--heroui-foreground) / 0.10)", background: "transparent" }}
                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "hsl(var(--heroui-info) / 0.40)"; e.currentTarget.style.color = "hsl(var(--heroui-info))"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "hsl(var(--heroui-foreground) / 0.10)"; e.currentTarget.style.color = "hsl(var(--heroui-foreground) / 0.50)"; }}
                    >← Back</button>
                )}
            </div>
            <div className="flex items-center gap-3">
                {isOptional && onSkip && (
                    <button onClick={onSkip} className="px-3 py-2 text-sm font-medium transition-colors duration-200"
                            style={{ color: "hsl(var(--heroui-foreground) / 0.35)" }}
                            onMouseEnter={(e) => { e.currentTarget.style.color = "hsl(var(--heroui-foreground) / 0.65)"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.color = "hsl(var(--heroui-foreground) / 0.35)"; }}
                    >Skip →</button>
                )}
                <PrimaryBtn onClick={onNext} disabled={nextDisabled || isLoading}>
                    {isLoading ? "Saving…" : nextLabel ?? "Continue →"}
                </PrimaryBtn>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════
   STEP: WELCOME
═══════════════════════════════════════════ */

function StepWelcome({ onNext }: { onNext: () => void }) {
    return (
        <div className="flex flex-col items-center text-center gap-6 py-2">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl" style={{ background: "hsl(var(--heroui-info) / 0.10)" }}>🗂️</div>
            <div>
                <h2 className="font-sora font-extrabold text-[1.8rem] tracking-[-0.025em] leading-tight m-0" style={{ color: "hsl(var(--heroui-heading))" }}>
                    Welcome to{" "}
                    <span style={{ background: "linear-gradient(90deg, hsl(var(--heroui-info)) 0%, hsl(var(--heroui-primary)) 50%, hsl(var(--heroui-secondary)) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                        ApplyOS
                    </span>
                </h2>
                <p className="font-sans text-[0.83rem] mt-2 mb-0" style={{ color: "hsl(var(--heroui-subheading) / 0.55)" }}>
                    Track every application — jobs, grad school, fellowships, internships — all in one place. Let's build your profile so we can autofill applications for you.
                </p>
            </div>
            <div className="grid grid-cols-2 gap-3 w-full text-left">
                {[
                    { icon: "💼", label: "Jobs & Internships" },
                    { icon: "🎓", label: "Grad School & PhDs" },
                    { icon: "🏆", label: "Fellowships & Grants" },
                    { icon: "⚡", label: "Autofill Applications" },
                ].map(({ icon, label }) => (
                    <div key={label} className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm" style={{ background: "hsl(var(--heroui-foreground) / 0.03)", border: "1px solid hsl(var(--heroui-foreground) / 0.07)", color: "hsl(var(--heroui-foreground) / 0.70)" }}>
                        <span className="text-base">{icon}</span> {label}
                    </div>
                ))}
            </div>
            <PrimaryBtn onClick={onNext} wide>Let's get started →</PrimaryBtn>
        </div>
    );
}

/* ═══════════════════════════════════════════
   STEP: PERSONAL INFO
═══════════════════════════════════════════ */

function StepPersonal({ data, onChange, onNext, onBack }: { data: PersonalData; onChange: (d: PersonalData) => void; onNext: () => void; onBack: () => void }) {
    const isValid = data.firstName.trim().length > 0 && data.lastName.trim().length > 0;
    const s = (k: keyof PersonalData) => (v: string) => onChange({ ...data, [k]: v });
    return (
        <div className="flex flex-col gap-4">
            <div>
                <h2 className="font-sora font-extrabold text-[1.4rem] tracking-tight m-0" style={{ color: "hsl(var(--heroui-heading))" }}>Personal Info</h2>
                <p className="font-sans text-[0.83rem] mt-1 mb-0" style={{ color: "hsl(var(--heroui-subheading) / 0.55)" }}>Used to autofill your name and identity fields on applications.</p>
            </div>
            <div className="flex gap-4">
                <Field label="First Name *" half><SI value={data.firstName} onChange={s("firstName")} placeholder="Jane" /></Field>
                <Field label="Last Name *" half><SI value={data.lastName} onChange={s("lastName")} placeholder="Smith" /></Field>
            </div>
            <Field label="Date of Birth" hint="Used for applications that require it"><SI type="date" value={data.dateOfBirth} onChange={s("dateOfBirth")} /></Field>
            <div className="flex gap-4">
                <Field label="Nationality" half><SI value={data.nationality} onChange={s("nationality")} placeholder="e.g. American" /></Field>
                <Field label="Pronouns" half><SS value={data.pronouns} onChange={s("pronouns")} options={["He/Him", "She/Her", "They/Them", "Prefer not to say"]} placeholder="Select…" /></Field>
            </div>
            <NavButtons onBack={onBack} onNext={onNext} nextDisabled={!isValid} />
        </div>
    );
}

/* ═══════════════════════════════════════════
   STEP: CONTACT & ADDRESS
═══════════════════════════════════════════ */

function StepContact({ data, onChange, onNext, onBack }: { data: ContactData; onChange: (d: ContactData) => void; onNext: () => void; onBack: () => void }) {
    const isValid = data.email.trim().length > 0;
    const s = (k: keyof ContactData) => (v: string) => onChange({ ...data, [k]: v });
    return (
        <div className="flex flex-col gap-4">
            <div>
                <h2 className="font-sora font-extrabold text-[1.4rem] tracking-tight m-0" style={{ color: "hsl(var(--heroui-heading))" }}>Contact & Address</h2>
                <p className="font-sans text-[0.83rem] mt-1 mb-0" style={{ color: "hsl(var(--heroui-subheading) / 0.55)" }}>Your primary contact details and mailing address for applications.</p>
            </div>
            <SectionTitle>Contact</SectionTitle>
            <Field label="Email Address *"><SI type="email" value={data.email} onChange={s("email")} placeholder="jane@email.com" /></Field>
            <Field label="Phone Number"><SI type="tel" value={data.phone} onChange={s("phone")} placeholder="+1 (555) 000-0000" /></Field>
            <Divider />
            <SectionTitle>Mailing Address</SectionTitle>
            <Field label="Address Line 1"><SI value={data.addressLine1} onChange={s("addressLine1")} placeholder="123 Main St" /></Field>
            <Field label="Address Line 2"><SI value={data.addressLine2} onChange={s("addressLine2")} placeholder="Apt 4B (optional)" /></Field>
            <div className="flex gap-4">
                <Field label="City" half><SI value={data.city} onChange={s("city")} placeholder="New York" /></Field>
                <Field label="State / Province" half><SI value={data.state} onChange={s("state")} placeholder="NY" /></Field>
            </div>
            <div className="flex gap-4">
                <Field label="ZIP / Postal Code" half><SI value={data.zip} onChange={s("zip")} placeholder="10001" /></Field>
                <Field label="Country" half><SI value={data.country} onChange={s("country")} placeholder="United States" /></Field>
            </div>
            <NavButtons onBack={onBack} onNext={onNext} nextDisabled={!isValid} />
        </div>
    );
}

/* ═══════════════════════════════════════════
   STEP: EDUCATION
═══════════════════════════════════════════ */

const DEGREE_OPTIONS = ["High School Diploma", "Associate's", "Bachelor's", "Master's", "MBA", "PhD", "JD", "MD", "Certificate", "Other"];

function StepEducation({ data, onChange, onNext, onBack }: { data: EducationEntry[]; onChange: (d: EducationEntry[]) => void; onNext: () => void; onBack: () => void }) {
    const add = () => onChange([...data, newEducation()]);
    const remove = (id: string) => onChange(data.filter((e) => e.id !== id));
    const update = (id: string, field: keyof EducationEntry, value: string) =>
        onChange(data.map((e) => e.id === id ? { ...e, [field]: value } : e));
    return (
        <div className="flex flex-col gap-4">
            <div>
                <h2 className="font-sora font-extrabold text-[1.4rem] tracking-tight m-0" style={{ color: "hsl(var(--heroui-heading))" }}>Education</h2>
                <p className="font-sans text-[0.83rem] mt-1 mb-0" style={{ color: "hsl(var(--heroui-subheading) / 0.55)" }}>Add your academic history. Required for grad school and most job applications.</p>
            </div>
            {data.length === 0 && (
                <div className="rounded-lg px-4 py-6 text-center text-sm" style={{ background: "hsl(var(--heroui-foreground) / 0.03)", border: "1px dashed hsl(var(--heroui-foreground) / 0.12)", color: "hsl(var(--heroui-foreground) / 0.40)" }}>
                    No education added yet. Add at least one entry.
                </div>
            )}
            {data.map((entry, idx) => (
                <div key={entry.id} className="rounded-xl p-4 flex flex-col gap-3" style={{ background: "hsl(var(--heroui-foreground) / 0.03)", border: "1px solid hsl(var(--heroui-foreground) / 0.08)" }}>
                    <div className="flex items-center justify-between">
                        <SectionTitle>Education #{idx + 1}</SectionTitle>
                        <RemoveBtn onClick={() => remove(entry.id)} />
                    </div>
                    <Field label="Institution"><SI value={entry.institution} onChange={(v) => update(entry.id, "institution", v)} placeholder="e.g. MIT, Stanford, Community College" /></Field>
                    <div className="flex gap-4">
                        <Field label="Degree" half><SS value={entry.degree} onChange={(v) => update(entry.id, "degree", v)} options={DEGREE_OPTIONS} placeholder="Select…" /></Field>
                        <Field label="Field of Study" half><SI value={entry.field} onChange={(v) => update(entry.id, "field", v)} placeholder="e.g. Computer Science" /></Field>
                    </div>
                    <div className="flex gap-4">
                        <Field label="Start Year" half><SI value={entry.startYear} onChange={(v) => update(entry.id, "startYear", v)} placeholder="2020" /></Field>
                        <Field label="End Year (or Expected)" half><SI value={entry.endYear} onChange={(v) => update(entry.id, "endYear", v)} placeholder="2024" /></Field>
                    </div>
                    <Field label="GPA" hint="Optional — only include if strong"><SI value={entry.gpa} onChange={(v) => update(entry.id, "gpa", v)} placeholder="e.g. 3.8 / 4.0" /></Field>
                </div>
            ))}
            <AddBtn onClick={add}>Add Education</AddBtn>
            <NavButtons onBack={onBack} onNext={onNext} nextDisabled={data.length === 0} />
        </div>
    );
}

/* ═══════════════════════════════════════════
   STEP: EMPLOYMENT (optional)
═══════════════════════════════════════════ */

function StepEmployment({ data, onChange, onNext, onBack, onSkip }: { data: EmploymentEntry[]; onChange: (d: EmploymentEntry[]) => void; onNext: () => void; onBack: () => void; onSkip: () => void }) {
    const add = () => onChange([...data, newEmployment()]);
    const remove = (id: string) => onChange(data.filter((e) => e.id !== id));
    const update = (id: string, field: keyof EmploymentEntry, value: string | boolean) =>
        onChange(data.map((e) => e.id === id ? { ...e, [field]: value } : e));
    return (
        <div className="flex flex-col gap-4">
            <div>
                <h2 className="font-sora font-extrabold text-[1.4rem] tracking-tight m-0" style={{ color: "hsl(var(--heroui-heading))" }}>Work Experience</h2>
                <p className="font-sans text-[0.83rem] mt-1 mb-0" style={{ color: "hsl(var(--heroui-subheading) / 0.55)" }}>Your employment history for job applications. Skip this if you're only applying to graduate programs.</p>
            </div>
            <div className="rounded-lg px-3.5 py-2.5 text-xs" style={{ background: "hsl(var(--heroui-warning) / 0.06)", border: "1px solid hsl(var(--heroui-warning) / 0.18)", color: "hsl(var(--heroui-warning) / 0.80)" }}>
                💡 Skip this step if you're applying primarily to academic programs — you can always add it later.
            </div>
            {data.length === 0 && (
                <div className="rounded-lg px-4 py-6 text-center text-sm" style={{ background: "hsl(var(--heroui-foreground) / 0.03)", border: "1px dashed hsl(var(--heroui-foreground) / 0.12)", color: "hsl(var(--heroui-foreground) / 0.40)" }}>
                    No work experience added yet.
                </div>
            )}
            {data.map((entry, idx) => (
                <div key={entry.id} className="rounded-xl p-4 flex flex-col gap-3" style={{ background: "hsl(var(--heroui-foreground) / 0.03)", border: "1px solid hsl(var(--heroui-foreground) / 0.08)" }}>
                    <div className="flex items-center justify-between">
                        <SectionTitle>Position #{idx + 1}</SectionTitle>
                        <RemoveBtn onClick={() => remove(entry.id)} />
                    </div>
                    <div className="flex gap-4">
                        <Field label="Employer" half><SI value={entry.employer} onChange={(v) => update(entry.id, "employer", v)} placeholder="e.g. Google, Startup Inc." /></Field>
                        <Field label="Job Title" half><SI value={entry.title} onChange={(v) => update(entry.id, "title", v)} placeholder="e.g. Software Engineer" /></Field>
                    </div>
                    <div className="flex gap-4">
                        <Field label="Start Date" half><SI type="month" value={entry.startDate} onChange={(v) => update(entry.id, "startDate", v)} /></Field>
                        <Field label="End Date" hint={entry.current ? "Currently working here" : undefined} half>
                            {entry.current
                                ? <div className="w-full rounded-[7px] px-3.5 py-2.5 text-sm" style={{ background: "hsl(var(--heroui-foreground) / 0.03)", border: "1px solid hsl(var(--heroui-foreground) / 0.10)", color: "hsl(var(--heroui-foreground) / 0.35)" }}>Present</div>
                                : <SI type="month" value={entry.endDate} onChange={(v) => update(entry.id, "endDate", v)} />}
                        </Field>
                    </div>
                    <label className="flex items-center gap-2 text-xs cursor-pointer" style={{ color: "hsl(var(--heroui-foreground) / 0.60)" }}>
                        <input type="checkbox" checked={entry.current} onChange={(e) => update(entry.id, "current", e.target.checked)} className="rounded" />
                        I currently work here
                    </label>
                    <Field label="Description" hint="Brief summary of responsibilities / achievements">
                        <STA value={entry.description} onChange={(v) => update(entry.id, "description", v)} placeholder="Led a team of 3 engineers, built X feature, improved Y by Z%…" rows={3} />
                    </Field>
                </div>
            ))}
            <AddBtn onClick={add}>Add Position</AddBtn>
            <NavButtons onBack={onBack} onNext={onNext} onSkip={onSkip} isOptional />
        </div>
    );
}

/* ═══════════════════════════════════════════
   STEP: LINKS & DOCUMENTS (optional)
═══════════════════════════════════════════ */

function StepLinks({ data, onChange, onNext, onBack, onSkip }: { data: LinksData; onChange: (d: LinksData) => void; onNext: () => void; onBack: () => void; onSkip: () => void }) {
    const s = (k: keyof LinksData) => (v: string) => onChange({ ...data, [k]: v });
    return (
        <div className="flex flex-col gap-4">
            <div>
                <h2 className="font-sora font-extrabold text-[1.4rem] tracking-tight m-0" style={{ color: "hsl(var(--heroui-heading))" }}>Links & Documents</h2>
                <p className="font-sans text-[0.83rem] mt-1 mb-0" style={{ color: "hsl(var(--heroui-subheading) / 0.55)" }}>Your online presence and documents. We'll use these to autofill relevant fields.</p>
            </div>
            <SectionTitle>Professional Links</SectionTitle>
            <Field label="LinkedIn URL"><SI type="url" value={data.linkedinUrl} onChange={s("linkedinUrl")} placeholder="https://linkedin.com/in/yourname" /></Field>
            <Field label="GitHub URL"><SI type="url" value={data.githubUrl} onChange={s("githubUrl")} placeholder="https://github.com/yourname" /></Field>
            <Field label="Portfolio / Personal Site"><SI type="url" value={data.portfolioUrl} onChange={s("portfolioUrl")} placeholder="https://yoursite.com" /></Field>
            <Divider />
            <SectionTitle>Resume / CV Summary</SectionTitle>
            <div className="rounded-lg px-3.5 py-2.5 text-xs" style={{ background: "hsl(var(--heroui-info) / 0.06)", border: "1px solid hsl(var(--heroui-info) / 0.14)", color: "hsl(var(--heroui-info) / 0.70)" }}>
                💡 Paste your resume or a short bio. We'll use this to help autofill essay prompts and summaries.
            </div>
            <Field label="Resume Text / Bio" hint="Plain text — no formatting needed">
                <STA value={data.resumeText} onChange={s("resumeText")} placeholder="Paste your resume or a short professional bio here…" rows={5} />
            </Field>
            <NavButtons onBack={onBack} onNext={onNext} onSkip={onSkip} isOptional />
        </div>
    );
}

/* ═══════════════════════════════════════════
   STEP: DONE
═══════════════════════════════════════════ */

function StepDone({ onFinish, isLoading }: { onFinish: () => void; isLoading: boolean }) {
    return (
        <div className="flex flex-col items-center text-center gap-6 py-2">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl animate-bounce" style={{ background: "hsl(var(--heroui-success) / 0.12)" }}>🎉</div>
            <div>
                <h2 className="font-sora font-extrabold text-[1.8rem] tracking-[-0.025em] leading-tight m-0" style={{ color: "hsl(var(--heroui-heading))" }}>You're all set!</h2>
                <p className="font-sans text-[0.83rem] mt-2 mb-0" style={{ color: "hsl(var(--heroui-subheading) / 0.55)" }}>
                    Your profile is saved. Head to your dashboard to start tracking applications — jobs, grad school, fellowships, and more.
                </p>
            </div>
            <div className="grid grid-cols-3 gap-2 w-full text-xs text-center">
                {[{ icon: "✅", label: "Profile saved" }, { icon: "⚡", label: "Autofill ready" }, { icon: "🗂️", label: "Track anything" }].map(({ icon, label }) => (
                    <div key={label} className="rounded-lg py-2.5 px-2" style={{ background: "hsl(var(--heroui-success) / 0.06)", border: "1px solid hsl(var(--heroui-success) / 0.14)", color: "hsl(var(--heroui-success) / 0.80)" }}>
                        <div className="text-lg mb-0.5">{icon}</div>{label}
                    </div>
                ))}
            </div>
            <PrimaryBtn onClick={onFinish} disabled={isLoading} wide>{isLoading ? "Saving…" : "Go to Dashboard →"}</PrimaryBtn>
        </div>
    );
}

/* ═══════════════════════════════════════════
   MAIN WIZARD
═══════════════════════════════════════════ */

export default function OnboardingWizard() {
    const router   = useRouter();
    const mountRef = useRef<HTMLDivElement>(null);
    const [stepIndex, setStepIndex] = useState(0);
    const [data, setData]           = useState<WizardData>(EMPTY_DATA);
    const [isSaving, setIsSaving]   = useState(false);
    const [error, setError]         = useState<string | null>(null);

    useThreeBackground(mountRef as React.RefObject<HTMLDivElement>);

    // ── Prefill from current user session ─────────────────────────────────────
    const { data: currentUser } = useQuery({
        queryKey: ["currentUser"],
        queryFn:  () => apiRouter.sessions.showUser(),
    });

    useEffect(() => {
        if (!currentUser?.user) return;
        setData((d) => ({
            ...d,
            personal: {
                ...d.personal,
                firstName: currentUser.user.first_name ?? "",
                lastName:  currentUser.user.last_name  ?? "",
            },
            contact: {
                ...d.contact,
                email: currentUser.user.email_address ?? "",
            },
        }));
    }, [currentUser]);

    // ── Navigation ─────────────────────────────────────────────────────────────
    const goBack   = () => setStepIndex((i) => Math.max(i - 1, 0));
    const skipNext = () => setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));

    const saveAndNext = async () => {
        setError(null);
        setIsSaving(true);
        try {
            const result = await apiRouter.profile.updateProfile(data);

            // Replace local UUIDs with real DB ids so they don't get re-posted
            if (result?.savedEducations?.length) {
                setData((d) => ({
                    ...d,
                    education: d.education.map((edu) => {
                        const saved = result.savedEducations.find((s: any) => s.localId === edu.id)
                        return saved ? { ...edu, id: saved.dbId } : edu
                    }),
                }))
            }

            if (result?.savedEmployments?.length) {
                setData((d) => ({
                    ...d,
                    employment: d.employment.map((job) => {
                        const saved = result.savedEmployments.find((s: any) => s.localId === job.id)
                        return saved ? { ...job, id: saved.dbId } : job
                    }),
                }))
            }

            setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
        } catch (err) {
            setError("Failed to save. Please try again.");
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    const finish = async () => {
        setError(null);
        setIsSaving(true);
        try {
            await apiRouter.profile.updateProfile(data);
            router.push("/dashboard");
        } catch (err) {
            setError("Failed to save. Please try again.");
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    const currentId = STEPS[stepIndex].id;

    return (
        <div ref={mountRef} className="h-screen w-screen overflow-hidden bg-linear-gradient">

            {/* Nav */}
            <nav className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-10 py-6">
                <span className="font-mono text-sm tracking-[0.22em] uppercase opacity-65 select-none" style={{ color: "hsl(var(--heroui-info))" }}>ApplyOS</span>
            </nav>

            {/* Scrollable form */}
            <div className="absolute inset-0 z-20 overflow-y-auto">
                <div className="min-h-full flex flex-col items-center justify-center py-24">
                    <div className="w-[90%]">

                        {/* Glass card */}
                        <div className="rounded-2xl backdrop-blur-[28px] px-9 pt-8 pb-8 transition-colors duration-500"
                             style={{ background: "hsl(var(--heroui-card) / 0.80)", border: "1px solid hsl(var(--heroui-info) / 0.13)", boxShadow: "0 0 60px hsl(var(--heroui-info) / 0.06), 0 0 120px hsl(var(--heroui-secondary) / 0.06), inset 0 1px 0 hsl(var(--heroui-foreground) / 0.05)" }}>

                            {/* Badge */}
                            <div className="mb-5">
                                <div className="inline-flex items-center gap-[0.45rem] font-mono text-[0.61rem] tracking-[0.2em] uppercase rounded-full px-3 py-1.5 backdrop-blur-sm"
                                     style={{ color: "hsl(var(--heroui-info) / 0.60)", border: "1px solid hsl(var(--heroui-info) / 0.14)", background: "hsl(var(--heroui-info) / 0.04)" }}>
                                    <span className="inline-block w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "hsl(var(--heroui-success))", boxShadow: "0 0 6px hsl(var(--heroui-success))" }} />
                                    Profile Setup
                                </div>
                            </div>

                            <ProgressBar current={stepIndex} />

                            {/* Error banner */}
                            {error && (
                                <div className="mb-4 px-4 py-2.5 rounded-lg text-sm" style={{ background: "hsl(var(--heroui-danger) / 0.08)", border: "1px solid hsl(var(--heroui-danger) / 0.25)", color: "hsl(var(--heroui-danger) / 0.85)" }}>
                                    {error}
                                </div>
                            )}

                            {currentId === "welcome"    && <StepWelcome    onNext={skipNext} />}
                            {currentId === "profile"    && <StepPersonal   data={data.personal}   onChange={(p) => setData((d) => ({ ...d, personal: p }))}   onNext={saveAndNext} onBack={goBack} isLoading={isSaving} />}
                            {currentId === "contact"    && <StepContact    data={data.contact}    onChange={(c) => setData((d) => ({ ...d, contact: c }))}    onNext={saveAndNext} onBack={goBack} isLoading={isSaving} />}
                            {currentId === "education"  && <StepEducation  data={data.education}  onChange={(e) => setData((d) => ({ ...d, education: e }))}  onNext={saveAndNext} onBack={goBack} isLoading={isSaving} />}
                            {currentId === "employment" && <StepEmployment data={data.employment} onChange={(e) => setData((d) => ({ ...d, employment: e }))} onNext={saveAndNext} onBack={goBack} onSkip={skipNext} isLoading={isSaving} />}
                            {currentId === "links"      && <StepLinks      data={data.links}      onChange={(l) => setData((d) => ({ ...d, links: l }))}      onNext={saveAndNext} onBack={goBack} onSkip={skipNext} isLoading={isSaving} />}
                            {currentId === "done"       && <StepDone       onFinish={finish} isLoading={isSaving} />}
                        </div>

                        <p className="font-sans text-[0.77rem] text-center mt-4" style={{ color: "hsl(var(--heroui-subheading) / 0.35)" }}>
                            All fields can be updated anytime from your profile settings.
                        </p>
                    </div>
                </div>
            </div>

            {/* Vignette + fade */}
            <div className="absolute inset-0 pointer-events-none z-5 bg-radial-gradient" />
            <div className="absolute bottom-0 left-0 right-0 pointer-events-none z-6 bg-linear-gradient h-36" />
        </div>
    );
}