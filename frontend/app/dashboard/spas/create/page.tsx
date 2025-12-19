'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { spaAPI, locationAPI, Location } from '@/lib/spa';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function CreateSpaPage() {
  const { user } = useAuth();
  const router = useRouter();
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
  });
  const [bannerImage, setBannerImage] = useState<File | null>(null);
  const [bannerImagePreview, setBannerImagePreview] = useState<string | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'manager' && user.role !== 'recruiter')) {
      router.push('/dashboard');
    }

    // Fetch countries
    locationAPI.getCountries().then(setCountries).catch(console.error);
  }, [user, router]);

  useEffect(() => {
    if (formData.country_id) {
      locationAPI.getStates(parseInt(formData.country_id)).then(setStates).catch(console.error);
    } else {
      setStates([]);
    }
  }, [formData.country_id]);

  useEffect(() => {
    if (formData.state_id) {
      locationAPI.getCities(parseInt(formData.state_id)).then(setCities).catch(console.error);
    } else {
      setCities([]);
    }
  }, [formData.state_id]);

  useEffect(() => {
    if (formData.city_id) {
      locationAPI.getAreas(parseInt(formData.city_id)).then(setAreas).catch(console.error);
    } else {
      setAreas([]);
    }
  }, [formData.city_id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('email', formData.email);
      data.append('phone', formData.phone);
      data.append('country_id', formData.country_id);
      data.append('state_id', formData.state_id);
      data.append('city_id', formData.city_id);
      if (formData.description) data.append('description', formData.description);
      if (formData.address) data.append('address', formData.address);
      if (formData.website) data.append('website', formData.website);
      if (formData.directions) data.append('directions', formData.directions);
      if (formData.opening_hours) data.append('opening_hours', formData.opening_hours);
      if (formData.closing_hours) data.append('closing_hours', formData.closing_hours);
      if (formData.booking_url_website) data.append('booking_url_website', formData.booking_url_website);
      if (formData.area_id) data.append('area_id', formData.area_id);
      if (formData.latitude) data.append('latitude', formData.latitude);
      if (formData.longitude) data.append('longitude', formData.longitude);
      if (bannerImage) data.append('banner_image', bannerImage);

      images.forEach((image) => {
        data.append('images', image);
      });

      const createdSpa = await spaAPI.createSpa(data);
      setSuccess('SPA created successfully!');
      setTimeout(() => {
        router.push(`/dashboard/spas/${createdSpa.id}`);
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create SPA');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user || (user.role !== 'admin' && user.role !== 'manager' && user.role !== 'recruiter')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create New SPA</h1>
            <p className="text-gray-600 mt-2">Step {step} of 2</p>
          </div>
          <Link href="/dashboard/spas" className="btn-secondary">
            Back to SPAs
          </Link>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center">
            <div className={`flex items-center ${step >= 1 ? 'text-primary-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                1
              </div>
              <span className="ml-2 font-medium">Basic Information</span>
            </div>
            <div className={`flex-1 h-1 mx-4 ${step >= 2 ? 'bg-primary-600' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center ${step >= 2 ? 'text-primary-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                2
              </div>
              <span className="ml-2 font-medium">Additional Details</span>
            </div>
          </div>
        </div>

        {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">{error}</div>}
        {success && <div className="bg-green-100 text-green-700 p-3 rounded-lg mb-4">{success}</div>}

        <form onSubmit={handleSubmit} className="card space-y-6">
          {/* Step 1: Basic Information */}
          {step === 1 && (
            <div className="space-y-6">
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

              <div>
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

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Location Details</h3>
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
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleNext}
                  className="btn-primary"
                >
                  Next: Additional Details →
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Additional Details */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Additional Details</h2>
              
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

              <div>
                <label htmlFor="banner_image" className="block text-sm font-medium text-gray-700 mb-2">
                  Banner Image (Recommended: 1920x600px, Max 10MB, JPG, PNG, WebP)
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
                {bannerImagePreview && (
                  <div className="mt-4">
                    <img src={bannerImagePreview} alt="Banner preview" className="w-full h-48 object-cover rounded-md border border-gray-300" />
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="images" className="block text-sm font-medium text-gray-700 mb-2">
                  Upload SPA Images (Max 10MB per file, JPG, PNG, WebP, GIF, BMP)
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

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={handleBack}
                  className="btn-secondary"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Creating...' : 'Create SPA'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
