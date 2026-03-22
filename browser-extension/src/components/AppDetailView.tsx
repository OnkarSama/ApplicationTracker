import { useState } from "react";
import { Application } from "@/api/application.ts";
import {
    Button, Card, CardHeader, CardBody, Chip,
    Link, Divider, CardFooter, Input
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiRouter from "@/api/router";

type CredentialField = {
    username: string;
    password_digest: string;
    portal_link: string;
};

export default function AppDetailView({ app, onBack }: { app: Application; onBack: () => void }) {
    const queryClient = useQueryClient();
    const [isEditing, setIsEditing] = useState(false);
    const [form, setForm] = useState<CredentialField>({
        username: app.credential.username,
        password_digest: app.credential.password_digest,
        portal_link: app.credential.portal_link,
    });

    const updateMutation = useMutation({
        mutationFn: () =>
            apiRouter.applicationCredentials.updateCredential(app.id, {
                application_credential: form,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["getApplications"] });
            // Do NOT reset form — it now holds the saved values and drives the display
            setIsEditing(false);
        },
    });

    function copyToClipboard(text: string) {
        navigator.clipboard.writeText(text)
            .then(() => console.log("Copied:", text))
            .catch(err => console.error("Failed to copy:", err));
    }

    return (
        <div className="flex flex-col bg-heroui-background text-heroui-text" style={{ height: "600px" }}>

            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-5 pb-4 border-b border-heroui-border shrink-0">
                <div className="flex flex-col">
                    <h1 className="text-lg font-semibold text-heroui-heading">{app.title}</h1>
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
                            // Cancel — reset form back to last saved values
                            setForm({
                                username: app.credential.username,
                                password_digest: app.credential.password_digest,
                                portal_link: app.credential.portal_link,
                            });
                        }
                        setIsEditing(!isEditing);
                    }}
                >
                    <Icon icon={isEditing ? "solar:close-circle-linear" : "solar:pen-2-linear"} width={18} />
                </Button>
            </div>

            {/* Scrollable cards */}
            <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-4">

                {/* Username */}
                <Card className="px-2 py-2">
                    <CardHeader className="text-sm font-semibold text-heroui-heading pb-1">
                        Username
                    </CardHeader>
                    <Divider />
                    <CardBody>
                        {isEditing ? (
                            <Input
                                size="sm"
                                variant="bordered"
                                value={form.username}
                                onChange={(e) => setForm({ ...form, username: e.target.value })}
                            />
                        ) : (
                            <div className="flex flex-row justify-between items-center">
                                <p className="text-heroui-text font-mono text-sm select-all flex-1 py-2 truncate">
                                    {form.username}
                                </p>
                                <Button size="sm" variant="flat" onPressEnd={() => copyToClipboard(form.username)}>
                                    Copy
                                </Button>
                            </div>
                        )}
                    </CardBody>
                    {!isEditing && (
                        <>
                            <Divider />
                            <CardFooter className="text-xs text-heroui-muted">Hover to Reveal</CardFooter>
                        </>
                    )}
                </Card>

                {/* Password */}
                <Card className="px-2 py-2">
                    <CardHeader className="text-sm font-semibold text-heroui-heading pb-1">
                        Password
                    </CardHeader>
                    <Divider />
                    <CardBody>
                        {isEditing ? (
                            <Input
                                size="sm"
                                variant="bordered"
                                type="password"
                                value={form.password_digest}
                                onChange={(e) => setForm({ ...form, password_digest: e.target.value })}
                            />
                        ) : (
                            <div className="flex flex-row justify-between items-center">
                                <p className="text-heroui-text font-mono text-sm blur-sm hover:blur-none transition-all duration-200 cursor-pointer select-all flex-1 py-2 truncate">
                                    {form.password_digest}
                                </p>
                                <Button size="sm" variant="flat" onPressEnd={() => copyToClipboard(form.password_digest)}>
                                    Copy
                                </Button>
                            </div>
                        )}
                    </CardBody>
                    {!isEditing && (
                        <>
                            <Divider />
                            <CardFooter className="text-xs text-heroui-muted">Hover to Reveal</CardFooter>
                        </>
                    )}
                </Card>

                {/* Portal Link */}
                <Card className="px-2 py-2">
                    <CardHeader className="text-sm font-semibold text-heroui-heading pb-1">
                        Portal Link
                    </CardHeader>
                    <Divider />
                    <CardBody>
                        {isEditing ? (
                            <Input
                                size="sm"
                                variant="bordered"
                                value={form.portal_link}
                                onChange={(e) => setForm({ ...form, portal_link: e.target.value })}
                            />
                        ) : (
                            <Link
                                isExternal
                                target="_blank"
                                href={form.portal_link}
                                className="text-heroui-text font-mono text-xs break-all"
                            >
                                {form.portal_link}
                            </Link>
                        )}
                    </CardBody>
                    {!isEditing && (
                        <>
                            <Divider />
                            <CardFooter className="text-xs text-heroui-muted">Click to Redirect</CardFooter>
                        </>
                    )}
                </Card>

                {/* Save button (only in edit mode) */}
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