/**
 * This file is orginally from https://github.com/Yash2412/sqlite-react
 */

import {  useState } from "react";

const worker = new Worker("/worker.js", { type: "module" });

const useSQLite = () => {
  const [isLoading, setIsLoading] = useState(false);

  const runQuery = (query: string) => {
    return new Promise((resolve, reject) => {
      const handleMessage = (e: MessageEvent) => {
        setIsLoading(e.data.type === "loading");
        if (e.data.type === "success") {
          worker.removeEventListener("message", handleMessage);
          resolve(e.data.payload);
        } else if (e.data.type === "error") {
          worker.removeEventListener("message", handleMessage);
          reject(e.data.payload);
        }
      }
      worker.addEventListener("message", handleMessage);
      worker.postMessage({ type: "runQuery", query });
    });
  };

  const saveFileInOPFS = async (file: File) => {
    const root = await navigator.storage.getDirectory();
    const fileHandle = await root.getFileHandle(file.name, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(file);
    await writable.close();
  };

  const updateDB = (db?: File) => {
    return new Promise<void>((resolve, reject) => {
      if (db) {
        setIsLoading(true);
        saveFileInOPFS(db)
          .then(() => {
            const handleMessage = (e: MessageEvent) => {
              setIsLoading(e.data.type === "loading");
              if (e.data.type === "success") {
                worker.removeEventListener("message", handleMessage);
                resolve(e.data.payload);
              } else if (e.data.type === "error") {
                worker.removeEventListener("message", handleMessage);
                reject(e.data.payload);
              }
            };
            worker.addEventListener("message", handleMessage);
            worker.postMessage({ type: "changeDB", dbName: db.name });
          })
          .catch((e) => {
            setIsLoading(false);
            reject(e);
          });
      }
    })
  };

  return {
    isLoading,
    runQuery,
    updateDB,
  };
};

export default useSQLite;
