import { UnauthenticatedError } from "../errors/CustomErrors.js";
import { verifyJWT } from "../utils/tokenUtils.js";


export const authenticateUser = async (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    throw new UnauthenticatedError('authentication invalid');
  }

  try {
    const { userId } = verifyJWT(token);
    req.userId = userId;
    next();
  } catch (error) {
    throw new UnauthenticatedError('authentication invalid');
  }
};