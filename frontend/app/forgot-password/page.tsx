"use client";

import { useState } from "react";
import { Button, Input, Form, addToast } from "@heroui/react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import apiRouter from "@/api/router";

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [submitted, setSubmitted] = useState(false);

    const mutation = useMutation({
        mutationFn: (email: string) => apiRouter.passwords.requestReset(email),
        onSuccess: () => setSubmitted(true),
        onError: () => {
            addToast({
                title: "Something went wrong",
                description: "Please try again in a moment.",
                timeout: 3000,
                variant: "solid",
                color: "danger",
            });
        },
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const email = new FormData(e.currentTarget).get("email")!.toString().toLowerCase();
        mutation.mutate(email);
    };

    return (
        <div className="flex h-full w-full items-center justify-center">
            <div className="w-full max-w-sm flex flex-col gap-6">

                {submitted ? (
                    <div className="flex flex-col items-center gap-4 text-center">
                        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                                <path d="M22 13V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h9"/>
                                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                                <path d="m16 19 2 2 4-4"/>
                            </svg>
                        </div>
                        <div>
                            <p className="text-xl font-semibold text-heading">Check your inbox</p>
                            <p className="text-sm text-muted mt-1">
                                If that email is registered you'll receive a reset link shortly. The link expires in 15 minutes.
                            </p>
                        </div>
                        <Button variant="flat" size="sm" onPress={() => router.push("/login")}>
                            Back to login
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className="flex flex-col items-center gap-1 text-center">
                            <p className="text-xl font-semibold text-heading">Forgot password?</p>
                            <p className="text-sm text-muted">Enter your email and we'll send you a reset link.</p>
                        </div>

                        <Form className="flex flex-col gap-3" validationBehavior="native" onSubmit={handleSubmit}>
                            <Input
                                isRequired
                                label="Email Address"
                                name="email"
                                placeholder="Enter your email"
                                type="email"
                                variant="bordered"
                            />
                            <Button
                                className="w-full"
                                color="primary"
                                type="submit"
                                isLoading={mutation.isPending}
                            >
                                Send reset link
                            </Button>
                        </Form>

                        <p className="text-center text-sm text-muted">
                            Remembered it?{" "}
                            <button
                                onClick={() => router.push("/login")}
                                className="text-primary font-medium hover:underline cursor-pointer"
                            >
                                Back to login
                            </button>
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}
