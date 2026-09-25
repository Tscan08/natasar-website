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
})();
