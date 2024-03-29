<!DOCTYPE html>
<html>

<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="ENM">
  <title>Browse Topics</title>
  <link rel="stylesheet" href="font-awesome-4.7.0/css/font-awesome.min.css">
  <link href="https://fonts.googleapis.com/css?family=Crimson+Text" rel="stylesheet">
  <link rel="stylesheet" href="css/bulma.css">
</head>

<body>
  <?php require('includes/banner.html'); ?>
  <main class="enm-browsetopicspage">
    <section class="hero is-primary">
      <div class="hero-body">
        <div class="container">
          <div class="columns is-vcentered">
            <div class="column">
              <p class="title">
                Browse Topics
              </p>
              <p class="subtitle">
                Explore people, places, things, ideas
              </p>
            </div>
          </div>
        </div>
      </div>
      <div class="hero-foot">
        <div class="container">
          <nav class="tabs is-boxed is-medium">
            <ul>
              <li class="is-active">
                <a href="browseTopics.php">Featured</a>
              </li>
              <li>
                <a href="browseTopicsAll.php">All</a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </section>
    <nav class="navbar has-shadow">
      <div class="container">
       <div class="subtab-info">The most frequently occurring, connected, or otherwise important topics</div>
      </div>
    </nav>
    <div class="container enm-topiclist">
    
        <?php require('includes/browseTopics/featuredtopics.html'); ?>
    </div>
  </main>
  <?php  require('includes/footer.html');  ?>
</body>
</html>