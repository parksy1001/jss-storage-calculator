//--------------------------------------------------
//  Define const values
//--------------------------------------------------
var BUILD_TYPE = "" // BRAND_ONLINE

var HIDE_DETAIL_LAYOUT = 0;
var SHOW_DETAIL_LAYOUT = 1;

var STREAM_LIVE1 = 0;
var STREAM_LIVE2 = 1;
var STREAM_RECORD_TIMELAPS = 2;
var STREAM_RECORD_EVENT = 3;
var STREAM_REMOTE = 4;
var STREAM_MAT = 5;

var STREAM_CONTROL_NAMES = ["live1", "live2", "timelaps", "event", "remote", "mat"];

var STREAM_RECORD_PERIOD = {"TE":0,"T":24,"E":0,"N":0}; //TE = Time Lapse & Event, T = Time Lapse, E = Event, N = No Record

var FIXED = 1;

var CAMERA_SETTING_MODE_INSERT = 0;
var CAMERA_SETTING_MODE_MODIFY = 1;

var DEFAULT_UNIT_INDEX = 2;

var SAVE_DATE_LOAD_STAUS = 0;

//--------------------------------------------------
//  Global values
//--------------------------------------------------

var g_detail_layout_status = HIDE_DETAIL_LAYOUT;
var g_unit_selected = 0;
var g_selected_camera_list = new Array();

var g_unit = new Units();
var g_hdd_list = [1024, 2048, 3072, 1024 * 5, 1024 * 10, 1024 * 12, 1024 * 18, 1024 * 20]; //GB
var g_current_hdd_size = 1000;
var g_isCustomCamera = false;

var g_analog_dvr_support_ips = [1, 2, 3, 4, 5, 10, 15, 30];
var g_setting_mode = CAMERA_SETTING_MODE_INSERT;

var g_camera_models = new Array();
var g_video_recoder_models = new Array();
var g_current_camera_model;
var g_current_video_recoder_model;
var tmp_g_current_video_recoder_model;
var g_total_record_bitrate;

var g_modify_camera;
var isDirectIP = 0;
var isIntelligentCodec = 0;
var save_conf_data="";
var save_calcul_data="";

var tmp_camera='';
var g_limit_camera='';
var g_max_total_record_bitrate = 0;
var g_max_single_bitrate = 0;

//--------------------------------------------------
//  init
//--------------------------------------------------

function init(){
	//make default UI
	init_select_items();

	//저장된 데이터 최초 1회 로드
	if(save_conf_data!="" && save_calcul_data!="" && SAVE_DATE_LOAD_STAUS==0){
		SAVE_DATE_LOAD_STAUS = 1;

		saveLoadConfData();
		saveLoadCalculData();
	}
}

// init controls
function init_select_items(){
	init_nvr_models();
	init_camera_models();
	init_default_profile_settings(g_current_camera_model);
	init_bandwidth_unit();
	init_raid_type();
	init_hdd_capacity();
}

function init_nvr_models(){
	var models = [];
	var indexs = [];
	for (x in g_video_recoder_models){
		models.push(g_video_recoder_models[x].name);
		indexs.push(x);
	}
	var selected = replaceListWithValue("select_nvr_model", models, indexs);
	if($("#choiceNvr").val()){
		$("#select_nvr_model option").each(function(k, v){
			if($(v).text() == $("#choiceNvr").val()){
				selected = k;
				return;
			}
		});
	}
	var value = getSelectedListValue("select_nvr_model", selected);
	g_current_video_recoder_model = clone(g_video_recoder_models[value]);
	document.getElementById("check_direct_ip_mode").checked = false;
	if (g_current_video_recoder_model.direct_ip == 2){
		document.getElementById("check_direct_ip_mode").disabled = false;
		document.getElementById("check_direct_ip_mode").checked = true;
		isDirectIP = 2;
		QUALITY_TYPE.QUALITY_LOW = 0;
		QUALITY_TYPE.QUALITY_BASIC =  1;
		QUALITY_TYPE.QUALITY_STANDARD = 3;
		QUALITY_TYPE.QUALITY_HIGH = 5;
		QUALITY_TYPE.QUALITY_VERY_HIGH = 7;
	}
	else if (g_current_video_recoder_model.direct_ip == 1){
		document.getElementById("check_direct_ip_mode").disabled = true;
		isDirectIP = 1;
		QUALITY_TYPE.QUALITY_LOW = 0;
		QUALITY_TYPE.QUALITY_BASIC =  1;
		QUALITY_TYPE.QUALITY_STANDARD = 2;
		QUALITY_TYPE.QUALITY_HIGH = 3;
		QUALITY_TYPE.QUALITY_VERY_HIGH = 4;
	}
	else if (g_current_video_recoder_model.direct_ip == 3){
		document.getElementById("check_direct_ip_mode").disabled = true;
		document.getElementById("check_direct_ip_mode").checked = true;
		isDirectIP = 2;
		QUALITY_TYPE.QUALITY_LOW = 0;
		QUALITY_TYPE.QUALITY_BASIC =  1;
		QUALITY_TYPE.QUALITY_STANDARD = 3;
		QUALITY_TYPE.QUALITY_HIGH = 5;
		QUALITY_TYPE.QUALITY_VERY_HIGH = 7;
	}
	else {
		document.getElementById("check_direct_ip_mode").disabled = true;
		isDirectIP = 0;
		QUALITY_TYPE.QUALITY_LOW = 0;
		QUALITY_TYPE.QUALITY_BASIC =  1;
		QUALITY_TYPE.QUALITY_STANDARD = 2;
		QUALITY_TYPE.QUALITY_HIGH = 3;
		QUALITY_TYPE.QUALITY_VERY_HIGH = 4;
	}
	var bandwidt_models = [];
	var bandwidt_indexes = [];
	bandwidt_models.push("Odd Channel");
	bandwidt_models.push("Even Channel");
	bandwidt_indexes.push(1);
	bandwidt_indexes.push(2);
	replaceListWithValue("select_bandwidth_unit", bandwidt_models, bandwidt_indexes);
	document.getElementById("select_bandwidth_unit").value = 1;

	if (g_current_video_recoder_model.bandwidth_unit > 1){
		document.getElementById("select_bandwidth_unit").style.display = "";
	}
	else {
		document.getElementById("select_bandwidth_unit").style.display = "none";
	}
}

function init_camera_models(){
	var models = [];
	var indexs = [];
	for (i in g_camera_models){
		if (g_current_video_recoder_model.isCameraSupported(g_camera_models[i])){
			models.push(g_camera_models[i].name);
			indexs.push(i);
		}
	}
	//isIntelligentCodec = g_current_camera_model.is_intelligent_codec;
	replaceListWithValue("select_camera_model", models, indexs);

	var index = $('#select_camera_model').val();
	g_current_camera_model = clone(g_camera_models[index]);
	tmp_camera = '';
}

function init_bandwidth_unit(){
	var list = new Units();
	replaceList("select_display_unit", list.name_list);
	document.getElementById("select_display_unit").selectedIndex = DEFAULT_UNIT_INDEX;
	g_unit_selected = DEFAULT_UNIT_INDEX;
}

function init_raid_type(){
	var list = [];
	var index = [];
	var RAIDSTRING = "";
	for (i in g_current_video_recoder_model.support_raid_types){
		RAIDSTRING = RAID_TYPE_STRING[g_current_video_recoder_model.support_raid_types[i]];
		if(RAIDSTRING === "RAID1+0"){
			RAIDSTRING = RAID_TYPE_STRING[g_current_video_recoder_model.support_raid_types[i]].replace("RAID1+0","RAID10");
		}
		list.push(RAIDSTRING);
		index.push(g_current_video_recoder_model.support_raid_types[i]);
	}
	replaceListWithValue("raid_type", list, index);
	document.getElementById("raid_type").selectedIndex = RAID_TYPE.RAID_NONE;
}

function init_hdd_capacity(){
	var list = new Array();
	// g_hdd_list = g_current_nvr_model.supported_hdd_list;
	for ( x in g_hdd_list){
		var capacity;
		if (g_hdd_list[x] < 1024){
			capacity = g_hdd_list[x] + " GB";
		}
		else {
			capacity = (g_hdd_list[x] / 1024) + " TB";
		}
		list.push(capacity);
	}

	replaceList("select_hdd_capacity", list);
}

function init_default_profile_settings(camera){
	init_profile_items(camera);
	for( var i = 0; i < 5; i++)
		camera.current_profiles[i].current_codec = 0;

	for (var j in g_current_video_recoder_model.support_codec_types){
		if(g_current_video_recoder_model.support_codec_types[j] == 4){
			for( var k in camera.support_codecs)	{
				if(camera.support_codecs[k].type == 4)	{
					for( var l = 0; l < 5; l++)
					 	camera.current_profiles[l].current_codec = 4;
				}
			}
		}
	}
	enableCameraoption();
	g_current_video_recoder_model.adjustDefaultSettings(camera);
	g_current_video_recoder_model.adjustCameras(g_current_camera_model);
	document.getElementById("check_use_intelligent_codec").checked = false;
	document.getElementById("check_use_wdr").checked = false;
	document.getElementById("check_use_ssl").checked = false;
	document.getElementById("check_use_half_mode").checked = false;
	document.getElementById("select_analog_camera_resolution_mode").selectedIndex = 0;
	g_current_camera_model.use_intelligent_codec = false;
	g_current_camera_model.use_wdr = false;
	g_current_camera_model.use_ssl = false;
	g_current_camera_model.use_half_mode = false;
	g_current_camera_model.analog_camera_resolution_mode = 0;
	g_current_camera_model.current_profiles[STREAM_MAT] = clone(g_current_camera_model.current_profiles[STREAM_RECORD_TIMELAPS]);
	g_current_camera_model.current_profiles[STREAM_MAT].current_framerate = 1;

	isIntelligentCodec = g_current_camera_model.is_intelligent_codec && g_current_video_recoder_model.intelligent_codec;
	if(isIntelligentCodec){
		document.getElementById("check_use_intelligent_codec").disabled = false;
	}
	else if(g_current_video_recoder_model.type == VIDEO_RECODER_TYPE.HYBRID){
		document.getElementById("check_use_intelligent_codec").disabled = false;
	}
	else if (g_current_video_recoder_model.type == 0){
		if (g_current_video_recoder_model.intelligent_codec){
			document.getElementById("check_use_intelligent_codec").disabled = false;
		}
		else {
			document.getElementById("check_use_intelligent_codec").disabled = true;
		}
	}
	else{
		document.getElementById("check_use_intelligent_codec").disabled = true;
	}

	if(g_current_camera_model.wdr_limit != '0'){
		document.getElementById("check_use_wdr").disabled = false;
		document.getElementById("wdrCheckArea").style.display = "";
	}
	else{
		document.getElementById("check_use_wdr").disabled = true;
		document.getElementById("wdrCheckArea").style.display = "none";
	}
	if(g_current_camera_model.ssl_limit != '0'){
		document.getElementById("check_use_ssl").disabled = false;
		document.getElementById("sslCheckArea").style.display = "";
	}
	else{
		document.getElementById("check_use_ssl").disabled = true;
		document.getElementById("sslCheckArea").style.display = "none";
	}

	// ===== MAT enable / disable 판단 =====
var disableMAT = false;

// 1️⃣ Recorder 자체가 MAT 미지원
if (g_current_video_recoder_model.support_mat == 0) {
    disableMAT = true;
}

// 2️⃣ Hybrid + Analog Camera는 MAT 비활성
else if (g_current_video_recoder_model.type === VIDEO_RECODER_TYPE.HYBRID) {
    if (camera.type === VIDEO_CAMERA_TYPE.ANALOG) {
        disableMAT = true;
    } else {
        disableMAT = false; // IP Camera
    }
}

// 3️⃣ UI 적용
document.getElementById("input_mat_ratio").disabled = disableMAT;
document.getElementById("select_mat_framerate").disabled = disableMAT;

if (disableMAT) {
    document.getElementById("input_mat_ratio").value = 0;
}

	document.getElementById("halfModeCheckArea").style.display = "none";
	document.getElementById("resModSelectArea").style.display =  "none";
	
	document.getElementById("select_analog_camera_resolution_mode").selectedIndex = 0;
	document.getElementById("check_use_half_mode").disabled = false;
	if (g_current_video_recoder_model.type == 0) {
		var resolution_list = [];
		var maxResolution = [];
		var maxPixel = 0;
		resolution_list = g_current_camera_model.support_codecs[0].support_resolution;
		maxResolution = resolution_list[0].name.split('x');
		maxPixel = Math.round(maxResolution[0] * maxResolution[1] / 1000000);
		if (maxPixel === 5) {
			document.getElementById("resModSelectArea").style.display = "";
		}
	}
}

