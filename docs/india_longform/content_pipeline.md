# Content pipeline — assets, licensing and tooling

**For the India long-form documentary line.** Researched 2026-09-21. Everything here is sourced;
where the law or the terms are genuinely unsettled, it says so rather than giving false confidence.

> **The one-line summary.** Stills, maps and data are free and legally clean if you source them
> correctly. **Motion is where you pay.** And the two "obvious" Indian government sources are the
> two traps.

---

## 1. What the reference channels actually use

### Johnny Harris — After Effects, not code

His own [editor/animator posting](https://www.johnnyharris.ch/editor-animator-application) asks for
3+ years of editing and motion graphics and names **GEOlayers in After Effects** as a major plus.
The signature map look is a plugin workflow, driven by hand per project. Independently confirmed by
a freelance map artist who worked for him:
[premiumbeat.com](https://www.premiumbeat.com/blog/making-maps-for-johnny-harris/) ·
[aescripts](https://aescripts.com/learn/post/making-maps-for-johnny-harris---volcanoes).

Team size is **not published**. Roles are remote and project-based.

**Not documented:** his music and archive vendors. A
[Storyblocks partner page](https://www.storyblocks.com/partner/johnnyharris) exists but is an
affiliate discount — sponsorship is not evidence of use. Do not infer it.

### Ashris Choudhury (India in Pixels) — code, and alone

[Portfolio](https://iashris.com/): Processing, openFrameworks, **p5.js, three.js, d3**, plus
Photoshop, InDesign, After Effects, Premiere Pro, Python and JS. He built his own map tool,
[iipmaps](https://iipmaps.com/).

A [Kontinentalist interview](https://kawan.kontinentalist.com/meet-the-community-ashris-choudhury-india-in-pixels-creator/)
gives the workflow: Python `requests` to fetch, PDF tables converted to JSON, reusable code blocks,
and a three-stage loop — *"the data collection, the data manipulation, and finally, making the data
into a visual format."* He works **as a single person**, using journalist contacts to fact-check.

### The read-across

Our Python → JSON → Remotion pipeline is architecturally **what Ashris built, one generation
newer** — and it is a fundamentally different thing from what Harris does. His maps do not scale
without hands on them; ours do. **The real gap versus Harris is archive and B-roll, not animation.**

---

## 2. Third-party video clips

### Three layers operate independently — this is the whole answer

| Layer | What it is | What it does |
|:--|:--|:--|
| **Copyright / fair dealing** | A legal defence | Raised *after* you are sued |
| **YouTube ToS** | A contract you agreed to | Enforced by account termination |
| **Content ID** | A private automated system | Confers **no rights at all** |

Clearing Content ID does not make a use lawful. Having a solid fair-dealing argument does not clear
Content ID. They do not talk to each other.

### (a) Downloading breaches the ToS, separately from copyright

[YouTube's Terms](https://www.youtube.com/static?template=terms), under Permissions and
Restrictions: you may not *"access, reproduce, download, distribute, transmit, broadcast, display,
sell, license, alter, modify or otherwise use any part of the Service or any Content"* except as
authorised; no *"automated means (such as robots, botnets or scrapers)"*. The licence other users
grant you is *"only as enabled by a feature of the Service (such as video playback or embeds)."*

**`yt-dlp` is therefore a contract breach even for a clip that is public domain, and even for one
you made yourself.** Fair dealing is no defence to a contract term.

### (b) India's fair dealing is an enumerated list, not a balancing test

**Section 52(1)(a)**, as amended in 2012 ([full text](https://indiankanoon.org/doc/1013176/)):
a fair dealing with *"any work, not being a computer programme"* for the purposes of —
(i) private or personal use, including research; (ii) criticism or review; (iii) the reporting of
current events and current affairs.

The 2012 amendment replaced *"literary, dramatic, musical or artistic work"* with **"any work"** —
the only reason film clips are arguable at all, since before 2012 cinematograph films were outside
the clause entirely.

**There is no US-style four-factor test and no residual category. Transformativeness alone gets you
nothing if your purpose is not on the list.**

Applied here:

- **(i) private use — out.** A monetised documentary is not private or personal.
- **(ii) criticism or review — the only workable route, and its shape matters.** Using a clip *to
  discuss or critique that clip or another work* is defensible. Using it as attractive B-roll
  wallpaper is **not**. That distinction is the one to make decisions from.
- **(iii) current events — a stretch** for a researched 20–40 minute documentary.
- **The "educational use" myth:** s.52(1)(i) covers instruction *in an educational institution*.
  A YouTube channel is not one.

Leading authority: **Super Cassettes v Hamar Television** (Delhi HC, 2010,
[judgment](https://indiankanoon.org/doc/543688/)) — the dealing must be for an *approved purpose*,
*"not a dealing which might be fair for some other purpose or fair in general"*, and both
quantitative and qualitative tests apply.

> **No Indian judgment squarely addresses YouTube documentary clip reuse. This is genuinely
> unsettled, and the enumerated structure means the downside is worse than a US creator's.**

### (c) Content ID mechanics

A claim is **not** a strike. The rights-holder chooses **block**, **monetise** (revenue goes to
them), or **track**.

[Dispute](https://support.google.com/youtube/answer/2797454) → claimant has **30 days** →
if rejected, [appeal](https://support.google.com/youtube/answer/12104471) → claimant has **7 days**
→ if the appeal is rejected they may file a takedown, which removes the video **and adds a copyright
strike**. Note the asymmetry: the claimant decides the first round.

### (d) Credit is not permission

YouTube's own dispute page lists **"giving credit to the copyright owner" as an *invalid* dispute
reason**, alongside "owning a copy" and "choosing not to monetize."

**Attribution is a *condition* of some licences. It is never a *grant* of one.** Citing a source you
had no right to use is an attributed infringement.

### Genuinely safe footage

| Source | Terms | Watch out for |
|:--|:--|:--|
| **NASA** ([media guidelines](https://www.nasa.gov/nasa-brand-center/images-and-media/)) | *"generally are not subject to copyright in the United States"* | **Insignia and logotype are NOT public domain**; no implied endorsement; identifiable persons raise publicity issues; third-party material is marked |
| NOAA, USGS, Landsat | Same US federal position | — |
| **ESA** | **Not NASA.** Much content is **CC BY-SA 3.0 IGO** — share-alike | Check per item |
| **ISRO / NRSC Bhuvan** | ⚠️ **NON-COMMERCIAL ONLY** — [terms](https://www.nrsc.gov.in/nrscnew/termsConditions.php) | **Cannot go in a monetised video.** See §5 |
| **Internet Archive** | **A host, not a licence.** Per-item rights vary | The most common expensive error. Prelinger's own uploads are largely PD |
| **NFDC Films Division** ([catalogue](https://filmsdivision.nfdcindia.com/film-catalogue.html)) | Paid, 8,000+ documentary titles | Slow, but clean |
| **Prasar Bharati Archives** ([link](https://prasarbharati.gov.in/prasar-bharati-archives/)) | Commercial licensing off a published rate card | **The legitimate route to Doordarshan-era India footage, and nobody else bothers** |
| Storyblocks, Artgrid, Pond5, Getty | Paid stock | — |

### Creative Commons precision

- **BY** — needs title, author, source, licence, plus a note of changes.
- **BY-SA** — ⚠️ **infects your finished video.** Avoid for footage.
- **NC** — unusable while monetised.
- **ND** — forbids editing.
- **CC0 / PD** — the only frictionless ones.

---

## 3. Stills, maps and data

**[Wikimedia Commons](https://commons.wikimedia.org/)** only accepts licences permitting commercial
use *and* derivatives, so NC/ND are out of scope by policy. Expect CC0, PD, CC BY and **CC BY-SA
(which infects)**. Attribution metadata is machine-readable — see §6.

**Public domain in India:** roughly 60 years from publication for cinematograph films and sound
recordings, life + 60 for authored works, with photographs moved into the authored-works rule by the
2012 amendment. **Colonial-era material is safe; anything post-1970 is not.** Check per item.

**[British Library](https://commons.wikimedia.org/wiki/Commons:British_Library)** — ~1 million
"Mechanical Curator" images from 17th–19th century books, released to Flickr Commons under the
**Public Domain Mark**. An unusually strong fit for colonial-era India.

**[data.gov.in](https://www.data.gov.in/) under [GODL-India](https://www.data.gov.in/Godl)** — a
worldwide, royalty-free, non-exclusive, perpetual licence *"for all lawful **commercial** and
non-commercial purposes"*, requiring a published attribution statement including DOI/URL/URI.

**[OpenStreetMap](https://osmfoundation.org/wiki/Licence/Attribution_Guidelines)** — ODbL. Credit
**"© OpenStreetMap contributors"**; where the map is a major component of a film the attribution
*"should typically appear in a corner of the map"*, in addition to end credits or description.
A rendered video is a **Produced Work**, so share-alike does **not** reach it; it would reach a
derived database you published.

**[Natural Earth](https://www.naturalearthdata.com/about/terms-of-use/)** — the cleanest basemap
available. *"All versions… are in the public domain," "No permission is needed," "Crediting the
authors is unnecessary,"* commercial use invited. **Default to it.**

---

## 4. Music

| Vendor | Cost | After cancellation |
|:--|:--|:--|
| **[Epidemic Sound](https://help.epidemicsound.com/hc/en-us/articles/26254650213266)** | $9.99/mo annual ($119.88/yr); Pro $16.99/mo | Published while subscribed stays **cleared forever** — *provided channels were safelisted* |
| **[Artlist](https://artlist.io/help-center/privacy-terms/artlist-license/)** | subscription | Projects published while active stay monetisable indefinitely; **Clearlist** registrations made while active remain cleared |
| **[Soundstripe](https://www.soundstripe.com/knowledge/cancellation/licenses-after-cancellation)** | $119/yr Personal, $239/yr Pro | Existing projects stay licensed |
| **Musicbed** | per-use / negotiated | Built for brands and films; overkill for a solo channel |

**The mechanic that matters:** whitelisting registers your channel ID so the vendor pre-clears **its
own** Content ID claims. It does **not** stop third-party claims on the same recording, and uploads
made *before* whitelisting can still be hit.

> ### ⚠️ Register the channel ID with the vendor BEFORE the first upload.

For a channel where a 30-minute video sits up for a decade, the published-while-subscribed clause is
the single most important term — and all four honour it, so the differentiator is **catalogue and
price, not risk**.

**Free:** the YouTube Audio Library (some tracks require attribution), plus CC0 via Free Music
Archive filters and ccMixter. Check per track.

**AI music — viable but a poor fit here.** Free tiers generally don't convey a commercial grant;
paid tiers do. Litigation is live: Warner settled with Suno and Universal with Udio in late 2025,
but **Sony's claims against Udio remain active**, with a hearing before Judge Casper set for July
2026. YouTube's [synthetic content disclosure policy](https://blog.youtube/news-and-events/disclosing-ai-generated-content/)
targets realistic depictions of people, events and places, so a music bed generally doesn't trigger
the label — but automatic detection rolled out in 2026. **Given that "₹0, everything computed,
nothing generated" is the channel's credibility claim, an AI score undercuts the pitch for a
$10/month saving.**

---

## 5. The two traps that invert the obvious assumption

> ### ⚠️ Trap 1 — ISRO/NRSC Bhuvan is non-commercial only
>
> [NRSC's terms](https://www.nrsc.gov.in/nrscnew/termsConditions.php): *"All data and web services
> remain exclusive property of NRSC, ISRO"*, downloadable content usable **for non-commercial
> purposes** with attribution. **It cannot appear in a monetised video** without written permission.
>
> More broadly: **Indian government works are not public domain by default** — they carry their own
> copyright term. A `.gov.in` URL implies nothing.

> ### ⚠️ Trap 2 — IMD's own portal bars commercial reproduction; data.gov.in does not
>
> [dsp.imdpune.gov.in](https://dsp.imdpune.gov.in/home_freedataaccess.php): *"Reproducing the
> material published in this website for **commercial purpose is not permitted**, unless and
> otherwise permission is obtained from the competent authority."*
>
> **The same rainfall series republished on data.gov.in carries GODL-India, which permits commercial
> use.** Same numbers, two different grants. **Source from data.gov.in, cite GODL, keep the URL.**
>
> Two clarifications: a terms-of-use bar is a *contract* question, not copyright; and rainfall
> values are facts — **Eastern Book Company v D.B. Modak** (SC, 2008) rejected sweat-of-the-brow for
> a "modicum of creativity" standard, so a bare numeric grid likely attracts thin or no copyright.
> The portal's terms still bind independently, **which is why the source you download from matters
> more than the data does.**

---

## 6. Tooling

### Wired up in this repo

`.mcp.json` registers **[open-museum-mcp](https://github.com/cfpramod/open-museum-mcp)**, pinned to
`0.21.0` (MIT, 369 commits, published 2026-09-10).

13 collections: The Met, Rijksmuseum, Smithsonian, Cleveland, Art Institute of Chicago, SMK,
Walters, **Wellcome**, **Wikimedia Commons**, **Europeana**, National Gallery of Art, Harvard, Getty.

| Tool | Parameters |
|:--|:--|
| `search_artworks` | `query`, `museum?`, `has_image?`, `limit?`, `year_min?`, `year_max?` |
| `get_artwork` | `id` |
| `cite` | `id`, `style?` (`full` / `caption` / `short`) |
| `discover_random` | `region?`, `period?`, `not_artist?`, `museum?` |
| `list_traditions` | — |

**Why this one earns the dependency:** results carry a `license` object with type (CC0 / PD /
OTHER), the raw museum value, the verification source and a confidence level — and it does
**strict deny on ambiguity**, rejecting records with unclear rights rather than returning them.
That is the same contract as `emit_ts.py`: refuse to emit rather than emit something unverified.

Optional keys (both free, server degrades gracefully without them): `EUROPEANA_API_KEY`
([get one](https://pro.europeana.eu/get-api)), `HARVARD_API_KEY`. No keys needed for the other 11.

**Pinned deliberately** — the project is v0.x and warns that MINOR bumps may be
backward-incompatible until v1.0.

**What it is for: the history and language videos, not the monsoon.** `H3` (Ain-i-Akbari
manuscripts), `H5` (Indus script), `H9` (Chola), `H10` (Ashokan edicts), `H1` (EIC trade), and
especially `L4` (the Brahmi script family tree — inscriptions and manuscripts). Wellcome has deep
colonial-era India holdings.

### Deliberately NOT wired up

| Candidate | Why not |
|:--|:--|
| [free-stock-images-mcp](https://github.com/xcollantes/free-stock-images-mcp) | **Does not return standardised licence metadata** — its docs say check terms per platform, which is backwards from what we need. 15 stars, 15 commits. Falls back to "web search links when APIs are unavailable", so results aren't always real API results |
| [mcp-openverse](https://github.com/pipeworx-io/mcp-openverse) | A **remote hosted gateway** (`gateway.pipeworx.io`), not a local package — queries route through a third party. 0 stars, 6 commits, and **licence filter options are undocumented**, which is the entire point |

### Use the REST APIs directly instead

~20 lines of Python each, and **we own the licence field**, which is what matters.

- **[Openverse](https://docs.openverse.org/api/reference/authentication_and_throttling.html)** —
  `https://api.openverse.org/v1/`. Anonymous requests allowed; register at
  `/v1/auth_tokens/register/` for higher limits. **`license_type=commercial,modification` enforces
  the entire licence policy in one query parameter.** Best single endpoint in this space.
- **[Wikimedia Commons](https://www.mediawiki.org/wiki/API:Imageinfo)** —
  `action=query&prop=imageinfo&iiprop=extmetadata` returns `LicenseShortName`, `Artist`, `Credit`
  and an **`AttributionRequired`** flag. Build the fetch-and-record-attribution script on this.
- **[Pexels](https://www.pexels.com/api/documentation/)** — free key, 200 req/hr and 20,000/mo,
  liftable free on request. Commercial use, no attribution required.
- **[Unsplash](https://unsplash.com/documentation)** — two real gotchas: production approval is
  gated on screenshots showing correct attribution (demo tier is 50 req/hr), and you **must** fire
  `photo.links.download_location` on selection and hotlink the returned `urls`. The hotlink rule
  sits awkwardly with pulling files into a project folder, so for editorial stills the ordinary site
  download is cleaner. An [official hosted MCP](https://mcp.unsplash.com/mcp) exists
  (`SearchPhotos`, `SearchIllustrations`, `SearchCollections`, `SearchUsers`) — the only first-party
  one in this space.
- **Internet Archive** — `advancedsearch` and `metadata` APIs, plus the `internetarchive` Python
  library. Remember: host, not licence.

---

## 7. The one practice to adopt

**Have the fetch script write a `sources.json` per project** — URL, licence, required attribution
string, date retrieved — **and generate the end-credit block from it.**

That is the same "compute it, don't author it" discipline the reel pipeline already runs on, applied
to the part that carries **legal** risk rather than factual risk. `open-museum-mcp`'s `cite` tool
does this for museum records; the Openverse and Commons scripts should do it for everything else.

Nobody does this, and it would make the channel effectively audit-proof.

---

## 8. Open questions

- **IMD 0.25° gridded rainfall commercial terms are not stated publicly.**
  Email `cmagpune@gmail.com` before anything depends on it — see
  [monsoon_research.md](monsoon_research.md) §5.
- Music vendor not yet chosen. Decision is catalogue and price; **register the channel ID before
  upload 1 regardless.**
