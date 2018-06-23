function convDate(userDate) {
	if (userDate == "") {
		return "";
	}
	var date = new Date(userDate),
	yr = date.getFullYear(),
	month = date.getMonth() < 09 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1),
	day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate(),
	newDate = yr + '-' + month + '-' + day;
	return newDate;
}
function filterRecognitionArray(arr, property, str) {
	newArr = [];
	$.each(arr, function (index, value) {
		if (value[property] == str) {
			newArr.push(value);
		}
	});
	return newArr;
}
function uniqueBy(arr, fn) {
	var unique = {};
	var distinct = [];
	arr.forEach(function (x) {
		var key = fn(x);
		if (!unique[key]) {
			distinct.push(key);
			unique[key] = true;
		}
	});
	return distinct;
}
Date.prototype.addDays = function (days) {
	var dat = new Date(this.valueOf());
	dat.setDate(dat.getDate() + days);
	return dat;
}
function chkClickAction(util, modelInstanceId, chkID, arr, items, recognitionitems) {
	setQtyLabel(util, modelInstanceId, chkID, arr);
	$('#' + util.getMappedElId(modelInstanceId, chkID)).change(function () {
		if (this.checked) {
			items.remove(arr);
			items.add(arr);
		} else {
			items.remove(arr);
		}
	});
}
function setQtyLabel(util, modelInstanceId, chkID, arr) {
	$('#' + util.getMappedElId(modelInstanceId, chkID)).next('span').text($('#' + util.getMappedElId(modelInstanceId, chkID)).next('span').html() + " (" + arr.length + ")");
}
/**
 * Move the timeline a given percentage to left or right
 * @param {Number} percentage   For example 0.1 (left) or -0.1 (right)
 */
function move(percentage, timeline) {
	var range = timeline.getWindow();
	var interval = range.end - range.start;

	timeline.setWindow({
		start: range.start.valueOf() - interval * percentage,
		end: range.end.valueOf() - interval * percentage
	});
}

function truncateString(str, num) {
	if (typeof(str) == 'undefined') {
		return "";
	} else if (str.length <= num) {
		return str;
	} else {
		return str.substring(0, num) + "...";
	}
}

function interactionCategory(cat, subcat) {
	if (cat == '' && subcat == '') {
		return "";
	} else {
		return cat + " : " + subcat + "<br>";
	}
}

function hideBlankField(str) {
	if (str == '') {
		return "";
	} else {
		return str + "<br>";
	}
}

