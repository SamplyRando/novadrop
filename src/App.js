import React, { useState, useEffect, useRef } from 'react';
import { ShoppingCart, Star, X, Truck, ShieldCheck, Zap, Menu, Instagram, Facebook, Twitter, Trash2, ArrowRight, MessageSquare, Send, Sparkles, Loader2, Bot } from 'lucide-react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from "react-router-dom";

// Données fictives des produits (Niche Tech/Lifestyle)
const PRODUCTS = [
  {
    id: 1,
    name: "Montre Connectée Pro V3",
    price: 59.99,
    oldPrice: 129.99,
    rating: 4.8,
    reviews: 124,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800",
    tag: "Best Seller"
  },
  {
    id: 2,
    name: "Écouteurs Sans Fil NoiseCancel",
    price: 39.99,
    oldPrice: 89.99,
    rating: 4.9,
    reviews: 89,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800",
    tag: "-50%"
  },
  {
    id: 3,
    name: "Projecteur Mini Cinéma HD",
    price: 89.99,
    oldPrice: 199.99,
    rating: 4.7,
    reviews: 210,
    image: "https://images.unsplash.com/photo-1517260739337-6799d2eb9ce0?auto=format&fit=crop&q=80&w=800",
    tag: "Viral"
  },
  {
    id: 4,
    name: "Gourde Intelligente UV",
    price: 24.99,
    oldPrice: 49.99,
    rating: 4.6,
    reviews: 56,
    image: "https://images.unsplash.com/photo-1602143407151-0111419500be?auto=format&fit=crop&q=80&w=800",
    tag: "Nouveau"
  },
  {
    id: 5,
    name: "Support Laptop Ergonomique",
    price: 34.99,
    oldPrice: 69.99,
    rating: 4.9,
    reviews: 145,
    image: "https://images.unsplash.com/photo-1616353071855-2c045c4458ae?auto=format&fit=crop&q=80&w=800",
    tag: null
  },
  {
    id: 6,
    name: "Lampe de Bureau LED Tactile",
    price: 29.99,
    oldPrice: 59.99,
    rating: 4.5,
    reviews: 78,
    image: "https://images.unsplash.com/photo-1534073828943-f801091a7d58?auto=format&fit=crop&q=80&w=800",
    tag: "Promo"
  }
];

