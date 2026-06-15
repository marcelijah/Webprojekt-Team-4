// Holt die Homepage-Medienpfade (Video, Hintergrundbild) aus der DB
// (Endpoint site_media.php) und setzt sie im Frontend dynamisch.
// Hardcodierte Pfade in HTML/CSS dienen nur als Fallback, falls die Abfrage scheitert.
$(document).ready(function () {
    apiCall('site_media.php', {}, function (success, data) {
        if (!success || !data) return;

        // Homepage-Hintergrundvideo (nur auf der Startseite vorhanden)
        if (data.home_video) {
            const $video = $('#home-bg-video');
            if ($video.length) {
                // Pfad relativ zur Startseite (Wurzel) – DB-Pfad bereits passend gespeichert
                $video.find('source').attr('src', data.home_video);
                // Video neu laden, damit der neue src greift
                $video[0].load();
            }
        }

        // Seiten-Hintergrundbild (auf allen Seiten mit body.site-bg)
        if (data.site_background && document.body.classList.contains('site-bg')) {
            // Auf Unterseiten ist der Pfad zur Wurzel "../../"
            const istUnterseite = window.location.pathname.indexOf('/res/sites/') !== -1;
            const prefix = istUnterseite ? '../../' : '';
            document.body.style.backgroundImage = "url('" + prefix + data.site_background + "')";
        }
    });
});
