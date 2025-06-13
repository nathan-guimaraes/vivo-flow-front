export interface IDisposable {
  readonly disposed: boolean;
  dispose(): void;
}

export interface IDataSource extends IDisposable {
  isLoading(): boolean;
  load(): void;
  cancel(): void;
}