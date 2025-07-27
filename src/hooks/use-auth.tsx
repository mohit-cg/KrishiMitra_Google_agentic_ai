
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { onAuthStateChanged, signOut as firebaseSignOut, GoogleAuthProvider, signInWithPopup, User, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, getDoc, setDoc, collection, onSnapshot, addDoc, updateDoc, deleteDoc, Timestamp, query, orderBy } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db, storage, allConfigured } from "@/lib/firebase-config";
import { SplashScreen } from "@/components/splash-screen";
import { toast } from "./use-toast";

export interface UserProfile extends Record<string, any> {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  location?: string;
  language?: string;
  crops?: string;
}

export interface Transaction {
    id: string;
    description: string;
    amount: number;
    type: 'income' | 'expense';
    category: string;
    date: Timestamp;
}

export interface TransactionData {
    description: string;
    amount: number;
    type: 'income' | 'expense';
    category: string;
    date: Date;
}


interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  transactions: Transaction[];
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  uploadProfileImage: (file: File) => Promise<void>;
  addTransaction: (data: TransactionData) => Promise<void>;
  updateTransaction: (id: string, data: Partial<TransactionData>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
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
  
   useEffect(() => {
    if (user) {
      const q = query(collection(db, "users", user.uid, "transactions"), orderBy("date", "desc"));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const txs: Transaction[] = [];
        querySnapshot.forEach((doc) => {
          txs.push({ id: doc.id, ...doc.data() } as Transaction);
        });
        setTransactions(txs);
      });
      return () => unsubscribe();
    }
  }, [user]);


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
    
    const authUpdateData: { displayName?: string; photoURL?: string } = {};
    if (data.displayName !== undefined && data.displayName !== currentUser.displayName) {
        authUpdateData.displayName = data.displayName;
    }
    if (data.photoURL !== undefined && data.photoURL !== currentUser.photoURL) {
        authUpdateData.photoURL = data.photoURL;
    }

    if (Object.keys(authUpdateData).length > 0) {
        await updateProfile(currentUser, authUpdateData);
    }

    const docRef = doc(db, "users", currentUser.uid);
    const currentProfileSnap = await getDoc(docRef);
    const existingProfile = currentProfileSnap.exists() ? currentProfileSnap.data() : {};
    
    await setDoc(docRef, { ...existingProfile, ...data }, { merge: true });

    const updatedUser = { ...auth.currentUser }; 
    setUser(updatedUser as User); 
    await getUserProfile(updatedUser as User);
  };

  const uploadProfileImage = async (file: File): Promise<void> => {
    if (!allConfigured) {
       toast({
        variant: "destructive",
        title: "Firebase Not Configured",
        description:
          "Image upload requires a configured Firebase project. Please set up your .env file.",
      });
      throw new Error("Firebase not configured");
    }

    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("No user is currently signed in.");
    }

    const filePath = `profile-images/${currentUser.uid}/${file.name}`;
    const storageRef = ref(storage, filePath);
    
    try {
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);
        await updateUserProfile({ photoURL: downloadURL });
    } catch(error: any) {
        console.error("Error uploading profile image:", error);
        if (error.code === 'storage/retry-limit-exceeded' || error.code === 'storage/unauthorized') {
             toast({
                variant: "destructive",
                title: "Storage Rules Error",
                description: "The upload failed due to storage security rules. Please go to the Firebase Console, navigate to Storage -> Rules, and ensure they allow authenticated users to write to their own 'profile-images' directory. Refer to the 'storage.rules' file in the project for the correct rules.",
             });
        } else {
            toast({
                variant: "destructive",
                title: "Upload Failed",
                description: "Could not upload profile image. Please try again later.",
            });
        }
        throw error;
    }
  };
  
  // Transaction Management
  const addTransaction = async (data: TransactionData) => {
    if (!user) throw new Error("User not authenticated");
    const txData = { ...data, date: Timestamp.fromDate(data.date) };
    await addDoc(collection(db, "users", user.uid, "transactions"), txData);
  };

  const updateTransaction = async (id: string, data: Partial<TransactionData>) => {
    if (!user) throw new Error("User not authenticated");
    const txRef = doc(db, "users", user.uid, "transactions", id);
    const txData = data.date ? { ...data, date: Timestamp.fromDate(data.date) } : data;
    await updateDoc(txRef, txData);
  };

  const deleteTransaction = async (id: string) => {
    if (!user) throw new Error("User not authenticated");
    await deleteDoc(doc(db, "users", user.uid, "transactions", id));
  };


  const value = { user, userProfile, transactions, loading, signInWithGoogle, signInWithEmail, signUpWithEmail, signOut, updateUserProfile, uploadProfileImage, addTransaction, updateTransaction, deleteTransaction };
  
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
