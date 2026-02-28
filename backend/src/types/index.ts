import { MovementType } from "@prisma/client";

export interface LoginBody {
    email?: string;
    password?: string;
}

export interface UpsertProductBody {
    sku: string;
    name: string;
    description?: string;
    active?: boolean;
}

export interface UpsertWarehouseBody {
    name: string;
    location: string;
    active?: boolean;
}

export interface CreateMovementBody {
    productId: string;
    movementType: MovementType;
    stockQuantity: number;
    sourceWarehouseId?: string;
    destinationWarehouseId?: string;
}

export interface IdentifierParam {
    id: string;
}

export interface FetchQueryParams {
    Querystring: {
        page?: string;
        limit?: string;
        all?: string;
        search?: string;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    }
}
export interface MovementsQueryParams {
    Querystring: {
        page?: string;
        limit?: string;
        type?: string;
        sourceWarehouseId?: string;
        destinationWarehouseId?: string;
        search?: string;
        startDate?: string;
        endDate?: string;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    }
}