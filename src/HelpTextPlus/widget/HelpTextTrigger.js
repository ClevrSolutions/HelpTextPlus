define([
	"dojo/_base/declare",
	"mxui/widget/_WidgetBase",
	"mxui/dom",
	"dojo/_base/lang",
	"dojo/_base/kernel"
], function (declare, _WidgetBase, mxuiDom, lang, kernel) {
	return declare("HelpTextPlus.widget.HelpTextTrigger", [ _WidgetBase ], {

	txton: '',
	txtoff: '',
	caption: '',
	captionNL: '',
	captionDE: '',

	//IMPLEMENTATION
	domNode: null,
	txtNode: null,
	tries: 0,
	screenLocation: '',

  postCreate : function(){
		logger.debug(this.id + ".postCreate");

		//houskeeping
		this.connect(this.domNode, 'onclick', this.toggle);
		mx.addOnLoad(lang.hitch(this, this.resetCaption)); 
	},

	toggle : function() {
		var formName = typeof(mxui) != "undefined"?this.mxform.path:"undefined";
		var index = formName.indexOf('/');
		
		if(index !=null){
			var module = formName.substring(0,index);
			var subForm = formName.substring(index);
			subForm = subForm.toLowerCase();
			formName = module + subForm;
		}
		this.screenLocation = formName;
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
	
	resetCaption:function(){
		//system needs some time to set the locale when changing users, so timeout is needed
		setTimeout(lang.hitch(this, function () {
         var code = kernel.locale;
                         var caption = this.caption;
			 
                             switch(code){
                                 case "en-us":
                                    caption = this.caption;
                                    break;
                                 case "nl":
                                    caption = this.captionNL;
                                    break;
                                 case "de":
                                    caption = this.captionDE;
                                    break;
                              }
							 this.domNode.title = caption;
		}), 1000);
	},

	uninitialize: function () {
		logger.debug(this.id + ".uninitialize");
	}
	});
});

require(["HelpTextPlus/widget/HelpTextTrigger"]);
