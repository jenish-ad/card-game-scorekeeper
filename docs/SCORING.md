# Scoring

The rules are unchanged by the project restructure. They live in `src/features/marriage/domain/scoring.ts`. The app accepts entered maal totals; it does not inspect cards or determine meld eligibility. Every saved round must balance to zero.

## Normal finish

Let `N` be the round's participant count and `M` the sum of Seen players' maal, including the winner. Unseen players count as zero maal. For each opponent:

```text
counted maal = Seen ? entered maal : 0
fee = Seen ? seenFee : unseenFee
opponent points = N × counted maal − M − fee
winner points = −sum(all opponents' points)
```

The defaults are Seen fee **3** and Unseen fee **10**. There must be two to five distinct participants and one winner belonging to the round. The winner must be Seen. Maal must be a non-negative safe whole number. A Seen player can win the round and still lose net points if another player has sufficiently large maal.

### Worked example

Sita wins with 5 Seen maal. Ram has 2 Seen maal. Hari is Unseen, so his entered maal does not count. `N = 3`, `M = 7`.

| Player | Calculation      | Points |
| ------ | ---------------- | ------ |
| Ram    | `3 × 2 − 7 − 3`  | −4     |
| Hari   | `3 × 0 − 7 − 10` | −17    |
| Sita   | `−(−4 − 17)`     | +21    |
| Total  |                  | 0      |

## Dublee finish

Dublee uses the same Seen-only maal calculation. Add `dubleeExtra` to every opponent's finish fee. The default extra is **5**:

```text
opponent points = N × counted maal − M − normal fee − dubleeExtra
```

For the same example, Ram scores −9, Hari −22, and Sita +31. The total remains zero. Match-specific fees are captured at creation and apply to that match; zero fees are allowed.

## Foul rounds

A foul uses its saved participant list, offender, non-negative whole-number penalty and mode. It does not use normal maal or finish fees. The saved penalty/mode snapshot is retained when editing the foul round.

### Per-player penalty

Each other participant receives the penalty, and the offender pays the sum. With four players and a penalty of 10, offender Ram scores **−30** and each of the other three scores **+10**.

### Fixed-total penalty

The offender pays the fixed total. Split it evenly among the other participants using integer points. Any remainder gives one additional point to the earliest recipients in the round's stored participant order (captured in seating order when saved).

For four players and a fixed total of 10, offender Ram scores **−10**. The first other participant receives **+4** and the next two receive **+3** each. No fractional points are created. A zero penalty gives everyone zero.

## Match totals and money

Totals sum each saved participant's points across rounds. Departed players keep their historical rounds and points; new rounds include only active players. Editing or deleting a round recalculates totals from canonical inputs. Invalid rule versions and unsafe integer arithmetic are rejected.

Money is optional. A match can store a positive Rs-per-point rate with up to two decimal places. Convert the rate to whole paisa first:

```text
paisa = total points × round(Rs per point × 100)
```

For example, +100 points at Rs 2.50 per point equals **Rs 250**. Settlement greedily matches the largest remaining debtor to the largest remaining creditor, with player ID breaking ties. This preserves balances and reduces transfers; it is not a claim of globally minimum transfer count.

For totals Sita +21, Ram −4 and Hari −17 at Rs 1.25 per point, Hari pays Sita **Rs 21.25**, and Ram pays Sita **Rs 5.00**. All money calculations use safe whole paisa.

See [development notes](../README.md#development) and [translation review](TRANSLATIONS.md).
