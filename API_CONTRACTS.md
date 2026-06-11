# API Contracts Specification v3.5
**Cricket Fever Real-Time Draft & War Room System**

This specification defines the complete RESTful endpoints and real-time WebSocket protocol contracts required to back the Cricket Gavel Draft Configurator, War Room, and Team Ledger.

---

## 1. Authentication & RBAC Context (Clearance Metadata)
All REST requests carry active security headers or cookie tokens to align client-side operations to specific Role-Based Access Control (RBAC) levels.

### Roles Matrix
*   `PLATFORM_ADMIN`: Authorized to configure base rules, approve tournament blueprints, and alter catalog configurations.
*   `AUCTION_ADMIN`: Authorized to moderate real-time lot bidding (advance timers, trigger auto-bids, commit SOLD/UNSOLD hammer states).
*   `TEAM_MANAGER`: Authorized to register franchise boards and submit transaction paddle or exact premium bids under purse constraints.
*   `SPECTATOR`: Read-only public access to view broadcast screens, look up registered players, and stream real-time updates.

---

## 2. REST API Endpoints

### 2.1 Tournament Configurations & Templates

#### Create Tournament Request (Blueprinting)
*   **Method:** `POST`
*   **Path:** `/api/tournaments`
*   **Authorization:** `PLATFORM_ADMIN` | `AUCTION_ADMIN`
*   **Payload Schema (`application/json`):**
```json
{
  "name": "Hyderabad Challenger Series Season 3",
  "teamsCount": 8,
  "baseBudget": 100000000,
  "config": {
    "economy_mode": "POINTS",
    "currency_label": "Pts",
    "total_purse_limit": 100000000,
    "enable_rtm": true,
    "max_rtm_cards": 2,
    "min_squad_size": 11,
    "max_squad_size": 18,
    "max_overseas_players": 4,
    "mandatory_roles": ["BATSMAN", "BOWLER", "ALL_ROUNDER", "WICKET_KEEPER"],
    "base_price_tiers": [
      { "tier_name": "Marquee Tier A", "base_amount": 2000000 },
      { "tier_name": "Gold Tier B", "base_amount": 1000000 },
      { "tier_name": "Silver Tier C", "base_amount": 500000 }
    ],
    "bid_increments": [
      { "from_amount": 0, "to_amount": 5000000, "increment_by": 200000 },
      { "from_amount": 5000000, "to_amount": 20000000, "increment_by": 500000 },
      { "from_amount": 20000000, "to_amount": 100000000, "increment_by": 1000000 }
    ]
  }
}
```
*   **Success Response (`201 Created`):**
```json
{
  "id": "t-req-1718105432000",
  "name": "Hyderabad Challenger Series Season 3",
  "status": "APPROVED",
  "createdAt": "2026-06-11T14:49:12.000Z",
  "config": {
    "economy_mode": "POINTS",
    "currency_label": "Pts",
    "total_purse_limit": 100000000,
    "enable_rtm": true,
    "max_rtm_cards": 2,
    "min_squad_size": 11,
    "max_squad_size": 18,
    "max_overseas_players": 4,
    "mandatory_roles": ["BATSMAN", "BOWLER", "ALL_ROUNDER", "WICKET_KEEPER"],
    "base_price_tiers": [
      { "tier_name": "Marquee Tier A", "base_amount": 2000000 },
      { "tier_name": "Gold Tier B", "base_amount": 1000000 }
    ],
    "bid_increments": [
      { "from_amount": 0, "to_amount": 5000000, "increment_by": 200000 }
    ]
  }
}
```

#### Fetch Active Tournaments
*   **Method:** `GET`
*   **Path:** `/api/tournaments`
*   **Access:** Direct public lookup
*   **Success Response (`200 OK`):**
```json
[
  {
    "id": "t-01",
    "name": "Cricket Fever Premier Auction",
    "status": "ACTIVE",
    "baseBudget": 800000000,
    "maxSquadSize": 25,
    "minSquadSize": 15,
    "maxOverseasPlayers": 8,
    "createdAt": "2026-06-11T07:33:02.000Z",
    "config": {
      "economy_mode": "CURRENCY",
      "currency_label": "₹",
      "total_purse_limit": 800000000,
      "enable_rtm": false,
      "max_rtm_cards": 0,
      "min_squad_size": 15,
      "max_squad_size": 25,
      "max_overseas_players": 8,
      "mandatory_roles": ["BATSMAN", "BOWLER"],
      "base_price_tiers": [],
      "bid_increments": []
    }
  }
]
```

---

### 2.2 Players Catalog

