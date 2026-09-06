const rawBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const base = rawBase.endsWith("/") ? rawBase.slice(0, -1) : rawBase;
export async function api<T>(path:string, options:RequestInit={}) : Promise<T> { const token=typeof window!=="undefined"?localStorage.getItem("leadpilot_token"):null; const res=await fetch(`${base}${path}`,{...options,headers:{"Content-Type":"application/json",...(token?{Authorization:`Bearer ${token}`}:{}) ,...options.headers}}); if(!res.ok){const b=await res.json().catch(()=>({}));throw new Error(b.detail||"Something went wrong")} return res.status===204?undefined as T:res.json() }
export const formatDate=(value:string)=>new Intl.DateTimeFormat("en",{month:"short",day:"numeric",year:"numeric"}).format(new Date(value));
