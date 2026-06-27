---
title: Authentication
draft: false
description: All API requests require authentication via Bearer token.
---

All API requests require authentication via Bearer token.

Include your API key in the Authorization header of every request:

```
Authorization: Bearer sk_live_...
```

:::caution[Keep your keys secure]
Never expose your secret API keys in client-side code. Use environment variables on your server.
:::

## API Key Types

| Key | Type | Description |
|-----|------|-------------|
| `sk_test_...` | Secret | Sandbox secret key — use for testing |
| `sk_live_...` | Secret | Live secret key — use for production |
| `pk_test_...` | Publishable | Sandbox publishable key — client-side safe |
| `pk_live_...` | Publishable | Live publishable key — client-side safe |
