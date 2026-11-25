// Page content. Edit text here; edit the schedule in data/schedule-<currentYear>.json.
import { site, esc, img, dateRange, monthAbbr, monthName, dayNum, extLink, readJSON, readReports } from './lib.mjs';
import { communityStrip } from './layout.mjs';
import { eventId } from './event-id.mjs';

const Y = site.currentYear;
const schedule = readJSON(`data/schedule-${Y}.json`);
const archive = readJSON('data/schedule-archive.json');

/* ---------- shared bits ---------- */

function pageHero({ eyebrow, title, lede, image }) {
  return `
<section class="page-hero${image ? ' has-image' : ''}"${image ? ` style="--hero:url('${esc(image)}')"` : ''}>
  <div class="wrap">
    ${eyebrow ? `<p class="eyebrow">${esc(eyebrow)}</p>` : ''}
    <h1>${esc(title)}</h1>
    ${lede ? `<p class="lede">${lede}</p>` : ''}
  </div>
</section>`;
}

function eventCard(ev, { compact = false, rsvp = false } = {}) {
  const image = img(ev.image);
  const links = (ev.links || []).map((l) => extLink(l.url, l.label, 'btn btn-small')).join(' ');
  // "tbd": "days" → month known, days not; "tbd": "date" → no date yet (start/end only set the sort order).
  const badge = ev.tbd === 'date' ? ['Date', 'TBD'] : [monthAbbr(ev.start), ev.tbd ? 'TBD' : dayNum(ev.start)];
  const when = ev.tbd === 'date' ? 'Date TBD'
    : ev.tbd ? `${monthName(ev.start)} · dates TBD`
    : `<time datetime="${ev.start}">${dateRange(ev.start, ev.end)}</time>${ev.dateNote ? ` (${esc(ev.dateNote)})` : ''}`;
  return `
<article class="event${compact ? ' compact' : ''}${ev.tbd ? ' is-tbd' : ''}" data-start="${ev.start}" data-end="${ev.end || ev.start}" id="${ev.start}">
  <div class="event-date" aria-hidden="true"><span>${badge[0]}</span><strong>${badge[1]}</strong></div>
  <div class="event-body">
    <p class="event-meta"><span>${when}</span>${ev.tag ? ` <span class="tag">${esc(ev.tag)}</span>` : ''}<span class="status"></span></p>
    <h3>${esc(ev.title)}</h3>
    ${ev.location ? `<p class="event-loc">${esc(ev.location)}</p>` : ''}
    ${ev.description && !compact ? `<p>${esc(ev.description)}</p>` : ''}
    ${links && !compact ? `<p class="event-links">${links}</p>` : ''}
    ${rsvp ? `<div class="rsvp" data-rsvp="${esc(eventId(ev))}" hidden></div>` : ''}
  </div>
  ${image && !compact ? `<img class="event-img" src="${esc(image)}" alt="" loading="lazy">` : ''}
</article>`;
}

/* ---------- Home ---------- */

