;(function () {
  
  var btns = document.querySelectorAll('[data-action="show-polyfill"]');

  var transitionTime = 500;
  for (var i = 0; i < btns.length; i++) {
    (function (btn) {
      var showText = btn.textContent;
      var hideText = btn.getAttribute('data-hide-text') ||
          (showText.indexOf('Show ') === 0 ? showText.replace(/^Show /, 'Hide ') : 'Hide');
      btn.style.display = 'inline-block';
      var target = document.querySelector(btn.getAttribute('data-target'));
      target.style.height = 0;
      target.style.overflowY = 'hidden';
      var transition = 'transition' in target.style ? 'transition' : ('webkitTransition' in target.style ? 'webkitTransition' : null);
      if (transition) target.style[transition] = 'height ' + (transitionTime / 1000) + 's';
      var expanded = false;
      btn.addEventListener('click', function () {
        if (expanded) {
          target.style.height = 0;
          setTimeout(function () {
            btn.textContent = showText;
          }, transitionTime / 2);
        } else {
          target.style.height = target.scrollHeight + 'px';
          setTimeout(function () {
            btn.textContent = hideText;
          }, transitionTime / 2);
        }
        expanded = !expanded;
      });
    }(btns[i]));
  }
}());