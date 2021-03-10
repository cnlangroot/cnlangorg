function resizeIframe(){
    var mainheight=$('.local').height();
    $(window.parent.document).find("#tietuku_ifr").css('height',mainheight+50);
}

function fadeIn(element, opacity){
    var reduceOpacityBy = 5;
    var rate = 30; // 15 fps
    if (opacity < 100) {
        opacity += reduceOpacityBy;
        if (opacity > 100) {
            opacity = 100;
        }

        if (element.filters) {
            try {
                element.filters.item("DXImageTransform.Microsoft.Alpha").opacity = opacity;
            }
            catch (e) {
                element.style.filter = 'progid:DXImageTransform.Microsoft.Alpha(opacity=' + opacity + ')';
            }
        }
        else {
            element.style.opacity = opacity / 100;
        }
    }

    if (opacity < 100) {
        setTimeout(function(){
            fadeIn(element, opacity);
        }, rate);
    }
}

function FileProgress(file, targetID){
    this.fileProgressID = "divFileProgress";

    this.fileProgressWrapper = document.getElementById(this.fileProgressID);
    if (!this.fileProgressWrapper) {
        this.fileProgressWrapper = document.createElement("div");
        this.fileProgressWrapper.className = "progressWrapper";
        this.fileProgressWrapper.id = this.fileProgressID;

        this.fileProgressElement = document.createElement("div");
        this.fileProgressElement.className = "progressContainer";

        var progressCancel = document.createElement("a");
        progressCancel.className = "progressCancel";
        progressCancel.href = "#";
        progressCancel.style.visibility = "hidden";
        progressCancel.appendChild(document.createTextNode(" "));

        var progressText = document.createElement("div");
        progressText.className = "progressName";
        progressText.appendChild(document.createTextNode(file.name));

        var progressBar = document.createElement("div");
        progressBar.className = "progressBarInProgress";

        var progressStatus = document.createElement("div");
        progressStatus.className = "progressBarStatus";
        progressStatus.innerHTML = "&nbsp;";

        this.fileProgressElement.appendChild(progressCancel);
        this.fileProgressElement.appendChild(progressText);
        this.fileProgressElement.appendChild(progressStatus);
        this.fileProgressElement.appendChild(progressBar);

        this.fileProgressWrapper.appendChild(this.fileProgressElement);

        document.getElementById(targetID).appendChild(this.fileProgressWrapper);
        fadeIn(this.fileProgressWrapper, 0);

    }
    else {
        this.fileProgressElement = this.fileProgressWrapper.firstChild;
        this.fileProgressElement.childNodes[1].firstChild.nodeValue = file.name;
    }

    this.height = this.fileProgressWrapper.offsetHeight;

}

FileProgress.prototype.setProgress = function(percentage){
    this.fileProgressElement.className = "progressContainer green";
    this.fileProgressElement.childNodes[3].className = "progressBarInProgress";
    this.fileProgressElement.childNodes[3].style.width = percentage + "%";
};
FileProgress.prototype.setComplete = function(){
    this.fileProgressElement.className = "progressContainer blue";
    this.fileProgressElement.childNodes[3].className = "progressBarComplete";
    this.fileProgressElement.childNodes[3].style.width = "";

};
FileProgress.prototype.setError = function(){
    this.fileProgressElement.className = "progressContainer red";
    this.fileProgressElement.childNodes[3].className = "progressBarError";
    this.fileProgressElement.childNodes[3].style.width = "";

};
FileProgress.prototype.setCancelled = function(){
    this.fileProgressElement.className = "progressContainer";
    this.fileProgressElement.childNodes[3].className = "progressBarError";
    this.fileProgressElement.childNodes[3].style.width = "";

};
FileProgress.prototype.setStatus = function(status){
    this.fileProgressElement.childNodes[2].innerHTML = status;
};
FileProgress.prototype.toggleCancel = function(show, swfuploadInstance){
    this.fileProgressElement.childNodes[0].style.visibility = show ? "visible" : "hidden";
    if (swfuploadInstance) {
        var fileID = this.fileProgressID;
        this.fileProgressElement.childNodes[0].onclick = function(){
            swfuploadInstance.cancelUpload(fileID);
            return false;
        };
    }
};

