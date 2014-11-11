//Contains all information for a lpf file
// Replaces LPFEncoder.js
// LPIv2.0
function Plate(form) {
    //The LPF file
    var LPF;

    //Call parsePlate when the object is initialized
    parseInputs(this,form);
    //Parses the entirity of the webform data into a plate object
    //Returns a plate object
    function parseInputs(plate,form) {
        plate.rows = form.find("#rows").val();
        plate.cols = form.find("#columns").val();
        plate.channelNum=form.find("#LEDnum").val();
        plate.totalTime = Math.floor(form.find("#length").val() * 60 * 1000); // in ms
        plate.timeStep = form.find("#timestep").val() * 1000; // in ms
        plate.numPts = Math.floor(plate.totalTime/plate.timeStep + 1);
        plate.times = new Array(plate.numPts);
	for (i=0; i<plate.times.length; i++) {
	    plate.times[i] = plate.timeStep * i;
	}
        plate.randomized = form.find("#randomized").is(':checked');
        plate.offOnFinish = form.find("#offSwitch").is(':checked');
        //A list of all wellArrangements contained on this plate
        plate.wellArrangements=[];
        form.find(".wGroup").not(".template").each(function( index, wellArrangementForm) {
            plate.wellArrangements.push(new WellArrangement($(wellArrangementForm,plate.channelNum)));
            });
        //Check if total well number is sufficient, if it isn't throw error
        var numberOfWells=0;
        for (var i=0;i<plate.wellArrangements.length;i++) {
            numberOfWells+=plate.wellArrangements[i].getWellNumber();
        }
        if (plate.rows*plate.columns<numberOfWells) {
            console.log("ERROR TOO MANY WELLS");
        }
    }
    //Generates the correct LED values
    this.deviceLEDs = function() {
        var plateType = $("#devices").val();
        var LEDcolors = [];
        var LEDwaves = [];
	var LEDhex = [];
        if (plateType == "LTA") {
            //LEDcolors = ['rgba(196,0,0,', 'rgba(0,255,0,', 'rgba(0,0,255,', 'rgba(255,0,0,'];
	    LEDcolors = ['rgba(255,0,0,', 'rgba(0,201,86,', 'rgba(0,90,222,', 'rgba(99,0,0,'];
            LEDwaves = [650, 510, 475, 700];
	    LEDhex = ['#FF0000', '#00C956', '#005ADE', '#630000'];
        } else if (plateType == "LPA") {
            //LEDcolors = ['rgba(255,0,0,', 'rgba(0,255,0,'];
	    LEDcolors = ['rgba(255,0,0,', 'rgba(0,201,86,'];
            LEDwaves = [650, 510];
	    LEDhex = ['#FF0000', '#00C956'];
        } else if (plateType == "TCA") {
            //LEDcolors = ['rgba(255,0,0,', 'rgba(0,255,0,'];
	    LEDcolors = ['rgba(255,0,0,', 'rgba(0,201,86,'];
            LEDwaves = [650, 510];
	    LEDhex = ['#FF0000', '#00C956'];
	} else if (plateType == "OGS") {
            //LEDcolors = ['rgba(255,0,0,', 'rgba(0,255,0,'];
	    LEDcolors = ['rgba(255,0,0,', 'rgba(0,201,86,'];
            LEDwaves = [650, 510];
	    LEDhex = ['#FF0000', '#00C956'];
        } else if (plateType == "custom") {
            //var numLED = $("#LEDnum").val();
            //LEDcolors = ['rgba(255,0,0,', 'rgba(0,255,0,', 'rgba(0,0,255,', 'rgba(50,50,50,'];
	    LEDcolors = ['rgba(255,0,0,', 'rgba(0,201,86,', 'rgba(0,90,222,', 'rgba(99,0,0,'];
            LEDwaves = [650, 510, 475, 700]
	    LEDhex = ['#FF0000', '#00C956', '#005ADE', '#630000'];
            // Will make this actually function after refactering of "custom" LED code
        }
        return {colors: LEDcolors,
        	waves: LEDwaves,
		hex: LEDhex};
    }
    //Returns a n x c array of intensities where n is timepoints and c is channel num
    this.createTimecourse = function(wellNum) {
        var timeCourses = new Array(plate.channelNum);
        var wellsPassed = 0; // Holds the highest (total) numberof wells passed in earlier WA's
        for (var wa=0; wa<plate.wellArrangements.length; wa++) {
            var waWellNum = plate.wellArrangements[wa].getWellNumber();
            if (wellNum < wellsPassed + waWellNum) {
                // Desired well is in this WA
                for (var c=0; c<plate.channelNum; c++) {
                    timeCourses[c] = new Array(plate.numPts);
                    for (var ti=0; ti<plate.numPts; ti++) {
                        var tpInt = plate.wellArrangements[wa].getIntensity(wellNum,c,plate.times[ti]);
                        timeCourses[c][ti] = {x: plate.times[ti]/60/1000, y: tpInt}; // Format as obj/dict for canvasJS plotting.
                    }
                }
                return timeCourses;
            }
            else {
                // Desired well is in another WA. Note passed wells and skip to next WA.
                wellsPassed += waWellNum;
            }
        }
        // If function gets here, wellNum was not found!! (error)
        console.log("ERROR: invalid well given to createTimeCourse!");
        // probably want to have an error here, and check for valid wellNum at beginning
    }
    // Returns a w x c array of intensities where w is wellNumber and c is channel num
    // NOTE: The input is an **index** in plate.times (length: plate.numSteps)
    this.createPlateView = function(timeIndex) {
        var wellSnapshot = new Array(plate.rows);
	for (var r=0; r<plate.rows; r++) {
	    wellSnapshot[r] = new Array(plate.cols);
	    for (var c=0; c<plate.cols; c++) {
                wellSnapshot[r][c] = newArray(plate.channelNum);
                var wellNum = r*plate.cols+c;
                var wellsPassed = 0;
                for (var wa=0; wa<plate.wellArrangements.length; wa++) {
                    var waWellNum = plate.wellArrangements[wa].getWellNumber();
                    if (wellNum < wellsPassed + waWellNum) {
                        // Desired well is in this WA
                        for (var ch=0; ch<plate.channelNum; ch++) {
                            wellSnapshot[r][c][ch] = plate.wellArrangements[wa].getIntensity(wellNum,c,plate.times[timeIndex]);
                        }
                    }
                    else {
                        // Desired well i in another WA. Note passed wells and skip to next WA.
                        wellsPassed += waWellNum;
                    }
                }
	    }
	}
	return wellSnapshot;
    }
    //creates an LPFfile
    this.createLPF = function() {
        
    }
    //Multiple waveform groups that are spread over a set of well specifications
    function WellArrangement(form) {
        
        //Call Parse inputs when the object is initialized
        parseInputs(this,form);
        //Parses the entirity of the data in a waveform group section of the webpage
        //returns a wellArrangenment
        function parseInputs(wellArrangement,form) {
            wellArrangement.samples = parseInt(form.find("input.samples").val());
            wellArrangement.replicates = parseInt(form.find("input.replicates").val());
            wellArrangement.startTime = parseInt(form.find("input.startTime").val());
            wellArrangement.waveformInputs=[];
            form.find(".func").not(".template").each(function( index, waveform) {
                var newWaveform;
                waveform = $(waveform);
                if (waveform.hasClass("const")) {
                    newWaveform = new constInput(waveform);
                }else if (waveform.hasClass("step")) {
                    newWaveform = new stepInput(waveform);
                }else if (waveform.hasClass("sine")) {
                    newWaveform = new sineInput(waveform);
                }else if (waveform.hasClass("arb")) {
                    newWaveform = new arbInput(waveform);
                }
                wellArrangement.waveformInputs.push(newWaveform);
            });
            //Create waveform groups, crazy recursion is needed to create all permuatations of
            //input forms which could have multiple waveforms
            //Initialize first waveform group
            wellArrangement.waveformGroups=[new WaveformGroup()];
            //Call function, from first index in list of waveformInputs, and the initial waveform group
            waveformParsing(0,wellArrangement.waveformGroups[0]);
            function waveformParsing(inputIndex,waveformGroup) {
                //When you are at the end of the total waveform inputs
                 if (inputIndex>=wellArrangement.waveformInputs.length) {
                    return;
                 }
                //Loops through the group of waveforms generated by a single input
                var waveforms = wellArrangement.waveformInputs[inputIndex].generateWaveforms();
                for (waveformIndex=0; waveformIndex<waveforms.length;waveformIndex++) {
                    //If this isn't the first waveform generated from the single input duplicate the waveform group
                    if (waveformIndex!=0) {
                        waveformGroup=waveformGroup.copy();
                        wellArrangement.waveformGroups.push(waveformGroup)
                    }
                    //Join current waveform onto waveformGroup
                    waveformGroup.addWaveform(waveforms[waveformIndex],wellArrangement.waveformInputs[inputIndex].channel);    
                    waveformParsing(inputIndex+1,waveformGroup);
                }
            }
            //contains the inputs associated a constant input in the webform
            function constInput(form) {
                this.channel = parseInt(form.find("select[class=funcWavelength]")[0].selectedIndex);
                this.amplitudes = form.find("input.ints").val();
                this.amplitudes = JSON.parse("[" + this.amplitudes + "]");
                this.amplitudes = numeric.round(this.amplitudes); // Make sure all ints are whole numbers
                //Gives the number of different waveforms that this input will create
                this.getNumWaveforms = function(){
                    return amplitudes.length;
                }
                //returns a list of waveforms associated with this constant input
                this.generateWaveforms = function() {
                    var waveforms = [];
                    for (i=0;i<this.amplitudes.length;i++) {
                        waveforms.push(function(time){return this.amplitudes[i]}) // Should be this.amplitudes[i] ??
                    }
                    return waveforms;
                }
            }
            //contains the inputs associated a step input in the webform
            function stepInput(form) {
                this.channel = parseInt(form.find("select[class=funcWavelength]")[0].selectedIndex);
                this.amplitudes = form.find("input.amplitudes").val();
                this.amplitudes = JSON.parse("[" + this.amplitudes + "]");
                this.amplitudes = numeric.round(this.amplitudes); // Make sure all amps are whole numbers
                this.offset = parseInt(form.find("input.offset").val()); // GS
                this.stepTime = Math.floor(parseFloat(form.find("input.stepTime").val()) * 60 * 1000); // ms
                //Check if step doesn't exceed max or go lower than 0
                if (this.offset>4095||this.offset<0) {
                    console.log("ERROR step function exceeds bounds");
                }
                for (i=0;i<this.amplitudes.length;i++) {
                    if (this.offset+this.amplitudes[i]>4095||this.offset+this.amplitudes[i]<0) {
                        console.log("ERROR step function exceeds bounds");
                    }
                }
                //Gives the number of different waveforms that this input will create
                this.getNumWaveforms = function(){
                    return amplitudes.length;
                }
                //returns a list of waveforms associated with this input
                this.generateWaveforms = function() {
                    var waveforms = [];
                    for (i=0;i<this.amplitudes.length;i++) {
                        waveforms.push(function(time){
                            if (time<this.stepTime) {
                                return this.offset;
                            } else {
                                return this.offset+this.amplitudes[i]
                            }
                            })
                    }
                    return waveforms;
                }
            }
            //contains the inputs associated a sine input in the webform
            function sineInput(form) {
                this.channel = parseInt(form.find("select[class=funcWavelength]")[0].selectedIndex);
                this.amplitude = parseInt(form.find("input.amplitude").val()); // GS
                this.period = parseFloat(form.find("input.period").val()) * 60 * 1000; // ms
                this.phase = parseFloat(form.find("input.phase").val()) * 60 * 1000; // ms
                this.offset = parseInt(form.find("input.offset").val()); // GS
                //Check if offset+amplitude doesn't exceed bounds
                if (this.offset+Math.abs(this.amplitude)>4095||this.offset-Math.abs(this.amplitude)<0) {
                    console.log("ERROR sine  function exceeds bounds");
                }
                //returns the waveform associated with this input
                this.generateWaveforms = function() {
                    return [function(time){this.amplitude*Math.sin(2*Math.PI*time+this.phase)+this.offset}];
                }
            }
            //TODO
            //contains the inputs associated a arb input in the webform
            function arbInput (form) {
                this.channel = parseInt(form.find("select[class=funcWavelength]")[0].selectedIndex);
                //returns the waveform associated with this input
                this.generateWaveforms = function() {
                    
                    return [function(time){}];
                }
            }
        }
        //Gets the intensity of an internal well number, and a channel at a given time
        this.getIntensity = function(wellNum,channel,time) {
            // This is where time-shifting occurrs. Returns intensity (GS; int).
            var sampleNum = wellArrangement.samples;
            var repNum = wellArrangement.replicates;
            // Use wellNum to determine which wfg to ask intensity at particular time.
            var wfg_i = Math.floor(wellNum / (repNum * sampleNum)); // well func group index
            var r_i = Math.floor((wellNum - wfg_i*sampleNum*repNum)/sampleNum);
            var time_i = wellNum - wfg_i*sampleNum*repNum - r_i*sampleNum;
            
            // Determine how much time should be shifted based on the wellNum (in ms)
            var shiftedTime = time - (plate.totalTime - wellArrangement.times[time_i]);
            var gsI = wellArrangement.waveformGroups[wfg_i].getIntensity(channel, shiftedTime);
            
            return gsI;
        }
        //returns the total number of wells in this wellArrangement
        this.getWellNumber = function() {
            return wellArrangement.samples*wellArrangement.replicates*wellArrangement.waveformGroups.length;
        }
        //a grouping of waveform objects
        function WaveformGroup() {
            //An array of the waveforms contained in this group, where the index is the channel number.
            this.waveforms = [];
            //Gets the intensity of a channel at a given time
            //If waveform is undifined return zero
            this.getIntensity = function(channel,time) {
                if (typeof this.waveforms[channel] == 'undefined') {
                    return 0;
                }
                return waveforms[channel](time);
            }
            //adds a waveform to a given channel
            //Throws error if attempting to overwrite an existing waveform
            this.addWaveform = function(waveform,channel) {
                //If channel entry isn't empty throw error
                if (typeof this.waveforms[channel] !== 'undefined') {
                    console.log("ERROR, multiple waveforms in same channel!");
                }
                this.waveforms[channel]=waveform;
            }
            this.copy = function(){
                var newWaveformGroup = new WaveformGroup();
                newWaveformGroup.waveforms = this.waveforms.slice();
                return newWaveformGroup;
            }
        }
    }
}