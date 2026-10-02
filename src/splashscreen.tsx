import {useEffect,useState,type ReactNode} from 'react';

type Phase='show'|'hide'|'done';

export default function SplashScreen({children}:{children:ReactNode}){
  const [phase,setPhase]=useState<Phase>('show');
  useEffect(()=>{
    const t1=setTimeout(()=>setPhase('hide'),1800);   // start fade-out
    const t2=setTimeout(()=>setPhase('done'),2400);   // remove from DOM
    return()=>{clearTimeout(t1);clearTimeout(t2);};
  },[]);
  return <>
    {children}
    {phase!=='done'&&<div className={`splash ${phase==='hide'?'splash-hide':''}`} aria-hidden="true">
      <img className="splash-logo" src={`${import.meta.env.BASE_URL}logo.png`} alt=""/>
    </div>}
  </>;
}