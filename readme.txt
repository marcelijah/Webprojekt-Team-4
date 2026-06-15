==========================================
 JustInCase - Webshop (Team 04)
==========================================

Ein Webshop fuer iPhone-Huellen.
Projektarbeit im Rahmen von Web Scripting / Webentwicklungsprojekt.

INSTALLATION (XAMPP)
------------------------------------------
1. Projektordner nach C:\xampp\htdocs\ kopieren.
2. In XAMPP Apache und MySQL starten.
3. Datenbank "webshop_team04" anlegen via phpMyAdmin.
4. Im Browser oeffnen: http://localhost/Webprojekt-Team-4/

LOGIN
------------------------------------------
- Admin:  Benutzer "admin",  Passwort "admin123"
- Kunde:  Benutzer "muster", Passwort "123"
          oder ueber die Registrierung selbst anlegen.

FRONTEND-BUILD (TypeScript)
------------------------------------------
Die TS-Dateien in res/ts/ werden nach res/js/ kompiliert:

   npm install
   npm run build      (einmalig)
   npm run watch      (laufendes Kompilieren)