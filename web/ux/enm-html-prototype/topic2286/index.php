<!DOCTYPE html>
<html>

<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="ENM">
  <title>ENM Topic: Iraq</title>
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
          <div class="columns is-vcentered">
            <div class="column">
              <header>
                <div class="supertitle ">
                  TOPIC
                </div>
                <div class="title enm-topictitle">
                  Iraq
                </div>
              </header>
            </div>
          </div>
        </div>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <div class="enm-topic-items columns ">
          <div id="topicmapholder" class="enm-topicmap column is-two-thirds">
            <!-- <h2 class="enm-title">Topic Map</h2> -->
            <svg viewBox="0 0 800 300" preserveAspectRatio="xMinYMin meet" style="height:100%; width:100%">
            </svg>
          </div>
          <div class=" enm-books-with-topic column">
            <h2 class="enm-title">This topic referenced in:</h2>
            <?php require('../includes/book_internationalizing.html'); ?>
            <?php require('../includes/book_hyperlinked.html'); ?>
            <?php require('../includes/book_psycho.html'); ?>
          </div>
        </div>
      </div>
    </section>
  </main>
  <script src="https://d3js.org/d3.v4.min.js"></script>
  <script src="../onetopic.js"></script>
</body>

</html>