// Cupons + vitrine do 11.11 da Shopee na página /cupons/shopee (página 29, RASCUNHO).
// Fonte: shopee.com.br/m/11-11 (página da campanha que a Shopee mandou por e-mail), lida no Chrome
// em 11/11/2026 ~15h. Links gerados pela API de afiliados da Shopee (generateShortLink, subId
// "cuponsshopee"); a credencial NÃO fica no repo. Preço = o da página da campanha nesse horário.
// Troca os "Modelo de cupom Shopee" pelo card de cupons + 8 vitrines, deixa a página larga (1240px)
// e o aviso de afiliado no FIM. Não publica.
//   bash ~/run-seed-cupons.sh update-cupons-shopee.mjs
import fs from "fs";
const LOG = "/app/out.txt"; fs.writeFileSync(LOG, "");
const log = (m) => fs.appendFileSync(LOG, `${m}
`);
const DATA = {
 "campaign": "https://s.shopee.com.br/9V2xnUp8PL",
 "groups": [
  {
   "h3": "Games e tecnologia",
   "gridTitle": "Games, monitor e projetor",
   "items": [
    {
     "badge": "",
     "name": "Controle DualSense PS5 Branco",
     "imageUrl": "https://cf.shopee.com.br/file/br-11134207-820l9-mpthld7xggeaa3",
     "note": "208 vendidos · vendido por Webfones",
     "rating": "5,0",
     "reviews": "",
     "tag": "-33%",
     "price": "R$ 369,55",
     "oldPrice": "",
     "store": "shopee",
     "url": "https://s.shopee.com.br/AUvUzJLoZN"
    },
    {
     "badge": "",
     "name": "Console Nintendo Switch Lite Turquesa",
     "imageUrl": "https://cf.shopee.com.br/file/br-11134207-820m8-mrhncjetkikm88",
     "note": "58 vendidos · vendido por Webfones",
     "rating": "5,0",
     "reviews": "",
     "tag": "-40%",
     "price": "R$ 1.144,07 no Pix",
     "oldPrice": "",
     "store": "shopee",
     "url": "https://s.shopee.com.br/80EA0iZjPP"
    },
    {
     "badge": "",
     "name": "Monitor Gamer Curvo AOC AGON 32\" 180 Hz",
     "imageUrl": "https://cf.shopee.com.br/file/sg-11134201-821fo-mgmdxg357zew17",
     "note": "187 vendidos · vendido por 123 Comprou!",
     "rating": "5,0",
     "reviews": "",
     "tag": "-45%",
     "price": "R$ 1.091,63 no Pix",
     "oldPrice": "",
     "store": "shopee",
     "url": "https://s.shopee.com.br/4VeHqHmv0j"
    },
    {
     "badge": "",
     "name": "Monitor Gamer LG UltraGear 27\" 144 Hz",
     "imageUrl": "https://cf.shopee.com.br/file/br-11134207-820me-msmwwza1qebpc7",
     "note": "116 vendidos · vendido por NegociuN",
     "rating": "4,9",
     "reviews": "",
     "tag": "-37%",
     "price": "R$ 746,91 no Pix",
     "oldPrice": "",
     "store": "shopee",
     "url": "https://s.shopee.com.br/3g5Aqkq9xo"
    },
    {
     "badge": "",
     "name": "Controle GameSir T4 Nova Lite sem fio",
     "imageUrl": "https://cf.shopee.com.br/file/br-11134207-820mg-mq36yggsrlz5a9",
     "note": "1 mil+ vendidos · vendido por NovaPeak Brand Oficial",
     "rating": "5,0",
     "reviews": "",
     "tag": "-40%",
     "price": "R$ 148,20 no Pix",
     "oldPrice": "",
     "store": "shopee",
     "url": "https://s.shopee.com.br/4LKrdys1NZ"
    },
    {
     "badge": "",
     "name": "Projetor HY300 4K com Wi-Fi e Bluetooth",
     "imageUrl": "https://cf.shopee.com.br/file/sg-11134201-824ib-mpijkctweuwx01",
     "note": "486 vendidos · vendido por JORTAN",
     "rating": "4,8",
     "reviews": "",
     "tag": "-50%",
     "price": "R$ 150,00 no Pix",
     "oldPrice": "",
     "store": "shopee",
     "url": "https://s.shopee.com.br/4B1RRfsj0u"
    }
   ]
  },
  {
   "h3": "Celulares, smartwatch e fones",
   "gridTitle": "Celulares, relógios e fones",
   "items": [
    {
     "badge": "",
     "name": "Samsung Galaxy A07",
     "imageUrl": "https://cf.shopee.com.br/file/sg-11134201-82597-muwgcmsyr476ef",
     "note": "171 vendidos · vendido por Magalu",
     "rating": "5,0",
     "reviews": "",
     "tag": "-19%",
     "price": "R$ 735,08",
     "oldPrice": "",
     "store": "shopee",
     "url": "https://s.shopee.com.br/2qW3rE23wg"
    },
    {
     "badge": "",
     "name": "Samsung Galaxy A17 5G 256 GB",
     "imageUrl": "https://cf.shopee.com.br/file/br-11134207-820ma-mu12e1meam0xa0",
     "note": "62 vendidos · vendido por NegociuN",
     "rating": "5,0",
     "reviews": "",
     "tag": "-35%",
     "price": "R$ 1.478,35 no Pix",
     "oldPrice": "",
     "store": "shopee",
     "url": "https://s.shopee.com.br/9KjXbAdSHy"
    },
    {
     "badge": "",
     "name": "Xiaomi Poco X8 5G",
     "imageUrl": "https://cf.shopee.com.br/file/br-11134207-820mb-mt5g7htzvric51",
     "note": "246 vendidos · vendido por Loja_Novacell",
     "rating": "4,9",
     "reviews": "",
     "tag": "-34%",
     "price": "R$ 1.839,08 no Pix",
     "oldPrice": "",
     "store": "shopee",
     "url": "https://s.shopee.com.br/4LKrdywURU"
    },
    {
     "badge": "",
     "name": "Tablet Samsung Galaxy Tab A11+ 5G 128 GB",
     "imageUrl": "https://cf.shopee.com.br/file/br-11134207-81ztc-mk9qnvq0t1c155",
     "note": "101 vendidos · vendido por NegociuN",
     "rating": "4,9",
     "reviews": "",
     "tag": "-32%",
     "price": "R$ 1.573,11 no Pix",
     "oldPrice": "",
     "store": "shopee",
     "url": "https://s.shopee.com.br/AAIeahec7T"
    },
    {
     "badge": "",
     "name": "Smartwatch HUAWEI Watch GT 7",
     "imageUrl": "https://cf.shopee.com.br/file/br-11134207-820ls-muusw4jg6d4xc1",
     "note": "37 vendidos · vendido por HUAWEI Loja Oficial",
     "rating": "5,0",
     "reviews": "",
     "tag": "-59%",
     "price": "R$ 949,17 no Pix",
     "oldPrice": "",
     "store": "shopee",
     "url": "https://s.shopee.com.br/4qH8EtyVMl"
    },
    {
     "badge": "",
     "name": "Fone HUAWEI FreeBuds Neo com cancelamento de ruído",
     "imageUrl": "https://cf.shopee.com.br/file/br-11134207-820m1-muum57us7q4hb3",
     "note": "17 vendidos · vendido por HUAWEI Loja Oficial",
     "rating": "5,0",
     "reviews": "",
     "tag": "-63%",
     "price": "R$ 369,99 no Pix",
     "oldPrice": "",
     "store": "shopee",
     "url": "https://s.shopee.com.br/7pujoPrxsa"
    }
   ]
  },
  {
   "h3": "Esporte e academia em casa",
   "gridTitle": "Esporte e suplementos",
   "items": [
    {
     "badge": "Mais vendido",
     "name": "Bike Spinning profissional até 120 kg",
     "imageUrl": "https://cf.shopee.com.br/file/br-11134207-7r98o-m8dq90menppta0",
     "note": "6 mil+ vendidos · vendido por SINBER OFICIAL",
     "rating": "4,9",
     "reviews": "",
     "tag": "-77%",
     "price": "R$ 361,00 no Pix",
     "oldPrice": "",
     "store": "shopee",
     "url": "https://s.shopee.com.br/7Af31BuMin"
    },
    {
     "badge": "",
     "name": "Bicicleta ergométrica compacta e silenciosa",
     "imageUrl": "https://cf.shopee.com.br/file/br-11134207-820m4-mmb91abb32104f",
     "note": "227 vendidos · vendido por  VIE IDÉALE",
     "rating": "4,9",
     "reviews": "",
     "tag": "-80%",
     "price": "R$ 593,54 no Pix",
     "oldPrice": "",
     "store": "shopee",
     "url": "https://s.shopee.com.br/60T5d2ysLq"
    },
    {
     "badge": "",
     "name": "Whey Protein Isofort 900 g Vitafor",
     "imageUrl": "https://cf.shopee.com.br/file/br-11134207-7r98o-lyo6orryq76tbb",
     "note": "115 vendidos · vendido por Hotbody Suplementos",
     "rating": "4,9",
     "reviews": "",
     "tag": "-10%",
     "price": "R$ 351,41 no Pix",
     "oldPrice": "",
     "store": "shopee",
     "url": "https://s.shopee.com.br/7VHtPnx9Vu"
    },
    {
     "badge": "",
     "name": "Kit Creatina + Pré-treino Evolution",
     "imageUrl": "https://cf.shopee.com.br/file/sg-11134201-8259i-msnhbjh1yio59f",
     "note": "1 mil+ vendidos · vendido por Soldiers Nutrition",
     "rating": "4,9",
     "reviews": "",
     "tag": "-47%",
     "price": "R$ 65,90",
     "oldPrice": "",
     "store": "shopee",
     "url": "https://s.shopee.com.br/1BsU1QBa2"
    },
    {
     "badge": "Mais vendido",
     "name": "Kit Waxy Whey 900 g + BCAA + Creatina",
     "imageUrl": "https://cf.shopee.com.br/file/br-11134207-820m0-mldo0o8xvsp0f8",
     "note": "4 mil+ vendidos · vendido por Loja do Suplemento Oficial",
     "rating": "4,8",
     "reviews": "",
     "tag": "-9%",
     "price": "R$ 59,99",
     "oldPrice": "",
     "store": "shopee",
     "url": "https://s.shopee.com.br/4B1RRgEF4x"
    },
    {
     "badge": "",
     "name": "Capacete Peels Spike 2",
     "imageUrl": "https://cf.shopee.com.br/file/sg-11134201-824hn-mesh56u3a96r96",
     "note": "208 vendidos · vendido por Peels Capacetes",
     "rating": "4,9",
     "reviews": "",
     "tag": "-20%",
     "price": "R$ 265,15 no Pix",
     "oldPrice": "",
     "store": "shopee",
     "url": "https://s.shopee.com.br/9fMNzmtmkK"
    }
   ]
  },
  {
   "h3": "Ventiladores, climatizadores e ar-condicionado",
   "gridTitle": "Para o calor",
   "items": [
    {
     "badge": "Mais vendido",
     "name": "Ventilador Mondial 30 cm",
     "imageUrl": "https://cf.shopee.com.br/file/br-11134207-820lg-mralqrfevhfp9f",
     "note": "3 mil+ vendidos · vendido por LOI BRASIL",
     "rating": "4,9",
     "reviews": "",
     "tag": "-57%",
     "price": "R$ 85,41 no Pix",
     "oldPrice": "",
     "store": "shopee",
     "url": "https://s.shopee.com.br/4VeHqICyQ2"
    },
    {
     "badge": "",
     "name": "Ventilador de teto Ventisol Fênix Inverter com LED",
     "imageUrl": "https://cf.shopee.com.br/file/br-11134207-7r98o-ln0j14xgzke33a",
     "note": "872 vendidos · vendido por Melhor para Você",
     "rating": "4,9",
     "reviews": "",
     "tag": "-28%",
     "price": "R$ 278,92 no Pix",
     "oldPrice": "",
     "store": "shopee",
     "url": "https://s.shopee.com.br/AAIeahwDEk"
    },
    {
     "badge": "",
     "name": "Ventilador de teto 42\" com luz LED e controle",
     "imageUrl": "https://cf.shopee.com.br/file/br-11134207-820lk-ms3vx5robbpg45",
     "note": "746 vendidos · vendido por Magazine Cience Utensílios",
     "rating": "4,9",
     "reviews": "",
     "tag": "-60%",
     "price": "R$ 201,59 no Pix",
     "oldPrice": "",
     "store": "shopee",
     "url": "https://s.shopee.com.br/5AtydWFFOH"
    },
    {
     "badge": "",
     "name": "Climatizador Sumay 17 litros",
     "imageUrl": "https://cf.shopee.com.br/file/br-11134207-820ld-mr7h84xyy13a46",
     "note": "777 vendidos · vendido por DUX ELETRO LTDA",
     "rating": "4,8",
     "reviews": "",
     "tag": "-45%",
     "price": "R$ 332,50 no Pix",
     "oldPrice": "",
     "store": "shopee",
     "url": "https://s.shopee.com.br/50aYRDKHVo"
    },
    {
     "badge": "",
     "name": "Climatizador Itatiaia 20 litros 4 em 1",
     "imageUrl": "https://cf.shopee.com.br/file/br-11134207-820m6-mmupf4xrqjgkae",
     "note": "779 vendidos · vendido por Maxi Ferramentas",
     "rating": "4,9",
     "reviews": "",
     "tag": "-28%",
     "price": "R$ 469,11 no Pix",
     "oldPrice": "",
     "store": "shopee",
     "url": "https://s.shopee.com.br/6AmVpMFlue"
    },
    {
     "badge": "",
     "name": "Ar-condicionado Split Elgin Eco Inverter 9.000 BTUs Wi-Fi",
     "imageUrl": "https://cf.shopee.com.br/file/sg-11134201-825b6-mu9o9olot2x177",
     "note": "8 vendidos · vendido por Webcontinental",
     "rating": "4,9",
     "reviews": "",
     "tag": "-29%",
     "price": "R$ 1.737,54 no Pix",
     "oldPrice": "",
     "store": "shopee",
     "url": "https://s.shopee.com.br/1W0gGmc0Nu"
    }
   ]
  },
  {
   "h3": "Casa e cozinha",
   "gridTitle": "Casa e cozinha",
   "items": [
    {
     "badge": "",
     "name": "Micro-ondas Electrolux 36 litros",
     "imageUrl": "https://cf.shopee.com.br/file/br-11134207-820lv-mopcl0cxei2rfc",
     "note": "498 vendidos · vendido por BUMPER MAGAZINE",
     "rating": "5,0",
     "reviews": "",
     "tag": "-39%",
     "price": "R$ 550,16",
     "oldPrice": "",
     "store": "shopee",
     "url": "https://s.shopee.com.br/5AtydWO7Dd"
    },
    {
     "badge": "",
     "name": "Fogão Suggar Neo Glass 5 bocas",
     "imageUrl": "https://cf.shopee.com.br/file/sg-11134201-7rfhp-m35cf2epvks01c",
     "note": "442 vendidos · vendido por Engage Eletro ",
     "rating": "4,9",
     "reviews": "",
     "tag": "-39%",
     "price": "R$ 910,92",
     "oldPrice": "",
     "store": "shopee",
     "url": "https://s.shopee.com.br/5LDOppRseh"
    },
    {
     "badge": "Mais vendido",
     "name": "Cooktop Itatiaia Essencial 4 bocas",
     "imageUrl": "https://cf.shopee.com.br/file/br-11134207-7r98o-m9aj2vdjwqwpd6",
     "note": "3 mil+ vendidos · vendido por BESTBYBRASILGOLD",
     "rating": "4,9",
     "reviews": "",
     "tag": "-26%",
     "price": "R$ 296,57 no Pix",
     "oldPrice": "",
     "store": "shopee",
     "url": "https://s.shopee.com.br/906hCZDRQ2"
    },
    {
     "badge": "",
     "name": "Jogo de panelas antiaderente (8 a 11 peças)",
     "imageUrl": "https://cf.shopee.com.br/file/br-11134207-820m3-mujvrmjno8hu6b",
     "note": "2 mil+ vendidos · vendido por AB Midia",
     "rating": "4,8",
     "reviews": "",
     "tag": "-38%",
     "price": "R$ 143,45 no Pix",
     "oldPrice": "",
     "store": "shopee",
     "url": "https://s.shopee.com.br/3LSKS9ZUlA"
    },
    {
     "badge": "",
     "name": "Robô aspirador inteligente",
     "imageUrl": "https://cf.shopee.com.br/file/sg-11134201-7rdwh-lxr9gcah5u3jd7",
     "note": "1 mil+ vendidos · vendido por IDALI LIFE",
     "rating": "4,9",
     "reviews": "",
     "tag": "-61%",
     "price": "R$ 390,99 no Pix",
     "oldPrice": "",
     "store": "shopee",
     "url": "https://s.shopee.com.br/3g5Aqlccob"
    },
    {
     "badge": "",
     "name": "Panificadora Gallant 19 programas",
     "imageUrl": "https://cf.shopee.com.br/file/br-11134207-820lp-mpnrixpxvv29ae",
     "note": "1 mil+ vendidos · vendido por Webcontinental ES",
     "rating": "5,0",
     "reviews": "",
     "tag": "-22%",
     "price": "R$ 426,55",
     "oldPrice": "",
     "store": "shopee",
     "url": "https://s.shopee.com.br/1gK6T5kEsu"
    }
   ]
  },
  {
   "h3": "Ferramentas e carro",
   "gridTitle": "Ferramentas e carro",
   "items": [
    {
     "badge": "Mais vendido",
     "name": "Parafusadeira de impacto 48V com 2 baterias",
     "imageUrl": "https://cf.shopee.com.br/file/sg-11134201-823oc-moipjw1uysr064",
     "note": "4 mil+ vendidos · vendido por Link&LinkShop_Brasil",
     "rating": "4,9",
     "reviews": "",
     "tag": "-64%",
     "price": "R$ 89,77 no Pix",
     "oldPrice": "",
     "store": "shopee",
     "url": "https://s.shopee.com.br/W894wt529"
    },
    {
     "badge": "Mais vendido",
     "name": "Lavadora de alta pressão Vonder LAV 1600",
     "imageUrl": "https://cf.shopee.com.br/file/br-11134207-820lq-mmw5qst3zjeqe2",
     "note": "4 mil+ vendidos · vendido por  Domus",
     "rating": "4,9",
     "reviews": "",
     "tag": "-32%",
     "price": "R$ 292,51 no Pix",
     "oldPrice": "",
     "store": "shopee",
     "url": "https://s.shopee.com.br/5LDOppaXjF"
    },
    {
     "badge": "Mais vendido",
     "name": "Mini compressor de ar portátil recarregável",
     "imageUrl": "https://cf.shopee.com.br/file/sg-11134201-81zvz-mig6w6yij1fmb5",
     "note": "14 mil+ vendidos · vendido por Link&LinkShop_Brasil",
     "rating": "4,9",
     "reviews": "",
     "tag": "-60%",
     "price": "R$ 55,99",
     "oldPrice": "",
     "store": "shopee",
     "url": "https://s.shopee.com.br/2gCdevkLpV"
    },
    {
     "badge": "",
     "name": "Auxiliar de partida 4 em 1 com compressor",
     "imageUrl": "https://cf.shopee.com.br/file/br-11134207-820l7-mublhsi9glxdc4",
     "note": "300 vendidos · vendido por eduardopatrick001eduardo",
     "rating": "4,9",
     "reviews": "",
     "tag": "-40%",
     "price": "R$ 142,41 no Pix",
     "oldPrice": "",
     "store": "shopee",
     "url": "https://s.shopee.com.br/4LKrdzit2q"
    },
    {
     "badge": "",
     "name": "Parafusadeira Vonder PFV238 20V",
     "imageUrl": "https://cf.shopee.com.br/file/br-11134207-820lf-mmw3v7vph79c3a",
     "note": "325 vendidos · vendido por  Domus",
     "rating": "4,9",
     "reviews": "",
     "tag": "-44%",
     "price": "R$ 179,46 no Pix",
     "oldPrice": "",
     "store": "shopee",
     "url": "https://s.shopee.com.br/qkzTYvjLx"
    },
    {
     "badge": "",
     "name": "Escada de alumínio articulada 16 degraus",
     "imageUrl": "https://cf.shopee.com.br/file/sg-11134201-81zug-mn4gxy53j20y91",
     "note": "979 vendidos · vendido por Eletricario Loja Oficial",
     "rating": "4,9",
     "reviews": "",
     "tag": "-43%",
     "price": "R$ 465,50 no Pix",
     "oldPrice": "",
     "store": "shopee",
     "url": "https://s.shopee.com.br/3VlkeSqOF9"
    }
   ]
  },
  {
   "h3": "Moda, beleza e viagem",
   "gridTitle": "Moda, beleza e viagem",
   "items": [
    {
     "badge": "Mais vendido",
     "name": "Mochila de viagem Romantic Crown antifurto",
     "imageUrl": "https://cf.shopee.com.br/file/br-11134207-820lv-mt38wyvxh81x6a",
     "note": "4 mil+ vendidos · vendido por Romantic Crown 02",
     "rating": "5,0",
     "reviews": "",
     "tag": "-68%",
     "price": "R$ 94,91 no Pix",
     "oldPrice": "",
     "store": "shopee",
     "url": "https://s.shopee.com.br/9fMNznSujl"
    },
    {
     "badge": "Mais vendido",
     "name": "Mala de bordo 360° expansível",
     "imageUrl": "https://cf.shopee.com.br/file/br-11134207-7r98o-mabjs504o5fda2",
     "note": "3 mil+ vendidos · vendido por back pack",
     "rating": "4,9",
     "reviews": "",
     "tag": "-35%",
     "price": "R$ 123,50 no Pix",
     "oldPrice": "",
     "store": "shopee",
     "url": "https://s.shopee.com.br/8VAQbebks5"
    },
    {
     "badge": "Mais vendido",
     "name": "Perfume árabe feminino Sabah 100 ml",
     "imageUrl": "https://cf.shopee.com.br/file/br-11134207-7r98o-ma5yywimmow1b5",
     "note": "3 mil+ vendidos · vendido por A.star",
     "rating": "4,8",
     "reviews": "",
     "tag": "-38%",
     "price": "R$ 147,25 no Pix",
     "oldPrice": "",
     "store": "shopee",
     "url": "https://s.shopee.com.br/8pnH0Ga4dL"
    },
    {
     "badge": "",
     "name": "Camisa polo masculina tecido gelado",
     "imageUrl": "https://cf.shopee.com.br/file/br-11134207-7r98o-m2wq8a1muswl2c",
     "note": "1 mil+ vendidos · vendido por Lojao do N",
     "rating": "4,8",
     "reviews": "",
     "tag": "-46%",
     "price": "R$ 43,00",
     "oldPrice": "",
     "store": "shopee",
     "url": "https://s.shopee.com.br/W894x6D7J"
    },
    {
     "badge": "Mais vendido",
     "name": "Calça jeans feminina wide leg",
     "imageUrl": "https://cf.shopee.com.br/file/br-11134207-7r98o-m7tz7imdb29uf2",
     "note": "7 mil+ vendidos · vendido por ElisJeans",
     "rating": "4,8",
     "reviews": "",
     "tag": "-62%",
     "price": "R$ 56,99",
     "oldPrice": "",
     "store": "shopee",
     "url": "https://s.shopee.com.br/4B1RRQL36T"
    },
    {
     "badge": "",
     "name": "Revlon Uniq One leave-in 150 ml",
     "imageUrl": "https://cf.shopee.com.br/file/br-11134207-7r98o-lwhaoyb9mqphfa",
     "note": "636 vendidos · vendido por Click Hair",
     "rating": "4,9",
     "reviews": "",
     "tag": "-36%",
     "price": "R$ 69,99",
     "oldPrice": "",
     "store": "shopee",
     "url": "https://s.shopee.com.br/6q2CcODgH6"
    }
   ]
  },
  {
   "h3": "Bebê, pet e mercado",
   "gridTitle": "Bebê, pet e mercado",
   "items": [
    {
     "badge": "",
     "name": "Fralda Pampers Confort Sec Jumbo G (128 un.)",
     "imageUrl": "https://cf.shopee.com.br/file/sg-11134201-7rblv-lmyra1bqmje1f0",
     "note": "2 mil+ vendidos · vendido por  Pampers By Sage's",
     "rating": "5,0",
     "reviews": "",
     "tag": "-35%",
     "price": "R$ 142,41 no Pix",
     "oldPrice": "",
     "store": "shopee",
     "url": "https://s.shopee.com.br/LoisNI73X"
    },
    {
     "badge": "",
     "name": "Fralda Pampers Confort Sec Jumbo XG (116 un.)",
     "imageUrl": "https://cf.shopee.com.br/file/sg-11134201-7rbl5-lmys8lvldix126",
     "note": "2 mil+ vendidos · vendido por  Pampers By Sage's",
     "rating": "5,0",
     "reviews": "",
     "tag": "-35%",
     "price": "R$ 142,41 no Pix",
     "oldPrice": "",
     "store": "shopee",
     "url": "https://s.shopee.com.br/7fbJbrL3sT"
    },
    {
     "badge": "",
     "name": "Carrinho de bebê 3 em 1",
     "imageUrl": "https://cf.shopee.com.br/file/br-11134207-820mh-ms9bbecuktfpf0",
     "note": "504 vendidos · vendido por Brincar Dourado",
     "rating": "4,9",
     "reviews": "",
     "tag": "-60%",
     "price": "R$ 604,44 no Pix",
     "oldPrice": "",
     "store": "shopee",
     "url": "https://s.shopee.com.br/906hCZiihN"
    },
    {
     "badge": "",
     "name": "Cadeira de descanso para bebê musical",
     "imageUrl": "https://cf.shopee.com.br/file/br-11134207-820m8-mv7g1arr17nlf9",
     "note": "599 vendidos · vendido por Planeta_Max",
     "rating": "5,0",
     "reviews": "",
     "tag": "-59%",
     "price": "R$ 147,16",
     "oldPrice": "",
     "store": "shopee",
     "url": "https://s.shopee.com.br/7KyTDDRT8c"
    },
    {
     "badge": "Mais vendido",
     "name": "Ração Golden Special gato castrado 10 kg",
     "imageUrl": "https://cf.shopee.com.br/file/br-11134207-81z1k-meegwqy2fy0y76",
     "note": "3 mil+ vendidos · vendido por Pegada Store  Oficial",
     "rating": "4,9",
     "reviews": "",
     "tag": "-34%",
     "price": "R$ 98,71",
     "oldPrice": "",
     "store": "shopee",
     "url": "https://s.shopee.com.br/8fTqnfQNdO"
    },
    {
     "badge": "",
     "name": "Kit 4 cafés aromatizados",
     "imageUrl": "https://cf.shopee.com.br/file/br-11134207-820lz-msw5940yzax327",
     "note": "798 vendidos · vendido por Café Italle",
     "rating": "4,9",
     "reviews": "",
     "tag": "-33%",
     "price": "R$ 80,66",
     "oldPrice": "",
     "store": "shopee",
     "url": "https://s.shopee.com.br/4VeHq0gizh"
    }
   ]
  }
 ]
};
const FAN_URL = "https://s.shopee.com.br/4VeHqICyQ2";
const CHECKED = "11/11/2026, às 15h";
const NOTE = "Transparência: esta página tem links de afiliado. Como afiliado da Shopee, o Papo de Bola recebe comissão por compras qualificadas, sem custo a mais para você. Cupons e preços mudam sem aviso; confira as condições na loja antes de pagar.";

