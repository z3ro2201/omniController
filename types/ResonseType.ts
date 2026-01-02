export type ResponseType<T = unknown> = {
  resultCode: number;
  resultMsg?: string;
  resultData?: T;
};
