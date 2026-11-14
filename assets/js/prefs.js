/* Reader preferences from Definições (larger and more spaced-out text, animations off), applied before the page is drawn so nothing jumps.
   Kept in this browser for every page and both languages; player.js changes them. */
(function () {
  try {
    var p = JSON.parse(localStorage.getItem('psp:prefs')) || {}, c = document.documentElement.classList;
    if (p.text) { c.add('txt-lg'); c.add('txt-sp'); } /* Texto maior also spaces the text out */
    if (p.still) c.add('no-motion');
  } catch (e) {}
})();
