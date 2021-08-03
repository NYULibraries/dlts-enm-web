<!DOCTYPE html>
<html>

<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="ENM">
  <title>ENM Topic: Amazon</title>
  <link rel="stylesheet" href="../font-awesome-4.7.0/css/font-awesome.min.css">
  <link href="https://fonts.googleapis.com/css?family=Crimson+Text" rel="stylesheet">
  <link rel="stylesheet" href="../css/bulma.css">
  <link rel="stylesheet" href="../css/enmviz.css">
</head>

<body>
  <?php require('../includes/banner.html'); ?>
  <main class="enm-topicpage">
    <section class="hero  is-link">
      <div class="hero-body">
        <div class="container">
          <header class="columns is-vcentered">
            <div class="column is-two-thirds">
              <div class="supertitle ">
                TOPIC
              </div>
              <div class="title enm-topictitle">
                Amazon.com
                <span class="subtitle">
                  (Alternative name: Amazon [as company])
                </span>
              </div>
            </div>
            <div class="column enm-linked-data">
         <script type="application/ld+json"> 
              {
    "@context" : {
      "skos" : "http://www.w3.org/2004/02/skos/core#",
      "schema" : "http://schema.org/"
      },
    "@id" : "http://devweb1.dlib.nyu.edu/enm/ux/enm-html-prototype/topic2458/",
    "@type" : "skos:Concept",
    "schema:name" : "Amazon.com",
    "schema:name" : "Amazon [as company]",
    "skos:related" : [ "http://devweb1.dlib.nyu.edu/enm/ux/enm-html-prototype/topic8044", "http://devweb1.dlib.nyu.edu/enm/ux/enm-html-prototype/topic8086","http://devweb1.dlib.nyu.edu/enm/ux/enm-html-prototype/topic8503" ],
    "skos:exactMatch": ["https://www.wikidata.org/wiki/Q3884"],
    "schema:subjectOf" : ["https://www.press.umich.edu/7137512/making_news_at_the_new_york_times", "https://www.press.umich.edu/297297/hyperlinked_society", "https://www.press.umich.edu/300138/originality_imitation_and_plagiarism"]
}
</script>
              <article class="message">
                <div class="message-header">Linked Data
                </div>
                <div class="message-body">
                  <a href="https://www.wikidata.org/wiki/Q3884"><i class="fa fa-globe" aria-hidden="true"></i> www.wikidata.org/wiki/Q3884</a>
                  <br>
                  <a href="http://viaf.org/viaf/173278077/"><i class="fa fa-globe" aria-hidden="true"></i> viaf.org/viaf/173278077/</a>
                </div>
              </article>
            </div>
          </header>
        </div>
      </div>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <div class="enm-topic-items columns ">
          <div id="topicmapholder" class="enm-topicmap column is-two-thirds">
            <svg viewBox="100 30 700 300" preserveAspectRatio="xMinYMin meet" style="height:100%; width:100%">
            </svg>
          </div>
          <div class=" enm-books-with-topic column">
            <h2 class="enm-title">This topic referenced in:</h2>
            <?php require('../includes/book_internationalizing.html'); ?>
            <?php require('../includes/book_hyperlinked.html'); ?>
            <?php require('../includes/book_psycho.html'); ?>
            <hr>
            <article class="box">
              <a href="#">Leave feedback</a> on this topic
            </article>
          </div>
        </div>
      </div>
    </section>
  </main>
  <script src="https://d3js.org/d3.v4.min.js"></script>
  <script src="../onetopic.js"></script>
</body>

</html>