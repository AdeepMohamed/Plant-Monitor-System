import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { HealthBadge } from '../components/HealthBadge';
import {
  Sprout,
  Plus,
  Search,
  MapPin,
  Droplets,
  Sun,
  Scan,
  Edit2,
  Trash2,
  X,
  Loader2,
  Check
} from 'lucide-react';

export const MyPlantsPage = () => {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingPlantId, setEditingPlantId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    species: '',
    category: 'Vegetable',
    planting_date: '',
    location: '',
    watering_frequency: 'Every 2-3 days',
    sunlight_requirement: 'Full sun (6+ hrs)',
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
      console.error("Plants fetch error:", err);
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
      sunlight_requirement: 'Full sun (6+ hrs)',
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

  const handleDeletePlant = async (plantId, name) => {
    if (!window.confirm(`Delete '${name}' from your plants?`)) return;
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
      alert("Error saving: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredPlants = plants.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.species && p.species.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-150">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            My Plants
          </h1>
          <p className="text-xs text-gray-500">
            Manage your crop varieties, houseplants, and garden beds.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="btn-primary px-4 py-2 text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Plant</span>
        </button>
      </div>

      {/* Search & Category Filter */}
      <div className="clean-card p-3 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search plant name or species..."
            className="w-full text-xs pl-9 pr-3 py-1.5 rounded-lg border border-gray-200 dark:border-emerald-800 bg-white dark:bg-emerald-950/40 text-gray-800 dark:text-gray-200"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-emerald-900/40'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Plants Grid */}
      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          <p className="text-xs text-gray-500 font-medium">Loading plants...</p>
        </div>
      ) : filteredPlants.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPlants.map((plant) => (
            <div
              key={plant.id}
              className="clean-card clean-card-hover overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="aspect-video w-full bg-gray-100 dark:bg-emerald-950 overflow-hidden relative">
                  <img
                    src={plant.image_url || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80'}
                    alt={plant.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-black/60 text-white">
                      {plant.category}
                    </span>
                  </div>
                  {plant.latest_health_status && (
                    <div className="absolute top-2 right-2">
                      <HealthBadge status={plant.latest_health_status} score={plant.latest_health_score} size="sm" />
                    </div>
                  )}
                </div>

                <div className="p-4 space-y-2.5">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {plant.name}
                    </h3>
                    <p className="text-xs text-gray-500 italic truncate">
                      {plant.species || "Species unspecified"}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-500 pt-1">
                    <span className="flex items-center gap-1 truncate">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">{plant.location || "General Plot"}</span>
                    </span>
                    <span className="flex items-center gap-1 truncate">
                      <Droplets className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">{plant.watering_frequency || "Regular"}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Actions */}
              <div className="p-4 pt-0 flex items-center justify-between border-t border-gray-100 dark:border-emerald-900/60 mt-2 gap-2">
                <Link
                  to="/scanner"
                  state={{ plantId: plant.id }}
                  className="btn-primary flex-1 py-1.5 text-xs text-center flex items-center justify-center gap-1 shadow-xs"
                >
                  <Scan className="w-3.5 h-3.5" />
                  <span>Scan</span>
                </Link>
                <Link
                  to={`/plants/${plant.id}`}
                  className="btn-secondary px-3 py-1.5 text-xs font-semibold"
                >
                  Details
                </Link>
                <button
                  type="button"
                  onClick={() => openEditModal(plant)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                  title="Edit"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeletePlant(plant.id, plant.name)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="clean-card p-12 text-center space-y-3 max-w-sm mx-auto">
          <Sprout className="w-10 h-10 text-emerald-600 mx-auto" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            No plants found
          </h3>
          <p className="text-xs text-gray-500">
            Create profiles to track health trajectory over multiple scans.
          </p>
          <button
            type="button"
            onClick={openAddModal}
            className="btn-primary px-4 py-2 text-xs cursor-pointer"
          >
            Add Your First Plant
          </button>
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white dark:bg-emerald-950 rounded-2xl shadow-xl border border-gray-200 dark:border-emerald-900 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-emerald-900 pb-3">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                <Sprout className="w-4 h-4 text-emerald-600" />
                <span>{isEditing ? "Edit Plant Profile" : "Register New Plant"}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700 dark:text-gray-300">Plant Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. San Marzano Tomato"
                    className="w-full p-2 rounded-lg border border-gray-200 dark:border-emerald-800 bg-white dark:bg-emerald-900 text-gray-900 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700 dark:text-gray-300">Species (Latin)</label>
                  <input
                    type="text"
                    value={formData.species}
                    onChange={(e) => setFormData({ ...formData, species: e.target.value })}
                    placeholder="e.g. Solanum lycopersicum"
                    className="w-full p-2 rounded-lg border border-gray-200 dark:border-emerald-800 bg-white dark:bg-emerald-900 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700 dark:text-gray-300">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2 rounded-lg border border-gray-200 dark:border-emerald-800 bg-white dark:bg-emerald-900 text-gray-900 dark:text-white"
                  >
                    {categories.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700 dark:text-gray-300">Location / Plot</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Backyard Raised Bed"
                    className="w-full p-2 rounded-lg border border-gray-200 dark:border-emerald-800 bg-white dark:bg-emerald-900 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700 dark:text-gray-300">Watering Schedule</label>
                  <input
                    type="text"
                    value={formData.watering_frequency}
                    onChange={(e) => setFormData({ ...formData, watering_frequency: e.target.value })}
                    placeholder="e.g. Every 2-3 days"
                    className="w-full p-2 rounded-lg border border-gray-200 dark:border-emerald-800 bg-white dark:bg-emerald-900 text-gray-900 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700 dark:text-gray-300">Sunlight Needs</label>
                  <input
                    type="text"
                    value={formData.sunlight_requirement}
                    onChange={(e) => setFormData({ ...formData, sunlight_requirement: e.target.value })}
                    placeholder="e.g. Full sun (6+ hrs)"
                    className="w-full p-2 rounded-lg border border-gray-200 dark:border-emerald-800 bg-white dark:bg-emerald-900 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gray-700 dark:text-gray-300">Photo URL (Optional)</label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-emerald-800 bg-white dark:bg-emerald-900 text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-emerald-900">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary px-3.5 py-1.5 text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary px-4 py-1.5 text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>{isEditing ? "Save Changes" : "Create Plant"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
