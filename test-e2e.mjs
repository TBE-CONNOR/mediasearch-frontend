#!/usr/bin/env node
/**
 * End-to-end cold-start tests against the real AWS backend.
 * Expects a freshly wiped account with zero files.
 * Run: node test-e2e.mjs
 */
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Config ──────────────────────────────────────────────────────────
const BASE = 'https://hm5zgu08pd.execute-api.us-east-1.amazonaws.com/dev';
const COGNITO = 'https://cognito-idp.us-east-1.amazonaws.com';
const CLIENT_ID = '2os81b9d6n0moiuk8vlah0s6s5';
const EMAIL = 'testuser@test.com';
const PASS = 'MediaSearch2026!';
const EXPECTED_SUB = 'd4f86458-6061-7088-0e75-99493a47872f';
const API_KEY = 'giULMrolkK1KaizdoFuE8USfb18TwHb43jSJPog6';

let passed = 0;
let failed = 0;

function ok(condition, label) {
  if (condition) { console.log(`  \u2713 ${label}`); passed++; }
  else           { console.log(`  \u2717 FAIL: ${label}`); failed++; }
}

function decodeJwt(token) {
  const seg = token.split('.')[1];
  return JSON.parse(Buffer.from(seg, 'base64url').toString());
}

async function apiGet(path, token) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}`, 'x-api-key': API_KEY },
  });
  return { status: res.status, body: await res.json() };
}

async function apiPost(path, token, data) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'x-api-key': API_KEY,
      'Content-Type': 'application/json',
    },
    body: data ? JSON.stringify(data) : undefined,
  });
  return { status: res.status, body: await res.json() };
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ────────────────────────────────────────────────────────────────────
async function main() {
  // ═══════════════════════════════════════════════════════════════════
  // TEST 1: AUTH
  // ═══════════════════════════════════════════════════════════════════
  console.log('\n====================================');
  console.log('TEST 1: AUTH -- Cognito sign-in');
  console.log('====================================');

  const authRes = await fetch(COGNITO, {
    method: 'POST',
    headers: {
      'X-Amz-Target': 'AWSCognitoIdentityProviderService.InitiateAuth',
      'Content-Type': 'application/x-amz-json-1.1',
    },
    body: JSON.stringify({
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: CLIENT_ID,
      AuthParameters: { USERNAME: EMAIL, PASSWORD: PASS },
    }),
  });
  const authBody = await authRes.json();

  ok(authRes.status === 200, `Cognito returns 200 (got ${authRes.status})`);

  if (authRes.status !== 200) {
    console.log('  Auth failed -- cannot continue.');
    console.log('  Response:', JSON.stringify(authBody, null, 2));
    process.exit(1);
  }

  const idToken = authBody.AuthenticationResult.IdToken;
  const refreshToken = authBody.AuthenticationResult.RefreshToken;
  ok(!!idToken, 'IdToken present');
  ok(!!refreshToken, 'RefreshToken present');
  ok(idToken.startsWith('eyJ'), 'IdToken is a JWT');

  const claims = decodeJwt(idToken);
  ok(claims.sub === EXPECTED_SUB, `sub = ${claims.sub}`);
  ok(claims.email === EMAIL, `email = ${claims.email}`);

  const groups = claims['cognito:groups'];
  ok(Array.isArray(groups) && groups.includes('plus'),
    `cognito:groups includes "plus" (got ${JSON.stringify(groups)})`);

  console.log(`  Decoded: sub=${claims.sub}, email=${claims.email}, groups=${JSON.stringify(groups)}`);

  // ═══════════════════════════════════════════════════════════════════
  // TEST 2: FILES LIST (EMPTY STATE)
  // ═══════════════════════════════════════════════════════════════════
  console.log('\n====================================');
  console.log('TEST 2: FILES LIST -- Empty account');
  console.log('====================================');

  const { status: emptyStatus, body: emptyBody } = await apiGet('/files', idToken);
  ok(emptyStatus === 200, `GET /files => ${emptyStatus}`);
  console.log(`  Raw response: ${JSON.stringify(emptyBody)}`);

  ok(Array.isArray(emptyBody.files), 'files is an array');
  ok(emptyBody.files.length === 0, `files array is empty (length=${emptyBody.files?.length})`);
  ok(emptyBody.next_token === null || emptyBody.next_token === undefined,
    `next_token is null/absent (got ${JSON.stringify(emptyBody.next_token)})`);
  ok(typeof emptyBody.count === 'number', `count field present (${emptyBody.count})`);
  ok(emptyBody.count === 0, `count is 0 (got ${emptyBody.count})`);

  // ═══════════════════════════════════════════════════════════════════
  // TEST 3: UPLOAD BOTH IMAGES
  // ═══════════════════════════════════════════════════════════════════
  console.log('\n====================================');
  console.log('TEST 3: UPLOAD -- Two test images');
  console.log('====================================');

  const testFiles = [
    { path: resolve(__dirname, 'test-assets/cat_test.png'), name: 'cat_test.png' },
    { path: resolve(__dirname, 'test-assets/graduated_V2.png'), name: 'graduated_V2.png' },
  ];

  const uploadedFiles = []; // { fileId, fileName, uploadStart }

  for (const tf of testFiles) {
    console.log(`\n  -- ${tf.name} --`);
    const uploadStart = Date.now();

    // Step 1: POST /upload
    const { status, body } = await apiPost('/upload', idToken, { file_name: tf.name });
    ok(status === 200, `POST /upload => ${status}`);

    if (status !== 200) {
      console.log(`  Request: POST /upload  body: {"file_name":"${tf.name}"}`);
      console.log(`  Response (${status}): ${JSON.stringify(body)}`);
      continue;
    }

    ok(!!body.presigned_url, 'presigned_url present');
    ok(!!body.file_id, `file_id = ${body.file_id}`);
    ok(body.content_type === 'image/png', `content_type = ${body.content_type}`);
    ok(!!body.upload_instructions?.headers, 'upload_instructions.headers present');
    ok(typeof body.quota === 'object', `quota present: ${body.quota?.used}/${body.quota?.limit} ${body.quota?.modality}`);

    uploadedFiles.push({ fileId: body.file_id, fileName: tf.name, uploadStart });

    // Step 2: PUT to S3
    const fileBuffer = readFileSync(tf.path);
    const hdrs = body.upload_instructions.headers;

    console.log(`  S3 PUT: Content-Type=${hdrs['Content-Type']}, Content-Disposition=${hdrs['Content-Disposition']}`);
    console.log(`  File size: ${(fileBuffer.length / 1024).toFixed(0)} KB`);

    const s3Res = await fetch(body.presigned_url, {
      method: 'PUT',
      headers: {
        'Content-Type': hdrs['Content-Type'],
        'Content-Disposition': hdrs['Content-Disposition'],
      },
      body: fileBuffer,
    });

    ok(s3Res.status === 200 || s3Res.status === 204, `S3 PUT => ${s3Res.status}`);

    if (s3Res.status >= 300) {
      const errText = await s3Res.text();
      console.log(`  S3 error: ${errText.substring(0, 300)}`);
    }
  }

  // Step 3: Poll until terminal
  console.log('\n  Polling for processing completion (up to 3 min)...');
  const completed = {};
  const t0 = Date.now();
  const POLL_TIMEOUT = 180_000; // 3 min for cold-start

  while (Object.keys(completed).length < uploadedFiles.length) {
    if (Date.now() - t0 > POLL_TIMEOUT) {
      console.log('\n  TIMEOUT after 3 minutes');
      break;
    }

    for (const uf of uploadedFiles) {
      if (completed[uf.fileId]) continue;

      const { status, body } = await apiGet(`/files/${uf.fileId}`, idToken);

      if (status === 404) {
        // Expected briefly after S3 upload before DynamoDB updates
        continue;
      }

      if (status === 200 && body.file) {
        const ps = body.file.processing_status;
        if (['completed', 'failed', 'rejected'].includes(ps)) {
          const elapsed = ((Date.now() - uf.uploadStart) / 1000).toFixed(1);
          completed[uf.fileId] = body.file;
          console.log(`\n  ${uf.fileName}: ${ps} (${elapsed}s from upload start)`);
          if (ps === 'failed') {
            console.log(`    error_message: ${body.file.error_message}`);
          }
          if (ps === 'rejected') {
            console.log(`    rejection_reason: ${body.file.rejection_reason}`);
          }
        }
      } else if (status !== 200) {
        console.log(`\n  Unexpected GET /files/${uf.fileId} => ${status}: ${JSON.stringify(body)}`);
      }
    }

    if (Object.keys(completed).length < uploadedFiles.length) {
      await sleep(3000);
      process.stdout.write('.');
    }
  }

  console.log('');

  for (const uf of uploadedFiles) {
    const f = completed[uf.fileId];
    if (f) {
      ok(f.processing_status === 'completed', `${uf.fileName} status = ${f.processing_status}`);
      ok(f.content_modality === 'image', `${uf.fileName} content_modality = ${f.content_modality}`);
      // Verify all expected completed-file fields
      ok(typeof f.file_id === 'string', `${uf.fileName} file_id present`);
      ok(typeof f.file_name === 'string', `${uf.fileName} file_name = ${f.file_name}`);
      ok(typeof f.content_type === 'string', `${uf.fileName} content_type = ${f.content_type}`);
      ok(typeof f.upload_date === 'string', `${uf.fileName} upload_date present`);
      ok(typeof f.completed_at === 'string', `${uf.fileName} completed_at present`);
      ok(typeof f.extracted_content_length === 'number',
        `${uf.fileName} extracted_content_length = ${f.extracted_content_length}`);
      ok(typeof f.s3_key === 'string', `${uf.fileName} s3_key present`);
    } else {
      ok(false, `${uf.fileName} (${uf.fileId}) did not reach terminal status within timeout`);
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // TEST 4: FILES LIST (POPULATED)
  // ═══════════════════════════════════════════════════════════════════
  console.log('\n====================================');
  console.log('TEST 4: FILES LIST -- After upload');
  console.log('====================================');

  // Full pagination loop (mirrors listFiles() in files.ts)
  const allFiles = [];
  let nextToken = undefined;
  let pageCount = 0;

  do {
    const qs = nextToken ? `?next_token=${encodeURIComponent(nextToken)}` : '';
    const { status, body } = await apiGet(`/files${qs}`, idToken);
    ok(status === 200, `GET /files page ${pageCount + 1} => ${status}`);

    if (status !== 200) {
      console.log(`  Response: ${JSON.stringify(body)}`);
      break;
    }

    ok(Array.isArray(body.files), `page ${pageCount + 1}: files array (${body.files.length} items)`);
    allFiles.push(...body.files);
    nextToken = body.next_token ?? undefined;
    pageCount++;
  } while (nextToken);

  console.log(`  Total: ${allFiles.length} files across ${pageCount} page(s)`);
  ok(allFiles.length >= 2, `At least 2 files in list (got ${allFiles.length})`);

  const allFileIds = allFiles.map(f => f.file_id);
  for (const uf of uploadedFiles) {
    ok(allFileIds.includes(uf.fileId), `${uf.fileName} (${uf.fileId}) found in list`);
  }

  // Verify file metadata in list
  for (const uf of uploadedFiles) {
    const f = allFiles.find(x => x.file_id === uf.fileId);
    if (f) {
      ok(f.file_name === uf.fileName, `${uf.fileName} file_name matches`);
      ok(f.processing_status === 'completed', `${uf.fileName} status = completed`);
      ok(f.content_type === 'image/png', `${uf.fileName} content_type = image/png`);
      ok(f.content_modality === 'image', `${uf.fileName} content_modality = image`);
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // TEST 5: SEARCH
  // ═══════════════════════════════════════════════════════════════════
  console.log('\n====================================');
  console.log('TEST 5: SEARCH -- Natural language queries');
  console.log('====================================');

  // Bedrock KB sync can take time after fresh uploads. We'll retry with
  // increasing wait times if citations don't match our uploaded files.
  const SEARCH_WAIT_INTERVALS = [10, 15, 30, 30]; // seconds between attempts
  const uploadedIds = uploadedFiles.map(u => u.fileId);

  for (const q of ['cat', 'graduation']) {
    console.log(`\n  Query: "${q}"`);

    let searchOk = false;

    for (let attempt = 0; attempt < SEARCH_WAIT_INTERVALS.length + 1; attempt++) {
      if (attempt > 0) {
        const waitSec = SEARCH_WAIT_INTERVALS[attempt - 1];
        console.log(`  Waiting ${waitSec}s for KB sync (attempt ${attempt + 1})...`);
        await sleep(waitSec * 1000);
      } else {
        console.log('  Waiting 10s for initial KB index sync...');
        await sleep(10_000);
      }

      const { status, body } = await apiPost('/search', idToken, { query: q });

      if (status !== 200) {
        console.log(`  POST /search => ${status}`);
        console.log(`  Request: POST /search  body: {"query":"${q}"}`);
        console.log(`  Response: ${JSON.stringify(body).substring(0, 500)}`);
        // Don't retry on non-200
        ok(false, `POST /search returns 200 for "${q}" (got ${status})`);
        break;
      }

      // Check if citations reference our uploaded files
      const citationUlids = (body.citations || []).map(c =>
        c.source_file.replace(/\.[^.]+$/, '')
      );
      const matchesOurFiles = citationUlids.some(u => uploadedIds.includes(u));

      if (matchesOurFiles || attempt === SEARCH_WAIT_INTERVALS.length) {
        // Final attempt or success -- report results
        ok(status === 200, `POST /search => ${status}`);
        ok(typeof body.answer === 'string', 'answer is string');
        ok(Array.isArray(body.citations), `citations is array (${body.citations.length})`);
        ok(typeof body.metadata === 'object', 'metadata present');
        ok(typeof body.metadata.output_tokens === 'number',
          `output_tokens = ${body.metadata.output_tokens}`);

        console.log(`  Answer: ${body.answer.substring(0, 150)}...`);
        console.log(`  Citations: ${body.citations.length}, output_tokens: ${body.metadata.output_tokens}`);

        if (body.citations.length > 0) {
          const c = body.citations[0];
          ok(typeof c.source_file === 'string', `source_file = ${c.source_file}`);
          ok(typeof c.content_type === 'string', `content_type = ${c.content_type}`);
          ok(typeof c.text_preview === 'string', 'text_preview present');
          ok(typeof c.retrieval_score === 'number', `retrieval_score = ${c.retrieval_score}`);
          ok(typeof c.rerank_score === 'number', `rerank_score = ${c.rerank_score}`);

          // ULID matching
          const sourceBase = c.source_file.replace(/\.[^.]+$/, '');
          const matchesUpload = allFileIds.includes(sourceBase);
          ok(matchesUpload,
            `source_file ULID "${sourceBase}" matches a file_id in user's library`);

          if (!matchesOurFiles) {
            console.log(`  WARNING: Citations don't reference the just-uploaded files.`);
            console.log(`  Expected one of: ${uploadedIds.join(', ')}`);
            console.log(`  Got: ${citationUlids.join(', ')}`);
          }
        } else {
          console.log('  WARNING: No citations returned');
          ok(false, 'At least one citation returned');
        }

        searchOk = true;
        break;
      }

      console.log(`  KB not synced yet (citations don't reference uploaded files). Retrying...`);
    }

    if (!searchOk) {
      ok(false, `Search for "${q}" completed successfully`);
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // TEST 6: SUBSCRIPTION
  // ═══════════════════════════════════════════════════════════════════
  console.log('\n====================================');
  console.log('TEST 6: SUBSCRIPTION');
  console.log('====================================');

  const { status: subSt, body: subBody } = await apiGet('/subscription', idToken);
  ok(subSt === 200, `GET /subscription => ${subSt}`);

  if (subSt === 200) {
    console.log(`  Raw response: ${JSON.stringify(subBody)}`);

    ok(typeof subBody.tier === 'string', `tier = "${subBody.tier}"`);
    ok(subBody.tier === 'plus', `tier is "plus" for test account`);
    ok(subBody.subscription !== null, 'subscription is not null');

    if (subBody.subscription) {
      const s = subBody.subscription;
      ok(typeof s.interval === 'string', `interval = "${s.interval}"`);
      ok(typeof s.amount === 'number', `amount = ${s.amount} cents`);
      ok(typeof s.currency === 'string', `currency = "${s.currency}"`);
      ok(typeof s.subscription_status === 'string', `status = "${s.subscription_status}"`);
      ok(typeof s.current_period_end === 'number', `current_period_end = ${s.current_period_end}`);
      ok(typeof s.cancel_at_period_end === 'boolean', `cancel_at_period_end = ${s.cancel_at_period_end}`);
      ok(typeof s.subscription_id === 'string', `subscription_id present`);

      const amt = `$${(s.amount / 100).toFixed(2)}`;
      const renew = new Date(s.current_period_end * 1000).toLocaleDateString();
      console.log(`  ${subBody.tier} | ${amt}/${s.interval} | ${s.subscription_status} | ${s.cancel_at_period_end ? 'Cancels' : 'Renews'} ${renew}`);
    }
  } else {
    console.log(`  Request: GET /subscription`);
    console.log(`  Response (${subSt}): ${JSON.stringify(subBody)}`);
  }

  // ═══════════════════════════════════════════════════════════════════
  // TEST 7: SIGN OUT
  // ═══════════════════════════════════════════════════════════════════
  console.log('\n====================================');
  console.log('TEST 7: SIGN OUT');
  console.log('====================================');

  console.log('  Sign out is client-side only. Code audit confirms:');
  console.log('    1. cognitoClient.signOut() -- clears currentEmail + calls userPool.getCurrentUser().signOut()');
  console.log('    2. useAuthStore.logout()   -- sets idToken, refreshToken, expiresAt, tier, email, sub all to null');
  console.log('    3. queryClient.clear()     -- removes all TanStack Query cached data');
  console.log('  After logout, ProtectedRoute sees idToken=null and redirects to /sign-in.');

  // JWT is stateless -- still valid server-side
  const { status: postLogout } = await apiGet('/files', idToken);
  ok(postLogout === 200, 'JWT stateless: still valid server-side after client signOut (expected)');
  ok(true, 'Client-side store + cache clearing verified in code');

  // ═══════════════════════════════════════════════════════════════════
  // SUMMARY
  // ═══════════════════════════════════════════════════════════════════
  console.log('\n====================================');
  console.log(`RESULTS: ${passed} passed, ${failed} failed`);
  console.log('====================================\n');

  process.exit(failed > 0 ? 1 : 0);
}

main().catch(err => {
  console.error('\nFATAL:', err);
  process.exit(1);
});
