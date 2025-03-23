# URL Shortener Service

This is a simple URL shortener service built using Node.js, Express, and MongoDB. It allows users to shorten long URLs into more manageable short URLs, track the number of visits to the shortened URLs, and automatically clean up expired URLs.

## Features

- **Shorten URLs**: Convert long URLs into short, easy-to-share URLs.
- **Custom Aliases**: Optionally specify a custom alias for the short URL.
- **Visit Tracking**: Track the number of times a shortened URL has been visited.
- **Expiration**: Shortened URLs expire after 30 days.
- **Automatic Cleanup**: Expired URLs are automatically cleaned up daily at midnight.

## API Endpoints

### 1. Shorten a URL

**Endpoint**: `POST /shorten`

**Request Body**:

```json
{
  "longUrl": "https://example.com/very/long/url"
}
```

**Response**:

```json
{
  "shortUrl": "https://short.ly/abc123"
}
```

### 2. Redirect to Long URL

**Endpoint**: `GET /:shortCode`

**Description**: Redirects to the original long URL when a short URL is visited.

### 3. Get URL Statistics

**Endpoint**: `GET /stats/:shortCode`

**Response**:

```json
{
  "longUrl": "https://example.com/very/long/url",
  "shortUrl": "https://short.ly/abc123",
  "visitCount": 42,
  "expiresAt": "2024-04-30T00:00:00.000Z"
}
```

### 4. Delete Expired URLs (Automated)

A background job runs daily at midnight to remove expired URLs from the database.

## Installation

1. Clone the repository:
   ```sh
   git clone [https://github.com/your-repo/url-shortener.git](https://github.com/varshaa17/URL-shortener)
   ```
2. Navigate to the project folder:
   ```sh
   cd url-shortener
   ```
3. Install dependencies:
   ```sh
   npm install
   ```
4. Set up environment variables in a `.env` file:
   ```sh
   MONGO_URI=your_mongodb_connection_string
   BASE_URL=https://short.ly
   PORT=3000
   ```
5. Start the server:
   ```sh
   npm start
   ```

## Technologies Used

- Node.js
- Express
- MongoDB
- Mongoose
- Cron Jobs for cleanup



