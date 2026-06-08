# MongoDB Atlas Manual Seeding

Instead of running a terminal script, you can import these JSON files directly into MongoDB Atlas.

## Default Credentials

| Role | Username | Password |
|------|----------|----------|
| SUPER_ADMIN | Super Admin | admin123456 |
| ADMIN | Demo Admin | admin123456 |
| EDITOR | Demo Editor | editor123456 |
| AUTHOR | Demo Author | author123456 |

## Steps

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Select your cluster → Browse Collections
3. For each collection below, click "Add Data" → "Import JSON or CSV file"

### Collections to Import

| File | Collection Name | Database |
|------|----------------|----------|
| `staffusers.json` | `staffusers` | `zalen-gam` |
| `categories.json` | `categories` | `zalen-gam` |
| `settings.json` | `sitesettings` | `zalen-gam` |
| `articles.json` | `articles` | `zalen-gam` |

### Alternative: Insert Documents Manually

You can also open each collection and click "Insert Document", then paste the JSON array contents one by one.

### Note on Passwords

All passwords are bcrypt-hashed. The default passwords are:
- `admin123456` for Super Admin and Demo Admin
- `editor123456` for Demo Editor  
- `author123456` for Demo Author

If you want custom passwords, generate a bcrypt hash (12 rounds) and replace the `passwordHash` field.
