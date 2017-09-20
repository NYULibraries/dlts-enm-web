var Manager;

(function ($) {

  $(function () {
    Manager = new AjaxSolr.Manager({
      solrUrl: 'http://dev-discovery.dlib.nyu.edu:8983/solr/enm-pages/'
      // If you are using a local Solr instance with a "reuters" core, use:
      // solrUrl: 'http://localhost:8983/solr/reuters/'
      // If you are using a local Solr instance with a single core, use:
      // solrUrl: 'http://localhost:8983/solr/'
    });
    Manager.addWidget(new AjaxSolr.ResultWidget({
      id: 'result',
      target: '#docs'
    }));
    Manager.addWidget(new AjaxSolr.PagerWidget({
      id: 'pager',
      target: '#pager',
      prevLabel: '&lt;',
      nextLabel: '&gt;',
      innerWindow: 1,
      renderHeader: function (perPage, offset, total) {
        $('#pager-header').html($('<span></span>').text('displaying ' + Math.min(total, offset + 1) + ' to ' + Math.min(total, offset + perPage) + ' of ' + total));
      }
    }));
    var fields = [
        'title_facet',
        'authors_facet',
        'publisher_facet',
        'topicNames_facet'
    ];
    for (var i = 0, l = fields.length; i < l; i++) {
      Manager.addWidget(new AjaxSolr.TagcloudWidget({
        id: fields[i],
        target: '#' + fields[i],
        field: fields[i]
      }));
    }
    Manager.addWidget(new AjaxSolr.CurrentSearchWidget({
      id: 'currentsearch',
      target: '#selection'
    }));
    Manager.addWidget(new AjaxSolr.AutocompleteWidget({
      id: 'text',
      target: '#search',
      fields: [ 'title', 'authors', 'publisher', 'isbn', 'pageText', 'topicNames' ]
    }));
    Manager.init();
    Manager.store.addByValue('q', '*:*');
    var params = {
      'defType': 'edismax',
      'qf': 'pageText title topicNames',

      facet: true,
      'facet.field': [
          'title_facet',
          'authors_facet',
          'publisher_facet',
          'topicNames_facet'
      ],
      'facet.limit': -1,
      'facet.mincount': 1,

      'f.topicNames_facet.facet.limit': 100,

      'hl': 'on',
      'hl.fl': 'pageText,title,topicNames',
      'hl.simple.pre': '<span class=\"highlight\">',
      'hl.simple.post': '</span>',

      indent: 'on',

      'json.nl': 'map'
    };
    for (var name in params) {
      Manager.store.addByValue(name, params[name]);
    }
    Manager.doRequest();
  });

  $.fn.showIf = function (condition) {
    if (condition) {
      return this.show();
    }
    else {
      return this.hide();
    }
  }

})(jQuery);
