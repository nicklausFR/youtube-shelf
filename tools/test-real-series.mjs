import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {annotateVideoSeries} from '../public/video-series.js';
const catalog = ['UC2wdo5vU7bPBNzyC2nnwmNQ','UCWizIdwZdmr43zfxlCktmNw'].flatMap(id => JSON.parse(readFileSync(new URL(`series-catalog-${id}.json`, import.meta.url))));
const expected = [
 ['BjK4YlVc2A8', catalog.filter(v => /Franna Crane Project.*\bPart \d+$/i.test(v.title)).sort((a,b) => Number(a.title.match(/Part (\d+)$/)[1]) - Number(b.title.match(/Part (\d+)$/)[1])).map(v => v.id)],
 ['FWux3nL4zjg',['se6HoorK05I','uKeu3crCNsk','9txlORFAXpw','FWux3nL4zjg']],
 ['E87b8YWvzt8',['nfNvuTMDXNg','E87b8YWvzt8','6SG0IAhy-eU']],
 ['hwYcnpnM4oA',['K_i1TUp0xrM','wdAp-lwyydE','stHMC1L4Tus','Tqz7da31ryI','hwYcnpnM4oA']]
];
assert.equal(expected[0][1].length, 39);
for(const input of [catalog,[...catalog].reverse()]) {
 const videos=annotateVideoSeries(input);
 for(const [id, ids] of expected) {
  const seed=videos.find(v=>v.id===id);
  const members=videos.filter(v=>v.seriesId===seed.seriesId).sort((a,b)=>a.seriesPosition-b.seriesPosition);
  assert.deepEqual(members.map(v=>v.id),ids,id);
  assert.equal(annotateVideoSeries([seed],input)[0].seriesId,seed.seriesId);
 }
}
console.log('Real-title corpus: Franna 39/39, washer 4/4, slotting attachment 3/3, power hammer 5/5; no unrelated members, both input orders.');
