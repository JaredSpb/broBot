// ==UserScript==
// @name         Example BroBot 
// @namespace    http://example.com/brobot_namespace
// @version 0.1.1496577211
// @description  This example bot starts at stackoverflow.com main page, walks through 'javascript' tagged questions and counts links posted by authors. Restarts every 5 minutes.
// @author       Jared
// @include      https://stackoverflow.com/*
// ==/UserScript==



broBotLS = function(ls_prefix)
{
	this.ls_prefix = ls_prefix
	this.save = function()
	{
		if(!this.ls_prefix) throw('ls_prefix property undefined');
		for(var i in this)
		{
			if(typeof(this[i]) == 'function' || i == 'ls_prefix' || (this[i] instanceof Array) )
				continue;
			else
			{
				ls_name = this.ls_prefix + '.' + i;
				
				if(this[i] || this[i] === 0)
					localStorage.setItem(ls_name, this[i]);
				else
					localStorage.removeItem(ls_name);
			}
		}
	}
	this.load = function()
	{
		if(!this.ls_prefix) throw('ls_prefix property undefined');
		
		for(var i = 0; i<localStorage.length; i++)
		{
			if(String(localStorage.key(i)).indexOf(this.ls_prefix) == 0)
			{
				var ln = (String(localStorage.key(i)).split(/\./))[1];
				this[ln] = localStorage.getItem(localStorage.key(i));
				if(String(this[ln]).match(/^\d+$/)) this[ln] = Number(this[ln]);
			}
		}
	}
}

var broBot = {};

// Modules init
broBot.modules = {
	modules: {},
	modules_list:Array(),
	
	register: function(name,module){
		this.modules[name] = module;
		this.modules_list.push(module);
	},
	each: function(func){
		for (var i = 0; i < this.modules_list.length; i++)
		{
			if( ! func.call(this.modules_list[i]) ) {
				break;
			}
		}
	},
	get: function (name){return this.modules[name]}
};

// Timers
broBot.timers = {
	__proto__ : new broBotLS('broBotTimers')
};
broBot.timers.load();

// Walker
broBot.walker = {
	itterate : function()
	{
		if(!this.active) return false;

		this.stage++;

		this.save();
		
		if(this.sequence[this.stage])
		{

			try
			{
				if(!this.pre || (this.pre && this.pre()) )
				{
					this.sequence[this.stage].call(this);
				}
				else
                {
					window.location.reload();
                }
            }
			catch(e)
			{
				alert('Fatal error while running '+this.action+' at stage '+this.stage+': '+e);
				this.clear();
			}
		}
		else
		{
			this.clear()
		}

		return true;
	},
	prev : function()
	{
		this.stage -= 2;
		this.save();
		this.itterate();
	},
	set : function()
	{
		this.active = true;
		this.stage = -1;
		this.save();
	},
	clear : function(){
		this.active = false;
		var ew = {
			action: null,
			stage: null,
			__proto__ : new broBotLS('broBotWalker')
		}
		ew.save();
	},
	is_set : function()
	{
		if(this.action) return true;		
	},
	__proto__ : new broBotLS('broBotWalker')
}
broBot.walker.load();

// Exec
broBot.exec = function(){

	// getting closest timer
	// ------------------------------------------------------------------------------------------------------------------------
	
	if(String(window.location.href).match(/brobot_stop/)){
		broBot.settings.enabled = false;
		broBot.settings.save()
	}
	
	if(!broBot.settings.enabled)
	{
		return true;
	}

	// initializing modules
	broBot.modules.each(function(){
		if(this.init) this.init();
		return true;
	})	

	// running installed walker action
	var module = null
	if ( broBot.walker.action ) 
	{
		module = broBot.modules.get(broBot.walker.action);
		
		// Module could be removed while had a running walker. Clearing walker;
		if(module) module.walker.itterate();
		else module.walker.clear();
	}

	// setting new action (walker could finish his job and clear himself)
	if ( ! module || ! module.walker.active ) 
	{		
		broBot.modules.each(function(){
			var test_res = this.test()
			if(test_res)
			{
				this.walker.set();
				this.walker.itterate();
				return false;
			}
			return true;
		})
	}
	
	
	// New action was not set. Walking through timers to set page reload
	if ( ! module || ! module.walker.active ) 
	{
		var nt = null;
		
		// getting closest timer
		for (var i in broBot.timers)
		{
			if(typeof(broBot.timers[i]) != 'number')
				continue;
			
			if(broBot.timers[i] > $.now() && (nt === null || (broBot.timers[i] < nt)) )
				nt = broBot.timers[i]
		}
		

		// convert timer to "ms left"
		if (nt) {
			nt = nt - $.now();
			window.setTimeout(function(){
				broBot.exec()
			}, nt)
			
		}
	}
}
// Status
broBot.status = {
	current: {},
	init: function(){

	},
	__proto__ : new broBotLS('broBotStatus')
};
broBot.status.load();
window.addEventListener('load', function(){
	broBot.status.init();
}, false);


