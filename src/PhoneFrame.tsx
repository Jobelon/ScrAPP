import {useEffect,useState} from 'react';
import {BatteryFull,Wifi} from 'lucide-react';

const phoneWidth=374;
const phoneHeight=790;
function fitPhone(){return Math.min(1,(window.innerHeight-64)/phoneHeight,(window.innerWidth-40)/phoneWidth)}

export default function PhoneFrame(){
  const [scale,setScale]=useState(fitPhone);
  useEffect(()=>{
    const resize=()=>setScale(fitPhone());
    window.addEventListener('resize',resize);
    return()=>window.removeEventListener('resize',resize);
  },[]);
  const screenUrl=new URL(window.location.href);
  screenUrl.searchParams.set('screen','phone');
  return <main className="prototype-stage" aria-label="ScrAPP mobile prototype">
    <div className="phone-space" style={{width:phoneWidth*scale,height:phoneHeight*scale}}>
      <div className="phone-frame" style={{transform:`scale(${scale})`}}>
        <div className="phone-side phone-side-silent"/>
        <div className="phone-side phone-side-volume"/>
        <div className="phone-side phone-side-power"/>
        <div className="phone-display">
          <div className="phone-status" aria-hidden="true">
            <span className="phone-clock">9:41</span>
            <span className="phone-camera"/>
            <div className="phone-indicators">
              <span className="phone-signal"><i/><i/><i/><i/></span>
              <Wifi size={14} strokeWidth={2.5}/>
              <BatteryFull size={20} strokeWidth={1.8}/>
            </div>
          </div>
          <iframe className="phone-app" title="ScrAPP interactive mobile app" src={screenUrl.toString()}/>
          <div className="phone-home" aria-hidden="true"><span/></div>
        </div>
      </div>
    </div>
  </main>;
}
