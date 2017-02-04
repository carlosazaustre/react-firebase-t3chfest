import React from 'react';
import ReactDOM from 'react-dom';
import firebase from 'firebase';

import App from './App';
import './index.css';

firebase.initializeApp({
  apiKey: "AIzaSyA2r-MouLjwaR7KUyMRi8K5OCED1bE7BAw",
  authDomain: "t3chfest-b3577.firebaseapp.com",
  databaseURL: "https://t3chfest-b3577.firebaseio.com",
  storageBucket: "t3chfest-b3577.appspot.com",
  messagingSenderId: "714780734095"
});

ReactDOM.render(
  <App />,
  document.getElementById('root')
);
