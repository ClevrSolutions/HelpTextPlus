/**
The Help Text Viewer provides the possibility to enhance your forms by adding help buttons.
These buttons display a help message when clicked or hovered. 

Optionally, the buttons can be hidden by default, with a global switch (the Help Text Trigger) to show or hide them. 
*/
define([
	"dojo/_base/declare",
	"mxui/widget/_WidgetBase",
	"mxui/dom",
	"dojo/_base/lang",
	"dojo/dom-style",
	"dojo/html",
	"dojo/dom-class",
	"dojo/dom-geometry",
	"dojo/_base/fx",
	"dojo/topic"
], function (declare, _WidgetBase, mxuiDom, lang, domStyle, html, domClass, domGeom, fx, topic) {
	return declare("HelpTextPlus.widget.HelpTextRow", [ _WidgetBase ], {
		text : '',
		startvisible : false,
		height : 300,
		hideonclick : false,
	
	//IMPLEMENTATION
	domNode: null,
	topic : "CustomWidget/HelpTextPlus",
	handle : null,
	rowNode : null,
	targetHeight : 0,
	anim : null,

	postCreate : function(){
		logger.debug(this.id + ".postCreate");

		domClass.add(this.domNode, 'HelpTextRow');
		this.createHelp();
		this.rowNode = this.findRowNode(this.domNode);
		domStyle.set(this.domNode, 'maxHeight', this.height + 'px');
		if (this.rowNode) {
			domStyle.set(this.rowNode, 'height', 'auto'); //follow the animation
		}
		setTimeout(lang.hitch(this, this.poststartup), 1);
	},
	
	poststartup : function() {
		var box = domGeom.getMarginBox(this.domNode);
		this.targetHeight = box.h; //find calculated height

		if (!this.startvisible) {
			domStyle.set(this.domNode, 'height', 0);
			domStyle.set(this.rowNode, 'display','none');
		}
			
		this.stateChange(this.startvisible);
		this.handle = topic.subscribe(this.topic, this, this.stateChange);
			
	},
	
	findRowNode : function(parent) {
        if (tag) {
			var tag = parent.tagName.toLowerCase();
			if (tag == 'tr' || tag == 'th')
				return parent;
			else if (parent.parentNode != null)
				return this.findRowNode(parent.parentNode);
			throw new Exception(this.id + " Did not found a parent row to show or hide");
		}
	},

	updateHeight : function(height) {
		if (this.anim != null)
			this.anim.stop();
		this.anim = fx.animateProperty({
			node : this.domNode,
			duration : 500,
			properties : { height : height },
			onEnd : lang.hitch(this, function() {
				if (height == 0)
				domStyle.set(this.rowNode, 'display', 'none');
			})
		});
		this.anim.play();
	},

	stateChange : function(newstate) {
		if (newstate) {
			domStyle.set(this.rowNode, 'display','table-row');		
			this.updateHeight(this.targetHeight);
		}
		else if (!this.startvisible) {
			this.updateHeight(0);
		}
	},
	
	createHelp : function () {
		html.set(this.domNode, this.text);
		if (this.hideonclick == true)
			this.connect(this.domNode, 'onclick', this.hideHelp);
	},

	hideHelp : function() {
		this.startvisible = false;
		this.stateChange(false);
	},
	
	uninitialize : function() {
		this.handle.remove();
	}
		});
	});

require([ "HelpTextPlus/widget/HelpTextRow" ]);
