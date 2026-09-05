/* フォーム解析ラボ Service Worker
   ねらい: グラウンドで電波が弱くても使えるようにする。
   - HTML はネットワーク優先(更新をすぐ反映し、圏外ならキャッシュで動く)
   - 解析ライブラリ・モデル(数MB)はキャッシュ優先(URLにバージョンが入っているので古くならない)
*/
const VERSION = "v25";
const SHELL = "shell-" + VERSION;
const ASSETS = "assets-" + VERSION;

const SHELL_FILES = [
  "./",
  "./index.html",
  "./manual.html",
  "./formanalyzer.html",
  "./pitching-analyzer.html",
  "./batting-analyzer.html",
  "./manifest.webmanifest",
  "./icon-180.png",
  "./icon-192.png",
  "./icon-512.png",
];

/* このアプリで外部から取るのは解析ライブラリ・モデル・フォントだけなので、
   ホストを列挙せず「別オリジンのGETはすべてキャッシュ優先」で扱う。
   CDNの切り替え(jsdelivr/unpkg)やパス変更にも影響を受けない。 */

self.addEventListener("install", (e)=>{
  e.waitUntil((async ()=>{
    const c = await caches.open(SHELL);
    // 1つ失敗しても他は入れたいので個別に処理する
    await Promise.all(SHELL_FILES.map(u=>c.add(u).catch(()=>{})));
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (e)=>{
  e.waitUntil((async ()=>{
    const keep = new Set([SHELL, ASSETS]);
    for (const k of await caches.keys()) if (!keep.has(k)) await caches.delete(k);
    await self.clients.claim();
  })());
});

self.addEventListener("message", (e)=>{
  if (e.data === "skipWaiting") self.skipWaiting();
});

self.addEventListener("fetch", (e)=>{
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // HTML/ナビゲーション: ネットワーク優先
  if (req.mode === "navigate" || (req.destination === "document")) {
    e.respondWith((async ()=>{
      try{
        const res = await fetch(req);
        const c = await caches.open(SHELL);
        c.put(req, res.clone()).catch(()=>{});
        return res;
      }catch{
        // 未キャッシュのページを圏外で開いたときは入口に戻す(そこから説明書と各アプリに行ける)
        return (await caches.match(req)) || (await caches.match("./index.html"))
            || (await caches.match("./formanalyzer.html"))
            || new Response("オフラインです", {status:503, headers:{"Content-Type":"text/plain; charset=utf-8"}});
      }
    })());
    return;
  }

  // 解析ライブラリ・モデル・フォント(別オリジン): キャッシュ優先
  if (url.origin !== self.location.origin) {
    e.respondWith((async ()=>{
      const c = await caches.open(ASSETS);
      const hit = await c.match(req);
      if (hit) return hit;
      const res = await fetch(req);
      // opaque(no-cors)でも入れておく。失敗しても本体の動作は止めない
      if (res && (res.ok || res.type === "opaque")) c.put(req, res.clone()).catch(()=>{});
      return res;
    })());
    return;
  }

  // 同一オリジンのその他: キャッシュ優先
  if (url.origin === self.location.origin) {
    e.respondWith((async ()=>{
      const hit = await caches.match(req);
      if (hit) return hit;
      try{
        const res = await fetch(req);
        const c = await caches.open(SHELL);
        if (res && res.ok) c.put(req, res.clone()).catch(()=>{});
        return res;
      }catch{
        return new Response("", {status:504});
      }
    })());
  }
});
