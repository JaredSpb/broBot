broBot.modules.register('dummy', {
	// Used for debug
	// 
	// @optional
	name: 'dummy',
	
	// 'init' used for setting some default options.
	// All checks if old settings exist are performed here.
	//
	// @optional
	// @return true
	init: function(){
		if(typeof broBot.settings.dummy == 'undefined')
		{
			//broBot.settings.dummy = 'dummy'
			//broBot.settings.save();
		}
		return true;
	},
	
	// Tests if this module's walker should be started.	
	//
	// @required
	test: function(){
		return false;
	},
	walker: {
		// Module/walker-action name. Used to store walker status
		//
		// @required
		action: 'dummy',
		
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
				alert(this.action +  ' working on stage' + this.stage + ' at func 0'); 
				window.setTimeout(function(){window.location.reload()},3000);
			}
			, function(){ 
				alert(this.action + ' working on stage' + this.stage + ' at func 1'); 
				window.setTimeout(function(){window.location.reload()},3000);
			}
			, function(){ 
				alert(this.action + ' working on stage' + this.stage + ' at func 2'); 
				window.setTimeout(function(){window.location.reload()},3000);
			}
		),
		__proto__: broBot.walker
	}
	
})
