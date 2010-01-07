var exerciseOptions = { };
var jsmeterFilters = { 
	//["Line", "Function", "Statements", "Lines", "Comment Lines", 
	//	 "Comment%", "Branches", "Depth", "Cyclomatic Complexity", 
	//	 "Halstead Volume", "Halstead Potential", "Program Level", "MI"]
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
	},
	restrictedDepthFilter: function(metrics) {
		var depth = 0;
		for (var index in metrics) {
			 if (metrics.hasOwnProperty(index)) {
				 if (index === "0") { continue; }
				 depth += metrics[index][7];
			 }
		}
		var bgColor = "green", feedback = "Complexity looks not too complex :)";
		if (depth >= 3) { 
			bgColor = "red";
			feedback = "Your algorithm looks quite complex, perhaps O(N<sup>3</sup>)";
		} else if (depth > 1) {
			bgColor = "orange";
			feedback = "Pretty good, perhaps O(N<sup>2</sup>) or O(NlogN)";
		}
		return '<div style="color:' + bgColor + '">' + feedback + '</div>';
	}
};
function handleMessage(msg) {
	data = JSON.parse(msg.data);
	jQuery("#" + data.type + "iframe").remove();
	if (data.type === 'jsmeter') {
		jQuery("#jsassess-" + data.type).html("<h3>Complexity metrics</h3>" + exerciseOptions.jsmeter(data.results));		
	} else if (data.type === 'jslint'){
		jQuery("#jsassess-" + data.type).html("<h3>Programming and style errors</h3>" + data.results);
	} else if (data.type === 'test') {
		jQuery("#jsassess-" + data.type).html("<h3>Functionality</h3>" + data.results);
	}
}
function run(type, exerciseOptions) {
	var jsrunframe = document.createElement("iframe");
	jsrunframe.id = type + "iframe";
	jsrunframe.src = exerciseOptions.commonspath + type + ".html?code=" + encodeURIComponent(editAreaLoader.getValue("jsassess-editor")) +
		"&options=" + encodeURIComponent(JSON.stringify(exerciseOptions[type]));
	jQuery("#jsassess-iframes").append(jsrunframe);
}
function runTests(testFile, exerciseOptions) {
	var jsrunframe = document.createElement("iframe");
	jsrunframe.id = "testiframe";
	jsrunframe.src = "./" + testFile + "?code=" + encodeURIComponent(editAreaLoader.getValue("jsassess-editor"));
	jQuery("#jsassess-iframes").append(jsrunframe);
}
jQuery().ready(function() {
	var elem, elemId, feedbackIds = ["jslint", "test", "jsmeter"];
	for (var i=0; i<feedbackIds.length; i++) {
		elemId = "jsassess-" + feedbackIds[i];
		if (!jQuery("#" + elemId).length) {
			elem = document.createElement("div");
			elem.id = elemId;
			jQuery("#jsassess-feedback").append(elem);
		}
	}
	if (!jQuery("#jsassess-iframes").length) {
		elem = document.createElement("div");
		elem.id = "jsassess-iframes";
		jQuery("body").append(elem);
	}
	editAreaLoader.init({
		id : "jsassess-editor",		// textarea id
		syntax: "js",			// syntax to be uses for highgliting
		start_highlight: true		// to display with highlight mode on start-up
	});
	jQuery("#submitButton").click(function(event) {
		event.preventDefault();
		event.stopPropagation();
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
});
if (window.addEventListener) {
	window.addEventListener( "message", handleMessage, false);
}