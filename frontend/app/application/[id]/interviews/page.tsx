import Link from "next/link";
import InterviewsPanel from "@/components/Applications/InterviewsPanel";

interface InterviewsPageProps {
    params: Promise<{ id: string }>;
}

export default async function InterviewsPage({ params }: InterviewsPageProps) {
    const { id } = await params;
    const applicationId = Number(id);

    return (
        <div className="min-h-screen bg-background">

            {/* ── Nav ── */}
            <nav className="sticky top-0 z-10 flex items-center justify-between px-8 py-5 backdrop-blur-xl bg-background/80 border-b border-border/30 max-sm:px-4 max-sm:py-3.5">
                <Link
                    href="/dashboard"
                    className="font-mono text-[0.78rem] tracking-[0.22em] uppercase text-primary/65 no-underline transition-colors duration-200 hover:text-primary max-sm:text-[0.65rem] max-sm:tracking-[0.16em]"
                >
                    ← Dashboard
                </Link>
                <Link
                    href={`/application/${id}`}
                    className="font-sans font-medium text-[0.84rem] px-5 py-2 rounded-md bg-foreground/[0.04] text-muted border border-border/40 no-underline transition-all duration-200 hover:text-foreground hover:border-border/70 max-sm:text-[0.72rem] max-sm:px-3 max-sm:py-1.5"
                >
                    <span className="sm:hidden">Edit</span>
                    <span className="hidden sm:inline">Edit Application</span>
                </Link>
            </nav>

            {/* ── Body ── */}
            <div className="max-w-4xl mx-auto px-8 pt-10 pb-16 max-sm:px-4 max-sm:pt-6 max-sm:pb-10">

                {/* Header */}
                <div className="mb-8 max-sm:mb-5">
                    <div className="inline-flex items-center gap-1.5 font-mono text-[0.6rem] tracking-[0.2em] uppercase text-primary border border-primary/25 bg-primary/[0.07] px-3 py-1 rounded-full mb-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_6px_theme(colors.indigo.500)] inline-block" />
                        Interview Scheduler
                    </div>
                    <h1 className="font-sora font-extrabold text-[clamp(1.4rem,5vw,2.2rem)] tracking-tight text-heading leading-tight m-0">
                        Interviews
                    </h1>
                    <p className="text-sm text-foreground/70 mt-1.5 max-sm:text-xs">
                        Track your interview rounds, prep notes, and upcoming dates.
                    </p>
                </div>

                <InterviewsPanel applicationId={applicationId} />

            </div>
        </div>
    );
}