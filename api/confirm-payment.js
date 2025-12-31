// /api/confirm-payment.js
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Optionnel: Supabase
let supabase = null;
if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
  const { createClient } = require('@supabase/supabase-js');
  supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

module.exports = async (req, res) => {
  const { session_id } = req.query;
  if (!session_id) {
    res.status(400).json({ error: 'session_id requis' });
    return;
  }
  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (session.payment_status !== 'paid') {
      res.status(200).json({ paid: false });
      return;
    }
    // Optionnel: sauvegarde Supabase (idempotent)
    let order_id = null;
    if (supabase) {
      try {
        // Vérifier si déjà enregistré
        const { data: existing } = await supabase
          .from('orders')
          .select('id')
          .eq('session_id', session_id)
          .maybeSingle();
        if (existing && existing.id) {
          order_id = existing.id;
        } else {
          const { data: inserted, error } = await supabase
            .from('orders')
            .insert([
              {
                session_id,
                email: session.customer_details?.email || session.customer_email,
                amount_total: session.amount_total,
                currency: session.currency,
                items: session.display_items || null,
                status: session.payment_status,
              },
            ])
            .select('id')
            .single();
          if (inserted && inserted.id) order_id = inserted.id;
          if (error) console.error('Supabase insert error:', error);
        }
      } catch (e) {
        console.error('Supabase error:', e);
      }
    } else {
      console.log('Supabase not configured');
    }
    res.status(200).json({
      paid: true,
      amount_total: session.amount_total,
      customer_email: session.customer_details?.email || session.customer_email,
      order_id,
    });
  } catch (err) {
    console.error('Stripe confirm error:', err);
    res.status(500).json({ error: 'Erreur lors de la confirmation du paiement' });
  }
};