(function (container, modelInstanceId) {

	var util = BBUI.forms.Utility;
	//grab the context ID
	CONTEXTID = container.getFieldByName("CONTEXTID", modelInstanceId).value;
	//set default datalist IDs
	var recognitionDatalistID = '1E25E348-03FF-4341-8B46-0C55567084D9';
	var interactionDatalistID = 'CBBAC8AF-4F55-4A6E-B94C-628CF44D240D';
	var communicationDatalistID = '671782cc-080f-48ba-b877-c0cd9f149f8a';
	//grab the database name
	var databaseName = container.svc.databaseName;

	//filter popup
	$("#" + util.getMappedElId(modelInstanceId, "filter")).click(function () {
		$.tinyModal({
			buttons: ['Close'],
			title: 'Filter',
			html: "#" + util.getMappedElId(modelInstanceId, "mymodal")
		});
	});

	$("#ui-datepicker-div").remove();

	$('#' + util.getMappedElId(modelInstanceId, "datepicker")).datepicker({
		buttonImage: '../browser/catalogimages/Blackbaud/AppFx/Browser/ImageLibrary/calendar_events_16.png',
		buttonImageOnly: true,
		showOn: 'both',
		changeMonth: true,
		changeYear: true,
		dateFormat: "yy-mm-dd",
		onSelect: function (d, i) {
			if (d !== i.lastVal) {
				$(this).change();
			}
		}
	});
	
	//setup tree to be used for filter
	var tree1 = $('#' + util.getMappedElId(modelInstanceId, "treediv") + " div").tree({
			onCheck: {
				node: 'expand'
			},
			onUncheck: {
				node: 'collapse'
			}
		});

	//recognitions
	d3.csv(container.fixUrl("/util/DataList.ashx?DatabaseName=" 
							+ databaseName + "&dataListID=" 
							+ recognitionDatalistID 
							+ "&ContextRecordID=" 
							+ CONTEXTID 
							+ "&format=csv&DATEFILTER=0"))
	.row(function (d) {
		return [
			convDate(d.DATE),
			d["AMOUNT"],
			d["APPLICATIONCODE"],
			truncateString(d["DETAIL"], 30),
			d["RECOGNITIONCREDITTYPE"],
			d["ID"]
		];
	})
	.get(function (error, recognitionrows) {
		//interactions
		d3.csv(container.fixUrl("/util/DataList.ashx?DatabaseName=" 
								+ databaseName + "&dataListID=" 
								+ interactionDatalistID 
								+ "&ContextRecordID=" 
								+ CONTEXTID 
								+ "&format=csv&DATEFILTER=0"))
		.row(function (d) {
			return [
				convDate(d.DATE),
				d["CATEGORY"],
				d["STATUS"],
				truncateString(d["OBJECTIVE"], 30),
				d["OWNER"],
				d["ID"],
				d["SUBCATEGORY"],
				d["TYPE"]
			];
		})
		.get(function (error, interactions) {
			//communications
			d3.csv(container.fixUrl("/util/DataList.ashx?DatabaseName=" 
									+ databaseName 
									+ "&dataListID=" 
									+ communicationDatalistID 
									+ "&ContextRecordID=" 
									+ CONTEXTID 
									+ "&format=csv&DATEFILTER=10"))
			.row(function (d) {
				return [
					convDate(d.DATESENT),
					d["CHANNEL"],
					truncateString(d["DETAILS"], 40),
					d["CORRESPONDENCETYPE"],
					d["ID"],
					d["PREVIEWDATAFORMRECORDID"],
					d["CORRESPONDENCETYPECODE"],
					d["RECORDID"]

				];
			})
			.get(function (error, communications) {
				$.getScript("../browser/htmlforms/custom/shared_resources/vis/vis.js", function (data, textStatus, jqxhr) {
					// DOM element where the Timeline will be attached
					var container = document.getElementById(util.getMappedElId(modelInstanceId, "output"));

					// Create a DataSet (allows two way data-binding)
					var items = new vis.DataSet();

					// Create datasets for different categories
					var recognitionitems = new vis.DataSet();
					var interactionitems = new vis.DataSet();
					var communicationitems = new vis.DataSet();

					var recognitions = [];
					$.each(recognitionrows, function (index, value) {
						$content = "<a href='./webshellpage.aspx?databasename=" + databaseName + "#pageType=p&pageId=e5bd9d8b-c268-48cc-a312-e9a832b39566&recordId=" + recognitionrows[index][5] + "' style='font-weight:bold;'>" + recognitionrows[index][2] + " " + recognitionrows[index][1] + "</a><br>" + recognitionrows[index][0] + "<br>" + recognitionrows[index][3] + "<br>" + recognitionrows[index][4] + " Recognition";
						recognitions.push({
							id: recognitionrows[index][5],
							content: $content,
							start: recognitionrows[index][0],
							group: 0,
							className: "recognition",
							recognitiontype: recognitionrows[index][4],
							application: recognitionrows[index][2]
						});
					});

					var ints = [];
					$.each(interactions, function (index, value) {
						if (interactions[index][0] != "") {
							$content = "<a href='./webshellpage.aspx?databasename=" + databaseName + "#pageType=p&pageId=c7fb41d2-840f-4c19-a4fc-3f8ce7ece1aa&recordId=" + interactions[index][5] + "' style='font-weight:bold;'>" + interactions[index][3] + " </a><br>" + interactions[index][0] + "<br>Type: " + interactions[index][7] + "<br>" + interactionCategory(interactions[index][1], interactions[index][6]) + "Status: " + interactions[index][2];
							ints.push({
								id: interactions[index][5],
								content: $content,
								start: interactions[index][0],
								interactiontype: interactions[index][7],
								group: 1,
								className: "interaction"
							});
						}
					});

					var comms = [];
					$.each(communications, function (index, value) {
						if (communications[index][0] != "") {
							switch (communications[index][3]) {
							case "Appeal Mailing":
								if (communications[index][6] != 10) { //NOT BBIS
									$content = "<a href='./webshellpage.aspx?databasename=" + databaseName + "#pageType=p&pageId=bc7374ef-1061-4e58-bc83-19c513a893cb&recordId=" + communications[index][4] + "' style='font-weight:bold;'>" + communications[index][3] + " </a><br>" + communications[index][0] + "<br>" + communications[index][2] + "<br>" + communications[index][1];
								} else {
									$content = communications[index][3] + " (BBIS)<br>" + communications[index][0] + "<br>" + communications[index][2] + "<br>" + communications[index][1];
								}
								comms.push({
									id: communications[index][5],
									content: $content,
									start: communications[index][0],
									group: 3,
									className: "communication",
									communicationtype: communications[index][3]
								});
								break;
							case "Receipt":
								$content = "<a href='./webshellpage.aspx?databasename=" + databaseName + "#pageType=p&pageId=387f861b-6c03-486c-9ff5-9cc5bb7a5275&recordId=" + communications[index][4] + "' style='font-weight:bold;'>" + communications[index][3] + " </a><br>" + communications[index][0] + "<br>" + communications[index][2] + "<br>" + communications[index][1];
								comms.push({
									id: communications[index][5],
									content: $content,
									start: communications[index][0],
									group: 3,
									className: "communication",
									communicationtype: communications[index][3]
								});
								break;
							case "Event Invitation":
								$content = "<a href='./webshellpage.aspx?databasename=" + databaseName + "#pageType=p&pageId=9cd4b54a-43df-4ff9-a0a4-1bae7480bc78&recordId=" + communications[index][4] + "' style='font-weight:bold;'>" + communications[index][3] + " </a><br>" + communications[index][0] + "<br>" + communications[index][2] + "<br>" + communications[index][1];
								comms.push({
									id: communications[index][5],
									content: $content,
									start: communications[index][0],
									group: 3,
									className: "communication",
									communicationtype: communications[index][3]
								});
								break;
							case "General Correspondence":
								$content = "<a href='./webshellpage.aspx?databasename=" + databaseName + "#pageType=p&pageId=97210b2d-c2ff-4ad4-9a98-7f7dba08249a&recordId=" + communications[index][7] + "' style='font-weight:bold;'>" + communications[index][3] + " </a><br>" + communications[index][0] + "<br>" + communications[index][2] + "<br>" + communications[index][1];
								comms.push({
									id: communications[index][5],
									content: $content,
									start: communications[index][0],
									group: 3,
									className: "communication",
									communicationtype: communications[index][3]
								});
								break;
							case "Acknowledgement":
								$content = "<a href='./webshellpage.aspx?databasename=" + databaseName + "#pageType=p&pageId=387f861b-6c03-486c-9ff5-9cc5bb7a5275&tabId=ee723ddc-2644-4dd8-9e34-6302b2fef8c7&recordId=" + communications[index][4] + "' style='font-weight:bold;'>" + communications[index][3] + " </a><br>" + communications[index][0] + "<br>" + communications[index][2] + "<br>" + communications[index][1];
								comms.push({
									id: communications[index][5],
									content: $content,
									start: communications[index][0],
									group: 3,
									className: "communication",
									communicationtype: communications[index][3]
								});
								break;
							default:
								$content = communications[index][3] + "<br>" + communications[index][0] + "<br>" + communications[index][2] + "<br>" + communications[index][1];
								comms.push({
									id: communications[index][5],
									content: $content,
									start: communications[index][0],
									group: 3,
									className: "communication",
									communicationtype: communications[index][3]
								});
								break;
							}
						}
					});

					//get unique types to build tree nodes
					interActionTypes = uniqueBy(ints, function (x) {
							return x.interactiontype;
						});
					recognitionTypes = uniqueBy(recognitions, function (x) {
							return x.application;
						});
					communicationTypes = uniqueBy(comms, function (x) {
							return x.communicationtype;
						});

					//default options for timeline
					var options = {
						start: new Date(2016, 0, 1),
						end: new Date(2019, 0, 1)
					};

					// Create a Timeline
					var timeline = new vis.Timeline(container, items, options);

					//date picker
					$("#" + util.getMappedElId(modelInstanceId, "datepicker")).change(function () {
						timepicked = $("#" + util.getMappedElId(modelInstanceId, "datepicker")).val();
						timepicked = new Date(timepicked);
						//timeline.moveTo(timepicked);
						timeline.setWindow(timepicked.addDays(-30), timepicked.addDays(30));

					});

					//menu hooks
					document.getElementById(util.getMappedElId(modelInstanceId, 'zoomIn')).onclick = function () {
						timeline.zoomIn(0.3);
					};
					document.getElementById(util.getMappedElId(modelInstanceId, 'zoomOut')).onclick = function () {
						timeline.zoomOut(0.3);
					};
					document.getElementById(util.getMappedElId(modelInstanceId, 'moveLeft')).onclick = function () {
						move(0.3, timeline);
					};
					document.getElementById(util.getMappedElId(modelInstanceId, 'moveRight')).onclick = function () {
						move(-0.3, timeline);
					};

					//add nodes and click actions for the tree
					
					//add interactions
					$.each(interActionTypes, function (index, value) {
						tree1.tree('addNode', {
							li: {
								'class': 'leaf'
							},
							input: {
								'type': 'checkbox',
								'id': util.getMappedElId(modelInstanceId, "interaction" + value.replace(/\s/g, '') + "Check")
							},
							span: {
								'html': value
							}
						}, $('#' + util.getMappedElId(modelInstanceId, 'interactionList')));
						chkClickAction(util, modelInstanceId, "interaction" + value.replace(/\s/g, '') + "Check", filterRecognitionArray(ints, "interactiontype", value), items, interactionitems);
					});
					//add recognitions
					$.each(recognitionTypes, function (index, value) {
						tree1.tree('addNode', {
							li: {
								'class': 'leaf'
							},
							input: {
								'type': 'checkbox',
								'id': util.getMappedElId(modelInstanceId, "recognition" + value.replace(/\s/g, '') + "Check")
							},
							span: {
								'html': value
							}
						}, $('#' + util.getMappedElId(modelInstanceId, 'recognitionList')));
						chkClickAction(util, modelInstanceId, "recognition" + value.replace(/\s/g, '') + "Check", filterRecognitionArray(recognitions, "application", value), items, recognitionitems);
					});
					//add communications
					$.each(communicationTypes, function (index, value) {
						tree1.tree('addNode', {
							li: {
								'class': 'leaf'
							},
							input: {
								'type': 'checkbox',
								'id': util.getMappedElId(modelInstanceId, "communication" + value.replace(/\s/g, '') + "Check")
							},
							span: {
								'html': value
							}
						}, $('#' + util.getMappedElId(modelInstanceId, 'communicationList')));
						chkClickAction(util, modelInstanceId, "communication" + value.replace(/\s/g, '') + "Check", filterRecognitionArray(comms, "communicationtype", value), items, communicationitems);
					});

					//select defaults
					$("#" + util.getMappedElId(modelInstanceId, "recognitionCheck")).click();

					//hide spinner once everything is done
					$('#' + util.getMappedElId(modelInstanceId, "spinnercontainer")).hide();

					//set the width to the section container
					$('#' + util.getMappedElId(modelInstanceId, "output")).width($(".bbui-pages-pagesection").width() - 30);

					//handles resize
					$(window).resize(function () {
						$('#' + util.getMappedElId(modelInstanceId, "output")).width($(".bbui-pages-pagesection").width() - 30);
					});
				});
			});
		});

	});

})();
