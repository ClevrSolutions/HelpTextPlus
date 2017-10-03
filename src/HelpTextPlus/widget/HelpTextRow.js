/**
The Help Text Viewer provides the possibility to enhance your forms by adding help buttons.
These buttons display a help message when clicked or hovered. 

Optionally, the buttons can be hidden by default, with a global switch (the Help Text Trigger) to show or hide them. 
*/
dojo.provide("HelpTextPlus.widget.HelpTextRow");

mendix.dom.insertCss(mx.moduleUrl("HelpTextPlus", "widget/styles/HelpText.css"));

mendix.widget.declare('HelpTextPlus.widget.HelpTextRow', {
	addons       : [],
	
	inputargs: {
		text : '',
		startvisible : false,
		height : 300,
		hideonclick : false
	},
	
	//IMPLEMENTATION
	domNode: null,
	topic : "CustomWidget/HelpTextPlus",
	handle : null,
	rowNode : null,
	targetHeight : 0,
	anim : null,
	
	postCreate : function(){
		logger.debug(this.id + ".postCreate");

		dojo.addClass(this.domNode, 'HelpTextRow');
		this.createHelp();
		this.rowNode = this.findRowNode(this.domNode);
		dojo.style(this.domNode, 'maxHeight', this.height + 'px');
		dojo.style(this.rowNode, 'height', 'auto'); //follow the animation
		this.actRendered();
		setTimeout(dojo.hitch(this, this.poststartup), 1);
	},
	
	poststartup : function() {
		var box = dojo.marginBox(this.domNode);
		this.targetHeight = box.h; //find calculated height

		if (!this.startvisible) {
			dojo.style(this.domNode, 'height', 0);
			dojo.style(this.rowNode, 'display','none');
		}
			
		this.stateChange(this.startvisible);
		this.handle = dojo.subscribe(this.topic, this, this.stateChange);
			
	},
	
	findRowNode : function(parent) {
		var tag = parent.tagName.toLowerCase();
		if (tag == 'tr' || tag == 'th')
			return parent;
		else if (parent.parentNode != null)
			return this.findRowNode(parent.parentNode);
		throw new Exception(this.id + " Did not found a parent row to show or hide");
	},

	updateHeight : function(height) {
		if (this.anim != null)
			this.anim.stop();
		this.anim = dojo.animateProperty({
			node : this.domNode,
			duration : 500,
			properties : { height : height },
			onEnd : dojo.hitch(this, function() {
				if (height == 0)
					dojo.style(this.rowNode, 'display', 'none');
			})
		});
		this.anim.play();
	},

	stateChange : function(newstate) {
		if (newstate) {
			dojo.style(this.rowNode, 'display','table-row');		
			this.updateHeight(this.targetHeight);
		}
		else if (!this.startvisible) {
			this.updateHeight(0);
		}
	},
	
	createHelp : function () {
		dojo.html.set(this.domNode, this.text);
		if (this.hideonclick == true)
			this.connect(this.domNode, 'onclick', this.hideHelp);
	},

	hideHelp : function() {
		this.startvisible = false;
		this.stateChange(false);
	},
	
	uninitialize : function() {
		dojo.unsubscribe(this.handle);
	}
});