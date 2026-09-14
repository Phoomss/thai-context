import {spawn} from 'node:child_process';
import {createServer} from 'node:http';
import assert from 'node:assert/strict';
const upstream=createServer(async(req,res)=>{
 let text='';for await(const chunk of req)text+=chunk;
 const {query}=JSON.parse(text);
 if(query==='upstream-error'){res.writeHead(503);res.end();return;}
 if(query==='malformed'){res.setHeader('Content-Type','application/json');res.end('{}');return;}
 if(query==='slow')await new Promise(resolve=>setTimeout(resolve,1800));
 const count=query==='slow'?1:Number(query);
 res.setHeader('Content-Type','application/json');res.end(JSON.stringify({data:{query_understanding:{raw_query:query,detected_meaning:query},recommendations:Array.from({length:count},(_,i)=>({headword:`คำทดสอบ ${i+1}`,score:.9,definition:'ข้อมูลทดสอบ HTTP'}))}}));
});
await new Promise(r=>upstream.listen(0,'127.0.0.1',r));
const upstreamPort=upstream.address().port;
const child=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port','3011'],{env:{...process.env,THAI_CONTEXT_API_URL:`http://127.0.0.1:${upstreamPort}/search`,THAI_CONTEXT_USE_MOCK:'false'},stdio:['ignore','pipe','pipe']});
try{
 await new Promise((resolve,reject)=>{
  const timer=setTimeout(()=>reject(new Error('Startup timeout')),20000);
  child.once('exit',code=>{clearTimeout(timer);reject(new Error(`Server exited: ${code}`));});
  child.stdout.on('data',chunk=>{if(chunk.toString().includes('Ready in')){clearTimeout(timer);resolve();}});
  child.stderr.on('data',chunk=>process.stderr.write(chunk));
 });
 const base='http://127.0.0.1:3011';
 for(const path of ['/','/assets/editorial-room.png','/assets/book-reference.png']){const res=await fetch(base+path);assert.equal(res.status,200);await res.arrayBuffer();console.log(`PASS GET ${path}`);}
 const post=query=>fetch(base+'/api/search',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({query})});
 for(const n of [0,1,2,3,5]){const res=await post(String(n));assert.equal(res.status,200);const body=await res.json();assert.equal(body.mode,'live');assert.equal(body.recommendations.length,n);console.log(`PASS backend ${n} results`);}
 const start=Date.now();const slow=await (await post('slow')).json();assert.ok(Date.now()-start>=1700);assert.equal(slow.recommendations.length,1);console.log('PASS delayed backend');
 for(const q of ['upstream-error','malformed']){const body=await (await post(q)).json();assert.equal(body.mode,'fallback');console.log(`PASS ${q} visible fallback`);}
 for(const q of ['',42,'a'.repeat(601)])assert.equal((await post(q)).status,400);
 console.log('PASS invalid inputs; production HTTP checks complete');
}finally{child.kill('SIGTERM');await new Promise(r=>upstream.close(r));}
