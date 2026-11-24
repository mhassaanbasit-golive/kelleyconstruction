const memoryLocal = new Map();
const memorySession = new Map();

function hasStorage(type) {
  try {
    if (typeof window === 'undefined' || !window[type]) return false;
    const probe = '__wk_probe__';
    window[type].setItem(probe, '1');
    window[type].removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

export const safeStorage = {
  getItem(key) {
    try {
      if (hasStorage('localStorage')) {
        return window.localStorage.getItem(key);
      }
    } catch {}
    return memoryLocal.has(key) ? memoryLocal.get(key) : null;
  },
  setItem(key, value) {
    const str = String(value);
    memoryLocal.set(key, str);
    try {
      if (hasStorage('localStorage')) {
        window.localStorage.setItem(key, str);
      }
    } catch {}
  },
  removeItem(key) {
    memoryLocal.delete(key);
    try {
      if (hasStorage('localStorage')) {
        window.localStorage.removeItem(key);
      }
    } catch {}
  },
  getJson(key, fallback = null) {
    try {
      const raw = this.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  },
  setJson(key, value) {
    try {
      this.setItem(key, JSON.stringify(value));
    } catch {}
  },
};

export const safeSession = {
  getItem(key) {
    try {
      if (hasStorage('sessionStorage')) {
        return window.sessionStorage.getItem(key);
      }
    } catch {}
    return memorySession.has(key) ? memorySession.get(key) : null;
  },
  setItem(key, value) {
    const str = String(value);
    memorySession.set(key, str);
    try {
      if (hasStorage('sessionStorage')) {
        window.sessionStorage.setItem(key, str);
      }
    } catch {}
  },
  removeItem(key) {
    memorySession.delete(key);
    try {
      if (hasStorage('sessionStorage')) {
        window.sessionStorage.removeItem(key);
      }
    } catch {}
  },
  getJson(key, fallback = null) {
    try {
      const raw = this.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  },
  setJson(key, value) {
    try {
      this.setItem(key, JSON.stringify(value));
    } catch {}
  },
};
