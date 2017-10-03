/**
The Help Text Viewer provides the possibility to enhance your forms by adding help buttons.
These buttons display a help message when clicked or hovered. 

Optionally, the buttons can be hidden by default, with a global switch (the Help Text Trigger) to show or hide them. 
*/
dojo.provide("HelpTextPlus.widget.HelpText");

mendix.dom.insertCss(mx.moduleUrl("HelpTextPlus", "widget/styles/HelpText.css"));

mendix.widget.declare('HelpTextPlus.widget.HelpText', {
	addons       : [],
	
	inputargs: {
		text : '',
		startvisible : false,
		showonhover : true,
		width : 300,
		height : 300
	},
	
	//IMPLEMENTATION
	domNode: null,
	topic : "CustomWidget/HelpTextPlus",
	imgNode : null,
	handle : null,
	helpNode : null,
	helpvisible: false,
	
  postCreate : function(){
		logger.debug(this.id + ".postCreate");

		//img node
		this.imgNode = mendix.dom.div({
			'class' : 'HelpTextButton'
		});
		this.domNode.appendChild(this.imgNode);
		this.connect(this.imgNode, 'onclick', this.toggleHelp);
		if (this.showonhover) {
			this.connect(this.imgNode, 'onmouseenter', dojo.hitch(this, this.showHelp, true));
			this.connect(this.imgNode, 'onmouseleave', dojo.hitch(this, this.showHelp, false));
		}
		
		//help node
		this.createHelp();
		
		this.stateChange(this.startvisible);
		this.handle = dojo.subscribe(this.topic, this, this.stateChange);
		
		this.actRendered();
	},

	stateChange : function(newstate) {
		if (newstate)
			dojo.style(this.imgNode, "display", "block")
		else if (!this.startvisible) {
			this.helpvisible = false;
			dojo.style(this.imgNode, "display", "none");
			this.showHelp(false);
		}
	},
	
	createHelp : function () {
		this.helpNode = mendix.dom.div({'class' : 'HelpTextBox'});
		dojo.html.set(this.helpNode, this.text);
		dojo.style(this.helpNode, {
			'width' : this.width + 'px',
			'maxHeight' : this.height + 'px'
		});
		this.connect(this.helpNode, 'onclick', this.toggleHelp);
		document.body.appendChild(this.helpNode);
	},

	toggleHelp : function() {
		this.helpvisible = !this.helpvisible;
		this.showHelp(this.helpvisible);
	},
	
	showHelp : function(show) {
		if (show || this.helpvisible) {
			var coords = dojo.coords(this.imgNode, true);
			dojo.style(this.helpNode, {
				'display' : 'block',
				'top' : coords.y + 30,
				'left': window.innerWidth < coords.x + 30 + this.width ? coords.x - this.height - 30 : coords.x + 30
			}); 
		}
		else
			dojo.style(this.helpNode, 'display', 'none');
	},
	
	suspended : function() {
		this.showHelp(false);
	},
	
	uninitialize : function() {
		document.body.removeChild(this.helpNode);
		dojo.unsubscribe(this.handle);
		logger.debug(this.id + ".uninitialize");
	}
});