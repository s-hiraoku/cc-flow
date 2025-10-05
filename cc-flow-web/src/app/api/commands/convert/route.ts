import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/commands/convert
 * Convert slash commands to agents
 */
export async function POST(request: NextRequest) {
  return NextResponse.json(
    {
      success: false,
      error: 'Converter feature is not yet implemented',
      details: 'The slash command converter requires additional setup. This feature will be available in a future release.'
    },
    { status: 501 }
  );
}
