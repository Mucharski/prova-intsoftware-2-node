import { Router, Response, Request } from "express";
import { Folha } from "../models/folha";
import { FolhaCalculada } from "../models/folhaCalculada";
var amqp = require("amqplib/callback_api");

export const router = Router();

router.post("/cadastrarFolha", async (req: Request, res: Response) => {
  let body: Folha = req.body;
  let salarioBruto = body.Horas * body.Valor;

  let aliquotaIrrf = 0;
  let parcelaADeduzir = 0;

  if (salarioBruto >= 1904 && salarioBruto <= 2827) {
    aliquotaIrrf = 7.5;
    parcelaADeduzir = 142.8;
  } else if (salarioBruto > 2827 && salarioBruto <= 3751) {
    aliquotaIrrf = 15;
    parcelaADeduzir = 354.8;
  } else if (salarioBruto > 3751 && salarioBruto <= 4665) {
    aliquotaIrrf = 22.5;
    parcelaADeduzir = 636.13;
  } else if (salarioBruto > 4665) {
    aliquotaIrrf = 27.5;
    parcelaADeduzir = 869.36;
  }

  let inss = 0.08;

  if (salarioBruto >= 1694 && salarioBruto < 2823) {
    inss = 0.09;
  } else if (salarioBruto >= 2823 && salarioBruto < 5646) {
    inss = 0.11;
  } else if (salarioBruto >= 5645) {
    inss = 621.03;
  }

  let fgts = salarioBruto * 0.08;
  let inssADescontar = 0;

  if (inss != 621.03) {
    inssADescontar = salarioBruto * inss;
  } else {
    inssADescontar = 621.03;
  }

  let folhaCalculada: FolhaCalculada = {
    Mes: body.Mes,
    Ano: body.Ano,
    Horas: body.Horas,
    Valor: body.Valor,
    Bruto: body.Horas * body.Valor,
    Inss: inssADescontar,
    Irrf: parcelaADeduzir,
    Fgts: fgts,
    Liquido: (
      body.Horas * body.Valor -
      parcelaADeduzir -
      inssADescontar
    ).toFixed(2),
    Funcionario: body.Funcionario,
  };

  amqp.connect("amqp://localhost", function (error0: any, connection: any) {
    if (error0) {
      throw error0;
    }
    connection.createChannel(function (error1: any, channel: any) {
      if (error1) {
        throw error1;
      }
      var queue = "folhaPagamento";

      channel.assertQueue(queue, {
        durable: false,
      });

      channel.sendToQueue(queue, Buffer.from(JSON.stringify(folhaCalculada)));
      console.log("[x] Sent %s", JSON.stringify(folhaCalculada));
    });
  });

  return res
    .status(200)
    .json({ EnviadoAFila: true, FolhaCalculada: folhaCalculada });
});
