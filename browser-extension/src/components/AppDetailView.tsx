import { Application } from "@/api/application.ts";
import {Button, Card, CardHeader, CardBody, Chip, Link, Divider, CardFooter} from "@heroui/react";

export default function AppDetailView({ app, onBack }: { app: Application; onBack: () => void }) {



    function copyToClipboard(text: string) {
        navigator.clipboard.writeText(text)
            .then(() => console.log(text))
            .catch(err => console.error('Failed to copy:', err))
    }

    return (
        <div className="flex flex-col h-full bg-heroui-background text-heroui-text">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 pt-5 pb-4 border-b border-heroui-border">
                <div className="flex flex-col">
                    <h1 className="text-lg font-semibold text-heroui-heading">{app.title}</h1>
                    <Chip size="sm" variant="flat" color="secondary" className="mt-1 w-fit">
                        {app.category}
                    </Chip>
                </div>
            </div>

            <Card className= "mx-4 my-5 px-2 py-2">
                <CardHeader className="text-lg font-semibold text-heroui-heading">
                    Username
                </CardHeader>
                <Divider />
                <CardBody>
                    <div className="flex flex-row justify-between items-center">
                        <h1 className="text-heroui-text font-mono text-medium mt-1 blur-sm hover:blur-none transition-all duration-200 cursor-pointer select-all px-4 py-4">
                            {app.credential.username}
                        </h1>
                        <Button size="sm" onPressEnd={() => copyToClipboard(app.credential.username)}>Click</Button>
                    </div>
                </CardBody>
            </Card>

            <Card className= "mx-4 my-5 px-2 py-2">
                <CardHeader className="text-lg font-semibold text-heroui-heading">
                    Password
                </CardHeader>
                <Divider />
                <CardBody>
                    <div className="flex flex-row justify-between items-center">
                        <h1 className="text-heroui-text font-mono text-medium mt-1 blur-sm hover:blur-none transition-all duration-200 cursor-pointer select-all px-4 py-4">
                            {app.credential.password_digest}
                        </h1>
                        <Button size="sm"  onPressEnd={() => copyToClipboard(app.credential.password_digest)}>Click</Button>
                    </div>
                </CardBody>
                <Divider />
                <CardFooter>
                    Hover to Reveal
                </CardFooter>
            </Card>

            <Card className= "mx-4 my-5 px-2 py-2">
                <CardHeader className="text-lg font-semibold text-heroui-heading">
                    Password
                </CardHeader>
                <Divider />
                <CardBody>
                    <div>
                        <h1 className="text-heroui-text font-mono text-medium mt-1 blur-sm hover:blur-none transition-all duration-200 cursor-pointer select-all px-4 py-4">
                            <Link isExternal target="_blank" href={app.credential.portal_link} className="text-heroui-text font-mono text-sm mt-1">{app.credential.portal_link}</Link>
                        </h1>
                    </div>
                </CardBody>
                <Divider />
                <CardFooter>
                    Click to Redirect
                </CardFooter>
            </Card>

            {/* Bottom nav */}
            <div className="px-4 py-4 border-t border-heroui-border">
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
    )
}