window.SCMJF_PARTS_CATALOG = {
  metadata: {
    currency: "BRL",
    collectedAt: "2026-05-13",
    title: "Catálogo público de peças por fornecedores permitidos",
    note: "Somente fornecedores permitidos pela Santa Casa: datafor, vmpack, kabum, magazine luiza, hardsoft, shopshipe e matchpoint. Quando não houver preço público/estoque visível, o app marca como sem preço público encontrado.",
    allowedSuppliers: [
      { id: "datafor", label: "Datafor", url: "https://www.datafor.com.br/", searchUrl: "https://www.google.com/search?q=site%3Adatafor.com.br+{query}" },
      { id: "vmpack", label: "VMPack", url: "", searchUrl: "https://www.google.com/search?q=%22vmpack%22+{query}" },
      { id: "kabum", label: "KaBuM!", url: "https://www.kabum.com.br/", searchUrl: "https://www.kabum.com.br/busca/{query}" },
      { id: "magalu", label: "Magazine Luiza", url: "https://www.magazineluiza.com.br/", searchUrl: "https://www.magazineluiza.com.br/busca/{query}/" },
      { id: "hardsoft", label: "Hardsoft", url: "https://www.hardsoftnet.com.br/", searchUrl: "https://www.hardsoftnet.com.br/index.php?route=product/search&search={query}" },
      { id: "shopshipe", label: "Shopshipe", url: "", searchUrl: "https://www.google.com/search?q=%22shopshipe%22+{query}" },
      { id: "matchpoint", label: "Matchpoint", url: "", searchUrl: "https://www.google.com/search?q=%22matchpoint%22+{query}" }
    ],
    unavailableSuppliers: [
      "vmpack: não foi localizado catálogo público de informática/preços.",
      "shopshipe: não foi localizado catálogo público com esse nome exato.",
      "matchpoint: foram localizadas referências de empresa de TI, mas não catálogo público de peças/preços."
    ]
  },
  categories: [
    {
      id: "cpu",
      label: "Processador",
      required: true,
      defaultItem: "cpu-i5-10400",
      search: "processador desktop Intel Core i5 Ryzen 5",
      items: [
        {
          id: "cpu-i5-10400",
          name: "Intel Core i5-10400, LGA1200, vídeo integrado",
          notes: "Opção com vídeo integrado e disponibilidade pública em Datafor e KaBuM.",
          offers: [
            offer("datafor", "Processador Intel Core i5-10400", 1369, "Imediata", "https://www.datafor.com.br/informatica/componentes/processadores/processador-intel-core-i5-10400-2-9ghz-4-3ghz-max-turbo-cache-12mb-lga-1200-bx8070110400", "R$ 1.300,55 à vista"),
            offer("kabum", "Processador Intel Core i5-10400", 899.99, "Em estoque", "https://www.kabum.com.br/produto/112990", "Vendido e entregue por KaBuM!")
          ]
        },
        {
          id: "cpu-i3-10100f",
          name: "Intel Core i3-10100F, LGA1200, sem vídeo",
          notes: "Exige placa de vídeo dedicada.",
          offers: [
            offer("datafor", "Processador Intel Core i3-10100F", 689, "Imediata", "https://www.datafor.com.br/informatica/componentes/processador-intel-core-i3-10100-3-6ghz-6mb-cache-bx8070110100", "R$ 654,55 à vista")
          ]
        },
        {
          id: "cpu-ryzen-8500g",
          name: "AMD Ryzen 5 8500G, AM5, vídeo integrado",
          notes: "Plataforma AM5 com DDR5.",
          offers: [
            offer("kabum", "AMD Ryzen 5 8500G", 769.99, "Em estoque", "https://www.kabum.com.br/produto/520366/processador-amd-ryzen-5-8500g-3-5-ghz-5-0ghz-max-turbo-cache-22mb-6-nucleos-12-threads-am5-video-integrado-100-100000931box")
          ]
        }
      ]
    },
    {
      id: "motherboard",
      label: "Placa-mãe",
      required: true,
      defaultItem: "mb-h610-msi",
      search: "placa mãe H610 DDR4 AM5 DDR5",
      items: [
        {
          id: "mb-h610-msi",
          name: "MSI PRO H610M-S, LGA1700, DDR4, mATX",
          notes: "Placa H610 DDR4 para Intel 12a/13a/14a geração.",
          offers: [
            offer("kabum", "MSI PRO H610M-S DDR4", 479.99, "Em estoque", "https://www.kabum.com.br/produto/873598/placa-mae-msi-pro-h610m-s-intel-core-ddr4-matx-realtek-alc897-codec-proh610msd4")
          ]
        },
        {
          id: "mb-h610-gigabyte",
          name: "Gigabyte H610M K DDR4, LGA1700, mATX",
          notes: "Alternativa H610 DDR4 com M.2.",
          offers: [
            offer("kabum", "Gigabyte H610M K DDR4", 509.99, "Em estoque", "https://www.kabum.com.br/produto/636798/placa-mae-gigabyte-h610m-k-ddr4-intel-lga-1700-micro-atx-ddr4-hdmi-m-2-9mh610mk-00-20")
          ]
        },
        {
          id: "mb-a620-asus",
          name: "ASUS PRIME A620M-E, AM5, DDR5, mATX",
          notes: "Para Ryzen AM5 e memória DDR5.",
          offers: [
            offer("kabum", "ASUS PRIME A620M-E AM5 DDR5", 699.9, "Em estoque", "https://www.kabum.com.br/produto/521066/")
          ]
        }
      ]
    },
    {
      id: "memory",
      label: "Memória RAM",
      required: true,
      defaultItem: "ram-ddr4-16",
      search: "memória RAM desktop DDR4 16GB 3200",
      items: [
        {
          id: "ram-ddr4-16",
          name: "16 GB DDR4 3200 MHz desktop",
          notes: "Mínimo recomendado para estação nova.",
          offers: [
            offer("kabum", "Lexar 16GB DDR4 3200 MHz", 260.99, "Em estoque", "https://www.kabum.com.br/produto/472349"),
            offer("kabum", "Patriot Signature 16GB DDR4 3200 MHz", 341.99, "Em estoque", "https://www.kabum.com.br/produto/927107/memoria-ram-patriot-signature-16gb-1x16gb-3200mhz-ddr4-cl22-preta-psd416g32002"),
            offer("magalu", "Patriot 16GB DDR4 3200 MHz", 390, "Disponível", "https://www.magazineluiza.com.br/memoria-16gb-desktop-patriot-ddr4-3200mhz-udimm-psd416g32002/p/dgj4ehd45k/in/mram/", "R$ 362,70 no Pix")
          ]
        },
        {
          id: "ram-ddr4-32",
          name: "32 GB DDR4 3200 MHz, 2x16 GB",
          notes: "Para setores com multitarefa pesada.",
          offers: [
            offer("kabum", "2x Lexar 16GB DDR4 3200 MHz", 521.98, "Em estoque", "https://www.kabum.com.br/produto/472349", "Preço calculado como 2 unidades")
          ]
        },
        {
          id: "ram-ddr4-4-datafor",
          name: "4 GB DDR4 2666 MHz desktop",
          notes: "Peça de reposição; abaixo do padrão recomendado.",
          offers: [
            offer("datafor", "WinMemory 4GB DDR4 2666 MHz", 213.2, "Imediata", "https://www.datafor.com.br/informatica/componentes/memorias/memoria-ddr4-4gb-2666mhz-winmemory")
          ]
        },
        {
          id: "ram-ddr5-16",
          name: "16 GB DDR5 4800 MHz desktop",
          notes: "Usar somente com placa-mãe DDR5.",
          offers: [
            offer("kabum", "Bluecase 16GB DDR5 4800 MHz", 279.96, "Em estoque", "https://www.kabum.com.br/produto/882267/memoria-ram-ddr5-16gb-4800mhz-1-2v-single-rank-bluecase-bml5d48m12v40-16g")
          ]
        }
      ]
    },
    {
      id: "storage",
      label: "Armazenamento primário",
      required: true,
      defaultItem: "ssd-nvme-500",
      search: "SSD NVMe 500GB M.2",
      items: [
        {
          id: "ssd-nvme-500",
          name: "SSD NVMe M.2 500 GB",
          notes: "Armazenamento principal recomendado.",
          offers: [
            offer("datafor", "Kingston NV1 500GB NVMe", 459, "Disponível", "https://www.datafor.com.br/informatica/armazenamento/ssds", "R$ 436,05 à vista"),
            offer("kabum", "Kingston NV3 500GB NVMe", 599.99, "Em estoque", "https://www.kabum.com.br/produto/621161/ssd-kingston-nv3-500-gb-m-2-2280-pcie-4-0-x4-nvme-leitura-5000-mb-s-gravacao-3000-mb-s-azul-snv3s-500g")
          ]
        },
        {
          id: "ssd-sata-480",
          name: "SSD SATA 480 GB",
          notes: "Alternativa para máquinas sem slot M.2.",
          offers: [
            offer("datafor", "Kingston A400 480GB SATA", 335, "Disponível", "https://www.datafor.com.br/informatica/armazenamento/ssds", "R$ 318,25 à vista")
          ]
        },
        {
          id: "ssd-sata-240-hardsoft",
          name: "SSD SATA 240 GB",
          notes: "Peça de reposição básica.",
          offers: [
            offer("hardsoft", "Kingston UV300 240GB SATA", 296.65, "Em estoque", "https://www.hardsoftnet.com.br/ssd-sata-iii-2-5-240-gb-kingston-uv-300", "R$ 262,54 no débito/boleto/transferência")
          ]
        }
      ]
    },
    {
      id: "secondaryStorage",
      label: "Armazenamento secundário",
      required: false,
      defaultItem: "storage-none",
      search: "HD interno externo 1TB 4TB",
      items: [
        noStockItem("storage-none", "Sem armazenamento secundário", "Use quando o SSD principal for suficiente."),
        {
          id: "hd-1tb-notebook",
          name: "HD 1 TB SATA notebook",
          notes: "Opção para armazenamento local adicional.",
          offers: [
            offer("datafor", "WD Blue 1TB SATA3 notebook", 399, "Disponível", "https://www.datafor.com.br/armazenamento", "R$ 379,05 à vista")
          ]
        },
        {
          id: "hd-4tb-desktop",
          name: "HD interno 4 TB desktop",
          notes: "Uso específico para grande volume local.",
          offers: [
            offer("datafor", "Seagate Barracuda 4TB", 1279, "Disponível", "https://www.datafor.com.br/armazenamento", "R$ 1.215,05 à vista")
          ]
        }
      ]
    },
    {
      id: "psu",
      label: "Fonte",
      required: true,
      defaultItem: "psu-500-bronze",
      search: "fonte ATX 500W 80 Plus Bronze",
      items: [
        {
          id: "psu-500-bronze",
          name: "Fonte ATX 500W 80 Plus Bronze",
          notes: "Potência suficiente para estação sem GPU dedicada.",
          offers: [
            offer("kabum", "MACH1 Steady 500W Bronze", 189.99, "Em estoque", "https://www.kabum.com.br/produto/912181/"),
            offer("magalu", "Draxen DN500 500W Bronze", 299, "Disponível", "https://www.magazineluiza.com.br/fonte-atx-500w-80-plus-bronze-pfc-ativo-dn500-draxen/p/hjk14ajcd1/cj/fnta/", "R$ 284,05 no Pix")
          ]
        },
        {
          id: "psu-600-datafor",
          name: "Fonte ATX 600W",
          notes: "Opção com margem maior.",
          offers: [
            offer("datafor", "T-Dagger 600W", 289, "Imediata", "https://www.datafor.com.br/informatica/componentes/fonte-atx-600w-potencia-real-t-dagger")
          ]
        },
        {
          id: "psu-850-datafor",
          name: "Fonte 850W 80 Plus Bronze",
          notes: "Para configuração com GPU ou expansão.",
          offers: [
            offer("datafor", "C3Tech PS-G850 850W Bronze", 629, "Disponível", "https://www.datafor.com.br/fontes", "R$ 597,55 à vista")
          ]
        }
      ]
    },
    {
      id: "case",
      label: "Gabinete",
      required: true,
      defaultItem: "case-basic",
      search: "gabinete micro ATX sem fonte",
      items: [
        {
          id: "case-basic",
          name: "Gabinete Micro ATX básico",
          notes: "Gabinete econômico para estação administrativa.",
          offers: [
            offer("kabum", "Duex DX255-8 Micro ATX", 69.7, "Em estoque", "https://www.kabum.com.br/produto/503901/gabinete-duex-micro-atx-mini-atx-preto-dx255-8"),
            offer("kabum", "C3Tech MT-30BK Micro ATX", 119.99, "Em estoque", "https://www.kabum.com.br/produto/761525/gabinete-c3tech-micro-atx-mid-tower-com-fonte-200w-sem-fans-preto-mt-30bk")
          ]
        },
        {
          id: "case-datafor-g80",
          name: "Gabinete C3Tech MT-G80BK sem fonte",
          notes: "Opção Datafor sem fonte.",
          offers: [
            offer("datafor", "C3Tech MT-G80BK", 189, "Disponível", "https://www.datafor.com.br/loja/catalogo.php?categoria=19&computer_manufacturers=208&dir=asc&loja=687149&order=name&pg=1", "R$ 179,55 à vista")
          ]
        }
      ]
    },
    {
      id: "cooler",
      label: "Cooler do processador",
      required: true,
      defaultItem: "cooler-box",
      search: "cooler processador LGA1700 AM4 AM5",
      items: [
        {
          id: "cooler-box",
          name: "Cooler box incluso no processador",
          notes: "Usar somente quando o SKU comprado incluir cooler.",
          offers: [
            offer("kabum", "Cooler incluso no SKU", 0, "Validar SKU", "https://www.kabum.com.br/", "Sem custo adicional quando incluso")
          ]
        },
        {
          id: "cooler-intel",
          name: "Cooler Intel LGA1700 65W",
          notes: "Cooler de reposição para Intel LGA1700.",
          offers: [
            offer("kabum", "Cooler Intel LGA1700", 87.54, "Em estoque", "https://www.kabum.com.br/produto/294887/cooler-para-processador-lga-1700-intel-12-13-geracao-m23901-001-intel")
          ]
        },
        {
          id: "cooler-datafor",
          name: "Air cooler Intel/AMD 120mm",
          notes: "Opção universal publicada pela Datafor.",
          offers: [
            offer("datafor", "K-Mex AC02 120mm LGA1200/1700", 175, "Disponível", "https://www.datafor.com.br/gamer", "R$ 166,25 à vista")
          ]
        }
      ]
    },
    {
      id: "thermalPaste",
      label: "Pasta térmica",
      required: false,
      defaultItem: "paste-vinik",
      search: "pasta térmica processador",
      items: [
        noStockItem("paste-none", "Sem pasta térmica avulsa", "Use quando cooler/processador já possuir composto térmico."),
        {
          id: "paste-vinik",
          name: "Pasta térmica Vinik 10g",
          notes: "Item de montagem/manutenção.",
          offers: [
            offer("datafor", "Vinik TG010 10g", 15, "Disponível", "https://www.datafor.com.br/pastatermica/pasta-termica-10gr-branca-seringa-tg010-vinik", "R$ 14,25 à vista")
          ]
        },
        {
          id: "paste-pcyes",
          name: "Pasta térmica PCYes 1,5g",
          notes: "Com maior condutividade.",
          offers: [
            offer("datafor", "PCYes Nitrogen Basic 1,5g", 25, "Disponível", "https://www.datafor.com.br/pastatermica/pasta-termica-prata-5-5wmk-1-5gr-pcyes-nitrogen-basic-pcynb1555", "R$ 23,75 à vista")
          ]
        }
      ]
    },
    {
      id: "caseFan",
      label: "Fan de gabinete",
      required: false,
      defaultItem: "fan-none",
      search: "fan gabinete 120mm",
      items: [
        noStockItem("fan-none", "Sem fan extra", "Use quando o gabinete já atender a ventilação."),
        {
          id: "fan-c3tech",
          name: "Fan 120mm RGB C3Tech",
          notes: "Ventilação extra para gabinete.",
          offers: [
            offer("datafor", "C3Tech F9-L310WH-RGB 120mm", 57, "Disponível", "https://www.datafor.com.br/gamer", "R$ 54,15 à vista")
          ]
        }
      ]
    },
    {
      id: "gpu",
      label: "Placa de vídeo",
      required: false,
      defaultItem: "gpu-none",
      search: "placa de vídeo RX 550 4GB",
      items: [
        noStockItem("gpu-none", "Vídeo integrado do processador", "Padrão para estação administrativa."),
        {
          id: "gpu-rx550",
          name: "Radeon RX 550 4GB",
          notes: "Opcional para múltiplos monitores ou CPU sem vídeo integrado.",
          offers: [
            offer("kabum", "VXPRO RX 550 4GB Low Profile", 697, "Em estoque", "https://www.kabum.com.br/produto/655595/placa-de-video-vxpro-rx-550-radeon-4gb-ddr5-128-bits-low-profile-hdmi-dvi-display-port-vxrx550-4gd5"),
            offer("datafor", "PCYes RX550 4GB", 989, "Imediata", "https://www.datafor.com.br/gamer/componentes/placa-de-video/placa-de-video-4gb-rx550-amd-radeon-gddr5-128-bits-dual-fan-graffiti-series-pajrx550dr5df", "R$ 939,55 à vista")
          ]
        }
      ]
    },
    {
      id: "monitor",
      label: "Monitor",
      required: false,
      defaultItem: "monitor-none",
      search: "monitor Full HD HDMI 22 24 polegadas",
      items: [
        noStockItem("monitor-none", "Reutilizar monitor existente", "Use quando a troca for apenas da CPU."),
        {
          id: "monitor-basic",
          name: "Monitor HDMI básico",
          notes: "Monitor simples para estação administrativa.",
          offers: [
            offer("kabum", "Monitor LED 22 polegadas Full HD", 398.99, "Em estoque", "https://www.kabum.com.br/produto/508157/monitor-pc-led-full-hd-tela-22-polegadas-60hz-hdmi-vga-audio"),
            offer("datafor", "AOC 18,5 HDMI", 439, "Disponível", "https://www.datafor.com.br/informatica/monitores/monitor-18-5-aoc-e970-swhnl-hdmi", "R$ 417,05 à vista")
          ]
        },
        {
          id: "monitor-24-datafor",
          name: "Monitor 23,8 Full HD HDMI/VGA",
          notes: "Tela maior para uso administrativo.",
          offers: [
            offer("datafor", "AOC 24B30HM2 23,8 Full HD", 729, "Disponível", "https://www.datafor.com.br/gamer", "R$ 692,55 à vista"),
            offer("kabum", "MSI PRO 22 IPS Full HD", 549.99, "Em estoque", "https://www.kabum.com.br/produto/644466/")
          ]
        }
      ]
    },
    {
      id: "keyboard",
      label: "Teclado",
      required: false,
      defaultItem: "keyboard-none",
      search: "teclado USB ABNT2",
      items: [
        noStockItem("keyboard-none", "Reutilizar teclado existente", "Use quando periféricos atuais estiverem bons."),
        {
          id: "keyboard-k120",
          name: "Teclado USB ABNT2",
          notes: "Teclado com fio para estação.",
          offers: [
            offer("datafor", "Logitech K120 Office ABNT2", 112, "Disponível", "https://www.datafor.com.br/informatica/teclados-usb")
          ]
        },
        {
          id: "keyboard-mk120",
          name: "Kit teclado + mouse USB",
          notes: "Combo com fio.",
          offers: [
            offer("datafor", "Logitech MK120", 169, "Imediata", "https://www.datafor.com.br/informatica/teclados/teclado-e-mouse-usb-mk120-logitech", "R$ 160,55 à vista")
          ]
        }
      ]
    },
    {
      id: "mouse",
      label: "Mouse",
      required: false,
      defaultItem: "mouse-none",
      search: "mouse USB sem fio",
      items: [
        noStockItem("mouse-none", "Reutilizar mouse existente", "Use quando periféricos atuais estiverem bons."),
        {
          id: "mouse-m170",
          name: "Mouse sem fio Logitech M170",
          notes: "Mouse sem fio básico.",
          offers: [
            offer("datafor", "Logitech M170", 99, "Disponível", "https://www.datafor.com.br/mousesemfio", "R$ 94,05 à vista")
          ]
        },
        {
          id: "mouse-c3tech",
          name: "Mouse USB C3Tech",
          notes: "Mouse com fio básico.",
          offers: [
            offer("datafor", "C3Tech MG-80BK", 75, "Disponível", "https://www.datafor.com.br/mousegamer/mouse-gamer-usb-mg-80bk-c3tech", "R$ 71,25 à vista")
          ]
        }
      ]
    },
    {
      id: "webcam",
      label: "Webcam",
      required: false,
      defaultItem: "webcam-none",
      search: "webcam HD 720p microfone",
      items: [
        noStockItem("webcam-none", "Sem webcam", "Use quando a estação não precisa de vídeo."),
        {
          id: "webcam-c270",
          name: "Webcam Logitech C270 HD",
          notes: "Webcam 720p com microfone.",
          offers: [
            offer("datafor", "Logitech C270", 329, "Imediata", "https://www.datafor.com.br/informatica/acessorios/webcam/webcam-logitech-c270-hd-720p-com-microfone-preto", "R$ 312,55 à vista")
          ]
        }
      ]
    },
    {
      id: "audio",
      label: "Áudio",
      required: false,
      defaultItem: "audio-none",
      search: "headset com microfone caixa de som USB",
      items: [
        noStockItem("audio-none", "Sem áudio dedicado", "Use quando a estação não precisa de headset/caixa de som."),
        {
          id: "headset-h151",
          name: "Headset com microfone",
          notes: "Uso em chamadas e suporte.",
          offers: [
            offer("datafor", "Logitech H151", 210, "Imediata", "https://www.datafor.com.br/audio-e-som/headsets/headset-com-microfone-h151-logitech", "R$ 199,50 à vista")
          ]
        },
        {
          id: "speaker-c3tech",
          name: "Caixa de som 2.0",
          notes: "Áudio simples para estação.",
          offers: [
            offer("datafor", "C3Tech Soundbar 6W SB-50BK", 99, "Disponível", "https://www.datafor.com.br/gamer", "R$ 94,05 à vista")
          ]
        }
      ]
    },
    {
      id: "network",
      label: "Rede",
      required: false,
      defaultItem: "network-none",
      search: "adaptador USB Wi-Fi cabo rede RJ45",
      items: [
        noStockItem("network-none", "Rede cabeada existente", "Padrão preferencial para estações hospitalares."),
        {
          id: "network-usb-rj45",
          name: "Adaptador USB para RJ45",
          notes: "Reposição para estações sem porta de rede funcional.",
          offers: [
            offer("datafor", "Multilaser WI272 USB x RJ45", 75, "Imediata", "https://www.datafor.com.br/informatica/cabos/cabo-conversor-usb-x-rj45-wi272-multilaser", "R$ 71,25 à vista")
          ]
        },
        {
          id: "network-wifi",
          name: "Adaptador USB Wi-Fi",
          notes: "Usar somente onde não houver ponto cabeado.",
          offers: [
            offer("kabum", "TP-Link TL-WN725N 150Mbps", 60.07, "Em estoque", "https://www.kabum.com.br/produto/515792/adaptador-usb-wi-fi-tp-link-tl-wn725n-de-150mbps-em-2-4ghz")
          ]
        }
      ]
    },
    {
      id: "cables",
      label: "Cabos e adaptadores",
      required: false,
      defaultItem: "cables-none",
      search: "cabo HDMI cabo força adaptador vídeo",
      items: [
        noStockItem("cables-none", "Sem cabos extras", "Use quando os cabos atuais serão reaproveitados."),
        {
          id: "cable-hdmi",
          name: "Cabo HDMI 5 metros",
          notes: "Conexão de monitor.",
          offers: [
            offer("datafor", "Cabo HDMI v1.4 5m Pluscable", 42, "Disponível", "https://www.datafor.com.br/informatica/monitores/monitor-18-5-aoc-e970-swhnl-hdmi", "R$ 39,90 à vista")
          ]
        },
        {
          id: "adapter-usb-rj45",
          name: "Conversor USB para RJ45",
          notes: "Também listado em rede.",
          offers: [
            offer("datafor", "Multilaser WI272 USB x RJ45", 75, "Imediata", "https://www.datafor.com.br/informatica/cabos/cabo-conversor-usb-x-rj45-wi272-multilaser", "R$ 71,25 à vista")
          ]
        }
      ]
    },
    {
      id: "powerFilter",
      label: "Filtro de linha",
      required: false,
      defaultItem: "filter-none",
      search: "filtro de linha 5 tomadas 6 tomadas",
      items: [
        noStockItem("filter-none", "Sem filtro de linha", "Use quando o setor já possuir proteção adequada."),
        {
          id: "filter-c3tech",
          name: "Filtro de linha 6 tomadas",
          notes: "Proteção básica contra sobretensão/sobrecorrente.",
          offers: [
            offer("datafor", "C3Tech FL-61BK 6 tomadas", 35, "Imediata", "https://www.datafor.com.br/informatica/energia/filtro-de-linha/filtro-de-linha-6-tomadas-preto-fl-61bk-c3tech", "R$ 33,25 à vista")
          ]
        },
        {
          id: "filter-intelbras",
          name: "Filtro de linha 5 tomadas",
          notes: "Alternativa Intelbras.",
          offers: [
            offer("datafor", "Intelbras EPE205 5 tomadas", 55, "Imediata", "https://www.datafor.com.br/informatica/energia/filtros-de-linha/filtro-de-linha-5tomadas-preto-intelbras", "R$ 52,25 à vista")
          ]
        }
      ]
    },
    {
      id: "powerProtection",
      label: "Nobreak",
      required: false,
      defaultItem: "nobreak-none",
      search: "nobreak 600VA 700VA 1200VA",
      items: [
        noStockItem("nobreak-none", "Sem nobreak no orçamento", "Use quando o setor já possui proteção elétrica."),
        {
          id: "nobreak-600",
          name: "Nobreak 600VA",
          notes: "Proteção básica para uma estação.",
          offers: [
            offer("kabum", "JBR Guard 600VA 120V", 299.99, "Em estoque", "https://www.kabum.com.br/produto/878099/"),
            offer("datafor", "SMS Lite 600VA", 525, "Disponível", "https://www.datafor.com.br/nobreak", "R$ 498,75 à vista")
          ]
        },
        {
          id: "nobreak-700",
          name: "Nobreak 700VA",
          notes: "Alternativa Datafor.",
          offers: [
            offer("datafor", "TS Shara UPS Mini 700VA", 429, "Disponível", "https://www.datafor.com.br/nobreak", "R$ 407,55 à vista")
          ]
        }
      ]
    },
    {
      id: "license",
      label: "Sistema operacional",
      required: false,
      defaultItem: "os-no-public-price",
      search: "licença Windows 11 Pro fornecedor hospital",
      items: [
        noStockItem("os-no-public-price", "Licenciamento a validar com contrato institucional", "Nenhum preço público confiável foi encontrado nos fornecedores permitidos."),
        {
          id: "os-none",
          name: "Sem licença no orçamento",
          notes: "Use quando imagem/licença corporativa já estiver disponível.",
          offers: []
        }
      ]
    }
  ],
  profiles: [
    {
      id: "base",
      label: "Base Santa Casa",
      description: "Estação administrativa com CPU, placa-mãe, 16 GB, SSD, fonte, gabinete e cooler.",
      included: baseIncluded(false),
      selections: {
        cpu: "cpu-i5-10400",
        motherboard: "mb-h610-msi",
        memory: "ram-ddr4-16",
        storage: "ssd-nvme-500",
        secondaryStorage: "storage-none",
        psu: "psu-500-bronze",
        case: "case-basic",
        cooler: "cooler-box",
        thermalPaste: "paste-none",
        caseFan: "fan-none",
        gpu: "gpu-none",
        monitor: "monitor-none",
        keyboard: "keyboard-none",
        mouse: "mouse-none",
        webcam: "webcam-none",
        audio: "audio-none",
        network: "network-none",
        cables: "cables-none",
        powerFilter: "filter-none",
        powerProtection: "nobreak-none",
        license: "os-no-public-price"
      }
    },
    {
      id: "complete",
      label: "Estação completa",
      description: "Inclui monitor, teclado, mouse, filtro de linha e cabos básicos.",
      included: {
        ...baseIncluded(false),
        monitor: true,
        keyboard: true,
        mouse: true,
        cables: true,
        powerFilter: true
      },
      selections: {
        cpu: "cpu-i5-10400",
        motherboard: "mb-h610-msi",
        memory: "ram-ddr4-16",
        storage: "ssd-nvme-500",
        secondaryStorage: "storage-none",
        psu: "psu-500-bronze",
        case: "case-basic",
        cooler: "cooler-box",
        thermalPaste: "paste-vinik",
        caseFan: "fan-none",
        gpu: "gpu-none",
        monitor: "monitor-basic",
        keyboard: "keyboard-k120",
        mouse: "mouse-m170",
        webcam: "webcam-none",
        audio: "audio-none",
        network: "network-none",
        cables: "cable-hdmi",
        powerFilter: "filter-c3tech",
        powerProtection: "nobreak-none",
        license: "os-no-public-price"
      }
    },
    {
      id: "performance",
      label: "Setor pesado",
      description: "32 GB, SSD NVMe, monitor maior, nobreak e acessórios de suporte.",
      included: {
        ...baseIncluded(false),
        monitor: true,
        keyboard: true,
        mouse: true,
        webcam: true,
        audio: true,
        cables: true,
        powerFilter: true,
        powerProtection: true,
        thermalPaste: true
      },
      selections: {
        cpu: "cpu-ryzen-8500g",
        motherboard: "mb-a620-asus",
        memory: "ram-ddr4-32",
        storage: "ssd-nvme-500",
        secondaryStorage: "storage-none",
        psu: "psu-500-bronze",
        case: "case-datafor-g80",
        cooler: "cooler-datafor",
        thermalPaste: "paste-pcyes",
        caseFan: "fan-c3tech",
        gpu: "gpu-none",
        monitor: "monitor-24-datafor",
        keyboard: "keyboard-mk120",
        mouse: "mouse-m170",
        webcam: "webcam-c270",
        audio: "headset-h151",
        network: "network-none",
        cables: "cable-hdmi",
        powerFilter: "filter-intelbras",
        powerProtection: "nobreak-600",
        license: "os-no-public-price"
      }
    }
  ]
};

