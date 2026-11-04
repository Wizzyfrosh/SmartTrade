import { toNodeHandler } from "better-auth/node";
import { auth } from "../../server/auth.mjs";

export const config = {
  api: { bodyParser: false },
};

export default toNodeHandler(auth.handler);
