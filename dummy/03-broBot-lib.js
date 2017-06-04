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
