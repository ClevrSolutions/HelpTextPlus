/**

*/
dojo.provide("HelpTextPlus.widget.HelpTextTrigger");

mendix.dom.insertCss(mx.moduleUrl("HelpTextPlus", "widget/styles/HelpText.css"));

mendix.widget.declare('HelpTextPlus.widget.HelpTextTrigger', {
	addons       : [],
	
	inputargs: {
		txton : '',
		txtoff: '',
		caption:'',
		captionNL:'',
		captionDE:''
	},
	
	//IMPLEMENTATION
	domNode: null,
	txtNode: null,
	tries: 0,
	screenLocation: '',
	
  postCreate : function(){
		logger.debug(this.id + ".postCreate");

		//houskeeping
		this.connect(this.domNode, 'onclick', this.toggle);
		mx.addOnLoad(dojo.hitch(this, this.resetCaption)); 
		
		this.actRendered();
	},

	toggle : function() {
		var formName = typeof(mxui) != "undefined"?mx.ui.getCurrentForm().path:"undefined";
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
		 
		mx.processor.get({
			xpath : xPath,
			filter : {limit : 1 },
			callback : dojo.hitch(this, this.setArticle),
			error: dojo.hitch(this, function(err) {console.log('ERROR');})
		});
		
		},
	
	setArticle : function (object) {
		if(object[0] == null){
			this.openDefault();
		}else{
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
		}
	},
	
	setServer : function (ServerObject) {
		if(ServerObject == null){
			this.openDefault();
		}else{
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
		}
	},
	
	setVersion : function (VersionObject) {
		if(VersionObject == null){
			this.openDefault();
		}else{
			this.version = VersionObject.getAttribute('Version');
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
		setTimeout(dojo.hitch(this, function () {
         var code = mx.ui.getLocale();
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
	
	uninitialize : function() {
		logger.debug(this.id + ".uninitialize");
	}
});