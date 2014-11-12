(function(_) {
  var container = document.getElementById('gittip-widget');
  var username = container.getAttribute('data-gittip-username');
  var baseURI  = 'https://gratipay.com';
  var receiving, number;

  // set up widget
  container.appendChild(_.ml(
    ['div', { 'class': 'gittip-widget gittip-0002' },
      [ 'div', { 'class': 'gittip-inner' },
        number = _.ml(['span', 'We']), ' receive ', ['br'],
        ['a', { href: baseURI + '/' + username + '/' },
          [ 'b', '$', receiving = _.ml(['span', '#.##'])] , ' / wk'
        ],
        ['br'],
        ' on ', ['a', { href: baseURI }, 'Gratipay' ], '.'
      ]
    ]
  ));

  // display current receiving value
  _.json(baseURI + '/' + username + '/public.json', function(data) {
    receiving.innerHTML = data.receiving;
    number.innerHTML = data.number === 'singular' ? 'I' : 'We';
  });
})({
  ml: function(jsonml) {
    var i, p, v, node;

    node = document.createElement(jsonml[0]);

    for (i=1; i<jsonml.length; i++) {
      v = jsonml[i];

      switch (v.constructor) {
        case Object:
          for (p in v)
            node.setAttribute(p, v[p]);
          break;

        case Array: node.appendChild(this.ml(v)); break;

        case String: case Number:
          node.appendChild(document.createTextNode(v));
          break;

        default: node.appendChild(v); break;
      }
    }

    return node;
  },

  _xhr: function(cb) {
    var xhr = new XMLHttpRequest();

    if (xhr.withCredentials == undefined && XDomainRequest)
      return this._xdr(cb);

    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4 && xhr.status == 200) cb();
    };

    return xhr;
  },

  _xdr: function(cb) {
    var xdr = new XDomainRequest();
    xdr.onload = cb;
    return xdr;
  },

  json: function(url, cb) {
    var xhr = this._xhr(function() {
      cb(JSON.parse(xhr.responseText));
    });

    xhr.open('GET', url);
    xhr.send();
  }
});
