// Post "Cupom Shopee hoje 11/11" (11/11/2026) — categoria Cupons (silada, fora da home).
// Mesmo padrão do post da Amazon (create-post-cupom-amazon-11-11.mjs): card de cupons no topo e
// os produtos em vitrines por categoria. Os produtos saíram da página /cupons/shopee, que fica só
// com os cupons (scripts/cupons-shopee-so-cupons.mjs).
// Dados: página da campanha shopee.com.br/m/11-11 lida em 11/11 ~15h; links da API de afiliados
// (generateShortLink, subId "cuponsshopee"). Cria/atualiza como RASCUNHO; publicar com
// publish-post-cupom-shopee-11-11.mjs. Se já estiver publicado, mantém publicado.
//   bash ~/run-seed-cupons.sh create-post-cupom-shopee-11-11.mjs
import fs from "fs";

const LOG = "/app/out.txt"; fs.writeFileSync(LOG, "");
const log = (m) => fs.appendFileSync(LOG, `${m}\n`);

const SLUG = "cupom-shopee-hoje-11-11";
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

// ── helpers Lexical ──
const T = (text, format = 0) => ({ type: "text", text, format, detail: 0, mode: "normal", style: "", version: 1 });
const B = (text) => T(text, 1);
const P = (...children) => ({ type: "paragraph", children: children.map((c) => (typeof c === "string" ? T(c) : c)), direction: "ltr", format: "", indent: 0, version: 1, textFormat: 0 });
const H = (tag, text) => ({ type: "heading", tag, children: [T(text)], direction: "ltr", format: "", indent: 0, version: 1 });
const LIST = (kind, items) => ({
  type: "list", listType: kind === "ol" ? "number" : "bullet", tag: kind, start: 1, direction: "ltr", format: "", indent: 0, version: 1,
  children: items.map((it, i) => ({ type: "listitem", value: i + 1, checked: undefined, direction: "ltr", format: "", indent: 0, version: 1,
    children: (Array.isArray(it) ? it : [it]).map((c) => (typeof c === "string" ? T(c) : c)) })),
});
const RT = (...nodes) => ({ root: { type: "root", children: nodes, direction: "ltr", format: "", indent: 0, version: 1 } });
const BLOCK = (blockType, fields) => ({ type: "block", version: 2, format: "", fields: { blockType, ...fields } });
const FAQ = (items) => BLOCK("faq", { title: "Perguntas frequentes", firstOpen: true, items: items.map(([question, answer]) => ({ question, answer: RT(P(answer)) })) });

const group = (h3) => {
  const g = DATA.groups.find((x) => x.h3 === h3);
  if (!g) throw new Error(`grupo não encontrado: ${h3}`);
  return BLOCK("productGrid", { title: g.gridTitle, columns: "3", priceDate: CHECKED, items: g.items });
};

const CUPONS = BLOCK("coupon", {
  store: "shopee", storeName: "", headline: "Cupons liberados", value: "Até R$ 100 OFF",
  title: "Cupons Shopee de hoje: os destaques do 11.11",
  code: "",
  details: `Sem código: toque em "Resgatar" na página da Shopee e o cupom fica salvo na sua conta para usar no fechamento do pedido. A Shopee solta novas levas de cupom ao longo do dia (16h, 18h, 20h e 22h). Também há 2 fretes grátis sem valor mínimo. Conferidos em ${CHECKED}.`,
  validUntil: "Hoje, 11/11/2026, até 23h59 (ou enquanto durarem)",
  url: DATA.campaign,
  buttonLabel: "Resgatar cupons na Shopee",
  offers: [
    { label: "Todas as lojas", value: "R$ 100", note: "Compras acima de R$ 729", code: "", url: DATA.campaign },
    { label: "Estoque na Shopee (Full)", value: "30%", note: "Limite de R$ 25", code: "", url: DATA.campaign },
    { label: "Ventilador Mondial 30 cm", value: "R$ 20", note: "Só esse produto, acima de R$ 60", code: "", url: FAN_URL },
  ],
});

