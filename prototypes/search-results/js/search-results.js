var ALTERNATE_NAMES_LIST_SEPARATOR = '&nbsp;&bull;&nbsp;',
    HIGHLIGHT_PRE = '<mark>',
    HIGHLIGHT_POST = '</mark>',

    SOLR_SERVER = {
        'devweb1.dlib.nyu.edu' : 'dev-discovery.dlib.nyu.edu',
        'dlib.nyu.edu' : 'discovery1.dlib.nyu.edu',
        'stageweb1.dlib.nyu.edu' : 'stagediscovery.dlib.nyu.edu',
        'web1.dlib.nyu.edu' : 'discovery1.dlib.nyu.edu'
    },

    // Use appropriate Solr server.  If web host is unknown (ex. localhost), then
    // use whichever Solr server the dev web host is using.
    solrServer = SOLR_SERVER[ window.location.hostname ] || SOLR_SERVER[ 'dlib.nyu.edu' ],

    queryFields = [
        {
            dciLabel : 'full texts',
            label    : 'Full Text',
            name     : 'fulltext',
            value    : 'pageText'
        },
        {
            dciLabel : 'topics',
            label    : 'Topics',
            name     : 'topics',
            value    : 'topicNames'
        }
    ],
    queryFieldsByValue = getQueryFieldsByValueMap( queryFields ),

    app = new Vue(
        {
            el: '#app',
            data: {
                allQueryFields           : true,

                barChartDataAllPages     : [],
                barChartDataMatchedPages : [],
                barChartShowAllPages     : false,

                displayFacetPane         : false,
                displayResultsPane       : false,
                displayPreviewPane       : false,
                displaySearchDCI         : false,
                displaySpinner           : false,

                facetPane : {
                    showAllTopics        : false,
                    topicsFacetList      : [],
                    topicsFacetListLimit : 15
                },

                numBooks                 : null,
                numPages                 : null,

                previewPane              : {
                    firstEpubInResults: null,
                    isbn: null,
                    matchedPagesIndex: {},
                    pageIndex: null,
                    pageNumberForDisplay: null,
                    pageText : null,
                    title: null,
                    topicsOnPage: []
                },

                resultsPane              : {
                    classes : {
                        previewPaneLoaded: "column enm-pane enm-pane-results is-4",
                        previewPaneNotLoaded: "column enm-pane enm-pane-results is-half"
                    }
                },

                query                    : '',
                queryEcho                : '',
                queryFields              : queryFields,

                results                  : null,
                rows                     : 1999,

                searchDCI                : null,

                selectAllQueryFields     : true,
                selectedQueryFields      : queryFields.map( function( queryField ) { return queryField.value } ),
                selectedTopicFacetItems  : []
            },
            computed: {
                numBooksFormatted : function() {
                    return this.numBooks ? this.numBooks.toLocaleString() : '';
                },
                numPagesFormatted : function() {
                    return this.numPages ? this.numPages.toLocaleString() : '';
                },
                resultsHeader: function() {
                    if ( this.results && this.results.length > 0 ) {
                        return this.numPagesFormatted + ' pages in ' + this.numBooksFormatted + ' books'
                    } else {
                        return 'None'
                    }
                },
                previewEpubSolrQueryUrl : function() {
                    var qf = this.selectedQueryFields
                            .sort()
                            .join( '%20' ),
                        url = 'http://' + solrServer + ':8983/solr/enm-pages/select?' +
                              'q=' + encodeURIComponent( this.query ) +
                              '&' +
                              'defType=edismax' +
                              '&' +
                              'fl=pageLocalId,pageNumberForDisplay,pageSequenceNumber,epubNumberOfPages,score' +
                              '&' +
                              'sort=pageSequenceNumber+asc' +
                              '&' +
                              'rows=999' +
                              '&' +
                              'wt=json' +
                              '&' +
                              'indent=on' +
                              '&' +
                              'qf=' + qf +
                              '&' +
                              'fq=' + encodeURIComponent( 'isbn_facet:"' + this.previewPane.isbn + '"' );

                    if ( this.selectedTopicFacetItems ) {
                        url += this.selectedTopicFacetItems.map( function( selectedTopicFacetItem ) {
                            return '&' + 'fq=' + encodeURIComponent( 'topicNames_facet:\"' + selectedTopicFacetItem + '\"');
                        } ).join( '' );
                    }

                    return url;
                },
                previewEpubPageSolrQueryUrl : function() {
                    var qf = this.selectedQueryFields
                            .sort()
                            .join( '%20' ),
                        highlightFields = qf.replace( 'topicNames', 'topicNamesForDisplay' );

                    return 'http://' + solrServer + ':8983/solr/enm-pages/select?' +
                           'q=' + encodeURIComponent( this.query ) +
                           '&' +
                           'defType=edismax' +
                           '&' +
                           'fl=topicNames_facet,topicNamesForDisplay,pageText' +
                           '&' +
                           'rows=1' +
                           '&' +
                           'hl.fl=' + highlightFields +
                           '&' +
                           'hl.fragsize=0' +
                           '&' +
                           'hl.simple.post=' + encodeURIComponent( HIGHLIGHT_POST ) +
                           '&' +
                           'hl.simple.pre=' + encodeURIComponent( HIGHLIGHT_PRE ) +
                           '&' +
                           'hl=on' +
                           '&' +
                           'wt=json' +
                           '&' +
                           'indent=on' +
                           '&' +
                           'qf=' + qf +
                           '&' +
                           'fq=' + encodeURIComponent( 'isbn:' + this.previewPane.isbn ) +
                           '&' +
                           'fq=' + encodeURIComponent( 'pageNumberForDisplay:' + this.previewPane.pageNumberForDisplay );
                },
                searchSolrQueryUrl : function() {
                    var qf = this.selectedQueryFields
                            .sort()
                            .join( '%20' ),

                        url = 'http://' + solrServer + ':8983/solr/enm-pages/select?' +
                           'q=' + encodeURIComponent( this.query ) +
                           '&' +
                           'defType=edismax' +
                           '&' +
                           'facet.field=topicNames_facet' +
                           '&' +
                           'facet.limit=-1' +
                           '&' +
                           'facet.mincount=1' +
                           '&' +
                           'facet.sort=count' +
                           '&' +
                           'facet=on' +
                           '&' +
                           'fl=title,authors,publisher,yearOfPublication,score' +
                           '&' +
                           'group.field=isbn' +
                           '&' +
                           'group=true' +
                           '&' +
                           'group.limit=999' +
                           '&' +
                           'indent=on' +
                           '&' +
                           'qf=' + qf +
                           '&' +
                           'rows=' + this.rows +
                           '&' +
                           'wt=json';

                    if ( this.selectedTopicFacetItems ) {
                        url += this.selectedTopicFacetItems.map( function( selectedTopicFacetItem ) {
                            return '&' + 'fq=' + encodeURIComponent( 'topicNames_facet:\"' + selectedTopicFacetItem + '\"');
                        } ).join( '' );
                    }

                    return url;
                },
                topicFacetItemsAlwaysVisible : function() {
                    return this.facetPane.topicsFacetList.slice( 0, this.facetPane.topicsFacetListLimit );
                },
                topicFacetItemsToggleable    : function() {
                    if ( this.facetPane.showAllTopics ) {
                        return this.facetPane.topicsFacetList.slice( this.facetPane.topicsFacetListLimit );
                    } else {
                        return [];
                    }
                },
                topicDCIs: function() {
                    return this.selectedTopicFacetItems.map( function( topic ) {
                        return {
                            id: topic,
                            topic: topic
                        }
                    } );
                }
            },
            methods: {
                clearPreviewPaneData: function() {
                    this.previewPane.firstEpubInResults = null;
                    this.previewPane.isbn = null;
                    this.previewPane.matchedPagesIndex = {};
                    this.previewPane.index = null;
                    this.previewPane.pageNumberForDisplay = null;
                    this.previewPane.pageText  = null;
                    this.previewPane.title = null;
                    this.previewPane.topicsOnPage = []
                },
                clearTopicFilters: function() {
                    this.selectedTopicFacetItems = [];
                },
                clickAllFieldsCheckbox : function() {
                    if ( this.selectAllQueryFields ) {
                        this.selectedQueryFields =
                            queryFields.map(
                                function( queryField ) {
                                    return queryField.value;
                                }
                            )
                    }
                },
                clickDeleteSearchDCI: function( event ) {
                    if ( this.selectedTopicFacetItems.length > 0 ) {
                        this.query = '*';
                    } else {
                        this.query = '';
                    }

                    this.sendSearchQuery();
                },
                clickDeleteTopicDCI: function( event ) {
                    // Delete element from array code based on:
                    // https://blog.mariusschulz.com/2016/07/16/removing-elements-from-javascript-arrays
                    const index = this.selectedTopicFacetItems.indexOf( event.currentTarget.id );

                    if ( index !== -1 ) {
                        this.selectedTopicFacetItems.splice( index, 1 );
                    }

                    this.sendSearchQuery();
                },
                // Check all checkboxes functionality loosely based on the accepted answer for
                // https://stackoverflow.com/questions/33571382/check-all-checkboxes-vuejs
                // ...which points to JSFiddle
                // https://jsfiddle.net/okv0rgrk/3747/
                // ...which actually contains bugs and also uses interpolation inside
                // attributes, a feature that has since been removed.
                clickFieldCheckbox     : function( checked ) {
                    if ( ! checked ) {
                        this.selectAllQueryFields = false;
                    }
                },
                clickNext: function() {
                    // Next button should disable itself automatically if on last matched page, but just in case, disable
                    // here, too.
                    if ( this.previewPane.pageIndex === this.barChartDataMatchedPages.length - 1 ) {
                        return;
                    }

                    this.triggerClickPage( this.previewPane.pageIndex + 1 );
                },
                clickPrevious: function() {
                    // Previous button should disable itself automatically if on first matched page, but just in case, disable
                    // here, too.
                    if ( this.previewPane.pageIndex === 0 ) {
                        return;
                    }

                    this.triggerClickPage( this.previewPane.pageIndex - 1 );
                },
                clickTopicFacetItem: function( event ) {
                    this.selectedTopicFacetItems.push( event.currentTarget.id );
                    this.sendSearchQuery();
                },
                drawBarChart: function() {
                    clearBarChart();

                    if ( this.barChartShowAllPages === true ) {
                        _drawBarChart( this.barChartDataAllPages, {
                            pageClickCallback: this.previewEpubPage,
                            'x-axis' : true
                        } );
                    } else {
                        _drawBarChart( this.barChartDataMatchedPages, {
                            pageClickCallback: this.previewEpubPage
                        } );
                    }
                },
                loadFirstEpub: function() {
                    document.getElementById( this.previewPane.firstEpubInResults )
                        .click();
                },
                previewEpub            : function( event ) {
                    var that = this;

                    this.previewPane.isbn = event.currentTarget.id;
                    this.previewPane.title = event.currentTarget.attributes.name.nodeValue;

                    this.previewPane.pageNumberForDisplay = null;

                    axios.get( this.previewEpubSolrQueryUrl )
                        .then( function( response ) {
                            docs                          = response.data.response.docs;
                            epubNumberOfPages             = docs[ 0 ].epubNumberOfPages;
                            placeholderPageSequenceNumber = 0;

                            that.barChartDataAllPages = [];
                            that.barChartDataMatchedPages = [];

                            // docs are sorted by pageSequenceNumber in asc order
                            docs.forEach( function( doc ) {
                                var currentPageSequenceNumber = doc.pageSequenceNumber;

                                for ( i = placeholderPageSequenceNumber + 1; i < currentPageSequenceNumber; i++ ) {
                                    // Can't start barChartDataAllPages at element index 1 because an
                                    // that would leave element 0 undefined, which causes
                                    // d3.max() call in _drawChart() to fail when
                                    // it tries to read score property of the undefined
                                    // object.  Doing barChartDataAllPages.unshift() doesn't
                                    // work.  The first element still has index of 1
                                    // and d3.max() still fails.
                                    that.barChartDataAllPages.push( {
                                                                        page  : '[USER SHOULD NEVER SEE THIS (' + i + ')]',
                                                                        score : 0
                                                                    } );
                                }

                                that.barChartDataAllPages.push( {
                                                                    page  : doc.pageNumberForDisplay,
                                                                    score : doc.score
                                                                } );

                                that.barChartDataMatchedPages.push(
                                    {
                                        page  : doc.pageNumberForDisplay,
                                        score : doc.score
                                    }
                                );

                                placeholderPageSequenceNumber = currentPageSequenceNumber;
                            } );

                            for ( i = placeholderPageSequenceNumber + 1; i <= epubNumberOfPages; i++ ) {
                                that.barChartDataAllPages[ i - 1 ] = {
                                    page  : '[USER SHOULD NEVER SEE THIS (' + i + ')]',
                                    score : 0
                                };
                            }

                            that.barChartDataMatchedPages.forEach( function( matchedPage, index ) {
                                that.previewPane.matchedPagesIndex[ matchedPage.page ] = index;
                            } );

                            that.drawBarChart();

                            that.triggerClickPage( 0 );
                        } )
                        .catch( function( error ) {
                            that.previewPane.title = error;
                        } );
                },
                previewEpubPage: function( event ) {
                    var that = this;

                    this.previewPane.pageNumberForDisplay = event.page;

                    axios.get( this.previewEpubPageSolrQueryUrl )
                        .then( function( response ) {
                            var doc = response.data.response.docs[ 0 ],
                                highlights = response.data.highlighting[
                                    Object.keys(response.data.highlighting)[0]
                                ],
                                topicHighlights, topicsOnPage = [],
                                topicNamesLists;

                            if ( highlights.pageText ) {
                                that.previewPane.pageText = highlights.pageText[ 0 ];
                            } else {
                                that.previewPane.pageText = doc.pageText;
                            }

                            if ( highlights.topicNamesForDisplay ) {
                                // Sample of prettified JSON string (without wrapping quotes):
                                // [
                                //     [
                                //         "Conference on Critical Legal Studies"
                                //     ],
                                //     [
                                //         "<mark>identity</mark> -- politics of",
                                //         "<mark>Identity</mark> politics",
                                //         "\"<mark>Identity</mark> politics\"",
                                //         "Politics of <mark>identity</mark>"
                                //     ],
                                //     [
                                //         "Ideology of the subject"
                                //     ]
                                // ]

                                topicHighlights = JSON.parse( highlights.topicNamesForDisplay );
                                topicHighlights.forEach( function( topicHighlightArray ) {
                                    var preferredName = topicHighlightArray.shift(),
                                        alternateNames = topicHighlightArray;

                                    if ( alternateNames.length === 0 ) {
                                        // No alternate names
                                        topicsOnPage.push( preferredName );
                                    } else {
                                        if ( namesListContainsHighlights( alternateNames ) ) {
                                            // Display alternate names - they contain highlights
                                            topicsOnPage.push(
                                                preferredName +
                                                ' <span class="enm-alt-names">(also: ' +
                                                alternateNames.join( ALTERNATE_NAMES_LIST_SEPARATOR ) +
                                                ')</span>'
                                            );
                                        } else {
                                            // Do not display alternate names - they do not contain highlights
                                            topicsOnPage.push( preferredName );
                                        }
                                    }
                                } );

                                that.previewPane.topicsOnPage = topicsOnPage;
                            } else if ( doc.topicNamesForDisplay ) {
                                topicNamesLists = JSON.parse( doc.topicNamesForDisplay );
                                that.previewPane.topicsOnPage = topicNamesLists.map(
                                    function( topicNamesList ) {
                                        // The display/preferred name is the first element
                                        return topicNamesList.shift();
                                    }
                                )
                            } else {
                                that.previewPane.topicsOnPage = [];
                            }
                        } )
                        .catch( function( error ) {
                            that.previewPane.title = error;
                        } );

                },
                sendSearchQuery: function() {
                    if ( this.selectedQueryFields.length === 0 ) {
                        alert( 'Please check one or more boxes: ' +
                            this.queryFields.map(
                                function( e ) { return e.label; }
                            ).join( ', ' )
                        );

                        return;
                    }

                    // Can't use `this` for then or catch, as it is bound to Window object
                    var  that = this;

                    this.setSearchDCI();

                    this.displaySearchDCI = true;
                    this.displaySpinner = true;
                    this.displayFacetPane = false;
                    this.displayResultsPane = false;
                    this.displayPreviewPane = false;

                    this.results = null;

                    this.facetPane.showAllTopics = false;

                    this.previewPane.pageNumberForDisplay = null;
                    this.previewPane.isbn = null;
                    this.previewPane.title = null;

                    clearBarChart();

                    // Can't bind query echo to this.query because when user types in
                    // a new query in search the echo will react.
                    this.queryEcho = this.query;

                    axios.get( this.searchSolrQueryUrl )
                        .then( function( response ) {
                            var topicFacetItems = response.data.facet_counts.facet_fields.topicNames_facet,
                                i,
                                numHits;

                            that.numBooks = response.data.grouped.isbn.groups.length;
                            that.numPages = response.data.grouped.isbn.matches;

                            if ( topicFacetItems ) {
                                that.facetPane.topicsFacetList = [];
                                for ( i = 0; i < topicFacetItems.length; i = i + 2 ) {
                                    topic = topicFacetItems[ i ];
                                    numHits = topicFacetItems[ i + 1 ];
                                    that.facetPane.topicsFacetList.push(
                                        {
                                            name: topic,
                                            numHits: numHits.toLocaleString()
                                        }
                                    );
                                }
                            }

                            that.results = response.data.grouped.isbn.groups;

                            that.displaySpinner = false;

                            if ( that.results.length > 0 ) {
                                that.previewPane.firstEpubInResults = that.results[ 0 ].groupValue;

                                that.displayFacetPane = true;
                                that.displayResultsPane = true;
                                that.displayPreviewPane = true;
                            } else {
                                that.displayResultsPane = true;
                            }
                        } )
                        .catch( function( error ) {
                            that.results = error;

                            that.displayFacetPane = false;
                            that.displayResultsPane = false;
                            that.displayPreviewPane = false;
                        } );
                },
                setSearchDCI: function() {
                    if ( this.query && this.query !== '' ) {
                        this.searchDCI = 'Searching ' +
                            this.selectedQueryFields.map(
                                function( selectedQueryField ) {
                                    return queryFieldsByValue[ selectedQueryField ].dciLabel;
                                }
                            ).join( ' and ' ) +
                            ' for: ' + this.query;
                    } else {
                        this.searchDCI = null;
                    }
                },
                submitSearchForm: function() {
                    this.clearPreviewPaneData();
                    this.clearTopicFilters();
                    this.sendSearchQuery();
                },
                triggerClickPage: function( page ) {
                    var pageNameForDisplay;

                    if ( typeof page === 'string' ) {
                        pageNameForDisplay = page;
                    } else if ( typeof page === 'number' ) {
                        pageNameForDisplay = this.barChartDataMatchedPages[ page ].page;
                    }

                    d3.select( 'rect[ name = "' + pageNameForDisplay + '" ]' )
                        .dispatch( 'click' );

                }
            },
            mounted: function() {
                tip = d3.tip()
                    .attr( 'class', 'd3-tip' )
                    .offset( [ -10, 0 ] )
                    .html( function ( d ) {
                        return 'Page: ' + d.page +
                               '<br>' +
                               '<span class="tooltip-score">' +
                               'Score: ' + d.score +
                               '</span>';
                    } );

                d3.select( 'svg' ).call( tip );
            },
            watch: {
                barChartShowAllPages: function( newBarChartShowAllPagesValue ) {
                    this.drawBarChart();

                    d3.select('rect[ name = "' + this.previewPane.pageNumberForDisplay + '" ]')
                        .classed( 'enm-page-active', true );
                },
                'previewPane.pageNumberForDisplay': function( newPageNumberForDisplay ) {
                    d3.select('.enm-page-active')
                        .classed( 'enm-page-active', false );
                    d3.select('rect[ name = "' + newPageNumberForDisplay + '" ]')
                        .classed( 'enm-page-active', true );

                    this.previewPane.pageIndex =
                        this.previewPane.matchedPagesIndex[ this.previewPane.pageNumberForDisplay ];
                }
            }
        }
    );