export function home() {
  const upcoming = schedule.events.map((e) => eventCard(e, { compact: true })).join('');
  const body = `
<section class="hero" style="--hero:url('${esc(img('home-fleet'))}')">
  <div class="wrap hero-inner">
    <p class="eyebrow">North America Tasars</p>
    <h1>Welcome, sailors of all ages and skills</h1>
    <p class="lede">Looking to hone your small boat sailing skills? The Pacific Northwest hosts a fun and talented fleet of Tasar sailors who aim to create the best competitive sailing environment available.</p>
    <p class="hero-cta">
      <a class="btn btn-primary" href="/find-a-boat">Borrow a boat</a>
      <a class="btn btn-ghost" href="/${Y}-schedule">See the ${Y} schedule</a>
    </p>
  </div>
</section>

<section class="section">
  <div class="wrap split">
    <div>
      <h2>High-performance racing, without flying sails</h2>
      <p>Tasars are especially appealing for couples and post-collegiate double-handed sailors. We invite you to try out our friendly fleet by borrowing a boat and joining any of our upcoming practices and regattas!</p>
      <p><a class="text-link" href="/find-a-boat">Learn how to get on the water →</a></p>
    </div>
    <div class="next-up" data-next-up>
      <h3>Coming up</h3>
      <div class="next-list">${upcoming}</div>
      <p class="next-empty" hidden>That's a wrap for ${Y}. Watch the mailing list for next season's plans.</p>
      <p><a class="text-link" href="/${Y}-schedule">Full ${Y} schedule →</a></p>
    </div>
  </div>
</section>

<section class="section alt">
  <div class="wrap">
    <div class="cards">
      <a class="card" href="/${Y}-schedule">
        <h3>${Y} Schedule</h3>
        <p>Weekly tune-ups, regattas across the Northwest, and Worlds training.</p>
        <span class="card-go">View schedule →</span>
      </a>
      <a class="card" href="/boats-tuning">
        <h3>Boats &amp; Tuning</h3>
        <p>Learn more about Tasars and how best to set them up and sail fast.</p>
        <span class="card-go">Resources →</span>
      </a>
      <a class="card" href="/find-a-boat">
        <h3>Find a Boat</h3>
        <p>Borrow or charter a boat and try out this fast, fun and friendly fleet!</p>
        <span class="card-go">Get started →</span>
      </a>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap split reverse">
    <figure class="photo"><img src="${esc(img('home-fleet'))}" alt="Tasars racing in the Pacific Northwest" loading="lazy"></figure>
    <div>
      <h2>A fleet with a Worlds pedigree</h2>
      <p>Tasars have been active in the PNW since the 1980s. Several regional members have won the Worlds, including Jay and Lisa Renehan, Anthony Boscolo and Haley Lane, Carol and Carl Buchan, Dalton and Lindsey Bergan, and — five times — Jonathan and Libby McKee.</p>
      <ul class="timeline">
        <li><strong>2026</strong> Tasar Worlds in June at Kunigami, Okinawa, Japan. 4 NATA teams placed in the top 10, including 1st and 2nd! ${extLink('https://bulkhead.jp/2024/01/102096/', 'More')}</li>
        <li><strong>2025</strong> 6 teams went to ${extLink('https://2025.tasarworlds.com/', 'Tasar Worlds')} at Lake Garda, Italy.</li>
        <li><strong>2024</strong> 10 teams went to ${extLink('https://www.tasar.org/worlds/2024-melbourne-worlds.aspx', 'Tasar Worlds')} in Melbourne and took 3 top-10 finishes, including 1st!</li>
        <li><strong>2022</strong> NATA hosted ${extLink('https://www.facebook.com/2022tasarworlds', 'Tasar Worlds in Seattle')}.</li>
      </ul>
    </div>
  </div>
</section>
${communityStrip()}`;
  return { path: '/', title: '', body };
}

/* ---------- Schedule ---------- */

