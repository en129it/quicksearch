
var DataItem = function(propType, value) {
	this.propType = propType;
	this.value = value;
};

var ValidationRule = function(minChars, maxChars) {
	this.minChars = minChars;
	this.maxChars = maxChars;
	
	this.isValid = function(searchText) {
		var isValid = (searchText.length>= this.minChars);
		if (maxChars!=null) {
			isValid &= (searchText.length<= this.maxChars);			
		}
		return isValid;
	};
	
	this.getErrorMessage = function(searchText) {
		if (!this.isValid(searchText)) {
			if (this.maxChars!=null) {
				if (this.maxChars==this.minChars) {
					return "Type exactly " + this.minChars + " characters"; 
				} else {
					return "Type between " + this.minChars + " and " + this.maxChars + " characters";
				}
			} else {
				return "Type at least " + this.minChars + " characters";				
			}
		}
		return null;
	};	
};

var DataSet = function() {
	this.data = new Array();
	this.matches = [];
	
	this.add = function(item) {
		this.data.push(item);
	};
	
	this.findMatches = function(searchText) {
		var rslt = new Array();
		for (var i=0; i<this.data.length; i++) {
			if (this.data[i].value.indexOf(searchText)>-1) {
				rslt.push(this.data[i]);
			}
		}
		this.matches = rslt;
	}
};

var CategoryMatch = function(categoryName, validationRule) {
	this.categoryName = categoryName;
	this.validationRule = validationRule;
	this.dataSet = new DataSet();

	this.addDataSetItem = function(item) {
		this.dataSet.add(item);
	};
	
	this.getErrorMessage = function(searchText) {
		return this.validationRule.getErrorMessage(searchText);
	};
	
	this.getCategoryName = function() {
		return this.categoryName;
	};
	
	this.findMatches = function(searchText) {
		this.dataSet.findMatches(searchText);
	}
};




