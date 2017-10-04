var app = new Vue(
    {
        el: '#app',
        data: {
            totalTime      : null
            displayResultsHeader : false,
            displayResults       : false,
            displaySpinner       : false,
            qTime                : null,
            results              : '',
            rows                 : 10,
            search               : '',
            start                : null,
        },
        computed: {
            solrQueryUrl: function() {
                return 'http://dev-discovery.dlib.nyu.edu:8983/solr/enm-pages/select?' +
                    'q=' + encodeURIComponent( this.search ) +
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
                    'hl.fl=authors,%20isbn,%20pageText,%20publisher,%20title,%20topicNames' +
                    '&' +
                    'hl.simple.post=%3C/span%3E' +
                    '&' +
                    'hl.simple.pre=%3Cspan%20class=%22highlight%22%3E' +
                    '&' +
                    'hl=on' +
                    '&' +
                    'indent=on' +
                    '&' +
                    'qf=authors,%20isbn,%20pageText,%20publisher,%20title,%20topicNames' +
                    '&' +
                    'wt=json'
            }
        },
        methods: {
            sendQuery: function() {
                var start = new Date(),
                    // Can't use `this` for then or catch, as it is bound to Window object
                    that = this;

                this.displayResults = false;
                this.displaySpinner = true;

                axios.get( this.solrQueryUrl )
                    .then( function( response ) {
                        that.results = response;

                        that.qTime = getQTimeDisplay( response );
                        that.totalTime = getTotalTimeDisplay( start );

                        that.displaySpinner = false;
                        that.displayResults = true;
                    } )
                    .catch( function( error ) {
                        that.results = error;

                        that.qTime = getQTimeDisplay( response );
                        that.totalTime = getTotalTimeDisplay( start );

                        that.displaySpinner = false;
                        that.displayResults = true;
                    } );
            }
        }
    }
);

function getQTimeDisplay( response ) {
    return response.data.responseHeader.QTime / 1000 + ' seconds';
}

function getTotalTimeDisplay( start ) {
    return ( ( (new Date()) - start ) / 1000 ) + ' seconds';
}