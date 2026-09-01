/** Fotos de producto para la carta digital — productId → imagen local */
window.CARTA_FOTOS = [
  { productId: 90, src: "images/carta/fotos/90-ice-dirty-horchata.jpg", name: "Ice Dirty Horchata" },
  { productId: 119, src: "images/carta/fotos/119-servicio-3-tazas.jpg", name: "Servicio 3 Tazas" },
  { productId: 12, src: "images/carta/fotos/12-latte.jpg", name: "Latte" },
  { productId: 30, src: "images/carta/fotos/30-charcoal.jpg", name: "Charcoal" },
  { productId: 64, src: "images/carta/fotos/64-espresso-tonic.jpg", name: "Espresso Tonic" },
  { productId: 35, src: "images/carta/fotos/35-origami-1-taza.jpg", name: "Origami 1 Taza" },
  { productId: 33, src: "images/carta/fotos/33-chemex-1-taza.jpg", name: "Chemex 1 Taza" },
  { productId: 133, src: "images/carta/fotos/133-waffle.jpg", name: "Waffle" },
  { productId: 140, src: "images/carta/fotos/140-baguette-de-la-casa.jpg", name: "Baguette de la Casa" },
  { productId: 135, src: "images/carta/fotos/135-bagel-de-luxe.jpg", name: "Bagel de Luxe" },
];

window.CARTA_FOTOS_BY_ID = Object.fromEntries(
  window.CARTA_FOTOS.map(function (f) {
    return [f.productId, f];
  })
);
