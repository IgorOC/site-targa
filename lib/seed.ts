import type { Db, Vehicle } from "./types"

type Row = {
  slug: string
  brand: string
  model: string
  version: string
  yearMake: number
  yearModel: number
  km: number
  price: number
  fuel: string
  transmission: string
  engine: string
  doors: number
  bodyType: Vehicle["bodyType"]
  enteredAt: string
  featuredOrder?: number
  photos?: string[]
}

function car(row: Row): Vehicle {
  const years = `${row.yearMake}/${row.yearModel}`
  const km = row.km.toLocaleString("pt-BR")
  const description = `${row.brand} ${row.model} ${years}, versão ${row.version}. ${km} km. Seminovo à venda na Targa Motors, no bairro Cidade Jardim, em Uberlândia-MG.`
  return {
    id: row.slug,
    slug: row.slug,
    brand: row.brand,
    model: row.model,
    version: row.version,
    yearMake: row.yearMake,
    yearModel: row.yearModel,
    km: row.km,
    price: row.price,
    promoPrice: null,
    color: "",
    fuel: row.fuel,
    transmission: row.transmission,
    doors: row.doors,
    engine: row.engine,
    power: "",
    plateEnd: "",
    singleOwner: null,
    ipvaPaid: null,
    inspection: null,
    acceptsTrade: null,
    options: [],
    description,
    photos: row.photos ?? [],
    coverIndex: 0,
    videoUrl: "",
    spinFrames: [],
    status: "disponivel",
    featured: Boolean(row.featuredOrder),
    featuredOrder: row.featuredOrder ?? 0,
    enteredAt: row.enteredAt,
    cost: null,
    plate: null,
    soldViaSite: false,
    soldAt: null,
    seoTitle: `${row.brand} ${row.model} ${years} seminovo em Uberlândia`,
    seoDescription: description,
    bodyType: row.bodyType,
  }
}

const FOTOS = "https://www.autocerto.com/fotos/3705"
const fotos = (id: string, files: string[]) => files.map((file) => `${FOTOS}/${id}/${file}.jpg`)

const privacy = `A Targa Motors, na Rua das Papoulas, nº 60, Cidade Jardim, Uberlândia-MG, CEP 38412-204, é a responsável pelos dados coletados neste site.

Coletamos apenas o que você envia nos formulários: nome, telefone, e-mail, mensagem e, na ficha de financiamento, CPF e renda. Na avaliação do seu veículo, também recebemos dados do carro e as fotos que você anexar. O clique no WhatsApp gera um código de referência do anúncio (por exemplo Ref TM-0000) para a loja saber qual carro originou a conversa.

Usamos esses dados para responder o contato, avaliar um veículo, tratar uma ficha de financiamento e medir, de forma agregada, o que o site vende. Não vendemos dados. CPF e renda ficam restritos ao dono e ao gerente no painel, e a retenção prevista é de até 6 meses após o encerramento da ficha, salvo obrigação legal. Os demais contatos ficam por até 24 meses.

A medição de visitas só acontece se você aceitar os cookies de desempenho. Nesse caso guardamos um identificador anônimo de sessão no próprio navegador, a página aberta, o tipo de aparelho e a origem da visita. Não usamos isso para identificar quem você é. Acessos da equipe logada no painel e de robôs conhecidos ficam de fora dos relatórios.

Você pode pedir acesso, correção ou exclusão dos seus dados pelos telefones (34) 3231-9191 e (34) 98409-4444, no horário de atendimento da loja.

Última atualização: 28/10/2026.`

