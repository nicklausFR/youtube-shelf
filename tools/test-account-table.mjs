import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync, writeFileSync} from 'node:fs';
const app=readFileSync(new URL('../public/app.js',import.meta.url),'utf8');
class Element {
 constructor(tag) { this.tag=tag; this.children=[]; this.attributes={}; this.events={}; this.classList={toggle(){},add:(...names)=>{this.className=[...new Set([...(this.className||'').split(' ').filter(Boolean),...names])].join(' ');}}; }
 append(...items) { this.children.push(...items); }
 replaceChildren(...items) { this.children=items; }
 setAttribute(k,v) { this.attributes[k]=v; }
 addEventListener(k,fn) { this.events[k]=fn; }
}
const channel=(id,title)=>({id,title});
const calls=[];
const comparison=new Element('div');
const context=vm.createContext({document:{createElement:tag=>new Element(tag),createElementNS:(_ns,tag)=>new Element(tag)},
 youtubeAccountBusy:false,youtubeSubscriptionCurrentChannel:null,youtubeSubscriptionQueue:[],
 youtubeSubscriptionsLoaded:true,youtubeAccountComparisonEl:comparison,
 currentYoutubeSubscriptions:[channel('UC_shared','Shared channel'),channel('UC_youtube','YouTube only')],
 allChannels:[channel('UC_shared','Shared channel'),channel('UC_shelf','Shelf only')],
 uiMessage:(key,args=[])=>({accountAll:'All',accountAdd:'Add',accountRemove:'Remove',accountPresent:'Present',accountAbsent:'Absent',accountAddAll:`Add all (${args[0]})`,accountRemoveAll:`Remove all (${args[0]})`,accountTableCaption:'One channel per row. Manage each side independently.'}[key]||key),
 window:{confirm:()=>true},setYoutubeAccountStatus(){},
 startYoutubeSubscriptionQueue:(channels,action='subscribe')=>calls.push({side:'youtube',action,ids:channels.map(c=>c.id)})
});
const start=app.indexOf('function youtubeAccountActionButton('), end=app.indexOf('\nfunction renderYoutubeAccountDialog()',start);
vm.runInContext(app.slice(start,end),context);
context.changeShelfAccountChannels=(channels,remove=false)=>calls.push({side:'shelf',action:remove?'remove':'add',ids:channels.map(c=>c.id)});
context.renderYoutubeAccountComparison();
const table=comparison.children[0], head=table.children[0].children[0], rows=table.children[1].children;
assert.equal(head.children[0].textContent,'YouTube · 2');
assert.equal(head.children[2].textContent,'YouTube Shelf · 2');
assert.equal(rows.length,3);
assert.ok(rows.every(row=>row.children.length===3));
const transfers=row=>row.children[1].children[0].children;
assert.ok(transfers(rows[0]).every(button=>button.disabled));
assert.equal(rows[1].children[0].children.length,0);
assert.equal(rows[2].children[2].children.length,0);
transfers(rows[1])[0].events.click();
transfers(rows[2])[1].events.click();
assert.equal(calls[0].action,'subscribe'); assert.equal(calls[0].ids[0],'UC_shelf');
assert.equal(calls[1].side,'shelf'); assert.equal(calls[1].action,'add');
const bulk=head.children[1].children[0].children;
bulk[0].events.click(); bulk[1].events.click();
assert.equal(calls[2].side,'youtube'); assert.equal(calls[2].ids.length,1);
assert.equal(calls[3].side,'shelf'); assert.equal(calls[3].ids.length,1);
assert.ok(calls.every(call=>call.action==='subscribe'||call.action==='add'));
assert.equal(transfers(rows[1])[0].children[0].children[0].attributes.d,'M19 12H5m6-6-6 6 6 6');
assert.equal(transfers(rows[2])[1].children[0].children[0].attributes.d,'M5 12h14m-6-6 6 6-6 6');
let menu=[];
context.showContextMenu=(_event,actions)=>{menu=actions;};
let assignedChannel;
context.openCategoryAssignment=channel=>{assignedChannel=channel;};
const rightClick={preventDefault(){},stopPropagation(){}};
rows[0].children[0].events.contextmenu(rightClick);
assert.equal(menu.length,1);
await menu[0].action();
assert.equal(calls.at(-1).side,'youtube');
assert.equal(calls.at(-1).action,'unsubscribe');
rows[0].children[2].events.contextmenu(rightClick);
assert.equal(menu.length,2);
menu[0].action();
assert.equal(assignedChannel,context.allChannels[0]);
await menu[1].action();
assert.equal(calls.at(-1).side,'shelf');
assert.equal(calls.at(-1).action,'remove');
assert.equal(rows[1].children[0].events.contextmenu,undefined);
context.youtubeAccountBusy=true;
menu=[];
rows[0].children[0].events.contextmenu(rightClick);
assert.equal(menu.length,1);
assert.equal(menu[0].disabled,true);
context.youtubeAccountBusy=false;
assert.ok(!readFileSync(new URL('../public/index.html',import.meta.url),'utf8').includes('id="youtubeAccountHistory"'));
context.youtubeAccountBusy=true; context.renderYoutubeAccountComparison();
const buttons=[]; function walk(el) { if(el.tag==='button') buttons.push(el); el.children.forEach(walk); } walk(comparison);
assert.ok(buttons.every(button=>button.disabled));
context.youtubeAccountBusy=false;
context.youtubeSubscriptionsLoaded=false;
context.currentYoutubeSubscriptions=[];
context.renderYoutubeAccountComparison();
assert.equal(comparison.hidden,false);
assert.equal(comparison.children[0].children[1].children.length,context.allChannels.length);
const pendingButtons=[];
function pendingWalk(el) { if(el.tag==='button') pendingButtons.push(el); el.children.forEach(pendingWalk); }
pendingWalk(comparison);
assert.ok(pendingButtons.every(button=>button.disabled));
context.currentYoutubeSubscriptions=[channel('UC_shared','Shared channel')];
context.renderYoutubeAccountComparison();
assert.equal(comparison.children[0].children[0].children[0].children[0].textContent,'YouTube · 1');
context.youtubeSubscriptionsLoaded=true;
const qStart=app.indexOf('function startYoutubeSubscriptionQueue('), qEnd=app.indexOf('\nasync function finishYoutubeSubscriptionStep(',qStart);
context.openNextYoutubeSubscriptionPopup=()=>{};
vm.runInContext(app.slice(qStart,qEnd),context);
context.startYoutubeSubscriptionQueue([channel('UC_shared','Shared'),channel('UC_shared','Shared'),channel('UC_shelf','Shelf')],'unsubscribe');
assert.equal(context.youtubeSubscriptionQueue.length,1);
assert.equal(context.youtubeSubscriptionQueue[0].id,'UC_shared');
assert.equal(context.youtubeSubscriptionQueue[0].subscriptionAction,'unsubscribe');
if(process.env.ACCOUNT_TABLE_PREVIEW) {
 const escape=v=>String(v??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
 function html(el) { return `<${el.tag} class="${escape(el.className||'')}" ${el.scope?'scope="col"':''} ${Object.entries(el.attributes).map(([key,value])=>`${key}="${escape(value)}"`).join(' ')} ${el.disabled?'disabled':''}>${escape(el.textContent||'')}${el.children.map(html).join('')}</${el.tag}>`; }
 writeFileSync('tools/account-table-preview-temp.html',`<!doctype html><html data-theme="dark"><meta charset="utf-8"><link rel="stylesheet" href="/public/styles.css"><body><div class="modalOverlay"><div class="modal youtubeAccountModal"><h2>YouTube account</h2><div class="youtubeAccountComparison">${html(table)}</div></div></div></body></html>`);
}
console.log('Account table: aligned union, single actions, central directional transfers, missing-only bulk copy, busy states and unsubscribe queue deduplication passed.');
const liveSource=readFileSync(new URL('../youtube-live.js',import.meta.url),'utf8');
const monitorStart=liveSource.indexOf('function youtubeShelfMonitorSubscriptionConfirmation()');
const monitorEnd=liveSource.indexOf('\nliveListener(document, "click"',monitorStart);
const results=[]; let unsubClicks=0;
let subscribeLabel=false;
const liveContext=vm.createContext({
 youtubeShelfSubscriptionConfirmationChannelId:()=> 'UC_target',
 youtubeShelfSubscriptionResultSent:false, youtubeShelfSubscriptionStartedAt:Date.now(),
 youtubeShelfSubscriptionAction:'unsubscribe', location:{pathname:'/channel/UC_target'},
 document:{querySelector:()=>({querySelector:()=>({})})},
 youtubeShelfIsSubscribeAction:()=>subscribeLabel,
 youtubeShelfClickUnsubscribe:()=>unsubClicks++,
 youtubeShelfReportSubscriptionResult:status=>results.push(status)
});
vm.runInContext(liveSource.slice(monitorStart,monitorEnd),liveContext);
liveContext.youtubeShelfMonitorSubscriptionConfirmation();
assert.equal(unsubClicks,1); assert.equal(results.length,0,'Clicking unsubscribe is not proof of success');
subscribeLabel=true; liveContext.youtubeShelfMonitorSubscriptionConfirmation();
assert.deepEqual(results,['unsubscribed']);
liveContext.location.pathname='/channel/UC_unrelated'; liveContext.youtubeShelfMonitorSubscriptionConfirmation();
assert.equal(results.length,1,'No action after navigation to a different channel');
liveContext.youtubeShelfSubscriptionStartedAt=1; liveContext.youtubeShelfMonitorSubscriptionConfirmation();
assert.equal(results.at(-1),'cancelled');
console.log('Unsubscribe: waits for observed state, respects channel boundary, times out safely.');
