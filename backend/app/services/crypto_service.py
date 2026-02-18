# -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
# UniFi Backup Manager - Cryptography Service
# -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

from cryptography.fernet import Fernet, InvalidToken

from app.config import get_settings


class CryptoService:
    """Service for encrypting/decrypting sensitive data."""

    def __init__(self):
        settings = get_settings()
        self._fernet = Fernet(settings.fernet_key.encode())

    def encrypt(self, plaintext: str) -> str:
        """Encrypt a string and return base64-encoded ciphertext."""
        return self._fernet.encrypt(plaintext.encode()).decode()

    def decrypt(self, ciphertext: str) -> str:
        """Decrypt base64-encoded ciphertext and return plaintext."""
        try:
            return self._fernet.decrypt(ciphertext.encode()).decode()
        except InvalidToken as e:
            raise ValueError("Invalid or corrupted encrypted data") from e

    @staticmethod
    def generate_key() -> str:
        """Generate a new Fernet key (for setup)."""
        return Fernet.generate_key().decode()


# Singleton instance
crypto_service = CryptoService()
