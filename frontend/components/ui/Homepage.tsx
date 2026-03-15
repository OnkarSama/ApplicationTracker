"use client";

import Link from "next/link";
import ThreeBackground from "@/components/ui/ThreeBackground";

const STATUS_PILLS = [
    { colorClass: "bg-emerald-500", glowClass: "shadow-emerald-500/60", label: "Offer"     },
    { colorClass: "bg-sky-400",     glowClass: "shadow-sky-400/60",     label: "Interview" },
    { colorClass: "bg-amber-400",   glowClass: "shadow-amber-400/60",   label: "Applied"   },
    { colorClass: "bg-rose-500",    glowClass: "shadow-rose-500/60",    label: "Rejected"  },
    { colorClass: "bg-violet-400",  glowClass: "shadow-violet-400/60",  label: "Saved"     },
];

export default function HomepageAnimation() {
    return (
        <ThreeBackground>
            {/* ── Nav ──────────────────────────────────────────────────────── */}
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

            {/* ── Hero ─────────────────────────────────────────────────────── */}
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
        </ThreeBackground>
    );
}