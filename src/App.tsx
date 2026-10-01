import {useEffect, useState, useRef, type FormEvent} from 'react';
import {
  ArrowLeft, ArrowRight, Bell, Check, CheckCircle2, ChevronRight, Heart,
  MapPin, MessageCircle, Package, Plus, Search, Send, ShoppingBag,
  SlidersHorizontal, Star, Trash2, Truck, UserRound, X, Recycle,
  LogOut, Pencil, Home, Hammer, HardHat, Phone, ShieldCheck, Flame, Wrench
} from 'lucide-react';

type Role='Student'|'Company'|'Homeowner';
type Account={name:string;email:string;role:Role;location:string;company:string;photo?:string};
type Listing={
  id:string;
  name:string;
  category:string;
  price:number;
  unit:string;
  quantity:number;
  image:string;
  seller:string;
  location:string;
  description:string;
  condition:string;
  owner:boolean;
  sold:boolean;
  specs?:string[];
};
type Order={id:string;item:Listing;quantity:number;total:number;fulfillment:string;payment:string;status:string;address:string;rating?:number;review?:string};
type Message={text:string;mine:boolean;time:string};
type Conversation={id:string;item:Listing;messages:Message[]};

const categories=['All','PVC & Pipes','Metal & Steel','Wood & Lumber','Concrete & Cement','Roofing','Electrical','Paints & Finishes','Hardware'];

const constructionEmojis:Record<string,string>={
  'PVC & Pipes':'🔧','Metal & Steel':'⚙️','Wood & Lumber':'🪵','Concrete & Cement':'🧱',
  'Roofing':'🏠','Electrical':'⚡','Paints & Finishes':'🎨','Hardware':'🔩','Other':'📦'
};

const initialListings:Listing[]=[
  {
    "id": "demo-pvc",
    "name": "PVC Pipes",
    "category": "PVC & Pipes",
    "price": 150,
    "unit": "set",
    "quantity": 8,
    "image": "/items/pvc.png",
    "seller": "Apex Plumbing & Hardware",
    "location": "Cebu City",
    "description": "White PVC pipes for plumbing and drainage projects. Sold as a set. Contact the seller to confirm pipe diameter, length, and available quantities.",
    "condition": "Brand New",
    "owner": false,
    "sold": false,
    "specs": [
      "White PVC",
      "Plumbing & drainage",
      "Sold per set"
    ]
  },
  {
    "id": "demo-grinder-blade",
    "name": "Grinder Blade",
    "category": "Hardware",
    "price": 250,
    "unit": "piece",
    "quantity": 15,
    "image": "/items/grinder-blade.png",
    "seller": "Apex Plumbing & Hardware",
    "location": "Cebu City",
    "description": "Segmented diamond cutting blade for an angle grinder. Contact the seller to confirm blade diameter, arbor size, and tool compatibility before ordering.",
    "condition": "Brand New",
    "owner": false,
    "sold": false,
    "specs": [
      "Segmented cutting edge",
      "Diamond blade",
      "Sold per piece"
    ]
  },
  {
    "id": "demo-rebar",
    "name": "Steel Rebar",
    "category": "Metal & Steel",
    "price": 185,
    "unit": "piece",
    "quantity": 120,
    "image": "/items/rebar.png",
    "seller": "Mandaue Steel & Metal Depot",
    "location": "Mandaue City",
    "description": "Deformed steel reinforcing bars for construction projects. Sold per piece. Confirm bar diameter, length, and grade with the seller for your project requirements.",
    "condition": "Brand New",
    "owner": false,
    "sold": false,
    "specs": [
      "Deformed steel bars",
      "Construction reinforcement",
      "Sold per piece"
    ]
  },
  {
    "id": "demo-door-knobs",
    "name": "Door Knobs",
    "category": "Hardware",
    "price": 350,
    "unit": "set",
    "quantity": 12,
    "image": "/items/door-knob.png",
    "seller": "Cebu Home Hardware",
    "location": "Cebu City",
    "description": "Round door knobs with a brushed silver finish. Contact the seller to confirm lock type, included fittings, and compatibility with your door.",
    "condition": "Brand New",
    "owner": false,
    "sold": false,
    "specs": [
      "Round knob design",
      "Brushed silver finish",
      "Sold per set"
    ]
  },
  {
    "id": "demo-wood",
    "name": "Wood Planks",
    "category": "Wood & Lumber",
    "price": 920,
    "unit": "bundle",
    "quantity": 18,
    "image": "/items/wood.png",
    "seller": "Cebu Lumber & Plywood Supply",
    "location": "Cebu City",
    "description": "Stacked wood planks for woodworking, furniture, and building projects. Sold by the bundle. Ask the seller for timber species, dimensions, and the number of planks included.",
    "condition": "Good · Surplus",
    "owner": false,
    "sold": false,
    "specs": [
      "Solid wood planks",
      "Woodworking & building",
      "Sold per bundle"
    ]
  },
  {
    "id": "demo-cement",
    "name": "Cement",
    "category": "Concrete & Cement",
    "price": 255,
    "unit": "bag",
    "quantity": 150,
    "image": "/items/cement.png",
    "seller": "Visayas Building Depot",
    "location": "Lapu-Lapu City",
    "description": "Bagged cement for concrete, masonry, and plastering projects. Contact the seller to confirm cement type, bag weight, and batch availability.",
    "condition": "Brand New",
    "owner": false,
    "sold": false,
    "specs": [
      "Bagged cement",
      "Concrete & masonry",
      "Sold per bag"
    ]
  }
];

function saved<T>(key:string,fallback:T):T{
  try{return JSON.parse(localStorage.getItem(key)||'null')??fallback}catch{return fallback}
}
function useStored<T>(key:string,fallback:T,initialize?:(current:T)=>T){
  const [value,setValue]=useState<T>(()=>{
    const current=saved(key,fallback);
    return initialize?initialize(current):current;
  });
  useEffect(()=>{try{localStorage.setItem(key,JSON.stringify(value))}catch{}},[key,value]);
  return [value,setValue] as const;
}
function upgradeCatalog(current:Listing[]):Listing[]{
  const version='supplied-materials-v1';
  try{
    if(localStorage.getItem('scrapp-catalog-version')===version)return current;
  }catch{}
  // Replace demo inventory once while retaining listings created by the user.
  const updated=[...initialListings,...current.filter(item=>item.owner)];
  try{
    localStorage.setItem('scrapp-listings',JSON.stringify(updated));
    localStorage.setItem('scrapp-catalog-version',version);
  }catch{}
  return updated;
}
const money=(value:number)=>new Intl.NumberFormat('en-PH',{style:'currency',currency:'PHP',minimumFractionDigits:0,maximumFractionDigits:0}).format(value);
const time=()=>new Date().toLocaleTimeString('en-PH',{hour:'2-digit',minute:'2-digit'});

