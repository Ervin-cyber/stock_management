export type Role = 'ADMIN' | 'MANAGER' | 'VIEWER';
export type MovementType = 'IN' | 'OUT' | 'TRANSFER';

export interface User {
    id: string;
    email: string;
    name: string | null;
    role: Role;
}

export interface AuthState {
    token: string | null;
    user: User | null;
    setAuth: (token: string, user: User) => void;
    logout: () => void;
}

export interface Product {
    id: string;
    sku: string;
    name: string;
    description: string | null;
    createdById: string;
    createdBy?: User;
    createdAt: string;
    updatedAt: string;
}

export interface Warehouse {
    id: string;
    name: string;
    location: string | null;
    createdById: string;
    createdBy?: User;
    createdAt: string;
    updatedAt: string;
}

export interface Movement {
    id: string;
    movementType: MovementType;
    stockQuantity: number;
    reference: string | null;
    description: string | null;
    productId: string
    sourceWarehouseId: string | null;
    destinationWarehouseId: string | null;
    createdById: string;
    createdAt: string;

    createdBy?: User;
    product?: Product;
    sourceWarehouse?: Warehouse;
    destinationWarehouse?: Warehouse;
}

export interface PaginatedResponse<T> {
    data: T;
    meta: {
        total: number,
        page: number,
        limit: number,
        totalPages: number
    }
}

export interface Stats {
    totalProducts: number;
    totalWarehouses: number;
    lowStockItems: number;
}

export interface ProductDetailSheetProps {
    productId: string | null;
    isOpen: boolean;
    onClose: () => void;
}

export interface DataTablePaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export interface FetchOptions {
    page?: number;
    limit?: number;
    all?: boolean;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface MovementOptions {
    page?: number;
    limit?: number;
    type?: string;
    sourceWarehouseId?: string;
    destinationWarehouseId?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface EditDialogProps {
    isOpen: boolean;
    onClose: () => void;
    editingItem: any | null;
}

export interface DataTableProps<T> {
    items: T[];
    isLoading: boolean;
    isErrored: boolean;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
    onSort: (column: string) => void;
    onEdit?: (product: any) => void;
    onDelete?: (id: string) => void;
    onView?: (id: string) => void;
    hasPermission: boolean;
}