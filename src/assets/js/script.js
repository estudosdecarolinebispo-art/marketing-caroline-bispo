/**
 * Interações e eventos de conversão — Caroline Bispo.
 * Os links são identificados por data-track, sem depender do domínio da agenda.
 */

(function () {
    "use strict";

    var META_PIXEL_ID = "2429202777490521";
    var COOKIE_CONSENT_KEY = "caroline_meta_consent_v1";
    var CAL_EMBED_SCRIPT = "https://app.cal.com/embed/embed.js";
    var CAL_PUBLIC_URL = "https://cal.com/caroline-bispo/agendamentos";

    function getCookieConsent() {
        try {
            return window.localStorage.getItem(COOKIE_CONSENT_KEY);
        } catch (error) {
            return null;
        }
    }

    function setCookieConsent(value) {
        try {
            window.localStorage.setItem(COOKIE_CONSENT_KEY, value);
        } catch (error) {
            // O consentimento ainda vale para esta visita se o armazenamento estiver bloqueado.
        }
    }

    function loadMetaPixel() {
        if (window.fbq) return;

        (function (f, b, e, v, n, t, s) {
            if (f.fbq) return;
            n = f.fbq = function () {
                n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
            };
            if (!f._fbq) f._fbq = n;
            n.push = n;
            n.loaded = true;
            n.version = "2.0";
            n.queue = [];
            t = b.createElement(e);
            t.async = true;
            t.src = v;
            s = b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t, s);
        })(window, document, "script", "https://connect.facebook.net/pt_BR/fbevents.js");

        window.fbq("init", META_PIXEL_ID);
        window.fbq("track", "PageView");
    }

    function trackMetaEvent(eventName, details) {
        if (getCookieConsent() !== "accepted" || typeof window.fbq !== "function") return;
        window.fbq("track", eventName, details || {});
    }

    function trackConversion(eventName, details) {
        var eventData = Object.assign({
            event: eventName,
            page_path: window.location.pathname
        }, details || {});

        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push(eventData);
        window.dispatchEvent(new CustomEvent("caroline:conversion", { detail: eventData }));
    }

    function showCalFallback(calendar) {
        if (!calendar || calendar.dataset.fallbackShown === "true") return;

        calendar.dataset.fallbackShown = "true";
        calendar.setAttribute("aria-busy", "false");

        var message = document.createElement("p");
        var link = document.createElement("a");
        message.className = "cal-fallback";
        message.append("Não foi possível carregar a agenda aqui. ");
        link.href = CAL_PUBLIC_URL + window.location.search;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = "Abra a agenda em uma nova aba.";
        message.appendChild(link);
        calendar.replaceChildren(message);
    }

    function initializeCalEmbed(calendar) {
        if (!calendar || calendar.dataset.calInitialized === "true") return;

        calendar.dataset.calInitialized = "true";

        (function (C, A, L) {
            var push = function (api, args) { api.q.push(args); };
            var documentRef = C.document;

            C.Cal = C.Cal || function () {
                var cal = C.Cal;
                var args = arguments;

                if (!cal.loaded) {
                    cal.ns = {};
                    cal.q = cal.q || [];

                    var script = documentRef.createElement("script");
                    script.src = A;
                    script.async = true;
                    script.addEventListener("error", function () {
                        showCalFallback(calendar);
                    }, { once: true });
                    documentRef.head.appendChild(script);
                    cal.loaded = true;
                }

                if (args[0] === L) {
                    var api = function () { push(api, arguments); };
                    var namespace = args[1];
                    api.q = api.q || [];

                    if (typeof namespace === "string") {
                        cal.ns[namespace] = cal.ns[namespace] || api;
                        push(cal.ns[namespace], args);
                        push(cal, ["initNamespace", namespace]);
                    } else {
                        push(cal, args);
                    }
                    return;
                }

                push(cal, args);
            };
        })(window, CAL_EMBED_SCRIPT, "init");

        window.Cal("init", "agendamentos", { origin: "https://app.cal.com" });
        window.Cal.config = window.Cal.config || {};
        window.Cal.config.forwardQueryParams = true;
        window.Cal.ns.agendamentos("inline", {
            elementOrSelector: "#my-cal-inline-agendamentos",
            config: { layout: "month_view", useSlotsViewOnSmallScreen: true },
            calLink: "caroline-bispo/agendamentos"
        });
        window.Cal.ns.agendamentos("ui", {
            cssVarsPerTheme: { light: { "cal-brand": "#101a69" } },
            hideEventTypeDetails: true,
            layout: "month_view"
        });
        window.Cal.ns.agendamentos("on", {
            action: "bookingSuccessfulV2",
            callback: function (event) {
                var bookingData = event && event.detail ? event.detail.data : {};

                trackConversion("schedule_complete", {
                    click_location: "cal_embed",
                    destination: "caroline-bispo/agendamentos",
                    booking_status: bookingData.status || "created"
                });
                trackMetaEvent("Schedule", {
                    content_name: "analise_perfil_google"
                });
            }
        });

        var loadTimeout = window.setTimeout(function () {
            if (calendar.querySelector("iframe")) {
                calendar.setAttribute("aria-busy", "false");
            } else {
                showCalFallback(calendar);
            }
        }, 15000);

        if ("MutationObserver" in window) {
            var renderObserver = new MutationObserver(function () {
                if (!calendar.querySelector("iframe")) return;
                window.clearTimeout(loadTimeout);
                calendar.setAttribute("aria-busy", "false");
                renderObserver.disconnect();
            });
            renderObserver.observe(calendar, { childList: true, subtree: true });
        }
    }

    function setupCalEmbed() {
        var calendar = document.getElementById("my-cal-inline-agendamentos");
        if (!calendar) return;

        var initialize = function () { initializeCalEmbed(calendar); };

        if ("IntersectionObserver" in window) {
            var loadObserver = new IntersectionObserver(function (entries) {
                if (!entries.some(function (entry) { return entry.isIntersecting; })) return;
                loadObserver.disconnect();
                initialize();
            }, { rootMargin: "600px 0px" });
            loadObserver.observe(calendar);
        } else {
            window.addEventListener("load", initialize, { once: true });
        }
    }

    function fillCampaignFields(form) {
        var params = new URLSearchParams(window.location.search);
        var campaignFields = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];

        campaignFields.forEach(function (fieldName) {
            var input = form.elements[fieldName];
            if (!input) return;

            var storageKey = "caroline_" + fieldName;
            var value = params.get(fieldName);

            try {
                if (value) {
                    window.sessionStorage.setItem(storageKey, value);
                } else {
                    value = window.sessionStorage.getItem(storageKey) || "";
                }
            } catch (error) {
                value = value || "";
            }

            input.value = value || "";
        });

        if (form.elements.pagina) {
            form.elements.pagina.value = window.location.href;
        }
    }

    function setupLeadForm() {
        var form = document.getElementById("lead-form");
        var status = document.getElementById("form-status");
        if (!form || !status) return;

        fillCampaignFields(form);

        form.addEventListener("submit", function (event) {
            event.preventDefault();
            if (!form.reportValidity()) return;

            var submitButton = form.querySelector("button[type='submit']");
            var submitLabel = submitButton ? submitButton.querySelector("span") : null;
            var originalLabel = submitLabel ? submitLabel.textContent : "Solicitar Análise";

            status.className = "form-status";
            status.textContent = "";

            if (submitButton) submitButton.disabled = true;
            if (submitLabel) submitLabel.textContent = "Enviando...";

            fillCampaignFields(form);

            fetch(form.action, {
                method: "POST",
                body: new FormData(form),
                mode: "no-cors"
            }).then(function () {
                status.textContent = "A solicitação foi encaminhada, mas a integração atual não confirma o registro na planilha. Não reenvie agora; se precisar confirmar o recebimento, fale pelo WhatsApp.";
                status.className = "form-status is-visible is-warning";
            }).catch(function () {
                status.textContent = "Não foi possível enviar agora. Tente novamente ou fale pelo WhatsApp.";
                status.className = "form-status is-visible is-error";
            }).finally(function () {
                if (submitButton) submitButton.disabled = false;
                if (submitLabel) submitLabel.textContent = originalLabel;
            });
        });
    }

    function setupCookieConsent() {
        var banner = document.getElementById("cookie-banner");
        var acceptButton = document.getElementById("cookie-accept");
        var rejectButton = document.getElementById("cookie-reject");
        var preferencesButton = document.getElementById("cookie-preferences");
        if (!banner || !acceptButton || !rejectButton) return;

        var consent = getCookieConsent();
        if (consent === "accepted") {
            loadMetaPixel();
        } else if (!consent) {
            banner.hidden = false;
        }

        acceptButton.addEventListener("click", function () {
            setCookieConsent("accepted");
            banner.hidden = true;
            loadMetaPixel();
        });

        rejectButton.addEventListener("click", function () {
            setCookieConsent("rejected");
            banner.hidden = true;
            if (typeof window.fbq === "function") window.fbq("consent", "revoke");
        });

        if (preferencesButton) {
            preferencesButton.addEventListener("click", function () {
                banner.hidden = false;
                acceptButton.focus();
            });
        }
    }

    document.addEventListener("DOMContentLoaded", function () {
        var header = document.querySelector(".site-header");
        var year = document.getElementById("current-year");

        setupCookieConsent();
        setupLeadForm();
        setupCalEmbed();

        if (year) {
            year.textContent = String(new Date().getFullYear());
        }

        function updateHeader() {
            if (header) {
                header.classList.toggle("is-scrolled", window.scrollY > 18);
            }
        }

        updateHeader();
        window.addEventListener("scroll", updateHeader, { passive: true });

        document.querySelectorAll('a[href^="#"]').forEach(function (link) {
            link.addEventListener("click", function (event) {
                var selector = link.getAttribute("href");
                if (!selector || selector === "#") return;

                var target = document.querySelector(selector);
                if (!target) return;

                event.preventDefault();
                target.scrollIntoView({ behavior: "smooth", block: "start" });
                history.replaceState(null, "", selector);
            });
        });

        document.querySelectorAll("[data-track]").forEach(function (element) {
            element.addEventListener("click", function () {
                var eventName = element.dataset.track;
                var eventDetails = {
                    click_location: element.dataset.location || "unknown",
                    destination: element.getAttribute("href") || "inline_calendar",
                    link_text: element.textContent.trim()
                };

                trackConversion(eventName, eventDetails);

                if (eventName === "whatsapp_click") {
                    trackMetaEvent("Contact", { content_name: eventDetails.click_location });
                }
            });
        });

        var revealItems = document.querySelectorAll(".pain-card, .steps-list li, .form-benefits li, .faq-list details");
        var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        if ("IntersectionObserver" in window && !reduceMotion) {
            revealItems.forEach(function (item) { item.classList.add("reveal"); });

            var observer = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("is-visible");
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.12, rootMargin: "0px 0px -30px" });

            revealItems.forEach(function (item) { observer.observe(item); });
        }

        var calendar = document.getElementById("my-cal-inline-agendamentos");
        if (calendar && "IntersectionObserver" in window) {
            var calendarObserver = new IntersectionObserver(function (entries) {
                if (entries.some(function (entry) { return entry.isIntersecting; })) {
                    trackConversion("schedule_view", {
                        click_location: "cal_embed",
                        destination: "caroline-bispo/agendamentos"
                    });
                    calendarObserver.disconnect();
                }
            }, { threshold: 0.2 });

            calendarObserver.observe(calendar);
        }

    });
})();