#### Fetch Upcoming/Registered Players
*   **Method:** `GET`
*   **Path:** `/api/players?status=UPCOMING&category=ALL`
*   **Access:** Public lookup
*   **Success Response (`200 OK`):**
```json
[
  {
    "id": "p-01",
    "name": "Virat Kohli",
    "category": "BATSMAN",
    "rating": 98,
    "basePrice": 20000000,
    "isOverseas": false,
    "imageUrl": "https://images.unsplash.com/photo-1540747737956-378724044432?w=150",
    "auctionStatus": "UPCOMING",
    "stats": {
      "matches": 242,
      "runs": 8012,
      "strikeRate": 139.8,
      "average": 38.5
    }
  }
]
```

---

### 2.3 Team Management & Finances

#### Fetch Franchise Board Standings
*   **Method:** `GET`
*   **Path:** `/api/teams`
*   **Success Response (`200 OK`):**
```json
[
  {
    "id": "team-01",
    "name": "Mumbai Renegades",
    "shortName": "MR",
    "logoUrl": "https://images.unsplash.com/photo-1540747737956-378724044432?w=80",
    "managerName": "Nita Ambani",
    "maxBudget": 100000000,
    "budgetSpent": 24000000,
    "squadSize": 2,
    "overseasCount": 0,
    "filledRoles": {
      "batsman": 1,
      "bowler": 1,
      "allRounder": 0,
      "wicketKeeper": 0
    }
  }
]
```

---

### 2.4 Bidding Ledger Transactions

#### Place Bid Attempt
*   **Method:** `POST`
*   **Path:** `/api/bids/place`
*   **Authorization Check:** `TEAM_MANAGER`
*   **Payload Schema (`application/json`):**
```json
{
  "teamId": "team-01",
  "amount": 24000000
}
```
*   **Validation Rules Performed by the Host Controller:**
    1. Verify active lot is on-the-hammer (`BIDDING` status).
    2. Confirm bid value meets minimum incremental criteria relative to the current highest bid sequence.
    3. Verify prospective financial exposure (`team.budgetSpent + request.amount`) does not exceed `team.maxBudget`.
    4. Guard squad composition guidelines (e.g., maximum foreign players cannot exceed tournament configurator specs).
*   **Success Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Bid logged into digital ledger successfully",
  "ledgerSnapshot": {
    "currentBid": 24000000,
    "highestBidderTeamId": "team-01",
    "timerSeconds": 15,
    "status": "FAIR_PLAY_OVERTIME"
  }
}
```
*   **Invalid Request Response (`400 Bad Request` or `422 Unprocessable`):**
```json
{
  "success": false,
  "message": "FAILED: Team budget limit exceeded. Team only has ₹12,000,000 remaining."
}
```

---

## 3. Real-Time WebSocket Channel Sync
To implement instant broadcast state synchronization, the application opens a persistent connection at:
`ws://[host]:[port]/api/ws/draft`

### 3.1 Server-to-Client Event Streams

#### Active Lot Broadcast Update (Hammer Up)
Triggered whenever a moderator starts bidding on a new player.
```json
{
  "event": "LOT_ACTIVATED",
  "payload": {
    "playerId": "p-01",
    "name": "Virat Kohli",
    "basePrice": 20000000,
    "category": "BATSMAN",
    "timerSeconds": 15,
    "status": "BIDDING"
  }
}
```

#### New Valid Bid Accepted
Fires immediately when a Franchise manager registers a successful bid.
```json
{
  "event": "BID_ACCEPTED",
  "payload": {
    "bidId": "bid-1718105556000",
    "teamId": "team-01",
    "teamName": "Mumbai Renegades",
    "amount": 24000000,
    "timestamp": "14:52:36",
    "paddleNumber": "PADDLE #42"
  }
}
```

#### Auction Hammer Down (Lock-In Sold)
Dispatched once the moderator resolves the player lot status as SOLD.
```json
{
  "event": "LOT_SOLD",
  "payload": {
    "playerId": "p-01",
    "playerName": "Virat Kohli",
    "soldToTeamId": "team-01",
    "soldToTeamName": "Mumbai Renegades",
    "soldPrice": 24000000,
    "remainingTeamPurse": 76000000
  }
}
```

#### Auction Lot Passed (Unsold)
Dispatched when there are no active bids on the player and the timer runs out.
```json
{
  "event": "LOT_UNSOLD",
  "payload": {
    "playerId": "p-02",
    "playerName": "Uncapped Local Talent"
  }
}
```

### 3.2 Client-to-Server Command Sends

#### Push User-Triggered Bid Event
Franchise Managers send this to alert other connected network boards of incoming real-time bids.
```json
{
  "event": "BID_SUBMITTED",
  "franchise": "Mumbai Renegades",
  "short": "MR",
  "bidValue": 24000000,
  "targetPlayer": "Virat Kohli",
  "timestamp": "14:52:36"
}
```
