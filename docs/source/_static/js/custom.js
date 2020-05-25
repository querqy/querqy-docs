var defaultSearchEngine = 'elasticsearch'
var searchEngine = defaultSearchEngine;


function setCookie(cname, cvalue) {
  document.cookie = cname + "=" + cvalue + ";path=/";
}

function getCookie(cname) {

  var name = cname + "=";
  var ca = document.cookie.split(';');
  for(var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";

}

function applySearchEngine() {

  if (searchEngine == 'elasticsearch') {

    $('.elasticsearch').css('display', 'inline');
    $('.solr').css('display', 'none');
    $('.se-tab-elasticsearch').removeClass('se-tab-deselected')
    $('.se-tab-elasticsearch').addClass('se-tab-selected')
    $('.se-tab-solr').addClass('se-tab-deselected')
    $('.se-tab-solr').removeClass('se-tab-selected')

  } else if (searchEngine == 'solr') {

    $('.solr').css('display', 'inline');
    $('.elasticsearch').css('display', 'none');
    $('.se-tab-elasticsearch').removeClass('se-tab-selected')
    $('.se-tab-elasticsearch').addClass('se-tab-deselected')
    $('.se-tab-solr').addClass('se-tab-selected')
    $('.se-tab-solr').removeClass('se-tab-deselected')

  }

}

function changeSearchEngine(engine) {

  if (engine == 'solr') {
    setCookie('se', 'solr')
    searchEngine = 'solr'
  } else if (engine == 'elasticsearch') {
    setCookie('se', 'elasticsearch')
    searchEngine = 'elasticsearch'
  } else {
    searchEngine = defaultSearchEngine
  }

  applySearchEngine()

}


$( document ).ready(function() {
  var seCookie = getCookie('se')
  searchEngine = ((seCookie != 'elasticsearch') && (seCookie != 'solr'))
                ? defaultSearchEngine : seCookie



  var loc = window.location.href;
  var hash = loc.indexOf('#');

  if (hash > -1) {
    if (loc.indexOf('-solr', hash) > -1) {
      searchEngine = 'solr'
      setCookie('se', 'solr')

    } else if (loc.indexOf('-elasticsearch', hash) > -1) {
      searchEngine = 'elasticsearch'
      setCookie('se', 'elasticsearch')
    }
  }

  applySearchEngine()

});

$(window).on('hashchange', function(e){
  var loc = window.location.href;
  var hash = loc.indexOf('#');

  if (hash > -1) {
    if (loc.indexOf('-solr', hash) > -1) {
      searchEngine = 'solr'
      setCookie('se', 'solr')

    } else if (loc.indexOf('-elasticsearch', hash) > -1) {
      searchEngine = 'elasticsearch'
      setCookie('se', 'elasticsearch')
    } else {
      return;
    }

    applySearchEngine();
  }
});


function setESURL(url) {
  var html = $('.elasticsearch-version').html();
  var start = html.indexOf('https://');
  if (start > 0) {
    var end = html.indexOf('"', start);
    if (end > 0) {
      $('.elasticsearch-version').html(html.substring(0, start) + url + html.substring(end));
    }
  }
}
