/** Thrown when a ref/id doesn't exist. Screens show a "not found" state. */
export class NotFoundError extends Error {
  constructor(what: string) {
    super(`${what} not found`);
    this.name = "NotFoundError";
  }
}
