import{createContext,useContext,useEffect,useMemo,useState,type ReactNode}from'react';
import{onIdTokenChanged,signInWithEmailAndPassword,signOut,type User}from'firebase/auth';
import{api,type MeResponse}from'../lib/api';import{firebaseAuth,firebaseConfigured}from'./firebase';
type AuthState={user:User|null;profile:MeResponse|null;loading:boolean;error:string;demoMode:boolean;login:(email:string,password:string)=>Promise<void>;logout:()=>Promise<void>;getToken:()=>Promise<string|null>};
const AuthContext=createContext<AuthState|null>(null);
export function AuthProvider({children}:{children:ReactNode}){const[user,setUser]=useState<User|null>(null),[profile,setProfile]=useState<MeResponse|null>(null),[loading,setLoading]=useState(firebaseConfigured),[error,setError]=useState('');
 useEffect(()=>{if(!firebaseAuth)return;return onIdTokenChanged(firebaseAuth,async current=>{setUser(current);setProfile(null);setError('');if(current)try{setProfile(await api.me(await current.getIdToken()))}catch(e){setError(e instanceof Error?e.message:'Không tải được hồ sơ')}setLoading(false)})},[]);
 const value=useMemo<AuthState>(()=>({user,profile,loading,error,demoMode:!firebaseConfigured,login:async(email,password)=>{if(!firebaseAuth)throw new Error('FIREBASE_NOT_CONFIGURED');setLoading(true);setError('');try{await signInWithEmailAndPassword(firebaseAuth,email,password)}catch(e){setLoading(false);throw e}},logout:async()=>{if(firebaseAuth)await signOut(firebaseAuth)},getToken:async()=>user?user.getIdToken():null}),[user,profile,loading,error]);
 return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>}
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(){const value=useContext(AuthContext);if(!value)throw new Error('useAuth must be used inside AuthProvider');return value}
