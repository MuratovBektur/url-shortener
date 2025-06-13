export type anyObjectType = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

export interface ITokenResponse {
  expires_in: number;
  token_type: string;
  access_token: string;
  refresh_token: string;
}
