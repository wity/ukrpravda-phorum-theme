// ==UserScript==
// @name                Ukrpravda.net phorum theme
// @namespace	        http://github.com/wity/ukrpravda-phorum-theme
// @description	        phorum theme for ukrpravda.net forum
// @include		        http://ukrpravda.net/*
// @include		        http://www.ukrpravda.net/*
// @require             http://code.jquery.com/jquery-1.11.0.min.js
// @resource            bootstrap_css http://netdna.bootstrapcdn.com/bootstrap/3.1.1/css/bootstrap.min.css
// @require             http://netdna.bootstrapcdn.com/bootstrap/3.1.1/js/bootstrap.min.js
// @run-at         		document-start
// @grant               GM_addStyle
// @grant               GM_getResourceText
// ==/UserScript==

var newCSS = GM_getResourceText("bootstrap_css");
GM_addStyle(newCSS);

; (function ($, window, undefined) {
    // outside the scope of the jQuery plugin to
    // keep track of all dropdowns
    var $allDropdowns = $();

    // if instantlyCloseOthers is true, then it will instantly
    // shut other nav items when a new one is hovered over
    $.fn.dropdownHover = function (options) {
        // don't do anything if touch is supported
        // (plugin causes some issues on mobile)
        if ('ontouchstart' in document) return this; // don't want to affect chaining

        // the element we really care about
        // is the dropdown-toggle's parent
        $allDropdowns = $allDropdowns.add(this.parent());

        return this.each(function () {
            var $this = $(this),
                $parent = $this.parent(),
                defaults = {
                    delay: 500,
                    instantlyCloseOthers: true
                },
                data = {
                    delay: $(this).data('delay'),
                    instantlyCloseOthers: $(this).data('close-others')
                },
                showEvent = 'show.bs.dropdown',
                hideEvent = 'hide.bs.dropdown',
                // shownEvent  = 'shown.bs.dropdown',
                // hiddenEvent = 'hidden.bs.dropdown',
                settings = $.extend(true, {}, defaults, options, data),
                timeout;

            $parent.hover(function (event) {
                // so a neighbor can't open the dropdown
                if (!$parent.hasClass('open') && !$this.is(event.target)) {
                    // stop this event, stop executing any code 
                    // in this callback but continue to propagate
                    return true;
                }

                $allDropdowns.find(':focus').blur();

                if (settings.instantlyCloseOthers === true)
                    $allDropdowns.removeClass('open');

                window.clearTimeout(timeout);
                $parent.addClass('open');
                $this.trigger(showEvent);
            }, function () {
                timeout = window.setTimeout(function () {
                    $parent.removeClass('open');
                    $this.trigger(hideEvent);
                }, settings.delay);
            });

            // this helps with button groups!
            $this.hover(function () {
                $allDropdowns.find(':focus').blur();

                if (settings.instantlyCloseOthers === true)
                    $allDropdowns.removeClass('open');

                window.clearTimeout(timeout);
                $parent.addClass('open');
                $this.trigger(showEvent);
            });

            // handle submenus
            $parent.find('.dropdown-submenu').each(function () {
                var $this = $(this);
                var subTimeout;
                $this.hover(function () {
                    window.clearTimeout(subTimeout);
                    $this.children('.dropdown-menu').show();
                    // always close submenu siblings instantly
                    $this.siblings().children('.dropdown-menu').hide();
                }, function () {
                    var $submenu = $this.children('.dropdown-menu');
                    subTimeout = window.setTimeout(function () {
                        $submenu.hide();
                    }, settings.delay);
                });
            });
        });
    };

    $(document).ready(function () {
        // apply dropdownHover to all elements with the data-hover="dropdown" attribute
        $('[data-hover="dropdown"]').dropdownHover();
    });
})(jQuery, this);

