var uploadResult = false;

function fileQueueError(file, errorCode, message) {
  try {
    var imageName = "error.gif";
    var errorName = "";

    uploadResult = false;
    
    if (errorCode == SWFUpload.errorCode_QUEUE_LIMIT_EXCEEDED) {
      errorName = "您的上传队列已满，不能再上传新文件了";
    }

    if (errorName != "") {
      return;
    }

    switch (errorCode) {
    case SWFUpload.QUEUE_ERROR.ZERO_BYTE_FILE:
      alert("对不起，您不能上传空图片");
      break;
    case SWFUpload.QUEUE_ERROR.FILE_EXCEEDS_SIZE_LIMIT:
      imageName = "toobig.gif";
      alert("对不起，您的图片尺寸超过了2MB");
      break;
    case SWFUpload.QUEUE_ERROR.ZERO_BYTE_FILE:
    case SWFUpload.QUEUE_ERROR.INVALID_FILETYPE:
    default:
      break;
    }
  } catch (ex) {
    this.debug(ex);
  }

}

function fileDialogComplete(numFilesSelected, numFilesQueued) {
  try {
    if (numFilesQueued > 0) {
      this.startUpload();
    }
  } catch (ex) {
    this.debug(ex);
  }
}

function uploadProgress(file, bytesLoaded) {

  try {
    var percent = Math.ceil((bytesLoaded / file.size) * 100);
    
    var progress = new FileProgress(file,  this.customSettings.upload_target);
    progress.setProgress(percent);
    if (percent === 100) {
      progress.setStatus("正在处理图像，如果您的图片较大，可能需要一些时间，请您耐心等待...");
      progress.toggleCancel(false, this);
    } else {
      progress.setStatus("正在上传...");
      progress.toggleCancel(true, this);
    }
  } catch (ex) {
    this.debug(ex);
  }
}

function uploadSuccess(file, serverData, responseReceived) {
  try {
    uploadResult = true;
    addImage(serverData);
    $("a[rel^='prettyPhoto']").prettyPhoto();
  } catch (ex) {
    this.debug(ex);
  }
}

function uploadComplete(file) {
  try {
    /*  I want the next upload to continue automatically so I'll call startUpload here */
    if (this.getStats().files_queued > 0) {
      this.startUpload();
    } else {
      var progress = new FileProgress(file,  this.customSettings.upload_target);
      progress.setComplete();
      if(uploadResult == true) {
        progress.setStatus("图片上传成功，请修改图片信息");
      } else {
        progress.setStatus("图片上传失败");
        $('#upload_tip').show();
      }
      progress.toggleCancel(false);
    }
  } catch (ex) {
    this.debug(ex);
  }
}

function uploadError(file, errorCode, message) {
  var imageName =  "error.gif";
  var progress;
  try {
    switch (errorCode) {
    case SWFUpload.UPLOAD_ERROR.FILE_CANCELLED:
      try {
        progress = new FileProgress(file,  this.customSettings.upload_target);
        progress.setCancelled();
        progress.setStatus("Cancelled");
        progress.toggleCancel(false);
      }
      catch (ex1) {
        this.debug(ex1);
      }
      break;
    case SWFUpload.UPLOAD_ERROR.UPLOAD_STOPPED:
      try {
        progress = new FileProgress(file,  this.customSettings.upload_target);
        progress.setCancelled();
        progress.setStatus("Stopped");
        progress.toggleCancel(true);
      }
      catch (ex2) {
        this.debug(ex2);
      }
    case SWFUpload.UPLOAD_ERROR.UPLOAD_LIMIT_EXCEEDED:
      break;
    case SWFUpload.UPLOAD_ERROR.IO_ERROR:
      alert("对不起，你的网速过慢，超时了，可以试试缩小图片或者传统上传方式！")
      break;
    default:
      if(message == '302') {message = "对不起，请您先登录";}
      alert(message);
      break;
    }
  } catch (ex3) {
    this.debug(ex3);
  }

}

function fadeIn(element, opacity) {
  var reduceOpacityBy = 5;
  var rate = 30;  // 15 fps


  if (opacity < 100) {
    opacity += reduceOpacityBy;
    if (opacity > 100) {
      opacity = 100;
    }

    if (element.filters) {
      try {
        element.filters.item("DXImageTransform.Microsoft.Alpha").opacity = opacity;
      } catch (e) {
        // If it is not set initially, the browser will throw an error.  This will set it if it is not set yet.
        element.style.filter = 'progid:DXImageTransform.Microsoft.Alpha(opacity=' + opacity + ')';
      }
    } else {
      element.style.opacity = opacity / 100;
    }
  }

  if (opacity < 100) {
    setTimeout(function () {
      fadeIn(element, opacity);
    }, rate);
  }
}



/* ******************************************
 *  FileProgress Object
 *  Control object for displaying file info
 * ****************************************** */

function FileProgress(file, targetID) {
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

  } else {
    this.fileProgressElement = this.fileProgressWrapper.firstChild;
    this.fileProgressElement.childNodes[1].firstChild.nodeValue = file.name;
  }

  this.height = this.fileProgressWrapper.offsetHeight;

}
FileProgress.prototype.setProgress = function (percentage) {
  this.fileProgressElement.className = "progressContainer green";
  this.fileProgressElement.childNodes[3].className = "progressBarInProgress";
  this.fileProgressElement.childNodes[3].style.width = percentage + "%";
};
FileProgress.prototype.setComplete = function () {
  this.fileProgressElement.className = "progressContainer blue";
  this.fileProgressElement.childNodes[3].className = "progressBarComplete";
  this.fileProgressElement.childNodes[3].style.width = "";

};
FileProgress.prototype.setError = function () {
  this.fileProgressElement.className = "progressContainer red";
  this.fileProgressElement.childNodes[3].className = "progressBarError";
  this.fileProgressElement.childNodes[3].style.width = "";

};
FileProgress.prototype.setCancelled = function () {
  this.fileProgressElement.className = "progressContainer";
  this.fileProgressElement.childNodes[3].className = "progressBarError";
  this.fileProgressElement.childNodes[3].style.width = "";

};
FileProgress.prototype.setStatus = function (status) {
  this.fileProgressElement.childNodes[2].innerHTML = status;
};

FileProgress.prototype.toggleCancel = function (show, swfuploadInstance) {
  this.fileProgressElement.childNodes[0].style.visibility = show ? "visible" : "hidden";
  if (swfuploadInstance) {
    var fileID = this.fileProgressID;
    this.fileProgressElement.childNodes[0].onclick = function () {
      swfuploadInstance.cancelUpload(fileID);
      return false;
    };
  }
};

function addImage(id)
{
  $.get('/photos/gallery/' + id, function(data){
    $("#photos").prepend(data)
    jQuery("a[rel^='prettyPhoto']").prettyPhoto();
  });
}