# Nirman Python SDK
A native Python client for `Nirman BaaS`.

```python
from nirman import NirmanClient

client = NirmanClient(api_key="nk_live_...")

# Send an OTP
response = client.otp.send(phone="+1234567890")
# Verify
is_valid = client.otp.verify(phone="+1234567890", code="123456")

# Send an Email
client.email.send(to="test@test.com", subject="Hi", html="<p>Test</p>")
```
