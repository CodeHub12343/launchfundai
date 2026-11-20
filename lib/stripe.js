import Stripe from 'stripe';

let _stripe = null;
export function getStripe() {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY is not set');
  _stripe = new Stripe(key, { apiVersion: '2024-06-20' });
  return _stripe;
}

export function platformFeeBps() {
  const n = Number(process.env.STRIPE_PLATFORM_FEE_BPS);
  return Number.isFinite(n) && n >= 0 && n <= 2000 ? n : 400;
}

export function appUrl() {
  return process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
}

export function isStripeConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}
