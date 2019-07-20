import { tradeTokenForUser } from '../encode';
import { TokenExpiredError } from '../error';

export const setGraphqlContext = ({ ctx: { request, session } }) => {
  let authToken = null;
  let currentUser = null;
  const city = request.headers['x-city'] ? decodeURI(request.headers['x-city']) : null;

  try {
    authToken = request.headers.authorization;
    if (authToken) {
      currentUser = tradeTokenForUser(authToken);
    }
  } catch (e) {
    if (e.name === 'TokenExpiredError') throw new TokenExpiredError();
    throw e;
  }

  return {
    authToken,
    currentUser,
    session,
    city,
  };
};
