import { useState } from "react";
import { Application } from "@/api/application.ts";
import { Button, Chip, Input, Card, CardHeader, CardBody, CardFooter, Divider } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiRouter from "@/api/router";

type CredentialField = {
    username: string;
    password_digest: string;
    portal_link: string;
};

function shortenUrl(url: string): string {
    try {
        const { hostname, pathname } = new URL(url);
        const path = pathname.length > 1 ? pathname.replace(/\/$/, "") : "";
        const short = hostname + path;
        return short.length > 45 ? short.slice(0, 42) + "…" : short;
    } catch {
        return url.length > 45 ? url.slice(0, 42) + "…" : url;
    }
}

export default function AppDetailView({ app, onBack }: { app: Application; onBack: () => void }) {
    const queryClient = useQueryClient();
    const [isEditing, setIsEditing] = useState(false);
    const [fetchingUrl, setFetchingUrl] = useState(false);
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const [form, setForm] = useState<CredentialField>({
        username:        app.credential?.username        ?? "",
        password_digest: app.credential?.password_digest ?? "",
        portal_link:     app.credential?.portal_link     ?? "",
    });

    const [credentialExists, setCredentialExists] = useState(
        !!(app.credential?.username || app.credential?.password_digest || app.credential?.portal_link)
    );

    const updateMutation = useMutation({
        mutationFn: async () => {
            try {
                return await apiRouter.applicationCredentials.updateCredential(app.id, { application_credential: form })
            } catch (e: any) {
                if (e.response?.status === 404) {
                    return await apiRouter.applicationCredentials.createCredential(app.id, { application_credential: form })
                }
                throw e
            }
        },
        onSuccess: () => {
            setCredentialExists(true);
            queryClient.invalidateQueries({ queryKey: ["applications"] });
            setIsEditing(false);
        },
    });

    function useCurrentPage() {
        setFetchingUrl(true);
        chrome.runtime.sendMessage({ type: "GET_CURRENT_TAB_URL" }, (res) => {
            setForm(f => ({ ...f, portal_link: res?.url ?? "" }));
            setFetchingUrl(false);
        });
    }

    function copyField(field: string, value: string) {
        navigator.clipboard.writeText(value).then(() => {
            setCopiedField(field);
            setTimeout(() => setCopiedField(null), 1500);
        });
    }

    return (
        <div className="flex flex-col bg-heroui-background text-heroui-text" style={{ height: "600px" }}>

            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-5 pb-4 border-b border-heroui-border shrink-0">
                <div className="flex flex-col">
                    <h1 className="text-lg font-semibold text-heroui-heading">{app.company}</h1>
                    {app.position && (
                        <p className="text-xs text-heroui-muted mt-0.5">{app.position}</p>
                    )}
                    <Chip size="sm" variant="flat" color="secondary" className="mt-1 w-fit">
                        {app.category}
                    </Chip>
                </div>
                <Button
                    size="sm"
                    variant="light"
                    isIconOnly
                    onPress={() => {
                        if (isEditing) {
                            setForm({
                                username:        app.credential?.username        ?? "",
                                password_digest: app.credential?.password_digest ?? "",
                                portal_link:     app.credential?.portal_link     ?? "",
                            });
                        }
                        setIsEditing(!isEditing);
                    }}
                >
                    <Icon icon={isEditing ? "solar:close-circle-linear" : "solar:pen-2-linear"} width={18} />
                </Button>
            </div>

            {/* Cards — flex-1 so they stretch to fill all remaining space */}
            <div className="flex-1 px-4 py-4 flex flex-col gap-3 min-h-0">

                {/* Username */}
                <Card className="flex-1 px-2">
                    <CardHeader className="text-sm font-semibold text-heroui-heading pb-1 flex justify-between items-center">
                        <span>Username</span>
                        {!isEditing && copiedField === "username" && (
                            <span className="text-[10px] text-success font-normal">Copied!</span>
                        )}
                    </CardHeader>
                    <Divider />
                    <CardBody
                        className={!isEditing ? "cursor-pointer" : ""}
                        onClick={!isEditing ? () => copyField("username", form.username) : undefined}
                    >
                        {isEditing ? (
                            <Input
                                size="sm"
                                variant="bordered"
                                value={form.username}
                                onChange={(e) => setForm({ ...form, username: e.target.value })}
                            />
                        ) : (
                            <p className="font-mono text-sm text-heroui-text truncate">
                                {form.username || <span className="text-heroui-muted italic">Not set</span>}
                            </p>
                        )}
                    </CardBody>
                    {!isEditing && (
                        <>
                            <Divider />
                            <CardFooter className="text-xs text-heroui-muted">Click to Copy</CardFooter>
                        </>
                    )}
                </Card>

                {/* Password */}
                <Card className="flex-1 px-2">
                    <CardHeader className="text-sm font-semibold text-heroui-heading pb-1 flex justify-between items-center">
                        <span>Password</span>
                        {!isEditing && copiedField === "password" && (
                            <span className="text-[10px] text-success font-normal">Copied!</span>
                        )}
                    </CardHeader>
                    <Divider />
                    <CardBody
                        className={!isEditing ? "cursor-pointer" : ""}
                        onClick={!isEditing ? () => copyField("password", form.password_digest) : undefined}
                    >
                        {isEditing ? (
                            <Input
                                size="sm"
                                variant="bordered"
                                type="password"
                                value={form.password_digest}
                                onChange={(e) => setForm({ ...form, password_digest: e.target.value })}
                            />
                        ) : (
                            <p className="font-mono text-sm text-heroui-text blur-sm hover:blur-none transition-all duration-200 truncate">
                                {form.password_digest || "••••••••"}
                            </p>
                        )}
                    </CardBody>
                    {!isEditing && (
                        <>
                            <Divider />
                            <CardFooter className="text-xs text-heroui-muted">Hover to Reveal · Click to Copy</CardFooter>
                        </>
                    )}
                </Card>

                {/* Portal Link */}
                <Card className="flex-1 px-2">
                    <CardHeader className="text-sm font-semibold text-heroui-heading pb-1">
                        Portal Link
                    </CardHeader>
                    <Divider />
                    <CardBody>
                        {isEditing ? (
                            <div className="flex flex-col gap-2">
                                <Input
                                    size="sm"
                                    variant="bordered"
                                    placeholder="https://portal.company.com/login"
                                    value={form.portal_link}
                                    onChange={(e) => setForm({ ...form, portal_link: e.target.value })}
                                />
                                <Button
                                    size="sm"
                                    variant="flat"
                                    color="secondary"
                                    isLoading={fetchingUrl}
                                    onPress={useCurrentPage}
                                    className="text-xs"
                                >
                                    📌 Use current page URL
                                </Button>
                            </div>
                        ) : (
                            <a
                                href={form.portal_link || "#"}
                                target="_blank"
                                rel="noreferrer"
                                className="font-mono text-sm text-heroui-text hover:text-primary transition-colors truncate block"
                            >
                                {form.portal_link ? shortenUrl(form.portal_link) : <span className="text-heroui-muted italic">Not set</span>}
                            </a>
                        )}
                    </CardBody>
                    {!isEditing && (
                        <>
                            <Divider />
                            <CardFooter className="text-xs text-heroui-muted">Click to Redirect</CardFooter>
                        </>
                    )}
                </Card>

                {/* Save button */}
                {isEditing && (
                    <Button
                        fullWidth
                        color="primary"
                        isLoading={updateMutation.isPending}
                        onPress={() => updateMutation.mutate()}
                    >
                        Save Changes
                    </Button>
                )}

            </div>

            {/* Bottom nav */}
            <div className="px-4 py-4 border-t border-heroui-border flex-shrink-0">
                <Button
                    fullWidth
                    variant="flat"
                    color="default"
                    onPress={onBack}
                    className="text-heroui-subheading"
                >
                    ← Back to Applications
                </Button>
            </div>
        </div>
    );
}
