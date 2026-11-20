# The Blacklist Intelligence Board

A fan-made watch companion covering 22 episodes each of Seasons 1 and 2. A new browser opens at **S02E01**. Use **Unlock next episode** after watching each subsequent episode. You can revisit unlocked episodes at any time. The graph, evidence timeline, character files, counts, and exports follow the selected episode. Episode navigation shows the titles you have already unlocked.

The neural network supports two layouts, relationship depth and category filters, alias search, pan, zoom, and character dossiers with case histories. The kill ledger keeps manual entries in browser storage alongside sourced cumulative statistics. Existing Season 1 ledger entries use the same storage key and episode indexes. Sequential index 23 corresponds to S02E01.

Plot references include the [Season 2 episode guide](https://www.tvmaze.com/seasons/230/the-blacklist-season-2/episodeguide) and [home-video case files](https://www.andrewfumento.com/uploads/1/0/4/5/10454773/blacklist_the_tv_series_s2_insert_classified_case_files.pdf). The ledger links to the All Outta Bubble Gum fan tallies for Seasons 1 and 2. Season 2 individual attribution omits shared kills while retaining them in episode totals. An em dash means the ledger has no individual attribution at the current checkpoint. Selected actor portraits use TVmaze, with initials available offline.

Start a local static server with `python -m http.server 8000` and open `http://localhost:8000`. The existing Vercel project deploys from GitHub's `main` branch.

Viewing progress is stored per browser. The site ships the episode data as JavaScript, so the spoiler lock applies to browsing the interface.