function init_camera_profile_items_analog(camera, profileIndex){
	//지우기
	$("#select_" + STREAM_CONTROL_NAMES[profileIndex] + "_codec").empty();
	$("#select_" + STREAM_CONTROL_NAMES[profileIndex] + "_quality").empty();
	$("#select_" + STREAM_CONTROL_NAMES[profileIndex] + "_resolution").empty();
	$("#select_" + STREAM_CONTROL_NAMES[profileIndex] + "_framerate").empty();

	//init analogResolutionMode
	$("#select_analog_camera_resolution_mode").empty();
	$("#select_analog_camera_resolution_mode").append("<option value='"+RESOLUTION_TYPE.RES_2592_1944+"'>"+RESOLUTION_TYPE_STRING[RESOLUTION_TYPE.RES_2560_1920]+"</option>");
	$("#select_analog_camera_resolution_mode").append("<option value='"+RESOLUTION_TYPE.RES_2560_1440+"'>"+RESOLUTION_TYPE_STRING[RESOLUTION_TYPE.RES_2560_1440]+"</option>");
	$("#select_analog_camera_resolution_mode").append("<option value='"+RESOLUTION_TYPE.RES_1920_1080+"'>"+RESOLUTION_TYPE_STRING[RESOLUTION_TYPE.RES_1920_1080]+"</option>");
	
	//init profile encodings
	$("#select_" + STREAM_CONTROL_NAMES[profileIndex] + "_codec").empty();
	for (x in camera.support_codecs){
		if (g_current_video_recoder_model.support_codec_types.indexOf(camera.support_codecs[x].type) != -1){
			$("#select_" + STREAM_CONTROL_NAMES[profileIndex] + "_codec").append("<option value='"+camera.support_codecs[x].type+"'>"+camera.support_codecs[x].name+"</option>");
		}
	}
	var index = $("#select_" + STREAM_CONTROL_NAMES[profileIndex] + "_codec option").index($("#select_" + STREAM_CONTROL_NAMES[profileIndex] + "_codec option:selected"));


	//init profile quality
	var qualities = camera.support_codecs[index].support_quality;
	for (x in qualities){
		$("#select_" + STREAM_CONTROL_NAMES[profileIndex] + "_quality").append("<option value='"+qualities[x].type+"'>"+qualities[x].name+"</option>");
	}


	//init profile resolution
var $select = $("#select_" + STREAM_CONTROL_NAMES[profileIndex] + "_resolution");
$select.empty();

var resolutions;
var isHybrid = (g_current_video_recoder_model.type === VIDEO_RECODER_TYPE.HYBRID);

// 1️⃣ Resolution source 결정
if (isHybrid) {
    var codecInfo = g_current_camera_model.getCodecInfo(
        g_current_camera_model.current_profiles[profileIndex].current_codec
    );
    resolutions = codecInfo.support_resolution;

    // camera 기준
    for (var i = 1; i < resolutions.length; i++) {
        $select.append(
            "<option value='"+ resolutions[i].type +"'>" +
            resolutions[i].name +
            "</option>"
        );
    }
}
else {
    resolutions = g_current_video_recoder_model.support_resolution_types;

    // recorder 기준
    for (var x in resolutions){
        $select.append(
            "<option value='"+ resolutions[x] +"'>" +
            RESOLUTION_TYPE_STRING[resolutions[x]] +
            "</option>"
        );
    }
}

// 2️⃣ current_resolution에 맞게 선택 복원
var currentRes = g_current_camera_model.current_profiles[profileIndex].current_resolution;

$select.val(currentRes);

// 3️⃣ resIndex 재계산 (이제 절대 -1 안 나옴)
var resIndex = $select.prop("selectedIndex");

// 안전 장치
if (resIndex < 0) {
    resIndex = 0;
    $select.prop("selectedIndex", 0);
}

	//init profile framerate
	for (x in g_analog_dvr_support_ips){
		$("#select_" + STREAM_CONTROL_NAMES[profileIndex] + "_framerate").append("<option value='"+g_analog_dvr_support_ips[x]+"'>"+g_analog_dvr_support_ips[x]+"</option>");
	}

}

function init_camera_profile_items(camera, profileIndex){
	//지우기
	$("#select_" + STREAM_CONTROL_NAMES[profileIndex] + "_codec").empty();
	$("#select_" + STREAM_CONTROL_NAMES[profileIndex] + "_quality").empty();
	$("#select_" + STREAM_CONTROL_NAMES[profileIndex] + "_resolution").empty();
	$("#select_" + STREAM_CONTROL_NAMES[profileIndex] + "_framerate").empty();

	//init profile encodings
	$("#select_" + STREAM_CONTROL_NAMES[profileIndex] + "_codec").empty();
	for (x in camera.support_codecs){
		if (g_current_video_recoder_model.support_codec_types.indexOf(camera.support_codecs[x].type) != -1){
			$("#select_" + STREAM_CONTROL_NAMES[profileIndex] + "_codec").append("<option value='"+camera.support_codecs[x].type+"'>"+camera.support_codecs[x].name+"</option>");
		}
	}
	var index = $("#select_" + STREAM_CONTROL_NAMES[profileIndex] + "_codec option").index($("#select_" + STREAM_CONTROL_NAMES[profileIndex] + "_codec option:selected"));

	//init profile quality
	var qualities = camera.support_codecs[index].support_quality;
	var qualitiesCnt = qualities.length/2;
	if (isDirectIP == 2) {
		var quality_string = "";
		for (var quality_index = 1; quality_index < 8; quality_index++){
			switch(quality_index) {
				case 1:
					quality_string = quality_index + " (Basic)"
					break;
				case 3:
					quality_string = quality_index + " (Standard)"
					break;
				case 5:
					quality_string = quality_index + " (High)"
					break;
				case 7:
					quality_string = quality_index + " (Very High)"
					break;
				default:
					quality_string = quality_index + "";
					break;
			}
			$("#select_" + STREAM_CONTROL_NAMES[profileIndex] + "_quality").append("<option value='"+quality_index+"'>"+quality_string+"</option>");
		}
	}
	else {
		for (x in qualities){
			selectOption = "";
			if(qualitiesCnt == x){
				selectOption = "selected";
			}
			$("#select_" + STREAM_CONTROL_NAMES[profileIndex] + "_quality").append("<option value='"+qualities[x].type+"' "+selectOption+">"+qualities[x].name+"</option>");
		}
	}

	//init profile resolution
	var resolutions = camera.support_codecs[index].support_resolution;
	var resolutionsCnt = resolutions.length/2;
	for (x in resolutions){
		selectOption = "";
		if(resolutionsCnt == x){
			selectOption = "selected";
		}
		if (g_current_video_recoder_model.support_resolution_types.indexOf(resolutions[x].type) != -1){
			$("#select_" + STREAM_CONTROL_NAMES[profileIndex] + "_resolution").append("<option value='"+resolutions[x].type+"' "+selectOption+">"+resolutions[x].name+"</option>");
		}
	}
	var resIndex = $("#select_" + STREAM_CONTROL_NAMES[profileIndex] + "_resolution option").index($("#select_" + STREAM_CONTROL_NAMES[profileIndex] + "_resolution option:selected"));

	if (typeof(resIndex) == "undefined"){
		replaceList("select_" + STREAM_CONTROL_NAMES[profileIndex] + "_framerate", []);
		return;
	}


	//init profile framerate
	var resType = Number(document.getElementById("select_"+STREAM_CONTROL_NAMES[profileIndex]+ "_resolution").value);
	var max_framerate = 30;
	for (var resIdx in resolutions){
		if (resolutions[resIdx].type == resType){
			max_framerate = resolutions[resIdx].max_framerate;
		}
	}
	var framerates;
	if (profileIndex == STREAM_MAT){
		if (g_current_video_recoder_model.direct_ip === 0) {
			framerates = [1,2,3,4,5,10,15];
		}
		else {
			framerates = [1,2,3,4,5];
		}
	}
	else {
		framerates = camera.support_codecs[index].support_framerate;
	}
	var frameratesCnt = framerates.length/2;
	for (x in framerates){
		selectOption = "";
		if(frameratesCnt == x){
			selectOption = "selected";
		}
		if (max_framerate< framerates[x]){
			break;
		}
		$("#select_" + STREAM_CONTROL_NAMES[profileIndex] + "_framerate").append("<option value='"+framerates[x]+"' "+selectOption+">"+framerates[x]+"</option>");
	}
}

function init_profile_items(camera){
	for (x in STREAM_CONTROL_NAMES){
		if (isAnalogCamera(camera)){
			init_camera_profile_items_analog(camera, x);
		}
		else {
			init_camera_profile_items(camera, x);
		}
	}
}

function init_default_ratio_settings(camera){
  $('#input_event_ratio').val(0);
	$('#input_mat_ratio').val(0);
}

function init_default_period_settings(camera){
	$('#input_period_te').val(0);
	$('#input_period_t').val(24);
	$('#input_period_e').val(0);
	$('#input_period_n').val(0);
}

//--------------------------------------------------
//  common
//--------------------------------------------------

function chk_connect_camera(){
	if(g_current_video_recoder_model.connect_cameras.length == 0 ){
		chk_connect_camera_result = false;
	}else{
		chk_connect_camera_result = true;
	}

	return chk_connect_camera_result;
}

function updateCapacityResult(){
	//upate Raid Information
	raid_formula($('#raid_type').val());
	if(chk_connect_camera()){
		updateRequiredDiskCapacity();
		updateRecordableTimeLength();
	}
}

function reflashSelectedCameraList(){
	$("#camera_table").empty();
	var deviceIndex = 0;
	if(g_current_video_recoder_model.connect_cameras.length>0){
		$.each(g_current_video_recoder_model.connect_cameras,function(k,camera){

			g_current_camera_model = camera;

			var liveBitrate = camera.current_profiles[STREAM_LIVE2].current_bitrate*camera.ea; //live2 bitrate;
			var remoteBitrate = camera.current_profiles[STREAM_REMOTE].current_bitrate*camera.ea;
			var recordTimelaps = bandwidth_result_time_laps_calc(camera)*camera.ea;
			var recordEvent =bandwidth_result_events_calc(camera)*camera.ea;

			var totalBitrate = recordTimelaps+recordEvent+liveBitrate+remoteBitrate;
			var row = "<tr>";
			if(camera.name === "Custom Camera"){
				var camera_name = camera.name;
				if(camera.custom_name){
					camera_name = camera.custom_name;
				}
				row += 	"<td width='140px' align='center'><input type='text' name='camera_table_name_"+k+"' data-count='"+k+"' style='width:120px; height:17px;' value='"+camera_name+"' /></td>";
			}else{
				if (camera.max_stream_count === 1) {
					row += 	"<td width='140px' align='center'>"+camera.name+"</td>";
				}
				else {
					row += 	"<td width='140px' align='center'>"+camera.name+"&nbsp;(Ch:"+(camera.channelIndex+1)+")"+"</td>";
				}

			}

			if (camera.deviceIndex != deviceIndex) {
				row += 	"<td width='80px' align='center'>"+camera.ea+"</td>";
			}
			else {
				row += 	"<td width='80px' align='center'> - </td>";
			}
			row += 	"<td width='145px' align='center'>"+g_unit.withUnit(recordTimelaps+recordEvent)+"</td>";
			row += 	"<td width='145px' align='center'>"+g_unit.withUnit(liveBitrate)+"</td>";
			row += 	"<td width='146px' align='center'>"+g_unit.withUnit(remoteBitrate)+"</td>";
			row += 	"<td width='146px' align='center'>"+g_unit.withUnit(totalBitrate)+"</td>";
			row += 	"<td align='center'>";
			row += 	"<button onclick='onClickModifyCameraProfile(this)' value="+k+">Edit</button>";
			row += 	"<button onclick='onClickDelteCameraProfile(this)'  value="+k+">Del</button>";
			if (camera.deviceIndex != deviceIndex) {
				row += "<button onClick='onClickCopyCameraProfile(this)' value="+k+">Copy</button><button onClick='onClickAddChannel(this)' value="+k+">AddChannel</button>"
			}else{
				var url = window.location.href;
				if(url.split(".")[0].replace("https://", "") === "partner") {
					row += "<div style='width:120px; float:right;'>&nbsp;</div>";
				}else{
					row += "<div style='width:21%; float:right;'>&nbsp;</div>";
				}
			}
			row += "</td></tr>";

			$("#camera_table").append(row);
			deviceIndex = camera.deviceIndex;
		});
	}

	$("#camera_bitrate_allocation").empty();
	if (isDirectIP == 2 || g_current_video_recoder_model.type == VIDEO_RECODER_TYPE.HYBRID){
		var max_total_bitrate = 0;
		var max_odd_total_bitrate = 0;
		var max_even_total_bitrate = 0;

		if (g_current_video_recoder_model.bandwidth_unit == 2){
			for (var camera_index in g_current_video_recoder_model.connect_cameras){
				var max_bitrate = 0;
				g_current_camera_model = clone(g_current_video_recoder_model.connect_cameras[camera_index]);
				g_current_camera_model.use_intelligent_codec = false;
				g_current_camera_model.use_wdr = false;
				g_current_camera_model.use_ssl = false;
				g_current_camera_model.use_half_mode = false;
				g_current_camera_model.analog_camera_resolution_mode = 0;
				adjustCamera();
				//for (var profile_index in g_current_camera_model.current_profiles){
				//	max_bitrate = max_bitrate > Math.ceil(g_current_camera_model.current_profiles[profile_index].current_bitrate / 1000) ? max_bitrate : Math.ceil(g_current_camera_model.current_profiles[profile_index].current_bitrate / 1000);
				//}
				record_bandwidth_result = bandwidth_result_time_laps_calc(g_current_camera_model) + bandwidth_result_events_calc(g_current_camera_model);
				max_bitrate = Math.ceil(record_bandwidth_result / 1000);
				//return to original bitrate
				g_current_camera_model = clone(g_current_video_recoder_model.connect_cameras[camera_index]);
				adjustCamera();
				if (g_current_video_recoder_model.connect_cameras[camera_index].channel == 1){
					max_odd_total_bitrate += max_bitrate * g_current_video_recoder_model.connect_cameras[camera_index].ea;
				}
				else {
					max_even_total_bitrate += max_bitrate * g_current_video_recoder_model.connect_cameras[camera_index].ea;
				}
			}
			var total_bitrate = "Max. Total Allocation Throughput : Odd : "+max_odd_total_bitrate+" / "+g_max_total_record_bitrate+", Even : "+max_even_total_bitrate+" / "+g_max_total_record_bitrate;
		}
		else {
			for (var camera_index in g_current_video_recoder_model.connect_cameras){
				if (g_current_video_recoder_model.type == VIDEO_RECODER_TYPE.HYBRID) {
                    var cam = g_current_video_recoder_model.connect_cameras[camera_index];
                    // IP 카메라가 아니면(즉, 아날로그면) 계산에서 제외
                    if (cam.type !== VIDEO_CAMERA_TYPE.NETWORK && cam.type !== VIDEO_CAMERA_TYPE.NETWORK_3RD) {
                        continue; 
                    }
                }
				var max_bitrate = 0;
				g_current_camera_model = clone(g_current_video_recoder_model.connect_cameras[camera_index]);
				g_current_camera_model.use_intelligent_codec = false;
				g_current_camera_model.use_wdr = false;
				g_current_camera_model.use_ssl = false;
				g_current_camera_model.use_half_mode = false;
				g_current_camera_model.analog_camera_resolution_mode = 0;
				adjustCamera();
				//for (var profile_index in g_current_camera_model.current_profiles){
				//	max_bitrate = max_bitrate > Math.ceil(g_current_camera_model.current_profiles[profile_index].current_bitrate / 1000) ? max_bitrate : Math.ceil(g_current_camera_model.current_profiles[profile_index].current_bitrate / 1000);
				//}
				record_bandwidth_result = bandwidth_result_time_laps_calc(g_current_camera_model) + bandwidth_result_events_calc(g_current_camera_model);
				max_bitrate = Math.ceil(record_bandwidth_result / 1000);
				//return to original bitrate
				g_current_camera_model = clone(g_current_video_recoder_model.connect_cameras[camera_index]);
				//adjustCamera();
				max_total_bitrate += max_bitrate * g_current_video_recoder_model.connect_cameras[camera_index].ea;
			}
			var total_bitrate = "Max. Total Allocation Throughput : "+max_total_bitrate+" / "+g_max_total_record_bitrate;
		}
		$("#camera_bitrate_allocation").append(total_bitrate);
	}
}

