import type { Movement } from "@/types";
import { api } from "./axios";

export const fetchMovements = async (): Promise<Movement[]> => (await api.get('/movements')).data.data;

export const createMovement = async (data: any) => {
    const response = await api.post('/movements', data);
    return response.data;
};