// Composant principal de la boutique (page d'accueil)
function AppHome({
  cart, setCart, isCartOpen, setIsCartOpen,
  notification, setNotification,
  mobileMenuOpen, setMobileMenuOpen,
  chatOpen, setChatOpen, chatMessages, setChatMessages,
  chatInput, setChatInput, isChatLoading, setIsChatLoading,
  pitchLoading, setPitchLoading, chatEndRef,
  handleCheckout, PRODUCTS, addToCart, removeFromCart, total, generatePitch, callGeminiAPI, apiKey
}) {
  // // Fonction pour ajouter au panier
  // const addToCart = (product) => {
  //   setCart([...cart, product]);
  //   setNotification(`${product.name} ajouté au panier !`);
  //   setIsCartOpen(true);
  //   setTimeout(() => setNotification(null), 3000);
  // };

  // const removeFromCart = (indexToRemove) => {
  //   setCart(cart.filter((_, index) => index !== indexToRemove));
  // };

  // const total = cart.reduce((acc, item) => acc + item.price, 0);

  const callGeminiAPI = async (prompt, systemPrompt) => {
    if (!apiKey) {
      alert("Clé API manquante. L'IA ne peut pas répondre.");
      return null;
    }

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] }
          }),
        }
      );

      if (!response.ok) throw new Error("Erreur API");
      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "Désolé, je n'ai pas compris.";
    } catch (error) {
      console.error("Gemini Error:", error);
      return "Une erreur est survenue avec l'IA.";
    }
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatInput("");
    setIsChatLoading(true);

    const systemPrompt = `
      Tu es Nova, l'assistant IA commercial de NovaDrop.
      Ton ton : Enthousiaste, serviable, un peu "marketing" mais honnête. Emoji friendly ✨.
      Tes connaissances :
      - Livraison gratuite > 50€. Expédition 24h. Retours 30 jours.
      - Produits : ${JSON.stringify(PRODUCTS.map(p => ({name: p.name, price: p.price, tag: p.tag})))}.
      Ta mission : Aider le client à choisir un produit selon ses besoins (cadeau, sport, tech...), ou répondre aux questions logistiques.
      Sois concis (max 3 phrases).
    `;

    // Contexte de conversation simple (juste le dernier message pour cette démo légère)
    const prompt = `L'utilisateur dit : "${userMsg}". Réponds en tant que Nova.`;

    const reply = await callGeminiAPI(prompt, systemPrompt);
    setChatMessages(prev => [...prev, { role: 'model', text: reply }]);
    setIsChatLoading(false);
  };

  const generatePitch = async (product) => {
    setPitchLoading(product.id);
    const systemPrompt = "Tu es un expert en copywriting e-commerce. Tu dois créer une phrase d'accroche (punchline) irrésistible.";
    const prompt = `Génère une phrase d'accroche courte (max 20 mots) très persuasive pour vendre ce produit : ${product.name} à ${product.price}€. Utilise un ton urgent et exclusif. Ajoute un emoji.`;
    
    const pitch = await callGeminiAPI(prompt, systemPrompt);
    if (pitch) {
      alert(`📢 L'avis de Nova :\n\n${pitch}`);
    }
    setPitchLoading(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      
      {/* --- BANDEAU PROMO --- */}
      <div className="bg-black text-white text-xs font-bold py-2 text-center tracking-widest uppercase">
        Livraison gratuite dès 50€ d'achat • Expédition en 24h
      </div>

      {/* --- NAVIGATION --- */}
      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 -ml-2 mr-2 md:hidden">
                <Menu size={24} />
              </button>
              <span className="text-2xl font-extrabold tracking-tighter italic">
                NOVA<span className="text-blue-600">DROP</span>
              </span>
            </div>
            
            <div className="hidden md:flex space-x-8 font-medium text-sm">
              <a href="#" className="hover:text-blue-600 transition">Nouveautés</a>
              <a href="#" className="hover:text-blue-600 transition">Best Sellers</a>
              <a href="#" className="hover:text-blue-600 transition">High-Tech</a>
              <a href="#" className="hover:text-blue-600 transition">Maison</a>
            </div>

            <div className="flex items-center space-x-4">
              <button 
                className="relative p-2 hover:bg-gray-100 rounded-full transition"
                onClick={() => setIsCartOpen(true)}
              >
                <ShoppingCart size={24} />
                {cart.length > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
                    {cart.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <div className="relative bg-gray-900 text-white overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&q=80&w=2000" 
            alt="Hero Background" 
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
        </div>
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8 text-center sm:text-left">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl mb-6">
            Le Futur est <br className="hidden sm:block" />
            <span className="text-blue-500">Déjà Ici.</span>
          </h1>
          <p className="mt-6 text-xl text-gray-300 max-w-2xl">
            Découvrez notre sélection exclusive d'objets connectés et d'accessoires lifestyle. 
            Des prix imbattables, une qualité premium.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center sm:justify-start">
            <button 
                onClick={() => setChatOpen(true)}
                className="px-8 py-4 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:text-lg transition shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
            >
              <Sparkles size={20} /> Trouver un cadeau (IA)
            </button>
            <a href="#products" className="px-8 py-4 border border-gray-500 text-base font-medium rounded-md text-white hover:bg-white/10 md:text-lg transition">
              Voir le catalogue
            </a>
          </div>
        </div>
      </div>

      {/* --- TRUST BADGES --- */}
      <div className="bg-white py-8 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <div className="p-3 bg-blue-50 rounded-full text-blue-600 mb-3">
                <Truck size={24} />
              </div>
              <h3 className="font-bold text-gray-900">Livraison Rapide</h3>
              <p className="text-sm text-gray-500">Expédié sous 24/48h avec suivi</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="p-3 bg-blue-50 rounded-full text-blue-600 mb-3">
                <ShieldCheck size={24} />
              </div>
              <h3 className="font-bold text-gray-900">Paiement Sécurisé</h3>
              <p className="text-sm text-gray-500">Transactions cryptées SSL 256-bit</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="p-3 bg-blue-50 rounded-full text-blue-600 mb-3">
                <Zap size={24} />
              </div>
              <h3 className="font-bold text-gray-900">Satisfait ou Remboursé</h3>
              <p className="text-sm text-gray-500">30 jours pour changer d'avis</p>
            </div>
          </div>
        </div>
      </div>

      {/* --- PRODUCT GRID --- */}
      <div id="products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-3xl font-extrabold text-gray-900">Tendances du moment 🔥</h2>
          <a href="#" className="text-blue-600 hover:text-blue-700 font-medium flex items-center">
            Tout voir <ArrowRight size={16} className="ml-1"/>
          </a>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-10 gap-x-6 lg:gap-x-8">
          {PRODUCTS.map((product) => (
            <div key={product.id} className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col">
              
              {/* Image Container */}
              <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-t-2xl bg-gray-200 relative h-64">
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                {product.tag && (
                  <span className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                    {product.tag}
                  </span>
                )}
                
                {/* Bouton IA "Convaincs-moi" */}
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        generatePitch(product);
                    }}
                    disabled={pitchLoading === product.id}
                    className="absolute bottom-4 right-4 bg-white/90 backdrop-blur text-purple-700 text-xs font-bold px-3 py-2 rounded-lg shadow-lg hover:bg-purple-600 hover:text-white transition flex items-center gap-1"
                >
                    {pitchLoading === product.id ? <Loader2 size={12} className="animate-spin"/> : <Sparkles size={12} />}
                    Convaincs-moi !
                </button>
              </div>

              {/* Content */}
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 line-clamp-1">
                      <a href="#">
                        <span aria-hidden="true" className="absolute inset-0" />
                        {product.name}
                      </a>
                    </h3>
                    <div className="flex items-center mt-1">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={14} fill={i < Math.floor(product.rating) ? "currentColor" : "none"} />
                        ))}
                      </div>
                      <span className="text-xs text-gray-400 ml-2">({product.reviews} avis)</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <p className="text-sm text-gray-400 line-through decoration-red-500">{product.oldPrice}€</p>
                    <p className="text-2xl font-extrabold text-gray-900">{product.price}€</p>
                  </div>
                  <button 
                    onClick={(e) => {
                        e.preventDefault();
                        addToCart(product);
                    }}
                    className="z-10 bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-600/20 active:scale-95 flex items-center justify-center"
                  >
                    <ShoppingCart size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- NEWSLETTER --- */}
      <div className="bg-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            -10% sur votre première commande
          </h2>
          <p className="mt-4 text-lg text-gray-300">
            Rejoignez le club NovaDrop et recevez nos offres exclusives avant tout le monde.
          </p>
          <div className="mt-8 max-w-md mx-auto sm:flex">
            <input
              type="email"
              required
              className="w-full px-5 py-3 placeholder-gray-500 focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-white focus:border-white sm:max-w-xs rounded-md"
              placeholder="Votre email"
            />
            <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3 sm:flex-shrink-0">
              <button
                type="submit"
                className="w-full flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500"
              >
                S'inscrire
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- FOOTER --- */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 md:flex md:items-center md:justify-between lg:px-8">
          <div className="flex justify-center space-x-6 md:order-2">
            <a href="#" className="text-gray-400 hover:text-gray-500"><Instagram size={24}/></a>
            <a href="#" className="text-gray-400 hover:text-gray-500"><Facebook size={24}/></a>
            <a href="#" className="text-gray-400 hover:text-gray-500"><Twitter size={24}/></a>
          </div>
          <div className="mt-8 md:mt-0 md:order-1">
            <p className="text-center text-base text-gray-400">
              &copy; 2024 NovaDrop Inc. Tous droits réservés. <a href="#" className="underline">CGV</a> • <a href="#" className="underline">Mentions Légales</a>
            </p>
          </div>
        </div>
      </footer>

      {/* --- CART SLIDEOVER (MODAL) --- */}
      {isCartOpen && (
        <div className="relative z-50">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsCartOpen(false)}
          />
          
          {/* Panel */}
          <div className="fixed inset-y-0 right-0 max-w-md w-full bg-white shadow-2xl flex flex-col transform transition-transform">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Mon Panier ({cart.length})</h2>
              <button onClick={() => setIsCartOpen(false)} className="text-gray-400 hover:text-gray-500">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="p-4 bg-gray-50 rounded-full text-gray-300">
                    <ShoppingCart size={48} />
                  </div>
                  <p className="text-gray-500">Votre panier est vide.</p>
                  <button 
                    onClick={() => setIsCartOpen(false)}
                    className="text-blue-600 font-medium hover:underline"
                  >
                    Continuer mes achats
                  </button>
                </div>
              ) : (
                <ul className="space-y-6">
                  {cart.map((item, index) => (
                    <li key={index} className="flex py-2">
                      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover object-center"
                        />
                      </div>
                      <div className="ml-4 flex flex-1 flex-col">
                        <div>
                          <div className="flex justify-between text-base font-medium text-gray-900">
                            <h3 className="line-clamp-2 pr-4">{item.name}</h3>
                            <p className="ml-4">{item.price}€</p>
                          </div>
                        </div>
                        <div className="flex flex-1 items-end justify-between text-sm">
                          <p className="text-gray-500">Qté 1</p>
                          <button
                            type="button"
                            onClick={() => removeFromCart(index)}
                            className="font-medium text-red-500 hover:text-red-700 flex items-center"
                          >
                            <Trash2 size={16} className="mr-1"/> Supprimer
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t border-gray-100 p-6 bg-gray-50">
                <div className="flex justify-between text-base font-medium text-gray-900 mb-4">
                  <p>Sous-total</p>
                  <p>{total.toFixed(2)}€</p>
                </div>
                <p className="mt-0.5 text-sm text-gray-500 mb-6">
                  Taxes et frais de port calculés à l'étape suivante.
                </p>
                <button
                  className="w-full flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-blue-700"
                  onClick={handleCheckout}
                >
                  Procéder au paiement
                </button>

                <div className="mt-6 flex justify-center text-center text-sm text-gray-500">
                  <p>
                    ou <button type="button" className="font-medium text-blue-600 hover:text-blue-500" onClick={() => setIsCartOpen(false)}>
                      Continuer vos achats <span aria-hidden="true"> &rarr;</span>
                    </button>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- WIDGET CHAT IA --- */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        {chatOpen && (
          <div className="mb-4 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col transition-all animate-in slide-in-from-bottom-5">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 flex justify-between items-center text-white">
              <div className="flex items-center gap-2">
                <Bot size={20} />
                <span className="font-bold">Assistant Nova ✨</span>
              </div>
              <button onClick={() => setChatOpen(false)} className="hover:bg-white/20 rounded p-1"><X size={16}/></button>
            </div>
            
            {/* Messages */}
            <div className="h-80 overflow-y-auto p-4 bg-gray-50 space-y-4">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                    msg.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-br-none' 
                      : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isChatLoading && (
                <div className="flex justify-start">
                    <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-2">
                        <Loader2 size={16} className="animate-spin text-blue-600"/>
                        <span className="text-xs text-gray-400">Nova réfléchit...</span>
                    </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleChatSubmit} className="p-3 bg-white border-t border-gray-100 flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Chercher un cadeau, une question..."
                className="flex-1 bg-gray-100 border-0 rounded-full px-4 text-sm focus:ring-2 focus:ring-blue-500"
              />
              <button 
                type="submit" 
                disabled={isChatLoading || !chatInput.trim()}
                className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        )}
        
        {/* Toggle Button */}
        <button
          onClick={() => setChatOpen(!chatOpen)}
          className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center"
        >
          {chatOpen ? <X size={24} /> : <MessageSquare size={24} />}
        </button>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-lg z-50 animate-bounce">
          {notification}
        </div>
      )}
    </div>
  );
}

// Page de succès de paiement
function SuccessPage({ setCart }) {
  const location = useLocation();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [order, setOrder] = React.useState(null);
  const navigate = useNavigate();

  // Récupérer le session_id depuis l'URL
  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const session_id = params.get('session_id');
    if (!session_id) {
      setError("Session de paiement introuvable.");
      setLoading(false);
      return;
    }
    // Vérifier le paiement côté serveur
    fetch(`/api/confirm-payment?session_id=${session_id}`)
      .then(res => res.json())
      .then(data => {
        if (data.paid) {
          setOrder(data);
          setCart([]);
          localStorage.removeItem("cart");
        } else {
          setError("Paiement non confirmé.");
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Erreur lors de la confirmation du paiement.");
        setLoading(false);
      });
  }, [location, setCart]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow max-w-md w-full text-center">
        <h1 className="text-2xl font-extrabold mb-2 text-red-600">❌ Erreur</h1>
        <p className="text-gray-600 mb-6">{error}</p>
        <button onClick={() => navigate("/")} className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg">Retour à la boutique</button>
      </div>
    </div>
  );
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow max-w-md w-full text-center">
        <h1 className="text-2xl font-extrabold mb-2">✅ Paiement confirmé</h1>
        <p className="text-gray-600 mb-2">Merci ! Nous préparons votre commande.</p>
        {order && (
          <div className="mb-4 text-sm text-gray-700">
            <div>Montant : <b>{(order.amount_total / 100).toFixed(2)} €</b></div>
            <div>Email : <b>{order.customer_email}</b></div>
            <div>Commande : <b>{order.order_id}</b></div>
          </div>
        )}
        <button onClick={() => navigate("/")} className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg">Retour à la boutique</button>
      </div>
    </div>
  );
}

