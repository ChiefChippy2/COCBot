(this.webpackJsonpclient=this.webpackJsonpclient||[]).push([[0],{12:function(e,t,n){},14:function(e,t,n){},15:function(e,t,n){"use strict";n.r(t);var r=n(1),c=n.n(r),a=n(6),i=n.n(a),s=(n(12),n(7)),l=n(5),o=n(0);var d=function(e){var t=e.playerData,n=e.index,r=Math.floor(t.duration/1e3),c="".concat(("00"+Math.floor(r/60)).slice(-2),"m:").concat(("00"+Math.floor(r%60)).slice(-2),"s");return Object(o.jsxs)("div",{className:"player-info "+(void 0!==n?n%2===0?"light":"dark":""),children:[Object(o.jsx)("div",{children:t.language}),Object(o.jsx)("div",{children:t.name}),Object(o.jsx)("div",{children:c})]})};var u=function(e){var t,n=e.matchData;if(!n.started)return Object(o.jsxs)("div",{className:"waiting-container",children:[Object(o.jsx)("h2",{children:(t=n,0!==Object.keys(t).length?"Waiting for Players":"No Match Found!!!")}),Object(o.jsxs)("p",{children:["Players:",Object(o.jsx)("span",{className:"no-player",children:n.noPlayers})]})]});var r=n.players.filter((function(e){return e.finished})).sort((function(e,t){return e.rank-t.rank})).slice(0,2);return Object(o.jsxs)("div",{className:"match-info",children:[Object(o.jsxs)("h2",{children:["Mode:",n.mode]}),0===r.length&&Object(o.jsx)("h2",{children:"Clashining.."}),r.map((function(e,t){return Object(o.jsx)(d,{playerData:e,index:t},e.name)})),Object(o.jsxs)("p",{children:["Players:",Object(o.jsx)("span",{className:"no-player",children:n.noPlayers})]})]})};n(14);var j=function(){var e=Object(r.useRef)(""),t=Object(r.useState)({}),n=Object(l.a)(t,2),c=n[0],a=n[1],i=Object(r.useState)(JSON.parse(window.localStorage.getItem("prevData"))||[]),j=Object(l.a)(i,2),h=j[0],f=j[1],b=Object(r.useRef)(null),O=function(){""!==e.current&&fetch("/api/".concat(e.current)).then((function(e){return e.json()})).then((function(e){200===e.status&&a((function(t){return t.matchId!==e.matchId&&t&&t.started&&f((function(e){if(e.some((function(e){return e.matchId===t.matchId})))return e;var n=t.players.filter((function(e){return e.finished})).sort((function(e,t){return e.rank-t.rank}))[0],r=[{matchId:t.matchId,mode:t.mode,winner:n}].concat(Object(s.a)(e));return window.localStorage.setItem("prevData",JSON.stringify(r)),r})),e}))}))};return Object(r.useEffect)((function(){return fetch("/start"),e.current=window.location.pathname.split("/").slice(-1)[0].trim(),O(),b.current=setInterval((function(){return O()}),5e3),function(){clearInterval(b.current),b.current=null}}),[]),Object(o.jsxs)("div",{className:"App",children:[Object(o.jsx)("h1",{children:e.current||"GOTO : /web/<ChannleName>"}),e.current&&Object(o.jsxs)("div",{id:"main",children:[Object(o.jsx)(u,{matchData:c}),Object(o.jsxs)("div",{style:{marginBottom:5},children:[Object(o.jsx)("span",{style:{fontSize:"20px",fontWeight:"bolder"},children:"Winners"}),":"]}),Object(o.jsx)("div",{id:"prev-container",children:h.map((function(e){return Object(o.jsx)(d,{playerData:e.winner,matchData:e},e.matchId)}))})]})]})};i.a.render(Object(o.jsx)(c.a.StrictMode,{children:Object(o.jsx)(j,{})}),document.getElementById("root"))}},[[15,1,2]]]);
//# sourceMappingURL=main.110c1444.chunk.js.map