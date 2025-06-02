# Hospital Images API Documentation

## Endpoints

### GET /api/hospitals/:id/image

Retrieves image information for a specific hospital.

#### Parameters
- `id` (path parameter, required): Hospital ID

#### Response
```json
{
  "hospitalId": number,
  "name": string,
  "imageUrl": string,
  "imageAlt": string
}
```

#### Error Codes
- `FETCH_ERROR`: Failed to fetch hospital image
- `INVALID_IMAGE`: Image format or size is invalid
- `NOT_FOUND`: Hospital not found

### GET /api/hospitals/images

Retrieves images for multiple hospitals.

#### Parameters
- `ids` (query parameter, required): Comma-separated list of hospital IDs

#### Response
```json
[
  {
    "hospitalId": number,
    "name": string,
    "imageUrl": string,
    "imageAlt": string
  }
]
```

#### Error Codes
- `MISSING_IDS`: No hospital IDs provided
- `FETCH_ERROR`: Failed to fetch hospital images

## Image Requirements
- Supported formats: JPG, PNG, WebP
- Maximum file size: 5MB
- Images are automatically resized to max 800x600

## Caching
- Images are cached for 1 hour (3600 seconds)
- ETags are provided for conditional requests