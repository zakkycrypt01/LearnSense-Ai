'use client';

import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, deleteDoc, collection, getDocs, query } from 'firebase/firestore';
import type { AIResult } from '@/app/study/page';

export type DocumentHistory = {
    id: string;
    history: AIResult[];
}

const getHistoryRef = (userId: string, documentName: string) => {
    // Firestore does not allow forward slashes in document IDs.
    const sanitizedDocumentName = documentName.replace(/\//g, '_');
    return doc(db, 'userHistory', userId, 'documents', sanitizedDocumentName);
}

export const saveHistory = async (userId: string, documentName: string, history: AIResult[]) => {
    if (!userId) return;
    try {
        const historyRef = getHistoryRef(userId, documentName);
        await setDoc(historyRef, { history });
    } catch (error) {
        console.error("Error saving history to Firestore: ", error);
        // Optionally re-throw or handle error for the UI
        throw new Error("Failed to save history.");
    }
};

export const getHistory = async (userId: string, documentName: string): Promise<AIResult[]> => {
    if (!userId) return [];
    try {
        const historyRef = getHistoryRef(userId, documentName);
        const docSnap = await getDoc(historyRef);

        if (docSnap.exists()) {
            // Make sure to handle potential empty history array
            const data = docSnap.data();
            return (data.history || []) as AIResult[];
        } else {
            return [];
        }
    } catch (error: any) {
        console.error("Error fetching history from Firestore: ", error);
        throw new Error(error.message || "Failed to fetch history.");
    }
};

export const getAllHistory = async (userId: string): Promise<DocumentHistory[]> => {
    if (!userId) return [];
    try {
        const documentsCollectionRef = collection(db, 'userHistory', userId, 'documents');
        const q = query(documentsCollectionRef);
        const querySnapshot = await getDocs(q);
        
        const allHistory: DocumentHistory[] = [];
        querySnapshot.forEach((doc) => {
            allHistory.push({
                id: doc.id.replace(/_/g, '/'), // Un-sanitize the document name
                history: (doc.data().history || []) as AIResult[],
            });
        });
        
        return allHistory;

    } catch (error: any) {
        console.error("Error fetching all history from Firestore: ", error);
        throw new Error(error.message || "Failed to fetch all history.");
    }
};


export const clearHistory = async (userId: string, documentName: string) => {
    if (!userId) return;
    try {
        const historyRef = getHistoryRef(userId, documentName);
        await deleteDoc(historyRef);
    } catch (error: any) {
        console.error("Error clearing history from Firestore: ", error);
        throw new Error(error.message || "Failed to clear history.");
    }
};
