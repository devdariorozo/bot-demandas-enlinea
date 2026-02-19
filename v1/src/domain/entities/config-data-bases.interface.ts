/**
 * Representación de dominio de una configuración de bases de datos.
 * La infraestructura (entidad TypeORM) mapea contra esta estructura.
 */
export interface ConfigDataBases {
  id: number;
  environment: string;
  portfolio_type: string;
  campaign: string | null;
  data_bases: string[];
  detail: string | null;
  state_type: number;
  created_at: Date;
  updated_at: Date;
  responsible: string | null;
}
