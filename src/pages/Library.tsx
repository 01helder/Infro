import React, { useState, useEffect } from 'react';
import { BookOpen, Video, FileText, Music, Layout, ExternalLink, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';

interface Product {
  id: number;
  title: string;
  description: string;
  type: string;
  cover_image: string;
  creator_name: string;
  content_url: string;
}

const Library: React.FC = () => {
  const { token } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/library', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      });
  }, [token]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ebook': return <BookOpen size={16} />;
      case 'video': return <Video size={16} />;
      case 'pdf': return <FileText size={16} />;
      case 'audio': return <Music size={16} />;
      default: return <Layout size={16} />;
    }
  };

  if (loading) return <div className="p-8 text-center">Loading library...</div>;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">My Library</h1>
        <p className="text-sm text-gray-500">Access all your purchased infoproducts</p>
      </header>

      {products.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-200 border-dashed">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
            <BookOpen size={32} />
          </div>
          <h2 className="text-lg font-bold text-gray-900">Your library is empty</h2>
          <p className="text-gray-500 max-w-xs mx-auto mt-2">
            Start exploring the marketplace to find amazing courses and ebooks.
          </p>
          <a href="/" className="inline-block mt-6 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all">
            Browse Marketplace
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {products.map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm flex flex-col"
            >
              <div className="aspect-video relative overflow-hidden bg-gray-100">
                <img
                  src={product.cover_image || `https://picsum.photos/seed/${product.id}/400/225`}
                  alt={product.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-1">
                  {getTypeIcon(product.type)}
                  {product.type}
                </div>
              </div>
              
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="font-bold text-gray-900 line-clamp-1">{product.title}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2">{product.description}</p>
                  <p className="text-[10px] text-gray-400">By {product.creator_name}</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <a
                    href={product.content_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-indigo-600 text-white py-3 rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                  >
                    <ExternalLink size={16} />
                    Access Content
                  </a>
                  <button className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:text-amber-500 transition-colors">
                    <Star size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Library;
