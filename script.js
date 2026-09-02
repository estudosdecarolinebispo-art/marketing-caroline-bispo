/**
 * Interações e eventos de conversão — Caroline Bispo.
 * Os links são identificados por data-track, sem depender do domínio da agenda.
 */

(function () {
    "use strict";

    var META_PIXEL_ID = "2429202777490521";
    var COOKIE_CONSENT_KEY = "caroline_meta_consent_v1";

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
                trackConversion("lead_submit", {
                    click_location: "lead_form",
                    destination: "google_sheets"
                });
                trackMetaEvent("Lead", { content_name: "analise_perfil_google" });

                form.reset();
                fillCampaignFields(form);
                status.textContent = "Recebemos suas informações! Caroline entrará em contato pelo WhatsApp.";
                status.className = "form-status is-visible is-success";
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

        if (window.Cal && window.Cal.ns && window.Cal.ns.agendamentos) {
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
        }
    });
})();
