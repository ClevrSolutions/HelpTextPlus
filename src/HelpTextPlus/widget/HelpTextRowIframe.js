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
	"dojo/dom-class",
	"dojo/dom-style",
	"dojo/dom-geometry",
	"dojo/html",
	"dojo/_base/fx",
	"dojo/topic"
], function (declare, _WidgetBase, mxuiDom, lang, domClass, domStyle, domGeom, html, fx, topic) {
	return declare("HelpTextPlus.widget.HelpTextRowIframe", [ _WidgetBase ], {
		startvisible : false,
		height : 300,
		hideonclick : false,
		entityURL: '',
		screenLocation : '',
	
	//IMPLEMENTATION
	domNode: null,
	topic : "CustomWidget/HelpTextPlus",
	handle : null,
	rowNode : null,
	targetHeight : 0,
	anim : null,
	server: '',
	version: '',
	article:'',
	helpObject: null,

	postCreate : function(){
		logger.debug(this.id + ".postCreate");

		domClass.add(this.domNode, 'HelpTextRowIframe');
		this.retrieveArticle();
		
		this.rowNode = this.findRowNode(this.domNode);
		domStyle.set(this.domNode, 'maxHeight', this.height + 'px');
		if (this.rowNode) {
		domStyle.set(this.rowNode, 'height', 'auto'); //follow the animation
		}
	},
	
	poststartup : function() {
		var box = domGeom.getMarginBox(this.domNode);
		console.log('box '+ box.h);
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
			duration : 800,
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
			domStyle.set(this.rowNode, 'display','');		//Should be table-row, but is not supported in IE7
			this.updateHeight(this.targetHeight);
		}
		else if (!this.startvisible) {
			this.updateHeight(0);
		}
	},
	
	retrieveArticle : function () {
  
		var xPathConstraint = "[ScreenLocation='" + this.screenLocation + "']"
		var xPath = "//"+ this.entityURL + xPathConstraint;
		 
		mx.data.get({
			xpath : xPath,
			filter : {amount : 1 },
			callback : lang.hitch(this, this.setArticle),
			error: lang.hitch(this, function(err) {console.log('ERROR');})
		});
		
		},
	
	
	setArticle : function (object) {
		
		this.helpObject = object[0];
		this.article = this.helpObject.get('Article');

		var guidArray = this.helpObject.getReferences('HelpText.HelpTextURL_Server');
		var firstguid = guidArray[0];
		
		mx.data.get({
			guid : firstguid,
			filter : {amount : 1 },
			callback : lang.hitch(this, this.setServer),
			error: lang.hitch(this, function(err) {console.log('ERROR');})
		});
		
	},
	
	setServer : function (ServerObject) {

		this.server = ServerObject.get('Path');
		
		var guidArray = this.helpObject.getReferences('HelpText.HelpTextURL_Version');
		var firstguid = guidArray[0];
		
		mx.data.get({
			guid : firstguid,
			filter : {amount : 1 },
			callback : lang.hitch(this, this.setVersion),
			error: lang.hitch(this, function(err) {
				console.log('ERROR');
			})
		});
	},
	
	setVersion : function (VersionObject) {
		this.version = VersionObject.get('Version');
		this.createIframe();	
	},
	
	createIframe: function() {
		
		var helpText='';
		
		if(this.server=='' || this.version=='' || this.article==''){
			helpText = '<html><body><br><p align=center><font color="red" size="5"> No documentation found</p><br></body></html>';	
		} else{
			var urlString = this.server + this.version +this.article;
			helpText = '<html><iframe frameborder="0" src ="'+urlString+'" width="100%" height="400"><p>Your browser does not support iframes.</p></iframe></html>';
		}

		html.set(this.domNode, helpText);
		if (this.hideonclick == true)
			this.connect(this.domNode, 'onclick', this.hideHelp);
			
		setTimeout(lang.hitch(this, this.poststartup), 1);
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

require([ "HelpTextPlus/widget/HelpTextRowIframe" ]);
