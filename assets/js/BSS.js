jQuery.ajax({
    async: false,
    type: 'GET',
    url: "/js/loading/loadingoverlay.js",
    data: null,
    success: undefined,
    dataType: 'script',
    error: function (xhr, textStatus, errorThrown) {
        // Look at the `textStatus` and/or `errorThrown` properties.
        bkav_alert_error('Có lỗi xảy ra. Xin vui lòng thử lại sau hoặc thông báo với quản trị (Error: ' + textStatus + ').', 800);
    }
});

//.done(function (script, textStatus) {
//    
//    console.log(textStatus);
//})
//.fail(function (jqxhr, settings, exception) {
//    
//    $("div.log").text("Triggered ajaxError handler.");
//});

var SystemDomainName = "Bkav";
var Guid_Empty = "00000000-0000-0000-0000-000000000000";

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// AjaxRequest: Gọi Ajax lên Webservice
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Ví dụ sử dụng AJAXRequest
//
//function Search() {
//    var objSearch = {
//        InvoiceTemplateID: $("#ddlInvoiceTemplate").val(),
//        InvoiceSerial: $("#ddlInvoiceSerial").val()
//    };
//
//    AjaxPostRequest("/WebServices/wsInvoiceRelease.asmx/GetUcFormInvoiceRelease", objSearch,
//        function (data) {
//            if (data.Status == 0) {
//                $('#divResult').html(data.Object);
//            } else {
//                $('#divResult').html("data.Status is not supported");
//            }
//        }, ShowLoading, "divResult");
//};
var ShowLoading = true;
var NoShowLoading = false;
function AjaxPostRequest(url, parameters, successCallback, showLoading, divLoading) {
    AjaxRequest(url, parameters, 'POST', true, showLoading, divLoading, 'json', successCallback);
}

function AjaxPostRequestSync(url, parameters, successCallback, showLoading, divLoading) {
    AjaxRequest(url, parameters, 'POST', false, showLoading, divLoading, 'json', successCallback);
}

function AjaxGetRequest(url, parameters, successCallback, showLoading, divLoading) {
    AjaxRequest(url, parameters, 'GET', true, showLoading, divLoading, 'json', successCallback);
}

function AjaxGetRequestSync(url, parameters, successCallback, showLoading, divLoading) {
    AjaxRequest(url, parameters, 'GET', false, showLoading, divLoading, 'json', successCallback);
}

function AjaxByObject(obj) {
    AjaxRequest(obj.Url, obj.Parameters, obj.Type, obj.Async, obj.ShowLoading, obj.DivLoading, obj.DataType, obj.SuccessCallback, obj.ErrorCallback)
}

