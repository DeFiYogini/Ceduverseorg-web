# Setup de Google Meet para el CRM Ceduverse

Conecta una cuenta gratuita de Google para que el CRM cree reuniones de Google Meet
y envíe la invitación por correo al prospecto automáticamente. **100% gratis**, sin tarjeta.

Al terminar, hay que enviar **3 datos**: `Client ID`, `Client Secret`, `Refresh Token`.

---

## 🇲🇽 Instrucciones (español)

⚠️ **Usa UNA sola cuenta de Google** durante todo el proceso (la cuenta que organizará las reuniones).

### Parte A — Crear el proyecto
1. Entra a **console.cloud.google.com**
2. Barra superior → menú de proyectos → **New Project / Proyecto nuevo** → nombre: `Ceduverse CRM` → **Create / Crear** → selecciónalo.
3. Menú izquierdo → **APIs & Services → Library** (APIs y servicios → Biblioteca)
4. Busca **"Google Calendar API"** → ábrela → **Enable / Habilitar**.

### Parte B — Pantalla de permisos
5. Menú izquierdo → **APIs & Services → OAuth consent screen** (Pantalla de consentimiento de OAuth)
6. Elige **External / Externo** → **Create / Crear**
7. Llena: Nombre de la app `Ceduverse CRM`, correo de soporte = tu Gmail, correo del desarrollador = tu Gmail → **Save and Continue / Guardar y continuar** (3 veces)
8. Busca el botón **"Publish App / Publicar aplicación"** → clic → **Confirm / Confirmar**. (Esto hace permanente el acceso.)

### Parte C — Crear las llaves
9. Menú izquierdo → **APIs & Services → Credentials** (Credenciales)
10. **+ Create Credentials / Crear credenciales** → **OAuth client ID / ID de cliente de OAuth**
11. Tipo de aplicación: **Web application / Aplicación web** → nombre: `Ceduverse Setup`
12. En **Authorized redirect URIs / URIs de redirección autorizados** → **+ Add URI / Agregar URI** → pega exactamente:
    ```
    https://developers.google.com/oauthplayground
    ```
13. **Create / Crear** → aparece una ventana con **Client ID** y **Client Secret** → **copia ambos** ✅

### Parte D — Obtener el Refresh Token
14. Entra a **developers.google.com/oauthplayground**
15. Clic en el **engrane ⚙️** (arriba a la derecha) → marca ✅ **"Use your own OAuth credentials"** → pega el **Client ID** y **Client Secret** → cierra el engrane.
16. A la izquierda, en la caja **"Input your own scopes"**, pega:
    ```
    https://www.googleapis.com/auth/calendar.events
    ```
    → clic en **Authorize APIs**
17. Inicia sesión con el **Gmail de reuniones** → si advierte "app no verificada": **Advanced / Avanzado → Ir a Ceduverse CRM → Continuar → Allow / Permitir**
18. De regreso en el playground, clic en **"Exchange authorization code for tokens"**
19. Copia el valor de **Refresh token** ✅

### Enviar de regreso
- **Client ID:** …
- **Client Secret:** …
- **Refresh Token:** …

---

## 🇺🇸 Instructions (English)

⚠️ **Stay logged into ONE Google account** the whole time (the one that will host meetings).

### Part A — Create the project
1. Go to **console.cloud.google.com**
2. Top bar → project dropdown → **New Project** → name `Ceduverse CRM` → **Create** → select it.
3. Left menu → **APIs & Services → Library**
4. Search **"Google Calendar API"** → open it → **Enable**.

### Part B — Consent screen
5. Left menu → **APIs & Services → OAuth consent screen**
6. **External** → **Create**
7. App name `Ceduverse CRM`, support email = your Gmail, developer email = your Gmail → **Save and Continue** (3×)
8. Click **"Publish App"** → **Confirm**. (Makes the token permanent.)

### Part C — Create the keys
9. Left menu → **APIs & Services → Credentials**
10. **+ Create Credentials** → **OAuth client ID**
11. Application type **Web application** → name `Ceduverse Setup`
12. **Authorized redirect URIs → + Add URI** → paste exactly:
    ```
    https://developers.google.com/oauthplayground
    ```
13. **Create** → copy the **Client ID** and **Client Secret** ✅

### Part D — Get the Refresh Token
14. Go to **developers.google.com/oauthplayground**
15. Gear ⚙️ (top right) → check **"Use your own OAuth credentials"** → paste Client ID + Secret → close.
16. In **"Input your own scopes"** paste:
    ```
    https://www.googleapis.com/auth/calendar.events
    ```
    → **Authorize APIs**
17. Sign in with the meetings Gmail → if "unverified app": **Advanced → Go to Ceduverse CRM → Continue → Allow**
18. Click **"Exchange authorization code for tokens"**
19. Copy the **Refresh token** ✅

### Send back
- **Client ID**, **Client Secret**, **Refresh Token**

---

## What happens next (for the dev / Claude)
Add the three values as Render env vars on service `ceduverse`:
`GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`, `GOOGLE_OAUTH_REFRESH_TOKEN`
(optional: `GOOGLE_MEET_CALENDAR_ID=primary`, `GOOGLE_MEET_TIMEZONE=America/Mexico_City`).
Then merge branch `feat/crm-google-meet` → `main` and deploy. The "Agendar reunión (Google Meet)"
button in the prospect panel goes live. Backend: `server/services/google-calendar.ts`.
