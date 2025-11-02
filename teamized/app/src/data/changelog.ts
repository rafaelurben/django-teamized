import { DateString } from '../interfaces/common';

export interface ChangelogItem {
    date: DateString;
    version?: string;
    changes: string[];
    milestone?: boolean;
}

export const CHANGELOG: ChangelogItem[] = [
    {
        date: '2025-11-02',
        changes: [
            'NEU: Arbeitszeiten-Report als PDF',
            'Sicherheitsupdates & Bugfixes',
        ],
    },
    {
        date: '2025-07-16',
        changes: ['NEU: Anwesenheitsübersicht für Vereine [Beta]'],
    },
    {
        date: '2025-07-15',
        changes: [
            'WICHTIG: Teamized ist nun auf teamized.ch erreichbar. Aktualisiere deine Lesezeichen oder App-Verknüpfungen.',
            'Links in Beschreibungen sind nun klickbar',
        ],
    },
    {
        date: '2025-07-09',
        changes: [
            'Die zuletzt geöffnete Seite und das zuletzt ausgewählte Team werden nun gespeichert',
        ],
    },
    {
        date: '2024-12-24',
        changes: [
            '[Kalender] Ereignisse können nun zwischen Kalendern verschoben werden',
            'Technisch: Kleine Änderungen an Code-Struktur',
            'Technisch: Aktualisierung von Abhängigkeiten',
        ],
    },
    {
        date: '2024-11-10',
        changes: [
            'Formulare werden bei einem Fehler nun nicht mehr geschlossen',
            'Kalender Abonnier-Popup angepasst',
            'Technisch: Komplette Code-Struktur überarbeitet',
            'Technisch: Code von JavaScript zu TypeScript umgeschrieben',
            'Technisch: Qualitätschecks hinzugefügt',
            'Technisch: Abhängigkeiten aktualisiert',
        ],
        milestone: true,
    },
    {
        date: '2023-11-25',
        changes: [
            'Icon hinzugefügt',
            'Seitentitel werden nun detaillierter angezeigt',
        ],
    },
    {
        date: '2023-11-04',
        changes: ['[Verein] Portfolio zu Vereinsmitgliedern hinzugefügt.'],
    },
    {
        date: '2023-09-12',
        changes: ['Dark Mode verbessert'],
    },
    {
        date: '2023-07-21',
        changes: [
            'NEU: Vereinsmodus [BETA]',
            '[Verein] Mitglieder & Gruppen',
            'Änderungsprotokoll aktualisiert',
            'Diverse Fehlerbehebungen',
        ],
        milestone: true,
    },
    {
        date: '2023-07-20',
        changes: [
            'Änderungsprotokoll aktualisiert',
            'Diverse Fehlerbehebungen',
        ],
    },
    {
        date: '2022-12-06',
        changes: ['Beta-Status der To-do-Listen entfernt'],
    },
    {
        date: '2022-10-21',
        changes: ['Visuelle Fehlerbehebungen'],
    },
    {
        date: '2022-10-20',
        changes: [
            '[Kalender] Diverse Verbesserungen',
            '[To-do-Listen] Diverse Verbesserungen',
        ],
    },
    {
        date: '2022-10-18',
        changes: [
            '[To-do-Listen] Diverse Verbesserungen',
            'Diverse Fehlerbehebungen und Korrekturen',
        ],
    },
    {
        date: '2022-10-12',
        changes: [
            '[Kalender] Kacheln umsortiert',
            'Diverse Fehlerbehebungen & Verbesserungen',
        ],
    },
    {
        date: '2022-10-11',
        changes: ['Diverse Fehlerbehebungen'],
    },
    {
        date: '2022-10-10',
        changes: ['[Arbeitszeit] Verbesserungen im Dashboard'],
    },
    {
        date: '2022-10-09',
        changes: ['[Arbeitszeit] Statistik hinzugefügt'],
    },
    {
        date: '2022-09-15',
        changes: ['Einstellung für Erscheinungsbild hinzugefügt'],
    },
    {
        date: '2022-09-11',
        changes: ['NEU: To-Do-Listen [BETA]'],
        milestone: true,
    },
    {
        date: '2022-09-10',
        changes: [
            '[Kalender] Duplizieren-Knopf für Ereignisse hinzugefügt',
            'Startseite & In-App-Startseite hinzugefügt',
        ],
    },
    {
        date: '2022-09-05',
        changes: [
            '[Kalender] Besseres Abonnier-Erlebnis',
            'Kalender-Features sind nun aus der Beta',
        ],
    },
    {
        date: '2022-09-02',
        changes: ['Diverse Fehlerbehebungen'],
    },
    {
        date: '2022-07-30',
        changes: ['Geschwindigkeitsoptimierungen (Caching)'],
    },
    {
        date: '2022-07-29',
        changes: ['[Kalender] Ereignisse bearbeiten'],
    },
    {
        date: '2022-07-27',
        changes: ['[Arbeitszeit] Sitzungen verwalten/benennen'],
    },
    {
        date: '2022-07-25',
        changes: ['Diverse Fehlerbehebungen & Verbesserungen'],
    },
    {
        date: '2022-06-16',
        changes: ['Anpassungen am Code', 'Lade-Animation hinzugefügt'],
    },
    {
        date: '2022-06-15',
        changes: [
            '[Kalender] Ereignisse hinzufügen',
            'Debug-Modus aktualisiert',
        ],
    },
    {
        date: '2022-06-14',
        changes: ['NEU: Debug-Modus', '[Kalender] Code-Vorbereitungen'],
    },
    {
        date: '2022-06-12',
        changes: ['[Kalender] Ereignisliste hinzugefügt'],
    },
    {
        date: '2022-06-11',
        changes: ['[Kalender] Übersicht hinzugefügt'],
    },
    {
        date: '2022-06-10',
        changes: ['[Kalender] Vorbereitungen & Code-Optimierungen'],
    },
    {
        date: '2022-06-09',
        changes: ['NEU: Kalender [BETA]'],
        milestone: true,
    },
    {
        date: '2022-06-05',
        changes: ['NEU: Arbeitszeit [BETA]', 'NEU: Reload-Funktion'],
        milestone: true,
    },
    {
        date: '2022-05-22',
        changes: ['Startseite hinzugefügt'],
    },
    {
        date: '2022-05-21',
        changes: ['Seitenleiste hinzugefügt'],
    },
    {
        date: '2022-05-13',
        changes: ['API-Änderungen'],
    },
    {
        date: '2022-05-07',
        changes: ['NEU: Dashboard-Design'],
    },
    {
        date: '2022-05-05',
        changes: ['NEU: Einladungen'],
    },
    {
        date: '2022-03-24',
        changes: ['React-Framework hinzugefügt'],
    },
    {
        date: '2021-12-25',
        changes: ['Start der Entwicklung'],
        milestone: true,
    },
];
