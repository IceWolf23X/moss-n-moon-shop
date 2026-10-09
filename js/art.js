/* Original, dependency-free interface icons and illustrative voxel vignettes.
 * These are NOT screenshots of real server shops. Real photos can be supplied in shops/<shop>.yml.
 */
(function(root){
  'use strict';
  const paths={
    search:'<circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.5 4.5"/>',
    arrow:'<path d="M4 12h15m-6-6 6 6-6 6"/>',
    chevron:'<path d="m8 5 7 7-7 7"/>',
    down:'<path d="m6 9 6 6 6-6"/>',
    plus:'<path d="M12 5v14M5 12h14"/>',
    close:'<path d="m6 6 12 12M18 6 6 18"/>',
    check:'<path d="m5 12 4 4L19 6"/>',
    heart:'<path d="M20.3 4.8a5.2 5.2 0 0 0-7.3 0L12 5.9l-1-1.1a5.2 5.2 0 0 0-7.3 7.4L12 21l8.3-8.8a5.2 5.2 0 0 0 0-7.4Z"/>',
    pin:'<path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2.5"/>',
    moon:'<path d="M20 14A8.5 8.5 0 0 1 10 4a8.5 8.5 0 1 0 10 10Z"/>',
    sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',
    leaf:'<path d="M20 3C6 2 2 10 6 16s14 3 14-13Z"/><path d="M4 21 16 9m-7 7-1-6m6 1 4 1"/>',
    sprout:'<path d="M12 21v-9M12 13C4 14 3 8 3 5c7 0 9 3 9 8ZM12 10c0-6 5-7 9-7 0 6-3 8-9 7Z"/>',
    blocks:'<path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Zm-8 4.5L12 12l8-4.5M12 12v9M8 5.2l8 4.6"/>',
    cube:'<path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Zm-8 4.5L12 12l8-4.5M12 12v9"/>',
    store:'<path d="M4 10v10h16V10M3 10l2-7h14l2 7M3 10c0 3 4 3 4 0 0 3 5 3 5 0 0 3 5 3 5 0 0 3 4 3 4 0M9 20v-6h6v6"/>',
    grid:'<rect x="3" y="3" width="7" height="7" rx="1.2"/><rect x="14" y="3" width="7" height="7" rx="1.2"/><rect x="3" y="14" width="7" height="7" rx="1.2"/><rect x="14" y="14" width="7" height="7" rx="1.2"/>',
    list:'<path d="M9 5h12M9 12h12M9 19h12M3 5h1M3 12h1M3 19h1"/>',
    book:'<path d="M12 5C8 2 3 3 3 3v16s5-1 9 2c4-3 9-2 9-2V3s-5-1-9 2Zm0 0v16M6 7l3 1M6 11l3 1m6-4 3-1m-3 5 3-1"/>',
    circuit:'<path d="M7 3v5l5 4v9M17 3v5l-5 4M3 13h4l5 4m9-4h-4l-5 4"/><circle cx="7" cy="3" r="1"/><circle cx="17" cy="3" r="1"/>',
    wheat:'<path d="M12 22V5M12 8C6 8 6 5 6 3c5 0 6 2 6 5Zm0 5c-6 0-6-3-6-5 5 0 6 2 6 5Zm0 5c-6 0-6-3-6-5 5 0 6 2 6 5Zm0-10c6 0 6-3 6-5-5 0-6 2-6 5Zm0 5c6 0 6-3 6-5-5 0-6 2-6 5Zm0 5c6 0 6-3 6-5-5 0-6 2-6 5Z"/>',
    tools:'<path d="m14 6 4-4 4 4-4 4m-2-2L4 20l-2-2L14 6ZM3 3l6 3-3 3-3-6Zm5 5 12 12m-3-2 3-3"/>',
    compass:'<circle cx="12" cy="12" r="9"/><path d="m16 8-2 6-6 2 2-6 6-2Z"/>',
    portal:'<rect x="5" y="2" width="14" height="20" rx="6"/><path d="M9 18V8a3 3 0 0 1 6 0v10"/>',
    'diamond-block':'<path d="m12 2 9 5v10l-9 5-9-5V7l9-5Zm-9 5 9 5 9-5M12 12v10"/><path d="m7 7 5-2 5 2-5 3-5-3Zm0 4v4l2 1m6-3 3-2v4l-3 2"/>',
    diamond:'<path d="m3 8 4-5h10l4 5-9 13L3 8Zm0 0h18M7 3l5 18 5-18"/>',
    copy:'<rect x="8" y="8" width="12" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>',
    share:'<path d="M12 15V3m-4 4 4-4 4 4M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/>',
    external:'<path d="M14 3h7v7m0-7L10 14M10 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5"/>',
    info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v.1"/>',
    filter:'<path d="M4 6h16M7 12h10m-7 6h4"/><circle cx="8" cy="6" r="2"/><circle cx="16" cy="12" r="2"/>',
    reset:'<path d="M4 9a8 8 0 1 1 0 6m0-11v5h5"/>',
    clock:'<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>',
    star:'<path d="m12 2 2.6 6.4L21 11l-6.4 2.6L12 20l-2.6-6.4L3 11l6.4-2.6L12 2Z"/>',
    download:'<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
    user:'<circle cx="12" cy="7" r="4"/><path d="M4 22v-3a8 8 0 0 1 16 0v3"/>',
    menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
    chat:'<path d="M21 11a9 9 0 0 1-9 9H4l-3 2 2-7a9 9 0 1 1 18-4Z"/><path d="M7 10h10M7 14h6"/>',
    sparkles:'<path d="m9 3 2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5Zm10 10 1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3Z"/>',
    shield:'<path d="m12 2 8 4v6c0 5-8 10-8 10s-8-5-8-10V6l8-4Z"/><path d="m8 12 3 3 5-6"/>'
  };
  const icon=(name,extra='')=>`<svg class="icon ${extra}" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]||paths.cube}</svg>`;
  const palettes={
    grass:['#98b988','#789969','#63875b'], dirt:['#b49c80','#94816d','#806f60'],
    wood:['#c6a879','#a27e55','#8b6848'], pale:['#dad9c7','#aead9f','#939789'],
    darkwood:['#977e70','#776052','#614b44'], stone:['#b9bfc1','#919a9e','#77878d'],
    cream:['#faf0da','#e1d3b9','#c7ba9f'], pink:['#df9eae','#ca7f96','#b56182'],
    red:['#da7466','#c4564c','#a23e3f'], green:['#729983','#518267','#3e6b56'],
    purple:['#aca0c7','#8c7aaf','#706098'], blue:['#8aadc6','#6b94b1','#517894'],
    yellow:['#ebce81','#d3ac58','#b98d44'], orange:['#eab175','#d98d50','#b46a3a'],
    leaves:['#7f9e68','#638656','#4c6b45'], whiteleaves:['#c0cbb1','#9ba992','#7a907b'],
    glass:['#bddfd5','#95c1b6','#79aaa1'], water:['#9fcdd2','#78b2bf','#619aaf'],
    obsidian:['#64626f','#484855','#343442'], coral:['#e2a2a4','#c78088','#aa697c'],
    lantern:['#f8e5a0','#eac476','#d6a753']
  };
  const themes={
    wool:{roof:'pink',wall:'wood',leaf:'leaves',bg:'#efe9df',stripe:'cream'},
    pale:{roof:'pale',wall:'pale',leaf:'whiteleaves',bg:'#e7e9df',stripe:'orange'},
    books:{roof:'purple',wall:'darkwood',leaf:'leaves',bg:'#e9e6f0',stripe:'purple'},
    redstone:{roof:'stone',wall:'stone',leaf:'leaves',bg:'#e8e7e4',stripe:'obsidian'},
    garden:{roof:'glass',wall:'wood',leaf:'leaves',bg:'#e4ede0',stripe:'cream'},
    food:{roof:'orange',wall:'wood',leaf:'leaves',bg:'#f1e8d8',stripe:'cream'},
    builder:{roof:'blue',wall:'wood',leaf:'leaves',bg:'#e2e9ed',stripe:'cream'},
    stone:{roof:'stone',wall:'stone',leaf:'leaves',bg:'#e9e7e1',stripe:'darkwood'},
    ocean:{roof:'blue',wall:'pale',leaf:'whiteleaves',bg:'#e0ebec',stripe:'cream'},
    crystal:{roof:'purple',wall:'darkwood',leaf:'whiteleaves',bg:'#e9e6ed',stripe:'blue'},
    travel:{roof:'green',wall:'wood',leaf:'leaves',bg:'#e6ebe4',stripe:'cream'},
    welcome:{roof:'yellow',wall:'wood',leaf:'leaves',bg:'#eeeadd',stripe:'cream'}
  };
  const point=(x,y,z)=>[270+(x-y)*22,150+(x+y)*11-z*24];
  const points=list=>list.map(p=>p.map(v=>Math.round(v*100)/100).join(',')).join(' ');
  function block(x,y,z,material,w=1,d=1,h=1){
    const colors=palettes[material]||palettes.wood;
    const top=[point(x,y,z+h),point(x+w,y,z+h),point(x+w,y+d,z+h),point(x,y+d,z+h)];
    const left=[point(x,y+d,z+h),point(x+w,y+d,z+h),point(x+w,y+d,z),point(x,y+d,z)];
    const right=[point(x+w,y,z+h),point(x+w,y+d,z+h),point(x+w,y+d,z),point(x+w,y,z)];
    let svg=`<polygon points="${points(top)}" fill="${colors[0]}"/><polygon points="${points(left)}" fill="${colors[1]}"/><polygon points="${points(right)}" fill="${colors[2]}"/>`;
    if(material==='glass'){
      svg+=`<path d="M${points([top[0]])} ${points([top[2]])}M${points([left[0]])} ${points([left[2]])}" stroke="#ecf7eb" opacity=".65" stroke-width="1.2"/>`;
    } else if(h>=.7){
      const p=point(x+.25,y+d,z+.62);
      svg+=`<path d="m${p[0]} ${p[1]} 6 3m-2 6 7 3" stroke="${colors[0]}" opacity=".25" stroke-width="2"/>`;
    }
    return svg;
  }
  const cache=new Map();
  function scene(themeName='welcome'){
    if(cache.has(themeName))return cache.get(themeName);
    const t=themes[themeName]||themes.welcome, blocks=[];
    const add=(x,y,z,m,w=1,d=1,h=1)=>blocks.push({x,y,z,m,w,d,h});
    // A floating grass-and-stone island, not a representation of actual server geography.
    for(let x=-4;x<=3;x++) for(let y=-3;y<=3;y++){
      if((x===-4||x===3)&&(y===-3||y===3))continue;
      add(x,y,-1.2,'dirt',1,1,.65);
      add(x,y,-.55,themeName==='ocean' && x>0 && y>1?'water':'grass',1,1,.4);
    }
    for(let x=-2;x<=1;x++)for(let y=-2;y<=1;y++)add(x,y,-.15,t.wall,1,1,.25);
    // Shop back wall and shelves.
    for(let x=-2;x<=1;x++)for(let z=0;z<3;z++)add(x,-2,z,t.wall);
    for(let y=-1;y<=0;y++)for(let z=0;z<3;z++)add(-2,y,z,t.wall);
    for(let x=-1;x<=1;x++){
      add(x,-.9,.2,t.wall,1,.5,.2);
      add(x,-.9,1.25,t.wall,1,.5,.15);
      if(themeName==='books'){
        ['red','blue','purple'].forEach((m,i)=>{add(x+i*.24,-.84,.42,m,.18,.38,.65);add(x+i*.24,-.84,1.45,m,.18,.38,.6);});
      }else{
        const goods={wool:['purple','yellow','blue'],pale:['orange','pale','orange'],redstone:['red','obsidian','red'],food:['orange','yellow','green'],garden:['leaves','leaves','leaves'],ocean:['lantern','blue','lantern'],crystal:['purple','glass','purple']}[themeName]||['cream','green','orange'];
        add(x+.15,-.85,.45,goods[x+1],.65,.55,.6);
        add(x+.22,-.85,1.45,goods[(x+2)%3],.5,.5,.55);
      }
    }
    // Counter, posts, striped sloping awning.
    for(let x=-2;x<=1;x++)add(x,1,.1,t.wall,1,.7,.85);
    add(-2,1,1,t.wall,.3,.3,2.1);add(1.7,1,1,t.wall,.3,.3,2.1);
    for(let x=-2;x<=1;x++)for(let y=-2;y<=2;y++){
      const roofZ=3.15-Math.max(0,y)*.3;
      add(x,y,roofZ,(x%2===0)?t.roof:t.stripe,1,1,.25);
      if(y===2)add(x,y,roofZ-.35,x%2===0?t.roof:t.stripe,1,.15,.4);
    }
    // Sign and small goods on the counter.
    add(-.75,1.72,.26,themeName==='books'?'purple':'cream',1.5,.07,.4);
    if(themeName==='wool'){
      const colors=['purple','pink','blue','green','yellow','orange'];
      colors.forEach((m,i)=>add(-2.7+i*.77,2.6,-.14,m,.7,.7,.7));
      add(-2.1,2.65,.56,'cream',.7,.7,.7);
      add(-1.33,2.65,.56,'coral',.7,.7,.7);
    }else if(themeName==='pale'){
      add(2,1.6,0,'pale');add(2,1.6,1,'orange',.8,.8,.8);add(2.2,2.5,-.1,'orange',.8,.8,.8);
    }else if(themeName==='redstone'){
      add(2,1.5,-.1,'stone');add(2,1.5,.9,'red',.8,.8,.15);add(1.8,2.6,-.1,'obsidian',.8,.8,.7);
    }else if(themeName==='stone'){
      [[2.1,2,0],[2.1,1,0],[2.1,1,1],[1.2,2.8,0]].forEach(([x,y,z])=>add(x,y,z-.1,'stone',.85,.85,.85));
    }else if(themeName==='ocean'){
      add(2.2,1.6,-.1,'lantern',.8,.8,.8);add(2.2,1.6,.7,'blue',.8,.8,.35);
      add(-3,2,0,'coral',.55,.55,.8);
    }else if(themeName==='crystal'){
      add(2.2,1.5,-.1,'stone');add(2.35,1.7,.9,'purple',.45,.45,1.25);add(2.8,2,.7,'glass',.25,.25,.9);
    }else{
      add(2.1,1.4,-.1,'wood',.9,.9,.7);add(2.1,1.4,.6,themeName==='garden'?'leaves':t.roof,.9,.9,.45);
      add(2.1,2.4,-.1,'wood',.7,.7,.7);
    }
    // Tree and foreground plants; sparse enough to keep the shop readable.
    add(-3.6,-.1,0,t.wall,.5,.5,2.6);
    add(-4.1,-.6,2,t.leaf,1.5,1.5,1);
    add(-3.9,-.4,3,t.leaf,1.1,1.1,.65);
    add(-3.4,2.5,-.1,'wood',.6,.6,.45);add(-3.55,2.4,.35,t.leaf,.9,.9,.65);
    add(2.5,-2.2,-.1,'stone',.6,.6,.35);
    if(themeName==='garden'){add(2.4,-1.3,0,'wood',.5,.5,.5);add(2.2,-1.5,.5,'leaves',.9,.9,.8);}
    blocks.sort((a,b)=>(a.x+a.y)-(b.x+b.y)||a.z-b.z);
    const content=blocks.map(b=>block(b.x,b.y,b.z,b.m,b.w,b.d,b.h)).join('');
    const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 540 300" class="shop-scene" aria-label="Illustrated example shop" role="img"><rect width="540" height="300" fill="${t.bg}"/><ellipse cx="276" cy="238" rx="185" ry="35" fill="#253a31" opacity=".08"/><g opacity=".36" fill="#ffffff"><circle cx="75" cy="58" r="3"/><circle cx="475" cy="122" r="2"/><path d="M439 43h3v10h-3zm-4 4h11v3zM95 146h2v8h-2zm-3 3h8v2z"/></g><g>${content}</g></svg>`;
    cache.set(themeName,svg);return svg;
  }
  function itemIcon(item){
    const colors={wool:['#dd9cb0','#c9859e','#af6d8a'],resin:palettes.orange,log:palettes.wood,leaf:palettes.leaves,redstone:palettes.red,book:palettes.purple,machine:palettes.stone,carrot:palettes.orange,lantern:palettes.lantern,crystal:palettes.purple,pearl:palettes.green,food:palettes.yellow};
    let c=colors[item.icon]||palettes.stone;
    if(item.color&&/^#[0-9a-f]{6}$/i.test(item.color))c=[item.color,item.color,item.color];
    if(['tools','compass','rocket','wings'].includes(item.icon))return `<span class="item-drawing">${icon(item.icon==='rocket'?'sparkles':item.icon==='wings'?'compass':item.icon)}</span>`;
    return `<svg class="item-drawing" viewBox="0 0 32 32" aria-hidden="true"><path fill="${c[0]}" d="m16 3 12 6.5L16 16 4 9.5Z"/><path fill="${c[1]}" d="m4 9.5 12 6.5v13L4 22.5Z"/><path fill="${c[2]}" d="m16 16 12-6.5v13L16 29Z"/><path d="m16 16 12-6.5v13L16 29Z" fill="#000" opacity=".12"/><path d="m7 13 4 2v3l-4-2Zm4 8 3 1.5v2L11 23Z" fill="#fff" opacity=".15"/></svg>`;
  }
  root.MMArt=Object.freeze({icon,scene,itemIcon});
}(globalThis));
