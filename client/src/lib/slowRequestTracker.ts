// Tracks whether any in-flight API request has been pending longer than
// SLOW_THRESHOLD_MS. Backed by the free-tier host's cold start (the container
// spins up from a full stop), which can leave the very first request of a
// session hanging for a while -- without this, that looks indistinguishable
// from the app being broken. Deliberately request-shaped, not
// dashboard-shaped: it wraps the two shared fetch helpers in api.ts, so it
// covers every call the app makes (login included, since a cold start is
// just as likely to hit the very first request of a session as any other).
const SLOW_THRESHOLD_MS = 4500;

let slowCount = 0;
const listeners = new Set<() => void>();

function setSlowCount(next: number) {
  slowCount = next;
  listeners.forEach((listener) => listener());
}

export function subscribeSlowRequest(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getIsServerSlow(): boolean {
  return slowCount > 0;
}

export function trackRequest<T>(promise: Promise<T>): Promise<T> {
  let firedSlow = false;
  const timer = setTimeout(() => {
    firedSlow = true;
    setSlowCount(slowCount + 1);
  }, SLOW_THRESHOLD_MS);

  const clear = () => {
    clearTimeout(timer);
    if (firedSlow) {
      firedSlow = false;
      setSlowCount(Math.max(0, slowCount - 1));
    }
  };

  promise.then(clear, clear);
  return promise;
}
