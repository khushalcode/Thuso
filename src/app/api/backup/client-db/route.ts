import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import fs from 'fs'
import path from 'path'

// ─── Client DB backup (saves the browser-side sql.js DB to disk) ────────
//
// The app stores ALL data in a client-side SQLite DB (sql.js) in the
// browser's IndexedDB. Under storage pressure, the browser can evict
// this data — causing the "data resets after one day" bug.
//
// This endpoint saves the DB to a file on disk (next to custom.db)
// so it can be restored even if IndexedDB + localStorage are both
// cleared. Only works when running against the standalone server
// (Electron/Desktop mode). In PWA/APK mode, the POST silently 404s
// and the app falls back to localStorage backup only.

function getBackupPath(): string {
  // Save next to the server's custom.db so it's in the same directory.
  // When running standalone, DATABASE_URL points to the db file.
  const dbUrl = process.env.DATABASE_URL || ''
  // Extract the directory from DATABASE_URL="file:/path/to/custom.db"
  const match = dbUrl.match(/^file:(.+)[/\\]custom\.db$/)
  if (match) {
    return path.join(match[1], 'client-db-backup.b64')
  }
  // Fallback: try the db/ directory relative to cwd
  return path.join(process.cwd(), 'db', 'client-db-backup.b64')
}

// GET /api/backup/client-db — load the backup from disk
export async function GET() {
  try {
    const backupPath = getBackupPath()
    if (!fs.existsSync(backupPath)) {
      return NextResponse.json({ data: null })
    }
    const b64 = fs.readFileSync(backupPath, 'utf-8')
    return NextResponse.json({ data: b64 })
  } catch (e) {
    console.error('[backup/client-db] GET error:', e)
    return NextResponse.json({ data: null })
  }
}

// POST /api/backup/client-db — save the backup to disk
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body?.data) {
      return NextResponse.json({ error: 'No data provided' }, { status: 400 })
    }
    const backupPath = getBackupPath()
    // Ensure the directory exists
    const dir = path.dirname(backupPath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    // Save as base64 text file
    fs.writeFileSync(backupPath, body.data, 'utf-8')
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[backup/client-db] POST error:', e)
    return NextResponse.json({ error: 'Failed to save backup' }, { status: 500 })
  }
}
