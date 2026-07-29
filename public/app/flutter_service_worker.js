'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';

const RESOURCES = {"flutter_bootstrap.js": "dbd56b992e346e72ec3fa2e41c542bea",
"version.json": "e965a8b24ffd44e9e2a2efb3c01b154f",
"index.html": "90e3dc69f3abd051075b9c6d6e1f1dff",
"/": "90e3dc69f3abd051075b9c6d6e1f1dff",
"main.dart.js": "26df14995bddf559288a437bc96e9c77",
"flutter.js": "24bc71911b75b5f8135c949e27a2984e",
"favicon.png": "5dcef449791fa27946b3d35ad8803796",
"icons/Icon-192.png": "ac9a721a12bbc803b44f645561ecb1e1",
"icons/Icon-maskable-192.png": "c457ef57daa1d16f64b27b786ec2ea3c",
"icons/Icon-maskable-512.png": "301a7604d45b3e739efc881eb04896ea",
"icons/Icon-512.png": "96e752610906ba2a93c65f8abe1645f1",
"manifest.json": "f0f4077c4d8f8c69622547d0e8f7b60f",
"assets/NOTICES": "95557cfbc0eb9e508de72eae2091d942",
"assets/FontManifest.json": "dc3d03800ccca4601324923c0b1d6d57",
"assets/AssetManifest.bin.json": "f04d26749812261e91460355260d2962",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "33b7d9392238c04c131b6ce224e13711",
"assets/packages/flutter_map/lib/assets/flutter_map_logo.png": "208d63cc917af9713fc9572bd5c09362",
"assets/shaders/ink_sparkle.frag": "ecc85a2e95f5e9f53123dcaf8cb9b6ce",
"assets/shaders/stretch_effect.frag": "40d68efbbf360632f614c731219e95f0",
"assets/AssetManifest.bin": "ad6bf8dd314bf80498cfe7f75b25c7be",
"assets/fonts/MaterialIcons-Regular.otf": "3fcf1e018931c4db2aadb46cf077050a",
"assets/assets/regions/Vakinankaratra.jpg": "5967e4840e5139c32ddd3da93af1cc15",
"assets/assets/regions/Analanjirofo.jpg": "ee6cbca0fb88e2683954fbe29e121f22",
"assets/assets/regions/AtsimoAndrefana.jpg": "3507d2f99d8ff3461b9cca6ea2acc41e",
"assets/assets/regions/AtsimoAtsinanana.webp": "ec0d4148e6408f13b42aae2bd76850d0",
"assets/assets/regions/AmoroniMania.jpg": "4ae9920380b4fd63a554a93f808c75be",
"assets/assets/regions/Bongolava.jpg": "14a979b8c673582bcd5386384259466c",
"assets/assets/regions/Analamanga.jpg": "16d076f6608633dc00c718520b36ab3c",
"assets/assets/regions/Ihorombe.jpg": "a1a10d82ed5081374df182dab50889eb",
"assets/assets/regions/Betsiboka.jpg": "aa958c5ba114ec457ae15dcc5e391202",
"assets/assets/regions/Anosy.jpg": "84244a43032f70323f7562dcbdfc4fde",
"assets/assets/regions/Androy.jpg": "f61dad8f12a326aa1cc14c93e6463405",
"assets/assets/regions/Itasy.jpg": "bba92e5bc42f138cf295b253d1335331",
"assets/assets/regions/Melaky.jpg": "5173f0bf55272831fe3a54d99894768b",
"assets/assets/regions/Atsinanana.jpg": "70b21070b7d78ebb6731cc7edca8e0ce",
"assets/assets/regions/AlaotraMangoro.jpg": "afc8e2a4a7068bd1baa35dea042824d1",
"assets/assets/regions/Diana.jpg": "895aee58ef272fb40fd47897e42f27a7",
"assets/assets/regions/VatovavyFitovinany.jpg": "fb7772d8e90aa4cdb95e503c7e35e488",
"assets/assets/regions/Sava.jpg": "3b22187bf689f41f538fba0b3ac4961d",
"assets/assets/regions/Boeny.jpg": "68d28d9ac70de4179f3c3384c0785ac1",
"assets/assets/regions/Menabe.jpg": "c01a25b412fb58701975750e6c165c54",
"assets/assets/regions/Atsinanana.html": "dd3450cd378a69511c8a917558e08d6a",
"assets/assets/regions/Sofia.jpg": "a3679310ed952e5850631bc279425d11",
"assets/assets/regions/HauteMatsiatra.jpg": "3ac08ea77c844e9a99b35c24301c9e74",
"assets/assets/voly/petit_pois.jpg": "1ea66f5da0bf5ea478bf511bcc1e240d",
"assets/assets/voly/lentille.jpg": "0cffd2172e9d0b6fa80ead608f924c9c",
"assets/assets/voly/amarante_queue_de_renard.jpg": "aaa6a2d765319019363040d989eae8f8",
"assets/assets/voly/luzerne.jpg": "482971112dc28c86f42905010db6c565",
"assets/assets/voly/anamalaho.jpg": "103f5f1939aa0d0ef2a2137890675770",
"assets/assets/voly/karaoty.jpg": "aef8ca514b5fcdfc3a10b02c8bf361ef",
"assets/assets/voly/sakay.jpg": "3c73c947b14cd6b80b033599fce7d3c7",
"assets/assets/voly/chou_fleur.jpg": "8a75930cbad7bc17d6d21bc8be1a1afe",
"assets/assets/voly/papaye.jpg": "16aea3dd57d9a96a78dcad311310139e",
"assets/assets/voly/persil.jpg": "44ec7b0de72bbd70c16d32d046c86258",
"assets/assets/voly/bredes_mafana.jpg": "103f5f1939aa0d0ef2a2137890675770",
"assets/assets/voly/baranjely.jpg": "460dea473235a81d2dd3d02d87bcdece",
"assets/assets/voly/angivy.jpg": "a0818946a10d18b3d2ecca3a03aa4afa",
"assets/assets/voly/kabaro.jpg": "94cccef4128d437750781fc4e8d5cacc",
"assets/assets/voly/bl%25C3%25A9.jpg": "800e474b848a713b5020ea24f8a0a2cb",
"assets/assets/voly/menthe.jpg": "7c4addd43fe1f201ca8790bb678b0887",
"assets/assets/voly/ovy.jpg": "b4b01ec3be2e2eb16e71f889c36ca1b1",
"assets/assets/voly/pasteque.jpg": "13ee33e9434cb0d9afc96db41d65fc68",
"assets/assets/voly/concombre.jpg": "af04e8dad05bf3c80ac01e99601000e9",
"assets/assets/voly/voatabia_lava.jpg": "3b1288cf69b6b7856259005a902a5aa4",
"assets/assets/voly/saonjo.jpg": "77d687cd39283a89a90c5c632ee86f0a",
"assets/assets/voly/vary_anaty_rano.jpg": "0e3bad892b8eb1b3aaa33390da75e348",
"assets/assets/voly/consoude.jpg": "89b6acc141b378b468f29d4b881e9c7f",
"assets/assets/voly/epinard.jpg": "8be2033304fe69f98333cab81f6f27b3",
"assets/assets/voly/avoine.jpg": "540d9f94751077ee6175b7bf704b82f4",
"assets/assets/voly/haricots_grains.jpg": "2673288f3f4279085a668427c0018a5b",
"assets/assets/voly/pois_chiche.jpg": "414aed2ba0c507687515d0ebc648ea11",
"assets/assets/voly/navet.jpg": "f8a71ec55b66c0088781416e3d06abc3",
"assets/assets/voly/celeri.jpg": "4c7b422be51a1fcb73adcdf6e352861c",
"assets/assets/voly/poivron_doux.jpg": "fa2288dec100fcd1596739c1965b3414",
"assets/assets/voly/voanjobory.jpg": "1721e66650da9ec54b89f18c1a1008a1",
"assets/assets/voly/vomanga.jpg": "4be208c2e579660d97c95d9eccab8abf",
"assets/assets/voly/choux_fleur.jpg": "8a75930cbad7bc17d6d21bc8be1a1afe",
"assets/assets/voly/sakay_pilokely.jpg": "6a81713b6465bc7ef84b3892147cff44",
"assets/assets/voly/ray_grass.jpg": "05e05110b845e085c30ce9ac255fb80a",
"assets/assets/voly/betterave_rouge.jpg": "4541e7a64e196d10b38a2ec596395c8c",
"assets/assets/voly/haricots.jpg": "bdc5f07c2b436f47e8fed4df73b1b035",
"assets/assets/voly/katsaka.jpg": "f2f3de1c8e5f26643cea049d2a14d686",
"assets/assets/voly/salady.jpg": "0e2100c9825fe06893c071301fcb9f74",
"assets/assets/voly/anambongo.jpg": "e818eb04e9006e3ed64a1ca013e40cf8",
"assets/assets/voly/sakamalao.jpg": "b8b82ee5e31789a2239af1a31944848a",
"assets/assets/voly/melon.jpg": "adc88d718bc7501026b08893748702ea",
"assets/assets/voly/vary_fohy.jpg": "255e2ffd130b3ec72a0a5e7852dd9604",
"assets/assets/voly/radis.jpg": "eabbe3eb1d879ab73fffcdeb7c3eaf46",
"assets/assets/voly/orge.jpg": "afb8b26772fd454a391ad831c60c6230",
"assets/assets/voly/courgette.jpg": "45b84e2ae67c94ae751510b82a330440",
"assets/assets/voly/oviala.jpg": "fbbc626db915599404b2c55190ab84ed",
"assets/assets/voly/betterave.jpg": "4541e7a64e196d10b38a2ec596395c8c",
"assets/assets/voly/anatsonga.jpg": "a37b2f35b8e59bb23e3ecbd3b28c5f6b",
"assets/assets/voly/voatabia_boribory.jpg": "d4f219062e97b9e38f3f528faed3dccf",
"assets/assets/voly/karoty.jpg": "aef8ca514b5fcdfc3a10b02c8bf361ef",
"assets/assets/voly/petsay.jpg": "bb5b2e45a0137299659f0e4fc0682074",
"assets/assets/voly/chou_chinois.jpg": "9c8f8f5c65907fc788874220bedd6708",
"assets/assets/voly/anana.jpg": "aa78715c3602e214c7f9c0ac477df0cf",
"assets/assets/voly/mangahazo.jpg": "d54b6077ba4ccf193ade4309c2d117eb",
"assets/assets/voly/brocoli.jpg": "70f3fb75ac6d066a299a1b7b214d416a",
"assets/assets/voly/anamamy.jpg": "4d07a3c1130bbcefe9c94a9ca196f00a",
"assets/assets/images/m3.png": "ce7eb29f16ad8c793d675eac9ad59056",
"assets/assets/images/m2.png": "ec2f8207c6251245ba58d8621f06ed87",
"assets/assets/images/m1.png": "f79bb8e563929b1c51e9c189a206c661",
"assets/assets/images/minae_logo.png": "0f9b517f0847e70797ad7cb4fa91c234",
"assets/assets/images/m5.png": "59e4df855ce0a12acad4e4489ed699ab",
"assets/assets/images/katsaka-gasy.jpg": "96af7ef915aa08b840fa3a8b0039d33a",
"assets/assets/images/m4.png": "7ae7ebeaac086ca3066379651821a2c0",
"assets/assets/images/m6.png": "5bd69956a7311030c4e30978738e1cc8",
"assets/assets/images/m7.png": "8fb586cec9351ed3e9e471233763a5cf",
"assets/assets/images/m4.2.png": "11889ae630cc64ad8b164dc87a615a55",
"assets/assets/images/m4.1.png": "bff9d41d92f9816ee1386e08f6918901",
"assets/assets/images/drpma_logo.png": "43c827589360fe4853ed4ffb62037c57",
"assets/assets/images/farmer_3d.png": "ee9425fcb5193ead5f6843dd5c0055c3",
"assets/assets/images/m2.1.png": "256d4551fb22409ba13ac00d3b6c745c",
"assets/assets/images/miasa_logo.png": "090e74e387b880dca6d3b8672c65bc2b",
"assets/assets/Minae.png": "0f9b517f0847e70797ad7cb4fa91c234",
"canvaskit/skwasm.js": "8060d46e9a4901ca9991edd3a26be4f0",
"canvaskit/skwasm_heavy.js": "740d43a6b8240ef9e23eed8c48840da4",
"canvaskit/skwasm.js.symbols": "3a4aadf4e8141f284bd524976b1d6bdc",
"canvaskit/canvaskit.js.symbols": "a3c9f77715b642d0437d9c275caba91e",
"canvaskit/skwasm_heavy.js.symbols": "0755b4fb399918388d71b59ad390b055",
"canvaskit/skwasm.wasm": "7e5f3afdd3b0747a1fd4517cea239898",
"canvaskit/chromium/canvaskit.js.symbols": "e2d09f0e434bc118bf67dae526737d07",
"canvaskit/chromium/canvaskit.js": "a80c765aaa8af8645c9fb1aae53f9abf",
"canvaskit/chromium/canvaskit.wasm": "a726e3f75a84fcdf495a15817c63a35d",
"canvaskit/canvaskit.js": "8331fe38e66b3a898c4f37648aaf7ee2",
"canvaskit/canvaskit.wasm": "9b6a7830bf26959b200594729d73538e",
"canvaskit/skwasm_heavy.wasm": "b0be7910760d205ea4e011458df6ee01"};
// The application shell files that are downloaded before a service worker can
// start.
const CORE = ["main.dart.js",
"index.html",
"flutter_bootstrap.js",
"assets/AssetManifest.bin.json",
"assets/FontManifest.json"];

// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});
// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        // Claim client to enable caching on first launch
        self.clients.claim();
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      // Claim client to enable caching on first launch
      self.clients.claim();
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});
// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache only if the resource was successfully fetched.
        return response || fetch(event.request).then((response) => {
          if (response && Boolean(response.ok)) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      })
    })
  );
});
self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});
// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}
// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
