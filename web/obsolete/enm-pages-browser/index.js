import React from "react";
import ReactDOM from "react-dom";
import {
    SolrFacetedSearch,
    SolrClient,
    defaultComponentPack
} from "solr-faceted-search-react";

// The search fields and filterable facets you want
const fields = [
    {label: "All text fields", field: "*", type: "text"},
    {label: "Title", field: "title", type: "list-facet"},
    {label: "Publisher", field: "publisher", type: "list-facet"},
    {label: "Authors", field: "authors", type: "list-facet"},
    {label: "Topic Names", field: "topicNames", type: "list-facet"},
    {label: "Year of Publication", field: "yearOfPublication", type: "list-facet"},
    {label: "ISBN", field: "isbn", type: "list-facet"},
];

// The sortable fields you want
const sortFields = [
    {label: "Title", field: "title"},
    {label: "Topic Names", field: "topicNames"},
];

class Result extends React.Component {
    render() {
        return (
            <article>
                <h1>{this.props.doc.title} (p. {this.props.doc.pageNumberForDisplay})</h1>
                <div>Author(s): {this.props.doc.authors.join(';')}</div>
                <div>Year: {this.props.doc.yearOfPublication}</div>
                <div>ISBN: {this.props.doc.isbn}</div>
                <ul class="topics">Topic names
                    {
                        this.props.doc.topicNames && this.props.doc.topicNames.map(
                                function(topicName) {
                                    return <li>{topicName}</li>;
                                }
                            )
                    }
                </ul>
                <div class="full-text">{this.props.doc.pageText}</div>
            </article>
        )
    }
}

const ComponentPack = {
    ...defaultComponentPack,
    results: {
        ...defaultComponentPack.results,
        result: Result
    }
};

document.addEventListener("DOMContentLoaded", () => {
    // The client class
    new SolrClient({
            // The solr index url to be queried by the client
            url: "https://devdiscovery.dlib.nyu.edu/solr/enm-pages/select",
            searchFields: fields,
            sortFields: sortFields,
            rows: 20,

            // The change handler passes the current query- and result state for render
            // as well as the default handlers for interaction with the search component
            onChange: (state, handlers) =>
                   // Render the faceted search component
                   ReactDOM.render(
                        <SolrFacetedSearch
                                {...state}
                                {...handlers}
                                bootstrapCss={true}
                                customComponents={ComponentPack}
                                onSelectDoc={(doc) => console.log(doc)}
                        />,
                        document.getElementById("app")
                    )
        }).initialize(); // this will send an initial search, fetching all results from solr
});