function onChangeCameraCount(){
	var ea = parseInt($("#select_camera_count").val()); //카메라 수량
	var cameraSlot = 1;
	var maxPixel = 0;
    var ips = 0;
    var maxResolution = [];
	switch (g_current_camera_model.type){
		case VIDEO_CAMERA_TYPE.ANALOG :
		case VIDEO_CAMERA_TYPE.DUMMY_ANALOG : {
			var analogResolutions = g_current_camera_model.support_codecs[0].support_resolution;
            maxResolution = analogResolutions[0].name.split('x');
			if (g_current_camera_model.use_half_mode) {
				maxResolution[0] = maxResolution[0] / 2;
			}
            maxPixel = Math.round(maxResolution[0] * maxResolution[1] / 1000000);
			if (g_current_camera_model.current_profiles[STREAM_RECORD_TIMELAPS].current_framerate > ips) {
				ips = g_current_camera_model.current_profiles[STREAM_RECORD_TIMELAPS].current_framerate
			}
			if (g_current_camera_model.current_profiles[STREAM_RECORD_EVENT].current_framerate > ips) {
				ips = g_current_camera_model.current_profiles[STREAM_RECORD_EVENT].current_framerate
			}
            cameraSlot = ea * g_current_video_recoder_model.calculateCameraSlot(maxPixel, ips);
			if (g_current_video_recoder_model.connectedAnalogCameraCount() + cameraSlot > g_current_video_recoder_model.max_analog_camera_count){
				while (g_current_video_recoder_model.connectedAnalogCameraCount() + cameraSlot > g_current_video_recoder_model.max_analog_camera_count) {
					ea--;
					cameraSlot = ea * g_current_video_recoder_model.calculateCameraSlot(maxPixel, ips);
				}
				alert("You can select up to "+ ea +" units.");
				document.getElementById("select_camera_count").value = 1;
			}
			break;
		}
		case VIDEO_CAMERA_TYPE.NETWORK :
		case VIDEO_CAMERA_TYPE.DUMMY_NETWORK :
		case VIDEO_CAMERA_TYPE.NETWORK_3RD : {
			maxPixel = 0;
 			maxResolution = [];
			var resolutions = g_current_camera_model.support_codecs[0].support_resolution;
			for (var x in resolutions){
				if (g_current_video_recoder_model.support_resolution_types.indexOf(resolutions[x].type) != -1){
					maxResolution = resolutions[x].name.split('x');
				}
			}
			maxPixel = Math.round(maxResolution[0] * maxResolution[1] / 1000000);
			if(isDirectIP == 2 || g_current_camera_model.name == "Custom Camera"){
				cameraSlot = ea;
			}
			else {
				cameraSlot = ea * g_current_video_recoder_model.calculateCameraSlot(maxPixel, ips);
			}
			if (g_current_video_recoder_model.connectedNetworkCameraCount() + cameraSlot > g_current_video_recoder_model.max_network_camera_count){
				while (g_current_video_recoder_model.connectedNetworkCameraCount() + cameraSlot > g_current_video_recoder_model.max_network_camera_count) {
					ea--;
					if(isDirectIP == 2 || g_current_camera_model.name == "Custom Camera"){
						cameraSlot = ea;
					}
					else {
						cameraSlot = ea * g_current_video_recoder_model.calculateCameraSlot(maxPixel, ips);
					}
				}
				alert("You can select up to "+ ea +" units.");
				document.getElementById("select_camera_count").value = 1;
			}
			break;
		}
	}
}

function isAnalogCamera(cam){
	return (cam.type == VIDEO_CAMERA_TYPE.ANALOG) || (cam.type == VIDEO_CAMERA_TYPE.DUMMY_ANALOG);
}

function update_g_current_camera_model(){
	g_current_camera_model.use_intelligent_codec = document.getElementById("check_use_intelligent_codec").checked;
	g_current_camera_model.use_wdr = document.getElementById("check_use_wdr").checked;
	g_current_camera_model.use_ssl = document.getElementById("check_use_ssl").checked;
	g_current_camera_model.use_half_mode = document.getElementById("check_use_half_mode").checked;
	g_current_camera_model.analog_camera_resolution_mode = document.getElementById("select_analog_camera_resolution_mode").selectedIndex;

	//profile
	for (x in STREAM_CONTROL_NAMES){
		g_current_camera_model.current_profiles[x].current_codec = parseInt($('#select_'+STREAM_CONTROL_NAMES[x]+'_codec').val());
		g_current_camera_model.current_profiles[x].current_framerate = parseInt($('#select_'+STREAM_CONTROL_NAMES[x]+'_framerate').val());
		g_current_camera_model.current_profiles[x].current_quality = parseInt($('#select_'+STREAM_CONTROL_NAMES[x]+'_quality').val());
		g_current_camera_model.current_profiles[x].current_resolution = parseInt($('#select_'+STREAM_CONTROL_NAMES[x]+'_resolution').val());
		if (x == STREAM_MAT){
			g_current_camera_model.current_profiles[x].current_codec = g_current_camera_model.current_profiles[STREAM_RECORD_TIMELAPS].current_codec;
			g_current_camera_model.current_profiles[x].current_quality = g_current_camera_model.current_profiles[STREAM_RECORD_TIMELAPS].current_quality;
			g_current_camera_model.current_profiles[x].current_resolution = g_current_camera_model.current_profiles[STREAM_RECORD_TIMELAPS].current_resolution;
			if (parseInt($('#select_'+STREAM_CONTROL_NAMES[x]+'_framerate').val()) > g_current_camera_model.current_profiles[STREAM_RECORD_TIMELAPS].current_framerate) {
				g_current_camera_model.current_profiles[x].current_framerate = g_current_camera_model.current_profiles[STREAM_RECORD_TIMELAPS].current_framerate;
			}
			else {
				g_current_camera_model.current_profiles[x].current_framerate = parseInt($('#select_'+STREAM_CONTROL_NAMES[x]+'_framerate').val());
			}
		}
		if (g_current_camera_model.name == "Custom Camera"){
			g_current_camera_model.current_profiles[x].current_bitrate = g_unit.changeOtherUnit(parseFloat(document.getElementById("input_" + STREAM_CONTROL_NAMES[x] + "_bandwidth").value), 1);
		}
		else if (g_current_camera_model.name == "DC-D4511WERX" || g_current_camera_model.name ==  "DC-D4531WERX") {
			g_current_camera_model.current_profiles[x].current_bitrate = g_unit.changeOtherUnit(parseFloat(document.getElementById("input_" + STREAM_CONTROL_NAMES[x] + "_bandwidth").value), 1);
		}
	}

	//event_ratio
	g_current_camera_model.event_ratio = parseInt($('#input_event_ratio').val())/100;
	g_current_camera_model.mat_ratio = parseInt($('#input_mat_ratio').val())/100;

	//record_period
	g_current_camera_model.record_period.TE = parseInt($('#input_period_te').val());
	g_current_camera_model.record_period.T = parseInt($('#input_period_t').val());
	g_current_camera_model.record_period.E = parseInt($('#input_period_e').val());
	g_current_camera_model.record_period.N = parseInt($('#input_period_n').val());

	//bitrate
	///Recoder에서 조정되거나 새로 계산되는 bitrate를 적용
	g_current_camera_model = adjustRecorderBitrate();
}

function update_detail_ui(){
	document.getElementById("check_use_intelligent_codec").checked = g_current_camera_model.use_intelligent_codec;
	document.getElementById("check_use_wdr").checked = g_current_camera_model.use_wdr;
	document.getElementById("check_use_ssl").checked = g_current_camera_model.use_ssl;
	document.getElementById("check_use_half_mode").checked = g_current_camera_model.use_half_mode;
	document.getElementById("select_analog_camera_resolution_mode").selectedIndex = g_current_camera_model.analog_camera_resolution_mode;

	if(g_current_camera_model.name == "Custom Camera"){
		g_current_camera_model.adjustProfiles();
		for(x in STREAM_CONTROL_NAMES) {
			document.getElementById("input_"+STREAM_CONTROL_NAMES[x]+"_bandwidth").disabled = false;
			document.getElementById("select_"+STREAM_CONTROL_NAMES[x]+"_quality").disabled = false;
		}
	}
	else if (g_current_camera_model.name == "DC-D4511WERX" || g_current_camera_model.name ==  "DC-D4531WERX") {
		g_current_camera_model.adjustProfiles();
		for(x in STREAM_CONTROL_NAMES) {
			document.getElementById("input_"+STREAM_CONTROL_NAMES[x]+"_bandwidth").disabled = false;
			document.getElementById("select_"+STREAM_CONTROL_NAMES[x]+"_quality").disabled = true;
		}
	}
	else {
		for(x in STREAM_CONTROL_NAMES) {
			document.getElementById("input_"+STREAM_CONTROL_NAMES[x]+"_bandwidth").disabled = true;
			document.getElementById("select_"+STREAM_CONTROL_NAMES[x]+"_quality").disabled = false;
		}
	}

	//profile
	for (var x in STREAM_CONTROL_NAMES){
		if (x == STREAM_MAT) {
			$('#select_'+STREAM_CONTROL_NAMES[x]+'_codec').val(g_current_camera_model.current_profiles[STREAM_RECORD_TIMELAPS].current_codec);
			$('#select_'+STREAM_CONTROL_NAMES[x]+'_quality').val(g_current_camera_model.current_profiles[STREAM_RECORD_TIMELAPS].current_quality);
			$('#select_'+STREAM_CONTROL_NAMES[x]+'_resolution').val(g_current_camera_model.current_profiles[STREAM_RECORD_TIMELAPS].current_resolution);

			$("#select_" + STREAM_CONTROL_NAMES[x] + "_framerate").empty();
			var framerates;
			if (g_current_video_recoder_model.direct_ip === 0) {
				framerates = [1,2,3,4,5,10,15];
			}
			else {
				framerates = [1,2,3,4,5];
			}

			for (var frameIndex in framerates){
				$("#select_" + STREAM_CONTROL_NAMES[x] + "_framerate").append("<option value='"+framerates[frameIndex]+"' "+selectOption+">"+framerates[frameIndex]+"</option>");
			}
			if (typeof(g_current_camera_model.current_profiles[x].current_framerate) == "undefined") {
				$('#select_'+STREAM_CONTROL_NAMES[x]+'_framerate').val(1);
			}
			else {
				$('#select_'+STREAM_CONTROL_NAMES[x]+'_framerate').val(g_current_camera_model.current_profiles[x].current_framerate);
			}
		}
		else {
			$('#select_'+STREAM_CONTROL_NAMES[x]+'_codec').val(g_current_camera_model.current_profiles[x].current_codec);
			$('#select_'+STREAM_CONTROL_NAMES[x]+'_quality').val(g_current_camera_model.current_profiles[x].current_quality);
			$('#select_'+STREAM_CONTROL_NAMES[x]+'_resolution').val(g_current_camera_model.current_profiles[x].current_resolution);
			//re init profile framerate
			$("#select_" + STREAM_CONTROL_NAMES[x] + "_framerate").empty();
			var resolutions = g_current_camera_model.getCodecInfo(g_current_camera_model.current_profiles[x].current_codec).support_resolution;
			var resType = Number(document.getElementById("select_"+STREAM_CONTROL_NAMES[x]+ "_resolution").value);
			for (var resIdx in resolutions){
				if (resolutions[resIdx].type == resType){
					max_framerate = resolutions[resIdx].max_framerate;
				}
			}
			var max_framerate
			var framerates = g_current_camera_model.getCodecInfo(g_current_camera_model.current_profiles[x].current_codec).support_framerate;
			for (var frameIndex in framerates){
				if (max_framerate < framerates[frameIndex]){
					break;
				}
				$("#select_" + STREAM_CONTROL_NAMES[x] + "_framerate").append("<option value='"+framerates[frameIndex]+"' "+selectOption+">"+framerates[frameIndex]+"</option>");
			}
			$('#select_'+STREAM_CONTROL_NAMES[x]+'_framerate').val(g_current_camera_model.current_profiles[x].current_framerate);
		}
	}

	//event_ratio
	if(isNaN(g_current_camera_model.event_ratio)) g_current_camera_model.event_ratio=0;
	if(isNaN(g_current_camera_model.mat_ratio)) g_current_camera_model.mat_ratio=0;
	$('#input_event_ratio').val(parseInt(g_current_camera_model.event_ratio*100));
	$('#input_mat_ratio').val(parseInt(g_current_camera_model.mat_ratio*100));

	//record_period
	$('#input_period_te').val(g_current_camera_model.record_period.TE);
	$('#input_period_t').val(g_current_camera_model.record_period.T);
	$('#input_period_e').val(g_current_camera_model.record_period.E);
	$('#input_period_n').val(g_current_camera_model.record_period.N);

	///bitrate 출력
	for (x in STREAM_CONTROL_NAMES){
		$('#input_'+STREAM_CONTROL_NAMES[x]+'_bandwidth').val(g_unit.withUnit(g_current_camera_model.current_profiles[x].current_bitrate));
	}

	//result
	var bandwidth_result_time_laps = bandwidth_result_time_laps_calc(g_current_camera_model);
	var bandwidth_result_events = bandwidth_result_events_calc(g_current_camera_model);

	$('#bandwidth_result_time_lapse').text(g_unit.withUnit(bandwidth_result_time_laps));
	$('#bandwidth_result_events').text(g_unit.withUnit(bandwidth_result_events));
	$('#bandwidth_result_total').text(g_unit.withUnit(bandwidth_result_time_laps+bandwidth_result_events));
}

