import httpx
from typing import Optional, Dict, Any

class NirmanClient:
    def __init__(self, api_key: str, base_url: str = "https://api.nirman.dev/v1"):
        if not api_key or not api_key.startswith("nk_"):
            raise ValueError("Invalid API Key format. Expected 'nk_...'")
            
        self.api_key = api_key
        self.base_url = base_url.rstrip('/')
        self._session = httpx.Client(
            base_url=self.base_url,
            headers={
                "X-API-Key": self.api_key,
                "Content-Type": "application/json",
                "User-Agent": "Nirman-Python-SDK/0.1.0"
            }
        )
        
        # Sub-modules
        self.otp = _OTPModule(self._session)
        self.email = _EmailModule(self._session)
        
    def close(self):
        self._session.close()


class _OTPModule:
    def __init__(self, session: httpx.Client):
        self._session = session
        
    def send(self, phone: str, otp_length: int = 6) -> Dict[str, Any]:
        resp = self._session.post("/otp/send", json={"phone": phone, "otp_length": otp_length})
        resp.raise_for_status()
        return resp.json()

    def verify(self, phone: str, code: str) -> bool:
        resp = self._session.post("/otp/verify", json={"phone": phone, "code": code})
        resp.raise_for_status()
        data = resp.json()
        return data.get("verified", False)


class _EmailModule:
    def __init__(self, session: httpx.Client):
        self._session = session
        
    def send(self, to: str, subject: str, html: str, text: Optional[str] = None) -> Dict[str, Any]:
        payload = {"to": to, "subject": subject, "html": html}
        if text:
            payload["text"] = text
            
        resp = self._session.post("/email/send", json=payload)
        resp.raise_for_status()
        return resp.json()