function offer(supplier, title, price, availability, url, note = "") {
  const labels = {
    datafor: "Datafor",
    vmpack: "VMPack",
    kabum: "KaBuM!",
    magalu: "Magazine Luiza",
    hardsoft: "Hardsoft",
    shopshipe: "Shopshipe",
    matchpoint: "Matchpoint"
  };

  return {
    supplier,
    supplierLabel: labels[supplier] || supplier,
    title,
    price,
    availability,
    url,
    note,
    checkedAt: "2026-05-13"
  };
}

function noStockItem(id, name, notes) {
  return {
    id,
    name,
    notes,
    offers: []
  };
}

function baseIncluded(optionalDefault) {
  return {
    cpu: true,
    motherboard: true,
    memory: true,
    storage: true,
    secondaryStorage: optionalDefault,
    psu: true,
    case: true,
    cooler: true,
    thermalPaste: optionalDefault,
    caseFan: optionalDefault,
    gpu: optionalDefault,
    monitor: optionalDefault,
    keyboard: optionalDefault,
    mouse: optionalDefault,
    webcam: optionalDefault,
    audio: optionalDefault,
    network: optionalDefault,
    cables: optionalDefault,
    powerFilter: optionalDefault,
    powerProtection: optionalDefault,
    license: optionalDefault
  };
}
