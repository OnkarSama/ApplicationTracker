"use client";

import { useState } from "react";
import { Button, Input, Form, addToast } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import apiRouter from "@/api/router";

export default function ResetPasswordPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token") ?? "";

    const [isVisible, setIsVisible] = useState(false);
    const [isConfirmVisible, setIsConfirmVisible] = useState(false);
    const [done, setDone] = useState(false);

    const mutation = useMutation({
        mutationFn: ({ password, password_confirmation }: { password: string; password_confirmation: string }) =>
            apiRouter.passwords.resetPassword(token, password, password_confirmation),
        onSuccess: () => {
            setDone(true);
            setTimeout(() => router.push("/login"), 2500);
        },
        onError: (error: any) => {
            const msg =
                error?.response?.data?.error ||
                error?.response?.data?.errors?.join(", ") ||
                "Reset link may have expired. Please request a new one.";
            addToast({
                title: "Password reset failed",
                description: msg,
                timeout: 4000,
                variant: "solid",
                color: "danger",
            });
        },
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        mutation.mutate({
            password:              data.get("password")!.toString(),
            password_confirmation: data.get("password_confirmation")!.toString(),
        });
    };

    if (!token) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                <div className="text-center flex flex-col gap-3">
                    <p className="text-heading font-semibold">Invalid reset link</p>
                    <p className="text-muted text-sm">This link is missing a token. Please request a new reset link.</p>
                    <Button size="sm" variant="flat" onPress={() => router.push("/forgot-password")}>
                        Request new link
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-full w-full items-center justify-center">
            <div className="w-full max-w-sm flex flex-col gap-6">

                {done ? (
                    <div className="flex flex-col items-center gap-4 text-center">
                        <div className="w-14 h-14 rounded-full bg-success/10 flex items-center justify-center">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-success">
                                <polyline points="20 6 9 17 4 12"/>
                            </svg>
                        </div>
                        <div>
                            <p className="text-xl font-semibold text-heading">Password updated!</p>
                            <p className="text-sm text-muted mt-1">Redirecting you to login…</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="flex flex-col items-center gap-1 text-center">
                            <p className="text-xl font-semibold text-heading">Set new password</p>
                            <p className="text-sm text-muted">Must be at least 8 characters.</p>
                        </div>

                        <Form className="flex flex-col gap-3" validationBehavior="native" onSubmit={handleSubmit}>
                            <Input
                                isRequired
                                minLength={8}
                                label="New Password"
                                name="password"
                                placeholder="Enter new password"
                                type={isVisible ? "text" : "password"}
                                variant="bordered"
                                endContent={
                                    <button type="button" onClick={() => setIsVisible(v => !v)}>
                                        <Icon
                                            className="text-default-400 text-2xl"
                                            icon={isVisible ? "solar:eye-closed-linear" : "solar:eye-bold"}
                                        />
                                    </button>
                                }
                            />
                            <Input
                                isRequired
                                minLength={8}
                                label="Confirm Password"
                                name="password_confirmation"
                                placeholder="Confirm new password"
                                type={isConfirmVisible ? "text" : "password"}
                                variant="bordered"
                                endContent={
                                    <button type="button" onClick={() => setIsConfirmVisible(v => !v)}>
                                        <Icon
                                            className="text-default-400 text-2xl"
                                            icon={isConfirmVisible ? "solar:eye-closed-linear" : "solar:eye-bold"}
                                        />
                                    </button>
                                }
                            />
                            <Button
                                className="w-full"
                                color="primary"
                                type="submit"
                                isLoading={mutation.isPending}
                            >
                                Reset password
                            </Button>
                        </Form>
                    </>
                )}
            </div>
        </div>
    );
}
