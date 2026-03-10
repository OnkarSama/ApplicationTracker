"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import api from "@/api";

export default function VerifyEmailPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token");

    const [status, setStatus] = useState<"idle" | "verifying" | "success" | "error" | "expired">("idle");
    const [message, setMessage] = useState("");
    const [email, setEmail] = useState("");
    const [resent, setResent] = useState(false);

    useEffect(() => {
        if (!token) return;
        setStatus("verifying");
        api("/verification/verify", { method: "get", params: { token } })
            .then(() => {
                setStatus("success");
                setTimeout(() => router.push("/dashboard"), 2000);
            })
            .catch((err) => {
                const msg = err?.response?.data?.error ?? "Something went wrong.";
                setStatus(msg.includes("expired") ? "expired" : "error");
                setMessage(msg);
            });
    }, [token]);

    async function handleResend() {
        if (!email) return;
        await api("/verification/resend", { method: "post", data: { email_address: email } });
        setResent(true);
    }

    if (!token) return (
        <div className="flex h-full w-full items-center justify-center">
            <div className="max-w-sm w-full text-center flex flex-col gap-4">
                <p className="text-xl font-medium">Check your email</p>
                <p className="text-default-500 text-sm">
                    We sent a verification link to your email. Click it to activate your account.
                </p>
                <p className="text-default-500 text-sm">Didn't get it?</p>
                {!resent ? (
                    <div className="flex flex-col gap-2">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="border rounded px-3 py-2 text-sm"
                        />
                        <button onClick={handleResend} className="bg-primary text-white rounded px-4 py-2 text-sm">
                            Resend verification email
                        </button>
                    </div>
                ) : (
                    <p className="text-green-600 text-sm">Sent! Check your inbox.</p>
                )}
            </div>
        </div>
    );

    return (
        <div className="flex h-full w-full items-center justify-center">
            <div className="max-w-sm w-full text-center flex flex-col gap-4">
                {status === "verifying" && <p>Verifying your email...</p>}
                {status === "success"   && <p className="text-green-600">Email verified! Redirecting...</p>}
                {status === "error"     && <p className="text-red-500">{message}</p>}
                {status === "expired"   && (
                    <>
                        <p className="text-red-500">{message}</p>
                        {!resent ? (
                            <div className="flex flex-col gap-2">
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="border rounded px-3 py-2 text-sm"
                                />
                                <button onClick={handleResend} className="bg-primary text-white rounded px-4 py-2 text-sm">
                                    Resend verification email
                                </button>
                            </div>
                        ) : (
                            <p className="text-green-600 text-sm">Sent! Check your inbox.</p>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}