export function schedulePage() {
  const c = site.community;
  const events = [...schedule.events].sort((a, b) => a.start.localeCompare(b.start));
  const past = Object.keys(archive).sort().reverse().map((y) => `<a href="/${y}-schedule">${y} schedule</a>`).join(' · ');
  const body = `
${pageHero({ eyebrow: 'Racing & training', title: `${Y} Schedule`, lede: `${esc(schedule.intro)} <span class="muted">(${esc(schedule.note)})</span>`, image: img('schedule-header') })}

<section class="section">
  <div class="wrap schedule-layout">
    <div>
      <div class="weekly">
        <h2>Weekly racing &amp; tune-up</h2>
        <div class="tabs" role="tablist" aria-label="Choose a fleet">
          <button type="button" role="tab" id="tab-seattle" aria-controls="panel-seattle" aria-selected="true">Seattle</button>
          <button type="button" role="tab" id="tab-vancouver" aria-controls="panel-vancouver" aria-selected="false" tabindex="-1">Vancouver, BC</button>
        </div>
        <div class="tab-panel" role="tabpanel" id="panel-seattle" aria-labelledby="tab-seattle">
          <p><strong>Thursday night racing.</strong> ${extLink('https://www.cycseattle.org/', 'CYC Seattle')} (Corinthian Yacht Club) runs Thursday evening racing out of Shilshole Bay Marina, with courses set on Puget Sound just off the marina. The season runs from spring through summer as a few short series, and dinghy classes, Tasars included, race together. It's the best regular racing practice in town. Register through CYC.</p>
          <p><strong>“Tasar Tuesday.”</strong> Drop in on Tuesday evenings at Shilshole Bay Marina from March to September for informal tuning sessions, where we help each other improve boat speed and handling. All levels welcome.</p>
        </div>
        <div class="tab-panel" role="tabpanel" id="panel-vancouver" aria-labelledby="tab-vancouver" hidden>
          <p><strong>Jericho Sailing Centre.</strong> Vancouver's Tasar fleet sails out of the ${extLink('https://jsca.bc.ca/', 'Jericho Sailing Centre')} on English Bay, where the Tasar is one of the most popular double-handed fleets. Jericho runs weekly club racing through the season, including a Sunday afternoon series on non-regatta weekends, and hosts the Tasar BC Championships each September. Check the JSCA events calendar for this season's dates.</p>
        </div>
        <p>Join the ${extLink(c.seattleGroup, 'Seattle Google group')} for practice coordination, or the ${extLink(c.googleGroup, 'North America Google group')} — either gives you access to the ${extLink(c.calendarSubscribe, 'Google calendar')}. <a href="${c.whatsappRequest}">Request a WhatsApp invitation</a> to the NW Tasar Group for day-to-day updates.</p>
      </div>

      <div class="filter" role="group" aria-label="Show events">
        <button type="button" data-filter="upcoming" aria-pressed="true">Upcoming</button>
        <button type="button" data-filter="all" aria-pressed="false">All ${Y}</button>
      </div>
      <div class="events" data-events>
        ${events.map((e) => eventCard(e, { rsvp: true })).join('')}
      </div>
      <p class="muted past-links">Previous years: ${past}</p>
    </div>

    <aside class="calendar-embed">
      <h2>Fleet calendar</h2>
      <iframe title="North American Tasars Google Calendar" src="${c.calendarEmbed}" loading="lazy"></iframe>
      <p><a class="btn btn-small" href="${c.calendarSubscribe}" target="_blank" rel="noopener">Add to your Google Calendar</a></p>
    </aside>
  </div>
</section>
${communityStrip()}`;
  return { path: `/${Y}-schedule`, title: `${Y} Schedule`, description: `${schedule.intro} ${schedule.note}`, body };
}

export function archivePages() {
  return Object.entries(archive).map(([year, data]) => {
    const body = `
${pageHero({ eyebrow: 'Archive', title: `${year} Schedule`, lede: `A look back at the ${year} North America Tasar season. <a href="/${Y}-schedule">See the current schedule →</a>` })}
<section class="section">
  <div class="wrap narrow">
    <div class="events archive">${data.events.map((e) => eventCard(e)).join('')}</div>
  </div>
</section>`;
    return { path: `/${year}-schedule`, title: `${year} Schedule`, body };
  });
}

/* ---------- Race reports (data/reports/*.md) ---------- */

export function reportPages() {
  return readReports().map((r) => {
    const year = r.start.slice(0, 4);
    const back = archive[year] ? `/${year}-schedule` : `/${Y}-schedule`;
    const body = `
${pageHero({ eyebrow: `Race report · ${year}`, title: r.title, lede: `Write-up for ${esc(r.event)}, ${esc(r.dates)}${r.author ? ` · by ${esc(r.author)}` : ''}` })}
<section class="section">
  <div class="wrap narrow">
    <article class="prose">
${r.html}
    </article>
    <p class="muted report-back"><a href="${back}">← Back to the ${year} schedule</a></p>
  </div>
</section>
${communityStrip()}`;
    return { path: `/${r.slug}`, title: r.title, description: `${r.event}, ${r.dates} — race report${r.author ? ` by ${r.author}` : ''}.`, body };
  });
}

/* ---------- Boats & Tuning ---------- */