function bandwidth_result_time_laps_calc(camera){
	var result = camera.current_profiles[STREAM_RECORD_TIMELAPS].current_bitrate*(camera.record_period.TE*(1-camera.event_ratio))*(1-camera.mat_ratio)/24;
	result += camera.current_profiles[STREAM_RECORD_TIMELAPS].current_bitrate*camera.record_period.T*(1-camera.mat_ratio)/24;
	result += camera.current_profiles[STREAM_MAT].current_bitrate*(camera.record_period.TE*(1-camera.event_ratio))*(camera.mat_ratio)/24;
	result += camera.current_profiles[STREAM_MAT].current_bitrate*camera.record_period.T*(camera.mat_ratio)/24;

	return result;
}

function bandwidth_result_events_calc(camera){
	var result = camera.current_profiles[STREAM_RECORD_EVENT].current_bitrate * (camera.record_period.TE*camera.event_ratio)/24;
	result += camera.current_profiles[STREAM_RECORD_EVENT].current_bitrate * (camera.record_period.E*camera.event_ratio)/24;

	return result;
}

function requiredDiskCapacity(recordDuration){ //sec
	g_current_video_recoder_model.calculateBitrate(g_current_video_recoder_model);
	g_total_record_bitrate = 0;
	for(i in g_current_video_recoder_model.connect_cameras){
		g_total_record_bitrate += (bandwidth_result_time_laps_calc(g_current_video_recoder_model.connect_cameras[i]) + bandwidth_result_events_calc(g_current_video_recoder_model.connect_cameras[i])) * g_current_video_recoder_model.connect_cameras[i].ea;
	}
	var size = g_total_record_bitrate;
	var raid_type_index = $('#raid_type').val();
	return size * recordDuration * raid_formula(raid_type_index);
}

function recordableTimeLength(diskCapacity){
	var totalBitrate = requiredDiskCapacity(1);
	var capacity = diskCapacity * 1000 * 1000 * 8;

	return Math.round(capacity / totalBitrate);
}

function raid_formula(index){
	/*
	0 : No RAID
	2 : RAID 1
	8 : RAID 1+0
	6 : RAID 5
	7 : RAID 6
	*/
	$("#label_raid_hdd").empty();
	var num = 1;
	var weight = 1;
	var raid_hdd_info;
	index = parseInt(index);

	if (index != 0){
		switch(index){
			case RAID_TYPE.RAID_1 :
				num = 2;
				weight = 2;
				break;
			case RAID_TYPE.RAID_5 :
				if (g_current_video_recoder_model.direct_ip == 0 && (!g_current_video_recoder_model.name.includes("IR-"||"PF-SV"))){
					num = 3;
					weight = 1.5;
				}
				else {
					num = 4;
					weight = 4/3;
				}
				break;
			case RAID_TYPE.RAID_6 :
				if (g_current_video_recoder_model.direct_ip == 0){
					num = 4;
					weight = 2;
				}
				else {
					num = 8;
					weight = 4/3;
				}
				break;
			case RAID_TYPE.RAID_10 :
				num = 4;
				weight = 2;
				break;
			default:
				break;
		}
		if (g_current_video_recoder_model.bandwidth_unit == 2){
			num *= 2;
		}
		raid_hdd_info = "Minimum Required HDD Quantity : " + num;
		if(g_current_video_recoder_model.bandwidth_unit === 2){
			raid_hdd_info += "&nbsp;(Odd: " + (num/2) + " / Even: " + (num/2) + ")";
		}
		$("#label_raid_hdd").append(raid_hdd_info);
	}
	else if (g_current_video_recoder_model.bandwidth_unit == 2){
		raid_hdd_info = "Minimum Required HDD Quantity : 2&nbsp;(Odd: 1 / Even: 1)";
		$("#label_raid_hdd").append(raid_hdd_info);
	}
	else if (g_current_video_recoder_model.bandwidth_unit == 1){
		raid_hdd_info = "Minimum Required HDD Quantity : 1";
		$("#label_raid_hdd").append(raid_hdd_info);
	}
	return weight;
}

//필요 용량 계산
function updateRequiredDiskCapacity(){
	var durations = ["1 Hour", "1 Day", "1 Week", "1 Month"];
	var duration_per_hour = [1, 24, 24 * 7, 24 * 30];
	var table = $('#capacity_result_table');

	var durationNum = Number($('#record_duration_value').val());
	var units = document.getElementById("record_duration_unit");

	durations = new Array();
	durations.push(durationNum + " " + units.options[units.selectedIndex].value);

	var base = duration_per_hour[units.selectedIndex];
	duration_per_hour = new Array();
	duration_per_hour.push(base* durationNum);

	var kbps = requiredDiskCapacity(duration_per_hour[0] * 60 * 60);

	/*
	1kbps = 0.000000000001 PB
	1kbps = 0.000000001 TB
	1kbps = 0.000001 GB
	1kbps = 0.001 MB
	*/

	//var CapcityNum = Number(document.getElementById("record_capcity_value"));
	var units2 = document.getElementById("record_capcity_unit");

	var kbps = kbps/8;

	var quantity_recorder = $('#quantity_recorder').val();

	var capacity_value = (((kbps*(1/Math.pow(1000,(4-units2.selectedIndex)))).toFixed(2))*quantity_recorder).toFixed(2);
	if(capacity_value > g_current_video_recoder_model.max_hdd_capacity && g_current_video_recoder_model.e_sata)
		alert('The default storage capacity of the selected recorder has been exceeded. We recommend using e-SATA storage.');
	$('#record_capcity_value').empty().append(capacity_value);
}

//필요 시간 계산
function updateRecordableTimeLength(){
	var diskCapacity = [g_current_hdd_size];
	var table = $('#time_length_result_table');

	var capacity = Number($("#disk_capacity_value").val());
	var capacity_unit = $('#disk_capacity_unit option').index($("#disk_capacity_unit option:selected"));
	diskCapacity = new Array();
	if (capacity_unit == 0){
		capacity = capacity * 1000 * 1000;
	}else if(capacity_unit == 1){
		capacity = capacity * 1000;
	}

	diskCapacity.push(capacity);

	var recordingTime = recordableTimeLength(diskCapacity);
	var capacity_bit = diskCapacity * 1000 *1000 * 8 ;

	var quantity_recorder = $('#quantity_recorder').val();

	$(table).find('tr:eq(1) td:eq(1)').empty().append(addNumCommas(((recordingTime / (60 * 60) * 10) / 10 * quantity_recorder).toFixed(2)));
	$(table).find('tr:eq(1) td:eq(2)').empty().append(addNumCommas(((recordingTime / (60 * 60 * 24) * 10) / 10 * quantity_recorder).toFixed(2)));
	$(table).find('tr:eq(1) td:eq(3)').empty().append(addNumCommas(((recordingTime / (60 * 60 * 24 * 7) * 10) / 10 * quantity_recorder).toFixed(2)));
	$(table).find('tr:eq(1) td:eq(4)').empty().append(addNumCommas(((recordingTime / (60 * 60 * 24 * 30) * 10) / 10 * quantity_recorder).toFixed(2)));
}

function updateResult(){
	updateRequiredDiskCapacity();
	updateRecordableTimeLength();
}

function setReportFrom(){
	var result = new Object();

	result.recordable_time_length = {"capacity":$('#disk_capacity_value').val()+$('#disk_capacity_unit option:selected').text(),"hour":$('#time_length_result_table tr:eq(1) td:eq(1)').text(),"day":$('#time_length_result_table tr:eq(1) td:eq(2)').text(),"week":$('#time_length_result_table tr:eq(1) td:eq(3)').text(),"month":$('#time_length_result_table tr:eq(1) td:eq(4)').text()};
	result.required_disk_capacity = {"duration":$("#record_duration_value").val()+$("#record_duration_unit option:selected").text(),"capacity":$("#record_capcity_value").text()+$("#record_capcity_unit option:selected").text()};
	result.recorder_quantity = $("#quantity_recorder").val();
	result.recorder_raid = $("#raid_type option:selected").text();
	result.unit = $("#select_display_unit").val();
	result.intelligent_codec = $("#check_use_intelligent_codec").prop("checked");
	result.wdr = $("#check_use_wdr").prop("checked");
	result.ssl = $("#check_use_ssl").prop("checked");
	result.half_mode = $("#check_use_half_mode").prop("checked");
	result.resolution_mode = $("#select_analog_camera_resolution_mode").prop("selected");

	$("input[name^='camera_table_name']").each(function(k, v){
		var count_number = $(this).data("count");
		if(g_current_video_recoder_model.connect_cameras[count_number].name === 'Custom Camera'){
			g_current_video_recoder_model.connect_cameras[count_number].custom_name = v.value;
		}
	});
	var tmp_report_model = clone(g_current_video_recoder_model);
	if (isDirectIP == 2) {
		var modifyQuality = [];
		modifyQuality.push({type:1, name:'1 (Basic)'});
		modifyQuality.push({type:2, name:'2'});
		modifyQuality.push({type:3, name:'3 (Standard)'});
		modifyQuality.push({type:4, name:'4'});
		modifyQuality.push({type:5, name:'5 (High)'});
		modifyQuality.push({type:6, name:'6'});
		modifyQuality.push({type:7, name:'7 (Very High)'});
		for (var i in tmp_report_model.connect_cameras) {
			for (var j in tmp_report_model.connect_cameras[i].support_codecs) {
				tmp_report_model.connect_cameras[i].support_codecs[j].support_quality = modifyQuality;
			}
		}
	}
	$('#report_data_result').val(JSON.stringify(result));
	$('#report_data').val(JSON.stringify(tmp_report_model));
}

function setProjectSaveFrom(){
	var result = new Object();

	result.recorder_quantity = $("#quantity_recorder").val();
	result.recorder_raid = $("#raid_type option:selected").text();
	result.unit = $("#select_display_unit").val();
	result.discontinued = $('#discontinued').val();
	result.disk_capacity_value = $('#disk_capacity_value').val();
	result.disk_capacity_unit = $('#disk_capacity_unit option:selected').text();
	result.record_duration_value = $('#record_duration_value').val();
	result.record_duration_unit = $('#record_duration_unit option:selected').text();
	result.record_capcity_unit = $('#record_capcity_unit option:selected').text();
	result.intelligent_codec = $("#check_use_intelligent_codec").prop("checked");
	result.wdr = $("#check_use_wdr").prop("checked");
	result.ssl = $("#check_use_ssl").prop("checked");
	result.half_mode = $("#check_use_half_mode").prop("checked");
	result.resolution_mode = $("#select_analog_camera_resolution_mode").prop("selected");

	$("input[name^='camera_table_name']").each(function(k, v){
		var count_number = $(this).data("count");
		if(g_current_video_recoder_model.connect_cameras[count_number].name === 'Custom Camera'){
			g_current_video_recoder_model.connect_cameras[count_number].custom_name = v.value;
		}
	});

	$('#project_save_data_result').val(JSON.stringify(result));
	$('#project_save_data').val(JSON.stringify(g_current_video_recoder_model));
	$('#project_name').val($('#tab li.on',parent.document).text());
}

function saveLoadConfData(){
	$('#select_display_unit').val(save_conf_data.unit);
	$('#discontinued').val(save_conf_data.discontinued);

	//레코더 불러와서 적용
	$('#select_nvr_model option').each(function(i,e){
		if(save_calcul_data.name==$(this).text()){
			$('#select_nvr_model option:eq('+i+')').attr("selected", true);
		}
	});
	onChangeNVRModel();

	$('#quantity_recorder').val(save_conf_data.recorder_quantity);
	$("#raid_type").val(save_conf_data.recorder_raid).attr("selected", true);

	//카메라 불러와서 적용
	$.each(save_calcul_data.connect_cameras,function(i,e){
		for( j in g_camera_models){
			if(g_camera_models[j].name==e.name){
				//기본세팅
				g_current_camera_model = clone(g_camera_models[j]);

				g_current_camera_model.record_period = STREAM_RECORD_PERIOD;

				init_default_profile_settings(g_current_camera_model);
				init_default_ratio_settings(g_current_camera_model);
				init_default_period_settings(g_current_camera_model);

				update_g_current_camera_model();

				g_current_camera_model.ea = 1;
				if(e.custom_name){
					g_current_camera_model.custom_name = e.custom_name;
				}

				g_current_video_recoder_model.addCamera(g_current_camera_model);

				reflashSelectedCameraList();

				updateResult();
			}
		}
	});

	$('#disk_capacity_value').val(save_conf_data.disk_capacity_value);
	$('#disk_capacity_unit').val(save_conf_data.disk_capacity_unit).attr("selected", true);

	$('#record_duration_value').val(save_conf_data.record_duration_value);
	$('#record_duration_unit').val(save_conf_data.record_duration_unit).attr("selected", true);

	$('#record_capcity_unit').val(save_conf_data.record_capcity_unit).attr("selected", true);
}

function saveLoadCalculData(){
	for(i in g_current_video_recoder_model.connect_cameras){
		//저장 했던 connect_cameras 를 적용
		var g_current_profiles = g_current_video_recoder_model.connect_cameras[i].current_profiles;
		for(j in g_current_profiles){
			g_current_profiles[j] = save_calcul_data.connect_cameras[i].current_profiles[j];
		}

		//저장 했던 record_period 를 적용
		g_current_video_recoder_model.connect_cameras[i].record_period = save_calcul_data.connect_cameras[i].record_period;

		//ea 적용
		g_current_video_recoder_model.connect_cameras[i].ea = save_calcul_data.connect_cameras[i].ea;

		//event_ratio 적용
		g_current_video_recoder_model.connect_cameras[i].event_ratio = save_calcul_data.connect_cameras[i].event_ratio;
		g_current_video_recoder_model.connect_cameras[i].mat_ratio = save_calcul_data.connect_cameras[i].mat_ratio;

		// channelIndex, deviceIndex 적용
		g_current_video_recoder_model.connect_cameras[i].channelIndex = save_calcul_data.connect_cameras[i].channelIndex;
		g_current_video_recoder_model.connect_cameras[i].deviceIndex = save_calcul_data.connect_cameras[i].deviceIndex;
	}

	reflashSelectedCameraList();
	updateResult();
}

