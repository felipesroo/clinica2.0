# 📖 WAHA (WhatsApp HTTP API) - Documentação Completa
> **Nota:** Documentação gerada automaticamente a partir da especificação OpenAPI da WAHA.

Esta documentação contém todos os endpoints, parâmetros e estruturas de dados necessários para integrar o Whaticket com a WAHA.

---

## 🏷️ Módulo: ✅ Presence
### `POST` /api/{session}/presence
**Descrição:** Set session presence

**Parâmetros:**
- `session` (path) *(Obrigatório)*: Session name

**Corpo da Requisição (JSON):**
- **`chatId`** `string` - Chat ID - either group id or contact id. Required for chat-related presence statuses; omit for ONLINE/OFFLINE. (Ex: `11111111111@c.us`)
- **`presence`** `string`


**Respostas:**
- **`201`**: 
---

### `GET` /api/{session}/presence
**Descrição:** Get all subscribed presence information.

**Parâmetros:**
- `session` (path) *(Obrigatório)*: Session name

**Respostas:**
- **`200`**: 
---

### `GET` /api/{session}/presence/{chatId}
**Descrição:** Get the presence for the chat id. If it hasn't been subscribed - it also subscribes to it.

**Parâmetros:**
- `session` (path) *(Obrigatório)*: Session name
- `chatId` (path) *(Obrigatório)*: Chat ID

**Respostas:**
- **`200`**: 
  - **`id`** `string` - Chat ID - either group id or contact id (Ex: `11111111111@c.us`)
  - **`presences`** `array`
    - Item properties:
      - **`participant`** `string` - Chat ID - participant or contact id (Ex: `11111111111@c.us`)
      - **`lastSeen`** `number` (Ex: `1686568773`)
      - **`lastKnownPresence`** `string`

---

### `POST` /api/{session}/presence/{chatId}/subscribe
**Descrição:** Subscribe to presence events for the chat.

**Parâmetros:**
- `session` (path) *(Obrigatório)*: Session name
- `chatId` (path) *(Obrigatório)*: Chat ID

**Respostas:**
- **`201`**: 
---

## 🏷️ Módulo: 🆔 Profile
### `GET` /api/{session}/profile
**Descrição:** Get my profile

**Parâmetros:**
- `session` (path) *(Obrigatório)*: Session name

**Respostas:**
- **`200`**: 
  - **`id`** `string` (Ex: `11111111111@c.us`)
  - **`picture`** `string` (Ex: `https://example.com/picture.jpg`)
  - **`name`** `string`

---

### `PUT` /api/{session}/profile/name
**Descrição:** Set my profile name

**Parâmetros:**
- `session` (path) *(Obrigatório)*: Session name

**Corpo da Requisição (JSON):**
- **`name`** `string` (Ex: `My New Name`)


**Respostas:**
- **`200`**: 
  - **`success`** `boolean`

---

### `PUT` /api/{session}/profile/status
**Descrição:** Set profile status (About)

**Parâmetros:**
- `session` (path) *(Obrigatório)*: Session name

**Corpo da Requisição (JSON):**
- **`status`** `string` (Ex: `🎉 Hey there! I am using WhatsApp 🎉`)


**Respostas:**
- **`200`**: 
  - **`success`** `boolean`

---

### `PUT` /api/{session}/profile/picture
**Descrição:** Set profile picture

**Parâmetros:**
- `session` (path) *(Obrigatório)*: Session name

**Corpo da Requisição (JSON):**
- **`file`** `any`


**Respostas:**
- **`200`**: 
  - **`success`** `boolean`

---

### `DELETE` /api/{session}/profile/picture
**Descrição:** Delete profile picture

**Parâmetros:**
- `session` (path) *(Obrigatório)*: Session name

**Respostas:**
- **`200`**: 
  - **`success`** `boolean`

---

## 🏷️ Módulo: 🏷️ Labels
### `GET` /api/{session}/labels
**Descrição:** Get all labels

**Parâmetros:**
- `session` (path) *(Obrigatório)*: Session name

**Respostas:**
- **`200`**: 
---

### `POST` /api/{session}/labels
**Descrição:** Create a new label

**Parâmetros:**
- `session` (path) *(Obrigatório)*: Session name

**Corpo da Requisição (JSON):**
- **`name`** `string` - Label name (Ex: `Lead`)
- **`colorHex`** `string` - Color in hex (Ex: `#ff9485`)
- **`color`** `number` - Color number, not hex


**Respostas:**
- **`201`**: 
  - **`id`** `string` - Label ID (Ex: `1`)
  - **`name`** `string` - Label name (Ex: `Lead`)
  - **`color`** `number` - Color number, not hex
  - **`colorHex`** `string` - Color in hex (Ex: `#ff9485`)

---

### `PUT` /api/{session}/labels/{labelId}
**Descrição:** Update a label

**Parâmetros:**
- `session` (path) *(Obrigatório)*: Session name
- `labelId` (path) *(Obrigatório)*: 

**Corpo da Requisição (JSON):**
- **`name`** `string` - Label name (Ex: `Lead`)
- **`colorHex`** `string` - Color in hex (Ex: `#ff9485`)
- **`color`** `number` - Color number, not hex


**Respostas:**
- **`200`**: 
  - **`id`** `string` - Label ID (Ex: `1`)
  - **`name`** `string` - Label name (Ex: `Lead`)
  - **`color`** `number` - Color number, not hex
  - **`colorHex`** `string` - Color in hex (Ex: `#ff9485`)

---

### `DELETE` /api/{session}/labels/{labelId}
**Descrição:** Delete a label

**Parâmetros:**
- `session` (path) *(Obrigatório)*: Session name
- `labelId` (path) *(Obrigatório)*: 

**Respostas:**
- **`200`**: 
---

### `GET` /api/{session}/labels/chats/{chatId}
**Descrição:** Get labels for the chat

**Parâmetros:**
- `session` (path) *(Obrigatório)*: Session name
- `chatId` (path) *(Obrigatório)*: Chat ID

**Respostas:**
- **`200`**: 
---

### `PUT` /api/{session}/labels/chats/{chatId}
**Descrição:** Save labels for the chat

**Parâmetros:**
- `session` (path) *(Obrigatório)*: Session name
- `chatId` (path) *(Obrigatório)*: Chat ID

**Corpo da Requisição (JSON):**
- **`labels`** `array`
  - Item properties:
    - **`id`** `string` - Label ID (Ex: `1`)


**Respostas:**
- **`200`**: 
---

### `GET` /api/{session}/labels/{labelId}/chats
**Descrição:** Get chats by label

**Parâmetros:**
- `session` (path) *(Obrigatório)*: Session name
- `labelId` (path) *(Obrigatório)*: 

**Respostas:**
- **`200`**: 
---

## 🏷️ Módulo: 👤 Contacts
### `GET` /api/contacts/all
**Descrição:** Get all contacts

**Parâmetros:**
- `session` (query) *(Obrigatório)*: 
- `sortBy` (query) *(Opcional)*: Sort by field
- `sortOrder` (query) *(Opcional)*: Sort order - <b>desc</b>ending (Z => A, New first) or <b>asc</b>ending (A => Z, Old first)
- `limit` (query) *(Opcional)*: 
- `offset` (query) *(Opcional)*: 

**Respostas:**
- **`200`**: 
---

### `GET` /api/contacts
**Descrição:** Get contact basic info

**Parâmetros:**
- `contactId` (query) *(Obrigatório)*: 
- `session` (query) *(Obrigatório)*: 

**Respostas:**
- **`200`**: 
---

### `GET` /api/contacts/check-exists
**Descrição:** Check phone number is registered in WhatsApp.

**Parâmetros:**
- `phone` (query) *(Obrigatório)*: The phone number to check
- `session` (query) *(Obrigatório)*: 

**Respostas:**
- **`200`**: 
  - **`chatId`** `string` (Ex: `Chat id for the phone number. Undefined if the number does not exist`)
  - **`numberExists`** `boolean`

---

### `GET` /api/contacts/about
**Descrição:** Gets the Contact's "about" info

**Parâmetros:**
- `contactId` (query) *(Obrigatório)*: 
- `session` (query) *(Obrigatório)*: 

**Respostas:**
- **`200`**: 
---

### `GET` /api/contacts/profile-picture
**Descrição:** Get contact's profile picture URL

**Parâmetros:**
- `contactId` (query) *(Obrigatório)*: 
- `refresh` (query) *(Opcional)*: Refresh the picture from the server (24h cache by default). Do not refresh if not needed, you can get rate limit error
- `session` (query) *(Obrigatório)*: 

**Respostas:**
- **`200`**: 
---

### `POST` /api/contacts/block
**Descrição:** Block contact

**Corpo da Requisição (JSON):**
- **`contactId`** `string` (Ex: `11111111111@c.us`)
- **`session`** `string`


**Respostas:**
- **`201`**: 
---

### `POST` /api/contacts/unblock
**Descrição:** Unblock contact

**Corpo da Requisição (JSON):**
- **`contactId`** `string` (Ex: `11111111111@c.us`)
- **`session`** `string`


**Respostas:**
- **`201`**: 
---

### `GET` /api/{session}/contacts/{id}
**Descrição:** Get contact basic info

**Parâmetros:**
- `session` (path) *(Obrigatório)*: Session name
- `id` (path) *(Obrigatório)*: Contact ID

**Respostas:**
- **`200`**: 
---

### `PUT` /api/{session}/contacts/{chatId}
**Descrição:** Create or update contact

**Parâmetros:**
- `session` (path) *(Obrigatório)*: Session name
- `chatId` (path) *(Obrigatório)*: Chat ID

**Corpo da Requisição (JSON):**
- **`firstName`** `string` - Contact First Name (Ex: `John`)
- **`lastName`** `string` - Contact Last Name (Ex: `Doe`)


**Respostas:**
- **`200`**: 
  - **`success`** `boolean`

---

### `GET` /api/{session}/lids
**Descrição:** Get all known lids to phone number mapping

**Parâmetros:**
- `session` (path) *(Obrigatório)*: Session name
- `limit` (query) *(Opcional)*: 
- `offset` (query) *(Opcional)*: 

**Respostas:**
- **`200`**: 
---

### `GET` /api/{session}/lids/count
**Descrição:** Get the number of known lids

**Parâmetros:**
- `session` (path) *(Obrigatório)*: Session name

**Respostas:**
- **`200`**: 
  - **`count`** `number`

---

### `GET` /api/{session}/lids/{lid}
**Descrição:** Get phone number by lid

**Parâmetros:**
- `session` (path) *(Obrigatório)*: Session name
- `lid` (path) *(Obrigatório)*: 

**Respostas:**
- **`200`**: 
  - **`lid`** `string` - Linked ID for the user (Ex: `1111111@lid`)
  - **`pn`** `string` - Phone number (chat id) for the user (Ex: `3333333@c.us`)

---

### `GET` /api/{session}/lids/pn/{phoneNumber}
**Descrição:** Get lid by phone number (chat id)

**Parâmetros:**
- `session` (path) *(Obrigatório)*: Session name
- `phoneNumber` (path) *(Obrigatório)*: 

**Respostas:**
- **`200`**: 
  - **`lid`** `string` - Linked ID for the user (Ex: `1111111@lid`)
  - **`pn`** `string` - Phone number (chat id) for the user (Ex: `3333333@c.us`)

---

## 🏷️ Módulo: 👥 Groups
### `POST` /api/{session}/groups
**Descrição:** Create a new group.

**Parâmetros:**
- `session` (path) *(Obrigatório)*: Session name

**Corpo da Requisição (JSON):**
- **`name`** `string`
- **`participants`** `array`
  - Item properties:
    - **`id`** `string` (Ex: `123456789@c.us`)


**Respostas:**
- **`201`**: 
---

### `GET` /api/{session}/groups
**Descrição:** Get all groups.

**Parâmetros:**
- `session` (path) *(Obrigatório)*: Session name
- `sortBy` (query) *(Opcional)*: Sort by field
- `sortOrder` (query) *(Opcional)*: Sort order - <b>desc</b>ending (Z => A, New first) or <b>asc</b>ending (A => Z, Old first)
- `limit` (query) *(Opcional)*: 
- `offset` (query) *(Opcional)*: 
- `exclude` (query) *(Opcional)*: Exclude fields