const content = RT(
  P("O 11.11 é a maior data de ofertas da Shopee no ano. Separamos ", B("48 produtos"), " da página da campanha de hoje, ", B("11 de novembro de 2026"), ", com desconto de verdade e boa nota de quem já comprou: games, celulares, ventiladores, casa, ferramentas, moda e itens de bebê e pet."),
  P(`Os preços dos cards são os da campanha em ${CHECKED}; vários valem só no Pix. Na Shopee o preço e o estoque mudam ao longo do dia, então toque em `, B("Ver na Shopee"), " para conferir o valor atualizado. Antes de comprar, resgate os cupons abaixo: eles somam com o desconto do produto."),
  CUPONS,
  H("h2", "Games, monitor e projetor"),
  P("Controle DualSense, Switch Lite e dois monitores gamer com desconto de até 45%. O projetor HY300 por R$ 150 no Pix é o mais barato da lista para quem quer ver futebol em tela grande."),
  group("Games e tecnologia"),
  H("h2", "Celulares, smartwatch e fones"),
  P("Samsung Galaxy A07 e A17, Poco X8 e o tablet Galaxy Tab A11+. Os maiores descontos são do relógio e do fone da Huawei, acima de 55%."),
  group("Celulares, smartwatch e fones"),
  H("h2", "Esporte e academia em casa"),
  P("Bike de spinning e ergométrica com até 80% de desconto, whey, creatina e capacete de ciclismo."),
  group("Esporte e academia em casa"),
  H("h2", "Ventilador, climatizador e ar-condicionado"),
  P("Com o calor chegando, o ventilador Mondial de 30 cm é um dos mais vendidos da campanha e ainda tem cupom de R$ 20 só para ele (está no card de cupons acima)."),
  group("Ventiladores, climatizadores e ar-condicionado"),
  H("h2", "Casa e cozinha"),
  P("Micro-ondas, fogão de 5 bocas, cooktop, panelas, robô aspirador e panificadora."),
  group("Casa e cozinha"),
  H("h2", "Ferramentas e carro"),
  P("Parafusadeira, lavadora de alta pressão Vonder e compressor portátil para calibrar o pneu, todos entre os mais vendidos."),
  group("Ferramentas e carro"),
  H("h2", "Moda, beleza e viagem"),
  P("Mochila antifurto, mala de bordo, perfume árabe, polo, calça wide leg e leave-in Revlon."),
  group("Moda, beleza e viagem"),
  H("h2", "Bebê, pet e mercado"),
  P("Fralda Pampers em pacote jumbo, carrinho de bebê, ração para gato castrado e café."),
  group("Bebê, pet e mercado"),
  H("h2", "Como usar cupom na Shopee hoje"),
  LIST("ol", [
    "Entre na sua conta da Shopee, de preferência pelo app.",
    [T("Toque em "), B("Resgatar cupons na Shopee"), T(" e salve os cupons que aparecerem. Eles ficam em Eu > Meus cupons.")],
    "Abra o produto pelo botão do card e coloque no carrinho.",
    "No fechamento do pedido, escolha o cupom e confira se o desconto entrou antes de pagar. Alguns preços só valem no Pix.",
  ]),
  P("Mais cupons da Shopee, da Amazon e do Mercado Livre na nossa página de cupons, atualizada nas datas de promoção:"),
  BLOCK("ctaButton", { label: "Ver todos os cupons da Shopee", url: "/cupons/shopee", style: "primary" }),
  FAQ([
    ["Qual o cupom Shopee de hoje, 11/11?", "O maior é o de R$ 100 OFF para todas as lojas em compras acima de R$ 729. Também há 30% OFF (limite de R$ 25) em produtos com estoque na Shopee e 2 fretes grátis sem valor mínimo. Os cupons acabam por leva; a Shopee solta novas às 16h, 18h, 20h e 22h."],
    ["Até que horas vale o 11.11 da Shopee?", "As ofertas e cupons do 11.11 valem até 23h59 de 11 de novembro, ou enquanto durar o estoque. Depois começam as ofertas de Black Friday."],
    ["Cupom da Shopee junta com o desconto do produto?", "Sim. O cupom é aplicado no fechamento do pedido, em cima do preço promocional. Dá para usar um cupom de desconto e um de frete grátis no mesmo pedido."],
    ["O preço no Pix é diferente?", "Em vários produtos sim: a Shopee dá um desconto extra para pagamento no Pix. Nos cards indicamos quando o preço é no Pix."],
  ]),
);

const { getPayload } = await import("payload");
const config = (await import("@payload-config")).default;
const payload = await getPayload({ config });
try {
  // capa: arte do banner 11.11 Shopee (computador)
  const ALT = "Cupom Shopee hoje 11.11 - ofertas do Papo de Bola";
  let coverId;
  const prevMedia = await payload.find({ collection: "media", where: { alt: { equals: ALT } }, limit: 1 });
  if (prevMedia.docs[0]) coverId = prevMedia.docs[0].id;
  else coverId = (await payload.create({ collection: "media", filePath: "/app/banners/11-11-shopee-computador.png", data: { alt: ALT } })).id;
  log(`cover=${coverId}`);

  const authors = await payload.find({ collection: "authors", limit: 1, where: { slug: { equals: "redacao" } } }).catch(() => ({ docs: [] }));
  const data = {
    title: "Cupom Shopee hoje 11/11: 48 ofertas do 11.11 com games, celular, ventilador e mais",
    slug: SLUG,
    category: "Cupons",
    tags: ["Cupom Shopee", "11.11", "Cupons de hoje", "Shopee", "Black Friday"].map((tag) => ({ tag })),
    cover: coverId,
    excerpt: "Cupons de hoje 11.11 na Shopee (até R$ 100 OFF) e 48 ofertas selecionadas: DualSense, Switch Lite, Galaxy A17, ventiladores, casa, ferramentas, moda e bebê.",
    content,
    author: "Redação",
    ...(authors.docs[0] ? { authorProfile: authors.docs[0].id } : {}),
    publishedDate: new Date().toISOString(),
    seo: {
      metaTitle: "Cupom Shopee hoje 11/11: cupons e ofertas do 11.11 | Papo de Bola",
      metaDescription: "Cupom Shopee de hoje (11/11): até R$ 100 OFF, frete grátis e 48 ofertas do 11.11 com games, celulares, ventilador, casa, ferramentas e moda.",
    },
    _status: "draft",
  };

  const existing = await payload.find({ collection: "posts", where: { slug: { equals: SLUG } }, limit: 1, draft: true });
  const KEEP_PUBLISHED = existing.docs[0]?._status === "published";
  if (KEEP_PUBLISHED) data._status = "published";
  if (existing.docs[0]) {
    await payload.update({ collection: "posts", id: existing.docs[0].id, data, draft: !KEEP_PUBLISHED });
    log(`POST ${existing.docs[0].id} atualizado (${KEEP_PUBLISHED ? "publicado" : "rascunho"})`);
  } else {
    const doc = await payload.create({ collection: "posts", data, draft: true });
    log(`POST ${doc.id} criado (rascunho)`);
  }
} catch (e) { log(`ERRO: ${e?.stack || e}`); }
process.exit(0);