export default function App(){
  const [account,setAccount]=useStored<Account|null>('scrapp-account',null);
  const [listings,setListings]=useStored<Listing[]>('scrapp-listings',initialListings,upgradeCatalog);
  const [favorites,setFavorites]=useStored<string[]>('scrapp-favorites',[]);
  const [orders,setOrders]=useStored<Order[]>('scrapp-orders',[]);
  const [conversations,setConversations]=useStored<Conversation[]>('scrapp-chats',[]);
  const [notifications,setNotifications]=useStored<string[]>('scrapp-notifications',['Welcome to ScrAPP! Find quality construction materials.']);
  const [tab,setTab]=useState('Explore');
  const [query,setQuery]=useState('');
  const [category,setCategory]=useState('All');
  const [location,setLocation]=useState('All locations');
  const [onlySaved,setOnlySaved]=useState(false);
  const [modal,setModal]=useState<string|null>(null);
  const [selected,setSelected]=useState<Listing|null>(null);
  const [activeChat,setActiveChat]=useState<string|null>(null);
  const [draft,setDraft]=useState('');
  const [toast,setToast]=useState('');
  const [editing,setEditing]=useState<Listing|null>(null);
  const [pendingListing,setPendingListing]=useState<Listing|null>(null);
  const [uploadPreview,setUploadPreview]=useState('');
  const [profilePhoto,setProfilePhoto]=useState('');
  const [authMode,setAuthMode]=useState('welcome');
  const [role,setRole]=useState<Role>('Homeowner');
  const [authError,setAuthError]=useState('');
  const [pending,setPending]=useState<Account|null>(null);
  const [quantity,setQuantity]=useState(1);
  const [fulfillment,setFulfillment]=useState('Pickup');
  const [payment,setPayment]=useState('Cash on pickup');
  const [address,setAddress]=useState('');
  const [checkoutError,setCheckoutError]=useState('');
  const [lastOrder,setLastOrder]=useState<Order|null>(null);
  const msgEndRef=useRef<HTMLDivElement>(null);

  const canSell=account?.role!=='Student';
  const canBuy=account?.role!=='Company';
  const visibleOrders=orders.filter(o=>canBuy||o.item.owner);

  useEffect(()=>{if(!toast)return;const timer=setTimeout(()=>setToast(''),3500);return()=>clearTimeout(timer)},[toast]);
  useEffect(()=>{
    const mainEl=document.getElementById('mobile-scroll-container');
    if(mainEl) mainEl.scrollTo({top:0,behavior:'instant'});
  },[tab]);
  useEffect(()=>{if(!modal)return;const onKey=(e:KeyboardEvent)=>{if(e.key==='Escape')setModal(null)};document.addEventListener('keydown',onKey);return()=>document.removeEventListener('keydown',onKey)},[modal]);
  useEffect(()=>{msgEndRef.current?.scrollIntoView({behavior:'smooth'})},[conversations,activeChat]);

  const notify=(text:string)=>{setNotifications(n=>[text,...n]);setToast(text)};
  const toggleSave=(id:string)=>setFavorites(f=>f.includes(id)?f.filter(x=>x!==id):[...f,id]);
  const openItem=(item:Listing)=>{setSelected(item);setModal('details')};
  const startChat=(item:Listing)=>{
    if(!conversations.some(c=>c.id===item.id)){
      setConversations(c=>[...c,{
        id:item.id,
        item,
        messages:[{text:`Hi! Is this ${item.name} still available at your ${item.location} warehouse?`,mine:true,time:time()},{text:`Hello! Yes, we have ${item.quantity} ${item.unit}s ready for pickup or delivery.`,mine:false,time:time()}]
      }]);
    }
    setActiveChat(item.id);setTab('Messages');setModal(null);
  };
  const sendMessage=(text:string)=>{
    if(!text.trim()||!activeChat)return;
    const id=activeChat;
    setConversations(c=>c.map(chat=>chat.id===id?{...chat,messages:[...chat.messages,{text:text.trim(),mine:true,time:time()},{text:'Thanks for your message! We can reserve these materials for you.',mine:false,time:time()}]}:chat));
    setDraft('');
    notify('New reply in your conversation');
  };

  function authenticate(e:FormEvent<HTMLFormElement>){
    e.preventDefault();setAuthError('');
    const d=new FormData(e.currentTarget);
    const email=String(d.get('email')||'').trim().toLowerCase();
    const password=String(d.get('password')||'');
    if(authMode==='reset'){setAuthError('Demo reset link prepared. No email is sent in this prototype.');return}
    if(password.length<8){setAuthError('Use at least 8 characters for your password.');return}
    if(authMode==='login'){const users=saved<Account[]>('scrapp-users',[]);const user=users.find(u=>u.email===email);if(!user){setAuthError('No demo account found. Create an account or use Quick Demo.');return}setAccount(user);return}
    if(password!==d.get('confirm')){setAuthError('Your passwords do not match.');return}
    if(role==='Student'&&!/(@student\.example\.edu|\.edu(\.[a-z]{2})?)$/.test(email)){setAuthError('Use an institutional .edu email for this demo.');return}
    if(role==='Company'&&/@(gmail|yahoo|outlook|hotmail)\./.test(email)){setAuthError('Please use a company domain email address.');return}
    if(role==='Homeowner'&&!email.endsWith('@gmail.com')){setAuthError('Use a Gmail address for your homeowner demo account.');return}
    setPending({name:String(d.get('name')),email,role,location:String(d.get('location')),company:String(d.get('company')||'')});setAuthMode('verify');
  }

  function finishRegistration(){if(!pending)return;const users=saved<Account[]>('scrapp-users',[]);localStorage.setItem('scrapp-users',JSON.stringify([...users.filter(u=>u.email!==pending.email),pending]));setAccount(pending);notify('Welcome to ScrAPP Construction Marketplace!')}
  const demo=(chosen:Role=role)=>{setAccount({name:'Alex Rivera',email:'alex@gmail.com',role:chosen,location:'Cebu City',company:chosen==='Company'?'Rivera Construction Supply':''});setTab('Explore')};

  async function listItem(e:FormEvent<HTMLFormElement>){
    e.preventDefault();const form=e.currentTarget;const d=new FormData(form);
    const file=d.get('image') as File;
    let image=editing?.image||'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80';
    if(file?.size){
      if(file.size>2*1024*1024){setToast('Please select a photo under 2 MB.');return}
      image=await new Promise<string>(resolve=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.readAsDataURL(file)})
    }
    const item:Listing={
      id:editing?.id||crypto.randomUUID(),
      name:String(d.get('name')),
      category:String(d.get('category')),
      price:Number(d.get('price')),
      quantity:Number(d.get('quantity')),
      unit:String(d.get('unit')),
      image,
      seller:account!.company||account!.name,
      location:String(d.get('location')),
      description:String(d.get('description')),
      condition:String(d.get('condition')),
      owner:true,
      sold:false,
      specs:['Certified Grade Material','Ready for Site Dispatch']
    };
    setPendingListing(item);setModal('listingPreview');
  }

  function placeOrder(){
    if(!selected)return;
    if(fulfillment==='Delivery'&&!address.trim()){setCheckoutError('Enter your delivery address or job site location.');return}
    const current=listings.find(l=>l.id===selected.id);
    if(!current||current.sold||current.quantity<quantity){setCheckoutError('This quantity is no longer available.');return}
    const order:Order={
      id:'SCR-'+Date.now().toString().slice(-6),
      item:selected,
      quantity,
      total:selected.price*quantity+(fulfillment==='Delivery'?250:0),
      fulfillment,
      payment,
      status:'Placed',
      address:fulfillment==='Delivery'?address:selected.location
    };
    setOrders(o=>[order,...o]);
    setListings(l=>l.map(x=>x.id===selected.id?{...x,quantity:x.quantity-quantity,sold:x.quantity-quantity===0}:x));
    setLastOrder(order);setModal('success');notify(`Order ${order.id} placed successfully!`);
  }

  const close=()=>{setModal(null);setCheckoutError('')};
  const filtered=listings.filter(l=>!l.sold&&(category==='All'||l.category===category)&&(location==='All locations'||l.location===location)&&(!onlySaved||favorites.includes(l.id))&&`${l.name} ${l.seller} ${l.category} ${l.description}`.toLowerCase().includes(query.toLowerCase()));
  const chat=conversations.find(c=>c.id===activeChat);

  return (
    <div className="device-canvas">
      {/* REALISTIC MOBILE DEVICE FRAME */}
      <div className="phone-chassis">
        {/* Hardware buttons on chassis */}
        <div className="btn-silent-switch"/>
        <div className="btn-vol-up"/>
        <div className="btn-vol-down"/>
        <div className="btn-power"/>

        <div className="phone-screen">
          {/* APP SCROLLABLE CONTENT */}
          <div id="mobile-scroll-container" className="screen-viewport">
            {!account ? (
              /* AUTH SCREEN */
              <div className="auth-screen">
                <div className="auth-hero-banner">
                  <div className="auth-brand">
                    <img src="/logo.png" alt="ScrAPP" className="auth-logo-img"/>
                    <span>Scr<b>APP</b></span>
                  </div>
                  <span className="auth-tagline-badge">CONSTRUCTION MATERIALS MARKETPLACE</span>
                  <h1>Don't Waste it.<br/>Post it.</h1>
                  <p className="auth-desc">Find surplus steel, PVC, lumber, concrete & hardware from trusted suppliers in your city.</p>
                </div>

                <div className="auth-body">
                  {authMode==='welcome'?<>
                    <button className="btn-primary btn-full" onClick={()=>setAuthMode('register')}>
                      Create an account <ArrowRight size={18}/>
                    </button>
                    <button className="btn-secondary btn-full" onClick={()=>setAuthMode('login')}>
                      Log in to account
                    </button>

                    <div className="auth-divider"><span>OR QUICK DEMO</span></div>

                    <p className="label-caption">Select demo account role:</p>
                    <div className="role-row">
                      {(['Student','Company','Homeowner'] as Role[]).map(r=>
                        <button className={'role-chip'+(role===r?' active':'')} key={r} onClick={()=>setRole(r)}>
                          {r==='Student'?'🎓':r==='Company'?'🏢':'🏠'} {r}
                        </button>
                      )}
                    </div>
                    <button className="btn-demo-action btn-full" onClick={()=>demo()}>
                      Explore Demo as {role} <ArrowRight size={16}/>
                    </button>
                  </>:

                  authMode==='verify'?<>
                    <div className="verify-view">
                      <CheckCircle2 size={56} className="text-primary"/>
                      <h2>Verify your email</h2>
                      <p className="subtitle">Verification sent to <b>{pending?.email}</b></p>
                      <div className="info-box">Email verification is simulated for this prototype.</div>
                      <button className="btn-primary btn-full" onClick={finishRegistration}>Complete Verification</button>
                    </div>
                  </>:

                  <>
                    <button className="btn-back" onClick={()=>{setAuthMode('welcome');setAuthError('')}}>
                      <ArrowLeft size={18}/> Back
                    </button>
                    <h2 className="auth-title">{authMode==='register'?'Create Account':authMode==='reset'?'Reset Password':'Welcome Back'}</h2>
                    <p className="subtitle">{authMode==='register'?'Connect with contractors and material suppliers.':'Sign in with your saved demo account.'}</p>
                    <form onSubmit={authenticate} className="auth-form">
                      {authMode==='register'&&<>
                        <div className="role-row">
                          {(['Student','Company','Homeowner'] as Role[]).map(r=>
                            <button type="button" className={'role-chip'+(role===r?' active':'')} key={r} onClick={()=>setRole(r)}>
                              {r==='Student'?'🎓':r==='Company'?'🏢':'🏠'} {r}
                            </button>
                          )}
                        </div>
                        <label className="field">Full Name<input name="name" required placeholder="e.g. Alex Rivera"/></label>
                        {role==='Company'&&<label className="field">Company / Depot Name<input name="company" required placeholder="e.g. Apex Construction Supply"/></label>}
                        <label className="field">Location
                          <select name="location"><option>Cebu City</option><option>Mandaue City</option><option>Lapu-Lapu City</option></select>
                        </label>
                      </>}
                      <label className="field">{role==='Student'?'Institutional (.edu) Email':role==='Company'?'Company Email':'Email Address'}
                        <input name="email" type="email" required placeholder={role==='Student'?'name@student.example.edu':'alex@gmail.com'}/>
                      </label>
                      {authMode!=='reset'&&<label className="field">Password<input name="password" type="password" autoComplete="new-password" required minLength={8} placeholder="At least 8 characters"/></label>}
                      {authMode==='register'&&<>
                        <label className="field">Confirm Password<input name="confirm" type="password" required minLength={8} placeholder="Repeat password"/></label>
                        <label className="check-label"><input type="checkbox" required/><span>I accept the <button type="button" className="btn-inline" onClick={()=>setModal('terms')}>Terms of Use</button></span></label>
                      </>}
                      {authError&&<div className="info-box warn">{authError}</div>}
                      <button className="btn-primary btn-full">{authMode==='register'?'Join Marketplace':authMode==='reset'?'Prepare Reset Link':'Log In'}</button>
                    </form>
                    {authMode==='login'&&<button className="btn-inline text-center btn-full" onClick={()=>setAuthMode('reset')}>Forgot password?</button>}
                    <button className="btn-inline text-center btn-full" onClick={()=>{setAuthMode(authMode==='register'?'login':'register');setAuthError('')}}>
                      {authMode==='register'?'Already have an account? Log in':'New to ScrAPP? Create an account'}
                    </button>
                  </>}
                </div>
              </div>
            ) : (
              /* MAIN APPLICATION */
              <div className="app-main-flow">
                {/* Header */}
                <header className="app-header">
                  <div className="header-brand">
                    <img src="/logo.png" alt="ScrAPP" className="header-logo-img"/>
                    <span className="brand-text">Scr<b>APP</b></span>
                  </div>
                  <div className="header-actions">
                    <button className="location-btn" onClick={()=>setModal('filters')}>
                      <MapPin size={13}/>
                      <span>{account.location.split(' ')[0]}</span>
                    </button>
                    <button className="icon-badge-btn" onClick={()=>setModal('notifications')} aria-label="Notifications">
                      <Bell size={19}/>
                      {notifications.length>0&&<span className="dot-badge"/>}
                    </button>
                  </div>
                </header>

                {/* ── TAB: EXPLORE ── */}
                {tab==='Explore'&&(
                  <div className="tab-pane">
                    {/* Hero Promo Banner */}
                    <div className="explore-hero">
                      <div className="hero-content">
                        <span className="hero-pill"><Hammer size={12}/> SITE SUPPLIES</span>
                        <h2>Industrial & Site Materials</h2>
                        <p>Shop PVC, grinder blades, rebar, door knobs, wood & cement.</p>
                      </div>
                      <div className="hero-badge-right">
                        <span className="badge-tag">UP TO</span>
                        <span className="badge-percent">40%</span>
                        <span className="badge-sub">OFF RETAIL</span>
                      </div>
                    </div>

                    {/* Search & Filter bar */}
                    <div className="search-section">
                      <div className="search-input-wrap">
                        <Search size={17} className="search-icon"/>
                        <input
                          value={query}
                          onChange={e=>setQuery(e.target.value)}
                          placeholder="Search PVC, blades, rebar, wood..."
                        />
                        {query&&<button className="clear-search" onClick={()=>setQuery('')}><X size={15}/></button>}
                      </div>
                      <button className="btn-filter-trigger" onClick={()=>setModal('filters')} aria-label="Filters">
                        <SlidersHorizontal size={17}/>
                      </button>
                    </div>

                    {/* Category Carousel */}
                    <div className="category-carousel">
                      {categories.map(c=>(
                        <button
                          key={c}
                          className={'category-pill'+(category===c?' active':'')}
                          onClick={()=>setCategory(c)}
                        >
                          <span className="cat-icon">{constructionEmojis[c]||'📦'}</span>
                          <span>{c}</span>
                        </button>
                      ))}
                      <button
                        className={'category-pill saved-pill'+(onlySaved?' active':'')}
                        onClick={()=>setOnlySaved(!onlySaved)}
                      >
                        <Heart size={14} fill={onlySaved?'currentColor':'none'}/>
                        <span>Saved ({favorites.length})</span>
                      </button>
                    </div>

                    {/* Materials Feed Grid */}
                    <div className="materials-header">
                      <h3>{onlySaved?'Saved Materials':category==='All'?'Available Construction Stock':category}</h3>
                      <span className="stock-count">{filtered.length} listings</span>
                    </div>

                    <div className="materials-grid">
                      {filtered.map((item)=>(
                        <article className="material-card" key={item.id}>
                          <div className="card-media" onClick={()=>openItem(item)}>
                            <img src={item.image} alt={item.name} loading="lazy"/>
                            <span className="card-category-badge">{item.category}</span>
                            <button
                              className={'card-fav-btn'+(favorites.includes(item.id)?' is-fav':'')}
                              onClick={(e)=>{e.stopPropagation();toggleSave(item.id);}}
                              aria-label="Save item"
                            >
                              <Heart size={15} fill={favorites.includes(item.id)?'currentColor':'none'}/>
                            </button>
                          </div>
                          <div className="card-details" onClick={()=>openItem(item)}>
                            <div className="card-price-row">
                              <span className="price-val">{money(item.price)}</span>
                              <span className="price-unit">/{item.unit}</span>
                            </div>
                            <h4 className="card-title">{item.name}</h4>
                            <div className="card-footer-meta">
                              <span className="seller-name"><HardHat size={11}/> {item.seller.split(' ')[0]}</span>
                              <span className="item-loc"><MapPin size={11}/> {item.location.split(' ')[0]}</span>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>

                    {!filtered.length&& (
                      <div className="empty-state">
                        <div className="empty-icon-wrap"><Search size={28}/></div>
                        <h4>No construction materials found</h4>
                        <p>Try PVC, grinder blades, rebar, door knobs, wood, or cement, or clear filters.</p>
                        <button className="btn-secondary btn-sm" onClick={()=>{setQuery('');setCategory('All');setLocation('All locations');setOnlySaved(false)}}>
                          Reset Search Filters
                        </button>
                      </div>
                    )}

                    {/* Sell Promo Banner */}
                    <div className="sell-callout" onClick={()=>{if(canSell){setEditing(null);setTab('Sell')}else setToast('Switch role in Profile to list materials.')}}>
                      <div className="callout-icon">
                        <Plus size={22}/>
                      </div>
                      <div className="callout-text">
                        <strong>Got surplus materials on site?</strong>
                        <span>List them on ScrAPP and get paid fast.</span>
                      </div>
                      <ChevronRight size={18}/>
                    </div>
                  </div>
                )}

                {/* ── TAB: SELL ── */}
                {tab==='Sell'&&canSell&&(
                  <div className="tab-pane">
                    <div className="pane-header">
                      <span className="pane-kicker"><Wrench size={12}/> SUPPLIER PORTAL</span>
                      <h2>{editing?'Edit Material Listing':'Post Material Listing'}</h2>
                      <p>Connect with local contractors, builders, and DIYers.</p>
                    </div>

                    <form className="material-form" onSubmit={listItem}>
                      <label className="field">Material Title
                        <input name="name" required defaultValue={editing?.name} placeholder="e.g. Schedule 40 PVC Pipes 4 inch (6m)"/>
                      </label>

                      <div className="field-grid-2">
                        <label className="field">Category
                          <select name="category" defaultValue={editing?.category||'PVC & Pipes'}>
                            {categories.slice(1).map(c=><option key={c}>{c}</option>)}
                          </select>
                        </label>
                        <label className="field">Condition
                          <select name="condition" defaultValue={editing?.condition||'Brand New'}>
                            <option>Brand New</option>
                            <option>Good · Surplus</option>
                            <option>Good · Reclaimed</option>
                            <option>Good · Offcuts</option>
                          </select>
                        </label>
                      </div>

                      <div className="field-grid-3">
                        <label className="field">Price (₱)
                          <input name="price" type="number" min="1" step="1" required defaultValue={editing?.price} placeholder="450"/>
                        </label>
                        <label className="field">Unit
                          <select name="unit" defaultValue={editing?.unit||'piece'}>
                            <option>piece</option>
                            <option>set</option>
                            <option>bundle</option>
                            <option>sheet</option>
                            <option>bag</option>
                            <option>roll</option>
                            <option>box</option>
                            <option>pail</option>
                            <option>kg</option>
                          </select>
                        </label>
                        <label className="field">Available Qty
                          <input name="quantity" type="number" min="1" step="1" required defaultValue={editing?.quantity||10}/>
                        </label>
                      </div>

                      <label className="field">Photo Upload
                        <input name="image" type="file" accept="image/*" onChange={e=>{
                          const file=e.target.files?.[0];
                          if(file){
                            const reader=new FileReader();
                            reader.onload=()=>setUploadPreview(String(reader.result));
                            reader.readAsDataURL(file);
                          }
                        }}/>
                        {(uploadPreview||editing?.image)&&(
                          <div className="uploaded-preview-box">
                            <img src={uploadPreview||editing?.image} alt="Preview"/>
                          </div>
                        )}
                        <small className="field-helper">High resolution photo of materials on site or depot.</small>
                      </label>

                      <label className="field">Material Specifications & Description
                        <textarea name="description" required minLength={20} defaultValue={editing?.description} placeholder="Include dimensions, ASTM standards, thickness, grade, length, brand, and storage condition." rows={4}/>
                      </label>

                      <label className="field">Warehouse / Depot Location
                        <select name="location" defaultValue={editing?.location||account.location}>
                          <option>Cebu City</option>
                          <option>Mandaue City</option>
                          <option>Lapu-Lapu City</option>
                        </select>
                      </label>

                      <div className="info-box">
                        <Truck size={16}/> Pickup and site crane delivery simulated for orders.
                      </div>

                      <button className="btn-primary btn-full">
                        {editing?'Review Updates':'Preview & Publish Listing'} <ArrowRight size={17}/>
                      </button>
                    </form>
                  </div>
                )}

                {/* ── TAB: MESSAGES ── */}
                {tab==='Messages'&&(
                  <div className="tab-pane">
                    {!activeChat ? (
                      <div>
                        <div className="pane-header">
                          <h2>Supplier Inquiries</h2>
                          <p>Direct chat with material yards and contractors.</p>
                        </div>
                        {!conversations.length ? (
                          <div className="empty-state">
                            <div className="empty-icon-wrap"><MessageCircle size={28}/></div>
                            <h4>No conversations yet</h4>
                            <p>Open any material and tap "Chat Supplier" to coordinate orders.</p>
                            <button className="btn-secondary btn-sm" onClick={()=>setTab('Explore')}>Browse Materials</button>
                          </div>
                        ) : (
                          <div className="chat-thread-list">
                            {conversations.map(c=>(
                              <div className="thread-card" key={c.id} onClick={()=>setActiveChat(c.id)}>
                                <div className="thread-avatar">
                                  <img src={c.item.image} alt={c.item.name}/>
                                </div>
                                <div className="thread-details">
                                  <div className="thread-title-row">
                                    <strong>{c.item.seller}</strong>
                                    <span className="thread-time">{c.messages[c.messages.length-1]?.time}</span>
                                  </div>
                                  <p className="thread-preview">{c.messages[c.messages.length-1]?.text}</p>
                                  <span className="thread-item-pill">{c.item.name}</span>
                                </div>
                                <ChevronRight size={16} className="thread-chevron"/>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : chat ? (
                      <div className="chat-interface">
                        <div className="chat-topbar">
                          <button className="btn-chat-back" onClick={()=>setActiveChat(null)}>
                            <ArrowLeft size={18}/>
                          </button>
                          <div className="chat-header-info">
                            <strong>{chat.item.seller}</strong>
                            <small><MapPin size={10}/> {chat.item.location} · Verified Yard</small>
                          </div>
                          <button className="btn-call-demo" onClick={()=>setToast('Simulated call to '+chat.item.seller)}>
                            <Phone size={16}/>
                          </button>
                        </div>

                        {/* Product reference bar */}
                        <div className="chat-item-banner" onClick={()=>openItem(chat.item)}>
                          <img src={chat.item.image} alt={chat.item.name}/>
                          <div className="banner-info">
                            <span className="banner-name">{chat.item.name}</span>
                            <span className="banner-price">{money(chat.item.price)} / {chat.item.unit}</span>
                          </div>
                          <ChevronRight size={16}/>
                        </div>

                        {/* Chat history */}
                        <div className="chat-history">
                          {chat.messages.map((m,i)=>(
                            <div className={'chat-bubble'+(m.mine?' mine':' seller')} key={i}>
                              <p>{m.text}</p>
                              <span className="bubble-time">{m.time}</span>
                            </div>
                          ))}
                          <div ref={msgEndRef}/>
                        </div>

                        {/* Quick Prompts */}
                        <div className="quick-prompts">
                          {['Is this stock available?','What is the delivery fee?','Can you issue an official receipt?'].map(t=>(
                            <button key={t} onClick={()=>sendMessage(t)}>{t}</button>
                          ))}
                        </div>

                        {/* Input */}
                        <form className="chat-input-bar" onSubmit={e=>{e.preventDefault();sendMessage(draft)}}>
                          <input
                            placeholder="Message supplier..."
                            value={draft}
                            onChange={e=>setDraft(e.target.value)}
                          />
                          <button className="btn-send" disabled={!draft.trim()}>
                            <Send size={16}/>
                          </button>
                        </form>
                      </div>
                    ) : null}
                  </div>
                )}

                {/* ── TAB: ORDERS ── */}
                {tab==='Orders'&&(
                  <div className="tab-pane">
                    <div className="pane-header">
                      <h2>{canBuy?'Material Orders':'Site Dispatches'}</h2>
                      <p>Track your scheduled pickups and truck deliveries.</p>
                    </div>

                    {!visibleOrders.length ? (
                      <div className="empty-state">
                        <div className="empty-icon-wrap"><Package size={28}/></div>
                        <h4>No orders placed yet</h4>
                        <p>Explore construction stock and place your first material reservation.</p>
                        <button className="btn-primary btn-sm" onClick={()=>setTab('Explore')}>Explore Materials</button>
                      </div>
                    ) : (
                      <div className="orders-stack">
                        {visibleOrders.map(o=>(
                          <article className="order-ticket" key={o.id}>
                            <div className="ticket-header">
                              <span className="ticket-id">{o.id}</span>
                              <span className={'status-badge status-'+o.status.toLowerCase()}>{o.status}</span>
                            </div>
                            <div className="ticket-item-row">
                              <img src={o.item.image} alt={o.item.name}/>
                              <div className="ticket-details">
                                <h4>{o.item.name}</h4>
                                <p>{o.quantity} {o.item.unit} · {o.item.seller}</p>
                                <span className="fulfillment-tag"><Truck size={12}/> {o.fulfillment} · {o.payment}</span>
                              </div>
                              <span className="ticket-total">{money(o.total)}</span>
                            </div>
                            <div className="ticket-location">
                              <MapPin size={13}/>
                              <span>{o.address}</span>
                            </div>
                            <div className="ticket-actions">
                              {o.status==='Placed'&&<>
                                <button className="btn-secondary btn-sm" onClick={()=>{setOrders(orders.map(x=>x.id===o.id?{...x,status:'Completed'}:x));notify('Order marked as received')}}>
                                  Confirm Receipt
                                </button>
                                <button className="btn-text-danger btn-sm" onClick={()=>{setOrders(orders.map(x=>x.id===o.id?{...x,status:'Cancelled'}:x));setListings(listings.map(x=>x.id===o.item.id?{...x,quantity:x.quantity+o.quantity,sold:false}:x));notify('Order cancelled')}}>
                                  Cancel
                                </button>
                              </>}
                              {o.status==='Completed'&& (
                                <div className="review-rating-box">
                                  <span>Supplier Rating:</span>
                                  <div className="stars-row">
                                    {[1,2,3,4,5].map(n=>(
                                      <button key={n} onClick={()=>{setOrders(orders.map(x=>x.id===o.id?{...x,rating:n}:x));setToast('Thanks for rating this supplier!')}}>
                                        <Star size={16} fill={(o.rating||0)>=n?'#F59E0B':'none'} color={(o.rating||0)>=n?'#F59E0B':'#CBD5E1'}/>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </article>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ── TAB: PROFILE ── */}
                {tab==='Profile'&&(
                  <div className="tab-pane">
                    <div className="profile-card-modern">
                      <div className="profile-avatar-wrap">
                        {account.photo ? <img src={account.photo} alt={account.name}/> : <span>{account.name.charAt(0)}</span>}
                      </div>
                      <div className="profile-details">
                        <h3>{account.company||account.name}</h3>
                        <p>{account.email}</p>
                        <span className="role-pill-modern"><ShieldCheck size={12}/> {account.role} Account</span>
                      </div>
                      <button className="btn-edit-profile" onClick={()=>{setProfilePhoto(account.photo||'');setModal('settings')}} aria-label="Edit Profile">
                        <Pencil size={15}/>
                      </button>
                    </div>

                    <div className="quick-metrics-row">
                      <div className="metric-box" onClick={()=>setTab('Orders')}>
                        <strong>{orders.length}</strong>
                        <span>Orders</span>
                      </div>
                      <div className="metric-box" onClick={()=>{setOnlySaved(true);setTab('Explore')}}>
                        <strong>{favorites.length}</strong>
                        <span>Saved</span>
                      </div>
                      <div className="metric-box" onClick={()=>setTab('Messages')}>
                        <strong>{conversations.length}</strong>
                        <span>Chats</span>
                      </div>
                    </div>

                    {canSell&&(
                      <div className="my-listings-section">
                        <div className="section-title-bar">
                          <h4>Depot Inventory ({listings.filter(l=>l.owner).length})</h4>
                          <button className="btn-inline" onClick={()=>{setEditing(null);setTab('Sell')}}>
                            <Plus size={14}/> Add New
                          </button>
                        </div>
                        {!listings.some(l=>l.owner) ? (
                          <div className="empty-sub">
                            <p>No active listings. Tap "Add New" to list construction stock.</p>
                          </div>
                        ) : (
                          <div className="inventory-list">
                            {listings.filter(l=>l.owner).map(l=>(
                              <div className="inventory-row" key={l.id}>
                                <img src={l.image} alt={l.name}/>
                                <div className="inventory-meta">
                                  <strong>{l.name}</strong>
                                  <span className="inv-price">{money(l.price)} / {l.unit}</span>
                                  <span className="inv-stock">{l.sold ? 'Sold Out' : `${l.quantity} in stock`}</span>
                                </div>
                                <div className="inv-actions">
                                  <button onClick={()=>{setEditing(l);setTab('Sell')}} title="Edit"><Pencil size={14}/></button>
                                  <button onClick={()=>{setSelected(l);setModal('delete')}} title="Delete"><Trash2 size={14}/></button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="settings-panel">
                      <h4>Account Persona & Switcher</h4>
                      <p className="settings-desc">Switch role to test buyer/contractor vs supply company views:</p>
                      <div className="role-row">
                        {(['Student','Company','Homeowner'] as Role[]).map(r=>
                          <button key={r} className={'role-chip'+(account.role===r?' active':'')} onClick={()=>{setAccount({...account,role:r,company:r==='Company'?'Rivera Construction Supply':''});setToast(`Switched persona to ${r}`)}}>
                            {r==='Student'?'🎓':r==='Company'?'🏢':'🏠'} {r}
                          </button>
                        )}
                      </div>

                      <div className="settings-links">
                        <button className="link-row" onClick={()=>setModal('notifications')}>
                          <Bell size={17}/> <span>Notification History</span> <ChevronRight size={15}/>
                        </button>
                        <button className="link-row" onClick={()=>setModal('terms')}>
                          <ShieldCheck size={17}/> <span>Terms of Service</span> <ChevronRight size={15}/>
                        </button>
                        <button className="link-row logout" onClick={()=>{setAccount(null);setAuthMode('welcome');setModal(null)}}>
                          <LogOut size={17}/> <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* iOS Bottom Navigation Bar */}
          {account && (
            <nav className="ios-tab-bar">
              {[
                {id:'Explore',label:'Explore',icon:Home},
                ...(canSell?[{id:'Sell',label:'Sell',icon:Plus}]:[]),
                {id:'Messages',label:'Messages',icon:MessageCircle,badge:conversations.length},
                {id:'Orders',label:'Orders',icon:Package,badge:orders.length},
                {id:'Profile',label:'Profile',icon:UserRound}
              ].map(item=>{
                const Icon=item.icon;
                const isActive=tab===item.id;
                return (
                  <button
                    key={item.id}
                    className={'tab-item'+(isActive?' active':'')}
                    onClick={()=>{setTab(item.id);if(item.id==='Sell')setEditing(null);}}
                  >
                    <div className="tab-icon-wrap">
                      <Icon size={22} strokeWidth={isActive?2.6:2}/>
                      {item.badge&&item.badge>0?<span className="nav-badge">{item.badge}</span>:null}
                    </div>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          )}

          {/* iOS Home Indicator Bar */}
          <div className="home-indicator-bar">
            <div className="home-indicator-pill"/>
          </div>

          {/* Toast */}
          {toast&&<div className="toast-toast"><CheckCircle2 size={16}/><span>{toast}</span></div>}

          {/* ── MODALS (iOS Bottom Sheet Style) ── */}
          {modal&&(
            <div className="sheet-backdrop" onClick={close}>
              <div className={'sheet-dialog'+(modal==='details'?' sheet-details':'')} onClick={e=>e.stopPropagation()}>
                <div className="sheet-drag-handle"/>
                <button className="btn-close-sheet" onClick={close}><X size={18}/></button>

                {/* DETAIL MODAL */}
                {modal==='details'&&selected&&(
                  <div className="detail-modal-body">
                    <div className="detail-hero-media">
                      <img src={selected.image} alt={selected.name}/>
                      <span className="hero-cat-tag">{selected.category}</span>
                      <span className="hero-cond-tag">{selected.condition}</span>
                    </div>

                    <div className="detail-inner-content">
                      <div className="detail-price-headline">
                        <span className="price-big">{money(selected.price)}</span>
                        <span className="price-per">/{selected.unit}</span>
                      </div>

                      <h2 className="detail-product-title">{selected.name}</h2>

                      {/* Specs pills */}
                      {selected.specs&&(
                        <div className="specs-pills">
                          {selected.specs.map(s=><span key={s} className="spec-pill"><Check size={12}/> {s}</span>)}
                        </div>
                      )}

                      {/* Supplier Bar */}
                      <div className="detail-seller-box" onClick={()=>setModal('seller')}>
                        <div className="seller-badge-av">
                          <HardHat size={20}/>
                        </div>
                        <div className="seller-box-info">
                          <strong>{selected.seller}</strong>
                          <small>★ 4.9 Verified Contractor Depot · {selected.location}</small>
                        </div>
                        <ChevronRight size={18}/>
                      </div>

                      <div className="detail-desc-block">
                        <h4>Material Details</h4>
                        <p>{selected.description}</p>
                      </div>

                      <div className="detail-meta-grid">
                        <div className="meta-box"><MapPin size={15}/><span>{selected.location}</span></div>
                        <div className="meta-box"><Package size={15}/><span>{selected.quantity} {selected.unit} ready</span></div>
                        <div className="meta-box"><Truck size={15}/><span>Pickup & Delivery</span></div>
                        <div className="meta-box"><Flame size={15}/><span>Fast Moving</span></div>
                      </div>

                      <div className="detail-cta-bar">
                        {selected.owner ? (
                          <button className="btn-primary btn-full" onClick={()=>{setEditing(selected);setTab('Sell');close()}}>
                            Edit My Listing
                          </button>
                        ) : canBuy ? (
                          <div className="dual-cta">
                            <button className="btn-chat-cta" onClick={()=>startChat(selected)}>
                              <MessageCircle size={18}/> Chat Supplier
                            </button>
                            <button
                              className="btn-primary"
                              disabled={selected.sold||selected.quantity<1}
                              onClick={()=>{setQuantity(1);setFulfillment('Pickup');setPayment('Cash on pickup');setModal('checkout')}}
                            >
                              Buy Now <ArrowRight size={17}/>
                            </button>
                          </div>
                        ) : (
                          <div className="info-box">Company accounts list materials. Switch persona to buyer to checkout.</div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* CHECKOUT MODAL */}
                {modal==='checkout'&&selected&&(
                  <div className="checkout-modal-body">
                    <h2>Reserve Materials</h2>
                    <div className="checkout-product-preview">
                      <img src={selected.image} alt={selected.name}/>
                      <div>
                        <strong>{selected.name}</strong>
                        <span>{money(selected.price)} / {selected.unit}</span>
                      </div>
                    </div>

                    <label className="field">Order Quantity ({selected.unit})
                      <input
                        type="number"
                        min={1}
                        max={selected.quantity}
                        value={quantity}
                        onChange={e=>setQuantity(Math.max(1,Math.min(selected.quantity,Math.floor(Number(e.target.value)||1))))}
                      />
                    </label>

                    <label className="field">Fulfillment Type
                      <select value={fulfillment} onChange={e=>{setFulfillment(e.target.value);setPayment(e.target.value==='Pickup'?'Cash on pickup':'Cash on delivery')}}>
                        <option>Pickup at Supplier Depot</option>
                        <option>Direct Site Delivery (Boom Truck / Flatbed)</option>
                      </select>
                    </label>

                    {fulfillment==='Pickup' ? (
                      <div className="info-box">
                        <MapPin size={16}/> Depot pickup location: <b>{selected.location}</b>. Gate pass will be issued upon reservation.
                      </div>
                    ) : (
                      <label className="field">Construction Site / Delivery Address
                        <textarea value={address} onChange={e=>setAddress(e.target.value)} placeholder="Lot/Block, Street, Barangay, Landmark (e.g. Project Site A, Banilad, Cebu City)"/>
                      </label>
                    )}

                    <label className="field">Payment Method
                      <select value={payment} onChange={e=>setPayment(e.target.value)}>
                        <option>{fulfillment==='Pickup'?'Cash on pickup (Yard counter)':'Cash on delivery (Upon unloading)'}</option>
                        <option>GCash / Bank Transfer (Demo)</option>
                        <option>30-Day Project Credit (Company PO)</option>
                      </select>
                    </label>

                    <div className="order-summary-box">
                      <div className="summary-line"><span>Material Subtotal</span><strong>{money(selected.price*quantity)}</strong></div>
                      <div className="summary-line"><span>{fulfillment==='Pickup'?'Depot Loading':'Flatbed Delivery Fee'}</span><strong>{fulfillment==='Pickup'?'FREE':money(250)}</strong></div>
                      <div className="summary-line total-line"><span>Estimated Total</span><strong>{money(selected.price*quantity+(fulfillment==='Pickup'?0:250))}</strong></div>
                    </div>

                    {checkoutError&&<div className="info-box warn">{checkoutError}</div>}

                    <button className="btn-primary btn-full" onClick={placeOrder}>
                      Confirm Order Reservation <ArrowRight size={17}/>
                    </button>
                  </div>
                )}

                {/* SUCCESS MODAL */}
                {modal==='success'&&lastOrder&&(
                  <div className="success-modal-body">
                    <CheckCircle2 size={60} className="text-primary"/>
                    <h2>Reservation Placed!</h2>
                    <p className="order-ref">Order Reference: <b>{lastOrder.id}</b></p>
                    <p className="order-total-sum">{money(lastOrder.total)}</p>
                    <p className="subtitle">The material yard has been notified. You can track pickup and dispatch progress in the Orders tab.</p>
                    <button className="btn-primary btn-full" onClick={()=>{setTab('Orders');close()}}>
                      View Order Ticket <ArrowRight size={17}/>
                    </button>
                  </div>
                )}

                {/* FILTERS MODAL */}
                {modal==='filters'&&(
                  <div className="filters-modal-body">
                    <h2>Filter Construction Materials</h2>
                    <label className="field">Depot Location
                      <select value={location} onChange={e=>setLocation(e.target.value)}>
                        <option>All locations</option>
                        <option>Cebu City</option>
                        <option>Mandaue City</option>
                        <option>Lapu-Lapu City</option>
                      </select>
                    </label>
                    <button className="btn-primary btn-full" onClick={()=>{setTab('Explore');close()}}>
                      Apply Filters
                    </button>
                  </div>
                )}

                {/* NOTIFICATIONS MODAL */}
                {modal==='notifications'&&(
                  <div className="notifications-modal-body">
                    <h2>Notifications</h2>
                    <div className="notifs-list">
                      {notifications.map((n,i)=>(
                        <div key={i} className="notif-row" onClick={()=>{setTab(n.includes('reply')?'Messages':n.includes('Order')||n.includes('order')?'Orders':'Explore');close()}}>
                          <div className="notif-icon-circle"><Bell size={16}/></div>
                          <div className="notif-content">
                            <p>{n}</p>
                            <small>Just now</small>
                          </div>
                          <ChevronRight size={15}/>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* PREVIEW LISTING MODAL */}
                {modal==='listingPreview'&&pendingListing&&(
                  <div className="listing-preview-body">
                    <h2>Listing Preview</h2>
                    <div className="preview-card-wrap">
                      <img src={pendingListing.image} alt={pendingListing.name}/>
                      <div className="preview-card-info">
                        <span className="hero-cat-tag">{pendingListing.category}</span>
                        <h3>{pendingListing.name}</h3>
                        <p className="price-val">{money(pendingListing.price)} /{pendingListing.unit}</p>
                        <p className="desc">{pendingListing.description}</p>
                        <div className="info-box"><MapPin size={14}/> {pendingListing.location} · {pendingListing.quantity} {pendingListing.unit}</div>
                      </div>
                    </div>
                    <button className="btn-primary btn-full" onClick={()=>{
                      setListings(l=>editing?l.map(x=>x.id===editing.id?pendingListing:x):[pendingListing,...l]);
                      setEditing(null);setUploadPreview('');setPendingListing(null);setTab('Profile');close();
                      notify('Material listing published to live catalog!');
                    }}>
                      {editing?'Save Changes':'Publish Listing Now'} <ArrowRight size={17}/>
                    </button>
                    <button className="btn-secondary btn-full" onClick={close}>Continue Editing</button>
                  </div>
                )}

                {/* SELLER DEPOT MODAL */}
                {modal==='seller'&&selected&&(
                  <div className="seller-modal-body">
                    <div className="seller-profile-head">
                      <div className="seller-av-big"><HardHat size={32}/></div>
                      <h2>{selected.seller}</h2>
                      <p><MapPin size={14}/> {selected.location} · Verified Supplier</p>
                      <div className="rating-pill">★ 4.9 Supplier Trust Score</div>
                    </div>
                    <h4>Inventory from this Supplier</h4>
                    <div className="seller-stock-list">
                      {listings.filter(l=>l.seller===selected.seller&&!l.sold).map(l=>(
                        <div key={l.id} className="seller-stock-row" onClick={()=>openItem(l)}>
                          <img src={l.image} alt={l.name}/>
                          <div>
                            <strong>{l.name}</strong>
                            <span>{money(l.price)} / {l.unit}</span>
                          </div>
                          <ChevronRight size={16}/>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* SETTINGS MODAL */}
                {modal==='settings'&&account&&(
                  <div className="settings-modal-body">
                    <h2>Edit Profile</h2>
                    <form onSubmit={e=>{
                      e.preventDefault();
                      const d=new FormData(e.currentTarget);
                      setAccount({
                        ...account,
                        name:String(d.get('name')||account.name),
                        location:String(d.get('location')||account.location),
                        photo:profilePhoto||account.photo
                      });
                      close();
                      setToast('Profile updated');
                    }}>
                      <label className="field">Profile Photo
                        <input type="file" accept="image/*" onChange={e=>{
                          const file=e.target.files?.[0];
                          if(file){
                            const reader=new FileReader();
                            reader.onload=()=>setProfilePhoto(String(reader.result));
                            reader.readAsDataURL(file);
                          }
                        }}/>
                        {profilePhoto&&<img className="profile-edit-preview" src={profilePhoto} alt="Profile"/>}
                      </label>
                      <label className="field">Name / Representative
                        <input name="name" defaultValue={account.name} required/>
                      </label>
                      <label className="field">Location
                        <select name="location" defaultValue={account.location}>
                          <option>Cebu City</option>
                          <option>Mandaue City</option>
                          <option>Lapu-Lapu City</option>
                        </select>
                      </label>
                      <button className="btn-primary btn-full">Save Changes</button>
                    </form>
                  </div>
                )}

                {/* DELETE LISTING MODAL */}
                {modal==='delete'&&selected&&(
                  <div className="delete-modal-body">
                    <h2>Remove Listing?</h2>
                    <p>Are you sure you want to remove <b>{selected.name}</b> from the live construction materials catalog?</p>
                    <button className="btn-danger btn-full" onClick={()=>{
                      setListings(listings.filter(l=>l.id!==selected.id));
                      close();
                      setToast('Listing removed');
                    }}>
                      Confirm Removal
                    </button>
                    <button className="btn-secondary btn-full" onClick={close}>Cancel</button>
                  </div>
                )}

                {/* TERMS MODAL */}
                {modal==='terms'&&(
                  <div className="terms-modal-body">
                    <span className="role-pill-modern">PROTOTYPE TERMS</span>
                    <h2>Terms & Conditions</h2>
                    <p>ScrAPP is a digital prototype for exchanging construction and surplus industrial materials.</p>
                    <h4>Material Specifications & Quality</h4>
                    <p>Sellers must specify accurate grades (e.g. PNS Grade 40 steel, ASTM Type 1 cement, Schedule 40 PVC) and truthful dimensions.</p>
                    <h4>Orders and Fulfillments</h4>
                    <p>All checkout transactions, site dispatches, and crane deliveries are simulated within this interactive prototype.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
