import React, { useState, useEffect } from 'react';
import { Share2, DollarSign, TrendingUp, Copy, ExternalLink, Package } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';

interface AffiliateLink {
  code: string;
  title: string;
  price: number;
  product_id: number;
}

const Affiliate: React.FC = () => {
  const { user, token } = useAuth();
  const [links, setLinks] = useState<AffiliateLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/affiliates/my-links', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setLinks(data);
        setLoading(false);
      });
  }, [token]);

  const copyToClipboard = (code: string, productId: number) => {
    const link = `${window.location.origin}/product/${productId}?ref=${code}`;
    navigator.clipboard.writeText(link);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  if (loading) return <div className="p-8 text-center">Loading affiliate dashboard...</div>;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Affiliate Center</h1>
        <p className="text-sm text-gray-500">Promote products and earn commissions</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-2">
          <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
            <DollarSign size={20} />
          </div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Earnings</p>
          <p className="text-2xl font-black text-gray-900">${(user?.balance || 0).toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-2">
          <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600">
            <TrendingUp size={20} />
          </div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Links</p>
          <p className="text-2xl font-black text-gray-900">{links.length}</p>
        </div>
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-bold text-gray-900">Your Affiliate Links</h2>
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-bold text-gray-700">Product</th>
                <th className="px-6 py-4 font-bold text-gray-700">Price</th>
                <th className="px-6 py-4 font-bold text-gray-700">Commission (50%)</th>
                <th className="px-6 py-4 font-bold text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {links.map((link) => (
                <tr key={link.code} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{link.title}</td>
                  <td className="px-6 py-4 text-gray-500">${link.price.toFixed(2)}</td>
                  <td className="px-6 py-4 font-bold text-emerald-600">${(link.price * 0.45).toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => copyToClipboard(link.code, link.product_id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                        copied === link.code ? "bg-emerald-50 text-emerald-600" : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                      }`}
                    >
                      {copied === link.code ? (
                        <>
                          <Copy size={14} />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Share2 size={14} />
                          Copy Link
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
              {links.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    You haven't joined any affiliate programs yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="bg-indigo-600 rounded-3xl p-8 text-white space-y-4 relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <h2 className="text-xl font-bold">How it works?</h2>
          <p className="text-white/80 text-sm max-w-md">
            Find products you love in the marketplace, click "Generate Affiliate Link", and share it with your audience. You'll earn a commission on every successful sale!
          </p>
          <a href="/" className="inline-block mt-4 bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-all">
            Find Products to Promote
          </a>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-400/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />
      </div>
    </div>
  );
};

export default Affiliate;
