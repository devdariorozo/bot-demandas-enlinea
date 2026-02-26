// Responsabilidad: representar conceptos inmutables del dominio, validando reglas básicas.

/** Value Object para la FK a specialty_process en class_process: garantiza que sea un número entero > 0. */
export class ClassProcessSpecialtyId {
  private constructor(public readonly value: number) {}

  static create(value: unknown): ClassProcessSpecialtyId {
    const n = Number(value);
    if (!Number.isInteger(n) || n <= 0) {
      throw new Error('specialty_process_id must be a positive integer');
    }
    return new ClassProcessSpecialtyId(n);
  }
}