// Settings
broBot.settings = {
	set : function(name,value){
		this[name] = value
		this.save();
	},
	get : function(name){
		return this[name]
	},
	__proto__ : new broBotLS('broBotSettings')
};
broBot.settings.load();
if(typeof broBot.settings.enabled == 'undefined')
{
	var on = window.confirm("broBot script is beeing installed this resource. Turn it on?");

	broBot.settings.enabled = ( on ? 1 : 0 );
	broBot.settings.save();
}


// Data
broBot.data = {
	set : function(name,value){
		this[name] = value
		this.save();
	},
	get : function(name){
		return this[name]
	},
	__proto__ : new broBotLS('broBotData')
};
broBot.data.load();
broBot.modules.register('countJSQuestionsLinks', {
	// Used for debug
	// 
	// @optional
	name: 'countJSQuestionsLinks',

	// @optional
	// @return true
	init: function(){

		// Define 'lastCheckedID' data element to remember 
		if(typeof broBot.data.lastCheckedID == 'undefined')
		{
			broBot.data.lastCheckedID = 0;
			broBot.data.questionsTotal = 0;
			broBot.data.linksTotal = 0;
			broBot.data.linksPerQuestion = 0;
			broBot.data.save();

			broBot.timers.countJSQuestionsLinks = 0;
			broBot.timers.save();
		}
		return true;
	},
	
	// Tests if this module's walker should be started.	
	//
	// @required
	test: function(){

		// we will run only if time comes
		// we will set this timer later
		if( broBot.timers.countJSQuestionsLinks < (new Date()).getTime()  ){
			return true;
		}

		return false;
	},
	walker: {
		// Module/walker-action name. Used to store walker status
		//
		// @required
		action: 'countJSQuestionsLinks',
		
		// Called before every next sequence element. Can used as a showstopper
		// if situation changed from outside
		//
		// @optional
		// @return true if current sequence element can be called, false otherwise
		pre: function(){
			return true;
		},
		
		// Sequence of actual actions to be performed. Every next function is called after page refresh
		sequence: Array(
			
			function(){ 
				// stackoverflow uses jQuery so we can use it too

				// get questions list
				var questions_list = $('#question-mini-list').children();

				// walk through current questions, looking for 'javascript' tags
				// order is reversed coz new questions are placed top, while we need 
				// to start from 'old' ones

				var found = null;

				for (var i = questions_list.length - 1; i >= 0; i--) {

					var question_container = $(questions_list[i]);

					var qid = question_container.attr('id').replace(/[^0-9]/g,'');

					// this question has the javascript tag and its newer
					// than the last we already checked
					if(
						question_container.find('.tags').hasClass('t-javascript')
						&& Number(qid) > Number(broBot.data.lastCheckedID)
					){
						broBot.data.lastCheckedID = qid;
						broBot.data.save()

						found = true;

						// found the question we want to inspect, so we just go on
						window.location.assign(question_container.find('a.question-hyperlink').attr('href'));

						break;
					}
				}

				// no new question found, time to create and show report
				if(!found){

					var report = "";

					if(broBot.data.questionsTotal > 0){
						broBot.data.linksPerQuestion = Number(broBot.data.linksTotal) / Number(broBot.data.questionsTotal);

						report += "Questions total: " + broBot.data.questionsTotal + "\n";
						report += "Links total: " + broBot.data.linksTotal + "\n";
					} else {
						report = "No new questions found.\n";
					}

					report += "\nLinks per question overall: " + broBot.data.linksPerQuestion + "\n";

					report += "\nWill check for new questions in 5 minutes\n";

					alert(report);

					// now we want to stop this module's sequence to be run
					this.clear();

					// almost done; we need to set timer, otherwise
					// this module's sequence will be run again and again
					// on a list we already proceeded
					// waiting 5 minutes instead
					broBot.timers.countJSQuestionsLinks = (new Date()).getTime() + 5*60*1000;
					broBot.timers.save();

					// to allow broBot start the new test sequence we need to reload the page
					// this module test will return 'false' and broBot will wait for time set
					// above to come to call modules test functions again
					window.location.reload()

					// This module's test function does not always return true,
					// broRot is not halted when all the modules return 'false'
					// It looks at his 'timers' object instead and shedules next
					// itteration at the closest one.					
				}

			}
			, function(){ 
				// now we are at the individual question page, lest grab some info

				// increase the questions count, we will need it later
				broBot.data.questionsTotal++;

				// count question links amount
				broBot.data.linksTotal += $('.post-text').find('a').length;

				// save it
				broBot.data.save();
				
				// we'r done for this question, we just go to main page;
				// since this the last thing we gonna do, walker will 
				// start testing all the modules again to find one
				// which will be launched. So, after we'r back to main
				// page, module's test function will be run and the whole 
				// sequence will repeat while we have new questions

				window.location.assign("/");
			}
		),
		__proto__: broBot.walker
	}
	
})

window.addEventListener('load', 

	function(){
		broBot.exec();
	}
, false);