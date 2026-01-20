import React from 'react';
import {
    LeadsSummary,
    LeadStatusStats,
    AdminFollowUpStats,
    LeadStatusEnum
} from '@/lib/whatsaapleads';

interface LeadsAnalyticsProps {
    summary: LeadsSummary | null;
    statusStats: LeadStatusStats[];
    adminStats: AdminFollowUpStats[];
    usersMap: Record<number, string>;
}

export default function LeadsAnalytics({
    summary,
    statusStats,
    adminStats,
    usersMap
}: LeadsAnalyticsProps) {
    if (!summary) return null;

    const getStatusColor = (status: LeadStatusEnum) => {
        switch (status) {
            case LeadStatusEnum.NEW:
                return 'bg-blue-600';
            case LeadStatusEnum.GENUINE:
                return 'bg-green-600';
            case LeadStatusEnum.NOT_REACHABLE:
                return 'bg-yellow-500';
            case LeadStatusEnum.FAKE:
                return 'bg-red-600';
            case LeadStatusEnum.SHORTLISTED:
                return 'bg-purple-600';
            case LeadStatusEnum.REJECTED:
                return 'bg-gray-500';
            default:
                return 'bg-gray-400';
        }
    };

    const maxAdminActions =
        adminStats.length > 0
            ? Math.max(...adminStats.map(a => a.total_leads_followed))
            : 0;

    return (
        <div className="space-y-6 mb-8">

            {/* SUMMARY */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <SummaryCard title="Total Leads" value={summary.total} />
                <SummaryCard title="Unread Leads" value={summary.unread} highlight="text-green-600" />
                <SummaryCard title="Today's Leads" value={summary.today} highlight="text-blue-600" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* STATUS BREAKDOWN */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Leads by Status
                    </h3>

                    <div className="space-y-4">
                        {statusStats.length === 0 && (
                            <p className="text-gray-500 text-sm">No data available</p>
                        )}

                        {statusStats.map(stat => {
                            const percentage =
                                summary.total > 0
                                    ? (stat.total / summary.total) * 100
                                    : 0;

                            return (
                                <div key={stat.status}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="capitalize text-gray-700">
                                            {stat.status.replace('_', ' ')}
                                        </span>
                                        <span className="font-medium text-gray-900">
                                            {stat.total}
                                        </span>
                                    </div>

                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className={`${getStatusColor(stat.status)} h-2 rounded-full transition-all`}
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* TEAM ACTIVITY */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Team Activity
                    </h3>

                    <div className="space-y-4">
                        {adminStats.length === 0 && (
                            <p className="text-gray-500 text-sm">No activity recorded</p>
                        )}

                        {adminStats.map(stat => {
                            const percentage =
                                maxAdminActions > 0
                                    ? (stat.total_leads_followed / maxAdminActions) * 100
                                    : 0;

                            return (
                                <div key={stat.admin_id}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="font-medium text-gray-900">
                                            {usersMap[stat.admin_id] ||
                                                `User #${stat.admin_id}`}
                                        </span>
                                        <span className="text-gray-600">
                                            {stat.total_leads_followed} actions
                                        </span>
                                    </div>

                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-green-600 h-2 rounded-full transition-all"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

            </div>
        </div>
    );
}

/* ---------- Helper Components ---------- */

function SummaryCard({
    title,
    value,
    highlight = 'text-gray-900'
}: {
    title: string;
    value: number;
    highlight?: string;
}) {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
            <p className={`text-3xl font-bold mt-2 ${highlight}`}>
                {value}
            </p>
        </div>
    );
}
