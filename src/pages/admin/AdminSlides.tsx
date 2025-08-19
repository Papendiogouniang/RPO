import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  Upload,
  X,
  ArrowUp,
  ArrowDown,
  Image as ImageIcon
} from 'lucide-react';
import { api } from '../../utils/api';
import toast from 'react-hot-toast';

interface HeroSlide {
  _id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  buttonText: string;
  buttonLink: string;
  isActive: boolean;
  order: number;
  createdAt: string;
}

const AdminSlides: React.FC = () => {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    buttonText: 'Découvrir',
    buttonLink: '/events',
    order: 0
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    try {
      setLoading(true);
      const response = await api.get('/slides/admin');
      setSlides(response.data.data);
    } catch (error) {
      console.error('Error fetching slides:', error);
      toast.error('Erreur lors de la récupération des slides');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      subtitle: '',
      description: '',
      buttonText: 'Découvrir',
      buttonLink: '/events',
      order: 0
    });
    setSelectedImage(null);
    setImagePreview('');
    setEditingSlide(null);
  };

  const openModal = (slide?: HeroSlide) => {
    if (slide) {
      setEditingSlide(slide);
      setFormData({
        title: slide.title,
        subtitle: slide.subtitle,
        description: slide.description,
        buttonText: slide.buttonText,
        buttonLink: slide.buttonLink,
        order: slide.order
      });
      if (slide.image) {
        setImagePreview(`http://localhost:5000${slide.image}`);
      }
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const submitData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        submitData.append(key, value.toString());
      });

      if (selectedImage) {
        submitData.append('image', selectedImage);
      }

      let response;
      if (editingSlide) {
        response = await api.put(`/slides/${editingSlide._id}`, submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Slide mis à jour avec succès');
      } else {
        response = await api.post('/slides', submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Slide créé avec succès');
      }

      closeModal();
      fetchSlides();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erreur lors de l\'opération';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleSlideStatus = async (slideId: string) => {
    try {
      await api.patch(`/slides/${slideId}/toggle`);
      toast.success('Statut du slide mis à jour');
      fetchSlides();
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const deleteSlide = async (slideId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce slide ?')) {
      try {
        await api.delete(`/slides/${slideId}`);
        toast.success('Slide supprimé avec succès');
        fetchSlides();
      } catch (error) {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-kanzey-black">Gestion des slides</h1>
            <p className="text-gray-600 mt-2">Gérez les slides du carrousel de la page d'accueil</p>
          </div>
          
          <button
            onClick={() => openModal()}
            className="bg-kanzey-yellow text-kanzey-black px-6 py-3 rounded-lg font-medium hover:bg-yellow-400 transition-colors inline-flex items-center"
          >
            <Plus className="mr-2" size={20} />
            Nouveau slide
          </button>
        </div>

        {/* Slides Grid */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kanzey-yellow mx-auto"></div>
            </div>
          ) : slides.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {slides.map((slide) => (
                <div
                  key={slide._id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                >
                  <div className="relative">
                    <img
                      src={`http://localhost:5000${slide.image}`}
                      alt={slide.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-4 left-4 flex items-center space-x-2">
                      <span className="bg-kanzey-yellow text-kanzey-black px-2 py-1 rounded-full text-xs font-bold">
                        #{slide.order}
                      </span>
                      {slide.isActive ? (
                        <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                          Actif
                        </span>
                      ) : (
                        <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                          Inactif
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="font-bold text-lg text-kanzey-black mb-2 line-clamp-1">
                      {slide.title}
                    </h3>
                    <p className="text-sm text-kanzey-yellow font-medium mb-2">
                      {slide.subtitle}
                    </p>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {slide.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        {new Date(slide.createdAt).toLocaleDateString('fr-FR')}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => toggleSlideStatus(slide._id)}
                          className={`p-2 rounded-lg transition-colors ${
                            slide.isActive
                              ? 'bg-green-100 text-green-600 hover:bg-green-200'
                              : 'bg-red-100 text-red-600 hover:bg-red-200'
                          }`}
                          title={slide.isActive ? 'Désactiver' : 'Activer'}
                        >
                          {slide.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                        </button>
                        
                        <button
                          onClick={() => openModal(slide)}
                          className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                          title="Modifier"
                        >
                          <Edit size={16} />
                        </button>
                        
                        <button
                          onClick={() => deleteSlide(slide._id)}
                          className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <ImageIcon size={64} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                Aucun slide trouvé
              </h3>
              <p className="text-gray-500">
                Commencez par créer votre premier slide pour le carrousel.
              </p>
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingSlide ? 'Modifier le slide' : 'Nouveau slide'}
                  </h2>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Image du slide *
                    </label>
                    <div className="flex items-center space-x-4">
                      {imagePreview && (
                        <img
                          src={imagePreview}
                          alt="Aperçu"
                          className="h-20 w-32 rounded-lg object-cover"
                        />
                      )}
                      <label className="cursor-pointer bg-gray-100 border border-gray-300 rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-200 transition-colors inline-flex items-center">
                        <Upload className="mr-2" size={16} />
                        Choisir une image
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                    {!editingSlide && (
                      <p className="text-xs text-gray-500 mt-1">
                        Image requise pour créer un nouveau slide
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Title */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Titre principal *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kanzey-yellow focus:border-kanzey-yellow"
                        placeholder="Titre accrocheur du slide"
                      />
                    </div>

                    {/* Subtitle */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sous-titre *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.subtitle}
                        onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kanzey-yellow focus:border-kanzey-yellow"
                        placeholder="Sous-titre ou catégorie"
                      />
                    </div>

                    {/* Description */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description *
                      </label>
                      <textarea
                        required
                        rows={3}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kanzey-yellow focus:border-kanzey-yellow"
                        placeholder="Description détaillée du slide"
                      />
                    </div>

                    {/* Button Text */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Texte du bouton
                      </label>
                      <input
                        type="text"
                        value={formData.buttonText}
                        onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kanzey-yellow focus:border-kanzey-yellow"
                        placeholder="Découvrir"
                      />
                    </div>

                    {/* Button Link */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Lien du bouton
                      </label>
                      <input
                        type="text"
                        value={formData.buttonLink}
                        onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kanzey-yellow focus:border-kanzey-yellow"
                        placeholder="/events"
                      />
                    </div>

                    {/* Order */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ordre d'affichage
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.order}
                        onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kanzey-yellow focus:border-kanzey-yellow"
                        placeholder="0"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Plus le nombre est petit, plus le slide apparaît en premier
                      </p>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={submitting || (!editingSlide && !selectedImage)}
                      className="px-6 py-3 bg-kanzey-yellow text-kanzey-black font-medium rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50"
                    >
                      {submitting ? 'En cours...' : editingSlide ? 'Mettre à jour' : 'Créer le slide'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSlides;