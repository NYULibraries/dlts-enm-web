var app = new Vue(
    {
        el: '#app',
        data: {
            displayResultsHeader     : false,
            displayResults           : false,
            displaySpinner           : false,
            qTime                    : null,
            query                    : '',
            queryEcho                : '',
            results                  : '',
            rows                     : 10,
            start                    : null,
            timeAfterVueUpdated      : null,
            timeSolrResponseReceived : null,
            updateResults            : false
        },
        computed: {
            solrQueryUrl: function() {
                return 'http://dev-discovery.dlib.nyu.edu:8983/solr/enm-pages/select?' +
                       'q=' + encodeURIComponent( this.query ) +
                       '&' +
                       'defType=edismax' +
                       '&' +
                       'facet.field=authors' +
                       '&' +
                       'facet.field=publisher' +
                       '&' +
                       'facet.field=title' +
                       '&' +
                       'facet.field=topicNames' +
                       '&' +
                       'facet=on' +
                       '&' +
                       'group.field=isbn' +
                       '&' +
                       'group=true' +
                       '&' +
                       'group.limit=999' +
                       '&' +
                       'hl.fl=authors%20isbn%20pageText%20publisher%20title%20topicNames' +
                       '&' +
                       'hl.simple.post=%3C/span%3E' +
                       '&' +
                       'hl.simple.pre=%3Cspan%20class=%22highlight%22%3E' +
                       '&' +
                       'hl=on' +
                       '&' +
                       'indent=on' +
                       '&' +
                       'qf=authors%20isbn%20pageText%20publisher%20title%20topicNames' +
                       '&' +
                       'wt=json'
            }
        },
        methods: {
            sendQuery: function() {
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

                axios.get( this.solrQueryUrl )
                    .then( function( response ) {
                        that.qTime = getQTimeDisplay( response );
                        that.timeSolrResponseReceived = getTimeElapsedSinceStart( start );

                        that.results = response;

                        that.displaySpinner = false;
                        that.displayResultsHeader = true;
                        that.displayResults = true;

                        that.updateResults = true;
                    } )
                    .catch( function( error ) {
                        that.results = error;

                        that.qTime = getQTimeDisplay( response );
                        that.timeSolrResponseReceived = getTimeElapsedSinceStart( start );

                        that.displaySpinner = false;
                        that.displayResultsHeader = true;
                        that.displayResults = true;
                    } );
            }
        },
        updated: function() {
            this.$nextTick( function() {
                if ( this.updateResults ) {
                    this.timeAfterVueUpdated = getTimeElapsedSinceStart( this.start );
                    this.start               = null;
                    this.updateResults       = false;
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