export const seed: Db = {
  vehicles: [
    car({ slug: "renault-kwid-zen-2021", brand: "Renault", model: "Kwid", version: "1.0 12V SCE Flex Zen Manual", yearMake: 2021, yearModel: 2022, km: 67000, price: 41990, fuel: "Flex", transmission: "Manual", engine: "1.0", doors: 4, bodyType: "hatch", enteredAt: "2026-06-15", photos: fotos("1817498", ["2_115421", "3_115421", "4_115421", "5_115421", "1_115421", "6_115421", "7_115421", "8_115421", "9_115421", "10_115421"]) }),
    car({ slug: "jeep-renegade-sport-2019", brand: "Jeep", model: "Renegade", version: "1.8 16V Flex Sport 4P Automático", yearMake: 2019, yearModel: 2020, km: 77100, price: 74596, fuel: "Flex", transmission: "Automático", engine: "1.8", doors: 4, bodyType: "suv", enteredAt: "2026-05-20", photos: fotos("5039335", ["2_030704", "3_030704", "4_030704", "5_030704", "6_030704", "1_030703", "7_030704", "8_030704", "9_030704", "1_030704"]) }),
    car({ slug: "jeep-renegade-longitude-2021", brand: "Jeep", model: "Renegade", version: "1.8 16V Flex Longitude 4P Automático", yearMake: 2021, yearModel: 2021, km: 57000, price: 80649, fuel: "Flex", transmission: "Automático", engine: "1.8", doors: 4, bodyType: "suv", enteredAt: "2026-07-22", photos: fotos("5549374", ["1_113400", "2_113400", "3_113400", "4_113400", "5_113400", "6_113400", "7_113400", "8_113400", "9_113400", "10_113400"]) }),
    car({ slug: "fiat-toro-endurance-2023", brand: "Fiat", model: "Toro", version: "1.3 Turbo 270 Flex Endurance AT6", yearMake: 2023, yearModel: 2023, km: 72000, price: 98990, fuel: "Flex", transmission: "Automático", engine: "1.3", doors: 4, bodyType: "picape", enteredAt: "2026-08-08", photos: fotos("5490132", ["2_021605", "3_021605", "4_021605", "5_021605", "6_021605", "7_021605", "8_021605", "1_021605", "9_021605", "10_021605"]) }),
    car({ slug: "ford-ranger-limited-2014", brand: "Ford", model: "Ranger", version: "3.2 Limited 4x4 CD 20V Diesel 4P Automático", yearMake: 2014, yearModel: 2015, km: 137000, price: 99990, fuel: "Diesel", transmission: "Automático", engine: "3.2", doors: 4, bodyType: "picape", enteredAt: "2026-10-16", photos: fotos("5330175", ["1_040549", "2_040549", "3_040549", "4_040549", "5_040549", "6_040549", "7_040549", "8_040549", "9_040549", "10_040549"]) }),
    car({ slug: "fiat-toro-ranch-2020", brand: "Fiat", model: "Toro", version: "2.0 16V Turbo Diesel Ranch 4WD AT9", yearMake: 2020, yearModel: 2021, km: 92170, price: 105000, fuel: "Diesel", transmission: "Automático", engine: "2.0", doors: 4, bodyType: "picape", enteredAt: "2026-09-12", photos: fotos("5385968", ["3_024114", "1_024113", "4_024114", "5_024114", "6_024114", "2_024113", "7_024114", "8_024114", "3_024113", "9_024114"]) }),
    car({ slug: "honda-civic-exl-2018", brand: "Honda", model: "Civic", version: "2.0 16V FlexOne EXL 4P CVT", yearMake: 2018, yearModel: 2018, km: 105210, price: 106990, fuel: "Flex", transmission: "CVT", engine: "2.0", doors: 4, bodyType: "sedan", enteredAt: "2026-09-02", photos: fotos("5349470", ["1_101652", "2_101652", "3_101652", "4_101652", "5_101652", "6_101652", "7_101652", "8_101652", "9_101652", "10_101652"]) }),
    car({ slug: "jaguar-e-pace-2019", brand: "Jaguar", model: "E-Pace", version: "2.0 16V P250 Flex S AWD Automático", yearMake: 2019, yearModel: 2019, km: 55000, price: 125490, fuel: "Flex", transmission: "Automático", engine: "2.0", doors: 4, bodyType: "suv", enteredAt: "2026-10-10", photos: fotos("5604115", ["3_030815", "4_030815", "5_030815", "6_030815", "7_030815", "1_030815", "8_030815", "2_030815", "9_030815", "10_030815"]) }),
    car({ slug: "jeep-compass-blackhawk-2024", brand: "Jeep", model: "Compass", version: "2.0 Hurricane 4 Turbo Gasolina Blackhawk AT9", yearMake: 2024, yearModel: 2025, km: 43030, price: 152890, fuel: "Gasolina", transmission: "Automático", engine: "2.0", doors: 4, bodyType: "suv", enteredAt: "2026-10-18", featuredOrder: 4, photos: fotos("4762124", ["3_110655", "7_110655", "8_110655", "1_110655", "6_110655", "10_110655", "2_110655", "9_110655", "4_110655", "5_110655"]) }),
    car({ slug: "volkswagen-jetta-gli-2020", brand: "Volkswagen", model: "Jetta", version: "2.0 350 TSI Gasolina GLI DSG", yearMake: 2020, yearModel: 2020, km: 78300, price: 155400, fuel: "Gasolina", transmission: "DSG", engine: "2.0", doors: 4, bodyType: "sedan", enteredAt: "2026-09-20", photos: fotos("5175781", ["3_052827", "2_052827", "9_052828", "8_052828", "4_052827", "5_052827", "5_052828", "1_052827", "6_052828", "7_052828"]) }),
    car({ slug: "toyota-hilux-srv-2019", brand: "Toyota", model: "Hilux", version: "2.8 SRV 4x4 CD 16V Diesel 4P Automático", yearMake: 2019, yearModel: 2020, km: 128700, price: 176990, fuel: "Diesel", transmission: "Automático", engine: "2.8", doors: 4, bodyType: "picape", enteredAt: "2026-10-14", photos: fotos("5670634", ["1_032030", "1_032033", "1_032035", "1_032038", "1_032040", "1_032042", "1_032044", "1_032046", "1_032047", "1_032049"]) }),
    car({ slug: "land-rover-velar-p300-2018", brand: "Land Rover", model: "Range Rover Velar", version: "2.0 P300 Gasolina R-Dynamic HSE Automático", yearMake: 2018, yearModel: 2019, km: 102629, price: 249990, fuel: "Gasolina", transmission: "Automático", engine: "2.0", doors: 4, bodyType: "suv", enteredAt: "2026-08-18", photos: fotos("5636457", ["1_104419", "2_104419", "3_104419", "4_104419", "5_104419", "9_104420", "6_104419", "7_104419", "7_104420", "8_104420"]) }),
    car({ slug: "toyota-hilux-sw4-srx-2024", brand: "Toyota", model: "Hilux SW4", version: "2.8 D-4D Turbo Diesel SRX Platinum 7L 4x4 Automático", yearMake: 2024, yearModel: 2024, km: 40000, price: 294890, fuel: "Diesel", transmission: "Automático", engine: "2.8", doors: 4, bodyType: "suv", enteredAt: "2026-10-06", photos: fotos("5621757", ["3_034629", "4_034629", "5_034629", "6_034629", "1_034629", "6_034630", "7_034630", "8_034630", "2_034629", "9_034630"]) }),
    car({ slug: "land-rover-velar-phev-2022", brand: "Land Rover", model: "Range Rover Velar", version: "2.0 P404 PHEV R-Dynamic S Automático", yearMake: 2022, yearModel: 2023, km: 33000, price: 314990, fuel: "Híbrido plug-in", transmission: "Automático", engine: "2.0", doors: 4, bodyType: "suv", enteredAt: "2026-10-08", photos: fotos("5038894", ["1_100656", "1_100657", "8_100657", "2_100657", "9_100657", "3_100657", "4_100657", "5_100657", "6_100657", "7_100657"]) }),
    car({ slug: "land-rover-discovery-hse-2021", brand: "Land Rover", model: "Discovery", version: "3.0 D300 Turbo Diesel HSE Automático", yearMake: 2021, yearModel: 2022, km: 49000, price: 338790, fuel: "Diesel", transmission: "Automático", engine: "3.0", doors: 4, bodyType: "suv", enteredAt: "2026-10-12", featuredOrder: 3, photos: fotos("5372286", ["1_035021", "1_035022", "2_035022", "1_035023", "1_035024", "1_035025", "1_035026", "2_035026", "1_035027", "2_035027"]) }),
    car({ slug: "porsche-macan-2023", brand: "Porsche", model: "Macan", version: "2.0 Turbo Gasolina PDK", yearMake: 2023, yearModel: 2023, km: 9500, price: 399890, fuel: "Gasolina", transmission: "PDK", engine: "2.0", doors: 4, bodyType: "suv", enteredAt: "2026-10-04", featuredOrder: 2, photos: fotos("5490660", ["1_030634", "2_030634", "3_030634", "4_030634", "5_030634", "6_030634", "7_030634", "8_030634", "9_030634", "10_030634"]) }),
    car({ slug: "porsche-macan-gts-2020", brand: "Porsche", model: "Macan", version: "2.9 GTS 24V V6 Gasolina 4P Automático", yearMake: 2020, yearModel: 2020, km: 25000, price: 399990, fuel: "Gasolina", transmission: "Automático", engine: "2.9", doors: 4, bodyType: "suv", enteredAt: "2026-06-28", photos: fotos("5334982", ["3_013549", "4_013549", "5_013549", "1_013549", "6_013549", "7_013549", "8_013549", "9_013549", "10_013549", "2_013549"]) }),
    car({ slug: "porsche-911-carrera-s-cabriolet-2019", brand: "Porsche", model: "911", version: "3.0 24V H6 Gasolina Carrera S Cabriolet PDK", yearMake: 2019, yearModel: 2020, km: 21700, price: 799990, fuel: "Gasolina", transmission: "PDK", engine: "3.0", doors: 2, bodyType: "esportivo", enteredAt: "2026-07-10", featuredOrder: 1, photos: fotos("5588218", ["1_015719", "2_015719", "3_015719", "4_015719", "5_015719", "6_015719", "7_015719", "8_015719"]) }),
  ],
  content: {
    hero: {
      kicker: "Showroom · Cidade Jardim · Uberlândia",
      lines: ["Seminovos premium em Uberlândia", "Peça por peça", "Cada Targa é montada para você"],
      sub: "Seminovos premium, revisados e com procedência.",
      skipLabel: "Pular intro",
    },
    about: {
      title: "A loja, no centro da cidade",
      lead: "Cada Targa é montada peça por peça para você.",
      body: "A Targa Motors fica na Rua das Papoulas, 60, no bairro Cidade Jardim, em Uberlândia-MG. O estoque reúne seminovos de procedência, do compacto ao esportivo, com preço e quilometragem publicados.\n\nO atendimento é de segunda a sexta, das 9h às 18h, e aos sábados, das 9h às 16h. O carro do anúncio é o carro da loja: o que muda no pátio muda no site pelo painel.",
    },
    team: [],
    testimonials: [],
    faqs: [
      { q: "Os carros são seminovos?", a: "Sim. O estoque é de seminovos, com ano, quilometragem e preço de cada anúncio." },
      { q: "Dá para financiar pelo site?", a: "A ficha chega para a loja e a Targa retorna com as condições reais. O site não estima parcela nem taxa." },
      { q: "Vocês avaliam o meu carro?", a: "Sim. O formulário Venda seu veículo recebe os dados e as fotos. A proposta é feita pela equipe, no horário de atendimento." },
      { q: "Onde fica a loja?", a: "Rua das Papoulas, 60, Cidade Jardim, Uberlândia-MG, CEP 38412-204. Seg a sex 9h–18h e sábado 9h–16h." },
    ],
    banners: [],
    contact: {
      street: "Rua das Papoulas, 60",
      area: "Cidade Jardim - Uberlândia - MG, 38412-204",
      hoursWeek: "Seg a Sex: 9h às 18h",
      hoursSat: "Sábado: 9h às 16h",
      phone1: "(34) 3231-9191",
      phone1Tel: "553432319191",
      phone2: "(34) 98409-4444",
      phone2Tel: "5534984094444",
      whatsapp: "(34) 98409-4082",
      whatsappTel: "5534984094082",
      email: "",
      instagram: "https://www.instagram.com/targa__motors/",
      mapsUrl: "https://www.google.com/maps/search/?api=1&query=Rua+das+Papoulas+60+Cidade+Jardim+Uberlandia+MG+38412-204",
      mapsEmbed: "https://maps.google.com/maps?q=Rua%20das%20Papoulas%2C%2060%2C%20Cidade%20Jardim%2C%20Uberl%C3%A2ndia%20-%20MG%2C%2038412-204&z=16&output=embed",
    },
    privacy: { updatedAt: "2026-10-28", text: privacy },
    ranking: { coldDays: 30, hotShare: 0.25, coldShare: 0.25 },
  },
  leads: [],
  events: [],
  audit: [],
}
