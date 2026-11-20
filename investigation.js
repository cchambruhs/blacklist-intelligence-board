'use strict';

const seasonTwoClues = new Set();
const groupNodes = new Set(['Pavlovich Brothers','Cyprus Agency','Monarch Douglas Bank']);
let layoutByType = false;

function installSeasonTwo() {
  const originalSubjects=['Zamani','Freelancer','Wujing','Stewmaker','Courier','Gina','Barnes','General Ludd','Garrick','Garrick','Good Samaritan','Alchemist','Cyprus Agency','Madeline Pratt','Judge','Mako Tanida','Ivan','Milton Bobbit','Pavlovich Brothers','Kingmaker','Berlin','Berlin'];
  const caseNodes=new Set();
  episodes.forEach((episode,i)=>{
    const subject=originalSubjects[i],caseNode=episode.name+' (case)';
    episode.subject=subject;
    episode.nodes.push(caseNode);
    groupNodes.add(caseNode);
    if(!caseNodes.has(caseNode)){
      links.push([caseNode,subject,i+1,'Subject of case']);
      caseNodes.add(caseNode);
    }
  });
  for (const [title,num,recap,intel,big,subjects,evidence] of seasonTwo) {
    const names = subjects.split('|');
    const index = episodes.length + 1;
    seasonTwoClues.add(evidence);
    const caseName=title.replace(': Conclusion','');
    const caseNode=caseName+' (case)';
    groupNodes.add(caseNode);
    const nodes = [...new Set(['FBI', caseNode, ...names, evidence])];
    if(!caseNodes.has(caseNode)){
      links.push([caseNode,evidence,index,'Evidence in case']);
      caseNodes.add(caseNode);
    }
    for (const name of names) {
      links.push([name,evidence,index,'Appears in this investigation']);
    }
    links.push(['FBI',evidence,index,'Investigated']);
    episodes.push({title,name:caseName,num,recap,new:intel,big,nodes,evidence,subject:({ 'Lord Baltimore':'Nora Mills','The Front':'Maddox Beck','Tom Keen':'Tom' })[caseName] || (names.includes(caseName)?caseName:null)});
  }
  // Long-running figures receive independent nodes at their first documented appearance.
  for (const [index,names] of [
    [1,['Harold Cooper']],[2,['Dembe Zuma']],[6,['Meera Malik']],[7,['Aram Mojtabai']],
    [10,['Baz']],[11,['Mr. Kaplan']],[23,['Samar Navabi','Child Soldier #3']]
  ]) {
    for (const name of names) {
      if (!episodes[index-1].nodes.includes(name)) episodes[index-1].nodes.push(name);
      links.push([['Dembe Zuma','Baz','Mr. Kaplan','Child Soldier #3'].includes(name)?'Red':'FBI',name,index,
        name==='Child Soldier #3'?'Encounter in Cameroon':'Operational connection']);
    }
  }
  links.push(
    ['Berlin','Naomi Hyland',23,'Abducts'],['Berlin','Nora Mills',23,'Commissions search'],
    ['Nora Mills','Naomi Hyland',23,'Tracks'],['Red','Naomi Hyland',23,'Personal history'],
    ['Samar Navabi','FBI',24,'Joins the task force'],
    ['Alan Fitch','Berlin',30,'Connected by the Kursk investigation'],
    ['Luther Braxton','Liz',31,'Seeks her recollections'],
    ['The Major','Tom',37,'Recruits and handles'],
    ['Leonard Caul','The Fulcrum',41,'Deciphers'],
    ['Karakurt','Leo Andropov',43,'Linked through a covert operation']
  );
}

function episodeCode(index) {
  const season = index > 22 ? 2 : 1;
  return 'S0'+season+'E'+String(index-(season-1)*22).padStart(2,'0');
}

function renderEpisodeControls(episode) {
  $('heading').textContent = episode.title;
  $('subtitle').textContent = episodeCode(ep)+' / Unlocked through '+episodeCode(unlocked);
  $('bar').style.width = (ep / episodes.length * 100)+'%';
  $('episode').replaceChildren(...[1,2].map(season=>{
    const group=document.createElement('optgroup');
    group.label='Season '+season;
    for(let index=(season-1)*22+1;index<=Math.min(season*22,unlocked);index++){
      group.append(new Option(episodeCode(index)+' · '+episodes[index-1].title,String(index)));
    }
    return group;
  }));
  $('episode').value=String(ep);
  $('prev').disabled=ep===1;
  $('next').disabled=ep===episodes.length;
  $('next').textContent=ep===unlocked&&ep<episodes.length?'Unlock next →':'Next episode →';
  $('unlock').hidden=unlocked===episodes.length;
  $('counter').textContent=episodeCode(ep);
}

