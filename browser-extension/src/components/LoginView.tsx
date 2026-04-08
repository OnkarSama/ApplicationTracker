import React from "react";
import { Button, Input, Form, addToast } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useMutation } from "@tanstack/react-query";
import apiRouter from "@/api/router";
import type { LoginPayload } from "@/api/session";
import type { Theme } from "@/popup/App";

export default function LoginView({
    theme,
    toggleTheme,
    onLoginSuccess,
}: {
    theme: Theme
    toggleTheme: () => void
    onLoginSuccess: () => void
}) {
    const [isVisible, setIsVisible] = React.useState(false)

    const loginMutation = useMutation({
        mutationFn: (payload: LoginPayload) => apiRouter.sessions.createSession(payload),
        onSuccess: (data: any) => {
            addToast({
                title: "Welcome back",
                description: "Signed in successfully.",
                timeout: 1200,
                shouldShowTimeoutProgress: true,
                variant: "solid",
                color: "success",
            })
            chrome.storage.local.set({ jwtToken: data.token }).then(onLoginSuccess)
        },
        onError: (error: any) => {
            addToast({
                title: "Sign in failed",
                description: Object.values(error.response.data.errors).flat().join(", "),
                timeout: 3000,
                shouldShowTimeoutProgress: true,
                variant: "solid",
                color: "danger",
            })
        },
    })

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const fd = new FormData(e.currentTarget)
        loginMutation.mutate({
            email_address: fd.get("email")!.toString().toLowerCase(),
            password:      fd.get("password")!.toString(),
        })
    }

    return (
        <div className="flex flex-col h-full bg-heroui-background relative overflow-hidden">

            {/* theme toggle — top right */}
            <button
                onClick={toggleTheme}
                className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full flex items-center justify-center text-heroui-muted hover:text-heroui-text hover:bg-heroui-card transition-all"
            >
                <Icon icon={theme === 'dark' ? 'solar:sun-bold' : 'solar:moon-bold'} width={16} />
            </button>

            {/* gradient hero blob */}
            <div
                className="absolute top-0 left-0 right-0 h-48 opacity-20 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, #6366f1, transparent)' }}
            />

            {/* content */}
            <div className="flex flex-col items-center justify-center flex-1 px-8 relative z-10">

                {/* logo mark */}
                <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 shadow-lg"
                    style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}
                >
                    <Icon icon="solar:case-minimalistic-bold" width={28} color="#fff" />
                </div>

                <h1 className="text-2xl font-bold text-heroui-heading tracking-tight mb-1">ApplyOS</h1>
                <p className="text-sm text-heroui-muted mb-8">Sign in to manage your applications</p>

                <Form className="flex flex-col gap-3 w-full" validationBehavior="native" onSubmit={handleSubmit}>
                    <Input
                        isRequired
                        label="Email"
                        name="email"
                        placeholder="you@example.com"
                        type="email"
                        variant="bordered"
                        classNames={{
                            inputWrapper: 'border-heroui-border bg-heroui-card data-[hover=true]:border-heroui-primary',
                            input: 'text-heroui-text placeholder:text-heroui-muted',
                            label: 'text-heroui-muted',
                        }}
                    />
                    <Input
                        isRequired
                        name="password"
                        label="Password"
                        placeholder="••••••••"
                        type={isVisible ? "text" : "password"}
                        variant="bordered"
                        classNames={{
                            inputWrapper: 'border-heroui-border bg-heroui-card data-[hover=true]:border-heroui-primary',
                            input: 'text-heroui-text placeholder:text-heroui-muted',
                            label: 'text-heroui-muted',
                        }}
                        endContent={
                            <button type="button" onClick={() => setIsVisible(v => !v)} className="text-heroui-muted hover:text-heroui-text transition-colors">
                                <Icon icon={isVisible ? "solar:eye-closed-linear" : "solar:eye-linear"} width={18} />
                            </button>
                        }
                    />
                    <Button
                        className="w-full mt-1 font-semibold"
                        type="submit"
                        isLoading={loginMutation.isPending}
                        style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', color: '#fff', border: 'none' }}
                    >
                        Sign In
                    </Button>
                </Form>
            </div>

            {/* footer */}
            <div className="pb-5 text-center">
                <p className="text-[11px] text-heroui-muted">ApplyOS · Job Application Manager</p>
            </div>
        </div>
    )
}
