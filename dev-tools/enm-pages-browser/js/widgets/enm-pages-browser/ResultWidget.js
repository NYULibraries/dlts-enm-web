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
    var that = this;

    var topicNameLinks;

    $(this.target).empty();
    for (var i = 0, l = this.manager.response.response.docs.length; i < l; i++) {
      var doc = this.manager.response.response.docs[i];
      $(this.target).append(this.template(doc));

      topicNameLinks = [];
      var topics = JSON.parse( doc.topicNamesForDisplay );
      Object.keys( topics ).forEach( function( displayName ) {
          var alternateTopics = topics[ displayName ];
          var alternateTopicsText = '';
          if ( alternateTopics.length > 0 ) {
              alternateTopicsText = ' (' + alternateTopics.join( ' | ' ) + ')';
          }

          topicNameLinks = topicNameLinks.concat(
              $('<a href="#"></a>')
                .text(displayName + alternateTopicsText)
                .click(that.facetHandler('topicNames_facet', displayName)));
      } );

      var $topics = $('#topics_' + doc.id);
      $topics.empty();

      if (topicNameLinks.length > 0) {
          topicNameLinks.forEach( function( topicNameLink ) {
              $topics.append($('<li></li>').append(topicNameLink));
          } );
      } else {
          $topics.append($('<li>[none]</li>'));
      }

      // var items = [];
      // items = items.concat(this.facetLinks('topics', doc.topicNames_facet));
      //
      // var $links = $('#topics_' + doc.id);
      // $links.empty();
      // for (var j = 0, m = items.length; j < m; j++) {
      //   $links.append($('<li></li>').append(items[j]));
      // }
    }
  },

  template: function (doc) {
    var snippet = '';
    if (doc.pageText.length > 300) {
      snippet += doc.pageText.substring(0, 300);
      snippet += '<span id="fulltext-toggle" style="display:none;">' + doc.pageText.substring(300);
      snippet += '</span> <a href="#" class="more">more</a>';
    }
    else {
      snippet += doc.pageText;
    }

    var highlightsDisplay = '';
    var highlights = this.manager.response.highlighting[ doc.id ];
    Object.keys( highlights ).forEach( function( field ) {
      var highlightsForField = highlights[ field ];
      highlightsForField.forEach( function( highlightForField ) {

        if (field === 'pageText') {
          highlightsDisplay += '<li><span class="infolabel">[' + field + ']</span> ' +
                               '"...' + highlightForField + '..."' +
                               '</li>';
        } else {
          highlightsDisplay += '<li><span class="infolabel">[' + field + ']</span> ' +
                               highlightForField +
                               '</li>';
        }

      } );
    } );

    var output = '<article><h1 class="title">' + doc.title + ' (page ' + doc.pageNumberForDisplay + ')</h1>';
    output += '<div class="authors"><span class="infolabel">Authors: </span> ' + doc.authors + '</div>';
    output += '<div class="isbn"><span class="infolabel">ISBN: </span>' + doc.isbn + '</div>';
    output += '<div class="topics"><span class="infolabel">Topics: </span>' +
              '<ul class="topics-list" id="topics_' + doc.id + '"></ul>' +
              '</div>';

    if (highlightsDisplay) {
        output += '<div class="highlights"><span class="infolabel">Query in context:</span>' +
                  '<ul class="highlights-list">' + highlightsDisplay + '</ul>' +
                  '</div>';
    }

    output += '<div class="fulltext"><span class="infolabel">Page full text:</span> ' + snippet + '</div></article>';

    return output;
  },

  init: function () {
    $(document).on('click', 'a.more', function () {
      var $this = $(this),
          span = $this.parent().find('span#fulltext-toggle');

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