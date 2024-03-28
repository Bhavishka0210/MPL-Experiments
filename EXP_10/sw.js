self.addEventListener("install", function (event) {
  event.waitUntil(preLoad());
});

self.addEventListener("fetch", function (event) {
  event.respondWith(
      checkResponse(event.request).catch(function () {
          return returnFromCache(event.request);
      })
  );
  event.waitUntil(
      addToCache(event.request).then(function () {
          console.log("Fetch successful!");
      }).catch(function(error) {
          console.error("Error caching:", error);
      })
  );
});

self.addEventListener('sync', function(event) {
  if (event.tag === 'syncMessage') {
      console.log("Sync successful!");
  }
});

self.addEventListener('push', function (event) {
  if (event && event.data) {
      var data = event.data.json();
      if (data.method == "pushMessage") {
          console.log("Push notification sent");
          event.waitUntil(
              self.registration.showNotification("Omkar Sweets Corner", {
                  body: data.message
              })
          );
      }
  }
});

var filesToCache = [
  '/',
  '/menu',
  '/contactUs',
  '/offline.html',
];

var preLoad = function () {
  return caches.open("offline").then(function (cache) {
      // caching index and important routes
      return cache.addAll(filesToCache);
  });
};

var checkResponse = function (request) {
  return fetch(request).then(function (response) {
      if (!response.ok) {
          throw Error(response.statusText);
      }
      return response;
  }).catch(function (error) {
      console.error('Fetch failed:', error);
      throw error;
  });
};

var returnFromCache = function (request) {
  return caches.open('offline').then(function (cache) {
      return cache.match(request).then(function (matching) {
          if (!matching || matching.status === 404) {
              return cache.match('/offline.html');
          }
          return matching;
      });
  });
};

var addToCache = function (request) {
  return caches.open('offline').then(function (cache) {
      return fetch(request).then(function (response) {
          return cache.put(request, response);
      });
  });
};
