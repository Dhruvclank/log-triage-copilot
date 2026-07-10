// logs.js
// A small set of made-up (but realistic-looking) infrastructure log snippets.
// Each one has an "expected" answer that WE decided is correct.
// This is our answer key — it's what lets us score the AI later.

export const logs = [
  {
    id: 1,
    text: "2026-07-08T02:14:11Z host=edge-gw-03 ERROR connection timed out after 30000ms while reaching upstream 10.4.2.11:443",
    expected: { severity: "high", category: "network" },
  },
  {
    id: 2,
    text: "2026-07-08T02:15:02Z host=api-worker-07 WARN disk usage at 92% on /var/log, rotation may fail soon",
    expected: { severity: "medium", category: "resource" },
  },
  {
    id: 3,
    text: "2026-07-08T02:16:44Z host=auth-svc-02 ERROR failed login attempt for user 'admin' from 185.23.11.9 (5th attempt in 60s)",
    expected: { severity: "high", category: "auth" },
  },
  {
    id: 4,
    text: "2026-07-08T02:17:09Z host=db-primary INFO scheduled backup completed successfully in 412s",
    expected: { severity: "low", category: "database" },
  },
  {
    id: 5,
    text: "2026-07-08T02:18:55Z host=cache-node-01 ERROR OOM killer invoked, redis-server process terminated",
    expected: { severity: "high", category: "resource" },
  },
  {
    id: 6,
    text: "2026-07-08T02:19:31Z host=deploy-runner WARN config value 'MAX_RETRIES' missing, falling back to default (3)",
    expected: { severity: "low", category: "config" },
  },
  {
    id: 7,
    text: "2026-07-08T02:20:18Z host=payments-svc ERROR could not acquire DB connection from pool, pool exhausted (50/50 in use)",
    expected: { severity: "high", category: "database" },
  },
  {
    id: 8,
    text: "2026-07-08T02:21:02Z host=web-lb-01 WARN upstream api-worker-03 responded with 502 twice in last 5m",
    expected: { severity: "medium", category: "network" },
  },
  {
    id: 9,
    text: "2026-07-08T02:22:47Z host=notify-svc INFO 1,204 emails queued for delivery",
    expected: { severity: "low", category: "service" },
  },
  {
    id: 10,
    text: "2026-07-08T02:23:19Z host=auth-svc-02 CRITICAL certificate for api.example.com expired 2 hours ago",
    expected: { severity: "high", category: "config" },
  },
  {
    id: 11,
    text: "2026-07-08T02:24:03Z host=worker-queue-04 WARN job 'send_receipt' retried 3 times, still failing (timeout)",
    expected: { severity: "medium", category: "service" },
  },
  {
    id: 12,
    text: "2026-07-08T02:25:40Z host=db-replica-02 ERROR replication lag exceeded 300s behind primary",
    expected: { severity: "high", category: "database" },
  },
  {
    id: 13,
    text: "2026-07-08T02:26:11Z host=edge-gw-01 INFO health check passed, latency 42ms",
    expected: { severity: "low", category: "network" },
  },
  {
    id: 14,
    text: "2026-07-08T02:27:58Z host=api-worker-02 WARN memory usage climbing steadily, 78% and rising over last 20 minutes",
    expected: { severity: "medium", category: "resource" },
  },
  {
    id: 15,
    text: "2026-07-08T02:28:36Z host=auth-svc-01 ERROR JWT signature validation failed for 14 requests in a row from same IP",
    expected: { severity: "high", category: "auth" },
  },
  {
    id: 16,
    text: "2026-07-08T02:29:14Z host=deploy-runner ERROR deployment rolled back automatically, health check failed post-deploy",
    expected: { severity: "high", category: "config" },
  },
  {
    id: 17,
    text: "2026-07-08T02:30:02Z host=cache-node-02 INFO cache hit ratio 94.2% over last hour",
    expected: { severity: "low", category: "resource" },
  },
  {
    id: 18,
    text: "2026-07-08T02:31:47Z host=web-lb-02 WARN SSL handshake failures increased 3x in last 10 minutes",
    expected: { severity: "medium", category: "network" },
  },
  {
    id: 19,
    text: "2026-07-08T02:32:29Z host=db-primary CRITICAL disk full on /var/lib/postgresql, writes failing",
    expected: { severity: "high", category: "database" },
  },
  {
    id: 20,
    text: "2026-07-08T02:33:15Z host=notify-svc ERROR third-party SMS provider returned 401 Unauthorized, API key may be revoked",
    expected: { severity: "high", category: "config" },
  },
  {
    id: 21,
    text: "2026-07-08T02:34:02Z host=worker-queue-01 INFO queue depth normal, 12 jobs pending",
    expected: { severity: "low", category: "service" },
  },
  {
    id: 22,
    text: "2026-07-08T02:35:41Z host=api-worker-05 ERROR unhandled exception in /checkout endpoint, 500 returned to 8 users",
    expected: { severity: "high", category: "service" },
  },
  {
    id: 23,
    text: "2026-07-08T02:36:20Z host=edge-gw-02 WARN request rate from single IP exceeded threshold (400 req/min)",
    expected: { severity: "medium", category: "network" },
  },
  {
    id: 24,
    text: "2026-07-08T02:37:09Z host=auth-svc-03 INFO password reset email sent successfully",
    expected: { severity: "low", category: "auth" },
  },
];
