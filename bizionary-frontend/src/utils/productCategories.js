export const PRODUCT_CATEGORIES = [
    { value: 'Tech', label: 'Tech', prefix: 'TA' },
    { value: 'Stationary', label: 'Stationary', prefix: 'SA' },
    { value: 'Medicines', label: 'Medicines', prefix: 'MA' },
];

export const CATEGORY_COMPANIES = {
    Tech: 'Tech Solutions',
    Stationary: 'XYZ Industries',
    Medicines: 'MediCare Pharma',
};

export const normalizeProductCategory = (category) => {
    const raw = String(category || '').trim().toLowerCase();

    if (raw === 'tech' || raw === 'tech accessories') {
        return 'Tech';
    }

    if (raw === 'stationary' || raw === 'stationery') {
        return 'Stationary';
    }

    if (raw === 'medicine' || raw === 'medicines') {
        return 'Medicines';
    }

    return '';
};

export const getCategoryPrefix = (category) => {
    const normalized = normalizeProductCategory(category);
    const match = PRODUCT_CATEGORIES.find((item) => item.value === normalized);
    return match?.prefix || '';
};

export const getCompanyForCategory = (category) => {
    const normalized = normalizeProductCategory(category);
    return CATEGORY_COMPANIES[normalized] || '';
};
