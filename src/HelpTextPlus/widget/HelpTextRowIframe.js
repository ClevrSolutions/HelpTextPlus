/**
The Help Text Viewer provides the possibility to enhance your forms by adding help buttons.
These buttons display a help message when clicked or hovered. 

Optionally, the buttons can be hidden by default, with a global switch (the Help Text Trigger) to show or hide them. 
*/
define([
		"dojo/_base/declare",
		"mxui/widget/_WidgetBase",
		"mxui/dom",
		"dojo/_base/kernel"
	], function (declare, _WidgetBase, mxuiDom, dojo) {
		return declare("HelpTextPlus.widget.HelpTextRowIframe", [ _WidgetBase ], {
	addons       : [],
	
	inputargs: {
		startvisible : false,
		height : 300,
		hideonclick : false,
		entityURL: '',
		screenLocation : ''
	},
	
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
	
	constructor : function() {
		mxuiDom.addCss("widgets/HelpTextPlus/widget/styles/HelpText.css");
	},

	postCreate : function(){
		logger.debug(this.id + ".postCreate");

		dojo.addClass(this.domNode, 'HelpTextRowIframe');
		this.retrieveArticle();
		
		this.rowNode = this.findRowNode(this.domNode);
		dojo.style(this.domNode, 'maxHeight', this.height + 'px');
		dojo.style(this.rowNode, 'height', 'auto'); //follow the animation
		this.actRendered();
	},
	
	poststartup : function() {
		var box = dojo.marginBox(this.domNode);
		console.log('box '+ box.h);
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
			duration : 800,
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
			dojo.style(this.rowNode, 'display','');		//Should be table-row, but is not supported in IE7
			this.updateHeight(this.targetHeight);
		}
		else if (!this.startvisible) {
			this.updateHeight(0);
		}
	},
	
	retrieveArticle : function () {
  
		var xPathConstraint = "[ScreenLocation='" + this.screenLocation + "']"
		var xPath = "//"+ this.entityURL + xPathConstraint;
		 
		mx.processor.get({
			xpath : xPath,
			filter : {limit : 1 },
			callback : dojo.hitch(this, this.setArticle),
			error: dojo.hitch(this, function(err) {console.log('ERROR');})
		});
		
		},
	
	
	setArticle : function (object) {
		
		this.helpObject = object[0];
		this.article = this.helpObject.getAttribute('Article');

		var guidArray = this.helpObject.getReferences('HelpText.HelpTextURL_Server');
		var firstguid = guidArray[0];
		
		mx.processor.get({
			guid : firstguid,
			filter : {limit : 1 },
			callback : dojo.hitch(this, this.setServer),
			error: dojo.hitch(this, function(err) {console.log('ERROR');})
		});
		
	},
	
	setServer : function (ServerObject) {

		this.server = ServerObject.getAttribute('Path');
		
		var guidArray = this.helpObject.getReferences('HelpText.HelpTextURL_Version');
		var firstguid = guidArray[0];
		
		mx.processor.get({
			guid : firstguid,
			filter : {limit : 1 },
			callback : dojo.hitch(this, this.setVersion),
			error: dojo.hitch(this, function(err) {
				console.log('ERROR');
			})
		});
	},
	
	setVersion : function (VersionObject) {
		this.version = VersionObject.getAttribute('Version');
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

		dojo.html.set(this.domNode, helpText);
		if (this.hideonclick == true)
			this.connect(this.domNode, 'onclick', this.hideHelp);
			
		setTimeout(dojo.hitch(this, this.poststartup), 1);
	},
	
	hideHelp : function() {
		this.startvisible = false;
		this.stateChange(false);
	},
	
	uninitialize : function() {
		dojo.unsubscribe(this.handle);
	}
});
});

require(["HelpTextPlus/widget/HelpTextRowIframe"]);
