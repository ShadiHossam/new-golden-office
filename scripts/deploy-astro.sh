#!/usr/bin/env bash
# Astro deploy script — parallel to the existing static-site redeploy sequence
# in the deployment-o2switch memory. Builds the Astro site on the server and
# rsyncs its dist/ output to a doc root.
#
# Usage:
#   scripts/deploy-astro.sh <doc-root-path>
#
# Staging example:
#   ssh -i ~/.ssh/id_ed25519_o2switch zash7309@cuivre.o2switch.net \
#     'cd apps/new-golden-office && git pull origin master --no-rebase --no-edit && bash scripts/deploy-astro.sh /home/zash7309/public_html/astro-staging.newgoldenoffice.com/'
#
# Production cutover (Phase 6 only — never run this against the real doc root
# before the Phase 5 staging soak has passed):
#   ssh -i ~/.ssh/id_ed25519_o2switch zash7309@cuivre.o2switch.net \
#     'cd apps/new-golden-office && git pull origin master --no-rebase --no-edit && bash scripts/deploy-astro.sh /home/zash7309/newgoldenoffice.com/'
set -euo pipefail

DOC_ROOT="${1:?Usage: deploy-astro.sh <doc-root-path>}"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# On this o2switch/CloudLinux host, the `npm` on PATH via any nodevenv
# activate script is a wrapper (l.v.e-manager's npm_wrapper) that always
# redirects installs to whichever *app's* venv you sourced (see
# astro-migration-plan memory) — it silently "succeeds" while writing to the
# wrong node_modules entirely if run from an unrelated directory like this
# one. Bypass it by putting the real Node install's bin dir on PATH instead.
if [ -d /opt/alt/alt-nodejs22/root/usr/bin ]; then
  export PATH="/opt/alt/alt-nodejs22/root/usr/bin:$PATH"
fi

cd "$REPO_ROOT/astro"
npm install
npm run build

# --delete because Astro's dist/ fully owns the doc root going forward —
# unlike the additive static-site rsync, leaving old files around here would
# silently serve stale duplicate content next to the new directory routes.
# .htaccess is excluded from deletion: staging doc roots get a hand-placed,
# not-in-git noindex .htaccess (same pattern as the legacy static site's
# staging subdomain) that must survive repeated deploys.
rsync -a --delete --exclude='.htaccess' "$REPO_ROOT/astro/dist/" "$DOC_ROOT"

echo "Deployed astro/dist/ -> $DOC_ROOT"
