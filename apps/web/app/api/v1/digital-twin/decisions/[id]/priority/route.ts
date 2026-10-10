import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { cityDecisionService } from '@/lib/server/services/city-decision.service';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await authenticate(req);
    const { id } = await params;
    const priorityQueue = await cityDecisionService.getPriorityQueue(id);

    return NextResponse.json({
      success: true,
      data: {
        scenarioId: id,
        rankedCount: priorityQueue.length,
        priorityQueue,
        dataSource: 'SIMULATION',
        requiresHumanApproval: true,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Unauthorized' },
      { status: err.statusCode || 401 }
    );
  }
}
