const Stripe = require("stripe");
const { createClient } = require("@supabase/supabase-js");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Client Supabase côté serveur (clé ANON ok ici car lecture seule)
const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  try {
    const { cart } = req.body;

    if (!Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ error: "Panier vide" });
    }

    /**
     * cart attendu côté front :
     * [{ id: 1, quantity: 1 }]
     * (PAS de prix, PAS de nom)
     */

    // 1️⃣ Récupérer les produits depuis Supabase
    const productIds = cart.map((item) => item.id);

    const { data: products, error } = await supabase
      .from("products")
      .select("id, name, price")
      .in("id", productIds)
      .eq("active", true);

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ error: "Erreur Supabase" });
    }

    if (!products || products.length === 0) {
      return res.status(400).json({ error: "Produits introuvables" });
    }

    // 2️⃣ Construire les line_items Stripe depuis Supabase (SOURCE DE VÉRITÉ)
    const line_items = cart.map((item) => {
      const product = products.find((p) => p.id === item.id);

      if (!product) {
        throw new Error(`Produit invalide : ${item.id}`);
      }

      return {
        price_data: {
          currency: "eur",
          product_data: {
            name: product.name,
          },
          unit_amount: Math.round(product.price * 100),
        },
        quantity: item.quantity || 1,
      };
    });

    // 3️⃣ URLs de redirection
    const origin =
      req.headers.origin ||
      process.env.SITE_URL ||
      `https://${req.headers.host}`;

    // 4️⃣ Création de la session Stripe
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items,
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cancel`,
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return res.status(500).json({ error: "Erreur Stripe" });
  }
};
// ------------- Exemple de requête POST attendue -------------
// {
//   "cart": [
//     { "id": 1, "quantity": 2 },
//     { "id": 3, "quantity": 1 }
//   ]
// }

// Réponses possibles :
// 200 : { "url": "https://checkout.stripe.com/..." }
// 400 : { "error": "Panier vide" }
// 400 : { "error": "Produits introuvables" }
// 500 : { "error": "Erreur Supabase" }
// 500 : { "error": "Erreur Stripe" }