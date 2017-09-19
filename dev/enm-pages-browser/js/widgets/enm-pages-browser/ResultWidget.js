(function ($) {

AjaxSolr.ResultWidget = AjaxSolr.AbstractWidget.extend({
  start: 0,

  beforeRequest: function () {
    $(this.target).html($('<img>').attr('src', 'images/ajax-loader.gif'));
  },

  facetLinks: function (facet_field, facet_values) {
    var links = [];
    if (facet_values) {
      for (var i = 0, l = facet_values.length; i < l; i++) {
        if (facet_values[i] !== undefined) {
          links.push(
            $('<a href="#"></a>')
            .text(facet_values[i])
            .click(this.facetHandler(facet_field, facet_values[i]))
          );
        }
        else {
          links.push('no items found in current selection');
        }
      }
    }
    return links;
  },

  facetHandler: function (facet_field, facet_value) {
    var self = this;
    return function () {
      self.manager.store.remove('fq');
      self.manager.store.addByValue('fq', facet_field + ':' + AjaxSolr.Parameter.escapeValue(facet_value));
      self.doRequest(0);
      return false;
    };
  },

  afterRequest: function () {
    $(this.target).empty();
    for (var i = 0, l = this.manager.response.response.docs.length; i < l; i++) {
      var doc = this.manager.response.response.docs[i];
      $(this.target).append(this.template(doc));

      var items = [];
      items = items.concat(this.facetLinks('titles', doc.title_facet));
      items = items.concat(this.facetLinks('authors', doc.authors_facet));
      items = items.concat(this.facetLinks('years', doc.yearOfPublication));
      items = items.concat(this.facetLinks('isbn', doc.isbn));
      items = items.concat(this.facetLinks('topics', doc.topicNames_facet));

      var $links = $('#links_' + doc.id);
      $links.empty();
      for (var j = 0, m = items.length; j < m; j++) {
        $links.append($('<li></li>').append(items[j]));
      }
    }
  },

  template: function (doc) {
    var snippet = '';
    if (doc.pageText.length > 300) {
      snippet += doc.pageText.substring(0, 300);
      snippet += '<span style="display:none;">' + doc.pageText.substring(300);
      snippet += '</span> <a href="#" class="more">more</a>';
    }
    else {
      snippet += doc.pageText;
    }

    var topics = JSON.parse( doc.topicNamesForDisplay );
    var topicsList = '';
    Object.keys( topics ).forEach( function( displayName ) {
      var alternateTopics = topics[ displayName ];

      if ( alternateTopics.length > 0 ) {
        topicsList += '    <li>' + displayName + ' (' + alternateTopics.join( ' | ' ) + ') </li>';
      } else {
        topicsList += '    <li>' + displayName + '</li>';
      }
    } );

    var output = '<article><h2>' + doc.title + '</h2>';
    output += '<p id="links_' + doc.id + '" class="links"></p>';
    output += '<div class="authors">' + doc.authors + '</div>';
    output += '<div class="year">' + doc.yearOfPublication + '</div>';
    output += '<div class="isbn">' + doc.isbn + '</div>';
    output += '<ul class="topics">' + topicsList + '</ul>';
    output += '<div class="fulltext">' + snippet + '</div></article>';
    return output;
  },

  init: function () {
    $(document).on('click', 'a.more', function () {
      var $this = $(this),
          span = $this.parent().find('span');

      if (span.is(':visible')) {
        span.hide();
        $this.text('more');
      }
      else {
        span.show();
        $this.text('less');
      }

      return false;
    });
  }
});

})(jQuery);