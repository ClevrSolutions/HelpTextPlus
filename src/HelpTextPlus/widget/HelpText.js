/**
The Help Text Viewer provides the possibility to enhance your forms by adding help buttons.
These buttons display a help message when clicked or hovered. 

Optionally, the buttons can be hidden by default, with a global switch (the Help Text Trigger) to show or hide them. 
*/
define([
	"dojo/_base/declare",
	"mxui/widget/_WidgetBase",
	"mxui/dom",
	"dojo/dom-geometry",
	"dojo/_base/lang",
	"dojo/dom-style",
	"dojo/topic",
	"dojo/html"
], function (declare, _WidgetBase, mxuiDom, domGeom, lang, domStyle, topic, html) {
	return declare("HelpTextPlus.widget.HelpText", [ _WidgetBase ], {
		text : '',
		startvisible : false,
		showonhover : true,
		width : 300,
		height : 300,
	
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
		this.imgNode = mxuiDom.create("div", {
			'class' : 'HelpTextButton'
		});
		this.domNode.appendChild(this.imgNode);
		this.connect(this.imgNode, 'onclick', this.toggleHelp);
		if (this.showonhover) {
			this.connect(this.imgNode, 'onmouseenter', lang.hitch(this, this.showHelp, true));
			this.connect(this.imgNode, 'onmouseleave', lang.hitch(this, this.showHelp, false));
		}
		
		//help node
		this.createHelp();
		
		this.stateChange(this.startvisible);
		this.handle = topic.subscribe(this.topic, this, this.stateChange);
	},

	stateChange : function(newstate) {
		if (newstate)
		domStyle.set(this.imgNode, "display", "block")
		else if (!this.startvisible) {
			this.helpvisible = false;
			domStyle.set(this.imgNode, "display", "none");
			this.showHelp(false);
		}
	},
	
	createHelp : function () {
		this.helpNode = mxuiDom.create("div", {'class' : 'HelpTextBox'});
		html.set(this.helpNode, this.text);
		domStyle.set(this.helpNode, {
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
			var coords = domGeom.position(this.imgNode, true);
			domStyle.set(this.helpNode, {
				'display' : 'block',
				'top' : coords.y + 30,
				'left': window.innerWidth < coords.x + 30 + this.width ? coords.x - this.height - 30 : coords.x + 30
			}); 
		}
		else
		domStyle.set(this.helpNode, 'display', 'none');
	},
	
	suspended : function() {
		this.showHelp(false);
	},
	
	uninitialize : function() {
		document.body.removeChild(this.helpNode);
		this.handle.remove();
		logger.debug(this.id + ".uninitialize");
	}
		});
	});

require([ "HelpTextPlus/widget/HelpText" ]);
