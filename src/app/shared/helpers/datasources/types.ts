import { Observable } from 'rxjs';
import { CustomDataSource, IDataLoadOptions } from './custom-datasource';

export type DataSourceValueLike<T> = T[] | Observable<T[]> | Promise<T[]>;

type DataSourceValueFnLike<T> =
  | DataSourceValueLike<T>
  | ((options: IDataLoadOptions) => DataSourceValueLike<T>);

export type DataSourceLike<T> = DataSourceValueFnLike<T> | CustomDataSource<T>;
