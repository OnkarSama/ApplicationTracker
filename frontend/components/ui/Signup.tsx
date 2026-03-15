"use client";

import { useState } from "react";
import Link from "next/link";
import type { SignupPayload } from "@/api/signup";
import ThreeBackground from "@/components/ui/ThreeBackground";

/* ─────────────────────────────────────────────
   Reusable input field
───────────────────────────────────────────── */
interface FieldProps {
    label: string;
    type?: string;
    placeholder?: string;
    value: string;
    onChange: (v: string) => void;
    half?: boolean;
}

function Field({ label, type = "text", placeholder, value, onChange, half }: FieldProps) {
    const [focused, setFocused] = useState(false);
    return (
        <div className={half ? "w-[calc(50%-0.5rem)] flex flex-col gap-1.5" : "w-full flex flex-col gap-1.5"}>
            <label
                className="font-mono text-[0.61rem] tracking-[0.18em] uppercase transition-colors duration-200"
                style={{ color: focused ? "hsl(var(--heroui-info) / 0.85)" : "hsl(var(--heroui-muted) / 0.55)" }}
            >
                {label}
            </label>
            <input
                type={type}
                placeholder={placeholder ?? ""}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                className="w-full font-sans text-sm rounded-[7px] px-3.5 py-2.5 outline-none backdrop-blur-sm transition-all duration-200 border"
                style={{
                    color:       "hsl(var(--heroui-foreground))",
                    background:  focused ? "hsl(var(--heroui-info) / 0.07)" : "hsl(var(--heroui-foreground) / 0.04)",
                    borderColor: focused ? "hsl(var(--heroui-info) / 0.50)" : "hsl(var(--heroui-foreground) / 0.10)",
                    boxShadow:   focused ? "0 0 18px hsl(var(--heroui-info) / 0.12)" : "none",
                }}
            />
        </div>
    );
}

interface SignupPageProps {
    onSubmit: (formData: SignupPayload["user"]) => void;
}

