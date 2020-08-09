import * as fb from 'firebase/app'
import 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyAnWgIUUHRXuUAf22wBE8bHZzGwYBo37nc',
  authDomain: 'mouse-makaron.firebaseapp.com',
  databaseURL: 'https://mouse-makaron.firebaseio.com',
  projectId: 'mouse-makaron',
  storageBucket: 'mouse-makaron.appspot.com',
  messagingSenderId: '987377493970',
  appId: '1:987377493970:web:201d92ced2d0240305ca0b'
}

fb.initializeApp(firebaseConfig)

export const db = fb.firestore()

export interface Curve {
  id: string
  size: number
}

export function dba<T>(collectionName: string) {
  const collection = db.collection(collectionName)

  function add(data: T) {
    return collection.add(data)
  }

  return {
    add
  }
}
