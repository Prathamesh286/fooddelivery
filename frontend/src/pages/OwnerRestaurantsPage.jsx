import React, { useState, useEffect } from 'react'
import { restaurantApi, menuApi } from '../services/api'
import { Plus, Edit, ToggleLeft, ToggleRight, Trash2, ChevronDown, ChevronUp, Store } from 'lucide-react'
import toast from 'react-hot-toast'

function RForm({ initial, onSave, onCancel }) {
  const [f, setF] = useState(initial || { name:'',description:'',address:'',phone:'',imageUrl:'',cuisine:'',openingHours:'',deliveryTime:30,deliveryFee:30,minOrderAmount:100 })
  return (
    <div className="card p-6 mb-6 border border-ember-500/30">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-ember-500/40 to-transparent"/>
      <h3 className="font-semibold text-night-100 mb-5">{initial?'Edit Restaurant':'Add New Restaurant'}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[['name','Name *'],['cuisine','Cuisine'],['phone','Phone'],['openingHours','Opening Hours'],['imageUrl','Image URL','col-span-2'],['address','Address','col-span-2'],['description','Description','col-span-2']].map(([key,label,span])=>(
          <div key={key} className={span}>
            <label className="label">{label}</label>
            {key==='description'?<textarea className="input" rows={2} value={f[key]||''} onChange={e=>setF({...f,[key]:e.target.value})}/>:<input className="input" value={f[key]||''} onChange={e=>setF({...f,[key]:e.target.value})}/>}
          </div>
        ))}
        {[['deliveryTime','Delivery Time (min)','number'],['deliveryFee','Delivery Fee (₹)','number'],['minOrderAmount','Min Order (₹)','number']].map(([key,label])=>(
          <div key={key}><label className="label">{label}</label><input type="number" className="input" value={f[key]} onChange={e=>setF({...f,[key]:parseFloat(e.target.value)})}/></div>
        ))}
      </div>
      <div className="flex gap-3 mt-5">
        <button onClick={()=>onSave(f)} className="btn-ember">Save</button>
        <button onClick={onCancel} className="btn-ghost">Cancel</button>
      </div>
    </div>
  )
}

function MForm({ rid, onAdded, onCancel }) {
  const [f, setF] = useState({ name:'',description:'',price:'',imageUrl:'',category:'',vegetarian:false })
  const save = async () => {
    try { await menuApi.add(rid,{...f,price:parseFloat(f.price)}); toast.success('Item added!'); onAdded() }
    catch { toast.error('Failed') }
  }
  return (
    <div className="bg-night-800/60 border border-night-700 rounded-2xl p-4 mt-3">
      <h4 className="font-semibold text-night-200 mb-3">Add Menu Item</h4>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="label text-xs">Name *</label><input className="input text-sm" value={f.name} onChange={e=>setF({...f,name:e.target.value})}/></div>
        <div><label className="label text-xs">Price (₹)</label><input type="number" className="input text-sm" value={f.price} onChange={e=>setF({...f,price:e.target.value})}/></div>
        <div><label className="label text-xs">Category</label><input className="input text-sm" placeholder="Main Course" value={f.category} onChange={e=>setF({...f,category:e.target.value})}/></div>
        <div><label className="label text-xs">Image URL</label><input className="input text-sm" value={f.imageUrl} onChange={e=>setF({...f,imageUrl:e.target.value})}/></div>
        <div className="col-span-2"><label className="label text-xs">Description</label><input className="input text-sm" value={f.description} onChange={e=>setF({...f,description:e.target.value})}/></div>
        <div className="col-span-2 flex items-center gap-2"><input type="checkbox" checked={f.vegetarian} onChange={e=>setF({...f,vegetarian:e.target.checked})} className="w-4 h-4 accent-emerald-500"/><span className="text-sm text-night-300">Vegetarian</span></div>
      </div>
      <div className="flex gap-2 mt-3"><button onClick={save} className="btn-ember text-sm py-1.5">Add Item</button><button onClick={onCancel} className="btn-ghost text-sm py-1.5">Cancel</button></div>
    </div>
  )
}

