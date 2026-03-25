'use client';

export default function Error({ error, reset }) {
  return (
    <div className="auth-page">
      <div className="auth-card card card-glow fade-in" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: 16 }}>⚠️</div>
        <h1>Something Went Wrong</h1>
        <p style={{ marginBottom: 24 }}>
          {error?.message || 'An unexpected error occurred. Please try again.'}
        </p>
        <button onClick={reset} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
          Try Again
        </button>
      </div>
    </div>
  );
}
