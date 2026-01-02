// src/hooks/useFirestoreCollection.ts
import { useEffect, useState, useCallback } from "react";
import {
    collection,
    addDoc,
    deleteDoc,
    doc,
    getDocs,
    updateDoc,
    DocumentData,
} from "firebase/firestore";
import { db } from "../firebase";

type WithId<T> = T & { id: string };

export const useFirestoreCollection = <T extends Record<string, any>>(path: string) => {
    const [data, setData] = useState<WithId<T>[]>([]);
    const [loading, setLoading] = useState(true);

    const reload = useCallback(async () => {
        setLoading(true);
        try {
            const snap = await getDocs(collection(db, path));

            // ✅ IMPORTANT: id має бути ПІСЛЯ ...data, щоб не перетирався полем data.id
            const items = snap.docs.map((d) => {
                const obj = d.data() as T;
                return { ...obj, id: d.id } as WithId<T>;
            });

            setData(items);
        } catch (e) {
            console.error(`[useFirestoreCollection] Failed to load "${path}"`, e);
            setData([]);
        } finally {
            setLoading(false);
        }
    }, [path]);

    useEffect(() => {
        reload();
    }, [reload]);

    const addItem = async (item: T) => {
        await addDoc(collection(db, path), item as DocumentData);
        await reload();
    };

    // ✅ не дозволяємо передати id всередині item, щоб випадково не записати data.id у документ
    const updateItem = async (id: string, item: Partial<Omit<T, "id">>) => {
        await updateDoc(doc(db, path, id), item as DocumentData);
        await reload();
    };

    const deleteItem = async (id: string) => {
        await deleteDoc(doc(db, path, id));
        await reload();
    };

    return { data, loading, addItem, updateItem, deleteItem, reload };
};
