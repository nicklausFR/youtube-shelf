import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { normalizeYoutubeChannelTitle } from '../public/youtube-account.js';
const live = readFileSync('youtube-live.js', 'utf8');
const start = live.indexOf('function youtubeShelfSubscriptionFromCard(');
const parse = Function('location', `${live.slice(start, live.indexOf('async function youtubeShelfReadSubscriptionsPage', start))}; return youtubeShelfSubscriptionFromCard;`)({ origin: 'https://www.youtube.com' });
const link = href => ({ getAttribute: key => key === 'href' ? href : null, textContent: 'Fallback' });
function card(data, links, title = null) {
  return { data, querySelectorAll: () => links, querySelector: selector => selector.startsWith('#channel-title #text') ? { textContent: title } : null };
}
const title = 'Révolution Énergétique';
assert.equal(normalizeYoutubeChannelTitle(`${title}\n${title}`), title);
assert.equal(normalizeYoutubeChannelTitle(`${title}${title}`), title);
assert.equal(normalizeYoutubeChannelTitle('Duran Duran'), 'Duran Duran');
assert.equal(normalizeYoutubeChannelTitle('Alain Jeanneaux. La Réussite Académy'), 'Alain Jeanneaux. La Réussite Académy');
assert.equal(parse(card({ title: { runs: [{ text: 'HugoDécrypte' }, { text: ' - Actus du jour' }] }, channelId: 'UC_hugo' }, [])).title, 'HugoDécrypte - Actus du jour');
const modern = parse(card({ contentId: 'UC_energy', metadata: { lockupMetadataViewModel: { title: { content: title } } } }, [link('/@RévolutionÉnergétique/videos')]));
assert.equal(modern.title, title);
assert.equal(modern.id, 'UC_energy');
assert.equal(parse(card({}, [link('/@RévolutionÉnergétique')], title)).title, title);
assert.equal(parse(card({}, [link('/@handle'), link('/channel/UC_correct')], title)).id, 'UC_correct');
assert.equal(parse(card({}, [link('/watch?v=abc')])), null);
const app = readFileSync('public/app.js', 'utf8');
const handleStart = app.indexOf('function handleUrlFromDroppedText(');
const handle = Function(`${app.slice(handleStart, app.indexOf('function youtubeUrlFromDroppedText', handleStart))}; return handleUrlFromDroppedText;`)();
for (const value of ['RévolutionÉnergétique', 'HugoDécrypte', '%C3%89nergie', '日本語']) {
  assert.equal(handle(`https://www.youtube.com/@${value}/videos?x=1`), `https://www.youtube.com/@${value}`);
}
console.log('Subscription card titles, modern identities, canonical links and Unicode handles passed.');

// Exercise the actual main card renderer, not just the title helper.
const { default: vm } = await import('node:vm');
const nodes = [];
const document = {
  body: { classList: { contains: () => false } },
  createElement(tag) {
    const node = { tag, children: [], dataset: {}, classList: { add() {}, remove() {} }, addEventListener() {}, append(...children) { this.children.push(...children); } };
    nodes.push(node);
    return node;
  }
};
const ctx = vm.createContext({
  document, normalizeYoutubeChannelTitle,
  channelsEl: { classList: { remove() {} }, replaceChildren() {} },
  sortChannelsForDisplay: items => items,
  isSelectedChannelSearchScope: () => false,
  filterChannelsForSearch: items => items,
  activeChannel: null, channelSearchQuery: '',
  newVideoAgeLabel: () => '', setActiveChannelButton() {}
});
const renderStart = app.indexOf('function renderChannels(channels)');
vm.runInContext(app.slice(renderStart, app.indexOf('function categoryNamesForChannel', renderStart)), ctx);
for (const name of ['HugoDécrypte - Actus du jour', 'Révolution Énergétique']) {
  for (const separator of ['', ' ', '\n']) {
    nodes.length = 0;
    ctx.renderChannels([{ id: 'UC_example', title: `${name}${separator}${name}` }]);
    assert.equal(nodes.find(node => node.className === 'channelName').textContent, name);
  }
}
console.log('Main shelf cards render HugoDécrypte and Révolution Énergétique once for persisted duplicate titles.');
