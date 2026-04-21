# API Keys Configuration Guide

## Quick Start

### For Users
1. **Login** to the dashboard with admin credentials
2. **Navigate** to **Settings → API Keys** (Lock icon in sidebar)
3. **Click** "+ Add API Key"
4. **Paste** your OpenAI API key from https://platform.openai.com/api-keys
5. **Click** "Add API Configuration"
6. **Test** the connection by clicking "Test Connection"
7. **Done!** ✅ Chatbot and Analytics will now use your API key

### For Administrators

#### Backend Setup (Already Done)
- ✅ Created `APIConfiguration` model in database
- ✅ Created serializers and viewsets for API management
- ✅ Added admin interface for Django admin panel
- ✅ Integrated with chatbot and insights services
- ✅ Ran database migration: `accounts/migrations/0003_apiconfiguration.py`
- ✅ Added `/api/accounts/api-configuration/` endpoints
- ✅ Added caching for performance

#### Frontend Setup (Already Done)
- ✅ Created `APIKeyManagement.jsx` component
- ✅ Added route at `/settings/api-keys`
- ✅ Added navigation link in sidebar (admin only)
- ✅ Implemented form for adding/updating keys
- ✅ Added connection testing feature
- ✅ Mask API keys for security

## Getting Your OpenAI API Key

1. Visit https://platform.openai.com/api-keys
2. Sign in to your OpenAI account
3. Click "Create new secret key"
4. Copy the key (starts with `sk-`)
5. Store it safely (you'll only see it once)
6. Paste it in the "API Key Management" form in your app

## Environment Variable Fallback

If no API key is configured in the app, it will look for:
```bash
# In .env file or system environment
OPENAI_API_KEY=sk-...
```

This is useful for development or backup:
```bash
# Windows - set in terminal or .env
set OPENAI_API_KEY=sk-...

# Linux/Mac - set in terminal
export OPENAI_API_KEY=sk-...

# Or add to .env file
OPENAI_API_KEY=sk-...
```

## Architecture

```
┌─────────────────────────────────────────────┐
│   User Interface (React)                    │
│   - Settings → API Keys page                │
│   - Add/Update/Delete keys                  │
│   - Test connection button                  │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│   REST API Endpoints                        │
│   - POST   /api/accounts/api-configuration/ │
│   - GET    /api/accounts/api-configuration/ │
│   - PATCH  /api/accounts/api-configuration/ │
│   - DELETE /api/accounts/api-configuration/ │
│   - POST   /test_connection/                │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│   Django Services (Python)                  │
│   - APIConfigurationViewSet                 │
│   - get_active_api_key() function           │
│   - API key caching (1 hour)                │
│   - Fallback to env variables               │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│   Database (SQLite)                         │
│   - APIConfiguration table                  │
│   - Stores provider, api_key, is_active     │
│   - Tracks created_at, updated_at           │
└──────────────────────────────────────────────┘
```

## API Key Priority (Order of Lookup)

When the chatbot or analytics needs to call OpenAI:

1. **Check cached key** (fastest, 1 hour cache)
2. **Query database** for active APIConfiguration
3. **Check environment variable** `OPENAI_API_KEY`
4. **Check Django settings** `OPENAI_API_KEY` setting
5. **Raise error** if none found

This means:
- You can switch keys without restarting the app
- Keys are automatically cached for performance
- Environment variables serve as backup
- No need to restart server when adding/updating keys

## Usage Examples

### Adding a Key via API
```bash
curl -X POST http://localhost:8000/api/accounts/api-configuration/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "openai",
    "api_key": "sk-...",
    "is_active": true
  }'
```

### Testing Connection via API
```bash
curl -X POST http://localhost:8000/api/accounts/api-configuration/test_connection/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Active Configuration
```bash
curl -X GET http://localhost:8000/api/accounts/api-configuration/active_config/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Troubleshooting

### Issue: "Unauthorized" when accessing API Keys page
**Solution**: Make sure you're logged in as an Admin user

### Issue: "API connection test failed"
**Solution**: 
1. Verify your API key is correct
2. Check your internet connection
3. Ensure OpenAI service is not down (https://status.openai.com)
4. Try generating a new key from OpenAI dashboard

### Issue: Chatbot says "API key not configured"
**Solution**:
1. Go to Settings → API Keys
2. Add your OpenAI API key
3. Test the connection
4. Refresh the page

### Issue: Changes not taking effect
**Solution**: The app caches API keys for 1 hour. Clear the cache:
1. Update/refresh the key
2. Or wait up to 1 hour for cache to expire
3. Or restart the Django server

## File Structure

```
accounts/
├── admin_api_config.py         # Django admin interface
├── api_config_utils.py         # Utility functions (get_active_api_key, etc.)
├── models_api_config.py        # APIConfiguration database model
├── serializers_api_config.py   # API serializers and validation
├── urls.py                     # URL routing (includes api-configuration endpoints)
├── views_api_config.py         # REST API views and viewset
└── migrations/
    └── 0003_apiconfiguration.py  # Database migration

bizionary-frontend/src/
├── pages/settings/
│   └── APIKeyManagement.jsx    # React component for key management
├── routes/
│   └── AppRoutes.jsx           # Added /settings/api-keys route
└── components/layout/
    └── Sidebar.jsx             # Added "API Keys" navigation link
```

## Security Best Practices

1. ✅ **Never commit API keys** to git
2. ✅ **Always use HTTPS** in production
3. ✅ **Regenerate keys** periodically
4. ✅ **Monitor usage** on OpenAI dashboard
5. ✅ **Restrict access** to admin users only
6. ✅ **Use environment variables** for development
7. ✅ **Rotate keys** if compromised

## Next Steps

### Immediate (Required)
1. ✅ Add your OpenAI API key through the UI
2. ✅ Test the connection to verify it works
3. ✅ Start using the chatbot and analytics features

### Optional Enhancements
- [ ] Add usage tracking and billing alerts
- [ ] Support for multiple providers (Claude, Cohere)
- [ ] Rate limiting per API key
- [ ] Encryption for stored keys
- [ ] Audit logging for key access
- [ ] API key rotation scheduling

## Getting Help

1. **Documentation**: See [API_KEY_MANAGEMENT_README.md](./API_KEY_MANAGEMENT_README.md)
2. **Admin Panel**: Visit `/admin/` for direct database access
3. **OpenAI Docs**: https://platform.openai.com/docs/
4. **OpenAI Keys**: https://platform.openai.com/api-keys

---

**System Status**: ✅ Ready to use
**Database**: ✅ Migration applied
**API Endpoints**: ✅ All 5 endpoints active
**Frontend**: ✅ UI component ready
**Admin Interface**: ✅ Django admin registered
