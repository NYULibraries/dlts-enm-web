var queryFields = [
        {
            name: 'authors',
            value: 'authors'
        },
        {
            name: 'isbn',
            value: 'isbn'
        },
        {
            name: 'pageText',
            value: 'pageText'
        },
        {
            name: 'publisher',
            value: 'publisher'
        },
        {
            name: 'title',
            value: 'title'
        },
        {
            name: 'topicNames',
            value: 'topicNames'
        },
    ],
    app = new Vue(
    {
        el: '#app',
        data: {
            allQueryFields           : true,
            displayResultsRaw        : false,
            displayResultsHeader     : false,
            displayResults           : false,
            displaySpinner           : false,
            epubDropdownOptions      : [],
            epubTitle                : '',
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
            updateTreeView           : false
        },
        computed: {
            solrQueryUrl: function() {
                var qf = this.selectedQueryFields
                        .sort()
                        .join( '%20' ),
                    highlightFields = qf,
                    solrQueryUrl =
                        'http://dev-discovery.dlib.nyu.edu:8983/solr/enm-pages/select?' +
                           'q=' + encodeURIComponent( this.query ) +
                           '&' +
                           'defType=edismax' +
                           '&' +
                           'facet.field=title_facet' +
                           '&' +
                           'facet.mincount=1' +
                           '&' +
                           'facet=on' +
                           '&' +
                           'fl=pageLocalId,pageNumberForDisplay,pageSequenceNumber,score' +
                           '&' +
                           'sort=pageSequenceNumber+asc' +
                           '&' +
                           'rows=999' +
                           '&' +
                           '&' +
                           'wt=json' +
                           '&' +
                           'indent=on' +
                           '&' +
                           'qf=' + qf,
                    epubTitle = this.epubTitle;


                if ( epubTitle ) {
                    solrQueryUrl += '&fq=' + encodeURIComponent( 'title_facet:"' + epubTitle + '"' );
                }

                return solrQueryUrl;
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
            sendQuery              : function( event ) {
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

                axios.get( this.solrQueryUrl )
                    .then( function( response ) {
                        var titleFacetItems = response.data.facet_counts.facet_fields.title_facet,
                            i,
                            title, numHits,
                        results;

                        if ( event.type === 'submit' ) {
                            if ( titleFacetItems ) {
                                for ( i = 0; i < titleFacetItems.length; i = i + 2 ) {
                                    title   = titleFacetItems[ i ];
                                    numHits = titleFacetItems[ i + 1 ];
                                    that.epubDropdownOptions.push(
                                        {
                                            title   : title,
                                            numHits : numHits
                                        }
                                    );
                                }
                            }
                        } else {
                            results = response.data.response.docs.map( function ( doc ) {
                                return {
                                    page  : doc.pageNumberForDisplay,
                                    score : doc.score
                                };
                            } );

                            drawGraph( results );

                            that.displayResults = true;
                        }

                        that.qTime = getQTimeDisplay( response );
                        that.timeSolrResponseReceived = getTimeElapsedSinceStart( start );

                        that.results = response;

                        that.displaySpinner = false;
                        that.displayResultsHeader = true;

                        that.updateTreeView = true;
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
        updated: function() {
            this.$nextTick( function() {
                if ( this.updateTreeView ) {
                    this.timeAfterVueUpdated = getTimeElapsedSinceStart( this.start );
                    this.start               = null;
                    this.updateTreeView      = false;
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

function drawGraph( data ) {
    var svg    = d3.select( 'svg' ),
        margin = { top : 20, right : 20, bottom : 30, left : 40 },
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

    g.append( 'g' )
        .attr( 'class', 'axis axis--x' )
        .attr( 'transform', 'translate(0,' + height + ')' )
        .call( d3.axisBottom( x ) );

    g.append( 'g' )
        .attr( 'class', 'axis axis--y' )
        .call( d3.axisLeft( y ).ticks( 10 ) )
        .append( 'text' )
        .attr( 'transform', 'rotate(-90)' )
        .attr( 'y', 6 )
        .attr( 'dy', '0.71em' )
        .attr( 'text-anchor', 'end' )
        .text( 'Score' );

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
        } );
}