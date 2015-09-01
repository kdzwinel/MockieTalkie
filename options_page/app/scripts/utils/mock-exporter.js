'use strict';

angular.module('optionsPage')
  .factory('MockExporter', function (MockRepository) {
    function MockExporter() {}

    function serialize(data) {
      return angular.toJson(data, true);
    }

    function slugify(name) {
      return name.replace(/[^a-z0-9-]/gi, '_');
    }

    function downloadJSON(text, fileName) {
      var blob = new Blob([text], {type: 'application/json'});

      var a = document.createElement('a');
      a.href = window.URL.createObjectURL(blob);
      a.download = fileName + '.json';
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }

    MockExporter.prototype.exportDomain = function(domain) {
      return MockRepository.getMocksByDomain(domain.name).then(function(mocks) {
        downloadJSON(serialize(mocks), slugify(domain.name));
      });
    };

    return new MockExporter();
  });
