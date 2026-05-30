type KvValue = any

const DB_NAME = 'tiesverse'
const STORE = 'kv'
const VERSION = 1

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE)
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function kvGet<T = KvValue>(key: string): Promise<T | null> {
  const db = await openDb()
  return new Promise<T | null>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly')
    const store = tx.objectStore(STORE)
    const req = store.get(key)
    req.onsuccess = () =>
      resolve(req.result === undefined ? null : (req.result as unknown as T))
    req.onerror = () => reject(req.error)
  }).finally(() => db.close())
}

export async function kvSet(key: string, value: KvValue): Promise<void> {
  const db = await openDb()
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
    tx.objectStore(STORE).put(value, key)
  }).finally(() => db.close())
}
