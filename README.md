# DinoSurvival

DinoSurvival é um simulador de sobrevivência multiplayer inspirado em jogos clássicos de dinossauros. Desenvolvido para navegadores Web (usando Three.js e Node.js/WebSockets), o jogo foca em uma experiência de mundo dinâmico com mecânicas avançadas de biologia, sobrevivência e ecossistema.

## Características Principais

* **Diversidade de Espécies:** Suporte nativo para **60 espécies** de dinossauros diferentes, carregados dinamicamente via `.glb`.
* **Motor Visual (Gore & Tearing):** Sistema avançado de partículas para sangramento realista com gravidade, colisões com o chão e geração de poças. Suporte a projeção de feridas na pele (Decals) baseado na vida do dinossauro.
* **Ecossistema Dinâmico:** As carcaças e plantas não apenas desaparecem, mas possuem **estados visuais de degradação** conforme são devoradas, expondo ossos e esguichando partículas.
* **Clima e Terreno Procedural:** Mapa massivo (3000x3000) com 8 biomas diferentes e clima sincronizado globalmente pelo servidor (Chuva, Tempestade, Névoa, Neve, etc).
* **Sobrevivência:** Mecânicas de sede, fome, stamina e saúde para cada dinossauro, obrigando os jogadores a caçar, migrar e procurar água no mapa procedural.

## Arquitetura e Stack

* **Front-end:** HTML5, CSS3, Three.js (r128)
* **Back-end:** Node.js (Express) com WebSockets nativos (`ws`)
* **Banco de Dados:** SQLite (`sql.js` - WebAssembly) para persistência (jogadores, tribos, ovos, status)
* **Modelos 3D:** Formato `glTF/GLB` com suporte a `SkinnedMesh` e Animações (Mixamo/Blender).

## Como Instalar e Rodar Localmente

1. **Requisitos:** Node.js v18+ instalado.
2. **Instalação:** 
   ```bash
   npm install
   ```
3. **Modelos 3D:** Coloque seus modelos ripados ou baixados na pasta `models/` com os nomes exatos referenciados no banco de dados (ex: `models/trex.glb`).
4. **Executando o Servidor WebSocket:**
   ```bash
   node tmp-server.js
   ```
5. **Executando o Servidor Web (Client):**
   ```bash
   node client.js
   ```
6. **Acesso:** Acesse no seu navegador `http://localhost/`

## Notas sobre Modelos e Direitos Autorais

Os modelos 3D **não acompanham** este repositório para evitar violações de direitos autorais (DMCA). Para uso estritamente pessoal, você pode utilizar ferramentas como Umodel ou FModel para extrair recursos (meshes e rigs) de jogos que você possui e convertê-los via Blender para `.glb`. 
Certifique-se de não usar assets comerciais de terceiros em versões publicadas ou monetizadas do jogo.

## Estrutura de Arquivos

* `tmp-anim.html`: Client principal WebGL (Roda a lógica Three.js, VFX, UI).
* `tmp-server.js`: Back-end WebSocket autoritativo (Gerencia física de colisões, dano, spawns e sincronicidade).
* `dinodefs.js`: Dicionário completo definindo os status base das 60 espécies.
* `ecosystem.js / ai-system.js`: Módulos modulares do servidor para IA de presas e ciclo de crescimento botânico.
