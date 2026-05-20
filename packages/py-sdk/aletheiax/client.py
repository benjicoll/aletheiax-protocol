"""AletheiaX Python client.

    from aletheiax import AletheiaClient
    client = AletheiaClient(base_url="https://api.aletheiax.xyz")
    book = client.markets.orderbook("SOL-PERP")     # public
    client.login(wallet)                             # wallet-signature auth
    client.trading.place_order(market="SOL-PERP", side="buy", type="market", size="0.5")
"""

from __future__ import annotations

from typing import Any, List, Optional, Protocol

import httpx

from .errors import AletheiaApiError
from .models import Agent, Market, MyTier, Position, Tier


class Wallet(Protocol):
    """A signer the client uses for signature login."""
    public_key: str
    def sign_message(self, message: str) -> str: ...  # base58 signature


class _Http:
    def __init__(self, base_url: str, timeout: float):
        self._base = base_url.rstrip("/")
        self._client = httpx.Client(timeout=timeout)
        self._token: Optional[str] = None

    def set_token(self, token: Optional[str]) -> None:
        self._token = token

    def request(self, method: str, path: str, json: Any = None) -> Any:
        headers = {"Content-Type": "application/json"}
        if self._token:
            headers["Authorization"] = f"Bearer {self._token}"
        resp = self._client.request(method, f"{self._base}{path}", json=json, headers=headers)
        data = resp.json() if resp.content else None
        if resp.status_code >= 400:
            detail = data.get("detail") if isinstance(data, dict) else data
            raise AletheiaApiError(resp.status_code, detail)
        return data

    def get(self, path: str) -> Any:
        return self.request("GET", path)

    def post(self, path: str, json: Any = None) -> Any:
        return self.request("POST", path, json)

    def delete(self, path: str) -> Any:
        return self.request("DELETE", path)


class _Markets:
    def __init__(self, http: _Http):
        self._http = http

    def list(self, active_only: bool = True) -> List[Market]:
        return [Market.from_api(m) for m in self._http.get(f"/markets?active_only={str(active_only).lower()}")]

    def get(self, market: str) -> Market:
        return Market.from_api(self._http.get(f"/markets/{market}"))

    def orderbook(self, market: str, depth: int = 20) -> dict:
        return self._http.get(f"/markets/{market}/orderbook?depth={depth}")

    def ticker(self, market: str) -> dict:
        return self._http.get(f"/markets/{market}/ticker")

    def trades(self, market: str, limit: int = 50) -> list:
        return self._http.get(f"/markets/{market}/trades?limit={limit}")

    def candles(self, market: str, timeframe: str, limit: int = 300) -> dict:
        return self._http.get(f"/markets/{market}/candles?timeframe={timeframe}&limit={limit}")

    def funding(self, market: str) -> dict:
        return self._http.get(f"/markets/{market}/funding")


class _Trading:
    def __init__(self, http: _Http):
        self._http = http

    def place_order(self, *, market: str, side: str, type: str, size: str,
                    price: Optional[str] = None, leverage: int = 1,
                    reduce_only: bool = False) -> dict:
        return self._http.post("/trading/orders", {
            "market_id": market, "side": side, "order_type": type, "size": size,
            "price": price, "leverage": leverage, "reduce_only": reduce_only,
        })

    def cancel_order(self, order_id: str) -> dict:
        return self._http.delete(f"/trading/orders/{order_id}")

    def positions(self, market: Optional[str] = None) -> list:
        q = f"?market_id={market}" if market else ""
        return self._http.get(f"/trading/positions{q}")

    def close_position(self, position_id: str, size: Optional[str] = None) -> dict:
        return self._http.post(f"/trading/positions/{position_id}/close", {"size": size} if size else {})

    def balance(self) -> dict:
        return self._http.get("/users/me/balance")


class _Agents:
    def __init__(self, http: _Http):
        self._http = http

    def list(self, **filters: Any) -> List[Agent]:
        q = "&".join(f"{k}={v}" for k, v in filters.items() if v is not None)
        return [Agent.from_api(a) for a in self._http.get(f"/agents{'?' + q if q else ''}")]

    def get(self, agent_id: str) -> Agent:
        return Agent.from_api(self._http.get(f"/agents/{agent_id}"))

    def equity(self, agent_id: str, days: int = 30) -> dict:
        return self._http.get(f"/agents/{agent_id}/equity?days={days}")

    def decisions(self, agent_id: str, limit: int = 50) -> list:
        return self._http.get(f"/agents/{agent_id}/decisions?limit={limit}")

    def allocate(self, **config: Any) -> dict:
        return self._http.post("/agents/allocations", config)

    def my_allocations(self, status: Optional[str] = None) -> list:
        q = f"?status={status}" if status else ""
        return self._http.get(f"/agents/allocations/me{q}")

    def close_all_positions(self, allocation_id: str) -> dict:
        return self._http.post(f"/agents/allocations/{allocation_id}/close-positions")


class _Alethia:
    def __init__(self, http: _Http):
        self._http = http

    def tiers(self) -> List[Tier]:
        return [Tier.from_api(t) for t in self._http.get("/alethia/tiers")["tiers"]]

    def my_tier(self) -> MyTier:
        return MyTier.from_api(self._http.get("/alethia/me"))


class AletheiaClient:
    def __init__(self, base_url: str, *, token: Optional[str] = None, timeout: float = 15.0):
        self._http = _Http(base_url, timeout)
        if token:
            self._http.set_token(token)
        self.markets = _Markets(self._http)
        self.trading = _Trading(self._http)
        self.agents = _Agents(self._http)
        self.alethia = _Alethia(self._http)

    @property
    def is_authenticated(self) -> bool:
        return self._http._token is not None

    def login(self, wallet: Wallet) -> str:
        """Sign in with a wallet signature; returns the wallet address."""
        challenge = self._http.get("/auth/challenge")
        signature = wallet.sign_message(challenge["message"])
        res = self._http.post("/auth/verify", {
            "wallet_address": wallet.public_key,
            "signature": signature,
            "nonce": challenge["nonce"],
        })
        self._http.set_token(res["token"])
        return res["wallet_address"]

    def set_token(self, token: str) -> None:
        self._http.set_token(token)

    def run_agent(self, strategy: Any, *, paper: bool = True, max_ticks: Optional[int] = None) -> None:
        """Run a Strategy against live data (see aletheiax.agents)."""
        from .agents.runner import AgentRunner

        AgentRunner(self, strategy, paper=paper).run(max_ticks=max_ticks)
