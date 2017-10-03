/**

*/
dojo.provide("HelpTextPlus.widget.HelpTextTriggerDialog");

mendix.dom.insertCss(mx.moduleUrl("HelpTextPlus", "widget/styles/HelpText.css"));

mendix.widget.declare('HelpTextPlus.widget.HelpTextTriggerDialog', {
	addons       : [],
	
	inputargs: {
		txton : '',
		txtoff: '',
		screenLocation: ''
	},
	
	//IMPLEMENTATION
	domNode: null,
	imgNode: null,
	txtNode: null,
	tries: 0,
	
  postCreate : function(){
		logger.debug(this.id + ".postCreate");

		//houskeeping
		this.imgNode = mendix.dom.div({
			'class' : 'HelpTextTriggerDialog'
		});
		this.domNode.appendChild(this.imgNode);
		
		this.txtNode = mendix.dom.label({'class' : 'HelpTextTriggerLabel'}, this.txton);
		this.domNode.appendChild(this.txtNode);
		
		this.connect(this.imgNode, 'onclick', this.toggle);
		this.connect(this.txtNode, 'onclick', this.toggle);
		
		this.actRendered();
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
	
	uninitialize : function() {
		logger.debug(this.id + ".uninitialize");
	}
});