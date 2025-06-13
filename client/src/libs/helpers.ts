import type { ITokenResponse } from 'src/types';

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export function set_token(token_reponse: ITokenResponse) {
  for (const key of Object.keys(token_reponse)) {
    window.localStorage.setItem(
      key,
      String(token_reponse[key as keyof ITokenResponse]),
    );
  }
}

const access_token_label = 'access_token';
const token_type_label = 'token_type';
const refresh_token_label = 'refresh_token';
const expires_in_label = 'expires_in';

export function get_token_info() {
  const access_token =
    sessionStorage.getItem(access_token_label) ||
    localStorage.getItem(access_token_label);

  const token_type =
    sessionStorage.getItem(token_type_label) ||
    localStorage.getItem(token_type_label);

  const refresh_token =
    sessionStorage.getItem(refresh_token_label) ||
    localStorage.getItem(refresh_token_label);

  if (!access_token || !token_type || !refresh_token) return null;

  return {
    token_type,
    access_token,
    refresh_token,
  };
}

export function clear_token() {
  window.localStorage.removeItem(access_token_label);
  window.localStorage.removeItem(refresh_token_label);
  window.localStorage.removeItem(token_type_label);
  window.localStorage.removeItem(expires_in_label);

  window.sessionStorage.removeItem(access_token_label);
  window.sessionStorage.removeItem(refresh_token_label);
  window.sessionStorage.removeItem(token_type_label);
  window.sessionStorage.removeItem(expires_in_label);
}
