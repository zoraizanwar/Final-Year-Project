import api from './api';

export const insightsApi = {
    getInsights: () => api.get('insights/'),
    getLiveInsights: () => api.get('insights/live/'),
    getPricingSuggestions: () => api.get('insights/pricing/'),
    getDemandAlerts: () => api.get('insights/demand-alerts/'),
    getStockWarnings: () => api.get('insights/stock-warnings/'),
};
