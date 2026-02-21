type Listener = () => void;

interface InitState {
  initialized: boolean;
  userId: string | null;
}

let state: InitState = { initialized: false, userId: null };
const listeners = new Set<Listener>();

const notifyListeners = (): void => {
  listeners.forEach((listener) => listener());
};

export const initializationState = {
  subscribe: (listener: Listener): (() => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  getSnapshot: (): InitState => state,

  markInitialized: (userId: string | null): void => {
    state = { initialized: true, userId };
    notifyListeners();
  },

  markPending: (): void => {
    state = { initialized: false, userId: null };
    notifyListeners();
  },

  isInitializedForUser: (userId: string | null): boolean => {
    return state.initialized && state.userId === userId;
  },

  reset: (): void => {
    state = { initialized: false, userId: null };
    notifyListeners();
  },
};
