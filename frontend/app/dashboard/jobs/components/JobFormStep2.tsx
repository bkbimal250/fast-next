'use client';

interface JobFormStep2Props {
  formData: any;
  onFieldChange: (name: string, value: any) => void;
  countries: any[];
  states: any[];
  cities: any[];
  areas: any[];
  onCountryChange?: (countryId: string) => void;
  onStateChange?: (stateId: string) => void;
  onCityChange?: (cityId: string) => void;
  errors?: Record<string, string>;
}

export default function JobFormStep2({
  formData,
  onFieldChange,
  countries,
  states,
  cities,
  areas,
  onCountryChange,
  onStateChange,
  onCityChange,
  errors = {},
}: JobFormStep2Props) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    onFieldChange(name, newValue);

    // Handle cascading dropdowns
    if (name === 'country_id' && onCountryChange) {
      onCountryChange(value);
    } else if (name === 'state_id' && onStateChange) {
      onStateChange(value);
    } else if (name === 'city_id' && onCityChange) {
      onCityChange(value);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-2xl font-bold text-gray-900">Location & Details</h2>
        <p className="text-gray-600 mt-1">Set location, compensation, and contact information</p>
      </div>

      {/* Location Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Location</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="country_id" className="block text-sm font-semibold text-gray-700 mb-2">
              Country <span className="text-red-500">*</span>
            </label>
            <select
              id="country_id"
              name="country_id"
              value={formData.country_id}
              onChange={handleChange}
              className={`w-full px-4 py-3 border ${
                errors.country_id ? 'border-red-500' : 'border-gray-300'
              } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white`}
              required
            >
              <option value="">Select Country</option>
              {countries.map((country) => (
                <option key={country.id} value={country.id}>
                  {country.name}
                </option>
              ))}
            </select>
            {errors.country_id && (
              <p className="mt-1 text-sm text-red-600">{typeof errors.country_id === 'string' ? errors.country_id : String(errors.country_id)}</p>
            )}
          </div>

          <div>
            <label htmlFor="state_id" className="block text-sm font-semibold text-gray-700 mb-2">
              State <span className="text-red-500">*</span>
            </label>
            <select
              id="state_id"
              name="state_id"
              value={formData.state_id}
              onChange={handleChange}
              className={`w-full px-4 py-3 border ${
                errors.state_id ? 'border-red-500' : 'border-gray-300'
              } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white disabled:bg-gray-50 disabled:cursor-not-allowed`}
              disabled={!formData.country_id}
              required
            >
              <option value="">Select State</option>
              {states.map((state) => (
                <option key={state.id} value={state.id}>
                  {state.name}
                </option>
              ))}
            </select>
            {errors.state_id && (
              <p className="mt-1 text-sm text-red-600">{typeof errors.state_id === 'string' ? errors.state_id : String(errors.state_id)}</p>
            )}
          </div>

          <div>
            <label htmlFor="city_id" className="block text-sm font-semibold text-gray-700 mb-2">
              City <span className="text-red-500">*</span>
            </label>
            <select
              id="city_id"
              name="city_id"
              value={formData.city_id}
              onChange={handleChange}
              className={`w-full px-4 py-3 border ${
                errors.city_id ? 'border-red-500' : 'border-gray-300'
              } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white disabled:bg-gray-50 disabled:cursor-not-allowed`}
              disabled={!formData.state_id}
              required
            >
              <option value="">Select City</option>
              {cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </select>
            {errors.city_id && (
              <p className="mt-1 text-sm text-red-600">{typeof errors.city_id === 'string' ? errors.city_id : String(errors.city_id)}</p>
            )}
          </div>

          <div>
            <label htmlFor="area_id" className="block text-sm font-semibold text-gray-700 mb-2">
              Area (Optional)
            </label>
            <select
              id="area_id"
              name="area_id"
              value={formData.area_id}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white disabled:bg-gray-50 disabled:cursor-not-allowed"
              disabled={!formData.city_id}
            >
              <option value="">Select Area</option>
              {areas.map((area) => (
                <option key={area.id} value={area.id}>
                  {area.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="postalCode" className="block text-sm font-semibold text-gray-700 mb-2">
              Postal Code
            </label>
            <input
              type="text"
              id="postalCode"
              name="postalCode"
              value={formData.postalCode || ''}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="e.g., 12345"
              maxLength={10}
            />
          </div>
        </div>
      </div>

      {/* Salary Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Salary & Experience</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="salary_min" className="block text-sm font-semibold text-gray-700 mb-2">
              Minimum Salary
            </label>
            <input
              type="number"
              id="salary_min"
              name="salary_min"
              value={formData.salary_min}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="0"
              min="0"
            />
          </div>

          <div>
            <label htmlFor="salary_max" className="block text-sm font-semibold text-gray-700 mb-2">
              Maximum Salary
            </label>
            <input
              type="number"
              id="salary_max"
              name="salary_max"
              value={formData.salary_max}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="0"
              min="0"
            />
          </div>

          <div>
            <label htmlFor="salary_currency" className="block text-sm font-semibold text-gray-700 mb-2">
              Currency
            </label>
            <select
              id="salary_currency"
              name="salary_currency"
              value={formData.salary_currency}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="experience_years_min" className="block text-sm font-semibold text-gray-700 mb-2">
              Minimum Experience (Years)
            </label>
            <input
              type="number"
              id="experience_years_min"
              name="experience_years_min"
              value={formData.experience_years_min}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="0"
              min="0"
            />
          </div>

          <div>
            <label htmlFor="experience_years_max" className="block text-sm font-semibold text-gray-700 mb-2">
              Maximum Experience (Years)
            </label>
            <input
              type="number"
              id="experience_years_max"
              name="experience_years_max"
              value={formData.experience_years_max}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="0"
              min="0"
            />
          </div>
        </div>
      </div>

      {/* HR Contact Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">HR Contact Information</h3>
        <p className="text-sm text-gray-600">Contact details for applicants to reach out</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="hr_contact_name" className="block text-sm font-semibold text-gray-700 mb-2">
              Contact Name
            </label>
            <input
              type="text"
              id="hr_contact_name"
              name="hr_contact_name"
              value={formData.hr_contact_name}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label htmlFor="hr_contact_email" className="block text-sm font-semibold text-gray-700 mb-2">
              Contact Email
            </label>
            <input
              type="email"
              id="hr_contact_email"
              name="hr_contact_email"
              value={formData.hr_contact_email}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="hr@example.com"
            />
          </div>

          <div>
            <label htmlFor="hr_contact_phone" className="block text-sm font-semibold text-gray-700 mb-2">
              Contact Phone
            </label>
            <input
              type="tel"
              id="hr_contact_phone"
              name="hr_contact_phone"
              value={formData.hr_contact_phone}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="+91 1234567890"
            />
          </div>
        </div>
      </div>

      {/* Additional Options */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Additional Options</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="expires_at" className="block text-sm font-semibold text-gray-700 mb-2">
              Job Expiry Date
            </label>
            <input
              type="datetime-local"
              id="expires_at"
              name="expires_at"
              value={formData.expires_at}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
            <p className="mt-1 text-xs text-gray-500">When should this job posting expire?</p>
          </div>

          <div className="flex items-end">
            <label className="flex items-center cursor-pointer p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors w-full">
              <input
                type="checkbox"
                name="is_featured"
                checked={formData.is_featured}
                onChange={handleChange}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-5 w-5"
              />
              <div className="ml-3">
                <span className="text-sm font-semibold text-gray-700">Featured Job</span>
                <p className="text-xs text-gray-500 mt-0.5">Highlight this job in search results</p>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* SEO Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">SEO Settings (Optional)</h3>
        <p className="text-sm text-gray-600">Optimize how your job appears in search engines</p>
        
        <div>
          <label htmlFor="meta_title" className="block text-sm font-semibold text-gray-700 mb-2">
            Meta Title
            <span className="ml-2 text-xs font-normal text-gray-500">(Max 60 characters)</span>
          </label>
          <input
            type="text"
            id="meta_title"
            name="meta_title"
            value={formData.meta_title}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            placeholder="SEO-friendly title for search engines"
            maxLength={60}
          />
          <div className="flex justify-between mt-1">
            <p className="text-xs text-gray-500">Recommended for better search visibility</p>
            <p className={`text-xs ${formData.meta_title.length > 60 ? 'text-red-500' : 'text-gray-500'}`}>
              {formData.meta_title.length}/60
            </p>
          </div>
        </div>

        <div>
          <label htmlFor="meta_description" className="block text-sm font-semibold text-gray-700 mb-2">
            Meta Description
            <span className="ml-2 text-xs font-normal text-gray-500">(Max 160 characters)</span>
          </label>
          <textarea
            id="meta_description"
            name="meta_description"
            rows={3}
            value={formData.meta_description}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
            placeholder="Brief description that appears in search engine results"
            maxLength={160}
          ></textarea>
          <div className="flex justify-between mt-1">
            <p className="text-xs text-gray-500">Shown in search results below the title</p>
            <p className={`text-xs ${formData.meta_description.length > 160 ? 'text-red-500' : 'text-gray-500'}`}>
              {formData.meta_description.length}/160
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

