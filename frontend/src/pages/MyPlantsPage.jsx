import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { HealthBadge } from '../components/HealthBadge';
import {
  Sprout,
  Plus,
  Search,
  Filter,
  Calendar,
  MapPin,
  Droplets,
  Sun,
  Scan,
  Edit2,
  Trash2,
  X,
  Loader2,
  Check,
  AlertCircle
} from 'lucide-react';

export const MyPlantsPage = () => {
  const navigate = useNavigate();
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingPlantId, setEditingPlantId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    species: '',
    category: 'Vegetable',
    planting_date: '',
    location: '',
    watering_frequency: 'Every 2-3 days',
    sunlight_requirement: 'Full sun (6+ hours)',
    image_url: '',
    notes: ''
  });

  const categories = ['All', 'Vegetable', 'Fruit', 'Grain', 'Flower', 'Herb', 'Tree', 'Houseplant', 'Other'];

  const fetchPlants = async () => {
    try {
      setLoading(true);
      const data = await api.plants.getAll();
      setPlants(data || []);
    } catch (err) {
      console.error("Failed to load plants:", err);
      setError("Failed to load plant profiles. Please check backend connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlants();
  }, []);

  const openAddModal = () => {
    setIsEditing(false);
    setEditingPlantId(null);
    setFormData({
      name: '',
      species: '',
      category: 'Vegetable',
      planting_date: new Date().toISOString().split('T')[0],
      location: '',
      watering_frequency: 'Every 2-3 days',
      sunlight_requirement: 'Full sun (6+ hours)',
      image_url: '',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (plant) => {
    setIsEditing(true);
    setEditingPlantId(plant.id);
    setFormData({
      name: plant.name,
      species: plant.species || '',
      category: plant.category || 'Vegetable',
      planting_date: plant.planting_date || '',
      location: plant.location || '',
      watering_frequency: plant.watering_frequency || '',
      sunlight_requirement: plant.sunlight_requirement || '',
      image_url: plant.image_url || '',
      notes: plant.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleDeletePlant = async (plantId, plantName) => {
    if (!window.confirm(`Are you sure you want to delete '${plantName}'?`)) return;
    try {
      await api.plants.delete(plantId);
      setPlants(prev => prev.filter(p => p.id !== plantId));
    } catch (err) {
      alert("Failed to delete plant: " + err.message);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isEditing) {
        const updated = await api.plants.update(editingPlantId, formData);
        setPlants(prev => prev.map(p => (p.id === editingPlantId ? { ...p, ...updated } : p)));
      } else {
        const created = await api.plants.create(formData);
        setPlants(prev => [created, ...prev]);
      }
      setIsModalOpen(false);
    } catch (err) {
      alert("Error saving plant: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredPlants = plants.filter(plant => {
    const matchesSearch = plant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (plant.species && plant.species.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (plant.location && plant.location.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || plant.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-300">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-emerald-950 dark:text-white">
            My Plant & Crop Profiles
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Track individual crops, garden beds, and houseplants across cultivation cycles
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Plant</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 p-4 rounded-2xl glass-panel border border-emerald-100 dark:border-emerald-900/60 shadow-xs">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search plant name, species, location..."
            className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-gray-200 dark:border-emerald-800 bg-white/80 dark:bg-emerald-950/40 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Categories Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Plant Grid */}
      {loading ? (
        <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
          <p className="text-xs font-semibold text-gray-500">Loading your garden profiles...</p>
        </div>
      ) : filteredPlants.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlants.map((plant) => (
            <div
              key={plant.id}
              className="rounded-3xl glass-panel border border-emerald-100 dark:border-emerald-900/60 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col group"
            >
              {/* Image banner */}
              <div className="aspect-video w-full bg-emerald-900/10 overflow-hidden relative">
                <img
                  src={plant.image_url || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80'}
                  alt={plant.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80';
                  }}
                />
                <div className="absolute top-3 left-3">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/60 text-white backdrop-blur-xs">
                    {plant.category}
                  </span>
                </div>
                {plant.latest_health_status && (
                  <div className="absolute top-3 right-3">
                    <HealthBadge status={plant.latest_health_status} score={plant.latest_health_score} size="sm" />
                  </div>
                )}
              </div>

              {/* Plant Info */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white truncate">
                    {plant.name}
                  </h3>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 italic truncate font-medium">
                    {plant.species || "Species not set"}
                  </p>

                  {/* Specs */}
                  <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-emerald-900/60 text-[11px] text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">{plant.location || "General Plot"}</span>
                    </div>
                    <div className="flex items-center gap-1.5 truncate">
                      <Droplets className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">{plant.watering_frequency || "Regular"}</span>
                    </div>
                    <div className="flex items-center gap-1.5 truncate">
                      <Sun className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">{plant.sunlight_requirement || "Sunlight"}</span>
                    </div>
                    <div className="flex items-center gap-1.5 truncate">
                      <Scan className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{plant.analyses_count || 0} Scans</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-emerald-900/60 gap-2">
                  <Link
                    to="/scanner"
                    state={{ plantId: plant.id }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
                  >
                    <Scan className="w-3.5 h-3.5" />
                    <span>Scan Health</span>
                  </Link>

                  <Link
                    to={`/plants/${plant.id}`}
                    className="px-3 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-semibold text-xs hover:bg-emerald-50"
                  >
                    Details
                  </Link>

                  <button
                    onClick={() => openEditModal(plant)}
                    className="p-2 rounded-xl text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                    title="Edit profile"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDeletePlant(plant.id, plant.name)}
                    className="p-2 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete plant"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 rounded-3xl glass-panel text-center space-y-4 max-w-lg mx-auto">
          <Sprout className="w-12 h-12 text-emerald-600 mx-auto" />
          <h3 className="text-base font-bold text-gray-900 dark:text-white">
            No plants registered in this view
          </h3>
          <p className="text-xs text-gray-500">
            Create profiles for your crops or houseplants to maintain historical diagnostic charts.
          </p>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Add First Plant Profile</span>
          </button>
        </div>
      )}

      {/* Add / Edit Plant Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white dark:bg-emerald-950 rounded-3xl shadow-2xl border border-emerald-200 dark:border-emerald-900 p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-emerald-900 pb-3">
              <h3 className="text-base font-black text-emerald-950 dark:text-white flex items-center gap-2">
                <Sprout className="w-5 h-5 text-emerald-600" />
                <span>{isEditing ? "Edit Plant Profile" : "Register New Plant"}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    Plant / Crop Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. San Marzano Tomato"
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-200 dark:border-emerald-800 bg-white/70 dark:bg-emerald-900/40 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    Species (Latin Name)
                  </label>
                  <input
                    type="text"
                    value={formData.species}
                    onChange={(e) => setFormData({ ...formData, species: e.target.value })}
                    placeholder="e.g. Solanum lycopersicum"
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-200 dark:border-emerald-800 bg-white/70 dark:bg-emerald-900/40 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-200 dark:border-emerald-800 bg-white/70 dark:bg-emerald-900/40 text-gray-900 dark:text-white"
                  >
                    {categories.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    Location / Bed
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Greenhouse Plot 3"
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-200 dark:border-emerald-800 bg-white/70 dark:bg-emerald-900/40 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    Watering Schedule
                  </label>
                  <input
                    type="text"
                    value={formData.watering_frequency}
                    onChange={(e) => setFormData({ ...formData, watering_frequency: e.target.value })}
                    placeholder="e.g. Every 2-3 days"
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-200 dark:border-emerald-800 bg-white/70 dark:bg-emerald-900/40 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    Sunlight Needs
                  </label>
                  <input
                    type="text"
                    value={formData.sunlight_requirement}
                    onChange={(e) => setFormData({ ...formData, sunlight_requirement: e.target.value })}
                    placeholder="e.g. Bright indirect light"
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-200 dark:border-emerald-800 bg-white/70 dark:bg-emerald-900/40 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  Photo URL (Optional)
                </label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-200 dark:border-emerald-800 bg-white/70 dark:bg-emerald-900/40 text-gray-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  Agronomic Notes
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Soil amendment history, transplant dates, fertilizer preferences..."
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-200 dark:border-emerald-800 bg-white/70 dark:bg-emerald-900/40 text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-emerald-900">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-emerald-800 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs shadow-md"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>{isEditing ? "Update Profile" : "Save Plant"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
