window.SCMJF_PARTS_CATALOG = {
  metadata: {
    currency: "BRL",
    collectedAt: "2026-05-13",
    title: "Catálogo público de peças para estimativa",
    note: "Valores consultados em páginas públicas e mantidos como estimativa editável. Antes de comprar, validar fornecedor, garantia, frete, nota fiscal e compatibilidade."
  },
  categories: [
    {
      id: "cpu",
      label: "Processador",
      required: true,
      defaultItem: "cpu-i5-12400",
      search: "processador desktop com vídeo integrado i5 Ryzen 5",
      items: [
        {
          id: "cpu-i5-12400",
          name: "Intel Core i5-12400, 6c/12t, vídeo integrado",
          price: 939,
          source: "Promotech / lojas listadas",
          url: "https://promotech.app.br/products/simple/cpu/model/core-i5-12400",
          notes: "Opção LGA1700 com vídeo integrado para estações administrativas."
        },
        {
          id: "cpu-ryzen-5600g",
          name: "AMD Ryzen 5 5600G, 6c/12t, vídeo integrado",
          price: 1167.3,
          source: "Hardware Barato / Magazine Luiza",
          url: "https://www.hardwarebarato.com/produtos/processadores/ryzen-5-5600g",
          notes: "AM4 com vídeo integrado; exige placa-mãe compatível."
        },
        {
          id: "cpu-i5-13400",
          name: "Intel Core i5-13400, 10c/16t, vídeo integrado",
          price: 1342.64,
          source: "Promotech / lojas listadas",
          url: "https://promotech.app.br/products/simple/cpu/model/core-i5-13400",
          notes: "Mais folga para multitarefa, MV, navegador e Office."
        },
        {
          id: "cpu-ryzen-8500g",
          name: "AMD Ryzen 5 8500G, 6c/12t, AM5, vídeo integrado",
          price: 769.99,
          source: "KaBuM!",
          url: "https://www.kabum.com.br/produto/520366/processador-amd-ryzen-5-8500g-3-5-ghz-5-0ghz-max-turbo-cache-22mb-6-nucleos-12-threads-am5-video-integrado-100-100000931box",
          notes: "Plataforma AM5; usar com placa A620/B650 e DDR5."
        }
      ]
    },
    {
      id: "motherboard",
      label: "Placa-mãe",
      required: true,
      defaultItem: "mb-h610-ddr4",
      search: "placa mãe H610 DDR4 A620 DDR5",
      items: [
        {
          id: "mb-h610-ddr4",
          name: "H610 LGA1700 DDR4 mATX, M.2, HDMI",
          price: 529.9,
          source: "KaBuM!",
          url: "https://www.kabum.com.br/produto/1012201/placa-mae-h610-revenger-lga-1700-",
          notes: "Compatível com Intel 12a/13a/14a geração, DDR4."
        },
        {
          id: "mb-h610-ntc",
          name: "NTC H610M LGA1700 DDR4 mATX",
          price: 689.83,
          source: "KaBuM!",
          url: "https://www.kabum.com.br/produto/699608/placa-mae-ntc-h610m-lga-1700-2xddr4-chipset-h610-matx",
          notes: "Alternativa H610 com M.2 e saídas de vídeo."
        },
        {
          id: "mb-a620-ddr5",
          name: "ASUS PRIME A620M-E AM5 DDR5 mATX",
          price: 699.9,
          source: "KaBuM!",
          url: "https://www.kabum.com.br/produto/521066/",
          notes: "Compatível com Ryzen AM5 e memória DDR5."
        }
      ]
    },
    {
      id: "memory",
      label: "Memória RAM",
      required: true,
      defaultItem: "ram-ddr4-16-lexar",
      search: "memória RAM 16GB DDR4 3200 desktop",
      items: [
        {
          id: "ram-ddr4-16-lexar",
          name: "16 GB DDR4 3200 MHz Lexar",
          price: 260.99,
          source: "KaBuM!",
          url: "https://www.kabum.com.br/produto/472349",
          notes: "Mínimo recomendado para estação nova."
        },
        {
          id: "ram-ddr4-16-patriot",
          name: "16 GB DDR4 3200 MHz Patriot",
          price: 341.99,
          source: "KaBuM!",
          url: "https://www.kabum.com.br/produto/927107/memoria-ram-patriot-signature-16gb-1x16gb-3200mhz-ddr4-cl22-preta-psd416g32002",
          notes: "Alternativa DDR4."
        },
        {
          id: "ram-ddr4-32-lexar-kit",
          name: "32 GB DDR4 3200 MHz, 2x16 GB Lexar",
          price: 521.98,
          source: "KaBuM!",
          url: "https://www.kabum.com.br/produto/472349",
          notes: "Para setores com muitas abas, relatórios e aplicações simultâneas."
        },
        {
          id: "ram-ddr5-16-bluecase",
          name: "16 GB DDR5 4800 MHz Bluecase",
          price: 279.96,
          source: "KaBuM!",
          url: "https://www.kabum.com.br/produto/882267/memoria-ram-ddr5-16gb-4800mhz-1-2v-single-rank-bluecase-bml5d48m12v40-16g",
          notes: "Usar somente em placa-mãe DDR5."
        }
      ]
    },
    {
      id: "storage",
      label: "Armazenamento",
      required: true,
      defaultItem: "ssd-500-kingston",
      search: "SSD NVMe 500GB 1TB M.2",
      items: [
        {
          id: "ssd-256-adata",
          name: "SSD ADATA 256 GB NVMe M.2",
          price: 449.99,
          source: "KaBuM!",
          url: "https://www.kabum.com.br/produto/593419/",
          notes: "Capacidade mínima; considerar 500 GB para mais folga."
        },
        {
          id: "ssd-500-kingston",
          name: "SSD Kingston NV3 500 GB NVMe M.2 2280",
          price: 299.99,
          source: "KaBuM!",
          url: "https://www.kabum.com.br/produto/621161/ssd-kingston-nv3-500-gb-m-2-2280-pcie-4-0-x4-nvme-leitura-5000-mb-s-gravacao-3000-mb-s-azul-snv3s-500g",
          notes: "Boa base para Windows, Office, MV e navegador."
        },
        {
          id: "ssd-1tb-kingston",
          name: "SSD Kingston NV3 1 TB NVMe M.2 2280",
          price: 479.99,
          source: "KaBuM!",
          url: "https://www.kabum.com.br/produto/621162/ssd-kingston-nv3-1-tb-m-2-2280-pcie-4-0-x4-nvme-leitura-6000-mb-s-gravacao-4000-mb-s-azul-snv3s-1000g",
          notes: "Para estações com muitos documentos locais."
        }
      ]
    },
    {
      id: "psu",
      label: "Fonte",
      required: true,
      defaultItem: "psu-mach1-500",
      search: "fonte 500W 80 Plus Bronze PFC ativo",
      items: [
        {
          id: "psu-mach1-500",
          name: "MACH1 Steady 500W 80 Plus Bronze",
          price: 189.99,
          source: "KaBuM!",
          url: "https://www.kabum.com.br/produto/912181/",
          notes: "Potência suficiente para estação sem GPU dedicada."
        },
        {
          id: "psu-brx-500",
          name: "BRX Rainbow ATX 500W 80 Plus",
          price: 255.61,
          source: "KaBuM!",
          url: "https://www.kabum.com.br/produto/459595/fonte-brx-rainbow-atx-500w-80-plus-automatica-pfc",
          notes: "Alternativa de 500W."
        },
        {
          id: "psu-brx-650",
          name: "BRX Ampereon 650W 80 Plus Bronze",
          price: 710,
          source: "KaBuM!",
          url: "https://www.kabum.com.br/produto/1000400/fonte-brx-ampereon-650w-automatica-80-plus-bronze",
          notes: "Usar quando houver GPU dedicada ou margem elétrica maior."
        }
      ]
    },
    {
      id: "case",
      label: "Gabinete",
      required: true,
      defaultItem: "case-c3tech-mt30",
      search: "gabinete micro ATX preto sem fonte",
      items: [
        {
          id: "case-c3tech-mt30",
          name: "C3Tech MT-30BK Micro ATX com fonte 200W",
          price: 119.99,
          source: "KaBuM!",
          url: "https://www.kabum.com.br/produto/761525/gabinete-c3tech-micro-atx-mid-tower-com-fonte-200w-sem-fans-preto-mt-30bk",
          notes: "Usar a fonte dedicada do orçamento; validar espaço interno."
        },
        {
          id: "case-duex-dx255",
          name: "Duex DX255-8 Micro ATX preto",
          price: 69.7,
          source: "KaBuM!",
          url: "https://www.kabum.com.br/produto/503901/gabinete-duex-micro-atx-mini-atx-preto-dx255-8",
          notes: "Opção econômica."
        },
        {
          id: "case-vinik-one",
          name: "Vinik One M1 Micro ATX sem fonte",
          price: 227.88,
          source: "KaBuM!",
          url: "https://www.kabum.com.br/produto/121809/gabinete-vinik-one-m1-mid-tower-micro-atx-preto-s-fonte-32373",
          notes: "Gabinete sem fonte, melhor para padronizar PSU."
        }
      ]
    },
    {
      id: "cooler",
      label: "Cooler",
      required: true,
      defaultItem: "cooler-intel-lga1700",
      search: "cooler processador LGA1700 AM4 AM5 65W",
      items: [
        {
          id: "cooler-intel-lga1700",
          name: "Cooler Intel LGA1700 65W",
          price: 87.54,
          source: "KaBuM!",
          url: "https://www.kabum.com.br/produto/294887/cooler-para-processador-lga-1700-intel-12-13-geracao-m23901-001-intel",
          notes: "Compatível com Intel LGA1700 de 65W."
        },
        {
          id: "cooler-notus-st17",
          name: "PCYES Notus ST17 LGA1700 65W",
          price: 107.88,
          source: "KaBuM!",
          url: "https://www.kabum.com.br/produto/623529/cooler-para-processador-notus-st17-lga-1700-tdp-65w-st1765w",
          notes: "Alternativa LGA1700."
        },
        {
          id: "cooler-box-incluso",
          name: "Cooler box incluso no processador",
          price: 0,
          source: "Validar SKU do processador",
          url: "https://www.kabum.com.br/",
          notes: "Usar somente se o processador comprado vier com cooler."
        }
      ]
    },
    {
      id: "license",
      label: "Sistema operacional",
      required: false,
      defaultItem: "os-existing-contract",
      search: "Windows 11 Pro licença oficial Brasil",
      items: [
        {
          id: "os-existing-contract",
          name: "Licenciamento existente / contrato institucional",
          price: 0,
          source: "Validar com TI e compras",
          url: "https://www.microsoft.com/pt-br/windows/business",
          notes: "Use quando a Santa Casa já possuir licenciamento ou imagem corporativa."
        },
        {
          id: "os-windows-pro-retail",
          name: "Windows 11 Pro, download Microsoft Store",
          price: 1599,
          source: "Microsoft Store Brasil",
          url: "https://www.microsoft.com/pt-br/d/windows-11-pro/dg7gmgf0d8h4",
          notes: "Preço oficial varejo; pode não ser o melhor modelo para compra institucional."
        },
        {
          id: "os-windows-oem",
          name: "Windows 11 Pro OEM, referência de mercado",
          price: 180,
          source: "Cia da Informática",
          url: "https://www.ciainfor.com.br/licenca-microsoft-windows-11-pro",
          notes: "Validar regra de venda vinculada a hardware novo e documentação fiscal."
        }
      ]
    },
    {
      id: "monitor",
      label: "Monitor",
      required: false,
      defaultItem: "monitor-22-aitek",
      search: "monitor 22 polegadas Full HD HDMI VGA",
      items: [
        {
          id: "monitor-none",
          name: "Reutilizar monitor existente",
          price: 0,
          source: "Inventário local",
          url: "https://www.kabum.com.br/busca/monitor-22-full-hd",
          notes: "Use quando a troca for apenas da CPU."
        },
        {
          id: "monitor-22-aitek",
          name: "Monitor LED 22 polegadas Full HD HDMI/VGA",
          price: 398.99,
          source: "KaBuM!",
          url: "https://www.kabum.com.br/produto/508157/monitor-pc-led-full-hd-tela-22-polegadas-60hz-hdmi-vga-audio",
          notes: "Opção básica."
        },
        {
          id: "monitor-22-msi",
          name: "Monitor MSI PRO 22 polegadas FHD IPS",
          price: 549.99,
          source: "KaBuM!",
          url: "https://www.kabum.com.br/produto/644466/",
          notes: "Melhor painel e ergonomia básica."
        },
        {
          id: "monitor-22-aoc",
          name: "Monitor AOC 22 polegadas FHD com ajuste de altura",
          price: 649.99,
          source: "KaBuM!",
          url: "https://www.kabum.com.br/produto/909129/monitor-office-aoc-22-fhd-75hz-4ms-va-hdmi-e-vga-altura-ajustavel-preto-22b3hmf",
          notes: "Opção com ajuste de altura."
        }
      ]
    },
    {
      id: "peripherals",
      label: "Teclado e mouse",
      required: false,
      defaultItem: "peripheral-mk235",
      search: "combo teclado mouse USB ABNT2",
      items: [
        {
          id: "peripheral-none",
          name: "Reutilizar teclado e mouse existentes",
          price: 0,
          source: "Inventário local",
          url: "https://www.kabum.com.br/busca/combo-teclado-mouse",
          notes: "Use quando periféricos atuais estiverem bons."
        },
        {
          id: "peripheral-mk235",
          name: "Logitech MK235 sem fio ABNT2",
          price: 119.9,
          source: "KaBuM!",
          url: "https://www.kabum.com.br/produto/79357/combo-teclado-e-mouse-sem-fio-logitech-mk235-com-conexao-usb-pilhas-inclusas-e-layout-abnt2-920-007903",
          notes: "Combo sem fio simples."
        },
        {
          id: "peripheral-mk270",
          name: "Logitech MK270 sem fio ABNT2",
          price: 169.99,
          source: "KaBuM!",
          url: "https://www.kabum.com.br/produto/35990/",
          notes: "Combo sem fio com teclas multimídia."
        }
      ]
    },
    {
      id: "powerProtection",
      label: "Proteção elétrica",
      required: false,
      defaultItem: "power-none",
      search: "nobreak 600VA computador 115V 220V",
      items: [
        {
          id: "power-none",
          name: "Sem nobreak no orçamento",
          price: 0,
          source: "Decisão de compras",
          url: "https://www.kabum.com.br/busca/nobreak-600va",
          notes: "Use quando o setor já possui proteção elétrica."
        },
        {
          id: "power-jbr-600",
          name: "Nobreak JBR Guard 600VA 120V",
          price: 299.99,
          source: "KaBuM!",
          url: "https://www.kabum.com.br/produto/878099/",
          notes: "Validar tensão do setor."
        },
        {
          id: "power-ts-600",
          name: "Nobreak TS Shara Mini 600VA 115V",
          price: 359.99,
          source: "KaBuM!",
          url: "https://www.kabum.com.br/produto/916112/",
          notes: "6 tomadas; validar autonomia esperada."
        },
        {
          id: "power-apc-600",
          name: "Nobreak APC Back-UPS 600VA 115V",
          price: 485.9,
          source: "KaBuM!",
          url: "https://www.kabum.com.br/produto/457080/",
          notes: "Marca consolidada; custo maior."
        }
      ]
    },
    {
      id: "network",
      label: "Rede",
      required: false,
      defaultItem: "network-none",
      search: "adaptador USB Wi-Fi TP-Link 150Mbps",
      items: [
        {
          id: "network-none",
          name: "Rede cabeada existente",
          price: 0,
          source: "Infraestrutura local",
          url: "https://www.kabum.com.br/busca/adaptador-wifi-usb",
          notes: "Padrão preferencial para estações hospitalares."
        },
        {
          id: "network-tplink-wn725n",
          name: "TP-Link TL-WN725N USB Wi-Fi 150Mbps",
          price: 60.07,
          source: "KaBuM!",
          url: "https://www.kabum.com.br/produto/515792/adaptador-usb-wi-fi-tp-link-tl-wn725n-de-150mbps-em-2-4ghz",
          notes: "Usar somente onde não houver ponto cabeado."
        }
      ]
    },
    {
      id: "gpu",
      label: "Vídeo dedicado",
      required: false,
      defaultItem: "gpu-none",
      search: "placa de vídeo básica low profile HDMI DisplayPort",
      items: [
        {
          id: "gpu-none",
          name: "Vídeo integrado do processador",
          price: 0,
          source: "Configuração padrão",
          url: "https://www.kabum.com.br/busca/placa-de-video-low-profile",
          notes: "Suficiente para Office, MV, navegador e dois monitores simples quando a placa-mãe suportar."
        },
        {
          id: "gpu-rx550",
          name: "Radeon RX 550 4GB low profile",
          price: 697,
          source: "KaBuM!",
          url: "https://www.kabum.com.br/produto/655595/placa-de-video-vxpro-rx-550-radeon-4gb-ddr5-128-bits-low-profile-hdmi-dvi-display-port-vxrx550-4gd5",
          notes: "Opcional para múltiplos monitores ou setor específico."
        }
      ]
    }
  ],
  profiles: [
    {
      id: "base",
      label: "Base Santa Casa",
      description: "Estação administrativa com 16 GB, SSD NVMe 500 GB, vídeo integrado e sem periféricos novos.",
      included: {
        cpu: true,
        motherboard: true,
        memory: true,
        storage: true,
        psu: true,
        case: true,
        cooler: true,
        license: false,
        monitor: false,
        peripherals: false,
        powerProtection: false,
        network: false,
        gpu: false
      },
      selections: {
        cpu: "cpu-i5-12400",
        motherboard: "mb-h610-ddr4",
        memory: "ram-ddr4-16-lexar",
        storage: "ssd-500-kingston",
        psu: "psu-mach1-500",
        case: "case-c3tech-mt30",
        cooler: "cooler-intel-lga1700",
        license: "os-existing-contract",
        monitor: "monitor-none",
        peripherals: "peripheral-none",
        powerProtection: "power-none",
        network: "network-none",
        gpu: "gpu-none"
      }
    },
    {
      id: "complete",
      label: "Estação completa",
      description: "CPU completa com monitor, teclado/mouse e licenciamento institucional a validar.",
      included: {
        cpu: true,
        motherboard: true,
        memory: true,
        storage: true,
        psu: true,
        case: true,
        cooler: true,
        license: true,
        monitor: true,
        peripherals: true,
        powerProtection: false,
        network: false,
        gpu: false
      },
      selections: {
        cpu: "cpu-i5-12400",
        motherboard: "mb-h610-ddr4",
        memory: "ram-ddr4-16-lexar",
        storage: "ssd-500-kingston",
        psu: "psu-mach1-500",
        case: "case-vinik-one",
        cooler: "cooler-intel-lga1700",
        license: "os-existing-contract",
        monitor: "monitor-22-msi",
        peripherals: "peripheral-mk235",
        powerProtection: "power-none",
        network: "network-none",
        gpu: "gpu-none"
      }
    },
    {
      id: "performance",
      label: "Setor pesado",
      description: "Mais CPU, 32 GB de RAM e SSD 1 TB para setores com multitarefa intensa.",
      included: {
        cpu: true,
        motherboard: true,
        memory: true,
        storage: true,
        psu: true,
        case: true,
        cooler: true,
        license: true,
        monitor: true,
        peripherals: true,
        powerProtection: true,
        network: false,
        gpu: false
      },
      selections: {
        cpu: "cpu-i5-13400",
        motherboard: "mb-h610-ntc",
        memory: "ram-ddr4-32-lexar-kit",
        storage: "ssd-1tb-kingston",
        psu: "psu-mach1-500",
        case: "case-vinik-one",
        cooler: "cooler-notus-st17",
        license: "os-existing-contract",
        monitor: "monitor-22-aoc",
        peripherals: "peripheral-mk270",
        powerProtection: "power-ts-600",
        network: "network-none",
        gpu: "gpu-none"
      }
    },
    {
      id: "am5",
      label: "Plataforma AM5",
      description: "Configuração atualizada com Ryzen 8500G, DDR5 e SSD 1 TB.",
      included: {
        cpu: true,
        motherboard: true,
        memory: true,
        storage: true,
        psu: true,
        case: true,
        cooler: true,
        license: false,
        monitor: false,
        peripherals: false,
        powerProtection: false,
        network: false,
        gpu: false
      },
      selections: {
        cpu: "cpu-ryzen-8500g",
        motherboard: "mb-a620-ddr5",
        memory: "ram-ddr5-16-bluecase",
        storage: "ssd-1tb-kingston",
        psu: "psu-mach1-500",
        case: "case-vinik-one",
        cooler: "cooler-box-incluso",
        license: "os-existing-contract",
        monitor: "monitor-none",
        peripherals: "peripheral-none",
        powerProtection: "power-none",
        network: "network-none",
        gpu: "gpu-none"
      }
    }
  ]
};