// Page d'annulation de paiement
function CancelPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow max-w-md w-full text-center">
        <h1 className="text-2xl font-extrabold mb-2">❌ Paiement annulé</h1>
        <p className="text-gray-600 mb-6">Aucun paiement n’a été effectué.</p>
        <button onClick={() => navigate("/")} className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg">Retour à la boutique</button>
      </div>
    </div>
  );
}

// Nouveau composant App qui gère le routing
export default function App() {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [notification, setNotification] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // --- STATE IA ---
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { role: 'model', text: "Salut ! Je suis Nova ✨. Je peux vous aider à trouver le cadeau parfait ou répondre à vos questions sur la livraison." }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [pitchLoading, setPitchLoading] = useState(null); // ID du produit en cours de pitch
  const chatEndRef = useRef(null);

  // Panier persistant (localStorage)
  useEffect(() => {
    const storedCart = localStorage.getItem("cart");
    if (storedCart) {
      try {
        setCart(JSON.parse(storedCart));
      } catch (e) {
        localStorage.removeItem("cart");
      }
    }
  }, []);
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // Clé Gemini depuis env CRA
  const apiKey = process.env.REACT_APP_GEMINI_API_KEY || "";

  // Fonctions panier
  const addToCart = (product) => {
    setCart([...cart, product]);
    setNotification(`${product.name} ajouté au panier !`);
    setIsCartOpen(true);
    setTimeout(() => setNotification(null), 3000);
  };
  const removeFromCart = (indexToRemove) => {
    setCart(cart.filter((_, index) => index !== indexToRemove));
  };
  const total = cart.reduce((acc, item) => acc + item.price, 0);

  // Paiement Stripe
  const handleCheckout = async () => {
    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart }),
      });
      const data = await response.json();
      if (!response.ok) {
        console.error("Stripe API error:", data);
        alert(data?.error || "Erreur lors du paiement");
        return;
      }
      if (data.url) window.location.href = data.url;
      else alert("Erreur Stripe: pas d'URL");
    } catch (e) {
      console.error(e);
      alert("Erreur réseau / serveur");
    }
  };

  // --- FONCTIONS GEMINI ---
  const callGeminiAPI = async (prompt, systemPrompt) => {
    if (!apiKey) {
      alert("Clé API manquante. L'IA ne peut pas répondre.");
      return null;
    }
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] }
          }),
        }
      );
      if (!response.ok) throw new Error("Erreur API");
      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "Désolé, je n'ai pas compris.";
    } catch (error) {
      console.error("Gemini Error:", error);
      return "Une erreur est survenue avec l'IA.";
    }
  };
  const generatePitch = async (product) => {
    setPitchLoading(product.id);
    const systemPrompt = "Tu es un expert en copywriting e-commerce. Tu dois créer une phrase d'accroche (punchline) irrésistible.";
    const prompt = `Génère une phrase d'accroche courte (max 20 mots) très persuasive pour vendre ce produit : ${product.name} à ${product.price}€. Utilise un ton urgent et exclusif. Ajoute un emoji.`;
    const pitch = await callGeminiAPI(prompt, systemPrompt);
    if (pitch) {
      alert(`📢 L'avis de Nova :\n\n${pitch}`);
    }
    setPitchLoading(null);
  };

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, chatOpen]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <AppHome
            cart={cart} setCart={setCart} isCartOpen={isCartOpen} setIsCartOpen={setIsCartOpen}
            notification={notification} setNotification={setNotification}
            mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen}
            chatOpen={chatOpen} setChatOpen={setChatOpen} chatMessages={chatMessages} setChatMessages={setChatMessages}
            chatInput={chatInput} setChatInput={setChatInput} isChatLoading={isChatLoading} setIsChatLoading={setIsChatLoading}
            pitchLoading={pitchLoading} setPitchLoading={setPitchLoading} chatEndRef={chatEndRef}
            handleCheckout={handleCheckout}
            PRODUCTS={PRODUCTS}
            addToCart={addToCart}
            removeFromCart={removeFromCart}
            total={total}
            generatePitch={generatePitch}
            callGeminiAPI={callGeminiAPI}
            apiKey={apiKey}
          />
        } />
        <Route path="/success" element={<SuccessPage setCart={setCart} />} />
        <Route path="/cancel" element={<CancelPage />} />
      </Routes>
    </Router>
  );
}