# Calendar data and verification

The pure converter embeds 101 rows (BS 2000–2100) of published month-length facts from [amitgaru/nepali-datetime](https://github.com/amitgaru/nepali-datetime/blob/master/nepali_datetime/data/calendar_bs.csv). Anchor: BS 2000-01-01 = AD 1943-04-14. There is no calendar runtime dependency. The source package identifies itself as MIT licensed. The data are calendar facts, not an algorithmic approximation.

Checked on 2026-11-02. The table below records the test vectors and their independent sources. Hamro Patro is a published Nepali calendar, **not a government calendar**. Government corroboration is listed separately; it must not be confused with full official-calendar certification.

| Baisakh 1 BS | AD         | Published calendar                                           | Government corroboration                                                                                                                                                          |
| ------------ | ---------- | ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2075         | 2018-04-14 | [Hamro Patro](https://www.hamropatro.com/en/calendar/2075/1) | [National Economic Census 2018, footnote 24](https://giwmscdntwo.gov.np/media/app/public/36/posts/1693997540_29.pdf) explicitly identifies New Year's Day                         |
| 2076         | 2019-04-14 | [Hamro Patro](https://www.hamropatro.com/en/calendar/2076/1) | [NTA Baisakh report cover](https://nta.gov.np/uploads/contents/MIS-2076-Baisakh.pdf)                                                                                              |
| 2077         | 2020-04-13 | [Hamro Patro](https://www.hamropatro.com/en/calendar/2077/1) | [NTA Baisakh report cover](https://nta.gov.np/uploads/contents/MIS-2077-Baisakh.pdf)                                                                                              |
| 2078         | 2021-04-14 | [Hamro Patro](https://www.hamropatro.com/en/calendar/2078/1) | [NTA Baisakh report cover](https://nta.gov.np/uploads/contents/MIS-2078-Baisakh.pdf)                                                                                              |
| 2079         | 2022-04-14 | [Hamro Patro](https://www.hamropatro.com/en/calendar/2079/1) | [NTA Baisakh report cover](https://nta.gov.np/uploads/contents/MIS%20Baisakh%202079.pdf)                                                                                          |
| 2080         | 2023-04-14 | [Hamro Patro](https://www.hamropatro.com/en/calendar/2080/1) | [Radio Nepal, public broadcaster](https://radionepalonline.com/en/2023/04/14/351577.html) explicitly identifies Baisakh 1; this is a dated announcement, not an official calendar |
| 2081         | 2024-04-13 | [Hamro Patro](https://www.hamropatro.com/en/calendar/2081/1) | [NTA Baisakh report cover](https://nta.gov.np/uploads/contents/MIS%20Report_2081%20Baisakh.pdf)                                                                                   |
| 2082         | 2025-04-14 | [Hamro Patro](https://www.hamropatro.com/en/calendar/2082/1) | Not independently verified against an official calendar                                                                                                                           |
| 2083         | 2026-04-14 | [Hamro Patro](https://www.hamropatro.com/en/calendar/2083/1) | [Nepal Embassy Cairo holiday calendar](https://eg.nepalembassy.gov.np/pages/holidays/)                                                                                            |
| 2084         | 2027-04-14 | [Hamro Patro](https://www.hamropatro.com/en/calendar/2084/1) | Future; not independently verified against an official calendar                                                                                                                   |
| 2085         | 2028-04-13 | [Hamro Patro](https://www.hamropatro.com/en/calendar/2085/1) | Future; not independently verified against an official calendar                                                                                                                   |

Other vectors checked against the same published calendar pages:

- BS 2080-01-16 = AD 2023-04-29 (mid-month).
- BS 2080-01-31 = AD 2023-05-14 (month-end).
- BS 2083-07-16 = AD 2026-11-02 ([Kartik page](https://www.hamropatro.com/en/calendar/2083/7)).

The full requested official-calendar cross-check for every year 2075–2085 is **not complete**. Future dates and month lengths can be revised by Nepal Panchanga Nirnayak Bikas Samiti. We keep the published data and explicitly record the verification gap rather than fabricate official vectors. A conflicting secondary search result for 2085 claimed April 14; the embedded source and Hamro Patro both give April 13, which is the tested value. Reconfirm it when the official 2085 calendar is issued.

Conversion accepts Gregorian civil year/month/day, uses UTC arithmetic to avoid daylight-saving drift, and rejects dates outside the embedded range. UI formatting uses the device's local civil date, matching existing match timestamps. Unsupported BS dates fall back to a readable AD date. Storage timestamps and user-entered titles are preserved.
