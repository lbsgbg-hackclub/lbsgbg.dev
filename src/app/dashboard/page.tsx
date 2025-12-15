import { redirect } from "next/navigation";
import { getSession } from "@/server/better-auth/server";
import { HydrateClient } from "@/trpc/server";
import { AdminDashboard } from "./admin-dashboard";

export default async function DashboardPage() {
	const session = await getSession();
	const role = session?.user?.role;
	const roles = (
		session as unknown as { user?: { roles?: string[] } } | undefined
	)?.user?.roles;
	const isAdmin =
		role === "admin" || (Array.isArray(roles) && roles.includes("admin"));

	if (!isAdmin) {
		redirect("/");
	}

	return (
		<HydrateClient>
			<AdminDashboard />
		</HydrateClient>
	);
}
