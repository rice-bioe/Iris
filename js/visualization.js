var firstSeed = 0;
//Toggle between types of visualization
$("#view").click(function () {
    var button = $("#view");
    if (button.val() == "Plate View") {
        $(".plate").show();
        $(".well").hide();
        drawPlate();
        button.val("Well View");
    }
    else if (button.val() == "Well View") {
        $(".plate").hide();
        $(".well").show();
        button.val("Plate View");
        createChart();
    }
    console.log(button.val());
});

//Plate View global variables
var interval = 50 //miliseconds, refresh rate of animation
var speed = $("#speed").val();
var time=0;
var canvas = document.getElementsByTagName('canvas');
var context = canvas[0].getContext('2d');
context.globalCompositeOperation = 'lighter';
var xNum;
var yNum;
var spacing;
updateVars();

var intensityMatrix; //stores current intensity values for wells

function blankMatrix(xNum, yNum) {
	var matrix = [];
	for(var i=0; i<xNum; i++) {
		matrix[i] = [];
		for(var j=0; j<yNum; j++) {matrix[i][j] = 1;}
	}
	return matrix;
}

function canvasUpdate() {
    var canvas = document.querySelector('canvas');
    canvas.style.width='100%';
    canvas.style.height='100%';
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    spacing = Math.min(Math.floor((context.canvas.width-10)/xNum)
        ,Math.floor((context.canvas.height-10)/yNum));
}

function updateVars() {
    xNum=$("#columns").val();
    yNum=$("#rows").val();
	canvasUpdate();
}

function get_elapsed_time_string(time) {
    function pretty_time_string(num) {
        return ( num < 10 ? "0" : "" ) + num;
    }
    total_seconds=time/1000;
    var hours = Math.floor(total_seconds / 3600);
    total_seconds = total_seconds % 3600;

    var minutes = Math.floor(total_seconds / 60);
    total_seconds = total_seconds % 60;

    var seconds = Math.floor(total_seconds);

    // Pad the minutes and seconds with leading zeros, if required
    hours = pretty_time_string(hours);
    minutes = pretty_time_string(minutes);
    seconds = pretty_time_string(seconds);

    // Compose the string for display
    var currentTimeString = hours + ":" + minutes + ":" + seconds;

    return currentTimeString;
}

//Draws the wells. seed takes the values of true or false; true if initial well intensity
// values are needed, false when no new initial intensity values are needed
// NOTE: The seed parameter will be deprecated once actual light function data is used
// 		 instead of randomly generated well intensity data. 
function drawPlate(seed){ 
    if (seed) {intensityMatrix = blankMatrix(xNum, yNum)}
    for (var x = 0; x < xNum; x++) {
        for (var y = 0; y < yNum; y++) {
            if (seed) {
	            var red = Math.floor(Math.random() * 255);
    	        var green = Math.floor(Math.random() * 255);
    	        intensityMatrix[x][y] = 'rgba(' + red + ',' + green + ',0,1)';
            }
	        var linewidth = 3;
			context.beginPath();
			context.fillStyle = intensityMatrix[x][y];
		    context.arc(x * spacing+spacing*0.5+linewidth*2, y*spacing+spacing*0.5+linewidth*2, spacing*0.5, 0, 2*Math.PI, false);
		    context.fill();
			context.lineWidth = linewidth;
			context.strokeStyle = '#000000';
			context.stroke();
			context.closePath();
        }
    }
}

//Redraws simulated wells. reValue takes the form of true or false; 
//true when well number changes, false when well number stays constant
function redrawPlate(reValue) {
	canvasUpdate();
	drawPlate(reValue);
}

function timestep() {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    updateVars();
    drawPlate(false);
    updateTime();
}

function updateTime() {
    $("#time").val(time/($("#length").val()*60*1000));
    $("#displayTime").text(get_elapsed_time_string(time))
    time=time+interval*speed;
    if(time>($("#length").val()*60*1000)) {
        clearInterval(intervalFunc);
        $("#play").val("Play");
    }
}

