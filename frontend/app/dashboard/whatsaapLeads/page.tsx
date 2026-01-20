'use client';

import { useEffect, useState } from 'react';
import { 
    getLeads, 
    getLeadsSummary, 
    getLeadStatusStats, 
    getAdminFollowUpStats,
    WhatsaapLeadResponse,
    LeadsSummary,
    LeadStatusStats,
    AdminFollowUpStats,
    LeadStatusEnum,
    LeadFilters,
    deleteLead,
} from '@/lib/whatsaapleads';
import { userAPI } from '@/lib/user';

import LeadsAnalytics from './components/LeadsAnalytics';
import LeadsTable from './components/LeadsTable';
import LeadDetailsModal from './components/LeadDetailsModal';
import Navbar from '@/components/Navbar';

import { FaSearch } from 'react-icons/fa';

export default function WhatsAppLeadsDashboard() {

    /* ---------------- DATA STATE ---------------- */
    const [leads, setLeads] = useState<WhatsaapLeadResponse[]>([]);
    const [summary, setSummary] = useState<LeadsSummary | null>(null);
    const [statusStats, setStatusStats] = useState<LeadStatusStats[]>([]);
    const [adminStats, setAdminStats] = useState<AdminFollowUpStats[]>([]);
    const [usersMap, setUsersMap] = useState<Record<number, string>>({});

    /* ---------------- UI STATE ---------------- */
    const [loading, setLoading] = useState(true);
    const [selectedLead, setSelectedLead] = useState<WhatsaapLeadResponse | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    /* ---------------- FILTER STATE ---------------- */
    const [filters, setFilters] = useState<LeadFilters>({
        limit: 50,
        skip: 0,
    });
    const [searchTerm, setSearchTerm] = useState('');

    /* ---------------- EFFECTS ---------------- */
    useEffect(() => {
        fetchAllData();
    }, []);

    useEffect(() => {
        fetchLeads();
    }, [filters]);

    /* ---------------- API CALLS ---------------- */
    const fetchAllData = async () => {
        setLoading(true);
        try {
            await Promise.all([
                fetchUsers(),
                fetchStats(),
                fetchLeads(),
            ]);
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        const users = await userAPI.getAllUsers(0, 100);
        const map: Record<number, string> = {};
        users.forEach(u => (map[u.id] = u.name));
        setUsersMap(map);
    };

    const fetchStats = async () => {
        const [sum, stat, admin] = await Promise.all([
            getLeadsSummary(),
            getLeadStatusStats(),
            getAdminFollowUpStats(),
        ]);
        setSummary(sum);
        setStatusStats(stat);
        setAdminStats(admin);
    };

    const fetchLeads = async () => {
        const currentFilters = { ...filters };

        if (searchTerm) {
            if (/^\d+$/.test(searchTerm)) {
                currentFilters.phone = searchTerm;
            } else {
                currentFilters.job_profile = searchTerm;
            }
        } else {
            delete currentFilters.phone;
            delete currentFilters.job_profile;
        }

        const data = await getLeads(currentFilters);
        setLeads(data);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchLeads();
    };

    const handleLeadUpdate = (updatedLead: WhatsaapLeadResponse) => {
        setLeads(prev =>
            prev.map(l => (l.id === updatedLead.id ? updatedLead : l))
        );
        setSelectedLead(updatedLead);
        fetchStats();
    };

    /* ---------------- RENDER ---------------- */
    return (
        <div className="min-h-screen bg-gray-50">
            {/* NAVBAR */}
            <Navbar />

            {/* PAGE CONTENT */}
            <div className="pt-6 px-6 max-w-7xl mx-auto">

                {/* ANALYTICS */}
                <LeadsAnalytics
                    summary={summary}
                    statusStats={statusStats}
                    adminStats={adminStats}
                    usersMap={usersMap}
                />

                {/* FILTERS */}
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <form onSubmit={handleSearch} className="relative w-full md:w-96">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by phone or job profile..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
                        />
                    </form>

                    <div className="flex gap-4 w-full md:w-auto">
                        <select
                            value={filters.status || ''}
                            onChange={(e) =>
                                setFilters(prev => ({
                                    ...prev,
                                    status: e.target.value as LeadStatusEnum || undefined,
                                }))
                            }
                            className="px-4 py-2 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-green-500"
                        >
                            <option value="">All Statuses</option>
                            {Object.values(LeadStatusEnum).map(s => (
                                <option key={s} value={s}>
                                    {s.replace('_', ' ').toUpperCase()}
                                </option>
                            ))}
                        </select>

                        <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white cursor-pointer">
                            <input
                                type="checkbox"
                                checked={filters.unread_only || false}
                                onChange={(e) =>
                                    setFilters(prev => ({
                                        ...prev,
                                        unread_only: e.target.checked || undefined,
                                    }))
                                }
                                className="w-4 h-4 text-green-600"
                            />
                            <span className="text-gray-700">Unread Only</span>
                        </label>
                    </div>
                </div>

                {/* TABLE */}
                <LeadsTable
                    leads={leads}
                    loading={loading}
                    onViewLead={(lead) => {
                        setSelectedLead(lead);
                        setIsModalOpen(true);
                    }}
                    onRefresh={fetchAllData}
                    usersMap={usersMap}
                />

                {/* MODAL */}
                {selectedLead && (
                    <LeadDetailsModal
                        lead={selectedLead}
                        isOpen={isModalOpen}
                        onClose={() => {
                            setIsModalOpen(false);
                            setSelectedLead(null);
                        }}
                        onUpdate={handleLeadUpdate}
                        usersMap={usersMap}
                    />
                )}
            </div>
        </div>
    );
}
