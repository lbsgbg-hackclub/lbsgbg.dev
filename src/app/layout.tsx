import "@/styles/globals.css";

import type { Metadata } from "next";
import { Onest } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { BreakpointDisplay } from "@/components/ui/breakpoint-display";
import { FlickeringGrid } from "@/components/ui/flickering-grid";
import { env } from "@/env";
import { TRPCReactProvider } from "@/trpc/react";

export const metadata: Metadata = {
	title: "LBS Göteborg Hack Club",
	description: "Programmera och bli belönad",
	icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const onest = Onest({
	subsets: ["latin"],
	variable: "--font-onest",
});

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<html className={`${onest.variable}`} lang="en" suppressHydrationWarning>
			<body>
				<ThemeProvider
					attribute="class"
					defaultTheme="dark"
					disableTransitionOnChange
					enableSystem
				>
					<TRPCReactProvider>
						{env.NODE_ENV === "production" ? null : <BreakpointDisplay />}
						<div className="-z-10 pointer-events-none fixed inset-0 bg-background">
							<FlickeringGrid
								className="absolute inset-0 size-full"
								color="#6B7280"
								flickerChance={0.1}
								gridGap={6}
								maxOpacity={0.5}
								squareSize={4}
							/>
						</div>
						{children}
					</TRPCReactProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
