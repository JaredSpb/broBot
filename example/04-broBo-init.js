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