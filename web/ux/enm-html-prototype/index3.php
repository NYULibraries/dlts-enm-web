<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="ENM">
  <title>3 ENM</title>
  <link rel="stylesheet" href="font-awesome-4.7.0/css/font-awesome.min.css">
  <link href="https://fonts.googleapis.com/css?family=Crimson+Text" rel="stylesheet">
  <link rel="stylesheet" href="css/bulma.css">
</head>

<body>
  <?php require('includes/banner.html'); ?>
  <main class="enm-searchpage" id="maincontent">
    <?php require('includes/searchform.html'); ?>
    <?php require('includes/searchecho.html'); ?>
    <div class="container is-fluid">
      <div class="columns enm-panes">
        <div class="column enm-pane enm-pane-facets is-2">
          <?php  require('includes/facets.html');  ?>
        </div>
        <div class="column enm-pane enm-pane-results is-4">
          <?php  require('includes/results.html');  ?>
        </div>
        <div class="column enm-pane enm-pane-preview">
          <?php  require('includes/preview.html');  ?>
        </div>
      </div>
    </div>
  </main>
  <?php  require('includes/footer.html');  ?>
</body>

</html>