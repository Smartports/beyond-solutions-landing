flowchart TD
  %% ────────────────────────────────
  %% INICIO
  %% ────────────────────────────────
  A([Inicio Plataforma])

  %% ────────────────────────────────
  %% FASE 1 · IDEA / ONBOARDING
  %% ────────────────────────────────
  subgraph Fase1["Fase 1 • Idea / Onboarding"]
    direction TB
    A --> B[Wizard 2 Preguntas]

    B --> C{Selecciona tu perfil}
    C -->|Desarrollador| C1[Perfil Desarrollador]
    C -->|Propietario| C2[Perfil Propietario]
    C -->|Inversionista| C3[Perfil Inversionista]
    C -->|Arquitecto| C4[Perfil Arquitecto]

    B --> D{Tipo de proyecto}
    D -->|Residencial| D1[Residencial]
    D -->|Comercial| D2[Comercial]
    D -->|Mixto| D3[Mixto]
    D -->|Industrial| D4[Industrial]

    C1 & C2 & C3 & C4 & D1 & D2 & D3 & D4 --> E[Dashboard Autosave]
  end

  %% ────────────────────────────────
  %% FASE 2 · TERRENO
  %% ────────────────────────────────
  subgraph Fase2["Fase 2 • Terreno"]
    direction TB
    E --> F{Origen del terreno}

    F -->|Propio| F1[Terreno Propio]
    F -->|Catálogo| F2[Catálogo Geo]
    F2 --> F2a[Datos GIS / Catastro]

    F1 & F2a --> G[Editor de Terreno]
    G  --> G1[Sketch 2D + Elevación]
    G  --> G2[Importar CAD / GIS]

    G1 & G2 --> H[Vista 3D Low-Poly]
    H  --> H1[Motor Físico]
    H1 --> H2[Análisis Solar]
    H1 --> H3[Análisis Viento]
  end

  %% ────────────────────────────────
  %% FASE 3 · COSTOS
  %% ────────────────────────────────
  subgraph Fase3["Fase 3 • Costos"]
    direction TB
    H --> I{Sistema Constructivo}

    I --> I1[Estructura]
    I --> I2[Cerramientos]
    I --> I3[Cubiertas]
    I --> I4[MEP Básico]

    I1 & I2 & I3 & I4 --> J{Nivel de materiales}
    J -->|Básico| J1[$]
    J -->|Estándar| J2[$$]
    J -->|Premium| J3[$$$]
    J -->|Ecológico| J4[ECO]
    J -->|Personalizado|J5[Editor Materiales]
    J5 --> J5a[Texturas PBR]

    J1 & J2 & J3 & J4 & J5a --> K[Motor Financiero]
    K --> K1[Costos Directos]
    K --> K2[Costos Indirectos]
    K --> K3[Financiamiento]
    K --> K4[Impuestos]
    K --> K5[Proyección Ventas]

    K1 & K2 & K3 & K4 & K5 --> L[Análisis Financiero]
    L  --> L1["KPIs (ROI, TIR, VAN, Payback)"]
    L1 --> L2{Simulador de Escenarios}
    L2 --> L2a[Optimista]
    L2 --> L2b[Realista]
    L2 --> L2c[Pesimista]
    L2a & L2b & L2c --> L3[Proyección 5 años]
  end

  %% ────────────────────────────────
  %% FASE 4 · EXPERIENCIA & COMPARTIR
  %% ────────────────────────────────
  subgraph Fase4["Fase 4 • Experiencia & Compartir"]
    direction TB
    L3 --> M[Visualizador Inmersivo 3D]
    M  --> M1[Escala Día/Noche]
    M  --> M2[Estaciones]
    M  --> M3[Vista Interior / Exterior]

    M3 --> N{Gamificación}
    N --> N1[XP y Badges]
    N --> N2[Desafíos Mensuales]
    N --> N3[Leaderboard]
    N --> N4[Benchmark]

    N4 --> O{Social / Exportar}
    O --> O1[Portfolio Virtual]
    O --> O2[Compartir AR / VR]
    O --> O3[PDF Financiero]
    O --> O4[glTF / BIM]
    O --> O5[Video Tour]

    O1 & O2 & O3 & O4 & O5 --> P[Integraciones API]
    P --> P1[CRM]
    P --> P2[Marketplace]
    P --> P3[Financieras]
    P --> P4[Analytics Dashboard]
  end

  %% ────────────────────────────────
  %% ESTILOS DE FASE
  %% ────────────────────────────────
  classDef idea        fill:#f4d6db,stroke:#333,stroke-width:1px;
  classDef terreno     fill:#d8e2dc,stroke:#333,stroke-width:1px;
  classDef costos      fill:#d0f4de,stroke:#333,stroke-width:1px;
  classDef experiencia fill:#a9def9,stroke:#333,stroke-width:1px;

  class B,C,C1,C2,C3,C4,D,D1,D2,D3,D4,E idea;
  class F,F1,F2,F2a,G,G1,G2,H,H1,H2,H3 terreno;
  class I,I1,I2,I3,I4,J,J1,J2,J3,J4,J5,J5a,K,K1,K2,K3,K4,K5,L,L1,L2,L2a,L2b,L2c,L3 costos;
  class M,M1,M2,M3,N,N1,N2,N3,N4,O,O1,O2,O3,O4,O5,P,P1,P2,P3,P4 experiencia;