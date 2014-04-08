'use strict';

var boot = require('booting-nav');

var _ = document.querySelector.bind(document);

boot(_('.sidebar-nav'), {
  offset: 10,
  left: null,
  right: null,
  minWidth: '992px' // todo: fix bug where narrow screen is scrolled then made wide
});