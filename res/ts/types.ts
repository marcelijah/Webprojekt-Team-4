//Gemeinsame Typdefinitionen für das Frontend.

//Interface: Aufbau eines Produkts (entspricht der DB-Tabelle 'products')
export interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    category: string;
    image_path: string;
    stock: number;
}

//Interface: eine Position im Warenkorb
export interface CartItem {
    produkt_id: number;
    menge: number;
}

//Interface: die Eingabedaten des Login-Formulars
export interface LoginDaten {
    login: string;
    password: string;
    remember: boolean;
}

//Interface: die einheitliche Antwortstruktur des Backends
export interface ApiResponse {
    success: boolean;
    data: any;
    message: string;
}

//Union-/Literal-Type: die einzig erlaubten Zahlungsarten (Folie: Union Types)
export type Zahlungsart = 'kreditkarte' | 'paypal' | 'rechnung' | 'vorkasse';

//Kleine Hilfsfunktion (echter Laufzeit-Export).
//Dadurch ist der Import in login.ts auch zur Laufzeit sichtbar
//und demonstriert den Modul-Mechanismus konkret.
export function istLeer(wert: string): boolean {
    return wert.trim().length === 0;
}