export function boatsTuning() {
  const resources = [
    ['About the Tasar', 'https://www.tasar.org/the-tasar.aspx'],
    ['Buyer guide (UK)', 'https://www.tasargbr.org/buyer-guide-to-second-hand-boats/'],
    ['Quick start guide (UK)', 'https://www.tasargbr.org/buyer-guide-to-second-hand-boats/'],
    ['Important for starting (AU manual, PDF)', 'https://www.tasar.org/media/3971/Tasar%20Manual%20V1%200_Dec2012.pdf'],
    ['Tips and advice articles', 'https://www.tasar.org/the-tasar/tips-advice.aspx'],
    ['Tasar class rules (PDF)', 'https://www.tasar.org/media/135567/TSR_CR_2023Oct01.pdf'],
    ['West Coast Sailing supplies', 'https://westcoastsailing.net/tasar-resources'],
  ];
  const more = [
    ['Tasar.org', 'https://www.tasar.org/'],
    ['How the Tasar started', 'https://www.tasar.org/the-tasar/how-the-tasar-started.aspx'],
    ['Tasar docs & title winners', 'https://www.tasar.org/tasar-office.aspx'],
    ['NATA on Facebook', site.community.facebook],
  ];
  const list = (items) => `<ul class="link-list">${items.map(([l, u]) => `<li>${extLink(u, l)}</li>`).join('')}</ul>`;
  const body = `
${pageHero({ eyebrow: 'Resources', title: 'Boats & Tuning', lede: 'Resources for getting your Tasar up to speed.', image: img('boats-gorge') })}

<section class="section">
  <div class="wrap split">
    <div>
      <h2>High performance, and help to get going</h2>
      <p>We tune up together in Seattle. We run clinics to kick off regattas. We work together to get to Worlds. There are dozens of loyal Tasar fans able to help you get on the water and tuned up for racing.</p>
      <figure class="photo"><img src="${esc(img('boats-gorge'))}" alt="Tasars racing in the Columbia River Gorge" loading="lazy"><figcaption>Tasars racing in the Columbia River Gorge</figcaption></figure>
    </div>
    <div class="resource-panels">
      <div class="panel"><h3>Getting started</h3>${list(resources)}</div>
      <div class="panel"><h3>More information</h3>${list(more)}</div>
    </div>
  </div>
</section>

<section class="section alt">
  <div class="wrap split reverse">
    <figure class="photo"><img src="${esc(img('boats-tuning'))}" alt="Tasar sailing upwind" loading="lazy"></figure>
    <div>
      <h2>More to come…</h2>
      <p>We'll use this space to share North America tuning insights. Meanwhile, the resources above are the best place to start.</p>
      <p><a class="btn btn-primary" href="/find-a-boat">Find a boat to race</a> <a class="btn btn-ghost-dark" href="/${Y}-schedule">See the ${Y} schedule</a></p>
    </div>
  </div>
</section>
${communityStrip()}`;
  return { path: '/boats-tuning', title: 'Boats & Tuning', description: 'Resources for setting up and sailing a Tasar fast: class rules, buyer guides, tuning tips and suppliers.', body };
}

/* ---------- Find a Boat ---------- */

export function findABoat() {
  const pres = site.leaders[0];
  const photos = ['find-1', 'find-2', 'find-3', 'find-4'].map((k) => img(k)).filter(Boolean);
  const body = `
${pageHero({ eyebrow: 'Try a Tasar', title: 'Find a Boat', lede: "We're happy to help you start sailing Tasars." })}

<section class="section">
  <div class="wrap split">
    <div>
      <h2>Borrow or charter a fleet boat</h2>
      <p>We have fleet boats to borrow and are happy to set you up with a charter boat for any upcoming regatta. Tasars are sailed by two people with some dinghy experience — we're happy to help you start, come up to speed, and get fast!</p>
      <div class="callout">
        <p><strong>To borrow or charter a boat</strong>, contact NATA Co-President ${esc(pres.name)}.</p>
        <p><a class="btn btn-primary" href="mailto:${pres.email}?subject=Borrowing%20a%20Tasar">Email ${esc(pres.name.split(' ')[0])}</a></p>
      </div>
      <h3>Buying a boat</h3>
      <ul class="link-list">
        <li>Used boats in North America are most often ${extLink(site.community.facebook, 'posted on Facebook')}.</li>
        <li>Here's a little info about ${extLink('https://westcoastsailing.net/tasar-sailboat', 'ordering new boats')}.</li>
      </ul>
      <p><a class="text-link" href="/${Y}-schedule">See the ${Y} schedule →</a> &nbsp; <a class="text-link" href="/boats-tuning">Learn more about Tasars →</a></p>
    </div>
    <div class="gallery">${photos.map((p) => `<img src="${esc(p)}" alt="Tasar fleet sailing" loading="lazy">`).join('')}</div>
  </div>
</section>
${communityStrip()}`;
  return { path: '/find-a-boat', title: 'Find a Boat', description: 'Borrow or charter a Tasar and try out the North America fleet.', body };
}