function uploadProgress(file, bytesLoaded){

    try {
        var percent = Math.ceil((bytesLoaded / file.size) * 100);
        var progress = new FileProgress(file,  'divFileProgressContainer');
        progress.setProgress(percent);
        if(percent>100){percent=100}
        if (percent === 100) {
            progress.setStatus("文件上传成功");
            progress.toggleCancel(false, this);
        } else {
            progress.setStatus("正在上传("+percent+" %)请稍后...");
            progress.toggleCancel(true, this);
        }
    } catch (ex) {
        this.debug(ex);
    }
}
function uploadError(file, message){
    var progress;
    var errorCode = message.error.code;
    try {
        progress = new FileProgress(file, 'divFileProgressContainer');
        progress.setCancelled();
        progress.setStatus('错误代码：'+errorCode+' 错误信息：'+message.error.message);
        progress.toggleCancel(false);
    }
    catch (ex1) {
        this.debug(ex1);
    }
}

function addImage(src,obj){


    var b = new Base64();

    var newElement = "<li><img title='点击图片添加到帖子内容中' class='content' src='" + src + "' style=\"width:75px;height:75px;\" onclick=\"insertEdit('"+b.encode(obj.image.url4)+"',false);\" data='"+b.encode(obj.image.url4)+"'><div class='button'>删除</div></li>";
    $("#pic_list").append(newElement);
    $("div.button").last().bind("click", del);

}

var del = function(){
//    var fid = $(this).parent().prevAll().length + 1;
    // var src=$(this).siblings('img').attr('src');
    // var $svalue=$('form>input[name=s]').val();

    // $.ajax({
    // type: "GET", //访问WebService使用Post方式请求
    // url: window.url+"/del", //调用WebService的地址和方法名称组合---WsURL/方法名
    // data: "src=" + src,
    // success: function(data){
    // var $val=$svalue.replace(data,'');
    // $('form>input[name=s]').val($val);
    // }
    // });
    $(this).parent().remove();
}


var successNum=0;

function uploadSuccess(file, serverData){
    serverData2=serverData.image;
    if(serverData2.url4){
        successNum++;
    }
    addImage(serverData2.url4,serverData);
    resizeIframe();
    // var $svalue=$('form>input[name=s]').val();
    // if($svalue==''){
    // $('form>input[name=s]').val(serverData);
    // }else{
    // $('form>input[name=s]').val($svalue+"|"+serverData);
    // }

}

function uploadComplete(file){

    try {

            var progress = new FileProgress(file, 'divFileProgressContainer');
            progress.setComplete();
            progress.setStatus('<span class="xi1">'+successNum+'张上传成功</span>');
            progress.toggleCancel(false);
            setTimeout(function(){$('.progressName').hide();},1000)

    }
    catch (ex) {
        this.debug(ex);
    }
}

function insertHrImage(url,ubburl) {
    window.parent.checkFocus();
    if(window.parent.wysiwyg) {
        if(url !== false) {
            if(ubburl || ubburl!=''){
                window.parent.insertText('<br><a href="' + ubburl + '" target="_blank"><img src="' + url + '" border="0" alt="" /></a><br><br>', false);
            }else{
                window.parent.insertText('<br><img src="' + url + '" border="0" alt="" /><br><br>', false);
            }
        } else {
            window.parent.insertText('<hr class="l">', 14);
        }
    } else {
        if(url !== false) {
            if(ubburl || ubburl!=''){
                code = '\n[url='+ ubburl +'][img]'+url+'[/img][/url]\n';
            }else{
                code = '\n[img]'+url+'[/img]\n';
            }

        } else {
            code = '[hr]';
        }
        window.parent.insertText(code, window.parent.strlen(code), 0);
    }

    window.parent.hideMenu();
}

