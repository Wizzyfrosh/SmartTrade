import { toNodeHandler } from "better-auth/node";
import { auth } from "../../src/lib/auth.js";

export default toNodeHandler(auth);

export const config = {
  api: {
    bodyParser: false,
  },
};
