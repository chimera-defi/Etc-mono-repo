'use client';

import { useState } from 'react';
import { Clock, CheckCircle2, Loader2 } from 'lucide-react';
import { Card, Badge, Button } from './ui';
import { formatAztec, formatTimeRemaining } from '@/lib/format';
import type { WithdrawalRequest } from '@/mocks/data';

interface WithdrawalQueueProps {
  requests: WithdrawalRequest[];
  onClaim: (requestId: number) => Promise<void>;
  currentTime: number;
}

export function WithdrawalQueue({ requests, onClaim, currentTime }: WithdrawalQueueProps) {
  const [claimingId, setClaimingId] = useState<number | null>(null);

  if (requests.length === 0) {
    return (
      <Card title="Pending Withdrawals">
        <div className="text-center py-8">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-aztec-dark flex items-center justify-center">
            <Clock className="w-6 h-6 text-gray-500" />
          </div>
          <p className="text-gray-400">No pending withdrawals</p>
          <p className="text-sm text-gray-500 mt-1">
            Request a withdrawal to see it here
          </p>
        </div>
      </Card>
    );
  }

  const handleClaim = async (requestId: number) => {
    setClaimingId(requestId);
    try {
      await onClaim(requestId);
    } finally {
      setClaimingId(null);
    }
  };

  return (
    <Card title="Pending Withdrawals">
      <div className="space-y-3">
        {requests.map((request) => {
          const isClaimable = currentTime >= request.claimableAt;
          const timeRemaining = request.claimableAt - currentTime;
          const isClaiming = claimingId === request.id;

          return (
            <div
              key={request.id}
              className="flex items-center justify-between p-4 bg-aztec-dark rounded-xl border border-aztec-border"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-white">
                    {formatAztec(request.amount)} AZTEC
                  </span>
                  {isClaimable ? (
                    <Badge variant="success">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Ready
                    </Badge>
                  ) : (
                    <Badge variant="pending">
                      <Clock className="w-3 h-3 mr-1" />
                      Unbonding
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-400">
                  {isClaimable
                    ? 'Available to claim now'
                    : `${formatTimeRemaining(timeRemaining)} remaining`}
                </p>
              </div>

              {isClaimable && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleClaim(request.id)}
                  loading={isClaiming}
                  disabled={isClaiming}
                >
                  Claim
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
