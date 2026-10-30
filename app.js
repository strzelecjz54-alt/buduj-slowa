import { getVolume, setVolume } from './audio-settings.js?v=10';
import { soundsEnabled, toggleSounds, playAnswerSound } from './answer-sounds.js?v=10';
import { phrases } from './data.js?v=10';
import { shuffled, optionsFor, recordAnswer, lessonDone, pointsForMistakes, reviewQuestions } from './learning.js?v=10';
const languages = {ru:{name:'Rosyjski',flag:'🇷🇺',code:'ru-RU'},en:{name:'Angielski',flag:'🇬🇧',code:'en-GB'},de:{name:'Niemiecki',flag:'🇩🇪',code:'de-DE'}};
let stats={cards:{},xp:0}, lang='ru', view='home', session=null, query='', category='Wszystkie', soundPanel=false;
try { const s=JSON.parse(localStorage.getItem('buduj-slowa-v1')); if(s?.cards && Number.isFinite(s.xp)) stats=s; const l=localStorage.getItem('buduj-lang'); if(languages[l])lang=l; } catch {}
const root=document.querySelector('#app');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function save(){try{localStorage.setItem('buduj-slowa-v1',JSON.stringify(stats));localStorage.setItem('buduj-lang',lang);}catch{notice('Pamięć telefonu jest niedostępna. Postęp z tej sesji nie zostanie zapisany.');}}
function notice(message){document.querySelector('#notice').textContent=message;}
let speechRequest = 0;
function speak(id) {
  const p = phrases.find(p => p.id === Number(id));
  if (p) speakText(p[lang]);
}
function stopSpeech() {
  speechRequest++;
  if ('speechSynthesis' in window) speechSynthesis.cancel();
}
function speakText(text) {
  if (!('speechSynthesis' in window)) {
    notice('Ta przeglądarka nie obsługuje odsłuchu.');
    return;
  }
  const request = ++speechRequest;
  notice('');
  // Android can expose an empty or incomplete voice list even when speech works.
  // Let the system select the requested language if no matching voice is listed.
  const voice = speechSynthesis.getVoices().find(v => v.lang.toLowerCase().split(/[-_]/)[0] === lang);
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text.split(' / ')[0]);
  utterance.lang = languages[lang].code;
  if (voice) utterance.voice = voice;
  utterance.rate = .8;
  utterance.volume = getVolume('speech');
  utterance.onstart = () => { if (request === speechRequest) notice(''); };
  utterance.onerror = event => {
    if (request !== speechRequest || ['canceled', 'interrupted'].includes(event.error)) return;
    notice('Nie udało się odtworzyć wymowy. Spróbuj ponownie lub sprawdź głosy w ustawieniach telefonu.');
  };
  speechSynthesis.speak(utterance);
}
function header(){return `<header><a href="#" class="brand" data-action="home"><span class="logo">▦</span> buduj<span>słowa</span></a><div class="header-actions"><button class="sound-toggle" data-action="audio-panel" aria-label="Ustawienia głośności" aria-expanded="${soundPanel}" aria-controls="audio-panel">♫<span>Głośność</span></button><span class="xp">✦ ${stats.xp} XP</span></div></header><section id="audio-panel" class="audio-panel" ${soundPanel?'':'hidden'} aria-label="Ustawienia głośności"><h2>Ustaw dźwięk po swojemu</h2><small class="app-version">Wersja 10</small><label for="speech-volume">Głośność wymowy <output id="speech-value" for="speech-volume">${Math.round(getVolume('speech')*100)}%</output></label><input id="speech-volume" data-volume="speech" type="range" min="0" max="100" step="5" value="${getVolume('speech')*100}"><button class="audio" data-speak="0">Posłuchaj przykładu · ${languages[lang].name}</button><label for="effects-volume">Dźwięki odpowiedzi <output id="effects-value" for="effects-volume">${Math.round(getVolume('effects')*100)}%</output></label><input id="effects-volume" data-volume="effects" type="range" min="0" max="100" step="5" value="${getVolume('effects')*100}"><div class="volume-actions"><button class="audio" data-action="preview-sound">Sprawdź dźwięk</button><button class="text-button" data-action="toggle-sounds" aria-pressed="${soundsEnabled()}">${soundsEnabled()?'Wycisz odpowiedzi':'Włącz odpowiedzi'}</button></div><p>Suwaki działają niezależnie i zapisują się automatycznie. Głośność wymowy domyślnie pozostaje na 100%. Jeśli jest za cicho, sprawdź też głośność multimediów telefonu.</p></section>`;}

