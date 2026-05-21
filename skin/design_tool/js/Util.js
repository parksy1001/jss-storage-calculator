function trace(message)
{
    var textarea = document.getElementById("trace");
    textarea.value = textarea.value + message + "\n";
}

function Array2(n1,n2)
{
    var i;
    var a = new Array(n1);
    for (i = 0; i < n1; i++) {
        a[i] = new Array(n2);
    }
    return a;
}

function Array3(n1,n2,n3)
{
    var i;
    var a = new Array(n1);
    for (i = 0; i < n1; i++) {
        a[i] = new Array2(n2,n3);
    }

    return a;
}

function clearList(list)
{
    while (list.length > 0) {
        list.remove(0);
    }
}

function getSelectedListValue(id, index)
{
    var list = document.getElementById(id);
	list.options.selectedIndex = index;
    return list.options[index].value;
}

function setListOptionsWithNumber(id,from,to)
{
    var list = document.getElementById(id);
    clearList(list);

    var i;
    for (i = from; i <= to; i++) {
        var option = document.createElement('option');
        option.text = i;
        if (getBrowser() == "ie") {
            list.add(option);   // IE only
        }
        else {
            list.add(option, null);
        }
    }
    list.selectedIndex = list.length-1;
}

function setListOptions(id,arr)
{
    var list = document.getElementById(id);
    clearList(list);

    var i;
    for (i = 0; i < arr.length; i++) {
        var option = document.createElement('option');
        option.text = arr[i];
		option.value = arr[i];
        if (getBrowser() == "ie") {
            list.add(option);   // IE only
        }
        else {
            list.add(option, null);
        }
    }
}

function setListOptionsWithValue(id,arr,value)
{
    var list = document.getElementById(id);
    clearList(list);

    var i;
    for (i = 0; i < arr.length; i++) {
        var option = document.createElement('option');
        option.text = arr[i];
		option.value = value[i];
        if (getBrowser() == "ie") {
            list.add(option);   // IE only
        }
        else {
            list.add(option, null);
        }
    }
}

function selectIndex(id, index)
{
    var listCtl = document.getElementById(id);
    listCtl.selectedIndex = index;
}

function replaceList(id, newList)
{
    var listCtl = document.getElementById(id);
    if (newList.length <= 0) {
        return;
        listCtl.options.length = 0;
        return;
    }

    var preIndex = listCtl.selectedIndex;
    var nextIndex;
    if (preIndex < 0) {
        nextIndex = 0;
    }
    else {
        var preText = listCtl.options[preIndex].text;
        for (nextIndex = 0; nextIndex < newList.length; nextIndex++) {
            if (preText == newList[nextIndex]) {
                break;
            }
        }
        if (nextIndex == newList.length) {
			nextIndex = 0;
//			if (listCtl.selectedIndex > nextIndex) 
//				nextIndex--;  // 찾지 못한 경우 마지막 것.
//			else
//				nextIndex = listCtl.selectedIndex;
        }
    }

    setListOptions(id, newList);
    listCtl.selectedIndex = nextIndex;

    return nextIndex;
}

function replaceListWithValue(id, newList, value)
{
    var listCtl = document.getElementById(id);
    if (newList.length <= 0) {
        listCtl.options.length = 0;
        return;
    }
	
	if (newList.length != value.length) {
		return;
	}
	
    var preIndex = listCtl.selectedIndex;
    var nextIndex;
    if (preIndex < 0) {
        nextIndex = 0;
    }
    else {
        var preText = listCtl.options[preIndex].text;
        for (nextIndex = 0; nextIndex < newList.length; nextIndex++) {
            if (preText == newList[nextIndex]) {
                break;
            }
        }
        if (nextIndex == newList.length) {
			nextIndex = 0;
//			if (listCtl.selectedIndex > nextIndex) 
//				nextIndex--;  // 찾지 못한 경우 마지막 것.
//			else
//				nextIndex = listCtl.selectedIndex;
        }
    }

    setListOptionsWithValue(id, newList, value);
    listCtl.selectedIndex = nextIndex;

    return nextIndex;
}

function replaceListDefault(id, newList, param)
{
    if (newList.length <= 0) {
        throw "replaceList: newList.length <= 0";
    }

    var listCtl = document.getElementById(id);
    var preIndex = listCtl.selectedIndex;
    var nextIndex;
    if (preIndex < 0) {
        nextIndex = param;
    }
    else {
        var preText = listCtl.options[preIndex].text;
        for (nextIndex = 0; nextIndex < newList.length; nextIndex++) {
            if (preText == newList[nextIndex]) {
                break;
            }
        }
        if (nextIndex == newList.length) {
			nextIndex = param;
//			if (listCtl.selectedIndex > nextIndex) 
//				nextIndex--;  // 찾지 못한 경우 마지막 것.
//			else
//				nextIndex = listCtl.selectedIndex;
        }
    }

    setListOptions(id, newList);
    listCtl.selectedIndex = nextIndex;

    return nextIndex;
}

function newNumList(from, to)
{
    var list = new Array(to-from+1);
    var i;
    var val = from;
    for (i = 0; i < to-from+1; i++) {
        list[i] = val++;
    }
    return list;
}

var browser = "";
function getBrowser()
{
    if (browser == "") {
        var name = navigator.appName;
        if (name.match("Microsoft") != null) {
            browser = "ie";
        }
        else {
            browser = "netscape";
        }
    }
    return browser;
}

function clone(obj) {
    var copy;

    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" != typeof obj) return obj;

    // Handle Date
    if (obj instanceof Date) {
        copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
        copy = [];
        for (var i = 0, len = obj.length; i < len; i++) {
            copy[i] = clone(obj[i]);
        }
        return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
        copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
        }
        return copy;
    }

    throw new Error("Unable to copy obj! Its type isn't supported.");
}

function ObjectCopy(obj)
{
	 var objNew = {};
	 for(var k in obj) objNew[k] = obj[k];
	 return objNew; 
 }