function isNumber(event){
	ele = event;
	event = event || window.event;
	var keyID = (event.which) ? event.which : event.keyCode;
	if( ( keyID >=48 && keyID <= 57 ) || ( keyID >=96 && keyID <= 105 ) )
	{
		return;
	}
	else
	{
		return false;
	}
	/* 48~57:일반 숫자키 코드, 96~105:숫자키패드 숫자키 코드 */
}

function adjustRecorderBitrate(){

	tmp_g_current_video_recoder_model = clone(g_current_video_recoder_model);
	tmp_g_current_video_recoder_model.connect_cameras = new Array();

	if(!tmp_g_current_video_recoder_model.addCamera(g_current_camera_model)){
		return;
	}
	tmp_g_current_video_recoder_model.calculateBitrate(tmp_g_current_video_recoder_model);

	return tmp_g_current_video_recoder_model.connect_cameras[0];
}

function adjustCamera(){
	if(g_current_camera_model.type == 3){
		for (x in STREAM_CONTROL_NAMES){
			var resolutions = g_current_camera_model.getCodecInfo(g_current_camera_model.current_profiles[x].current_codec).support_resolution;
			var resType = Number(document.getElementById("select_"+STREAM_CONTROL_NAMES[x]+ "_resolution").value);
			g_current_camera_model.adjustProfiles(g_current_camera_model.current_profiles[x]);
			var max_framerate = 30;
			for (var resIdx in resolutions){
				if (resolutions[resIdx].type == resType){
					max_framerate = resolutions[resIdx].max_framerate;
				}
			}
			g_current_camera_model.current_profiles[x].current_framerate = (g_current_camera_model.current_profiles[x].current_framerate > max_framerate) ? max_framerate : g_current_camera_model.current_profiles[x].current_framerate;
		}
	}
	g_current_video_recoder_model.adjustCameras(g_current_camera_model);
	g_current_camera_model = adjustRecorderBitrate();
}

function checkDirectIPLimit(mode, camera, max_total_recording_bitrate, max_single_bitrate){
	//limit_camera = clone(camera); 옵션 변경 전 체크
	var max_bitrate = 0;
	var max_total_bitrate = 0;
	var max_real_bitrate = 0;
	var added_camera = adjustRecorderBitrate();
	var codecInfo = camera.getCodecInfo(camera.current_profiles[0].current_codec);
    var maxResolution = codecInfo.support_resolution[codecInfo.support_resolution.length - 1].type;
    var maxRes = RESOLUTION_TYPE_STRING[maxResolution].split('x');
    var maxResFactor = Math.round(maxRes[0] * maxRes[1] / 1000000);
	var isConstraint = false;
	var tempCamera = clone(g_current_camera_model);
	if (RESOLUTION_TYPE_STRING[maxResolution] == "2048x1536"){
		maxResFactor--;
	}
	if (document.getElementById("select_"+STREAM_CONTROL_NAMES[0]+"_quality").disabled == true ||
		document.getElementById("select_"+STREAM_CONTROL_NAMES[0]+"_framerate").disabled == true ||
		document.getElementById("select_"+STREAM_CONTROL_NAMES[0]+"_resolution").disabled == true){
		isConstraint = true;
	}

	g_current_video_recoder_model.calculateBitrate(g_current_video_recoder_model);
	for (var camera_index in g_current_video_recoder_model.connect_cameras){
		max_bitrate = 0;
		if (g_current_video_recoder_model.connect_cameras[camera_index].channel == camera.channel){
			g_current_camera_model = clone(g_current_video_recoder_model.connect_cameras[camera_index]);
			g_current_camera_model.use_intelligent_codec = false;
			g_current_camera_model.use_wdr = false;
			g_current_camera_model.use_ssl = false;
			adjustCamera();
			for (var profile_index in g_current_camera_model.current_profiles){
				max_bitrate = max_bitrate > Math.ceil(g_current_camera_model.current_profiles[profile_index].current_bitrate / 1000) ? max_bitrate : Math.ceil(g_current_camera_model.current_profiles[profile_index].current_bitrate / 1000);
			}
			max_total_bitrate += max_bitrate * g_current_camera_model.ea;
		}

	}
	g_current_camera_model = clone(g_limit_camera);
	g_current_camera_model.use_intelligent_codec = false;
	g_current_camera_model.use_wdr = false;
	g_current_camera_model.use_ssl = false;
	adjustCamera();
	for (var profile_index in camera.current_profiles){
		max_real_bitrate = max_real_bitrate > Math.ceil(g_current_camera_model.current_profiles[profile_index].current_bitrate / 1000) ? max_real_bitrate : Math.ceil(g_current_camera_model.current_profiles[profile_index].current_bitrate / 1000);
	}

	if(mode == CAMERA_SETTING_MODE_INSERT){
		g_current_camera_model = clone(camera);
		g_current_camera_model.use_intelligent_codec = false;
		g_current_camera_model.use_wdr = false;
		g_current_camera_model.use_ssl = false;
		adjustCamera();
		for (var profile_index in g_current_camera_model.current_profiles){
			if (Math.ceil(g_current_camera_model.current_profiles[profile_index].current_bitrate / 1000) > max_single_bitrate ||
				max_total_bitrate > max_total_recording_bitrate){
				alert("The camera can't be added due to exceeding maximum bitrate. Please adjust the stream settings.");
				g_current_video_recoder_model.eraseCamera(g_current_video_recoder_model.connect_cameras.length-1);
				return false;
			}
		}
		g_current_camera_model = clone(tempCamera);
		return true;
	}
	// added_camera : option changed camera
	// g_limit_camera : before option changed camera
	else if (mode == CAMERA_SETTING_MODE_MODIFY){
		while (document.getElementById("select_"+STREAM_CONTROL_NAMES[STREAM_LIVE2]+"_resolution").disabled == false &&
				document.getElementById("select_"+STREAM_CONTROL_NAMES[STREAM_LIVE2]+"_resolution").selectedIndex > document.getElementById("select_"+STREAM_CONTROL_NAMES[STREAM_LIVE1]+"_resolution").selectedIndex){
			document.getElementById("select_"+STREAM_CONTROL_NAMES[STREAM_LIVE2]+"_resolution").selectedIndex--;
		}
		while (document.getElementById("select_"+STREAM_CONTROL_NAMES[STREAM_REMOTE]+"_resolution").disabled == false &&
				document.getElementById("select_"+STREAM_CONTROL_NAMES[STREAM_REMOTE]+"_resolution").selectedIndex > document.getElementById("select_"+STREAM_CONTROL_NAMES[STREAM_LIVE2]+"_resolution").selectedIndex){
			document.getElementById("select_"+STREAM_CONTROL_NAMES[STREAM_REMOTE]+"_resolution").selectedIndex--;
		}
		g_current_camera_model = clone(tempCamera);
		update_g_current_camera_model();
		for (var profile_index in camera.current_profiles){
			if (g_setting_mode == CAMERA_SETTING_MODE_INSERT){
				if (isConstraint){
					if (max_total_bitrate + 5 > max_total_recording_bitrate){
						alert("The camera settings can't be applied due to exceeding the maximum bitrate. Please adjust the stream settings of other cameras.");
						return false;
					}
				}
				else if (!isConstraint && maxResFactor > 2){
					if (max_total_bitrate + 2 > max_total_recording_bitrate){
						alert("The camera settings can't be applied due to exceeding the maximum bitrate. Please adjust the stream settings of other cameras.");
						return false;
					}
				}
				g_current_camera_model = clone(camera);
				g_current_camera_model.use_intelligent_codec = false;
				g_current_camera_model.use_wdr = false;
				g_current_camera_model.use_ssl = false;
				adjustCamera();
				if (Math.ceil(g_current_camera_model.current_profiles[profile_index].current_bitrate / 1000) > max_single_bitrate ||
					max_total_bitrate + Math.ceil(g_current_camera_model.current_profiles[profile_index].current_bitrate / 1000) * g_current_camera_model.ea > max_total_recording_bitrate){
					//check default stream settings
					g_current_camera_model = clone(g_limit_camera);
					g_current_camera_model.use_intelligent_codec = false;
					g_current_camera_model.use_wdr = false;
					g_current_camera_model.use_ssl = false;
					adjustCamera();
					if (Math.ceil(g_current_camera_model.current_profiles[profile_index].current_bitrate / 1000) > max_single_bitrate ||
						max_total_bitrate + Math.ceil(g_current_camera_model.current_profiles[profile_index].current_bitrate / 1000) * g_current_camera_model.ea > max_total_recording_bitrate){
						//optimizing stream settings
						var isOptimized = false;
						while(!isOptimized &&
							document.getElementById("select_"+STREAM_CONTROL_NAMES[profile_index]+"_quality").selectedIndex > 0 &&
							document.getElementById("select_"+STREAM_CONTROL_NAMES[profile_index]+"_quality").disabled == false){
							document.getElementById("select_"+STREAM_CONTROL_NAMES[profile_index]+"_quality").selectedIndex = document.getElementById("select_"+STREAM_CONTROL_NAMES[profile_index]+"_quality").selectedIndex -1;
							g_current_camera_model = clone(tempCamera);
							update_g_current_camera_model();
							tempCamera = clone(g_current_camera_model);
							g_current_camera_model.use_intelligent_codec = false;
							g_current_camera_model.use_wdr = false;
							g_current_camera_model.use_ssl = false;
							adjustCamera();
							if (!(Math.ceil(g_current_camera_model.current_profiles[profile_index].current_bitrate / 1000) > max_single_bitrate) &&
								!(max_total_bitrate + Math.ceil(g_current_camera_model.current_profiles[profile_index].current_bitrate / 1000) * g_current_camera_model.ea > max_total_recording_bitrate)){
								g_current_camera_model = clone(tempCamera);
								g_limit_camera = clone(g_current_camera_model);
								update_detail_ui();
								isOptimized = true;
							}
						}
						while(!isOptimized &&
							document.getElementById("select_"+STREAM_CONTROL_NAMES[profile_index]+"_framerate").selectedIndex > 0 &&
							document.getElementById("select_"+STREAM_CONTROL_NAMES[profile_index]+"_framerate").disabled == false){
							document.getElementById("select_"+STREAM_CONTROL_NAMES[profile_index]+"_framerate").selectedIndex = document.getElementById("select_"+STREAM_CONTROL_NAMES[profile_index]+"_framerate").selectedIndex -1;
							g_current_camera_model = clone(tempCamera);
							update_g_current_camera_model();
							tempCamera = clone(g_current_camera_model);
							g_current_camera_model.use_intelligent_codec = false;
							g_current_camera_model.use_wdr = false;
							g_current_camera_model.use_ssl = false;
							adjustCamera();
							if (!(Math.ceil(g_current_camera_model.current_profiles[profile_index].current_bitrate / 1000) > max_single_bitrate) &&
								!(max_total_bitrate + Math.ceil(g_current_camera_model.current_profiles[profile_index].current_bitrate / 1000) * g_current_camera_model.ea > max_total_recording_bitrate)){
								g_current_camera_model = clone(tempCamera);
								g_limit_camera = clone(g_current_camera_model);
								update_detail_ui();
								isOptimized = true;
							}
						}
						while(!isOptimized &&
							document.getElementById("select_"+STREAM_CONTROL_NAMES[profile_index]+"_resolution").selectedIndex > 0 &&
							document.getElementById("select_"+STREAM_CONTROL_NAMES[profile_index]+"_resolution").disabled == false){
							document.getElementById("select_"+STREAM_CONTROL_NAMES[profile_index]+"_resolution").selectedIndex = document.getElementById("select_"+STREAM_CONTROL_NAMES[profile_index]+"_resolution").selectedIndex -1;
							g_current_camera_model = clone(tempCamera);
							update_g_current_camera_model();
							tempCamera = clone(g_current_camera_model);
							g_current_camera_model.use_intelligent_codec = false;
							g_current_camera_model.use_wdr = false;
							g_current_camera_model.use_ssl = false;
							adjustCamera();
							if (!(Math.ceil(g_current_camera_model.current_profiles[profile_index].current_bitrate / 1000) > max_single_bitrate) &&
								!(max_total_bitrate + Math.ceil(g_current_camera_model.current_profiles[profile_index].current_bitrate / 1000) * g_current_camera_model.ea > max_total_recording_bitrate)){
								g_current_camera_model = clone(tempCamera);
								g_limit_camera = clone(g_current_camera_model);
								update_detail_ui();
								isOptimized = true;
							}
						}
						//most lower settings also over the limit.
						if (!isOptimized){
							alert("The camera settings can't be applied due to exceeding the maximum bitrate. Please adjust the stream settings of other cameras.");
							g_current_camera_model = clone(g_limit_camera);
							update_detail_ui();
							return false;
						}
					}
					//check changed strema settings
					else {
						alert("The camera settings can't be applied due to exceeding the maximum bitrate. Please adjust the stream settings.");
						//rollback camera setting
						g_current_camera_model = clone(g_limit_camera);
						update_detail_ui();
						return false;
					}
				}
				if (profile_index == STREAM_REMOTE){
					g_current_camera_model = clone(tempCamera);
					g_limit_camera = clone(g_current_camera_model);
					return true;
				}
			}
			else if (g_setting_mode == CAMERA_SETTING_MODE_MODIFY){
				g_current_camera_model = clone(camera);
				g_current_camera_model.use_intelligent_codec = false;
				g_current_camera_model.use_wdr = false;
				g_current_camera_model.use_ssl = false;
				adjustCamera();
				if (Math.ceil(g_current_camera_model.current_profiles[profile_index].current_bitrate / 1000) > max_single_bitrate ||
					max_total_bitrate - max_real_bitrate * g_current_camera_model.ea + Math.ceil(g_current_camera_model.current_profiles[profile_index].current_bitrate / 1000) * g_current_camera_model.ea > max_total_recording_bitrate){
					alert("The camera settings can't be applied due to exceeding the maximum bitrate. Please adjust the stream settings.");
					//rollback camera setting
					g_current_camera_model = clone(g_limit_camera);
					return false;
				}
				g_current_camera_model = clone(tempCamera);
			}
		}
		//g_limit_camera = clone(camera);
		return true;
	}
	else
		return false;
}

