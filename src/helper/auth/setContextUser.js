import { tradeTokenForUser } from '../encode';

export const setGraphqlContext = ({ ctx: { request, session } }) => {
  let authToken = null;
  let currentUser = null;

  try {
    authToken = request.headers.authorization;
    if (authToken) {
      currentUser = tradeTokenForUser(authToken);
    }
  } catch (e) {
    throw e;
  }

  return {
    authToken,
    currentUser,
    session,
  };
};
