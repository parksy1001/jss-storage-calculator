//--------------------------
// 유틸성 함수들이다. 차후에 다 UTIL함수로서 빼낸다.
//--------------------------

//객체를 복사하거나 옮길때는 무조껀 복사가 이루어져야한다
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

//-------------------------------
//        STRUCTURE
//-------------------------------
function ResolutionInfo(type, name, max)
{
    this.type = type;
    this.name = name;
    this.max_framerate = max;
}

function QualityInfo(type, name)
{
    this.type = type;
    this.name = name;
}

function CodecInfo(type, name, format)
{
    this.type = type;
    this.name = name;
    this.format = format;
    this.support_resolution = [];
    this.support_quality = [];
    this.support_framerate = [];

    this.addResolution = function(resolution) {
        for (var x in this.support_resolution) {
            if (this.support_resolution[x].type == resolution.type)
                return false;
        }
        this.support_resolution.push(resolution);
        return true;
    }

    this.addQuality = function(quality) {
        for (var x in this.support_quality) {
            if (this.support_quality[x].type == quality.type)
                return false;
        }
        this.support_quality.push(quality);
        return true;
    }

    this.getResolutionInfo = function(resolution_type) {
        for (var x in this.support_resolution) {
            if (this.support_resolution[x].type == resolution_type)
                return this.support_resolution[x];
        }
        return false;
    }
    this.getQualityInfo = function(quality_type) {
        for (var x in this.support_quality) {
            if (this.support_quality[x].type == quality_type)
                return this.support_quality[x];
        }
        return false;
    }
}

function Camera(type, name, max_stream_count, intelligent_codec, intelligent_codec_ratio, channel, wdr_limit, ssl_limit)
{
    this.ea =1;
    this.type = type;
    this.name = name;
    this.support_codecs = [];
    this.is_intelligent_codec = intelligent_codec;
    this.use_intelligent_codec = false;
    this.max_stream_count = max_stream_count;
    this.current_profiles = [];
    this.channel = channel;
    this.intelligent_codec_ratio = intelligent_codec_ratio
    this.wdr_limit = wdr_limit;
    this.ssl_limit = ssl_limit;
    this.use_wdr = false;
    this.use_ssl = false;
    this.deviceIndex = 0;
    this.channelIndex = 0;

    //only analog
    this.use_audio_input = false;
    this.resolution_source;

    //functions
    this.adjustProfiles;

    this.init = function(use_audio) {
        for (var i = 0; i < UI_STREAM_COUNT; i ++) {
            this.current_profiles.push(new CameraProfile());
        }

    }
    this.addCodec = function(codec)
    {
        for (var x in this.support_codecs) {
            if (this.support_codecs[x].type == codec.type) {
                return false;
            }
        }
        this.support_codecs.push(clone(codec));
        return true;
    }
    this.getCodecInfo = function(codec_type)
    {
        for (var x in this.support_codecs) {
            if (this.support_codecs[x].type == codec_type) {
                return this.support_codecs[x];
            }
        }
        return false;
    }
    this.setAdjustFunction = function(func)
    {
        this.adjustProfiles = func;
    }
    this.setCalculateFunction = function(func)
    {
        this.calculateBitrate = func;
    }
}

function CameraProfile()
{
    //Profile의 값들은 UI에서의 index가 아닌 직접 값을 넣어준다.
    this.use = true;
    this.current_codec = 0;
    this.current_resolution = 0;
    this.current_framerate = 0;
    this.current_quality = 0;
    this.current_bitrate_ratio = 1;
    this.current_bitrate = 0;
}

