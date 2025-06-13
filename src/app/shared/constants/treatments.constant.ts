import { TreatmentPauseReasonType } from '../models/treatment-pause-reason.model';

export const treatmentPauseReasonMap = new Map<
  TreatmentPauseReasonType,
  string
>([
  [
    TreatmentPauseReasonType.DoubtOrPendingProtocol,
    'Pausa – Dúvida ou Pendência Protocolo',
  ],
  [
    TreatmentPauseReasonType.LunchOrDinner,
    'Pausa Almoço/Janta – para almoço/janta',
  ],
  [TreatmentPauseReasonType.CoffeeTime, 'Pausa Lanche – lanche/café'],
  [TreatmentPauseReasonType.Rest, 'Pausa Descanso – para descanso'],
  [TreatmentPauseReasonType.Bathroom, 'Pausa Banheiro – para banheiro'],
  [TreatmentPauseReasonType.Feedback, 'Pausa Feedback – para falar com gestor'],
  [
    TreatmentPauseReasonType.Training,
    'Pausa Treinamento – para desenvolvimento',
  ],
  [
    TreatmentPauseReasonType.OutpatientClinic,
    'Pausa Ambulatório – para afastamento de horas',
  ],
  [
    TreatmentPauseReasonType.FollowUp,
    'Pausa Acompanhamento - Para acompanhar alguém em alguma atividade',
  ],
  [
    TreatmentPauseReasonType.Defect,
    'Pausa Defeito - Manutenção do equipamento de trabalho',
  ],
  [
    TreatmentPauseReasonType.Meeting,
    'Pausa Reunião - Para participar de alguma reunião ou evento',
  ],
  [TreatmentPauseReasonType.Particular, 'Pausa Particular - Motivos pessoais'],
]);
