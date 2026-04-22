import apiClient from '@/lib/apiClient';

export interface StudioDashboardStats {
    captions: number;
    images: number;
    scripts: number;
    carousels: number;
    total: number;
}

export interface GenerationItem {
    id: string;
    type: 'caption' | 'image' | 'script' | 'carousel';
    title: string;
    content: string;
    imageUrl?: string;
    createdAt: string | Date;
}

export const StudioService = {
    getDashboardStats: async (businessId: string) => {
        const response = await apiClient.get<StudioDashboardStats>(`/api/v1/studio/dashboard?businessId=${businessId}`);

        
return response.data;
    },

    listGenerations: async (businessId: string, limit: number = 10) => {
        const response = await apiClient.get<GenerationItem[]>(`/api/v1/studio/generations?businessId=${businessId}&limit=${limit}`);

        
return response.data || [];
    }
};
