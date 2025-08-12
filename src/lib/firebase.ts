import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCrCPM_hLfCNReLVs_50YK9gD3yKHhqC4w",
  authDomain: "commontable7.firebaseapp.com",
  projectId: "commontable7",
  storageBucket: "commontable7.firebasestorage.app",
  messagingSenderId: "651576722033",
  appId: "1:651576722033:web:8aef0187e18ad8569091d0"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
