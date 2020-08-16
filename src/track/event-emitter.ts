type Listener = (...args: any[]) => void
interface IEvents {
  [event: string]: Listener[]
}

export class EventEmitter {
  private readonly events: IEvents = {}

  public addListener(event: string, listener: Listener) {
    this.events[event] = this.events[event] ?? []
    this.events[event].push(listener)
  }

  public removeAllListeners(event: string): void {
    this.events[event] = []
  }

  public emit(event: string, ...args: any[]): void {
    if (!Array.isArray(this.events[event])) {
      return
    }

    this.events[event].forEach((listener) => listener(...args))
  }
}