function clearBarChart() {
    d3.selectAll("svg > *").remove();
}

function _drawBarChart( data, options ) {
    // Based on https://bl.ocks.org/mbostock/3885304, with tooltips added using
    // https://github.com/Caged/d3-tip.

    var svg    = d3.select( 'svg' ),
        width  = svg.attr( 'width' ),
        height = svg.attr( 'height' ),

        x = d3.scaleBand().rangeRound( [ 0, width ] ).padding( 0.1 ),
        y = d3.scaleLinear().rangeRound( [ height, 0 ] ),

        g = svg.append( 'g' );

    x.domain( data.map( function ( d ) {
        return d.page;
    } ) );
    y.domain( [
                  0, d3.max( data, function ( d ) {
            return d.score;
        } )
              ] );

    if ( options[ 'x-axis' ] === true ) {
        g.append( 'g' )
            .attr( 'class', 'axis axis--x' )
            .attr( 'transform', 'translate(0,' + height + ')' )
            .call( d3.axisBottom( x ) )
            // https://stackoverflow.com/questions/19787925/create-a-d3-axis-without-tick-labels
            .selectAll( 'text' ).remove();
    }

    g.selectAll( '.bar' )
        .data( data )
        .enter().append( 'rect' )
        .attr( 'class', 'bar' )
        .attr( 'name', function( d ) {
            return d.page;
        } )
        .attr( 'x', function ( d ) {
            return x( d.page );
        } )
        .attr( 'y', function ( d ) {
            return y( d.score );
        } )
        .attr( 'width', x.bandwidth() )
        .attr( 'height', function ( d ) {
            return height - y( d.score );
        } )
        .attr( 'stroke', 'black' )
        .on( 'click', options.pageClickCallback )
        .on( 'mouseover', tip.show )
        .on( 'mouseout', tip.hide );
}

function getQueryFieldsByValueMap( queryFields ) {
    var queryFieldsByValueMap = {};

    queryFields.forEach( function( queryField ) {
        queryFieldsByValueMap[ queryField.value ] = queryField;
    } );

    return queryFieldsByValueMap;
}

function namesListContainsHighlights( alternateNames ) {
    return alternateNames.filter( function( alternateName ) {
               return alternateName.indexOf( HIGHLIGHT_PRE ) !== -1 &&
                      alternateName.indexOf( HIGHLIGHT_POST ) !== -1
           } ).length > 0;
}

function stripHighlightMarkup( str ) {
    return str.replace( new RegExp( HIGHLIGHT_PRE ), '' )
              .replace( new RegExp( HIGHLIGHT_POST ), '' );
}