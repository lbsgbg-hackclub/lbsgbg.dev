"use client";

import { createAuthClient } from "better-auth/react";
import { LoaderCircle } from "lucide-react";
import { redirect } from "next/navigation";
import TextGradient from "@/components/text-gradient";
import { authClient } from "@/server/better-auth/client";

const { useSession } = createAuthClient();

export default function LoginPage() {
	const session = useSession();

	if (session.data) redirect("/");
	else
		authClient.signIn.oauth2({
			providerId: "hack-club",
		});

	return (
		<div className="fixed inset-0 grid place-items-center">
			<div className="inline-flex items-center gap-2 font-bold">
				<LoaderCircle className="size-4 animate-spin text-foreground/70" />
				<TextGradient className="text-base" duration={2}>
					Redirecting to oAuth2 provider ...
				</TextGradient>
			</div>
		</div>
	);
}
