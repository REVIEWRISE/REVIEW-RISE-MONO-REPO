# Database Credentials & Configuration

## ReviewRise Database Information

### Database Details

- **Database Name**: `reviewrise_db`
- **PostgreSQL Version**: 15-alpine
- **Docker Service Name**: `postgres` (use this as host in Docker network)
- **External Host**: Your VPS IP address (for external connections)
- **Port**: `5432` (internal Docker network)

### User Accounts

#### 1. Root User (PostgreSQL Admin)
- **Username**: `postgres`
- **Password**: Set in `.env.production` as `POSTGRES_PASSWORD`
- **Purpose**: Database administration, creating users/databases
- **Access**: Full superuser privileges

#### 2. Admin User (Application Admin)
- **Username**: `reviewrise_admin`
- **Password**: Set in `.env.production` as part of `DATABASE_ADMIN_URL`
- **Purpose**: Running migrations, schema changes
- **Access**: Full privileges on `reviewrise_db` database

#### 3. App User (Runtime)
- **Username**: `reviewrise_app`
- **Password**: Set in `.env.production` as part of `DATABASE_URL`
- **Purpose**: Normal application operations (CRUD)
- **Access**: Limited privileges (SELECT, INSERT, UPDATE, DELETE)

### Connection Strings

#### For ReviewRise Services (Internal Docker Network)

```bash
# App User (Runtime)
DATABASE_URL="postgresql://reviewrise_app:YOUR_APP_PASSWORD@postgres:5432/reviewrise_db?sslmode=disable"

# Admin User (Migrations)
DATABASE_ADMIN_URL="postgresql://reviewrise_admin:YOUR_ADMIN_PASSWORD@postgres:5432/reviewrise_db?sslmode=disable"
```

#### For Vyntrize CRM (Same Docker Network)

Since the CRM is running in the same Docker Compose stack, it can connect using the internal service name:

```bash
# Option 1: Use the same reviewrise_db database
CRM_DATABASE_URL="postgresql://reviewrise_app:YOUR_APP_PASSWORD@postgres:5432/reviewrise_db?sslmode=disable"

# Option 2: Use a separate vyntrize_db database (recommended for isolation)
CRM_DATABASE_URL="postgresql://reviewrise_app:YOUR_APP_PASSWORD@postgres:5432/vyntrize_db?sslmode=disable"
```

**Note**: If using a separate `vyntrize_db` database, you need to create it first (see below).

#### For External Connections (from your local machine)

```bash
# Replace YOUR_VPS_IP with actual IP address
DATABASE_URL="postgresql://reviewrise_app:YOUR_APP_PASSWORD@YOUR_VPS_IP:5432/reviewrise_db?sslmode=disable"
```

**Note**: You need to expose port 5432 in docker-compose.prod.yml for external access (not recommended for production).

## Getting Actual Passwords

The actual passwords are stored in `.env.production` on your VPS. To retrieve them:

```bash
# SSH into VPS
ssh deploy@your-vps-ip

# Navigate to project directory
cd ~/review-rise-monorepo

# View the database URLs (passwords are embedded)
grep DATABASE_URL .env.production
grep POSTGRES_PASSWORD .env.production
```

Example output:
```
DATABASE_URL="postgresql://reviewrise_app:abc123xyz@postgres:5432/reviewrise_db?sslmode=disable"
DATABASE_ADMIN_URL="postgresql://reviewrise_admin:def456uvw@postgres:5432/reviewrise_db?sslmode=disable"
POSTGRES_PASSWORD=root789password
```

## Setting Up Vyntrize CRM Database Connection

### Option 1: Share the Same Database (Simpler)

The CRM can use the same `reviewrise_db` database with a different schema or table prefix:

1. **In your vyntrize-crm project**, create/update `.env`:
   ```bash
   # Use the same database
   DATABASE_URL="postgresql://reviewrise_app:YOUR_APP_PASSWORD@reviewrise-postgres:5432/reviewrise_db?sslmode=disable"
   
   # Or use Docker service name
   DATABASE_URL="postgresql://reviewrise_app:YOUR_APP_PASSWORD@postgres:5432/reviewrise_db?sslmode=disable"
   ```

2. **Use a table prefix** in your CRM schema to avoid conflicts:
   ```prisma
   // In your Prisma schema
   model CrmContact {
     @@map("crm_contacts")
   }
   ```

### Option 2: Separate Database (Better Isolation)

Create a dedicated `vyntrize_db` database for the CRM:

1. **Create the database** (run on VPS):
   ```bash
   docker compose -f docker-compose.prod.yml exec postgres psql -U postgres -c "CREATE DATABASE vyntrize_db;"
   docker compose -f docker-compose.prod.yml exec postgres psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE vyntrize_db TO reviewrise_admin;"
   docker compose -f docker-compose.prod.yml exec postgres psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE vyntrize_db TO reviewrise_app;"
   ```

2. **In your vyntrize-crm project**, update `.env`:
   ```bash
   DATABASE_URL="postgresql://reviewrise_app:YOUR_APP_PASSWORD@postgres:5432/vyntrize_db?sslmode=disable"
   ```

3. **Run migrations** for the CRM:
   ```bash
   # From the vyntrize-crm project
   npx prisma migrate deploy
   # or
   npx prisma db push
   ```

## Docker Compose Configuration

The CRM service is already configured in `docker-compose.prod.yml`:

```yaml
vyntrize_crm:
  image: ghcr.io/reviewrise/vyntrize-website-project/vyntrize-crm:latest
  container_name: deploy-vyntrize-crm-1
  networks:
    - reviewrise-network
  environment:
    - DATABASE_URL=${CRM_DATABASE_URL}
    - NODE_ENV=production
  depends_on:
    - postgres
```

Make sure to add `CRM_DATABASE_URL` to your `.env.production` file on the VPS.

## Security Best Practices

1. **Never commit** `.env.production` to version control
2. **Use strong passwords** (generate with `openssl rand -base64 32`)
3. **Don't expose** PostgreSQL port 5432 to the internet
4. **Use SSL/TLS** for external connections (set `sslmode=require`)
5. **Rotate passwords** regularly
6. **Use separate users** for different services (don't share the admin password)

## Troubleshooting

### Connection Refused

```bash
# Check if postgres is running
docker compose -f docker-compose.prod.yml ps postgres

# Check postgres logs
docker compose -f docker-compose.prod.yml logs postgres

# Test connection from another container
docker compose -f docker-compose.prod.yml exec express-auth sh -c 'nc -zv postgres 5432'
```

### Authentication Failed

```bash
# Verify credentials in .env.production
grep DATABASE_URL .env.production

# Test connection manually
docker compose -f docker-compose.prod.yml exec postgres psql -U reviewrise_app -d reviewrise_db -c "SELECT 1;"
```

### Database Does Not Exist

```bash
# List all databases
docker compose -f docker-compose.prod.yml exec postgres psql -U postgres -c "\l"

# Create database if missing
docker compose -f docker-compose.prod.yml exec postgres psql -U postgres -c "CREATE DATABASE vyntrize_db;"
```

## Next Steps

1. **Get the actual passwords** from `.env.production` on your VPS
2. **Decide on database strategy**: shared database or separate database
3. **Update vyntrize-crm `.env`** with the correct connection string
4. **Run migrations** in the CRM project
5. **Test the connection** by starting the CRM service
