// Responsabilidad: representar conceptos inmutables del dominio, validando reglas básicas.

export enum CampaingType {
  CLARO = 'Claro',
  TUYA = 'Tuya',
}

/** Value Object para la FK a portfolio_type: garantiza que sea un número entero > 0. */
export class CampaingTypeId {
  private constructor(public readonly value: number) {}

  static create(value: unknown): CampaingTypeId {
    const n = Number(value);
    if (!Number.isInteger(n) || n <= 0) {
      throw new Error('campaing_type_id must be a positive integer');
    }
    return new CampaingTypeId(n);
  }
}