var MyController = (function () {
	/* @nginject */
	function MyController($scope, $element, $timeout, $q) {
		this.scope = $scope;
		this.element = $element;
//		this.scope.searchText = "Toto";
		this.scope.selectedItem = null;
		this.index = null;
		this.matches = [];
		this.noBlur = false;
		this.hasFocus = false;
		this.term = null;
		this.cache = {};
		this.timer = null;
		
		
		this.getChipsData = function() {
				var rslt = [];
				rslt.push('aaaa hello');
				rslt.push('bbbb hello');
				rslt.push('cccc hello');
				console.log('@@@@@@@@ ' + rslt.length);
				return rslt;
		};
		
		this.scope.searchText = "";
		this.selectedSuggestion = null;
		this.getMatches = function(searchText) {
			console.log("GET MATCHES >" + searchText + "<");
			var deferred = $q.defer();
			
			setTimeout(function() {
				var text = searchText;
				if (text.length>3) {
					text = text.substring(0, 3);
				}
				
				var rslt = [];
				rslt.push(text + ' hello');
				rslt.push('aaaa hello');
				rslt.push('bbbb hello');
				rslt.push('cccc hello');
				rslt.push('dddd hello'); 
				rslt.push('eeee hello');
				rslt.push('ffff hello');
				rslt.push('gggg hello');
				deferred.resolve(rslt);
			}, 1000);

			return deferred.promise;
		};

		this.data = new Array();
		
		var accountCategory = new CategoryMatch('Account', new ValidationRule(4, null));
		accountCategory.addDataSetItem(new DataItem('name', "Fund Equity Asia"));
		accountCategory.addDataSetItem(new DataItem('code', "ABCD"));
		accountCategory.addDataSetItem(new DataItem('name', "Fund Equity Europe"));
		accountCategory.addDataSetItem(new DataItem('name', "Fund Equity North America"));
		accountCategory.addDataSetItem(new DataItem('name', "Fund Equity South America"));
	
		var shareClassCategory = new CategoryMatch('Share Class', new ValidationRule(4, 4));
		shareClassCategory.addDataSetItem(new DataItem('name', "Eur"));
		shareClassCategory.addDataSetItem(new DataItem('name', "EEE"));
		shareClassCategory.addDataSetItem(new DataItem('name', "ABC"));

		var txCategory = new CategoryMatch('Transaction', new ValidationRule(12, 12));
		txCategory.addDataSetItem(new DataItem('id', "abcdefghijkl"));

		this.data.push(accountCategory);
		this.data.push(shareClassCategory);
		this.data.push(txCategory);

		this.keydown = function(event) {
			console.log("KEYDOWN");
			switch (event.keyCode) {
			  case 40: // DOWN_ARROW
				// Case : the user pressed the down arrow to move to the next item of the suggested list
				event.stopPropagation();
				event.preventDefault();
				this.index = Math.min(this.index + 1, this.matches.length - 1);
				updateScroll();
				break;
			  case 38: //UP_ARROW
				event.stopPropagation();
				event.preventDefault();
				this.index = this.index < 0 ? this.matches.length - 1 : Math.max(0, this.index - 1);
				updateScroll();
				break;
			  case 9: // TAB
				// If we hit tab, assume that we've left the list so it will close
//				onListLeave();

				if (this.index < 0 || this.matches.length < 1) return;
//				select(ctrl.index);
				break;
			  case 13: // ENTER
				if (this.index < 0 || this.matches.length < 1) return;
//				if (hasSelection()) return;
				event.stopPropagation();
				event.preventDefault();
//				select(this.index);
				break;
			  case 27: // ESCAPE
				event.stopPropagation();
				event.preventDefault();
				clearValue();

				// Force the component to blur if they hit escape
				doBlur(true);

				break;
			  default:
			}
		};
		
		this.blur = function() {
			console.log("BLUR");
		};
		
		this.focus = function() {
			console.log("FOCUS");
		};
		
		this.doBlur = function(forceBlur) {
			if (forceBlur) {
				this.noBlur = false;
				this.hasFocus = false;
			}
			this.getInputElement().blur();
		};

		this.clearValue = function() {
/*			
			ctrl.index = 0;
			ctrl.matches = [];
			this.scope.searchText = '';

			select(-1);

			var eventObj = document.createEvent('CustomEvent');
			eventObj.initCustomEvent('input', true, true, { value: $scope.searchText });
			this.getInputElement().dispatchEvent(eventObj);

			this.getInputElement().focus();
*/			
		};

		this.updateScroll = function() {
			var liElems = this.element.find('li');
			if (liElems.length>0) {
				var height = liElems.offsetHeight;
				var top = height * this.index;
				var bot = top + height;
//					var hgt = elements.scroller.clientHeight;
//					var scrollTop = elements.scroller.scrollTop;
//				if (top < scrollTop) {
//				  scrollTo(top);
//				} else if (bot > scrollTop + hgt) {
//				  scrollTo(bot - hgt);
//				}
			}
		};
		
		this.debounce = function(func, scope, invokeApply) {
			var timer;

			return function debounced() {
				var context = scope, args = Array.prototype.slice.call(arguments);

				$timeout.cancel(timer);
				timer = $timeout(function() {
					timer = undefined;
					func.apply(context, args);
				}, 150, invokeApply);
			};
		};

		this.handleSearchText = function(searchText, previousSearchText) {
			console.log("HANDLESEARCHTEXT");
			
			this.index = -1;
			// do nothing on init
			if (searchText==previousSearchText) return;
/*
			this.getDisplayValue(this.scope.selectedItem).then(function (val) {				
				// clear selected item if search text no longer matches it
				if (searchText !== val) {
*/					
					this.scope.selectedItem = null;

					// cancel results if search text is not long enough
					if (!this.isMinLengthMet()) {
						this.matches = [];
					} else {
						this.handleQuery();
					}
/*					
				}
			});
*/			
		};

		this.isMinLengthMet = function() {
			return false;
//			return (this.scope.searchText || '').length >= 3;
		};

		this.handleQuery = function() {
/*			
			var searchText = this.scope.searchText || '',
			this.term = searchText.toLowerCase();
			//-- if results are cached, pull in cached results
			if (this.cache[term]) {
			  this.matches = this.cache[term];
			} else {
			  this.fetchResults(searchText);
			}
*/			
		};
		
		this.fetchResults = function(searchText) {
/*			
			var items = $scope.$parent.$eval(itemExpr),
				term  = searchText.toLowerCase();
			if (angular.isArray(items)) {
			  handleResults(items);
			} else if (items) {
			  setLoading(true);
			  promiseFetch = true;
			  $mdUtil.nextTick(function () {
				if (items.success) items.success(handleResults);
				if (items.then)    items.then(handleResults);
				if (items.finally) items.finally(function () {
				  setLoading(false);
				  promiseFetch = false;
				});
			  },true, $scope);
			}
			function handleResults (matches) {
			  cache[ term ] = matches;
			  if ((searchText || '') !== ($scope.searchText || '')) return; //-- just cache the results if old request
			  ctrl.matches = matches;
			  ctrl.hidden  = shouldHide();
			  if ($scope.selectOnMatch) selectItemOnMatch();
			  updateMessages();
			  positionDropdown();
			}
*/			
		};
		
		this.getInputElement = function() {
			this.element.find('#search');
		};
		
//		this.scope.$watch('searchText', this.debounce(this.handleSearchText));
		var self = this;		
		this.triggerSearchSuggestions = function(searchText, previousSearchText) {
console.log("### triggerSuggestion ", self);		
			$timeout.cancel(self.timer);
			self.timer = $timeout(function() {
				self.timer = null;
				
console.log("### findMatches start");		
				self.data.forEach(function(item) {
					item.findMatches(searchText);
				});
			}, 150, null);		
		};
		
		
		this.focusMode = 'account'; // account, transaction-in-account, transaction
		this.parentAccount;
		this.scope.$watch('searchText', this.triggerSearchSuggestions);
		
		this.changeFocusMode = function(newFocusMode) {
			this.focusMode = newFocusMode;
			console.log("##### changeFocusMode " + newFocusMode);
		}
	}
	return MyController;
})();
