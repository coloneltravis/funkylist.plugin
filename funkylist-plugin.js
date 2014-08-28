(function( $ ){
	 var methods = {
			 init: function(options) {
		    	var settings = {
		    		  'data'				: '',
		    	      'columnlist'          : '',
		    	      'useroptions' 		: 'reorder,showhide,groupby',
		    	      'optionheadings' 		: 'Surname first,Staff left,Group by team',
		    	      'initoptionvalues'	: 'false,false,false',
		    	      'itemid'				: 'itemid',
		    	      'listname'			: 'list',
		    	      'hiddencolor'			: '#f00',
		    	      'selecteditem'		: '',
		    	      'json'				: '',
		    	      'myid'				: ''
		    	};

		    	return $(this).each(function() {
		    		$.extend(settings, options);
	    		
		    		var colnames = settings.columnlist.split(',');
		    		var myid = $(this).attr('id');
		    		settings.myid = myid;

		    		var listoptionsid = myid + '-' + 'listoptions';
		    		var showhideoptionsid = myid + '-' + 'showhideoptions';

		    		$('#' + myid).append('<select id="' + settings.listname + '" name="' + settings.listname + '"/>');
		    		$('#' + myid + ' select').css('float', 'left');
		    		$('#' + myid + ' select').css('width', '180px');

		    		$('#' + myid).append('<div id="' + listoptionsid + '" />');
		    		$('#' + myid + ' select').css("margin-right", "8px");
		    		$('#' + listoptionsid).css("float", "left");
		    		$('#' + listoptionsid).css("margin-right", "8px");
		    		$('#' + listoptionsid).css("display", "none");

		    		$('#' + myid).append('<a id="' + showhideoptionsid + '" href="##">[options]</a>');
		    		$('#' + showhideoptionsid).css("margin-right", "10px");
	    		
		    		var optheadlist = settings.optionheadings.split(',');
		    		var chkboxlist = settings.useroptions.split(',');
		    		var initvaluelist = settings.initoptionvalues.split(',');
		    		for (i = 0; i < chkboxlist.length; i++) {
		    			var checked = '';
		    			if (initvaluelist[i] == 'true') checked = 'checked';
		    			$('#' + listoptionsid).append('<input type="checkbox" id="' + myid + '-' + chkboxlist[i] + '" name="' + chkboxlist[i] + '" value="1"' + checked + '/>' +
		    											'<label for="' + myid + '-' + chkboxlist[i] + '">' + optheadlist[i] + '</label>&nbsp;&nbsp;');
		    		}

		    		$.ajax({url:settings.data, dataType: 'json',
		    			success: function(json) {
		    				settings.json = json;
				    		// initial output of list
				    		if ($('#' + myid + '-groupby').attr('checked')) {
				    			json.sort(methods.sortbyGroup);
				    			methods.showgroupedlist(settings);
				    		}
				    		else {
				    			json.sort(methods.sortbyName);
				    			methods.showlist(settings);
				    		}
		    			}
		    		});

		    		$('#' + listoptionsid + ' input').click( function(e) {
		    			 if (e.target.id == myid + '-reorder') methods.reorder(settings);
		    			 if (e.target.id == myid + '-groupby') methods.groupby(settings);
		    			 if (e.target.id == myid + '-showhide') methods.showhide(settings);
		    		});
	    		
		    		$('#' + showhideoptionsid).click( function(e) {
		    			if ($('#' + listoptionsid).css("display") == "none") {
		    				$('#' + listoptionsid).css("display","block");
		    				$('#' + showhideoptionsid).html("[close]");
		    			}
		    			else {
		    				$('#' + listoptionsid).css("display", "none");
		    				$('#' + showhideoptionsid).html("[options]");
		    			}
		    		});

		    		$(this).data('config', settings);
		    	});  //each
	 		 },

	 		 showlist: function(config) {
	 			 var list = config.json;
	 			 var myref = '#' + config.myid;

	 			 $(myref + ' select').empty();
	 			 for (i in list) {
	 				var optcss = 'display:block;color:#000;';

	 				if (list[i].hide) {
	 					if ($(myref + '-showhide').attr('checked')) optcss = 'display:block;color:#f00;';
	 					else optcss = 'display:none;';
	 				}

	 				var selected = '';
	 				if (config.selecteditem == list[i].itemid) selected = 'selected';

	 				var fullname = methods.getfullname(config, list[i].forename, list[i].surname);
	 				var opt = '<option ' + selected + ' style="' + optcss + '" value="' + list[i].itemid + '" group="' + list[i].group + '">' + fullname + '</option>';
					$(myref + ' select').append(opt);
				}
	 		 },

	 		 showgroupedlist: function(config) {
	 			 var list = config.json;
	 			 var myref = '#' + config.myid;
	 			
	 			 $(myref + ' select').empty();
	 			 var tempgrp = '', opt = '';

	 			 for (i in list) {
	 				if (tempgrp != list[i].group) {
	 				  if (opt != '') $(myref + ' select').append(opt + '</optgroup>');
 					  opt = '<optgroup label="' + list[i].group + '">';
 					  tempgrp = list[i].group;
	 				}

	 				var optcss = 'display:block;color:#000;';
	 				if (list[i].hide) {
	 					if ($(myref + '-showhide').attr('checked')) optcss = 'display:block;color:#f00;';
	 					else optcss = 'display:none;';
	 				}

	 				var selected = '';
	 				if (config.selecteditem == list[i].itemid) selected = 'selected';

	 				var fullname = methods.getfullname(config, list[i].forename, list[i].surname);
	 				var opt = opt + '<option ' + selected + ' style="' + optcss + '" value="' + list[i].itemid + '" group="' + list[i].group + '">' + fullname + '</option>';
				 }
	 			$(myref + ' select').append(opt);
	 		 },

	 		 reorder: function(config) {
	 			var myref = '#' + config.myid;
 			
	 				 $(myref + ' select option').each( function() {
	 					 var reverse = '', delim = '';
	 					
	 					 if ($(this).html().match(/,/)) delim = ',';
	 					 else delim = ' ';
	 					var fullname = $(this).html().split(delim);
	 					 
	 					 if (delim == ',') {
	 						 var reverse = $.trim(fullname[1]) + ' ' + $.trim(fullname[0]);
	 						 $(myref + '-reorder').attr('checked', false);
	 					 }
	 					 else {
	 						 var reverse = $.trim(fullname[1]) + ', ' + $.trim(fullname[0]);
	 						$(myref + '-reorder').attr('checked', true);
	 					 }
	 					 $(this).html(reverse);
	 				 });
 			 },

 			groupby: function(config) {
 				var myref = '#' + config.myid;

 				if ($(myref + '-groupby').attr('checked')) {
					config.json.sort(methods.sortbyGroup);
  					methods.showgroupedlist(config);
  				}
  				else {
  					config.json.sort(methods.sortbyName);
  					methods.showlist(config);
  				}
	 		 },
	 		 
	 		 showhide: function(config) {
	 			var myref = '#' + config.myid;

	 			if ($(myref + '-groupby').attr('checked')) {
  	  					config.json.sort(methods.sortbyGroup);
  	  					methods.showgroupedlist(config);
  	  				}
  	  				else {
  	  					config.json.sort(methods.sortbyName);
  	  					methods.showlist(config);
  	  				}
	 		 },
	 		 
	 		 getfullname: function(config, forename, surname) {
	 			var myref = '#' + config.myid;
	 			if ($(myref + '-reorder').attr('checked')) return surname + ', ' + forename;
				else return forename + ' ' + surname;
	 		 },

	 		sortbyGroup: function(a,b) {
	 			 if (a.group.toUpperCase() < b.group.toUpperCase()) return -1;
	 			 else if (a.group.toUpperCase() > b.group.toUpperCase()) return 1;
	 			 else if (a.hide < b.hide) return -1;
	 			 else if (a.hide > b.hide) return 1;
	 			 else if (a.surname.toUpperCase() < b.surname.toUpperCase()) return -1;
	 			 else if (a.surname.toUpperCase() > b.surname.toUpperCase()) return 1;
	 			 else if (a.forename.toUpperCase() < b.forename.toUpperCase()) return -1;
	 			 else if (a.forename.toUpperCase() > b.forename.toUpperCase()) return 1;
	 			 else return 0;
	 		},
	 		
	 		sortbyName: function(a,b) {
	 			 if (a.hide < b.hide) return -1;
	 			 else if (a.hide > b.hide) return 1;
	 			 else if (a.surname.toUpperCase() < b.surname.toUpperCase()) return -1;
	 			 else if (a.surname.toUpperCase() > b.surname.toUpperCase()) return 1;
	 			 else if (a.forename.toUpperCase() < b.forename.toUpperCase()) return -1;
	 			 else if (a.forename.toUpperCase() > b.forename.toUpperCase()) return 1;
	 			 else return 0;
	 		},
	 		
	 		getoptionvalues: function() {
	 				var settings = $(this).data('config')
	 			
	 				var chkboxlist = settings.useroptions.split(',');
	 				var valuelist = '';

	 				for (i = 0; i < chkboxlist.length; i++) {
	 					var optid = settings.myid + '-' + chkboxlist[i];
	 					valuelist = valuelist + $('#' + optid).attr('checked');
	 					if (i != chkboxlist.length-1) valuelist = valuelist + ',';
	 				}

	 				return valuelist;
	 		},
	 		
	 		destroy: function() {
	 		}
	 };

  $.fn.funkylist = function( method ) {
	  if ( methods[method] ) {
	      return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
	    } else if ( typeof method === 'object' || ! method ) {
	      return methods.init.apply( this, arguments );
	    } else {
	      $.error( 'Method ' +  method + ' does not exist on jQuery.funkylist' );
	    }    
  };
})( jQuery );
