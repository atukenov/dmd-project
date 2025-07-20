import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import PaymentModel from '@/lib/models/Payment';
import { connectToDatabase } from '@/lib/db';

// GET /api/payments/stats - Get payment statistics
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const businessId = session.user.id;
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d';
    
    // Calculate date range
    const now = new Date();
    let dateFrom: Date;
    
    switch (period) {
      case '7d':
        dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        dateFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        dateFrom = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        dateFrom = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        dateFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get payment stats
    const stats = await PaymentModel.aggregate([
      {
        $match: {
          businessId,
          createdAt: { $gte: dateFrom, $lte: now }
        }
      },
      {
        $group: {
          _id: '$currency',
          totalAmount: { $sum: '$amount' },
          totalCount: { $sum: 1 },
          completedAmount: {
            $sum: {
              $cond: [{ $eq: ['$status', 'completed'] }, '$amount', 0]
            }
          },
          completedCount: {
            $sum: {
              $cond: [{ $eq: ['$status', 'completed'] }, 1, 0]
            }
          },
          pendingAmount: {
            $sum: {
              $cond: [{ $in: ['$status', ['pending', 'processing']] }, '$amount', 0]
            }
          },
          pendingCount: {
            $sum: {
              $cond: [{ $in: ['$status', ['pending', 'processing']] }, 1, 0]
            }
          },
          refundedAmount: {
            $sum: {
              $cond: [{ $eq: ['$status', 'refunded'] }, '$amount', 0]
            }
          },
          refundedCount: {
            $sum: {
              $cond: [{ $eq: ['$status', 'refunded'] }, 1, 0]
            }
          }
        }
      }
    ]);

    // Get payment method breakdown
    const methodStats = await PaymentModel.aggregate([
      {
        $match: {
          businessId,
          createdAt: { $gte: dateFrom, $lte: now }
        }
      },
      {
        $group: {
          _id: '$paymentMethod',
          totalAmount: { $sum: '$amount' },
          totalCount: { $sum: 1 },
          completedAmount: {
            $sum: {
              $cond: [{ $eq: ['$status', 'completed'] }, '$amount', 0]
            }
          },
          completedCount: {
            $sum: {
              $cond: [{ $eq: ['$status', 'completed'] }, 1, 0]
            }
          }
        }
      }
    ]);

    // Get daily payment trends
    const dailyTrends = await PaymentModel.aggregate([
      {
        $match: {
          businessId,
          createdAt: { $gte: dateFrom, $lte: now },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          totalAmount: { $sum: '$amount' },
          totalCount: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Get recent payments
    const recentPayments = await PaymentModel
      .find({ businessId })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('amount currency status paymentMethod createdAt description')
      .lean();

    return NextResponse.json({
      stats: stats[0] || {
        _id: 'KZT',
        totalAmount: 0,
        totalCount: 0,
        completedAmount: 0,
        completedCount: 0,
        pendingAmount: 0,
        pendingCount: 0,
        refundedAmount: 0,
        refundedCount: 0
      },
      methodBreakdown: methodStats,
      dailyTrends,
      recentPayments,
      period
    });

  } catch (error) {
    console.error('Error fetching payment stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment statistics' },
      { status: 500 }
    );
  }
}
