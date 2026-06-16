// Service worker do Papo de Bola — apenas web push (sem cache offline por ora).

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { title: "Papo de Bola", body: event.data ? event.data.text() : "" };
  }

  const title = data.title || "Papo de Bola";
  const options = {
    body: data.body || "",
    icon: "/simbolo-papo-de-bola.png",
    badge: "/simbolo-papo-de-bola.png",
    tag: data.tag || undefined,
    renotify: !!data.tag,
    data: { url: data.url || "/" },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if (client.url.includes(url) && "focus" in client) return client.focus();
      }
      return self.clients.openWindow(url);
    })
  );
});
