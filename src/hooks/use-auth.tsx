
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { onAuthStateChanged, signOut as firebaseSignOut, GoogleAuthProvider, signInWithPopup, User, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase-config";

export interface UserProfile extends Record<string, any> {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  location?: string;
  language?: string;
  crops?: string;
}


interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await getUserProfile(currentUser);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getUserProfile = async (firebaseUser: User) => {
    const docRef = doc(db, "users", firebaseUser.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      setUserProfile(docSnap.data() as UserProfile);
    } else {
      // Create a profile if it doesn't exist
      const newUserProfile: UserProfile = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        location: 'Pune, Maharashtra', // Default value
        language: 'en', // Default value
        crops: '', // Default value
      };
      await setDoc(docRef, newUserProfile);
      setUserProfile(newUserProfile);
    }
  };


  const signInWithGoogle = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error during Google sign-in", error);
      setLoading(false);
      throw error;
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (error) {
      console.error("Error during email sign-in", error);
      setLoading(false);
      throw error; // Re-throw the error to be caught by the UI
    }
  };

  const signUpWithEmail = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const user = userCredential.user;
       // Create a profile for the new user
      const newUserProfile: UserProfile = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        location: 'Pune, Maharashtra',
        language: 'en',
        crops: '',
      };
      await setDoc(doc(db, "users", user.uid), newUserProfile);
      setUserProfile(newUserProfile);
    } catch (error) {
      console.error("Error during email sign-up", error);
      throw error; // Re-throw the error to be caught by the UI
    } finally {
        setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    await firebaseSignOut(auth);
    setUser(null);
    setUserProfile(null);
    setLoading(false);
  };
  
  const updateUserProfile = async (data: Partial<UserProfile>) => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
       throw new Error("No user is currently signed in.");
    }
    
    // Update Firebase Auth profile if displayName or photoURL are being changed
    const authUpdateData: { displayName?: string; photoURL?: string } = {};
    if (data.displayName && data.displayName !== currentUser.displayName) {
        authUpdateData.displayName = data.displayName;
    }
    if (data.photoURL && data.photoURL !== currentUser.photoURL) {
        authUpdateData.photoURL = data.photoURL;
    }

    if (Object.keys(authUpdateData).length > 0) {
        await updateProfile(currentUser, authUpdateData);
        // We need to update our local user state to reflect this change
        setUser(auth.currentUser); 
    }

    // Update Firestore document with all data
    const docRef = doc(db, "users", currentUser.uid);
    await setDoc(docRef, data, { merge: true });

    // Refresh the user profile from the database to ensure UI is in sync
    await getUserProfile(currentUser);
  };


  const value = { user, userProfile, loading, signInWithGoogle, signInWithEmail, signUpWithEmail, signOut, updateUserProfile };

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
