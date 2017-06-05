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
