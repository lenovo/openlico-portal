/*
 * Copyright 2015-2023 Lenovo
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

(function ($) {

    const elFinder = window.elFinder;

  elFinder.prototype._options.cdns.prettify = "/static/js-extern/google-code-prettify/src/run_prettify.js";

    (elFinder.prototype.commands.open = function () {
        var fm = this.fm,
            self = this;
        this.alwaysEnabled = true;
        this.noChangeDirOnRemovedCwd = true;

        this._handlers = {
            dblclick: function (e) {
                var arg = e.data && e.data.file ? [e.data.file] : void (0);
                if (self.getstate(arg) === 0) {
                    e.preventDefault();
                    fm.exec('open', arg);
                }
            },
            'select enable disable reload': function (e) { this.update(e.type == 'disable' ? -1 : void (0)); }
        };

        this.shortcuts = [{
            pattern: 'ctrl+down numpad_enter' + (fm.OS != 'mac' && ' enter')
        }];

        this.getstate = function (select) {
            var sel = this.files(select),
                cnt = sel.length;

            return cnt == 1
                ? (sel[0].read ? 0 : -1)
                : (cnt && !fm.UA.Mobile) ? ($.grep(sel, function (file) { return file.mime == 'directory' || !file.read ? false : true; }).length == cnt ? 0 : -1) : -1;
        };

        this.exec = function (hashes, cOpts) {
            var dfrd = $.Deferred().fail(function (error) { error && fm.error(error); }),
                files = this.files(hashes),
                cnt = files.length,
                thash = (typeof cOpts == 'object') ? cOpts.thash : false,
                opts = this.options,
                into = opts.into || 'window',
                file, url, s, w, imgW, imgH, winW, winH, reg, link, html5dl, inline,
                selAct, cmd;

            if (!cnt && !thash) {
                {
                    return dfrd.reject();
                }
            }

            // open folder
            if (thash || (cnt == 1 && (file = files[0]) && file.mime == 'directory')) {
                if (!thash && file && !file.read) {
                    return dfrd.reject(['errOpen', file.name, 'errPerm']);
                } else {
                    if (fm.keyState.ctrlKey && (fm.keyState.shiftKey || typeof fm.options.getFileCallback !== 'function')) {
                        if (fm.getCommand('opennew')) {
                            return fm.exec('opennew', [thash ? thash : file.hash]);
                        }
                    }

                    return fm.request({
                        data: { cmd: 'open', target: thash || file.hash },
                        notify: { type: 'open', cnt: 1, hideCnt: true },
                        syncOnFail: true,
                        lazy: false
                    });
                }
            }

            files = $.grep(files, function (file) { return file.mime != 'directory' ? true : false; });

            // nothing to open or files and folders selected - do nothing
            if (cnt != files.length) {
                return dfrd.reject();
            }

            var doOpen = function () {
                var openCB = function (url) {
                    var link = $('<a>').hide().appendTo($('body'));
                    if (fm.UA.Mobile || !inline) {
                        if (html5dl) {
                            if (!inline) {
                                link.attr('download', file.name);
                            } else {
                                link.attr('target', '_blank');
                            }
                            link.attr('href', url).get(0).click();
                        } else {
                            wnd = window.open(url);
                            if (!wnd) {
                                return dfrd.reject('errPopup');
                            }
                        }
                    } else {
                        getOnly = (typeof opts.method === 'string' && opts.method.toLowerCase() === 'get');
                        if (!getOnly
                            && url.indexOf(fm.options.url) === 0
                            && fm.customData
                            && Object.keys(fm.customData).length
                            // Since playback by POST request can not be done in Chrome, media allows GET request
                            && !file.mime.match(/^(?:video|audio)/)
                        ) {
                            // Send request as 'POST' method to hide custom data at location bar
                            url = '';
                        }
                        if (into === 'window') {
                            // set window size for image if set
                            imgW = winW = Math.round(2 * screen.availWidth / 3);
                            imgH = winH = Math.round(2 * screen.availHeight / 3);
                            if (parseInt(file.width) && parseInt(file.height)) {
                                imgW = parseInt(file.width);
                                imgH = parseInt(file.height);
                            } else if (file.dim) {
                                s = file.dim.split('x');
                                imgW = parseInt(s[0]);
                                imgH = parseInt(s[1]);
                            }
                            if (winW >= imgW && winH >= imgH) {
                                winW = imgW;
                                winH = imgH;
                            } else {
                                if ((imgW - winW) > (imgH - winH)) {
                                    winH = Math.round(imgH * (winW / imgW));
                                } else {
                                    winW = Math.round(imgW * (winH / imgH));
                                }
                            }
                            w = 'width=' + winW + ',height=' + winH;
                            wnd = window.open(url, target, w + ',top=50,left=50,scrollbars=yes,resizable=yes,titlebar=no');
                        } else {
                            if (into === 'tabs') {
                                target = file.hash;
                            }
                            wnd = window.open('about:blank', target);
                        }

                        if (!wnd) {
                            return dfrd.reject('errPopup');
                        }

                        if (url === '') {
                            var form = document.createElement("form");
                            form.action = fm.options.url;
                            form.method = 'POST';
                            form.target = target;
                            form.style.display = 'none';
                            var params = Object.assign({}, fm.customData, {
                                cmd: 'file',
                                target: file.hash,
                                _t: file.ts || parseInt(+new Date() / 1000)
                            });
                            $.each(params, function (key, val) {
                                var input = document.createElement("input");
                                input.name = key;
                                input.value = val;
                                form.appendChild(input);
                            });

                            document.body.appendChild(form);
                            form.submit();
                        } else if (into !== 'window') {
                            wnd.location = url;
                        }
                        $(wnd).trigger('focus');
                    }
                    link.remove();
                },
                    wnd, target, getOnly;

                try {
                    reg = new RegExp(fm.option('dispInlineRegex'), 'i');
                } catch (e) {
                    reg = false;
                }

                // open files
                // html5dl = (typeof $('<a>').get(0).download === 'string');
                // cnt = files.length;
                // while (cnt--) {
                //     target = 'elf_open_window';
                //     file = files[cnt];

                //     if (!file.read) {
                //         return dfrd.reject(['errOpen', file.name, 'errPerm']);
                //     }

                //     inline = (reg && file.mime.match(reg));
                //     fm.openUrl(file.hash, !inline, openCB);
                // }
                return dfrd.resolve(hashes);
            };

            if (cnt > 1) {
                fm.confirm({
                    title: 'openMulti',
                    text: ['openMultiConfirm', cnt + ''],
                    accept: {
                        label: 'cmdopen',
                        callback: function () { doOpen(); }
                    },
                    cancel: {
                        label: 'btnCancel',
                        callback: function () {
                            dfrd.reject();
                        }
                    },
                    buttons: (fm.getCommand('zipdl') && fm.isCommandEnabled('zipdl', fm.cwd().hash)) ? [
                        {
                            label: 'cmddownload',
                            callback: function () {
                                fm.exec('download', hashes);
                                dfrd.reject();
                            }
                        }
                    ] : []
                });
            } else {
                selAct = fm.storage('selectAction') || opts.selectAction;
                if (selAct) {
                    $.each(selAct.split('/'), function () {
                        var cmdName = this.valueOf();
                        if (cmdName !== 'open' && (cmd = fm.getCommand(cmdName)) && cmd.enabled()) {
                            return false;
                        }
                        cmd = null;
                    });
                    if (cmd) {
                        return fm.exec(cmd.name);
                    }
                }
                doOpen();
            }

            return dfrd;
        };

    }).prototype = { forceLoad: true }; // this is required command


    elFinder.prototype.commands.download = function () {
        var self = this,
            fm = this.fm,
            czipdl = null,
            zipOn = false,
            mixed = false,
            dlntf = false,
            cpath = window.location.pathname || '/',
            filter = function (hashes, inExec) {
                var volumeid, mixedCmd;

                if (czipdl !== null) {
                    if (fm.searchStatus.state > 1) {
                        mixed = fm.searchStatus.mixed;
                    } else if (fm.leafRoots[fm.cwd().hash]) {
                        volumeid = fm.cwd().volumeid;
                        $.each(hashes, function (i, h) {
                            if (h.indexOf(volumeid) !== 0) {
                                mixed = true;
                                return false;
                            }
                        });
                    }
                    zipOn = (fm.isCommandEnabled('zipdl', hashes[0]));
                }

                if (mixed) {
                    mixedCmd = czipdl ? 'zipdl' : 'download';
                    hashes = $.grep(hashes, function (h) {
                        var f = fm.file(h),
                            res = (!f || (!czipdl && f.mime === 'directory') || !fm.isCommandEnabled(mixedCmd, h)) ? false : true;
                        if (f && inExec && !res) {
                            fm.cwdHash2Elm(f.hash).trigger('unselect');
                        }
                        return res;
                    });
                    if (!hashes.length) {
                        return [];
                    }
                } else {
                    if (!fm.isCommandEnabled('download', hashes[0])) {
                        return [];
                    }
                }

                return $.grep(self.files(hashes), function (f) {
                    var res = (!f.read || (!zipOn && f.mime == 'directory')) ? false : true;
                    if (inExec && !res) {
                        fm.cwdHash2Elm(f.hash).trigger('unselect');
                    }
                    return res;
                });
            };

        this.linkedCmds = ['zipdl'];

        this.shortcuts = [{
            pattern: 'shift+enter'
        }];

        this.getstate = function (select) {
            var sel = this.hashes(select),
                cnt = sel.length,
                maxReq = this.options.maxRequests || 10,
                mixed = false,
                croot = '';

            if (cnt < 1) {
                return -1;
            }
            cnt = filter(sel).length;

            return (cnt && (zipOn || (cnt <= maxReq && ((!fm.UA.IE && !fm.UA.Mobile) || cnt == 1))) ? 0 : -1);
        };

        // fm.bind('contextmenu', function (e) {
        //     var fm = self.fm,
        //         helper = null,
        //         targets, file, link,
        //         getExtra = function (file) {
        //             var link = file.url || fm.url(file.hash);
        //             return {
        //                 icon: 'link',
        //                 node: $('<a></a>')
        //                     .attr({ href: link, target: '_blank', title: fm.i18n('link') })
        //                     .text(file.name)
        //                     .on('mousedown click touchstart touchmove touchend contextmenu', function (e) {
        //                         e.stopPropagation();
        //                     })
        //                     .on('dragstart', function (e) {
        //                         var dt = e.dataTransfer || e.originalEvent.dataTransfer || null;
        //                         helper = null;
        //                         if (dt) {
        //                             var icon = function (f) {
        //                                 var mime = f.mime, i, tmb = fm.tmb(f);
        //                                 i = '<div class="elfinder-cwd-icon ' + fm.mime2class(mime) + ' ui-corner-all"></div>';
        //                                 if (tmb) {
        //                                     i = $(i).addClass(tmb.className).css('background-image', "url('" + tmb.url + "')").get(0).outerHTML;
        //                                 }
        //                                 return i;
        //                             };
        //                             dt.effectAllowed = 'copyLink';
        //                             if (dt.setDragImage) {
        //                                 helper = $('<div class="elfinder-drag-helper html5-native">').append(icon(file)).appendTo($(document.body));
        //                                 dt.setDragImage(helper.get(0), 50, 47);
        //                             }
        //                             if (!fm.UA.IE) {
        //                                 dt.setData('elfinderfrom', window.location.href + file.phash);
        //                                 dt.setData('elfinderfrom:' + dt.getData('elfinderfrom'), '');
        //                             }
        //                         }
        //                     })
        //                     .on('dragend', function (e) {
        //                         helper && helper.remove();
        //                     })
        //             };
        //         };
        //     self.extra = null;
        //     if (e.data) {
        //         targets = e.data.targets || [];
        //         if (targets.length === 1 && (file = fm.file(targets[0])) && file.mime !== 'directory') {
        //             if (file.url != '1') {
        //                 self.extra = getExtra(file);
        //             } else {
        //                 // Get URL ondemand
        //                 var node;
        //                 self.extra = {
        //                     icon: 'link',
        //                     node: $('<a></a>')
        //                         .attr({ href: '#', title: fm.i18n('getLink'), draggable: 'false' })
        //                         .text(file.name)
        //                         .on('click touchstart', function (e) {
        //                             if (e.type === 'touchstart' && e.originalEvent.touches.length > 1) {
        //                                 return;
        //                             }
        //                             var parent = node.parent();
        //                             e.stopPropagation();
        //                             e.preventDefault();
        //                             parent.removeClass('ui-state-disabled').addClass('elfinder-button-icon-spinner');
        //                             fm.request({
        //                                 data: { cmd: 'url', target: file.hash },
        //                                 preventDefault: true
        //                             })
        //                                 .always(function (data) {
        //                                     parent.removeClass('elfinder-button-icon-spinner');
        //                                     if (data.url) {
        //                                         var rfile = fm.file(file.hash);
        //                                         rfile.url = data.url;
        //                                         node.replaceWith(getExtra(file).node);
        //                                     } else {
        //                                         parent.addClass('ui-state-disabled');
        //                                     }
        //                                 });

        //                         })
        //                 };
        //                 node = self.extra.node;
        //                 node.ready(function () {
        //                     requestAnimationFrame(function () {
        //                         node.parent().addClass('ui-state-disabled').css('pointer-events', 'auto');
        //                     });
        //                 });
        //             }
        //         }
        //     }
        // }).one('open', function () {
        //     if (fm.api >= 2.1012) {
        //         czipdl = fm.getCommand('zipdl');
        //     }
        //     dlntf = fm.cookieEnabled && fm.api > 2.1038 && !fm.isCORS;
        // });

        this.exec = function (select) {
            var hashes = this.hashes(select),
                fm = this.fm,
                base = fm.options.url,
                files = filter(hashes, true),
                dfrd = $.Deferred(),
                iframes = '',
                cdata = '',
                targets = {},
                i, url,
                linkdl = false,
                getTask = function (hashes) {
                    return function () {
                        var dfd = $.Deferred(),
                            root = fm.file(fm.root(hashes[0])),
                            single = (hashes.length === 1),
                            volName = root ? (root.i18 || root.name) : null,
                            dir, dlName, phash;
                        if (single) {
                            if (dir = fm.file(hashes[0])) {
                                dlName = (dir.i18 || dir.name);
                            }
                        } else {
                            $.each(hashes, function () {
                                var d = fm.file(this);
                                if (d && (!phash || phash === d.phash)) {
                                    phash = d.phash;
                                } else {
                                    phash = null;
                                    return false;
                                }
                            });
                            if (phash && (dir = fm.file(phash))) {
                                dlName = (dir.i18 || dir.name) + '-' + hashes.length;
                            }
                        }
                        if (dlName) {
                            volName = dlName;
                        }
                        volName && (volName = ' (' + volName + ')');
                        fm.request({
                            data: { cmd: 'zipdl', targets: hashes },
                            notify: { type: 'zipdl', cnt: 1, hideCnt: true, msg: fm.i18n('ntfzipdl') + volName },
                            cancel: true,
                            eachCancel: true,
                            preventDefault: true
                        }).done(function (e) {
                            var zipdl, dialog, btn = {}, dllink, form, iframe, m,
                                uniq = 'dlw' + (+new Date()),
                                zipdlFn = function (url) {
                                    dllink = $('<a></a>')
                                        .attr('href', url)
                                        .attr('download', fm.escape(dlName))
                                        .on('click', function () {
                                            dfd.resolve();
                                            dialog && dialog.elfinderdialog('destroy');
                                        });
                                    if (linkdl) {
                                        dllink.attr('target', '_blank')
                                            .append('<span class="elfinder-button-icon elfinder-button-icon-download"></span>' + fm.escape(dlName));
                                        btn[fm.i18n('btnCancel')] = function () {
                                            dialog.elfinderdialog('destroy');
                                        };
                                        dialog = self.fmDialog(dllink, {
                                            title: fm.i18n('link'),
                                            buttons: btn,
                                            width: '200px',
                                            destroyOnClose: true,
                                            close: function () {
                                                (dfd.state() !== 'resolved') && dfd.resolve();
                                            }
                                        });
                                    } else {
                                        click(dllink.hide().appendTo('body').get(0));
                                        dllink.remove();
                                    }
                                };
                            if (e.error) {
                                fm.error(e.error);
                                dfd.resolve();
                            } else if (e.zipdl) {
                                zipdl = e.zipdl;
                                if (dlName) {
                                    m = fm.splitFileExtention(zipdl.name || '');
                                    dlName += m[1] ? ('.' + m[1]) : '.zip';
                                } else {
                                    dlName = zipdl.name;
                                }
                                if (html5dl || linkdl) {
                                    url = fm.options.url + (fm.options.url.indexOf('?') === -1 ? '?' : '&')
                                        + 'cmd=zipdl&download=1';
                                    $.each([hashes[0], zipdl.file, dlName, zipdl.mime], function (key, val) {
                                        url += '&targets%5B%5D=' + encodeURIComponent(val);
                                    });
                                    $.each(fm.customData, function (key, val) {
                                        url += '&' + encodeURIComponent(key) + '=' + encodeURIComponent(val);
                                    });
                                    url += '&' + encodeURIComponent(dlName);
                                    if (fm.hasParrotHeaders()) {
                                        fm.getBinaryByUrl({ url: url }, function (blob) {
                                            if (blob instanceof Blob) {
                                                url = (window.URL || window.webkitURL).createObjectURL(blob);
                                                zipdlFn(url);
                                            } else {
                                                fm.error(['errUploadTransfer', fm.i18n('kindZIP')]);
                                            }
                                        });
                                    } else {
                                        zipdlFn(url);
                                    }
                                } else {
                                    form = $('<form action="' + fm.options.url + '" method="post" target="' + uniq + '" style="display:none"></form>')
                                        .append('<input type="hidden" name="cmd" value="zipdl"/>')
                                        .append('<input type="hidden" name="download" value="1"/>');
                                    $.each([hashes[0], zipdl.file, dlName, zipdl.mime], function (key, val) {
                                        form.append('<input type="hidden" name="targets[]" value="' + fm.escape(val) + '"/>');
                                    });
                                    $.each(fm.customData, function (key, val) {
                                        form.append('<input type="hidden" name="' + key + '" value="' + fm.escape(val) + '"/>');
                                    });
                                    form.attr('target', uniq).appendTo('body');
                                    iframe = $('<iframe style="display:none" name="' + uniq + '">')
                                        .appendTo('body')
                                        .ready(function () {
                                            form.submit().remove();
                                            dfd.resolve();
                                            setTimeout(function () {
                                                iframe.remove();
                                            }, 20000); // give 20 sec file to be saved
                                        });
                                }
                            }
                        }).fail(function (error) {
                            error && fm.error(error);
                            dfd.resolve();
                        });
                        return dfd.promise();
                    };
                },
                // use MouseEvent to click element for Safari etc
                click = function (a) {
                    var clickEv;
                    if (typeof MouseEvent === 'function') {
                        clickEv = new MouseEvent('click');
                    } else {
                        clickEv = document.createEvent('MouseEvents');
                        clickEv.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
                    }
                    fm.pauseUnloadCheck(true);
                    a.dispatchEvent(clickEv);
                },
                checkCookie = function (id) {
                    var name = 'elfdl' + id,
                        parts;
                    parts = document.cookie.split(name + "=");
                    if (parts.length === 2) {
                        ntftm && clearTimeout(ntftm);
                        document.cookie = name + '=; path=' + cpath + '; max-age=0';
                        closeNotify();
                    } else {
                        setTimeout(function () { checkCookie(id); }, 200);
                    }
                },
                closeNotify = function () {
                    if (fm.ui.notify.children('.elfinder-notify-download').length) {
                        fm.notify({
                            type: 'download',
                            cnt: -1
                        });
                    }
                },
                reqids = [],
                link, html5dl, fileCnt, clickEv, cid, ntftm, reqid, getUrlDfrd, urls;

            if (!files.length) {
                return dfrd.reject();
            }

            fileCnt = $.grep(files, function (f) { return f.mime === 'directory' ? false : true; }).length;
            link = $('<a>').hide().appendTo('body');
            html5dl = (typeof link.get(0).download === 'string');

            if (zipOn && (fileCnt !== files.length || fileCnt >= (this.options.minFilesZipdl || 1))) {
                link.remove();
                linkdl = (!html5dl && fm.UA.Mobile);
                if (mixed) {
                    targets = {};
                    $.each(files, function (i, f) {
                        var p = f.hash.split('_', 2);
                        if (!targets[p[0]]) {
                            targets[p[0]] = [f.hash];
                        } else {
                            targets[p[0]].push(f.hash);
                        }
                    });
                    if (!linkdl && fm.UA.Mobile && Object.keys(targets).length > 1) {
                        linkdl = true;
                    }
                } else {
                    targets = [$.map(files, function (f) { return f.hash; })];
                }
                dfrd = fm.sequence($.map(targets, function (t) { return getTask(t); })).always(
                    function () {
                        fm.trigger('download', { files: files });
                    }
                );
                return dfrd;
            } else {
                reqids = [];
                getUrlDfrd = $.Deferred().done(function (urls) {
                    for (i = 0; i < urls.length; i++) {
                        url = urls[i] + "&token=" + window.gApp.$store.state.auth.token;
                        url = url.replace(/\/\?/, "/download/?");
                        if (fm.options.customParams.enabled) {
                            for (const key in fm.options.customParams.params) {
                                url += `&${key}=${fm.options.customParams.params[key]}`;
                            }
                        }
                        if (dlntf && url.substr(0, fm.options.url.length) === fm.options.url) {
                            reqid = fm.getRequestId();
                            reqids.push(reqid);
                            url += '&cpath=' + cpath + '&reqid=' + reqid;
                            ntftm = setTimeout(function () {
                                fm.notify({
                                    type: 'download',
                                    cnt: 1,
                                    cancel: (fm.UA.IE || fm.UA.Edge) ? void (0) : function () {
                                        if (reqids.length) {
                                            $.each(reqids, function () {
                                                fm.request({
                                                    data: {
                                                        cmd: 'abort',
                                                        id: this
                                                    },
                                                    preventDefault: true
                                                });
                                            });
                                        }
                                        reqids = [];
                                    }
                                });
                            }, fm.notifyDelay);
                            checkCookie(reqid);
                        }
                        if (html5dl) {
                            click(link.attr('href', url)
                                .attr('download', fm.escape(files[i].name))
                                .get(0)
                            );
                        } else {
                            if (fm.UA.Mobile) {
                                setTimeout(function () {
                                    if (!window.open(url)) {
                                        fm.error('errPopup');
                                        ntftm && cleaerTimeout(ntftm);
                                        closeNotify();
                                    }
                                }, 100);
                            } else {
                                iframes += '<iframe class="downloader" id="downloader-' + files[i].hash + '" style="display:none" src="' + url + '"></iframe>';
                            }
                        }
                    }
                    link.remove();
                    $(iframes)
                        .appendTo('body')
                        .ready(function () {
                            setTimeout(function () {
                                $(iframes).each(function () {
                                    $('#' + $(this).attr('id')).remove();
                                });
                            }, 20000 + (10000 * i)); // give 20 sec + 10 sec for each file to be saved
                        });
                    fm.trigger('download', { files: files });
                    dfrd.resolve();
                });
                fileCnt = files.length;
                urls = [];
                for (i = 0; i < files.length; i++) {
                    fm.openUrl(files[i].hash, true, function (v) {
                        v && urls.push(v);
                        if (--fileCnt < 1) {
                            getUrlDfrd.resolve(urls);
                        }
                    });
                }
                return dfrd;
            }
        };

    };

    /**
     * @class  elFinder command "extract"
     * Extract files from archive
     *
     * @author Dmitry (dio) Levashov
     **/
    elFinder.prototype.commands.extract = function () {
        var self = this,
            fm = self.fm,
            mimes = [],
            filter = function (files) {
                return $.grep(files, function (file) {
                    return file.read && $.inArray(file.mime, mimes) !== -1 ? true : false;
                });
            };

        this.variants = [];
        this.disableOnSearch = true;

        // Update mimes list on open/reload
        fm.bind('open reload', function () {
            mimes = fm.option('archivers')['extract'] || [];
            if (fm.api > 2) {
                self.variants = [[{ makedir: true }, fm.i18n('cmdmkdir')], [{}, fm.i18n('btnCwd')]];
            } else {
                self.variants = [[{}, fm.i18n('btnCwd')]];
            }
            self.change();
        });

        this.getstate = function (select) {
            var sel = this.files(select),
                cnt = sel.length;

            return cnt && this.fm.cwd().write && filter(sel).length == cnt ? 0 : -1;
        };

        this.exec = function (hashes, opts) {
            var files = this.files(hashes),
                dfrd = $.Deferred(),
                cnt = files.length,
                makedir = opts && opts.makedir ? 1 : 0,
                i, error,
                decision;

            var overwriteAll = false;
            var omitAll = false;
            var mkdirAll = 0;

            var names = $.map(fm.files(files[0].phash), function (file) { return file.name; });
            var map = {};
            $.map(fm.files(files[0].phash), function (file) {
                map[file.name] = file;
                return false;
            });

            var decide = function (decision) {
                switch (decision) {
                    case 'overwrite_all':
                        overwriteAll = true;
                        break;
                    case 'omit_all':
                        omitAll = true;
                        break;
                }
            };

            var unpack = function (file) {
                if (!(file.read && fm.file(file.phash).write)) {
                    error = ['errExtract', file.name, 'errPerm'];
                    fm.error(error);
                    dfrd.reject(error);
                } else if ($.inArray(file.mime, mimes) === -1) {
                    error = ['errExtract', file.name, 'errNoArchive'];
                    fm.error(error);
                    dfrd.reject(error);
                } else {
                    fm.request({
                        data: { cmd: 'extract', target: file.hash, makedir: makedir },
                        notify: { type: 'extract', cnt: 1 },
                        syncOnFail: true,
                        navigate: {
                            toast: makedir ? {
                                incwd: { msg: fm.i18n(['complete', fm.i18n('cmdextract')]), action: { cmd: 'open', msg: 'cmdopen' } },
                                inbuffer: { msg: fm.i18n(['complete', fm.i18n('cmdextract')]), action: { cmd: 'open', msg: 'cmdopen' } }
                            } : {
                                    inbuffer: { msg: fm.i18n(['complete', fm.i18n('cmdextract')]) }
                                }
                        }
                    })
                        .fail(function (error) {
                            if (dfrd.state() != 'rejected') {
                                dfrd.reject(error);
                            }
                        })
                        .done(function () {
                        });
                }
            };

            var confirm = function (files, index) {
                var file = files[index],
                    name = fm.splitFileExtention(file.name)[0],
                    existed = ($.inArray(name, names) >= 0),
                    next = function () {
                        if ((index + 1) < cnt) {
                            confirm(files, index + 1);
                        } else {
                            dfrd.resolve();
                        }
                    };
                if (!makedir && existed && map[name].mime != 'directory') {
                    fm.confirm(
                        {
                            title: fm.i18n('ntfextract'),
                            text: ['errExists', name, 'confirmRepl'],
                            accept: {
                                label: 'btnYes',
                                callback: function (all) {
                                    decision = all ? 'overwrite_all' : 'overwrite';
                                    decide(decision);
                                    if (!overwriteAll && !omitAll) {
                                        if ('overwrite' == decision) {
                                            unpack(file);
                                        }
                                        if ((index + 1) < cnt) {
                                            confirm(files, index + 1);
                                        } else {
                                            dfrd.resolve();
                                        }
                                    } else if (overwriteAll) {
                                        for (i = index; i < cnt; i++) {
                                            unpack(files[i]);
                                        }
                                        dfrd.resolve();
                                    }
                                }
                            },
                            reject: {
                                label: 'btnNo',
                                callback: function (all) {
                                    decision = all ? 'omit_all' : 'omit';
                                    decide(decision);
                                    if (!overwriteAll && !omitAll && (index + 1) < cnt) {
                                        confirm(files, index + 1);
                                    } else if (omitAll) {
                                        dfrd.resolve();
                                    }
                                }
                            },
                            cancel: {
                                label: 'btnCancel',
                                callback: function () {
                                    dfrd.resolve();
                                }
                            },
                            all: ((index + 1) < cnt)
                        }
                    );
                } else if (!makedir && existed) {
                    if (mkdirAll == 0) {
                        fm.confirm({
                            title: fm.i18n('cmdextract'),
                            text: [fm.i18n('cmdextract') + ' "' + file.name + '"', 'confirmRepl'],
                            accept: {
                                label: 'btnYes',
                                callback: function (all) {
                                    all && (mkdirAll = 1);
                                    unpack(file);
                                    next();
                                }
                            },
                            reject: {
                                label: 'btnNo',
                                callback: function (all) {
                                    all && (mkdirAll = -1);
                                    next();
                                }
                            },
                            cancel: {
                                label: 'btnCancel',
                                callback: function () {
                                    dfrd.resolve();
                                }
                            },
                            all: ((index + 1) < cnt)
                        });
                    } else {
                        (mkdirAll > 0) && unpack(file);
                        next();
                    }
                } else {
                    unpack(file);
                    next();
                }
            };

            if (!(this.enabled() && cnt && mimes.length)) {
                return dfrd.reject();
            }

            if (cnt > 0) {
                confirm(files, 0);
            }

            return dfrd;
        };

    };


    /**
     * Preview plugin
     */
    const plugin = [
        /**
         * Images preview plugin
         *
         * @param elFinder.commands.quicklook
         **/
        function (ql) {
            var mimes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml', 'image/x-ms-bmp'],
                getDimSize = ql.fm.returnBytes((ql.options.getDimThreshold || 0)),
                preview = ql.preview,
                WebP, flipMime;

            // webp support
            WebP = new Image();
            WebP.onload = WebP.onerror = function () {
                if (WebP.height == 2) {
                    mimes.push('image/webp');
                }
            };
            WebP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';

            // what kind of images we can display
            $.each(navigator.mimeTypes, function (i, o) {
                var mime = o.type;

                if (mime.indexOf('image/') === 0 && $.inArray(mime, mimes)) {
                    mimes.push(mime);
                }
            });

            preview.on(ql.evUpdate, function (e) {
                var fm = ql.fm,
                    file = e.file,
                    showed = false,
                    dimreq = null,
                    setdim = function (dim) {
                        var rfile = fm.file(file.hash);
                        rfile.width = dim[0];
                        rfile.height = dim[1];
                    },
                    show = function () {
                        var elm, varelm, memSize, width, height, prop;

                        dimreq && dimreq.state && dimreq.state() === 'pending' && dimreq.reject();
                        if (showed) {
                            return;
                        }
                        showed = true;

                        elm = img.get(0);
                        memSize = file.width && file.height ? { w: file.width, h: file.height } : (elm.naturalWidth ? null : { w: img.width(), h: img.height() });

                        memSize && img.removeAttr('width').removeAttr('height');

                        width = file.width || elm.naturalWidth || elm.width || img.width();
                        height = file.height || elm.naturalHeight || elm.height || img.height();
                        if (!file.width || !file.height) {
                            setdim([width, height]);
                        }

                        memSize && img.width(memSize.w).height(memSize.h);

                        prop = (width / height).toFixed(2);
                        preview.on('changesize', function () {
                            var pw = parseInt(preview.width()),
                                ph = parseInt(preview.height()),
                                w, h;

                            if (prop < (pw / ph).toFixed(2)) {
                                h = ph;
                                w = Math.floor(h * prop);
                            } else {
                                w = pw;
                                h = Math.floor(w / prop);
                            }
                            img.width(w).height(h).css('margin-top', h < ph ? Math.floor((ph - h) / 2) : 0);

                        })
                            .trigger('changesize');

                        //show image
                        img.fadeIn(100);
                    },
                    hideInfo = function () {
                        loading.remove();
                        // hide info/icon
                        ql.hideinfo();
                    },
                    url, img, loading, prog, m, opDfd;

                if (!flipMime) {
                    flipMime = fm.arrayFlip(mimes);
                }
                if (flipMime[file.mime] && ql.dispInlineRegex.test(file.mime)) {
                    // this is our file - stop event propagation
                    e.stopImmediatePropagation();

                    loading = $('<div class="elfinder-quicklook-info-data"><span class="elfinder-spinner-text">' + fm.i18n('nowLoading') + '</span><span class="elfinder-spinner"></span></div>').appendTo(ql.info.find('.elfinder-quicklook-info'));
                    prog = $('<div class="elfinder-quicklook-info-progress"></div>').appendTo(loading);

                    img = $('<img/>')
                        .hide()
                        .appendTo(preview)
                        .on('load', function () {
                            hideInfo();
                            show();
                        })
                        .on('error', function () {
                            loading.remove();
                        });
                    
                    opDfd = fm.openUrl(file.hash, false, function (url) {
                        // img.attr('src', url);
                        $.ajax({
                            url: fm.options.url,
                            type: fm.options.requestType,
                            data: {
                                cmd: "preview",
                                target: file.hash
                            },
                            headers: fm.options.customHeaders
                        }).done((res) => {
                            hideInfo();
                            var imgC = `data:image/${res.type.replace(/\./, '').toLowerCase()};base64,${res.data}`
                            img.attr('src', imgC);
                        })
                    }, { progressBar: prog });
                    // stop loading on change file if not loaded yet
                    preview.one('change', function () {
                        opDfd && opDfd.state && opDfd.state() === 'pending' && opDfd.reject();
                    });

                    if (file.width && file.height) {
                        show();
                    } else if (file.size > getDimSize) {
                        dimreq = fm.request({
                            data: { cmd: 'dim', target: file.hash },
                            preventDefault: true
                        })
                            .done(function (data) {
                                if (data.dim) {
                                    var dim = data.dim.split('x');
                                    file.width = dim[0];
                                    file.height = dim[1];
                                    setdim(dim);
                                    show();
                                }
                            });
                    }
                }

            });
        },

        /**
         * PDF preview plugin
         *
         * @param elFinder.commands.quicklook
         **/
        function (ql) {
            var fm = ql.fm,
                mime = 'application/pdf',
                preview = ql.preview,
                active = false,
                urlhash = '',
                firefox, toolbar;

            if ((fm.UA.Safari && fm.OS === 'mac' && !fm.UA.iOS) || fm.UA.IE || fm.UA.Firefox) {
                active = true;
            } else {
                $.each(navigator.plugins, function (i, plugins) {
                    $.each(plugins, function (i, plugin) {
                        if (plugin.type === mime) {
                            return !(active = true);
                        }
                    });
                });
            }

            ql.flags.pdfNative = active;
            if (active) {
                if (typeof ql.options.pdfToolbar !== 'undefined' && !ql.options.pdfToolbar) {
                    urlhash = '#toolbar=0';
                }
                preview.on(ql.evUpdate, function (e) {
                    var file = e.file,
                        opDfd;

                    if (active && file.mime === mime && ql.dispInlineRegex.test(file.mime)) {
                        e.stopImmediatePropagation();
                        opDfd = fm.openUrl(file.hash, false, function (url) {
                            // if (url) {
                            //     ql.hideinfo();
                            //     ql.cover.addClass('elfinder-quicklook-coverbg');
                            //     $('<object class="elfinder-quicklook-preview-pdf" data="'+url+urlhash+'" type="application/pdf" ></object>')
                            //         .on('error', function (e) {
                            //             active = false;
                            //             ql.update(void (0), fm.cwd());
                            //             ql.update(void (0), file);
                            //         })
                            //         .appendTo(preview);
                            // }
                        });
                        // stop loading on change file if not loaded yet
                        preview.one('change', function () {
                            opDfd && opDfd.state && opDfd.state() === 'pending' && opDfd.reject();
                        });
                    }

                });
            }
        },

    ].concat(elFinder.prototype.commands.quicklook.plugins);

    elFinder.prototype.commands.quicklook.plugins = plugin;

})(jQuery)