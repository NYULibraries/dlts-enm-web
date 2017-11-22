var queryFields = [
        {
            label: 'Full Text',
            name: 'fulltext',
            value: 'pageText'
        },
        {
            label: 'Topics',
            name: 'topics',
            value: 'topicNames'
        }
    ],
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
                epubDropdownOptions      : [],

                facetPane : {
                    showAllTopics        : false,
                    topicsFacetList      : [],
                    topicsFacetListLimit : 15
                },

                numBooks                 : null,
                numPages                 : null,
                previewPane              : {
                    epubIsbn: null,
                    epubPageNumber: null,
                    epubTitle: null,
                    firstEpubInResults: null,
                    pageText : null,
                    topicsOnPage: []
                },
                qTime                    : null,
                query                    : '',
                queryEcho                : '',
                queryFields              : queryFields,
                results                  : null,
                rows                     : 1999,
                selectAllQueryFields     : true,
                selectedQueryFields      : queryFields.map( function( queryField ) { return queryField.value } ),
                selectedTopicFacetItems  : [],
                start                    : null,
                timeAfterVueUpdated      : null,
                timeSolrResponseReceived : null,
                updateBarChart           : false,
                updatePagePreview        : false
            },
            computed: {
                epubFirstPage: function() {
                    if ( this.barChartDataMatchedPages ) {
                        return this.barChartDataMatchedPages[ 0 ].page;
                    } else {
                        return null;
                    }
                },
                epubLastPage: function() {
                    if ( this.barChartDataMatchedPages ) {
                        return this.barChartDataMatchedPages[
                            this.barChartDataMatchedPages.length - 1
                            ].page;
                    } else {
                        return null;
                    }
                },
                numBooksFormatted : function() {
                    return this.numBooks ? this.numBooks.toLocaleString() : '';
                },
                numPagesFormatted : function() {
                    return this.numPages ? this.numPages.toLocaleString() : '';
                },
                previewEpubSolrQueryUrl : function() {
                    var qf = this.selectedQueryFields
                            .sort()
                            .join( '%20' );

                    return  'http://dev-discovery.dlib.nyu.edu:8983/solr/enm-pages/select?' +
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
                            'fq=' + encodeURIComponent( 'isbn_facet:"' + this.previewPane.epubIsbn + '"' );
                },
                previewEpubPageSolrQueryUrl : function() {
                    var qf = this.selectedQueryFields
                            .sort()
                            .join( '%20' );

                    return 'http://dev-discovery.dlib.nyu.edu:8983/solr/enm-pages/select?' +
                           'q=' + encodeURIComponent( this.query ) +
                           '&' +
                           'defType=edismax' +
                           '&' +
                           'fl=topicNames_facet,pageText' +
                           '&' +
                           'rows=1' +
                           '&' +
                           'hl.fl=' + qf +
                           '&' +
                           'hl.fragsize=0' +
                           '&' +
                           'hl.simple.post=%3C/mark%3E' +
                           '&' +
                           'hl.simple.pre=%3Cmark%3E' +
                           '&' +
                           'hl=on' +
                           '&' +
                           'wt=json' +
                           '&' +
                           'indent=on' +
                           '&' +
                           'qf=' + qf +
                           '&' +
                           'fq=' + encodeURIComponent( 'isbn:' + this.previewPane.epubIsbn ) +
                           '&' +
                           'fq=' + encodeURIComponent( 'pageNumberForDisplay:' + this.previewPane.epubPageNumber );
                },
                searchSolrQueryUrl : function() {
                    var qf = this.selectedQueryFields
                            .sort()
                            .join( '%20' ),

                        url = 'http://dev-discovery.dlib.nyu.edu:8983/solr/enm-pages/select?' +
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
                           'fl=title,authors,publisher,yearOfPublication' +
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
                searchDCI: function() {
                    if ( this.query && this.query !== '' ) {
                        return 'Searching for: ' + this.query;
                    } else {
                        return null;
                    }

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
                    this.query = '';

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
                clickEpubPage: function( pageIndex ) {
                    var pageNameForDisplay = this.barChartDataMatchedPages[ pageIndex ].page;

                    d3.select( 'rect[ name = "' + pageNameForDisplay + '" ]' )
                        .dispatch( 'click' );

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
                    var start = new Date(),
                        that = this;

                    this.previewPane.epubIsbn = event.currentTarget.id;
                    this.previewPane.epubTitle = event.currentTarget.attributes.name.nodeValue;

                    this.previewPane.epubPageNumber = null;

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

                            that.drawBarChart();

                            that.clickEpubPage( 0 );

                            that.qTime = getQTimeDisplay( response );
                            that.timeSolrResponseReceived = getTimeElapsedSinceStart( start );

                            that.updateBarChart = true;
                        } )
                        .catch( function( error ) {
                            that.previewPane.epubTitle = error;

                            that.timeSolrResponseReceived = getTimeElapsedSinceStart( start );
                        } );
                },
                previewEpubPage: function( event ) {
                    var start = new Date(),
                        that = this;

                    this.previewPane.epubPageNumber = event.page;

                    axios.get( this.previewEpubPageSolrQueryUrl )
                        .then( function( response ) {
                            doc = response.data.response.docs[ 0 ];
                            highlights = response.data.highlighting[
                                Object.keys(response.data.highlighting)[0]
                                ];

                            if ( highlights.pageText ) {
                                that.previewPane.pageText = highlights.pageText[ 0 ];
                            } else {
                                that.previewPane.pageText = doc.pageText;
                            }

                            if ( highlights.topicNames ) {
                                that.previewPane.topicsOnPage = highlights.topicNames;
                            } else {
                                that.previewPane.topicsOnPage = doc.topicNames_facet;
                            }

                            that.qTime = getQTimeDisplay( response );
                            that.timeSolrResponseReceived = getTimeElapsedSinceStart( start );

                            that.updatePagePreview = true;
                        } )
                        .catch( function( error ) {
                            that.previewPane.epubTitle = error;

                            that.timeSolrResponseReceived = getTimeElapsedSinceStart( start );
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

                    var start = new Date(),
                        // Can't use `this` for then or catch, as it is bound to Window object
                        that = this;

                    this.displaySearchDCI = true;
                    this.displaySpinner = true;
                    this.displayFacetPane = false;
                    this.displayResultsPane = false;
                    this.displayPreviewPane = false;

                    this.qTime = null;
                    this.start = start;
                    this.timeData = null;
                    this.timeTotal = null;

                    this.facetPane.showAllTopics = false;

                    this.previewPane.epubPageNumber = null;
                    this.previewPane.epubIsbn = null;
                    this.previewPane.epubTitle = null;

                    clearBarChart();

                    // Can't bind query echo to this.query because when user types in
                    // a new query in search the echo will react.
                    this.queryEcho = this.query;

                    // If user input a new query, reset the EPUBs dropdown and also
                    // clear epubTitle.  Simply clearing epubTitle does not seem to
                    // refresh the dropdown.  Likewise simply
                    if ( event.type === 'submit' ) {
                        this.epubDropdownOptions = [];
                        this.epubTitle = null;
                    }

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

                            that.qTime = getQTimeDisplay( response );
                            that.timeSolrResponseReceived = getTimeElapsedSinceStart( start );

                            that.displaySpinner = false;

                            if ( that.results.length > 0 ) {
                                that.previewPane.firstEpubInResults = that.results[ 0 ].groupValue;

                                that.displayFacetPane = true;
                                that.displayResultsPane = true;
                                that.displayPreviewPane = true;

                                that.updateBarChart = true;
                            }
                        } )
                        .catch( function( error ) {
                            that.results = error;

                            that.timeSolrResponseReceived = getTimeElapsedSinceStart( start );

                            that.displayFacetPane = false;
                            that.displayResultsPane = false;
                            that.displayPreviewPane = false;
                        } );
                },
                submitSearchForm: function() {
                    this.clearTopicFilters();
                    this.sendSearchQuery();
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
                },
                searchDCI: function( newSearchDCI ) {
                    this.displaySearchDCI = false;
                }
            },
            updated: function() {
                this.$nextTick( function() {
                    if ( this.updateBarChart ) {
                        this.timeAfterVueUpdated = getTimeElapsedSinceStart( this.start );
                        this.start               = null;
                        this.updateBarChart      = false;
                    }
                } );
            }
        }
    );

function getQTimeDisplay( response ) {
    return response.data.responseHeader.QTime / 1000 + ' seconds';
}

function getTimeElapsedSinceStart( start ) {
    return ( ( (new Date()) - start ) / 1000 ) + ' seconds';
}

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
        .on( 'click', options.pageClickCallback )
        .on( 'mouseover', tip.show )
        .on( 'mouseout', tip.hide );
}