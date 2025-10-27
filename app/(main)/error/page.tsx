"use client";

import { Button } from "@/components/ui/button";

const ErrorPage: React.FC = () => {
    const handleReload = () => globalThis.location.reload();

    return (
        <main
            role="alert"
            aria-live="assertive"
            style={{
                minHeight: '100vh',
                display: 'grid',
                placeItems: 'center',
                background: 'linear-gradient(180deg,#0f172a 0%, #071033 100%)',
                padding: '4rem 1rem',
                color: 'var(--text-color, #e6eef8)',
                fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
            }}
        >
            <section
                style={{
                    width: '100%',
                    maxWidth: 720,
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.02))',
                    borderRadius: 12,
                    padding: '2.25rem',
                    boxShadow: '0 8px 30px rgba(2,6,23,0.6)',
                    textAlign: 'center',
                    border: '1px solid rgba(255,255,255,0.04)',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                    <svg width="56" height="56" viewBox="0 0 24 24" fill="none" aria-hidden>
                        <circle cx="12" cy="12" r="10" fill="rgba(255,77,79,0.12)" />
                        <path d="M12 8v5" stroke="#FF4D4F" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M12 16h.01" stroke="#FF4D4F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div style={{ textAlign: 'left' }}>
                        <h1 style={{ margin: 0, fontSize: '1.6rem', letterSpacing: '-0.02em' }}>Something went wrong</h1>
                        <p style={{ margin: '6px 0 0', color: 'rgba(230,238,248,0.9)' }}>
                            An unexpected error occurred. You can try reloading the page or report the problem.
                        </p>
                    </div>
                </div>

                <div style={{ marginTop: '1.5rem', display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Button onClick={handleReload} className="btn-primary" aria-label="Reload page">
                        Reload
                    </Button>

                    <Button
                        onClick={() => {
                            // intentionally throws an unhandled error for testing error boundary behavior
                            throw new Error('Breaking the world!');
                        }}
                        className="btn-danger"
                        aria-label="Break the world"
                    >
                        Break the world
                    </Button>
                </div>

                <small style={{ display: 'block', marginTop: 16, color: 'rgba(230,238,248,0.6)' }}>
                    If the problem persists, contact support or check the console for details.
                </small>
            </section>
        </main>
    );
};

export default ErrorPage;