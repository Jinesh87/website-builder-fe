import { createContext, useContext, type ReactNode } from "react";
import type { ShopCatalog, ShopCatalogProduct } from "./types.ts";

const ShopCatalogContext = createContext<ShopCatalog | null>(null);

export function ShopCatalogProvider({ value, children }: { value: ShopCatalog | null; children: ReactNode }) {
  return <ShopCatalogContext.Provider value={value}>{children}</ShopCatalogContext.Provider>;
}

export function useShopCatalog(): ShopCatalog | null {
  return useContext(ShopCatalogContext);
}

export function formatInr(paise: number): string {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(paise / 100);
}

export function priceRange(prices: number[]): string {
  if (prices.length === 0) return "";
  const low = Math.min(...prices);
  const high = Math.max(...prices);
  return low === high ? formatInr(low) : `${formatInr(low)} – ${formatInr(high)}`;
}

export function productHref(detailBase: string | undefined, slug: string, selection?: Record<string, string>): string {
  const trimmed = (detailBase || "/product").trim();
  const root = (trimmed.startsWith("/") ? trimmed : `/${trimmed}`).replace(/\/+$/, "");
  const path = `${root || "/product"}/${slug}`;
  const params = new URLSearchParams();
  for (const [name, value] of Object.entries(selection ?? {})) {
    if (name && value) params.set(name, value);
  }
  const query = params.toString();
  return query ? `${path}?${query}` : path;
}

export type ShopListing = {
  key: string;
  product: ShopCatalogProduct;
  variants: ShopCatalogProduct["variants"];
  /** Values that made this card, such as "5 / blue". Empty when the product is one card. */
  label: string;
};

/** Splits a product into shop cards. Options with `list` each add their value to the card. */
export function shopListings(product: ShopCatalogProduct): ShopListing[] {
  const groups = new Map<string, ShopListing>();
  for (const variant of product.variants) {
    const listed = variant.options.filter((option) => option.list);
    const key = listed.length ? listed.map((option) => `${option.name.toLowerCase()}=${option.value.toLowerCase()}`).join("&") : "*";
    const existing = groups.get(key);
    if (existing) {
      existing.variants.push(variant);
      continue;
    }
    groups.set(key, {
      key: `${product.id}:${key}`,
      product,
      variants: [variant],
      label: listed.map((option) => option.value).join(" / "),
    });
  }
  if (groups.size === 0) {
    return [{ key: product.id, product, variants: [], label: "" }];
  }
  return [...groups.values()];
}

export function listingSelection(listing: ShopListing): Record<string, string> {
  const variant = listing.variants[0];
  if (!variant) return {};
  return Object.fromEntries(variant.options.filter((option) => option.list).map((option) => [option.name, option.value]));
}

export function coverImage(product: { images: { url: string; alt: string }[]; variants: { images: { url: string; alt: string }[] }[] }): { url: string; alt: string } | null {
  return product.images[0] ?? product.variants.find((variant) => variant.images[0])?.images[0] ?? null;
}

