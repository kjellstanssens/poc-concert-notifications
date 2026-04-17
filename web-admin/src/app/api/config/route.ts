
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Determine path based on monorepo structure
    // Since we are in web-admin, and configs is inside server/
    const configPath = path.resolve(process.cwd(), '..', 'server', 'configs', 'scraper_config.yaml');
    
    if (!fs.existsSync(configPath)) {
        return NextResponse.json({ error: `Config file not found at ${configPath}` }, { status: 404 });
    }

    const content = fs.readFileSync(configPath, 'utf8');
    return NextResponse.json({ content });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { content } = await request.json();
    const configPath = path.resolve(process.cwd(), '..', 'server', 'configs', 'scraper_config.yaml');

    // Basic backup
    const backupPath = `${configPath}.bak`;
    if (fs.existsSync(configPath)) {
        fs.copyFileSync(configPath, backupPath);
    }

    fs.writeFileSync(configPath, content, 'utf8');
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