; (function ($, window, undefined) {

    $.fn.phorumize = function (options) {

        var _elem = this,

        frame = $("#content_section > div.frame"),
        body = $("body"),

        applyDropdownHover = function () {
            $('[data-hover="dropdown"]').dropdownHover();
        },
        setPageTopOffset = function () {
            $("body").css("margin-top", $("div.top-page-header-container").height());
        },
        getPageSubtitleLinks = function () {
            var items = $('#main_content_section > div.navigate_section:first a').toArray();
            var res = [];
            for (var i = 1; i < items.length - 1; i++) {
                res.push(items[i]);
            }
            return res;
        },
        pageSubtitleLinks = getPageSubtitleLinks(),
	    getDropDown = function (el, dropdown) {
	        return $('<span class="dropdown"></span>')
				    .append($('<span class="dropdown-toggle" data-toggle="dropdown" data-hover="dropdown" data-delay="1000" data-close-others="true"></span>').append(el))
				    .append($('<div class="dropdown-menu"></div>').append(dropdown));
	    },
        getPagerPages = function (el) {
            var cur = el.find("strong").text();
            var res = [];

            if (cur) {

                var last = el.children().last().text();
                if (last && last != "1") {
                    var a = el.children().toArray();
                    for (var i = 0; i < a.length; i++) {
                        var item = $(a[i]);
                        if (item.prop("tagName") == "A") {
                            res.push($("<a class='navPages'>" + item.text() + "</a>").attr("href", item.attr("href")));
                        } else if (item.prop("tagName") == "STRONG") {
                            res.push($("<strong class='navPages'>" + item.text() + "</strong>"));
                        } else if (item.prop("tagName") == "SPAN") {
                            res.push(item);
                        }
                    };
                }
            }
            return res;
        },
        getPagerPrevPage = function (a) {
            var res = null;
            for (var i = 0; i < a.length; i++) {
                var item = a[i];
                if ($(item).prop("tagName") == "STRONG")
                    return res;
                res = item;
            }
            return null;
        },
        getPagerNextPage = function (a) {
            var res = null;
            for (var i = 0; i < a.length; i++) {
                var item = a[i];
                if (res)
                    return item;

                if ($(item).prop("tagName") == "STRONG")
                    res = item;
            }
            return null;
        },
        getPager = function (pn) {
            var cur = pn.find("strong").text();
            var pages = getPagerPages(pn);

            if (cur) {
                var last = pn.children().last().text();

                if (last && last != "1") {
                    var div = $("<div class='p-pager pull-right'></div>")
                        .append("<span class='p-current'>Сторінка " + cur + " з " + last + "</span><span class='p-pages-caption'> Сторінки: </span>");


                    var pp = getPagerPrevPage(pages);
                    if (pp)
                        div.append($("<a class='navPages'>Попередня</a>").attr("href", $(pp).attr("href")));

                    div.append(pages);

                    var pn = getPagerNextPage(pages);
                    if (pn) {
                        div.append($("<a class='navPages'>Наступна</a>").attr("href", $(pn).attr("href")));
                    }

                    return div;
                }
            }

            return $(null);
        },

        getNavHeader = function (el, addLink, url) {
            var a = pageSubtitleLinks.length > 0 ? $(pageSubtitleLinks[pageSubtitleLinks.length - 1]) : null;
            var linkUrl = url ? url : (a ? a.attr("href") : null);

            return $("<div class='thread-header'></div>")
                .append(addLink && linkUrl ? $("<a>" + addLink + "</a>").attr("href", linkUrl) : $())
                .append(el.find("div.buttonlist a"))
                .append(getPager(el.find("div.pagelinks")))
                .append($('<span class="clearfix"></span>'))

        },
        getPageTitle = function () {
            return $("#forumposts > div.cat_bar > h3.catbg").text().substr(22);
        },
        getPageSubtitle = function () {
            var items = $('#main_content_section > div.navigate_section:first a').toArray();
            var res = [];
            for (var i = 1; i < items.length - 1; i++) {
                if (i > 1 && i < items.length - 1)
                    res.push($("<span> &#xbb; </span>"));

                if (i == 1) {
                    var uMenu = getDropDown(items[i], $("div.user > ul.reset"));
                    res.push(uMenu);
                }
                else
                    res.push(items[i]);
            }
            return res;
        },
	    buildPageHeader = function (headers) {
	        var div = $('<div class="top-page-header-container navbar-fixed-top"></div>');
	        $("body").prepend(div);

	        for (var i = 0; i < headers.length; i++) {
	            div.append($("<div class='top-page-header'></div>").append(headers[i]).append($('<div class="clearfix"></div>')));
	        }
	    },

        //----------------

        transformTopic = function () {
            var _topicElem = this,

            transformFooter = function () {

            },

            transformQuotes = function () {
                $("blockquote.bbc_standard_quote").attr("class", "img-rounded");
                $("blockquote.bbc_alternate_quote").attr("class", "img-rounded");
            },
            transformQuoteAuthor = function (el) {
                var m = el.html().match(/\>\u0426\u0438\u0442\u0430\u0442\u0430\u003a(.+?)\u0432\u0456\u0434\s*/);
                if (m) {
                    el.parent().prepend($("<div>" + m[1] + "</div>"));
                    el.hide();
                }
            },
            transformQuoteAuthors = function () {
                $("div.topslice_quote").each(function () { transformQuoteAuthor($(this)); });
            },
            createPostHeader = function (el) {
                var poster = el.find("div.poster > h4 > a");
                var date = el.find("div.postarea > div.flow_hidden > div.keyinfo > div.smalltext")
                    .text()
                    .replace(/\xbb|\xab|\s:/g, "")
                    .replace(/Reply\s#\d+/g, "")
                    .replace(/^\s+|\s+\z/g, "");

                var p = el.find("div.poster");
                p.find("h4").hide();

                var dd = getDropDown($("<a></a>").attr("href", poster.attr("href")).text(poster.text()), p);
                el.prepend(
                    $("<div class='post-header'></div>")
                        .append(
                            dd
                        )
                        .append($("<div class='pull-right'></span>").text(date))
                );
            },
            createPostFooter = function (el) {
                var q = el.find(".quote_button a");
                var mlinks = el.find("div.reportlinks a");
                var postId = el.find("div.inner").attr("id");

                if (postId)
                    postId = postId.replace("msg_", "");

                var postNo = el.find("div.keyinfo div.smalltext").text().match(/Reply\s#(\d+)/);
                if (postNo)
                    postNo = postNo[1];

                el.append(
                    $("<div class='post-footer'></div>")
                        .append(q)
                        .append(
                            $("<div class='pull-right'></div>")
                                .append(mlinks)
                                .append(postNo && postId ? $("<a></a>").attr("href", location.href + "#msg" + postId).text("#" + postNo) : $())
                            )
                );

            },
            transformPost = function (el) {
                createPostHeader(el);
                createPostFooter(el);

                var post = el.find("div.postarea");
                el.find("div.moderatorbar > div.modified").appendTo(post);
                el.find("div.moderatorbar > div.signature").appendTo(post);
            },
            transformPosts = function (el) {
                createPostHeader(el);
                createPostFooter(el);

                var post = el.find("div.postarea");
                el.find("div.moderatorbar > div.modified").appendTo(post);
                el.find("div.moderatorbar > div.signature").appendTo(post);
            },
            transformPosts = function () {
                $("div.post_wrapper").each(function () { transformPost($(this)) });

                $("div.postarea > div.flow_hidden").hide();
                $("div.post_wrapper > div.poster").hide();
                $("div.post_wrapper > div.moderatorbar").hide();
                $("span.topslice").height(0);
                //$("span.botslice")
                //$("span.botslice").hide();
                $("span.botslice").each(function () {
                    $("<div class='clearfix'></div>").insertBefore($(this));
                    $(this).hide();
                });
                $("span.topslice").each(function () {
                    $("<div class='clearfix'></div>").insertBefore($(this));
                    $(this).hide();
                });
            },
            transformHeader = function () {

                buildPageHeader([
                    $("<div class='page-header2'></div>")
                        .append($("<div class='thread-subtitle'></div>").append(getPageSubtitle()).addClass("pull-left"))
                        .append($("div#main_menu").attr("class", "pull-right")),

                    $("<div class='thread-title'></div>").text(getPageTitle()),

		            getNavHeader($("div.pagesection:first"), "Список тем")
                ]);

                $("#header").hide();

                $($("#header").children()[3]).insertAfter("<th>Автор</th>");

                frame.find("#main_content_section > div.navigate_section").hide();
                frame.find("#main_content_section > div.pagesection").hide();
                frame.find("#forumposts > div.cat_bar").hide();
            },
            transformFooter = function () {

                $("#forumposts").append(getNavHeader($("div.pagesection:last"), "Список тем"));
                $("#quickreplybox > div:first").hide();
                $("#quickreplybox").prepend('<a href="javascript:oQuickReply.swap();">Швидка відповідь</a>');
            },
            fixNewAnchor = function () {
                var anew = $("#new");
                if (anew && anew.length) {
                    var _topOffset = $("div.top-page-header-container").height();

                    anew.css("margin-top", _topOffset * -1)
                       .css("height", _topOffset)
                       .css("display", "block")
                       .css("visibility", "hidden");

                    var a = anew.nextAll().toArray();
                    for (var i = 0; i < a.length; i++) {
                        var item = $(a[i]);
                        var postHeader = item.find("div.post-header");
                        if (postHeader && postHeader.length) {
                            postHeader.find("div.pull-right").css("text-align", "right").append("<br/><span class='new-msg'>Нове</span>");
                        }
                    }
                }
            },
            scrollToNewAnchor = function () {
                var anew = $("#new");
                if (anew && anew.length) {
                    //$("body").scrollTo(anew);
                    $('html,body').animate({
                        scrollTop: anew.offset().top
                    }, 300);
                }
            }
            transformHeader();

            transformFooter();
            transformQuoteAuthors();

            transformQuotes();

            transformPosts();

            fixNewAnchor();

            applyDropdownHover();
            setPageTopOffset();

            scrollToNewAnchor();
            $("<div class='clearfix'></div>").insertBefore($("#main_content_section"));
        },

        //--------------------

        transformForum = function () {

            var _forumElem = this,

            transformHeader = function () {
                buildPageHeader([
                    $("<div class='page-header2'></div>")
                        .append($("<div class='thread-subtitle'></div>").append(getPageSubtitle()).addClass("pull-left"))
                        .append($("div#main_menu").attr("class", "pull-right")),

		            getNavHeader($("div.pagesection:first"), "Список форумів", "/index.php")
                ]);

                $("#header").hide();

                var trs = $("#messageindex > table > thead > tr:first");
                trs.find("th:first").hide();
                var sec = trs.find("th:nth-child(2)");
                var c1Title = sec.html().split(" / ");
                sec.html(c1Title[0]);

                trs.find("th:nth-child(3)").addClass("replies");
                $("<th class='author'></th>").append(c1Title[1]).insertAfter(trs.find("th:nth-child(3)"));

                frame.find("#main_content_section > div.navigate_section").hide();
                frame.find("#main_content_section > div.pagesection").hide();
                frame.find("#forumposts > div.cat_bar").hide();
            },
            transformFooter = function () {

                getNavHeader($("div.pagesection:last"), "Список форумів", "/index.php").insertAfter($("#messageindex"));
                $("#topic_icons > div.description > p.smalltext").hide();
            },
            formatTitle = function (el, img) {
                if (el) {
                    var prefix = "";
                    if (img.indexOf("sticky") > -1)
                        prefix = "Замітка: ";
                    else if (img.indexOf("poll") > -1)
                        prefix = "Опитування: ";

                    if (prefix) {
                        el.find("a:first").parent().prepend($("<strong>" + prefix + " </strong>"));
                    }

                    var p = el.find("p");
                    el.find("div").append(p.find("small"));
                    p.remove();

                    var s = el.find("small");
                    s.html(s.html().replace(/\xab/, "<small>(Сторінки: ").replace(/\s*\xbb/, ")</small>"));
                }
            },
            formatReplies = function (el) {
                if (el) {
                    var m = el.text().match(/(\d+)[\s\S]+?(\d+)/);
                    if (m && m[1] && m[2])
                        el.html("<span title='Відповідей / Переглядів'>" + m[1] + " / " + m[2] + "</span>");
                }
            },
            formatLastPost = function (el) {
                if (el) {
                    var html = el.html();
                    var url = $(el.children().first()).attr("href");
                    var idx = html.indexOf("</a>");
                    if (url && idx > -1) {
                        html = html.substr(idx + 4);
                        var s = html.split("<br>");
                        if (s.length == 2)
                            el.html(s[0] + "<br>" + "<a href='" + url + "'>Останнє</a> " + s[1]);
                    }
                }
            },
            extractAuthorHtml = function (el) {
                return el.find("p").find("a:first").html();
            },
            transformThread = function (el) {
                var dd = el.find("td").map(function () { return $(this) });
                if (dd.length >= 5) {

                    dd[0].hide();
                    dd[1].hide();

                    $("<td class='author'></td>").append(dd[2].find("p").find("a:first")).insertAfter($(dd[3]));

                    formatTitle(dd[2], dd[0].find("img").attr("src"));
                    formatReplies(dd[3]);
                    formatLastPost(dd[4]);
                }
            },
            transformNewIcons = function () {
                $("img")
                   .filter(function () { return $(this).attr("src").indexOf("new.gif") > -1 })
                   .each(function () {
                       var a = $(this).closest("a");
                       a.parent().find("a:first").attr("href", a.attr("href"));
                       //a.parent().prepend("<span class='new-icon'></span>");
                       a.hide();
                   })
            },
            transformThreads = function () {
                var rows = $("#messageindex > table > tbody > tr");

                rows.each(function (idx) { if ((idx % 2) == 0) $(this).addClass("alt") });
                rows.each(function () { transformThread($(this)) });
            }


            transformHeader();
            transformFooter();
            transformThreads();
            transformNewIcons();

            applyDropdownHover();
            setPageTopOffset();
        },
        addStyle = function (css, base64) {
            var datuURIs = document.createElement("link");
            document.head = document.head || document.getElementsByTagName('head'[0]);
            if (base64)
                datuURIs.href = "data:text/css;base64," + css;
            else
                datuURIs.href = "data:text/css," + css;

            datuURIs.rel = "stylesheet";
            document.head.appendChild(datuURIs);
        }


        var css = "Ym9keSwgdHIsIHRoLCB0ZCB7CiAgICBjb2xvcjogIzAwMDsKfQoKYm9keSB7CiAgICBwYWRkaW5nOiAwcHg7CiAgICBiYWNrZ3JvdW5kOiAjY2NjOwogICAgZm9udC1zaXplOiAxMHB0OwogICAgZm9udC1mYW1pbHk6IFZlcmRhbmEsQXJpYWwsQ2xlYW4sSGVsdmV0aWNhLHNhbnMtc2VyaWYsTHVjaWRhIFNhbnMgVW5pY29kZSxMdWNpZGEgR3JhbmRlLEFyaWFsLFZlcmRhbmEsVGFob21hOwp9CgoucG9zdF93cmFwcGVyIC5wb3N0YXJlYSAucG9zdCAuaW5uZXIgewogICAgYm9yZGVyLXRvcDogMHB4IG5vbmU7Cn0KCi5wb3N0X3dyYXBwZXIgLnBvc3RhcmVhLCAucG9zdF93cmFwcGVyIC5tb2RlcmF0b3JiYXIgewogICAgbWFyZ2luOiAwcHg7Cn0KCi8qcGFnZSBtYXJnaW5zKi8KYm9keSAjd3JhcHBlciAjY29udGVudF9zZWN0aW9uIHsKICAgIGJhY2tncm91bmQ6ICNjY2M7CiAgICBwYWRkaW5nOiAwcHg7CiAgICBwYWRkaW5nLWxlZnQ6IDVweDsKICAgIHBhZGRpbmctcmlnaHQ6IDVweDsKfQoKI2Zvb3Rlcl9zZWN0aW9uIHsKICAgIG1hcmdpbi1sZWZ0OiA1cHg7CiAgICBtYXJnaW4tcmlnaHQ6IDVweDsKICAgIGJhY2tncm91bmQ6IG5vbmU7Cn0KCiNmb290ZXJfc2VjdGlvbiBkaXYuZnJhbWUgewogICAgYmFja2dyb3VuZDogI2NjYzsKICAgIHBhZGRpbmc6IDEwcHggMHB4IDBweCAwcHggIWltcG9ydGFudDsKfQoKYm9keSAjd3JhcHBlciAjY29udGVudF9zZWN0aW9uIC5mcmFtZSB7CiAgICBwYWRkaW5nOiAwcHg7CiAgICBiYWNrZ3JvdW5kOiAjY2NjOwp9CgouYm90c2xpY2UsIC50b3BzbGljZSB7CiAgICBkaXNwbGF5OiBub25lOwp9CgouYm90c2xpY2UyIHsKICAgIGRpc3BsYXk6IG5vbmUgIWltcG9ydGFudDsKfQoKLmlubmVyIHtwYWRkaW5nOiAwcHggMHB4IDEwcHggMHB4O30KCiNmb3J1bXBvc3RzIC5tb2RpZmllZCB7ZmxvYXQ6bm9uZTt9Cgoud2luZG93YmcsIC53aW5kb3diZzIgewogICAgYm9yZGVyOiAxcHggc29saWQgIzgwODA4MDsKICAgIG1hcmdpbjogMnB4OwogICAgYmFja2dyb3VuZDogI2ZmZjsKICAgIHBhZGRpbmc6IDBweDsKfQoKLnBvc3Rfd3JhcHBlciB7CiAgICBtYXJnaW46IDBweDsKfQoKYm9keSAjd3JhcHBlciB7CiAgICB3aWR0aDogMTAwJSAhaW1wb3J0YW50Owp9Cgp0YWJsZS50YWJsZV9ncmlkIHRkIGEsIC5wb3N0IC5pbm5lciBhIHsKICAgIGNvbG9yOiAjRDAwOwogICAgdGV4dC1kZWNvcmF0aW9uOiBub25lOwp9Cgp0YWJsZS50YWJsZV9ncmlkIHRkIGE6aG92ZXIsIC5wb3N0IC5pbm5lciBhOmhvdmVyIHsKICAgIHRleHQtZGVjb3JhdGlvbjogdW5kZXJsaW5lOwp9Cgp0YWJsZS50YWJsZV9ncmlkIHRkIGE6dmlzaXRlZCwgLnBvc3QgLmlubmVyIGE6dmlzaXRlZCB7CiAgICBjb2xvcjogIzc3MDAwMDsKICAgIHRleHQtZGVjb3JhdGlvbjogbm9uZTsKfQoKLnBvc3QtaGVhZGVyIGEsIC5wb3N0LWhlYWRlciBhOnZpc2l0ZWQgewogICAgY29sb3I6ICNEMDAgIWltcG9ydGFudDsKICAgIHRleHQtZGVjb3JhdGlvbjogbm9uZTsKICAgIGZvbnQtd2VpZ2h0OiBib2xkOwogICAgZm9udC1zaXplOiAxMnB4Owp9CgoucG9zdC1oZWFkZXIgewogICAgcGFkZGluZy1sZWZ0OiA1cHg7CiAgICBwYWRkaW5nLXJpZ2h0OiA1cHg7CiAgICBwYWRkaW5nLXRvcDogNXB4Owp9CgoucG9zdGFyZWEgewogICAgcGFkZGluZzogNXB4Owp9CgoucG9zdC1oZWFkZXIgZGl2IHsKICAgIGZvbnQtc2l6ZTogMTFweDsKfQoKLnBvc3QtZm9vdGVyIHsKICAgIGhlaWdodDogMTVweDsKICAgIGJhY2tncm91bmQ6ICNlZWU7CiAgICBmb250LXNpemU6IDExcHg7Cn0KCi5wb3N0LWZvb3RlciBhLCAucG9zdC1mb290ZXIgYTp2aXNpdGVkIHsKICAgIGNvbG9yOiAjMDAwICFpbXBvcnRhbnQ7CiAgICB0ZXh0LWRlY29yYXRpb246IG5vbmU7CiAgICBtYXJnaW4tbGVmdDogNXB4OwogICAgbWFyZ2luLXJpZ2h0OiA1cHg7Cn0KCi5wb3N0LWZvb3RlciBhOmhvdmVyIHsKICAgIHRleHQtZGVjb3JhdGlvbjogdW5kZXJsaW5lOwp9CgpibG9ja3F1b3RlIHsKICAgIGZvbnQtc2l6ZTogMTFweDsKfQoKLmJiY19zdGFuZGFyZF9xdW90ZSwgLmJiY19hbHRlcm5hdGVfcXVvdGUgewp9CgouYmJjX3N0YW5kYXJkX3F1b3RlIHsKfQoKLmJiY19hbHRlcm5hdGVfcXVvdGUgewp9CgoucGFnZS1oZWFkZXIyIHsKICAgIHdoaXRlLXNwYWNlOiBub3dyYXA7Cn0KCi5wYWdlLWhlYWRlcjIgI21haW5fbWVudSAjbWVudV9uYXYgewogICAgd2hpdGUtc3BhY2U6IG5vd3JhcDsKfQoKI21haW5fbWVudSB7CiAgICB3aWR0aDogYXV0bzsKfQoKLmRyb3Bkb3duLW1lbnUgewogICAgcGFkZGluZzogMTBweDsKfQoKLmRyb3Bkb3duLW1lbnUsIC5kcm9wZG93biB7CiAgICBjdXJzb3I6IGRlZmF1bHQ7Cn0KLnRocmVhZC1oZWFkZXIgewogICAgYmFja2dyb3VuZDogI0YwRjBGMDsKICAgIGJvcmRlcjogMXB4IHNvbGlkICM4MDgwODA7CiAgICBwYWRkaW5nOiAwcHg7CiAgICBtYXJnaW46IDJweDsKICAgIGZvbnQtc2l6ZTogMTFweDsKfQoKLnRocmVhZC1oZWFkZXIgYSwgLnRocmVhZC1oZWFkZXIgYTp2aXNpdGVkIHsKICAgIGNvbG9yOiAjMDAwICFpbXBvcnRhbnQ7CiAgICB0ZXh0LWRlY29yYXRpb246IG5vbmU7CiAgICBtYXJnaW4tbGVmdDogNXB4OwogICAgbWFyZ2luLXJpZ2h0OiA1cHg7Cn0KCi5wLXBhZ2VzLWNhcHRpb24gewogICAgbWFyZ2luLWxlZnQ6IDEwcHg7CiAgICBtYXJnaW4tcmlnaHQ6IDEwcHg7CiAgICBmb250LXdlaWdodDogYm9sZDsKfQoKLnRocmVhZC1oZWFkZXIgLm5hdlBhZ2VzIHsKICAgIG1hcmdpbi1sZWZ0OiA1cHg7CiAgICBtYXJnaW4tcmlnaHQ6IDVweDsKfQoKLnRocmVhZC1oZWFkZXIgYTpob3ZlciB7CiAgICB0ZXh0LWRlY29yYXRpb246IHVuZGVybGluZTsKfQoKLnRocmVhZC10aXRsZSB7CiAgICBmb250LXNpemU6IDE2cHg7CiAgICBmb250LXdlaWdodDogYm9sZDsKICAgIHBhZGRpbmctdG9wOiAxMHB4OwogICAgcGFkZGluZy1ib3R0b206IDEwcHg7Cn0KCi50aHJlYWQtc3VidGl0bGUgewogICAgbWFyZ2luLWJvdHRvbTogNXB4Owp9CgojbWFpbl9tZW51IGEuZmlyc3RsZXZlbCwgLnRocmVhZC1zdWJ0aXRsZSBhLCAudGhyZWFkLXN1YnRpdGxlIGE6dmlzaXRlZCB7CiAgICBjb2xvcjogIzAwMCAhaW1wb3J0YW50OwogICAgdGV4dC1kZWNvcmF0aW9uOiBub25lOwogICAgZm9udC1zaXplOiAxMXB4Owp9CgouZHJvcG1lbnUgbGkgYS5maXJzdGxldmVsOmhvdmVyIHNwYW4uZmlyc3RsZXZlbCwgLmRyb3BtZW51IGxpOmhvdmVyIGEuZmlyc3RsZXZlbCBzcGFuLmZpcnN0bGV2ZWwsIC5kcm9wbWVudSBsaSBhLmZpcnN0bGV2ZWw6aG92ZXIsIC5kcm9wbWVudSBsaTpob3ZlciBhLmZpcnN0bGV2ZWwgeyBiYWNrZ3JvdW5kOiBub25lICFpbXBvcnRhbnQ7fQouZHJvcG1lbnUgbGkgYS5hY3RpdmUgc3Bhbi5maXJzdGxldmVsLCAuZHJvcG1lbnUgbGkgYS5hY3RpdmUgewogICAgYmFja2dyb3VuZDogbm9uZSAhaW1wb3J0YW50Owp9CgoKI21haW5fbWVudSBhLmZpcnN0bGV2ZWw6aG92ZXIsIC50aHJlYWQtc3VidGl0bGUgYTpob3ZlciB7CiAgICB0ZXh0LWRlY29yYXRpb246IHVuZGVybGluZTsKfQoKI3F1aWNrcmVwbHlib3ggLmNhdGJnIHsKICAgIG1hcmdpbi10b3A6IDBweCAhaW1wb3J0YW50Owp9CgojcXVpY2tyZXBseWJveCAuY2F0X2JhciB7CiAgICBiYWNrZ3JvdW5kOiAjRjBGMEYwOwp9CgojcXVpY2tyZXBseWJveCAuY2F0X2JhciBhIHsKICAgIGNvbG9yOiAjMDAwOwogICAgdGV4dC10cmFuc2Zvcm06IG5vbmU7Cn0KCi8qcGFnZSBtYXJnaW5zKi8KLnRvcC1wYWdlLWhlYWRlciB7CiAgICBtYXJnaW4tbGVmdDogNXB4OwogICAgbWFyZ2luLXJpZ2h0OiA1cHg7Cn0KCi50b3AtcGFnZS1oZWFkZXItY29udGFpbmVyIHsKICAgIGJhY2tncm91bmQ6ICNjY2M7Cn0KCnRhYmxlLnRhYmxlX2dyaWQgdGQgewogICAgYm9yZGVyOiAwcHggbm9uZTsKfQoKdGFibGUudGFibGVfZ3JpZCB0ZCBhIHsKICAgIGZvbnQtd2VpZ2h0OiBub3JtYWw7Cn0KCnRhYmxlLnRhYmxlX2dyaWQgdHIgdGQgewogICAgYmFja2dyb3VuZDogI0ZGRiAhaW1wb3J0YW50Owp9Cgp0YWJsZS50YWJsZV9ncmlkIHRyLmFsdCB0ZCB7CiAgICBiYWNrZ3JvdW5kOiAjRUVFICFpbXBvcnRhbnQ7Cn0KCi50YWJsZV9ncmlkIHRyLnRpdGxlYmcgdGQgewogICAgYmFja2dyb3VuZDogI2NjYyAhaW1wb3J0YW50OwogICAgYm9yZGVyLXRvcDogMXB4ICM4MDgwODAgc29saWQ7CiAgICBib3JkZXItYm90dG9tOiAxcHggIzgwODA4MCBzb2xpZDsKfQoKLnRhYmxlX2dyaWQgewogICAgYm9yZGVyOiAxcHggIzgwODA4MCBzb2xpZDsKfQoKLnRhYmxlX2dyaWQgdGggYSB7CiAgICBjb2xvcjogIzAwMCAhaW1wb3J0YW50Owp9CgoudGFibGVfZ3JpZCB0aCB7CiAgICBjb2xvcjogIzAwMCAhaW1wb3J0YW50OwogICAgZm9udC13ZWlnaHQ6IGJvbGQgIWltcG9ydGFudDsKICAgIGJhY2tncm91bmQ6ICNjY2MgIWltcG9ydGFudDsKICAgIGZvbnQtc2l6ZTogMTFweCAhaW1wb3J0YW50OwogICAgYm9yZGVyLWJvdHRvbTogMXB4ICM4MDgwODAgc29saWQ7Cn0KCiNtZXNzYWdlaW5kZXggewogICAgcGFkZGluZy1sZWZ0OiAycHg7CiAgICBwYWRkaW5nLXJpZ2h0OiAycHg7Cn0KCmlucHV0W3R5cGU9YnV0dG9uXSwgLmJ1dHRvbl9zdWJtaXQgewogICAgcGFkZGluZzoycHggNXB4IDJweCA1cHggIWltcG9ydGFudDsKICAgIGZvbnQtc2l6ZToxMXB4ICFpbXBvcnRhbnQ7CiAgICBiYWNrZ3JvdW5kOiNjY2M7CiAgICBib3JkZXI6MXB4IHNvbGlkICMwMDA7CiAgICBoZWlnaHQ6MjNweDsKICAgIGNvbG9yOiMwMDA7Cn0KCmlucHV0W3R5cGU9YnV0dG9uXTpob3ZlciwgLmJ1dHRvbl9zdWJtaXQ6aG92ZXIgewogICAgYmFja2dyb3VuZDojRjBGMEYwOwogICAgYm9yZGVyOjFweCBzb2xpZCAjODA4MDgwOwp9CiNxdWlja1JlcGx5T3B0aW9ucyAudXBwZXJmcmFtZSwgI3F1aWNrUmVwbHlPcHRpb25zIC5sb3dlcmZyYW1lIHsKICAgIGRpc3BsYXk6bm9uZTsKfQojcXVpY2tSZXBseU9wdGlvbnMgLnJvdW5kZnJhbWUgewogICAgYm9yZGVyOiAwcHggbm9uZTsKICAgIGJhY2tncm91bmQ6I0YwRjBGMDsKfQojZGlzcGxheV9qdW1wX3RvLCAjcXVpY2tyZXBseWJveHsKICAgIGJhY2tncm91bmQ6I0YwRjBGMDsKICAgIGJvcmRlcjoxcHggc29saWQgIzgwODA4MDsKfQojcXVpY2tyZXBseWJveCBhIHsKICAgIGZvbnQtd2VpZ2h0OmJvbGQ7CiAgICBjb2xvcjojMDAwOwogICAgbWFyZ2luOiA1cHg7Cn0KdGQubGFzdHBvc3QgYiB7CiAgICBmb250LXdlaWdodDpub3JtYWw7Cn0KdGQuYXV0aG9yLCB0aC5hdXRob3IsIHRoLnJlcGxpZXMgewogICAgdGV4dC1hbGlnbjpjZW50ZXI7CiAgICBmb250LXNpemU6MTFweDsKfQp0ZC5zdWJqZWN0IHsKICAgIHBhZGRpbmctbGVmdDo1cHggIWltcG9ydGFudDsKfQoubmV3LWljb24gewogICAgcG9zaXRpb246YWJzb2x1dGU7CiAgICBtYXJnaW4tbGVmdDotNHB4OwogICAgbWFyZ2luLXRvcDotN3B4OwogICAgdmVydGljYWwtYWxpZ246dG9wOwogICAgaGVpZ2h0OjRweDsKICAgIHdpZHRoOjRweDsKICAgIGJhY2tncm91bmQ6I2ZmYTdhNzsKfQoubmV3LW1zZ3sKICAgIGZvbnQtc2l6ZTo5cHg7CiAgICBjb2xvcjojODA4MDgwOwp9";

        var url = location.href;
        var f = null;

        if (url.indexOf("rss") == -1 && url.indexOf("wap") == -1) {
            if (url.indexOf("board=") > -1) {
                f = transformForum;
            }
            else if (url.indexOf("topic=") > -1) {
                f = transformTopic;
            }
        }

        if (f != null) {
            addStyle(css, true);
            f();
        }

    };
})(jQuery, this);

$(document).ready(function () {
    $().phorumize();

});
