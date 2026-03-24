import { createServerSupabaseClient } from '@/lib/supabase';
import { stripe } from '@/lib/stripe';
import { NextResponse } from 'next/server';

export async function POST(request) {
  const supabase = createServerSupabaseClient();
  const { userId, plan } = await request.json();

  // Get or create Stripe customer
  const { data: profile } = await supabase
    .from('profiles')
    .select('email, stripe_customer_id')
    .eq('id', userId)
    .single();

  let customerId = profile?.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({ email: profile.email, metadata: { supabase_id: userId } });
    customerId = customer.id;
    await supabase.from('profiles').update({ stripe_customer_id: customerId }).eq('id', userId);
  }

  // Create checkout session
  const priceId = plan === 'yearly'
    ? process.env.STRIPE_YEARLY_PRICE_ID
    : process.env.STRIPE_MONTHLY_PRICE_ID;

  // If no price IDs configured, use ad-hoc pricing
  const lineItems = priceId
    ? [{ price: priceId, quantity: 1 }]
    : [{
        price_data: {
          currency: 'gbp',
          product_data: { name: `GolfCharity ${plan === 'yearly' ? 'Yearly' : 'Monthly'} Subscription` },
          unit_amount: plan === 'yearly' ? 9999 : 999,
          recurring: { interval: plan === 'yearly' ? 'year' : 'month' },
        },
        quantity: 1,
      }];

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: lineItems,
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?subscribed=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?cancelled=true`,
    metadata: { supabase_id: userId, plan },
  });

  return NextResponse.json({ url: session.url });
}
