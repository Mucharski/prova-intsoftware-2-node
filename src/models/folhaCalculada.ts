import { Funcionario } from "./funcionario";

export interface FolhaCalculada {
  Mes: number;
  Ano: number;
  Horas: number;
  Valor: number;
  Bruto: number;
  Irrf: number;
  Inss: number;
  Fgts: number;
  Liquido: string;
  Funcionario: Funcionario;
}
