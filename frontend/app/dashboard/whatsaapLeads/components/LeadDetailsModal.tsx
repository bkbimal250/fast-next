import React, { useEffect, useState } from 'react';
import { 
    WhatsaapLeadResponse, 
    LeadStatusEnum, 
    LeadFollowUpResponse, 
    updateLead, 
    createFollowUp, 
    getLeadFollowUps,
    FollowUpActionEnum 
} from '@/lib/whatsaapleads';
import { showToast } from '@/lib/toast';
import { FaTimes, FaHistory, FaUser, FaWhatsapp } from 'react-icons/fa';

interface LeadDetailsModalProps {
    lead: WhatsaapLeadResponse;
    isOpen: boolean;
    onClose: () => void;
    onUpdate: (updatedLead: WhatsaapLeadResponse) => void;
    usersMap: Record<number, string>;
}

export default function LeadDetailsModal({ lead, isOpen, onClose, onUpdate, usersMap }: LeadDetailsModalProps) {
    const [status, setStatus] = useState<LeadStatusEnum>(lead.status);
    const [remarks, setRemarks] = useState(lead.remarks || '');
    const [followups, setFollowups] = useState<LeadFollowUpResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingFollowups, setLoadingFollowups] = useState(false);

    useEffect(() => {
        if (isOpen && lead) {
            setStatus(lead.status);
            setRemarks(lead.remarks || '');
            fetchFollowups();
        }
    }, [isOpen, lead]);

    const fetchFollowups = async () => {
        setLoadingFollowups(true);
        try {
            const data = await getLeadFollowUps(lead.id);
            setFollowups(data);
        } catch (error) {
            console.error("Failed to fetch followups", error);
        } finally {
            setLoadingFollowups(false);
        }
    };

    const handleUpdate = async () => {
        setLoading(true);
        try {
            // Update status/remarks
            const updated = await updateLead(lead.id, {
                status: status !== lead.status ? status : undefined,
                remarks: remarks !== lead.remarks ? remarks : undefined
            });
            
            showToast.success("Lead Updated");
            onUpdate(updated);
            fetchFollowups(); // Refresh history
        } catch (error) {
            console.error(error);
            showToast.error("Failed to update lead");
        } finally {
            setLoading(false);
        }
    };

    const handleAddNote = async (e: React.FormEvent) => {
        e.preventDefault();
        // This could be a separate "Add Note" feature, but for now we use the main update logic
        // If we want just a note without changing main remarks field:
        // But backend `updateLead` updates the main `remarks` column. 
        // Backend `createFollowUp` can add a standalone note.
        // Let's assume the user wants to update the persistent remarks or status.
        // If we want purely a history note, we'd use createFollowUp directly.
        // For now, let's stick to updateLead which creates a followup record too.
        handleUpdate();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{lead.name}</h2>
                        <p className="text-sm text-gray-500">ID: #{lead.id} • Created {new Date(lead.created_at).toLocaleDateString()}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
                        <FaTimes size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Left Column: Details */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Candidate Details</h3>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-gray-500 uppercase font-semibold">Phone</label>
                                    <div className="flex items-center gap-2">
                                        <p className="text-gray-900">{lead.phone}</p>
                                        <a href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-green-500 hover:text-green-600">
                                            <FaWhatsapp size={18} />
                                        </a>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 uppercase font-semibold">Age</label>
                                    <p className="text-gray-900">{lead.age} years</p>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 uppercase font-semibold">Job Profile</label>
                                    <p className="text-gray-900">{lead.job_profile}</p>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 uppercase font-semibold">Experience</label>
                                    <p className="text-gray-900 capitalize">{lead.experience}</p>
                                </div>
                                <div className="col-span-2">
                                    <label className="text-xs text-gray-500 uppercase font-semibold">Location</label>
                                    <p className="text-gray-900">{lead.street || 'N/A'}</p>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg space-y-2 mt-4">
                                <h4 className="font-medium text-gray-900 text-sm">System Info</h4>
                                <div className="text-sm text-gray-600 space-y-1">
                                    <p>Created: {new Date(lead.created_at).toLocaleString()}</p>
                                    <p>Updated: {new Date(lead.updated_at).toLocaleString()}</p>
                                    <p>Read By: {lead.read_by ? usersMap[lead.read_by] : 'Unread'}</p>
                                    {lead.read_at && <p>Read At: {new Date(lead.read_at).toLocaleString()}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Actions & History */}
                        <div className="space-y-6">
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                <h3 className="text-lg font-semibold text-blue-900 mb-4">Update Status</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-blue-800 mb-1">Status</label>
                                        <select
                                            value={status}
                                            onChange={(e) => setStatus(e.target.value as LeadStatusEnum)}
                                            className="w-full rounded-lg border-blue-200 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            {Object.values(LeadStatusEnum).map((s) => (
                                                <option key={s} value={s}>{s.replace('_', ' ').toUpperCase()}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-blue-800 mb-1">Remarks / Note</label>
                                        <textarea
                                            value={remarks}
                                            onChange={(e) => setRemarks(e.target.value)}
                                            rows={3}
                                            className="w-full rounded-lg border-blue-200 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Add a remark..."
                                        />
                                    </div>
                                    <button
                                        onClick={handleUpdate}
                                        disabled={loading}
                                        className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                                    >
                                        {loading ? 'Updating...' : 'Update Lead'}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <FaHistory /> Activity History
                                </h3>
                                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                                    {loadingFollowups ? (
                                        <p className="text-gray-500 text-center py-4">Loading history...</p>
                                    ) : followups.length === 0 ? (
                                        <p className="text-gray-500 text-center py-4">No activity recorded</p>
                                    ) : (
                                        followups.map((fp) => (
                                            <div key={fp.id} className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="font-medium text-gray-900 text-sm flex items-center gap-1">
                                                        <FaUser size={10} /> {usersMap[fp.admin_id] || `User #${fp.admin_id}`}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        {new Date(fp.created_at).toLocaleString()}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                                        fp.action === FollowUpActionEnum.STATUS_CHANGE ? 'bg-purple-100 text-purple-700' :
                                                        fp.action === FollowUpActionEnum.CALL ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-gray-200 text-gray-700'
                                                    }`}>
                                                        {fp.action.replace('_', ' ')}
                                                    </span>
                                                </div>
                                                {fp.note && (
                                                    <p className="text-sm text-gray-700 mt-1">{fp.note}</p>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
