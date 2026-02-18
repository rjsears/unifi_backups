# -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
# UniFi Backup Manager - Crypto Service Tests
# -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

import pytest

from app.services.crypto_service import CryptoService, crypto_service


class TestCryptoService:
    """Tests for encryption/decryption functionality."""

    def test_encrypt_returns_ciphertext(self):
        """Encrypt should return base64-encoded ciphertext."""
        plaintext = "my-secret-api-key"
        ciphertext = crypto_service.encrypt(plaintext)

        assert ciphertext is not None
        assert ciphertext != plaintext
        assert isinstance(ciphertext, str)

    def test_decrypt_returns_plaintext(self):
        """Decrypt should return original plaintext."""
        plaintext = "my-secret-api-key"
        ciphertext = crypto_service.encrypt(plaintext)
        decrypted = crypto_service.decrypt(ciphertext)

        assert decrypted == plaintext

    def test_encrypt_decrypt_roundtrip(self):
        """Encryption followed by decryption should preserve data."""
        test_strings = [
            "simple",
            "with spaces",
            "with-special-chars!@#$%",
            "unicode: \u00e9\u00e8\u00ea",
            "very" * 100,  # long string
            "",  # empty string
        ]

        for plaintext in test_strings:
            ciphertext = crypto_service.encrypt(plaintext)
            decrypted = crypto_service.decrypt(ciphertext)
            assert decrypted == plaintext, f"Failed for: {plaintext[:20]}..."

    def test_same_plaintext_different_ciphertext(self):
        """Same plaintext should produce different ciphertext (due to IV)."""
        plaintext = "my-secret-api-key"
        ciphertext1 = crypto_service.encrypt(plaintext)
        ciphertext2 = crypto_service.encrypt(plaintext)

        # Fernet uses unique IV each time
        assert ciphertext1 != ciphertext2

    def test_decrypt_invalid_ciphertext_raises_error(self):
        """Invalid ciphertext should raise ValueError."""
        with pytest.raises(ValueError, match="Invalid or corrupted"):
            crypto_service.decrypt("invalid-ciphertext")

    def test_decrypt_modified_ciphertext_raises_error(self):
        """Modified ciphertext should raise ValueError."""
        plaintext = "my-secret-api-key"
        ciphertext = crypto_service.encrypt(plaintext)

        # Modify the ciphertext
        modified = ciphertext[:-5] + "XXXXX"

        with pytest.raises(ValueError, match="Invalid or corrupted"):
            crypto_service.decrypt(modified)

    def test_generate_key_returns_valid_key(self):
        """Generate key should return a valid Fernet key."""
        key = CryptoService.generate_key()

        assert key is not None
        assert isinstance(key, str)
        assert len(key) == 44  # Base64-encoded 32-byte key

    def test_generate_key_unique_each_time(self):
        """Each generated key should be unique."""
        key1 = CryptoService.generate_key()
        key2 = CryptoService.generate_key()

        assert key1 != key2


class TestCryptoServiceAPIKeys:
    """Tests specifically for API key encryption scenarios."""

    def test_encrypt_api_key_format(self):
        """API key encryption should work with typical API key formats."""
        api_keys = [
            "abc123def456",
            "sk_live_1234567890abcdef",
            "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9",
            "AKIA" + "X" * 16,  # AWS-style key
        ]

        for api_key in api_keys:
            ciphertext = crypto_service.encrypt(api_key)
            decrypted = crypto_service.decrypt(ciphertext)
            assert decrypted == api_key

    def test_encrypt_preserves_special_characters(self):
        """Encryption should preserve all special characters."""
        special_key = "key!@#$%^&*()_+-=[]{}|;':\",./<>?"
        ciphertext = crypto_service.encrypt(special_key)
        decrypted = crypto_service.decrypt(ciphertext)

        assert decrypted == special_key
