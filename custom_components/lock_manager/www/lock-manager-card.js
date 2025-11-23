function t(t,e,i,o){var s,r=arguments.length,n=r<3?e:null===o?o=Object.getOwnPropertyDescriptor(e,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(t,e,i,o);else for(var a=t.length-1;a>=0;a--)(s=t[a])&&(n=(r<3?s(n):r>3?s(e,i,n):s(e,i))||n);return r>3&&n&&Object.defineProperty(e,i,n),n}"function"==typeof SuppressedError&&SuppressedError;
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const e=globalThis,i=e.ShadowRoot&&(void 0===e.ShadyCSS||e.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,o=Symbol(),s=new WeakMap;let r=class{constructor(t,e,i){if(this._$cssResult$=!0,i!==o)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const e=this.t;if(i&&void 0===t){const i=void 0!==e&&1===e.length;i&&(t=s.get(e)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),i&&s.set(e,t))}return t}toString(){return this.cssText}};const n=(t,...e)=>{const i=1===t.length?t[0]:e.reduce((e,i,o)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+t[o+1],t[0]);return new r(i,t,o)},a=i?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const i of t.cssRules)e+=i.cssText;return(t=>new r("string"==typeof t?t:t+"",void 0,o))(e)})(t):t,{is:c,defineProperty:l,getOwnPropertyDescriptor:d,getOwnPropertyNames:h,getOwnPropertySymbols:p,getPrototypeOf:u}=Object,_=globalThis,m=_.trustedTypes,g=m?m.emptyScript:"",f=_.reactiveElementPolyfillSupport,y=(t,e)=>t,b={toAttribute(t,e){switch(e){case Boolean:t=t?g:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){let i=t;switch(e){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t)}catch(t){i=null}}return i}},v=(t,e)=>!c(t,e),$={attribute:!0,type:String,converter:b,reflect:!1,useDefault:!1,hasChanged:v};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */Symbol.metadata??=Symbol("metadata"),_.litPropertyMetadata??=new WeakMap;let x=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=$){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){const i=Symbol(),o=this.getPropertyDescriptor(t,i,e);void 0!==o&&l(this.prototype,t,o)}}static getPropertyDescriptor(t,e,i){const{get:o,set:s}=d(this.prototype,t)??{get(){return this[e]},set(t){this[e]=t}};return{get:o,set(e){const r=o?.call(this);s?.call(this,e),this.requestUpdate(t,r,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??$}static _$Ei(){if(this.hasOwnProperty(y("elementProperties")))return;const t=u(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(y("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(y("properties"))){const t=this.properties,e=[...h(t),...p(t)];for(const i of e)this.createProperty(i,t[i])}const t=this[Symbol.metadata];if(null!==t){const e=litPropertyMetadata.get(t);if(void 0!==e)for(const[t,i]of e)this.elementProperties.set(t,i)}this._$Eh=new Map;for(const[t,e]of this.elementProperties){const i=this._$Eu(t,e);void 0!==i&&this._$Eh.set(i,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const i=new Set(t.flat(1/0).reverse());for(const t of i)e.unshift(a(t))}else void 0!==t&&e.push(a(t));return e}static _$Eu(t,e){const i=e.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){const t=new Map,e=this.constructor.elementProperties;for(const i of e.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((t,o)=>{if(i)t.adoptedStyleSheets=o.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const i of o){const o=document.createElement("style"),s=e.litNonce;void 0!==s&&o.setAttribute("nonce",s),o.textContent=i.cssText,t.appendChild(o)}})(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,i){this._$AK(t,i)}_$ET(t,e){const i=this.constructor.elementProperties.get(t),o=this.constructor._$Eu(t,i);if(void 0!==o&&!0===i.reflect){const s=(void 0!==i.converter?.toAttribute?i.converter:b).toAttribute(e,i.type);this._$Em=t,null==s?this.removeAttribute(o):this.setAttribute(o,s),this._$Em=null}}_$AK(t,e){const i=this.constructor,o=i._$Eh.get(t);if(void 0!==o&&this._$Em!==o){const t=i.getPropertyOptions(o),s="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:b;this._$Em=o;const r=s.fromAttribute(e,t.type);this[o]=r??this._$Ej?.get(o)??r,this._$Em=null}}requestUpdate(t,e,i){if(void 0!==t){const o=this.constructor,s=this[t];if(i??=o.getPropertyOptions(t),!((i.hasChanged??v)(s,e)||i.useDefault&&i.reflect&&s===this._$Ej?.get(t)&&!this.hasAttribute(o._$Eu(t,i))))return;this.C(t,e,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(t,e,{useDefault:i,reflect:o,wrapped:s},r){i&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,r??e??this[t]),!0!==s||void 0!==r)||(this._$AL.has(t)||(this.hasUpdated||i||(e=void 0),this._$AL.set(t,e)),!0===o&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,e]of this._$Ep)this[t]=e;this._$Ep=void 0}const t=this.constructor.elementProperties;if(t.size>0)for(const[e,i]of t){const{wrapped:t}=i,o=this[e];!0!==t||this._$AL.has(e)||void 0===o||this.C(e,void 0,i,o)}}let t=!1;const e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(t=>t.hostUpdate?.()),this.update(e)):this._$EM()}catch(e){throw t=!1,this._$EM(),e}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(t){}firstUpdated(t){}};x.elementStyles=[],x.shadowRootOptions={mode:"open"},x[y("elementProperties")]=new Map,x[y("finalized")]=new Map,f?.({ReactiveElement:x}),(_.reactiveElementVersions??=[]).push("2.1.1");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const A=globalThis,w=A.trustedTypes,k=w?w.createPolicy("lit-html",{createHTML:t=>t}):void 0,E="$lit$",S=`lit$${Math.random().toFixed(9).slice(2)}$`,C="?"+S,P=`<${C}>`,M=document,U=()=>M.createComment(""),O=t=>null===t||"object"!=typeof t&&"function"!=typeof t,T=Array.isArray,F="[ \t\n\f\r]",D=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,z=/-->/g,H=/>/g,N=RegExp(`>|${F}(?:([^\\s"'>=/]+)(${F}*=${F}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),j=/'/g,R=/"/g,L=/^(?:script|style|textarea|title)$/i,I=(t=>(e,...i)=>({_$litType$:t,strings:e,values:i}))(1),B=Symbol.for("lit-noChange"),W=Symbol.for("lit-nothing"),q=new WeakMap,V=M.createTreeWalker(M,129);function Z(t,e){if(!T(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==k?k.createHTML(e):e}const J=(t,e)=>{const i=t.length-1,o=[];let s,r=2===e?"<svg>":3===e?"<math>":"",n=D;for(let e=0;e<i;e++){const i=t[e];let a,c,l=-1,d=0;for(;d<i.length&&(n.lastIndex=d,c=n.exec(i),null!==c);)d=n.lastIndex,n===D?"!--"===c[1]?n=z:void 0!==c[1]?n=H:void 0!==c[2]?(L.test(c[2])&&(s=RegExp("</"+c[2],"g")),n=N):void 0!==c[3]&&(n=N):n===N?">"===c[0]?(n=s??D,l=-1):void 0===c[1]?l=-2:(l=n.lastIndex-c[2].length,a=c[1],n=void 0===c[3]?N:'"'===c[3]?R:j):n===R||n===j?n=N:n===z||n===H?n=D:(n=N,s=void 0);const h=n===N&&t[e+1].startsWith("/>")?" ":"";r+=n===D?i+P:l>=0?(o.push(a),i.slice(0,l)+E+i.slice(l)+S+h):i+S+(-2===l?e:h)}return[Z(t,r+(t[i]||"<?>")+(2===e?"</svg>":3===e?"</math>":"")),o]};class K{constructor({strings:t,_$litType$:e},i){let o;this.parts=[];let s=0,r=0;const n=t.length-1,a=this.parts,[c,l]=J(t,e);if(this.el=K.createElement(c,i),V.currentNode=this.el.content,2===e||3===e){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes)}for(;null!==(o=V.nextNode())&&a.length<n;){if(1===o.nodeType){if(o.hasAttributes())for(const t of o.getAttributeNames())if(t.endsWith(E)){const e=l[r++],i=o.getAttribute(t).split(S),n=/([.?@])?(.*)/.exec(e);a.push({type:1,index:s,name:n[2],strings:i,ctor:"."===n[1]?tt:"?"===n[1]?et:"@"===n[1]?it:Y}),o.removeAttribute(t)}else t.startsWith(S)&&(a.push({type:6,index:s}),o.removeAttribute(t));if(L.test(o.tagName)){const t=o.textContent.split(S),e=t.length-1;if(e>0){o.textContent=w?w.emptyScript:"";for(let i=0;i<e;i++)o.append(t[i],U()),V.nextNode(),a.push({type:2,index:++s});o.append(t[e],U())}}}else if(8===o.nodeType)if(o.data===C)a.push({type:2,index:s});else{let t=-1;for(;-1!==(t=o.data.indexOf(S,t+1));)a.push({type:7,index:s}),t+=S.length-1}s++}}static createElement(t,e){const i=M.createElement("template");return i.innerHTML=t,i}}function G(t,e,i=t,o){if(e===B)return e;let s=void 0!==o?i._$Co?.[o]:i._$Cl;const r=O(e)?void 0:e._$litDirective$;return s?.constructor!==r&&(s?._$AO?.(!1),void 0===r?s=void 0:(s=new r(t),s._$AT(t,i,o)),void 0!==o?(i._$Co??=[])[o]=s:i._$Cl=s),void 0!==s&&(e=G(t,s._$AS(t,e.values),s,o)),e}class Q{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:e},parts:i}=this._$AD,o=(t?.creationScope??M).importNode(e,!0);V.currentNode=o;let s=V.nextNode(),r=0,n=0,a=i[0];for(;void 0!==a;){if(r===a.index){let e;2===a.type?e=new X(s,s.nextSibling,this,t):1===a.type?e=new a.ctor(s,a.name,a.strings,this,t):6===a.type&&(e=new ot(s,this,t)),this._$AV.push(e),a=i[++n]}r!==a?.index&&(s=V.nextNode(),r++)}return V.currentNode=M,o}p(t){let e=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(t,i,e),e+=i.strings.length-2):i._$AI(t[e])),e++}}class X{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,i,o){this.type=2,this._$AH=W,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=i,this.options=o,this._$Cv=o?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return void 0!==e&&11===t?.nodeType&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=G(this,t,e),O(t)?t===W||null==t||""===t?(this._$AH!==W&&this._$AR(),this._$AH=W):t!==this._$AH&&t!==B&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):(t=>T(t)||"function"==typeof t?.[Symbol.iterator])(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==W&&O(this._$AH)?this._$AA.nextSibling.data=t:this.T(M.createTextNode(t)),this._$AH=t}$(t){const{values:e,_$litType$:i}=t,o="number"==typeof i?this._$AC(t):(void 0===i.el&&(i.el=K.createElement(Z(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===o)this._$AH.p(e);else{const t=new Q(o,this),i=t.u(this.options);t.p(e),this.T(i),this._$AH=t}}_$AC(t){let e=q.get(t.strings);return void 0===e&&q.set(t.strings,e=new K(t)),e}k(t){T(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let i,o=0;for(const s of t)o===e.length?e.push(i=new X(this.O(U()),this.O(U()),this,this.options)):i=e[o],i._$AI(s),o++;o<e.length&&(this._$AR(i&&i._$AB.nextSibling,o),e.length=o)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){const e=t.nextSibling;t.remove(),t=e}}setConnected(t){void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t))}}class Y{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,i,o,s){this.type=1,this._$AH=W,this._$AN=void 0,this.element=t,this.name=e,this._$AM=o,this.options=s,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=W}_$AI(t,e=this,i,o){const s=this.strings;let r=!1;if(void 0===s)t=G(this,t,e,0),r=!O(t)||t!==this._$AH&&t!==B,r&&(this._$AH=t);else{const o=t;let n,a;for(t=s[0],n=0;n<s.length-1;n++)a=G(this,o[i+n],e,n),a===B&&(a=this._$AH[n]),r||=!O(a)||a!==this._$AH[n],a===W?t=W:t!==W&&(t+=(a??"")+s[n+1]),this._$AH[n]=a}r&&!o&&this.j(t)}j(t){t===W?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class tt extends Y{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===W?void 0:t}}class et extends Y{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==W)}}class it extends Y{constructor(t,e,i,o,s){super(t,e,i,o,s),this.type=5}_$AI(t,e=this){if((t=G(this,t,e,0)??W)===B)return;const i=this._$AH,o=t===W&&i!==W||t.capture!==i.capture||t.once!==i.once||t.passive!==i.passive,s=t!==W&&(i===W||o);o&&this.element.removeEventListener(this.name,this,i),s&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}}class ot{constructor(t,e,i){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(t){G(this,t)}}const st=A.litHtmlPolyfillSupport;st?.(K,X),(A.litHtmlVersions??=[]).push("3.3.1");const rt=globalThis;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */class nt extends x{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=((t,e,i)=>{const o=i?.renderBefore??e;let s=o._$litPart$;if(void 0===s){const t=i?.renderBefore??null;o._$litPart$=s=new X(e.insertBefore(U(),t),t,void 0,i??{})}return s._$AI(t),s})(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return B}}nt._$litElement$=!0,nt.finalized=!0,rt.litElementHydrateSupport?.({LitElement:nt});const at=rt.litElementPolyfillSupport;at?.({LitElement:nt}),(rt.litElementVersions??=[]).push("4.2.1");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ct={attribute:!0,type:String,converter:b,reflect:!1,hasChanged:v},lt=(t=ct,e,i)=>{const{kind:o,metadata:s}=i;let r=globalThis.litPropertyMetadata.get(s);if(void 0===r&&globalThis.litPropertyMetadata.set(s,r=new Map),"setter"===o&&((t=Object.create(t)).wrapped=!0),r.set(i.name,t),"accessor"===o){const{name:o}=i;return{set(i){const s=e.get.call(this);e.set.call(this,i),this.requestUpdate(o,s,t)},init(e){return void 0!==e&&this.C(o,void 0,t,e),e}}}if("setter"===o){const{name:o}=i;return function(i){const s=this[o];e.call(this,i),this.requestUpdate(o,s,t)}}throw Error("Unsupported decorator location: "+o)};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function dt(t){return(e,i)=>"object"==typeof i?lt(t,e,i):((t,e,i)=>{const o=e.hasOwnProperty(i);return e.constructor.createProperty(i,t),o?Object.getOwnPropertyDescriptor(e,i):void 0})(t,e,i)}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function ht(t){return dt({...t,state:!0,attribute:!1})}let pt=class extends nt{constructor(){super(...arguments),this._lockData=null,this._history=[],this._editingSlot=null,this._editForm={},this._activeTab="codes",this._showAddModal=!1}static getConfigElement(){return document.createElement("lock-manager-card-editor")}static getStubConfig(){return{type:"custom:lock-manager-card",entity:"",show_history:!0,history_limit:20}}setConfig(t){if(!t.entity)throw new Error("Please define a lock entity");this._config={show_history:!0,history_limit:20,...t}}async firstUpdated(t){super.firstUpdated(t),await this._fetchLockData()}updated(t){super.updated(t),t.has("hass")&&this.hass&&this._fetchLockData()}async _fetchLockData(){if(this.hass&&this._config?.entity)try{const t=await this.hass.callWS({type:"lock_manager/get_lock_data",entity_id:this._config.entity});this._lockData=t.lock_data,this._history=t.history||[]}catch{this.hass.states[this._config.entity]&&(this._lockData=null)}}_getSlots(){return this._lockData?Object.values(this._lockData.slots).sort((t,e)=>t.slot-e.slot):[]}_getActiveSlots(){return this._getSlots().filter(t=>null!==t.code)}_getEmptySlots(){return this._getSlots().filter(t=>null===t.code)}async _setCode(t,e){await this.hass.callService("lock_manager","set_code",{lock_entity_id:this._config.entity,code_slot:t,usercode:e.code,name:e.name,enabled:e.enabled??!0,alert_on_use:e.alert_on_use??!1,expiration:e.expiration}),await this._fetchLockData()}async _clearCode(t){await this.hass.callService("lock_manager","clear_code",{lock_entity_id:this._config.entity,code_slot:t}),await this._fetchLockData()}async _toggleEnabled(t){const e=t.enabled?"disable_code":"enable_code";await this.hass.callService("lock_manager",e,{lock_entity_id:this._config.entity,code_slot:t.slot}),await this._fetchLockData()}async _toggleAlert(t){await this.hass.callService("lock_manager","set_alert",{lock_entity_id:this._config.entity,code_slot:t.slot,alert_on_use:!t.alert_on_use}),await this._fetchLockData()}_startEdit(t){this._editingSlot=t.slot,this._editForm={...t}}_cancelEdit(){this._editingSlot=null,this._editForm={}}async _saveEdit(){null!==this._editingSlot&&(await this._setCode(this._editingSlot,this._editForm),this._cancelEdit())}_startAdd(){const t=this._getEmptySlots();0!==t.length&&(this._showAddModal=!0,this._editForm={slot:t[0].slot,name:"",code:"",enabled:!0,alert_on_use:!1,expiration:null})}async _saveAdd(){this._editForm.slot&&this._editForm.code&&(await this._setCode(this._editForm.slot,this._editForm),this._showAddModal=!1,this._editForm={})}_cancelAdd(){this._showAddModal=!1,this._editForm={}}_formatDate(t){return new Date(t).toLocaleString()}_isExpired(t){return!!t.expiration&&new Date(t.expiration)<=new Date}_getExpirationStatus(t){if(!t.expiration)return"";const e=new Date(t.expiration),i=new Date;if(e<=i)return"Expired";const o=e.getTime()-i.getTime(),s=Math.floor(o/36e5),r=Math.floor(s/24);return r>0?`Expires in ${r}d`:s>0?`Expires in ${s}h`:"Expires soon"}render(){if(!this.hass||!this._config)return I``;const t=this.hass.states[this._config.entity],e=this._config.title||this._lockData?.name||this._config.entity;return I`
      <ha-card>
        <div class="card-header">
          <div class="header-content">
            <ha-icon icon="mdi:lock"></ha-icon>
            <span class="title">${e}</span>
            <span class="lock-state ${t?.state}">${t?.state||"unknown"}</span>
          </div>
        </div>

        <div class="tabs">
          <button
            class="tab ${"codes"===this._activeTab?"active":""}"
            @click=${()=>this._activeTab="codes"}
          >
            <ha-icon icon="mdi:key-variant"></ha-icon>
            Codes
          </button>
          ${this._config.show_history?I`
            <button
              class="tab ${"history"===this._activeTab?"active":""}"
              @click=${()=>this._activeTab="history"}
            >
              <ha-icon icon="mdi:history"></ha-icon>
              History
            </button>
          `:""}
        </div>

        <div class="card-content">
          ${"codes"===this._activeTab?this._renderCodes():this._renderHistory()}
        </div>

        ${this._showAddModal?this._renderAddModal():""}
      </ha-card>
    `}_renderCodes(){const t=this._getActiveSlots(),e=this._getEmptySlots();return I`
      <div class="codes-section">
        <div class="section-header">
          <span>Active Codes (${t.length})</span>
          <button class="add-btn" @click=${this._startAdd} ?disabled=${0===e.length}>
            <ha-icon icon="mdi:plus"></ha-icon>
            Add Code
          </button>
        </div>

        ${0===t.length?I`
          <div class="empty-state">
            <ha-icon icon="mdi:key-plus"></ha-icon>
            <p>No codes configured</p>
            <button class="primary-btn" @click=${this._startAdd}>Add your first code</button>
          </div>
        `:I`
          <div class="code-list">
            ${t.map(t=>this._renderCodeSlot(t))}
          </div>
        `}
      </div>
    `}_renderCodeSlot(t){const e=this._editingSlot===t.slot,i=this._isExpired(t),o=this._getExpirationStatus(t);return e?this._renderEditForm(t):I`
      <div class="code-item ${t.enabled?"enabled":"disabled"} ${i?"expired":""}">
        <div class="code-main">
          <div class="code-info">
            <span class="code-name">${t.name}</span>
            <span class="code-slot">Slot ${t.slot}</span>
            ${o?I`<span class="code-expiration ${i?"expired":""}">${o}</span>`:""}
          </div>
          <div class="code-badges">
            ${t.alert_on_use?I`<span class="badge alert" title="Alerts enabled"><ha-icon icon="mdi:bell"></ha-icon></span>`:""}
            ${t.expiration?I`<span class="badge temp" title="Temporary code"><ha-icon icon="mdi:clock-outline"></ha-icon></span>`:""}
          </div>
        </div>
        <div class="code-actions">
          <button
            class="icon-btn ${t.enabled?"on":"off"}"
            @click=${()=>this._toggleEnabled(t)}
            title="${t.enabled?"Disable code":"Enable code"}"
          >
            <ha-icon icon="${t.enabled?"mdi:toggle-switch":"mdi:toggle-switch-off"}"></ha-icon>
          </button>
          <button
            class="icon-btn ${t.alert_on_use?"on":""}"
            @click=${()=>this._toggleAlert(t)}
            title="${t.alert_on_use?"Disable alerts":"Enable alerts"}"
          >
            <ha-icon icon="${t.alert_on_use?"mdi:bell":"mdi:bell-outline"}"></ha-icon>
          </button>
          <button class="icon-btn" @click=${()=>this._startEdit(t)} title="Edit code">
            <ha-icon icon="mdi:pencil"></ha-icon>
          </button>
          <button class="icon-btn danger" @click=${()=>this._clearCode(t.slot)} title="Delete code">
            <ha-icon icon="mdi:delete"></ha-icon>
          </button>
        </div>
      </div>
    `}_renderEditForm(t){return I`
      <div class="code-item editing">
        <div class="edit-form">
          <div class="form-row">
            <label>Name</label>
            <input
              type="text"
              .value=${this._editForm.name||""}
              @input=${t=>this._editForm={...this._editForm,name:t.target.value}}
            />
          </div>
          <div class="form-row">
            <label>Code</label>
            <input
              type="password"
              .value=${this._editForm.code||""}
              @input=${t=>this._editForm={...this._editForm,code:t.target.value}}
            />
          </div>
          <div class="form-row">
            <label>Expiration (optional)</label>
            <input
              type="datetime-local"
              .value=${this._editForm.expiration?.slice(0,16)||""}
              @input=${t=>this._editForm={...this._editForm,expiration:t.target.value||null}}
            />
          </div>
          <div class="form-row checkbox">
            <label>
              <input
                type="checkbox"
                .checked=${this._editForm.alert_on_use||!1}
                @change=${t=>this._editForm={...this._editForm,alert_on_use:t.target.checked}}
              />
              Alert when used
            </label>
          </div>
          <div class="form-actions">
            <button class="cancel-btn" @click=${this._cancelEdit}>Cancel</button>
            <button class="save-btn" @click=${this._saveEdit}>Save</button>
          </div>
        </div>
      </div>
    `}_renderAddModal(){const t=this._getEmptySlots();return I`
      <div class="modal-overlay" @click=${this._cancelAdd}>
        <div class="modal" @click=${t=>t.stopPropagation()}>
          <div class="modal-header">
            <h3>Add New Code</h3>
            <button class="close-btn" @click=${this._cancelAdd}>
              <ha-icon icon="mdi:close"></ha-icon>
            </button>
          </div>
          <div class="modal-body">
            <div class="form-row">
              <label>Slot</label>
              <select @change=${t=>this._editForm={...this._editForm,slot:parseInt(t.target.value)}}>
                ${t.map(t=>I`<option value=${t.slot}>Slot ${t.slot}</option>`)}
              </select>
            </div>
            <div class="form-row">
              <label>Name</label>
              <input
                type="text"
                placeholder="e.g., Front Door Guest"
                .value=${this._editForm.name||""}
                @input=${t=>this._editForm={...this._editForm,name:t.target.value}}
              />
            </div>
            <div class="form-row">
              <label>Code (PIN)</label>
              <input
                type="password"
                placeholder="4-8 digits"
                .value=${this._editForm.code||""}
                @input=${t=>this._editForm={...this._editForm,code:t.target.value}}
              />
            </div>
            <div class="form-row">
              <label>Expiration (optional)</label>
              <input
                type="datetime-local"
                .value=${this._editForm.expiration||""}
                @input=${t=>this._editForm={...this._editForm,expiration:t.target.value||null}}
              />
            </div>
            <div class="form-row checkbox">
              <label>
                <input
                  type="checkbox"
                  .checked=${this._editForm.alert_on_use||!1}
                  @change=${t=>this._editForm={...this._editForm,alert_on_use:t.target.checked}}
                />
                Alert when this code is used
              </label>
            </div>
          </div>
          <div class="modal-footer">
            <button class="cancel-btn" @click=${this._cancelAdd}>Cancel</button>
            <button class="save-btn" @click=${this._saveAdd} ?disabled=${!this._editForm.code||!this._editForm.name}>
              Add Code
            </button>
          </div>
        </div>
      </div>
    `}_renderHistory(){const t=this._config.history_limit||20,e=this._history.slice(0,t);return I`
      <div class="history-section">
        ${0===e.length?I`
          <div class="empty-state">
            <ha-icon icon="mdi:history"></ha-icon>
            <p>No usage history yet</p>
          </div>
        `:I`
          <div class="history-list">
            ${e.map(t=>I`
              <div class="history-item">
                <div class="history-icon ${t.action}">
                  <ha-icon icon="${"unlock"===t.action?"mdi:lock-open":"mdi:lock"}"></ha-icon>
                </div>
                <div class="history-info">
                  <span class="history-name">${t.code_name}</span>
                  <span class="history-action">${t.action}</span>
                </div>
                <div class="history-time">${this._formatDate(t.timestamp)}</div>
              </div>
            `)}
          </div>
        `}
      </div>
    `}static get styles(){return n`
      :host {
        --primary-color: var(--ha-primary-color, #03a9f4);
        --success-color: #4caf50;
        --warning-color: #ff9800;
        --danger-color: #f44336;
        --disabled-color: #9e9e9e;
      }

      ha-card {
        overflow: hidden;
      }

      .card-header {
        padding: 16px;
        background: var(--primary-color);
        color: white;
      }

      .header-content {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .header-content ha-icon {
        --mdc-icon-size: 24px;
      }

      .title {
        flex: 1;
        font-size: 18px;
        font-weight: 500;
      }

      .lock-state {
        padding: 4px 12px;
        border-radius: 12px;
        font-size: 12px;
        text-transform: uppercase;
        background: rgba(255, 255, 255, 0.2);
      }

      .lock-state.locked {
        background: var(--success-color);
      }

      .lock-state.unlocked {
        background: var(--warning-color);
      }

      .tabs {
        display: flex;
        border-bottom: 1px solid var(--divider-color);
      }

      .tab {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 12px;
        border: none;
        background: none;
        cursor: pointer;
        color: var(--secondary-text-color);
        font-size: 14px;
        transition: all 0.2s;
      }

      .tab:hover {
        background: var(--secondary-background-color);
      }

      .tab.active {
        color: var(--primary-color);
        border-bottom: 2px solid var(--primary-color);
      }

      .tab ha-icon {
        --mdc-icon-size: 18px;
      }

      .card-content {
        padding: 16px;
      }

      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
      }

      .section-header span {
        font-weight: 500;
        color: var(--primary-text-color);
      }

      .add-btn {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 8px 16px;
        border: none;
        border-radius: 20px;
        background: var(--primary-color);
        color: white;
        cursor: pointer;
        font-size: 14px;
        transition: opacity 0.2s;
      }

      .add-btn:hover {
        opacity: 0.9;
      }

      .add-btn:disabled {
        background: var(--disabled-color);
        cursor: not-allowed;
      }

      .add-btn ha-icon {
        --mdc-icon-size: 18px;
      }

      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 32px;
        color: var(--secondary-text-color);
      }

      .empty-state ha-icon {
        --mdc-icon-size: 48px;
        margin-bottom: 16px;
        opacity: 0.5;
      }

      .empty-state p {
        margin: 0 0 16px 0;
      }

      .primary-btn {
        padding: 10px 24px;
        border: none;
        border-radius: 20px;
        background: var(--primary-color);
        color: white;
        cursor: pointer;
        font-size: 14px;
      }

      .code-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .code-item {
        display: flex;
        flex-direction: column;
        padding: 12px;
        border-radius: 8px;
        background: var(--secondary-background-color);
        transition: all 0.2s;
      }

      .code-item.disabled {
        opacity: 0.6;
      }

      .code-item.expired {
        border-left: 3px solid var(--danger-color);
      }

      .code-item.editing {
        background: var(--primary-background-color);
        border: 1px solid var(--divider-color);
      }

      .code-main {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 8px;
      }

      .code-info {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .code-name {
        font-weight: 500;
        color: var(--primary-text-color);
      }

      .code-slot {
        font-size: 12px;
        color: var(--secondary-text-color);
      }

      .code-expiration {
        font-size: 12px;
        color: var(--warning-color);
      }

      .code-expiration.expired {
        color: var(--danger-color);
      }

      .code-badges {
        display: flex;
        gap: 4px;
      }

      .badge {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: var(--secondary-background-color);
      }

      .badge ha-icon {
        --mdc-icon-size: 14px;
      }

      .badge.alert {
        color: var(--warning-color);
      }

      .badge.temp {
        color: var(--primary-color);
      }

      .code-actions {
        display: flex;
        gap: 4px;
        justify-content: flex-end;
      }

      .icon-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        border: none;
        border-radius: 50%;
        background: transparent;
        color: var(--secondary-text-color);
        cursor: pointer;
        transition: all 0.2s;
      }

      .icon-btn:hover {
        background: var(--divider-color);
      }

      .icon-btn.on {
        color: var(--primary-color);
      }

      .icon-btn.off {
        color: var(--disabled-color);
      }

      .icon-btn.danger:hover {
        background: var(--danger-color);
        color: white;
      }

      .icon-btn ha-icon {
        --mdc-icon-size: 20px;
      }

      .edit-form {
        width: 100%;
      }

      .form-row {
        margin-bottom: 12px;
      }

      .form-row label {
        display: block;
        margin-bottom: 4px;
        font-size: 12px;
        color: var(--secondary-text-color);
      }

      .form-row input[type="text"],
      .form-row input[type="password"],
      .form-row input[type="datetime-local"],
      .form-row select {
        width: 100%;
        padding: 8px 12px;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        background: var(--card-background-color);
        color: var(--primary-text-color);
        font-size: 14px;
        box-sizing: border-box;
      }

      .form-row.checkbox label {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
      }

      .form-row.checkbox input {
        width: auto;
      }

      .form-actions {
        display: flex;
        gap: 8px;
        justify-content: flex-end;
        margin-top: 16px;
      }

      .cancel-btn, .save-btn {
        padding: 8px 16px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
      }

      .cancel-btn {
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
      }

      .save-btn {
        background: var(--primary-color);
        color: white;
      }

      .save-btn:disabled {
        background: var(--disabled-color);
        cursor: not-allowed;
      }

      .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
      }

      .modal {
        width: 90%;
        max-width: 400px;
        background: var(--card-background-color);
        border-radius: 12px;
        overflow: hidden;
      }

      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px;
        border-bottom: 1px solid var(--divider-color);
      }

      .modal-header h3 {
        margin: 0;
        font-size: 18px;
      }

      .close-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border: none;
        border-radius: 50%;
        background: transparent;
        cursor: pointer;
        color: var(--secondary-text-color);
      }

      .close-btn:hover {
        background: var(--secondary-background-color);
      }

      .modal-body {
        padding: 16px;
      }

      .modal-footer {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        padding: 16px;
        border-top: 1px solid var(--divider-color);
      }

      .history-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .history-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        border-radius: 8px;
        background: var(--secondary-background-color);
      }

      .history-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: var(--primary-background-color);
      }

      .history-icon.unlock {
        color: var(--success-color);
      }

      .history-icon.lock {
        color: var(--primary-color);
      }

      .history-icon ha-icon {
        --mdc-icon-size: 20px;
      }

      .history-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .history-name {
        font-weight: 500;
        color: var(--primary-text-color);
      }

      .history-action {
        font-size: 12px;
        color: var(--secondary-text-color);
        text-transform: capitalize;
      }

      .history-time {
        font-size: 12px;
        color: var(--secondary-text-color);
      }
    `}};t([dt({attribute:!1})],pt.prototype,"hass",void 0),t([ht()],pt.prototype,"_config",void 0),t([ht()],pt.prototype,"_lockData",void 0),t([ht()],pt.prototype,"_history",void 0),t([ht()],pt.prototype,"_editingSlot",void 0),t([ht()],pt.prototype,"_editForm",void 0),t([ht()],pt.prototype,"_activeTab",void 0),t([ht()],pt.prototype,"_showAddModal",void 0),pt=t([(t=>(e,i)=>{void 0!==i?i.addInitializer(()=>{customElements.define(t,e)}):customElements.define(t,e)})("lock-manager-card")],pt),window.customCards=window.customCards||[],window.customCards.push({type:"lock-manager-card",name:"Lock Manager Card",description:"A card for managing Z-Wave lock codes"});export{pt as LockManagerCard};
//# sourceMappingURL=lock-manager-card.js.map
