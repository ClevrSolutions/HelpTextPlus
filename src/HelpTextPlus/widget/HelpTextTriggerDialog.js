/**

*/
define([
	"dojo/_base/declare",
	"mxui/widget/_WidgetBase",
	"mxui/dom",
	"dojo/_base/lang"
], function (declare, _WidgetBase, mxuiDom, lang) {
	return declare("HelpTextPlus.widget.HelpTextTriggerDialog", [ _WidgetBase ], {
	
		txton : '',
		txtoff: '',
		screenLocation: '',
	
	//IMPLEMENTATION
	domNode: null,
	imgNode: null,
	txtNode: null,
	tries: 0,

  postCreate : function(){
		logger.debug(this.id + ".postCreate");

		//houskeeping
		this.imgNode = mxuiDom.create("div", {
			'class' : 'HelpTextTriggerDialog'
		});
		this.domNode.appendChild(this.imgNode);
		
		this.txtNode = mxuiDom.create("label", {'class' : 'HelpTextTriggerLabel'}, this.txton);
		this.domNode.appendChild(this.txtNode);
		
		this.connect(this.imgNode, 'onclick', this.toggle);
		this.connect(this.txtNode, 'onclick', this.toggle);
	},

	toggle : function() {
		if(this.screenLocation == ''){
			var formName = typeof(mxui) != "undefined"?mx.screen.buffer.getItem()._c.url:mx.screen.buffer.getCurrentItem()._c.url;
			var prefix = formName.substring(0,6);
			var checkPrefix ='forms/'
			if(prefix == checkPrefix){
					this.screenLocation = formName.substring(12);
			}else{
					this.screenLocation = formName;	
			}
		}
		this.retrieveArticle();
	},
	
	retrieveArticle : function () {
  
		var xPathConstraint = "[ScreenLocation='" + this.screenLocation + "']"
		var xPath = "//HelpText.HelpTextURL"+ xPathConstraint;
		 
		mx.data.get({
			xpath : xPath,
			filter : {amount : 1 },
			callback : lang.hitch(this, this.setArticle),
			error: lang.hitch(this, function(err) {console.log('ERROR');})
		});
		
		},
	
	setArticle : function (object) {
		if(object[0] == null){
			this.openDefault();
		}else{
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
		}
	},
	
	setServer : function (ServerObject) {
		if(ServerObject == null){
			this.openDefault();
		}else{
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
		}
	},
	
	setVersion : function (VersionObject) {
		if(VersionObject == null){
			this.openDefault();
		}else{
			this.version = VersionObject.get('Version');
			this.openDocumentatie();
		}	
	},
	
	openDocumentatie : function () {
		if(this.server=='' || this.version=='' || this.article==''){
			this.openDefault();
		} else{
			var urlString = this.server + this.version +this.article;
			window.open(urlString);
		}	
	},
	
	openDefault : function () {
		if(this.tries < 3){
			this.tries += 1;
			this.screenLocation = 'default';
			this.retrieveArticle();
		}else{
			this.tries = 0;
		}
	},
	
	uninitialize : function() {
		logger.debug(this.id + ".uninitialize");
	}
		});
	});

require([ "HelpTextPlus/widget/HelpTextTriggerDialog" ]);