function initializeIntelligence() {
  for (const row of seasonTwo) {
    researchedEpisodeDeaths.push(row[7]);
    researchedAttributions.push(row[8]);
  }
  Object.assign(killAliases,{'Lord Baltimore':'Nora Mills','Mr. Kaplan':'Mr. Kaplan'});
  for (const profile of castProfiles) {
    if(profile.key==='FBI') profile.key=profile.character;
  }
  const profiles=[
    ['Dembe Zuma','Hisham Tawfiq','Reddington’s close associate'],
    ['Mr. Kaplan','Susan Blommaert','Reddington’s trusted fixer'],
    ['Berlin','Peter Stormare','An adversary targeting Reddington'],
    ['Samar Navabi','Mozhan Marnò','Mossad operative'],
    ['Naomi Hyland','Mary-Louise Parker','A person from Reddington’s past'],
    ['Nora Mills','Krysten Ritter','Known as Lord Baltimore'],
    ['General Yaabari','Sahr Ngaujah','An armed commander in Cameroon'],
    ['Madeline Pratt','Jennifer Ehle','A con artist with a history with Red'],
    ['Luther Braxton','Ron Perlman','Specialist in stealing classified material'],
    ['Alan Fitch','Alan Alda','Intelligence official'],
    ['Vanessa Cruz','Ana de la Reguera','Suspect in a series of staged crimes'],
    ['Leonard Caul','Ned Van Zandt','A lead in the Fulcrum investigation'],
    ['Tom Connolly','Reed Birney','Justice Department official']
  ];
  castProfiles.push(...profiles.map(([key,actor,role])=>({key,character:key==='Berlin'?'Milos Kirchoff':key,actor,role})));
  for (const episode of episodes.slice(22)) {
    for(const node of episode.nodes){
      if(node!=='FBI'&&!Object.hasOwn(descriptions,node)){
        descriptions[node]=node===episode.evidence?episode.new:'Connected to the '+episode.title+' investigation.';
      }
    }
  }
}

function profileFor(name) {
  if(name==='Berlin'&&ep<22) return undefined;
  return castProfiles.find(p=>p.key===name);
}

function visibleProfiles() {
  return castProfiles.filter(p=>graphNodes.includes(p.key)&&(p.key!=='Berlin'||ep>=22));
}

function displayEntityName(name){
  return name==='Berlin'&&ep<22?name:killName(name);
}

function entityMatches(name,query) {
  const profile=profileFor(name);
  return [name,displayEntityName(name),profile?.character,profile?.actor].filter(Boolean).some(value=>
    value.normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase().includes(query.normalize('NFD').replace(/\p{Diacritic}/gu,''))
  );
}

function inspectEntity(name) {
  if(!graphNodes.includes(name)) return;
  tab='board';selected=name;render();
}

function bindEntityButtons(host) {
  host.querySelectorAll('[data-inspect]').forEach(button=>{
    button.onclick=()=>inspectEntity(button.dataset.inspect);
  });
}

function renderCast(host) {
  const entities=graphNodes.filter(name=>kind(name)==='person').sort((a,b)=>killName(a).localeCompare(killName(b)));
  host.innerHTML='<div class="section-heading"><h2>Character files</h2><label>Search people <input type="search" id="cast-filter" placeholder="Name or actor"></label></div><div class="cast-grid" id="cast-results"></div><p class="notice">Cast portraits via TVmaze where available. Other files use initials.</p>';
  const input=$('cast-filter');
  const draw=()=>{
    $('cast-results').innerHTML=entities.filter(name=>entityMatches(name,input.value.trim().toLowerCase())).map(name=>{
      const profile=profileFor(name);
      const character=profile?.character||displayEntityName(name);
      const summary=profile?.role||descriptions[name]||'Person of interest in the available case files.';
      return '<article class="cast-card"><div class="cast-photo">'+portrait(profile||{character,actor:''})+
        '</div><div class="cast-body"><h3>'+escapeHtml(character)+killBadge(name)+'</h3>'+
        (profile?'<div class="muted">'+escapeHtml(profile.actor)+'</div>':'')+
        '<p>'+escapeHtml(summary)+'</p><button data-inspect="'+escapeHtml(name)+'">Open dossier</button></div></article>';
    }).join('')||'<p class="empty">No matching characters.</p>';
    bindEntityButtons($('cast-results'));
  };
  input.oninput=draw;
  draw();
  if(castState==='not-loaded') loadCast();
}

