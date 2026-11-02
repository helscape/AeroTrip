# Indeks diagram AeroTrip

Dirender lokal dari `future_plan.md` (PlantUML + Mermaid CLI via Docker).
Istilah teknis (Return, BEGIN/COMMIT, include/extend, HTTP, SQL, nama API/field) dibiarkan English agar tidak kaku; label alur dalam Bahasa Indonesia.
Semua dalam format PNG siap PPT: mentah di `raw/<tipe>/`, versi slide 16:9 (1920x1080) di `slides/<tipe>/`.

| # | Diagram | Tipe | Bagian sumber | Mentah PNG | Slide PNG |
| --- | --- | --- | --- | --- | --- |
| 01 | `target-architecture-plantuml` | architecture | 3.2 Target architecture | [PNG](raw/architecture/target-architecture-plantuml.png) | [PNG](slides/architecture/target-architecture-plantuml.png) |
| 02 | `target-architecture-mermaid` | architecture | 3.2 Target architecture | [PNG](raw/architecture/target-architecture-mermaid.png) | [PNG](slides/architecture/target-architecture-mermaid.png) |
| 03 | `entity-relationship-diagram-mermaid` | er | 3.6 Data model | [PNG](raw/er/entity-relationship-diagram-mermaid.png) | [PNG](slides/er/entity-relationship-diagram-mermaid.png) |
| 04 | `use-case-diagram-plantuml` | use-case | 5.3 PlantUML use case diagram | [PNG](raw/use-case/use-case-diagram-plantuml.png) | [PNG](slides/use-case/use-case-diagram-plantuml.png) |
| 05 | `use-case-diagram-mermaid` | use-case | 5.4 Mermaid use case flowchart | [PNG](raw/use-case/use-case-diagram-mermaid.png) | [PNG](slides/use-case/use-case-diagram-mermaid.png) |
| 06 | `sdlc-activity-diagram-plantuml` | sdlc | 6.1 PlantUML SDLC activity diagram | [PNG](raw/sdlc/sdlc-activity-diagram-plantuml.png) | [PNG](slides/sdlc/sdlc-activity-diagram-plantuml.png) |
| 07 | `sdlc-flowchart-mermaid` | sdlc | 6.2 Mermaid SDLC flowchart | [PNG](raw/sdlc/sdlc-flowchart-mermaid.png) | [PNG](slides/sdlc/sdlc-flowchart-mermaid.png) |
| 08 | `activity-overview-search-to-booking-plantuml` | activity | 7.1 Overview — search to booking | [PNG](raw/activity/activity-overview-search-to-booking-plantuml.png) | [PNG](slides/activity/activity-overview-search-to-booking-plantuml.png) |
| 09 | `activity-overview-search-to-booking-mermaid` | activity | 7.1 Overview — search to booking | [PNG](raw/activity/activity-overview-search-to-booking-mermaid.png) | [PNG](slides/activity/activity-overview-search-to-booking-mermaid.png) |
| 10 | `activity-uc01-search-flights-plantuml` | activity | 7.2 UC-01 — Search flights | [PNG](raw/activity/activity-uc01-search-flights-plantuml.png) | [PNG](slides/activity/activity-uc01-search-flights-plantuml.png) |
| 11 | `activity-uc01-search-flights-mermaid` | activity | 7.2 UC-01 — Search flights | [PNG](raw/activity/activity-uc01-search-flights-mermaid.png) | [PNG](slides/activity/activity-uc01-search-flights-mermaid.png) |
| 12 | `activity-uc02-view-flight-details-plantuml` | activity | 7.3 UC-02 — View flight details | [PNG](raw/activity/activity-uc02-view-flight-details-plantuml.png) | [PNG](slides/activity/activity-uc02-view-flight-details-plantuml.png) |
| 13 | `activity-uc02-view-flight-details-mermaid` | activity | 7.3 UC-02 — View flight details | [PNG](raw/activity/activity-uc02-view-flight-details-mermaid.png) | [PNG](slides/activity/activity-uc02-view-flight-details-mermaid.png) |
| 14 | `activity-uc03-enter-passenger-contact-details-plantuml` | activity | 7.4 UC-03 — Enter passenger and contact details | [PNG](raw/activity/activity-uc03-enter-passenger-contact-details-plantuml.png) | [PNG](slides/activity/activity-uc03-enter-passenger-contact-details-plantuml.png) |
| 15 | `activity-uc03-enter-passenger-contact-details-mermaid` | activity | 7.4 UC-03 — Enter passenger and contact details | [PNG](raw/activity/activity-uc03-enter-passenger-contact-details-mermaid.png) | [PNG](slides/activity/activity-uc03-enter-passenger-contact-details-mermaid.png) |
| 16 | `activity-uc04-create-booking-plantuml` | activity | 7.5 UC-04 — Create booking | [PNG](raw/activity/activity-uc04-create-booking-plantuml.png) | [PNG](slides/activity/activity-uc04-create-booking-plantuml.png) |
| 17 | `activity-uc04-create-booking-mermaid` | activity | 7.5 UC-04 — Create booking | [PNG](raw/activity/activity-uc04-create-booking-mermaid.png) | [PNG](slides/activity/activity-uc04-create-booking-mermaid.png) |
| 18 | `activity-uc05-view-confirmation-plantuml` | activity | 7.6 UC-05 — View confirmation | [PNG](raw/activity/activity-uc05-view-confirmation-plantuml.png) | [PNG](slides/activity/activity-uc05-view-confirmation-plantuml.png) |
| 19 | `activity-uc05-view-confirmation-mermaid` | activity | 7.6 UC-05 — View confirmation | [PNG](raw/activity/activity-uc05-view-confirmation-mermaid.png) | [PNG](slides/activity/activity-uc05-view-confirmation-mermaid.png) |
| 20 | `activity-uc06-look-up-booking-plantuml` | activity | 7.7 UC-06 — Look up booking | [PNG](raw/activity/activity-uc06-look-up-booking-plantuml.png) | [PNG](slides/activity/activity-uc06-look-up-booking-plantuml.png) |
| 21 | `activity-uc06-look-up-booking-mermaid` | activity | 7.7 UC-06 — Look up booking | [PNG](raw/activity/activity-uc06-look-up-booking-mermaid.png) | [PNG](slides/activity/activity-uc06-look-up-booking-mermaid.png) |
| 22 | `activity-uc07-update-booking-plantuml` | activity | 7.8 UC-07 — Update booking | [PNG](raw/activity/activity-uc07-update-booking-plantuml.png) | [PNG](slides/activity/activity-uc07-update-booking-plantuml.png) |
| 23 | `activity-uc07-update-booking-mermaid` | activity | 7.8 UC-07 — Update booking | [PNG](raw/activity/activity-uc07-update-booking-mermaid.png) | [PNG](slides/activity/activity-uc07-update-booking-mermaid.png) |
| 24 | `activity-uc08-cancel-booking-plantuml` | activity | 7.9 UC-08 — Cancel booking | [PNG](raw/activity/activity-uc08-cancel-booking-plantuml.png) | [PNG](slides/activity/activity-uc08-cancel-booking-plantuml.png) |
| 25 | `activity-uc08-cancel-booking-mermaid` | activity | 7.9 UC-08 — Cancel booking | [PNG](raw/activity/activity-uc08-cancel-booking-mermaid.png) | [PNG](slides/activity/activity-uc08-cancel-booking-mermaid.png) |
| 26 | `activity-uc09-manage-flight-inventory-crud-plantuml` | activity | 7.10 UC-09 — Manage flight inventory (CRUD) | [PNG](raw/activity/activity-uc09-manage-flight-inventory-crud-plantuml.png) | [PNG](slides/activity/activity-uc09-manage-flight-inventory-crud-plantuml.png) |
| 27 | `activity-uc09-manage-flight-inventory-crud-mermaid` | activity | 7.10 UC-09 — Manage flight inventory (CRUD) | [PNG](raw/activity/activity-uc09-manage-flight-inventory-crud-mermaid.png) | [PNG](slides/activity/activity-uc09-manage-flight-inventory-crud-mermaid.png) |
| 28 | `class-diagram-plantuml` | class | 8. Class diagram | [PNG](raw/class/class-diagram-plantuml.png) | [PNG](slides/class/class-diagram-plantuml.png) |
| 29 | `class-diagram-mermaid` | class | 8. Class diagram | [PNG](raw/class/class-diagram-mermaid.png) | [PNG](slides/class/class-diagram-mermaid.png) |
| 30 | `booking-sequence-plantuml` | sequence | 9.1 PlantUML sequence diagram | [PNG](raw/sequence/booking-sequence-plantuml.png) | [PNG](slides/sequence/booking-sequence-plantuml.png) |
| 31 | `booking-sequence-mermaid` | sequence | 9.2 Mermaid sequence diagram | [PNG](raw/sequence/booking-sequence-mermaid.png) | [PNG](slides/sequence/booking-sequence-mermaid.png) |