function VideoRecoder(type, name, max_Hybrid_channel, max_analog_channel, max_network_channel, directIP, intelligent_codec, max_hdd_capacity, e_sata, bandwidth_unit, support_mat)
{
    this.type = type;
    this.name = name;
    this.connect_cameras = [];
    this.max_Hybrid_channel = max_Hybrid_channel;
    this.max_analog_camera_count = max_analog_channel;
    this.max_network_camera_count = max_network_channel;
    this.max_analog_audio_count = 0;
    this.direct_ip = directIP;
    this.intelligent_codec = intelligent_codec;
    this.max_hdd_capacity = max_hdd_capacity;
    this.e_sata = e_sata;
    this.support_camera_types = [];
    this.support_resolution_types = []; // only resolution type array
    this.support_codec_types = []; //only codec type array
    this.support_raid_types = [];
    this.bandwidth_unit = bandwidth_unit;
    this.support_mat = support_mat;
    this.current_record_bitrate = 0;

    // functions
    this.adjustDefaultSettings;
    this.adjustCameras;
    this.calculateBitrate;
    this.calculateCameraBitrate;
    this.calculateCameraSlot;

    this.connectedAnalogCameraCount = function() {
        var count = 0;
        for (var x in this.connect_cameras) {
            if (VIDEO_CAMERA_TYPE.ANALOG == this.connect_cameras[x].type ||
                VIDEO_CAMERA_TYPE.DUMMY_ANALOG == this.connect_cameras[x].type) {
                var cameraSlot = 1;
                var maxPixel = 0;
                var ips = 0;
                var maxResolution = [];
                var resolutions = this.connect_cameras[x].support_codecs[0].support_resolution;
                maxResolution = resolutions[0].name.split('x');
				if (this.connect_cameras[x].use_half_mode) {
					maxResolution[0] = maxResolution[0] / 2;
				}
                maxPixel = Math.round(maxResolution[0] * maxResolution[1] / 1000000);
				if (this.connect_cameras[x].current_profiles[STREAM_RECORD_TIMELAPS].current_framerate > ips) {
					ips = this.connect_cameras[x].current_profiles[STREAM_RECORD_TIMELAPS].current_framerate
				}
				if (this.connect_cameras[x].current_profiles[STREAM_RECORD_EVENT].current_framerate > ips) {
					ips = this.connect_cameras[x].current_profiles[STREAM_RECORD_EVENT].current_framerate
				}
                cameraSlot = this.connect_cameras[x].ea * this.calculateCameraSlot(maxPixel, ips);
                count += cameraSlot;
            }
        }
        return count;
    }
    this.connectedNetworkCameraCount = function() {
        var count = 0;
        for (var x in this.connect_cameras) {
            if (VIDEO_CAMERA_TYPE.NETWORK == this.connect_cameras[x].type ||
                VIDEO_CAMERA_TYPE.NETWORK_3RD == this.connect_cameras[x].type ||
                VIDEO_CAMERA_TYPE.DUMMY_NETWORK == this.connect_cameras[x].type) {
                var cameraSlot = 1;
                var maxPixel = 0;
                var ips = 0;
                var maxResolution = [];
                var resolutions = this.connect_cameras[x].support_codecs[0].support_resolution;
                for (y in resolutions) {
                    if (g_current_video_recoder_model.support_resolution_types.indexOf(resolutions[y].type) != -1) {
                        maxResolution = resolutions[y].name.split('x');
                    }
                }
                maxPixel = Math.round(maxResolution[0] * maxResolution[1] / 1000000);
                if (isDirectIP == 2 || this.connect_cameras[x].name == "Custom Camera") {
                    cameraSlot = this.connect_cameras[x].ea
                }
                else {
                    cameraSlot = this.connect_cameras[x].ea * this.calculateCameraSlot(maxPixel, ips);
                }

                count += cameraSlot;
            }
        }
        return count;
    }

    this.addSupportCodecType = function(codec) {
        for (var x in this.support_codec_types) {
            if (this.support_codec_types[x] == codec) {
                    return false; //already exist
            }
        }
        this.support_codec_types.push(codec);
        return true;
    }
    this.addSupportResolutionType = function(resolution) {
        for (var x in this.support_resolution_types) {
            if (this.support_resolution_types[x] == resolution) {
                return false; //already exist
            }
        }
        this.support_resolution_types.push(resolution);
        return true;
    }
    this.addSupportCameraType = function(camera) {
        for (var x in this.support_camera_types) {
            if (this.support_camera_types[x] == camera) {
                return false;
            }
        }
        this.support_camera_types.push(camera);
        return true;
    }
    this.addSupportRaidType = function(raid) {
        for (var x in this.support_raid_types) {
            if (this.support_raid_types[x] == raid) {
                return false; //already exist
            }
        }
        this.support_raid_types.push(raid);
        return true;
    }
    this.isCameraSupported = function(camera) {
        for (var x in this.support_camera_types) {
            if (this.support_camera_types[x] == camera.type) {
                if (camera.type !=     VIDEO_CAMERA_TYPE.ANALOG && camera.type != VIDEO_CAMERA_TYPE.DUMMY_ANALOG) {
                    for(var y in camera.support_codecs) {
                        var resolutions = camera.support_codecs[y].support_resolution;
                        for (var z in resolutions) {
                            if (this.support_resolution_types.indexOf(resolutions[z].type) != -1) {
                                return true;
                            }
                        }
                    }
                }
                else
                    return true;
            }
        }
        return false;
    }
    this.connectedTotalCameraEA = function () {
    var total = 0;
    for (var x in this.connect_cameras) {
        total += this.connect_cameras[x].ea;
    }
    return total;
};

    this.addCamera = function(camera) {
        var cameraSlot = 1;
        var maxPixel = 0;
        var ips = 0;
        var maxResolution = [];
    if (
    typeof this.max_Hybrid_channel === "number" &&
    this.type === VIDEO_RECODER_TYPE.HYBRID
    ) {
    var total =
        this.connectedAnalogCameraCount() +
        this.connectedNetworkCameraCount();

    if (total + camera.ea > this.max_Hybrid_channel) {
        return false;
    }
}

        switch (camera.type) {
            case VIDEO_CAMERA_TYPE.ANALOG :
            case VIDEO_CAMERA_TYPE.DUMMY_ANALOG : {
                var analogResolutions = camera.support_codecs[0].support_resolution;
                maxResolution = analogResolutions[0].name.split('x');
				if (camera.use_half_mode) {
					maxResolution[0] = maxResolution[0] / 2;
				}
                maxPixel = Math.round(maxResolution[0] * maxResolution[1] / 1000000);
				if (camera.current_profiles[STREAM_RECORD_TIMELAPS].current_framerate > ips) {
					ips = camera.current_profiles[STREAM_RECORD_TIMELAPS].current_framerate
				}
				if (camera.current_profiles[STREAM_RECORD_EVENT].current_framerate > ips) {
					ips = camera.current_profiles[STREAM_RECORD_EVENT].current_framerate
				}
                cameraSlot = camera.ea * this.calculateCameraSlot(maxPixel, ips);
                if (this.connectedAnalogCameraCount()+cameraSlot >= this.max_analog_camera_count+1)
                    return false; // reach max count of analog camera
                break;
            }
            case VIDEO_CAMERA_TYPE.NETWORK :
            case VIDEO_CAMERA_TYPE.DUMMY_NETWORK :
            case VIDEO_CAMERA_TYPE.NETWORK_3RD : {
                var resolutions = camera.support_codecs[0].support_resolution;
                for (var x in resolutions) {
                    if (g_current_video_recoder_model.support_resolution_types.indexOf(resolutions[x].type) != -1) {
                        maxResolution = resolutions[x].name.split('x');
                    }
                }
                maxPixel = Math.round(maxResolution[0] * maxResolution[1] / 1000000);
                if(isDirectIP == 2 || camera.name == "Custom Camera") {
                    cameraSlot = camera.ea;
                }
                else {
                    cameraSlot = camera.ea * this.calculateCameraSlot(maxPixel, ips);
                }
                if (this.connectedNetworkCameraCount()+cameraSlot >= this.max_network_camera_count+1)
                    return false; // reach max count of network camera
                break;
            }
        }

        return this.connect_cameras.push(clone(camera));
    }
    this.eraseCamera = function(index) {
        if (index < this.connect_cameras.length) {
            return this.connect_cameras.splice(index, 1);;
        }
        return false;
    }
	this.availableCamera = function(camera) {
        var cameraSlot = 1;
        var maxPixel = 0;
        var ips = 0;
        var cameraNum = camera.ea;
        var maxResolution = [];
        if (!this.isCameraSupported(camera)) {
            return 0; //not supported camera type
        }
        if (typeof this.max_Hybrid_channel === "number" && this.type === VIDEO_RECODER_TYPE.HYBRID) {
            var currentTotal = this.connectedNetworkCameraCount() + this.connectedAnalogCameraCount();
            var remainHybridTotal = this.max_Hybrid_channel - currentTotal;
        
            // 전체 4채널 중 남은 자리가 1개뿐인데 사용자가 2개를 넣으려 하면, 1개로 제한함
            if (cameraNum > remainHybridTotal) {
                cameraNum = Math.max(0, remainHybridTotal);
        }
    }
        switch (camera.type) {
            case VIDEO_CAMERA_TYPE.ANALOG :
            case VIDEO_CAMERA_TYPE.DUMMY_ANALOG : {
                var analogResolutions = camera.support_codecs[0].support_resolution;
                maxResolution = analogResolutions[0].name.split('x');
				if (camera.use_half_mode) {
					maxResolution[0] = maxResolution[0] / 2;
				}
                maxPixel = Math.round(maxResolution[0] * maxResolution[1] / 1000000);
				if (camera.current_profiles[STREAM_RECORD_TIMELAPS].current_framerate > ips) {
					ips = camera.current_profiles[STREAM_RECORD_TIMELAPS].current_framerate
				}
				if (camera.current_profiles[STREAM_RECORD_EVENT].current_framerate > ips) {
					ips = camera.current_profiles[STREAM_RECORD_EVENT].current_framerate
				}
				while (cameraNum >= 0) {
                    cameraSlot = cameraNum * this.calculateCameraSlot(maxPixel, ips);
                    if (this.connectedAnalogCameraCount()+cameraSlot <= this.max_analog_camera_count)
                        return cameraNum; // reach max count of analog camera
                    cameraNum--;
				}
                break;
            }
            case VIDEO_CAMERA_TYPE.NETWORK :
            case VIDEO_CAMERA_TYPE.DUMMY_NETWORK :
            case VIDEO_CAMERA_TYPE.NETWORK_3RD : {
                var resolutions = camera.support_codecs[0].support_resolution;
                for (var x in resolutions) {
                    if (g_current_video_recoder_model.support_resolution_types.indexOf(resolutions[x].type) != -1) {
                        maxResolution = resolutions[x].name.split('x');
                    }
                }
                maxPixel = Math.round(maxResolution[0] * maxResolution[1] / 1000000);
                while(cameraNum >= 0) {
                    if(isDirectIP == 2 || camera.name == "Custom Camera") {
                        cameraSlot = cameraNum;
                    }
                    else {
                        cameraSlot = cameraNum * this.calculateCameraSlot(maxPixel, ips);
                    }
                    if (this.connectedNetworkCameraCount()+cameraSlot <= this.max_network_camera_count)
                        return cameraNum; // reach max count of network camera
					cameraNum--;
                }
                break;
            }
        }
    }
    this.setAdjustCameras = function(func) {
        this.adjustCameras = func;
    }
    this.setCalculateBitrate = function(func) {
        this.calculateBitrate = func;
    }
    this.setAdjustDefaultSettings = function(func) {
        this.adjustDefaultSettings = func;
    }
    this.setCalculateCameraSlot = function(func) {
        this.calculateCameraSlot = func;
    }
}

