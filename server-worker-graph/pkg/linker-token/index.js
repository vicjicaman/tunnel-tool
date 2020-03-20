import jwt from "jsonwebtoken";

export const create = async (payload, { key: privateKey }, cxt) => {
  return jwt.sign(payload, privateKey, {
    algorithm: "RS256"
  });
};

export const decrypt = async (token, { key: publicKey }, cxt) => {
  try {
    return jwt.verify(token, publicKey, {
      algorithm: "RS256"
    });
  } catch (e) {
    cxt.logger.error("token.error", { error: e.toString(), token });
    return null;
  }
};
