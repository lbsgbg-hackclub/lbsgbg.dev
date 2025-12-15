"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/trpc/react";

function formatDateTime(dt: Date) {
	return new Date(dt).toLocaleString("sv-SE", {
		weekday: "short",
		year: "numeric",
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

function toInputValue(dt: Date | null) {
	if (!dt) return "";
	const d = new Date(dt);
	const pad = (n: number) => `${n}`.padStart(2, "0");
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function AdminDashboard() {
	const [startsAt, setStartsAt] = useState("");
	const [location, setLocation] = useState("");
	const [workshopTitle, setWorkshopTitle] = useState("");
	const [workshopDescription, setWorkshopDescription] = useState("");
	const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(
		null,
	);

	const meetingsQuery = api.meeting.list.useQuery(undefined, {
		refetchOnWindowFocus: false,
	});

	const rsvpQuery = api.rsvp.listByMeeting.useQuery(
		selectedMeetingId
			? { meetingId: selectedMeetingId }
			: { meetingId: "00000000-0000-0000-0000-000000000000" },
		{
			enabled: Boolean(selectedMeetingId),
			refetchOnWindowFocus: false,
		},
	);

	const createMeeting = api.meeting.create.useMutation({
		onSuccess: async () => {
			await meetingsQuery.refetch();
			setStartsAt("");
			setLocation("");
			setWorkshopTitle("");
			setWorkshopDescription("");
		},
	});

	const updateMeeting = api.meeting.update.useMutation({
		onSuccess: async () => {
			await meetingsQuery.refetch();
			if (selectedMeetingId) {
				await rsvpQuery.refetch();
			}
		},
	});

	const cancelMeeting = api.meeting.cancel.useMutation({
		onSuccess: async () => {
			await meetingsQuery.refetch();
			if (selectedMeetingId) {
				await rsvpQuery.refetch();
			}
		},
	});

	const selectedMeeting = useMemo(
		() => meetingsQuery.data?.find((m) => m.id === selectedMeetingId) ?? null,
		[meetingsQuery.data, selectedMeetingId],
	);

	const handleCreate = (e: React.FormEvent) => {
		e.preventDefault();
		if (!startsAt || !location) return;

		createMeeting.mutate({
			startsAt: new Date(startsAt),
			location,
			workshopTitle: workshopTitle || undefined,
			workshopDescription: workshopDescription || undefined,
		});
	};

	const handleUpdate = (e: React.FormEvent) => {
		e.preventDefault();
		if (!selectedMeeting) return;

		updateMeeting.mutate({
			id: selectedMeeting.id,
			startsAt: startsAt ? new Date(startsAt) : undefined,
			location: location || undefined,
			workshopTitle: workshopTitle || undefined,
			workshopDescription: workshopDescription || undefined,
		});
	};

	const handleToggleCancel = (meetingId: string, canceled: boolean) => {
		updateMeeting.mutate({ id: meetingId, canceled: !canceled });
	};

	return (
		<div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-6">
			<h1 className="font-bold text-3xl">Admin Dashboard</h1>

			<div className="grid gap-6 md:grid-cols-2">
				<Card className="border bg-background/60 p-6 backdrop-blur">
					<h2 className="font-semibold text-xl">Create Meeting</h2>
					<form className="mt-4 space-y-4" onSubmit={handleCreate}>
						<div>
							<Label className="text-foreground" htmlFor="startsAt">
								Start time
							</Label>
							<Input
								className="mt-1"
								id="startsAt"
								onChange={(e) => setStartsAt(e.target.value)}
								required
								type="datetime-local"
								value={startsAt}
							/>
						</div>
						<div>
							<Label className="text-foreground" htmlFor="location">
								Location
							</Label>
							<Input
								className="mt-1"
								id="location"
								onChange={(e) => setLocation(e.target.value)}
								required
								value={location}
							/>
						</div>
						<div>
							<Label className="text-foreground" htmlFor="workshopTitle">
								Workshop title (optional)
							</Label>
							<Input
								className="mt-1"
								id="workshopTitle"
								onChange={(e) => setWorkshopTitle(e.target.value)}
								value={workshopTitle}
							/>
						</div>
						<div>
							<Label className="text-foreground" htmlFor="workshopDescription">
								Workshop description (optional)
							</Label>
							<textarea
								className="mt-1 w-full rounded border bg-background/80 p-2 text-sm"
								id="workshopDescription"
								onChange={(e) => setWorkshopDescription(e.target.value)}
								value={workshopDescription}
							/>
						</div>
						<Button
							className="w-full"
							disabled={createMeeting.isPending}
							type="submit"
						>
							{createMeeting.isPending ? "Creating..." : "Create"}
						</Button>
						{createMeeting.isError && (
							<p className="text-red-500 text-sm">
								{createMeeting.error.message}
							</p>
						)}
					</form>
				</Card>

				<Card className="border bg-background/60 p-6 backdrop-blur">
					<h2 className="font-semibold text-xl">Meetings</h2>
					{meetingsQuery.isLoading ? (
						<p className="text-foreground/70 text-sm">Loading meetings...</p>
					) : meetingsQuery.isError ? (
						<p className="text-red-500 text-sm">
							{meetingsQuery.error.message}
						</p>
					) : !meetingsQuery.data?.length ? (
						<p className="text-foreground/70 text-sm">No meetings yet.</p>
					) : (
						<div className="mt-3 space-y-2">
							{meetingsQuery.data.map((m) => (
								<Card className="border p-3" key={m.id}>
									<div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
										<div>
											<p className="font-semibold text-sm">
												{formatDateTime(m.startsAt)}
											</p>
											<p className="text-foreground/80 text-sm">{m.location}</p>
											{m.workshopTitle ? (
												<p className="text-foreground/80 text-sm">
													🎓 {m.workshopTitle}
												</p>
											) : null}
											{m.canceled ? (
												<p className="text-red-500 text-sm">Canceled</p>
											) : null}
										</div>
										<div className="flex flex-wrap gap-2">
											<Button
												className="border"
												onClick={() => setSelectedMeetingId(m.id)}
												size="sm"
												variant="outline"
											>
												Manage
											</Button>
											<Button
												className="border"
												onClick={() => handleToggleCancel(m.id, m.canceled)}
												size="sm"
												variant="ghost"
											>
												{m.canceled ? "Uncancel" : "Cancel"}
											</Button>
										</div>
									</div>
								</Card>
							))}
						</div>
					)}
				</Card>
			</div>

			{selectedMeeting && (
				<Card className="border bg-background/60 p-6 backdrop-blur">
					<h2 className="font-semibold text-xl">Edit Meeting</h2>
					<form className="mt-4 space-y-4" onSubmit={handleUpdate}>
						<div>
							<Label className="text-foreground" htmlFor="editStartsAt">
								Start time
							</Label>
							<Input
								className="mt-1"
								id="editStartsAt"
								onChange={(e) => setStartsAt(e.target.value)}
								type="datetime-local"
								value={startsAt || toInputValue(selectedMeeting.startsAt)}
							/>
						</div>
						<div>
							<Label className="text-foreground" htmlFor="editLocation">
								Location
							</Label>
							<Input
								className="mt-1"
								id="editLocation"
								onChange={(e) => setLocation(e.target.value)}
								value={location || selectedMeeting.location}
							/>
						</div>
						<div>
							<Label className="text-foreground" htmlFor="editWorkshopTitle">
								Workshop title
							</Label>
							<Input
								className="mt-1"
								id="editWorkshopTitle"
								onChange={(e) => setWorkshopTitle(e.target.value)}
								value={workshopTitle || selectedMeeting.workshopTitle || ""}
							/>
						</div>
						<div>
							<Label
								className="text-foreground"
								htmlFor="editWorkshopDescription"
							>
								Workshop description
							</Label>
							<textarea
								className="mt-1 w-full rounded border bg-background/80 p-2 text-sm"
								id="editWorkshopDescription"
								onChange={(e) => setWorkshopDescription(e.target.value)}
								value={
									workshopDescription ||
									selectedMeeting.workshopDescription ||
									""
								}
							/>
						</div>
						<div className="flex flex-wrap gap-2">
							<Button
								className="border"
								disabled={updateMeeting.isPending}
								type="submit"
							>
								{updateMeeting.isPending ? "Saving..." : "Save changes"}
							</Button>
							<Button
								className="border"
								disabled={cancelMeeting.isPending}
								onClick={() => cancelMeeting.mutate({ id: selectedMeeting.id })}
								type="button"
								variant="outline"
							>
								{cancelMeeting.isPending ? "Canceling..." : "Cancel meeting"}
							</Button>
						</div>
						{(updateMeeting.isError || cancelMeeting.isError) && (
							<p className="text-red-500 text-sm">
								{updateMeeting.error?.message || cancelMeeting.error?.message}
							</p>
						)}
					</form>
				</Card>
			)}

			{selectedMeeting && (
				<Card className="border bg-background/60 p-6 backdrop-blur">
					<div className="flex items-center justify-between gap-2">
						<h2 className="font-semibold text-xl">RSVPs</h2>
						<Button
							className="border"
							disabled={rsvpQuery.isFetching}
							onClick={() => rsvpQuery.refetch()}
							size="sm"
							variant="outline"
						>
							{rsvpQuery.isFetching ? "Refreshing..." : "Refresh"}
						</Button>
					</div>
					{rsvpQuery.isLoading ? (
						<p className="text-foreground/70 text-sm">Loading RSVPs...</p>
					) : rsvpQuery.isError ? (
						<p className="text-red-500 text-sm">{rsvpQuery.error.message}</p>
					) : !rsvpQuery.data?.length ? (
						<p className="text-foreground/70 text-sm">No RSVPs yet.</p>
					) : (
						<div className="mt-3 space-y-2">
							{rsvpQuery.data.map((r) => (
								<div className="rounded border p-3" key={r.id}>
									<p className="font-semibold text-sm">{r.name}</p>
									<p className="text-foreground/80 text-sm">Class: {r.class}</p>
									<p className="text-foreground/60 text-xs">
										{formatDateTime(r.createdAt)}
									</p>
								</div>
							))}
						</div>
					)}
				</Card>
			)}
		</div>
	);
}