/** Plain script so size and colour choices update price, stock, and photo on the published page. */
export const SHOP_DETAIL_SCRIPT = `(function(){
  document.querySelectorAll("[data-wb-detail]").forEach(function(root){
    if(root.getAttribute("data-wb-detail-ready")) return;
    root.setAttribute("data-wb-detail-ready","1");
    var node=root.querySelector("[data-wb-variants]");
    if(!node||!node.textContent) return;
    var variants=[];
    try{ variants=JSON.parse(node.textContent); }catch(e){ return; }
    var priceEl=root.querySelector("[data-wb-price]");
    var stockEl=root.querySelector("[data-wb-stock]");
    var hero=root.querySelector("[data-wb-hero]");
    var thumbs=root.querySelector("[data-wb-thumbs]");
    function showPhoto(src, alt){
      if(!hero||!src) return;
      hero.setAttribute("src", src);
      if(alt) hero.setAttribute("alt", alt);
    }
    function thumbList(){
      return thumbs ? Array.prototype.slice.call(thumbs.querySelectorAll("[data-wb-thumb]")) : [];
    }
    function showIndex(index){
      var list=thumbList();
      if(!list.length) return;
      var next=(index+list.length)%list.length;
      var button=list[next];
      showPhoto(button.getAttribute("data-src"), button.getAttribute("data-alt")||"");
      list.forEach(function(other, i){
        var on=i===next;
        other.classList.toggle("is-active", on);
        other.setAttribute("aria-pressed", on?"true":"false");
      });
    }
    function syncNav(){
      var many=thumbList().length>1;
      root.querySelectorAll("[data-wb-photo]").forEach(function(button){ button.hidden=!many; });
    }
    function bindThumbs(){
      if(!thumbs) return;
      thumbs.querySelectorAll("[data-wb-thumb]").forEach(function(button, index){
        if(button.getAttribute("data-wb-bound")) return;
        button.setAttribute("data-wb-bound","1");
        button.addEventListener("click", function(){ showIndex(index); });
      });
      syncNav();
    }
    function paintThumbs(images){
      if(!thumbs) return;
      var list=images||[];
      thumbs.hidden=list.length<2;
      thumbs.innerHTML="";
      list.forEach(function(photo, index){
        var button=document.createElement("button");
        button.type="button";
        button.className="wb-product-thumb"+(index===0?" is-active":"");
        button.setAttribute("data-wb-thumb","");
        button.setAttribute("data-src", photo.url||"");
        button.setAttribute("data-alt", photo.alt||"");
        button.setAttribute("aria-label", "Photo "+(index+1));
        button.setAttribute("aria-pressed", index===0?"true":"false");
        var img=document.createElement("img");
        img.alt="";
        img.src=photo.url||"";
        button.appendChild(img);
        thumbs.appendChild(button);
      });
      bindThumbs();
      if(list[0]) showPhoto(list[0].url, list[0].alt);
      syncNav();
    }
    bindThumbs();
    root.querySelectorAll("[data-wb-photo]").forEach(function(button){
      button.addEventListener("click", function(){
        var current=thumbList().findIndex(function(item){ return item.classList.contains("is-active"); });
        showIndex((current<0?0:current)+(button.getAttribute("data-wb-photo")==="prev"?-1:1));
      });
    });
    var stage=root.querySelector("[data-wb-stage]");
    if(stage){
      var startX=0;
      stage.addEventListener("pointerdown", function(event){
        if(event.target.closest&&event.target.closest("[data-wb-photo]")) return;
        startX=event.clientX;
        stage.setAttribute("data-swipe", "1");
      });
      stage.addEventListener("pointerup", function(event){
        if(stage.getAttribute("data-swipe")!=="1") return;
        stage.removeAttribute("data-swipe");
        var distance=event.clientX-startX;
        if(Math.abs(distance)<40) return;
        var current=thumbList().findIndex(function(item){ return item.classList.contains("is-active"); });
        showIndex((current<0?0:current)+(distance<0?1:-1));
      });
    }
    function same(options, pick){
      var keys=Object.keys(options);
      if(keys.length!==Object.keys(pick).length) return false;
      for(var i=0;i<keys.length;i++){ if(options[keys[i]]!==pick[keys[i]]) return false; }
      return true;
    }
    function selected(){
      var pick={};
      root.querySelectorAll("[data-wb-option].is-active").forEach(function(btn){
        pick[btn.getAttribute("data-wb-option")]=btn.getAttribute("data-wb-value");
      });
      return pick;
    }
    function apply(variant){
      if(priceEl) priceEl.textContent=variant.price;
      if(stockEl){
        stockEl.textContent=variant.stock;
        stockEl.classList.toggle("is-out", !!variant.out);
      }
      paintThumbs(variant.images&&variant.images.length?variant.images:(variant.image?[{url:variant.image,alt:variant.alt||""}]:[]));
      root.querySelectorAll("[data-wb-option]").forEach(function(btn){
        var on=variant.options[btn.getAttribute("data-wb-option")]===btn.getAttribute("data-wb-value");
        btn.classList.toggle("is-active", on);
        btn.setAttribute("aria-pressed", on?"true":"false");
      });
    }
    root.querySelectorAll("[data-wb-option]").forEach(function(btn){
      btn.addEventListener("click", function(){
        var name=btn.getAttribute("data-wb-option")||"";
        var value=btn.getAttribute("data-wb-value")||"";
        var pick=selected();
        pick[name]=value;
        var exact=null;
        var fallback=null;
        for(var i=0;i<variants.length;i++){
          if(!exact&&same(variants[i].options, pick)) exact=variants[i];
          if(!fallback&&variants[i].options[name]===value) fallback=variants[i];
        }
        if(exact||fallback) apply(exact||fallback);
      });
    });
  });
})();`;

