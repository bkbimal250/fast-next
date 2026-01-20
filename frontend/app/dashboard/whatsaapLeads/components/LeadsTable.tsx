'use client';

import React, { useState, useMemo } from 'react';
import {
    WhatsaapLeadResponse,
    LeadStatusEnum,
    markLeadRead,
    deleteLead,
} from '@/lib/whatsaapleads';
import { FaEye, FaCheck, FaWhatsapp, FaPhone, FaTrash } from 'react-icons/fa';
import { showToast } from '@/lib/toast';
import Pagination from '@/components/Pagination';

interface LeadsTableProps {
    leads: WhatsaapLeadResponse[];
    loading: boolean;
    onViewLead: (lead: WhatsaapLeadResponse) => void;
    onRefresh: () => void;
    usersMap: Record<number, string>;
}

const ITEMS_PER_PAGE = 15;

export default function LeadsTable({
    leads,
    loading,
    onViewLead,
    onRefresh,
    usersMap,
}: LeadsTableProps) {

    const [currentPage, setCurrentPage] = useState(1);

    const paginatedLeads = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE;
        return leads.slice(start, end);
    }, [leads, currentPage]);

    const handleMarkRead = async (e: React.MouseEvent, lead: WhatsaapLeadResponse) => {
        e.stopPropagation();
        if (lead.read_at) return;

        try {
            await markLeadRead(lead.id);
            showToast.success('Marked as Read');
            onRefresh();
        } catch (error) {
            console.error(error);
            showToast.error('Failed to mark as read');
        }
    };

    const handleDelete = async (e: React.MouseEvent, lead: WhatsaapLeadResponse) => {
        e.stopPropagation();

        if (!confirm('Are you sure you want to delete this lead? This action cannot be undone.')) {
            return;
        }

        try {
            await deleteLead(lead.id);
            showToast.success('Lead deleted successfully');
            onRefresh();
        } catch (error) {
            console.error(error);
            showToast.error('Failed to delete lead');
        }
    };

    const getStatusColor = (status: LeadStatusEnum) => {
        switch (status) {
            case LeadStatusEnum.NEW: return 'bg-blue-100 text-blue-800';
            case LeadStatusEnum.GENUINE: return 'bg-green-100 text-green-800';
            case LeadStatusEnum.NOT_REACHABLE: return 'bg-yellow-100 text-yellow-800';
            case LeadStatusEnum.FAKE: return 'bg-red-100 text-red-800';
            case LeadStatusEnum.SHORTLISTED: return 'bg-purple-100 text-purple-800';
            case LeadStatusEnum.REJECTED: return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Loading leads...</div>;
    }

    if (leads.length === 0) {
        return <div className="p-8 text-center text-gray-500">No leads found.</div>;
    }

    return (
        <div className="space-y-4">

            {/* TABLE */}
            <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                <table className="w-full bg-white text-sm text-left">
                    <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
                        <tr>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Candidate</th>
                            <th className="px-4 py-3">Profile</th>
                            <th className="px-4 py-3">Location</th>
                            <th className="px-4 py-3">Date</th>
                            <th className="px-4 py-3">Worked By</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                        {paginatedLeads.map((lead) => {
                            const phoneDigits = lead.phone.replace(/\D/g, '');

                            return (
                                <tr
                                    key={lead.id}
                                    className={`hover:bg-gray-50 transition ${
                                        !lead.read_at ? 'bg-blue-50/30' : ''
                                    }`}
                                >
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(lead.status)}`}>
                                            {lead.status.replace('_', ' ').toUpperCase()}
                                        </span>
                                    </td>

                                    <td className="px-4 py-3">
                                        <div className="font-medium text-gray-900">{lead.name}</div>
                                        <div className="text-xs text-gray-500">{lead.phone}</div>
                                    </td>

                                    <td className="px-4 py-3">
                                        <div className="text-gray-900">{lead.job_profile}</div>
                                        <div className="text-gray-500 text-xs capitalize">
                                            {lead.experience} • {lead.age} yrs
                                        </div>
                                    </td>

                                    <td className="px-4 py-3 text-gray-600">
                                        {lead.street || '-'}
                                    </td>

                                    <td className="px-4 py-3 text-gray-600">
                                        {new Date(lead.created_at).toLocaleDateString()}
                                        <div className="text-xs text-gray-400">
                                            {new Date(lead.created_at).toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </div>
                                    </td>

                                    <td className="px-4 py-3 text-gray-600">
                                        {lead.updated_by ? (
                                            <span className="flex items-center gap-1 text-xs">
                                                <span className="w-2 h-2 rounded-full bg-blue-400" />
                                                {usersMap[lead.updated_by] || `User #${lead.updated_by}`}
                                            </span>
                                        ) : lead.read_by ? (
                                            <span className="flex items-center gap-1 text-xs">
                                                <span className="w-2 h-2 rounded-full bg-green-400" />
                                                {usersMap[lead.read_by] || `User #${lead.read_by}`}
                                            </span>
                                        ) : (
                                            <span className="text-xs text-gray-400">-</span>
                                        )}
                                    </td>

                                    {/* ACTIONS */}
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-2">

                                            <a
                                                href={`tel:${phoneDigits}`}
                                                onClick={(e) => e.stopPropagation()}
                                                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                                                title="Call"
                                            >
                                                <FaPhone />
                                            </a>

                                            <a
                                                href={`https://wa.me/${phoneDigits}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={(e) => e.stopPropagation()}
                                                className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg"
                                                title="WhatsApp"
                                            >
                                                <FaWhatsapp />
                                            </a>

                                            {!lead.read_at && (
                                                <button
                                                    onClick={(e) => handleMarkRead(e, lead)}
                                                    className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg"
                                                    title="Mark as Read"
                                                >
                                                    <FaCheck />
                                                </button>
                                            )}

                                            <button
                                                onClick={() => onViewLead(lead)}
                                                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                                                title="View Details"
                                            >
                                                <FaEye />
                                            </button>

                                            <button
                                                onClick={(e) => handleDelete(e, lead)}
                                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                                title="Delete Lead"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* PAGINATION */}
            <Pagination
                currentPage={currentPage}
                totalItems={leads.length}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={setCurrentPage}
            />
        </div>
    );
}
