import React, { useState, useEffect, useCallback } from 'react';

export function useLocalStorage<T,>(
  key: string,
  initialValue: T | (() => T),
  userId: string | null
): [T, React.Dispatch<React.SetStateAction<T>>] {
  
  const getStorageKey = useCallback(() => (userId ? `${key}_${userId}` : null), [key, userId]);

  const [value, setValue] = useState<T>(() => {
    const storageKey = getStorageKey();
    if (!storageKey) {
      return typeof initialValue === 'function' ? (initialValue as () => T)() : initialValue;
    }

    try {
      const jsonValue = localStorage.getItem(storageKey);
      if (jsonValue != null) return JSON.parse(jsonValue);
    } catch (error) {
      console.error('Error reading from localStorage', error);
    }

    return typeof initialValue === 'function' ? (initialValue as () => T)() : initialValue;
  });

  useEffect(() => {
    const storageKey = getStorageKey();
    if (storageKey) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(value));
      } catch (error) {
        console.error('Error writing to localStorage', error);
      }
    }
  }, [getStorageKey, value]);

  return [value, setValue];
}