const T = (text, format = 0) => ({ type: "text", text, format, detail: 0, mode: "normal", style: "", version: 1 });
const P = (text) => ({ type: "paragraph", children: [T(text)], direction: "ltr", format: "", indent: 0, version: 1, textFormat: 0 });
const H = (tag, text) => ({ type: "heading", tag, children: [T(text)], direction: "ltr", format: "", indent: 0, version: 1 });
const BLOCK = (blockType, fields) => ({ type: "block", version: 2, format: "", fields: { blockType, ...fields } });

const COUPON = BLOCK("coupon", {
  store: "shopee", storeName: "", headline: "Cupons liberados", value: "Até R$ 100 OFF",
  title: "Cupons Shopee do 11.11",
  code: "",
  details: `Sem código: toque em "Resgatar" na página da Shopee e o cupom fica salvo na sua conta para usar no fechamento do pedido. Os cupons de R$ 10 a R$ 50 OFF para todas as lojas esgotaram nas primeiras levas; a Shopee solta novas levas às 16h, 18h, 20h e 22h. Também há 2 fretes grátis sem valor mínimo. Conferidos em ${CHECKED}.`,
  validUntil: "Hoje, 11/11/2026, até 23h59 (ou enquanto durarem)",
  url: DATA.campaign,
  buttonLabel: "Resgatar cupons na Shopee",
  offers: [
    { label: "Todas as lojas", value: "R$ 100", note: "Compras acima de R$ 729", code: "", url: DATA.campaign },
    { label: "Estoque na Shopee (Full)", value: "30%", note: "Limite de R$ 25", code: "", url: DATA.campaign },
    { label: "Ventilador Mondial 30 cm", value: "R$ 20", note: "Só esse produto, acima de R$ 60", code: "", url: FAN_URL },
  ],
});

