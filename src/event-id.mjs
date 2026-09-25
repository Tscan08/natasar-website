// Stable id for an event, used to key its "who's going" sign-ups.
// Shared by the site build and the /api/rsvp function, so it must not read any files.
// Defaults to "<year>-<title-slug>"; set "id" on an event in the JSON to pin it
// (e.g. if you rename an event that already has sign-ups).
export const slug = (s) =>
  String(s).toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '').trim().replace(/[\s_-]+/g, '-').slice(0, 60);

export const eventId = (ev) => ev.id || `${ev.start.slice(0, 4)}-${slug(ev.title)}`;
