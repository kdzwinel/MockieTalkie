(function () {
  "use strict";

  function changeStatus(status) {
    chrome.runtime.getBackgroundPage(function(page) {
      if(page) {
        page.changeStatus(status);
      }
      window.close();
    });
  }

  document.getElementById('mock').addEventListener('click', function () {
    changeStatus('mock');
  });

  document.getElementById('learn').addEventListener('click', function () {
    changeStatus('learn');
  });

  document.getElementById('stop').addEventListener('click', function () {
    changeStatus('stop');
  });

  //generate valid URL to the options page
  document.getElementById('manage').href = 'chrome-extension://' + chrome.runtime.id + '/options_page/dist/index.html';

  setTimeout(function() {
    //deselect first element that gets automatically selected
    document.getElementById('mock').blur();
  }, 10);

})();