function navigation(){return `<nav aria-label="Menu główne">${[['home','⌂','Nauka'],['dictionary','▤','Słownik'],['correction','↺','Poprawka'],['review','↻','Powtórka'],['help','＋','Na telefon']].map(([v,i,t])=>`<button data-view="${v}" class="${view===v?'active':''}"><span>${i}</span>${t}</button>`).join('')}</nav>`;}
function languageTabs(){return `<div class="languages" aria-label="Język nauki">${Object.entries(languages).map(([key,l])=>`<button data-lang="${key}" aria-pressed="${lang===key}">${l.flag} ${l.name}</button>`).join('')}</div>`;}
function home(){const mastered=phrases.slice(0,20).filter(p=>stats.cards[`${lang}:${p.id}`]?.hits>0).length;return `<div class="eyebrow">TWÓJ JĘZYK. TWOJA BUDOWA.</div><h1>Małe lekcje.<br>Więcej pewności.</h1><p class="intro">Zwroty, których naprawdę użyjesz w pracy.<br>Wybierz język i zacznij od 5 słów dziennie.</p>${languageTabs()}<section class="progress-card"><div><span class="eyebrow">PIERWSZY CEL</span><h2>20 najważniejszych zwrotów</h2><p>${mastered} z 20 przećwiczonych poprawnie · ${languages[lang].name}</p></div><strong>${Math.round(mastered/20*100)}<small>%</small></strong><progress max="20" value="${mastered}" aria-label="Postęp pierwszych 20 zwrotów"></progress></section><div class="section-title"><h2>Twoja ścieżka</h2><span>4 krótkie lekcje</span></div><div class="lessons">${[0,1,2,3].map(i=>{const ids=phrases.slice(i*5,i*5+5).map(p=>p.id);const done=lessonDone(stats,lang,ids);return `<button class="lesson" data-lesson="${i}"><span class="lesson-number ${done?'done':''}">${done?'✓':String(i+1).padStart(2,'0')}</span><span><small>LEKCJA ${i+1} · 5 ZWROTÓW</small><b>${['Pierwsze komendy','Kieruj ruchem','Jeszcze kawałek','Na Twój znak'][i]}</b><em>${['Ruszaj spokojnie i bez pośpiechu','Stop, przód, tył i kierunki','Precyzyjne wskazówki dla kierowcy','Czekanie, miejsca i sygnały'][i]}</em></span><span class="arrow">→</span></button>`;}).join('')}</div><p class="footnote">Bez presji i bez utraty żyć. Błędy wracają w Poprawce.</p>`;}
function startLesson(index,review=false){const pool=review?phrases.filter(p=>stats.cards[`${lang}:${p.id}`]?.review):phrases.slice(index*5,index*5+5);if(!pool.length){notice('Nie masz teraz zwrotów do poprawki.');return;}session={queue:[...pool],initial:pool.length,phase:'learn',at:0,correct:0,attempts:0,answered:false,eliminated:[],options:null,review};view='lesson';render();}
function lesson(){if(session.phase==='complete')return `<section class="completion"><div class="big-icon">✦</div><div class="eyebrow">DOBRA ROBOTA!</div><h1>Kolejny krok<br>za Tobą.</h1><p>Poprawne odpowiedzi: ${session.correct} z ${session.attempts} prób.</p><p>+${session.earnedXP || 0} XP · ${languages[lang].name}</p><button class="primary" data-action="home">Wróć do nauki →</button></section>`;const p=session.queue[session.at];const learning=session.phase==='learn';const total=session.queue.length;return `<div class="lesson-top"><button class="text-button" data-action="exit">← Zakończ ćwiczenie</button><span>${learning?'POZNAJ ZWROT':'SPRAWDŹ SIĘ'} ${session.at+1}/${total}</span></div><progress max="${total}" value="${session.at}" aria-label="Postęp lekcji"></progress><section class="exercise"><div class="eyebrow">${learning?'ZAPAMIĘTAJ I POWIEDZ NA GŁOS':'WYBIERZ TŁUMACZENIE'}</div><h1>${esc(p.pl)}</h1>${learning?`<div class="translation"><h2 lang="${lang}">${esc(p[lang])}</h2><button class="audio" data-speak="${p.id}">◖)) Posłuchaj</button></div><button class="primary" data-action="learn-next">${session.at===total-1?'Zaczynam quiz':'Dalej'} →</button>`:`<div class="answers">${session.options.map((o,i)=>session.eliminated.includes(i)?'':`<button data-answer="${i}" ${session.answered?'disabled':''} class="${session.answered&&o===p[lang]?'correct':''} ${session.answered&&i===session.selected&&o!==p[lang]?'wrong':''}"><span>${i+1}</span>${esc(o)}</button>`).join('')}</div>${session.feedback?`<section class="answer-result ${session.wasCorrect?'is-correct':'is-wrong'}" aria-label="Wynik odpowiedzi"><div class="feedback" role="status" aria-live="polite" aria-atomic="true"><span class="result-icon" aria-hidden="true">${session.wasCorrect?'✓':'×'}</span><div><b>${session.wasCorrect?'Dobra odpowiedź!':'Nie tym razem. Wybierz inną odpowiedź.'}</b>${session.wasCorrect?`<small>+${session.lastXP} XP</small><p lang="${lang}">${esc(p[lang])}</p>`:`<small>Spróbuj ponownie. Za poprawny wybór: ${pointsForMistakes(session.eliminated.length)} XP.</small>`}</div></div>${session.wasCorrect?`<div class="result-actions"><button class="audio" data-speak="${p.id}">◖)) Posłuchaj</button><button class="primary" data-action="quiz-next">Dalej →</button></div>`:''}</section>`:''}`}</section>`;}
function dictionary(){const items=phrases.filter(p=>(category==='Wszystkie'||p.category===category)&&[p.pl,p[lang]].join(' ').toLowerCase().includes(query.toLowerCase()));return `<div class="eyebrow">POD RĘKĄ</div><h1>Twój słownik.</h1><p class="intro">Wszystkie 139 zwrotów z Twojej listy.</p><p><a class="audio" href="exports/slownik_PL_RU_EN_DE.txt" download>Pobierz słownik TXT</a> <a class="text-button" href="exports/slownik_PL_RU_EN_DE.csv" download>CSV / Excel</a></p>${languageTabs()}<label class="search-label">Szukaj zwrotu<input id="search" type="search" placeholder="Np. dźwig, stop, jutro…" value="${esc(query)}"></label><label class="search-label">Kategoria<select id="category">${['Wszystkie',...new Set(phrases.map(p=>p.category))].map(c=>`<option ${c===category?'selected':''}>${esc(c)}</option>`).join('')}</select></label><p class="count">${items.length} zwrotów</p><div class="dictionary">${items.map(p=>`<article><small>${p.priority?'★ PIERWSZE 20':esc(p.category)}</small><h2>${esc(p.pl)}</h2><p lang="${lang}">${esc(p[lang])}</p><button class="audio" data-speak="${p.id}" aria-label="Posłuchaj: ${esc(p.pl)}">◖)) Posłuchaj</button><button class="text-button" data-practice="${p.id}">Ćwicz →</button></article>`).join('')||'<p>Brak wyników. Spróbuj innego słowa.</p>'}</div>`;}
function correction(){const items=phrases.filter(p=>stats.cards[`${lang}:${p.id}`]?.review);return `<div class="eyebrow">MAŁY WYSIŁEK, DUŻA RÓŻNICA</div><h1>Czas na poprawkę.</h1>${languageTabs()}<section class="progress-card"><h2>${items.length?'Masz '+items.length+' zwrotów do utrwalenia':'Wszystko przećwiczone!'}</h2><p>${items.length?'Tutaj wracają błędne odpowiedzi z quizów.':'Po błędnej odpowiedzi zwrot pojawi się tutaj. Możesz też wrócić do dowolnej lekcji.'}</p>${items.length?'<button class="primary" data-action="correction-start">Popraw zwroty →</button>':''}</section>`;}
function review() {
  const count = phrases.filter(p => stats.cards[`${lang}:${p.id}`]?.hits > 0).length;
  return `<div class="eyebrow">UTRWAL TO, CO JUŻ UMIESZ</div><h1>Szybka powtórka.</h1>${languageTabs()}<section class="progress-card"><h2>10 pytań · sam quiz</h2><p>${count ? `Losujemy tylko z Twoich nauczonych zwrotów w tym języku. Masz ich ${count}.` : 'Najpierw odpowiedz poprawnie na zwrot w lekcji lub słowniku — wtedy trafi do puli nauczonych.'}</p>${count > 0 && count < 10 ? '<p>Masz mniej niż 10 nauczonych zwrotów, więc część z nich powtórzy się w tej serii.</p>' : ''}${count ? '<button class="primary" data-action="review-start">Zacznij 10 pytań →</button>' : '<button class="primary" data-action="home">Przejdź do nauki →</button>'}</section><p class="footnote">10 XP bez błędu · 7 XP po 1 błędzie · 4 XP po 2 · 1 XP po 3.</p>`;
}
function startReview() {
  const queue = reviewQuestions(phrases, stats, lang);
  if (!queue.length) return;
  stopSpeech();
  session = { queue, initial: 10, phase: 'quiz', at: 0, correct: 0, attempts: 0, answered: false, eliminated: [], feedback: false, earnedXP: 0, mode: 'review', options: optionsFor(queue[0], phrases, lang) };
  view = 'lesson';
  render();
}
function help(){return `<div class="eyebrow">NAUKA ZAWSZE POD RĘKĄ</div><h1>Zabierz słowa<br>na budowę.</h1><section class="help"><h2>Dodaj na ekran telefonu</h2><p>Otwórz adres opublikowanej aplikacji w przeglądarce telefonu.</p><h3>Android · Chrome</h3><p>Dotknij menu ⋮ → „Dodaj do ekranu głównego” lub „Zainstaluj aplikację”.</p><h3>iPhone · Safari</h3><p>Dotknij przycisku udostępniania → „Do ekranu początkowego” → „Dodaj”.</p><h2>Bez konta, w Twoim tempie</h2><p>Postępy zapisują się w tej przeglądarce, osobno dla każdego języka. Usunięcie danych przeglądarki usuwa postęp. Nie jest on synchronizowany między telefonami.</p><h2>Także bez internetu</h2><p>Po pierwszym pełnym otwarciu przez HTTPS lekcje i słownik są zapisywane na telefonie. Odsłuch wymaga zainstalowanego głosu języka; część głosów potrzebuje internetu.</p><h2>Bezpieczeństwo na budowie</h2><p>To pomoc do nauki. Przy manewrach i pracy dźwigu stosujcie uzgodnione sygnały i komendy. Nie opieraj bezpieczeństwa wyłącznie na tłumaczeniu.</p></section>`;}
function render(){root.innerHTML=header()+`<main>${({home,dictionary,correction,review,help,lesson})[view]()}</main>`+(view==='lesson'?'':navigation());}
function handleAnswer(index) {
  if (session.answered || session.eliminated.includes(index)) return;
  const phrase = session.queue[session.at];
  const selected = session.options[index];
  session.selected = index;
  session.wasCorrect = selected === phrase[lang];
  session.answered = session.wasCorrect;
  session.feedback = true;
  session.attempts++;
  if (session.wasCorrect) session.correct++;
  else session.eliminated.push(index);
  session.lastXP = recordAnswer(stats, lang, phrase.id, session.wasCorrect, session.eliminated.length > 0, session.eliminated.length);
  session.earnedXP = (session.earnedXP || 0) + session.lastXP;
  save();
  playAnswerSound(session.wasCorrect);
  speakText(selected);
  render();
  requestAnimationFrame(() => {
    const target = session.wasCorrect ? document.querySelector('[data-action="quiz-next"]') : document.querySelector('[data-answer]:not(:disabled)');
    target?.focus({ preventScroll: true });
    target?.scrollIntoView({ block: 'nearest', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  });
}
root.addEventListener('click',e=>{const b=e.target.closest('button,a');if(!b)return;if(b.hasAttribute('data-lang')){stopSpeech();lang=b.dataset.lang;save();render();}else if(b.dataset.view){stopSpeech();view=b.dataset.view;render();}else if(b.hasAttribute('data-lesson'))startLesson(Number(b.dataset.lesson));else if(b.hasAttribute('data-speak'))speak(b.dataset.speak);else if(b.hasAttribute('data-practice')){session={queue:[phrases[Number(b.dataset.practice)]],initial:1,phase:'learn',at:0,correct:0,attempts:0,answered:false,eliminated:[]};view='lesson';render();}else if(b.hasAttribute('data-answer')){handleAnswer(Number(b.dataset.answer));}else switch(b.dataset.action){case'audio-panel':soundPanel=!soundPanel;render();document.querySelector('[data-action="audio-panel"]')?.focus({preventScroll:true});break;case'preview-sound':playAnswerSound(true);break;case'toggle-sounds':toggleSounds();render();document.querySelector('.sound-toggle')?.focus({preventScroll:true});break;case'home':case'exit':stopSpeech();e.preventDefault();view='home';render();break;case'correction-start':startLesson(0,true);break;case'review-start':startReview();break;case'learn-next':stopSpeech();if(++session.at===session.queue.length){session.phase='quiz';session.at=0;session.queue=shuffled(session.queue);session.options=optionsFor(session.queue[0],phrases,lang);}render();if(session.phase==='learn')speak(session.queue[session.at].id);break;case'quiz-next':if(!session.answered)return;stopSpeech();session.answered=false;session.feedback=false;session.eliminated=[];if(++session.at===session.queue.length)session.phase='complete';else session.options=optionsFor(session.queue[session.at],phrases,lang);render();break;}});
root.addEventListener('input',e=>{if(e.target.dataset.volume){const key=e.target.dataset.volume;setVolume(key,e.target.value);document.querySelector('#'+key+'-value').textContent=Math.round(getVolume(key)*100)+'%';return;}if(e.target.id==='search'){const pos=e.target.selectionStart;query=e.target.value;render();const input=document.querySelector('#search');input.focus();try{input.setSelectionRange(pos,pos);}catch{}}});
root.addEventListener('change',e=>{if(e.target.id==='category'){category=e.target.value;render();}});
if ('serviceWorker' in navigator) {
  const wasControlled = !!navigator.serviceWorker.controller;
  let reloading = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (wasControlled && !reloading && view !== 'lesson') {
      reloading = true;
      location.reload();
    }
  });
  navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' })
    .then(registration => registration.update())
    .catch(() => { /* Existing offline installation remains usable. */ });
}
render();