/* ---------- Contact ---------- */

export function contact() {
  const initials = (n) => n.split(/\s+/).map((w) => w[0]).join('').slice(0, 2);
  const cards = site.leaders.map((l) => {
    const photo = img(l.image);
    return `
<div class="leader">
  ${photo ? `<img src="${esc(photo)}" alt="${esc(l.name)}" loading="lazy">` : `<div class="avatar" aria-hidden="true">${esc(initials(l.name))}</div>`}
  <h3>${esc(l.name)}</h3>
  <p class="role">${esc(l.role)}</p>
  ${l.email ? `<p><a href="mailto:${esc(l.email)}">${esc(l.email)}</a></p>` : ''}
</div>`;
  }).join('');
  const body = `
${pageHero({ eyebrow: 'North America Tasar Association', title: 'Contact Us', lede: "We're happy to hear from you." })}
<section class="section">
  <div class="wrap">
    <h2>Meet our current leaders</h2>
    <div class="leaders">${cards}</div>
  </div>
</section>
${communityStrip()}`;
  return { path: '/contact-us', title: 'Contact Us', description: 'Contact the North America Tasar Association leadership.', body };
}

/* ---------- Committee suggestions (not linked in the nav) ---------- */

export function suggest() {
  const pagesList = [...site.nav.map((n) => n.label), 'Race reports', 'Past schedules', 'Whole site / something new'];
  const body = `
${pageHero({ eyebrow: 'Exec committee', title: 'Suggest a website change', lede: 'Describe what you’d like changed. A draft is prepared automatically and reviewed before anything goes live on the site.' })}
<section class="section">
  <div class="wrap narrow">
    <form class="suggest-form" data-suggest>
      <label><span>Your name</span><input name="who" maxlength="80" required autocomplete="name"></label>
      <label><span>Committee passcode</span><input name="passcode" type="password" required autocomplete="current-password"></label>
      <label><span>Which page?</span><select name="page">${pagesList.map((p) => `<option>${esc(p)}</option>`).join('')}</select></label>
      <label class="full"><span>What should change?</span><textarea name="suggestion" rows="7" maxlength="4000" required placeholder="Be specific — e.g. “Move Summertide to Sept 19–20 and add the registration link https://…”, or “Add Kenna Reed’s email to the Contact page: …”"></textarea></label>
      <input name="website" class="rsvp-hp" tabindex="-1" autocomplete="off" aria-hidden="true">
      <p class="full"><button class="btn btn-primary" type="submit">Send suggestion</button></p>
      <p class="full suggest-msg" role="status"></p>
    </form>
    <p class="muted">Tips: one change per suggestion works best. Include exact wording, dates and links. Photos can’t be attached here yet — email them and mention it in your suggestion.</p>
  </div>
</section>`;
  return { path: '/suggest', title: 'Suggest a change', description: 'Website suggestions from the NATA exec committee.', body, noindex: true };
}

export function notFound() {
  const body = `
${pageHero({ title: 'Page not found', lede: 'That page may have moved when the site was rebuilt. <a href="/">Head home →</a>' })}`;
  return { path: '/404', title: 'Page not found', body };
}
