const Stripe = require("stripe");
const { createClient } = require("@supabase/supabase-js");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Client Supabase côté serveur (service role pour accès sécurisé)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  try {
    const { cart } = req.body || {};

    if (!Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ error: "Panier vide" });
    }

    /**
     * cart attendu côté front :
     * [{ productId: 1, qty: 1 }]
     * (PAS de prix, PAS de nom)
     */

    const normalizedCart = cart.map((item) => ({
      productId: Number(item.productId),
      qty: Number(item.qty || 1),
    }));

    const hasInvalidItems = normalizedCart.some(
      (item) =>
        !Number.isInteger(item.productId) ||
        item.productId <= 0 ||
        !Number.isInteger(item.qty) ||
        item.qty <= 0
    );

    if (hasInvalidItems) {
      return res.status(400).json({ error: "Panier invalide" });
    }

    // 1️⃣ Récupérer les produits depuis Supabase
    const productIds = [
      ...new Set(normalizedCart.map((item) => item.productId)),
    ];

    const { data: products, error } = await supabase
      .from("products")
      .select("id, name, stripe_price_id, active")
      .in("id", productIds);

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ error: "Erreur Supabase" });
    }

    if (!products || products.length === 0) {
      return res.status(400).json({ error: "Produits introuvables" });
    }

    const productById = new Map(products.map((p) => [p.id, p]));
    const badRequest = (message) => {
      const err = new Error(message);
      err.statusCode = 400;
      throw err;
    };

    // 2️⃣ Construire les line_items Stripe depuis Supabase (SOURCE DE VÉRITÉ)
    const line_items = normalizedCart.map((item) => {
      const product = productById.get(item.productId);
      const priceId = product?.stripe_price_id;

      if (!product) {
        badRequest(`Produit introuvable : ${item.productId}`);
      }

      if (!product.active) {
        badRequest(`Produit inactif : ${item.productId}`);
      }

      if (typeof priceId !== "string" || !priceId.startsWith("price_")) {
        badRequest(`Stripe price_id invalide : ${item.productId}`);
      }

      return {
        price: priceId,
        quantity: item.qty,
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
    const status = err?.statusCode || 500;
    return res
      .status(status)
      .json({ error: status === 400 ? err.message : "Erreur Stripe" });
  }
};
// ------------- Exemple de requête POST attendue -------------
// {
//   "cart": [
//     { "productId": 1, "qty": 2 },
//     { "productId": 3, "qty": 1 }
//   ]
// }

// Réponses possibles :
// 200 : { "url": "https://checkout.stripe.com/..." }
// 400 : { "error": "Panier vide" }
// 400 : { "error": "Produits introuvables" }
// 500 : { "error": "Erreur Supabase" }
// 500 : { "error": "Erreur Stripe" }
