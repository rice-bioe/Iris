import webapp2

form = '''
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8" />
        <title></title>
        <link rel="stylesheet" href="/css/StyleSheet.css">
    </head>
    <body>
        <form action="/form" method="post" id="LPFform">
            <fieldset>
                <legend>Light Device Specifications</legend>
                <ol id="LDSpecs">
                    <li><label for="rows">Number of rows</label><input id="rows" type="number" name="Number of Rows" value="8" min ="1" max="12" /></li>
                    <li><label for="columns">Number of columns</label><input id="columns" type="number" name="Number of Columns" value="12"min="1" max="12" /></li>
                    <li><label for="LEDnum">Number of LEDs</label><input id="LEDnum" type ="number" name="LEDnum" value="1" min="1" max="4" /></li>
                    <li>
                        <fieldset>
                            <legend>LED Specifications</legend>
                            <ol id="LEDs">
                                <li class="template">
                                    <label class="wavelength">Wavelength</label> <input class="wavelength" type="number" name="LEDs" value="0" min="0"/>        
                                    <label class="color">Display Color</label><input class="color" name="color" type="color" value="#FFFFFF">
                                </li>
                            </ol>
                        </fieldset>
                    </li>
                </ol>
            </fieldset>
            <fieldset>
                <legend>Light Program Specifications</legend>
                <ol id="LPSpecs">
                    <li>
                        <fieldset>
                            <legend>General Light Program Specifications</legend>
                            <ol id="LPSpecsGen">
                                <li><label for="length">Length of run (minutes)</label><input id="length" type="number" name="length" min="0"/></li>
                                <li><label for="timestep">Timestep of run (seconds)</label><input id="timestep" type ="number" name="timestep" min="0" step="0.01"/></li>
                                <li><label for="randomized">Randomize the positions</label><input id="randomized" type="checkbox" name="randomized" value="randomized"/></li>
                                <li><input id="constButt" type="button" value="Add Constant Function"/></li>
                                <li><input id="stepButt" type="button" value="Add Step Function"/></li>
                                <li><input id="sineButt" type="button" value="Add Sine Wave Function"/></li>
                            </ol>
                        </fieldset>
                    </li>
                    <li>
                        <fieldset>
                            <legend>Light Program Functions</legend>
                            <ol id="LPFuncs">
                                <li class="func const template">
                                    <fieldset>
                                        <legend>Constant Input Function</legend>
                                        <ol>
                                            <li><label class="start">Starting position</label><input class="start" type="number" value="1" min="1"/></li>
                                            <li>
                                                <fieldset class="radio">
                                                    <legend>Orientation</legend>
                                                    <ol>
                                                        <li><input class="RC" type="radio" checked="checked"/><label class="RC">Rows then Columns</label></li>
                                                        <li><input class="CR" type="radio"/><label class="CR">Column then Rows</label></li>
                                                    </ol>
                                                </fieldset>
                                            </li>
                                            <li><label class="replicates"># of Replicates</label><input class="replicates" type="number" value="1" min="1"/></li>
                                            <li><label class="LEDFuncNum">For LED #</label><input class="LEDFuncNum" type="number" value="1" min="1" /></li>
                                            <li><label class="ints">Comma seperated list of intensities</label><input class="ints" type="text" placeholder="0,50,100,4095"/></li>
                                            <li><input class="close" type ="button" value="Close"/></li>
                                        </ol>
                                    </fieldset>
                                </li>
                                <li class="func step template">
                                    <fieldset>
                                        <legend>Step Input Function</legend>
                                        <ol>
                                            <li><label class="start">Starting position</label><input class="start" type="number" value="1" min="1"/></li>
                                            <li>
                                                <fieldset class="radio">
                                                    <legend>Orientation</legend>
                                                    <ol>
                                                        <li><input class="RC" type="radio" checked="checked"/><label class="RC">Rows then Columns</label></li>
                                                        <li><input class="CR" type="radio"/><label class="CR">Column then Rows</label></li>
                                                    </ol>
                                                </fieldset>
                                            </li>
                                            <li><label class="replicates"># of Replicates</label><input class="replicates" value="1" min="1"/></li>
                                            <li><label class="LEDFuncNum">For LED #</label><input class="LEDFuncNum" value="1" min="1" /></li>
                                            <li><label class="amplitude">Amplitude of Step</label><input class="amplitude" value="4095" min="0" /></li>
                                            <li><label class="stepTime">Time into run at which step occurs</label><input class="stepTime" type="number" value="0" min="0" /></li>
                                            <li><label class="samples"># of evenly spaced samples to take</label><input class="samples" type="number" value="1" min="1" /></li>
                                            <li>
                                                <fieldset class="radio">
                                                    <legend>Sign</legend>
                                                    <ol>
                                                        <li><input class="stepUp" type="radio" checked="checked"/><label class="stepUp">Step Up</label></label></li>
                                                        <li><input class="stepDown" type="radio" /><label class="stepDown">Step Down</label></li>
                                                    </ol>
                                                </fieldset>
                                            </li>
                                            <li><input class="close" type ="button" value="Close"/></li>
                                        </ol>
                                    </fieldset>
                                </li>
                                <li class="func sine template">
                                    <fieldset>
                                        <legend>Sine Wave Input Function</legend>
                                        <ol>
                                            <li><label class="start">Starting position</label><input class="start" type="number" value="1" min="1"/></li>
                                            <li>
                                                <fieldset class="radio">
                                                    <legend>Orientation</legend>
                                                    <ol>
                                                        <li><input class="RC" type="radio"checked="checked"/><label class="RC">Rows then Columns</label></li>
                                                        <li><input class="CR" type="radio"/><label class="CR">Column then Rows</label></li>
                                                    </ol>
                                                </fieldset>
                                            </li>
                                            <li><label class="replicates"># of Replicates</label><input class="replicates" type="number" value="1" min="1"/></li>
                                            <li><label class="LEDFuncNum">For LED #</label><input class="LEDFuncNum" type="number" value="1" min="1" /></li>
                                            <li><label class="samples"># of evenly spaced samples to take</label><input class="samples" type="number" value="1" min="1" /></li>
                                            <li><label class="amplitude">Amplitude of Wave</label><input class="amplitude" type="number" value="2047" min="0" /></li>
                                            <li><label class="period">Period of Wave (minutes)</label><input class="period" type="number" value="0" min="0" /></li>
                                            <li><label class="phase">Phase of Wave (minutes)</label><input class="phase" type="number" value="0" min="0" /></li>
                                            <li><label class="offset">Verticle offset of Wave</label><input class="offset" type="number" value="2047" min="0" /></li>
                                            <li><input class="close" type ="button" value="Close"/></li>
                                        </ol>
                                    </fieldset>
                                </li>
                            </ol>
                        </fieldset>
                    </li>
                </ol>
            </fieldset>
            <fieldset>
		        <button type=submit>Submit</button>
	        </fieldset>
        </form>
        <script src="http://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js"></script>
        <script src="/js/form.js"></script>
    </body>
</html>
'''

class MainPage(webapp2.RequestHandler):
	def get(self):
		self.response.headers['Content-Type'] = 'text/html'
		self.response.write(form)

class FormHandler(webapp2.RequestHandler):
	def post(self):
		self.response.headers['Content-Type'] = 'text/plain'
		#rows = self.request.get("Number of Rows")
		self.response.write(self.request)

application = webapp2.WSGIApplication([
    ('/', MainPage),
	('/form', FormHandler)
], debug=True)