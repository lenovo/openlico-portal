/*
 * Copyright © 2019-present Lenovo
 *
 * This file is licensed under both the BSD-3 license for individual use and
 * EPL-1.0 license for commercial use. Full text of both licenses can be found in
 * COPYING.BSD and COPYING.EPL files.
 */

String.prototype.f = function() {
    var args = arguments
    var i = 0
    return this.replace(/{([^}]*)}/g, function(match, name) {
        if (name == "") {
            return args[i++]
        } else {
            var idx = parseInt(name)
            return args[idx]
        }
    })
}

function addMenuItem(menu, label, callback, icon, keepopen, span) {
    var menuitem = document.createElement("li")
    menuitem.id = label.replace(/ /g, "_")
    function deactive(e) {
        // This will trigger dehover if applicable
        menu.style.pointerEvents = "none"
        setTimeout(function() {
            menu.style.pointerEvents = ""
        }, 1)
        this(e)
    }
    if (keepopen) {
        menuitem.addEventListener("click", callback)
    } else {
        menuitem.addEventListener("click", deactive.bind(callback))
    }
    var i = document.createElement("span")
    //i.style.width = "1.3em";
    i.style.textAlign = "center"
    if (icon) {
        i.classList.add("fa", "fa-" + icon)
    } else {
        i.classList.add("fa")
    }
    menuitem.appendChild(i)
    menuitem.appendChild(document.createTextNode(" " + l(label)))
    menu.appendChild(menuitem)
    return menuitem
}

function clickOpen(e) {
    if (!this.classList.contains("clicked")) {
        this.classList.add("clicked")
        var mc = this
        function unClick(e) {
            if (
                !e.target.classList.contains("dropright") &&
                !e.target.classList.contains("dropleft")
            ) {
                document.removeEventListener("click", unClick)
                mc.classList.remove("clicked")
            }
        }
        setTimeout(function() {
            document.addEventListener("click", unClick)
        }, 1)
    }
}

function childrenContains(parent, searchElement) {
    // base case:
    if (parent == searchElement) {
        return true
    }

    // search children
    for (var i = 0; i < parent.children.length; i++) {
        if (childrenContains(parent.children[i], searchElement)) {
            return true
        }
    }

    // nothing found
    return false
}

function childHasClass(parent, className) {
    for (var i = 0; i < parent.children.length; i++) {
        if (parent.children[i].classList.indexOf(className) >= 0) {
            return true
        }
    }
    return false
}

function isinvalidnoderange(noderange) {
    if (noderange.indexOf("?") >= 0) {
        return true
    }
    if (noderange.indexOf("#") >= 0) {
        return true
    }
    if (noderange.indexOf("/") >= 0) {
        return true
    }
    return false // valid *enough* to let the server do further checking
}

