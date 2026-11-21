"""Money is stored as integer cents in MariaDB and exposed as whole units."""


def cents_to_units(cents: int) -> float:
    return round(cents / 100, 2)


def units_to_cents(units: float | int) -> int:
    return int(round(float(units) * 100))
