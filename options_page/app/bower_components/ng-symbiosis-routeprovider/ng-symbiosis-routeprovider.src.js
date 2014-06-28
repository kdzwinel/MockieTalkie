angular.module('ngSymbiosis.routeProvider', [])
    .constant('stateFactory', function stateFactory(classedName, params) {

        var _INITSERVICE = classedName + 'CtrlInit';

        function dasherize(input) {
            return input
                .replace(/(?:^[A-Z]{2,})/g, function (match) { //XMLfileIsCool -> xml-fileIsCool
                    return match.toLowerCase() + "-";
                })
                .replace(/(?:[A-Z]+)/g, function (match) { //camelCase -> snake-case
                    return "-" + match.toLowerCase();
                })
                .replace(/^-/, ''); // CamelCase -> -snake-case -> snake-case
        }

        var _defaults = {
            url: '/' + dasherize(classedName),
            templateUrl: 'states/' + dasherize(classedName) + '/index/main-view.html',
            controller: classedName + 'Ctrl'
        };

        try {
            _defaults.resolve = {
                init: ['$injector', function ($injector) {
                    if ($injector.has(_INITSERVICE)) {
                        var service = $injector.get(_INITSERVICE);
                        if (typeof service.prepare !== 'function') throw _INITSERVICE + ' has no prepare method.';

                        return service.prepare();
                    }
                }]
            }
        }
        catch (e) {
            throw 'Serious error occurred trying to load controller.: ' + e;
        }

        return angular.extend(_defaults, params);
    });