function closeDialog() {
    var dlg
    var bg
    var callback
    dlg = this[0]
    bg = this[1]
    callback = this[2]

    if (callback) {
        if (callback() != false) {
            dlg.parentElement.removeChild(dlg)
            bg.parentElement.removeChild(bg)
        }
    } else {
        dlg.parentElement.removeChild(dlg)
        bg.parentElement.removeChild(bg)
    }
}
function maketoollabel(text) {
    var mylabel = document.createElement("span")
    mylabel.textContent = text
    mylabel.classList.add("tool")
    return mylabel
}
var alertd
function logAlert(code, error) {
    var url = this
    console.log(url)
    console.log(code)
    console.log(error)
}
function showAlert(code, error) {
    logAlert(code, error)
    // var url = this;
    // if (!(alertd && alertd.parentElement)) {
    //     alertd = document.createElement('div');
    //     alertd.style.textAlign = 'left';
    //     alertd.style.maxWidth = '500px';
    //     alertd.classList.add('modaldialog');
    //     alertd.alertinfo = document.createElement('div');
    //     alertd.alertinfo.classList = ['info'];
    //     alertd.appendChild(alertd.alertinfo);
    //     var hr = document.createElement('hr');
    //     hr.style.marginBottom = '0';
    //     alertd.appendChild(hr);
    //     var dismissbtn = document.createElement('button');
    //     dismissbtn.appendChild(document.createTextNode('Dismiss'));
    //     alertd.appendChild(dismissbtn);
    //     var bg = document.createElement('div');
    //     bg.classList.add('modalbg');
    //     document.body.appendChild(bg);
    //     dismissbtn.addEventListener('click', closeDialog.bind([alertd, bg]));
    //     bg.appendChild(alertd);
    // }
    // alertd.alertinfo.appendChild(document.createTextNode(this + ':' + error));
    // alertd.alertinfo.appendChild(document.createElement('br'));
}
function confirmAction(question, callback, cancelcall) {
    var confirmd = document.createElement("div")
    confirmd.style.textAlign = "left"
    confirmd.style.maxWidth = "500px"
    confirmd.classList.add("modaldialog")
    var tspan = document.createElement("div")
    tspan.classList.add("info")
    tspan.textContent = question
    confirmd.appendChild(tspan)
    var hr = document.createElement("hr")
    hr.style.marginBottom = "0"
    confirmd.appendChild(hr)
    var ysbtn = document.createElement("button")
    ysbtn.appendChild(document.createTextNode(l("Yes")))
    var nobtn = document.createElement("button")
    nobtn.appendChild(document.createTextNode(l("No")))
    var bg = document.createElement("div")
    bg.classList.add("modalbg")
    document.body.appendChild(bg)
    if (cancelcall === null) {
        cancelcall = function() {}
    }
    nobtn.addEventListener(
        "click",
        closeDialog.bind([confirmd, bg, cancelcall]),
    )
    ysbtn.addEventListener("click", closeDialog.bind([confirmd, bg, callback]))
    var buttonarea = document.createElement("div")
    confirmd.appendChild(buttonarea)
    buttonarea.style.textAlign = "right"
    buttonarea.appendChild(ysbtn)
    buttonarea.appendChild(nobtn)
    bg.appendChild(confirmd)
}
function addNavMenu(bar, label, icon, right) {
    return addMenu(bar, label, icon, "navcolor", right)
}
function addToolMenu(bar, label, icon, right, down, main) {
    return addMenu(bar, label, icon, "toolcolor", right, down, main)
}
function addMenu(bar, label, icon, menuclass, dropright, dropdown, main) {
    var menu = document.createElement("li")
    if (dropright == "dropright") {
        if (dropdown == "dropdown") {
            if (main == "main") {
                menu.classList.add("dropdown", "droprightmenu", "navitem")
                menu.style.width = "auto"
            } else {
                menu.classList.add("dropdown", "dropright")
                menu.style.width = "100%"
            }
            menu.style.boxSizing = "border-box"
        } else {
            menu.classList.add("dropdown", "dropup", "dropright")
            menu.style.width = "100%"
            menu.style.boxSizing = "border-box"
        }
    } else if (dropright == "dropleft") {
        if (dropdown == "dropdown") {
            if (main == "main") {
                menu.classList.add("dropdown", "dropleftmenu", "navitem")
                menu.style.width = "auto"
            } else {
                menu.classList.add("dropdown", "dropleft")
                menu.style.width = "100%"
            }
            menu.style.boxSizing = "border-box"
        } else {
            menu.classList.add("dropdown", "dropup", "dropleft")
            menu.style.width = "100%"
            menu.style.boxSizing = "border-box"
        }
    } else {
        menu.classList.add("dropdown", "navitem")
    }
    menu.classList.add(menuclass)
    var header = document.createElement("span")
    header.id = label.replace(/ /g, "_")
    menu.appendChild(header)
    var arrow = document.createElement("span")
    arrow.style.float = "right"
    arrow.style.marginLeft = "0.5em"
    arrow.style.marginTop = "0.1em"
    if (dropright == "dropright" && main != "main") {
        arrow.classList.add("fa", "fa-caret-right")
    } else if (dropright == "dropleft" && main != "main") {
        arrow.classList.add("fa", "fa-caret-left")
    } else {
        arrow.classList.add("fa", "fa-caret-down")
    }
    header.appendChild(arrow)
    var i = document.createElement("span")
    if (icon) {
        i.classList.add("fa", "fa-" + icon)
    } else {
        i.classList.add("fa")
    }
    //i.style.width = "1.3em";
    i.style.textAlign = "center"
    header.appendChild(i)
    header.labeltext = document.createTextNode(" " + l(label) + " ")
    header.appendChild(header.labeltext)
    var menucontent = document.createElement("ul")
    menucontent.classList.add("navitem", menuclass)
    menucontent.header = header
    menu.appendChild(menucontent)
    bar.appendChild(menu)
    menu.addEventListener("click", clickOpen.bind(menu))

    if (dropright == "dropright") {
        header.classList.add("dropright")
        arrow.classList.add("dropright")
        i.classList.add("dropright")
        menucontent.classList.add("dropright")
        if (main != "main") {
            arrow.classList.remove("dropright")
        }
    } else if (dropright == "dropleft") {
        header.classList.add("dropleft")
        arrow.classList.add("dropleft")
        i.classList.add("dropleft")
        menucontent.classList.add("dropleft")
    }

    return menucontent
}

