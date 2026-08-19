/**
 * Interações e eventos de conversão — Caroline Bispo.
 * Os links são identificados por data-track, sem depender do domínio da agenda.
 */

(function () {
    "use strict";

    function trackConversion(eventName, details) {
        var eventData = Object.assign({
            event: eventName,
            page_path: window.location.pathname
        }, details || {});

        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push(eventData);
        window.dispatchEvent(new CustomEvent("caroline:conversion", { detail: eventData }));
    }

    document.addEventListener("DOMContentLoaded", function () {
        var header = document.querySelector(".site-header");
        var year = document.getElementById("current-year");

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
                trackConversion(element.dataset.track, {
                    click_location: element.dataset.location || "unknown",
                    destination: element.getAttribute("href") || "inline_calendar",
                    link_text: element.textContent.trim()
                });
            });
        });

        var revealItems = document.querySelectorAll(".pain-card, .steps-list li, .faq-list details");
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