**Respostas:**
- **`200`**: 
---

### `GET` /api/{session}/groups/join-info
**Descrição:** Get info about the group before joining.

**Parâmetros:**
- `session` (path) *(Obrigatório)*: Session name
- `code` (query) *(Obrigatório)*: Group code (123) or url (https://chat.whatsapp.com/123)

**Respostas:**
- **`200`**: 
---

### `POST` /api/{session}/groups/join
**Descrição:** Join group via code

**Parâmetros:**
- `session` (path) *(Obrigatório)*: Session name

**Corpo da Requisição (JSON):**
- **`code`** `string` - Group code (123) or url (https://chat.whatsapp.com/123) (Ex: `https://chat.whatsapp.com/1234567890abcdef`)


**Respostas:**
- **`200`**: 
  - **`id`** `string` - Group ID (Ex: `123@g.us`)

---

### `GET` /api/{session}/groups/count
**Descrição:** Get the number of groups.

**Parâmetros:**
- `session` (path) *(Obrigatório)*: Session name

**Respostas:**
- **`200`**: 
  - **`count`** `number`

---

### `POST` /api/{session}/groups/refresh
**Descrição:** Refresh groups from the server.

**Parâmetros:**
- `session` (path) *(Obrigatório)*: Session name

**Respostas:**
- **`200`**: 
---

### `GET` /api/{session}/groups/{id}
**Descrição:** Get the group.

**Parâmetros:**
- `session` (path) *(Obrigatório)*: Session name
- `id` (path) *(Obrigatório)*: Group ID

**Respostas:**
- **`200`**: 
---

### `DELETE` /api/{session}/groups/{id}
**Descrição:** Delete the group.

**Parâmetros:**
- `session` (path) *(Obrigatório)*: Session name
- `id` (path) *(Obrigatório)*: Group ID

**Respostas:**
- **`200`**: 
---

### `POST` /api/{session}/groups/{id}/leave
**Descrição:** Leave the group.

**Parâmetros:**
- `session` (path) *(Obrigatório)*: Session name
- `id` (path) *(Obrigatório)*: Group ID

**Respostas:**
- **`200`**: 
---

### `GET` /api/{session}/groups/{id}/picture
**Descrição:** Get group picture

**Parâmetros:**
- `session` (path) *(Obrigatório)*: Session name
- `id` (path) *(Obrigatório)*: Group ID
- `refresh` (query) *(Opcional)*: Refresh the picture from the server (24h cache by default). Do not refresh if not needed, you can get rate limit error

**Respostas:**
- **`200`**: 
  - **`url`** `string`

---

### `PUT` /api/{session}/groups/{id}/picture
**Descrição:** Set group picture

**Parâmetros:**
- `id` (path) *(Obrigatório)*: Group ID
- `session` (path) *(Obrigatório)*: Session name

**Corpo da Requisição (JSON):**
- **`file`** `any`


**Respostas:**
- **`200`**: 
  - **`success`** `boolean`

---

### `DELETE` /api/{session}/groups/{id}/picture
**Descrição:** Delete group picture

**Parâmetros:**
- `id` (path) *(Obrigatório)*: Group ID
- `session` (path) *(Obrigatório)*: Session name

**Respostas:**
- **`200`**: 
  - **`success`** `boolean`

---

### `PUT` /api/{session}/groups/{id}/description
**Descrição:** Updates the group description.

**Parâmetros:**
- `session` (path) *(Obrigatório)*: Session name
- `id` (path) *(Obrigatório)*: Group ID

**Corpo da Requisição (JSON):**
- **`description`** `string`


**Respostas:**
- **`200`**: 
---

### `PUT` /api/{session}/groups/{id}/subject
**Descrição:** Updates the group subject

**Parâmetros:**
- `session` (path) *(Obrigatório)*: Session name
- `id` (path) *(Obrigatório)*: Group ID

**Corpo da Requisição (JSON):**
- **`subject`** `string`


**Respostas:**
- **`200`**: 
---

### `PUT` /api/{session}/groups/{id}/settings/security/info-admin-only
**Descrição:** Updates the group "info admin only" settings.

**Parâmetros:**
- `session` (path) *(Obrigatório)*: Session name
- `id` (path) *(Obrigatório)*: Group ID

**Corpo da Requisição (JSON):**
- **`adminsOnly`** `boolean`


**Respostas:**
- **`200`**: 
---

### `GET` /api/{session}/groups/{id}/settings/security/info-admin-only
**Descrição:** Get the group's 'info admin only' settings.

**Parâmetros:**
- `session` (path) *(Obrigatório)*: Session name
- `id` (path) *(Obrigatório)*: Group ID

**Respostas:**
- **`200`**: 
  - **`adminsOnly`** `boolean`

---

### `PUT` /api/{session}/groups/{id}/settings/security/messages-admin-only
**Descrição:** Update settings - who can send messages

**Parâmetros:**
- `session` (path) *(Obrigatório)*: Session name
- `id` (path) *(Obrigatório)*: Group ID

**Corpo da Requisição (JSON):**
- **`adminsOnly`** `boolean`


**Respostas:**
- **`200`**: 
---

### `GET` /api/{session}/groups/{id}/settings/security/messages-admin-only
**Descrição:** Get settings - who can send messages

**Parâmetros:**
- `session` (path) *(Obrigatório)*: Session name
- `id` (path) *(Obrigatório)*: Group ID

**Respostas:**
- **`200`**: 
  - **`adminsOnly`** `boolean`

---

### `GET` /api/{session}/groups/{id}/invite-code
**Descrição:** Gets the invite code for the group.

**Parâmetros:**
- `session` (path) *(Obrigatório)*: Session name
- `id` (path) *(Obrigatório)*: Group ID

**Respostas:**
- **`200`**: 
---

### `POST` /api/{session}/groups/{id}/invite-code/revoke
**Descrição:** Invalidates the current group invite code and generates a new one.

**Parâmetros:**
- `session` (path) *(Obrigatório)*: Session name
- `id` (path) *(Obrigatório)*: Group ID

**Respostas:**
- **`200`**: 
---

### `GET` /api/{session}/groups/{id}/participants
**Descrição:** Get participants

**Parâmetros:**
- `session` (path) *(Obrigatório)*: Session name
- `id` (path) *(Obrigatório)*: Group ID

**Respostas:**
- **`200`**: 
---

### `GET` /api/{session}/groups/{id}/participants/v2
**Descrição:** Get group participants.

**Parâmetros:**
- `session` (path) *(Obrigatório)*: Session name
- `id` (path) *(Obrigatório)*: Group ID

**Respostas:**
- **`200`**: 
---

### `POST` /api/{session}/groups/{id}/participants/add
**Descrição:** Add participants

**Parâmetros:**
- `session` (path) *(Obrigatório)*: Session name
- `id` (path) *(Obrigatório)*: Group ID

**Corpo da Requisição (JSON):**
- **`participants`** `array`
  - Item properties:
    - **`id`** `string` (Ex: `123456789@c.us`)


**Respostas:**
- **`200`**: 
---

### `POST` /api/{session}/groups/{id}/participants/remove
**Descrição:** Remove participants

**Parâmetros:**
- `session` (path) *(Obrigatório)*: Session name
- `id` (path) *(Obrigatório)*: Group ID

**Corpo da Requisição (JSON):**
- **`participants`** `array`
  - Item properties:
    - **`id`** `string` (Ex: `123456789@c.us`)


**Respostas:**
- **`200`**: 
---

### `POST` /api/{session}/groups/{id}/admin/promote
**Descrição:** Promote participants to admin users.

**Parâmetros:**
- `session` (path) *(Obrigatório)*: Session name
- `id` (path) *(Obrigatório)*: Group ID

**Corpo da Requisição (JSON):**
- **`participants`** `array`
  - Item properties:
    - **`id`** `string` (Ex: `123456789@c.us`)


**Respostas:**
- **`200`**: 
---

### `POST` /api/{session}/groups/{id}/admin/demote
**Descrição:** Demotes participants to regular users.

**Parâmetros:**
- `session` (path) *(Obrigatório)*: Session name
- `id` (path) *(Obrigatório)*: Group ID

**Corpo da Requisição (JSON):**
- **`participants`** `array`
  - Item properties:
    - **`id`** `string` (Ex: `123456789@c.us`)


**Respostas:**
- **`200`**: 
---

## 🏷️ Módulo: 💬 Chats
### `GET` /api/{session}/chats
**Descrição:** Get chats

**Parâmetros:**
- `session` (path) *(Obrigatório)*: Session name
- `sortBy` (query) *(Opcional)*: Sort by field
- `sortOrder` (query) *(Opcional)*: Sort order - <b>desc</b>ending (Z => A, New first) or <b>asc</b>ending (A => Z, Old first)
- `merge` (query) *(Opcional)*: Merge LID (@lid) and phone-number (@c.us) chats referencing the same contact
- `limit` (query) *(Opcional)*: 
- `offset` (query) *(Opcional)*: 

**Respostas:**
- **`200`**: 
---

### `GET` /api/{session}/chats/overview
**Descrição:** Get chats overview. Includes all necessary things to build UI "your chats overview" page - chat id, name, picture, last message. Sorting by last message timestamp

**Parâmetros:**
- `session` (path) *(Obrigatório)*: Session name
- `merge` (query) *(Opcional)*: Merge LID (@lid) and phone-number (@c.us) chats referencing the same contact
- `limit` (query) *(Opcional)*: 
- `offset` (query) *(Opcional)*: 
- `ids` (query) *(Opcional)*: Filter by chat ids

**Respostas:**
- **`200`**: 
---

### `POST` /api/{session}/chats/overview
**Descrição:** Get chats overview. Use POST if you have too many "ids" params - GET can limit it

**Parâmetros:**
- `session` (path) *(Obrigatório)*: Session name

**Corpo da Requisição (JSON):**
- **`pagination`** `object`
  - **`merge`** `boolean` - Merge LID (@lid) and phone-number (@c.us) chats referencing the same contact (Ex: `True`)
  - **`limit`** `number`
  - **`offset`** `number`
- **`filter`** `object`
  - **`ids`** `array` - Filter by chat ids (Ex: `['111111111@c.us']`)


**Respostas:**
- **`201`**: 
---

### `DELETE` /api/{session}/chats/{chatId}
**Descrição:** Deletes the chat

**Parâmetros:**
- `session` (path) *(Obrigatório)*: Session name
- `chatId` (path) *(Obrigatório)*: Chat ID

**Respostas:**
- **`200`**: 
---

### `GET` /api/{session}/chats/{chatId}/picture
**Descrição:** Gets chat picture

**Parâmetros:**
- `session` (path) *(Obrigatório)*: Session name
- `chatId` (path) *(Obrigatório)*: 
- `refresh` (query) *(Opcional)*: Refresh the picture from the server (24h cache by default). Do not refresh if not needed, you can get rate limit error

**Respostas:**
- **`200`**: 
  - **`url`** `string`

---

### `GET` /api/{session}/chats/{chatId}/messages
**Descrição:** Gets messages in the chat

**Parâmetros:**
- `sortBy` (query) *(Opcional)*: Sort by field
- `sortOrder` (query) *(Opcional)*: Sort order - <b>desc</b>ending (Z => A, New first) or <b>asc</b>ending (A => Z, Old first)
- `downloadMedia` (query) *(Opcional)*: Download media for messages
- `merge` (query) *(Opcional)*: Merge LID (@lid) and phone-number (@c.us) chats referencing the same contact
- `limit` (query) *(Obrigatório)*: 
- `offset` (query) *(Opcional)*: 
- `filter.timestamp.lte` (query) *(Opcional)*: Filter messages before this timestamp (inclusive)
- `filter.timestamp.gte` (query) *(Opcional)*: Filter messages after this timestamp (inclusive)
- `filter.fromMe` (query) *(Opcional)*: From me filter (by default shows all messages)
- `filter.ack` (query) *(Opcional)*: Filter messages by acknowledgment status
- `session` (path) *(Obrigatório)*: Session name
- `chatId` (path) *(Obrigatório)*: Chat ID

**Respostas:**
- **`200`**: 
---

### `DELETE` /api/{session}/chats/{chatId}/messages
**Descrição:** Clears all messages from the chat

**Parâmetros:**
- `session` (path) *(Obrigatório)*: Session name
- `chatId` (path) *(Obrigatório)*: Chat ID

**Respostas:**
- **`200`**: 
---

### `POST` /api/{session}/chats/{chatId}/messages/read
**Descrição:** Read unread messages in the chat

**Parâmetros:**
- `messages` (query) *(Opcional)*: How much messages to read (latest first)
- `days` (query) *(Opcional)*: How much days to read (latest first)
- `session` (path) *(Obrigatório)*: Session name
- `chatId` (path) *(Obrigatório)*: Chat ID

**Respostas:**
- **`201`**: 
  - **`ids`** `array` - Messages IDs that have been read

---

### `GET` /api/{session}/chats/{chatId}/messages/{messageId}
**Descrição:** Gets message by id

**Parâmetros:**
- `downloadMedia` (query) *(Opcional)*: Download media for messages
- `merge` (query) *(Opcional)*: Merge LID (@lid) and phone-number (@c.us) chats referencing the same contact
- `session` (path) *(Obrigatório)*: Session name
- `chatId` (path) *(Obrigatório)*: Chat ID
- `messageId` (path) *(Obrigatório)*: 

**Respostas:**
- **`200`**: 
  - **`id`** `string` - Message ID (Ex: `false_11111111111@c.us_AAAAAAAAAAAAAAAAAAAA`)
  - **`timestamp`** `number` - Unix timestamp for when the message was created (Ex: `1666943582`)
  - **`from`** `string` - ID for the Chat that this message was sent to, except if the message was sent by the current user  (Ex: `11111111111@c.us`)
  - **`fromMe`** `boolean` - Indicates if the message was sent by the current user
  - **`source`** `string` - The device that sent the message - either API or APP. Available in events (webhooks/websockets) only and only "fromMe: true" messages. (Ex: `api`)
  - **`to`** `string` -  * ID for who this message is for. * If the message is sent by the current user, it will be the Chat to which the message is being sent. * If the message is sent by another user, it will be the ID for the current user.  (Ex: `11111111111@c.us`)
  - **`participant`** `string` - For groups - participant who sent the message
  - **`body`** `string` - Message content
  - **`hasMedia`** `boolean` - Indicates if the message has media available for download
  - **`media`** `any` - Media object for the message if any and downloaded
  - **`mediaUrl`** `string` - Use `media.url` instead! The URL for the media in the message if any (Ex: `http://localhost:3000/api/files/false_11111111111@c.us_AAAAAAAAAAAAAAAAAAAA.oga`)
  - **`ack`** `number` - ACK status for the message
  - **`ackName`** `string` - ACK status name for the message
  - **`author`** `string` - If the message was sent to a group, this field will contain the user that sent the message.
  - **`location`** `any` - Location information contained in the message, if the message is type "location"
  - **`vCards`** `array` - List of vCards contained in the message.
  - **`_data`** `object` - Message in a raw format that we get from WhatsApp. May be changed anytime, use it with caution! It depends a lot on the underlying backend.
  - **`replyTo`** `object`
    - **`id`** `string` - Message ID (Ex: `AAAAAAAAAAAAAAAAAAAA`)
    - **`participant`** `string` (Ex: `11111111111@c.us`)
    - **`body`** `string` (Ex: `Hello!`)
    - **`hasMedia`** `boolean` - Indicates if the message has media available for download
    - **`media`** `any` - Media object for the message if any and downloaded
    - **`_data`** `object` - Raw data from reply's message

---

### `DELETE` /api/{session}/chats/{chatId}/messages/{messageId}
**Descrição:** Deletes a message from the chat

**Parâmetros:**
- `session` (path) *(Obrigatório)*: Session name
- `chatId` (path) *(Obrigatório)*: Chat ID
- `messageId` (path) *(Obrigatório)*: Message ID in format <code>{fromMe}_{chat}_{message_id}[_{participant}]</code>

**Respostas:**
- **`200`**: 
---

### `PUT` /api/{session}/chats/{chatId}/messages/{messageId}
**Descrição:** Edits a message in the chat

**Parâmetros:**
- `session` (path) *(Obrigatório)*: Session name
- `chatId` (path) *(Obrigatório)*: Chat ID
- `messageId` (path) *(Obrigatório)*: Message ID in format <code>{fromMe}_{chat}_{message_id}[_{participant}]</code>

**Corpo da Requisição (JSON):**
- **`text`** `string`
- **`linkPreview`** `boolean`
- **`linkPreviewHighQuality`** `boolean`


**Respostas:**
- **`200`**: 
---

### `POST` /api/{session}/chats/{chatId}/messages/{messageId}/pin
**Descrição:** Pins a message in the chat

**Parâmetros:**
- `session` (path) *(Obrigatório)*: Session name
- `chatId` (path) *(Obrigatório)*: Chat ID
- `messageId` (path) *(Obrigatório)*: 

**Corpo da Requisição (JSON):**
- **`duration`** `number` - Duration in seconds. 24 hours (86400), 7 days (604800), 30 days (2592000) (Ex: `86400`)


**Respostas:**
- **`201`**: 
---

### `POST` /api/{session}/chats/{chatId}/messages/{messageId}/unpin
**Descrição:** Unpins a message in the chat

**Parâmetros:**
- `session` (path) *(Obrigatório)*: Session name
- `chatId` (path) *(Obrigatório)*: Chat ID
- `messageId` (path) *(Obrigatório)*: 

**Respostas:**
- **`201`**: 
---

### `POST` /api/{session}/chats/{chatId}/archive
**Descrição:** Archive the chat

**Parâmetros:**
- `session` (path) *(Obrigatório)*: Session name
- `chatId` (path) *(Obrigatório)*: Chat ID

**Respostas:**
- **`201`**: 
---

### `POST` /api/{session}/chats/{chatId}/unarchive
**Descrição:** Unarchive the chat

**Parâmetros:**
- `session` (path) *(Obrigatório)*: Session name
- `chatId` (path) *(Obrigatório)*: Chat ID

**Respostas:**
- **`201`**: 
---

### `POST` /api/{session}/chats/{chatId}/unread
**Descrição:** Unread the chat

**Parâmetros:**
- `session` (path) *(Obrigatório)*: Session name
- `chatId` (path) *(Obrigatório)*: Chat ID

**Respostas:**
- **`201`**: 
---

## 🏷️ Módulo: 📅 Events
### `POST` /api/{session}/events
**Descrição:** Send an event message

**Parâmetros:**
- `session` (path) *(Obrigatório)*: Session name

**Corpo da Requisição (JSON):**
- **`chatId`** `string` (Ex: `11111111111@c.us`)
- **`reply_to`** `string` - The ID of the message to reply to - false_11111111111@c.us_AAAAAAAAAAAAAAAAAAAA
- **`event`** `object`
  - **`name`** `string` - Name of the event (Ex: `John's Nail Appointment 💅`)
  - **`description`** `string` - Description of the event (Ex: `It's time for your nail care session! 🌟\n\nYou'll be getting a *classic gel manicure* – clean, polished, and long-lasting. 💖\n\n📍 *Location:* Luxe Nail Studio\nWe're on the *2nd floor of the Plaza Mall*, next to the flower shop. Look for the *pink neon sign*!\n\nFeel free to arrive *5–10 mins early* so we can get started on time 😊`)
  - **`startTime`** `number` - Start time of the event (Unix timestamp in seconds) (Ex: `2063137000`)
  - **`endTime`** `number` - End time of the event (Unix timestamp in seconds)
  - **`location`** `any` - Location of the event
  - **`extraGuestsAllowed`** `boolean` - Whether extra guests are allowed


**Respostas:**
- **`201`**: 
  - **`id`** `string` - Message ID (Ex: `false_11111111111@c.us_AAAAAAAAAAAAAAAAAAAA`)
  - **`timestamp`** `number` - Unix timestamp for when the message was created (Ex: `1666943582`)
  - **`from`** `string` - ID for the Chat that this message was sent to, except if the message was sent by the current user  (Ex: `11111111111@c.us`)
  - **`fromMe`** `boolean` - Indicates if the message was sent by the current user
  - **`source`** `string` - The device that sent the message - either API or APP. Available in events (webhooks/websockets) only and only "fromMe: true" messages. (Ex: `api`)
  - **`to`** `string` -  * ID for who this message is for. * If the message is sent by the current user, it will be the Chat to which the message is being sent. * If the message is sent by another user, it will be the ID for the current user.  (Ex: `11111111111@c.us`)
  - **`participant`** `string` - For groups - participant who sent the message
  - **`body`** `string` - Message content
  - **`hasMedia`** `boolean` - Indicates if the message has media available for download
  - **`media`** `any` - Media object for the message if any and downloaded
  - **`mediaUrl`** `string` - Use `media.url` instead! The URL for the media in the message if any (Ex: `http://localhost:3000/api/files/false_11111111111@c.us_AAAAAAAAAAAAAAAAAAAA.oga`)
  - **`ack`** `number` - ACK status for the message
  - **`ackName`** `string` - ACK status name for the message
  - **`author`** `string` - If the message was sent to a group, this field will contain the user that sent the message.
  - **`location`** `any` - Location information contained in the message, if the message is type "location"
  - **`vCards`** `array` - List of vCards contained in the message.
  - **`_data`** `object` - Message in a raw format that we get from WhatsApp. May be changed anytime, use it with caution! It depends a lot on the underlying backend.
  - **`replyTo`** `object`
    - **`id`** `string` - Message ID (Ex: `AAAAAAAAAAAAAAAAAAAA`)
    - **`participant`** `string` (Ex: `11111111111@c.us`)
    - **`body`** `string` (Ex: `Hello!`)
    - **`hasMedia`** `boolean` - Indicates if the message has media available for download
    - **`media`** `any` - Media object for the message if any and downloaded
    - **`_data`** `object` - Raw data from reply's message

---

## 🏷️ Módulo: 📞 Calls
### `POST` /api/{session}/calls/reject
**Descrição:** Reject incoming call

**Parâmetros:**
- `session` (path) *(Obrigatório)*: Session name

**Corpo da Requisição (JSON):**
- **`from`** `string` (Ex: `11111111111@c.us`)
- **`id`** `string` - Call ID (Ex: `ABCDEFGABCDEFGABCDEFGABCDEFG`)


**Respostas:**
- **`201`**: 
---

## 🏷️ Módulo: 📢 Channels
### `GET` /api/{session}/channels
**Descrição:** Get list of know channels

**Parâmetros:**
- `session` (path) *(Obrigatório)*: Session name
- `role` (query) *(Opcional)*: 

**Respostas:**
- **`200`**: 
---

### `POST` /api/{session}/channels
**Descrição:** Create a new channel.

**Parâmetros:**
- `session` (path) *(Obrigatório)*: Session name

**Corpo da Requisição (JSON):**
- **`name`** `string` (Ex: `Channel Name`)
- **`description`** `string` (Ex: `Channel Description`)
- **`picture`** `any`


**Respostas:**
- **`201`**: 
  - **`id`** `string` - Newsletter id (Ex: `123123123123@newsletter`)
  - **`name`** `string` - Channel name (Ex: `Channel Name`)
  - **`invite`** `string` - Invite link (Ex: `https://www.whatsapp.com/channel/111111111111111111111111`)
  - **`preview`** `string` - Preview for channel's picture (Ex: `https://mmg.whatsapp.net/m1/v/t24/An&_nc_cat=10`)
  - **`picture`** `string` - Channel's picture (Ex: `https://mmg.whatsapp.net/m1/v/t24/An&_nc_cat=10`)
  - **`role`** `string`
  - **`description`** `string`
  - **`verified`** `boolean`
  - **`subscribersCount`** `number`

---

### `DELETE` /api/{session}/channels/{id}
**Descrição:** Delete the channel.

**Parâmetros:**
- `session` (path) *(Obrigatório)*: Session name
- `id` (path) *(Obrigatório)*: WhatsApp Channel ID

**Respostas:**
- **`200`**: 
---

### `GET` /api/{session}/channels/{id}
**Descrição:** Get the channel info

**Parâmetros:**
- `session` (path) *(Obrigatório)*: Session name
- `id` (path) *(Obrigatório)*: WhatsApp Channel ID or invite code from invite link https://www.whatsapp.com/channel/11111

**Respostas:**
- **`200`**: 
  - **`id`** `string` - Newsletter id (Ex: `123123123123@newsletter`)
  - **`name`** `string` - Channel name (Ex: `Channel Name`)
  - **`invite`** `string` - Invite link (Ex: `https://www.whatsapp.com/channel/111111111111111111111111`)
  - **`preview`** `string` - Preview for channel's picture (Ex: `https://mmg.whatsapp.net/m1/v/t24/An&_nc_cat=10`)
  - **`picture`** `string` - Channel's picture (Ex: `https://mmg.whatsapp.net/m1/v/t24/An&_nc_cat=10`)
  - **`role`** `string`
  - **`description`** `string`
  - **`verified`** `boolean`
  - **`subscribersCount`** `number`

---

### `GET` /api/{session}/channels/{id}/messages/preview
**Descrição:** Preview channel messages

**Parâmetros:**
- `session` (path) *(Obrigatório)*: Session name
- `id` (path) *(Obrigatório)*: Channel id or invite code
- `downloadMedia` (query) *(Obrigatório)*: 
- `limit` (query) *(Obrigatório)*: 

**Respostas:**
- **`200`**: 
---

### `POST` /api/{session}/channels/{id}/follow
**Descrição:** Follow the channel.

**Parâmetros:**
- `session` (path) *(Obrigatório)*: Session name
- `id` (path) *(Obrigatório)*: WhatsApp Channel ID

**Respostas:**
- **`201`**: 
---

### `POST` /api/{session}/channels/{id}/unfollow
**Descrição:** Unfollow the channel.

**Parâmetros:**
- `session` (path) *(Obrigatório)*: Session name
- `id` (path) *(Obrigatório)*: WhatsApp Channel ID

**Respostas:**
- **`201`**: 
---

### `POST` /api/{session}/channels/{id}/mute
**Descrição:** Mute the channel.

**Parâmetros:**
- `session` (path) *(Obrigatório)*: Session name
- `id` (path) *(Obrigatório)*: WhatsApp Channel ID

**Respostas:**
- **`201`**: 
---

### `POST` /api/{session}/channels/{id}/unmute
**Descrição:** Unmute the channel.

**Parâmetros:**
- `session` (path) *(Obrigatório)*: Session name
- `id` (path) *(Obrigatório)*: WhatsApp Channel ID

**Respostas:**
- **`201`**: 
---

### `POST` /api/{session}/channels/search/by-view
**Descrição:** Search for channels (by view)

**Parâmetros:**
- `session` (path) *(Obrigatório)*: Session name

**Corpo da Requisição (JSON):**
- **`view`** `string`
- **`countries`** `array`
- **`categories`** `array`
- **`limit`** `number`
- **`startCursor`** `string`


**Respostas:**
- **`200`**: 
  - **`page`** `object`
    - **`startCursor`** `string`
    - **`endCursor`** `string`
    - **`hasNextPage`** `boolean`
    - **`hasPreviousPage`** `boolean`
  - **`channels`** `array`
    - Item properties:
      - **`id`** `string` - Newsletter id (Ex: `123123123123@newsletter`)
      - **`name`** `string` - Channel name (Ex: `Channel Name`)
      - **`invite`** `string` - Invite link (Ex: `https://www.whatsapp.com/channel/111111111111111111111111`)
      - **`preview`** `string` - Preview for channel's picture (Ex: `https://mmg.whatsapp.net/m1/v/t24/An&_nc_cat=10`)
      - **`picture`** `string` - Channel's picture (Ex: `https://mmg.whatsapp.net/m1/v/t24/An&_nc_cat=10`)
      - **`description`** `string`
      - **`verified`** `boolean`
      - **`subscribersCount`** `number`

---

### `POST` /api/{session}/channels/search/by-text
**Descrição:** Search for channels (by text)

**Parâmetros:**
- `session` (path) *(Obrigatório)*: Session name

**Corpo da Requisição (JSON):**
- **`text`** `string`
- **`categories`** `array`
- **`limit`** `number`
- **`startCursor`** `string`


**Respostas:**
- **`200`**: 
  - **`page`** `object`
    - **`startCursor`** `string`
    - **`endCursor`** `string`
    - **`hasNextPage`** `boolean`
    - **`hasPreviousPage`** `boolean`
  - **`channels`** `array`
    - Item properties:
      - **`id`** `string` - Newsletter id (Ex: `123123123123@newsletter`)
      - **`name`** `string` - Channel name (Ex: `Channel Name`)
      - **`invite`** `string` - Invite link (Ex: `https://www.whatsapp.com/channel/111111111111111111111111`)
      - **`preview`** `string` - Preview for channel's picture (Ex: `https://mmg.whatsapp.net/m1/v/t24/An&_nc_cat=10`)
      - **`picture`** `string` - Channel's picture (Ex: `https://mmg.whatsapp.net/m1/v/t24/An&_nc_cat=10`)
      - **`description`** `string`
      - **`verified`** `boolean`
      - **`subscribersCount`** `number`

---

### `GET` /api/{session}/channels/search/views
**Descrição:** Get list of views for channel search

**Parâmetros:**
- `session` (path) *(Obrigatório)*: Session name

**Respostas:**
- **`200`**: 
---

### `GET` /api/{session}/channels/search/countries
**Descrição:** Get list of countries for channel search

**Parâmetros:**
- `session` (path) *(Obrigatório)*: Session name

**Respostas:**
- **`200`**: 
---

### `GET` /api/{session}/channels/search/categories
**Descrição:** Get list of categories for channel search

**Parâmetros:**
- `session` (path) *(Obrigatório)*: Session name

**Respostas:**
- **`200`**: 
---

## 🏷️ Módulo: 📤 Chatting
### `POST` /api/sendText
**Descrição:** Send a text message

**Corpo da Requisição (JSON):**
- **`chatId`** `string` (Ex: `11111111111@c.us`)
- **`id`** `string` - Pre-generated message id (Ex: `BBBBBBBBBBBBBBBBB`)
- **`reply_to`** `string` - The ID of the message to reply to - false_11111111111@c.us_AAAAAAAAAAAAAAAAAAAA
- **`text`** `string`
- **`linkPreview`** `boolean`
- **`linkPreviewHighQuality`** `boolean`
- **`session`** `string`


**Respostas:**
- **`201`**: 
  - **`id`** `string` - Message ID (Ex: `false_11111111111@c.us_AAAAAAAAAAAAAAAAAAAA`)
  - **`timestamp`** `number` - Unix timestamp for when the message was created (Ex: `1666943582`)
  - **`from`** `string` - ID for the Chat that this message was sent to, except if the message was sent by the current user  (Ex: `11111111111@c.us`)
  - **`fromMe`** `boolean` - Indicates if the message was sent by the current user
  - **`source`** `string` - The device that sent the message - either API or APP. Available in events (webhooks/websockets) only and only "fromMe: true" messages. (Ex: `api`)
  - **`to`** `string` -  * ID for who this message is for. * If the message is sent by the current user, it will be the Chat to which the message is being sent. * If the message is sent by another user, it will be the ID for the current user.  (Ex: `11111111111@c.us`)
  - **`participant`** `string` - For groups - participant who sent the message
  - **`body`** `string` - Message content
  - **`hasMedia`** `boolean` - Indicates if the message has media available for download
  - **`media`** `any` - Media object for the message if any and downloaded
  - **`mediaUrl`** `string` - Use `media.url` instead! The URL for the media in the message if any (Ex: `http://localhost:3000/api/files/false_11111111111@c.us_AAAAAAAAAAAAAAAAAAAA.oga`)
  - **`ack`** `number` - ACK status for the message
  - **`ackName`** `string` - ACK status name for the message
  - **`author`** `string` - If the message was sent to a group, this field will contain the user that sent the message.
  - **`location`** `any` - Location information contained in the message, if the message is type "location"
  - **`vCards`** `array` - List of vCards contained in the message.
  - **`_data`** `object` - Message in a raw format that we get from WhatsApp. May be changed anytime, use it with caution! It depends a lot on the underlying backend.
  - **`replyTo`** `object`
    - **`id`** `string` - Message ID (Ex: `AAAAAAAAAAAAAAAAAAAA`)
    - **`participant`** `string` (Ex: `11111111111@c.us`)
    - **`body`** `string` (Ex: `Hello!`)
    - **`hasMedia`** `boolean` - Indicates if the message has media available for download
    - **`media`** `any` - Media object for the message if any and downloaded
    - **`_data`** `object` - Raw data from reply's message

---

### `GET` /api/sendText
**Descrição:** Send a text message

**Parâmetros:**
- `phone` (query) *(Obrigatório)*: 
- `text` (query) *(Obrigatório)*: 
- `session` (query) *(Obrigatório)*: 

**Respostas:**
- **`200`**: 
---

### `POST` /api/sendImage
**Descrição:** Send an image

**Corpo da Requisição (JSON):**
- **`chatId`** `string` (Ex: `11111111111@c.us`)
- **`file`** `any`
- **`reply_to`** `string` - The ID of the message to reply to - false_11111111111@c.us_AAAAAAAAAAAAAAAAAAAA
- **`caption`** `string`
- **`session`** `string`


**Respostas:**
- **`201`**: 
---

### `POST` /api/sendFile
**Descrição:** Send a file

**Corpo da Requisição (JSON):**
- **`chatId`** `string` (Ex: `11111111111@c.us`)
- **`file`** `any`
- **`reply_to`** `string` - The ID of the message to reply to - false_11111111111@c.us_AAAAAAAAAAAAAAAAAAAA
- **`caption`** `string`
- **`session`** `string`


**Respostas:**
- **`201`**: 
---

### `POST` /api/sendVoice
**Descrição:** Send an voice message

**Corpo da Requisição (JSON):**
- **`chatId`** `string` (Ex: `11111111111@c.us`)
- **`file`** `any`
- **`reply_to`** `string` - The ID of the message to reply to - false_11111111111@c.us_AAAAAAAAAAAAAAAAAAAA
- **`convert`** `boolean` - Convert the input file to the required format using ffmpeg before sending (Ex: `True`)
- **`session`** `string`


**Respostas:**
- **`201`**: 
---

### `POST` /api/sendVideo
**Descrição:** Send a video

**Corpo da Requisição (JSON):**
- **`chatId`** `string` (Ex: `11111111111@c.us`)
- **`file`** `any`
- **`reply_to`** `string` - The ID of the message to reply to - false_11111111111@c.us_AAAAAAAAAAAAAAAAAAAA
- **`asNote`** `boolean` - Send as video note (aka instant or round video).
- **`convert`** `boolean` - Convert the input file to the required format using ffmpeg before sending (Ex: `True`)
- **`caption`** `string`
- **`session`** `string`


**Respostas:**
- **`201`**: 
---

### `POST` /api/send/link-custom-preview
**Descrição:** Send a text message with a CUSTOM link preview.

**Corpo da Requisição (JSON):**
- **`chatId`** `string` (Ex: `11111111111@c.us`)
- **`text`** `string` - The text to send. MUST include the URL provided in preview.url
- **`reply_to`** `string` - The ID of the message to reply to - false_11111111111@c.us_AAAAAAAAAAAAAAAAAAAA
- **`linkPreviewHighQuality`** `boolean`
- **`preview`** `object`
  - **`image`** `any` (Ex: `{'url': 'https://picsum.photos/1024'}`)
  - **`url`** `string`
  - **`title`** `string`
  - **`description`** `string`
- **`session`** `string`


**Respostas:**
- **`201`**: 
---

### `POST` /api/sendButtons
**Descrição:** Send buttons message (interactive)

**Corpo da Requisição (JSON):**
- **`chatId`** `string` (Ex: `11111111111@c.us`)
- **`header`** `string` (Ex: `How are you?`)
- **`headerImage`** `any`
- **`body`** `string` (Ex: `Tell us how are you please 🙏`)
- **`footer`** `string` (Ex: `If you have any questions, please send it in the chat`)
- **`buttons`** `array` (Ex: `[{'type': 'reply', 'text': 'I am good!'}, {'type': 'call', 'text': 'Call us', 'phoneNumber': '+1234567890'}, {'type': 'copy', 'text': 'Copy code', 'copyCode': '4321'}, {'type': 'url', 'text': 'How did you do that?', 'url': 'https://waha.devlike.pro'}]`)
  - Item properties:
    - **`text`** `string` (Ex: `Button Text`)
    - **`id`** `string` (Ex: `321321`)
    - **`url`** `string` (Ex: `https://example.com`)
    - **`phoneNumber`** `string` (Ex: `+1234567890`)
    - **`copyCode`** `string` (Ex: `4321`)
    - **`type`** `string`
- **`session`** `string`


**Respostas:**
- **`201`**: 
---

### `POST` /api/sendList
**Descrição:** Send a list message (interactive)

**Corpo da Requisição (JSON):**
- **`chatId`** `string` (Ex: `11111111111@c.us`)
- **`message`** `any` (Ex: `{'title': 'Simple Menu', 'description': 'Please choose an option', 'footer': 'Thank you!', 'button': 'Choose', 'sections': [{'title': 'Main', 'rows': [{'title': 'Option 1', 'rowId': 'option1', 'description': None}, {'title': 'Option 2', 'rowId': 'option2', 'description': None}, {'title': 'Option 3', 'rowId': 'option3', 'description': None}]}]}`)
- **`reply_to`** `string` - The ID of the message to reply to - false_11111111111@c.us_AAAAAAAAAAAAAAAAAAAA
- **`session`** `string`


**Respostas:**
- **`201`**: 
---

### `POST` /api/forwardMessage
**Descrição:** 

**Corpo da Requisição (JSON):**
- **`chatId`** `string` (Ex: `11111111111@c.us`)
- **`id`** `string` - Pre-generated message id (Ex: `BBBBBBBBBBBBBBBBB`)
- **`messageId`** `string` (Ex: `false_11111111111@c.us_AAAAAAAAAAAAAAAAAAAA`)
- **`session`** `string`


**Respostas:**
- **`201`**: 
  - **`id`** `string` - Message ID (Ex: `false_11111111111@c.us_AAAAAAAAAAAAAAAAAAAA`)
  - **`timestamp`** `number` - Unix timestamp for when the message was created (Ex: `1666943582`)
  - **`from`** `string` - ID for the Chat that this message was sent to, except if the message was sent by the current user  (Ex: `11111111111@c.us`)
  - **`fromMe`** `boolean` - Indicates if the message was sent by the current user
  - **`source`** `string` - The device that sent the message - either API or APP. Available in events (webhooks/websockets) only and only "fromMe: true" messages. (Ex: `api`)
  - **`to`** `string` -  * ID for who this message is for. * If the message is sent by the current user, it will be the Chat to which the message is being sent. * If the message is sent by another user, it will be the ID for the current user.  (Ex: `11111111111@c.us`)
  - **`participant`** `string` - For groups - participant who sent the message
  - **`body`** `string` - Message content
  - **`hasMedia`** `boolean` - Indicates if the message has media available for download
  - **`media`** `any` - Media object for the message if any and downloaded
  - **`mediaUrl`** `string` - Use `media.url` instead! The URL for the media in the message if any (Ex: `http://localhost:3000/api/files/false_11111111111@c.us_AAAAAAAAAAAAAAAAAAAA.oga`)
  - **`ack`** `number` - ACK status for the message
  - **`ackName`** `string` - ACK status name for the message
  - **`author`** `string` - If the message was sent to a group, this field will contain the user that sent the message.
  - **`location`** `any` - Location information contained in the message, if the message is type "location"
  - **`vCards`** `array` - List of vCards contained in the message.
  - **`_data`** `object` - Message in a raw format that we get from WhatsApp. May be changed anytime, use it with caution! It depends a lot on the underlying backend.
  - **`replyTo`** `object`
    - **`id`** `string` - Message ID (Ex: `AAAAAAAAAAAAAAAAAAAA`)
    - **`participant`** `string` (Ex: `11111111111@c.us`)
    - **`body`** `string` (Ex: `Hello!`)
    - **`hasMedia`** `boolean` - Indicates if the message has media available for download
    - **`media`** `any` - Media object for the message if any and downloaded
    - **`_data`** `object` - Raw data from reply's message

---

### `POST` /api/sendSeen
**Descrição:** 

**Corpo da Requisição (JSON):**
- **`chatId`** `string` (Ex: `11111111111@c.us`)
- **`messageId`** `string`
- **`messageIds`** `array` (Ex: `['false_11111111111@c.us_AAAAAAAAAAAAAAAAAAAA']`)
- **`participant`** `string` - NOWEB engine only - the ID of the user that sent the message (undefined for individual chats) (Ex: `11111111111@c.us`)
- **`session`** `string`


**Respostas:**
- **`201`**: 
---

### `POST` /api/startTyping
**Descrição:** 

**Corpo da Requisição (JSON):**
- **`chatId`** `string` (Ex: `11111111111@c.us`)
- **`session`** `string`


**Respostas:**
- **`201`**: 
---

### `POST` /api/stopTyping
**Descrição:** 

**Corpo da Requisição (JSON):**
- **`chatId`** `string` (Ex: `11111111111@c.us`)
- **`session`** `string`


**Respostas:**
- **`201`**: 
---

### `PUT` /api/reaction
**Descrição:** React to a message with an emoji

**Corpo da Requisição (JSON):**
- **`messageId`** `string` (Ex: `false_11111111111@c.us_AAAAAAAAAAAAAAAAAAAA`)
- **`reaction`** `string` - Emoji to react with. Send an empty string to remove the reaction (Ex: `👍`)
- **`session`** `string`


**Respostas:**
- **`200`**: 
---

### `PUT` /api/star
**Descrição:** Star or unstar a message

**Corpo da Requisição (JSON):**
- **`messageId`** `string` (Ex: `false_11111111111@c.us_AAAAAAAAAAAAAAAAAAAA`)
- **`chatId`** `string` (Ex: `11111111111@c.us`)
- **`star`** `boolean`
- **`session`** `string`


**Respostas:**
- **`200`**: 
---

### `POST` /api/sendPoll
**Descrição:** Send a poll with options

**Corpo da Requisição (JSON):**
- **`chatId`** `string` (Ex: `11111111111@c.us`)
- **`id`** `string` - Pre-generated message id (Ex: `BBBBBBBBBBBBBBBBB`)
- **`reply_to`** `string` - The ID of the message to reply to - false_11111111111@c.us_AAAAAAAAAAAAAAAAAAAA
- **`poll`** `object`
  - **`name`** `string` (Ex: `How are you?`)
  - **`options`** `array` (Ex: `['Awesome!', 'Good!', 'Not bad!']`)
  - **`multipleAnswers`** `object`
- **`session`** `string`


**Respostas:**
- **`201`**: 
---

### `POST` /api/sendPollVote
**Descrição:** Vote on a poll

**Corpo da Requisição (JSON):**
- **`chatId`** `string` (Ex: `11111111111@c.us`)
- **`pollMessageId`** `string` - The ID of the poll message. Format: {fromMe}_{chatID}_{messageId}[_{participant}] or just ID for GOWS (Ex: `false_11111111111@c.us_AAAAAAAAAAAAAAAAAAAA`)
- **`pollServerId`** `number` - Only for Channels - server message id (if known); if omitted, API may look it up in the storage
- **`votes`** `array`
- **`session`** `string`


**Respostas:**
- **`201`**: 
---

### `POST` /api/sendLocation
**Descrição:** 

**Corpo da Requisição (JSON):**
- **`chatId`** `string` (Ex: `11111111111@c.us`)
- **`id`** `string` - Pre-generated message id (Ex: `BBBBBBBBBBBBBBBBB`)
- **`latitude`** `number` (Ex: `38.8937255`)
- **`longitude`** `number` (Ex: `-77.0969763`)
- **`title`** `string` (Ex: `Our office`)
- **`reply_to`** `string` - The ID of the message to reply to - false_11111111111@c.us_AAAAAAAAAAAAAAAAAAAA
- **`session`** `string`


**Respostas:**
- **`201`**: 
---

### `POST` /api/sendContactVcard
**Descrição:** 

**Corpo da Requisição (JSON):**
- **`chatId`** `string` (Ex: `11111111111@c.us`)
- **`id`** `string` - Pre-generated message id (Ex: `BBBBBBBBBBBBBBBBB`)
- **`contacts`** `array`
- **`reply_to`** `string` - The ID of the message to reply to - false_11111111111@c.us_AAAAAAAAAAAAAAAAAAAA
- **`session`** `string`


**Respostas:**
- **`201`**: 
---

### `POST` /api/send/buttons/reply
**Descrição:** Reply on a button message

**Corpo da Requisição (JSON):**
- **`chatId`** `string` (Ex: `11111111111@c.us`)
- **`replyTo`** `string` - The ID of the message to reply to - false_11111111111@c.us_AAAAAAAAAAAAAAAAAAAA
- **`selectedDisplayText`** `string`
- **`selectedButtonID`** `string`
- **`session`** `string`


**Respostas:**
- **`201`**: 
---

### `GET` /api/messages
**Descrição:** Get messages in a chat

**Parâmetros:**
- `sortBy` (query) *(Opcional)*: Sort by field
- `sortOrder` (query) *(Opcional)*: Sort order - <b>desc</b>ending (Z => A, New first) or <b>asc</b>ending (A => Z, Old first)
- `downloadMedia` (query) *(Opcional)*: Download media for messages
- `merge` (query) *(Opcional)*: Merge LID (@lid) and phone-number (@c.us) chats referencing the same contact
- `chatId` (query) *(Obrigatório)*: 
- `session` (query) *(Obrigatório)*: 
- `limit` (query) *(Obrigatório)*: 
- `offset` (query) *(Opcional)*: 
- `filter.timestamp.lte` (query) *(Opcional)*: Filter messages before this timestamp (inclusive)
- `filter.timestamp.gte` (query) *(Opcional)*: Filter messages after this timestamp (inclusive)
- `filter.fromMe` (query) *(Opcional)*: From me filter (by default shows all messages)
- `filter.ack` (query) *(Opcional)*: Filter messages by acknowledgment status

**Respostas:**
- **`200`**: 
---

### `GET` /api/checkNumberStatus
**Descrição:** Check number status

**Parâmetros:**
- `phone` (query) *(Obrigatório)*: The phone number to check
- `session` (query) *(Obrigatório)*: 

**Respostas:**
- **`200`**: 
  - **`chatId`** `string` (Ex: `Chat id for the phone number. Undefined if the number does not exist`)
  - **`numberExists`** `boolean`

---

### `POST` /api/reply
**Descrição:** DEPRECATED - you can set "reply_to" field when sending text, image, etc

**Corpo da Requisição (JSON):**
- **`chatId`** `string` (Ex: `11111111111@c.us`)
- **`id`** `string` - Pre-generated message id (Ex: `BBBBBBBBBBBBBBBBB`)
- **`reply_to`** `string` - The ID of the message to reply to - false_11111111111@c.us_AAAAAAAAAAAAAAAAAAAA
- **`text`** `string`
- **`linkPreview`** `boolean`
- **`linkPreviewHighQuality`** `boolean`
- **`session`** `string`


**Respostas:**
- **`201`**: 
---

### `POST` /api/sendLinkPreview
**Descrição:** 

**Corpo da Requisição (JSON):**
- **`chatId`** `string` (Ex: `11111111111@c.us`)
- **`id`** `string` - Pre-generated message id (Ex: `BBBBBBBBBBBBBBBBB`)
- **`url`** `string`
- **`title`** `string`
- **`session`** `string`


**Respostas:**
- **`201`**: 
---

### `GET` /api/{session}/new-message-id
**Descrição:** Generate a new message ID

**Parâmetros:**
- `session` (path) *(Obrigatório)*: Session name

**Respostas:**
- **`200`**: 
  - **`id`** `string` - Pre-generated message id (Ex: `BBBBBBBBBBBBBBBBB`)

---

## 🏷️ Módulo: 📱 Pairing
### `GET` /api/{session}/auth/qr
**Descrição:** Get QR code for pairing WhatsApp API.

**Parâmetros:**
- `session` (path) *(Obrigatório)*: Session name
- `format` (query) *(Obrigatório)*: 

**Respostas:**
- **`200`**: 
---

### `POST` /api/{session}/auth/request-code
**Descrição:** Request authentication code.

**Parâmetros:**
- `session` (path) *(Obrigatório)*: Session name

**Corpo da Requisição (JSON):**
- **`phoneNumber`** `string` - Mobile phone number in international format (Ex: `12132132130`)
- **`method`** `string` - How would you like to receive the one time code for registration? |sms|voice. Leave empty for Web pairing.


**Respostas:**
- **`201`**: 
---

### `GET` /api/{session}/auth/passkey/challenge
**Descrição:** Get the pending passkey (WebAuthn) challenge.

**Parâmetros:**
- `session` (path) *(Obrigatório)*: Session name

**Respostas:**
- **`200`**: 
  - **`challenge`** `string` - Base64url-encoded challenge to sign.
  - **`timeout`** `number` - How long the challenge is valid for, in milliseconds. (Ex: `60000`)
  - **`rpId`** `string` - Relying party ID. (Ex: `web.whatsapp.com`)
  - **`allowCredentials`** `array`
    - Item properties:
      - **`id`** `string` - Base64url-encoded credential ID.
      - **`type`** `string` - Always "public-key". (Ex: `public-key`)
      - **`transports`** `array` - Authenticator transports the credential supports. (Ex: `['internal', 'hybrid']`)
  - **`userVerification`** `string` (Ex: `required`)
  - **`extensions`** `object` - WebAuthn extensions requested by WhatsApp.

---

### `POST` /api/{session}/auth/passkey
**Descrição:** Submit a WebAuthn passkey assertion to finish pairing.

**Parâmetros:**
- `session` (path) *(Obrigatório)*: Session name

**Corpo da Requisição (JSON):**
- **`id`** `string` - Credential ID, as returned by navigator.credentials.get().toJSON().
- **`rawId`** `string` - Base64url-encoded raw credential ID.
- **`type`** `string` - Always "public-key". (Ex: `public-key`)
- **`response`** `object`
  - **`clientDataJSON`** `string` - Base64url-encoded clientDataJSON from the authenticator.
  - **`authenticatorData`** `string` - Base64url-encoded authenticatorData from the authenticator.
  - **`signature`** `string` - Base64url-encoded signature from the authenticator.
  - **`userHandle`** `string` - Base64url-encoded user handle, if returned by the authenticator.


**Respostas:**
- **`201`**: 
---

### `GET` /api/{session}/auth/passkey/confirmation
**Descrição:** Get the pending passkey confirmation code.

**Parâmetros:**
- `session` (path) *(Obrigatório)*: Session name

**Respostas:**
- **`200`**: 
  - **`code`** `string` - The code the user must verify against the one shown on their phone. (Ex: `1234`)

---

### `POST` /api/{session}/auth/passkey/confirm
**Descrição:** Confirm passkey pairing (only needed for the manual code case).

**Parâmetros:**
- `session` (path) *(Obrigatório)*: Session name

**Respostas:**
- **`201`**: 
---

### `GET` /api/screenshot
**Descrição:** Get a screenshot of the current WhatsApp session (**WEBJS/WPP** only)

**Parâmetros:**
- `session` (query) *(Obrigatório)*: 

**Respostas:**
- **`200`**: 
---

## 🏷️ Módulo: 🔍 Observability
### `GET` /ping
**Descrição:** Ping the server

**Respostas:**
- **`200`**: 
  - **`message`** `string`

---

### `GET` /health
**Descrição:** Check the health of the server

**Respostas:**
- **`200`**: The Health Check is successful
  - **`status`** `string` (Ex: `ok`)
  - **`info`** `object` (Ex: `{'database': {'status': 'up'}}`)
  - **`error`** `object`
  - **`details`** `object` (Ex: `{'database': {'status': 'up'}}`)

- **`503`**: The Health Check is not successful
  - **`status`** `string` (Ex: `error`)
  - **`info`** `object` (Ex: `{'database': {'status': 'up'}}`)
  - **`error`** `object` (Ex: `{'redis': {'status': 'down', 'message': 'Could not connect'}}`)
  - **`details`** `object` (Ex: `{'database': {'status': 'up'}, 'redis': {'status': 'down', 'message': 'Could not connect'}}`)

---

### `GET` /api/server/version
**Descrição:** Get the version of the server

**Respostas:**
- **`200`**: 
  - **`version`** `string` (Ex: `YYYY.MM.BUILD`)
  - **`engine`** `string` (Ex: `WEBJS`)
  - **`tier`** `string` (Ex: `PLUS`)
  - **`browser`** `string` (Ex: `/usr/path/to/bin/google-chrome`)
  - **`platform`** `string` (Ex: `linux/x86`)
  - **`worker`** `object`
    - **`id`** `string`

---

### `GET` /api/server/environment
**Descrição:** Get the server environment

**Parâmetros:**
- `all` (query) *(Opcional)*: Include all environment variables

**Respostas:**
- **`200`**: 
---

### `GET` /api/server/status
**Descrição:** Get the server status

**Respostas:**
- **`200`**: 
  - **`startTimestamp`** `number` - The timestamp when the server started (milliseconds). (Ex: `1723788847247`)
  - **`uptime`** `number` - The uptime of the server in milliseconds. (Ex: `3600000`)
  - **`worker`** `object`
    - **`id`** `string` - The worker ID. (Ex: `waha`)

---

### `POST` /api/server/stop
**Descrição:** Stop (and restart) the server

**Corpo da Requisição (JSON):**
- **`force`** `boolean` - By default, it gracefully stops the server, but you can force it to terminate immediately.


**Respostas:**
- **`201`**: 
  - **`stopping`** `boolean` - Always 'true' if the server is stopping. (Ex: `True`)

---

### `GET` /api/server/debug/cpu
**Descrição:** Collect and return a CPU profile for the current nodejs process

**Parâmetros:**
- `seconds` (query) *(Opcional)*: How many seconds to sample CPU

**Respostas:**
- **`200`**: 
---

### `GET` /api/server/debug/heapsnapshot
**Descrição:** Return a heapsnapshot for the current nodejs process

**Respostas:**
- **`200`**: 
---

### `GET` /api/server/debug/browser/trace/{session}
**Descrição:** Collect and get a trace.json for Chrome DevTools 

**Parâmetros:**
- `session` (path) *(Obrigatório)*: Session name
- `seconds` (query) *(Obrigatório)*: How many seconds to trace
- `categories` (query) *(Obrigatório)*: Categories to trace (all by default)

**Respostas:**
- **`200`**: 
---

### `GET` /api/version
**Descrição:** Get the server version 

**Respostas:**
- **`200`**: 
  - **`version`** `string` (Ex: `YYYY.MM.BUILD`)
  - **`engine`** `string` (Ex: `WEBJS`)
  - **`tier`** `string` (Ex: `PLUS`)
  - **`browser`** `string` (Ex: `/usr/path/to/bin/google-chrome`)
  - **`platform`** `string` (Ex: `linux/x86`)
  - **`worker`** `object`
    - **`id`** `string`

---

## 🏷️ Módulo: 🔑 Api Keys
### `POST` /api/keys
**Descrição:** Create a new API key

**Corpo da Requisição (JSON):**
- **`isAdmin`** `boolean`
- **`session`** `string` (Ex: `default`)
- **`isActive`** `boolean` (Ex: `True`)
- **`actions`** `any`


**Respostas:**
- **`201`**: 
  - **`id`** `string` (Ex: `key_id_00000000000000000000000000`)
  - **`key`** `string` (Ex: `key_11111111111AAAAAAAAAAAAAAAAAAAAA`)
  - **`isActive`** `boolean` (Ex: `True`)
  - **`isAdmin`** `boolean`
  - **`session`** `string` (Ex: `default`)
  - **`actions`** `any`

---

### `GET` /api/keys
**Descrição:** Get all API keys

**Respostas:**
- **`200`**: 
---

### `POST` /api/keys/media
**Descrição:** Create or get a media-download-only API key for a session

**Corpo da Requisição (JSON):**
- **`session`** `string` (Ex: `default`)


**Respostas:**
- **`201`**: 
  - **`id`** `string` (Ex: `key_id_00000000000000000000000000`)
  - **`key`** `string` (Ex: `key_11111111111AAAAAAAAAAAAAAAAAAAAA`)
  - **`isActive`** `boolean` (Ex: `True`)
  - **`isAdmin`** `boolean`
  - **`session`** `string` (Ex: `default`)
  - **`actions`** `any`

---

### `POST` /api/keys/control
**Descrição:** Create or get a control-only API key for a session

**Corpo da Requisição (JSON):**
- **`session`** `string` (Ex: `default`)


**Respostas:**
- **`201`**: 
  - **`id`** `string` (Ex: `key_id_00000000000000000000000000`)
  - **`key`** `string` (Ex: `key_11111111111AAAAAAAAAAAAAAAAAAAAA`)
  - **`isActive`** `boolean` (Ex: `True`)
  - **`isAdmin`** `boolean`
  - **`session`** `string` (Ex: `default`)
  - **`actions`** `any`

---

### `PUT` /api/keys/{id}
**Descrição:** Update an API key

**Parâmetros:**
- `id` (path) *(Obrigatório)*: 

**Corpo da Requisição (JSON):**
- **`isAdmin`** `boolean`
- **`session`** `string` (Ex: `default`)
- **`isActive`** `boolean` (Ex: `True`)
- **`actions`** `any`


**Respostas:**
- **`200`**: 
  - **`id`** `string` (Ex: `key_id_00000000000000000000000000`)
  - **`key`** `string` (Ex: `key_11111111111AAAAAAAAAAAAAAAAAAAAA`)
  - **`isActive`** `boolean` (Ex: `True`)
  - **`isAdmin`** `boolean`
  - **`session`** `string` (Ex: `default`)
  - **`actions`** `any`

---

### `DELETE` /api/keys/{id}
**Descrição:** Delete an API key

**Parâmetros:**
- `id` (path) *(Obrigatório)*: 

**Respostas:**
- **`200`**: 
---

## 🏷️ Módulo: 🖥️ Sessions
### `GET` /api/sessions
**Descrição:** List all sessions

**Parâmetros:**
- `expand` (query) *(Opcional)*: Expand additional session details.
- `all` (query) *(Opcional)*: Return all sessions, including those that are in the STOPPED state.

**Respostas:**
- **`200`**: 
---

### `POST` /api/sessions
**Descrição:** Create a session

**Corpo da Requisição (JSON):**
- **`name`** `string` - Session name (id) (Ex: `default`)
- **`apps`** `array` - Apps to be synchronized for this session.
  - Item properties:
    - **`enabled`** `boolean` - Enable or disable this app without deleting it. If omitted, treated as enabled (true).
    - **`id`** `string`
    - **`session`** `string`
    - **`app`** `string`
    - **`config`** `object`
- **`start`** `boolean` - Start session after creation (Ex: `True`)
- **`config`** `object`
  - **`metadata`** `object` - Metadata for the session. You'll get 'metadata' in all webhooks. (Ex: `{'user.id': '123', 'user.email': 'email@example.com'}`)
  - **`proxy`** `any`
  - **`debug`** `boolean`
  - **`ignore`** `any` - Ignore some events related to specific chats (Ex: `{'status': None, 'groups': None, 'channels': None}`)
  - **`client`** `any` - How connected session renders in device - in format 'Browser (Device)' - Firefox (MacOS) (Ex: `{'browserName': 'Firefox', 'deviceName': 'MacOS'}`)
  - **`noweb`** `any` (Ex: `{'store': {'enabled': True, 'fullSync': False}}`)
  - **`gows`** `any` (Ex: `{'storage': {'messages': True, 'groups': True, 'chats': True, 'labels': True}}`)
  - **`webjs`** `any` - WebJS-specific settings.
  - **`webhooks`** `array`
    - Item properties:
      - **`url`** `string` - You can use https://docs.webhook.site/ to test webhooks and see the payload (Ex: `https://webhook.site/11111111-1111-1111-1111-11111111`)
      - **`events`** `array` (Ex: `['message', 'session.status']`)
        - Item properties:
      - **`hmac`** `any`
      - **`retries`** `any`
      - **`customHeaders`** `array`
        - Item properties:
          - **`name`** `string` (Ex: `X-My-Custom-Header`)
          - **`value`** `string` (Ex: `Value`)


**Respostas:**
- **`201`**: 
  - **`name`** `string` - Session name (id) (Ex: `default`)
  - **`status`** `string`
  - **`config`** `object`
    - **`metadata`** `object` - Metadata for the session. You'll get 'metadata' in all webhooks. (Ex: `{'user.id': '123', 'user.email': 'email@example.com'}`)
    - **`proxy`** `any`
    - **`debug`** `boolean`
    - **`ignore`** `any` - Ignore some events related to specific chats (Ex: `{'status': None, 'groups': None, 'channels': None}`)
    - **`client`** `any` - How connected session renders in device - in format 'Browser (Device)' - Firefox (MacOS) (Ex: `{'browserName': 'Firefox', 'deviceName': 'MacOS'}`)
    - **`noweb`** `any` (Ex: `{'store': {'enabled': True, 'fullSync': False}}`)
    - **`gows`** `any` (Ex: `{'storage': {'messages': True, 'groups': True, 'chats': True, 'labels': True}}`)
    - **`webjs`** `any` - WebJS-specific settings.
    - **`webhooks`** `array`
      - Item properties:
        - **`url`** `string` - You can use https://docs.webhook.site/ to test webhooks and see the payload (Ex: `https://webhook.site/11111111-1111-1111-1111-11111111`)
        - **`events`** `array` (Ex: `['message', 'session.status']`)
          - Item properties:
        - **`hmac`** `any`
        - **`retries`** `any`
        - **`customHeaders`** `array`
          - Item properties:
            - **`name`** `string` (Ex: `X-My-Custom-Header`)
            - **`value`** `string` (Ex: `Value`)

---

### `GET` /api/sessions/{session}
**Descrição:** Get session information

**Parâmetros:**
- `session` (path) *(Obrigatório)*: Session name
- `expand` (query) *(Opcional)*: Expand additional session details.

**Respostas:**
- **`200`**: 
  - **`name`** `string` - Session name (id) (Ex: `default`)
  - **`apps`** `array` - Apps configured for the session.
    - Item properties:
      - **`enabled`** `boolean` - Enable or disable this app without deleting it. If omitted, treated as enabled (true).
      - **`id`** `string`
      - **`session`** `string`
      - **`app`** `string`
      - **`config`** `object`
  - **`me`** `object`
    - **`id`** `string` (Ex: `11111111111@c.us`)
    - **`lid`** `string` (Ex: `123123@lid`)
    - **`jid`** `string` - Your id with device number (Ex: `123123:123@s.whatsapp.net`)
    - **`pushName`** `string`
  - **`assignedWorker`** `string`
  - **`presence`** `object`
  - **`timestamps`** `object`
    - **`activity`** `number`
  - **`status`** `string`
  - **`config`** `object`
    - **`metadata`** `object` - Metadata for the session. You'll get 'metadata' in all webhooks. (Ex: `{'user.id': '123', 'user.email': 'email@example.com'}`)
    - **`proxy`** `any`
    - **`debug`** `boolean`
    - **`ignore`** `any` - Ignore some events related to specific chats (Ex: `{'status': None, 'groups': None, 'channels': None}`)
    - **`client`** `any` - How connected session renders in device - in format 'Browser (Device)' - Firefox (MacOS) (Ex: `{'browserName': 'Firefox', 'deviceName': 'MacOS'}`)
    - **`noweb`** `any` (Ex: `{'store': {'enabled': True, 'fullSync': False}}`)
    - **`gows`** `any` (Ex: `{'storage': {'messages': True, 'groups': True, 'chats': True, 'labels': True}}`)
    - **`webjs`** `any` - WebJS-specific settings.
    - **`webhooks`** `array`
      - Item properties:
        - **`url`** `string` - You can use https://docs.webhook.site/ to test webhooks and see the payload (Ex: `https://webhook.site/11111111-1111-1111-1111-11111111`)
        - **`events`** `array` (Ex: `['message', 'session.status']`)
          - Item properties:
        - **`hmac`** `any`
        - **`retries`** `any`
        - **`customHeaders`** `array`
          - Item properties:
            - **`name`** `string` (Ex: `X-My-Custom-Header`)
            - **`value`** `string` (Ex: `Value`)

---

### `PUT` /api/sessions/{session}
**Descrição:** Update a session

**Parâmetros:**
- `session` (path) *(Obrigatório)*: Session name

**Corpo da Requisição (JSON):**
- **`apps`** `array` - Apps to be synchronized for this session.
  - Item properties:
    - **`enabled`** `boolean` - Enable or disable this app without deleting it. If omitted, treated as enabled (true).
    - **`id`** `string`
    - **`session`** `string`
    - **`app`** `string`
    - **`config`** `object`
- **`config`** `object`
  - **`metadata`** `object` - Metadata for the session. You'll get 'metadata' in all webhooks. (Ex: `{'user.id': '123', 'user.email': 'email@example.com'}`)
  - **`proxy`** `any`
  - **`debug`** `boolean`
  - **`ignore`** `any` - Ignore some events related to specific chats (Ex: `{'status': None, 'groups': None, 'channels': None}`)
  - **`client`** `any` - How connected session renders in device - in format 'Browser (Device)' - Firefox (MacOS) (Ex: `{'browserName': 'Firefox', 'deviceName': 'MacOS'}`)
  - **`noweb`** `any` (Ex: `{'store': {'enabled': True, 'fullSync': False}}`)
  - **`gows`** `any` (Ex: `{'storage': {'messages': True, 'groups': True, 'chats': True, 'labels': True}}`)
  - **`webjs`** `any` - WebJS-specific settings.
  - **`webhooks`** `array`
    - Item properties:
      - **`url`** `string` - You can use https://docs.webhook.site/ to test webhooks and see the payload (Ex: `https://webhook.site/11111111-1111-1111-1111-11111111`)
      - **`events`** `array` (Ex: `['message', 'session.status']`)
        - Item properties:
      - **`hmac`** `any`
      - **`retries`** `any`
      - **`customHeaders`** `array`
        - Item properties:
          - **`name`** `string` (Ex: `X-My-Custom-Header`)
          - **`value`** `string` (Ex: `Value`)


**Respostas:**
- **`200`**: 
  - **`name`** `string` - Session name (id) (Ex: `default`)
  - **`status`** `string`
  - **`config`** `object`
    - **`metadata`** `object` - Metadata for the session. You'll get 'metadata' in all webhooks. (Ex: `{'user.id': '123', 'user.email': 'email@example.com'}`)
    - **`proxy`** `any`
    - **`debug`** `boolean`
    - **`ignore`** `any` - Ignore some events related to specific chats (Ex: `{'status': None, 'groups': None, 'channels': None}`)
    - **`client`** `any` - How connected session renders in device - in format 'Browser (Device)' - Firefox (MacOS) (Ex: `{'browserName': 'Firefox', 'deviceName': 'MacOS'}`)
    - **`noweb`** `any` (Ex: `{'store': {'enabled': True, 'fullSync': False}}`)
    - **`gows`** `any` (Ex: `{'storage': {'messages': True, 'groups': True, 'chats': True, 'labels': True}}`)
    - **`webjs`** `any` - WebJS-specific settings.
    - **`webhooks`** `array`
      - Item properties:
        - **`url`** `string` - You can use https://docs.webhook.site/ to test webhooks and see the payload (Ex: `https://webhook.site/11111111-1111-1111-1111-11111111`)
        - **`events`** `array` (Ex: `['message', 'session.status']`)
          - Item properties:
        - **`hmac`** `any`
        - **`retries`** `any`
        - **`customHeaders`** `array`
          - Item properties:
            - **`name`** `string` (Ex: `X-My-Custom-Header`)
            - **`value`** `string` (Ex: `Value`)

---

### `DELETE` /api/sessions/{session}
**Descrição:** Delete the session

**Parâmetros:**
- `session` (path) *(Obrigatório)*: Session name

**Respostas:**
- **`200`**: 
---

### `GET` /api/sessions/{session}/me
**Descrição:** Get information about the authenticated account

**Parâmetros:**
- `session` (path) *(Obrigatório)*: Session name

**Respostas:**
- **`200`**: 
  - **`id`** `string` (Ex: `11111111111@c.us`)
  - **`lid`** `string` (Ex: `123123@lid`)
  - **`jid`** `string` - Your id with device number (Ex: `123123:123@s.whatsapp.net`)
  - **`pushName`** `string`

---

### `POST` /api/sessions/{session}/start
**Descrição:** Start the session

**Parâmetros:**
- `session` (path) *(Obrigatório)*: Session name

**Respostas:**
- **`201`**: 
  - **`name`** `string` - Session name (id) (Ex: `default`)
  - **`status`** `string`
  - **`config`** `object`
    - **`metadata`** `object` - Metadata for the session. You'll get 'metadata' in all webhooks. (Ex: `{'user.id': '123', 'user.email': 'email@example.com'}`)
    - **`proxy`** `any`
    - **`debug`** `boolean`
    - **`ignore`** `any` - Ignore some events related to specific chats (Ex: `{'status': None, 'groups': None, 'channels': None}`)
    - **`client`** `any` - How connected session renders in device - in format 'Browser (Device)' - Firefox (MacOS) (Ex: `{'browserName': 'Firefox', 'deviceName': 'MacOS'}`)
    - **`noweb`** `any` (Ex: `{'store': {'enabled': True, 'fullSync': False}}`)
    - **`gows`** `any` (Ex: `{'storage': {'messages': True, 'groups': True, 'chats': True, 'labels': True}}`)
    - **`webjs`** `any` - WebJS-specific settings.
    - **`webhooks`** `array`
      - Item properties:
        - **`url`** `string` - You can use https://docs.webhook.site/ to test webhooks and see the payload (Ex: `https://webhook.site/11111111-1111-1111-1111-11111111`)
        - **`events`** `array` (Ex: `['message', 'session.status']`)
          - Item properties:
        - **`hmac`** `any`
        - **`retries`** `any`
        - **`customHeaders`** `array`
          - Item properties:
            - **`name`** `string` (Ex: `X-My-Custom-Header`)
            - **`value`** `string` (Ex: `Value`)

---

### `POST` /api/sessions/{session}/stop
**Descrição:** Stop the session

**Parâmetros:**
- `session` (path) *(Obrigatório)*: Session name

**Respostas:**
- **`201`**: 
  - **`name`** `string` - Session name (id) (Ex: `default`)
  - **`status`** `string`
  - **`config`** `object`
    - **`metadata`** `object` - Metadata for the session. You'll get 'metadata' in all webhooks. (Ex: `{'user.id': '123', 'user.email': 'email@example.com'}`)
    - **`proxy`** `any`
    - **`debug`** `boolean`
    - **`ignore`** `any` - Ignore some events related to specific chats (Ex: `{'status': None, 'groups': None, 'channels': None}`)
    - **`client`** `any` - How connected session renders in device - in format 'Browser (Device)' - Firefox (MacOS) (Ex: `{'browserName': 'Firefox', 'deviceName': 'MacOS'}`)
    - **`noweb`** `any` (Ex: `{'store': {'enabled': True, 'fullSync': False}}`)
    - **`gows`** `any` (Ex: `{'storage': {'messages': True, 'groups': True, 'chats': True, 'labels': True}}`)
    - **`webjs`** `any` - WebJS-specific settings.
    - **`webhooks`** `array`
      - Item properties:
        - **`url`** `string` - You can use https://docs.webhook.site/ to test webhooks and see the payload (Ex: `https://webhook.site/11111111-1111-1111-1111-11111111`)
        - **`events`** `array` (Ex: `['message', 'session.status']`)
          - Item properties:
        - **`hmac`** `any`
        - **`retries`** `any`
        - **`customHeaders`** `array`
          - Item properties:
            - **`name`** `string` (Ex: `X-My-Custom-Header`)
            - **`value`** `string` (Ex: `Value`)

---

### `POST` /api/sessions/{session}/logout
**Descrição:** Logout from the session

**Parâmetros:**
- `session` (path) *(Obrigatório)*: Session name

**Respostas:**
- **`201`**: 
  - **`name`** `string` - Session name (id) (Ex: `default`)
  - **`status`** `string`
  - **`config`** `object`
    - **`metadata`** `object` - Metadata for the session. You'll get 'metadata' in all webhooks. (Ex: `{'user.id': '123', 'user.email': 'email@example.com'}`)
    - **`proxy`** `any`
    - **`debug`** `boolean`
    - **`ignore`** `any` - Ignore some events related to specific chats (Ex: `{'status': None, 'groups': None, 'channels': None}`)
    - **`client`** `any` - How connected session renders in device - in format 'Browser (Device)' - Firefox (MacOS) (Ex: `{'browserName': 'Firefox', 'deviceName': 'MacOS'}`)
    - **`noweb`** `any` (Ex: `{'store': {'enabled': True, 'fullSync': False}}`)
    - **`gows`** `any` (Ex: `{'storage': {'messages': True, 'groups': True, 'chats': True, 'labels': True}}`)
    - **`webjs`** `any` - WebJS-specific settings.
    - **`webhooks`** `array`
      - Item properties:
        - **`url`** `string` - You can use https://docs.webhook.site/ to test webhooks and see the payload (Ex: `https://webhook.site/11111111-1111-1111-1111-11111111`)
        - **`events`** `array` (Ex: `['message', 'session.status']`)
          - Item properties:
        - **`hmac`** `any`
        - **`retries`** `any`
        - **`customHeaders`** `array`
          - Item properties:
            - **`name`** `string` (Ex: `X-My-Custom-Header`)
            - **`value`** `string` (Ex: `Value`)

---

### `POST` /api/sessions/{session}/restart
**Descrição:** Restart the session

**Parâmetros:**
- `session` (path) *(Obrigatório)*: Session name

**Respostas:**
- **`201`**: 
  - **`name`** `string` - Session name (id) (Ex: `default`)
  - **`status`** `string`
  - **`config`** `object`
    - **`metadata`** `object` - Metadata for the session. You'll get 'metadata' in all webhooks. (Ex: `{'user.id': '123', 'user.email': 'email@example.com'}`)
    - **`proxy`** `any`
    - **`debug`** `boolean`
    - **`ignore`** `any` - Ignore some events related to specific chats (Ex: `{'status': None, 'groups': None, 'channels': None}`)
    - **`client`** `any` - How connected session renders in device - in format 'Browser (Device)' - Firefox (MacOS) (Ex: `{'browserName': 'Firefox', 'deviceName': 'MacOS'}`)
    - **`noweb`** `any` (Ex: `{'store': {'enabled': True, 'fullSync': False}}`)
    - **`gows`** `any` (Ex: `{'storage': {'messages': True, 'groups': True, 'chats': True, 'labels': True}}`)
    - **`webjs`** `any` - WebJS-specific settings.
    - **`webhooks`** `array`
      - Item properties:
        - **`url`** `string` - You can use https://docs.webhook.site/ to test webhooks and see the payload (Ex: `https://webhook.site/11111111-1111-1111-1111-11111111`)
        - **`events`** `array` (Ex: `['message', 'session.status']`)
          - Item properties:
        - **`hmac`** `any`
        - **`retries`** `any`
        - **`customHeaders`** `array`
          - Item properties:
            - **`name`** `string` (Ex: `X-My-Custom-Header`)
            - **`value`** `string` (Ex: `Value`)

---

### `POST` /api/sessions/start
**Descrição:** Upsert and Start session

**Corpo da Requisição (JSON):**
- **`name`** `string` - Session name (id) (Ex: `default`)
- **`config`** `object`
  - **`metadata`** `object` - Metadata for the session. You'll get 'metadata' in all webhooks. (Ex: `{'user.id': '123', 'user.email': 'email@example.com'}`)
  - **`proxy`** `any`
  - **`debug`** `boolean`
  - **`ignore`** `any` - Ignore some events related to specific chats (Ex: `{'status': None, 'groups': None, 'channels': None}`)
  - **`client`** `any` - How connected session renders in device - in format 'Browser (Device)' - Firefox (MacOS) (Ex: `{'browserName': 'Firefox', 'deviceName': 'MacOS'}`)
  - **`noweb`** `any` (Ex: `{'store': {'enabled': True, 'fullSync': False}}`)
  - **`gows`** `any` (Ex: `{'storage': {'messages': True, 'groups': True, 'chats': True, 'labels': True}}`)
  - **`webjs`** `any` - WebJS-specific settings.
  - **`webhooks`** `array`
    - Item properties:
      - **`url`** `string` - You can use https://docs.webhook.site/ to test webhooks and see the payload (Ex: `https://webhook.site/11111111-1111-1111-1111-11111111`)
      - **`events`** `array` (Ex: `['message', 'session.status']`)
        - Item properties:
      - **`hmac`** `any`
      - **`retries`** `any`
      - **`customHeaders`** `array`
        - Item properties:
          - **`name`** `string` (Ex: `X-My-Custom-Header`)
          - **`value`** `string` (Ex: `Value`)


**Respostas:**
- **`201`**: 
  - **`name`** `string` - Session name (id) (Ex: `default`)
  - **`status`** `string`
  - **`config`** `object`
    - **`metadata`** `object` - Metadata for the session. You'll get 'metadata' in all webhooks. (Ex: `{'user.id': '123', 'user.email': 'email@example.com'}`)
    - **`proxy`** `any`
    - **`debug`** `boolean`
    - **`ignore`** `any` - Ignore some events related to specific chats (Ex: `{'status': None, 'groups': None, 'channels': None}`)
    - **`client`** `any` - How connected session renders in device - in format 'Browser (Device)' - Firefox (MacOS) (Ex: `{'browserName': 'Firefox', 'deviceName': 'MacOS'}`)
    - **`noweb`** `any` (Ex: `{'store': {'enabled': True, 'fullSync': False}}`)
    - **`gows`** `any` (Ex: `{'storage': {'messages': True, 'groups': True, 'chats': True, 'labels': True}}`)
    - **`webjs`** `any` - WebJS-specific settings.
    - **`webhooks`** `array`
      - Item properties:
        - **`url`** `string` - You can use https://docs.webhook.site/ to test webhooks and see the payload (Ex: `https://webhook.site/11111111-1111-1111-1111-11111111`)
        - **`events`** `array` (Ex: `['message', 'session.status']`)
          - Item properties:
        - **`hmac`** `any`
        - **`retries`** `any`
        - **`customHeaders`** `array`
          - Item properties:
            - **`name`** `string` (Ex: `X-My-Custom-Header`)
            - **`value`** `string` (Ex: `Value`)

---

### `POST` /api/sessions/stop
**Descrição:** Stop (and Logout if asked) session

**Corpo da Requisição (JSON):**
- **`name`** `string` - Session name (id) (Ex: `default`)
- **`logout`** `boolean` - Stop and logout from the session.


**Respostas:**
- **`201`**: 
---

### `POST` /api/sessions/logout
**Descrição:** Logout and Delete session.

**Corpo da Requisição (JSON):**
- **`name`** `string` - Session name (id) (Ex: `default`)


**Respostas:**
- **`201`**: 
---

## 🏷️ Módulo: 🖼️ Media
### `POST` /api/{session}/media/convert/voice
**Descrição:** Convert voice to WhatsApp format (opus)

**Parâmetros:**
- `session` (path) *(Obrigatório)*: Session name

**Corpo da Requisição (JSON):**
- **`url`** `string` - The URL for the voice file (Ex: `https://github.com/devlikeapro/waha/raw/core/examples/voice.mp3`)
- **`data`** `string` - Base64 content of the file


**Respostas:**
- **`200`**: 
- **`201`**: 
---

### `POST` /api/{session}/media/convert/video
**Descrição:** Convert video to WhatsApp format (mp4)

**Parâmetros:**
- `session` (path) *(Obrigatório)*: Session name

**Corpo da Requisição (JSON):**
- **`url`** `string` - The URL for the video file (Ex: `https://github.com/devlikeapro/waha/raw/core/examples/video.mp4`)
- **`data`** `string` - Base64 content of the file


**Respostas:**
- **`200`**: 
- **`201`**: 
---

## 🏷️ Módulo: 🟢 Status
### `POST` /api/{session}/status/text
**Descrição:** Send text status

**Parâmetros:**
- `session` (path) *(Obrigatório)*: Session name

**Corpo da Requisição (JSON):**
- **`id`** `string` - Pre-generated status message id (Ex: `BBBBBBBBBBBBBBBBB`)
- **`contacts`** `array` - Contact list to send the status to.
- **`text`** `string`
- **`backgroundColor`** `string`
- **`font`** `number`
- **`linkPreview`** `boolean`
- **`linkPreviewHighQuality`** `boolean`


**Respostas:**
- **`201`**: 
---

### `POST` /api/{session}/status/image
**Descrição:** Send image status

**Parâmetros:**
- `session` (path) *(Obrigatório)*: Session name

**Corpo da Requisição (JSON):**
- **`id`** `string` - Pre-generated status message id (Ex: `BBBBBBBBBBBBBBBBB`)
- **`contacts`** `array` - Contact list to send the status to.
- **`file`** `any`
- **`caption`** `string`


**Respostas:**
- **`201`**: 
---

### `POST` /api/{session}/status/voice
**Descrição:** Send voice status

**Parâmetros:**
- `session` (path) *(Obrigatório)*: Session name

**Corpo da Requisição (JSON):**
- **`id`** `string` - Pre-generated status message id (Ex: `BBBBBBBBBBBBBBBBB`)
- **`contacts`** `array` - Contact list to send the status to.
- **`file`** `any`
- **`convert`** `boolean` - Convert the input file to the required format using ffmpeg before sending (Ex: `True`)
- **`backgroundColor`** `string`


**Respostas:**
- **`201`**: 
---

### `POST` /api/{session}/status/video
**Descrição:** Send video status

**Parâmetros:**
- `session` (path) *(Obrigatório)*: Session name

**Corpo da Requisição (JSON):**
- **`id`** `string` - Pre-generated status message id (Ex: `BBBBBBBBBBBBBBBBB`)
- **`contacts`** `array` - Contact list to send the status to.
- **`file`** `any`
- **`convert`** `boolean` - Convert the input file to the required format using ffmpeg before sending (Ex: `True`)
- **`caption`** `string`


**Respostas:**
- **`201`**: 
---

### `POST` /api/{session}/status/delete
**Descrição:** DELETE sent status

**Parâmetros:**
- `session` (path) *(Obrigatório)*: Session name

**Corpo da Requisição (JSON):**
- **`id`** `string` - Status message id to delete (Ex: `AAAAAAAAAAAAAAAAA`)
- **`contacts`** `array` - Contact list to send the status to.


**Respostas:**
- **`201`**: 
---

### `GET` /api/{session}/status/new-message-id
**Descrição:** Generate message ID you can use to batch contacts

**Parâmetros:**
- `session` (path) *(Obrigatório)*: Session name

**Respostas:**
- **`200`**: 
  - **`id`** `string` - Pre-generated message id (Ex: `BBBBBBBBBBBBBBBBB`)

---

## 🏷️ Módulo: 🧩 Apps
### `GET` /api/apps
**Descrição:** List all apps for a session

**Parâmetros:**
- `session` (query) *(Obrigatório)*: Session name to list apps for

**Respostas:**
- **`200`**: 
---

### `POST` /api/apps
**Descrição:** Create a new app

**Corpo da Requisição (JSON):**
- **`enabled`** `boolean` - Enable or disable this app without deleting it. If omitted, treated as enabled (true).
- **`id`** `string`
- **`session`** `string`
- **`app`** `string`
- **`config`** `object`


**Respostas:**
- **`201`**: 
---

### `GET` /api/apps/{id}
**Descrição:** Get app by ID

**Parâmetros:**
- `id` (path) *(Obrigatório)*: 

**Respostas:**
- **`200`**: 
---

### `PUT` /api/apps/{id}
**Descrição:** Update an existing app

**Parâmetros:**
- `id` (path) *(Obrigatório)*: 

**Corpo da Requisição (JSON):**
- **`enabled`** `boolean` - Enable or disable this app without deleting it. If omitted, treated as enabled (true).
- **`id`** `string`
- **`session`** `string`
- **`app`** `string`
- **`config`** `object`


**Respostas:**
- **`200`**: 
---

### `DELETE` /api/apps/{id}
**Descrição:** Delete an app

**Parâmetros:**
- `id` (path) *(Obrigatório)*: 

**Respostas:**
- **`200`**: 
---

### `POST` /mcp
**Descrição:** 

**Respostas:**
- **`201`**: 
---
