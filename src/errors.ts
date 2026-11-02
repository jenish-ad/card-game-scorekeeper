export const errorMessages = {
  ENTER_VALID_MATCH_SETTINGS: 'Enter valid match settings.',
  ENTER_FEES_AS_WHOLE_NUMBERS_OF_0_OR_MORE:
    'Enter fees as whole numbers of 0 or more.',
  ENTER_A_VALID_FOUL_MODE_AND_WHOLE_NUMBER_PENALTY_OF_0_OR_MORE:
    'Enter a valid foul mode and whole-number penalty of 0 or more.',
  ENTER_A_POSITIVE_RS_RATE_WITH_UP_TO_TWO_DECIMAL_PLACES:
    'Enter a positive Rs rate with up to two decimal places.',
  UPDATE_THE_APP_TO_OPEN_THIS_MATCH: 'Update the app to open this match.',
  CHOOSE_2_TO_5_PLAYERS: 'Choose 2 to 5 players.',
  CHOOSE_ONE_WINNER_FROM_THE_ROUND_S_DISTINCT_PLAYERS:
    'Choose one winner from the round’s distinct players.',
  ENTER_MAAL_AS_A_WHOLE_NUMBER_OF_0_OR_MORE:
    'Enter maal as a whole number of 0 or more.',
  THE_WINNER_MUST_BE_SEEN: 'The winner must be Seen.',
  MAAL_TOTALS_ARE_TOO_LARGE_TO_CALCULATE_SAFELY:
    'Maal totals are too large to calculate safely.',
  CHOOSE_AN_OFFENDER_FROM_THE_ROUND_S_DISTINCT_PARTICIPANTS:
    'Choose an offender from the round’s distinct participants.',
  SAVED_FOUL_PENALTY_OR_MODE_IS_INVALID:
    'Saved foul penalty or mode is invalid.',
  FOUL_PENALTY_IS_TOO_LARGE_TO_CALCULATE_SAFELY:
    'Foul penalty is too large to calculate safely.',
  SAVED_ROUND_INPUTS_ARE_INVALID: 'Saved round inputs are invalid.',
  SAVED_PLAYER_ROUND_INPUTS_ARE_INVALID:
    'Saved player round inputs are invalid.',
  SAVED_ROUND_KIND_IS_INVALID: 'Saved round kind is invalid.',
  SAVED_MATCH_RECORD_IS_INVALID: 'Saved match record is invalid.',
  SAVED_MATCH_OR_PLAYER_ID_IS_INVALID: 'Saved match or player ID is invalid.',
  SAVED_MATCH_DATE_IS_INVALID: 'Saved match date is invalid.',
  ENTER_A_MATCH_TITLE_OF_1_TO_80_CHARACTERS:
    'Enter a match title of 1 to 80 characters.',
  SAVED_PLAYER_NAMES_OR_SEATING_ORDER_ARE_INVALID:
    'Saved player names or seating order are invalid.',
  EVERY_PLAYER_IN_THE_ROUND_MUST_BELONG_TO_THIS_MATCH:
    'Every player in the round must belong to this match.',
  KEEP_THE_ORIGINAL_PARTICIPANTS_WHEN_EDITING_A_ROUND:
    'Keep the original participants when editing a round.',
  NEW_ROUNDS_MAY_ONLY_INCLUDE_ACTIVE_PLAYERS:
    'New rounds may only include active players.',
  THIS_PLAYER_DOES_NOT_BELONG_TO_THE_MATCH:
    'This player does not belong to the match.',
  THIS_MATCH_NO_LONGER_EXISTS: 'This match no longer exists.',
  REOPEN_THE_MATCH_BEFORE_CHANGING_ITS_ROUNDS:
    'Reopen the match before changing its rounds.',
  THIS_ROUND_NO_LONGER_EXISTS_RELOAD_THE_MATCH:
    'This round no longer exists. Reload the match.',
  MATCH_TOTALS_ARE_TOO_LARGE_TO_CALCULATE_SAFELY:
    'Match totals are too large to calculate safely.',
  THE_RS_AMOUNT_IS_TOO_LARGE_USE_A_LOWER_RATE:
    'The Rs amount is too large; use a lower rate.',
  BALANCES_MUST_TOTAL_0: 'Balances must total 0.',
  INVALID_DATE: 'Invalid Gregorian date.',
  DATE_OUT_OF_RANGE: 'Date outside supported BS range.',
  THIS_DATABASE_NEEDS_A_NEWER_APP_VERSION_NO_SAVED_MATCHES_WERE_CHANGED:
    'This database needs a newer app version. No saved matches were changed.',
  PLAYER_NAME_REQUIRED:
    'Enter a name for every player, or remove the empty player.',
  PLAYER_NAME_TOO_LONG: 'Keep each player name to 40 characters or fewer.',
  PLAYER_NAME_DUPLICATE:
    'Use a different name for each player so scores can be distinguished.',
  ROSTER_FULL: '5 players are already at the table. Remove someone first.',
  ROSTER_MINIMUM: 'At least 2 players must stay in the match.',
  PLAYER_DEPARTED: '{name} left this match. Use Rejoin instead.',
} as const;
export type ErrorCode = keyof typeof errorMessages;
export type ErrorParams = Readonly<Record<string, string | number | undefined>>;
export class AppError extends Error {
  constructor(
    readonly code: ErrorCode,
    readonly params: ErrorParams = {},
  ) {
    super(
      errorMessages[code].replace(/\{(\w+)\}/g, (placeholder, key: string) =>
        params[key] === undefined ? placeholder : String(params[key]),
      ),
    );
    this.name = 'AppError';
  }
}
