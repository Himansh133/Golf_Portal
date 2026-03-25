import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="auth-page">
      <div className="auth-card card card-glow fade-in" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: 16, fontWeight: 900 }}>404</div>
        <h1>Page Not Found</h1>
        <p style={{ marginBottom: 24 }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link href="/" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
          Back to Home
        </Link>
      </div>
    </div>
  );
}