function Base64() {

    // private property
    _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

    // public method for encoding
    this.encode = function (input) {
        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;
        input = _utf8_encode(input);
        while (i < input.length) {
            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);
            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;
            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }
            output = output +
                _keyStr.charAt(enc1) + _keyStr.charAt(enc2) +
                _keyStr.charAt(enc3) + _keyStr.charAt(enc4);
        }
        return output;
    }

    // public method for decoding
    this.decode = function (input) {
        var output = "";
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;
        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
        while (i < input.length) {
            enc1 = _keyStr.indexOf(input.charAt(i++));
            enc2 = _keyStr.indexOf(input.charAt(i++));
            enc3 = _keyStr.indexOf(input.charAt(i++));
            enc4 = _keyStr.indexOf(input.charAt(i++));
            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;
            output = output + String.fromCharCode(chr1);
            if (enc3 != 64) {
                output = output + String.fromCharCode(chr2);
            }
            if (enc4 != 64) {
                output = output + String.fromCharCode(chr3);
            }
        }
        output = _utf8_decode(output);
        return output;
    }

    // private method for UTF-8 encoding
    _utf8_encode = function (string) {
        string = string.replace(/\r\n/g,"\n");
        var utftext = "";
        for (var n = 0; n < string.length; n++) {
            var c = string.charCodeAt(n);
            if (c < 128) {
                utftext += String.fromCharCode(c);
            } else if((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            } else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }

        }
        return utftext;
    }

    // private method for UTF-8 decoding
    _utf8_decode = function (utftext) {
        var string = "";
        var i = 0;
        var c = c1 = c2 = 0;
        while ( i < utftext.length ) {
            c = utftext.charCodeAt(i);
            if (c < 128) {
                string += String.fromCharCode(c);
                i++;
            } else if((c > 191) && (c < 224)) {
                c2 = utftext.charCodeAt(i+1);
                string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                i += 2;
            } else {
                c2 = utftext.charCodeAt(i+1);
                c3 = utftext.charCodeAt(i+2);
                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3;
            }
        }
        return string;
    }
}

window.onload = function () {

    $('#up_to_chevereto').change(function() {

        window.wpActiveEditor = null;

        var uname=getQueryVariable('uname');
        var uemail=getQueryVariable('email');

        var url;
        if(uname && uemail)
            url = "https://i1.zmsjaz.com/chevereto/api/1/upload/?key=526809dd2ba02d634b06a313f927e5c1&format=json&name="+uname+"&email="+uemail;
        else
            url = 'https://i1.zmsjaz.com/chevereto/api/1/upload/?key=526809dd2ba02d634b06a313f927e5c1&format=json'

        var nfile = this.files.length;
        for (var i = 0; i < this.files.length; i++) {
            var f=this.files[i];
            var formData=new FormData();
            formData.append('source', f);
            $.ajax({
                async:true,
                crossDomain:true,
                url:url,
                type : 'POST',


                processData : false,
                contentType : false,
                data:formData,

                xhr: function() {

                    myXhr = $.ajaxSettings.xhr();
                    if(myXhr.upload){ // check if upload property exists
                        myXhr.upload.addEventListener('progress',function(e){
                            var loaded = e.loaded;                  //已经上传大小情况
                            var total = e.total;                      //附件总大小
                            var percent = Math.floor(100*loaded/total)+"%";     //已经上传的百分比
                            uploadProgress(f,loaded);
                        }, false);
                    }
                    return myXhr;

                },
                beforeSend: function (xhr) {

                },
                success:function(res){
                        uploadSuccess(f,res);

                    if(i == nfile)
                        uploadComplete(f);
                },
                error: function (){
                    var message = this.error.arguments["0"].responseText;
                    message = jQuery.parseJSON(message);
                    uploadError(f,message);
                }

            });
        }
    });


};



