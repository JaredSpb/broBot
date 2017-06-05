# broBot

In-browser bot building framework.
broBot is module-based, so all the real job is done by your modules. Framework itself only organizes them, runs certain module actions at the certain time, handles timers, settings and data.

broBot does not provide any end-user interface. If you want user to change setting, observe internal data or manupulate bot behaviour in some way (other than manualy changing internaly stored data), consider creating independant code for that.

## Quick start

1. Download broBot using git:
```
git clone https://github.com/JaredSpb/broBot.git
```
2. Copy 'dummy' dir to your project.
3. Edit 00-header.js file to match your needs.
4. Create your modules using 'dummy' file as a template.
5. Build the bot with 'build.pl' perl script, or manualy. Build process is just a plain concatenation of *.js files in obvious order.
6. Add the bot to your browser:
  * For Firefox: install Greasmonkey extension and just open bot file in browser (File-Open or ctrl-O). NB: file MUST have .user.js extension.
  * For Chrome: install Tampermonkey extension, enable it, move to Settings->Extensions->Tampermonkey->Options. Click the 'Add Script' button and copy-paste bot file contents into edit window.
   

## Developing the bot

### Collections

Collections are sets of data controling what is about to happen. They are stored using browser localStorage. broBot supplies 3 of these: 
* settings - used to store bot settings. By default only 'enabled' setting is created. It obviously turns the bot on or off. Modules are supposed to create and maintain their own settings.
* data - modules can store their state or what ever here. 
* timers - used by broBot to define when to start the next loop if none of the modules were activated (see below). Stores UNIX timespamps as JS ```(new Date()).getTime()``` supplies them.

### The loop

broBot starts after page load. First of all it runs modules 'init' method, just to ensure that all initialization was performed, since some modules could be added or changed.

Then broBot checks if there's an active module and if it defines next action. If so this action is just executed.

If there's no active module broBot runs 'test' method for each module and looks at the value returned. First module returning 'true' is marked as active and its first action is launched.

If all the modules returned 'false' broBot walks through timers collection, searching the closest timer and shedules the next loop to the time found. If no timers set, everything stops.

### The actions sequence

Each module provides 'walker' property. It contains code doing all the real job. 'Walker' has 'sequence' array consisting of anonymous functions. Each function represents an action. By default every next action is launched by broBot after next page load regardless of URL or any other condition. Actions are launched as a method of broBot 'walker' object. Framework doesn't refresh the page or click any links after running an action. This means that action must do it to proceed to next loop. However action may call some 'walker' methods:
* .itterate() - increments internal counter and calls next action.
* .prev() - decrements internal counter and calls previous action.
* .clear() - marks current module as non-active. You should refresh the page to start next 'clean' loop.
* .set() - resets the counter, but doesnt run any actions. You may just refresh the page, or call itterate() to start current sequence over.

Module walker may provide the 'pre' property containing anonymous function. If this property is defined broBot will execute that function before current action. If true value is returned, action is beeing run. Otherwise broBot will skip current action and refresh the page. That starts the next loop and usualy leads to execution of 'pre' again and probably run next action. Pre is executed in the same 'walker' context as actions are and may use described above walker methods.


### Simple example

```javascript
broBot.modules.register('myModule', {
	// Used for debug
	// @optional
	name: 'myModule',
	
	// 'init' used for setting some default options.
	// All checks if old settings exist are performed here.
	//
	// @optional
	// @return true
	init: function(){
		if(typeof broBot.settings.myModuleEnabled == 'undefined')
		{
			broBot.settings.myModuleEnabled = 'true'
			broBot.settings.save();
   
			broBot.timers.myModuleTimer = 0;
			broBot.timers.save();
		}
		return true;
	},
	
	// Tests if this module's walker should be started.	
	//
	// @required
	test: function(){
		// run only on mondays
		if((new Date()).getDay() == 1){
			// Timer will be set by the action
			return broBot.timers.myModuleTimer < (new Date()).getTime();
		}
	},
	walker: {
		// @required
		action: 'myModule',
		
		// Called before every next sequence element. Can be used
		// as a showstopper before new action starts if something
		// not handled by module actions has changed from outside
		//
		// @optional
		pre: function(){
			return true;
		},
		
		// Sequence of actions to be run. Every next function is executed after page load,
		// which usualy means that links was followed, or page was refreshed
		sequence: Array(
			
			function(){ 
				// let's say target resource uses jQuery, so we will use it too

				// check if page has the data we need

				if( $('span.dataWeNeed').html().match(/right data/) ){

					// and move to the page with detailed info
					$('a.leadsToPageWeWantToGrab').click();

				} else {

					// no data yet. Set the timer to + 5 minutes and stop current sequence execution

					broBot.timers.myModuleTimer = (new Date()).getTime() + 5*60*1000
					broBot.timers.save()
					this.clean()
					window.location.reload()
				}

			}
			, function(){ 
				 // here we go, let's get our data
				var data = $('span.fullData').html();

				// we got it, now we'r gonna just forget about it and move on

				// but before that we need to set the timer
				broBot.timers.myModuleTimer = (new Date()).getTime() + 5*60*1000
				broBot.timers.save()

				// now let's go the index page to start the broBot loop
				window.location.assign('/')
			}
		),
			__proto__: broBot.walker
	}
	
})
```

### Real example

'example.user.js' file contains real bot. It walks through 'javascript' tagged questions from stackoverflow index page and counts links at those questions' bodies. This functionality is absolutely useless. But not the bot itself - use it as an example. 'example' contains this bot splitted in individual files. '10-broBot-module-countJSQuestionsLinks.js' - is the only module there.
