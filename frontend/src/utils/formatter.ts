export const formatDate = (dateString: string | Date): string => {
    if (!dateString) return '-';
    
    return new Intl.DateTimeFormat('ro-Ro', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(new Date(dateString));
};

export const formatDateTime = (dateString: string | Date): string => {
    if (!dateString) return '-';
    
    return new Intl.DateTimeFormat('ro-Ro', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(dateString));
};

export const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('ro-RO').format(num);
};