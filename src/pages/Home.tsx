import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Star, BookOpen, Video, FileText, Music, Layout } from 'lucide-react';
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
}

const Home: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const categories = ['All', 'Marketing', 'Design', 'Finance', 'Health', 'Tech'];

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      });
  }, []);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'All' || p.category === category;
    return matchesSearch && matchesCategory;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ebook': return <BookOpen size={14} />;
      case 'video': return <Video size={14} />;
      case 'pdf': return <FileText size={14} />;
      case 'audio': return <Music size={14} />;
      default: return <Layout size={14} />;
    }
  };

  return (
    <div className="space-y-6">
      <header className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">Discover Infoproducts</h1>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search courses, ebooks..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                category === cat ? "bg-indigo-600 text-white" : "bg-white text-gray-600 border border-gray-200 hover:border-indigo-600"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-64 bg-gray-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {filteredProducts.map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -4 }}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all"
            >
              <Link to={`/product/${product.id}`}>
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
                
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-indigo-600">{product.category}</span>
                    <div className="flex items-center gap-1 text-xs text-amber-500">
                      <Star size={12} fill="currentColor" />
                      <span className="font-bold">{product.rating || 4.5}</span>
                    </div>
                  </div>
                  
                  <h3 className="font-bold text-gray-900 line-clamp-1">{product.title}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2">{product.description}</p>
                  
                  <div className="pt-2 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-gray-400">By {product.creator_name}</p>
                      <p className="text-lg font-black text-indigo-600">${product.price.toFixed(2)}</p>
                    </div>
                    <button className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-indigo-600 hover:text-white transition-colors">
                      View Details
                    </button>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      {filteredProducts.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500">No products found matching your search.</p>
        </div>
      )}
    </div>
  );
};

export default Home;
