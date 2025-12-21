'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { spaAPI, Spa, locationAPI, Location } from '@/lib/spa';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function EditSpaPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const spaId = params?.id ? parseInt(params.id as string) : null;

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Location data
  const [countries, setCountries] = useState<Location[]>([]);
  const [states, setStates] = useState<Location[]>([]);
  const [cities, setCities] = useState<Location[]>([]);
  const [areas, setAreas] = useState<Location[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    phone: '',
    email: '',
    address: '',
    website: '',
    directions: '',
    opening_hours: '',
    closing_hours: '',
    booking_url_website: '',
    country_id: '',
    state_id: '',
    city_id: '',
    area_id: '',
    latitude: '',
    longitude: '',
    rating: '',
    reviews: '',
    is_active: true,
    is_verified: false,
  });
  const [logoImage, setLogoImage] = useState<File | null>(null);
  const [logoImagePreview, setLogoImagePreview] = useState<string | null>(null);
  const [existingLogoImage, setExistingLogoImage] = useState<string | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'manager')) {
      router.push('/dashboard');
    } else if (spaId) {
      fetchSpa();
      locationAPI.getCountries().then(setCountries).catch(console.error);
    }
  }, [user, router, spaId]);

  useEffect(() => {
    if (formData.country_id) {
      locationAPI.getStates(parseInt(formData.country_id)).then(setStates).catch(console.error);
    }
  }, [formData.country_id]);

  useEffect(() => {
    if (formData.state_id) {
      locationAPI.getCities(parseInt(formData.state_id)).then(setCities).catch(console.error);
    }
  }, [formData.state_id]);

  useEffect(() => {
    if (formData.city_id) {
      locationAPI.getAreas(parseInt(formData.city_id)).then(setAreas).catch(console.error);
    }
  }, [formData.city_id]);

  const fetchSpa = async () => {
    if (!spaId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await spaAPI.getSpaById(spaId);
      setFormData({
        name: data.name || '',
        description: data.description || '',
        phone: data.phone || '',
        email: data.email || '',
        address: data.address || '',
        website: data.website || '',
        directions: data.directions || '',
        opening_hours: data.opening_hours || '',
        closing_hours: data.closing_hours || '',
        booking_url_website: data.booking_url_website || '',
        country_id: data.country_id?.toString() || '',
        state_id: data.state_id?.toString() || '',
        city_id: data.city_id?.toString() || '',
        area_id: data.area_id?.toString() || '',
        latitude: data.latitude?.toString() || '',
        longitude: data.longitude?.toString() || '',
        rating: (data as any).rating?.toString() || '',
        reviews: (data as any).reviews?.toString() || '',
        is_active: data.is_active ?? true,
        is_verified: data.is_verified ?? false,
      });
      if (data.logo_image) {
        setExistingLogoImage(data.logo_image);
      }
      if (data.spa_images) {
        setExistingImages(data.spa_images);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch SPA');
      console.error('Failed to fetch SPA:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleLogoImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files);
      setImages((prev) => [...prev, ...newImages]);

      const newPreviews = newImages.map((file) => URL.createObjectURL(file));
      setImagePreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const validateStep1 = () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.country_id || !formData.state_id || !formData.city_id || !formData.address) {
      setError('Please fill in all required fields');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    setError(null);
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!spaId) return;
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const data = new FormData();
      for (const key in formData) {
        const value = formData[key as keyof typeof formData];
        if (value !== '' && value !== null && value !== undefined) {
          if (typeof value === 'boolean') {
            data.append(key, value.toString());
          } else {
            data.append(key, value.toString());
          }
        }
      }
      
      // Add existing images as JSON string (images that should be kept)
      data.append('existing_images', JSON.stringify(existingImages));
      
      // Add new images
      images.forEach((image) => {
        data.append('images', image);
      });
      
      // Add logo image if new one is uploaded
      if (logoImage) {
        data.append('logo_image', logoImage);
      }

      await spaAPI.updateSpa(spaId, data);
      setSuccess('SPA updated successfully!');
      setTimeout(() => {
        router.push(`/dashboard/spas/${spaId}`);
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update SPA');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !user || (user.role !== 'admin' && user.role !== 'manager')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit SPA</h1>
            <p className="text-gray-600 mt-2">Step {step} of 2</p>
          </div>
          <Link href={`/dashboard/spas/${spaId}`} className="btn-secondary">
            Back to View
          </Link>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center">
            <div className={`flex items-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                1
              </div>
              <span className="ml-2 font-medium">Basic Information</span>
            </div>
            <div className={`flex-1 h-1 mx-4 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                2
              </div>
              <span className="ml-2 font-medium">Additional Details</span>
            </div>
          </div>
        </div>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>}
        {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-4">{success}</div>}

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 md:p-8 space-y-6">
          {/* Step 1: Basic Information */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-3 border-b border-gray-200">Basic Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    SPA Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                    Website
                  </label>
                  <input
                    type="url"
                    id="website"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  className="input-field"
                ></textarea>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Location Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="country_id" className="block text-sm font-medium text-gray-700 mb-1">
                      Country <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="country_id"
                      name="country_id"
                      value={formData.country_id}
                      onChange={handleChange}
                      className="input-field"
                      required
                    >
                      <option value="">Select Country</option>
                      {countries.map((country) => (
                        <option key={country.id} value={country.id}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="state_id" className="block text-sm font-medium text-gray-700 mb-1">
                      State <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="state_id"
                      name="state_id"
                      value={formData.state_id}
                      onChange={handleChange}
                      className="input-field"
                      required
                      disabled={!formData.country_id}
                    >
                      <option value="">Select State</option>
                      {states.map((state) => (
                        <option key={state.id} value={state.id}>
                          {state.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="city_id" className="block text-sm font-medium text-gray-700 mb-1">
                      City <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="city_id"
                      name="city_id"
                      value={formData.city_id}
                      onChange={handleChange}
                      className="input-field"
                      required
                      disabled={!formData.state_id}
                    >
                      <option value="">Select City</option>
                      {cities.map((city) => (
                        <option key={city.id} value={city.id}>
                          {city.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="area_id" className="block text-sm font-medium text-gray-700 mb-1">
                      Area
                    </label>
                    <select
                      id="area_id"
                      name="area_id"
                      value={formData.area_id}
                      onChange={handleChange}
                      className="input-field"
                      disabled={!formData.city_id}
                    >
                      <option value="">Select Area (Optional)</option>
                      {areas.map((area) => (
                        <option key={area.id} value={area.id}>
                          {area.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Address <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="address"
                      name="address"
                      rows={2}
                      value={formData.address}
                      onChange={handleChange}
                      className="input-field"
                      required
                    ></textarea>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                  Next: Additional Details →
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Additional Details */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-3 border-b border-gray-200">Additional Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="opening_hours" className="block text-sm font-medium text-gray-700 mb-1">
                    Opening Hours
                  </label>
                  <input
                    type="text"
                    id="opening_hours"
                    name="opening_hours"
                    value={formData.opening_hours}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="e.g., 9:00 AM"
                  />
                </div>
                <div>
                  <label htmlFor="closing_hours" className="block text-sm font-medium text-gray-700 mb-1">
                    Closing Hours
                  </label>
                  <input
                    type="text"
                    id="closing_hours"
                    name="closing_hours"
                    value={formData.closing_hours}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="e.g., 9:00 PM"
                  />
                </div>
                <div>
                  <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-1">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    id="latitude"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>
                <div>
                  <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-1">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    id="longitude"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>
                <div>
                  <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-1">
                    Rating
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    id="rating"
                    name="rating"
                    value={formData.rating}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="e.g., 4.5"
                  />
                  <p className="mt-1 text-xs text-gray-500">Rating from 0.0 to 5.0</p>
                </div>
                <div>
                  <label htmlFor="reviews" className="block text-sm font-medium text-gray-700 mb-1">
                    Number of Reviews
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    id="reviews"
                    name="reviews"
                    value={formData.reviews}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="e.g., 150"
                  />
                  <p className="mt-1 text-xs text-gray-500">Total number of reviews</p>
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="directions" className="block text-sm font-medium text-gray-700 mb-1">
                    Google Maps Directions URL
                  </label>
                  <input
                    type="url"
                    id="directions"
                    name="directions"
                    value={formData.directions}
                    onChange={handleChange}
                    placeholder="https://maps.google.com/?daddr=..."
                    className="input-field"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Enter the Google Maps directions URL. You can get this by clicking "Directions" on Google Maps and copying the URL.
                  </p>
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="booking_url_website" className="block text-sm font-medium text-gray-700 mb-1">
                    Booking URL / Website
                  </label>
                  <input
                    type="url"
                    id="booking_url_website"
                    name="booking_url_website"
                    value={formData.booking_url_website}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="e.g., https://book.myspa.com"
                  />
                </div>
              </div>

              {/* Status */}
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Status</h3>
                <div className="space-y-3">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleChange}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-3 text-sm font-medium text-gray-700">Active</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="is_verified"
                      checked={formData.is_verified}
                      onChange={handleChange}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-3 text-sm font-medium text-gray-700">Verified</span>
                  </label>
                </div>
              </div>

              {/* Logo Image */}
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Logo Image</h3>
                
                {/* Existing Logo Image */}
                {existingLogoImage && !logoImagePreview && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Logo Image</label>
                    <div className="relative">
                      <img
                        src={`${API_URL}/${existingLogoImage}`}
                        alt="Logo"
                        className="w-full max-w-xs h-48 object-cover rounded-lg border-2 border-gray-200 shadow-sm"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                )}
                
                {/* New Logo Image Preview */}
                {logoImagePreview && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">New Logo Image Preview</label>
                    <img src={logoImagePreview} alt="Logo preview" className="w-full max-w-xs h-48 object-cover rounded-lg border-2 border-gray-200 shadow-sm" />
                  </div>
                )}
                
                <label htmlFor="logo_image" className="block text-sm font-medium text-gray-700 mb-2">
                  {existingLogoImage ? 'Replace Logo Image' : 'Upload Logo Image'} (Recommended: 500x500px, Max 10MB, JPG, PNG, WebP)
                </label>
                <input
                  type="file"
                  id="logo_image"
                  name="logo_image"
                  accept=".jpg,.jpeg,.png,.webp"
                  onChange={handleLogoImageChange}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                />
              </div>

              {/* Images Upload */}
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">SPA Images</h3>
                
                {/* Existing Images */}
                {existingImages.length > 0 && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Existing Images</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                      {existingImages.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={`${API_URL}/${image}`}
                            alt={`Existing ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border-2 border-gray-200 shadow-sm"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveExistingImage(index)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 text-sm hover:bg-red-600 transition-colors shadow-md opacity-0 group-hover:opacity-100"
                            title="Remove image"
                          >
                            &times;
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* New Images */}
                <label htmlFor="images" className="block text-sm font-medium text-gray-700 mb-2">
                  Upload New Images (Max 10MB per file, JPG, PNG, WebP, GIF, BMP)
                </label>
                <input
                  type="file"
                  id="images"
                  name="images"
                  multiple
                  accept=".jpg,.jpeg,.png,.webp,.gif,.bmp"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                />
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img src={preview} alt={`Preview ${index}`} className="w-full h-32 object-cover rounded-lg border-2 border-gray-200 shadow-sm" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 text-sm hover:bg-red-600 transition-colors shadow-md opacity-0 group-hover:opacity-100"
                        title="Remove image"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                  disabled={submitting}
                >
                  {submitting ? 'Updating...' : 'Update SPA'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