function AjaxRequest(url, parameters, type, async, showLoading, divLoading, dataType, successCallback, errorCallback) {
    showLoading = (showLoading == ShowLoading || showLoading === undefined) && typeof $.LoadingOverlay === "function";
    var selector = $;
    if (divLoading !== undefined) {
        if (divLoading.indexOf('#') == 0) selector = $(divLoading);
        else selector = $("#" + divLoading);
    }
    if (showLoading) {
        if (typeof selector.offset === "function") var offset = selector.offset();
        if (offset === undefined) selector.LoadingOverlay("show");
        else {
            var
                scrollTop = $(this).scrollTop(),
                scrollBot = scrollTop + $(this).height(),
                elTop = selector.offset().top,
                elBottom = elTop + selector.outerHeight(),
                visibleTop = elTop < scrollTop ? scrollTop : elTop,
                visibleBottom = elBottom > scrollBot ? scrollBot : elBottom;

            var ho = visibleBottom - visibleTop;
            var h = selector.height();
            if (h > ho) h = ho;
            h = h / 2;

            var w = selector.width();
            if (w > screen.width) w = screen.width;
            w = w / 2;

            if (ho < 200) selector.LoadingOverlay("show");
            else selector.LoadingOverlay("show", { imagePosition: w + "px " + h + "px" });
        }
    }
    $.ajax({
        url: url == undefined ? "" : url,
        data: parameters == undefined ? "" : JSON.stringify(parameters),
        type: type == undefined ? 'POST' : type,
        async: async == undefined ? true : async,
        contentType: 'application/json; charset=utf-8',
        dataType: (dataType == undefined ? 'json' : dataType),
        success: function (data) {
            if (showLoading) selector.LoadingOverlay("hide");
            data = data.hasOwnProperty("d") ? data.d : data;
            if (data == 403) {//Hết session khi gọi api
                //bkav_alert_warning("Phiên làm việc đã hết, bạn vui lòng đăng nhập lại để sử dụng.");
                window.location.href = "/Login?UrlLocation=" + window.location;
                return;
            }
            if (data.hasOwnProperty("Status") && data.hasOwnProperty("Object")) { // trả về object Result
                if (data.Status == 1) {
                    if (errorCallback !== undefined && typeof errorCallback === "function") {
                        errorCallback(data);
                        return;
                    }
                    bkav_alert_error(data.Object);
                }
                else if (successCallback !== undefined && typeof successCallback === "function") successCallback(data);
            } else
                if (successCallback !== undefined && typeof successCallback === "function") successCallback(data);
        },
        error: function (xhr, textStatus, errorThrown) {
            if (showLoading) selector.LoadingOverlay("hide");
            if (errorCallback !== undefined && typeof errorCallback === "function") errorCallback();

            if (xhr.status == 403 || xhr.status == 500)//Hết session khi gọi ws
            {
                bkav_alert_common({
                    Message: 'Đã hết phiên làm việc. Bạn bấm <b>Đăng nhập lại</b> để trở về trang đăng nhập.',
                    TypeIcon: TypeIcon.warning,
                    Buttons: [{ Text: "Đăng nhập lại", Highlight: true }],
                    CloseCallBack: function () {
                        window.location.href = "/Login?UrlLocation=" + window.location;
                    }
                });
                return;
            }
            console.log(xhr);

            var message = xhr.responseText != undefined ? xhr.responseText : textStatus;
            bkav_alert_error('Có lỗi xảy ra. Xin vui lòng thử lại sau hoặc thông báo với quản trị (Error: ' + message + ').');
        }
    });
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Load UserControl from Webservice:
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function LoadUserControl(url, parameters, controlId, showLoading, callbackfunc) {
    AjaxPostRequest(url, parameters,
        function (data) {
            if (data.hasOwnProperty("Status") && data.hasOwnProperty("Object")) { // trả về object Result
                if (data.Status == 0) {
                    $("#" + controlId).html(data.Object);
                    if (callbackfunc !== undefined) callbackfunc();
                }
                else bkav_alert_error(data.Object, 800);
            } else {
                $("#" + controlId).html(data);
            }
        }, showLoading, controlId);
}



/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Alert:
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var idDialogBkavAlert = "Bkav_alert_dialog";
var TypeIcon = { error: 1, success: 2, warning: 3 };

var objBkavAlert = { ID: "1", Message: "Thông báo", TypeIcon: TypeIcon.success, CloseCallBack: function () { alert("closed"); }, Buttons: [{ Text: "Sửa", Click: function () { }, Highlight: true }, { Text: "Đóng" }] };

function bkav_alert_warning(message, width) {
    objBkavAlert = { Message: message, Width: width, TypeIcon: TypeIcon.warning };
    bkav_alert_common(objBkavAlert);
}

function bkav_alert_success(message, width) {
    objBkavAlert = { Message: message, Width: width, TypeIcon: TypeIcon.success };
    bkav_alert_common(objBkavAlert);
}

function bkav_alert_error(message, width) {
    objBkavAlert = { Message: message, Width: width, TypeIcon: TypeIcon.error };
    bkav_alert_common(objBkavAlert);
}

function bkav_confirm(message, yesCallback, width) {
    bkav_alert_common({
        TypeIcon: TypeIcon.warning,
        Message: message,
        Width: width,
        Buttons: [{
            Text: "Có",
            Click: function () {
                if (yesCallback !== undefined && typeof yesCallback === "function") yesCallback();
            }
        },
        {
            Text: "Không",
            Highlight: true
        }]
    });
}

function bkav_alert_common(objAlert) {
    objBkavAlert = objAlert;
    var title = (objBkavAlert.Title == undefined ? SystemDomainName : objBkavAlert.Title);

    var buttons = "";
    if (objBkavAlert.Buttons == undefined || objBkavAlert.Buttons.length == 0)
        objBkavAlert.Buttons = [{ Text: "Đóng", Highlight: true }];

    for (var i = 0; i < objBkavAlert.Buttons.length; i++) {
        var button = objBkavAlert.Buttons[i];
        var classButton = button.Highlight ? "btn-primary" : "btn-close";
        buttons = buttons + "<button autofocus class='btn " + classButton + "' onclick='return bkav_alert_function(" + i + ")'>" + button.Text + "</button>";
    }
    var htmlButtons = "<div style='float:right;clear: both;margin-top:10px'>" + buttons + "</div>";
    var htmlicon = "";
    var urlIcon = GetUrlIconType(objBkavAlert.TypeIcon);
    if (urlIcon != undefined)
        htmlicon = "<div style='width:52px;float:left'>" +
            "  <img src='" + urlIcon + "' class='img' width='50px' style='margin: 0px 10px 0px 0px;'/>" +
            " </div>";
    var width = objBkavAlert.Width != undefined && objBkavAlert.Width != 0 ? objBkavAlert.Width : $(window).width() * 2 / 3;
    var minWidth = width + 50;
    var styleContent = "";
    if (htmlicon != "")
        styleContent = ("style='width:" + (width - 70) + "px;float:right'");

    var htmlcontent = "<div style='margin:5px'>" +
        "<div style='min-height:38px'>" +
        htmlicon +
        " <div " + styleContent + ">" +
        objBkavAlert.Message +
        "</div>" +
        "</div>" +
        htmlButtons +
        "</div>";

    if ($('#' + idDialogBkavAlert).length > 0)
        $('#' + idDialogBkavAlert).html(htmlcontent);
    else
        $(document.body).append("<div class='container' id='" + idDialogBkavAlert + "' style='margin-bottom: 10px'>" +
            htmlcontent + "</div>");

    $("#" + idDialogBkavAlert).dialog({
        resizable: false,
        modal: true,
        title: title,
        minWidth: minWidth,
        width: width,
        closeOnEscape: true,
        autoOpen: false,
        closeOnEscape: objBkavAlert.closeOnEscape === undefined ? true : objBkavAlert.closeOnEscape,
        create: function () {
            $(this).closest(".ui-dialog").css("z-index", "999");// Hiển thị Popup Alert lên trên cùng của giao diện
        },
        close: function () {
            if (objAlert.CloseCallBack !== undefined) objAlert.CloseCallBack();
        }
    });

    OpenDialog(idDialogBkavAlert);

    return false; // clear onClick Postback
}

function bkav_alert_function(indexButton) {
    var button = objBkavAlert.Buttons[indexButton];
    var functionName = button.Click;
    if (functionName != undefined)
        if ((typeof button.Click) == "string")
            eval(button.Click);
        else
            button.Click();

    bkav_alert_close();
    return false;
}

function GetUrlIconType(typeIcon) {
    switch (typeIcon) {
        case TypeIcon.error: return '/Images/Icons/icon-loi.png';
        case TypeIcon.success: return '/Images/Icons/icon-thanh-cong.png';
        case TypeIcon.warning: return '/Images/Icons/icon-thong-bao.png';
    }
}

function bkav_alert_close() {
    $("#" + idDialogBkavAlert).dialog("close");
}


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Show Popup:
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// Ví dụ khai báo các tham số của 1 popup
//var Popup = {
//    // Khai báo popup load theo kiểu UC (UserControl)
//    UploadFile: { Name: "UploadFile", Title: "Upload File", Width: 1000, Height: 380, Url: "/WebService/WsGetHtmlFromUC.asmx/GetHtmlFromUcUploadFile", ShowPopup: ShowPopup, ClosePopup: ClosePopup, sourceType="UC" },
//    EditProfile: { Name: "EditProfile", Title: "Sửa Hồ sơ", Width: 850, Height: 380, Url: "/WebService/WsGetHtmlFromUC.asmx/GetHtmlFromUcUpdateProfile", ShowPopup: ShowPopup, ClosePopup: function (reload) { if (reload) LoadListProfile(); $('#dialog' + this.popupName).dialog('close'); } },
//    HistoryProfile: { Name: "HistoryProfile", Title: "Lịch sử Hồ sơ", Width: 850, Height: 380, Url: "/WebService/WsGetHtmlFromUC.asmx/GetHtmlFromUcHistoryProfile", ShowPopup: ShowPopup, ClosePopup: function (reload) { if (reload) LoadListProfile(); $('#dialog' + this.popupName).dialog('close'); } },
//    ListProfileItemFile: { Name: "ListProfileItemFile", Title: "Xem Danh sách Phiên bản và Lịch sử Tờ khai", Width: 1000, Height: 650, Url: "/WebService/WsGetHtmlFromUC.asmx/GetHtmlFromUcListProfileItemFile", ShowPopup: ShowPopup, ClosePopup: function (reload) { if (reload) LoadListProfile(); $('#dialog' + this.popupName).dialog('close'); } },
//
//    // Khai báo popup load theo kiểu Page
//    ChooseDeclaration: { Name: "ChooseDeclaration", Title: "Chọn phụ lục", Width: 400, Height: 250, Url: "/ChooseDeclaration.aspx", ShowPopup: ShowPopup, ClosePopup: ClosePopup }
//}
//
// Ví dụ mở popup theo kiểu UC (UserControl), có ghi Activity log cho PageGUID
// Popup.UploadFile.ShowPopup({ ProfileGuid: ProfileGuid, ProfileItemGuid: '' }, PageGUID)
//
// Ví dụ mở popup theo kiểu Page, không ghi log
// Popup.ChooseDeclaration.ShowPopup("DeclarationCodeMain=1&FunctionForEventSave=SaveChooseDeclarationoForFileUpload");
//
// ObjectGUID là PageGUID nếu muốn ghi log Activity theo trang, hoặc là 1 FuncGUID nếu muốn ghi log Activity cho từng Function
// sourceType: kiểu load: theo UC - UserControl hoặc theo Page 
// Load theo UC thì params là object chứa các tham số của UserControl
// Load theo Page thì params là string, ghép vào URL của trang khi load trang
function ShowPopup(ObjectGUID, params) {
    this.Params = params;

    var writeLog = this.WriteLog;
    if (writeLog !== undefined) {
        if (ObjectGUID === undefined || ObjectGUID === "") ObjectGUID = PageGUID;
        if (ObjectGUID !== undefined) {
            WL(ObjectGUID, "Bấm " + this.Title);
        }
    }
    var sourceType = this.SourceType === undefined ? GetSourceType(this.Url, params) : this.SourceType;
    var url = params === undefined ? this.Url : this.Url + params;
    switch (sourceType) {
        case "Div": OpenDialogByDiv(this.Name, this.Title, this.Width, this.Height, this.Style, this.CloseCallBack); break;
        case "UC": OpenDialogByUserControl(this, params); break;
        case "Page": OpenDialogByPage(this.Name, this.Title, this.Width, this.Height, this.Style, url, this.ScrollingType, this.FnCallbackOpen); break;
        case "PageWithPost": OpenDialogByPageWithPost(this, params); break;
    }
}

function ReloadPopup() {
    LoadUserControl(this.Url, this.Params, this.Name, this.loadingId);
}

function GetSourceType(url, params) {
    if (url === undefined || url == "") return "Div";
    if (url.indexOf(".asmx") >= 0) return "UC";

    if (typeof params === 'string' || params === undefined) return "Page";

    return "PageWithPost";
}

//ClosePopup Pupup for all Page
function ClosePopup(reload) {
    $('#' + this.Name).dialog('close');
    if (reload !== undefined) location.reload();
}

function ClosePopupByName(namePopup) {
    if (namePopup == undefined)
        $('#' + this.Name).dialog('close');
    else
        $('#' + namePopup).dialog('close');
}

function OpenDialog(name) {
    $("#" + name).dialog("open");
}

function OpenDialogByDiv(name, title, width, height, style, closeCallBack) {
    $("#" + name).dialog({
        title: title,
        width: width,
        height: height,
        dialogClass: style,
        resizable: false,
        modal: true,
        autoOpen: false,
        close: function () {
            if (closeCallBack !== undefined) closeCallBack();
        }
    });

    $("#" + name).parent().appendTo("form");
    OpenDialog(name);
}

function OpenDialogByUserControl(obj, params) {
    var dialogID = obj.Name;
    if ($("#" + dialogID).length > 0) $("#" + dialogID).remove();

    $(document.body).append("<div id='" + dialogID + "'></div>");

    $("#" + dialogID).dialog({
        title: obj.Title,
        width: obj.Width,
        height: obj.Height == undefined ? "auto" : obj.Height,
        dialogClass: obj.Style,
        resizable: false,
        modal: true,
        autoOpen: false,
        closeOnEscape: true
    });

    OpenDialog(obj.Name);

    LoadUserControl(obj.Url, params, dialogID, obj.ShowLoading,
        function () {
            $("#" + dialogID).parent().position({
                my: "center",
                at: "center",
                of: window
            });
        }
    );
}

function OpenDialogByPage(name, title, width, height, style, url, scrollingType, fnCallbackOpen) {
    if ($("#" + name).length > 0) $("#" + name).remove();

    $(document.body).append(
        "<div id='" + name + "'>"
        + "<iframe id='frame" + name + "'  name='frame" + name + "' frameborder='0' width='100%' Scrolling='" + scrollingType + "' style='overflow: hidden;" +
        "overflow-x: hidden; overflow-y: hidden; height: 100%; width: 100%; position: absolute;" +
        "top: 0px; left: 0px; right: 0px; bottom: 0px'></iframe>" +
        "</div>");

    $("#" + name).dialog({
        title: title,
        width: width,
        height: height,
        dialogClass: style,
        open: function (type, data) {
            $("#" + name).LoadingOverlay("show");

            $("#frame" + name).attr("src", url);

            var iframe = document.getElementById("frame" + name);
            iframe.onload = function () {
                $("#" + name).LoadingOverlay("hide");

                var html = this.contentDocument.body;

                var pageHeight = Math.max(this.scrollHeight, this.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight) + 50;

                if (pageHeight < height) $("#" + name).dialog("option", "height", pageHeight);

                $('.ui-dialog').focus();
                if (fnCallbackOpen !== undefined && typeof fnCallbackOpen === "function") fnCallbackOpen();
            };
        },
        resizable: false,
        modal: true,
        closeOnEscape: true,
        autoOpen: false
    });

    OpenDialog(name);
}

function OpenDialogByPageWithPost(obj, params) {
    if ($("#" + obj.Name).length == 0)
        $(document.body).append(
            "<div id='" + obj.Name + "'>"
            + "<iframe id='frame" + obj.Name + "'  name='frame" + obj.Name + "' frameborder='0' width='100%' Scrolling='" + obj.ScrollingType + "' style='overflow: hidden;" +
            "overflow-x: hidden; overflow-y: hidden; height: 100%; width: 100%; position: absolute;" +
            "top: 0px; left: 0px; right: 0px; bottom: 0px'></iframe>" +
            "</div>");

    $("#" + obj.Name).dialog({
        title: obj.Title,
        width: obj.Width,
        height: obj.Height,
        dialogClass: obj.Style,
        open: function (type, data) {
            OpenDialogByPageWithPost_LoadHTML(obj, params);
        },
        resizable: false,
        modal: true,
        closeOnEscape: true,
        autoOpen: false
    });

    OpenDialog(obj.Name);
}

function OpenDialogByPageWithPost_LoadHTML(obj, params) {
    var ua = window.navigator.userAgent;
    var msie = ua.indexOf("MSIE");

    if (msie <= 0 && navigator.appName != "Netscape") {//Other browser
        $("#" + obj.Name).LoadingOverlay("show");
    }

    var htmlPage;
    AjaxByObject({
        Url: obj.Url,
        Parameters: params,
        DataType: "html",
        Async: false,
        ShowLoading: false,
        SuccessCallback: function (data) {
            htmlPage = data;
        }
    });

    var iframe = document.getElementById("frame" + obj.Name);

    if (msie <= 0 && navigator.appName != "Netscape") {
        iframe.contentWindow.document.write(htmlPage);
    }
    else {
        iframe.srcdoc = htmlPage;
    }
    iframe.onload = function () {
        if (msie <= 0 && navigator.appName != "Netscape") {
            $("#" + obj.Name).LoadingOverlay("hide");
        }

        var innerDoc = iframe.contentDocument || iframe.contentWindow.document;

        if (msie <= 0) {
            innerDoc.forms[0]["action"] = obj.Url;
        }
        else {
            iframe.contentWindow.document.forms[0]["action"] = obj.Url;
        }
    };
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// WL: Write Activity log
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function WL(ObjectGUID, LogContent) {
    var params = { objectGUID: ObjectGUID, logContent: LogContent };

    AjaxPostRequest("/WebServices/WsActivityLog.asmx/WL", params, undefined, NoShowLoading);
}

//File mẫu WsActivityLog.cs, cho phép ghi log Activity qua Webservice
//
//using BSS;
//using BSS.DataValidator;
//using System;
//using System.Web.Services;

///// <summary>
///// Summary description for WsActivityLog
///// </summary>
//[WebService(Namespace = "http://tempuri.org/")]
//// To allow this Web Service to be called from script, using ASP.NET AJAX, uncomment the following line. 
//[System.Web.Script.Services.ScriptService]
//public class WsActivityLog : AuthenticatePage
//{
//    [WebMethod(enableSession: true)]
//    public Result WL(string objectGUID, string logContent)
//    {
//        var o = new { objectGUID, logContent };

//        string msg = DataValidator.Validate(o).ToErrorMessage());
//        if (msg.Length > 0) return ProcessErrorWS(msg);

//        msg = BSS.Log.WriteActivityLog(logContent, guid, UserID, IPAddress));
//        if (msg.Length > 0) return ProcessErrorWS(msg);

//        return Result.ResultOk;
//    }
//}


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// SendDataToPageViaFormInputs: Send variable at client-side to code-behind
// parameters là object: các cặp key-value
// Sử dụng:
// <asp:Button ID="Button" runat="server" Text="Button"  OnClientClick ="SendDataToPageViaFormInputs( { var1: "hello", var2: "world"} );" />
// ở Page_Load: đọc các giá trị được post lên qua form: Request.Form("var1"), Request.Form("var2")
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function SendDataToPageViaFormInputs(parameters) {
    for (key in parameters) {
        var t = document.createElement("INPUT");
        t.type = "hidden";
        t.name = key;
        t.value = parameters[key];
        document.forms[0].appendChild(t);
    }
}

var SetDelayTimer = (function () {
    var timer = 0;
    return function (callback, ms) {
        clearTimeout(timer);
        timer = setTimeout(callback, ms);
    };
})();




/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// InitPopover: hiển thị pophover của Boostrap khi di chuột vào phần nội dung sẽ không mất đi
// parameters là object: các cặp key-value
// Sử dụng: Thêm data-toggle="popover" data-placement="bottom" data-trigger="hover click" data-content="ABC" 
// <span class="pop" data-toggle="popover" data-placement="bottom" data-trigger="hover click" data-content="ABC"> Noi dung </span>
// Ở document.ready gọi
// $(document).ready(function () {
//       InitPopover();
// });
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 
function InitPopover(timeshow) {
    if (timeshow === undefined) timeshow = 500;
    $(".popover").remove();
    var PopoverHolds = {};
    $('[data-toggle="popover"]').popover({ container: 'body', html: true, animation: true, trigger: "hover", delay: { "show": 200, "hide": 300 } })
        .on('shown.bs.popover', function () {
            var _this = this;
            var id = _this.getAttribute('aria-describedby');

            $(".popover")
                .on("mouseenter", function () {
                    PopoverHolds[id] = true;
                })
                .on("mouseleave", function () {
                    PopoverHolds[id] = false;
                    delete PopoverHolds[id];
                    setTimeout(function () {
                        $(_this).popover('hide');
                    }, timeshow);
                })
        })
        .on('hide.bs.popover', function (e) {
            var id = this.getAttribute('aria-describedby');
            if (PopoverHolds[id]) return false;
        });
}

function CreatePopover(object, message, position, trigger) {
    var jObject = $(object);
    jObject.attr("data-html", "true");
    jObject.attr("data-toggle", "popover");
    jObject.attr("data-popover", "true");
    jObject.attr("data-content", message);
    jObject.attr("data-placement", position);

    if (trigger !== undefined) jObject.attr("data-trigger", trigger);
}


function InitDropDown() {
    $('.dropdown').hover(function () {
        $(this).find('.dropdown-menu').first().stop(true, true).delay(100).slideDown();
    }, function () {
        $(this).find('.dropdown-menu').first().stop(true, true).delay(150).slideUp()
    });
}


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Validate Input
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function InputLimiter(e, allow) {
    var AllowableCharacters = '';

    if (allow == 'Letters') { AllowableCharacters = ' ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'; }
    else if (allow == 'Numbers') { AllowableCharacters = '1234567890'; }
    else if (allow == 'NameCharacters') { AllowableCharacters = ' ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-.\''; }
    else if (allow == 'NameCharactersAndNumbers') { AllowableCharacters = '1234567890 ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-\''; }
    else if (allow == '09az') { AllowableCharacters = '1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'; }
    else AllowableCharacters = allow;

    var k = document.all ? parseInt(e.keyCode) : parseInt(e.which);
    if (k != 13 && k != 8 && k != 0) {
        if ((e.ctrlKey == false) && (e.altKey == false)) {
            var ok = (AllowableCharacters.indexOf(String.fromCharCode(k)) != -1);
            if (!ok) Beep();
            return ok;
        } else {
            return true;
        }
    } else {
        return true;
    }
}

function Beep() {
    var snd = new Audio("data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=");
    snd.play();
}


function ValidateVietnameseNumber(value) {
    if (value === undefined) return false;

    value = value.toString();

    var commaParts = value.split(",");
    if (commaParts.length > 2) return false; // có nhiều hơn 1 dấu phẩy là sai

    if (commaParts.length == 2 && commaParts[1].indexOf('.') >= 0) return false; // có dấu . đằng sau dấu , là sai

    for (i = 0; i < commaParts.length; i++) {
        if (commaParts[i].length == 0) return false; // có dấu phẩy đứng đầu hoặc cuối là sai
    }

    var pointParts = value.split("."); // tách thành các phần phân cách nhau bởi dấu chấm để kiểm tra từng phần

    if (pointParts.length == 1) return !isNaN(pointParts[0].replace(/\,/g, ".")); //không có dấu chấm (có hoặc không có dấu phẩy): trả về đúng nếu là số

    for (i = 0; i < pointParts.length; i++) {
        if (pointParts[i].length == 0) return false; // có dấu chấm đứng đầu hoặc cuối là sai

        var type = 'first';
        if (i > 0 && i < pointParts.length - 1) type = 'middle';
        else if (i > 0 && i == pointParts.length - 1) type = 'last';

        if (!CheckPartVietnameseNumber(type, pointParts[i])) return false;
    }
    return true;
}
function CheckPartVietnameseNumber(type, p) {
    var ic = p.indexOf(',');
    if (type == 'first') {
        if (p.length > 3) return false;
        if (ic >= 0) return false;
    } else if (type == 'middle') {
        if (p.length != 3) return false;
        if (ic >= 0) return false;
    } else if (type == 'last') {
        var commaParts = p.split(",");
        if (commaParts[0].length != 3) return false;
        p = p.replace(",", "."); //chuyển về dạng số mà code hiểu
    } else return false;

    return !isNaN(p); //trả về đúng nếu là số
}

function ParseVietnameseNumber(value) {
    if (!ValidateVietnameseNumber(value)) return false;

    value = value.toString().replace(/\./g, "").replace(/\,/g, ".");
    if (isNaN(value)) return false;

    return value;
}

function FormatVietnameseNumber(value) { // format value ở dạng số mà code hiểu sang dạng Việt Nam
    if (isNaN(value)) return false;
    var pointParts = value.toString().split(".");

    value = "";
    var first = pointParts[0];
    while (first.length > 0) {
        var i = first.length - 3;
        if (i < 0) i = 0;
        if (value.length > 0) value = "." + value;
        value = first.substring(i) + value;
        first = first.substring(0, i);
    }
    if (pointParts.length > 1) value = value + "," + pointParts[1];

    return value;
}


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Popover với Button bị disable
//
// 
//var MTC = $('#txtInvoiceCode').val();
//if (MTC == undefined) MTC = '';

//var ok = MTC.length >= 6 && MTC.length <= 15;

//var text = "là <b>" + MTC + "</b>";
//if (MTC == '') text = "rỗng";
//text = "Mã tra cứu phải từ 6 đến 15 ký tự. Bạn không thể Tra cứu với Mã tra cứu " + text;

//Popover_DisabledButton('btnSearch', !ok, text, 'button-container');
//
//<div class="input-group">
//    <asp:TextBox ID="txtInvoiceCode" ClientIDMode="Static" MaxLength="20" placeholder='Nhập Mã tra cứu Hóa đơn' runat="server" TabIndex="2"
//                        onkeypress="return InputLimiter(event,'09az')" data-toggle="popover" CssClass="form-control"></asp:TextBox >
//    <span id="button-container" class="input-group-btn">
//        <asp:Button ID="btnSearch" runat="server" ClientIDMode="Static" CssClass="btn btn-primary btnSearch" OnClick="btnSearch_Click" Text="Tra cứu" />
//    </span>
//</div >
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function Popover_DisabledButton(idBtn, disabled, text, idContainer, position) {
    var idDiv = idBtn + '-popover';
    var $idDiv = $('#' + idDiv);

    Popover_DisabledButton_Remove($idDiv);

    if (disabled === true) {
        $('#' + idBtn).prop('disabled', true);

        if (position === undefined) position = 'top';
        $('#' + idContainer).append('<div id="' + idDiv + '" data-toggle="popover" data-placement="' + position + '" data-content="' + text + '" style="position: absolute; left: 0px; right: 0px; top: 0px; bottom: 0px; z-index: 100"></div>');
    }
    else {
        $('#' + idBtn).prop('disabled', false);
    }
    InitPopover();
}

function Popover_DisabledButton_Remove($idDiv) {
    if ($idDiv !== undefined && $idDiv.length > 0) {
        $idDiv.popover('destroy');

        $idDiv.attr('data-content', '');
        $idDiv.off('hide.bs.popover');
        $idDiv.detach();
        $idDiv.remove();
    }
}

function SetPopoverDisableControl(id, msg, disabled, func, notpopover, position) {
    RemovePopoverDisableControl(id, func);
    if (disabled == undefined) disabled = true;
    if (position == undefined) position = 'left';
    if (disabled === true) {
        $(id).css("cursor", "not-allowed");
        $(id).css("opacity", "0.5");
        $(id).removeClass("dropdown")
        if (func != undefined & func != "") $(id).attr("onclick", func);
        else $(id).removeAttr("onclick");
        if (notpopover == undefined || notpopover == "") CreatePopover($(id), msg, position, "hover");
    }
}

function RemovePopoverDisableControl(id, func) {
    $(id).css("cursor", "pointer");
    $(id).css("opacity", "1");
    $(id).popover("destroy");
    if (func != undefined & func != "") $(id).attr("onclick", func);
}

function DontWork() {
    return false;
}
