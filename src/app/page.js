import Link from 'next/link';

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="hero-content fade-in">
          <h1>Play Golf. <span>Win Prizes.</span> Change Lives.</h1>
          <p>Subscribe, enter your Stableford scores, and compete in monthly draws — all while supporting the charities you care about most.</p>
          <div className="hero-buttons">
            <Link href="/signup" className="btn btn-primary">Start Your Journey</Link>
            <Link href="/charities" className="btn btn-secondary">Explore Charities</Link>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="section" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container">
          <h2 className="section-title" style={{ textAlign: 'center' }}>How It Works</h2>
          <p className="section-subtitle" style={{ textAlign: 'center' }}>Four simple steps to play, win, and give back</p>
          <div className="grid-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
            {[
              { n: '1', title: 'Subscribe', desc: 'Choose monthly or yearly. A portion goes to your favourite charity.' },
              { n: '2', title: 'Enter Scores', desc: 'Submit your latest 5 Stableford scores. Quick and simple.' },
              { n: '3', title: 'Monthly Draw', desc: 'Your scores become your numbers. Match to win from the prize pool.' },
              { n: '4', title: 'Give Back', desc: 'Every subscription supports charities. You decide where it goes.' },
            ].map((s) => (
              <div key={s.n} className="card fade-in" style={{ textAlign: 'center' }}>
                <div className="step-number" style={{ margin: '0 auto 16px' }}>{s.n}</div>
                <h3 style={{ marginBottom: 8, fontWeight: 700 }}>{s.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Prize Tiers */}
      <section className="section">
        <div className="container" style={{ maxWidth: 600 }}>
          <h2 className="section-title" style={{ textAlign: 'center' }}>Prize Pool Breakdown</h2>
          <p className="section-subtitle" style={{ textAlign: 'center' }}>Every month, a share of subscriptions fuels the prize pool</p>
          <div className="card card-glow">
            <div className="prize-tier">
              <div><strong>5-Number Match</strong><br/><span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Jackpot — rolls over if unclaimed</span></div>
              <div className="prize-share">40%</div>
            </div>
            <div className="prize-tier">
              <div><strong>4-Number Match</strong></div>
              <div className="prize-share">35%</div>
            </div>
            <div className="prize-tier">
              <div><strong>3-Number Match</strong></div>
              <div className="prize-share">25%</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section" style={{ background: 'var(--bg-secondary)', textAlign: 'center' }}>
        <div className="container">
          <h2 className="section-title">Ready to Make a Difference?</h2>
          <p className="section-subtitle">Join golfers who play with purpose.</p>
          <Link href="/signup" className="btn btn-primary" style={{ fontSize: '1.1rem', padding: '16px 40px' }}>
            Subscribe Now
          </Link>
        </div>
      </section>
    </>
  );
}
