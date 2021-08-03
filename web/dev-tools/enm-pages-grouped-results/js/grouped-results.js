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
                    highlightFields = qf;

                return 'https://devdiscovery.dlib.nyu.edu/solr/enm-pages/select?' +
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
                       'wt=json'
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
            sendQuery              : function() {
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

                        that.updateTreeView = true;
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