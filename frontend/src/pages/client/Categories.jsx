import React, { useState, useEffect } from 'react';
import { categoriesAPI } from '../../services/api';
import { 
  FolderHeart, 
  Trash2, 
  CheckCircle2,
  Sparkles,
  HelpCircle,
  FolderOpen
} from 'lucide-react';

export const ClientCategories = () => {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await categoriesAPI.list();
      setCategories(data);
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await categoriesAPI.create(name, description);
      setName('');
      setDescription('');
      setModalOpen(false);
      fetchCategories();
    } catch (e) {
      alert("Error creating category");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category? All associated questions will be removed.")) return;
    try {
      await categoriesAPI.delete(id);
      fetchCategories();
    } catch (e) {
      alert("Failed to delete category");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Review Categories</h1>
          <p className="text-slate-400 text-sm mt-1">Structure your AI Review categories to organize audits.</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 transition-all"
        >
          Add New Category
        </button>
      </div>

      {/* Grid listing */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {categories.length === 0 ? (
          <div className="md:col-span-3 p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl">
            <FolderOpen className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-400">No categories found. Let's create one!</p>
          </div>
        ) : (
          categories.map((cat) => (
            <div 
              key={cat.id}
              className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl hover:border-slate-700/60 transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-blue-600/10 text-blue-400 border border-blue-500/10">
                    <FolderHeart className="w-5 h-5" />
                  </div>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="text-slate-500 hover:text-red-400 transition-colors p-1 rounded hover:bg-slate-950"
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>
                </div>

                <div>
                  <h3 className="font-extrabold text-white text-base group-hover:text-blue-400 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-slate-500 text-xs mt-1.5 leading-relaxed truncate-2-lines min-h-[2.5rem]">
                    {cat.description || 'No description provided.'}
                  </p>
                </div>
              </div>

              {/* Tally details */}
              <div className="mt-6 pt-4 border-t border-slate-850 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-slate-500" />
                  <span>{cat.questions?.length || 0} Audit Questions</span>
                </div>
                <span className="text-[10px] font-bold text-slate-500">
                  {new Date(cat.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fadeIn">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
            <div>
              <h2 className="text-lg font-extrabold text-white">Create New Category</h2>
              <p className="text-xs text-slate-400 mt-1">Add a container for calls auditing.</p>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Category Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Appointment Booked, Inventory Discussion"
                  className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="What should the AI look for in this call?"
                  className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 transition-all resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold rounded-xl text-sm transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-blue-600/25 transition-all"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
