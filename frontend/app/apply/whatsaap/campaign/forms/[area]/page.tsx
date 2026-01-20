'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { submitLead, ExperienceEnum } from '@/lib/whatsaapleads';
import { showToast } from '@/lib/toast';
import Navbar from '@/components/Navbar';

const JobProfileOptions = [
    { label: 'Select Job Profile', value: '' },
    { label: 'Spa Therapist (Female)', value: 'spa_therapist' },
    { label: 'Beautician', value: 'beautician' },
    { label: 'Spa Receptionist (Female)', value: 'spa receptionist' },
    { label: 'Spa Manager (Male)', value: 'spa manager' },
    { label: 'Housekeeping (Male)', value: 'housekeeping' },
];

export default function WhatsaapLeads() {
    const params = useParams();
    const areaSlug = params?.area as string | undefined;

    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        age: '',
        job_profile: '',
        experience: 'fresher',
        street: '',
    });

    const [errors, setErrors] = useState({
        phone: '',
        age: '',
    });

    /* ===============================
       AUTO TAKE AREA + CITY → ADDRESS
    =============================== */
    useEffect(() => {
        if (!areaSlug) return;

        const parts = areaSlug.split('-');

        // City = last part
        const cityRaw = parts.pop();

        // Area = remaining
        const areaRaw = parts.join(' ');

        const formatText = (text: string) =>
            text.replace(/\b\w/g, char => char.toUpperCase());

        const areaName = formatText(areaRaw.replace(/-/g, ' '));
        const cityName = cityRaw ? formatText(cityRaw) : '';

        const address = cityName
            ? `${areaName} - ${cityName}`
            : areaName;

        setFormData(prev => ({
            ...prev,
            street: address,
        }));
    }, [areaSlug]);

    /* ===============================
       HANDLE INPUT CHANGES
    =============================== */
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        if (name === 'phone') {
            const digitsOnly = value.replace(/\D/g, '').slice(0, 10);
            setFormData(prev => ({ ...prev, phone: digitsOnly }));

            setErrors(prev => ({
                ...prev,
                phone: digitsOnly.length !== 10 ? 'Enter 10 digit mobile number' : '',
            }));
            return;
        }

        if (name === 'age') {
            setFormData(prev => ({ ...prev, age: value }));
            setErrors(prev => ({
                ...prev,
                age: Number(value) < 20 ? 'Age must be 20 and above' : '',
            }));
            return;
        }

        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const isFormComplete = () =>
        formData.name.trim() &&
        formData.phone.length === 10 &&
        Number(formData.age) >= 20 &&
        formData.job_profile &&
        formData.experience &&
        !errors.phone &&
        !errors.age;

    /* ===============================
       SUBMIT FORM
    =============================== */
    const submitForm = async () => {
        if (loading || submitted) return;

        if (!isFormComplete()) {
            showToast.error('Invalid Details', 'Please correct the errors');
            return;
        }

        setLoading(true);

        try {
            await submitLead({
                name: formData.name,
                phone: formData.phone,
                age: parseInt(formData.age),
                job_profile: formData.job_profile,
                experience: formData.experience as ExperienceEnum,
                street: formData.street, // AREA - CITY
            });

            showToast.success('Application Submitted', 'We will contact you shortly!');
            setSubmitted(true);

            setFormData(prev => ({
                ...prev,
                name: '',
                phone: '',
                age: '',
                job_profile: '',
                experience: 'fresher',
            }));

            setErrors({ phone: '', age: '' });
        } catch (error: any) {
            showToast.error(
                'Submission Failed',
                error.response?.data?.detail || 'Something went wrong'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="flex justify-center p-4 pt-8">
                <div className="w-full max-w-md bg-white p-5 border border-gray-200 rounded-xl shadow-sm">

                    <h2 className="text-xl font-bold text-center text-gray-900 mb-6">
                        Quick Apply for Job
                    </h2>

                    <form className="space-y-4">

                        <Input
                            label="Name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter your name"
                        />

                        <div>
                            <Input
                                label="Phone Number"
                                name="phone"
                                type="tel"
                                inputMode="numeric"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="Enter your phone number"
                            />
                            {errors.phone && (
                                <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
                            )}
                        </div>

                        <div>
                            <Input
                                label="Age"
                                name="age"
                                type="number"
                                value={formData.age}
                                onChange={handleChange}
                                placeholder="Enter your age"
                            />
                            {errors.age && (
                                <p className="text-xs text-red-500 mt-1">{errors.age}</p>
                            )}
                        </div>

                        {/* ADDRESS = AREA - CITY */}
                        <Input
                            label="Address"
                            name="street"
                            value={formData.street}
                            readOnly
                            placeholder="Area - City auto-filled"
                        />

                        <Select
                            label="Job Profile"
                            name="job_profile"
                            value={formData.job_profile}
                            onChange={handleChange}
                            options={JobProfileOptions}
                        />

                        <Select
                            label="Experience"
                            name="experience"
                            value={formData.experience}
                            onChange={handleChange}
                            options={[
                                { label: 'Fresher', value: 'fresher' },
                                { label: 'Experienced', value: 'experienced' },
                            ]}
                        />

                        <button
                            type="button"
                            onClick={submitForm}
                            disabled={loading || !isFormComplete()}
                            className="w-full mt-6 bg-green-600 text-white py-3 rounded-xl text-base font-semibold disabled:opacity-50"
                        >
                            {loading ? 'Submitting...' : submitted ? 'Submitted ✔' : 'Submit Application'}
                        </button>

                    </form>
                </div>
            </div>
        </div>
    );
}

/* ===============================
   REUSABLE COMPONENTS
=============================== */

function Input({ label, ...props }: any) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label}
            </label>
            <input
                {...props}
                required={props.name !== 'street'}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base focus:ring-2 focus:ring-green-500 focus:outline-none bg-gray-50"
            />
        </div>
    );
}

function Select({ label, options, ...props }: any) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label}
            </label>
            <select
                {...props}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base bg-white focus:ring-2 focus:ring-green-500 focus:outline-none"
            >
                {options.map((opt: any) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
        </div>
    );
}
