// Responsabilidad: insertar datos iniciales (semilla).

import { DataSource } from 'typeorm';
import { StateTypeEntity } from '../entities/stateType.entities';

export const stateTypeSeeds = async (dataSource: DataSource) => {
    const stateTypeRepository = dataSource.getRepository(StateTypeEntity);
    await stateTypeRepository.save([
        { type: 'Active', detail: 'Active registered', created_at: new Date(), updated_at: new Date(), responsible: 'BOT demands online' },
        { type: 'Inactive', detail: 'Inactive registered', created_at: new Date(), updated_at: new Date(), responsible: 'BOT demands online' },
    ]);
};