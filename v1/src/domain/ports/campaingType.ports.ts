// Responsabilidad: contratos del dominio (interfaces) que la infraestructura debe implementar.

import { CampaingType } from "@domain/entities/campaingType.entities";

/** Token para inyección del repositorio (las interfaces no existen en runtime en NestJS). */
export const CAMPaING_TYPE_REPOSITORY = Symbol('CAMPaING_TYPE_REPOSITORY');

/** Datos mínimos para crear un tipo de cartera (id y fechas son opcionales). */
export type CreateCampaingTypeInput = Pick<CampaingType, 'type' | 'detail' | 'state_type_id' | 'responsible'> & Partial<CampaingType>;

export interface CampaingTypeRepository {
    // Crear un nuevo tipo de campaña
    create(CampaingType: CreateCampaingTypeInput): Promise<CampaingType>;
    // Buscar si el tipo de campaña ya existe
    findByDuplicate(type: string):  Promise<CampaingType | null>;
    // Obtener todos los tipos de campaña
    findAll(): Promise<CampaingType[]>;
    // Obtener un tipo de campaña por su id
    findById(id: number): Promise<CampaingType>;
    // Obntener un tipo de campaña por su type
    findByType(type: string): Promise<CampaingType>;
    // Actualizar un tipo de campaña
    update(CampaingType: CampaingType): Promise<CampaingType>;
    // Eliminar un tipo de campaña
    delete(id: number): Promise<void>;
}