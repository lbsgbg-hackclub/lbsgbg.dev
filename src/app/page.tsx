import Image from "next/image";
import LinkButton from "@/components/link-button";
import { MeetingSection } from "@/components/meeting-section";
import { AuroraText } from "@/components/ui/aurora-text";
import { getSession } from "@/server/better-auth/server";
import { HydrateClient } from "@/trpc/server";

export default async function Home() {
	const session = await getSession();

	return (
		<HydrateClient>
			<a href="https://hackclub.com">
				<Image
					alt="HackClub"
					className="absolute inset-0 left-8 h-24 w-auto"
					height={315}
					src={"https://assets.hackclub.com/flag-orpheus-top-bw.svg"}
					unoptimized
					width={560}
				/>
			</a>
			<header className="mt-[12vh] grid w-full grid-cols-1">
				<div className="flex flex-row justify-center">
					<Image
						alt="LBS_HackClub_Banner_Transparent"
						className="px-18 lg:px-16"
						height={123.5}
						loading="eager"
						src={"/LBS_HackClub_Banner_Transparent.png"}
						width={600}
					/>
				</div>
				<h1 className="m-10 text-center font-bold text-5xl lg:text-6xl">
					LBS Göteborg <br></br>
					<AuroraText speed={2}>Hack Club</AuroraText>
				</h1>
				<div className="flex flex-row justify-center gap-4">
					<div className="w-80 rounded-none border bg-background/60 p-4 shadow-lg backdrop-blur">
						<div className="grid grid-cols-1 gap-3">
							<LinkButton
								className="from-zinc-800 to-zinc-700 hover:from-zinc-700 hover:to-zinc-600"
								href="https://github.com/lbsgbg-hackclub"
								iconSrc="https://icons.hackclub.com/api/icons/white/github.svg"
							>
								GitHub Organization
							</LinkButton>
							<LinkButton
								className="from-[#ED354F] to-[#a70f26] hover:from-[#ff3954] hover:to-[#cc132f]"
								href="https://hcb.hackclub.com/lbs-gothenburg-hack-club"
								iconSrc="https://icons.hackclub.com/api/icons/white/bank-circle.svg"
							>
								HCB Organization
							</LinkButton>
							{session && (
								<LinkButton
									className="from-[#3360da] to-[#3d8bff] hover:from-[#336dda] hover:to-[#3d8bff]"
									href="/dashboard"
									iconSrc="https://icons.hackclub.com/api/icons/white/clubs-fill.svg"
								>
									Dashboard
								</LinkButton>
							)}
						</div>
					</div>
				</div>
				<MeetingSection />
			</header>
		</HydrateClient>
	);
}
