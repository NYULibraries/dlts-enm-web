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
                displayResultsRaw        : false,
                displayResultsHeader     : false,
                displayResults           : false,
                displaySpinner           : false,
                epubDropdownOptions      : [],
                epubTitle                : '',
                numBooks                 : null,
                numPages                 : null,
                qTime                    : null,
                query                    : '',
                queryEcho                : '',
                queryFields              : queryFields,
                results                  : '',
                rows                     : 10,
                selectAllQueryFields     : true,
                selectedQueryFields      : queryFields.map( function( queryField ) { return queryField.value } ),
                start                    : null,
                timeAfterVueUpdated      : null,
                timeSolrResponseReceived : null,
                topicFacetList           : [],
                updateBarChart           : false
            },
            computed: {
                searchSolrQueryUrl : function() {
                    var qf = this.selectedQueryFields
                            .sort()
                            .join( '%20' ),
                        highlightFields = qf;

                    return 'http://dev-discovery.dlib.nyu.edu:8983/solr/enm-pages/select?' +
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
                           'hl.fl=' + highlightFields +
                           '&' +
                           'hl.simple.post=%3C/span%3E' +
                           '&' +
                           'hl.simple.pre=%3Cspan%20class=%22highlight%22%3E' +
                           '&' +
                           'hl=on' +
                           '&' +
                           'indent=on' +
                           '&' +
                           'qf=' + qf +
                           '&' +
                           'wt=json';
                },
                searchTags : function() {
                    return [
                        'Searching topics and full texts for: ' +
                           '"' + this.query + '"'
                    ];
                }
            },
            methods: {
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
                drawBarChart: function() {
                    clearBarChart();

                    if ( this.barChartShowAllPages === true ) {
                        _drawBarChart( this.barChartDataAllPages, { 'x-axis' : true } );
                    } else {
                        _drawBarChart( this.barChartDataMatchedPages, false );
                    }
                },
                sendSearchQuery: function( event ) {
                    var start = new Date(),
                        // Can't use `this` for then or catch, as it is bound to Window object
                        that = this;

                    this.displaySpinner = true;
                    this.displayResultsHeader = false;
                    this.displayResults = false;

                    this.qTime = null;
                    this.start = start;
                    this.timeData = null;
                    this.timeTotal = null;

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
                                topicFacetItemString, topicFacetItemJson,
                                numHits,
                                docs, epubNumberOfPages, lastPageSequenceNumber;

                            if ( event.type === 'submit' ) {
                                that.numBooks = response.data.grouped.isbn.groups.length;
                                that.numPages = response.data.grouped.isbn.matches;

                                if ( topicFacetItems ) {
                                    for ( i = 0; i < topicFacetItems.length; i = i + 2 ) {
                                        topic = topicFacetItems[ i ];
                                        numHits = topicFacetItems[ i + 1 ];
                                        that.topicFacetList.push(
                                            topic + ' [' + numHits + ']'
                                        );
                                    }
                                }
                            } else {
                                docs = response.data.response.docs;
                                epubNumberOfPages = docs[ 0 ].epubNumberOfPages;
                                lastPageSequenceNumber = 0;

                                that.barChartDataAllPages = [];
                                that.barChartDataMatchedPages = [];

                                // docs are sorted by pageSequenceNumber in asc order
                                docs.forEach( function( doc ) {
                                    var currentPageSequenceNumber = doc.pageSequenceNumber;

                                    for ( i = lastPageSequenceNumber + 1; i < currentPageSequenceNumber; i++ ) {
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

                                    lastPageSequenceNumber = currentPageSequenceNumber;
                                } );

                                for ( i = lastPageSequenceNumber + 1; i <= epubNumberOfPages; i++ ) {
                                    that.barChartDataAllPages[ i - 1 ] = {
                                        page  : '[USER SHOULD NEVER SEE THIS (' + i + ')]',
                                        score : 0
                                    };
                                }

                                that.drawBarChart();

                                that.displayResults = true;
                            }

                            that.qTime = getQTimeDisplay( response );
                            that.timeSolrResponseReceived = getTimeElapsedSinceStart( start );

                            that.results = response;

                            that.displaySpinner = false;
                            that.displayResultsHeader = true;

                            that.updateBarChart = true;
                        } )
                        .catch( function( error ) {
                            that.results = error;

                            that.timeSolrResponseReceived = getTimeElapsedSinceStart( start );

                            that.displaySpinner = false;
                            that.displayResultsHeader = true;
                            that.displayResults = true;
                        } );
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
        margin = { top : 20, right : 20, bottom : 20, left : 20 },
        width  = +svg.attr( 'width' ) - margin.left - margin.right,
        height = +svg.attr( 'height' ) - margin.top - margin.bottom,

        x = d3.scaleBand().rangeRound( [ 0, width ] ).padding( 0.1 ),
        y = d3.scaleLinear().rangeRound( [ height, 0 ] ),

        g = svg.append( 'g' )
            .attr( 'transform', 'translate(' + margin.left + ',' + margin.top + ')' );

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
        .on( 'mouseover', tip.show )
        .on( 'mouseout', tip.hide );
}