export default function OwnerRestaurantsPage() {
  const [restaurants, setRestaurants] = useState([])
  const [menus, setMenus] = useState({})
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState(null)
  const [expanded, setExpanded] = useState(null)
  const [addMenu, setAddMenu] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(()=>{load()},[])
  const load = async()=>{ try{const r=await restaurantApi.getMy();setRestaurants(r.data)}catch{toast.error('Failed')}finally{setLoading(false)} }
  const loadMenu = async rid=>{ const r=await menuApi.getByRestaurant(rid);setMenus(p=>({...p,[rid]:r.data})) }
  const handleExpand = rid=>{ const n=expanded===rid?null:rid;setExpanded(n);if(n)loadMenu(n) }
  const saveR = async f=>{
    try{
      if(editing){ await restaurantApi.update(editing.id,f);toast.success('Updated');setEditing(null) }
      else{ await restaurantApi.create(f);toast.success('Created');setShowAdd(false) }
      load()
    }catch{toast.error('Failed')}
  }
  const toggleR = async id=>{ try{await restaurantApi.toggle(id);toast.success('Toggled');load()}catch{toast.error('Failed')} }
  const toggleItem = async(iid,rid)=>{ try{await menuApi.toggle(iid);loadMenu(rid)}catch{toast.error('Failed')} }
  const deleteItem = async(iid,rid)=>{ if(!confirm('Delete?'))return;try{await menuApi.delete(iid);toast.success('Deleted');loadMenu(rid)}catch{toast.error('Failed')} }

  if(loading)return<div className="p-8 text-center text-night-500">Loading...</div>
  return(
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-night-50">My Restaurants</h1>
        <button onClick={()=>setShowAdd(!showAdd)} className="btn-ember"><Plus className="w-4 h-4"/>Add Restaurant</button>
      </div>
      {showAdd&&<RForm onSave={saveR} onCancel={()=>setShowAdd(false)}/>}
      {editing&&<RForm initial={editing} onSave={saveR} onCancel={()=>setEditing(null)}/>}
      <div className="space-y-4">
        {restaurants.map(r=>(
          <div key={r.id} className="card">
            <div className="p-5 flex items-center gap-4">
              <img src={r.imageUrl||'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200'} alt={r.name} className="w-16 h-16 rounded-xl object-cover flex-shrink-0"/>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-night-100">{r.name}</h3>
                  <span className={r.open?'badge-green':'badge-red'}>{r.open?'Open':'Closed'}</span>
                </div>
                <p className="text-night-500 text-xs">{r.cuisine} • {r.address}</p>
                <p className="text-night-600 text-xs mt-0.5">⭐ {r.rating} • {r.reviewCount} reviews</p>
              </div>
              <div className="flex items-center gap-1.5">
                <button onClick={()=>setEditing(r)} className="p-2 text-night-500 hover:text-ember-400 hover:bg-ember-500/10 rounded-lg transition-colors"><Edit className="w-4 h-4"/></button>
                <button onClick={()=>toggleR(r.id)} className={`p-2 rounded-lg transition-colors ${r.open?'text-emerald-500 hover:bg-emerald-500/10':'text-red-500 hover:bg-red-500/10'}`}>{r.open?<ToggleRight className="w-5 h-5"/>:<ToggleLeft className="w-5 h-5"/>}</button>
                <button onClick={()=>handleExpand(r.id)} className="p-2 text-night-500 hover:text-night-300 hover:bg-night-800 rounded-lg transition-colors">{expanded===r.id?<ChevronUp className="w-4 h-4"/>:<ChevronDown className="w-4 h-4"/>}</button>
              </div>
            </div>
            {expanded===r.id&&(
              <div className="border-t border-night-800 p-5 animate-fade-in">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-night-200">Menu Items ({(menus[r.id]||[]).length})</h4>
                  <button onClick={()=>setAddMenu(addMenu===r.id?null:r.id)} className="btn-ghost text-xs py-1.5 px-3 gap-1"><Plus className="w-3 h-3"/>Add Item</button>
                </div>
                {addMenu===r.id&&<MForm rid={r.id} onAdded={()=>{loadMenu(r.id);setAddMenu(null)}} onCancel={()=>setAddMenu(null)}/>}
                <div className="space-y-2 mt-3">
                  {(menus[r.id]||[]).map(item=>(
                    <div key={item.id} className={`flex items-center gap-3 p-3 rounded-xl border ${item.available?'border-night-800 bg-night-800/30':'border-red-500/10 bg-red-500/5'}`}>
                      {item.imageUrl&&<img src={item.imageUrl} alt={item.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0"/>}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-night-200 text-sm truncate">{item.name}</span>
                          {item.vegetarian&&<span className="badge-green text-xs">Veg</span>}
                          {!item.available&&<span className="badge-red text-xs">Unavailable</span>}
                        </div>
                        <span className="text-ember-400 font-bold text-sm">₹{item.price}</span>
                        <span className="text-night-600 text-xs ml-2">{item.category}</span>
                      </div>
                      <button onClick={()=>toggleItem(item.id,r.id)} className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-colors ${item.available?'bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20':'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'}`}>
                        {item.available?'Disable':'Enable'}
                      </button>
                      <button onClick={()=>deleteItem(item.id,r.id)} className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5"/></button>
                    </div>
                  ))}
                  {(menus[r.id]||[]).length===0&&<p className="text-night-600 text-sm text-center py-4">No menu items yet. Add some!</p>}
                </div>
              </div>
            )}
          </div>
        ))}
        {restaurants.length===0&&(
          <div className="card p-16 text-center"><Store className="w-12 h-12 text-night-700 mx-auto mb-4"/><h3 className="font-bold text-night-400 mb-1">No restaurants yet</h3><p className="text-night-600 text-sm">Add your first restaurant to get started</p></div>
        )}
      </div>
    </div>
  )
}
