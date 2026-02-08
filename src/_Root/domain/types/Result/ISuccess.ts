export type TSuccessStatus = 'success';

export interface ISuccess<Data extends any = any> {
  status: TSuccessStatus,
  data: Data
}
