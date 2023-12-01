# noteable API

## Info

This is an excersise in API development, using AWS.
It is an API for storing and retrieving notes in a dynamoDb
database. The user need to sign up and login to an account.
Then they can post notes, archive/unarchive notes, update notes,
delete archived notes and of course read notes.

## Endpoints



|  Endpoint |  Method |  Description |
|---|---|---|
| `/api/user/signUp` | `POST` | Create account |
| `/api/user/login` | `POST` | Login |
| `/api/notes` | `POST` | Post a note |
| `/api/notes` | `GET` | Get all notes for logged in user|
| `/api/notes/archive` | `PATCH` | Archive note |
| `/api/notes/unArchive` | `PATCH` | UnArchive note |
| `/api/notes/archived` | `GET` | Get archived notes |
| `/api/notes` | `PUT` | Update note |
| `/api/notes/archived` | `DELETE` | Delete archived note |


### JSON schemas for the endpoints

**signUp**
```js
    {
      type: "object",
      properties: {
        username: {
          type: "string",
          minLength: 3,
          maxLength: 20,
          pattern: "^[a-zA-Z0-9_]+$",
        },
        password: {
          type: "string",
          minLength: 8,
          maxLength: 25,
          pattern: "^[a-zA-Z0-9!@#$%^&*]+$",
        },
        firstName: {
          type: "string",
          minLength: 1,
          maxLength: 50,
          pattern: "^[a-zA-Z/'/´/`åäöÅÄÖœæøÆØ]+$",
        },
        lastName: {
          type: "string",
          minLength: 1,
          maxLength: 50,
          pattern: "^[a-zA-Z/'/´/`åäöÅÄÖœæøÆØ]+$",
        },
      },
      required: ["username", "password", "firstName", "lastName"],
      additionalProperties: false,
    }
```

**login**
```js
    {
      type: "object",
      properties: {
        username: {
          type: "string",
          maxLength: 100,
        },
        password: {
          type: "string",
          maxLength: 100,
        },
      },
      required: ["username", "password"],
      additionalProperties: false,
    }
```

**postNote**
```js
    {
      type: "object",
      properties: {
        title: { type: "string", maxLength: 50 },
        text: { type: "string", maxLength: 300 },
      },
      required: ["title", "text"],
      additionalProperties: false,
    }
```

**getNotes**

no JSON

**archiveNote**
```js
    {
      type: "object",
      properties: {
        noteId: { type: "string", minLength: 21, maxLength: 21 },
      },
      required: ["noteId"],
      additionalProperties: false,
    } 
```

**unArchiveNote**
```js
    {
      type: "object",
      properties: {
        noteId: { type: "string", minLength: 21, maxLength: 21 },
      },
      required: ["noteId"],
      additionalProperties: false,
    }
```

**getArchivedNotes**

no Json

**updateNote**
```js
    {
      type: "object",
      properties: {
        noteId: { type: "string", minLength: 21, maxLength: 21 },
        title: {type: "string", maxLength: 50},
        text: { type: "string", maxLength: 300}
      },
      required: ["noteId"],
      anyOf: [
        { required: ["title"] },
        { required: ["text"] },
      ],
      additionalProperties: false,
    }
```

**deleteArchivedNote**
```js
    {
      type: "object",
      properties: {
        noteId: { type: "string", minLength: 21, maxLength: 21 },
      },
      required: ["noteId"],
      additionalProperties: false,
    }
```


## Database

Two tables are used:

*noteableNotes:*

for notes. It uses userId and noteId as a composite key.

**Note object**
| Key | Value type | Description |
|---|---|---|
| `userId` | `String` | The user's ID, which is generated on signUp. 21 chars. |
| `noteId` | `String` | A generated ID for the note. 21 chars. |
| `title` | `String` |  Note title. Max 50 chars. |
| `text` | `String` | The actual note text. Max 300 chars. |
| `createdAt` | `ISO-string` | Creation time. UTC. |
| `modifiedAt` | `ISO-string` | Last modified. UTC |
| `isDeleted` | `Boolean` |  If true, it means the note is archived.|


*noteableAccounts:*

for accounts. It uses username as key.

**Account object**
| Key | Value type | Description |
|---|---|---|
| `userId` | `String` | A generated ID for the user. 21 chars. |
| `username` | `String` | Unique username. 3-20 chars. |
| `password` | `String` | Hashed password. (The original password length is 8 - 25 chars.) |
| `firstName` | `String` | User's first name. Max 50 chars. |
| `lastName` | `String` | User's last name. Max 50 chars. |






