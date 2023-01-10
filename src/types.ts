export type Issue = { timestamp: number, clientId: string, ip: string };

export interface Observer {
    update(issue: Issue): void
}

export interface Observable {
    _observers: Observer[];

    addObserver(...subjects: Observer[]): void;

    notifyObserver(issue: Issue): void;
}