function checkIRLimit(mode, camera, max_total_recording_bitrate, max_single_bitrate){
	//limit_camera = clone(camera); 옵션 변경 전 체크
	var max_bitrate = 0;
	var max_total_bitrate = 0;
	var max_real_bitrate = 0;
	var added_camera = adjustRecorderBitrate();
	var codecInfo = camera.getCodecInfo(camera.current_profiles[0].current_codec);
    var maxResolution = codecInfo.support_resolution[codecInfo.support_resolution.length - 1].type;
    var maxRes = RESOLUTION_TYPE_STRING[maxResolution].split('x');
    var maxResFactor = Math.round(maxRes[0] * maxRes[1] / 1000000);
	var tempCamera = clone(g_current_camera_model);
	if (RESOLUTION_TYPE_STRING[maxResolution] == "2048x1536"){
		maxResFactor--;
	}

	g_current_video_recoder_model.calculateBitrate(g_current_video_recoder_model);
	for (var camera_index in g_current_video_recoder_model.connect_cameras){
		max_bitrate = 0;
		if (g_current_video_recoder_model.connect_cameras[camera_index].channel == camera.channel){
			g_current_camera_model = clone(g_current_video_recoder_model.connect_cameras[camera_index]);
			//g_current_camera_model.use_intelligent_codec = false;
			g_current_camera_model.use_wdr = false;
			g_current_camera_model.use_ssl = false;
			adjustCamera();
			for (var profile_index in g_current_camera_model.current_profiles){
				max_bitrate = max_bitrate > g_current_camera_model.current_profiles[profile_index].current_bitrate / 1000 ? max_bitrate : g_current_camera_model.current_profiles[profile_index].current_bitrate / 1000;
			}
			max_total_bitrate += max_bitrate * g_current_camera_model.ea;
		}

	}
	g_current_camera_model = clone(g_limit_camera);
	//g_current_camera_model.use_intelligent_codec = false;
	g_current_camera_model.use_wdr = false;
	g_current_camera_model.use_ssl = false;
	adjustCamera();
	for (var profile_index in camera.current_profiles){
		max_real_bitrate = max_real_bitrate > g_current_camera_model.current_profiles[profile_index].current_bitrate / 1000 ? max_real_bitrate : g_current_camera_model.current_profiles[profile_index].current_bitrate / 1000;
	}

	if(mode == CAMERA_SETTING_MODE_INSERT){
		g_current_camera_model = clone(camera);
		//g_current_camera_model.use_intelligent_codec = false;
		g_current_camera_model.use_wdr = false;
		g_current_camera_model.use_ssl = false;
		adjustCamera();
		for (var profile_index in g_current_camera_model.current_profiles){
			if (g_current_camera_model.current_profiles[profile_index].current_bitrate / 1000 > max_single_bitrate ||
				max_total_bitrate > max_total_recording_bitrate){
				alert("The camera can't be added due to exceeding maximum bitrate. Please adjust the stream settings.");
				g_current_video_recoder_model.eraseCamera(g_current_video_recoder_model.connect_cameras.length-1);
				return false;
			}
		}
		g_current_camera_model = clone(tempCamera);
		return true;
	}
	// added_camera : option changed camera
	// g_limit_camera : before option changed camera
	else if (mode == CAMERA_SETTING_MODE_MODIFY){
		g_current_camera_model = clone(tempCamera);
		update_g_current_camera_model();
		for (var profile_index in camera.current_profiles){
			if (g_setting_mode == CAMERA_SETTING_MODE_INSERT){
				if (max_total_bitrate > max_total_recording_bitrate){
					alert("The camera settings can't be applied due to exceeding the maximum bitrate. Please adjust the stream settings of other cameras.");
					return false;
				}
				g_current_camera_model = clone(camera);
				//g_current_camera_model.use_intelligent_codec = false;
				g_current_camera_model.use_wdr = false;
				g_current_camera_model.use_ssl = false;
				adjustCamera();
				if (g_current_camera_model.current_profiles[profile_index].current_bitrate / 1000 > max_single_bitrate ||
					max_total_bitrate + g_current_camera_model.current_profiles[profile_index].current_bitrate / 1000 * g_current_camera_model.ea > max_total_recording_bitrate){
					//check default stream settings
					g_current_camera_model = clone(g_limit_camera);
					//g_current_camera_model.use_intelligent_codec = false;
					g_current_camera_model.use_wdr = false;
					g_current_camera_model.use_ssl = false;
					adjustCamera();
					if (g_current_camera_model.current_profiles[profile_index].current_bitrate / 1000 > max_single_bitrate ||
						max_total_bitrate + g_current_camera_model.current_profiles[profile_index].current_bitrate / 1000 * g_current_camera_model.ea > max_total_recording_bitrate){
						//optimizing stream settings
						var isOptimized = false;
						while(!isOptimized &&
							document.getElementById("select_"+STREAM_CONTROL_NAMES[profile_index]+"_quality").selectedIndex > 0 &&
							document.getElementById("select_"+STREAM_CONTROL_NAMES[profile_index]+"_quality").disabled == false){
							document.getElementById("select_"+STREAM_CONTROL_NAMES[profile_index]+"_quality").selectedIndex = document.getElementById("select_"+STREAM_CONTROL_NAMES[profile_index]+"_quality").selectedIndex -1;
							g_current_camera_model = clone(tempCamera);
							update_g_current_camera_model();
							tempCamera = clone(g_current_camera_model);
							//g_current_camera_model.use_intelligent_codec = false;
							g_current_camera_model.use_wdr = false;
							g_current_camera_model.use_ssl = false;
							adjustCamera();
							if (!(g_current_camera_model.current_profiles[profile_index].current_bitrate / 1000 > max_single_bitrate) &&
								!(max_total_bitrate + g_current_camera_model.current_profiles[profile_index].current_bitrate / 1000 * g_current_camera_model.ea > max_total_recording_bitrate)){
								g_current_camera_model = clone(tempCamera);
								g_limit_camera = clone(g_current_camera_model);
								update_detail_ui();
								isOptimized = true;
							}
						}
						while(!isOptimized &&
							document.getElementById("select_"+STREAM_CONTROL_NAMES[profile_index]+"_framerate").selectedIndex > 0 &&
							document.getElementById("select_"+STREAM_CONTROL_NAMES[profile_index]+"_framerate").disabled == false){
							document.getElementById("select_"+STREAM_CONTROL_NAMES[profile_index]+"_framerate").selectedIndex = document.getElementById("select_"+STREAM_CONTROL_NAMES[profile_index]+"_framerate").selectedIndex -1;
							g_current_camera_model = clone(tempCamera);
							update_g_current_camera_model();
							tempCamera = clone(g_current_camera_model);
							//g_current_camera_model.use_intelligent_codec = false;
							g_current_camera_model.use_wdr = false;
							g_current_camera_model.use_ssl = false;
							adjustCamera();
							if (!(g_current_camera_model.current_profiles[profile_index].current_bitrate / 1000 > max_single_bitrate) &&
								!(max_total_bitrate + g_current_camera_model.current_profiles[profile_index].current_bitrate / 1000 * g_current_camera_model.ea > max_total_recording_bitrate)){
								g_current_camera_model = clone(tempCamera);
								g_limit_camera = clone(g_current_camera_model);
								update_detail_ui();
								isOptimized = true;
							}
						}
						while(!isOptimized &&
							document.getElementById("select_"+STREAM_CONTROL_NAMES[profile_index]+"_resolution").selectedIndex > 0 &&
							document.getElementById("select_"+STREAM_CONTROL_NAMES[profile_index]+"_resolution").disabled == false){
							document.getElementById("select_"+STREAM_CONTROL_NAMES[profile_index]+"_resolution").selectedIndex = document.getElementById("select_"+STREAM_CONTROL_NAMES[profile_index]+"_resolution").selectedIndex -1;
							g_current_camera_model = clone(tempCamera);
							update_g_current_camera_model();
							tempCamera = clone(g_current_camera_model);
							//g_current_camera_model.use_intelligent_codec = false;
							g_current_camera_model.use_wdr = false;
							g_current_camera_model.use_ssl = false;
							adjustCamera();
							if (!(g_current_camera_model.current_profiles[profile_index].current_bitrate / 1000 > max_single_bitrate) &&
								!(max_total_bitrate + g_current_camera_model.current_profiles[profile_index].current_bitrate / 1000 * g_current_camera_model.ea > max_total_recording_bitrate)){
								g_current_camera_model = clone(tempCamera);
								g_limit_camera = clone(g_current_camera_model);
								update_detail_ui();
								isOptimized = true;
							}
						}
						//most lower settings also over the limit.
						if (!isOptimized){
							alert("The camera settings can't be applied due to exceeding the maximum bitrate. Please adjust the stream settings of other cameras.");
							g_current_camera_model = clone(g_limit_camera);
							update_detail_ui();
							return false;
						}
					}
					//check changed strema settings
					else {
						alert("The camera settings can't be applied due to exceeding the maximum bitrate. Please adjust the stream settings.");
						//rollback camera setting
						g_current_camera_model = clone(g_limit_camera);
						update_detail_ui();
						return false;
					}
				}
				if (profile_index == STREAM_REMOTE){
					g_current_camera_model = clone(tempCamera);
					g_limit_camera = clone(g_current_camera_model);
					return true;
				}
			}
			else if (g_setting_mode == CAMERA_SETTING_MODE_MODIFY){
				g_current_camera_model = clone(camera);
				//g_current_camera_model.use_intelligent_codec = false;
				g_current_camera_model.use_wdr = false;
				g_current_camera_model.use_ssl = false;
				adjustCamera();
				if (g_current_camera_model.current_profiles[profile_index].current_bitrate / 1000 > max_single_bitrate ||
					max_total_bitrate - max_real_bitrate * g_current_camera_model.ea + g_current_camera_model.current_profiles[profile_index].current_bitrate / 1000 * g_current_camera_model.ea > max_total_recording_bitrate){
					alert("The camera settings can't be applied due to exceeding the maximum bitrate. Please adjust the stream settings.");
					//rollback camera setting
					g_current_camera_model = clone(g_limit_camera);
					return false;
				}
				g_current_camera_model = clone(tempCamera);
			}
		}
		//g_limit_camera = clone(camera);
		return true;
	}
	else
		return false;
}

function enableCameraoption()
{
	if (isDirectIP == 1 && g_current_video_recoder_model.type == 1){
		if (g_current_camera_model.support_codecs[0].support_resolution[g_current_camera_model.support_codecs[0].support_resolution.length -1].type != RESOLUTION_TYPE.RES_2304_1296){
			document.getElementById("select_"+STREAM_CONTROL_NAMES[0]+"_resolution").disabled = true;
			document.getElementById("select_"+STREAM_CONTROL_NAMES[0]+"_framerate").disabled = true;
		}
		else {
			document.getElementById("select_"+STREAM_CONTROL_NAMES[0]+"_resolution").disabled = false;
			document.getElementById("select_"+STREAM_CONTROL_NAMES[0]+"_framerate").disabled = false;
		}
		document.getElementById("select_"+STREAM_CONTROL_NAMES[1]+"_resolution").disabled = true;
		document.getElementById("select_"+STREAM_CONTROL_NAMES[1]+"_framerate").disabled = true;
	}
	else {
		document.getElementById("select_"+STREAM_CONTROL_NAMES[0]+"_codec").disabled = false;
		document.getElementById("select_"+STREAM_CONTROL_NAMES[0]+"_resolution").disabled = false;
		document.getElementById("select_"+STREAM_CONTROL_NAMES[0]+"_framerate").disabled = false;
		document.getElementById("select_"+STREAM_CONTROL_NAMES[0]+"_quality").disabled = false;

		document.getElementById("select_"+STREAM_CONTROL_NAMES[1]+"_codec").disabled = false;
		document.getElementById("select_"+STREAM_CONTROL_NAMES[1]+"_resolution").disabled = false;
		document.getElementById("select_"+STREAM_CONTROL_NAMES[1]+"_framerate").disabled = false;
		document.getElementById("select_"+STREAM_CONTROL_NAMES[1]+"_quality").disabled = false;

		document.getElementById("select_"+STREAM_CONTROL_NAMES[4]+"_codec").disabled = false;
		document.getElementById("select_"+STREAM_CONTROL_NAMES[4]+"_resolution").disabled = false;
		document.getElementById("select_"+STREAM_CONTROL_NAMES[4]+"_framerate").disabled = false;
		document.getElementById("select_"+STREAM_CONTROL_NAMES[4]+"_quality").disabled = false;
	}
}

//--------------------------------------------------
//  onChange
//--------------------------------------------------

function onChangeNVRModel()
{

	init();
	
	init_default_profile_settings(g_current_camera_model);
	init_default_ratio_settings(g_current_camera_model);
	init_default_period_settings(g_current_camera_model);

	document.getElementById("select_camera_count").value = 1;
	g_current_camera_model.ea = parseInt($("#select_camera_count").val());
	if (g_current_video_recoder_model.direct_ip == 2){
		document.getElementById("check_direct_ip_mode").disabled = false;
	}
	else if (g_current_video_recoder_model.direct_ip == 3){
		document.getElementById("check_direct_ip_mode").checked = true;
		document.getElementById("check_direct_ip_mode").disabled = true;
	}
	else {
		document.getElementById("check_direct_ip_mode").checked = false;
		document.getElementById("check_direct_ip_mode").disabled = true;
	}
	if (g_current_video_recoder_model.bandwidth_unit > 1){
		document.getElementById("select_bandwidth_unit").disabled = false;
	}
	else {
		document.getElementById("select_bandwidth_unit").disabled = true;
	}

	if (g_current_video_recoder_model.support_mat == 0){
		document.getElementById("input_mat_ratio").disabled = true;
		document.getElementById("select_mat_framerate").disabled = true;
	}
	else {
		document.getElementById("input_mat_ratio").disabled = false;
		document.getElementById("select_mat_framerate").disabled = false;
	}
	reflashSelectedCameraList();

	updateResult();
	if(g_current_video_recoder_model.type == VIDEO_RECODER_TYPE.HYBRID){
		g_max_total_record_bitrate = g_current_video_recoder_model.max_bitrate_limit
		        
	}

}

