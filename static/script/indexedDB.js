import { openDB } from 'idb';

const WORKSPACE_NAME = 'VanceAIStore'
// 创建或打开数据库
export const dbPromise = openDB('myDatabase', 1, {
  upgrade(db) {
    // 创建对象存储空间
    db.createObjectStore(WORKSPACE_NAME);
  },
});

// 存储数据
export async function storeData(key, value) {
  const db = await dbPromise;
  const tx = db.transaction(WORKSPACE_NAME, 'readwrite');
  const store = tx.objectStore(WORKSPACE_NAME);
  store.put(value, key);
  await tx.complete;
}

// 获取数据
export async function getData(key) {
  const db = await dbPromise;
  const tx = db.transaction(WORKSPACE_NAME, 'readonly');
  const store = tx.objectStore(WORKSPACE_NAME);
  return store.get(key);
}
