import apiClient from './axios';

export enum LeadStatusEnum {
    NEW = "new",
    GENUINE = "genuine",
    NOT_REACHABLE = "not_reachable",
    FAKE = "fake",
    SHORTLISTED = "shortlisted",
    REJECTED = "rejected"
}

export enum ExperienceEnum {
    FRESHER = "fresher",
    EXPERIENCED = "experienced"
}

export enum FollowUpActionEnum {
    CALL = "call",
    REMARK = "remark",
    STATUS_CHANGE = "status_change"
}

export interface WhatsaapLeadCreate {
    name: string;
    phone: string;
    age: number;
    job_profile: string;
    experience: ExperienceEnum;
    street?: string;
}

export interface WhatsaapLeadUpdate {
    status?: LeadStatusEnum;
    remarks?: string;
}

export interface WhatsaapLeadResponse {
    id: number;
    name: string;
    phone: string;
    age: number;
    job_profile: string;
    experience: ExperienceEnum;
    street?: string;
    status: LeadStatusEnum;
    remarks?: string;
    
    created_by?: number;
    updated_by?: number;
    remarks_by?: number;
    read_by?: number;
    
    created_at: string;
    updated_at: string;
    read_at?: string;
}

export interface LeadFollowUpCreate {
    lead_id: number;
    action: FollowUpActionEnum;
    note?: string;
}

export interface LeadFollowUpResponse {
    id: number;
    lead_id: number;
    admin_id: number;
    action: FollowUpActionEnum;
    note?: string;
    created_at: string;
}

export interface AdminFollowUpStats {
    admin_id: number;
    total_leads_followed: number;
}

export interface LeadStatusStats {
    status: LeadStatusEnum;
    total: number;
}

export interface LeadsSummary {
    total: number;
    unread: number;
    today: number;
    by_status: Record<string, number>;
}

export interface DailyLeadsStats {
    date: string;
    total: number;
}

export interface LeadFilters {
    skip?: number;
    limit?: number;
    status?: LeadStatusEnum;
    job_profile?: string;
    phone?: string;
    unread_only?: boolean;
}

// API Functions

export const submitLead = async (data: WhatsaapLeadCreate): Promise<WhatsaapLeadResponse> => {
    const response = await apiClient.post<WhatsaapLeadResponse>('/api/whatsaap-leads/', data);
    return response.data;
};

export const getLeads = async (params: LeadFilters = {}): Promise<WhatsaapLeadResponse[]> => {
    const response = await apiClient.get<WhatsaapLeadResponse[]>('/api/whatsaap-leads/', { params });
    return response.data;
};

export const getLead = async (leadId: number): Promise<WhatsaapLeadResponse> => {
    const response = await apiClient.get<WhatsaapLeadResponse>(`/api/whatsaap-leads/${leadId}`);
    return response.data;
};

export const updateLead = async (leadId: number, data: WhatsaapLeadUpdate): Promise<WhatsaapLeadResponse> => {
    const response = await apiClient.put<WhatsaapLeadResponse>(`/api/whatsaap-leads/${leadId}`, data);
    return response.data;
};

export const markLeadRead = async (leadId: number): Promise<WhatsaapLeadResponse> => {
    const response = await apiClient.post<WhatsaapLeadResponse>(`/api/whatsaap-leads/${leadId}/read`);
    return response.data;
};

export const createFollowUp = async (data: LeadFollowUpCreate): Promise<LeadFollowUpResponse> => {
    const response = await apiClient.post<LeadFollowUpResponse>('/api/whatsaap-leads/followups', data);
    return response.data;
};

export const getLeadFollowUps = async (leadId: number): Promise<LeadFollowUpResponse[]> => {
    const response = await apiClient.get<LeadFollowUpResponse[]>(`/api/whatsaap-leads/${leadId}/followups`);
    return response.data;
};

export const getAdminFollowUpStats = async (): Promise<AdminFollowUpStats[]> => {
    const response = await apiClient.get<AdminFollowUpStats[]>('/api/whatsaap-leads/stats/admin-followups');
    return response.data;
};

export const getLeadsSummary = async (): Promise<LeadsSummary> => {
    const response = await apiClient.get<LeadsSummary>('/api/whatsaap-leads/stats/summary');
    return response.data;
};

export const getLeadStatusStats = async (): Promise<LeadStatusStats[]> => {
    const response = await apiClient.get<LeadStatusStats[]>('/api/whatsaap-leads/stats/status');
    return response.data;
};

export const getDailyLeadsStats = async (): Promise<DailyLeadsStats[]> => {
    const response = await apiClient.get<DailyLeadsStats[]>('/api/whatsaap-leads/stats/daily');
    return response.data;
};

export const deleteLead = async (leadId: number): Promise<void> => {
    await apiClient.delete(`/api/whatsaap-leads/${leadId}`);
};
