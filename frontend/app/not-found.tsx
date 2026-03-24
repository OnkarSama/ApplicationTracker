import Link from 'next/link'

export default function NotFound() {
    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');

                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50%       { transform: translateY(-10px); }
                }
                @keyframes pulse-ring {
                    0%, 100% { transform: scale(1);    opacity: 0.4; }
                    50%       { transform: scale(1.18); opacity: 0.08; }
                }
                @keyframes fade-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to   { opacity: 1; transform: translateY(0); }
                }

                .nf-root * { box-sizing: border-box; margin: 0; padding: 0; }

                .nf-root {
                    min-height: 100vh;
                    background: #09090b;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 2rem 1.5rem;
                    font-family: 'DM Sans', sans-serif;
                    position: relative;
                    overflow: hidden;
                }

                /* subtle radial glow behind content */
                .nf-root::before {
                    content: '';
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: clamp(400px, 70vw, 800px);
                    height: clamp(300px, 50vh, 600px);
                    background: radial-gradient(ellipse at center,
                        rgba(99,102,241,0.12) 0%,
                        rgba(124,58,237,0.06) 40%,
                        transparent 70%);
                    pointer-events: none;
                }

                .nf-card {
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 2rem;
                    text-align: center;
                    max-width: 480px;
                    width: 100%;
                    animation: fade-up 0.6s cubic-bezier(0.16,1,0.3,1) both;
                }

                /* floating icon */
                .nf-icon-wrap {
                    position: relative;
                    animation: float 3.8s ease-in-out infinite;
                }
                .nf-pulse {
                    position: absolute;
                    inset: -14px;
                    border-radius: 50%;
                    border: 1.5px solid rgba(99,102,241,0.35);
                    animation: pulse-ring 2.8s ease-in-out infinite;
                }
                .nf-icon {
                    width: 88px;
                    height: 88px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(124,58,237,0.1) 100%);
                    border: 1.5px solid rgba(99,102,241,0.3);
                    box-shadow: 0 12px 40px rgba(99,102,241,0.2);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                /* 404 number */
                .nf-code {
                    font-family: 'Sora', sans-serif;
                    font-weight: 800;
                    font-size: clamp(5rem, 18vw, 9rem);
                    line-height: 1;
                    letter-spacing: -0.05em;
                    background: linear-gradient(135deg, #6366f1 0%, #7c3aed 50%, #a78bfa 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    user-select: none;
                }

                .nf-text {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }
                .nf-title {
                    font-family: 'Sora', sans-serif;
                    font-weight: 800;
                    font-size: clamp(1.25rem, 4vw, 1.6rem);
                    color: #f8fafc;
                    letter-spacing: -0.02em;
                }
                .nf-desc {
                    font-size: clamp(0.875rem, 2.5vw, 1rem);
                    color: #94a3b8;
                    line-height: 1.7;
                    max-width: 360px;
                    margin: 0 auto;
                }

                /* eyebrow pill */
                .nf-pill {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.4rem;
                    font-family: 'DM Sans', monospace;
                    font-size: 0.65rem;
                    font-weight: 600;
                    letter-spacing: 0.16em;
                    text-transform: uppercase;
                    color: rgba(165,180,252,0.8);
                    border: 1px solid rgba(99,102,241,0.25);
                    padding: 0.28rem 0.85rem;
                    border-radius: 999px;
                    background: rgba(99,102,241,0.08);
                }
                .nf-dot {
                    width: 5px;
                    height: 5px;
                    border-radius: 50%;
                    background: #6366f1;
                    box-shadow: 0 0 6px #6366f1;
                }

                /* buttons */
                .nf-actions {
                    display: flex;
                    gap: 0.75rem;
                    flex-wrap: wrap;
                    justify-content: center;
                }
                .nf-btn-primary {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-family: 'DM Sans', sans-serif;
                    font-weight: 700;
                    font-size: 0.9375rem;
                    color: #fff;
                    text-decoration: none;
                    padding: 0.75rem 2rem;
                    border-radius: 10px;
                    background: linear-gradient(135deg, #6366f1 0%, #7c3aed 100%);
                    box-shadow: 0 6px 22px rgba(99,102,241,0.4);
                    transition: transform 0.15s, box-shadow 0.15s;
                }
                .nf-btn-primary:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 30px rgba(99,102,241,0.52);
                }
                .nf-btn-secondary {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-family: 'DM Sans', sans-serif;
                    font-weight: 600;
                    font-size: 0.9375rem;
                    color: #94a3b8;
                    text-decoration: none;
                    padding: 0.75rem 1.5rem;
                    border-radius: 10px;
                    border: 1px solid rgba(255,255,255,0.1);
                    background: rgba(255,255,255,0.04);
                    transition: all 0.15s;
                }
                .nf-btn-secondary:hover {
                    color: #f8fafc;
                    border-color: rgba(255,255,255,0.22);
                    background: rgba(255,255,255,0.08);
                    transform: translateY(-1px);
                }

                .nf-footnote {
                    font-size: 0.7rem;
                    letter-spacing: 0.14em;
                    text-transform: uppercase;
                    color: rgba(148,163,184,0.3);
                    font-family: 'DM Sans', monospace;
                }

                @media (max-width: 400px) {
                    .nf-btn-primary, .nf-btn-secondary { width: 100%; justify-content: center; }
                    .nf-actions { flex-direction: column; width: 100%; }
                }
            `}</style>

            <div className="nf-root">
                <div className="nf-card">

                    {/* floating icon */}
                    <div className="nf-icon-wrap">
                        <div className="nf-pulse" />
                        <div className="nf-icon">
                            <svg width="38" height="38" viewBox="0 0 24 24" fill="none"
                                 stroke="rgba(99,102,241,0.85)" strokeWidth="1.5"
                                 strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8"/>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                                <line x1="11" y1="8"  x2="11" y2="14" strokeWidth="2"/>
                                <line x1="11" y1="16" x2="11.01" y2="16" strokeWidth="2.5"/>
                            </svg>
                        </div>
                    </div>

                    {/* eyebrow */}
                    <div className="nf-pill">
                        <span className="nf-dot" />
                        Page Not Found
                    </div>

                    {/* giant 404 */}
                    <div className="nf-code">404</div>

                    {/* heading + description */}
                    <div className="nf-text">
                        <h1 className="nf-title">Lost in the void</h1>
                        <p className="nf-desc">
                            The page you're looking for doesn't exist or has been moved.
                            Head back home and keep your job search on track.
                        </p>
                    </div>

                    {/* actions */}
                    <div className="nf-actions">
                        <Link href="/" className="nf-btn-primary">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                                 stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                                <polyline points="9 22 9 12 15 12 15 22"/>
                            </svg>
                            Go Home
                        </Link>
                        <Link href="/dashboard" className="nf-btn-secondary">
                            Dashboard
                        </Link>
                    </div>

                    <p className="nf-footnote">HTTP 404 · Resource not found</p>
                </div>
            </div>
        </>
    )
}