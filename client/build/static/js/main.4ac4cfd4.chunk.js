(this.webpackJsonpclient=this.webpackJsonpclient||[]).push([[0],{12:function(e,t,n){},14:function(e,t,n){},15:function(e,t,n){"use strict";n.r(t);var r=n(1),c=n.n(r),a=n(6),i=n.n(a),s=(n(12),n(7)),o=n(5),l=n(0);var d=function(e){var t=e.playerData,n=e.index,r=Math.floor(t.duration/1e3),c="".concat(("00"+Math.floor(r/60)).slice(-2),"m:").concat(("00"+Math.floor(r%60)).slice(-2),"s");return Object(l.jsxs)("div",{className:"player-info "+(void 0!==n?n%2===0?"light":"dark":""),children:[Object(l.jsx)("div",{children:t.language}),Object(l.jsx)("div",{children:t.name}),Object(l.jsx)("div",{children:c})]})};var u=function(e){var t,n=e.matchData;if(!n.started)return Object(l.jsxs)("div",{className:"waiting-container",children:[Object(l.jsx)("h2",{children:(t=n,0!==Object.keys(t).length?"Waiting for Players":"No Match Found!!!")}),Object(l.jsxs)("p",{children:["Players:",Object(l.jsx)("span",{className:"no-player",children:n.noPlayers})]})]});var r=n.players.filter((function(e){return e.finished})).sort((function(e,t){return e.rank-t.rank})).slice(0,2);return Object(l.jsxs)("div",{className:"match-info",children:[Object(l.jsxs)("h2",{children:["Mode:",n.mode]}),0===r.length&&Object(l.jsx)("h2",{children:"Clashining.."}),r.map((function(e,t){return Object(l.jsx)(d,{playerData:e,index:t},e.name)})),Object(l.jsxs)("p",{children:["Players:",Object(l.jsx)("span",{className:"no-player",children:n.noPlayers})]})]})};n(14);var j=function(){var e=Object(r.useRef)(window.location.pathname.split("/").slice(-1)[0]),t=Object(r.useState)({}),n=Object(o.a)(t,2),c=n[0],a=n[1],i=Object(r.useState)(JSON.parse(window.localStorage.getItem("prevData"))||[]),j=Object(o.a)(i,2),h=j[0],f=j[1],b=Object(r.useRef)(null),m=function(){e.current&&fetch("/api/".concat(e.current)).then((function(e){return e.json()})).then((function(e){200===e.status&&a((function(t){return t.matchId!==e.matchId&&t&&t.started&&f((function(e){if(e.some((function(e){return e.matchId===t.matchId})))return e;var n=t.players.filter((function(e){return e.finished})).sort((function(e,t){return e.rank-t.rank}))[0],r=[{matchId:t.matchId,mode:t.mode,winner:n}].concat(Object(s.a)(e));return window.localStorage.setItem("prevData",JSON.stringify(r)),r})),e}))}))};return Object(r.useEffect)((function(){return m(),b.current=setInterval((function(){return m()}),5e3),fetch("/start"),function(){clearInterval(b.current),b.current=null}}),[]),Object(l.jsx)("div",{className:"App",children:e.current&&Object(l.jsxs)("div",{id:"main",children:[Object(l.jsx)(u,{matchData:c}),Object(l.jsxs)("div",{style:{marginBottom:5},children:[Object(l.jsx)("span",{style:{fontSize:"20px",fontWeight:"bolder"},children:"Winners"}),":"]}),Object(l.jsx)("div",{id:"prev-container",children:h.map((function(e){return Object(l.jsx)(d,{playerData:e.winner,matchData:e},e.matchId)}))})]})})};i.a.render(Object(l.jsx)(c.a.StrictMode,{children:Object(l.jsx)(j,{})}),document.getElementById("root"))}},[[15,1,2]]]);
//# sourceMappingURL=main.4ac4cfd4.chunk.js.map