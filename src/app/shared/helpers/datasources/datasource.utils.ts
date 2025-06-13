import { CustomDataSource } from './custom-datasource';
import { CustomRawDataSource } from './custom-raw-datasource';
import { DataSourceLike } from './types';

export class DataSourceUtils {
  static parse<T>(dataSource: DataSourceLike<T>) {
    if (!(dataSource instanceof CustomDataSource)) {
      if (typeof dataSource === 'function') {
        let auxDataSource = dataSource;
        dataSource = new CustomDataSource<T>({
          load: (options) => {
            return auxDataSource(options);
          },
        });
      } else {
        let auxDataSource = dataSource;
        dataSource = new CustomRawDataSource<T>({
          load: () => {
            return auxDataSource;
          },
        });
      }
    }

    return dataSource;
  }
}