function onChangeUnit()
{

	if(chk_connect_camera()){
		g_unit_selected	= document.getElementById("select_display_unit").selectedIndex;
		reflashSelectedCameraList();
	}
}

function onChangeDiscontinued(){
	if(confirm("The contents are reset. Are you sure you want to change it?")){
		var discontinued = $('#discontinued').val();
		location.href="/design_tool/storage_calculator_ifrm2.php?discontinued="+discontinued;
	}
}

function onChangePeriod(ele){
	var period_element = {1:'input_period_n',2:'input_period_e',3:'input_period_t',4:'input_period_te'};
	var deduction = "n";
	var period_sum = 0;
	var period_diff = 0;
	var action = 0;
	var insertElement = "";

	if(!$(ele).val() || isNaN($(ele).val())) $(ele).val(0);

	$.each(period_element,function(i,e){
		period_sum+=parseInt($('#'+e).val());
	});
	period_diff = period_sum-24;

	$.each(period_element,function(i,e){
		if($(ele).attr('id')==e){
			delete period_element[i];
			if(parseInt($('#'+e).val()) == 24){
				insertElement = e;
			}else{
				insertElement = "";
			}
		}
	});

	if(insertElement){
		if(parseInt($('#'+insertElement).val()) == 24){
			$.each(period_element,function(i,e){
				$('#'+e).val(0);
			});
		}
	}

	$.each(period_element,function(i,e){
		if(parseInt($('#'+e).val())>=period_diff && action==0){

			var num = parseInt($('#'+e).val())-period_diff;

			if(isNaN(num)) num=0;

			$('#'+e).val(num);
			action=1;
		}
	});

	onChangeProfileOptions();
}

function onChangeCameraModel(){
	var index = $('#select_camera_model').val();
	g_current_camera_model = clone(g_camera_models[index]);
	document.getElementById("select_camera_count").value = 1;
	init_default_profile_settings(g_current_camera_model);
	adjustCamera();
	tmp_camera = '';
}
function onChangeAnalogResolution() {
	g_current_camera_model.support_codecs[0].support_resolution[0].type = Number(document.getElementById("select_analog_camera_resolution_mode").value);
	g_current_camera_model.support_codecs[1].support_resolution[0].type = Number(document.getElementById("select_analog_camera_resolution_mode").value);
	g_current_camera_model.support_codecs[0].support_resolution[0].name = RESOLUTION_TYPE_STRING[document.getElementById("select_analog_camera_resolution_mode").value];
	g_current_camera_model.support_codecs[1].support_resolution[0].name = RESOLUTION_TYPE_STRING[document.getElementById("select_analog_camera_resolution_mode").value];
	
	onChangeProfileOptions();
}
function onChangeProfileOptions(){
	//g_current_camera_model.ea = parseInt($("#select_camera_count").val());
	update_g_current_camera_model();
	adjustCamera();
	if(isDirectIP == 2 || g_current_video_recoder_model.type == VIDEO_RECODER_TYPE.HYBRID){
		checkDirectIPLimit(CAMERA_SETTING_MODE_MODIFY, g_current_camera_model, g_max_total_record_bitrate, g_max_single_bitrate);
		adjustCamera();
	}
	else if (g_current_video_recoder_model.name.substr(0, 3) == "IR-"|| g_current_video_recoder_model.name.substr(0, 5) == "PF-SV") {
		checkIRLimit(CAMERA_SETTING_MODE_MODIFY, g_current_camera_model, g_max_total_record_bitrate, g_max_single_bitrate);
		adjustCamera();
	}
	update_detail_ui();
}

function onChangeRatio(ele){
	if(parseInt($(ele).val())>100){
		$(ele).val(100);
	}

	if(parseInt($(ele).val())<0){
		$(ele).val(0);
	}

	onChangeProfileOptions();
}

function onChangeBandwidthUnit()
{
	var index = $('#select_bandwidth_unit').val();
	g_current_camera_model.channel = index;
}

//--------------------------------------------------
//  onClick
//--------------------------------------------------

function onClickProjectSettingArea()
{
	if($('#project_setting_area').css('display')=='block'){
		$('#project_setting_area').css('display','none');
	}else{
		$('#project_setting_area').css('display','block');
	}
}

function onClickDetailSettingButton()
{
	g_setting_mode = CAMERA_SETTING_MODE_INSERT;
	var index = $('#select_camera_model').val();

	$('#submit_modify').css('display','none');
	$('#layer_camera_detail_setting').css('display','block');
	$('#layer_camera_detail_setting_bg').css('display','block');

	if($("#check_direct_ip_mode").length > 0 && $("#check_direct_ip_mode").prop("checked") == true){
		$("#camera_stream_1").text("Stream1");
		$("#camera_stream_2").text("Stream2");
		$("#camera_stream_3").text("Stream3");
	}else{
		$("#camera_stream_1").text("Live 1");
		$("#camera_stream_2").text("Live 2");
		$("#camera_stream_3").text("Remote");
	}
	g_current_camera_model = clone(g_camera_models[index]);
	g_current_camera_model.record_period = STREAM_RECORD_PERIOD;
	g_current_camera_model.channel = document.getElementById("select_bandwidth_unit").value;
	init_default_profile_settings(g_current_camera_model);
	init_default_ratio_settings(g_current_camera_model);
	init_default_period_settings(g_current_camera_model);
	update_detail_ui();
	g_current_camera_model.ea = parseInt($("#select_camera_count").val());
	adjustCamera();
	g_limit_camera = clone(g_current_camera_model);
	update_detail_ui();

	if (isDirectIP == 2 || g_current_video_recoder_model.type == VIDEO_RECODER_TYPE.HYBRID){
		checkDirectIPLimit(CAMERA_SETTING_MODE_MODIFY, g_current_camera_model, g_max_total_record_bitrate, g_max_single_bitrate);
		adjustCamera();
		update_detail_ui();
	}
	else if (g_current_video_recoder_model.name.substr(0, 3) == "IR-"||g_current_video_recoder_model.name.substr(0, 5) == "PF-SV") {
		checkIRLimit(CAMERA_SETTING_MODE_MODIFY, g_current_camera_model, g_max_total_record_bitrate, g_max_single_bitrate);
		adjustCamera();
		update_detail_ui();
	}
}

function onClickInsertCameraProfile()
{
	var ea = parseInt($("#select_camera_count").val()); //카메라 수량
	var index = $('#select_camera_model').val();
	var checkDirectIP = true;
	if(index==null){
		alert('Please select camera.');
		return;
	}

	$("input[name^='camera_table_name']").each(function(k, v){
		var count_number = $(this).data("count");
		if(g_current_video_recoder_model.connect_cameras[count_number].name === 'Custom Camera'){
			g_current_video_recoder_model.connect_cameras[count_number].custom_name = v.value;
		}
	});

	if(tmp_camera!=''){
		g_current_camera_model = tmp_camera;
		g_current_camera_model.ea = ea;
		tmp_camera='';
	}
	else{
		g_current_camera_model = clone(g_camera_models[index]);
		g_current_camera_model.record_period = STREAM_RECORD_PERIOD;

		init_default_profile_settings(g_current_camera_model);
		init_default_ratio_settings(g_current_camera_model);
		init_default_period_settings(g_current_camera_model);
		update_detail_ui();
		adjustCamera();
		//update_g_current_camera_model();
		g_current_camera_model.ea = ea;
		g_current_camera_model.event_ratio = 0;
		g_current_camera_model.mat_ratio = 0;
		g_current_camera_model.record_period.TE = 0;
		g_current_camera_model.record_period.T = 24;
		g_current_camera_model.record_period.E = 0;
		g_current_camera_model.record_period.N = 0;
	}
	g_current_camera_model.channel = document.getElementById("select_bandwidth_unit").value;
	g_limit_camera = clone(g_current_camera_model);

	var deviceIndex = 0;
	var registerdIndex = true;
	while (registerdIndex) {
		deviceIndex++;
		registerdIndex = false;
		for (var cameraIndex in g_current_video_recoder_model.connect_cameras) {
			if (g_current_video_recoder_model.connect_cameras[cameraIndex].deviceIndex == deviceIndex) {
				registerdIndex = true;
				break;
			}
		}
	}

	g_current_camera_model.deviceIndex = deviceIndex;

	var result = g_current_video_recoder_model.addCamera(g_current_camera_model);
	if(!result){

	var maxCamera = g_current_video_recoder_model.availableCamera(g_current_camera_model);

		alert("You can select up to "+ maxCamera +" units.");
		return;
	}

	if(isDirectIP == 2 || g_current_video_recoder_model.type == VIDEO_RECODER_TYPE.HYBRID ){
		checkDirectIP = checkDirectIPLimit(CAMERA_SETTING_MODE_INSERT, g_current_camera_model, g_max_total_record_bitrate, g_max_single_bitrate);
	}
	else if (g_current_video_recoder_model.name.substr(0, 3) == "IR-"||g_current_video_recoder_model.name.substr(0, 5) == "PF-SV") {
		checkDirectIP = checkIRLimit(CAMERA_SETTING_MODE_INSERT, g_current_camera_model, g_max_total_record_bitrate, g_max_single_bitrate);
	}
	reflashSelectedCameraList();
	if (checkDirectIP){
		$('#select_camera_count').val(1);
		g_current_camera_model = clone(g_camera_models[index]);
	}
	else {
		//document.getElementById("select_camera_count").value = ea;
		$('#select_camera_count').val(ea);
	}

	updateResult();
}

function onClickModifyClose(){

	if(g_setting_mode!=CAMERA_SETTING_MODE_MODIFY){
		tmp_camera = g_current_camera_model;
	}else{
		tmp_camera = "";
	}
	g_setting_mode = CAMERA_SETTING_MODE_INSERT;
	$('#layer_camera_detail_setting').css('display','none');
	$('#layer_camera_detail_setting_bg').css('display','none');
	//$('.camera_stream_setting_layer').css('display','none');
}

function onClickLiveSettingButton(){
	/*
	if($('.camera_stream_setting_layer').css('display')=='block'){
		$('.camera_stream_setting_layer').css('display','none');
	}else{
		$('.camera_stream_setting_layer').css('display','block');
	}
	*/
}


function onClickDelteCameraProfile(control)
{
	var index = parseInt(control.value);

	g_current_video_recoder_model.eraseCamera(index);

	reflashSelectedCameraList();

	updateResult();
}

function onClickCopyCameraProfile(control){

	var index = parseInt(control.value);
	g_current_camera_model = clone(g_current_video_recoder_model.connect_cameras[index]);

	var deviceIndex = 0;
	var registerdIndex = true;
	while (registerdIndex) {
		deviceIndex++;
		registerdIndex = false;
		for (var cameraIndex in g_current_video_recoder_model.connect_cameras) {
			if (g_current_video_recoder_model.connect_cameras[cameraIndex].deviceIndex == deviceIndex) {
				registerdIndex = true;
				break;
			}
		}
	}
	g_current_camera_model.deviceIndex = deviceIndex;
	var result = true;
	if (g_current_camera_model.max_stream_count === 1) {
		result = g_current_video_recoder_model.addCamera(g_current_camera_model);
	}
	else {
		var tempCamera = clone(g_current_camera_model);
		var deviceCount = 0;
		for (var cameraIndex in g_current_video_recoder_model.connect_cameras) {
			if (g_current_video_recoder_model.connect_cameras[cameraIndex].deviceIndex == g_current_video_recoder_model.connect_cameras[index].deviceIndex) {
				tempCamera = clone(g_current_video_recoder_model.connect_cameras[cameraIndex]);
				tempCamera.deviceIndex = deviceIndex;
				result = g_current_video_recoder_model.addCamera(tempCamera);
				if (result) {
					deviceCount++;
				}
				else {
					for (var registeredCamera = 0; registeredCamera < deviceCount; registeredCamera++) {
						g_current_video_recoder_model.connect_cameras.pop();
					}
				}
			}
		}
		if (result && isDirectIP == 2 || result && g_current_video_recoder_model.type == VIDEO_RECODER_TYPE.HYBRID) {
			var max_total_bitrate = 0;
			tempCamera = clone(g_current_camera_model);
			if (g_current_video_recoder_model.bandwidth_unit == 2){
				for (var camera_index in g_current_video_recoder_model.connect_cameras){
					var max_bitrate = 0;
					g_current_camera_model = clone(g_current_video_recoder_model.connect_cameras[camera_index]);
					g_current_camera_model.use_intelligent_codec = false;
					g_current_camera_model.use_wdr = false;
					g_current_camera_model.use_ssl = false;
					adjustCamera();
					for (var profile_index in g_current_camera_model.current_profiles){
						max_bitrate = max_bitrate > Math.ceil(g_current_camera_model.current_profiles[profile_index].current_bitrate / 1000) ? max_bitrate : Math.ceil(g_current_camera_model.current_profiles[profile_index].current_bitrate / 1000);
					}
					//return to original bitrate
					g_current_camera_model = clone(g_current_video_recoder_model.connect_cameras[camera_index]);
					adjustCamera();
					if (g_current_video_recoder_model.connect_cameras[camera_index].channel == 1){
						max_odd_total_bitrate += max_bitrate * g_current_video_recoder_model.connect_cameras[camera_index].ea;
					}
					else {
						max_even_total_bitrate += max_bitrate * g_current_video_recoder_model.connect_cameras[camera_index].ea;
					}
				}
				if (max_even_total_bitrate > g_max_total_record_bitrate || max_odd_total_bitrate > g_max_total_record_bitrate) {
					for (var registeredCamera = 0; registeredCamera < deviceCount; registeredCamera++) {
						g_current_video_recoder_model.connect_cameras.pop();
					}
					result = false;
					alert("The camera can't be added due to exceeding maximum bitrate. Please adjust the stream settings.");
					return;
				}
			}
			else {
				for (var camera_index in g_current_video_recoder_model.connect_cameras){
					var max_bitrate = 0;
					g_current_camera_model = clone(g_current_video_recoder_model.connect_cameras[camera_index]);
					g_current_camera_model.use_intelligent_codec = false;
					g_current_camera_model.use_wdr = false;
					g_current_camera_model.use_ssl = false;
					adjustCamera();
					for (var profile_index in g_current_camera_model.current_profiles){
						max_bitrate = max_bitrate > Math.ceil(g_current_camera_model.current_profiles[profile_index].current_bitrate / 1000) ? max_bitrate : Math.ceil(g_current_camera_model.current_profiles[profile_index].current_bitrate / 1000);
					}
					//return to original bitrate
					g_current_camera_model = clone(g_current_video_recoder_model.connect_cameras[camera_index]);
					//adjustCamera();
					max_total_bitrate += max_bitrate * g_current_video_recoder_model.connect_cameras[camera_index].ea;
				}
				if (max_total_bitrate > g_max_total_record_bitrate) {
					for (var registeredCamera = 0; registeredCamera < deviceCount; registeredCamera++) {
						g_current_video_recoder_model.connect_cameras.pop();
					}
					result = false;
					alert("The camera can't be added due to exceeding maximum bitrate. Please adjust the stream settings.");
					return;
				}
			}
		}
	}
	if(!result){

		var maxCamera = g_current_video_recoder_model.availableCamera(g_current_camera_model);

		alert("You can select up to "+ maxCamera +" units.");
		return;
	}
	if(isDirectIP == 2||g_current_video_recoder_model.type === VIDEO_RECODER_TYPE.HYBRID){
		checkDirectIPLimit(CAMERA_SETTING_MODE_INSERT, g_current_camera_model, g_max_total_record_bitrate, g_max_single_bitrate);
	}
	else if (g_current_video_recoder_model.name.substr(0, 3) == "IR-"||g_current_video_recoder_model.name.substr(0, 5) == "PF-SV") {
		checkIRLimit(CAMERA_SETTING_MODE_INSERT, g_current_camera_model, g_max_total_record_bitrate, g_max_single_bitrate);
	}
	reflashSelectedCameraList();
	updateResult();
}

