# Suite Sadesk : checklist principale

Le cahier des charges fonctionnel de référence est [../les-modules.md](../les-modules.md). Les checklists ci-dessous détaillent son avancement ; plusieurs domaines du cahier des charges sont suivis dans un même fichier.

| # | Module fonctionnel | Famille | État | Détail |
|---|---|---|---|---|
| 0 | Socle commun | Transverse | En cours | [00-socle-commun.md](./00-socle-commun.md) |
| 1 | Ventes | Clients | Partiel | [02-commerce.md](./02-commerce.md) |
| 2 | Achats | Opérations | À faire (suivi des dépenses partiel) | [03-approvisionnement.md](./03-approvisionnement.md) |
| 3 | Comptabilité | Argent | Partiel | [01-finance.md](./01-finance.md) |
| 4 | Gestion & Finance, dont Trésorerie | Argent | Partiel | [01-finance.md](./01-finance.md) |
| 5 | Créances | Clients | À faire | [09-relations-clients.md](./09-relations-clients.md) |
| 6 | Stocks & équipements | Opérations | À faire | [04-stocks-expeditions.md](./04-stocks-expeditions.md), [07-atelier-equipements.md](./07-atelier-equipements.md) |
| 7 | Équipe & Salaires | Équipes | À faire | [08-equipes-paie.md](./08-equipes-paie.md) |
| 8 | Contrôle de qualité | Transverse | À faire | [06-controle-qualite.md](./06-controle-qualite.md) |
| 9 | Fabrication | Opérations | À faire | [05-fabrication.md](./05-fabrication.md) |

## Règles de travail

- Un module à la fois, dans l'ordre du cahier des charges, sauf décision contraire.
- Chaque module envoie ses écritures au noyau comptable : le module ne comptabilise jamais lui-même.
- Aucune étape n'est cochée sans tests (logique) et contrôle visuel (écran).
- Les noms visibles se modifient uniquement dans le registre `lib/suite/modules.ts`.
- Les versions de travail suivent [../workflow-versions.md](../workflow-versions.md).

## Prochaine étape

Le journal Comptabilité et les parcours Ventes sont reliés au cadre commun. Les espaces affichés « partiel » signalent explicitement les fonctions qui restent à construire ; les autres modules restent à venir.
