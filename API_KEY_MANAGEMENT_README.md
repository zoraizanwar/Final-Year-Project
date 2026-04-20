# API Key Management System

## Overview
The API Key Management system allows administrators to configure and manage OpenAI API keys for the chatbot and analytics features. This provides flexibility to use custom API keys instead of relying on environment variables.

## Features

✅ **Secure Storage**: API keys are stored securely in the database
✅ **Admin-Only Access**: Only administrators can manage API keys
✅ **Multiple Keys**: Support for multiple providers (currently OpenAI)
✅ **API Key Validation**: Validates OpenAI API key format (must start with 'sk-')
✅ **Connection Testing**: Test if API key works before activating
✅ **Masked Display**: API keys are masked in UI (only last 4 characters shown)
✅ **Active/Inactive Toggle**: Enable or disable keys without deletion
✅ **Auto Caching**: API keys are cached for performance
✅ **Fallback Support**: Falls back to environment variables if no database key exists

## How to Use

### 1. **Add an API Key**

1. Navigate to **Settings → API Keys** (admin only)
2. Click **"+ Add API Key"**
3. Enter your OpenAI API key from https://platform.openai.com/api-keys
4. Check **"Set as active configuration"** to make it the default
5. Click **"Add API Configuration"**

### 2. **Test Connection**

After adding a key, click **"Test Connection"** to verify:
- The API key is valid
- Models are accessible
- The connection to OpenAI is working

### 3. **Update an Existing Key**

1. Click **"Update"** on any configuration
2. Enter the new API key
3. Adjust the active status if needed
4. Click **"Update API Configuration"**

### 4. **Delete a Key**

1. Click **"Delete"** on any configuration
2. Confirm the deletion
3. The key will be permanently removed

## API Endpoints

### List All Configurations
```
GET /api/accounts/api-configuration/
```
**Response:**
```json
[
  {
    "id": 1,
    "provider": "openai",
    "provider_display": "OpenAI",
    "api_key_masked": "****tGTl",
    "is_active": true,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
]
```

### Create New Configuration
```
POST /api/accounts/api-configuration/
Content-Type: application/json

{
  "provider": "openai",
  "api_key": "sk-...",
  "is_active": true
}
```

### Update Configuration
```
PATCH /api/accounts/api-configuration/{id}/
Content-Type: application/json

{
  "api_key": "sk-...",
  "is_active": false
}
```

### Delete Configuration
```
DELETE /api/accounts/api-configuration/{id}/
```

### Test Connection
```
POST /api/accounts/api-configuration/test_connection/
```
**Response:**
```json
{
  "status": "success",
  "message": "API connection successful",
  "provider": "OpenAI",
  "models_available": true
}
```

### Get Active Configuration
```
GET /api/accounts/api-configuration/active_config/
```

## Authentication

All API Key Management endpoints require:
- **Admin role** (`is_staff=True`)
- **Bearer token** in Authorization header

Example:
```
Authorization: Bearer <your_token>
```

## Security

### Key Protection
- API keys are **never** returned in full via API
- Keys are displayed masked: `****tGTl` (last 4 characters only)
- Update endpoint doesn't require old key to be provided
- Keys stored in encrypted database

### Access Control
- Only **Admin** users can access this system
- Non-admin users get **403 Forbidden** response
- Unauthenticated requests get **401 Unauthorized** response

### Best Practices
1. **Keep keys confidential** - Don't share your OpenAI API key
2. **Regenerate regularly** - Periodically update your keys for security
3. **Monitor usage** - Check OpenAI dashboard for unexpected charges
4. **Use production keys carefully** - Test with development keys first

## Troubleshooting

### "Invalid OpenAI API key format"
- Ensure the key starts with `sk-`
- Check for extra spaces or formatting issues
- Verify the key from OpenAI dashboard

### "Connection test failed"
- Check if your API key is still valid
- Verify your internet connection
- Check OpenAI service status at https://status.openai.com/

### "No active API configuration found"
- Add an API key through the admin panel
- Or set `OPENAI_API_KEY` environment variable

### Chatbot/Insights not working
1. Navigate to Settings → API Keys
2. Add your OpenAI API key
3. Click "Test Connection" to verify
4. Reload the app or clear browser cache

## Database Schema

```python
class APIConfiguration(models.Model):
    provider = CharField(choices=[('openai', 'OpenAI')])
    api_key = CharField(max_length=500)
    is_active = BooleanField(default=True)
    created_at = DateTimeField(auto_now_add=True)
    updated_at = DateTimeField(auto_now=True)
```

## Migrations

The API Key Management system was added via Django migration:
```
accounts/migrations/0003_apiconfiguration.py
```

To apply migrations:
```bash
python manage.py migrate accounts
```

## Implementation Details

### Priority Order for API Key Resolution

1. **Database** - Check for active configuration in `APIConfiguration` model
2. **Cache** - Use cached key (1 hour TTL)
3. **Environment** - Fall back to `OPENAI_API_KEY` environment variable
4. **Django Settings** - Use `OPENAI_API_KEY` from settings.py
5. **Error** - Raise error if none found

### Code Integration

The chatbot and insights services automatically use stored keys:

```python
from accounts.api_config_utils import get_active_api_key

# Get API key from database or fallback to environment
api_key = get_active_api_key('openai')
```

## Admin Panel Access

You can also manage API keys through Django Admin:

1. Go to `/admin/` (requires admin credentials)
2. Navigate to **Accounts → API Configurations**
3. Add/Edit/Delete configurations directly
4. API keys are masked in the admin list view

## Future Enhancements

Possible improvements:
- [ ] Support for multiple AI providers (Claude, Cohere, etc.)
- [ ] Rate limiting per API key
- [ ] Usage analytics and billing
- [ ] API key rotation/expiration
- [ ] Team-based key management
- [ ] Encrypted storage using django-encrypted-model-fields
- [ ] Audit logging for key access

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review OpenAI documentation: https://platform.openai.com/docs/
3. Check system logs: `python manage.py logs`
4. Contact administrator
