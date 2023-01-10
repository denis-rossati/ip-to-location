export type Issue = { timestamp: number, clientId: string, ip: string };
export type OutputMessage = Issue & {
    latitude: number | null,
    longitude: number | null,
    country: string | null,
    region: string | null,
    city: string | null,
} & { [key: string]: unknown };

export interface Observer {
    update(issue: Issue | OutputMessage): void
}

export interface Observable {
    _observers: Observer[];

    addObserver(...subjects: Observer[]): void;

    notifyObserver(issue: Issue): void;
}