var asyncRequests = {}
var asyncSessid = false
var authtoken = "true"

function setAuthToken(token) {
    authtoken = token
}

function getRequest(url, success, failure, username, password, sync) {
    var request = new XMLHttpRequest()
    request.open("GET", url, true)
    request.setRequestHeader("Accept", "application/json")
    request.setRequestHeader("SuppressAuthHeader", "true")
    request.setRequestHeader("ConfluentAuthToken", authtoken)
    // Below would be interesting if wanting to skip browser use of
    // storing basic http auth....
    if (!failure) {
        failure = logAlert.bind(url)
    }
    if (!success) {
        success = function() {}
    }
    if (username) {
        request.setRequestHeader(
            "Authorization",
            "Basic " + btoa(username + ":" + password),
        )
    }
    if (!sync && asyncSessid) {
        request.setRequestHeader("ConfluentAsyncId", asyncSessid)
        requestid = hookRequestId(success, failure)
        request.setRequestHeader("ConfluentRequestId", requestid)
        request.onload = function() {
            if (this.status == 401) {
                show_auth()
            } else if (this.status != 201 && this.status != 202) {
                failure(this.status, this.statusText)
            }
        }
    } else {
        request.onload = function() {
            if (this.status >= 200 && this.status <= 400) {
                success(JSON.parse(this.responseText))
            } else if (this.status == 401) {
                show_auth()
            } else {
                failure(this.status, this.statusText)
            }
        }
    }
    request.send()
}

function deleteRequest(url, success, failure, username, password, sync) {
    var request = new XMLHttpRequest()
    request.open("DELETE", url, true)
    request.setRequestHeader("Accept", "application/json")
    request.setRequestHeader("SuppressAuthHeader", "true")
    request.setRequestHeader("ConfluentAuthToken", authtoken)
    // Below would be interesting if wanting to skip browser use of
    // storing basic http auth....
    if (!failure) {
        failure = showAlert.bind(url)
    }
    if (!success) {
        success = function() {}
    }
    if (!sync && asyncSessid) {
        request.setRequestHeader("ConfluentAsyncId", asyncSessid)
        requestid = hookRequestId(success, failure)
        request.setRequestHeader("ConfluentRequestId", requestid)
        request.onload = function() {
            if (this.status == 401) {
                show_auth()
            } else if (this.status != 201 && this.status != 202) {
                failure(this.status, codstr[this.status])
            }
        }
    } else {
        request.onload = function() {
            if (this.status >= 200 && this.status <= 400) {
                success(JSON.parse(this.responseText))
            } else if (this.status == 401) {
                show_auth()
            } else {
                failure(this.status, this.statusText)
            }
        }
    }
    request.send()
}

function hookRequestId(success, failure) {
    var rid = 0
    while (asyncRequests.hasOwnProperty(rid)) {
        rid += 1
    }
    asyncRequests[rid] = { success: success, failure: failure }
    return rid
}
function stopAsync() {
    asyncSsesid = undefined
}
function gotAsync(response) {
    asyncSessid = response.asyncid
    this()
    postRequest(
        "/api/confluent/async/",
        { asyncid: asyncSessid },
        null,
        failAsync,
        nextAsync,
    )
}
function nextAsync(response) {
    if (response.hasOwnProperty("asyncresponse")) {
        response.asyncresponse.forEach(function(val) {
            try {
                if (val.response.exception) {
                    var errorstr
                    try {
                        errorstr = JSON.parse(val.response.exception)
                        if (errorstr.error) {
                            errorstr = errorstr.error
                        }
                    } catch (e) {
                        errorstr = val.response.exception
                    }
                    asyncRequests[val.requestid].failure(
                        val.response.exceptioncode,
                        errorstr,
                    )
                    delete asyncRequests[val.requestid]
                } else {
                    asyncRequests[val.requestid].success(val.response)
                    if (val.response._requestdone) {
                        delete asyncRequests[val.requestid]
                    }
                }
            } catch (e) {
                console.log(val.response)
                console.log(e)
                console.log(e.stack)
            }
            //   asyncRequests[rid] = {success: success, failure: failure};
        })
    }
    postRequest(
        "/api/confluent/async/",
        { asyncid: asyncSessid },
        null,
        failAsync,
        nextAsync,
    )
}
function failAsync(response) {
    asyncRequests = {}
    console.log("failAsync")
    // logout();
}

function startAsync(callback) {
    postRequest(
        "/api/confluent/async/",
        false,
        null,
        failAsync.bind(callback),
        gotAsync.bind(callback),
    )
}

