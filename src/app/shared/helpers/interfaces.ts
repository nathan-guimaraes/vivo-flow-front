export interface ICloneable<T> {
  clone(): T;
}

export interface IEntityCreatedAt {
  createdAt?: Date;
}

export interface IEntityUpdatedAt {
  updatedAt?: Date;
}