// 현재 완전히 NVR 형태에 고정되어 있으므로, 추후에 직접 UI에 접근하는 코드는 들어내도록 수정이 되어야 한다.
function addNumCommas(nStr) {
    nStr += '';
    var x = nStr.split('.');
    var x1 = x[0];
    var x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return x1 + x2;
}

function Units()
{
    this.capacity_unit = ["KB", "MB", "GB", "TB", "PB", "EB"]; // explr

    this.name_list = new Array("bps", "Kbps", "Mbps", "Bps", "KBps", "MBps");
    this.name_list_unit_only = new Array("Bits", "Kilo bits", "Mega bits", "Bytes", "Kilo bytes", "Mega bytes");
    this.scale_list = new Array(1/1000, 1, 1000, 8/1000, 8, 8*1000);

    this.changeOtherUnit = function(value, unitIndex)
    {
        var result = value;
        var selectedUnit = document.getElementById("select_display_unit").selectedIndex;

        result = value * (this.scale_list[selectedUnit] / this.scale_list[unitIndex]);

        return Math.round(result *100) / 100;
    }

    this.withUnit = function(Kbps)
    {
        var selectedUnit = document.getElementById("select_display_unit").selectedIndex;
        var value = (Math.round((Kbps / this.scale_list[selectedUnit]) * 100) / 100);

        if(!value) value=0;

        return  addNumCommas(value) + " " + this.name_list[selectedUnit];
    }
    this.getOnlyUnit = function()
    {
        var selectedUnit = document.getElementById("select_display_unit").selectedIndex;

        return " " + this.name_list[selectedUnit];
    }
    this.withFitUnit = function(kbps)
    {
        var num = kbps  / 8;
        var index = 0;
        for (var x in this.capacity_unit) {
            if (1 < (num / 1024)) {
                num /= 1024;
                ++index;
            }
            else {
                break;
            }
        }

        if (this.capacity_unit.length == index)
        {
            --index;
            num *= 1024;
        }

        var value = (Math.round(num*100) / 100);
        if ((value % 1024) == 0 && value != 0) { value = value / 1024;  index++;}
        return  addNumCommas(value) + " " + this.capacity_unit[index];
    }
}
