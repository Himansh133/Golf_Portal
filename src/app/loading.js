export default function Loading() {
  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: 16,
    }}>
      <div className="loading-spinner" style={{ width: 40, height: 40 }}></div>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading...</p>
    </div>
  );
}
