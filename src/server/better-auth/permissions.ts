import { createAccessControl } from "better-auth/plugins/access";
import { adminAc, defaultStatements } from "better-auth/plugins/admin/access";

/**
 * make sure to use `as const` so typescript can infer the type correctly
 */
const statement = {
	...defaultStatements,
	admin: ["read", "write", "delete"],
	self: ["read", "update"],
} as const;

export const ac = createAccessControl(statement);

export const user = ac.newRole({
	self: ["read", "update"],
});
export const admin = ac.newRole({
	admin: ["read", "write", "delete"],
	...adminAc.statements,
});
