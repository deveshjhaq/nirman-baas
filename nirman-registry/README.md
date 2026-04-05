# nirman-registry

> The public provider registry for the [Nirman BaaS](https://github.com/deveshjhaq/nirman-baas) platform.

`registry.json` lists every official and community provider available in the Nirman Dashboard marketplace.

## Structure

```json
{
  "version": "1.0.0",
  "providers": [
    {
      "name": "twilio",
      "displayName": "Twilio",
      "category": "otp",
      "credentialSchema": [...],
      "actions": [...]
    }
  ]
}
```

## How to Add a Provider

1. Fork this repo
2. Add your provider entry to `registry.json` following the `RegistryEntry` schema from `@nirman/provider-sdk`
3. Implement the provider in your own npm package extending `BaseProvider`
4. Open a Pull Request — official providers are reviewed by the Nirman team

## Categories

| Category | Description |
|---|---|
| `otp` | SMS one-time password delivery |
| `email` | Transactional and marketing email |
| `maps` | Geocoding, directions, places |
| `notifications` | Mobile & web push notifications |
| `payments` | Payment gateway integrations |
| `ai` | LLM text generation & embeddings |
| `storage` | Object/file storage |

## Provider Types

- **Official** (`"official": true`) — Built and maintained by the Nirman core team
- **Community** (`"official": false`) — Community-contributed, reviewed before listing
