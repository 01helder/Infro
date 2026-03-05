import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Star, CheckCircle, ShieldCheck, Share2, Copy, ShoppingCart, ArrowLeft, BookOpen, Video, FileText, Music, Layout } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';

interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  type: string;
  cover_image: string;
  rating: number;
  creator_name: string;
  content_url: string;
}

const ProductDetails: React.FC = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const affiliateCode = searchParams.get('ref');
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);
  const [affiliateLink, setAffiliateLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then(res => res.json())
      .then(data => {
        setProduct(data);
        setLoading(false);
      });
  }, [id]);

  const handleBuy = async () => {
    if (!user) return navigate('/login');
    setBuying(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId: id, affiliateCode })
      });
      if (res.ok) {
        alert('Purchase successful! Redirecting to library...');
        navigate('/library');
      } else {
        const err = await res.json();
        alert(err.error || 'Purchase failed');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setBuying(false);
    }
  };

  const generateAffiliateLink = async () => {
    if (!user) return navigate('/login');
    try {
      const res = await fetch(`/api/affiliates/join/${id}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      const link = `${window.location.origin}/product/${id}?ref=${data.code}`;
      setAffiliateLink(link);
    } catch (e) {
      console.error(e);
    }
  };

  const copyToClipboard = () => {
    if (affiliateLink) {
      navigator.clipboard.writeText(affiliateLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading product...</div>;
  if (!product) return <div className="p-8 text-center">Product not found.</div>;

  return (
    <div className="space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors">
        <ArrowLeft size={18} />
        <span className="text-sm font-medium">Back</span>
      </button>

      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="aspect-video relative overflow-hidden bg-gray-100">
          <img
            src={product.cover_image || `https://picsum.photos/seed/${product.id}/800/450`}
            alt={product.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
            <span className="bg-indigo-600/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
              {product.category}
            </span>
            <h1 className="text-2xl font-bold">{product.title}</h1>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1 text-amber-400">
                <Star size={16} fill="currentColor" />
                <span className="font-bold text-white">{product.rating || 4.5}</span>
              </div>
              <span className="text-white/80">By {product.creator_name}</span>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              <section className="space-y-3">
                <h2 className="text-lg font-bold text-gray-900">About this product</h2>
                <p className="text-gray-600 leading-relaxed">{product.description}</p>
              </section>

              <section className="space-y-4">
                <h2 className="text-lg font-bold text-gray-900">What's included</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { icon: CheckCircle, text: 'Lifetime access' },
                    { icon: CheckCircle, text: 'Certificate of completion' },
                    { icon: CheckCircle, text: 'Downloadable resources' },
                    { icon: CheckCircle, text: 'Support from creator' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                      <item.icon size={16} className="text-indigo-600" />
                      <span>{item.text}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="space-y-6">
              <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 space-y-6">
                <div className="space-y-1">
                  <p className="text-sm text-indigo-600 font-medium">Price</p>
                  <p className="text-4xl font-black text-gray-900">${product.price.toFixed(2)}</p>
                </div>

                <button
                  onClick={handleBuy}
                  disabled={buying}
                  className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {buying ? 'Processing...' : (
                    <>
                      <ShoppingCart size={20} />
                      Buy Now
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-2 text-[10px] text-indigo-400 font-medium uppercase tracking-widest">
                  <ShieldCheck size={14} />
                  Secure Payment Guaranteed
                </div>
              </div>

              {user && (
                <div className="bg-white p-6 rounded-2xl border border-gray-200 space-y-4">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <Share2 size={16} className="text-indigo-600" />
                    Affiliate Program
                  </h3>
                  <p className="text-xs text-gray-500">
                    Promote this product and earn 50% commission on every sale!
                  </p>
                  
                  {affiliateLink ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-100">
                        <input
                          type="text"
                          readOnly
                          value={affiliateLink}
                          className="bg-transparent text-[10px] text-gray-500 flex-1 outline-none"
                        />
                        <button
                          onClick={copyToClipboard}
                          className="text-indigo-600 hover:text-indigo-700 p-1"
                        >
                          <Copy size={14} />
                        </button>
                      </div>
                      {copied && <p className="text-[10px] text-green-600 font-medium">Link copied!</p>}
                    </div>
                  ) : (
                    <button
                      onClick={generateAffiliateLink}
                      className="w-full border border-indigo-600 text-indigo-600 py-3 rounded-xl text-xs font-bold hover:bg-indigo-50 transition-colors"
                    >
                      Generate Affiliate Link
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