function playWellSim() {
    if(time>($("#length").val()*60*1000)) {
        time=0;
        $("#time").val(time);
    }
    intervalFunc = setInterval(timestep, interval);
}

function pauseWellSim() {
    clearInterval(intervalFunc);    
}

//Toggle between playing and pausing the well simulation
$("#play").click(function () {
    var button = $("#play");
    if (button.val() == "Play") {
        playWellSim();
        button.val("Pause");
    }
    else if (button.val() == "Pause") {
        pauseWellSim();
        button.val("Play");
    }
});

$("#time").change(function() {
   time=$("#time").val()*($("#length").val()*60*1000);
   updateTime();
   drawPlate(false); 
});

//Called when a well is clicked on
$("#canvas").click(function(e){
   var parentOffset = $(this).offset();
   var relX = e.pageX - parentOffset.left;
   var relY = e.pageY - parentOffset.top;
   var col=Math.min(Math.ceil(relX/spacing),xNum);
   var row=Math.min(Math.ceil(relY/spacing),yNum);
   $("#WellRow").val(row);
   $("#WellCol").val(col);
});

//Recreates the chart, probably not efficient, but allows it to scale size correctly
function createChart() {
    chart = new CanvasJS.Chart("wellSim",
		{
		    title: {
		        text: "Time Course for Well 1, 1",
		        fontSize: 24,
		    },
            zoomEnabled: true, 
		    axisX: {
		        valueFormatString: "DD/MMM"
		    },
		    toolTip: {
		        shared: true
		    },
		    legend: {
                cursor: "pointer",
                itemclick: function (e) {
                    //console.log("legend click: " + e.dataPointIndex);
                    //console.log(e);
                    if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
                        e.dataSeries.visible = false;
                    } else {
                        e.dataSeries.visible = true;
                    }

                    chart.render();
                }
		    },

		    data: [
			{
			    type: "line",
			    showInLegend: true,
			    lineThickness: 2,
			    name: "LED1",
			    markerType: "square",
			    color: "#F08080",
			    dataPoints: [
				{ x: new Date(2010, 0, 3), y: 650 },
				{ x: new Date(2010, 0, 5), y: 700 },
				{ x: new Date(2010, 0, 7), y: 710 },
				{ x: new Date(2010, 0, 9), y: 658 },
				{ x: new Date(2010, 0, 11), y: 734 },
				{ x: new Date(2010, 0, 13), y: 963 },
				{ x: new Date(2010, 0, 15), y: 847 },
				{ x: new Date(2010, 0, 17), y: 853 },
				{ x: new Date(2010, 0, 19), y: 869 },
				{ x: new Date(2010, 0, 21), y: 943 },
				{ x: new Date(2010, 0, 23), y: 970 }
				]
			},
			{
			    type: "line",
			    showInLegend: true,
			    name: "LED2",
			    color: "#20B2AA",
			    lineThickness: 2,

			    dataPoints: [
				{ x: new Date(2010, 0, 3), y: 510 },
				{ x: new Date(2010, 0, 5), y: 560 },
				{ x: new Date(2010, 0, 7), y: 540 },
				{ x: new Date(2010, 0, 9), y: 558 },
				{ x: new Date(2010, 0, 11), y: 544 },
				{ x: new Date(2010, 0, 13), y: 693 },
				{ x: new Date(2010, 0, 15), y: 657 },
				{ x: new Date(2010, 0, 17), y: 663 },
				{ x: new Date(2010, 0, 19), y: 639 },
				{ x: new Date(2010, 0, 21), y: 673 },
				{ x: new Date(2010, 0, 23), y: 660 }
				]
			}


			]
		});
		chart.render();
}
drawPlate(true);

//Redraws wells to fit the window after resizing
$(window).resize(function() {
	redrawPlate(false);
});