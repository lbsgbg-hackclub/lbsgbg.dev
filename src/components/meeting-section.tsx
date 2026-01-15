"use client";

import confetti from "canvas-confetti";
import { Calendar, DoorClosed, ToolCase } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/trpc/react";

interface MeetingRSVP {
	name: string;
	class: string;
}

export function MeetingSection() {
	const [formData, setFormData] = useState<MeetingRSVP>({
		name: "",
		class: "",
	});

	const {
		data: nextMeeting,
		isLoading: isMeetingLoading,
		isError: isMeetingError,
		error: meetingError,
	} = api.meeting.next.useQuery();

	const [confettiOrigin, setConfettiOrigin] = useState<{
		x: number;
		y: number;
	} | null>(null);

	const rsvpMutation = api.rsvp.create.useMutation({
		onSuccess: () => {
			setFormData({ name: "", class: "" });
			if (confettiOrigin) confetti({ origin: confettiOrigin });
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!nextMeeting || nextMeeting.canceled) return;

		rsvpMutation.mutate({
			name: formData.name,
			class: formData.class,
			meetingId: nextMeeting.id,
		});
	};

	const handleSubmitButtonClick = (
		event: React.MouseEvent<HTMLButtonElement>,
	) => {
		const rect = event.currentTarget.getBoundingClientRect();
		const x = (rect.left + rect.width / 2) / window.innerWidth;
		const y = (rect.top + rect.height / 2) / window.innerHeight;
		setConfettiOrigin({ x, y });
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const meetingDate = nextMeeting ? new Date(nextMeeting.startsAt) : null;
	const formattedDate = meetingDate
		? meetingDate
				.toLocaleDateString("sv-SE", {
					weekday: "long",
					year: "numeric",
					month: "long",
					day: "numeric",
				})
				.replace(/^\w/, (c) => c.toUpperCase())
		: "Ingen planerad träff";

	const formattedTime = meetingDate
		? meetingDate.toLocaleTimeString("sv-SE", {
				hour: "2-digit",
				minute: "2-digit",
			})
		: "--:--";

	const rsvpDisabled =
		rsvpMutation.isPending ||
		rsvpMutation.isSuccess ||
		!nextMeeting ||
		nextMeeting?.canceled;

	return (
		<section className="flex w-full justify-center p-4 pt-20">
			<div className="w-full max-w-2xl">
				<h2 className="mb-8 text-center font-bold text-3xl">
					Nästa Klubbträff
				</h2>
				<div className="grid gap-6 md:grid-cols-2">
					<Card className="rounded-none border bg-background/60 p-6 backdrop-blur">
						<div className="space-y-4">
							{isMeetingLoading ? (
								<p className="ml-7 text-foreground/70 text-sm">
									Laddar möte...
								</p>
							) : isMeetingError ? (
								<p className="ml-7 text-red-500 text-sm">
									{meetingError?.message ?? "Kunde inte hämta möte."}
								</p>
							) : !nextMeeting ? (
								<p className="ml-7 text-foreground/70 text-sm">
									Ingen planerad träff ännu.
								</p>
							) : (
								<>
									<div>
										<h3 className="mb-2 flex items-center gap-2 font-semibold text-lg">
											<Calendar className="h-5 w-5" />
											Datum & Tid
										</h3>
										<p className="ml-7 text-foreground/90">{formattedDate}</p>
										<p className="ml-7 text-foreground/70 text-sm">
											{formattedTime}
										</p>
									</div>
									<div>
										<h3 className="mb-2 flex items-center gap-2 font-semibold text-lg">
											<DoorClosed className="h-5 w-5" />
											Plats
										</h3>
										<p className="ml-7 text-foreground/90">
											{nextMeeting.location}
										</p>
									</div>
									{nextMeeting.workshopTitle && (
										<div>
											<h3 className="mb-2 flex items-center gap-2 font-semibold text-lg">
												<ToolCase className="h-5 w-5" />
												Workshop
											</h3>
											<p className="ml-7 text-foreground/90">
												{nextMeeting.workshopTitle}
											</p>
											{nextMeeting.workshopDescription && (
												<p className="ml-7 text-foreground/70 text-sm">
													{nextMeeting.workshopDescription}
												</p>
											)}
										</div>
									)}
									{nextMeeting.canceled && (
										<p className="ml-7 text-red-500 text-sm">
											Detta möte är inställt.
										</p>
									)}
								</>
							)}
						</div>
					</Card>

					<Card className="rounded-none border bg-background/60 p-6 backdrop-blur">
						<h3 className="font-semibold text-lg">
							Intresseanmälan
							<p className="mb-4 text-gray-600 text-sm">(frivilligt)</p>
						</h3>

						<form className="space-y-4" onSubmit={handleSubmit}>
							<div>
								<Label className="text-foreground" htmlFor="name">
									Namn
								</Label>
								<Input
									className="mt-1"
									id="name"
									name="name"
									onChange={handleChange}
									placeholder="Ditt namn"
									required
									value={formData.name}
								/>
							</div>
							<div>
								<Label className="text-foreground" htmlFor="class">
									Klass
								</Label>
								<Input
									className="mt-1"
									id="class"
									name="class"
									onChange={handleChange}
									placeholder="Din klass (e.x. SUAW25B)"
									required
									value={formData.class}
								/>
							</div>
							<Button
								className="w-full border bg-linear-to-r from-[#fcfcfc] to-[#d6d6d6] text-black hover:opacity-80"
								disabled={rsvpDisabled}
								onClick={handleSubmitButtonClick}
								type="submit"
							>
								{rsvpMutation.isPending && "Registrerar..."}
								{rsvpMutation.isSuccess && "✓ Vi ses!"}
								{!rsvpMutation.isPending &&
									!rsvpMutation.isSuccess &&
									"Jag är intresserad!"}
							</Button>
							{rsvpMutation.isError && (
								<p className="text-red-500 text-sm">
									{rsvpMutation.error.message}
								</p>
							)}
						</form>
					</Card>
				</div>
			</div>
		</section>
	);
}
