import { ActionFunction } from '@remix-run/node';

export const action: ActionFunction = async () => {
  return {
    status: 200,
    body: 'OK',
  };
};
