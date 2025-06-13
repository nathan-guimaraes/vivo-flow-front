export interface DisapprovalTreatmentsInfoLike {
  date: Date;
  disapprovedTreatments: number;
  treatments: number;
}

export class DisapprovalTreatmentsInfo implements DisapprovalTreatmentsInfoLike {
  date: Date;
  disapprovedTreatments: number;
  treatments: number;

  constructor(item?: Partial<DisapprovalTreatmentsInfoLike>) {
    this.date = !item?.date ? null : new Date(item.date);
    this.disapprovedTreatments = item?.disapprovedTreatments;
    this.treatments = item?.treatments;
  }
}
