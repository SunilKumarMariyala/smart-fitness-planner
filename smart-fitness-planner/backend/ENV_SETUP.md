# Database Configuration Setup

## Create .env file

Create a `.env` file in the `backend` directory with the following content:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=smart_fitness

# Server Configuration
PORT=3000
NODE_ENV=development
```

## Important: Replace the following values

1. **DB_PASSWORD**: Replace `your_mysql_password_here` with your actual MySQL root password
2. **DB_USER**: Usually `root`, but change if you use a different MySQL user
3. **DB_NAME**: Should be `smart_fitness` (as per your database name)

## Steps to create the file:

1. Navigate to the `backend` folder
2. Create a new file named `.env` (with the dot at the beginning)
3. Copy the content above and replace `your_mysql_password_here` with your MySQL password
4. Save the file
5. Restart your backend server (`npm run dev`)

## Verify Database Connection

After creating the `.env` file and restarting the server, you should see:
- ✅ `Database connected successfully` - if connection is successful
- ❌ Error message - if there's a connection issue (check your credentials)