/* ─────────────────────────────────────────────
   Main signup page
───────────────────────────────────────────── */
export default function SignupPage({ onSubmit }: SignupPageProps) {
    const [form, setForm] = useState({
        first_name: "", last_name: "", email_address: "",
        password: "", password_confirmation: "",
    });

    const set = (key: keyof typeof form) => (v: string) =>
        setForm((p) => ({ ...p, [key]: v }));

    return (
        <ThreeBackground>
            {/* ── Nav ── */}
            <nav className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-10 py-6">
                <span className="font-mono text-sm tracking-[0.22em] uppercase text-[hsl(var(--heroui-info))] opacity-65 select-none">
                    ApplyOS
                </span>
                <div className="flex items-center gap-3">
                    <Link
                        href="/login"
                        className="
                            group relative text-sm font-medium inline-flex items-center
                            px-5 h-9 rounded-md overflow-hidden
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

            {/* ── Scrollable form layer ── */}
            <div className="absolute inset-0 z-20 overflow-y-auto flex flex-col items-center pt-24 pb-12">
                <div className="w-full max-w-140 px-6">

                    {/* Glass card */}
                    <div
                        className="rounded-2xl backdrop-blur-[28px] px-9 pt-10 pb-9 transition-colors duration-500"
                        style={{
                            background: "hsl(var(--heroui-card) / 0.80)",
                            border:     "1px solid hsl(var(--heroui-info) / 0.13)",
                            boxShadow:  "0 0 60px hsl(var(--heroui-info) / 0.06), 0 0 120px hsl(var(--heroui-secondary) / 0.06), inset 0 1px 0 hsl(var(--heroui-foreground) / 0.05)",
                        }}
                    >
                        {/* Badge */}
                        <div className="mb-6">
                            <div
                                className="inline-flex items-center gap-[0.45rem] mb-3 font-mono text-[0.61rem] tracking-[0.2em] uppercase rounded-full px-3 py-1.5 backdrop-blur-sm"
                                style={{
                                    color:      "hsl(var(--heroui-info) / 0.60)",
                                    border:     "1px solid hsl(var(--heroui-info) / 0.14)",
                                    background: "hsl(var(--heroui-info) / 0.04)",
                                }}
                            >
                                <span
                                    className="inline-block w-1.5 h-1.5 rounded-full shrink-0"
                                    style={{ background: "hsl(var(--heroui-success))", boxShadow: "0 0 6px hsl(var(--heroui-success))" }}
                                />
                                Create Account
                            </div>

                            <h2
                                className="font-sora font-extrabold text-[1.8rem] tracking-[-0.025em] m-0 leading-tight"
                                style={{ color: "hsl(var(--heroui-heading))" }}
                            >
                                Create{" "}
                                <span style={{
                                    background: "linear-gradient(90deg, hsl(var(--heroui-info)) 0%, hsl(var(--heroui-primary)) 40%, hsl(var(--heroui-secondary)) 70%, hsl(var(--heroui-success)) 100%)",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor:  "transparent",
                                    backgroundClip:       "text",
                                }}>
                                    An Account
                                </span>
                            </h2>

                            <p className="font-sans text-[0.83rem] mt-1.5 mb-0" style={{ color: "hsl(var(--heroui-subheading) / 0.55)" }}>
                                Track every application from first click to signed offer.
                            </p>
                        </div>

                        {/* Fields */}
                        <div className="flex flex-col gap-3.5">
                            <div className="flex gap-4">
                                <Field label="First Name" placeholder="i.e. Jane"  value={form.first_name} onChange={set("first_name")} half />
                                <Field label="Last Name"  placeholder="i.e. Smith" value={form.last_name}  onChange={set("last_name")}  half />
                            </div>
                            <Field label="Email Address" type="email" placeholder="i.e. jane@email.com" value={form.email_address} onChange={set("email_address")} />
                            <div className="flex gap-4">
                                <Field label="Password"         type="password" placeholder="••••••••" value={form.password}              onChange={set("password")}              half />
                                <Field label="Confirm Password" type="password" placeholder="••••••••" value={form.password_confirmation} onChange={set("password_confirmation")} half />
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="h-px my-6" style={{ background: "hsl(var(--heroui-foreground) / 0.055)" }} />

                        {/* Submit */}
                        <button
                            onClick={() => onSubmit(form)}
                            className="w-full font-sora font-bold text-[0.9rem] tracking-[0.07em] py-3.5 rounded-lg cursor-pointer backdrop-blur-sm transition-all duration-200 hover:-translate-y-px active:translate-y-0"
                            style={{
                                color:      "hsl(var(--heroui-foreground))",
                                background: "linear-gradient(135deg, hsl(var(--heroui-info) / 0.16) 0%, hsl(var(--heroui-secondary) / 0.16) 100%)",
                                border:     "1px solid hsl(var(--heroui-info) / 0.28)",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background  = "linear-gradient(135deg, hsl(var(--heroui-info) / 0.26) 0%, hsl(var(--heroui-secondary) / 0.26) 100%)";
                                e.currentTarget.style.borderColor = "hsl(var(--heroui-info) / 0.52)";
                                e.currentTarget.style.boxShadow   = "0 0 36px hsl(var(--heroui-info) / 0.18), 0 0 70px hsl(var(--heroui-secondary) / 0.14)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background  = "linear-gradient(135deg, hsl(var(--heroui-info) / 0.16) 0%, hsl(var(--heroui-secondary) / 0.16) 100%)";
                                e.currentTarget.style.borderColor = "hsl(var(--heroui-info) / 0.28)";
                                e.currentTarget.style.boxShadow   = "none";
                            }}
                        >
                            Create Account →
                        </button>

                        {/* Footer */}
                        <p className="font-sans text-[0.77rem] text-center mt-4 mb-0" style={{ color: "hsl(var(--heroui-subheading) / 0.40)" }}>
                            Already have an account?{" "}
                            <Link
                                href="/login"
                                className="no-underline border-b pb-px transition-colors duration-200"
                                style={{ color: "hsl(var(--heroui-info) / 0.68)", borderColor: "hsl(var(--heroui-info) / 0.22)" }}
                                onMouseEnter={(e) => { e.currentTarget.style.color = "hsl(var(--heroui-info))"; }}
                                onMouseLeave={(e) => { e.currentTarget.style.color = "hsl(var(--heroui-info) / 0.68)"; }}
                            >
                                Log in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </ThreeBackground>
    );
}