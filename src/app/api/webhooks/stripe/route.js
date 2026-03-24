import { createServerSupabaseClient } from '@/lib/supabase';
import { stripe } from '@/lib/stripe';
import { NextResponse } from 'next/server';

export async function POST(request) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature');
  let event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  const supabase = createServerSupabaseClient();

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const userId = session.metadata.supabase_id;
      const plan = session.metadata.plan;
      await supabase.from('profiles').update({
        subscription_status: 'active',
        subscription_plan: plan,
        stripe_subscription_id: session.subscription,
        subscription_renewed_at: new Date().toISOString(),
      }).eq('id', userId);
      break;
    }
    case 'customer.subscription.updated': {
      const sub = event.data.object;
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id')
        .eq('stripe_subscription_id', sub.id);
      if (profiles?.[0]) {
        await supabase.from('profiles').update({
          subscription_status: sub.status === 'active' ? 'active' : 'lapsed',
          subscription_expires_at: new Date(sub.current_period_end * 1000).toISOString(),
        }).eq('id', profiles[0].id);
      }
      break;
    }
    case 'customer.subscription.deleted': {
      const sub = event.data.object;
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id')
        .eq('stripe_subscription_id', sub.id);
      if (profiles?.[0]) {
        await supabase.from('profiles').update({
          subscription_status: 'cancelled',
        }).eq('id', profiles[0].id);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
