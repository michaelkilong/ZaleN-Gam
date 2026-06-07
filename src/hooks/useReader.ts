'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { db } from '@/lib/firebase/client';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

export interface ReaderData {
  email: string;
  name: string;
  avatar?: string;
  followedCategories: string[];
  savedArticles: string[];
  notificationEnabled: boolean;
}

export function useReader() {
  const { user, loading: authLoading } = useAuth();
  const [readerData, setReaderData] = useState<ReaderData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReaderData() {
      if (!user) {
        setReaderData(null);
        setLoading(false);
        return;
      }

      try {
        const docRef = doc(db, 'readers', user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setReaderData(docSnap.data() as ReaderData);
        } else {
          // Create new reader profile
          const newReader: ReaderData = {
            email: user.email || '',
            name: user.displayName || 'Reader',
            avatar: user.photoURL || undefined,
            followedCategories: [],
            savedArticles: [],
            notificationEnabled: false,
          };
          await setDoc(docRef, newReader);
          setReaderData(newReader);
        }
      } catch (error) {
        console.error('Error fetching reader data:', error);
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading) {
      fetchReaderData();
    }
  }, [user, authLoading]);

  const toggleSaveArticle = async (slug: string) => {
    if (!user || !readerData) return;

    const saved = readerData.savedArticles.includes(slug);
    const newSaved = saved 
      ? readerData.savedArticles.filter(s => s !== slug)
      : [...readerData.savedArticles, slug];

    await updateDoc(doc(db, 'readers', user.uid), {
      savedArticles: newSaved,
    });

    setReaderData({ ...readerData, savedArticles: newSaved });
  };

  const toggleFollowCategory = async (slug: string) => {
    if (!user || !readerData) return;

    const followed = readerData.followedCategories.includes(slug);
    const newFollowed = followed
      ? readerData.followedCategories.filter(s => s !== slug)
      : [...readerData.followedCategories, slug];

    await updateDoc(doc(db, 'readers', user.uid), {
      followedCategories: newFollowed,
    });

    setReaderData({ ...readerData, followedCategories: newFollowed });
  };

  return { user, readerData, loading, toggleSaveArticle, toggleFollowCategory };
}
