'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { messageAPI, Message } from '@/lib/message';
import { 
  FaEnvelope, 
  FaEnvelopeOpen, 
  FaReply, 
  FaCheckCircle,
  FaClock,
  FaBriefcase,
  FaUser,
  FaPhone,
  FaCalendarAlt,
  FaFilter,
  FaSearch
} from 'react-icons/fa';
import Link from 'next/link';

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  new: { label: 'New', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: FaClock },
  read: { label: 'Read', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: FaEnvelopeOpen },
  replied: { label: 'Replied', color: 'bg-green-100 text-green-700 border-green-200', icon: FaReply },
  closed: { label: 'Closed', color: 'bg-gray-100 text-gray-700 border-gray-200', icon: FaCheckCircle },
};

export default function MessagesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    read: 0,
    replied: 0,
    closed: 0,
  });
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user && (user.role === 'admin' || user.role === 'manager')) {
      fetchMessages();
      fetchStats();
    } else if (user) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router, selectedStatus, selectedJobId]);

  const fetchMessages = async () => {
    if (!user || (user.role !== 'admin' && user.role !== 'manager')) return;

    setLoading(true);
    try {
      const params: any = {};
      if (selectedStatus) params.status = selectedStatus;
      if (selectedJobId) params.job_id = selectedJobId;
      
      const data = await messageAPI.getMessages({ ...params, limit: 1000 });
      console.log('Fetched messages:', data); // Debug log
      setMessages(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Failed to fetch messages:', error);
      console.error('Error details:', error.response?.data);
      // Show error to user
      if (error.response?.status === 401 || error.response?.status === 403) {
        alert('You do not have permission to view messages. Please ensure you are logged in as admin or manager.');
      } else {
        alert('Failed to load messages: ' + (error.response?.data?.detail || error.message));
      }
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    if (!user || (user.role !== 'admin' && user.role !== 'manager')) return;

    try {
      const data = await messageAPI.getMessageStats();
      console.log('Fetched stats:', data); // Debug log
      setStats(data);
    } catch (error: any) {
      console.error('Failed to fetch stats:', error);
      console.error('Error details:', error.response?.data);
      // Set default stats on error
      setStats({
        total: 0,
        new: 0,
        read: 0,
        replied: 0,
        closed: 0,
      });
    }
  };

  const handleStatusUpdate = async (messageId: number, newStatus: string) => {
    try {
      await messageAPI.updateMessageStatus(messageId, newStatus);
      fetchMessages();
      fetchStats();
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update message status');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredMessages = messages.filter((msg) => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        msg.sender_name.toLowerCase().includes(searchLower) ||
        msg.phone.includes(searchTerm) ||
        msg.email?.toLowerCase().includes(searchLower) ||
        msg.message.toLowerCase().includes(searchLower) ||
        msg.job?.title.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-surface-light">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user || (user.role !== 'admin' && user.role !== 'manager')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-surface-light">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
                <div className="text-brand-600">
                  <FaEnvelope size={24} />
                </div>
                Messages
              </h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">
                Manage job inquiry messages from candidates
              </p>
            </div>
            <Link
              href="/dashboard"
              className="px-4 py-2 text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm sm:text-base"
            >
              Back to Dashboard
            </Link>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-2">Total</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="bg-blue-50 rounded-xl shadow-sm p-4 border border-blue-200">
              <p className="text-xs sm:text-sm font-medium text-blue-700 mb-2">New</p>
              <p className="text-xl sm:text-2xl font-bold text-blue-900">{stats.new}</p>
            </div>
            <div className="bg-yellow-50 rounded-xl shadow-sm p-4 border border-yellow-200">
              <p className="text-xs sm:text-sm font-medium text-yellow-700 mb-2">Read</p>
              <p className="text-xl sm:text-2xl font-bold text-yellow-900">{stats.read}</p>
            </div>
            <div className="bg-green-50 rounded-xl shadow-sm p-4 border border-green-200">
              <p className="text-xs sm:text-sm font-medium text-green-700 mb-2">Replied</p>
              <p className="text-xl sm:text-2xl font-bold text-green-900">{stats.replied}</p>
            </div>
            <div className="bg-gray-50 rounded-xl shadow-sm p-4 border border-gray-200">
              <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2">Closed</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.closed}</p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <div className="text-gray-400">
                      <FaSearch size={16} />
                    </div>
                  </div>
                  <input
                    type="text"
                    placeholder="Search by name, phone, email, or message..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-field pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={selectedStatus || ''}
                  onChange={(e) => setSelectedStatus(e.target.value || null)}
                  className="input-field"
                >
                  <option value="">All Status</option>
                  <option value="new">New</option>
                  <option value="read">Read</option>
                  <option value="replied">Replied</option>
                  <option value="closed">Closed</option>
                </select>
                <button
                  onClick={() => {
                    setSelectedStatus(null);
                    setSelectedJobId(null);
                    setSearchTerm('');
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Messages List */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">Loading messages...</p>
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto text-gray-400 mb-4 flex justify-center">
                <FaEnvelope size={48} />
              </div>
              <p className="text-gray-600 font-medium">No messages found</p>
              <p className="text-sm text-gray-500 mt-1">
                {searchTerm || selectedStatus ? 'Try adjusting your filters' : 'Messages will appear here when candidates send inquiries'}
              </p>
              {messages.length === 0 && !loading && (
                <p className="text-xs text-gray-400 mt-2">
                  Total messages in system: {stats.total}
                </p>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredMessages.map((message) => {
                const statusInfo = statusConfig[message.status] || statusConfig.new;
                const StatusIcon = statusInfo.icon;

                return (
                  <div
                    key={message.id}
                    className="p-5 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex flex-col lg:flex-row gap-4">
                      {/* Main Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-3 mb-3">
                          <div className={`px-3 py-1 rounded-full border text-xs font-semibold flex items-center gap-1.5 ${statusInfo.color}`}>
                            <StatusIcon size={12} />
                            {statusInfo.label}
                          </div>
                          {message.job && (
                            <Link
                              href={`/jobs/${message.job.slug}`}
                              className="flex items-center gap-2 text-sm text-brand-600 hover:text-brand-700 hover:underline"
                            >
                              <FaBriefcase size={14} />
                              <span className="font-medium">{message.job.title}</span>
                            </Link>
                          )}
                        </div>

                        <div className="space-y-2 mb-3">
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <div className="text-gray-400">
                              <FaUser size={14} />
                            </div>
                            <span className="font-medium">{message.sender_name}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <div className="text-gray-400">
                              <FaPhone size={14} />
                            </div>
                            <span>{message.phone}</span>
                            {message.email && (
                              <>
                                <span className="text-gray-300">•</span>
                                <span>{message.email}</span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-3 mb-3">
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">{message.message}</p>
                        </div>

                        <div className="flex flex-col gap-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1.5">
                            <FaCalendarAlt size={12} />
                            Created {formatDate(message.created_at)}
                          </span>
                          {message.read_at && (
                            <span className="flex items-center gap-1.5 text-yellow-600">
                              <FaEnvelopeOpen size={12} />
                              Read {formatDate(message.read_at)}
                              {message.read_by_name && (
                                <span className="text-gray-600">by <span className="font-medium">{message.read_by_name}</span></span>
                              )}
                            </span>
                          )}
                          {message.replied_at && (
                            <span className="flex items-center gap-1.5 text-green-600">
                              <FaReply size={12} />
                              Replied {formatDate(message.replied_at)}
                              {message.replied_by_name && (
                                <span className="text-gray-600">by <span className="font-medium">{message.replied_by_name}</span></span>
                              )}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2 lg:min-w-[200px]">
                        {message.status === 'new' && (
                          <button
                            onClick={() => handleStatusUpdate(message.id, 'read')}
                            className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                          >
                            <FaEnvelopeOpen size={14} />
                            Mark as Read
                          </button>
                        )}
                        {message.status === 'read' && (
                          <button
                            onClick={() => handleStatusUpdate(message.id, 'replied')}
                            className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                          >
                            <FaReply size={14} />
                            Mark as Replied
                          </button>
                        )}
                        {message.status !== 'closed' && (
                          <button
                            onClick={() => handleStatusUpdate(message.id, 'closed')}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                          >
                            <FaCheckCircle size={14} />
                            Close
                          </button>
                        )}
                        {message.status === 'closed' && (
                          <button
                            onClick={() => handleStatusUpdate(message.id, 'new')}
                            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                          >
                            Reopen
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

