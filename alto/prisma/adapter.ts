import { newEnforcer } from "casbin";
import { PrismaAdapter } from "casbin-prisma-adapter";

const enforcer = async () => {
  const a = await PrismaAdapter.newAdapter();
  const e = await newEnforcer("model.conf", a);
  return e;
};

export default enforcer;
