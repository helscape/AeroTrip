import secrets

ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"  # no ambiguous I/O/0/1
REFERENCE_LENGTH = 6


def generate_reference() -> str:
    """Return a human-friendly booking reference such as AT-7K2M9Q."""
    chars = "".join(secrets.choice(ALPHABET) for _ in range(REFERENCE_LENGTH))
    return f"AT-{chars}"


__all__ = ["generate_reference"]
