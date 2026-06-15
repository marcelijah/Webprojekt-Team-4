//Gemeinsame Typdefinitionen für das Frontend.
//Kleine Hilfsfunktion (echter Laufzeit-Export).
//Dadurch ist der Import in login.ts auch zur Laufzeit sichtbar.
//und demonstriert den Modul-Mechanismus konkret.
export function istLeer(wert) {
    return wert.trim().length === 0;
}
