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
    is_active: true,
    is_verified: false,
  });
  const [bannerImage, setBannerImage] = useState<File | null>(null);
  const [bannerImagePreview, setBannerImagePreview] = useState<string | null>(null);
  const [existingBannerImage, setExistingBannerImage] = useState<string | null>(null);
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
        is_active: data.is_active ?? true,
        is_verified: data.is_verified ?? false,
      });
      if (data.banner_image) {
        setExistingBannerImage(data.banner_image);
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

  const handleBannerImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setBannerImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerImagePreview(reader.result as string);
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
      // Always send this field, even if empty array (empty means remove all existing images)
      data.append('existing_images', JSON.stringify(existingImages));
      
      // Add new images
      images.forEach((image) => {
        data.append('images', image);
      });
      
      // Add banner image if new one is uploaded
      if (bannerImage) {
        data.append('banner_image', bannerImage);
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
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
            <p className="text-gray-600 mt-2">Update spa information</p>
          </div>
          <Link href={`/dashboard/spas/${spaId}`} className="btn-secondary">
            Back to View
          </Link>
        </div>

        {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">{error}</div>}
        {success && <div className="bg-green-100 text-green-700 p-3 rounded-lg mb-4">{success}</div>}

        <form onSubmit={handleSubmit} className="card space-y-6">
          {/* Basic Info */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
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
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
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
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
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
                <label htmlFor="website" className="block text-sm font-medium text-gray-700">
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
            <div className="mt-4">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
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
          </div>

          {/* Location Info */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Location Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="country_id" className="block text-sm font-medium text-gray-700">
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
                <label htmlFor="state_id" className="block text-sm font-medium text-gray-700">
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
                <label htmlFor="city_id" className="block text-sm font-medium text-gray-700">
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
                <label htmlFor="area_id" className="block text-sm font-medium text-gray-700">
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
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
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
              <div>
                <label htmlFor="latitude" className="block text-sm font-medium text-gray-700">
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
                <label htmlFor="longitude" className="block text-sm font-medium text-gray-700">
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
            </div>
          </div>

          {/* Operational Info */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Operational Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="opening_hours" className="block text-sm font-medium text-gray-700">
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
                <label htmlFor="closing_hours" className="block text-sm font-medium text-gray-700">
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
              <div className="md:col-span-2">
                <label htmlFor="directions" className="block text-sm font-medium text-gray-700">
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
                <label htmlFor="booking_url_website" className="block text-sm font-medium text-gray-700">
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
          </div>

          {/* Status */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Status</h2>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700">Active</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="is_verified"
                  checked={formData.is_verified}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700">Verified</span>
              </label>
            </div>
          </div>

          {/* Banner Image */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Banner Image</h2>
            
            {/* Existing Banner Image */}
            {existingBannerImage && !bannerImagePreview && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Banner Image</label>
                <div className="relative">
                  <img
                    src={`${API_URL}/${existingBannerImage}`}
                    alt="Banner"
                    className="w-full h-48 object-cover rounded-md border border-gray-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              </div>
            )}
            
            {/* New Banner Image Preview */}
            {bannerImagePreview && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">New Banner Image Preview</label>
                <img src={bannerImagePreview} alt="Banner preview" className="w-full h-48 object-cover rounded-md border border-gray-300" />
              </div>
            )}
            
            <label htmlFor="banner_image" className="block text-sm font-medium text-gray-700 mb-2">
              {existingBannerImage ? 'Replace Banner Image' : 'Upload Banner Image'} (Recommended: 1920x600px, Max 10MB, JPG, PNG, WebP)
            </label>
            <input
              type="file"
              id="banner_image"
              name="banner_image"
              accept=".jpg,.jpeg,.png,.webp"
              onChange={handleBannerImageChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-primary-50 file:text-primary-700
                hover:file:bg-primary-100"
            />
          </div>

          {/* Images Upload */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">SPA Images</h2>
            
            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Existing Images</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {existingImages.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={`${API_URL}/${image}`}
                        alt={`Existing ${index + 1}`}
                        className="w-full h-32 object-cover rounded-md"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveExistingImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs hover:bg-red-600"
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
                file:bg-primary-50 file:text-primary-700
                hover:file:bg-primary-100"
            />
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative">
                  <img src={preview} alt={`Preview ${index}`} className="w-full h-32 object-cover rounded-md" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs hover:bg-red-600"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Link href={`/dashboard/spas/${spaId}`} className="btn-secondary">
              Cancel
            </Link>
            <button
              type="submit"
              className="btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Updating...' : 'Update SPA'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

