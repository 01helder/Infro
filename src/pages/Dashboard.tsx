import React, { useState, useEffect } from 'react';
import { Plus, TrendingUp, DollarSign, Users, Package, Trash2, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';

interface Product {
  id: number;
  title: string;
  price: number;
  category: string;
  type: string;
}

interface Stats {
  total_sales: number;
  total_revenue: number;
  net_earnings: number;
}

const Dashboard: React.FC = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Marketing');
  const [type, setType] = useState('ebook');
  const [coverImage, setCoverImage] = useState('');
  const [contentUrl, setContentUrl] = useState('');

  const fetchDashboard = async () => {
    try {
      const res = await fetch('/api/creator/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setStats(data.stats);
      setProducts(data.products);
      setLoading(false);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [token]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title, description, price: parseFloat(price), category, type,
          cover_image: coverImage, content_url: contentUrl
        })
      });
      if (res.ok) {
        setShowUpload(false);
        fetchDashboard();
        // Reset form
        setTitle(''); setDescription(''); setPrice(''); setCoverImage(''); setContentUrl('');
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading dashboard...</div>;

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Creator Dashboard</h1>
          <p className="text-sm text-gray-500">Manage your products and earnings</p>
        </div>
        <button
          onClick={() => setShowUpload(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-100"
        >
          <Plus size={18} />
          Upload Product
        </button>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-2">
          <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
            <DollarSign size={20} />
          </div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Net Earnings</p>
          <p className="text-2xl font-black text-gray-900">${(stats?.net_earnings || 0).toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-2">
          <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600">
            <TrendingUp size={20} />
          </div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Sales</p>
          <p className="text-2xl font-black text-gray-900">{stats?.total_sales || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-2">
          <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600">
            <Package size={20} />
          </div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Products</p>
          <p className="text-2xl font-black text-gray-900">{products.length}</p>
        </div>
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-bold text-gray-900">Your Products</h2>
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-bold text-gray-700">Product</th>
                <th className="px-6 py-4 font-bold text-gray-700">Category</th>
                <th className="px-6 py-4 font-bold text-gray-700">Price</th>
                <th className="px-6 py-4 font-bold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{p.title}</td>
                  <td className="px-6 py-4 text-gray-500">{p.category}</td>
                  <td className="px-6 py-4 font-bold text-indigo-600">${p.price.toFixed(2)}</td>
                  <td className="px-6 py-4 flex items-center gap-3">
                    <button className="text-gray-400 hover:text-indigo-600">
                      <ExternalLink size={16} />
                    </button>
                    <button className="text-gray-400 hover:text-red-600">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    You haven't uploaded any products yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {showUpload && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-full max-w-lg rounded-3xl p-8 space-y-6 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Upload New Product</h2>
              <button onClick={() => setShowUpload(false)} className="text-gray-400 hover:text-gray-600">
                <Plus size={24} className="rotate-45" />
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 uppercase">Title</label>
                <input
                  required
                  type="text"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Mastering React 19"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 uppercase">Description</label>
                <textarea
                  required
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 h-24"
                  placeholder="Detailed description of your product..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 uppercase">Price ($)</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="49.99"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 uppercase">Category</label>
                  <select
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option>Marketing</option>
                    <option>Design</option>
                    <option>Finance</option>
                    <option>Health</option>
                    <option>Tech</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 uppercase">Type</label>
                <select
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="ebook">E-Book</option>
                  <option value="course">Online Course</option>
                  <option value="pdf">PDF Guide</option>
                  <option value="audio">Audio Lessons</option>
                  <option value="video">Video Training</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 uppercase">Cover Image URL</label>
                <input
                  type="url"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="https://example.com/image.jpg"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 uppercase">Content URL</label>
                <input
                  required
                  type="url"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="https://example.com/my-course"
                  value={contentUrl}
                  onChange={(e) => setContentUrl(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
              >
                Publish Product
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
