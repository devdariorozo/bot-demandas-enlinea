// Responsabilidad: representar conceptos inmutables del dominio, validando reglas básicas.

// Responsabilidad: representar conceptos inmutables del dominio, validando reglas básicas.

export enum DepartamentEnum {
    ARAUCA = 'Arauca',
    ATLANTICO = 'Atlántico',
    BOGOTA = 'Bogotá',
    BOLIVAR = 'Bolívar',
    BOYACA = 'Boyacá',
    CALDAS = 'Caldas',
    CAQUETA = 'Caquetá',
    CASANARE = 'Casanare',
    CAUCA = 'Cauca',
  }
  
  /** Value Object para la FK a departament: garantiza que sea un número entero > 0. */
  export class DepartamentId {
    private constructor(public readonly value: number) {}
  
    static create(value: unknown): DepartamentId {
      const n = Number(value);
      if (!Number.isInteger(n) || n <= 0) {
        throw new Error('departament_id must be a positive integer');
      }
      return new DepartamentId(n);
    }
  }
  
  