function postRequest(url, data, async, failure, success) {
    putOrPostRequest(url, data, async, failure, success, "POST")
}

function putRequest(url, data, async, failure, success) {
    putOrPostRequest(url, data, async, failure, success, "PUT")
}

function putOrPostRequest(url, data, async, failure, success, method) {
    var request = new XMLHttpRequest()
    if (!failure) {
        failure = showAlert.bind(url)
    }
    request.open(method, url, true)
    request.setRequestHeader("Content-Type", "application/json")
    request.setRequestHeader("Accept", "application/json")
    request.setRequestHeader("SuppressAuthHeader", "true")
    // request.setRequestHeader('ConfluentAuthToken', authtoken);
    // Add auth feature for web console. Add by wengmh1 2018/4/28
    var token = window.gApp.$store.state.auth.token
    if (token && token.length > 0) {
        request.setRequestHeader("authorization", "Jwt " + token)
    }
    if (async) {
        request.setRequestHeader("ConfluentAsyncId", asyncSessid)
        requestid = hookRequestId(async, failure)
        request.setRequestHeader("ConfluentRequestId", requestid)
        request.onload = function() {
            if (this.status >= 200 && this.status < 400) {
                if (success) {
                    success(JSON.parse(this.responseText))
                }
            } else if (this.status == 401) {
                show_auth()
            } else if (failure) {
                failure(this.status, this.statusText)
            }
        }
    } else {
        request.onload = function() {
            if (this.status >= 200 && this.status < 400) {
                if (success) {
                    success(JSON.parse(this.responseText))
                }
            } else if (this.status == 401) {
                show_auth()
            } else if (failure) {
                failure(this.status, this.statusText)
            }
        }
    }
    if (data) {
        request.send(JSON.stringify(data))
    } else {
        request.send("")
    }
    request = null
}

function addMenuItem2(menu, label, callback, icon, keepopen, className) {
    var menuitem = document.createElement("li")
    function deactive(e) {
        // This will trigger dehover if applicable
        menu.style.pointerEvents = "none"
        setTimeout(function() {
            menu.style.pointerEvents = ""
        }, 1)
        this(e)
    }
    if (keepopen) {
        menuitem.addEventListener("click", callback)
    } else {
        menuitem.addEventListener("click", deactive.bind(callback))
    }
    var i = document.createElement("span")
    //i.style.width = "1.3em";
    i.style.textAlign = "center"
    if (icon) {
        i.classList.add("fa", "fa-" + icon)
    } else {
        i.classList.add("fa")
    }
    if (className) {
        i.classList.add(className)
    }
    menuitem.appendChild(i)
    menuitem.appendChild(document.createTextNode(" " + l(label)))
    menu.appendChild(menuitem)
    return menuitem
}

function addToolMenu2(bar, label, icon, right, className) {
    return addMenu2(bar, label, icon, "toolcolor", right, className)
}

function addMenu2(bar, label, icon, menuclass, dropleft, className) {
    var menu = document.createElement("li")
    if (dropleft) {
        menu.classList.add("dropdown", "dropleft")
        menu.style.width = "100%"
        menu.style.boxSizing = "border-box"
    } else {
        menu.classList.add("dropdown", "navitem")
    }
    menu.classList.add(menuclass)
    var header = document.createElement("span")
    menu.appendChild(header)
    var arrow = document.createElement("span")
    arrow.style.float = "right"
    arrow.style.marginLeft = "0.5em"
    arrow.style.marginTop = "0.1em"
    if (dropleft) {
        arrow.classList.add("fa", "fa-caret-right")
    } else {
        arrow.classList.add("fa", "fa-caret-down")
    }
    header.appendChild(arrow)
    var i = document.createElement("span")
    if (icon) {
        i.classList.add("fa", "fa-" + icon)
    } else {
        i.classList.add("fa")
    }
    if (className) {
        i.classList.add(className)
    }
    //i.style.width = "1.3em";
    i.style.textAlign = "center"
    header.appendChild(i)
    header.labeltext = document.createTextNode(" " + l(label) + " ")
    header.appendChild(header.labeltext)
    var menucontent = document.createElement("ul")
    menucontent.classList.add("navitem", menuclass)
    menucontent.header = header
    menu.appendChild(menucontent)
    bar.appendChild(menu)
    header.addEventListener("click", clickOpen.bind(menu))
    return menucontent
}

window.onscroll = function() {
    [].forEach.call(document.getElementsByClassName("header"), function(e) {
        e.style.left = document.body.scrollLeft + "px"
        e.style.position = "relative"
    })
}
