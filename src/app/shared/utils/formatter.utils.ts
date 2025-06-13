export class FormatterUtils {
  static formatPercent(value: number | string) {
    return Number(value).toPrecision(4) + ' %';
  }
}