function onClickAddChannel(control){

	var index = parseInt(control.value);

	g_current_camera_model = clone(g_current_video_recoder_model.connect_cameras[index]);
	if (g_current_camera_model.max_stream_count > 1) {
		var deviceCount = 0;

		for (var channelIndex = 0; channelIndex < g_current_camera_model.max_stream_count; channelIndex++) {
			var registerdChannel = false;
			for (var cameraIndex in g_current_video_recoder_model.connect_cameras) {
				if (g_current_video_recoder_model.connect_cameras[cameraIndex].deviceIndex == g_current_camera_model.deviceIndex) {
					if (channelIndex == g_current_video_recoder_model.connect_cameras[cameraIndex].channelIndex) {
						registerdChannel = true;
						deviceCount++;
					}
				}
			}
			if (!registerdChannel) {
				g_current_camera_model.channelIndex = channelIndex;
				break;
			}
		}

		if (g_current_camera_model.max_stream_count <= deviceCount) {
			alert("You can select up to "+g_current_camera_model.max_stream_count+" channel per Device.");
			return;
		}
	}

	var tempIndex = 0;
	for (var cameraIndex in g_current_video_recoder_model.connect_cameras) {
		if (g_current_video_recoder_model.connect_cameras[cameraIndex].deviceIndex == g_current_camera_model.deviceIndex) {
			tempIndex = Number(cameraIndex) + 1;
			if (g_current_camera_model.channelIndex < g_current_video_recoder_model.connect_cameras[cameraIndex].channelIndex) {
				tempIndex--;
				break;
			}
		}
	}

	var result = g_current_video_recoder_model.addCamera(g_current_camera_model);
	if(!result){
		var maxCamera = g_current_video_recoder_model.availableCamera(g_current_camera_model);
		alert("You can select up to "+ maxCamera +" units.");
		return;
	}
	if(isDirectIP == 2||g_current_video_recoder_model.type === VIDEO_RECODER_TYPE.HYBRID){
		checkDirectIPLimit(CAMERA_SETTING_MODE_INSERT, g_current_camera_model, g_max_total_record_bitrate, g_max_single_bitrate);
	}
	else if (g_current_video_recoder_model.name.substr(0, 3) == "IR-"||g_current_video_recoder_model.name.substr(0, 5) == "PF-SV") {
		checkIRLimit(CAMERA_SETTING_MODE_INSERT, g_current_camera_model, g_max_total_record_bitrate, g_max_single_bitrate);
	}
	g_current_video_recoder_model.connect_cameras.splice(tempIndex, 0, g_current_video_recoder_model.connect_cameras.pop());

	reflashSelectedCameraList();
	updateResult();
}

function onClickModifyCameraProfile(control)
{
	g_setting_mode = CAMERA_SETTING_MODE_MODIFY;
	$('#layer_camera_detail_setting').css('display','block');
	$('#layer_camera_detail_setting_bg').css('display','block');
	$('#submit_modify').css('display','inline-block');
	if($("#check_direct_ip_mode").length > 0 && $("#check_direct_ip_mode").prop("checked") == true){
		$("#camera_stream_1").text("Stream1");
		$("#camera_stream_2").text("Stream2");
		$("#camera_stream_3").text("Stream3");
	}else{
		$("#camera_stream_1").text("Live 1");
		$("#camera_stream_2").text("Live 2");
		$("#camera_stream_3").text("Remote");
	}

	g_modify_camera = parseInt($(control).val());

	g_current_camera_model = g_current_video_recoder_model.connect_cameras[parseInt($(control).val())];
	init_profile_items(g_current_camera_model);

	isIntelligentCodec = g_current_camera_model.is_intelligent_codec && g_current_video_recoder_model.intelligent_codec;
	if(isIntelligentCodec){
		document.getElementById("check_use_intelligent_codec").disabled = false;
	}
	/*else if (g_current_video_recoder_model.type == VIDEO_RECODER_TYPE.HYBRID) {
    document.getElementById("check_use_intelligent_codec").disabled = false;
	}*/
	else if (g_current_video_recoder_model.type == 0){
		if (g_current_video_recoder_model.intelligent_codec){
			document.getElementById("check_use_intelligent_codec").disabled = false;
		}
		else {
			document.getElementById("check_use_intelligent_codec").disabled = true;
		}
	}
	else{
		document.getElementById("check_use_intelligent_codec").disabled = true;
	}

	if(g_current_camera_model.wdr_limit != '0'){
		document.getElementById("check_use_wdr").disabled = false;
	}
	else{
		document.getElementById("check_use_wdr").disabled = true;
	}
	if(g_current_camera_model.ssl_limit != '0'){
		document.getElementById("check_use_ssl").disabled = false;
	}
	else{
		document.getElementById("check_use_ssl").disabled = true;
	}

	adjustCamera();
	update_detail_ui();
	g_limit_camera = clone(g_current_camera_model);
}

function onClickModifySumit(){
	var index = g_modify_camera;

	//세팅한 값을 g_current_camera_model에 반영
	update_g_current_camera_model();
	g_limit_camera = clone(g_current_camera_model);
	g_current_video_recoder_model.connect_cameras[index] = g_current_camera_model;
	$("input[name^='camera_table_name']").each(function(k, v){
		var count_number = $(this).data("count");
		if(g_current_video_recoder_model.connect_cameras[count_number].name === 'Custom Camera'){
			g_current_video_recoder_model.connect_cameras[count_number].custom_name = v.value;
		}
	});

	reflashSelectedCameraList();

	$('#layer_camera_detail_setting').css('display','none');
	$('#layer_camera_detail_setting_bg').css('display','none');
	$('#submit_modify').css('display','none');

	updateResult();
	g_setting_mode = CAMERA_SETTING_MODE_INSERT;
}

function onClickReport(ele){
	if($('.result_btn_area .reportmenu').css('display')!='block'){
		$('.result_btn_area .reportmenu').slideDown(100);
		setReportFrom();
	}else{
		$('.result_btn_area .reportmenu').slideUp(100);
	}
}

function onClickProject(){
	if($('.result_btn_area .projecteMenu').css('display')!='block'){
		$('.result_btn_area .projecteMenu').slideDown(100);
		setReportFrom();
	}else{
		$('.result_btn_area .projecteMenu').slideUp(100);
	}
}

function onClickProjectSave(mode){
	setProjectSaveFrom();
	$('#project_type').val(mode);
	$('#project_save_form').submit();
	$('.result_btn_area .projecteMenu').slideUp(100);

	if(mode === 'project_copy'){
		parent.projectAdd();
	}
}

function onClickReportActive(mode){
	setProjectSaveFrom();
	$("#report_project_name").val($("#project_name").val());
	if(mode == "pdf" || mode == "excel"){
		$('#report_mode').val(mode);
		if(mode == "pdf"){
			$('#report_form').attr('target','ifrmHiddenframe');
		}else if(mode == "excel"){
			$('#report_form').attr('target','top');
		}
		$('#report_form').submit();
		$('.result_btn_area .reportmenu').slideUp(100);
	}else if(mode == "print"){
		var gsWin = window.open('about:blank','printview','width=500,height=500');

		$('#report_mode').val(mode);
		$('#report_form').attr('target','printview');
		$('#report_form').submit();
		$('.result_btn_area .reportmenu').slideUp(100);
	}
}


function onClickUseIntelligentCodecCheck(control){
	var BRinfo = control.value;
	camera.use_intelligent_codec = document.getElementById("check_use_intelligent_codec").checked;
	onChangeProfileOptions();
}

function onClickUseWDR(control){
	var BRinfo = control.value;
	camera.use_wdr = document.getElementById("check_use_wdr").checked;
	onChangeProfileOptions();
}

function onClickUseSSL(control){
	var BRinfo = control.value;
	camera.use_ssl = document.getElementById("check_use_ssl").checked;
	onChangeProfileOptions();
}

function onClickUseHalfMode(control){
	var BRinfo = control.value;
	camera.use_half_mode = document.getElementById("check_use_half_mode").checked;
	onChangeProfileOptions();
}

function onClickUseDirectIP2(control){
	if (document.getElementById("check_direct_ip_mode").checked){
		onChangeNVRModel();
		document.getElementById("check_direct_ip_mode").checked = true;
		isDirectIP = 2;
		QUALITY_TYPE.QUALITY_LOW = 0;
		QUALITY_TYPE.QUALITY_BASIC =  1;
		QUALITY_TYPE.QUALITY_STANDARD = 3;
		QUALITY_TYPE.QUALITY_HIGH = 5;
		QUALITY_TYPE.QUALITY_VERY_HIGH = 7;
	}
	else {
		onChangeNVRModel();
		document.getElementById("check_direct_ip_mode").checked = false;
		if (g_current_video_recoder_model.direct_ip){
			isDirectIP = 1;
			QUALITY_TYPE.QUALITY_LOW = 0;
			QUALITY_TYPE.QUALITY_BASIC =  1;
			QUALITY_TYPE.QUALITY_STANDARD = 2;
			QUALITY_TYPE.QUALITY_HIGH = 3;
			QUALITY_TYPE.QUALITY_VERY_HIGH = 4;
		}
		else {
			isDirectIP = 0;
			QUALITY_TYPE.QUALITY_LOW = 0;
			QUALITY_TYPE.QUALITY_BASIC =  1;
			QUALITY_TYPE.QUALITY_STANDARD = 2;
			QUALITY_TYPE.QUALITY_HIGH = 3;
			QUALITY_TYPE.QUALITY_VERY_HIGH = 4;
		}
	}
}

function onClickCalculatorDown(odmnum){
	var currentNow = new Date();
	var Promise = window.Promise;
	if (!Promise){
		Promise = JSZip.external.Promise;
	}
	odmnum = odmnum.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "_");

	function urlToPromise(url){
		return new Promise(function(resolve, reject){
			JSZipUtils.getBinaryContent(url, function (err, data){
				if(err){
					reject(err);
				} else {
					resolve(data);
				}
			});
		});
	}

	var indexHtml = '<html>';
	indexHtml += '<head>';
	indexHtml += '<title>Storage Calculator</title>';
	indexHtml += '<meta http-equiv="refresh" content="0;url=\'./design_tool/storage_calculator.html\'">';
	indexHtml += '</head>';
	indexHtml += '<body></body>';
	indexHtml += '</html>';

	var zip = new JSZip();
	zip.file("storage_calculator.html", indexHtml, {binary:true});
	zip.file("skin/design_tool/js/Util.js", urlToPromise("../skin/design_tool/js/Util.js"), {binary:true});
	zip.file("skin/design_tool/js/structure.js", urlToPromise("../skin/design_tool/js/structure.js"), {binary:true});
	zip.file("skin/design_tool/js/main.js", urlToPromise("../skin/design_tool/js/main.js"), {binary:true});
	zip.file("skin/design_tool/js/FileSaver.min.js", urlToPromise("../skin/design_tool/js/FileSaver.min.js"), {binary:true});
	zip.file("skin/design_tool/js/jszip-utils.js", urlToPromise("../skin/design_tool/js/jszip-utils.js"), {binary:true});
	zip.file("skin/design_tool/js/jszip.min.js", urlToPromise("../skin/design_tool/js/jszip.min.js"), {binary:true});
	zip.file("skin/design_tool/js/models_js_"+odmnum+".js", urlToPromise("../skin/design_tool/models_js/models_js_"+odmnum+".js"), {binary:true});
	zip.file("style.css", urlToPromise("../style.css"), {binary:true});
	zip.file("js/common.js", urlToPromise("../js/common.js"), {binary:true});
	zip.file("js/fullPopup_1.3.js", urlToPromise("../js/fullPopup_1.3.js"), {binary:true});
	zip.file("js/jquery-1.8.1.min.js", urlToPromise("../js/jquery-1.8.1.min.js"), {binary:true});
	zip.file("js/jquery.ui.touch-punch.min.js", urlToPromise("../js/jquery.ui.touch-punch.min.js"), {binary:true});
	zip.file("js/wrest.js", urlToPromise("../js/wrest.js"), {binary:true});
	zip.file("design_tool/storage_calculator.html", urlToPromise("../design_tool/storage_calculator_ifrm2.php?filedown=Y"), {binary:true});
	zip.file("css/storage_style.css", urlToPromise("../css/storage_style.css"), {binary:true});
	zip.file("css/style_down.css", urlToPromise("../css/style_down.css"), {binary:true});

	zip.generateAsync({type:"blob"})
	.then(function(blob)
	{
		saveAs(blob, "Storage_Calculator_2.3."+currentNow.getFullYear()+""+(currentNow.getMonth()+1)+""+currentNow.getDate()+".zip");
	});
}
