import React from 'react';
import {createRoot} from 'react-dom/client';
import App from './App';
import PhoneFrame from './PhoneFrame';
import './style.css';
import './phone-frame.css';
const isPhoneScreen=new URLSearchParams(window.location.search).get('screen')==='phone';
if(isPhoneScreen)document.documentElement.classList.add('phone-screen');
createRoot(document.getElementById('root')!).render(<React.StrictMode>{isPhoneScreen?<App/>:<PhoneFrame/>}</React.StrictMode>);
