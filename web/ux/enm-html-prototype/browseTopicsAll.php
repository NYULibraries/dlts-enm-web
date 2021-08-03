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
                Explore 45,000 people, places, things, ideas
              </p>
            </div>
          </div>
        </div>
      </div>
      <div class="hero-foot">
        <div class="container">
          <nav class="tabs is-boxed is-medium">
            <ul>
              <li>
                <a href="browseTopics.php">Featured</a>
              </li>
              <li class="is-active">
                <a href="browseTopicsAll.php">All</a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </section>
    <nav class="navbar has-shadow">
      <div class="container">
        <div class="navbar-tabs">
          <a class="navbar-item is-tab is-active" href="">
            A
          </a>
          <a class="navbar-item is-tab " href="">
            B
          </a>
          <a class="navbar-item is-tab " href="">
            C
          </a>
          <a class="navbar-item is-tab " href="">
            D
          </a>
          <a class="navbar-item is-tab " href="">
            E
          </a>
          <a class="navbar-item is-tab " href="">
            F
          </a>
          <a class="navbar-item is-tab " href="">
            G
          </a>
          <a class="navbar-item is-tab " href="">
            H
          </a>
          <a class="navbar-item is-tab " href="">
            I
          </a>
          <a class="navbar-item is-tab " href="">
            J
          </a>
          <a class="navbar-item is-tab " href="">
            K
          </a>
          <a class="navbar-item is-tab " href="">
            L
          </a>
          <a class="navbar-item is-tab " href="">
            M
          </a>
          <a class="navbar-item is-tab " href="">
            N
          </a>
          <a class="navbar-item is-tab " href="">
            O
          </a>
          <a class="navbar-item is-tab " href="">
            P
          </a>
          <a class="navbar-item is-tab " href="">
            Q
          </a>
          <a class="navbar-item is-tab " href="">
            R
          </a>
          <a class="navbar-item is-tab " href="">
            S
          </a>
          <a class="navbar-item is-tab " href="">
            T
          </a>
          <a class="navbar-item is-tab " href="">
            U
          </a>
          <a class="navbar-item is-tab " href="">
            V
          </a>
          <a class="navbar-item is-tab " href="">
            W
          </a>
          <a class="navbar-item is-tab " href="">
            X
          </a>
          <a class="navbar-item is-tab " href="">
            Y
          </a>
          <a class="navbar-item is-tab " href="">
            Z
          </a>
        </div>
      </div>
    </nav>
    <div class="container enm-topiclist">
     
        <?php require('includes/browseTopics/topicsatoz.html'); ?>
    </div>
  </main>
  <?php  require('includes/footer.html');  ?>
</body>

</html>