function renderEvidence(host) {
  host.innerHTML='<div class="section-heading"><h2>Evidence timeline</h2><label>Search evidence <input id="evidence-search" type="search"></label></div><ol class="evidence-list" id="evidence-results"></ol>';
  const input=$('evidence-search');
  const draw=()=>{
    const query=input.value.trim().toLowerCase();
    $('evidence-results').innerHTML=episodes.slice(0,ep).map((entry,index)=>({entry,index:index+1})).reverse()
      .filter(({entry})=>[entry.title,entry.evidence,entry.new,entry.big,...entry.nodes].some(value=>value?.toLowerCase().includes(query)))
      .map(({entry,index})=>'<li><article class="panel"><button class="episode-link" data-jump="'+index+'">'+episodeCode(index)+' · '+escapeHtml(entry.title)+'</button>'+
        '<h3>'+escapeHtml(entry.evidence||'Case development')+'</h3><p>'+escapeHtml(entry.new)+'</p><p class="muted">'+escapeHtml(entry.big)+'</p>'+
        '<div>'+entry.nodes.map(name=>'<button class="link-chip" data-inspect="'+escapeHtml(name)+'">'+escapeHtml(name)+killBadge(name)+'</button>').join('')+'</div></article></li>').join('')||'<li class="empty">No matching evidence.</li>';
    bindEntityButtons($('evidence-results'));
    host.querySelectorAll('[data-jump]').forEach(button=>button.onclick=()=>{tab='brief';navigate(Number(button.dataset.jump))});
  };
  input.oninput=draw;
  draw();
}

function dossier() {
  const host=$('details');
  if(!host) return;
  if(!selected){
    host.innerHTML='<h2>Relationships</h2><p class="muted">Select a node or search for a person, case, or clue.</p><p>'+graphNodes.length+' entities · '+graphEdges.length+' connections</p>';
    return;
  }
  const name=selected, profile=profileFor(name);
  const caseHistory=episodes.slice(0,ep).map((entry,index)=>({entry,index:index+1})).filter(({entry})=>entry.nodes.includes(name));
  const connections=graphEdges.filter(([a,b])=>a===name||b===name);
  host.innerHTML='<div class="kicker">'+kind(name)+'</div><div class="dossier-title">'+(profile?'<div class="priority-photo">'+portrait(profile)+'</div>':'')+
    '<h2>'+escapeHtml(profile?.character||displayEntityName(name))+killBadge(name)+'</h2></div><p>'+escapeHtml(profile?.role||descriptions[name]||'Appears in the case history below.')+'</p>'+
    '<h3>Connections</h3><ul class="relationship-list">'+connections.map(([a,b,revealed,label])=>{
      const other=a===name?b:a;
      return '<li><button class="link-chip" data-related="'+escapeHtml(other)+'">'+escapeHtml(other)+killBadge(other)+'</button>'+
        (label?'<small>'+escapeHtml(label)+' · '+episodeCode(revealed)+'</small>':'')+'</li>';
    }).join('')+'</ul><h3>Case history</h3><ul class="relationship-list">'+caseHistory.map(({entry,index})=>
      '<li><button class="episode-link" data-history="'+index+'">'+episodeCode(index)+' · '+escapeHtml(entry.title)+'</button></li>'
    ).join('')+'</ul>';
  host.querySelectorAll('[data-related]').forEach(button=>button.onclick=()=>selectNode(button.dataset.related));
  host.querySelectorAll('[data-history]').forEach(button=>button.onclick=()=>{tab='brief';navigate(Number(button.dataset.history))});
  if(castState==='not-loaded') loadCast();
}

