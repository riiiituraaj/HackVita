/** Tiny typed pub/sub used to connect decoupled effects (console, glitch cuts…). */
type Events = {
  /** A [data-section] element reached mid-screen. */
  section: string;
  /** Run the full-screen glitch cut. `onMid` fires when the screen is covered. */
  glitch: { onMid?: () => void } | undefined;
};

type AnyHandler = (payload: never) => void;
const handlers = new Map<keyof Events, Set<AnyHandler>>();

export function on<K extends keyof Events>(type: K, fn: (payload: Events[K]) => void) {
  let set = handlers.get(type);
  if (!set) {
    set = new Set();
    handlers.set(type, set);
  }
  set.add(fn as AnyHandler);
  return () => {
    set.delete(fn as AnyHandler);
  };
}

export function emit<K extends keyof Events>(type: K, payload: Events[K]) {
  handlers.get(type)?.forEach((fn) => (fn as (p: Events[K]) => void)(payload));
}
