'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaPhone, FaWhatsapp } from 'react-icons/fa';
import axios from 'axios';
import { JobWithRelations, formatPhoneForWhatsApp, formatPhoneForCall } from './utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://spajob.api.spajob.spajobs.co.in';

interface JobActionsProps {
  job: JobWithRelations;
  user: any;
  applying: boolean;
  onApply: () => void;
}

export default function JobActions({ job, user, applying, onApply }: JobActionsProps) {
  const router = useRouter();

  const formattedPhone = formatPhoneForWhatsApp(job.hr_contact_phone);
  const whatsappUrl = formattedPhone
    ? `https://wa.me/${formattedPhone.replace('+', '')}?text=${encodeURIComponent(`I applied from the workspa.in website, I'm interested in the  ${job.title} position at ${job.spa?.name} ${job.spa?.address}.`)}`
    : null;

  const callUrl = job.hr_contact_phone 
    ? `tel:${formatPhoneForCall(job.hr_contact_phone)}`
    : null;

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {!user ? (
        <>
          <Link
            href={`/apply/${job.slug}`}
            className="flex-1 px-6 py-3 border-2 border-brand-600 text-brand-600 font-semibold rounded-lg hover:bg-brand-50 transition-colors text-center min-h-[48px] flex items-center justify-center"
          >
            Quick Apply
          </Link>
          {job.hr_contact_phone && (
            <>
              {callUrl && (
                <a
                  href={callUrl}
                  className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors shadow-md min-h-[48px] flex items-center justify-center gap-2"
                >
                  <FaPhone size={18} />
                  Call HR
                </a>
              )}
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors shadow-md min-h-[48px] flex items-center justify-center gap-2"
                >
                  <FaWhatsapp size={18} />
                  WhatsApp HR
                </a>
              )}
            </>
          )}
          <button
            onClick={() => router.push(`/login?redirect=/jobs/${job.slug}`)}
            className="flex-1 px-6 py-3 bg-gold-500 text-white font-semibold rounded-lg hover:bg-gold-600 transition-colors shadow-md min-h-[48px]"
          >
            Login to Apply
          </button>
        </>
      ) : (
        <>
          <button
            onClick={onApply}
            disabled={applying}
            className="flex-1 px-8 py-3.5 bg-gold-500 text-white font-semibold rounded-lg hover:bg-gold-600 transition-colors shadow-md text-center min-h-[48px] flex items-center justify-center text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {applying ? 'Applying...' : 'Apply Now'}
          </button>
          {job.hr_contact_phone && (
            <>
              {callUrl && (
                <a
                  href={callUrl}
                  className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors shadow-md min-h-[48px] flex items-center justify-center gap-2"
                >
                  <FaPhone size={18} />
                  Call HR
                </a>
              )}
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors shadow-md min-h-[48px] flex items-center justify-center gap-2"
                >
                  <FaWhatsapp size={18} />
                  WhatsApp HR
                </a>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

