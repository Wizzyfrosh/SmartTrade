import { toNodeHandler } from "better-auth/node";
import { auth } from "../../src/lib/auth";

export default toNodeHandler(auth);

export const config = {
  api: {
    bodyParser: false,
  },
};
