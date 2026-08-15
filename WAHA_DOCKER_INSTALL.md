# Como instalar a API WAHA (WhatsApp) via Docker

Este documento contém as instruções para você (ou seu time técnico) subir o container da WAHA que será utilizado pelo sistema da clínica.

## 1. Pré-requisitos
- Ter o [Docker](https://docs.docker.com/get-docker/) instalado na sua máquina (ou em uma VPS na nuvem).
- Ter o [Docker Compose](https://docs.docker.com/compose/install/) instalado.

## 2. Arquivo `docker-compose.yml`
Crie uma pasta em qualquer lugar do seu computador/servidor, e dentro dela crie um arquivo chamado `docker-compose.yml` com o seguinte conteúdo (certifique-se de que é texto puro, e não um arquivo .rtf!):

```yaml
services:
  waha:
    image: devlikeapro/waha
    container_name: waha
    platform: linux/amd64
    ports:
      - "3001:3000"
    environment:
      - WAHA_LOG_LEVEL=info
      - WAHA_DASHBOARD_USERNAME=admin
      - WAHA_DASHBOARD_PASSWORD=admin
      - WHATSAPP_SWAGGER_USERNAME=admin
      - WHATSAPP_SWAGGER_PASSWORD=admin
    restart: always
```

## 3. Rodando o servidor
No mesmo terminal onde você criou o arquivo, execute o comando:
```bash
docker-compose up -d
```
Isso vai baixar a imagem e rodar a API WAHA em segundo plano na porta **3001** (para não dar conflito com o seu sistema atual).

## 4. Escaneando o QR Code (Sessão "default")
1. Acesse o painel da WAHA no seu navegador: `http://localhost:3001/dashboard` (se estiver instalando localmente) ou `http://IP-DA-SUA-VPS:3001/dashboard`.
2. O sistema abrirá a interface visual (Swagger/Painel).
3. Procure o endpoint `POST /api/sessions/start` e inicie uma sessão chamada **`default`**.
4. Procure o endpoint `GET /api/screenshot?session=default` (ou verifique os logs) para escanear o **QR Code** com o WhatsApp do seu celular, como se fosse o WhatsApp Web.

## 5. Configurando no Sistema da Clínica
Uma vez que o celular estiver conectado, volte para o Sistema Aura Aesthetics:
1. Vá em **Configurações > Integrações**.
2. Na aba do WhatsApp (WAHA):
   - Coloque a **URL da API**: `http://localhost:3001` (ou o IP da sua máquina).
   - Coloque o **Nome da Sessão**: `default` (o mesmo que você criou no passo 4).
3. Clique em **Salvar**.
4. Teste enviando uma mensagem para o seu próprio número clicando em **Enviar Teste**!