function networkLayout(width,height) {
  const nodes=Object.create(null);
  const groups=layoutByType?['person','case','clue'].map(type=>graphNodes.filter(name=>kind(name)===type)):[graphNodes.filter(name=>name!=='Red')];
  if(!layoutByType&&graphNodes.includes('Red')) nodes.Red={x:width/2,y:height/2};
  groups.forEach((group,column)=>{
    if(layoutByType){
      group.forEach((name,index)=>{
        const columns=Math.ceil(Math.sqrt(group.length/2)),rows=Math.ceil(group.length/columns);
        nodes[name]={x:width/3*column+width/3*(index%columns+.5)/columns,y:60+(height-120)*(Math.floor(index/columns)+.5)/rows};
      });
      return;
    }
    const rings=[8,16,24,32];
    const lastRing=rings.findIndex((_,i)=>rings.slice(0,i+1).reduce((a,b)=>a+b,0)>=group.length);
    const visibleRings=lastRing<0?rings.length+1:Math.max(1,lastRing+1);
    let offset=0;
    rings.forEach((capacity,ring)=>{
      const count=Math.min(capacity,group.length-offset);
      const radius=(ring+1)/visibleRings;
      for(let i=0;i<count;i++){
        const angle=2*Math.PI*i/count+ring*.21;
        nodes[group[offset+i]]={x:width/2+Math.cos(angle)*(width/2-100)*radius,y:height/2+Math.sin(angle)*(height/2-60)*radius};
      }
      offset+=count;
    });
    group.slice(offset).forEach((name,index)=>{
      const angle=2*Math.PI*index/(group.length-offset);
      nodes[name]={x:width/2+Math.cos(angle)*(width/2-66),y:height/2+Math.sin(angle)*(height/2-38)};
    });
  });
  return nodes;
}

function updateGraphMatches() {
  let host=$('graph-matches');
  if(!host){
    host=document.createElement('div');
    host.id='graph-matches';
    host.className='graph-matches';
    $('graph').before(host);
  }
  const query=$('graph-search').value.trim().toLowerCase(),type=$('graph-category').value;
  const matches=graphNodes.filter(name=>(type==='all'||kind(name)===type)&&entityMatches(name,query));
  host.hidden=!query;
  host.innerHTML=query ? matches.map(name=>'<button class="link-chip" data-match="'+escapeHtml(name)+'">'+escapeHtml(graphLabel(name))+'</button>').join('')||'<p class="muted">No matching entities.</p>' : '';
  host.querySelectorAll('[data-match]').forEach(button=>button.onclick=()=>{
    selected=button.dataset.match;
    applyFilters();dossier();
    $('details').scrollIntoView({block:'nearest'});
  });
}

function portrait(profile) {
  const normalized=value=>value.normalize('NFD').replace(/[^a-z]/gi,'').toLowerCase();
  const match=profile.actor&&castRemote.find(entry=>normalized(entry.person?.name||'')===normalized(profile.actor));
  const src=match?.person?.image?.medium;
  const initials=profile.character.split(/\s+/).slice(0,2).map(word=>word[0]).join('');
  return '<div class="portrait-fallback" aria-hidden="true">'+escapeHtml(initials)+'</div>'+
    (/^https:\/\/static\.tvmaze\.com\//.test(src||'')?'<img loading="lazy" alt="'+escapeHtml(profile.actor)+'" src="'+escapeHtml(src)+'">':'');
}

function refreshCastPortraits() {
  $('cast-results')?.querySelectorAll('[data-inspect]').forEach(button=>{
    const profile=profileFor(button.dataset.inspect);
    if(profile) button.closest('.cast-card').querySelector('.cast-photo').innerHTML=portrait(profile);
  });
}

function renderRegistry(host) {
  const cases=episodes.slice(0,ep).map((entry,index)=>({entry,index:index+1}))
    .filter(({entry},i,all)=>all.findIndex(item=>item.entry.name===entry.name)===i)
    .sort((a,b)=>(a.entry.num??Infinity)-(b.entry.num??Infinity));
  host.innerHTML='<div class="panel"><div class="section-heading"><h2>Blacklist registry</h2><label>Find a case <input id="registry-search" type="search" placeholder="Name or Blacklist number"></label></div><div id="registry-results" class="grid"></div></div>';
  const input=$('registry-search');
  const draw=()=>{
    const query=input.value.trim().toLowerCase().replace(/^(?:no\.?\s*|#)/,'');
    $('registry-results').innerHTML=cases.filter(({entry,index})=>[entry.name,entry.num,episodeCode(index)].some(value=>String(value??'').toLowerCase().includes(query)))
      .map(({entry,index})=>'<article class="case"><span class="tag">NO. '+(entry.num??'UNASSIGNED')+'</span><strong>'+escapeHtml(entry.name)+
        (entry.subject?killBadge(entry.subject):'')+'</strong><p>'+escapeHtml(entry.new)+'</p><button class="episode-link" data-case="'+index+'">'+episodeCode(index)+' briefing</button></article>').join('')||'<p class="empty">No matching cases.</p>';
    host.querySelectorAll('[data-case]').forEach(button=>button.onclick=()=>{tab='brief';navigate(Number(button.dataset.case))});
  };
  input.oninput=draw;
  draw();
}