/** Plain script so search and category filters work on the published page, which is static HTML. */
export const SHOP_LIST_SCRIPT = `(function(){
  document.querySelectorAll("[data-wb-shop]").forEach(function(root){
    if(root.getAttribute("data-wb-shop-ready")) return;
    root.setAttribute("data-wb-shop-ready","1");
    if(root.hasAttribute("data-wb-shop-paged")){
      var form=root.querySelector("[data-wb-shop-form]");
      var sortEl=root.querySelector("[data-wb-shop-sort]");
      var perEl=root.querySelector("[data-wb-shop-per]");
      function visit(){
        if(!form) return;
        var params=new URLSearchParams();
        var q=form.querySelector("[name=q]");
        var sort=form.querySelector("[name=sort]");
        var per=root.querySelector("[data-wb-shop-per]");
        var cat=form.querySelector("[name=cat]");
        if(q&&q.value.trim()) params.set("q", q.value.trim());
        if(cat&&cat.value) params.set("cat", cat.value);
        if(sort&&sort.value&&sort.value!=="featured") params.set("sort", sort.value);
        if(per&&per.value&&per.value!=="12") params.set("per", per.value);
        var text=params.toString();
        window.location.href=text?window.location.pathname+"?"+text:window.location.pathname;
      }
      if(form) form.addEventListener("submit", function(event){ event.preventDefault(); visit(); });
      if(sortEl) sortEl.addEventListener("change", visit);
      if(perEl) perEl.addEventListener("change", visit);
      var moreBtn=root.querySelector("[data-wb-shop-more]");
      var filterBox=root.querySelector(".wb-shop-filters");
      if(moreBtn&&filterBox){
        moreBtn.addEventListener("click", function(){
          var open=filterBox.classList.toggle("is-expanded");
          moreBtn.textContent=moreBtn.getAttribute(open?"data-less":"data-more")||(open?"Less":"More");
          moreBtn.setAttribute("aria-expanded", open?"true":"false");
        });
      }
      return;
    }
    var input=root.querySelector("[data-wb-shop-search]");
    var sort=root.querySelector("[data-wb-shop-sort]");
    var count=root.querySelector("[data-wb-shop-count]");
    var grid=root.querySelector(".wb-shop-grid");
    var cards=Array.prototype.slice.call(root.querySelectorAll("[data-wb-product]"));
    var empty=root.querySelector("[data-wb-shop-none]");
    var buttons=Array.prototype.slice.call(root.querySelectorAll("[data-wb-shop-filter]"));
    var category="All";
    function apply(){
      var q=(input&&input.value||"").trim().toLowerCase();
      var shown=0;
      cards.forEach(function(card){
        var hay=(card.getAttribute("data-search")||"").toLowerCase();
        var cat=card.getAttribute("data-category")||"";
        var ok=(category==="All"||cat===category)&&(!q||hay.indexOf(q)!==-1);
        card.hidden=!ok;
        if(ok) shown++;
      });
      var mode=sort&&sort.value||"featured";
      cards.sort(function(a,b){
        if(mode==="price-low") return Number(a.getAttribute("data-price")||0)-Number(b.getAttribute("data-price")||0);
        if(mode==="price-high") return Number(b.getAttribute("data-price")||0)-Number(a.getAttribute("data-price")||0);
        if(mode==="name") return (a.getAttribute("data-name")||"").localeCompare(b.getAttribute("data-name")||"");
        return Number(a.getAttribute("data-order")||0)-Number(b.getAttribute("data-order")||0);
      });
      if(grid) cards.forEach(function(card){ grid.appendChild(card); });
      if(count) count.textContent=shown+" "+(shown===1?"product":"products");
      if(empty) empty.hidden=shown!==0;
    }
    if(input) input.addEventListener("input", apply);
    if(sort) sort.addEventListener("change", apply);
    buttons.forEach(function(button){
      button.addEventListener("click", function(){
        category=button.getAttribute("data-wb-shop-filter")||"All";
        buttons.forEach(function(other){
          var on=other===button;
          other.classList.toggle("is-active", on);
          other.setAttribute("aria-pressed", on?"true":"false");
        });
        apply();
      });
    });
    var more=root.querySelector("[data-wb-shop-more]");
    var filters=root.querySelector(".wb-shop-filters");
    if(more&&filters){
      more.addEventListener("click", function(){
        var open=filters.classList.toggle("is-expanded");
        more.textContent=more.getAttribute(open?"data-less":"data-more")||(open?"Less":"More");
        more.setAttribute("aria-expanded", open?"true":"false");
      });
    }
    apply();
  });
})();`;
