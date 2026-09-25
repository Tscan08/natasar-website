// Mobile menu + schedule status (past / next up), computed in the visitor's browser
// so the schedule stays current without rebuilding the site.
(function () {
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  // Hide any photo that fails to load rather than showing a broken-image box.
  document.querySelectorAll('img').forEach(function (im) {
    function hide() { im.style.display = 'none'; }
    if (im.complete && im.naturalWidth === 0 && im.src) hide();
    im.addEventListener('error', hide);
  });

  var now = new Date();
  var today = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');

  // Mark past / next events everywhere they appear.
  document.querySelectorAll('.event[data-end]').forEach(function (ev) {
    ev.classList.remove('is-past', 'is-next');
    if (ev.dataset.end < today) {
      ev.classList.add('is-past');
      ev.querySelector('.status').textContent = 'Completed';
    }
  });

  // Schedule page: highlight next event, filter upcoming/all.
  var list = document.querySelector('[data-events]');
  if (list) {
    var next = list.querySelector('.event:not(.is-past)');
    if (next) { next.classList.add('is-next'); next.querySelector('.status').textContent = next.dataset.start <= today ? 'Happening now' : 'Next up'; }
    var buttons = document.querySelectorAll('.filter button');
    var allPast = !next;
    function setFilter(mode) {
      list.classList.toggle('hide-past', mode === 'upcoming');
      buttons.forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.filter === mode ? 'true' : 'false'); });
    }
    buttons.forEach(function (b) { b.addEventListener('click', function () { setFilter(b.dataset.filter); }); });
    setFilter(allPast ? 'all' : 'upcoming');
  }

  // Home page: show the next three upcoming events.
  var nextUp = document.querySelector('[data-next-up]');
  if (nextUp) {
    var upcoming = nextUp.querySelectorAll('.event:not(.is-past)');
    for (var i = 0; i < Math.min(3, upcoming.length); i++) upcoming[i].classList.add('show');
    if (!upcoming.length) nextUp.querySelector('.next-empty').hidden = false;
  }

  // Schedule page: "who's going" sign-ups, stored by /api/rsvp. If the API is
  // unavailable the boxes simply stay hidden.
  var rsvpBoxes = document.querySelectorAll('[data-rsvp]');
  if (rsvpBoxes.length && window.fetch) initRsvp(rsvpBoxes);

  function initRsvp(boxes) {
    var mine = load('rsvp-mine') || {}; // { eventId: { id, token } } for this browser's own sign-ups

    function load(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }
    function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
    function el(tag, cls, text) {
      var e = document.createElement(tag);
      if (cls) e.className = cls;
      if (text != null) e.textContent = text;
      return e;
    }
    function api(method, body) {
      return fetch('/api/rsvp', {
        method: method,
        headers: body ? { 'Content-Type': 'application/json' } : {},
        body: body ? JSON.stringify(body) : undefined
      }).then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (d) {
          if (!r.ok) throw new Error(d.error || 'Something went wrong — please try again.');
          return d;
        });
      });
    }

    api('GET').then(function (data) {
      boxes.forEach(function (box) { render(box, data[box.dataset.rsvp] || []); });
    }).catch(function () {});

    function render(box, list) {
      var ev = box.dataset.rsvp;
      var past = box.closest('.event').classList.contains('is-past');
      var me = mine[ev];
      if (me && !list.some(function (x) { return x.id === me.id; })) { delete mine[ev]; save('rsvp-mine', mine); me = null; }

      box.textContent = '';
      box.hidden = past && !list.length;
      var going = list.filter(function (x) { return x.status === 'going'; }).length;
      var maybe = list.length - going;
      var head = el('div', 'rsvp-head');
      head.appendChild(el('strong', null, past ? 'Who went' : 'Who’s going'));
      head.appendChild(el('span', 'muted', list.length ? going + ' going' + (maybe ? ' · ' + maybe + ' maybe' : '') : 'No one yet — be the first!'));
      box.appendChild(head);

      if (list.length) {
        var ul = el('ul', 'rsvp-list');
        list.forEach(function (x) {
          var li = el('li', 'rsvp-' + x.status);
          li.appendChild(el('span', null, x.name));
          if (x.status === 'maybe') li.appendChild(el('span', 'rsvp-tag', 'maybe'));
          if (x.note) li.appendChild(el('span', 'rsvp-note', x.note));
          if (me && me.id === x.id && !past) li.appendChild(removeButton(box, ev, list, x));
          ul.appendChild(li);
        });
        box.appendChild(ul);
      }
      if (!past && !me) box.appendChild(form(box, ev, list));
    }

    function removeButton(box, ev, list, x) {
      var b = el('button', 'rsvp-remove', 'Remove');
      b.type = 'button';
      b.setAttribute('aria-label', 'Remove my sign-up');
      b.addEventListener('click', function () {
        b.disabled = true;
        api('DELETE', { event: ev, id: x.id, token: mine[ev].token }).then(function () {
          delete mine[ev]; save('rsvp-mine', mine);
          render(box, list.filter(function (y) { return y.id !== x.id; }));
        }).catch(function (err) { b.disabled = false; alert(err.message); });
      });
      return b;
    }

    function form(box, ev, list) {
      var f = el('form', 'rsvp-form');
      f.innerHTML =
        '<label><span>Your name</span><input name="who" maxlength="60" required autocomplete="name"></label>' +
        '<label><span>Note <em>(optional)</em></span><input name="note" maxlength="80" placeholder="e.g. need crew, bringing #2597"></label>' +
        '<input name="website" class="rsvp-hp" tabindex="-1" autocomplete="off" aria-hidden="true">' +
        '<div class="rsvp-actions"><button class="btn btn-small btn-go" value="going">I’m going</button>' +
        '<button class="btn btn-small" value="maybe">Maybe</button></div>' +
        '<p class="rsvp-msg muted" role="status">Your name and note will be shown publicly.</p>';
      f.who.value = load('rsvp-name') || '';
      f.addEventListener('submit', function (e) {
        e.preventDefault();
        var buttons = f.querySelectorAll('button');
        var msg = f.querySelector('.rsvp-msg');
        buttons.forEach(function (b) { b.disabled = true; });
        api('POST', {
          event: ev, name: f.who.value, note: f.note.value, website: f.website.value,
          status: (e.submitter && e.submitter.value) || 'going'
        }).then(function (d) {
          mine[ev] = { id: d.entry.id, token: d.token };
          save('rsvp-mine', mine);
          save('rsvp-name', d.entry.name);
          render(box, list.concat(d.entry));
        }).catch(function (err) {
          buttons.forEach(function (b) { b.disabled = false; });
          msg.textContent = err.message;
          msg.classList.add('rsvp-err');
        });
      });
      return f;
    }
  }
})();
