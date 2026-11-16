const toggle=document.querySelector('.menu-toggle');
const nav=document.querySelector('.main-nav');
toggle?.addEventListener('click',()=>{const open=nav.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open));});
nav?.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{nav.classList.remove('open');toggle?.setAttribute('aria-expanded','false');}));
const year=document.querySelector('#year');
if(year)year.textContent=new Date().getFullYear();

const saveCardsButton=document.querySelector('#saveCardsButton');
const saveCardsStatus=document.querySelector('#saveCardsStatus');
function crc32(bytes){let crc=0xffffffff;for(const byte of bytes){crc^=byte;for(let bit=0;bit<8;bit++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}return (crc^0xffffffff)>>>0;}
function write16(view,offset,value){view.setUint16(offset,value,true);}
function write32(view,offset,value){view.setUint32(offset,value>>>0,true);}
function createZip(files){
 const encoder=new TextEncoder(),locals=[],centrals=[];let offset=0;
 for(const file of files){
  const name=encoder.encode(file.name),data=file.bytes,crc=crc32(data);
  const local=new Uint8Array(30+name.length+data.length),lv=new DataView(local.buffer);
  write32(lv,0,0x04034b50);write16(lv,4,20);write16(lv,6,0x0800);write16(lv,8,0);write16(lv,10,0);write16(lv,12,0);write32(lv,14,crc);write32(lv,18,data.length);write32(lv,22,data.length);write16(lv,26,name.length);write16(lv,28,0);local.set(name,30);local.set(data,30+name.length);locals.push(local);
  const central=new Uint8Array(46+name.length),cv=new DataView(central.buffer);
  write32(cv,0,0x02014b50);write16(cv,4,20);write16(cv,6,20);write16(cv,8,0x0800);write16(cv,10,0);write16(cv,12,0);write16(cv,14,0);write32(cv,16,crc);write32(cv,20,data.length);write32(cv,24,data.length);write16(cv,28,name.length);write16(cv,30,0);write16(cv,32,0);write16(cv,34,0);write16(cv,36,0);write32(cv,38,0);write32(cv,42,offset);central.set(name,46);centrals.push(central);offset+=local.length;
 }
 const centralSize=centrals.reduce((n,p)=>n+p.length,0),end=new Uint8Array(22),ev=new DataView(end.buffer);
 write32(ev,0,0x06054b50);write16(ev,4,0);write16(ev,6,0);write16(ev,8,files.length);write16(ev,10,files.length);write32(ev,12,centralSize);write32(ev,16,offset);write16(ev,20,0);
 return new Blob([...locals,...centrals,end],{type:'application/zip'});
}
async function saveBothCards(){
 if(!saveCardsButton||!saveCardsStatus)return;
 saveCardsButton.disabled=true;saveCardsStatus.textContent='Preparing your card images…';
 try{
  const sources=[{url:'./web2table.png',name:'Web2Table-Card-1.png'},{url:'./web2table1.png',name:'Web2Table-Card-2.png'}];
  const files=await Promise.all(sources.map(async source=>{const response=await fetch(source.url,{cache:'no-cache'});if(!response.ok)throw new Error('Unable to load '+source.name);return{name:source.name,bytes:new Uint8Array(await response.arrayBuffer())};}));
  const zip=createZip(files),url=URL.createObjectURL(zip),link=document.createElement('a');link.href=url;link.download='Web2Table-Digital-Cards.zip';document.body.appendChild(link);link.click();link.remove();window.setTimeout(()=>URL.revokeObjectURL(url),60000);
  saveCardsStatus.textContent='Both card images are in the downloaded ZIP. Open it and save the PNGs to Photos or Gallery.';
 }catch(error){console.error('Unable to prepare card downloads:',error);saveCardsStatus.textContent='We could not prepare the download. Please check your connection and try again.';}
 finally{saveCardsButton.disabled=false;}
}
saveCardsButton?.addEventListener('click',saveBothCards);