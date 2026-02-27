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