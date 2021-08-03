<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="ENM">
  <title>ENM search page 2</title>
  <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css">
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
        <div class="column enm-pane enm-pane-results is-half">
          <?php  require('includes/results.html');  ?>
        </div>
        <div class="column enm-pane enm-pane-preview">
          <div id="message" class="message is-valign is-centered">
            <!--  <p class="message-header">Info</p> -->
            <p class="message-body has-text-centered">Choose a book at left to view matched pages, or
              <br>
              <a href="#">Load the first matched page</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  </main>
  <?php  require('includes/footer.html');  ?>
</body>

</html>