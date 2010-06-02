/** Awesome script to simulate local/sessionStorage on browsers that don't support it.
 * by Remy Sharp http://gist.github.com/350433
 * Modified to simulate only localStorage since we don't use sessionStorage
 */
if (!window.localStorage) (function () {

var Storage = function (type) {
  function createCookie(name, value, days) {
    var date, expires;

    if (days) {
      date = new Date();
      date.setTime(date.getTime()+(days*24*60*60*1000));
      expires = "; expires="+date.toGMTString();
    } else {
      expires = "";
    }
    document.cookie = name+"="+value+expires+"; path=/";
  }

  function readCookie(name) {
    var nameEQ = name + "=",
        ca = document.cookie.split(';'),
        i, c;

    for (i=0; i < ca.length; i++) {
      c = ca[i];
      while (c.charAt(0)==' ') {
        c = c.substring(1,c.length);
      }

      if (c.indexOf(nameEQ) == 0) {
        return c.substring(nameEQ.length,c.length);
      }
    }
    return null;
  }
  
  function setData(data) {
    data = JSON.stringify(data);
    if (type == 'session') {
      window.top.name = data;
    } else {
      createCookie('localStorage', data, 365);
    }
  }
  
  function clearData() {
    if (type == 'session') {
      window.top.name = '';
    } else {
      createCookie('localStorage', '', 365);
    }
  }
  
  function getData() {
    var data = type == 'session' ? window.top.name : readCookie('localStorage');
    return data ? JSON.parse(data) : {};
  }

  // initialise if there's already data
  var data = getData();

  return {
    clear: function () {
      data = {};
      clearData();
    },
    getItem: function (key) {
      return data[key] || null;
    },
    key: function (i) {
      // not perfect, but works
      var ctr = 0;
      for (var k in data) {
        if (ctr == i) return k;
        else ctr++;
      }
      return null;
    },
    removeItem: function (key) {
      delete data[key];
      setData(data);
    },
    setItem: function (key, value) {
      data[key] = value+''; // forces the value to a string
      setData(data);
    }
  };
};

if (!window.localStorage) window.localStorage = new Storage('local');
})();


var exerciseOptions = { };
var jsmeterFilters = { 
    //["Line", "Function", "Statements", "Lines", "Comment Lines", 
    //     "Comment%", "Branches", "Depth", "Cyclomatic Complexity", 
    //     "Halstead Volume", "Halstead Potential", "Program Level", "MI"]
    defaultFilter: function(metrics) {
        var html = "<table>";
        for (var index in metrics) {
            if (metrics.hasOwnProperty(index)) {
                html += "<tr>";
                for (var index2 in metrics[index]) {
                    if (metrics[index].hasOwnProperty(index2)) {
                        html += "<td>" + metrics[index][index2] + "</td>";
                    }
                }
                html += "</tr>";
            }
        }
        html += "</table>";
        return html;
    }
};
(function($) { $().ready(function() {
    var handleMessage = function(msg) {
        data = JSON.parse(msg.data);
        $("#" + data.type + "iframe").remove();
        if (data.type === 'jsmeter') {
            $("#jsassess-" + data.type).html("<h3>Complexity metrics</h3>" + exerciseOptions.jsmeter(data.results));
        } else if (data.type === 'jslint'){
            $("#jsassess-" + data.type).html("<h3>Programming and style errors</h3>" + data.results);
        } else if (data.type === 'test') {
            $("#jsassess-" + data.type).html("<h3>Functionality</h3>" + data.results);
        }
    }
    var $jsassessIframes = $("#jsassess-iframes");
    var run = function(type, exerciseOptions) {
        var jsrunframe = document.createElement("iframe");
        jsrunframe.id = type + "iframe";
        jsrunframe.src = exerciseOptions.commonspath + type + ".html?code=" + encodeURIComponent(editAreaLoader.getValue("jsassess-editor")) +
            "&options=" + encodeURIComponent(JSON.stringify(exerciseOptions[type]));
        $jsassessIframes.append(jsrunframe);
    }
    var runTests = function(testFile, exerciseOptions) {
        var jsrunframe = document.createElement("iframe");
        jsrunframe.id = "testiframe";
        jsrunframe.src = "./" + testFile + "?code=" + encodeURIComponent(editAreaLoader.getValue("jsassess-editor"));
        $jsassessIframes.append(jsrunframe);
    }

    var elem, elemId, feedbackIds = ["jslint", "test", "jsmeter"];
    for (var i=0; i<feedbackIds.length; i++) {
        elemId = "jsassess-" + feedbackIds[i];
        if (!$("#" + elemId).length) {
            elem = document.createElement("div");
            elem.id = elemId;
            $("#jsassess-feedback").append(elem);
        }
    }
    if (!$jsassessIframes.length) {
        elem = document.createElement("div");
        elem.id = "jsassess-iframes";
        $jsassessIframes = $(elem);
        $("body").append(elem);
    }
    var key = document.location.pathname.split('/');
    key = key[key.length-1];
    var getStoredSolutions = function() {
        var solutions = null;
        if (window.localStorage) {
            var item = localStorage.getItem(key);
            // Chrome dies if we try to JSON.parse null
            if (item) {
                solutions = JSON.parse(item);
            }
        }
        return solutions?solutions:[];
    }
    var solutions = getStoredSolutions();
    if (solutions.length > 0) {
        $("#jsassess-editor").text(solutions[solutions.length-1].code);
    }
    editAreaLoader.init({
        id : "jsassess-editor",        // textarea id
        syntax: "js",            // syntax to be uses for highgliting
        start_highlight: true        // to display with highlight mode on start-up
    });
    $("#submitButton").click(function(event) {
        event.preventDefault();
        event.stopPropagation();

        // store the solution to the localStorage to be fetched when accessing the page in the future
        var newItem = {'code': editAreaLoader.getValue("jsassess-editor"), 'tstamp': new Date()};
        solutions.push(newItem);
        localStorage.setItem(key, JSON.stringify(solutions));

        if (exerciseOptions.jsmeter) {
            run("jsmeter", exerciseOptions);
        }
        if (exerciseOptions.jslint) {
            run("jslint", exerciseOptions);
        }
        if (exerciseOptions.tests) {
            for (var index in exerciseOptions.tests) {
                if (exerciseOptions.tests.hasOwnProperty(index)) {
                    runTests(exerciseOptions.tests[index]);
                }
            }
        }
    });
    if (window.addEventListener) {
        window.addEventListener( "message", handleMessage, false);
    }
}) })(jQuery);