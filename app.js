/* Local prototype data and interaction paths. No account or network is required. */
(() => {
  const dishes = [
    { id: 'chicken', name: '香茅烤鸡饭', window: '8号烤味', canteen: '二食堂', emoji: '🍗', price: 14, score: 4.8, queue: 12, remaining: 42, tags: ['新品', '下饭'], reviews: [
      { author: '小满同学', time: '5分钟前', score: 5, text: '鸡肉外皮焦香，香茅味很特别，米饭也没有干。' },
      { author: '阿浩', time: '昨天', score: 4, text: '份量刚好，酱汁略甜，配冰豆浆很搭。' }
    ] },
    { id: 'noodles', name: '泰式冬阴功米线', window: '面食档', canteen: '一食堂', emoji: '🍜', price: 13, score: 4.9, queue: 8, remaining: 60, tags: ['酸辣', '口碑'], reviews: [
      { author: '小程同学', time: '2小时前', score: 5, text: '汤底酸辣够劲，虾给得很实在，雨天吃太满足了。' },
      { author: '七七', time: '昨天', score: 5, text: '米线很弹，酸味醒胃，辣度也可以自己调。' }
    ] },
    { id: 'beef', name: '小炒黄牛肉', window: '川湘小炒', canteen: '二食堂', emoji: '🍛', price: 18, score: 4.9, queue: 16, remaining: 35, tags: ['热榜', '香辣'], reviews: [
      { author: '饭饭同学', time: '1小时前', score: 5, text: '锅气足，牛肉嫩，真的很下饭。' }
    ] },
    { id: 'salad', name: '炙烤牛肉轻食碗', window: '轻食研究所', canteen: '三食堂', emoji: '🥗', price: 19, score: 4.7, queue: 5, remaining: 28, tags: ['新品', '低卡'], reviews: [
      { author: 'Yoyo', time: '3小时前', score: 5, text: '蔬菜新鲜，牛肉有炭烤香，酱可以另外放。' }
    ] },
    { id: 'rice', name: '菌菇鸡腿饭', window: '6号快餐', canteen: '一食堂', emoji: '🍱', price: 12, score: 4.5, queue: 3, remaining: 64, tags: ['少排队', '实惠'], reviews: [
      { author: '小叶', time: '今天', score: 4, text: '出餐快，鸡腿入味，赶课的时候很合适。' }
    ] },
    { id: 'sweet', name: '糖醋里脊', window: '3号窗口', canteen: '一食堂', emoji: '🥘', price: 15, score: 3.2, queue: 4, remaining: 50, tags: ['避雷提醒'], reviews: [
      { author: '南南', time: '今天', score: 3, text: '这批酱汁偏甜，喜欢酸口的同学可以谨慎选择。' }
    ] }
  ];
  const byId = Object.fromEntries(dishes.map(dish => [dish.id, dish]));
  const initialState = { favorites: ['noodles', 'beef'], reviews: [], invites: [], joined: [], tastes: ['无辣不欢', '鸡肉优先', '面食控'] };
  const storageKey = 'fandian-prototype-v2';
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(storageKey) || '{}') || {}; } catch (_) { saved = {}; }
  const state = { ...initialState, ...saved };
  for (const key of Object.keys(initialState)) if (!Array.isArray(state[key])) state[key] = [...initialState[key]];
  let selectedDish = 'chicken';
  let rating = 5;
  let currentFilter = '综合热榜';
  let currentChip = '今日推荐';
  let sortByScore = false;
  let toastTimer;
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const escapeHtml = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
  const icon = (name, size = 20) => {
    const paths = {
      search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.8-3.8"/>',
      plus: '<path d="M12 5v14M5 12h14"/>',
      x: '<path d="M18 6 6 18M6 6l12 12"/>',
      heart: '<path d="M20.8 5.8a5 5 0 0 0-7.1 0L12 7.5l-1.7-1.7a5 5 0 0 0-7.1 7.1L12 21l8.8-8.1a5 5 0 0 0 0-7.1z"/>',
      clock: '<circle cx="12" cy="12" r="8"/><path d="M12 7v5l3 2"/>',
      sliders: '<path d="M4 6h16M4 12h16M4 18h16"/><circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="11" cy="18" r="1.5"/>',
      chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
      pin: '<path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
      chevron: '<path d="m9 18 6-6-6-6"/>'
    };
    return `<svg class="lucide" viewBox="0 0 24 24" width="${size}" height="${size}" aria-hidden="true">${paths[name]}</svg>`;
  };
  const persist = () => { try { localStorage.setItem(storageKey, JSON.stringify(state)); } catch (_) { /* Session-only fallback. */ } };
  const notice = message => {
    const toast = $('#toast');
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
  };
  const closeModal = () => { $('#overlay').classList.remove('open'); $('#sheet').innerHTML = ''; };
  const header = title => `<div class="handle"></div><div class="sheethead"><h2>${escapeHtml(title)}</h2><button class="close" data-action="close" aria-label="关闭">${icon('x', 18)}</button></div>`;
  const userReviews = id => state.reviews.filter(review => review.dishId === id);
  const allReviews = id => [...userReviews(id), ...byId[id].reviews];
  const reviewMarkup = review => `<div class="comment"><b>${escapeHtml(review.author)}</b><span class="byline"> · ${escapeHtml(review.time)} · <span class="star">${'★'.repeat(review.score)}</span></span><p>${escapeHtml(review.text)}</p></div>`;
  const dishResult = dish => `<button class="result" data-action="detail" data-dish="${dish.id}"><i class="icon">${dish.emoji}</i><span class="info"><b>${escapeHtml(dish.name)}</b><p>${escapeHtml(dish.canteen)} · ${escapeHtml(dish.window)} · ${dish.score.toFixed(1)} 分</p></span>${icon('chevron', 15)}</button>`;
  const searchResults = query => {
    const value = query.trim().toLocaleLowerCase();
    const matches = dishes.filter(dish => `${dish.name} ${dish.window} ${dish.canteen} ${dish.tags.join(' ')}`.toLocaleLowerCase().includes(value));
    return matches.length ? matches.map(dishResult).join('') : '<p class="empty">没有找到相关菜品，试试窗口名或食堂名。</p>';
  };
  const modalTemplates = {
    search: () => `${header('搜索食堂好味道')}<label class="field">${icon('search', 23)}<input id="dishQuery" type="search" autocomplete="off" placeholder="搜索菜品、窗口或食堂" aria-label="搜索菜品、窗口或食堂"></label><div class="search-results" id="searchResults">${searchResults('')}</div>`,
    detail: () => {
      const dish = byId[selectedDish];
      const savedDish = state.favorites.includes(dish.id);
      const stars = '★'.repeat(Math.round(dish.score)) + '☆'.repeat(5 - Math.round(dish.score));
      return `${header(dish.name)}<div class="cover">${dish.emoji}</div><div><span class="pill">${escapeHtml(dish.canteen)} · ${escapeHtml(dish.window)}</span><span class="pill">¥${dish.price}</span><span class="pill">排队约 ${dish.queue} 分钟</span></div><div class="sect"><h3>${dish.score.toFixed(1)} <span class="star">${stars}</span></h3><span class="meta">${dish.remaining} 份 · 演示数据</span></div>${allReviews(dish.id).map(reviewMarkup).join('')}<div class="detail-actions"><button class="secondary ${savedDish ? 'is-saved' : ''}" data-action="favorite" data-dish="${dish.id}">${icon('heart', 17)} ${savedDish ? '已收藏' : '收藏'}</button><button class="primary" data-action="compose" data-dish="${dish.id}">写点评</button></div>`;
    },
    reviews: () => `${header(`${byId[selectedDish].name}的点评`)}${allReviews(selectedDish).map(reviewMarkup).join('')}<button class="primary" data-action="compose" data-dish="${selectedDish}">写点评</button>`,
    compose: () => `${header('写一条真实点评')}<label class="form-label" for="dishSelect">评价菜品</label><select id="dishSelect">${dishes.map(dish => `<option value="${dish.id}" ${dish.id === selectedDish ? 'selected' : ''}>${escapeHtml(dish.name)} · ${escapeHtml(dish.window)}</option>`).join('')}</select><span class="form-label">这顿饭怎么样？</span><div class="stars" role="group" aria-label="评分">${[1,2,3,4,5].map(number => `<button type="button" class="${number <= rating ? 'on' : ''}" data-action="rate" data-rate="${number}" aria-label="${number}星">★</button>`).join('')}</div><textarea id="reviewText" maxlength="300" placeholder="写下真实感受，让下一位同学少踩雷…"></textarea><div class="form-error" id="formError" role="alert"></div><button class="primary" data-action="publish">发布点评</button>`,
    invite: () => `${header('发起饭搭子邀请')}<label class="form-label" for="inviteText">你打算什么时候、去哪里吃？</label><textarea id="inviteText" maxlength="120" placeholder="例如：12:35 想去二食堂试试烤鸡饭，一起吗？"></textarea><div class="form-error" id="formError" role="alert"></div><button class="primary" data-action="publish-invite">发布邀请</button>`,
    favorites: () => `${header('我的收藏')}${state.favorites.length ? state.favorites.map(id => byId[id] && dishResult(byId[id])).filter(Boolean).join('') : '<p class="empty">还没有收藏，去发现页找一道想吃的菜吧。</p>'}`,
    history: () => `${header('吃过的菜')}${state.reviews.length ? state.reviews.map(review => byId[review.dishId] && `<button class="result" data-action="detail" data-dish="${review.dishId}"><i class="icon">${byId[review.dishId].emoji}</i><span class="info"><b>${escapeHtml(byId[review.dishId].name)}</b><p>你给了 ${review.score} 星 · ${escapeHtml(review.time)}</p></span>${icon('chevron', 15)}</button>`).filter(Boolean).join('') : '<p class="empty">发布第一条点评后，吃过的菜会出现在这里。</p>'}`,
    settings: () => `${header('口味偏好')}<p class="report-note">选择你喜欢的口味，首页会据此调整推荐。</p><div class="choice-row">${['无辣不欢','鸡肉优先','面食控','低脂轻食','少排队'].map(taste => `<button class="choice ${state.tastes.includes(taste) ? 'selected' : ''}" data-action="taste" data-taste="${taste}" aria-pressed="${state.tastes.includes(taste)}">${taste}</button>`).join('')}</div><button class="primary" data-action="save-tastes">保存偏好</button>`,
    report: () => `${header('本周饭报')}<div class="report-grid"><div><b>${state.reviews.length}</b><span>你发布的点评</span></div><div><b>${state.favorites.length}</b><span>收藏的菜品</span></div></div><p class="report-note">这是一份基于当前原型操作生成的本地记录。继续探索食堂，报告会随你的点评和收藏更新。</p>`,
    warnings: () => `${header('避雷提醒')}<p class="report-note">来自同学点评的口味提示。每个人喜好不同，可以先看具体评价再决定。</p>${dishResult(byId.sweet)}${byId.sweet.reviews.map(reviewMarkup).join('')}`,
    reason: () => `${header('为什么推荐这道菜？')}<p class="report-note">根据你选的口味偏好「${escapeHtml(state.tastes.join('、') || '暂未设置')}」，结合这道菜的模拟评分和排队时间，推荐你今天尝试 ${escapeHtml(byId[selectedDish].name)}。</p><button class="primary" data-action="detail" data-dish="${selectedDish}">查看菜品详情</button>`
  };
  const openModal = (name, dishId) => {
    if (dishId && byId[dishId]) selectedDish = dishId;
    if (!modalTemplates[name]) return;
    $('#sheet').innerHTML = modalTemplates[name]();
    $('#overlay').classList.add('open');
    $('#overlay').setAttribute('role', 'dialog');
    $('#overlay').setAttribute('aria-modal', 'true');
    $('#sheet').scrollTop = 0;
    if (name === 'search') $('#dishQuery').focus();
  };
  const switchPage = name => {
    if (!['home', 'discover', 'mates', 'profile'].includes(name)) return;
    $$('.page').forEach(page => page.classList.toggle('active', page.id === name));
    $$('.nav[data-nav]').forEach(button => button.classList.toggle('active', button.dataset.nav === name));
    $('#scroll').scrollTop = 0;
    closeModal();
    if (name === 'profile') renderProfile();
  };
  const filteredDishes = () => {
    let items = dishes.filter(dish => dish.id !== 'sweet');
    if (currentFilter === '新品尝鲜') items = items.filter(dish => dish.tags.includes('新品'));
    if (currentFilter === '人气窗口') items = items.filter(dish => dish.score >= 4.8);
    if (currentFilter === '低卡专区') items = items.filter(dish => dish.tags.includes('低卡'));
    return sortByScore ? [...items].sort((a,b) => b.score - a.score) : items;
  };
  const renderDiscover = () => {
    $$('#discover .filter').forEach(button => button.classList.toggle('active', button.textContent.trim() === currentFilter));
    const featured = currentFilter === '低卡专区' ? byId.salad : currentFilter === '新品尝鲜' ? byId.chicken : byId.beef;
    $('#discover .banner h3').textContent = `${currentFilter === '低卡专区' ? '低卡之选' : currentFilter === '新品尝鲜' ? '新菜尝鲜' : '本周口碑榜'} · ${featured.name}`;
    $('#discover .banner p').textContent = `${featured.canteen} · ${featured.window} · ${featured.score.toFixed(1)} 分`;
    const list = $('#discover .list');
    list.innerHTML = `<div class="sect"><h3>${escapeHtml(currentFilter)}</h3><button class="text" data-action="sort">${sortByScore ? '按推荐排序' : '按评分排序'}</button></div>${filteredDishes().map((dish, index) => `<button class="rank" data-action="detail" data-dish="${dish.id}"><b class="num">${String(index + 1).padStart(2,'0')}</b><i class="icon">${dish.emoji}</i><span class="info"><b>${escapeHtml(dish.window)} · ${escapeHtml(dish.name)}</b><p>${escapeHtml(dish.canteen)} · 排队约 ${dish.queue} 分钟</p></span><b class="score">${dish.score.toFixed(1)}</b></button>`).join('')}`;
  };
  const mateRows = [
    { id: 'lin', avatar: '👩🏻', name: '林小满', text: '想吃川湘小炒 · 12:20 出发' },
    { id: 'hao', avatar: '🧑🏻', name: '阿浩', text: '二食堂 8号窗口 · 可帮带一份' },
    { id: 'yoyo', avatar: '👩🏼', name: 'Yoyo', text: '轻食研究所 · 一起拼单减 3 元' }
  ];
  let mateOffset = 0;
  const renderMates = () => {
    const rows = [...state.invites.map((invite, index) => ({ id: `mine-${index}`, avatar: '🧑🏻‍🎓', name: '我发起的邀约', text: invite.text })), ...mateRows];
    const ordered = [...rows.slice(mateOffset), ...rows.slice(0,mateOffset)];
    $('#mates .list').innerHTML = `<div class="sect"><h3>正在等饭的同学</h3><button class="text" data-action="refresh-mates">刷新</button></div>${ordered.map(mate => `<article class="mate"><i class="avatar">${mate.avatar}</i><span class="info"><b>${escapeHtml(mate.name)}</b><p>${escapeHtml(mate.text)}</p></span>${mate.id.startsWith('mine-') ? '<span class="meta">已发布</span>' : `<button class="join ${state.joined.includes(mate.id) ? 'joined' : ''}" data-action="join" data-mate="${mate.id}">${state.joined.includes(mate.id) ? '已加入' : '加入'}</button>`}</article>`).join('')}`;
  };
  const renderProfile = () => {
    $('#profile .intro p').textContent = `海川大学 · 记录了 ${state.reviews.length} 次好好吃饭`;
    const numbers = $$('#profile .stats b');
    if (numbers.length === 3) { numbers[0].textContent = state.reviews.length; numbers[1].textContent = state.favorites.length; numbers[2].textContent = state.joined.length; }
    const labels = $$('#profile .stats div');
    if (labels[2]) labels[2].innerHTML = `<b>${state.joined.length}</b>已加入`;
  };
  const renderHomeReviewCount = () => {
    const summary = $('#home .review span[style]');
    if (summary) summary.textContent = ` ${byId.noodles.score.toFixed(1)} · ${allReviews('noodles').length}条点评`;
  };
  const renderHomePick = () => {
    const chosen = currentChip === '限时新品' ? byId.salad : currentChip === '少排队' ? byId.rice : state.tastes.includes('低脂轻食') ? byId.salad : byId.chicken;
    selectedDish = chosen.id;
    $('#home .today h2').innerHTML = `${escapeHtml(chosen.name)}<br>今天刚好有`;
    $('#home .today p').textContent = `${chosen.canteen} · ${chosen.window} · 排队约 ${chosen.queue} 分钟`;
    const food = $('#home .food'); food.textContent = chosen.emoji; food.dataset.dish = chosen.id;
    $$('#home .chip').forEach(button => button.classList.toggle('active', button.textContent.includes(currentChip)));
  };
  const updateIconsAndPaths = () => {
    $('#home .status span:first-child').innerHTML = `${icon('pin', 14)}<span>海川大学 · 东校区</span>`;
    $('#home .status > span:last-child').textContent = new Intl.DateTimeFormat('zh-CN', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date());
    $('#home .search').innerHTML = `${icon('search', 23)}<span>搜菜品、窗口或同学的神评</span>`;
    $('#home .search').setAttribute('aria-label', '搜索菜品、窗口或食堂');
    $('#discover .round').innerHTML = icon('search', 21);
    $('#discover .round').setAttribute('aria-label', '搜索');
    $('#mates .round').innerHTML = icon('plus', 21);
    $('#mates .round').setAttribute('aria-label', '发起饭搭子邀请');
    $('.bottom .add').setAttribute('aria-label', '写点评');
    $$('#profile .row i').forEach((target,index) => target.innerHTML = icon(['heart','clock','sliders','chart'][index],17));
    $$('#home .win').forEach((button,index) => button.dataset.dish = ['chicken','noodles','salad','beef'][index]);
    $('#home .win:nth-child(2) span').textContent = '⭐4.9 分';
    $('#home .review').dataset.dish = 'noodles';
    $('#home .radar p').textContent = '3号窗口的糖醋里脊偏甜，有同学提醒爱吃酸口的同学慎点。';
    const allReviewsButton = $$('#home .text').find(button => button.textContent.includes('全部点评'));
    if (allReviewsButton) { allReviewsButton.dataset.action = 'reviews'; allReviewsButton.dataset.dish = 'noodles'; }
    const reasonButton = $('#home .today [data-toast]');
    if (reasonButton) { reasonButton.dataset.action = 'reason'; reasonButton.removeAttribute('data-toast'); }
    const bannerButton = $('#mates .banner button');
    if (bannerButton) { bannerButton.dataset.action = 'see-mates'; bannerButton.removeAttribute('data-toast'); }
    const reportButton = $$('#profile .row').find(button => button.textContent.includes('本周饭报'));
    if (reportButton) { reportButton.dataset.action = 'report'; reportButton.removeAttribute('data-toast'); }
  };
  const setError = message => { const node = $('#formError'); if (node) node.textContent = message; };
  const publishReview = () => {
    const content = $('#reviewText').value.trim();
    if (content.length < 5) return setError('请至少写 5 个字，分享具体的用餐感受。');
    const id = $('#dishSelect').value;
    state.reviews.unshift({ dishId: id, author: '陈同学', time: '刚刚', score: rating, text: content });
    selectedDish = id;
    persist(); renderProfile(); renderHomeReviewCount(); openModal('detail', id); notice('点评已保存到本机');
  };
  const publishInvite = () => {
    const content = $('#inviteText').value.trim();
    if (content.length < 8) return setError('请写明时间和地点，至少 8 个字。');
    state.invites.unshift({ text: content });
    mateOffset = 0; persist(); renderMates(); switchPage('mates'); notice('邀约已保存到本机');
  };
  const handleClick = event => {
    const target = event.target.closest('button');
    if (!target) { if (event.target === $('#overlay')) { event.stopPropagation(); closeModal(); } return; }
    const action = target.dataset.action;
    const destination = target.dataset.nav;
    const opening = target.dataset.open;
    const chip = target.closest('.chip');
    const filter = target.closest('.filter');
    if (!action && !destination && !opening && !chip && !filter && !target.dataset.toast) return;
    event.preventDefault(); event.stopPropagation();
    if (destination) return switchPage(destination);
    if (action === 'close' || target.classList.contains('close')) return closeModal();
    if (action === 'detail') return openModal('detail', target.dataset.dish);
    if (action === 'reviews') return openModal('reviews', target.dataset.dish);
    if (action === 'compose') { rating = 5; return openModal('compose', target.dataset.dish); }
    if (action === 'reason') return openModal('reason', $('#home .food').dataset.dish || 'chicken');
    if (action === 'favorite') {
      const id = target.dataset.dish;
      state.favorites = state.favorites.includes(id) ? state.favorites.filter(item => item !== id) : [...state.favorites,id];
      persist(); renderProfile(); openModal('detail', id); return notice(state.favorites.includes(id) ? '已加入收藏' : '已取消收藏');
    }
    if (action === 'rate') { rating = Number(target.dataset.rate); $$('#sheet [data-rate]').forEach(button => button.classList.toggle('on', Number(button.dataset.rate) <= rating)); return; }
    if (action === 'publish') return publishReview();
    if (action === 'publish-invite') return publishInvite();
    if (action === 'join') {
      const id = target.dataset.mate;
      state.joined = state.joined.includes(id) ? state.joined.filter(item => item !== id) : [...state.joined,id];
      persist(); renderMates(); return notice(state.joined.includes(id) ? '已加入饭搭子邀约' : '已退出邀约');
    }
    if (action === 'refresh-mates') { mateOffset = (mateOffset + 1) % (mateRows.length + state.invites.length); renderMates(); return; }
    if (action === 'see-mates') { const node = $('#mates .mate'); if (node) node.scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
    if (action === 'sort') { sortByScore = !sortByScore; renderDiscover(); return; }
    if (action === 'taste') { target.classList.toggle('selected'); target.setAttribute('aria-pressed', target.classList.contains('selected')); return; }
    if (action === 'save-tastes') { state.tastes = $$('#sheet .choice.selected').map(button => button.dataset.taste); persist(); closeModal(); renderHomePick(); return notice('口味偏好已保存'); }
    if (action === 'report') return openModal('report');
    if (opening) {
      if (opening === 'detail') return openModal('detail', target.dataset.dish || 'chicken');
      if (opening === 'compose') { rating = 5; return openModal('compose', target.dataset.dish || selectedDish); }
      return openModal(opening);
    }
    if (chip) { currentChip = chip.textContent.trim().replace(/^🍜\s*/,''); if (currentChip === '避雷榜') { $$('#home .chip').forEach(button => button.classList.toggle('active', button === chip)); return openModal('warnings'); } renderHomePick(); return; }
    if (filter) { currentFilter = filter.textContent.trim(); renderDiscover(); return; }
    if (target.dataset.toast) return notice(target.dataset.toast);
  };
  document.addEventListener('click', handleClick, true);
  document.addEventListener('input', event => {
    if (event.target.id === 'dishQuery') $('#searchResults').innerHTML = searchResults(event.target.value);
    if (event.target.id === 'reviewText' || event.target.id === 'inviteText') setError('');
  });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && $('#overlay').classList.contains('open')) closeModal(); });
  updateIconsAndPaths(); renderDiscover(); renderMates(); renderProfile(); renderHomeReviewCount(); renderHomePick();
})();
