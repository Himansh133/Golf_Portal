import { createServerSupabaseClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase.from('draws').select('*').order('draw_date', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request) {
  const supabase = createServerSupabaseClient();
  const body = await request.json();
  const { action } = body;

  if (action === 'create') {
    const { data, error } = await supabase.from('draws')
      .insert({ draw_date: body.draw_date, draw_type: body.draw_type || 'random' })
      .select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  if (action === 'simulate' || action === 'publish') {
    const drawId = body.draw_id;

    // Generate 5 winning numbers (1-45 range, Stableford)
    let winningNumbers;
    if (body.draw_type === 'algorithmic') {
      // Weighted by most frequent user scores
      const { data: allScores } = await supabase.from('scores').select('score');
      const freq = {};
      allScores?.forEach(s => { freq[s.score] = (freq[s.score] || 0) + 1; });
      const weighted = [];
      for (let i = 1; i <= 45; i++) {
        const w = freq[i] || 1;
        for (let j = 0; j < w; j++) weighted.push(i);
      }
      const nums = new Set();
      while (nums.size < 5) nums.add(weighted[Math.floor(Math.random() * weighted.length)]);
      winningNumbers = [...nums].sort((a, b) => a - b);
    } else {
      const nums = new Set();
      while (nums.size < 5) nums.add(Math.floor(Math.random() * 45) + 1);
      winningNumbers = [...nums].sort((a, b) => a - b);
    }

    const status = action === 'publish' ? 'published' : 'simulated';
    const updates = { winning_numbers: winningNumbers, status };
    if (action === 'publish') updates.published_at = new Date().toISOString();

    const { data: draw, error } = await supabase.from('draws')
      .update(updates).eq('id', drawId).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // If publishing, calculate winners
    if (action === 'publish') {
      const { data: entries } = await supabase.from('draw_entries')
        .select('*, profiles(email, full_name)').eq('draw_id', drawId);

      // Calculate prize pool
      const { count: activeCount } = await supabase.from('profiles')
        .select('*', { count: 'exact', head: true }).eq('subscription_status', 'active');
      const poolTotal = (activeCount || 0) * 5; // £5 per sub to pool
      const prevRollover = draw.jackpot_rollover || 0;

      const pool5 = poolTotal * 0.4 + prevRollover;
      const pool4 = poolTotal * 0.35;
      const pool3 = poolTotal * 0.25;

      const winners = [];
      entries?.forEach(entry => {
        const matched = entry.scores.filter(s => winningNumbers.includes(s));
        if (matched.length >= 3) {
          let matchType, prize;
          if (matched.length >= 5) { matchType = '5-match'; prize = pool5; }
          else if (matched.length === 4) { matchType = '4-match'; prize = pool4; }
          else { matchType = '3-match'; prize = pool3; }
          winners.push({
            draw_id: drawId, user_id: entry.user_id,
            match_type: matchType, matched_numbers: matched, prize_amount: prize,
          });
        }
      });

      // Split prizes among same-tier winners
      const tierCounts = {};
      winners.forEach(w => { tierCounts[w.match_type] = (tierCounts[w.match_type] || 0) + 1; });
      winners.forEach(w => { w.prize_amount = (w.prize_amount / tierCounts[w.match_type]).toFixed(2); });

      if (winners.length > 0) {
        await supabase.from('winners').insert(winners);
      }

      // Rollover jackpot if no 5-match winner
      if (!winners.some(w => w.match_type === '5-match')) {
        await supabase.from('draws').update({ jackpot_rollover: pool5 }).eq('id', drawId);
      }

      await supabase.from('draws').update({ prize_pool_total: poolTotal }).eq('id', drawId);
    }

    return NextResponse.json(draw);
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
