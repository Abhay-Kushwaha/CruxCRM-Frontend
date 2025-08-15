import React from 'react';
import { X, ExternalLink, Mail, Phone, Calendar, User, Building, Tag, FileText, MessageSquare, Clock } from 'lucide-react';

interface Conversation {
    id: string;
    date: string;
    conclusion: string;
    isProfitable: boolean | null;
    addedBy: string;
}

interface Document {
    id: string;
    url: string;
    description: string;
    size: number;
    createdAt: string;
}

interface Category {
    id: string;
    title: string;
    description: string;
    color: string;
}

interface AssignedTo {
    id: string;
    name: string;
    email: string;
}

interface LeadDetails {
    id: string;
    name: string;
    email: string;
    phoneNumber: number;
    category: Category;
    documents: Document[];
    position: string;
    leadSource: string;
    notes: string;
    assignedTo: AssignedTo;
    campaignSent: any[];
    status: string;
    priority: string;
    followUpDates: string[];
    lastContact: string;
    conversations: Conversation[];
    isDeleted: boolean;
    createdAt: string;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    leadData: LeadDetails | null;
}

const LeadDetailsDialog: React.FC<Props> = ({ isOpen, onClose, leadData }) => {
    if (!isOpen || !leadData) return null;

    const formatDate = (dateString: string): string => {
        if (!dateString) return 'Not available';

        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return 'Invalid date';
            }

            return new Intl.DateTimeFormat('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }).format(date);
        } catch (error) {
            return 'Invalid date';
        }
    };

    const formatDateShort = (dateString: string): string => {
        if (!dateString) return 'Not available';

        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return 'Invalid date';
            }

            return new Intl.DateTimeFormat('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            }).format(date);
        } catch (error) {
            return 'Invalid date';
        }
    };

    const getStatusColor = (status: string): string => {
        switch (status.toLowerCase()) {
            case 'new': return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'in-progress': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
            case 'follow-up': return 'bg-green-50 text-green-700 border-green-200';
            case 'closed': return 'bg-red-50 text-red-700 border-red-200';
            default: return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    const getPriorityColor = (priority: string): string => {
        switch (priority.toLowerCase()) {
            case 'high': return 'bg-red-50 text-red-700 border-red-200';
            case 'medium': return 'bg-orange-50 text-orange-700 border-orange-200';
            case 'low': return 'bg-green-50 text-green-700 border-green-200';
            default: return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    const handleEmailClick = (): void => {
        if (leadData.email) {
            window.open(`mailto:${leadData.email}`, '_blank');
        }
    };

    const handleCallClick = (): void => {
        if (leadData.phoneNumber) {
            window.open(`tel:${leadData.phoneNumber}`, '_blank');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/50">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-5xl mx-4 max-h-[95vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700">
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                            <User className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {leadData.name}
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                {leadData.position}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 p-2 hover:bg-white/50 cursor-pointer rounded-lg transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="space-y-8">
                        {/* Contact Information Card */}
                        <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 border border-gray-200 dark:border-gray-600 shadow-sm">
                            <div className="flex items-center space-x-2 mb-4">
                                <Mail className="w-5 h-5 text-blue-600" />
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Contact Information</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Email Address</p>
                                    <p className="text-base text-gray-900 dark:text-white font-medium">{leadData.email}</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone Number</p>
                                    <p className="text-base text-gray-900 dark:text-white font-medium">{leadData.phoneNumber}</p>
                                </div>
                            </div>
                        </div>

                        {/* Status & Priority Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600 shadow-sm">
                                <div className="flex items-center space-x-2 mb-3">
                                    <Tag className="w-5 h-5 text-green-600" />
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</p>
                                </div>
                                <span className={`inline-flex px-3 py-1.5 text-sm font-semibold rounded-lg border ${getStatusColor(leadData.status)}`}>
                                    {leadData.status}
                                </span>
                            </div>
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600 shadow-sm">
                                <div className="flex items-center space-x-2 mb-3">
                                    <Clock className="w-5 h-5 text-orange-600" />
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Priority</p>
                                </div>
                                <span className={`inline-flex px-3 py-1.5 text-sm font-semibold rounded-lg border ${getPriorityColor(leadData.priority)}`}>
                                    {leadData.priority}
                                </span>
                            </div>
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600 shadow-sm">
                                <div className="flex items-center space-x-2 mb-3">
                                    <Building className="w-5 h-5 text-purple-600" />
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Category</p>
                                </div>
                                <span
                                    className="inline-flex px-3 py-1.5 text-sm font-semibold rounded-lg text-white"
                                    style={{ backgroundColor: leadData.category?.color || '#6B7280' }}
                                >
                                    {leadData.category?.title || 'Uncategorized'}
                                </span>
                            </div>
                        </div>

                        {/* Lead Source & Assignment */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600 shadow-sm">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Lead Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Lead Source</p>
                                    <p className="text-base text-gray-900 dark:text-white">{leadData.leadSource}</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Assigned To</p>
                                    <p className="text-base text-gray-900 dark:text-white">
                                        {leadData.assignedTo?.name || 'Unassigned'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Documents Section */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600 shadow-sm">
                            <div className="flex items-center space-x-2 mb-4">
                                <FileText className="w-5 h-5 text-indigo-600" />
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Documents</h3>
                                <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-2 py-1 rounded-full">
                                    {leadData.documents.length}
                                </span>
                            </div>
                            <div className="space-y-3">
                                {leadData.documents.length > 0 ? (
                                    leadData.documents.map((doc) => (
                                        <div
                                            key={doc.id}
                                            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                                        >
                                            <div className="flex flex-col space-y-1">
                                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {doc.description}
                                                </span>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    {(doc.size / 1024).toFixed(2)} KB • {formatDate(doc.createdAt)}
                                                </span>
                                            </div>
                                            <a
                                                href={doc.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 px-3 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                            >
                                                <span className="text-sm font-medium">View</span>
                                                <ExternalLink size={16} />
                                            </a>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                        <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                        <p>No documents available</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Conversations Section */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600 shadow-sm">
                            <div className="flex items-center space-x-2 mb-4">
                                <MessageSquare className="w-5 h-5 text-green-600" />
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Conversation History</h3>
                                <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-2 py-1 rounded-full">
                                    {leadData.conversations.length}
                                </span>
                            </div>
                            <div className="space-y-4">
                                {leadData.conversations.length > 0 ? (
                                    leadData.conversations.map((conv) => (
                                        <div
                                            key={conv.id}
                                            className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border-l-4 border-blue-500"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <p className="text-sm text-gray-900 dark:text-white leading-relaxed">
                                                    {conv.conclusion}
                                                </p>
                                                {conv.isProfitable !== null && (
                                                    <span className={`ml-3 px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${conv.isProfitable
                                                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                        }`}>
                                                        {conv.isProfitable ? 'Positive' : 'Negative'}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                                                <span>{formatDate(conv.date)}</span>
                                                <span>Added by {conv.addedBy}</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                        <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                        <p>No conversations recorded</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Timeline Information */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600 shadow-sm">
                            <div className="flex items-center space-x-2 mb-4">
                                <Calendar className="w-5 h-5 text-blue-600" />
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Timeline</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Contact</p>
                                    <p className="text-base text-gray-900 dark:text-white">
                                        {formatDate(leadData.lastContact)}
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Created At</p>
                                    <p className="text-base text-gray-900 dark:text-white">
                                        {formatDate(leadData.createdAt)}
                                    </p>
                                </div>
                                {leadData.followUpDates.length > 0 && (
                                    <div className="space-y-2 md:col-span-2">
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Next Follow-up</p>
                                        <p className="text-base text-gray-900 dark:text-white">
                                            {formatDateShort(leadData.followUpDates[leadData.followUpDates.length - 1])}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Notes Section */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600 shadow-sm">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Notes</h3>
                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 min-h-[100px]">
                                <p className="text-base text-gray-900 dark:text-white whitespace-pre-wrap leading-relaxed">
                                    {leadData.notes || (
                                        <span className="text-gray-500 dark:text-gray-400 italic">
                                            No notes available
                                        </span>
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                    <div className="flex justify-end space-x-4">
                        <button
                            onClick={handleEmailClick}
                            disabled={!leadData.email}
                            className={`flex items-center space-x-2 px-6 py-3 rounded-lg cursor-pointer font-medium transition-colors ${leadData.email
                                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                        >
                            <Mail size={18} />
                            <span>Email</span>
                        </button>
                        <button
                            onClick={handleCallClick}
                            disabled={!leadData.phoneNumber}
                            className={`flex items-center space-x-2 px-6 py-3 rounded-lg cursor-pointer font-medium transition-colors ${leadData.phoneNumber
                                    ? 'bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                        >
                            <Phone size={18} />
                            <span>Call</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LeadDetailsDialog;