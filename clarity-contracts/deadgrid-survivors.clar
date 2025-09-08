;; DeadGrid Survivors NFT Contract
;; Each survivor is a unique NFT with attributes stored on-chain

;; Define the NFT
(define-non-fungible-token deadgrid-survivor uint)

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-token-owner (err u101))
(define-constant err-token-exists (err u102))
(define-constant err-token-not-found (err u103))
(define-constant err-listing-not-found (err u104))
(define-constant err-wrong-price (err u105))
(define-constant err-transfer-failed (err u106))

;; Data Variables
(define-data-var last-token-id uint u0)
(define-data-var mint-price uint u100000000) ;; 100 STX in microSTX
(define-data-var royalty-percent uint u5) ;; 5% royalty

;; Data Maps
(define-map token-attributes uint {
  name: (string-ascii 64),
  health: uint,
  stamina: uint,
  combat-skill: uint,
  survival-skill: uint,
  days-survived: uint,
  faction: (string-ascii 32),
  created-at: uint
})

(define-map token-listings uint {
  price: uint,
  seller: principal
})

;; Survivor generation counter for unique names
(define-data-var survivor-counter uint u0)

;; Read-only functions
(define-read-only (get-last-token-id)
  (ok (var-get last-token-id))
)

(define-read-only (get-token-uri (token-id uint))
  (ok (some (concat "https://deadgrid.io/api/survivor/" (uint-to-ascii token-id))))
)

(define-read-only (get-owner (token-id uint))
  (ok (nft-get-owner? deadgrid-survivor token-id))
)

(define-read-only (get-survivor-attributes (token-id uint))
  (map-get? token-attributes token-id)
)

(define-read-only (get-listing (token-id uint))
  (map-get? token-listings token-id)
)

(define-read-only (get-mint-price)
  (ok (var-get mint-price))
)

;; Private functions
(define-private (uint-to-ascii (value uint))
  (if (<= value u9)
    (unwrap-panic (element-at "0123456789" value))
    "0"
  )
)

;; Generate random-ish stats based on block height and sender
(define-private (generate-stats (seed uint))
  {
    health: (+ u50 (mod seed u51)), ;; 50-100
    stamina: (+ u30 (mod (/ seed u2) u71)), ;; 30-100
    combat-skill: (+ u10 (mod (/ seed u3) u91)), ;; 10-100
    survival-skill: (+ u10 (mod (/ seed u5) u91)) ;; 10-100
  }
)

;; Public functions

;; Mint a new survivor NFT
(define-public (mint-survivor (name (string-ascii 64)) (faction (string-ascii 32)))
  (let
    (
      (token-id (+ (var-get last-token-id) u1))
      (seed (+ burn-block-height token-id))
      (stats (generate-stats seed))
    )
    ;; Check payment
    (try! (stx-transfer? (var-get mint-price) tx-sender contract-owner))
    
    ;; Mint the NFT
    (try! (nft-mint? deadgrid-survivor token-id tx-sender))
    
    ;; Store attributes
    (map-set token-attributes token-id
      (merge stats {
        name: name,
        days-survived: u0,
        faction: faction,
        created-at: burn-block-height
      })
    )
    
    ;; Update counter
    (var-set last-token-id token-id)
    (var-set survivor-counter (+ (var-get survivor-counter) u1))
    
    (ok token-id)
  )
)

;; Transfer survivor to another player
(define-public (transfer (token-id uint) (sender principal) (recipient principal))
  (begin
    ;; Check if token is listed and remove listing if it exists
    (map-delete token-listings token-id)
    
    ;; Transfer the NFT
    (try! (nft-transfer? deadgrid-survivor token-id sender recipient))
    (ok true)
  )
)

;; List survivor for sale
(define-public (list-survivor (token-id uint) (price uint))
  (let
    (
      (owner (unwrap! (nft-get-owner? deadgrid-survivor token-id) err-token-not-found))
    )
    ;; Verify sender owns the token
    (asserts! (is-eq tx-sender owner) err-not-token-owner)
    
    ;; Create listing
    (map-set token-listings token-id {
      price: price,
      seller: tx-sender
    })
    (ok true)
  )
)

;; Buy a listed survivor
(define-public (buy-survivor (token-id uint))
  (let
    (
      (listing (unwrap! (map-get? token-listings token-id) err-listing-not-found))
      (price (get price listing))
      (seller (get seller listing))
      (royalty (/ (* price (var-get royalty-percent)) u100))
    )
    ;; Pay seller (minus royalty)
    (try! (stx-transfer? (- price royalty) tx-sender seller))
    
    ;; Pay royalty to contract owner
    (try! (stx-transfer? royalty tx-sender contract-owner))
    
    ;; Transfer NFT
    (try! (nft-transfer? deadgrid-survivor token-id seller tx-sender))
    
    ;; Remove listing
    (map-delete token-listings token-id)
    (ok true)
  )
)

;; Unlist survivor from marketplace
(define-public (unlist-survivor (token-id uint))
  (let
    (
      (listing (unwrap! (map-get? token-listings token-id) err-listing-not-found))
      (owner (unwrap! (nft-get-owner? deadgrid-survivor token-id) err-token-not-found))
    )
    ;; Verify sender owns the token
    (asserts! (is-eq tx-sender owner) err-not-token-owner)
    
    ;; Remove listing
    (map-delete token-listings token-id)
    (ok true)
  )
)

;; Update survivor stats (after surviving days, battles, etc.)
(define-public (update-survivor-stats (token-id uint) (days-survived uint))
  (let
    (
      (owner (unwrap! (nft-get-owner? deadgrid-survivor token-id) err-token-not-found))
      (current-attrs (unwrap! (map-get? token-attributes token-id) err-token-not-found))
    )
    ;; Only owner can update stats
    (asserts! (is-eq tx-sender owner) err-not-token-owner)
    
    ;; Update days survived
    (map-set token-attributes token-id 
      (merge current-attrs {
        days-survived: (+ (get days-survived current-attrs) days-survived)
      })
    )
    (ok true)
  )
)

;; Burn a survivor (permadeath)
(define-public (burn-survivor (token-id uint))
  (let
    (
      (owner (unwrap! (nft-get-owner? deadgrid-survivor token-id) err-token-not-found))
    )
    ;; Only owner can burn
    (asserts! (is-eq tx-sender owner) err-not-token-owner)
    
    ;; Remove from listings if listed
    (map-delete token-listings token-id)
    
    ;; Remove attributes
    (map-delete token-attributes token-id)
    
    ;; Burn the NFT
    (try! (nft-burn? deadgrid-survivor token-id owner))
    (ok true)
  )
)

;; Admin functions
(define-public (set-mint-price (new-price uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (var-set mint-price new-price)
    (ok true)
  )
)

(define-public (set-royalty-percent (new-percent uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (asserts! (<= new-percent u100) (err u107)) ;; Max 100%
    (var-set royalty-percent new-percent)
    (ok true)
  )
)