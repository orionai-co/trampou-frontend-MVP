import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class VideoStorageService {
  private readonly dbName = 'trampou_media_db';
  private readonly dbVersion = 1;
  private readonly storeName = 'trampou_videos';
  private readonly memoryCache = new Map<string, Blob>();
  private readonly activeObjectUrls = new Map<string, string>();

  private dbPromise: Promise<IDBDatabase | null> | null = null;

  private getDB(): Promise<IDBDatabase | null> {
    if (this.dbPromise) {
      return this.dbPromise;
    }

    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      this.dbPromise = Promise.resolve(null);
      return this.dbPromise;
    }

    this.dbPromise = new Promise((resolve) => {
      try {
        const request = window.indexedDB.open(this.dbName, this.dbVersion);

        request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains(this.storeName)) {
            db.createObjectStore(this.storeName);
          }
        };

        request.onsuccess = () => {
          resolve(request.result);
        };

        request.onerror = () => {
          resolve(null);
        };
      } catch {
        resolve(null);
      }
    });

    return this.dbPromise;
  }

  /**
   * Salva um arquivo de vídeo (Blob ou File) no IndexedDB e retorna uma Blob URL ativa
   */
  async saveVideo(key: string, file: Blob | File): Promise<string> {
    this.memoryCache.set(key, file);

    const db = await this.getDB();
    if (db) {
      await new Promise<void>((resolve) => {
        try {
          const tx = db.transaction(this.storeName, 'readwrite');
          const store = tx.objectStore(this.storeName);
          const req = store.put(file, key);
          req.onsuccess = () => resolve();
          req.onerror = () => resolve();
        } catch {
          resolve();
        }
      });
    }

    // Revoga URL anterior se houver
    const oldUrl = this.activeObjectUrls.get(key);
    if (oldUrl && typeof URL !== 'undefined' && URL.revokeObjectURL) {
      try {
        URL.revokeObjectURL(oldUrl);
      } catch {}
    }

    let url = '';
    if (typeof URL !== 'undefined' && URL.createObjectURL) {
      url = URL.createObjectURL(file);
      this.activeObjectUrls.set(key, url);
    }

    return url;
  }

  /**
   * Recupera o Blob armazenado no IndexedDB ou na memória
   */
  async getVideoBlob(key: string): Promise<Blob | null> {
    if (this.memoryCache.has(key)) {
      return this.memoryCache.get(key)!;
    }

    const db = await this.getDB();
    if (!db) {
      return null;
    }

    return new Promise<Blob | null>((resolve) => {
      try {
        const tx = db.transaction(this.storeName, 'readonly');
        const store = tx.objectStore(this.storeName);
        const req = store.get(key);
        req.onsuccess = () => {
          const result = req.result;
          if (result instanceof Blob) {
            this.memoryCache.set(key, result);
            resolve(result);
          } else {
            resolve(null);
          }
        };
        req.onerror = () => resolve(null);
      } catch {
        resolve(null);
      }
    });
  }

  /**
   * Obtém ou recria uma Blob URL ativa e válida para reprodução imediata no elemento <video>
   */
  async getVideoUrl(key: string): Promise<string | null> {
    const existing = this.activeObjectUrls.get(key);
    if (existing) {
      return existing;
    }

    const blob = await this.getVideoBlob(key);
    if (blob && typeof URL !== 'undefined' && URL.createObjectURL) {
      const url = URL.createObjectURL(blob);
      this.activeObjectUrls.set(key, url);
      return url;
    }

    return null;
  }

  /**
   * Remove o vídeo do IndexedDB e revoga a Object URL
   */
  async deleteVideo(key: string): Promise<void> {
    this.memoryCache.delete(key);
    const oldUrl = this.activeObjectUrls.get(key);
    if (oldUrl && typeof URL !== 'undefined' && URL.revokeObjectURL) {
      try {
        URL.revokeObjectURL(oldUrl);
      } catch {}
    }
    this.activeObjectUrls.delete(key);

    const db = await this.getDB();
    if (!db) return;

    await new Promise<void>((resolve) => {
      try {
        const tx = db.transaction(this.storeName, 'readwrite');
        const store = tx.objectStore(this.storeName);
        const req = store.delete(key);
        req.onsuccess = () => resolve();
        req.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  }
}
