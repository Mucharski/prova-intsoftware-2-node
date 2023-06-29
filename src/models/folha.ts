import { Funcionario } from "./funcionario";

export interface Folha {
  Mes: number;
  Ano: number;
  Horas: number;
  Valor: number;
  Funcionario: Funcionario;
}