const products = [
  H("h2", "Ofertas do 11.11 na Shopee"),
  P(`Separamos 48 produtos da página do 11.11 da Shopee, com desconto e boa nota de quem já comprou. Os preços abaixo são os da campanha em ${CHECKED}; alguns valem só no Pix. Junte com os cupons acima para pagar menos.`),
  ...DATA.groups.flatMap((g) => [
    H("h3", g.h3),
    BLOCK("productGrid", { title: g.gridTitle, columns: "3", priceDate: CHECKED, items: g.items }),
  ]),
];

const { getPayload } = await import("payload");
const config = (await import("@payload-config")).default;
const payload = await getPayload({ config });
try {
  const page = (await payload.find({ collection: "pages", where: { slug: { equals: "cupom-shopee" } }, limit: 1, depth: 0, draft: true })).docs[0];
  if (!page) throw new Error("página cupom-shopee não encontrada");
  const layout = JSON.parse(JSON.stringify(page.layout || []));
  const rt = layout.find((b) => b.blockType === "richText");
  const kids = rt.content.root.children;
  const isShopeeCoupon = (n) => n?.type === "block" && n.fields?.blockType === "coupon" && n.fields?.store === "shopee";
  const isProducts = (n) => (n?.type === "block" && n.fields?.blockType === "productGrid") || (n?.type === "heading" && ["Ofertas do 11.11 na Shopee", ...DATA.groups.map((g) => g.h3)].includes(n.children?.[0]?.text));
  const first = kids.findIndex(isShopeeCoupon);
  if (first < 0) throw new Error("nenhum cupom Shopee para substituir");
  const rest = kids.filter((n) => !isShopeeCoupon(n) && !isProducts(n));
  // remove o parágrafo da vitrine de uma rodada anterior (idempotente)
  const rest2 = rest.filter((n) => !(n.type === "paragraph" && (n.children?.[0]?.text || "").startsWith("Separamos 48 produtos")));
  rest2.splice(first, 0, COUPON, ...products);
  rt.content.root.children = rest2;
  const isNote = (b) => b.blockType === "note" && String(b.text || "").startsWith("Transparência:");
  const finalLayout = [...layout.filter((b) => !isNote(b)), { blockType: "note", text: NOTE }];
  const { id, createdAt, updatedAt, _status, ...data } = page;
  await payload.update({ collection: "pages", id, draft: true, depth: 0,
    data: { ...data, layout: finalLayout, layoutStyle: { ...(page.layoutStyle || {}), width: "wide" }, _status: "draft" } });
  log(`PAGE ${id} ok (rascunho): 1 card de cupons + ${DATA.groups.length} vitrines (${DATA.groups.reduce((n, g) => n + g.items.length, 0)} produtos); ordem=${finalLayout.map((b) => b.blockType).join(",")}`);
} catch (e) { log(`ERRO: ${e?.stack || e}`); }
process.exit(0);
